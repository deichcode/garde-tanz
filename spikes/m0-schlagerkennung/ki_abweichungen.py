"""Spike M0.1: Wo weicht das KI-Verfahren (beat_this) vom Hörtest ab? Je 10 s, Treffer unter 80 %.
Aufruf: python ki_abweichungen.py <name>=<datei.mp3> [...]  (Namen wie in ki_verfahren.HOERTEST)"""
import sys, numpy as np, librosa, essentia.standard as es
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from ki_verfahren import HOERTEST, truth
from analyse import match
from beat_this.inference import Audio2Beats
a2b = Audio2Beats(checkpoint_path="final0", device="cpu", dbn=False)
for arg in sys.argv[1:]:
    name, path = arg.split("=", 1)
    audio = es.MonoLoader(filename=path, sampleRate=44100)()
    _, be, _, _, _ = es.RhythmExtractor2013(method="multifeature")(audio); be = np.asarray(be)
    y, sr = librosa.load(path, sr=22050, mono=True); kb, kd = a2b(y, sr); kb = np.asarray(kb)
    tb, _, double = truth(be, HOERTEST[name])
    out = []
    for t0 in range(0, int(be[-1]) + 1, 10):
        seg = tb[(tb >= t0) & (tb < t0 + 10)]
        if len(seg) < 4: continue
        hit, _ = match(seg, kb[(kb >= t0 - 1) & (kb < t0 + 11)])
        kseg = kb[(kb >= t0) & (kb < t0 + 10)]
        ratio = (np.median(np.diff(kseg)) / np.median(np.diff(seg))) if len(kseg) > 2 else float('nan')
        if hit.mean() < 0.8:
            lvl = 'halb' if 1.7 < ratio < 2.3 else 'doppelt' if 0.4 < ratio < 0.6 else 'gleich' if 0.85 < ratio < 1.15 else f'{ratio:.2f}'
            out.append(f"{t0//60}:{t0%60:02d}–{(t0+10)//60}:{(t0+10)%60:02d} {hit.mean():.0%} (KI-Ebene {lvl})")
    print(name, '|', '; '.join(out) or 'überall ≥ 80 %')
