"""
Spike M0.1 – Schlagerkennung auf echter Gardetanz-Musik (Konzept, Abschnitt 10, Risiko 1).

Für jede Musikdatei:
  1. Schläge mit zwei unabhängigen Verfahren:
     - Essentia RhythmExtractor2013 (multifeature, mit eigener Konfidenz)
     - librosa Beat-Tracking mit zeitlich veränderlichem Tempo
  2. Übereinstimmung beider Verfahren (±70 ms). Wo beide übereinstimmen, ist die
     Erkennung verlässlich; Abweichungen markieren Stellen zum Nachhören.
  3. Tempo-Abschnitte (Tempowechsel) und unregelmäßige Stellen (Schnitte, Pausen).
  4. Wahrscheinliche „1“ (Taktanfang) per Heuristik: Bass-Akzent + Harmoniewechsel.
  5. Grafik (PNG), Kennzahlen (JSON) und eine Klick-Spur zum Gegenhören
     (hoher Klick = erkannte „1“, tiefer Klick = übrige Schläge).

Aufruf:  python analyse.py <ausgabeordner> <name>=<datei.mp3> [<name>=<datei.mp3> ...]
Die Musik selbst wird nie ins Repository übernommen.
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import scipy.ndimage as ndi
import soundfile as sf
import librosa
import essentia.standard as es
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

TOL = 0.07          # Toleranz für „gleicher Schlag“ (Sekunden)
SR_E = 44100        # Essentia
SR_L = 22050        # librosa
HOP = 512


# --------------------------------------------------------------------------- Schläge
def beats_essentia(path):
    audio = es.MonoLoader(filename=str(path), sampleRate=SR_E)()
    bpm, beats, conf, _, _ = es.RhythmExtractor2013(method="multifeature")(audio)
    return np.asarray(beats, dtype=float), float(bpm), float(conf), audio


def beats_librosa(y, sr):
    oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=HOP, aggregate=np.median)
    # lokales Tempo (für Tempowechsel), geglättet über ~6 s
    tempo_curve = librosa.feature.tempo(onset_envelope=oenv, sr=sr, hop_length=HOP,
                                        aggregate=None, start_bpm=120, std_bpm=4)
    frames_6s = int(6 * sr / HOP)
    tempo_s = ndi.median_filter(tempo_curve, size=max(3, frames_6s | 1))
    _, beats = librosa.beat.beat_track(onset_envelope=oenv, sr=sr, hop_length=HOP,
                                       bpm=tempo_s, units="time", trim=False)
    return np.asarray(beats, dtype=float)


# --------------------------------------------------------------------------- Vergleich
def match(ref, est, tol=TOL):
    """Greedy-Zuordnung; gibt Trefferliste (bool je ref-Schlag) und F-Maß zurück."""
    hit_ref = np.zeros(len(ref), bool)
    used = np.zeros(len(est), bool)
    j0 = 0
    for i, t in enumerate(ref):
        while j0 < len(est) and est[j0] < t - tol:
            j0 += 1
        j = j0
        while j < len(est) and est[j] <= t + tol:
            if not used[j]:
                used[j] = hit_ref[i] = True
                break
            j += 1
    tp = hit_ref.sum()
    p = tp / max(1, len(est))
    r = tp / max(1, len(ref))
    f = 2 * p * r / max(1e-9, p + r)
    return hit_ref, float(f)


def raster_agreement(ref, est, tol=TOL):
    """Je ref-Schlag: liegt er auf dem Raster des anderen Verfahrens – auch wenn dieses
    lokal halbes oder doppeltes Tempo zählt? Liefert (bestätigt[], ebene[]) mit
    ebene ∈ {"gleich", "halb", "doppelt", "unklar"} aus Sicht des anderen Verfahrens."""
    ibi_e = np.diff(est)
    ok = np.zeros(len(ref), bool)
    level = np.empty(len(ref), dtype=object)
    ibi_r = np.r_[np.diff(ref), np.diff(ref)[-1:]]
    for i, t in enumerate(ref):
        j = int(np.clip(np.searchsorted(est, t), 1, len(est) - 1))
        r = ibi_e[j - 1] / ibi_r[i]
        if 0.8 < r < 1.25:
            grid, level[i] = est[j - 1:j + 1], "gleich"
        elif 1.6 < r < 2.5:   # anderes Verfahren zählt halb so schnell → Mittelpunkte ergänzen
            grid, level[i] = np.r_[est[j - 1:j + 1], (est[j - 1] + est[j]) / 2], "halb"
        elif 0.4 < r < 0.625:  # anderes Verfahren zählt doppelt so schnell
            grid, level[i] = est[max(0, j - 2):j + 2], "doppelt"
        else:
            grid, level[i] = np.array([]), "unklar"
        ok[i] = grid.size > 0 and np.min(np.abs(grid - t)) <= tol
    return ok, level


# --------------------------------------------------------------------------- Tempo-Abschnitte
def local_bpm(beats, win=9):
    ibi = np.diff(beats)
    med = ndi.median_filter(ibi, size=win, mode="nearest")
    return beats[1:], 60.0 / med, ibi, med


def sections(beats, change=0.04, persist=4, min_beats=12):
    t, bpm, _, _ = local_bpm(beats)
    secs, start, ref = [], 0, bpm[0]
    i = 1
    while i < len(bpm):
        if abs(bpm[i] - ref) / ref > change and np.all(
                np.abs(bpm[i:i + persist] - ref) / ref > change):
            secs.append((start, i))
            start, ref = i, bpm[i]
        else:
            ref = np.median(bpm[start:i + 1])
        i += 1
    secs.append((start, len(bpm)))
    # zu kurze Abschnitte mit dem vorherigen zusammenlegen
    merged = []
    for s, e in secs:
        if merged and e - s < min_beats:
            merged[-1] = (merged[-1][0], e)
        else:
            merged.append((s, e))
    # kurzen Anfang mit dem Folgenden zusammenlegen
    if len(merged) > 1 and merged[0][1] - merged[0][0] < min_beats:
        merged[1] = (merged[0][0], merged[1][1]); merged.pop(0)
    # Nachbarn mit fast gleichem Tempo zusammenlegen
    joined = [merged[0]]
    for s, e in merged[1:]:
        ps, pe = joined[-1]
        if abs(np.median(bpm[s:e]) - np.median(bpm[ps:pe])) / np.median(bpm[ps:pe]) < 0.02:
            joined[-1] = (ps, e)
        else:
            joined.append((s, e))
    out = []
    for s, e in joined:
        seg = bpm[s:e]
        ibi = np.diff(beats)[s:e]
        jitter = float(np.median(np.abs(ibi - np.median(ibi))) * 1000)
        out.append({"start": round(float(t[s] - 60 / bpm[s]), 2), "ende": round(float(t[e - 1]), 2),
                    "bpm": round(float(np.median(seg)), 1), "schlaege": int(e - s + 1),
                    "_i": (int(s), int(e)), "schwankung_ms": round(jitter, 1)})
    return out


def irregular(beats, lo=0.75, hi=1.35):
    """Schlagabstände, die deutlich vom lokalen Takt abweichen (Schnitt, Pause, Aussetzer)."""
    t, _, ibi, med = local_bpm(beats)
    bad = np.where((ibi < lo * med) | (ibi > hi * med))[0]
    return [round(float(beats[i]), 2) for i in bad]


# --------------------------------------------------------------------------- „Die 1“
def downbeat_phase(y, sr, beats, bar=4):
    """Je Tempo-Abschnitt: Phase (0..bar-1), an der Bass-Akzent + Harmoniewechsel am stärksten sind."""
    S = np.abs(librosa.stft(y, n_fft=2048, hop_length=HOP))
    freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
    low = S[freqs < 180].sum(axis=0)
    low_flux = np.maximum(0, np.diff(np.log1p(low), prepend=np.log1p(low[0])))
    chroma = librosa.feature.chroma_stft(S=S ** 2, sr=sr)
    chroma_nov = np.r_[0, np.linalg.norm(np.diff(chroma, axis=1), axis=0)]
    fr = librosa.time_to_frames(beats, sr=sr, hop_length=HOP)
    fr = np.clip(fr, 0, len(low_flux) - 1)
    win = 3
    acc_low = np.array([low_flux[max(0, f - win):f + win].max() for f in fr])
    acc_chr = np.array([chroma_nov[max(0, f - win):f + win + 4].max() for f in fr])
    z = lambda a: (a - a.mean()) / (a.std() + 1e-9)  # noqa: E731
    accent = z(acc_low) + z(acc_chr)
    scores = np.array([accent[p::bar].mean() for p in range(bar)])
    p = int(scores.argmax())
    srt = np.sort(scores)
    margin = float(srt[-1] - srt[-2])  # Abstand zur zweitbesten Phase
    return p, margin, accent


# --------------------------------------------------------------------------- Ausgaben
def click(sr, freq, dur=0.035, gain=0.6):
    n = int(sr * dur)
    t = np.arange(n) / sr
    return gain * np.sin(2 * np.pi * freq * t) * np.exp(-t * 90)


def click_track(audio, sr, beats, phase, out_mp3, bar=4):
    mix = 0.5 * audio.astype(np.float32)
    hi, lo = click(sr, 1760, gain=0.8), click(sr, 880, gain=0.55)
    for i, b in enumerate(beats):
        c = hi if (i - phase) % bar == 0 else lo
        s = int(b * sr)
        e = min(len(mix), s + len(c))
        mix[s:e] += c[:e - s]
    mix = np.clip(mix, -1, 1)
    wav = out_mp3.with_suffix(".wav")
    sf.write(wav, mix, sr)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-b:a", "128k", str(out_mp3)], check=True)
    wav.unlink()


def plot(name, dur, be, bl, hits, secs, irr, out_png, level=None):
    fig, ax = plt.subplots(2, 1, figsize=(12, 4.6), sharex=True, gridspec_kw={"height_ratios": [3, 1]})
    for beats, col, lab in ((be, "#1846C7", "Essentia"), (bl, "#9C1487", "librosa")):
        t, bpm, _, _ = local_bpm(beats)
        ax[0].plot(t, bpm, color=col, lw=1.6, label=lab)
    for s in secs[1:]:
        ax[0].axvline(s["start"], color="#11151C", lw=0.8, ls="--")
    for s in secs:
        ax[0].text((s["start"] + s["ende"]) / 2, 0.97, f'{s["bpm"]:.0f}', transform=ax[0].get_xaxis_transform(),
                   ha="center", va="top", fontsize=9, color="#11151C")
    for x in irr:
        ax[0].axvline(x, color="#C77F00", lw=1.2, alpha=0.8)
    ax[0].set_ylabel("Schläge pro Minute")
    lo = min(np.percentile(60 / np.diff(be), 2), np.percentile(60 / np.diff(bl), 2)) * 0.9
    hi = max(np.percentile(60 / np.diff(be), 98), np.percentile(60 / np.diff(bl), 98)) * 1.1
    ax[0].set_ylim(lo, hi)
    ax[0].legend(loc="lower right", fontsize=8, frameon=False)
    ax[0].set_title(name, loc="left", fontsize=11, fontweight="bold")
    for s in secs:
        if s.get("ebene_pruefen"):
            ax[1].axvspan(s["start"], s["ende"], color="#FFE2A8", zorder=0,
                          label="Tempo-Ebene prüfen" if not ax[1].get_legend_handles_labels()[1].count("Tempo-Ebene prüfen") else None)
    ax[1].scatter(be[hits], np.zeros(hits.sum()), s=6, color="#17663A", label="Raster bestätigt")
    ax[1].scatter(be[~hits], np.zeros((~hits).sum()), s=14, color="#B0241B", marker="x", label="nicht bestätigt")
    ax[1].set_ylim(-1, 1)
    ax[1].set_yticks([])
    ax[1].set_xlabel("Zeit (s)")
    ax[1].set_xlim(0, dur)
    ax[1].legend(loc="upper right", fontsize=8, frameon=False, ncol=3)
    for a in ax:
        a.spines[["top", "right"]].set_visible(False)
    fig.tight_layout()
    fig.savefig(out_png, dpi=110)
    plt.close(fig)


def analyse(name, path, out):
    be, bpm_e, conf_e, audio_e = beats_essentia(path)
    y, sr = librosa.load(str(path), sr=SR_L, mono=True)
    bl = beats_librosa(y, sr)
    _, f_strict = match(be, bl)
    hits, level = raster_agreement(be, bl)
    secs = sections(be)
    for s in secs:
        a, b = s.pop("_i")
        sl = slice(a, b + 1)
        s["raster_bestaetigt"] = round(float(hits[sl].mean()), 3)
        lv = list(level[sl])
        s["ebene_gleich"] = round(lv.count("gleich") / max(1, len(lv)), 3)
        s["ebene_pruefen"] = bool(s["ebene_gleich"] < 0.7)
    irr = irregular(be)
    phase, margin, _ = downbeat_phase(y, sr, be)
    dur = len(y) / sr
    plot(name, dur, be, bl, hits, secs, irr, out / f"{name}.png", level)
    click_track(audio_e, SR_E, be, phase, out / f"{name}_klicks.mp3")
    res = {
        "name": name, "dauer_s": round(dur, 1),
        "essentia": {"bpm": round(bpm_e, 1), "konfidenz": round(conf_e, 2), "schlaege": int(len(be))},
        "librosa": {"schlaege": int(len(bl))},
        "uebereinstimmung": {"f_mass_streng": round(f_strict, 3),
                             "raster_bestaetigt": round(float(hits.mean()), 3),
                             "ebene_gleich": round(float(np.mean(level == "gleich")), 3)},
        "abschnitte": secs,
        "unregelmaessig_s": irr,
        "erste_schlaege_s": [round(float(x), 2) for x in be[:4]],
        "eins": {"phase": phase, "abstand": round(margin, 2),
                 "erste_eins_s": round(float(be[phase]), 2)},
    }
    (out / f"{name}.json").write_text(json.dumps(res, ensure_ascii=False, indent=2))
    return res


if __name__ == "__main__":
    out = Path(sys.argv[1])
    out.mkdir(parents=True, exist_ok=True)
    results = []
    for arg in sys.argv[2:]:
        name, path = arg.split("=", 1)
        r = analyse(name, Path(path), out)
        results.append(r)
        print(json.dumps(r, ensure_ascii=False))
    (out / "zusammenfassung.json").write_text(json.dumps(results, ensure_ascii=False, indent=2))
