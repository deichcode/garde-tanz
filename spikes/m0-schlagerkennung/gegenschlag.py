"""
Spike M0.1, Nachtrag: Automatische Korrektur „Raster liegt auf dem Gegenschlag“.

Idee: Liegt ein Raster richtig, sind die Einsätze (Onsets) auf den Schlägen stärker als
auf den Mittelpunkten dazwischen. Ist es umgekehrt (über ~8 s geglättet), wird das
Raster dort um einen halben Schlag verschoben. Der Bass ist als Kriterium ungeeignet:
Bei „Umpa“-Begleitung liegt er oft zwischen den Schlägen (Fehlkorrekturen im Test).

Aufruf: python gegenschlag.py <ausgabeordner> <name>=<datei.mp3> [...]
Ausgabe: Anteil verschobener Schläge, betroffene Zeitbereiche und eine korrigierte
Klick-Spur je Musik (nur wenn etwas verschoben wurde).
"""
import json
import sys
from pathlib import Path

import numpy as np
import scipy.ndimage as ndi
import librosa
import essentia.standard as es

sys.path.insert(0, str(Path(__file__).parent))
from analyse import click_track, downbeat_phase  # noqa: E402

HOP = 256
SR = 22050


def envelopes(y, sr):
    oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=HOP)
    S = np.abs(librosa.stft(y, n_fft=2048, hop_length=HOP))
    f = librosa.fft_frequencies(sr=sr, n_fft=2048)
    low = np.log1p(S[f < 150].sum(0))
    bass = np.maximum(0, np.diff(low, prepend=low[0]))
    t = librosa.frames_to_time(np.arange(len(oenv)), sr=sr, hop_length=HOP)
    return t, oenv, bass


def peak(t, env, x, w=0.03):
    i0, i1 = np.searchsorted(t, x - w), np.searchsorted(t, x + w)
    return env[i0:max(i0 + 1, i1)].max()


def correct(beats, y, sr, smooth=17, threshold=-0.15, bass_weight=0.0):
    t, oenv, bass = envelopes(y, sr)
    ibi = np.r_[np.diff(beats), np.diff(beats)[-1:]]
    ibi = ndi.median_filter(ibi, size=9, mode="nearest")
    eps = 1e-6
    score = np.array([
        np.log((peak(t, oenv, b) + eps) / (peak(t, oenv, b + d / 2) + eps))
        + bass_weight * np.log((peak(t, bass, b) + eps) / (peak(t, bass, b + d / 2) + eps))
        for b, d in zip(beats, ibi)])
    sm = ndi.median_filter(score, size=smooth, mode="nearest")
    flip = sm < threshold
    fixed = np.where(flip, beats + ibi / 2, beats)
    return fixed, flip


def ranges(beats, flip):
    out, start = [], None
    for b, f in zip(beats, flip):
        if f and start is None:
            start = b
        if not f and start is not None:
            out.append((start, b)); start = None
    if start is not None:
        out.append((start, beats[-1]))
    fmt = lambda s: f"{int(s // 60)}:{int(s % 60):02d}"  # noqa: E731
    return [f"{fmt(a)}–{fmt(b)}" for a, b in out if b - a > 3]


if __name__ == "__main__":
    out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
    report = []
    for arg in sys.argv[2:]:
        name, path = arg.split("=", 1)
        audio = es.MonoLoader(filename=path, sampleRate=44100)()
        _, beats, _, _, _ = es.RhythmExtractor2013(method="multifeature")(audio)
        beats = np.asarray(beats, float)
        y, sr = librosa.load(path, sr=SR, mono=True)
        fixed, flip = correct(beats, y, sr)
        r = {"name": name, "verschoben_anteil": round(float(flip.mean()), 3), "bereiche": ranges(beats, flip)}
        report.append(r)
        print(json.dumps(r, ensure_ascii=False))
        if flip.any():
            phase, _, _ = downbeat_phase(y, sr, fixed)
            click_track(audio, 44100, fixed, phase, out / f"{name}_klicks_korrigiert.mp3")
    (out / "gegenschlag.json").write_text(json.dumps(report, ensure_ascii=False, indent=2))
