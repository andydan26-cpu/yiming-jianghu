'use strict';
/* 一命江湖 1a — 戰鬥 */
const P = { x: 4300, y: 3020, face: -Math.PI / 2, hp: 120, mp: 60, atkT: 0, dodgeT: 0, dodgeCd: 0, charges: 1, iframe: 0, hurt: 0, dvx: 0, dvy: 0, lock: 0,
  combo: 0, comboT: 0, comboHits: 0, dead: false, cd: { s1: 0, s2: 0, inner: 0, qi: 0, pot: 0, swap: 0, ult: 0 }, moving: 0, step: 0, guard: 0, critNext: false,
  home: 0, blockMsg: 0, practice: false, buffT: {}, invis: 0, swing: 0, swingT: 0 };
let E = [], PR = [], FX = [], TIMERS = [];
let gameT = 0, hitStop = 0, shake = 0, closeup = null;
const input = { atk: false };
const DODGE_MP = 10; // 每次位移消耗的內力

function later(d, f) { TIMERS.push({ t: gameT + d, f }); }
function fxText(x, y, t, col, size) { if (!SET.dmgNum && /^\d/.test(t)) return; FX.push({ type: 'text', x: x + rnd(-8, 8), y, t, col: col || CIN, size: size || 16, tt: 0, life: 0.9 }); }
function burst(x, y, col, n) { for (let i = 0; i < (n || 10); i++) { const a = rnd(0, TAU), s = rnd(40, 180); FX.push({ type: 'dot', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: rnd(1.5, 4.5), t: 0, life: rnd(.3, .6), col: col || INK }); } }
function arcFx(x, y, ang, arc, r, col, w, life) { FX.push({ type: 'arc', x, y, ang, arc, r, col: col || INK, w: w || 10, t: 0, life: life || 0.22 }); }
function ringFx(x, y, r0, r1, col, life, w) { FX.push({ type: 'ring', x, y, r0, r1, col: col || INK, t: 0, life: life || 0.4, w: w || 6 }); }
function doShake(v) { if (SET.shake) shake = Math.max(shake, v); }
const attrCol = a => a ? ATTR[a].col : INK;
const cnNum = n => { const d = '〇一二三四五六七八九'; if (n < 10) return d[n]; const u = [['萬', 10000], ['千', 1000], ['百', 100], ['十', 10]]; let s = '', z = false; for (const [c, v] of u) { const q = Math.floor(n / v); if (q) { if (z) s += '〇'; s += (q === 1 && v === 10 && !s ? '' : d[q]) + c; z = false; } else if (s) z = true; n %= v; } if (n) s += (z ? '〇' : '') + d[n]; return s; };

/* ---------- 目標 ---------- */
function nearestEnemy(range, from) { from = from || P; let best = null, bd = range; for (const e of E) { if (e.dead || e.ghost) continue; const d = dist(from, e) - e.r; if (d < bd && los(from.x, from.y, e.x, e.y)) { bd = d; best = e; } } return best; }
function nearestTarget(range) { const e = nearestEnemy(range); if (e) return e; let best = null, bd = range; for (const n of NODES_R) { if (!n.alive) continue; const d = dist(P, n) - n.r; if (d < bd) { bd = d; best = n; } } for (const s of STALKS) { if (!s.up || !BOSSFIGHT) continue; const d = dist(P, s) - 16; if (d < bd) { bd = d; best = s; } } return best; }
function aim(range, ang) { if (ang !== undefined && ang !== null) { P.face = ang; return; } const t = nearestTarget(range); if (t) P.face = Math.atan2(t.y - P.y, t.x - P.x); }

/* ---------- 命中 ---------- */
function meleeHit(range, arc, dmg, o) {
  o = o || {}; const cx = o.cx !== undefined ? o.cx : P.x, cy = o.cy !== undefined ? o.cy : P.y; let n = 0, dealt = 0;
  for (const e of E) { if (e.dead || e.ghost) continue; const dx = e.x - cx, dy = e.y - cy, d = Math.hypot(dx, dy); if (d > range + e.r) continue; if (!los(cx, cy, e.x, e.y)) continue;
    if (arc < TAU - 0.01 && d > e.r + 8 && Math.abs(angDiff(Math.atan2(dy, dx), P.face)) > arc / 2) continue;
    dealt += hurtEnemy(e, dmg, Object.assign({}, o, { ang: Math.atan2(dy, dx) })); n++; }
  if (o.harvest !== false) for (const nd of NODES_R) { if (!nd.alive) continue; const dx = nd.x - cx, dy = nd.y - cy, d = Math.hypot(dx, dy); if (d > range + nd.r) continue; if (arc < TAU - 0.01 && d > nd.r + 8 && Math.abs(angDiff(Math.atan2(dy, dx), P.face)) > arc / 2) continue; hitNode(nd); }
  if (BOSSFIGHT) { if (BOSSFIGHT.bid === 'liu') for (const s of STALKS) { if (!s.up) continue; if (dist({ x: cx, y: cy }, s) < range + 16) hitStalk(s); } propsHitArea(cx, cy, range, dmg); }
  return dealt;
}
function hurtEnemy(e, dmg, o) {
  if (e.def && e.def.shell) dmg *= crabMul(e, o);
  if (e.dead || e.ghost) return 0; o = o || {}; if (o.book === 'jincan') e.lastHit = Object.assign({}, o, { dmgBase: dmg });
  const attr = o.attr || null; let tag = '';
  let crit = Math.random() < critRate() || P.critNext; if (P.critNext && o.src !== 'dot') P.critNext = false;
  if (o.src === 'dot') crit = false;
  let m = attrMul(attr) * (1 + Math.min(setN('yubang') >= 4 ? 0.7 : 0.5, Math.floor(P.comboHits / 10) * 0.05));
  if (e.def.res && attr && e.def.res[attr]) m *= 1 - e.def.res[attr];
  if (e.affix && e.affix.includes('鐵壁')) m *= 0.7;
  if (e.chase > 0 && o.src !== 'dot') { m *= 1.5; e.chase = 0; tag = '追擊'; }
  if (e.st.freeze > 0 && attr === '剛') { m *= 2; e.st.freeze = 0; tag = '碎冰'; for (const o2 of E) if (o2 !== e && !o2.dead && dist(o2, e) < 110) hurtEnemy(o2, dmg * 0.6, { attr: '寒', src: 'dot' }); burst(e.x, e.y, '#d9ecf7', 16); }
  if (e.st.poison > 0 && attr === '柔' && o.multi) { const left = e.st.poison * e.st.pdps; e.st.poison = 0; m += left / Math.max(1, dmg); tag = '毒爆'; burst(e.x, e.y, ATTR.毒.edge, 12); }
  if (e.st.poison > 0 && attr === '寒') { e.st.poison *= 2; tag = tag || '凝毒'; }
  if (tag) { const c = S.stats.combos || (S.stats.combos = {}); c[tag] = (c[tag] || 0) + 1; }
  if (tag === '追擊' && setN('kuangsha') >= 6) m *= 1.5 / 1.5 * 1.5;
  let v = Math.max(1, Math.round(dmg * m * (crit ? critDmg() : 1) * rnd(0.93, 1.07)));
  e.hp -= v; e.flash = 0.1; e.aggro = true;
  const kb = (o.kb || 40) * (attr === '剛' ? 1.6 : 1) * (setN('kuangsha') >= 6 ? 2 : 1) * (e.def.noKb ? .25 : 1);
  if (!e.boss && !(e.affix && e.affix.includes('鐵壁'))) { e.kx += Math.cos(o.ang || 0) * kb * 3; e.ky += Math.sin(o.ang || 0) * kb * 3; if (attr === '剛' || kb > 150) e.kbT = 0.35; }
  if (attr === '寒') { if (o.freeze && !e.boss) e.st.freeze = Math.max(e.st.freeze, o.freeze + (setN('hanjiang') >= 6 ? 1 : 0)); else e.st.slow = Math.max(e.st.slow, 2); }
  if (attr === '毒' && o.src !== 'dot') { e.st.poison = Math.max(e.st.poison, 4); e.st.pdps = Math.max(e.st.pdps || 0, v * 0.25 * (setN('wudu') >= 4 ? 1.25 : 1)); }
  if (attr === '柔' && o.src !== 'dot' && !o.multi && o.src === 'skill') later(0.12, () => { if (!e.dead) hurtEnemy(e, dmg * 0.5, { attr: '柔', src: 'dot', multi: true }); });
  const txt = crit && o.src !== 'dot' ? cnNum(v) : String(v);
  if (o.src !== 'dot' || v > 3) fxText(e.x, e.y - e.r - 14, tag ? `${tag} ${txt}` : txt, crit ? '#8c0f0a' : attr ? attrCol(attr) : CIN, crit ? 24 : o.src === 'dot' ? 12 : 16);
  if (o.src !== 'dot') { for (let i = 0; i < 4; i++) { const a = (o.ang || 0) + rnd(-.7, .7), s = rnd(60, 200); FX.push({ type: 'dot', x: e.x, y: e.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: rnd(1.5, 3.5), t: 0, life: .4, col: Math.random() < .3 ? CIN : attr ? ATTR[attr].col : INK }); }
    FX.push({ type: 'spr', id: crit ? 'fx_blood' : 'fx_ink', x: e.x, y: e.y - e.r - 6, ang: (o.ang || 0) + rnd(-.4, .4), s: crit ? 78 : 46, t: 0, life: crit ? .35 : .25 });
    P.comboHits++; P.comboT = 3; S.stats.bestCombo = Math.max(S.stats.bestCombo, P.comboHits);
    if (crit || o.heavy || tag) hitStop = Math.max(hitStop, 0.06); doShake(crit ? 5 : 2.5); sfx(crit ? 'crit' : 'hit');
    P.mp = Math.min(maxMp(), P.mp + 2);
    if (e.affix && e.affix.includes('毒血') && dist(P, e) < 90 && Math.random() < 0.3) poisonPlayer(4, e.dmg * 0.15);
  }
  const ls = lifesteal() + (o.ls || 0) + (P.buffT.blood > 0 ? 0.25 : 0);
  if (ls > 0) P.hp = Math.min(maxHp(), P.hp + v * ls);
  if (o.book) bookProgress(o.book, 1);
  if (o.wid) gainMastery(o.wid, 1);
  if (e.hp <= 0) killEnemy(e);
  else if (e.affix && e.affix.includes('分身') && !e.split && e.hp < e.maxHp / 2) { e.split = true; const c = spawnEnemy(e.type, e.x + 30, e.y, e.camp, { elite: false }); c.hp = c.maxHp = Math.round(e.maxHp * 0.3); c.dmg = e.dmg; }
  return v;
}
function bookProgress(id, n) { const b = S.books[id]; if (!b || getBook(id).cat !== 'weapon') return; const need = 20 * b.lv; if (b.lv >= 10) return; if (b.prog < need) { b.prog += n; if (b.prog >= need) toast(`《${getBook(id).n}》修練圓滿，可回藏經閣突破到第 ${b.lv + 1} 重`); } }
function gainMastery(w, n) { const x = S.wpn[w]; if (x.lv >= 10) return; x.xp += n; const need = l => 60 + 50 * l; while (x.lv < 10 && x.xp >= need(x.lv)) { x.xp -= need(x.lv); x.lv++; toast(`${WEAPONS[w].name}熟練度提升至 ${x.lv} 級`); if (x.lv === 2 || x.lv === 5) toast(`${WEAPONS[w].name}開啟第 ${x.lv === 2 ? '一' : '二'} 個招式欄`, 'red'); } }

/* ---------- 普攻 ---------- */
function basicAttack() {
  const w = S.main, d = WEAPONS[w]; P.atkT = d.cd * (1 - 0.02 * (S.wpn[w].lv - 1)); const dmg = wDmg(w);
  P.swing = 1; P.swingT = 0.18;
  if (d.ranged) { aim(d.range * (curWeather() === '沙暴' ? .7 : 1)); shoot(P.x + Math.cos(P.face) * 14, P.y + Math.sin(P.face) * 14, P.face, 640, dmg, { r: 6, life: curWeather() === '沙暴' ? .56 : .8, wid: w, nodes: true }); sfx('dart'); return; }
  aim(d.range + 70); P.combo = (P.combo + 1) % 3; const heavy = w === 'fist' && P.combo === 2;
  meleeHit(d.range, d.arc, dmg * (heavy ? 1.5 : 1), { kb: w === 'blade' ? 150 : heavy ? 220 : 60, wid: w, heavy });
  const side = P.combo % 2 ? 1 : -1; sfx(w === 'blade' ? 'heavy' : 'swing');
  if (w === 'sword') arcFx(P.x, P.y, P.face + side * .15, d.arc, d.range, INK, 8, .18);
  else if (w === 'blade') arcFx(P.x, P.y, P.face, d.arc, d.range, INK, 16, .26);
  else FX.push({ type: 'fist', x: P.x + Math.cos(P.face) * 36, y: P.y + Math.sin(P.face) * 36, r: heavy ? 22 : 13, t: 0, life: .16 });
}
function shoot(x, y, a, spd, dmg, o) { PR.push(Object.assign({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, a, dmg, owner: 'p', r: 6, life: 1, pierce: false, kind: 'dart', homing: false, kb: 40, hit: new Set(), t: 0 }, o || {})); }
function shootE(x, y, a, spd, dmg, o) { PR.push(Object.assign({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, a, dmg, owner: 'e', r: 7, life: 3, kind: 'ink', t: 0 }, o || {})); }

/* ---------- 招式 ---------- */
function slotBook(key) { if (key === 's1' || key === 's2') { const w = S.main; const lvNeed = key === 's1' ? 2 : 5; if (S.wpn[w].lv < lvNeed) return { err: `${WEAPONS[w].name}熟練 ${lvNeed} 級才開啟這個招式欄` }; const id = S.slots[w][key === 's1' ? 0 : 1]; return id ? { id } : { err: '這一欄還沒放秘笈，到角色面板配招' }; }
  if (key === 'inner') return { err: '內功心法是永久被動，學會就生效' }; const id = S.slots[key]; return id ? { id } : { err: '還沒裝上氣功' }; }
const QI_MP = [0, 0.5, 0.6, 0.7]; // 氣功耗內力上限的比例（絕學要全滿）
function bookCost(b) { if (b.cat === 'qi') return Math.round(maxMp() * QI_MP[b.tier || 1]); return b.mp || (b.tier === 1 ? 20 : b.tier === 2 ? 30 : 45); }
function bookCd(b) { return b.cd || (b.tier === 1 ? 6 : b.tier === 2 ? 8 : 14); }
function useSkill(key, ang) {
  if (P.dead || P.lock > 0 || P.dodgeT > 0 || PAUSED()) return;
  const r = slotBook(key); if (r.err) { toast(r.err); return; }
  const b = getBook(r.id); if (P.cd[key] > 0) return;
  const cost = bookCost(b) * (P.buffT.taixu > 0 ? 0 : 1);
  if (b.cat === 'qi' && P.mp < cost) { toast(`內力不足：施展${b.n}需 ${cost} 內力`); return; }
  if (P.mp < cost) { // 內力透支
    const need = Math.ceil((cost - P.mp) * 2); if (P.hp <= need + 1) { toast('內力不足，氣血也不夠代付'); return; }
    P.hp -= need; P.mp = 0; fxText(P.x, P.y - 40, `透支 −${need}`, '#5a1416', 15);
    if (Math.random() < 0.15) zouhuo(30, '內力透支');
  } else P.mp -= cost;
  P.cd[key] = bookCd(b); if (b.cat === 'qi') gainArt(r.id, 1);
  const base = b.cat === 'weapon' ? wDmg(b.w) : wDmg(S.main) * 0.8 + 6 * (1 + 0.08 * S.mer.chong);
  const dmg = base * (b.mult || (b.tier === 2 ? 2.2 : b.tier === 3 ? 4 : 1.5)) * bookMul(r.id);
  const attr = b.attrs[0];
  const o = { attr, src: 'skill', book: r.id, wid: b.cat === 'weapon' ? b.w : null, freeze: b.freeze || (b.attrs.includes('寒') && b.tier >= 2 ? 1.5 : 0) };
  if (b.cat === 'inner') { innerRelease(b, dmg, o); sfx('skill'); return; }
  if (b.cat === 'qi') { qiCast(b, dmg * 1.5, o, ang); if (b.tier === 3) closeupFx(b.n); return; }
  castPattern(b.pat || (b.cat === 'qi' ? 'line' : 'thrust3'), dmg, o, ang, b);
  sfx('skill');
  if (b.tier === 3) closeupFx(b.n);
}
function castPattern(pat, dmg, o, ang, b) {
  const multiAttr = b && b.attrs.length > 1 ? b.attrs : null;
  const oo = () => Object.assign({}, o, multiAttr ? { attr: pick(multiAttr) } : {});
  switch (pat) {
    case 'thrust3': P.lock = .36; for (let k = 0; k < 3; k++) later(k * .12, () => { aim(200, ang); P.x += Math.cos(P.face) * 42; P.y += Math.sin(P.face) * 42; collide(P, 16, true); P.iframe = Math.max(P.iframe, .12); meleeHit(118, .9, dmg, Object.assign(oo(), { kb: 80 })); arcFx(P.x, P.y, P.face, .6, 120, attrCol(o.attr), 7, .2); FX.push({ type: 'ghost', x: P.x, y: P.y, face: P.face, t: 0, life: .3 }); }); break;
    case 'orbit': FX.push({ type: 'orbit', t: 0, life: 3.2, tick: 0, dmg, o: oo(), col: attrCol(o.attr) }); break;
    case 'palm': aim(420, ang); shoot(P.x, P.y, P.face, 430, dmg, Object.assign(oo(), { kind: 'palm', r: 46, life: .95, pierce: true, kb: 320 })); P.lock = .25; doShake(6); break;
    case 'cone': aim(200, ang); meleeHit(180, 1.3, dmg, Object.assign(oo(), { kb: 60 })); arcFx(P.x, P.y, P.face, 1.3, 180, attrCol(o.attr), 22, .35); break;
    case 'claw': P.lock = .4; for (let k = 0; k < 4; k++) later(k * .1, () => { aim(120, ang); meleeHit(85, 1.6, dmg, Object.assign(oo(), { ls: 0.2, kb: 30 })); arcFx(P.x, P.y, P.face + (k % 2 ? .4 : -.4), 1.2, 85, CIN, 6, .15); }); break;
    case 'spin': P.lock = .5; for (let k = 0; k < 3; k++) later(k * .18, () => { meleeHit(125, TAU, dmg, Object.assign(oo(), { kb: 120 })); arcFx(P.x, P.y, gameT * 20, TAU * .9, 125, attrCol(o.attr), 14, .22); FX.push({ type: 'spr', id: 'fx_whirl', x: P.x, y: P.y - 16, ang: gameT * 9, s: 280, t: 0, life: .25, col: o.attr ? attrCol(o.attr) : null }); }); break;
    case 'wave': aim(400, ang); shoot(P.x, P.y, P.face, 520, dmg, Object.assign(oo(), { kind: 'wave', r: 40, life: .75, pierce: true, kb: 220 })); P.lock = .2; break;
    case 'cross': aim(400, ang); for (const s of [-.35, .35]) shoot(P.x, P.y, P.face + s, 520, dmg, Object.assign(oo(), { kind: 'wave', r: 36, life: .7, pierce: true, kb: 200 })); break;
    case 'fan': aim(480, ang); for (let k = 0; k < 12; k++) { const a = P.face - .6 + 1.2 * k / 11; shoot(P.x, P.y, a, 640, dmg, Object.assign(oo(), { r: 5, life: .7, kind: 'needle' })); } break;
    case 'homing': aim(480, ang); for (let k = 0; k < 5; k++) shoot(P.x, P.y, P.face + (k - 2) * .5, 420, dmg, Object.assign(oo(), { r: 7, life: 2.4, homing: true })); break;
    case 'ring': for (let k = 0; k < 16; k++) shoot(P.x, P.y, TAU * k / 16, 520, dmg, Object.assign(oo(), { r: 6, life: .8, kind: 'needle' })); break;
    case 'line': aim(600, ang); shoot(P.x, P.y, P.face, 900, dmg, Object.assign(oo(), { kind: 'line', r: 22, life: .55, pierce: true, kb: 160 })); break;
    case 'sleeve': aim(220, ang); for (let k = 0; k < 3; k++) later(k * .1, () => { meleeHit(200, 1.4, dmg, Object.assign(oo(), { kb: 260, multi: k > 0 })); arcFx(P.x, P.y, P.face, 1.4, 200 - k * 20, attrCol(o.attr), 18, .25); }); break;
    case 'icicle': aim(600, ang); shoot(P.x, P.y, P.face, 700, dmg, Object.assign(oo(), { kind: 'icicle', r: 12, life: .8, freeze: 1.5 })); break;
    case 'orb': aim(500, ang); shoot(P.x, P.y, P.face, 260, dmg, Object.assign(oo(), { kind: 'orb', r: 18, life: 2, pierce: true })); break;
    case 'cloud': FX.push({ type: 'cloud', x: P.x, y: P.y, t: 0, life: 5, tick: 0, dmg, o: oo() }); break;
    case 'combo5': P.lock = .45; for (let k = 0; k < 5; k++) later(k * .08, () => { aim(120, ang); meleeHit(85, 1.4, dmg, Object.assign(oo(), { kb: k === 4 ? 420 : 30, heavy: k === 4 })); FX.push({ type: 'fist', x: P.x + Math.cos(P.face) * 40, y: P.y + Math.sin(P.face) * 40, r: k === 4 ? 26 : 14, t: 0, life: .15 }); }); break;
    case 'beam': aim(600, ang); shoot(P.x, P.y, P.face, 800, dmg, Object.assign(oo(), { kind: 'line', r: 26, life: .6, pierce: true, heal: 0.03 })); break;
    case 'blink': { aim(400, ang); const sx = P.x, sy = P.y; P.iframe = .5; const ex = P.x + Math.cos(P.face) * 420, ey = P.y + Math.sin(P.face) * 420; for (const e of E) { if (e.dead) continue; const t = clamp(((e.x - sx) * (ex - sx) + (e.y - sy) * (ey - sy)) / (420 * 420), 0, 1); if (Math.hypot(sx + (ex - sx) * t - e.x, sy + (ey - sy) * t - e.y) < 60 + e.r) hurtEnemy(e, dmg * 2, oo()); } P.x = ex; P.y = ey; collide(P, 16, true); FX.push({ type: 'slash', x1: sx, y1: sy, x2: P.x, y2: P.y, t: 0, life: .5 }); break; }
    case 'quake': for (let k = 0; k < 3; k++) later(k * .3, () => { meleeHit(160 + k * 70, TAU, dmg, Object.assign(oo(), { kb: 250 })); ringFx(P.x, P.y, 20, 160 + k * 70, INK, .4, 18); doShake(10); }); break;
    case 'freezeall': for (const e of E) if (!e.dead && dist(e, P) < 700 && losP(e)) hurtEnemy(e, dmg, Object.assign(oo(), { attr: '寒', freeze: 3 })); ringFx(P.x, P.y, 20, 700, '#d9ecf7', .8, 20); break;
    case 'plague': FX.push({ type: 'mist', x: P.x, y: P.y, r: 320, t: 0, life: 6, tick: 0, dmg: dmg * 0.4, o: Object.assign(oo(), { attr: '毒' }) }); break;
    default: meleeHit(120, 1.6, dmg, oo());
  }
}
/* ---------- 氣功招式：先運氣（聚氣）再發勁 ---------- */
const QI_COL = { 剛: '#c9962e', 柔: '#3f8a6a', 寒: '#6fb6d8', 毒: '#3d5a2a' };
function qiCast(b, dmg, o, ang) {
  const a0 = b.attrs[0], big = b.tier >= 2 ? 1.3 : 1, ultra = b.tier === 3, col = QI_COL[a0] || QI;
  aim(620, ang); const face = P.face; P.lock = .34; P.iframe = Math.max(P.iframe, .22); P.qiPose = .5;
  FX.push({ type: 'qicharge', x: P.x, y: P.y, col, t: 0, life: .3 }); sfx('skill');
  later(.28, () => { if (P.dead) return; P.face = face; const oo = Object.assign({}, o, { attr: a0 }); const cx = Math.cos(face), cy = Math.sin(face);
    if (a0 === '剛') { // 劈空勁：金色掌風刀氣，貫穿擊退
      const n = ultra ? 3 : 1; for (let k = 0; k < n; k++) { const a = face + (k - (n - 1) / 2) * .32; shoot(P.x + cx * 30, P.y + cy * 30, a, 800, dmg, Object.assign({}, oo, { kind: 'qiblade', r: 46 * big, life: .72, pierce: true, kb: 340 })); }
      FX.push({ type: 'spr', id: 'fx_crack', x: P.x + cx * 40, y: P.y + cy * 40 + 8, s: 100 * big, t: 0, life: .6, hs: .55 }); doShake(9); sfx('heavy'); }
    else if (a0 === '柔') { // 流雲袖：雲袖連捲，前兩波拉近、最後一波震開
      const n = ultra ? 5 : 3; for (let k = 0; k < n; k++) later(k * .14, () => { const last = k === n - 1; FX.push({ type: 'qicloud', x: P.x, y: P.y, ang: face, r: 250 * big, t: 0, life: .5, col, flip: k % 2 });
        meleeHit(250 * big, 1.7, dmg, Object.assign({}, oo, { kb: last ? 400 : -150, multi: k > 0, harvest: false })); if (last) doShake(6); sfx('swing'); }); }
    else if (a0 === '寒') { // 寒冰指：連點冰指，打中已凍住的敵人會碎冰爆傷
      const n = ultra ? 5 : 3; for (let k = 0; k < n; k++) later(k * .09, () => { const a = face + (k - (n - 1) / 2) * .06; shoot(P.x + cx * 20, P.y + cy * 20, a, 1150, dmg * .6, Object.assign({}, oo, { kind: 'qifinger', r: 10 * big, life: .6, freeze: 1.5,
        onHit: (e, wasFrozen) => { FX.push({ type: 'iceburst', x: e.x, y: e.y, t: 0, life: .45, s: wasFrozen ? 1.6 : 1 }); if (wasFrozen && !e.dead) { hurtEnemy(e, dmg * .8, Object.assign({}, oo, { kb: 120, ang: a })); fxText(e.x, e.y - 50, '碎冰', '#6fb6d8', 15); } } }));
        FX.push({ type: 'ring', x: P.x + cx * 26, y: P.y + cy * 26 - 14, r0: 4, r1: 26, col: '#d9ecf7', t: 0, life: .2, w: 4 }); sfx('dart'); }); }
    else { // 蝕骨氣：緩行毒氣球，沿途持續侵蝕，最後炸成毒霧
      const n = ultra ? 3 : 1; for (let k = 0; k < n; k++) { const a = face + (k - (n - 1) / 2) * .5; FX.push({ type: 'qiorb', x: P.x + Math.cos(a) * 30, y: P.y + Math.sin(a) * 30, vx: Math.cos(a) * 230, vy: Math.sin(a) * 230, r: 26 * big, t: 0, life: 2.2, tick: 0, dmg, o: oo, col }); } }
  });
}
function qiOrbUpd(f, dt) {
  f.x += f.vx * dt; f.y += f.vy * dt; f.tick -= dt; if (inBlocker(f.x, f.y)) f.t = f.life;
  if (f.tick <= 0) { f.tick = .35; areaHit(f.x, f.y, f.r * 2.6, f.dmg * .45, Object.assign({}, f.o, { src: 'dot', kb: 10 })); for (const e of E) if (!e.dead && dist(e, f) < f.r * 2.6) { e.st.poison = Math.max(e.st.poison, 3); e.st.pdps = Math.max(e.st.pdps || 0, f.dmg * .15); } }
  if (f.t + dt >= f.life && !f.boom) { f.boom = 1; FX.push({ type: 'mist', x: f.x, y: f.y, r: 170, t: 0, life: 3.5, tick: 0, dmg: f.dmg * .35, o: Object.assign({}, f.o, { ls: .3 }) }); burst(f.x, f.y, '#3d5a2a', 18); ringFx(f.x, f.y, 10, 170, '#3d5a2a', .45, 12); doShake(5); }
}
function innerRelease(b, dmg, o) {
  for (const a of b.attrs) {
    const oo = Object.assign({}, o, { attr: a });
    if (a === '柔') { meleeHit(180, TAU, dmg, Object.assign(oo, { kb: 300 })); ringFx(P.x, P.y, 20, 180, ATTR.柔.col, .45, 10); }
    if (a === '剛') { meleeHit(200, TAU, dmg * 1.5, Object.assign(oo, { kb: 150 })); ringFx(P.x, P.y, 20, 200, GOLD, .45, 14); P.guard = 2; }
    if (a === '寒') { meleeHit(200, TAU, dmg, Object.assign(oo, { freeze: 0.8 })); ringFx(P.x, P.y, 20, 200, ATTR.寒.col, .5, 12); }
    if (a === '毒') { FX.push({ type: 'mist', x: P.x, y: P.y, r: 160, t: 0, life: 4, tick: 0, dmg: dmg * 0.35, o: Object.assign(oo, { ls: 0.5 }), follow: false }); }
  }
  if (b.tier === 3) { const k = { 柔: 'taixu', 剛: 'jinshen', 寒: 'bingpo', 毒: 'blood' }[b.attrs[0]]; P.buffT[k] = 10; closeupFx(b.n); }
}

/* ---------- 閃身（套用輕功） ---------- */
function qingBook() { return S.slots.qing ? getBook(S.slots.qing) : null; }
function dodge() {
  if (P.dead || PAUSED()) return; const q = qingBook();
  const maxC = q && q.attrs.includes('柔') ? 2 : 1;
  if (P.dodgeT > 0 || P.lock > 0) return;
  if (P.dodgeCd > 0 && P.charges <= 0) return;
  const cost = DODGE_MP; if (P.mp < cost) { if (!P.mpMsg) { toast('內力不足，無法位移'); P.mpMsg = 1.5; } return; } P.mp -= cost;
  if (P.dodgeCd <= 0) P.charges = maxC;
  P.charges--; if (P.charges <= 0) P.dodgeCd = dodgeCdMax() * (q && q.tier === 3 && q.attrs[0] === '柔' ? 0.3 : 1);
  const mv = moveVec(); let a = P.face; if (mv.x || mv.y) a = Math.atan2(mv.y, mv.x);
  const sp = 560 * (q && q.water ? 1.3 : 1);
  P.dodgeT = .18; P.dvx = Math.cos(a) * sp; P.dvy = Math.sin(a) * sp; P.face = a; P.dodgeHits = new Set();
  FX.push({ type: 'ghost', x: P.x, y: P.y, face: a, t: 0, life: .35 }, { type: 'spr', id: 'fx_smear', x: P.x - Math.cos(a) * 30, y: P.y - 34 - Math.sin(a) * 20, ang: a, s: 110, t: 0, life: .28, al: .45 }); sfx('dodge');
  if (q && q.tier === 3 && q.attrs[0] === '寒') P.invis = 3;
  if (q && q.tier === 3 && q.attrs[0] === '毒') FX.push({ type: 'decoy', x: P.x, y: P.y, t: 0, life: 3 });
  if (setN('zhuying') >= 6) P.critNext = true;
}
function dodgeEffects() {
  const q = qingBook(); if (!q) return;
  for (const e of E) { if (e.dead || P.dodgeHits.has(e) || dist(e, P) > e.r + 22) continue; P.dodgeHits.add(e);
    if (e.st.slow > 0 && q) { P.dodgeCd = 0; P.charges = Math.max(P.charges, 1); fxText(P.x, P.y - 40, '無影', ATTR.寒.col, 15); }
    if (q.attrs.includes('剛')) hurtEnemy(e, wDmg(S.main) * 1.5 * (q.tier === 3 ? 3 : 1), { attr: '剛', kb: 260, ang: Math.atan2(e.y - P.y, e.x - P.x), src: 'skill' });
    if (q.attrs.includes('毒')) hurtEnemy(e, wDmg(S.main) * 0.5, { attr: '毒', src: 'skill', ang: 0 }); }
  if (q.attrs.includes('寒') && Math.random() < .6) FX.push({ type: 'icetrail', x: P.x, y: P.y, t: 0, life: 3 });
}
function swapWeapon() {
  if (P.dead || P.cd.swap > 0 || P.dodgeT > 0) return; const t = S.main; S.main = S.sub; S.sub = t; P.cd.swap = 1.2; toast(`換上${WEAPONS[S.main].name}`);
  aim(200); P.iframe = Math.max(P.iframe, .2); const a = P.face; P.x += Math.cos(a) * 60; P.y += Math.sin(a) * 60; collide(P, 16, true);
  meleeHit(110, 1.6, wDmg(S.main) * 1.5, { kb: 160, wid: S.main, heavy: true }); arcFx(P.x, P.y, a, 1.6, 110, GOLD, 10, .2); sfx('swing');
}
function ultimate() {
  if (P.dead || P.dodgeT > 0 || PAUSED()) return; const k = S.karma;
  if (k > -30 && k < 30) { toast('善惡未明，尚未領悟絕學（善惡值需 ≥ +30 或 ≤ −30）'); return; }
  if (P.mp < maxMp() * .99) { toast('內力未滿，無法施展絕學'); return; }
  P.mp = 0; const base = wDmg(S.main) + 20 * (1 + .08 * S.mer.chong);
  if (k >= 30) { meleeHit(330, TAU, base * 7, { kb: 260, src: 'skill', heavy: true }); P.hp = Math.min(maxHp(), P.hp + maxHp() * .35); ringFx(P.x, P.y, 20, 340, GOLD, .8, 18); closeupFx('浩然正氣'); FX.push({ type: 'spr', id: 'fx_burst', x: P.x, y: P.y - 20, s: 520, t: 0, life: .7 }); }
  else { const d = meleeHit(300, TAU, base * 9, { kb: 200, src: 'skill', heavy: true }); P.hp = Math.min(maxHp(), P.hp + Math.min(maxHp() * .5, d * .15)); ringFx(P.x, P.y, 20, 310, CIN, .8, 20); closeupFx('血煞魔功'); FX.push({ type: 'spr', id: 'fx_burst', x: P.x, y: P.y - 20, s: 520, t: 0, life: .7, col: CIN }); }
  doShake(14); sfx('ult');
}
function closeupFx(text) { closeup = { text, t: 0, life: 1.0 }; sfx('ult'); }
function potion() {
  if (P.dead || P.cd.pot > 0) return;
  if (S.potions <= 0) { toast('金創藥用完了，回藥廬煉製'); return; }
  if (P.hp >= maxHp()) { toast('氣血已滿'); return; }
  S.potions--; P.cd.pot = 1; const h = Math.round(maxHp() * potHealPct()); P.hp = Math.min(maxHp(), P.hp + h); fxText(P.x, P.y - 40, `+${h}`, JADE, 18); ringFx(P.x, P.y, 10, 60, JADE, .4, 5); sfx('heal');
}
function zouhuo(sec, why) { S.zouhuo = Math.max(S.zouhuo, sec); S.stats.zouhuo++; toast(`走火入魔！（${why}）內力上限減半、氣血持續流失`, 'red'); closeupFx('走火入魔'); }
function poisonPlayer(sec, dps) { P.poison = Math.max(P.poison || 0, sec); P.pdps = Math.max(P.pdps || 0, dps * (1 - resist()) * (1 - poisonRes())); }
function hurtPlayer(dmg, sx, sy, src) {
  if (P.iframe > 0 || P.dead) return; if (P.invis > 0) return;
  if (Math.random() < dodgeRate()) { fxText(P.x, P.y - 44, '閃避', ATTR.柔.col, 15); P.iframe = .15; S.stats.evade = (S.stats.evade || 0) + 1; return; }
  if (QIXU()) dmg *= 1.3;
  if (src && src.named === 'judge') dmg *= 1 + Math.max(0, -S.karma) / 100 + Math.min(.5, S.stats.kills / 4000);
  if (src && src.named === 'guishouqi' && S.res.silver > 0) { const t = Math.min(S.res.silver, Math.max(5, Math.round(S.res.silver * .04))); S.res.silver -= t; fxText(P.x, P.y - 58, `被偷 ${t} 兩`, '#8a6a20', 14); }
  if (src && src.def && src.def.region === 'snow' && setN('hanjiang') >= 2) dmg *= .8;
  if (src && src.def && src.def.drain) src.hp = Math.min(src.maxHp, src.hp + dmg * src.def.drain * (curWeather() === '血雨' ? 2 : 1));
  dmg *= (1 - damageReduce()) * (P.guard > 0 ? 0.5 : 1) * (P.buffT.jinshen > 0 ? 0.5 : 1) * (isNight() ? 1.2 : 1);
  dmg = Math.max(1, Math.round(dmg * rnd(.9, 1.1)));
  P.hp -= dmg; P.iframe = .4; P.hurt = .2; doShake(8); fxText(P.x, P.y - 36, `-${dmg}`, '#5a1416', 18); sfx('hurt');
  P.comboHits = 0; P.comboT = 0;
  if (sx !== undefined) { const a = Math.atan2(P.y - sy, P.x - sx); P.x += Math.cos(a) * 14; P.y += Math.sin(a) * 14; collide(P, 16, true); }
  if (P.hp <= 0) playerDown();
}

/* ---------- 怪物 ---------- */
function spawnEnemy(type, x, y, camp, opt) {
  opt = opt || {}; const d = ENEMIES[type];
  const e = { type, def: d, x, y, hp: d.hp, maxHp: d.hp, dmg: d.dmg, spd: d.spd, r: d.r, face: 0, kx: 0, ky: 0, state: 'idle', t: 0, atkCd: rnd(.5, 1.5), flash: 0, camp, st: { slow: 0, freeze: 0, poison: 0, pdps: 0 }, dead: false, anim: Math.random() * 10, strafe: Math.random() < .5 ? 1 : -1, aggro: false, homeX: x, homeY: y, chase: 0, kbT: 0, scale: 1 };
  const eliteChance = (isNight() ? 0.08 : 0.04);
  if (opt.elite || (opt.elite !== false && !d.minion && Math.random() < eliteChance)) { e.elite = true; e.affix = [pick(Object.keys(AFFIXES))]; if (Math.random() < .3) { const a2 = pick(Object.keys(AFFIXES)); if (!e.affix.includes(a2)) e.affix.push(a2); } e.hp = e.maxHp = d.hp * 5; e.dmg = d.dmg * 1.5; e.scale = 1.25; e.r = d.r * 1.25; if (e.affix.includes('疾行')) e.spd *= 1.5; }
  if (opt.named) { const n = NAMED[opt.named]; e.named = opt.named; e.hp = e.maxHp = n.hp; e.dmg = n.dmg; e.r = n.r; e.scale = n.r / d.r; e.affix = ['鐵壁']; e.elite = true; }
  E.push(e); return e;
}
function killEnemy(e) {
  e.dead = true; S.stats.kills++; if (S.slots.inner && S.books[S.slots.inner]) gainArt(S.slots.inner, e.boss ? 10 : e.elite || e.named ? 3 : 1); if (e.elite && !e.boss) S.stats.elites = (S.stats.elites || 0) + 1; S.codex.mon[e.type] = (S.codex.mon[e.type] || 0) + 1; questKill(e);
  if (e.boss) { bossDown(e); return; }
  const d = e.def, dropM = (isNight() ? 1.3 : 1) * (1 + titleBonus('drop')) * (e.elite ? 2 : 1);
  gainRes('xiu', Math.round(d.xiu * (e.elite ? 4 : 1))); const s = Math.round(rint(d.silver[0], d.silver[1]) * dropM); if (s) gainRes('silver', s, e.x, e.y - 20);
  for (const k in d.drops) if (Math.random() < d.drops[k] * dropM) gainRes(k, 1, e.x, e.y - 36);
  if (Math.random() < 0.05 * dropM) gainRes('page', 1, e.x, e.y - 48);
  if (Math.random() < (e.elite ? 0.5 : 0.04) * dropM) dropGear(e);
  if (e.named) { S.namedDead[e.named] = Date.now(); const u = NAMED[e.named].drop; if (!S.codex.gear[u]) { addItem(makeItem(UNIQUE_GEAR[u].slot, 1, { unique: u })); S.codex.gear[u] = 1; toast(`首殺掉落：${UNIQUE_GEAR[u].n}`, 'red'); } gainRes('page', 3); questNamed(e.named); }
  burst(e.x, e.y, INK, 14); FX.push({ type: 'splat', x: e.x, y: e.y, r: e.r * 1.6 * e.scale, t: 0, life: 3, seed: Math.random() });
  if (e.tag) checkWave(e.tag);
  if (e.lastHit) jincanJump(e, e.lastHit);
}
function dropGear(e) {
  const reg = regionAt(e.x, e.y); const slot = pick(['robe', 'hat', 'boots', 'belt', 'acc']); const tier = (reg === 'cult' ? (Math.random() < .25 ? 3 : 2) : reg === 'sand' || reg === 'snow' ? (Math.random() < .35 ? 2 : 1) : (Math.random() < .1 ? 2 : 1));
  const set = Math.random() < .15 ? (REGION_SET[reg] || null) : null;
  const it = makeItem(slot, tier, { set }); if (addItem(it)) fxText(e.x, e.y - 60, it.name, TIER_COL[it.tier - 1], 14);
}
function updEnemy(e, dt) {
  if (e.boss) return updBoss(e, dt);
  if (e.def.ambush && !e.surfaced) { ambushTick(e); if (!e.surfaced) return; }
  const d = e.def; e.flash -= dt; e.anim += dt; e.atkCd -= dt; e.kbT -= dt;
  for (const k of ['slow', 'freeze']) e.st[k] = Math.max(0, e.st[k] - dt);
  if (e.st.poison > 0) { e.st.poison -= dt; e.ptick = (e.ptick || 0) - dt; if (e.ptick <= 0) { e.ptick = .5; hurtEnemy(e, e.st.pdps * .5, { attr: '毒', src: 'dot' }); if (e.dead) return; } }
  e.x += e.kx * dt; e.y += e.ky * dt; const f = Math.pow(.004, dt); e.kx *= f; e.ky *= f;
  if (e.kbT > 0) for (const o of E) if (o !== e && !o.dead && dist(o, e) < o.r + e.r) { o.chase = 1; e.chase = 1; }
  collide(e, e.r, false);
  if (e.st.freeze > 0) return;
  const sp = e.spd * (e.st.slow > 0 ? .5 : 1);
  const camp = e.camp && CAMPS[e.camp];
  const target = (P.invis > 0 || P.dead) ? null : (FX.find(x => x.type === 'decoy') || P);
  const dx = target ? target.x - e.x : 0, dy = target ? target.y - e.y : 0, dd = Math.hypot(dx, dy) || 1;
  if (camp && e.state !== 'return' && Math.hypot(e.x - camp.x, e.y - camp.y) > camp.r + 420) { e.state = 'return'; e.aggro = false; }
  if (e.state === 'return') { const hx = camp.x - e.x, hy = camp.y - e.y, hd = Math.hypot(hx, hy) || 1; e.x += hx / hd * sp * 1.3 * dt; e.y += hy / hd * sp * 1.3 * dt; e.hp = Math.min(e.maxHp, e.hp + e.maxHp * .5 * dt); if (hd < camp.r * .5) e.state = 'idle'; return; }
  if (!e.aggro && target && dd < 380 && los(e.x, e.y, target.x, target.y)) e.aggro = true;
  if (!e.aggro || !target) { e.t -= dt; if (e.t <= 0) { e.t = rnd(1.5, 3.5); e.wx = (camp ? camp.x : e.homeX) + rnd(-150, 150); e.wy = (camp ? camp.y : e.homeY) + rnd(-150, 150); } if (e.wx !== undefined && d.ai !== 'summon') { const wx = e.wx - e.x, wy = e.wy - e.y, wd = Math.hypot(wx, wy); if (wd > 10) { e.x += wx / wd * sp * .35 * dt; e.y += wy / wd * sp * .35 * dt; e.face = Math.atan2(wy, wx); } } return; }
  const atkMul = e.affix && e.affix.includes('狂暴') ? .67 : 1;
  if (e.state === 'wind') { e.t -= dt; if (e.t <= 0) {
      if (d.ai === 'ranged') { const a0 = Math.atan2(dy, dx), n = d.volley || 1, life = curWeather() === '沙暴' ? 2.1 : 3; for (let k = 0; k < n; k++) shootE(e.x, e.y, a0 + (k - (n - 1) / 2) * .22, 300, e.dmg * (n > 1 ? .7 : 1), { kind: d.shot === 'ice' ? 'icicle' : d.shot === 'blood' ? 'blood' : d.shot === 'poison' ? 'spit' : d.weapon === 'bow' ? 'arrow' : 'blow', poison: e.type === 'blowgun' || d.shot === 'poison', slow: d.shot === 'ice' ? 1.5 : 0, life, src: e }); e.state = 'move'; e.atkCd = rnd(1.6, 2.2) * atkMul; }
      else if (e.dashing) { e.state = 'dash'; e.t = .28; e.hitDone = false; }
      else if (d.ai === 'bomb') { if (dist(e, P) < 95) { hurtPlayer(e.dmg, e.x, e.y, e); if (d.freezeBomb) { P.slowT = Math.max(P.slowT || 0, 2.5); fxText(P.x, P.y - 50, '凍住', '#6f9fbf', 15); } }
        ringFx(e.x, e.y, 10, 95, d.freezeBomb ? '#d9ecf7' : CIN, .35, 12); burst(e.x, e.y, d.freezeBomb ? '#d9ecf7' : CIN, 20);
        if (d.burn || d.bloodPool || d.poisonBomb) FX.push({ type: 'hazard', kind: d.burn ? 'fire' : d.poisonBomb ? 'poison' : 'blood', x: e.x, y: e.y, r: 70, t: 0, life: 4, tick: 0, dmg: e.dmg * .18 }); e.hp = 0; killEnemy(e); }
      else if (d.ai === 'spike') { if (Math.hypot(P.x - e.sx, P.y - e.sy) < 70) { hurtPlayer(e.dmg, e.sx, e.sy, e); if (d.spikeKind === 'ice') P.slowT = Math.max(P.slowT || 0, 1.5); } FX.push({ type: 'spike', x: e.sx, y: e.sy, t: 0, life: .5, ice: d.spikeKind === 'ice' }); e.state = 'move'; e.atkCd = rnd(2, 3) * atkMul; }
      else if (d.ai === 'slam' || e.named === 'oldbear') { const R = e.named ? 120 : 95; if (dist(P, e) < R + 14) hurtPlayer(e.dmg, e.x, e.y, e); ringFx(e.x, e.y, 10, R, '#8a8278', .35, 14); doShake(5); e.state = 'move'; e.atkCd = rnd(1.6, 2.2) * atkMul; }
      else { const reach = d.sweep ? e.r + 85 : e.r + 46; if (dd < reach) { hurtPlayer(e.dmg, e.x, e.y, e); if (d.poison) poisonPlayer(3, e.dmg * .2); } arcFx(e.x, e.y, e.face, d.sweep ? 2.6 : 1.6, reach - 16, '#5a1416', d.sweep ? 8 : 5, .16);
        if (d.combo && !e.combo2) { e.combo2 = true; e.state = 'wind'; e.t = .2; return; } e.combo2 = false; e.state = 'move'; e.atkCd = rnd(1, 1.5) * atkMul * (d.sweep ? 1.3 : 1); }
    } return; }
  if (e.state === 'dash') { e.t -= dt; e.x += Math.cos(e.face) * 430 * dt; e.y += Math.sin(e.face) * 430 * dt; if (!e.hitDone && dist(e, P) < e.r + 18) { e.hitDone = true; hurtPlayer(e.dmg * 1.2, e.x, e.y, e); }
    if (e.t <= 0) { if (d.multiDash && !e.dash2) { e.dash2 = true; e.state = 'wind'; e.t = .3; e.dashing = true; e.face = Math.atan2(P.y - e.y, P.x - e.x); return; } e.dash2 = false; e.state = 'move'; e.atkCd = rnd(1.4, 2) * atkMul; e.dashing = false; } return; }
  if (e.named) { namedSpecial(e, dt, dx, dy, dd); namedSpecial2(e, dt, dx, dy, dd); }
  e.face = Math.atan2(dy, dx);
  if (d.ai === 'summon') { if (e.atkCd <= 0) { e.atkCd = 4; const n = E.filter(o => o.parent === e && !o.dead).length; if (n < 4) { const m = spawnEnemy(d.summon, e.x + rnd(-30, 30), e.y + rnd(-30, 30), e.camp, { elite: false }); m.parent = e; m.aggro = true; } } return; }
  let mx = 0, my = 0;
  if (d.ai === 'ranged') { if (dd > 300) { mx = dx / dd; my = dy / dd; } else if (dd < 200) { mx = -dx / dd; my = -dy / dd; } mx += -dy / dd * .6 * e.strafe; my += dx / dd * .6 * e.strafe; if (e.atkCd <= 0 && dd < 520) { e.state = 'wind'; e.t = .4; } }
  else if (d.ai === 'slam') { mx = dx / dd; my = dy / dd; if (e.atkCd <= 0 && dd < e.r + 60) { e.state = 'wind'; e.t = .7; } }
  else if (d.ai === 'spike') { if (dd > 260) { mx = dx / dd; my = dy / dd; } if (e.atkCd <= 0 && dd < 420) { e.state = 'wind'; e.t = .8; e.sx = P.x; e.sy = P.y; } }
  else if (d.ai === 'bomb') { mx = dx / dd; my = dy / dd; if (dd < 70) { e.state = 'wind'; e.t = .5; } }
  else { mx = dx / dd; my = dy / dd;
    if (d.ai === 'dash' && e.atkCd <= 0 && dd > 110 && dd < 260 && Math.random() < .04) { e.state = 'wind'; e.t = .45; e.dashing = true; }
    else if (e.atkCd <= 0 && dd < (d.sweep ? e.r + 70 : e.r + 30)) { e.state = 'wind'; e.t = d.sweep ? .5 : .38; e.dashing = false; } }
  const l = Math.hypot(mx, my) || 1; e.x += mx / l * sp * dt; e.y += my / l * sp * dt;
}
// 具名精英的特殊招式
function namedSpecial(e, dt, dx, dy, dd) {
  const sp = NAMED[e.named].special; e.spT = (e.spT || 0) - dt;
  if (sp === 'circle' && e.state === 'move' && dd < 320 && dd > 100) { const a = Math.atan2(-dy, -dx) + dt * 2.2; e.x = P.x + Math.cos(a) * dd; e.y = P.y + Math.sin(a) * dd; }
  if (sp === 'icewall' && e.spT <= 0 && dd < 420) { e.spT = 6; for (let k = 0; k < 5; k++) { const a = Math.atan2(dy, dx) + Math.PI / 2, off = (k - 2) * 46; const x = P.x - dx / dd * 60 + Math.cos(a) * off, y = P.y - dy / dd * 60 + Math.sin(a) * off; FX.push({ type: 'hazard', kind: 'ice', x, y, r: 26, t: 0, life: 3.5, tick: 0, dmg: e.dmg * .25 }); } toast('寒無衣：「冰牆！」'); }
  if (sp === 'heal' && e.spT <= 0) { e.spT = 3; let n = 0; for (const o of E) if (!o.dead && o !== e && !o.boss && dist(o, e) < 320 && o.hp < o.maxHp) { o.hp = Math.min(o.maxHp, o.hp + o.maxHp * .15); n++; burst(o.x, o.y - 20, CIN, 4); } if (n) ringFx(e.x, e.y, 10, 320, CIN, .5, 4); }
  if (sp === 'judge' && e.spT <= 0 && dd < 300) { e.spT = 8; fxText(e.x, e.y - 70, S.karma < 0 ? '罪加一等' : '查無罪狀', CIN, 16); }
}
function separate() { for (let i = 0; i < E.length; i++) { const a = E[i]; if (a.dead) continue; for (let j = i + 1; j < E.length; j++) { const b = E[j]; if (b.dead) continue; const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), m = a.r + b.r; if (d > 0 && d < m) { const p = (m - d) / 2, ux = dx / d, uy = dy / d; if (!a.boss && a.def.spd) { a.x -= ux * p; a.y -= uy * p; } if (!b.boss && b.def.spd) { b.x += ux * p; b.y += uy * p; } } } } }

/* ---------- 據點刷怪 ---------- */
function campLogic(dt) {
  const active = E.filter(e => !e.dead && !e.boss).length;
  for (const id in CAMPS) {
    const c = CAMPS[id]; const st = S.camps[id] || (S.camps[id] = { cleared: 0, spawned: false });
    const near = Math.hypot(P.x - c.x, P.y - c.y) < 950;
    const alive = E.filter(e => e.camp === id && !e.dead && !e.parent);
    if (near && !st.spawned && !BOSSFIGHT && Date.now() - st.cleared > 180000 && active < 15) {
      st.spawned = true; st.tagged = true;
      for (let i = 0; i < c.n; i++) { const a = rnd(0, TAU), r = rnd(0, c.r * .7); const e = spawnEnemy(pick(c.types), c.x + Math.cos(a) * r, c.y + Math.sin(a) * r, id, c.elite ? { elite: true } : {}); }
      if (c.named && (!S.namedDead[c.named] || Date.now() - S.namedDead[c.named] > 600000)) spawnEnemy(NAMED[c.named].base, c.x, c.y, id, { named: c.named });
    }
    if (st.spawned && alive.length === 0 && E.every(e => e.camp !== id || e.dead)) { if (st.tagged) { st.cleared = Date.now(); st.spawned = false; st.tagged = false; questClear(id); } }
    if (!near && st.spawned && Math.hypot(P.x - c.x, P.y - c.y) > 1600) { E = E.filter(e => e.camp !== id || e.boss); st.spawned = false; }
  }
}

/* ---------- 頭目（通用三階段） ---------- */
let BOSSFIGHT = null; const STALKS = BAMBOO_STALKS.map(([x, y]) => ({ x, y, up: true, hp: 3, re: 0, fall: 0, ang: 0 }));
function hitStalk(s) { s.hp--; burst(s.x, s.y, '#2f4a37', 5); if (s.hp <= 0) { s.up = false; s.re = 25; s.fall = 1; s.ang = Math.atan2(s.y - P.y, s.x - P.x); later(1, () => { const ex = s.x + Math.cos(s.ang) * 230, ey = s.y + Math.sin(s.ang) * 230; FX.push({ type: 'fallen', x: s.x, y: s.y, ang: s.ang, t: 0, life: 4 }); doShake(8); for (const e of E) { if (e.dead) continue; const t = clamp(((e.x - s.x) * (ex - s.x) + (e.y - s.y) * (ey - s.y)) / (230 * 230), 0, 1); if (Math.hypot(s.x + (ex - s.x) * t - e.x, s.y + (ey - s.y) * t - e.y) < 30 + e.r) { if (e.boss) { e.stun = 3; fxText(e.x, e.y - 60, '壓制！', GOLD, 22); } hurtEnemy(e, 200, { attr: '剛', src: 'skill', ang: s.ang }); } } }); } }
// 可打破的場地物件（血池）
function hitProp(pr, dmg) { if (pr.hp <= 0) return; pr.hp -= Math.max(1, dmg || 1); pr.flash = .12; burst(pr.x, pr.y - 10, CIN, 5); fxText(pr.x, pr.y - 50, '血池', CIN, 13);
  if (pr.hp <= 0) { burst(pr.x, pr.y, CIN, 30); doShake(10); toast('打破一座血池', 'red'); sfx('crit'); const F = BOSSFIGHT; if (F && F.props.every(p => p.hp <= 0) && F.boss.ghost) { F.boss.ghost = false; F.boss.act = null; F.boss.stun = 3.5; F.boss.x = F.cx; F.boss.y = F.cy; fxText(F.cx, F.cy - 80, '現形！', GOLD, 26); closeupFx('血池盡破'); } } }
function propsHitArea(x, y, r, dmg) { if (!BOSSFIGHT) return; for (const pr of BOSSFIGHT.props) if (pr.hp > 0 && Math.hypot(pr.x - x, pr.y - y) < r + pr.r) hitProp(pr, dmg); }
function startBoss(bid, practice) {
  if (typeof bid === 'boolean' || bid === undefined) { practice = !!bid; bid = 'liu'; }
  const d = BOSS[bid], A = ARENAS[bid], ap = PLACES[A.place];
  const b = { boss: true, bid, type: bid, def: { n: d.n, res: d.res || {}, robe: d.robe }, x: ap.x, y: ap.y - 120, hp: d.hp, maxHp: d.hp, dmg: d.dmg, spd: d.spd, r: d.r, face: Math.PI / 2, kx: 0, ky: 0, st: { slow: 0, freeze: 0, poison: 0, pdps: 0 }, flash: 0, cd: 2, act: null, phase: 1, dead: false, anim: 0, scale: d.r / 15, stun: 0, practice };
  let cx = ap.x, cy = ap.y, r = A.r;
  if (practice) { cx = PLACES.train.x; cy = PLACES.train.y - 60; r = 420; b.x = cx + 160; b.y = cy - 60; b.hp = b.maxHp = Math.round(d.hp * .5); }
  E = E.filter(e => e.boss || e.tag || Math.hypot(e.x - cx, e.y - cy) > r + 520);
  E.push(b); BOSSFIGHT = { boss: b, bid, practice, cx, cy, r, props: [], pillars: [], holes: [], tether: null };
  if (A.pillars) BOSSFIGHT.pillars = A.pillars.map(([dx, dy]) => ({ x: cx + dx, y: cy + dy, r: 28 }));
  if (A.pools) BOSSFIGHT.props = A.pools.map(([dx, dy]) => ({ x: cx + dx, y: cy + dy, r: 34, hp: 900, max: 900, kind: 'pool', flash: 0 }));
  banner(practice ? `演武・${d.short}` : d.n, practice ? '頭目木人（死亡不刪檔）' : '頭目'); music('boss');
}
function bossLine(b, k) { const L = BOSS_LINES[b.bid]; return L && L[k]; }
function updBoss(b, dt) {
  b.flash -= dt; b.anim += dt; b.stun = Math.max(0, (b.stun || 0) - dt);
  for (const k of ['slow']) b.st[k] = Math.max(0, b.st[k] - dt);
  if (b.st.poison > 0) { b.st.poison -= dt; b.ptick = (b.ptick || 0) - dt; if (b.ptick <= 0) { b.ptick = .5; hurtEnemy(b, b.st.pdps * .5, { attr: '毒', src: 'dot' }); if (b.dead) return; } }
  const F = BOSSFIGHT; if (!F) return;
  if (Math.hypot(P.x - F.cx, P.y - F.cy) > F.r + 300 || P.dead) { endBossFight(false); return; }
  arenaMechanics(b, F, dt);
  const pr = b.hp / b.maxHp;
  if (b.phase === 1 && pr < .7) { b.phase = 2; say({ who: b.bid, t: bossLine(b, 'p2') }, null, true); ringFx(b.x, b.y, 20, 200, attrCol(null), .6, 12); }
  if (b.phase === 2 && pr < .3) { b.phase = 3; closeupFx(BOSS[b.bid].ult); b.act = null; startUlt(b); }
  if (b.stun > 0) return;
  if (b.act) { runBossAct(b, dt); return; }
  const dx = P.x - b.x, dy = P.y - b.y, dd = Math.hypot(dx, dy) || 1; b.face = Math.atan2(dy, dx);
  const sp = b.spd * (b.st.slow > 0 ? .6 : 1);
  if (dd > 110) { b.x += dx / dd * sp * dt; b.y += dy / dd * sp * dt; }
  b.x = clamp(b.x, F.cx - F.r, F.cx + F.r); b.y = clamp(b.y, F.cy - F.r, F.cy + F.r);
  b.cd -= dt * (b.phase === 1 ? 1 : b.phase === 2 ? 1.3 : 1.6);
  if (b.cd <= 0) { startBossAct(b, pick(BOSS_ACTS[b.bid][Math.min(3, b.phase) - 1])); b.cd = rnd(1.3, 2); }
  else if (dd < b.r + 60 && (b.swing = (b.swing || 0) - dt) <= 0) { startBossAct(b, 'swipe'); b.swing = 1.6; }
}
const BOSS_ACTS = {
  liu: [['dash', 'fan', 'dash'], ['clones', 'fan', 'dash', 'clones'], ['clones', 'fan', 'dash', 'clones']],
  tieba: [['charge', 'spin', 'charge'], ['leap', 'spin', 'charge', 'leap'], ['leap', 'charge', 'spin', 'cross']],
  gusou: [['needles', 'cracks', 'needles'], ['wolves', 'hail', 'cracks', 'needles'], ['hail', 'cracks', 'needles', 'wolves']],
  li: [['palms', 'dash', 'palms'], ['palms', 'bloodrain', 'dash', 'drink'], ['palms', 'bloodrain']],
};
function startUlt(b) {
  if (b.bid === 'liu') b.act = { type: 'thousand', t: 0, wave: 0 };
  if (b.bid === 'tieba') { b.act = { type: 'cross', t: 0, phase: 'tele', tele: 1.1, n: 2, rot: 0 }; }
  if (b.bid === 'gusou') { const F = BOSSFIGHT; if (!F.holes.length) F.holes.push({ x: F.cx + rnd(-150, 150), y: F.cy + rnd(-150, 150), r: 70, t: 12 }); const h = F.holes.reduce((a, c) => dist(c, P) < dist(a, P) ? c : a); h.t = Math.max(h.t, 9); F.tether = { hole: h, t: 0, life: 6 }; b.act = { type: 'reel', t: 0 }; toast('釣線纏住了你！往反方向閃身掙脫！', 'red'); }
  if (b.bid === 'li') { const F = BOSSFIGHT; if (F.props.some(p => p.hp > 0)) { b.ghost = true; b.act = { type: 'mist', t: 0 }; toast('厲千秋化成血霧──打破剩下的血池，逼他現形！', 'red'); } else b.act = { type: 'bloodrain', phase: 'tele', t: 0, tele: .9 }; }
}
function startBossAct(b, type) {
  const a = { type, t: 0, phase: 'tele' }, F = BOSSFIGHT;
  if (type === 'dash' || type === 'charge') { a.tele = b.phase >= 2 ? .5 : .7; a.lines = [{ x: b.x, y: b.y, ang: Math.atan2(P.y - b.y, P.x - b.x), len: type === 'charge' ? 520 : 440 }]; a.go = type === 'charge' ? .4 : .28; }
  if (type === 'clones') { a.tele = .7; a.go = .3; const base = Math.atan2(P.y - b.y, P.x - b.x); a.lines = [-1, 0, 1].map(k => { const ox = b.x + Math.cos(base + Math.PI / 2) * k * 120, oy = b.y + Math.sin(base + Math.PI / 2) * k * 120; return { x: ox, y: oy, ang: Math.atan2(P.y - oy, P.x - ox), len: 460 }; }); }
  if (type === 'fan') { a.tele = .45; a.ang = Math.atan2(P.y - b.y, P.x - b.x); a.n = b.phase >= 2 ? 9 : 7; }
  if (type === 'swipe') { a.tele = .42; a.r = b.r + 70; }
  if (type === 'spin') { a.tele = .65; a.r = 165; }
  if (type === 'leap') { a.tele = .8; a.tx = P.x; a.ty = P.y; a.r = 130; a.sx = b.x; a.sy = b.y; }
  if (type === 'cross') { a.tele = 1.1; a.n = 1; a.rot = Math.random() < .5 ? 0 : Math.PI / 4; }
  if (type === 'needles') { a.tele = .5; a.n = b.phase >= 2 ? 20 : 14; }
  if (type === 'cracks') { a.tele = 1.0; a.marks = []; const n = b.phase >= 2 ? 4 : 3; for (let i = 0; i < n; i++) a.marks.push({ x: clamp(P.x + rnd(-170, 170), F.cx - F.r + 60, F.cx + F.r - 60), y: clamp(P.y + rnd(-170, 170), F.cy - F.r + 60, F.cy + F.r - 60), r: 70 }); a.marks[0].x = P.x; a.marks[0].y = P.y; }
  if (type === 'hail') { a.tele = .9; a.marks = []; for (let i = 0; i < 6; i++) a.marks.push({ x: P.x + rnd(-220, 220), y: P.y + rnd(-220, 220), r: 60 }); a.marks[0].x = P.x; a.marks[0].y = P.y; }
  if (type === 'wolves') { a.tele = .4; }
  if (type === 'palms') { a.tele = .45; a.vol = b.phase >= 2 ? 3 : 2; a.k = 0; }
  if (type === 'bloodrain') { a.tele = .9; a.marks = []; for (let i = 0; i < 8; i++) a.marks.push({ x: clamp(P.x + rnd(-260, 260), F.cx - F.r, F.cx + F.r), y: clamp(P.y + rnd(-260, 260), F.cy - F.r, F.cy + F.r), r: 62 }); a.marks[0].x = P.x; a.marks[0].y = P.y; }
  if (type === 'drink') { const pool = F.props.filter(p => p.hp > 0).sort((p, q) => dist(p, b) - dist(q, b))[0]; if (!pool) return startBossAct(b, 'palms'); a.tele = .3; a.pool = pool; a.go = 2.2; }
  b.act = a;
}
function runBossAct(b, dt) {
  const a = b.act, F = BOSSFIGHT; a.t += dt;
  if (a.type === 'thousand') { // 柳無痕絕招：全場竹影劃線，躲進空隙
    if (!a.lines || a.t >= a.next) {
      if (a.wave >= 3) { b.act = null; return; }
      if (a.lines && a.state === 'tele') { for (const l of a.lines) { if (lineHit(l, P, 26)) hurtPlayer(b.dmg * 1.6, b.x, b.y); FX.push({ type: 'slash', x1: l.x1, y1: l.y1, x2: l.x2, y2: l.y2, t: 0, life: .4, col: JADE }); } doShake(10); a.state = 'rest'; a.next = a.t + .5; a.wave++; return; }
      const vert = a.wave % 2 === 0; const gap = Math.floor(rnd(1, 6)); a.lines = [];
      for (let i = 0; i < 7; i++) { if (i === gap) continue; const off = -F.r + (i + .5) * (2 * F.r / 7); a.lines.push(vert ? { x1: F.cx + off, y1: F.cy - F.r - 40, x2: F.cx + off, y2: F.cy + F.r + 40 } : { x1: F.cx - F.r - 40, y1: F.cy + off, x2: F.cx + F.r + 40, y2: F.cy + off }); }
      a.state = 'tele'; a.next = a.t + 1.2; a.tele = 1.2; a.t0 = a.t;
    }
    return;
  }
  if (a.type === 'reel') { if (!F.tether) b.act = null; return; } // 孤叟收線：機制在 arenaMechanics
  if (a.type === 'mist') { // 厲千秋血霧：無敵追擊，血池全破才現形
    const dx = P.x - b.x, dy = P.y - b.y, dd = Math.hypot(dx, dy) || 1; b.x += dx / dd * 170 * dt; b.y += dy / dd * 170 * dt; b.face = Math.atan2(dy, dx);
    if (dd < b.r + 22 && (a.hitT = (a.hitT || 0) - dt) <= 0) { a.hitT = .8; hurtPlayer(b.dmg * .7, b.x, b.y); }
    if ((a.drip = (a.drip || 0) - dt) <= 0) { a.drip = 1.6; for (let k = 0; k < 6; k++) shootE(b.x, b.y, gameT + k * TAU / 6, 230, b.dmg * .45, { kind: 'blood', r: 9 }); }
    if (!b.ghost) b.act = null; return;
  }
  if (a.phase === 'tele') { if (a.t >= a.tele) { a.phase = 'go'; a.t = 0;
      if (a.type === 'fan') { for (let i = 0; i < a.n; i++) shootE(b.x, b.y, a.ang - .55 + 1.1 * i / (a.n - 1), 360, b.dmg * .6, { kind: 'needle', r: 6 }); b.act = null; sfx('dart'); }
      if (a.type === 'swipe') { if (dist(P, b) < a.r + 10) hurtPlayer(b.dmg * .8, b.x, b.y); arcFx(b.x, b.y, b.face, TAU * .95, a.r, INK, 9, .25); b.act = null; }
      if (a.type === 'clones') { a.clones = a.lines.map(l => ({ x: l.x, y: l.y, ang: l.ang, hit: false })); }
      if (a.type === 'spin') { if (dist(P, b) < a.r + 14) hurtPlayer(b.dmg * 1.1, b.x, b.y); for (let k = 0; k < 3; k++) later(k * .1, () => arcFx(b.x, b.y, gameT * 20, TAU * .9, a.r, '#6b4a2a', 16, .25)); FX.push({ type: 'spr', id: 'fx_whirl', x: b.x, y: b.y - 16, ang: 0, s: 380, t: 0, life: .4 }); doShake(6); b.act = null; sfx('heavy'); }
      if (a.type === 'needles') { for (let k = 0; k < a.n; k++) shootE(b.x, b.y, TAU * k / a.n + gameT, 300, b.dmg * .55, { kind: 'icicle', r: 8, slow: 1.2 }); b.act = null; sfx('dart'); }
      if (a.type === 'cracks') { for (const m of a.marks) { if (Math.hypot(P.x - m.x, P.y - m.y) < m.r) hurtPlayer(b.dmg * .9, m.x, m.y); F.holes.push({ x: m.x, y: m.y, r: m.r, t: 9 }); ringFx(m.x, m.y, 10, m.r, '#d9ecf7', .4, 10); } doShake(7); b.act = null; sfx('heavy'); }
      if (a.type === 'hail') { for (const m of a.marks) { if (Math.hypot(P.x - m.x, P.y - m.y) < m.r) hurtPlayer(b.dmg * .8, m.x, m.y); ringFx(m.x, m.y, 10, m.r, '#d9ecf7', .35, 8); burst(m.x, m.y, '#d9ecf7', 8); } doShake(5); b.act = null; }
      if (a.type === 'wolves') { for (let k = 0; k < (b.phase >= 3 ? 3 : 2); k++) { const w = spawnEnemy('snowwolf', b.x + rnd(-120, 120), b.y + rnd(-120, 120), null, { elite: false }); w.aggro = true; w.tag = 'bossadd'; } b.act = null; }
      if (a.type === 'bloodrain') { for (const m of a.marks) { if (Math.hypot(P.x - m.x, P.y - m.y) < m.r) hurtPlayer(b.dmg * .85, m.x, m.y); ringFx(m.x, m.y, 10, m.r, CIN, .35, 8); } doShake(5); b.act = null; }
      if (a.type === 'leap') { a.go = .35; }
      if (a.type === 'cross') { const L = F.r * 2.4; a.slashes = [a.rot, a.rot + Math.PI / 2].map(an => ({ x1: F.cx - Math.cos(an) * L / 2, y1: F.cy - Math.sin(an) * L / 2, x2: F.cx + Math.cos(an) * L / 2, y2: F.cy + Math.sin(an) * L / 2 })); for (const l of a.slashes) { if (lineHit(l, P, 60)) hurtPlayer(b.dmg * 1.5, b.x, b.y); FX.push({ type: 'slash', x1: l.x1, y1: l.y1, x2: l.x2, y2: l.y2, t: 0, life: .45, col: '#6b4a2a' }); } doShake(12); sfx('heavy');
        if (--a.n > 0 || (b.phase >= 3 && !a.second)) { a.second = true; a.n = 0; a.phase = 'tele'; a.t = 0; a.tele = .9; a.rot += Math.PI / 4; } else b.act = null; }
      if (a.type === 'palms') { const n = b.phase >= 2 ? 7 : 5, base = Math.atan2(P.y - b.y, P.x - b.x); for (let k = 0; k < n; k++) shootE(b.x, b.y, base - .6 + 1.2 * k / (n - 1), 300, b.dmg * .55, { kind: 'blood', r: 10 }); sfx('dart'); a.k++; if (a.k < a.vol) { a.phase = 'tele'; a.t = 0; a.tele = .35; } else b.act = null; }
      if (a.type === 'drink') { b.x = a.pool.x; b.y = a.pool.y - 40; ringFx(b.x, b.y, 10, 80, CIN, .5, 8); fxText(b.x, b.y - 70, '吸血池', CIN, 16); }
    } return; }
  if (a.type === 'dash' || a.type === 'charge') { const l = a.lines[0], sp = l.len / a.go; b.x += Math.cos(l.ang) * sp * dt; b.y += Math.sin(l.ang) * sp * dt; FX.push({ type: 'ghostB', x: b.x, y: b.y, t: 0, life: .25 }); if (!a.hit && dist(P, b) < b.r + 18) { a.hit = true; hurtPlayer(b.dmg * 1.3, b.x, b.y); }
    if (a.type === 'charge') for (const pl of F.pillars) if (Math.hypot(pl.x - b.x, pl.y - b.y) < pl.r + b.r) { b.act = null; b.stun = 3; doShake(12); burst(pl.x, pl.y, '#6b5a40', 20); fxText(b.x, b.y - 70, '撞柱！暈眩', GOLD, 22); sfx('heavy'); return; }
    if (a.t >= a.go) b.act = null; }
  if (a.type === 'clones') { for (const c of a.clones) { const sp = 460 / a.go; c.x += Math.cos(c.ang) * sp * dt; c.y += Math.sin(c.ang) * sp * dt; FX.push({ type: 'ghostB', x: c.x, y: c.y, t: 0, life: .2 }); if (!c.hit && dist(P, c) < b.r + 18) { c.hit = true; hurtPlayer(b.dmg * 1.1, c.x, c.y); } } const m = a.clones[1]; b.x = m.x; b.y = m.y; if (a.t >= a.go) b.act = null; }
  if (a.type === 'leap') { const k = clamp(a.t / a.go, 0, 1); b.x = a.sx + (a.tx - a.sx) * k; b.y = a.sy + (a.ty - a.sy) * k; b.hop = Math.sin(k * Math.PI) * 80; if (k >= 1) { b.hop = 0; if (Math.hypot(P.x - a.tx, P.y - a.ty) < a.r) hurtPlayer(b.dmg * 1.2, a.tx, a.ty); ringFx(a.tx, a.ty, 20, a.r, '#6b4a2a', .4, 16); doShake(10); sfx('heavy'); b.act = null; } }
  if (a.type === 'drink') { a.go -= dt; if (a.pool.hp > 0) { b.hp = Math.min(b.maxHp, b.hp + b.maxHp * .02 * dt); if (Math.random() < .3) burst(b.x, b.y - 20, CIN, 2); } if (a.go <= 0 || a.pool.hp <= 0) b.act = null; }
  if (BOSSFIGHT) { b.x = clamp(b.x, F.cx - F.r, F.cx + F.r); b.y = clamp(b.y, F.cy - F.r, F.cy + F.r); }
}
// 場地機關：流沙、石柱、冰洞、釣線、血池
function arenaMechanics(b, F, dt) {
  const q = qingBook();
  if (b.bid === 'tieba' && !F.practice) { const dx = F.cx - P.x, dy = F.cy - P.y, d = Math.hypot(dx, dy) || 1; if (d > 40 && P.dodgeT <= 0) { const pull = (b.phase === 1 ? 45 : b.phase === 2 ? 75 : 95) * (q && q.attrs.includes('剛') ? .3 : 1); P.x += dx / d * pull * dt; P.y += dy / d * pull * dt; } }
  for (const pl of F.pillars) for (const o of [P, b]) { const dx = o.x - pl.x, dy = o.y - pl.y, d = Math.hypot(dx, dy), m = pl.r + (o === P ? 16 : o.r * .7); if (d < m && d > 0.01) { o.x = pl.x + dx / d * m; o.y = pl.y + dy / d * m; } }
  for (const h of F.holes) h.t -= dt; F.holes = F.holes.filter(h => h.t > 0);
  if (F.holes.length && P.dodgeT <= 0) { const h = F.holes.find(h => Math.hypot(P.x - h.x, P.y - h.y) < h.r * .8); if (h && (F.holeT = (F.holeT || 0) - dt) <= 0) { F.holeT = .6; hurtPlayer(maxHp() * .07); P.slowT = Math.max(P.slowT || 0, 1.2); fxText(P.x, P.y - 50, '落冰', '#6f9fbf', 15); } }
  if (F.tether) { const T = F.tether, h = T.hole; T.t += dt; const dx = h.x - P.x, dy = h.y - P.y, d = Math.hypot(dx, dy) || 1;
    if (P.dodgeT > 0 && (dx * P.dvx + dy * P.dvy) < 0) { F.tether = null; toast('掙脫了釣線！', 'red'); fxText(P.x, P.y - 50, '掙脫', GOLD, 18); b.act = null; }
    else { P.x += dx / d * 140 * dt; P.y += dy / d * 140 * dt; if (d < 40) { hurtPlayer(b.dmg * 1.8, h.x, h.y); P.slowT = 2; F.tether = null; b.act = null; } else if (T.t > T.life) { F.tether = null; b.act = null; } } }
  for (const pr of F.props) { pr.flash = Math.max(0, (pr.flash || 0) - dt); if (pr.hp > 0 && b.phase >= 2 && !b.ghost) b.hp = Math.min(b.maxHp, b.hp + b.maxHp * .002 * dt); }
}
function lineHit(l, p, w) { const x1 = l.x1, y1 = l.y1, x2 = l.x2, y2 = l.y2; const L = (x2 - x1) ** 2 + (y2 - y1) ** 2; const t = clamp(((p.x - x1) * (x2 - x1) + (p.y - y1) * (y2 - y1)) / L, 0, 1); return Math.hypot(x1 + (x2 - x1) * t - p.x, y1 + (y2 - y1) * t - p.y) < w; }
function endBossFight(won) { if (!BOSSFIGHT) return; const b = BOSSFIGHT.boss; E = E.filter(e => e !== b && e.tag !== 'bossadd'); BOSSFIGHT = null; music(regionAt(P.x, P.y)); if (!won && !b.practice) toast(`${BOSS[b.bid].short}退回場地深處。再來時，會恢復如初。`); }
const BOSS_DROP = { liu: { gear: ['hat', 'liu_hat'], silver: 300, page: 6, xiu: 300 }, tieba: { gear: ['acc', 'tieba_wrist'], book: 'kuangsha_blade', silver: 600, page: 10, xiu: 800, meteor: 2 },
  gusou: { gear: ['robe', 'gusou_coat'], book: 'bingpo_needle', book2: 'taxue', silver: 600, page: 10, xiu: 800, frost: 2 }, li: { gear: ['acc', 'li_jade'], silver: 1500, page: 20, xiu: 2000, xuejing: 3 } };
function bossDown(b) {
  burst(b.x, b.y, CIN, 30); burst(b.x, b.y, INK, 30); doShake(16);
  const practice = b.practice, bid = b.bid; endBossFight(true);
  if (practice) { toast('演武結束'); return; }
  S.bossDead[bid] = true; const D = BOSS_DROP[bid]; for (const k of ['silver', 'page', 'xiu', 'meteor', 'frost', 'xuejing']) if (D[k]) gainRes(k, D[k]);
  addItem(makeItem(D.gear[0], 2, { unique: D.gear[1] })); S.codex.gear[D.gear[1]] = 1; if (D.book) learnBook(S, D.book); if (D.book2) learnBook(S, D.book2);
  const L = BOSS_LINES[bid];
  if (bid === 'li') { say(L.after, () => { questBoss('li'); saveGame(); }); return; }
  S.tokens++;
  const after = () => { toast(`取得血影令（${S.tokens}/3）`, 'red'); questBoss(bid); saveGame(); };
  const K = { liu: [15, 'lihua_needle'], tieba: [15, null], gusou: [10, null] }[bid];
  say(L.after.concat([{ who: 'choice', t: `${BOSS[bid].short}敗在你手下。你要如何處置？`, choices: [
    { label: `饒他一命（俠義 +${K[0]}）`, fn: () => { addKarma(K[0]); S[bid + 'Spared'] = true; if (K[1]) learnBook(S, K[1]); if (bid === 'tieba') { gainRes('page', 8); unlockDisciple('tiezhu'); } if (bid === 'gusou') gainRes('page', 8); say(L.spare, after); } },
    { label: `斬草除根（魔性 +${K[0]}）`, alt: true, fn: () => { addKarma(-K[0]); S[bid + 'Spared'] = false; gainRes('silver', bid === 'liu' ? 300 : 600); say(L.kill, after); } }] }]));
}
