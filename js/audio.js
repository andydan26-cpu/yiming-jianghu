'use strict';
/* 一命江湖 — 程式合成音樂與音效（不需下載音檔） */
let AC = null, BGM_G = null, SFX_G = null, curTrack = null, nextNote = 0, step = 0;
const PENTA = [0, 2, 4, 7, 9]; // 五聲音階
function audioInit() {
  if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
  try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
  BGM_G = AC.createGain(); SFX_G = AC.createGain(); BGM_G.connect(AC.destination); SFX_G.connect(AC.destination); applyVolume();
  setInterval(scheduler, 60);
}
function applyVolume() { if (!AC) return; BGM_G.gain.value = SET.bgm * 0.35; SFX_G.gain.value = SET.sfx * 0.5; }
const midi = n => 440 * Math.pow(2, (n - 69) / 12);
function pluck(t, f, dur, vol, out) { // 古琴：撥弦後微微滑音
  const o = AC.createOscillator(), g = AC.createGain(), fl = AC.createBiquadFilter();
  o.type = 'triangle'; o.frequency.setValueAtTime(f * 1.01, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.08);
  fl.type = 'lowpass'; fl.frequency.setValueAtTime(2400, t); fl.frequency.exponentialRampToValueAtTime(500, t + dur);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
  o.connect(fl); fl.connect(g); g.connect(out || BGM_G); o.start(t); o.stop(t + dur + 0.05);
}
function flute(t, f, dur, vol, saw) { // 竹笛／簫（sine）、二胡（saw 加濾波）
  const o = AC.createOscillator(), g = AC.createGain(), lfo = AC.createOscillator(), lg = AC.createGain(), fl = AC.createBiquadFilter();
  o.type = saw ? 'sawtooth' : 'sine'; o.frequency.value = f; lfo.frequency.value = saw ? 6 : 5; lg.gain.value = f * (saw ? 0.012 : 0.008);
  lfo.connect(lg); lg.connect(o.frequency); fl.type = 'lowpass'; fl.frequency.value = saw ? 1600 : 3000;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + dur * 0.25); g.gain.linearRampToValueAtTime(vol * 0.7, t + dur * 0.7); g.gain.linearRampToValueAtTime(0, t + dur);
  o.connect(fl); fl.connect(g); g.connect(BGM_G); o.start(t); lfo.start(t); o.stop(t + dur + 0.05); lfo.stop(t + dur + 0.05);
}
function drum(t, f, vol, out) { const o = AC.createOscillator(), g = AC.createGain(); o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.4, t + 0.2); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3); o.connect(g); g.connect(out || BGM_G); o.start(t); o.stop(t + 0.35); }
function noise(t, dur, vol, hp, out) { const b = AC.createBuffer(1, Math.floor(AC.sampleRate * dur), AC.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length); const s = AC.createBufferSource(); s.buffer = b; const f = AC.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp || 800; const g = AC.createGain(); g.gain.value = vol; s.connect(f); f.connect(g); g.connect(out || SFX_G); s.start(t); }
const TRACKS = {
  village: { root: 62, tempo: 0.42, lead: 'flute', density: 0.55 },
  bamboo: { root: 57, tempo: 0.46, lead: 'xiao', density: 0.45 },
  secret: { root: 55, tempo: 0.5, lead: 'erhu', density: 0.4 },
  sand: { root: 59, tempo: 0.38, lead: 'erhu', density: 0.5 },
  snow: { root: 64, tempo: 0.56, lead: 'xiao', density: 0.32 },
  cult: { root: 52, tempo: 0.34, lead: 'erhu', density: 0.55, drums: true },
  miao: { root: 54, tempo: 0.4, lead: 'xiao', density: 0.5, drums: true },
  sea: { root: 62, tempo: 0.48, lead: 'flute', density: 0.42 },
  boss: { root: 57, tempo: 0.22, lead: 'erhu', density: 0.7, drums: true },
  title: { root: 60, tempo: 0.5, lead: 'flute', density: 0.4 },
};
function music(name) { if (curTrack === name) return; curTrack = name; step = 0; }
function scheduler() {
  if (!AC || !curTrack || SET.bgm <= 0) return; const tr = TRACKS[curTrack]; if (!tr) return;
  while (nextNote < AC.currentTime + 0.3) {
    if (nextNote < AC.currentTime) nextNote = AC.currentTime + 0.05;
    const t = nextNote; const bar = step % 16;
    if (bar % 4 === 0) pluck(t, midi(tr.root - 12 + PENTA[(Math.floor(step / 16) + (bar === 8 ? 3 : 0)) % 5]), 1.8, 0.22);
    if (Math.random() < tr.density) pluck(t, midi(tr.root + PENTA[Math.floor(Math.random() * 5)] + (Math.random() < .3 ? 12 : 0)), 0.9, 0.12);
    if (bar === 0 || (bar === 8 && Math.random() < .6)) { const n = tr.root + 12 + PENTA[Math.floor(Math.random() * 5)]; if (tr.lead === 'erhu') flute(t, midi(n - 12), tr.tempo * 6, 0.07, true); else flute(t, midi(n - (tr.lead === 'xiao' ? 12 : 0)), tr.tempo * 6, 0.06); }
    if (tr.drums) { if (bar % 4 === 0) drum(t, 90, 0.5); if (bar % 4 === 2) drum(t, 140, 0.25); if (bar === 14) drum(t, 70, 0.6); }
    step++; nextNote += tr.tempo;
  }
}
function sfx(k) {
  if (!AC || SET.sfx <= 0) return; const t = AC.currentTime;
  switch (k) {
    case 'swing': noise(t, 0.12, 0.25, 2500); break; case 'heavy': noise(t, 0.2, 0.35, 900); break;
    case 'hit': drum(t, 220, 0.25, SFX_G); noise(t, 0.05, 0.15, 3000); break; case 'crit': drum(t, 160, 0.45, SFX_G); noise(t, 0.12, 0.3, 1500); break;
    case 'dodge': noise(t, 0.18, 0.18, 4000); break; case 'hurt': drum(t, 110, 0.5, SFX_G); break;
    case 'dart': noise(t, 0.06, 0.12, 6000); break; case 'skill': pluck(t, midi(74), 0.4, 0.3, SFX_G); noise(t, 0.2, 0.2, 1800); break;
    case 'ult': drum(t, 60, 0.8, SFX_G); pluck(t, midi(62), 1.2, 0.4, SFX_G); pluck(t + .08, midi(69), 1.2, 0.3, SFX_G); break;
    case 'chop': drum(t, 300, 0.12, SFX_G); break; case 'heal': pluck(t, midi(79), 0.6, 0.2, SFX_G); break;
    case 'learn': [0, 4, 7].forEach((n, i) => pluck(t + i * .08, midi(72 + n), 0.8, 0.25, SFX_G)); break;
    case 'quest': [0, 2, 4, 7, 9].forEach((n, i) => pluck(t + i * .07, midi(67 + n), 0.9, 0.22, SFX_G)); break;
    case 'build': drum(t, 180, 0.3, SFX_G); drum(t + .12, 180, 0.3, SFX_G); break; case 'fail': pluck(t, midi(55), 0.8, 0.3, SFX_G); pluck(t + .1, midi(54), 0.8, 0.3, SFX_G); break;
    case 'click': pluck(t, midi(84), 0.15, 0.12, SFX_G); break; case 'seal': drum(t, 140, 0.35, SFX_G); break;
    case 'death': [0, -3, -7].forEach((n, i) => pluck(t + i * .3, midi(57 + n), 2, 0.35, SFX_G)); break;
    case 'heart': drum(t, 55, 0.6, SFX_G); drum(t + .18, 50, 0.45, SFX_G); break;
  }
}
