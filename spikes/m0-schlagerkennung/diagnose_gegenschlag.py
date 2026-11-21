"""
Spike M0.1, Diagnose: Liegt das Essentia-Raster auf dem Schlag oder auf dem Gegenschlag?

Je 6-Sekunden-Fenster: Verhältnis der Einsätze (Onsets) und des Basses auf den Klicks zu
den Mittelpunkten dazwischen sowie die Verschiebung (Bruchteil eines Schlags), bei der das
Raster am besten auf den Einsätzen liegt. ±0,5 heißt: Gegenschlag.

Aufruf: python diagnose_gegenschlag.py <datei.mp3>
"""
import sys, json
import numpy as np, librosa, essentia.standard as es
path, = sys.argv[1:]
audio = es.MonoLoader(filename=path, sampleRate=44100)()
_, beats, _, _, _ = es.RhythmExtractor2013(method="multifeature")(audio)
beats = np.asarray(beats)
y, sr = librosa.load(path, sr=22050, mono=True)
hop = 256
oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop)); f = librosa.fft_frequencies(sr=sr, n_fft=2048)
low = np.log1p(S[f < 150].sum(0)); bass = np.maximum(0, np.diff(low, prepend=low[0]))
ft = librosa.frames_to_time(np.arange(len(oenv)), sr=sr, hop_length=hop)
def at(env, t, w=0.03):
    i0, i1 = np.searchsorted(ft, t - w), np.searchsorted(ft, t + w)
    return env[i0:max(i0 + 1, i1)].max()
win = 6.0
print(f"{'Zeit':>11} {'BPM':>5} {'Onset Schlag/Mitte':>18} {'Bass Schlag/Mitte':>18} {'beste Phase':>12}")
t0 = 0.0
while t0 < beats[-1]:
    sel = beats[(beats >= t0) & (beats < t0 + win)]
    if len(sel) > 4:
        ibi = np.median(np.diff(sel))
        mids = sel[:-1] + ibi / 2
        on_b = np.mean([at(oenv, b) for b in sel]); on_m = np.mean([at(oenv, m) for m in mids])
        ba_b = np.mean([at(bass, b) for b in sel]); ba_m = np.mean([at(bass, m) for m in mids])
        # beste Phasenverschiebung des Rasters (in Anteilen eines Schlags) nach Onset-Summe
        shifts = np.linspace(-0.5, 0.5, 21)
        sc = [np.mean([at(oenv, b + s * ibi, 0.02) for b in sel]) for s in shifts]
        best = shifts[int(np.argmax(sc))]
        print(f"{int(t0//60)}:{int(t0%60):02d}–{int((t0+win)//60)}:{int((t0+win)%60):02d} {60/ibi:5.1f} {on_b/on_m:18.2f} {ba_b/max(ba_m,1e-9):18.2f} {best:+12.2f}")
    t0 += win
