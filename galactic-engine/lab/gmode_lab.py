"""gmode_lab.py — DENE (oyna)
Lab modu: küçük 'rezonans' wav üretir.

Çalıştır:
  python3 gmode_lab.py
Çıktı:
  lab_output/resonance.wav
"""

from pathlib import Path
import math
import wave
import struct

OUT = Path(__file__).resolve().parent / "lab_output"
OUT.mkdir(parents=True, exist_ok=True)
WAV = OUT / "resonance.wav"

sr = 44100
dur = 5.0
n = int(sr*dur)

def env(i):
    t=i/sr
    return math.exp(-t/3.0)

def tone(t):
    # "cosmic" chord-ish blend
    return (
        0.45*math.sin(2*math.pi*110*t) +
        0.25*math.sin(2*math.pi*164.81*t) +
        0.18*math.sin(2*math.pi*220*t) +
        0.10*math.sin(2*math.pi*(55+10*math.sin(2*math.pi*0.13*t))*t)
    )

with wave.open(str(WAV), "wb") as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(sr)
    for i in range(n):
        t=i/sr
        s = tone(t) * env(i) * 0.6
        s = max(-1.0, min(1.0, s))
        wf.writeframes(struct.pack("<h", int(s*32767)))

print("OK:", WAV)
