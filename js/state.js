'use strict';
/* 一命江湖 1a — 存檔、角色數值、物品 */
let S = null;          // 存檔狀態
let SET = null;        // 設定（跨角色）
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const rnd = (a, b) => a + Math.random() * (b - a);
const rint = (a, b) => Math.floor(rnd(a, b + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const angDiff = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
function lsDel(k) { try { localStorage.removeItem(k); } catch (e) { } }

function defaultSettings() {
  return { quality: 'high', dmgNum: true, shake: true, bgm: 0.5, sfx: 0.7, font: 'm', autoSpeed: 0, arrow: true,
    layout: null, keys: { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', atk: 'KeyJ', dodge: 'KeyK', s1: 'KeyU', s2: 'KeyI', inner: 'KeyL', qi: 'KeyP', ult: 'KeyO', swap: 'KeyQ', pot: 'KeyH', act: 'KeyE', char: 'KeyC', home: 'KeyR', map: 'KeyM' } };
}
function loadSettings() { let s = defaultSettings(); try { const t = lsGet(SETTINGS_KEY); if (t) s = Object.assign(s, JSON.parse(t)); s.keys = Object.assign(defaultSettings().keys, s.keys || {}); } catch (e) { } SET = s; }
function saveSettings() { lsSet(SETTINGS_KEY, JSON.stringify(SET)); }

function newState(opt) {
  const res = {}; Object.keys(RES).forEach(k => res[k] = 0);
  const o = ORIGINS[opt.origin];
  const s = {
    v: 3, name: opt.name || '無名', gender: opt.gender, origin: opt.origin, hair: opt.hair || 0, hairCol: opt.hairCol || 0, clothCol: opt.clothCol || 0,
    res, potions: 3, pills: {}, buffs: {}, xuming: 1, karma: o.karma, rep: { village: 0, merchants: 0, righteous: 0, blood: 0, wudu: 0, fishers: 0 },
    mer: {}, wpn: {}, main: 'sword', sub: 'fist', books: {}, customBooks: {},
    slots: { sword: [null, null], blade: [null, null], fist: [null, null], dart: [null, null], inner: null, qi: null, qing: null },
    gear: { robe: null, hat: null, boots: null, belt: null, acc1: null, acc2: null }, bag: [], bagCap: 30,
    bld: { hall: 1, train: 0, smith: 0, lib: 0, herbal: 0, alchemy: 0, array: 0, vault: 0 }, vaultItems: [], trainW: 'sword',
    disciples: {}, pet: null, pets: [], dogFed: 0,
    node: 0, step: 0, tr: { village: { n: 0, s: 0 } }, focus: null, unlock: {}, events: {}, camps: {}, namedDead: {}, bossDead: {}, tokens: 0, cultOpen: false, secrets: {},
    chests: {}, rumors: {}, fog: '', stations: { village: true }, encounters: {}, innNights: 0,
    clock: 200, weather: { village: '晴', bamboo: '雨', sand: '晴', snow: '雪', cult: '血雨', t: 0 }, zouhuo: 0, nextFusionSafe: false, huqi: false,
    stats: { kills: 0, chests: 0, zouhuo: 0, bestCombo: 0, play: 0, elites: 0, storm: 0, combos: {} }, ach: {}, title: null, codex: { mon: {}, gear: {} },
    daily: { day: '', streak: 0, claimed: false, comm: [], commDone: [] }, comm: null, tutorial: false, introDone: false,
    gen: 1, prev: null, px: 4300, py: 3150 + OY, time: Date.now(), created: Date.now(), ended: null, seenLegacy: false,
  };
  MERIDIANS.forEach(m => s.mer[m.k] = 0);
  WORDER.forEach(w => s.wpn[w] = { tier: 1, lv: 1, xp: 0 });
  o.books.forEach(b => learnBook(s, b, true));
  if (opt.origin === 'mingmen') s.bld.train = 1;
  if (opt.origin === 'langzi') s.res.silver += 300;
  if (opt.origin === 'pantu') s.res.page += 10;
  s.res.silver += 60;
  const first = getBook(o.books[0], s);
  if (first && first.cat === 'weapon') { s.main = first.w; s.sub = first.w === 'sword' ? 'fist' : 'sword'; }
  // 傳承
  const leg = loadLegacy();
  if (leg) {
    s.gen = (leg.gen || 1) + 1; s.prev = { name: leg.name, where: leg.where, ended: leg.ended };
    Object.assign(s.customBooks, leg.customBooks || {});
    for (const id in leg.books || {}) s.books[id] = { lv: leg.books[id].lv, prog: 0 };
    (leg.items || []).forEach(it => { if (s.bag.length < Math.max(s.bagCap, leg.bagCap || 0)) s.bag.push(it); });
    for (const w in leg.wpn || {}) if (s.wpn[w]) s.wpn[w].tier = leg.wpn[w].tier;
    if (leg.bld) for (const k in leg.bld) if (s.bld[k] !== undefined) s.bld[k] = Math.max(s.bld[k], leg.bld[k]); // 蓋好的建築留給下一代
    if (leg.vaultItems) s.vaultItems = leg.vaultItems.slice(); if (leg.pills) s.pills = Object.assign({}, leg.pills); if (leg.potions) s.potions = Math.max(s.potions, leg.potions); if (leg.bagCap) s.bagCap = Math.max(s.bagCap, leg.bagCap);
    if (leg.pets) { s.pets = leg.pets.slice(); s.pet = s.pets[0] || null; }
  }
  s.wpn[s.main].lv = Math.max(2, s.wpn[s.main].lv);
  autoEquip(s);
  return s;
}
function autoEquip(s) {
  for (const id in s.books) {
    const b = getBook(id, s); if (!b) continue;
    if (b.cat === 'weapon') { const sl = s.slots[b.w]; if (!sl.includes(id)) { const i = sl.indexOf(null); if (i >= 0) sl[i] = id; } }
    else if (!s.slots[b.cat]) s.slots[b.cat] = id;
  }
}
function learnBook(s, id, silent) {
  if (s.books[id]) { s.res.page += 10; if (!silent) toast(`《${getBook(id, s).n}》已經學會，改得殘頁 10`); return false; }
  s.books[id] = { lv: 1, prog: 0 };
  const b = getBook(id, s);
  if (b.cat === 'weapon') { const sl = s.slots[b.w]; const i = sl.indexOf(null); if (i >= 0) sl[i] = id; }
  else if (!s.slots[b.cat]) s.slots[b.cat] = id;
  if (!silent) { toast(`學會《${b.n}》`, 'red'); if (typeof sfx === 'function') sfx('learn'); }
  return true;
}
function getBook(id, s) { s = s || S; return BOOKS[id] || (s && s.customBooks[id]) || null; }
function bookLv(id) { return S.books[id] ? S.books[id].lv : 0; }
function bookMul(id, lv) { const b = getBook(id); return (1 + 0.15 * ((lv || bookLv(id)) - 1)) * (b.tier === 2 ? 1.6 : b.tier === 3 ? 2.6 : 1); }

/* ---------- 物品 ---------- */
let uidSeq = Date.now() % 100000;
function makeItem(slot, tier, opt) {
  opt = opt || {};
  const kind = slot.startsWith('acc') ? 'acc' : slot;
  const it = { uid: 'i' + (uidSeq++), slot: kind, tier: tier || 1, set: opt.set || null, unique: opt.unique || null };
  if (opt.unique) { const u = UNIQUE_GEAR[opt.unique]; it.name = u.n; it.slot = u.slot; }
  else { it.name = (opt.set ? SETS[opt.set].n.slice(0, 2) : '') + GEAR_NAMES[kind][Math.min(4, it.tier - 1)]; }
  if (!opt.unique && kind === 'acc') it.attr = pick(ATTR_ORDER);
  return it;
}
function itemStats(it) {
  const m = 1 + 0.25 * (it.tier - 1); const st = {};
  if (it.unique) { const u = UNIQUE_GEAR[it.unique]; for (const k of ['hp', 'mp', 'spd', 'dcd', 'pot', 'crit', 'attrDmg', 'dr', 'pres']) if (u[k]) st[k] = u[k] * m; if (u.attr) st.attr = u.attr; return st; }
  const b = GEAR_BASE[it.slot];
  for (const k in b) if (k !== 'mat') st[k] = b[k] * m;
  if (it.slot === 'acc') { st.attr = it.attr; st.attrDmg = 0.05 * m; }
  return st;
}
function itemDesc(it) {
  const st = itemStats(it); const p = [];
  if (st.hp) p.push(`氣血 +${Math.round(st.hp)}`); if (st.mp) p.push(`內力 +${Math.round(st.mp)}`);
  if (st.dr) p.push(`減傷 ${Math.round(st.dr * 100)}%`); if (st.spd) p.push(`移速 +${Math.round(st.spd * 100)}%`);
  if (st.dcd) p.push(`閃身冷卻 −${Math.round(st.dcd * 100)}%`); if (st.pot) p.push(`藥效 +${Math.round(st.pot * 100)}%`);
  if (st.crit) p.push(`暴擊 +${Math.round(st.crit * 100)}%`); if (st.pres) p.push(`毒抗 +${Math.round(st.pres * 100)}%`); if (st.attrDmg) p.push(`${st.attr}屬性傷害 +${Math.round(st.attrDmg * 100)}%`);
  if (it.set) p.push(`［${SETS[it.set].n}］`);
  return p.join('、');
}
function gearSum() {
  const t = { hp: 0, mp: 0, dr: 0, spd: 0, dcd: 0, pot: 0, crit: 0, pres: 0, attr: {} };
  const sets = {};
  for (const sl of SLOTS) { const it = S.gear[sl]; if (!it) continue; const st = itemStats(it);
    for (const k in st) { if (k === 'attr' || k === 'attrDmg') continue; t[k] += st[k]; }
    if (st.attr) t.attr[st.attr] = (t.attr[st.attr] || 0) + (st.attrDmg || 0);
    if (it.set) sets[it.set] = (sets[it.set] || 0) + 1; }
  t.sets = sets;
  return t;
}
let GS = null; // 快取裝備總和
function refreshStats() { GS = gearSum(); }
const setN = k => (GS && GS.sets[k]) || 0;

/* ---------- 衍生數值 ---------- */
/* ---------- 武學（內功＝永久被動，以擊殺升級；氣功＝主動，以使用次數升級；輕功＝以路程升級） ---------- */
const TIER_K = b => b.tier === 1 ? 1 : b.tier === 2 ? 1.6 : 2.6;
function catPow(cat, attr) { let v = 0; for (const id in S.books) { const b = getBook(id); if (b && b.cat === cat && b.attrs.includes(attr)) v += S.books[id].lv * TIER_K(b); } return v; }
const innerPow = a => catPow('inner', a), qiPow = a => catPow('qi', a);
function qingPow() { const id = S.slots.qing; if (!id || !S.books[id]) return 0; return S.books[id].lv * TIER_K(getBook(id)); }
// 每一單位（重數 × 階級係數）的效果
const ART_FX = {
  inner: { 柔: [['內力上限', 5, ''], ['內力回復', 4, '%']], 剛: [['減傷', 2, '%'], ['氣血上限', 6, '']], 寒: [['寒屬性傷害', 3, '%'], ['暴擊率', 0.4, '%']], 毒: [['吸血', 0.6, '%'], ['毒屬性傷害', 3, '%']] },
  qi: { 剛: [['攻擊力', 1.5, '%']], 柔: [['內力上限', 3, '']], 寒: [['寒屬性傷害', 1.5, '%']], 毒: [['毒屬性傷害', 1.5, '%']] },
};
const DODGE_CAP = 0.65;
function dodgeRate() { const u = qingPow(); return u ? Math.min(DODGE_CAP, 0.03 + 0.025 * u) : 0; }
function qingSpd() { return 0.015 * qingPow(); }
// 升級需求：倍數成長
const ART_NEED = { inner: l => Math.round(12 * Math.pow(1.5, l - 1)), qi: l => Math.round(8 * Math.pow(1.5, l - 1)), qing: l => Math.round(3000 * Math.pow(1.5, l - 1)) };
const ART_UNIT = { inner: '擊殺', qi: '次', qing: '步' };
function artNeed(id) { const b = getBook(id); return ART_NEED[b.cat] ? ART_NEED[b.cat](S.books[id].lv) : 20 * S.books[id].lv; }
function artCap() { return LIB_CAP[S.bld.lib] || 1; }
function gainArt(id, n) { const s = S.books[id]; if (!s || s.lv >= 10) return; const need = artNeed(id); s.prog = Math.min(need, (s.prog || 0) + n); artLevel(id); }
// 修練圓滿後回藏經閣突破（與兵器招式相同）
function artLevel(id) { const s = S.books[id], b = getBook(id); if (s.lv < 10 && s.prog >= artNeed(id) && !s.capMsg) { s.capMsg = 1; toast(`《${b.n}》修練圓滿，可回藏經閣突破到第 ${s.lv + 1} 重`); } }
// 武學功效說明（藏經閣用）
function artEffect(id, lv) { const b = getBook(id); lv = lv === undefined ? S.books[id] ? S.books[id].lv : 1 : lv; const u = lv * TIER_K(b), f = (x, unit) => `${+(x * u).toFixed(1)}${unit}`;
  if (b.cat === 'inner' || b.cat === 'qi') { const parts = b.attrs.flatMap(a => (ART_FX[b.cat][a] || []).map(([n, x, un]) => `${n} +${f(x, un)}`)); return (b.cat === 'qi' ? `主動：${b.n}（傷害 ×${bookMul(id, lv).toFixed(2)}，耗內力上限 ${[0, 50, 60, 70][b.tier || 1]}%）；永久：` : '永久：') + parts.join('、'); }
  if (b.cat === 'qing') return `裝上後：移動速度 +${(1.5 * u).toFixed(1)}%、閃避率 ${Math.round(Math.min(DODGE_CAP, 0.03 + 0.025 * u) * 100)}%（上限 65%）${b.attrs.includes('柔') ? '；閃身可連用兩次' : ''}${b.attrs.includes('剛') ? '；閃身撞擊敵人' : ''}${b.attrs.includes('寒') ? '；閃身留下冰痕減速' : ''}${b.attrs.includes('毒') ? '；閃身穿過敵人時下毒' : ''}`;
  return `招式傷害 ×${bookMul(id, lv).toFixed(2)}（${WEAPONS[b.w] ? WEAPONS[b.w].name : ''}）${b.freeze ? `、冰凍 ${b.freeze} 秒` : ''}`; }
const QIXU = () => typeof P !== 'undefined' && !!P.qixu;
function maxHp() { return Math.round((120 + 20 * S.mer.ren + (S.origin === 'shaolin' ? 30 : 0) + GS.hp + 6 * innerPow('剛')) * (setN('kuangsha') >= 2 ? 1.1 : 1)); }
function maxMp() { return Math.round(60 + 12 * S.mer.du + GS.mp + 5 * innerPow('柔') + 3 * qiPow('柔')); }
function mpRegen() { return 5 * (1 + 0.04 * S.mer.du) * (1 + 0.04 * innerPow('柔')) * (S.zouhuo > 0 ? 0.5 : 1); }
function moveSpeed() { let m = 0.04 * S.mer.dai + GS.spd + (setN('qiaofu') >= 4 ? 0.05 : 0); m = Math.min(1, m + qingSpd() + (setN('yubang') >= 2 && onWaterTile() ? 0.3 : 0)); return 215 * (1 + m) * (curWeather() === '雨' ? 0.95 : 1) * (QIXU() ? 0.75 : 1); }
function dodgeCdMax() { return Math.max(0.35, 0.7 * (1 - 0.035 * S.mer.dai - GS.dcd - (setN('zhuying') >= 2 ? 0.1 : 0))) * (curWeather() === '雪' ? 1.1 : 1); }
function critRate() { return Math.min(0.75, 0.10 + 0.005 * S.mer.yinwei + GS.crit + 0.004 * innerPow('寒')); }
function critOverflow() { const raw = 0.10 + 0.005 * S.mer.yinwei + GS.crit + 0.004 * innerPow('寒'); return raw > 0.75 ? (raw - 0.75) / 0.005 * 0.01 : 0; }
function critDmg() { return 1.6 + 0.03 * S.mer.yangwei; }
function resist() { return Math.min(0.75, 0.01 * S.mer.yinqiao); }
function titleBonus(k) { if (!S.title) return 0; const a = ACHIEVEMENTS.find(x => x.title === S.title); return a && a.bonus && a.bonus[k] || 0; }
function dmgMul() { return (1 + 0.08 * S.mer.chong) * (setN('xueying') >= 6 && P.hp < maxHpCache() / 2 ? 1.25 : 1) * (1 + critOverflow()) * (1 + titleBonus('dmg')) * (S.buffs.liqi > 0 ? 1.15 : 1) * (1 + 0.01 * (S.vaultItems || []).length) * (1 + 0.015 * qiPow('剛')) * (QIXU() ? 0.7 : 1); }
function attrMul(attr) {
  if (!attr) return 1;
  let m = 1 + 0.03 * S.mer.yangqiao + (GS.attr[attr] || 0);
  if (attr === '寒') { m += 0.03 * innerPow('寒') + 0.015 * qiPow('寒'); if (curWeather() === '雨') m += 0.2; if (curWeather() === '雪') m += 0.3; if (setN('hanjiang') >= 4) m += 0.15; }
  if (attr === '柔' && setN('zhuying') >= 4) m += 0.15;
  if (attr === '剛' && setN('kuangsha') >= 4) m += 0.15;
  if (attr === '毒' && setN('xueying') >= 4) m += 0.15;
  if (attr === '毒') m += 0.03 * innerPow('毒') + 0.015 * qiPow('毒') + (curWeather() === '毒霧' ? 0.2 + (setN('wudu') >= 6 ? 0.2 : 0) : 0);
  if (setN('yubang') >= 6 && isNight() && regionAt(P.x, P.y) === 'sea') m += 0.1;
  return m;
}
function damageReduce() { return Math.min(0.8, GS.dr + titleBonus('dr') + 0.02 * innerPow('剛') + (S.buffs.huxin > 0 ? 0.15 : 0)); }
function lifesteal() { return (0.006 * innerPow('毒') + (setN('xueying') >= 2 ? 0.03 : 0)) * (curWeather() === '血雨' ? 2 : 1); }
let _mhc = 0, _mht = -1; function maxHpCache() { if (typeof gameT !== 'undefined' && gameT !== _mht) { _mht = gameT; _mhc = maxHp(); } return _mhc; }
function wDmg(w) { const x = S.wpn[w]; return WEAPONS[w].dmg * (1 + 0.25 * (x.tier - 1)) * (1 + 0.06 * (x.lv - 1)) * dmgMul() * (w === 'sword' && S.encounters.resonance ? 1.1 : 1); }
function potCap() { return POT_MAX[S.bld.herbal] + Math.round(GS.pot * 0 + (GS.pot > 0 ? 1 : 0)); }
function potHealPct() { return potHeal(Math.max(1, S.bld.herbal)) * (1 + GS.pot + (setN('qiaofu') >= 6 ? 0.3 : 0)); }
function power() { const dps = wDmg(S.main) / WEAPONS[S.main].cd * critDmgAvg(); return Math.round(dps * 1.5 + maxHp() / 2); }
function critDmgAvg() { return 1 + critRate() * (critDmg() - 1); }
function realmOf(p) { let r = REALMS[0][0]; for (const [n, v] of REALMS) if (p >= v) r = n; return r; }
function realmIdx(n) { return REALMS.findIndex(r => r[0] === n); }

/* ---------- 資源 ---------- */
function canPay(c) { for (const k in c) { if (k === 'rare') { if (RARE_ORES.reduce((a, r) => a + S.res[r], 0) < c[k]) return false; continue; } if (k === 'spec') { if (SPECIALTY.reduce((a, r) => a + S.res[r], 0) < c[k]) return false; continue; } if ((S.res[k] || 0) < c[k]) return false; } return true; }
function pay(c) { for (const k in c) { if (k === 'rare' || k === 'spec') { let n = c[k]; for (const r of (k === 'rare' ? RARE_ORES : SPECIALTY)) { const t = Math.min(n, S.res[r]); S.res[r] -= t; n -= t; } continue; } S.res[k] -= c[k]; } }
function costStr(c) { return Object.keys(c).map(k => { const n = k === 'rare' ? '稀有礦材' : k === 'spec' ? '特產藥材' : RES[k].n; const have = k === 'rare' ? RARE_ORES.reduce((a, r) => a + S.res[r], 0) : k === 'spec' ? SPECIALTY.reduce((a, r) => a + S.res[r], 0) : S.res[k]; return `<span class="${have >= c[k] ? '' : 'lack'}">${n} ${c[k].toLocaleString()}</span>`; }).join('　'); }

/* ---------- 存檔 ---------- */
function snapshot() { S.px = P.x; S.py = P.y; S.time = Date.now(); S.fog = fogString(); return JSON.stringify(S); }
// 只存真正在玩的角色（標題畫面看英雄榜時的空殼 S 不能蓋掉存檔）；每 5 分鐘另存一份備份
const validSave = s => !!(s && s.origin && s.gen && s.res && s.books);
let lastBak = 0;
function saveGame() { if (!S || S.dead || !validSave(S) || (typeof running !== 'undefined' && !running)) return; try { const t = snapshot(); lsSet(SAVE_KEY, t); if (Date.now() - lastBak > 300000) { lastBak = Date.now(); lsSet(SAVE_KEY + '_bak', t); } } catch (e) { } }
function loadGame() { const t = lsGet(SAVE_KEY); if (!t) return null; try { return migrate(JSON.parse(t)); } catch (e) { return null; } }
function migrate(s) {
  const d = newStateShape();
  deepFill(s, d);
  if ((s.v || 1) < 2) { // 1a → 1b：地圖擴大、主線分區
    if (s.px > OLD_MAP_W + 100) s.px += ROOM_DX; s.py = (s.py || 3150) + OY;
    s.fog = fogMigrate1a(s.fog); migrateTracks(s); if (s.unlock && s.unlock.bamboo) s.unlock.roads = true;
    if (s.camps && s.camps.well_room) delete s.camps.well_room; s.v = 2;
  }
  if ((s.v || 1) < 3) { // 2a → 2b：秘境房間往東移、迷霧加寬
    if (s.px > 8000) s.px += ROOM_DX2; s.fog = fogMigrate2b(s.fog); s.v = 3;
  }
  migrateTracks(s);
  for (const r of ['village', 'bamboo', 'sand', 'snow', 'cult']) if (!s.weather[r]) s.weather[r] = REGIONS[r].weather[0];
  return s;
}
function newStateShape() { const res = {}; Object.keys(RES).forEach(k => res[k] = 0); return { res, rep: { village: 0, merchants: 0, righteous: 0, blood: 0, wudu: 0, fishers: 0 }, buffs: {}, pills: {}, stats: { kills: 0, chests: 0, zouhuo: 0, bestCombo: 0, play: 0, elites: 0, storm: 0, combos: {} }, codex: { mon: {}, gear: {}, people: {} }, secrets: {}, tr: null, daily: { day: '', streak: 0, claimed: false, comm: [], commDone: [] }, unlock: {}, ach: {}, customBooks: {}, vaultItems: [] }; }
function deepFill(s, d) { for (const k in d) { if (s[k] === undefined) s[k] = d[k]; else if (d[k] && typeof d[k] === 'object' && !Array.isArray(d[k])) deepFill(s[k], d[k]); } return s; }
function deleteSave() { lsDel(SAVE_KEY); lsDel(SAVE_KEY + '_bak'); }
function exportCode() { const json = snapshot(); const b = btoa(unescape(encodeURIComponent(json))); let h = 0; for (let i = 0; i < b.length; i++) h = (h * 31 + b.charCodeAt(i)) >>> 0; return 'YJ1-' + h.toString(36) + '-' + b; }
function importCode(code) {
  code = (code || '').trim(); const m = code.match(/^YJ1-([0-9a-z]+)-(.+)$/s); if (!m) return '存檔碼格式不對，請整段貼上。';
  let h = 0; for (let i = 0; i < m[2].length; i++) h = (h * 31 + m[2].charCodeAt(i)) >>> 0;
  if (h.toString(36) !== m[1]) return '存檔碼不完整，可能少複製了幾個字。';
  try { const s = JSON.parse(decodeURIComponent(escape(atob(m[2])))); lsSet(SAVE_KEY, JSON.stringify(s)); return null; } catch (e) { return '存檔碼無法讀取。'; }
}

/* ---------- 英雄榜與傳承 ---------- */
function loadHeroes() { try { return JSON.parse(lsGet(HERO_KEY) || '[]'); } catch (e) { return []; } }
function loadLegacy() { try { const t = lsGet(LEGACY_KEY); return t ? JSON.parse(t) : null; } catch (e) { return null; } }
function recordHero(cause, ended) {
  const h = loadHeroes();
  h.unshift({ gen: S.gen, name: S.name, origin: ORIGINS[S.origin].n, realm: realmOf(power()), cause: cause || '', ended: ended || '', play: Math.round(S.stats.play / 60), date: new Date().toLocaleDateString('zh-TW') });
  lsSet(HERO_KEY, JSON.stringify(h.slice(0, 50)));
  const items = []; SLOTS.forEach(sl => { if (S.gear[sl]) items.push(S.gear[sl]); }); S.bag.forEach(it => items.push(it));
  const books = {}; for (const id in S.books) books[id] = { lv: S.books[id].lv };
  const wpn = {}; WORDER.forEach(w => wpn[w] = { tier: S.wpn[w].tier });
  lsSet(LEGACY_KEY, JSON.stringify({ gen: S.gen, name: S.name, where: cause, ended: !!ended, books, customBooks: S.customBooks, items, wpn, bld: Object.assign({}, S.bld), vaultItems: S.vaultItems || [], pills: S.pills || {}, potions: S.potions, bagCap: S.bagCap, pets: S.pets || [] }));
}

function onWaterTile() { if (typeof TERRAIN === 'undefined' || !P) return false; for (const t of TERRAIN) if ((t.t === 'water' || t.t === 'swamp') && P.x > t.x && P.x < t.x + t.w && P.y > t.y && P.y < t.y + t.h) return true; return false; }
