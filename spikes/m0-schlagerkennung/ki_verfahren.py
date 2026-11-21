"""
Spike M0.1, Teil 2: Neuronales Verfahren (beat_this, CPJKU) gegen den Hörtest des Trainers.

Die Wahrheit kommt aus dem Hörtest (ERGEBNIS.md), abgebildet auf die Essentia-Schläge:
  "ok"     – Essentia-Schläge liegen auf den gezählten Schritten
  "gegen"  – Essentia liegt auf dem Gegenschlag → richtige Schläge = Essentia + ½ Schlag
  "doppelt"– Essentia zählt doppelt so schnell → nur die Tempo-Ebene wird geprüft
„1“: Der Trainer hat angegeben, auf welcher Zählzeit der hohe Klick der Klick-Spur lag.
Daraus folgt die Lage der echten Taktanfänge (Versatz in Schlägen, modulo 4).

Aufruf: python ki_verfahren.py <ausgabeordner> <name>=<datei.mp3> [...]
"""
import json
import sys
from pathlib import Path

import numpy as np
import librosa
import essentia.standard as es
from beat_this.inference import Audio2Beats

sys.path.insert(0, str(Path(__file__).parent))
from analyse import match, sections, click_track  # noqa: E402

END = 10_000
# Phase = Index des ersten hohen Klicks in der Klick-Spur (aus zusammenfassung.json, „eins.phase“).
# Versatz = um wie viele Schläge die echte „1“ nach dem hohen Klick liegt (mod 4):
#   hoch auf 1 → 0 · hoch auf 2 und 6 → 3 · hoch auf 3 und 7 → 2 · hoch auf 4 und 8 → 1
HOERTEST = {
    "Gardetanz_2027": {"phase": 0, "bereiche": [
        (0, 40, "ok", 2), (40, 65, "doppelt", None), (65, 104, "ok", 2), (104, END, "ok", 1)]},
    "Piccolotanz_2027": {"phase": 0, "bereiche": [(0, 55, "ok", 0), (55, END, "ok", 3)]},
    "Piccolos_2026_Rohschnitt": {"phase": 1, "bereiche": [(0, END, "ok", 2)]},
    "Piccolos_2025": {"phase": 3, "bereiche": [
        (0, 19, "ok", 0), (19, 66, "gegen", None), (66, 82, "ok", None),
        (82, 97, "gegen", None), (97, 145, "ok", 0), (145, END, "ok", 0)]},
}


def truth(be, spec):
    beats, ones, double = [], [], []
    ibi = np.r_[np.diff(be), np.diff(be)[-1:]]
    for a, b, kind, off in spec["bereiche"]:
        idx = np.where((be >= a) & (be < b))[0]
        if kind == "ok":
            beats += list(be[idx])
            if off is not None:
                ones += [be[i] for i in idx if (i - spec["phase"] - off) % 4 == 0]
        elif kind == "gegen":
            beats += list(be[idx] + ibi[idx] / 2)
        else:
            double.append((a, b))
    return np.sort(beats), np.sort(ones), double


def in_ranges(x, ranges):
    return np.array([any(a <= v < b for a, b in ranges) for v in x], bool) if len(x) else np.zeros(0, bool)


def evaluate(name, path, a2b, out):
    spec = HOERTEST[name]
    audio = es.MonoLoader(filename=path, sampleRate=44100)()
    _, be, _, _, _ = es.RhythmExtractor2013(method="multifeature")(audio)
    be = np.asarray(be, float)
    y, sr = librosa.load(path, sr=22050, mono=True)
    kb, kd = a2b(y, sr)
    kb, kd = np.asarray(kb, float), np.asarray(kd, float)

    t_beats, t_ones, double = truth(be, spec)
    # Schläge nur außerhalb der „doppelt“-Bereiche vergleichen
    kb_eval = kb[~in_ranges(kb, double)]
    be_eval = be[~in_ranges(be, double)]
    _, f_ki = match(t_beats, kb_eval)
    _, f_es = match(t_beats, be_eval)
    gegen = [(a, b) for a, b, k, _ in spec["bereiche"] if k == "gegen"]
    res = {"name": name, "schlaege_f": {"ki": round(f_ki, 3), "essentia": round(f_es, 3)}}
    if gegen:
        tg = t_beats[in_ranges(t_beats, gegen)]
        hit_ki, _ = match(tg, kb[in_ranges(kb, gegen)])
        hit_es, _ = match(tg, be[in_ranges(be, gegen)])
        res["gegenschlag_stellen"] = {"ki_richtig": round(float(hit_ki.mean()), 3),
                                      "essentia_richtig": round(float(hit_es.mean()), 3)}
    if double:
        lv = []
        for a, b in double:
            ki_bpm = 60 / np.median(np.diff(kb[(kb >= a) & (kb < b)]))
            es_bpm = 60 / np.median(np.diff(be[(be >= a) & (be < b)]))
            lv.append({"bereich": f"{a}-{b}s", "essentia_bpm": round(es_bpm, 1), "ki_bpm": round(ki_bpm, 1)})
        res["tempo_ebene"] = lv
    if len(t_ones):
        hit, _ = match(t_ones, kd)
        # Takt-Länge der KI: Schläge zwischen zwei Taktanfängen
        per_bar = [((kb >= kd[i]) & (kb < kd[i + 1])).sum() for i in range(len(kd) - 1)]
        res["eins"] = {"echte_einsen": int(len(t_ones)), "ki_getroffen": round(float(hit.mean()), 3),
                       "ki_schlaege_pro_takt": int(np.median(per_bar)) if per_bar else None}
    res["ki_abschnitte"] = [{k: v for k, v in s.items() if k in ("start", "ende", "bpm")} for s in sections(kb)]
    # Klick-Spur der KI: hoher Klick auf den erkannten Taktanfängen
    phase = 0
    if len(kd):
        phase = int(np.argmin(np.abs(kb - kd[0])))
    click_track(audio, 44100, kb, phase, out / f"{name}_ki_klicks.mp3",
                bar=int(res.get("eins", {}).get("ki_schlaege_pro_takt") or 4))
    return res


if __name__ == "__main__":
    out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
    a2b = Audio2Beats(checkpoint_path="final0", device="cpu", dbn=False)
    results = []
    for arg in sys.argv[2:]:
        name, path = arg.split("=", 1)
        r = evaluate(name, path, a2b, out)
        results.append(r)
        print(json.dumps(r, ensure_ascii=False))
    (out / "ki_verfahren.json").write_text(json.dumps(results, ensure_ascii=False, indent=2))
