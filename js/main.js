'use strict';
/* 一命江湖 1a — 主迴圈、繪圖 */
const cv = $('cv'), g = cv.getContext('2d');
let W = 0, H = 0, DPR = 1, ZOOM = 1, camX = 0, camY = 0;
function resize() { DPR = Math.min(2, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); cv.style.width = W + 'px'; cv.style.height = H + 'px'; ZOOM = clamp(Math.max(W / 1150, H / 660), .55, 1.6); }
addEventListener('resize', resize); resize();
function inCombat() { if (BOSSFIGHT) return true; return E.some(e => !e.dead && e.aggro && e.def.ai !== 'none' && dist(e, P) < 650); }

/* ---------- 外觀 ---------- */
function lookOf(s) { const o = ORIGINS[s.origin]; return { robe: CLOTH_COLS[s.clothCol] || o.robe, acc: o.acc, hair: HAIR_COLS[s.hairCol] || INK, hat: o.hat, style: s.hair || 0, gender: s.gender, cloak: o.cloak, weapon: s.main || 'sword' }; }
/* ---------- 水墨角色圖（ChatGPT 繪製，img/spr/<id>.png，透明背景、腳底在圖下緣） ---------- */
const SPR_H = { guard: 84, xbow: 80, thug: 82, dogman: 84, hound: 52, puppet: 84, ape: 80, talisman: 60, furnace: 72, minipuppet: 50, thunder: 104, crane: 70, zp_hero: 84, tiebutou: 98, heixiong: 110, qingsong: 70, baiyuan: 120, jinsuanpan: 120, yunhe: 116, linxiao: 124, xuanxiao: 124, zhangbanxia: 76, saodi: 78, guanzhu: 80, leitai_master: 86, yushuang: 80, jinghong: 84, zy_smith: 80, gambler: 78, crane_old: 78, huiguan: 80, qingfeng: 66, gu: 36, miao_warrior: 82, blowdart: 76, gujar: 56, toad: 48, pirate: 80, pirate_xbow: 78, crab: 52, water_ghost: 78, hunter: 80, wudu_tongzi: 96, aluo: 84, laojing: 96, coral: 84, gumu: 110, haitianba: 128, wuyi: 76, zhaizhu: 84, langu: 80, yubang: 82, laochuanfu: 78, diaosou: 82, suxin: 82, changfeng: 86, ahai: 72, dummy: 64, hero: 76, master: 80, chief: 72, innkeeper: 74, dojo: 80, farmer: 74, mojiao: 50, merchant: 76, mystery: 78, drunk: 76, liu: 92,
  bandit: 78, archer: 76, assassin: 76, blowgun: 74, cracker: 50, sprite: 78, wolf: 50, wolfking: 64, snake: 34, hive: 52, bee: 22, dog: 40, myna: 30,
  wanglaosan: 92, qingzhushe: 84, duanjianke: 86,
  horse_bandit: 96, scorpion: 52, vulture: 60, wormhole: 50, sandworm: 26, oilthief: 76, guishouqi: 88, shalifei: 108,
  snowwolf: 54, traitor: 78, snowbear: 96, icespirit: 80, iceball: 36, hanwuyi: 92, oldbear: 128, boatman: 76,
  cultist: 80, hexer: 80, bloodpuppet: 90, batnest: 56, bat: 26, sacrifice: 76, judge: 96, priestess: 88,
  tieba: 112, gusou: 92, li: 100, caravan_boss: 82, caravan: 76, boatwife: 74, nun: 74, oldman: 72, fisher: 80, mole: 74, prisoner: 74 };
const SPR_IMG = {}, SPR_TINT = {};
/* 主角髮型動作：每個（門派×性別×髮型）四個動作合成一張圖 img/spr/hs/<key>.png（遮罩 <key>_m.png 為半尺寸） */
const HSHEET = {"hero_mingmen_m_h0":[[0,253,460],[258,400,388],[662,493,402],[1160,421,264]],"hero_mingmen_m_h1":[[0,258,460],[262,420,408],[686,581,418],[1272,398,276]],"hero_mingmen_m_h2":[[0,239,460],[244,411,409],[660,512,409],[1176,386,269]],"hero_mingmen_m_h3":[[0,232,460],[236,377,405],[618,478,417],[1100,277,256]],"hero_mingmen_m_h4":[[0,254,456],[258,433,391],[696,523,416],[1224,425,258]],"hero_mingmen_m_h5":[[0,237,460],[242,388,420],[634,519,415],[1158,275,285]],"hero_mingmen_f_h0":[[0,261,460],[266,372,428],[642,537,444],[1184,425,275]],"hero_mingmen_f_h1":[[0,274,447],[278,381,421],[664,542,453],[1210,439,302]],"hero_mingmen_f_h2":[[0,244,460],[248,423,425],[676,521,418],[1202,405,288]],"hero_mingmen_f_h3":[[0,263,460],[268,400,438],[672,508,431],[1184,306,279]],"hero_mingmen_f_h4":[[0,290,460],[294,428,436],[726,544,458],[1274,409,263]],"hero_mingmen_f_h5":[[0,266,460],[270,372,436],[646,506,438],[1156,291,284]],"hero_langzi_m_h0":[[0,279,460],[284,347,412],[636,361,417],[1002,368,252]],"hero_langzi_m_h1":[[0,309,460],[314,353,423],[672,368,425],[1044,404,277]],"hero_langzi_m_h2":[[0,277,460],[282,343,449],[630,372,438],[1006,360,292]],"hero_langzi_m_h3":[[0,279,460],[284,386,447],[674,386,442],[1064,399,307]],"hero_langzi_m_h4":[[0,289,460],[294,394,432],[692,389,429],[1086,409,265]],"hero_langzi_m_h5":[[0,298,460],[302,376,445],[682,362,448],[1048,391,274]],"hero_langzi_f_h0":[[0,300,460],[304,360,433],[668,372,433],[1044,355,263]],"hero_langzi_f_h1":[[0,323,460],[328,376,445],[708,404,441],[1116,381,276]],"hero_langzi_f_h2":[[0,280,460],[284,390,447],[678,354,428],[1036,362,289]],"hero_langzi_f_h3":[[0,289,460],[294,395,448],[694,364,435],[1062,374,288]],"hero_langzi_f_h4":[[0,309,460],[314,375,440],[694,395,436],[1094,383,266]],"hero_langzi_f_h5":[[0,305,460],[310,370,454],[684,387,450],[1076,372,296]],"hero_pantu_m_h0":[[0,272,460],[276,396,411],[676,326,398],[1006,356,266]],"hero_pantu_m_h1":[[0,295,460],[300,421,433],[726,355,408],[1086,382,260]],"hero_pantu_m_h2":[[0,278,460],[282,352,428],[638,374,422],[1016,351,278]],"hero_pantu_m_h3":[[0,295,460],[300,371,445],[676,395,430],[1076,375,284]],"hero_pantu_m_h4":[[0,284,460],[288,400,420],[692,346,392],[1042,339,270]],"hero_pantu_m_h5":[[0,291,460],[296,406,444],[706,349,423],[1060,351,295]],"hero_pantu_f_h0":[[0,260,460],[264,356,436],[624,370,423],[998,339,277]],"hero_pantu_f_h1":[[0,278,460],[282,377,443],[664,395,421],[1064,367,275]],"hero_pantu_f_h2":[[0,294,460],[298,348,446],[650,364,422],[1018,317,272]],"hero_pantu_f_h3":[[0,316,460],[320,359,448],[684,361,425],[1050,387,284]],"hero_pantu_f_h4":[[0,263,460],[268,370,443],[642,395,418],[1042,360,277]],"hero_pantu_f_h5":[[0,262,460],[266,383,462],[654,396,432],[1054,364,304]],"hero_shaolin_m_h0":[[0,285,460],[290,387,425],[682,392,406],[1078,373,255]],"hero_shaolin_m_h1":[[0,282,460],[286,380,416],[670,391,391],[1066,371,245]],"hero_shaolin_m_h2":[[0,269,460],[274,358,425],[636,474,401],[1114,255,280]],"hero_shaolin_m_h3":[[0,282,460],[286,377,437],[668,504,405],[1176,255,281]],"hero_shaolin_m_h4":[[0,286,460],[290,381,425],[676,502,421],[1182,288,270]],"hero_shaolin_m_h5":[[0,277,460],[282,366,429],[652,479,421],[1136,280,286]],"hero_shaolin_f_h0":[[0,299,460],[304,370,430],[678,501,414],[1184,260,279]],"hero_shaolin_f_h1":[[0,310,456],[314,375,438],[694,549,424],[1248,409,313]],"hero_shaolin_f_h2":[[0,306,460],[310,358,445],[672,506,414],[1182,261,313]],"hero_shaolin_f_h3":[[0,309,460],[314,366,449],[684,520,423],[1208,260,311]],"hero_shaolin_f_h4":[[0,310,460],[314,359,440],[678,499,429],[1182,265,283]],"hero_shaolin_f_h5":[[0,307,460],[312,354,452],[670,483,435],[1158,265,298]]};
const HS_POSE = { idle: 0, run: 1, atk: 2, dodge: 3 }, HS_RAW = {};
function hsFrame(id) { const m = /^(hero_[a-z]+_[mf]_h\d)_(idle|run|atk|dodge)(_m)?$/.exec(id); if (!m || !HSHEET[m[1]]) return undefined; const src = `img/spr/hs/${m[1]}${m[3] || ''}.png`; let sh = HS_RAW[src];
  if (sh === undefined) { const im = new Image(); HS_RAW[src] = null; im.onload = () => HS_RAW[src] = im; im.onerror = () => HS_RAW[src] = false; im.src = src; return null; }
  if (!sh) return sh === false ? false : null; const tb = HSHEET[m[1]], tot = tb[3][0] + tb[3][1] + (tb[3][1] % 2) + 4, k = sh.width / tot, [x, w, h] = tb[HS_POSE[m[2]]];
  const cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(w * k)); cv.height = Math.max(1, Math.round(h * k)); cv.getContext('2d').drawImage(sh, Math.round(x * k), 0, cv.width, cv.height, 0, 0, cv.width, cv.height); return cv; }
function sprImg(id) { if (!id) return null; if (SPR_IMG[id] === undefined || SPR_IMG[id] === null) { const f = hsFrame(id); if (f !== undefined) { if (f) SPR_IMG[id] = f; else if (f === false) SPR_IMG[id] = false; return f || null; } } let r = SPR_IMG[id]; if (r === undefined) { const im = new Image(); SPR_IMG[id] = null; im.onload = () => SPR_IMG[id] = im; im.onerror = () => SPR_IMG[id] = false; im.src = `img/spr/${id}.png`; return null; } return r || null; }
function sprTint(id, im) { let t = SPR_TINT[id]; if (!t) { t = document.createElement('canvas'); t.width = im.width; t.height = im.height; const c = t.getContext('2d'); c.drawImage(im, 0, 0); c.globalCompositeOperation = 'source-in'; c.fillStyle = '#fff'; c.fillRect(0, 0, t.width, t.height); SPR_TINT[id] = t; } return t; }
const DECOR_FALLBACK = { willow: 'pine', cloudpine: 'snowpine', dune_rock: 'rock', deadtree: 'bush', camelthorn: 'bush', bones: 'rock', snowpine: 'pine', snowrock: 'rock', snowgrass: 'grass', bloodrock: 'rock', banner: 'lantern', poplar: 'tree', swamptree: 'pine', mushroom: 'bush', fern: 'grass', palm: 'pine', searock: 'rock', shell: 'rock', seagrass: 'grass' };
const SPR_W = { swamptree: 150, mushroom: 56, fern: 60, palm: 140, searock: 90, shell: 40, seagrass: 54, lotus: 120, dummy: 64, poplar: 130, deadtree: 105, camelthorn: 62, dune_rock: 84, bones: 76, shaji_herb: 48, bladetomb: 170, snowpine: 120, snowrock: 62, snowgrass: 50, xuelian_herb: 40, icecave: 200, bloodrock: 60, banner: 50, b_cultbld: 180, snowore: 64, bloodore: 64, bloodherb: 44, ruin: 200, b_prison: 180, b_base: 320, b_hall: 240, b_smith: 180, b_lib: 180, b_herbal: 170, b_alchemy: 170, b_vault: 180, b_array: 180,
  house1: 180, house2: 170, inn: 240, dojo_bld: 230, pavilion: 160, well: 100, board: 80, tomb: 170, tree: 104, bamboo: 96, herb: 44, ore: 64, chest: 50, chest_rich: 56, stele: 52, swordtomb: 180, pine: 120, rock: 56, grass: 46, bush: 70, lantern: 34 };
function drawStatic(id, x, y, w, o) { const im = sprImg(id); if (!im) return false; o = o || {}; w = (w || SPR_W[id] || 100) * (o.scale || 1); const h = w * im.height / im.width; g.save(); g.translate(x, y); if (o.flip) g.scale(-1, 1); let al = o.alpha !== undefined ? o.alpha : 1; if (y > P.y + 4 && y - h * .92 < P.y - 20 && Math.abs(P.x - x) < w * .42) al *= .42; g.globalAlpha = al; g.drawImage(im, -w / 2, -h + (o.sink || 0), w, h); g.restore(); return true; }
/* ---------- 髮色、衣色（依遮罩 <id>_m.png 重新上色：紅色通道＝頭髮、綠色通道＝衣服） ---------- */
const RAW = {}, TINTED = {};
function rawImg(src) { let r = RAW[src]; if (r === undefined) { const im = new Image(); RAW[src] = null; im.onload = () => RAW[src] = im; im.onerror = () => RAW[src] = false; im.src = src; return null; } return r || null; }
const hex2rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
function tintHero(key, im, maskSrc, hairIdx, clothIdx) {
  const hc = hairIdx ? HAIR_COLS[hairIdx] : null, cc = CLOTH_COLS[clothIdx] || null; if (!hc && !cc) return im;
  const k = key + '|' + hc + '|' + cc; if (TINTED[k]) return TINTED[k];
  const mk = typeof maskSrc === 'string' ? rawImg(maskSrc) : maskSrc; if (!mk) return im;
  try {
    const w = im.naturalWidth || im.width, h = im.naturalHeight || im.height; const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d'); c.drawImage(mk, 0, 0, w, h); const M = c.getImageData(0, 0, w, h).data;
    c.clearRect(0, 0, w, h); c.drawImage(im, 0, 0, w, h); const D = c.getImageData(0, 0, w, h); const d = D.data;
    let sh = 0, nh = 0, sc = 0, nc = 0; for (let i = 0; i < d.length; i += 4) { const L = .299 * d[i] + .587 * d[i + 1] + .114 * d[i + 2]; const wh = M[i] / 255, wc = M[i + 1] / 255; sh += L * wh; nh += wh; sc += L * wc; nc += wc; }
    const mh = Math.max(8, sh / Math.max(1, nh)), mc = Math.max(8, sc / Math.max(1, nc)); const H = hc && hex2rgb(hc), C = cc && hex2rgb(cc);
    for (let i = 0; i < d.length; i += 4) { const L = .299 * d[i] + .587 * d[i + 1] + .114 * d[i + 2];
      for (const [T, wgt, m] of [[H, M[i] / 255, mh], [C, M[i + 1] / 255, mc]]) { if (!T || wgt <= 0) continue; const t = .5 + .5 * Math.min(2.4, L / m); for (let j = 0; j < 3; j++) d[i + j] = d[i + j] * (1 - wgt) + Math.min(255, T[j] * t) * wgt; } }
    c.putImageData(D, 0, 0); TINTED[k] = cv; return cv;
  } catch (e) { TINTED[k] = im; return im; }
}
const heroSpr = s => `hero_${s.origin}_${s.gender}`;
const ORIGIN_WPN = { mingmen: 'sword', langzi: 'dart', pantu: 'fist', shaolin: 'fist' };
// 主角精緻動作圖：<id>_idle / _run / _atk / _dodge；沒有就用單張全身像
function heroFrame() { const base0 = heroSpr(S), hb = `${base0}_h${S.hair || 0}`; const base = sprImg(`${hb}_idle`) ? hb : base0; const pose = P.dodgeT > 0 ? 'dodge' : (P.swingT > 0 || P.lock > 0 || P.atkT > WEAPONS[S.main].cd * .45) ? 'atk' : P.moving ? (Math.floor(P.step * 7) % 2 ? 'run' : 'idle') : 'idle'; const id = `${base}_${pose}`; return sprImg(id) ? id : sprImg(`${base0}_${pose}`) ? `${base0}_${pose}` : base0; }
function drawWeapon(c, hx, hy, wa, wp, len) {
  c.save(); c.translate(hx, hy); c.rotate(wa); c.lineCap = 'round';
  if (wp === 'sword') { c.strokeStyle = '#d8d4cc'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(6, 0); c.lineTo(len, 0); c.stroke(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke(); c.strokeStyle = GOLD; c.lineWidth = 3; c.beginPath(); c.moveTo(6, -5); c.lineTo(6, 5); c.stroke(); c.strokeStyle = CIN; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, 0); c.lineTo(-8, 6); c.stroke(); }
  else if (wp === 'blade') { c.fillStyle = '#cfcac0'; c.strokeStyle = INK; c.lineWidth = 1.2; c.beginPath(); c.moveTo(6, -2); c.lineTo(len * .9, -3); c.quadraticCurveTo(len, 2, len * .85, 6); c.lineTo(6, 3); c.closePath(); c.fill(); c.stroke(); c.fillStyle = GOLD; c.fillRect(3, -5, 4, 10); }
  else if (wp === 'dart') { c.fillStyle = '#3a3a3a'; c.beginPath(); c.moveTo(14, 0); c.lineTo(5, -3.5); c.lineTo(5, 3.5); c.fill(); }
  else if (wp === 'fist') { c.fillStyle = '#b8873a'; c.strokeStyle = INK; c.lineWidth = 1.2; c.beginPath(); c.arc(4, 0, 5, 0, TAU); c.fill(); c.stroke(); }
  c.restore();
}
function drawSprActor(c, x, y, face, id, o) {
  let im = sprImg(id); if (!im) return false; o = o || {};
  if (S && id.startsWith('hero_')) im = tintHero(id, im, sprImg(id + '_m'), S.hairCol, S.clothCol);
  const h = (/^hero_.*_(idle|run|atk|dodge)$/.test(id) ? im.height * SPR_H.hero * 1.12 / 460 : (SPR_H[id] || (id.startsWith('hero') ? SPR_H.hero : 74))) * (o.scale || 1), w = h * im.width / im.height; const fl = Math.cos(face) < -0.01 ? -1 : 1, t = o.t || 0;
  c.save(); c.translate(x, y); if (o.alpha !== undefined) c.globalAlpha = o.alpha;
  c.fillStyle = 'rgba(29,26,23,.22)'; c.beginPath(); c.ellipse(0, 1, w * .32, w * .1 + 2, 0, 0, TAU); c.fill();
  const step = o.moving ? Math.sin(t * 13) : 0, bob = o.moving ? -Math.abs(step) * h * .035 : Math.sin(t * 2.2) * h * .006;
  c.translate(0, bob); c.rotate(step * .045 * fl + (o.swing ? (o.swing - .5) * .12 * fl : 0)); c.scale(fl * (1 + (o.moving ? 0 : Math.sin(t * 2.2) * .008)), 1 - (o.moving ? Math.abs(step) * .02 : 0));
  const ax = id.endsWith('_atk') ? .38 : .5;
  c.drawImage(im, -w * ax, -h, w, h);
  if (o.flash > 0) { c.globalAlpha = (o.alpha !== undefined ? o.alpha : 1) * .75; c.drawImage(sprTint(id, im), -w * ax, -h, w, h); }
  c.restore();
  if (o.weapon && o.weapon !== 'none') { const hx = x + fl * w * .2, hy = y + bob - h * .44; const wa = o.swing ? face + (o.swing - .5) * 2.2 * fl : face; c.save(); if (o.alpha !== undefined) c.globalAlpha = o.alpha; drawWeapon(c, hx, hy, wa, o.weapon, h * .5); c.restore(); }
  return true;
}
function drawHumanCtx(c, x, y, face, L, o) {
  o = o || {}; if (o.spr && drawSprActor(c, x, y, face, o.spr, Object.assign({}, o, { weapon: o.weaponOver ? L.weapon : null }))) return; const fl = Math.cos(face) < -0.01 ? -1 : 1, t = o.t || 0, bob = o.moving ? Math.sin(t * 14) * 1.4 : 0;
  c.save(); c.translate(x, y); if (o.scale) c.scale(o.scale, o.scale); if (o.alpha !== undefined) c.globalAlpha = o.alpha;
  c.fillStyle = 'rgba(29,26,23,.18)'; c.beginPath(); c.ellipse(0, 1, 14, 5, 0, 0, TAU); c.fill();
  const leg = o.moving ? Math.sin(t * 14) * 4 : 0; c.strokeStyle = INK; c.lineWidth = 2.6; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-4, -6); c.lineTo(-4 + leg, 0); c.moveTo(4, -6); c.lineTo(4 - leg, 0); c.stroke();
  c.translate(0, bob);
  if (L.cloak) { c.fillStyle = 'rgba(60,50,40,.85)'; c.beginPath(); c.moveTo(-9, -24); c.lineTo(-15 * fl - 2, -3); c.lineTo(6, -4); c.closePath(); c.fill(); }
  // 衣袍
  c.fillStyle = o.flash > 0 ? '#fff' : L.robe; c.strokeStyle = INK; c.lineWidth = 1.6;
  c.beginPath(); c.moveTo(-7, -25); c.quadraticCurveTo(-11, -12, -12, -4); c.lineTo(12, -4); c.quadraticCurveTo(11, -12, 7, -25); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = L.acc || INK; c.lineWidth = 3; c.beginPath(); c.moveTo(-9, -13); c.lineTo(9, -13); c.stroke();
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(0, -25); c.lineTo(fl * 3, -14); c.stroke();
  // 兵器與手
  const wa = o.swing ? face + (o.swing - .5) * 2.2 * fl : face; const hx = Math.cos(face) * 9, hy = -15 + Math.sin(face) * 5;
  const wp = L.weapon;
  if (wp === 'sword' || wp === 'blade' || wp === 'bow') { c.save(); c.translate(hx, hy); c.rotate(wa); c.strokeStyle = wp === 'blade' ? '#3a3330' : '#2a2725'; c.lineWidth = wp === 'blade' ? 4.5 : 2.2;
    if (wp === 'bow') { c.strokeStyle = '#6b4a2a'; c.lineWidth = 2; c.beginPath(); c.arc(4, 0, 12, -1.2, 1.2); c.stroke(); c.lineWidth = .8; c.beginPath(); c.moveTo(4 + 12 * Math.cos(-1.2), 12 * Math.sin(-1.2)); c.lineTo(4 + 12 * Math.cos(1.2), 12 * Math.sin(1.2)); c.stroke(); }
    else { c.beginPath(); c.moveTo(2, 0); c.lineTo(wp === 'blade' ? 26 : 30, 0); c.stroke(); c.strokeStyle = GOLD; c.lineWidth = 2; c.beginPath(); c.moveTo(4, -4); c.lineTo(4, 4); c.stroke(); }
    c.restore(); }
  if (wp === 'dart') { c.save(); c.translate(hx, hy); c.rotate(wa); c.fillStyle = '#4a4a4a'; c.beginPath(); c.moveTo(14, 0); c.lineTo(6, -3); c.lineTo(6, 3); c.fill(); c.restore(); }
  c.fillStyle = wp === 'fist' ? (L.acc || '#b8873a') : '#efe0c8'; c.strokeStyle = INK; c.lineWidth = 1.2; c.beginPath(); c.arc(hx + (o.swing && wp === 'fist' ? Math.cos(face) * 8 : 0), hy, wp === 'fist' ? 4.2 : 3, 0, TAU); c.fill(); c.stroke();
  // 頭
  c.fillStyle = '#efe0c8'; c.beginPath(); c.arc(0, -32, 7.5, 0, TAU); c.fill(); c.stroke();
  const st = L.style || 0, hc = L.hair || INK;
  if (L.hat !== 'bald') { c.fillStyle = hc; c.beginPath(); c.arc(0, -33, 7.8, Math.PI * 1.05, Math.PI * 1.95); c.quadraticCurveTo(0, -36, -7.4, -33.5); c.fill();
    if (st === 0 || st === 5) { c.beginPath(); c.arc(0, -41, st === 5 ? 3.6 : 3, 0, TAU); c.fill(); }
    if (st === 1) { c.beginPath(); c.moveTo(-7, -33); c.quadraticCurveTo(-10 * fl, -22, -6 * fl, -18); c.lineTo(-2 * fl, -26); c.fill(); }
    if (st === 2) { c.strokeStyle = hc; c.lineWidth = 3; c.beginPath(); c.moveTo(-2 * fl, -39); c.quadraticCurveTo(-12 * fl, -36, -10 * fl, -24); c.stroke(); }
    if (st === 3) { c.beginPath(); c.arc(-5, -40, 2.8, 0, TAU); c.arc(5, -40, 2.8, 0, TAU); c.fill(); }
    if (L.gender === 'f' && st !== 4) { c.beginPath(); c.moveTo(-7.5, -32); c.quadraticCurveTo(-9, -24, -6, -21); c.lineTo(-5, -30); c.fill(); c.beginPath(); c.moveTo(7.5, -32); c.quadraticCurveTo(9, -24, 6, -21); c.lineTo(5, -30); c.fill(); } }
  c.fillStyle = INK; const ex = Math.cos(face) * 3, ey = Math.sin(face) > 0.3 ? 1 : Math.sin(face) < -0.6 ? -9 : 0;
  if (ey > -9) { c.beginPath(); c.arc(-2.6 + ex, -31.5 + ey, .9, 0, TAU); c.arc(2.6 + ex, -31.5 + ey, .9, 0, TAU); c.fill(); }
  if (L.beard) { c.fillStyle = '#e8e4da'; c.beginPath(); c.moveTo(-4, -27); c.lineTo(4, -27); c.lineTo(0, -19); c.fill(); }
  if (L.hat === 'douli' || L.hat === 'veil') { c.fillStyle = '#c9b78a'; c.strokeStyle = INK; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-15, -36); c.lineTo(0, -46); c.lineTo(15, -36); c.quadraticCurveTo(0, -33, -15, -36); c.fill(); c.stroke();
    if (L.hat === 'veil') { c.strokeStyle = 'rgba(40,40,40,.55)'; c.lineWidth = 1; for (let i = -12; i <= 12; i += 4) { c.beginPath(); c.moveTo(i, -35.5); c.lineTo(i * 1.05, -24); c.stroke(); } } }
  if (L.hat === 'mask') { c.fillStyle = CIN; c.fillRect(-7.5, -34, 15, 3.4); }
  c.restore();
}
function drawBeast(c, e, x, y) {
  const lk = e.def.look, f = e.face, t = e.anim, fl = e.flash > 0; c.save(); c.translate(x, y); const sc = e.scale || 1; c.scale(sc, sc);
  c.fillStyle = 'rgba(29,26,23,.18)'; c.beginPath(); c.ellipse(0, 2, e.def.r, e.def.r * .4, 0, 0, TAU); c.fill();
  const col = fl ? '#fff' : e.def.robe || '#5b554c'; c.strokeStyle = INK; c.lineWidth = 1.5;
  if (lk === 'wolf') { c.rotate(f); c.fillStyle = col; c.beginPath(); c.ellipse(-2, 0, 16, 8, 0, 0, TAU); c.fill(); c.stroke(); c.beginPath(); c.ellipse(13, 0, 7, 5.5, 0, 0, TAU); c.fill(); c.stroke(); c.beginPath(); c.moveTo(14, -4); c.lineTo(11, -10); c.lineTo(9, -4); c.fill(); c.beginPath(); c.moveTo(14, 4); c.lineTo(11, 10); c.lineTo(9, 4); c.fill(); c.lineWidth = 3; c.strokeStyle = col; c.beginPath(); c.moveTo(-17, 0); c.quadraticCurveTo(-24, Math.sin(t * 8) * 6, -28, 2); c.stroke(); c.fillStyle = CIN; c.beginPath(); c.arc(17, -2, 1.2, 0, TAU); c.fill(); }
  else if (lk === 'bee') { c.translate(0, -10 + Math.sin(t * 20) * 2); c.fillStyle = fl ? '#fff' : '#c9a24a'; c.beginPath(); c.ellipse(0, 0, 6, 4.5, f, 0, TAU); c.fill(); c.stroke(); c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.ellipse(-2, -5, 4, 2.5, -0.5 + Math.sin(t * 40) * .3, 0, TAU); c.fill(); }
  else if (lk === 'hive') { c.fillStyle = fl ? '#fff' : '#8a6a3a'; c.beginPath(); c.ellipse(0, -14, 14, 18, 0, 0, TAU); c.fill(); c.stroke(); c.strokeStyle = 'rgba(29,26,23,.5)'; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(-12, -14 + i * 6); c.quadraticCurveTo(0, -11 + i * 6, 12, -14 + i * 6); c.stroke(); } c.fillStyle = INK; c.beginPath(); c.arc(0, -8, 3, 0, TAU); c.fill(); }
  else if (lk === 'snake') { c.strokeStyle = col; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); for (let i = 0; i <= 8; i++) { const d = -i * 4, w = Math.sin(t * 10 - i * .9) * 5; const px = Math.cos(f) * d - Math.sin(f) * w, py = Math.sin(f) * d + Math.cos(f) * w; i ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke(); c.fillStyle = col; c.beginPath(); c.arc(Math.cos(f) * 3, Math.sin(f) * 3, 5.5, 0, TAU); c.fill(); c.fillStyle = CIN; c.beginPath(); c.arc(Math.cos(f) * 6, Math.sin(f) * 6 - 1, 1.2, 0, TAU); c.fill(); }
  else if (lk === 'sprite') { c.strokeStyle = fl ? '#fff' : '#3f5a3a'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.sin(t * 3) * 2, -34); c.stroke(); c.strokeStyle = 'rgba(29,26,23,.6)'; c.lineWidth = 1; for (const yy of [-10, -20, -30]) { c.beginPath(); c.moveTo(-3, yy); c.lineTo(3, yy); c.stroke(); } c.fillStyle = '#5a7a4e'; for (let i = 0; i < 4; i++) { c.save(); c.translate(0, -30 + i * 5); c.rotate((i % 2 ? 1 : -1) * (.6 + Math.sin(t * 4 + i) * .2)); c.beginPath(); c.ellipse(9, 0, 9, 2.6, 0, 0, TAU); c.fill(); c.restore(); } c.fillStyle = CIN; c.beginPath(); c.arc(-2, -26, 1.3, 0, TAU); c.arc(2, -26, 1.3, 0, TAU); c.fill(); }
  else if (lk === 'scorpion') { c.rotate(f); c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, 13, 8, 0, 0, TAU); c.fill(); c.stroke(); for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-4 + i * 5, sd * 6); c.lineTo(-8 + i * 6, sd * (14 + Math.sin(t * 12 + i) * 2)); c.stroke(); } c.beginPath(); c.moveTo(12, -4); c.lineTo(20, -9); c.moveTo(12, 4); c.lineTo(20, 9); c.stroke(); c.strokeStyle = col; c.lineWidth = 4; c.beginPath(); c.moveTo(-12, 0); c.quadraticCurveTo(-26, 0, -22, -14 - Math.sin(t * 6) * 3); c.stroke(); c.fillStyle = CIN; c.beginPath(); c.arc(-22, -15, 2.5, 0, TAU); c.fill(); }
  else if (lk === 'bird') { c.translate(0, -26 + Math.sin(t * 6) * 4); const fl2 = Math.cos(f) < 0 ? -1 : 1; c.scale(fl2, 1); c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, 10, 6, 0, 0, TAU); c.fill(); c.stroke(); const wf = Math.sin(t * 14) * .6; for (const sd of [-1, 1]) { c.save(); c.rotate(sd * (.3 + wf)); c.beginPath(); c.moveTo(-2, 0); c.quadraticCurveTo(-8, sd * -16, -20, sd * -4); c.lineTo(-4, sd * 2); c.fill(); c.stroke(); c.restore(); } c.fillStyle = '#c9a24a'; c.beginPath(); c.moveTo(9, -2); c.lineTo(16, 0); c.lineTo(9, 2); c.fill(); }
  else if (lk === 'wormhole' || lk === 'batnest') { const cave = lk === 'batnest'; c.fillStyle = fl ? '#fff' : cave ? '#3a1416' : '#8a6a3a'; c.beginPath(); c.ellipse(0, -6, 22, 12, 0, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#1d1a17'; c.beginPath(); c.ellipse(0, -6, 12, 6, 0, 0, TAU); c.fill(); if (cave) { c.fillStyle = CIN; c.beginPath(); c.arc(-3, -8, 1.2, 0, TAU); c.arc(3, -8, 1.2, 0, TAU); c.fill(); } }
  else if (lk === 'worm') { c.strokeStyle = col; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); for (let i = 0; i <= 5; i++) { const d2 = -i * 4, w2 = Math.sin(t * 12 - i) * 3; const px = Math.cos(f) * d2 - Math.sin(f) * w2, py = Math.sin(f) * d2 + Math.cos(f) * w2; i ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke(); }
  else if (lk === 'bear') { const fl2 = Math.cos(f) < 0 ? -1 : 1; c.scale(fl2, 1); c.fillStyle = col; c.beginPath(); c.ellipse(0, -16, 22, 15, 0, 0, TAU); c.fill(); c.stroke(); c.beginPath(); c.arc(18, -24, 9, 0, TAU); c.fill(); c.stroke(); c.beginPath(); c.arc(16, -32, 3.5, 0, TAU); c.fill(); c.stroke(); c.fillRect(-14, -4, 7, 6); c.fillRect(8, -4, 7, 6); c.fillStyle = INK; c.beginPath(); c.arc(22, -25, 1.3, 0, TAU); c.fill(); }
  else if (lk === 'icespirit') { c.translate(0, Math.sin(t * 3) * 3); c.fillStyle = fl ? '#fff' : 'rgba(200,225,240,.9)'; c.strokeStyle = '#33536a'; c.beginPath(); c.moveTo(0, -46); c.lineTo(12, -22); c.lineTo(6, 0); c.lineTo(-6, 0); c.lineTo(-12, -22); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#33536a'; c.beginPath(); c.arc(-3, -26, 1.5, 0, TAU); c.arc(3, -26, 1.5, 0, TAU); c.fill(); }
  else if (lk === 'iceball') { c.translate(0, -10); c.rotate(t * 4); c.fillStyle = fl ? '#fff' : '#cfe4f0'; c.strokeStyle = '#33536a'; c.beginPath(); for (let i = 0; i < 8; i++) { const a = i * TAU / 8, r2 = i % 2 ? 7 : 12; i ? c.lineTo(Math.cos(a) * r2, Math.sin(a) * r2) : c.moveTo(Math.cos(a) * r2, Math.sin(a) * r2); } c.closePath(); c.fill(); c.stroke(); }
  else if (lk === 'bat') { c.translate(0, -24 + Math.sin(t * 9) * 4); c.fillStyle = col; const wf = Math.sin(t * 22) * .5; c.beginPath(); c.ellipse(0, 0, 5, 4, 0, 0, TAU); c.fill(); for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(0, 0); c.lineTo(sd * 13, -6 - wf * 8); c.lineTo(sd * 9, 2); c.lineTo(sd * 5, -1); c.closePath(); c.fill(); } c.fillStyle = CIN; c.beginPath(); c.arc(-1.5, -1, .9, 0, TAU); c.arc(1.5, -1, .9, 0, TAU); c.fill(); }
  else if (lk === 'bug') { c.rotate(f); c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, 9, 6, 0, 0, TAU); c.fill(); c.stroke(); for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-4 + i * 4, sd * 4); c.lineTo(-6 + i * 5, sd * (10 + Math.sin(t * 20 + i) * 2)); c.stroke(); } c.fillStyle = '#c9a24a'; c.beginPath(); c.arc(7, 0, 3, 0, TAU); c.fill(); }
  else if (lk === 'jar') { c.fillStyle = fl ? '#fff' : '#6a5a3a'; c.beginPath(); c.ellipse(0, -14, 15, 18, 0, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#3a2a20'; c.fillRect(-8, -36, 16, 6); c.fillStyle = '#a0c070'; c.beginPath(); c.arc(0, -34 - Math.abs(Math.sin(t * 3)) * 4, 3, 0, TAU); c.fill(); }
  else if (lk === 'toad') { const fl2 = Math.cos(f) < 0 ? -1 : 1; c.scale(fl2, 1); c.translate(0, -Math.abs(Math.sin(t * 6)) * 5); c.fillStyle = col; c.beginPath(); c.ellipse(0, -8, 15, 10, 0, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#c9a24a'; c.beginPath(); c.arc(7, -15, 3, 0, TAU); c.arc(-2, -16, 3, 0, TAU); c.fill(); c.fillStyle = 'rgba(160,200,90,.6)'; c.beginPath(); c.arc(-6, -6, 3, 0, TAU); c.arc(2, -3, 2.5, 0, TAU); c.fill(); }
  else if (lk === 'crab') { c.fillStyle = col; c.beginPath(); c.ellipse(0, -8, 18, 11, 0, 0, TAU); c.fill(); c.stroke(); for (const sd of [-1, 1]) { for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(sd * 10, -6 + i * 3); c.lineTo(sd * (20 + Math.sin(t * 10 + i) * 2), -2 + i * 4); c.stroke(); } c.beginPath(); c.ellipse(sd * 18, -18, 7, 5, sd * .5, 0, TAU); c.fill(); c.stroke(); } c.fillStyle = INK; c.beginPath(); c.arc(-4, -16, 1.6, 0, TAU); c.arc(4, -16, 1.6, 0, TAU); c.fill(); }
  else if (lk === 'dummy') { c.fillStyle = '#8a6a3a'; c.strokeStyle = INK; c.fillRect(-3, -40, 6, 40); c.strokeRect(-3, -40, 6, 40); c.fillRect(-14, -30, 28, 5); c.strokeRect(-14, -30, 28, 5); c.fillStyle = fl ? '#fff' : '#a88850'; c.beginPath(); c.arc(0, -44, 6, 0, TAU); c.fill(); c.stroke(); }
  c.restore();
}
function drawEnemy(e) {
  const d = e.def, lk = d.look; const x = e.x, y = e.y;
  if (d.ambush && !e.surfaced) { g.strokeStyle = 'rgba(80,120,140,.45)'; g.lineWidth = 2; for (let i = 0; i < 2; i++) { const r = 10 + ((gameT * 20 + i * 14) % 28); g.beginPath(); g.ellipse(x, y, r, r * .45, 0, 0, TAU); g.stroke(); } return; }
  if (e.elite && !e.boss) { g.strokeStyle = e.named ? CIN : GOLD; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y + 2, e.r + 6, (e.r + 6) * .45, 0, 0, TAU); g.stroke(); }
  if (e.st && e.st.freeze > 0) { g.fillStyle = 'rgba(200,225,240,.55)'; g.beginPath(); g.arc(x, y - 14, e.r + 8, 0, TAU); g.fill(); }
  if (e.st && e.st.poison > 0) { g.fillStyle = 'rgba(106,74,122,.25)'; g.beginPath(); g.arc(x, y - 10, e.r + 4, 0, TAU); g.fill(); }
  if (e.boss) { const bd = BOSS[e.bid], sid = e.bid === 'qingxu' ? 'master' : e.bid; const L = Object.assign({}, NPCS[sid] ? NPCS[sid].look : {}, { weapon: bd.weapon, beard: bd.beard }); const yy = y - (e.hop || 0); if (e.ghost) { drawMist(e); return; }
    if (e.hop) { g.fillStyle = 'rgba(29,26,23,.25)'; g.beginPath(); g.ellipse(x, y + 2, e.r * 1.2, e.r * .45, 0, 0, TAU); g.fill(); }
    drawHumanCtx(g, x, yy, e.face, L, { spr: sid, t: e.anim, moving: !!e.act, flash: e.flash, scale: sprImg(sid) ? 1 : e.scale * .9, alpha: e.act && e.act.type === 'clones' && e.act.phase === 'go' ? .5 : 1 }); if (e.act && e.act.clones) for (const cl of e.act.clones) drawHumanCtx(g, cl.x, cl.y, cl.ang, L, { spr: sid, t: e.anim, scale: sprImg(sid) ? 1 : e.scale * .9, alpha: .55 }); if (e.stun > 0) { g.fillStyle = GOLD; g.font = `14px ${FONT}`; g.textAlign = 'center'; g.fillText('暈', x, y - 90); } return; }
  if (lk === 'man' || lk === 'kid') { const NL = e.named && NAMED[e.named].look || {}; const L = Object.assign({ robe: lk === 'kid' ? '#8c2a1a' : d.robe, acc: d.acc, hair: INK, hat: d.hat || 'none', weapon: d.weapon || (lk === 'kid' ? 'none' : e.type === 'blowgun' ? 'dart' : e.type === 'assassin' ? 'sword' : 'blade') }, NL);
    drawHumanCtx(g, x, y, e.face, L, { spr: e.named || e.type, t: e.anim, moving: e.aggro, flash: e.flash, scale: sprImg(e.named || e.type) ? (e.named ? 1 : e.scale || 1) : (lk === 'kid' ? .75 : 1) * (e.scale || 1), swing: e.state === 'wind' ? .9 : 0 });
    if (lk === 'kid') { g.fillStyle = e.state === 'wind' && Math.sin(gameT * 40) > 0 ? '#fff' : CIN; g.beginPath(); g.arc(x + 6, y - 38, 3, 0, TAU); g.fill(); } }
  else if (!drawSprActor(g, x, y, e.face, e.named || e.type, { t: e.anim, moving: e.aggro && e.def.spd > 0, flash: e.flash, scale: e.named ? 1 : (e.scale || 1) })) drawBeast(g, e, x, y);
  const top = y - (lk === 'man' ? 52 : lk === 'sprite' || lk === 'icespirit' ? 50 : lk === 'bear' ? 46 : lk === 'bird' || lk === 'bat' ? 42 : 30) * (e.scale || 1);
  if (e.hp < e.maxHp && lk !== 'dummy') { const w = e.elite ? 46 : 30; g.fillStyle = 'rgba(29,26,23,.35)'; g.fillRect(x - w / 2, top, w, 4); g.fillStyle = e.elite ? CIN : '#5a1416'; g.fillRect(x - w / 2, top, w * clamp(e.hp / e.maxHp, 0, 1), 4); }
  if (e.named || e.affix || e.hunter) { g.font = `${e.named ? 13 : 11}px ${FONT}`; g.textAlign = 'center'; g.fillStyle = e.named ? CIN : '#7a5a20'; g.fillText(e.named ? NAMED[e.named].n : e.hunter || e.affix.join('・'), x, top - 5); }
}

/* ---------- 頭像 ---------- */
const PORT_IMG = {};
// 水墨立繪（ChatGPT 繪製）：img/<id>.jpg 為對話用方形頭像，img/<id>_full.jpg 為半身像
/* 頭像合圖：非主角頭像都在 img/port_sq.jpg、img/port_full.jpg 裡 */
const ATLAS_IMG = {}; const ATLAS_CUT = {};
function atlasImg(full) { const k = full ? 'full' : 'sq'; if (ATLAS_IMG[k] === undefined) { const im = new Image(); ATLAS_IMG[k] = null; im.onload = () => ATLAS_IMG[k] = im; im.onerror = () => ATLAS_IMG[k] = false; im.src = `img/port_${k}.jpg`; } return ATLAS_IMG[k]; }
function atlasCut(id) { if (ATLAS_CUT[id]) return ATLAS_CUT[id]; const full = id.endsWith('_full'), base = full ? id.slice(0, -5) : id, i = PORT_ATLAS.ids.indexOf(base); if (i < 0) return null; const A = atlasImg(full); if (!A) return null;
  const w = full ? 240 : 256, h = full ? 320 : 256, c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(A, (i % PORT_ATLAS.cols) * w, Math.floor(i / PORT_ATLAS.cols) * h, w, h, 0, 0, w, h); ATLAS_CUT[id] = c; return c; }
function portURL(id) { const c = atlasCut(id); if (!c) return ''; if (!c._url) c._url = c.toDataURL('image/jpeg', .85); return c._url; }
function portThumb(id) { const u = portURL(id); return u ? `<img class="thumb" src="${u}" alt="">` : ''; }
const PORTRAIT_FILES = ['master', 'chief', 'innkeeper', 'dojo', 'farmer', 'mojiao', 'merchant', 'mystery', 'drunk', 'liu', 'wanglaosan', 'wolfking', 'qingzhushe', 'duanjianke', 'dog', 'myna', ...(window.PORTRAITS_1B || []), ...(window.PORTRAITS_2A || [])].concat(...['mingmen', 'langzi', 'pantu', 'shaolin'].map(o => [`hero_${o}_m`, `hero_${o}_f`]));
['mingmen', 'langzi', 'pantu', 'shaolin'].forEach(o => ['m', 'f'].forEach(gd => { for (let h = 0; h < 6; h++) if (!(o === 'pantu' && gd === 'f' && h === 0)) PORTRAIT_FILES.push(`hero_${o}_${gd}_h${h}`); }));
PORTRAIT_FILES.forEach(id => { portImg(id); if (!/_h\d$/.test(id)) portImg(id + '_full'); });
function portImg(id) { id = id.replace(/^qingxu/, 'master'); if (PORT_ATLAS.ids.includes(id.replace(/_full$/, ''))) return atlasCut(id); if (!PORTRAIT_FILES.includes(id.replace(/_full$/, ''))) return null; if (PORT_IMG[id] === undefined) { const im = new Image(); PORT_IMG[id] = null; im.onload = () => PORT_IMG[id] = im; im.onerror = () => PORT_IMG[id] = false; im.src = `img/${id}.jpg`; } return PORT_IMG[id]; }
function drawPortraitTo(c, who) {
  if (!c) return; const x = c.getContext('2d'); const w = c.width, h = c.height; x.clearRect(0, 0, w, h);
  let im = who === 'me' ? (portImg(`hero_${S.origin}_${S.gender}_h${S.hair || 0}`) || portImg(`hero_${S.origin}_${S.gender}`)) : portImg(who); if (im && who === 'me') { const pid = portImg(`hero_${S.origin}_${S.gender}_h${S.hair || 0}`) ? `hero_${S.origin}_${S.gender}_h${S.hair || 0}` : null; if (pid) im = tintHero(pid, im, `img/${pid}_m.png`, S.hairCol, S.clothCol); } if (im) { x.drawImage(im, 0, 0, w, h); return; }
  const L = who === 'me' ? lookOf(S) : NPCS[who] ? NPCS[who].look : null; if (!L) return;
  x.fillStyle = 'rgba(29,26,23,.06)'; x.beginPath(); x.arc(w / 2, h / 2, w * .48, 0, TAU); x.fill();
  const sc = h / 32; x.save(); x.translate(w / 2, 46 * sc - h * .02); drawHumanCtx(x, 0, 0, Math.PI / 2, Object.assign({}, L, { weapon: 'none' }), { scale: sc }); x.restore();
}

/* ---------- 開始遊戲 ---------- */
let saveT = 10, lastRegion = null, arenaAskT = 0;
function startGame(s, fresh) {
  if (!s) { toast('存檔讀取失敗', 'red'); return; }
  S = s; S.dead = false; refreshStats(); fogLoad(S.fog); if (!NODES_R.length) genResources();
  P.x = S.px || 4300; P.y = S.py || 3150 + OY; P.hp = maxHp(); P.mp = maxMp(); P.dead = false; E = []; PR = []; FX = []; TIMERS = [];
  $('title').hidden = true; $('create').hidden = true; $('hud').hidden = false; running = true; lastRegion = null;
  const r = claimDaily(); if (r) toast(`每日簽到第 ${S.daily.streak} 天：${Object.keys(r).filter(k => RES[k]).map(k => RES[k].n + ' ' + r[k]).join('、')}`, 'red');
  if (fresh) { banner('青崖山', `第 ${S.gen} 代・${ORIGINS[S.origin].n}`); later(1.2, () => questTalk('master')); }
  else { const m = offlineGain(); if (m) say([{ who: 'narr', t: m }]); if (trk('village').n === 0 && trk('village').s === 0) later(1, () => questTalk('master')); if (chapterDone() && !S.ch2) later(2, startChapter2); if (S.v === 2 && !S.seen1b && trackDone('village')) { S.seen1b = true; later(1.5, () => say([{ who: 'narr', t: '【江湖公告・0.1b】第一章後半開放：黃沙古道、寒江雪嶺、血影教總壇三區，30 個主線節點、三場頭目戰、套裝、奇遇、成就與圖鑑。三護法順序自由，集齊三枚血影令再上總壇。' }])); } }
  S.time = Date.now(); saveGame();
}

/* ---------- 包裝：教學事件 ---------- */
{ const h0 = hurtEnemy; hurtEnemy = function (e, d, o) { if (e.tut) { tutEvent('atk'); e.hp = e.maxHp; } return h0(e, d, o); };
  const d0 = dodge; dodge = function () { const c = P.dodgeT; d0(); if (P.dodgeT > c) tutEvent('dodge'); };
  const u0 = useSkill; useSkill = function (k, a) { const c = P.cd[k]; u0(k, a); if (P.cd[k] > c) tutEvent('skill'); };
  const n0 = hitNode; hitNode = function (nd) { n0(nd); tutEvent('gather'); }; }

/* ---------- 更新 ---------- */
function update(dt) {
  gameT += dt;
  for (let i = TIMERS.length - 1; i >= 0; i--) if (TIMERS[i].t <= gameT) { const f = TIMERS[i].f; TIMERS.splice(i, 1); try { f(); } catch (e) { console.error(e); } }
  if (!running) return;
  tickTime(dt); updPlayer(dt);
  seenT -= dt; const seenUpd = seenT <= 0; if (seenUpd) seenT = .12;
  for (const e of E) { if (e.dead) continue; if (seenUpd || e.seen === undefined) e.seen = e.boss ? true : dist(e, P) > 1600 ? false : losP(e); if (e.def.ai === 'none') { e.flash -= dt; continue; } updEnemy(e, dt); }
  E = E.filter(e => !e.dead); separate(); updProjectiles(dt); updFX(dt); campLogic(dt);
  for (const nd of NODES_R) { nd.shake = Math.max(0, nd.shake - dt); if (!nd.alive) { nd.re -= dt; if (nd.re <= 0) { nd.alive = true; nd.hp = nd.max; } } }
  if (P.slowT > 0) P.slowT = Math.max(0, P.slowT - dt);
  for (const s of STALKS) { if (s.fall > 0) s.fall = Math.max(0, s.fall - dt); if (!s.up) { s.re -= dt; if (s.re <= 0) { s.up = true; s.hp = 3; } } }
  tickCh2(dt); questTick(); tickDisciples(dt); tickMystery(); tickReactions(dt); tickAch(dt);
  if (S.bld.train) gainMastery(S.trainW, TRAIN_RATE[S.bld.train] * dt * .25);
  worldChecks(dt);
  saveT -= dt; if (saveT <= 0) { saveT = 10; saveGame(); }
}
function updPlayer(dt) {
  for (const k in P.cd) P.cd[k] = Math.max(0, P.cd[k] - dt);
  for (const k of ['atkT', 'iframe', 'hurt', 'lock', 'guard', 'invis', 'blockMsg', 'dogT', 'swingT', 'mpMsg']) P[k] = Math.max(0, (P[k] || 0) - dt);
  if (P.dodgeCd > 0) { P.dodgeCd = Math.max(0, P.dodgeCd - dt); if (P.dodgeCd === 0) { const q = qingBook(); P.charges = q && q.attrs.includes('柔') ? 2 : 1; } }
  if (P.comboT > 0) { P.comboT -= dt; if (P.comboT <= 0) P.comboHits = 0; }
  if (P.dead) return;
  const mv = moveVec(); P.moving = 0;
  if (P.dodgeT > 0) { P.dodgeT -= dt; P.x += P.dvx * dt; P.y += P.dvy * dt; dodgeEffects(); }
  else if (P.lock <= 0 && (mv.x || mv.y)) { const sp = moveSpeed() * (P.atkT > 0 && !WEAPONS[S.main].ranged ? .6 : 1) * (P.slowT > 0 ? .6 : 1); P.x += mv.x * sp * dt; P.y += mv.y * sp * dt; if (S.slots.qing) { P.qacc = (P.qacc || 0) + sp * dt; if (P.qacc >= 60) { gainArt(S.slots.qing, Math.round(P.qacc)); P.qacc = 0; } } P.moving = 1; if (P.atkT <= 0 && P.swingT <= 0) P.face = Math.atan2(mv.y, mv.x); }
  P.step += dt * (P.moving ? 1 : 0); collide(P, 16, true);
  if (input.atk && P.atkT <= 0 && P.lock <= 0 && P.dodgeT <= 0) basicAttack();
  if (P.mp < 1 && !P.qixu && !P.dead) { P.qixu = true; toast('內力耗盡・氣虛：攻擊、防禦、身法下降', 'red'); } else if (P.qixu && P.mp >= maxMp() * 0.3) { P.qixu = false; toast('內息回穩'); }
  P.mp = Math.min(maxMp() * (S.zouhuo > 0 ? .5 : 1), P.mp + mpRegen() * dt);
  if (P.poison > 0) { P.poison -= dt; P.hp = Math.max(1, P.hp - P.pdps * dt); if (P.poison <= 0) P.pdps = 0; }
  if (P.home > 0) { if (P.moving || P.hurt > 0 || P.dodgeT > 0) { P.home = 0; toast('回城被打斷'); } else { P.home += dt; if (P.home >= 3) { P.home = 0; travelTo(PLACES.base.x, PLACES.base.y + 160); toast('回到青崖小築'); } } }
  if (P.hp > maxHp()) P.hp = maxHp();
}
function updProjectiles(dt) {
  for (const p of PR) {
    p.t += dt; p.life -= dt;
    if (p.homing && p.owner === 'p') { const e = nearestEnemy(500, p); if (e) { const want = Math.atan2(e.y - p.y, e.x - p.x), sp = Math.hypot(p.vx, p.vy); p.a += clamp(angDiff(want, p.a), -6 * dt, 6 * dt); p.vx = Math.cos(p.a) * sp; p.vy = Math.sin(p.a) * sp; } }
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.owner === 'p') {
      for (const e of E) { if (e.dead || p.hit.has(e) || e.ghost) continue; if (Math.hypot(e.x - p.x, e.y - p.y) < p.r + e.r) { p.hit.add(e); const wf = e.st.freeze > 0; hurtEnemy(e, p.dmg, { attr: p.attr, src: p.src, book: p.book, wid: p.wid, kb: p.kb, freeze: p.freeze, ang: p.a, multi: p.multi }); if (p.onHit) p.onHit(e, wf);
        if (p.heal) P.hp = Math.min(maxHp(), P.hp + maxHp() * p.heal); if (!p.pierce) { p.life = 0; break; } } }
      if (p.life > 0 && p.nodes) for (const nd of NODES_R) { if (nd.alive && Math.hypot(nd.x - p.x, nd.y - p.y) < p.r + nd.r) { hitNode(nd); p.life = 0; break; } }
      if (p.life > 0 && BOSSFIGHT && BOSSFIGHT.bid === 'liu') for (const s of STALKS) if (s.up && Math.hypot(s.x - p.x, s.y - p.y) < p.r + 14) { hitStalk(s); if (!p.pierce) { p.life = 0; break; } }
      if (p.life > 0 && BOSSFIGHT) for (const pr of BOSSFIGHT.props) if (pr.hp > 0 && !p.hit.has(pr) && Math.hypot(pr.x - p.x, pr.y - p.y) < p.r + pr.r) { p.hit.add(pr); hitProp(pr, p.dmg); if (!p.pierce) { p.life = 0; break; } }
    } else if (!P.dead && Math.hypot(P.x - p.x, P.y - p.y) < p.r + 14) { hurtPlayer(p.dmg, p.x - p.vx * .05, p.y - p.vy * .05, p.src); if (p.poison) poisonPlayer(4, p.dmg * .25); if (p.slow) { P.slowT = Math.max(P.slowT || 0, p.slow); } p.life = 0; }
    if (inBlocker(p.x, p.y)) { if (p.owner === 'p') burst(p.x, p.y, 'rgba(60,50,40,.6)', 4); p.life = 0; }
  }
  PR = PR.filter(p => p.life > 0);
}
function areaHit(x, y, r, dmg, o) { for (const e of E) if (!e.dead && Math.hypot(e.x - x, e.y - y) < r + e.r && los(x, y, e.x, e.y)) hurtEnemy(e, dmg, Object.assign({}, o, { ang: Math.atan2(e.y - y, e.x - x) })); }
function updFX(dt) {
  for (const f of FX) {
    f.t += dt;
    if (f.type === 'dot') { f.x += f.vx * dt; f.y += f.vy * dt; f.vx *= .9; f.vy *= .9; }
    if (f.type === 'orbit') { f.tick -= dt; if (f.tick <= 0) { f.tick = .25; for (let i = 0; i < 3; i++) { const a = gameT * 5 + i * TAU / 3; areaHit(P.x + Math.cos(a) * 70, P.y + Math.sin(a) * 70, 18, f.dmg * .45, Object.assign({}, f.o, { kb: 60 })); } } }
    if (f.type === 'qiorb') qiOrbUpd(f, dt);
    if (f.type === 'cloud') { f.x = P.x; f.y = P.y; f.tick -= dt; if (f.tick <= 0) { f.tick = .5; areaHit(f.x, f.y, 150, f.dmg * .3, Object.assign({}, f.o, { kb: 20 })); for (const e of E) if (!e.dead && dist(e, f) < 150) e.st.slow = Math.max(e.st.slow, 1); } }
    if (f.type === 'mist') { f.tick -= dt; if (f.tick <= 0) { f.tick = .5; areaHit(f.x, f.y, f.r, f.dmg, Object.assign({}, f.o, { src: 'dot' })); for (const e of E) if (!e.dead && dist(e, f) < f.r) { e.st.poison = Math.max(e.st.poison, 2); e.st.pdps = Math.max(e.st.pdps, f.dmg * .3); } } }
    if (f.type === 'icetrail') for (const e of E) if (!e.dead && dist(e, f) < 40) e.st.slow = Math.max(e.st.slow, 1.5);
    if (f.type === 'hazard') { f.tick -= dt; if (f.tick <= 0 && dist(P, f) < f.r && P.dodgeT <= 0) { f.tick = .5; if (f.kind === 'ice') { P.slowT = Math.max(P.slowT || 0, 1.2); } else { P.hp -= f.dmg * (1 - damageReduce()); fxText(P.x, P.y - 40, f.kind === 'fire' ? '灼燒' : f.kind === 'poison' ? '毒霧' : '血池', f.kind === 'poison' ? '#5a7a2a' : CIN, 13); if (f.kind === 'poison') poisonPlayer(2, f.dmg * .3); if (P.hp <= 0) playerDown(); } } if (f.kind === 'ice') { const dx = P.x - f.x, dy = P.y - f.y, d = Math.hypot(dx, dy); if (d < f.r + 14 && d > .01 && P.dodgeT <= 0) { P.x = f.x + dx / d * (f.r + 14); P.y = f.y + dy / d * (f.r + 14); } } }
  }
  FX = FX.filter(f => f.t < f.life);
}
function worldChecks(dt) {
  const reg = curRegion();
  if (reg !== lastRegion) { if (lastRegion) banner(regionName(reg), reg === 'secret' ? '秘境' : `建議境界：${REGIONS[reg].realm}`); lastRegion = reg; if (!BOSSFIGHT) music(reg); }
  if (fogReveal(P.x, P.y, 520)) { }
  for (const r of REGION_ORDER) { if (S.stations[r] || !regionOpen(r)) continue; const p = PLACES['station_' + r]; if (dist(P, p) < 300) { S.stations[r] = true; toast(`發現${p.n}：可以快速傳送了`, 'red'); sfx('quest'); } }
  if (reg === 'secret') { const rm = ROOMS.find(rm => P.x > rm.x && P.x < rm.x + rm.w && P.y > rm.y && P.y < rm.y + rm.h); if (rm && !S.secrets[rm.id]) { S.secrets[rm.id] = 1; toast('進入秘境', 'red'); } }
  if (!S.secrets.bamboo_gate && dist(P, CAMPS.secret_bamboo) < 260) S.secrets.bamboo_gate = 1;
  if (P.dodgeT > 0 && !S.encounters.fall && dist(P, PLACES.cliff_edge) < 170 && curWeather() === '雪' && isNight()) encounter('fall');
  if (S.comm && S.comm.def.k === 'deliver' && dist(P, PLACES[S.comm.def.to]) < 130) commDone();
  arenaAskT -= dt;
  for (const bid in ARENAS) { if (BOSSFIGHT || dlg || modal || arenaAskT > 0 || !stepIs('boss', 'id', bid)) continue; const ap = PLACES[ARENAS[bid].place]; if (dist(P, ap) < ARENAS[bid].r - 40) { arenaAskT = 8; const nm = BOSS[bid].short;
    confirmBox(`${ap.n}一片死寂。${nm}就在這裡。現在迎戰？（硬核：此戰若死，存檔將被刪除）`, () => say(BOSS_LINES[bid].before, () => startBoss(bid, false)), () => { const a = Math.atan2(P.y - ap.y, P.x - ap.x); P.x = ap.x + Math.cos(a) * (ARENAS[bid].r + 60); P.y = ap.y + Math.sin(a) * (ARENAS[bid].r + 60); collide(P, 16, true); }, '迎戰', '再準備一下'); } }
  if (S.focus !== focusTrack()) S.focus = focusTrack();
  if (S.pet === 'myna') for (const e of E) if (e.elite && !e.myna && !e.dead && dist(e, P) < 700) { e.myna = 1; toast('八哥：「小心！小心！有高手！」'); }
  if (TUT.on && dist(P, PLACES.train) < 170) tutEvent('move');
  findInteract();
}

/* ---------- 繪圖 ---------- */
function W2S(x, y) { return [(x - camX) * ZOOM + W / 2, (y - camY) * ZOOM + H / 2]; }
function render() {
  g.setTransform(DPR, 0, 0, DPR, 0, 0); g.fillStyle = '#ebe1ca'; g.fillRect(0, 0, W, H);
  if (!S || !running && !S.dead) { return; }
  camX += (P.x - camX) * .18; camY += (P.y - camY) * .18; if (Math.abs(P.x - camX) > 900 || Math.abs(P.y - camY) > 900) { camX = P.x; camY = P.y; }
  const sx = shake > .2 ? rnd(-shake, shake) : 0, sy = shake > .2 ? rnd(-shake, shake) : 0; shake *= .86;
  g.save(); g.translate(W / 2 + sx, H / 2 + sy); g.scale(ZOOM, ZOOM); g.translate(-camX, -camY);
  const vw = W / ZOOM / 2 + 80, vh = H / ZOOM / 2 + 120, vis = (x, y, m) => Math.abs(x - camX) < vw + (m || 0) && Math.abs(y - camY) < vh + (m || 0);
  // 底圖
  const x0 = camX - vw, y0 = camY - vh; g.imageSmoothingEnabled = true;
  g.drawImage(tex, Math.max(0, x0 * TS), Math.max(0, y0 * TS), vw * 2 * TS, vh * 2 * TS, Math.max(0, x0), Math.max(0, y0), vw * 2, vh * 2);
  // 封路
  for (const t of TERRAIN) { if (!vis(t.x + t.w / 2, t.y + t.h / 2, Math.max(t.w, t.h))) continue;
    if (t.t === 'gate' && !S.unlock[t.key || 'bamboo']) { g.fillStyle = 'rgba(70,52,34,.85)'; const vert = t.h > t.w; const len = vert ? t.h : t.w; for (let k = 0; k < len; k += 34) { g.save(); if (vert) g.translate(t.x + t.w / 2, t.y + k + 16); else g.translate(t.x + k + 16, t.y + t.h / 2); g.rotate((vert ? 0 : Math.PI / 2) + .4 * ((k / 34) % 2 ? 1 : -1)); g.fillRect(-90 * (vert ? 1 : .5), -7, 180 * (vert ? 1 : .5), 14); g.restore(); } g.fillStyle = CIN; g.font = `18px ${FONT}`; g.textAlign = 'center'; g.fillText('落石封路', t.x + t.w / 2, t.y - 10); }
    if (t.t === 'barrier' && !S.cultOpen) { const pul = .45 + Math.sin(gameT * 3) * .15; g.fillStyle = `rgba(150,20,20,${pul})`; g.fillRect(t.x, t.y - 60, t.w, t.h + 60); g.strokeStyle = 'rgba(220,60,40,.8)'; g.lineWidth = 2; for (let k = 0; k < 6; k++) { const xx = t.x + (k + .5) * t.w / 6; g.beginPath(); g.moveTo(xx, t.y - 60); g.quadraticCurveTo(xx + Math.sin(gameT * 2 + k) * 10, t.y - 20, xx, t.y + t.h); g.stroke(); } g.fillStyle = CIN; g.font = `18px ${FONT}`; g.textAlign = 'center'; g.fillText(`血色結界（血影令 ${S.tokens}/3）`, t.x + t.w / 2, t.y - 72); } }
  drawCircles(); drawCh2Ground(vis);
  // 地上的東西（依 y 排序）
  const list = [];
  for (const nd of NODES_R) if (nd.alive && vis(nd.x, nd.y)) list.push({ y: nd.y, f: () => drawNode(nd) });
  for (const k in PLACES) { const p = PLACES[k]; if (vis(p.x, p.y, 100)) list.push({ y: p.y, f: () => drawPlace(k, p) }); }
  for (const k in BLD_POS) { const b = BLD_POS[k]; if (vis(b.x, b.y, 160)) list.push({ y: b.y, f: () => drawBld(k) }); }
  for (const b of VILLAGE_BLDS) if (vis(b.x, b.y, 200)) list.push({ y: b.y, f: () => drawVillage(b) });
  for (const b of CITY_BLDS) if (vis(b.x, b.y, 200)) list.push({ y: b.y, f: () => drawVillage(b) });
  for (const d of DECOR) if (vis(d.x, d.y, 120)) list.push({ y: d.y, f: () => drawStatic(SPR_IMG[d.id] === false ? DECOR_FALLBACK[d.id] || 'rock' : d.id, d.x, d.y + 4, null, { scale: d.s, flip: d.flip }) });
  for (const id in STELES) { const s = STELES[id]; if (vis(s.x, s.y)) list.push({ y: s.y, f: () => drawStele(id, s) }); }
  for (const id in CHESTS) { if (S.chests[id]) continue; const c = CHESTS[id]; if (vis(c.x, c.y)) list.push({ y: c.y, f: () => drawChest(c) }); }
  if (BOSSFIGHT && BOSSFIGHT.bid === 'liu' || !BOSSFIGHT && dist(P, PLACES.arena) < 1400) for (const s of STALKS) if (vis(s.x, s.y)) list.push({ y: s.y, f: () => drawStalk(s) });
  if (BOSSFIGHT) { const F = BOSSFIGHT; for (const h of F.holes) list.push({ y: -1e9 + h.y, f: () => drawHole(h) }); for (const pl of F.pillars) list.push({ y: pl.y, f: () => drawPillar(pl) }); for (const pr of F.props) list.push({ y: pr.y, f: () => drawPool(pr) }); if (F.tether) list.push({ y: 1e9, f: () => drawTether(F) }); }
  else for (const bid in ARENAS) { const A = ARENAS[bid], ap = PLACES[A.place]; if (!vis(ap.x, ap.y, A.r)) continue; if (A.pillars) for (const [dx, dy] of A.pillars) list.push({ y: ap.y + dy, f: () => drawPillar({ x: ap.x + dx, y: ap.y + dy, r: 28 }) }); if (A.pools) for (const [dx, dy] of A.pools) list.push({ y: ap.y + dy, f: () => drawPool({ x: ap.x + dx, y: ap.y + dy, r: 34, hp: 1, max: 1 }) }); }
  { const m = merchantPos(); if (S.stations[merchantStation()] && vis(m.x, m.y)) list.push({ y: m.y, f: () => npcAt(m.x, m.y, 'merchant', Math.PI / 2, '行商 老錢') }); }
  if (MYSTERY.active && vis(MYSTERY.x, MYSTERY.y)) list.push({ y: MYSTERY.y, f: () => npcAt(MYSTERY.x, MYSTERY.y, 'mystery', Math.PI / 2, '神秘商人') });
  for (const f of FX) if (f.type === 'splat') list.push({ y: -1e9 + f.y, f: () => drawFX(f) });
  for (const e of E) if (!e.dead && vis(e.x, e.y) && e.seen !== false) list.push({ y: e.y, f: () => drawEnemy(e) });
  for (const e of E) if (!e.dead && vis(e.x, e.y) && e.seen !== false) drawTele(e);
  if (BOSSFIGHT) { const F = BOSSFIGHT; g.strokeStyle = { liu: 'rgba(63,107,90,.45)', tieba: 'rgba(120,90,50,.5)', gusou: 'rgba(80,120,150,.5)', li: 'rgba(150,30,30,.5)' }[F.bid] || 'rgba(63,107,90,.45)'; g.setLineDash([14, 10]); g.lineWidth = 3; g.beginPath(); g.arc(F.cx, F.cy, F.r + 40, 0, TAU); g.stroke(); g.setLineDash([]); }
  if (!P.dead) list.push({ y: P.y, f: drawPlayer });
  if (S.pet) list.push({ y: P.y - 1, f: drawPet });
  list.sort((a, b) => a.y - b.y); for (const it of list) it.f();
  if (P.qixu && !P.dead) { g.font = `bold 14px ${FONT}`; g.textAlign = 'center'; g.fillStyle = `rgba(90,20,22,${.6 + Math.sin(gameT * 6) * .3})`; g.fillText('氣虛', P.x, P.y - 78); }
  for (const p of PR) if (p.owner === 'p' || losP(p)) drawProj(p);
  drawShadows(vis);
  if (!P.dead && BLK().some(t => P.x > t.x - 60 && P.x < t.x + t.w + 60 && P.y > t.y - 20 && P.y < t.y + t.h + 120)) { if (S.pet) drawPet(); drawPlayer(); }
  for (const f of FX) if (f.type !== 'splat') drawFX(f);
  drawCh2Top(vis);
  // 任務標記
  const QT = SET.arrow && !P.dead ? questTargets() : []; for (const op of QT) { if (op.minor) continue; const pul = 1 + Math.sin(gameT * 4) * .15; g.strokeStyle = op.col; g.lineWidth = 3; g.beginPath(); g.arc(op.x, op.y, 46 * pul, 0, TAU); g.stroke(); }
  g.restore();
  // 夜晚、天氣
  if (isNight() && curRegion() !== 'secret') { const [px, py] = W2S(P.x, P.y); const nv = S.pet === 'fox' ? 1.35 : 1; const gr = g.createRadialGradient(px, py, 90 * ZOOM * nv, px, py, 560 * ZOOM * nv); gr.addColorStop(0, 'rgba(14,18,36,0)'); gr.addColorStop(1, 'rgba(14,18,36,.62)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
  if (curRegion() === 'secret') { g.fillStyle = 'rgba(30,24,20,.18)'; g.fillRect(0, 0, W, H); }
  drawWeather(); drawCh2Screen();
  if (curWeather() === '雨' && SET.quality === 'high') { g.strokeStyle = 'rgba(70,80,95,.35)'; g.lineWidth = 1; g.beginPath(); for (let i = 0; i < 90; i++) { const rx = (i * 137 + gameT * 900) % (W + 100) - 50, ry = (i * 251 + gameT * 1400) % (H + 60) - 30; g.moveTo(rx, ry); g.lineTo(rx - 6, ry + 16); } g.stroke(); }
  QT.filter(o => !o.minor).forEach(drawArrow);
  if (closeup) drawCloseup();
  drawMini();
}
function npcAt(x, y, id, face, label) { drawHumanCtx(g, x, y, face, Object.assign({ weapon: 'none' }, NPCS[id].look), { spr: id, t: gameT }); if (label && dist(P, { x, y }) < 260) { g.font = `13px ${FONT}`; g.textAlign = 'center'; g.fillStyle = INK; g.fillText(label, x, y - 54); } }
function label(t, x, y, col) { g.font = `13px ${FONT}`; g.textAlign = 'center'; g.fillStyle = col || INK; g.fillText(t, x, y); }
const NPC_HIDE = { mojiao: () => S.events.mojiao === 'done', caravan: () => S.events.caravan === 'done', oldman: () => S.events.oldman === 'done', fisher: () => !!S.bossDead.gusou || stepIs('boss', 'id', 'gusou'), mole: () => !S.cultOpen };
const EVENT_NPCS = ['farmer', 'mojiao', 'caravan', 'oldman'];
function placeVisible(k, p) { if (p.room) return true; const r = regionAt(p.x, p.y); return regionOpen(r) || k === 'gate'; }
function drawPlace(k, p) {
  const x = p.x, y = p.y; g.strokeStyle = INK; g.lineWidth = 1.5;
  if (!placeVisible(k, p)) return;
  if (drawPlace2(k, p)) return;
  if (k === 'base' && drawStatic('b_base', x, y + 8)) { label('青崖小築', x, y + 26, CIN); return; }
  if (k === 'base') { g.fillStyle = 'rgba(228,215,184,.95)'; g.fillRect(x - 110, y - 70, 220, 70); g.strokeRect(x - 110, y - 70, 220, 70); g.fillStyle = INK; g.beginPath(); g.moveTo(x - 135, y - 66); g.lineTo(x - 90, y - 112); g.lineTo(x + 90, y - 112); g.lineTo(x + 135, y - 66); g.closePath(); g.fill(); g.fillStyle = CIN; g.fillRect(x - 20, y - 40, 40, 40);
    g.fillStyle = PAPER; g.font = `16px ${FONT}`; g.textAlign = 'center'; g.fillText('青崖小築', x, y - 82); return; }
  if (k === 'train') { g.strokeStyle = 'rgba(29,26,23,.35)'; g.setLineDash([8, 6]); g.strokeRect(x - 150, y - 130, 300, 230); g.setLineDash([]); if (S.bld.train) for (let i = -1; i <= 1; i++) { if (TUT.on) break; if (!drawStatic('dummy', x + i * 70, y - 70)) { g.fillStyle = '#8a6a3a'; g.fillRect(x + i * 70 - 3, y - 110, 6, 40); g.fillRect(x + i * 70 - 12, y - 102, 24, 4); } } label(S.bld.train ? `練武場 ${S.bld.train} 級` : '練武場（荒廢）', x, y + 118); return; }
  if (k === 'tomb' && drawStatic('tomb', x, y + 20)) { label('英雄榜・歷代墓碑', x, y + 40); return; }
  if (k === 'tomb') { const n = Math.min(8, loadHeroes().length + 1); for (let i = 0; i < n; i++) { const tx = x - 70 + (i % 4) * 46, ty = y - 20 + Math.floor(i / 4) * 40; g.fillStyle = '#9a948a'; g.fillRect(tx - 9, ty - 26, 18, 26); g.strokeRect(tx - 9, ty - 26, 18, 26); } label('英雄榜・歷代墓碑', x, y + 40); return; }
  if (p.station && drawStatic(p.station === 'sand' && SPR_IMG.sand_station !== false ? 'sand_station' : 'pavilion', x, y + 10, p.station === 'sand' ? 190 : null)) { label(p.n, x, y + 28, S.stations[p.station] ? INK : '#8a8278'); return; }
  if (p.station) { g.fillStyle = 'rgba(29,26,23,.85)'; g.beginPath(); g.moveTo(x - 60, y - 60); g.lineTo(x, y - 92); g.lineTo(x + 60, y - 60); g.fill(); g.fillStyle = '#6b4a2a'; g.fillRect(x - 46, y - 60, 6, 60); g.fillRect(x + 40, y - 60, 6, 60); label(p.n, x, y + 18, S.stations[p.station] ? INK : '#8a8278'); return; }
  if (p.npc) { if (NPC_HIDE[p.npc] && NPC_HIDE[p.npc]()) return; if (p.npc === 'farmer' && S.events.farmer === 'done') { npcAt(x, y, 'farmer', Math.PI / 2); return; } if (p.npc === 'innkeeper') { g.fillStyle = CIN; g.fillRect(x - 6, y - 110, 12, 30); }
    if (k === 'ice_cave') drawCave(x, y - 30); if (k === 'fisher') drawBoat(x, y); if (k === 'ferry') drawStatic('dock', x + 110, y + 30, 170);
    npcAt(x, y, p.npc, Math.PI / 2, NPCS[p.npc].n);
    const isEv = EVENT_NPCS.includes(p.npc) && S.events[p.npc] !== 'done';
    if (stepIs('talk', 'npc', p.npc) || isEv) { g.fillStyle = GOLD; g.font = `bold 22px ${FONT}`; g.textAlign = 'center'; g.fillText(stepIs('talk', 'npc', p.npc) ? '！' : '？', x, y - 70 + Math.sin(gameT * 4) * 3); } return; }
  if (k.startsWith('board_') && drawStatic('board', x, y + 6)) { label('告示板', x, y + 22); return; }
  if (k.startsWith('board_')) { g.fillStyle = '#8a6a3a'; g.fillRect(x - 3, y - 40, 6, 40); g.fillStyle = '#e4d7b8'; g.fillRect(x - 26, y - 62, 52, 30); g.strokeRect(x - 26, y - 62, 52, 30); label('告示板', x, y + 16); return; }
  if (k === 'dog') { if (S.pets.includes('dog')) return; drawDog(x, y, Math.PI); return; }
  if (k === 'sword_tomb' && drawStatic('swordtomb', x, y + 30)) { label('劍冢殘碑', x, y + 46); return; }
  if (k === 'sword_tomb') { for (let i = 0; i < 9; i++) { const a = i * 0.7, r = 20 + i * 7; g.save(); g.translate(x + Math.cos(a) * r, y + Math.sin(a) * r * .5); g.rotate(-.2 + (i % 3) * .15); g.strokeStyle = '#4a4540'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -34); g.stroke(); g.strokeStyle = GOLD; g.lineWidth = 2; g.beginPath(); g.moveTo(-5, -26); g.lineTo(5, -26); g.stroke(); g.restore(); } label('劍冢殘碑', x, y + 40); return; }
  if (k === 'blade_tomb') { if (!drawStatic('bladetomb', x, y + 20, 170)) { g.fillStyle = '#c9b78a'; g.beginPath(); g.ellipse(x, y, 80, 34, 0, 0, TAU); g.fill(); g.stroke(); g.fillStyle = '#8a847a'; g.fillRect(x - 18, y - 70, 36, 60); g.strokeRect(x - 18, y - 70, 36, 60); g.save(); g.translate(x + 40, y - 10); g.rotate(.5); g.strokeStyle = '#3a3330'; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -60); g.stroke(); g.restore(); } label('刀客墓', x, y + 40); return; }
  if (k === 'oasis') { g.fillStyle = 'rgba(110,150,160,.55)'; g.beginPath(); g.ellipse(x, y, 90, 40, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(60,80,70,.6)'; g.stroke(); if (!drawStatic('deadtree', x + 80, y - 10, 90)) { } label('沙中水源', x, y + 60); return; }
  if (k === 'well' || k === 'well_exit' || k === 'ice_exit' || k === 'ruin_exit' || k === 'cellar_exit' || k === 'sand_ruin' || k === 'blood_cellar' || k === 'ice_hole') { drawEntrance(k, x, y); label(p.n, x, y + 38); return; }
  if (p.arena) { const bid = p.arena; if (stepIs('boss', 'id', bid) || BOSSFIGHT && BOSSFIGHT.bid === bid) { g.strokeStyle = 'rgba(140,40,30,.35)'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, ARENAS[bid].r, 0, TAU); g.stroke(); } if (!BOSSFIGHT) label(p.n, x, y - ARENAS[bid].r - 20, '#5a1416'); return; }
  if (k === 'scripture' || k === 'prison' || k === 'chamber') { if (!S.cultOpen) return; if (!drawStatic(k === 'prison' ? 'b_prison' : 'b_cultbld', x, y + 8, 180)) { g.fillStyle = 'rgba(70,24,22,.92)'; g.fillRect(x - 70, y - 60, 140, 60); g.strokeRect(x - 70, y - 60, 140, 60); g.fillStyle = INK; g.beginPath(); g.moveTo(x - 86, y - 56); g.lineTo(x - 60, y - 92); g.lineTo(x + 60, y - 92); g.lineTo(x + 86, y - 56); g.closePath(); g.fill(); g.fillStyle = CIN; g.fillRect(x - 12, y - 34, 24, 34); } label(p.n, x, y + 22, '#5a1416'); return; }
  if (k === 'boatman') { g.fillStyle = 'rgba(40,70,95,.6)'; g.beginPath(); g.ellipse(x, y, 46, 22, 0, 0, TAU); g.fill(); if (stepIs('reach', 'place', 'boatman')) npcAt(x, y - 4, 'boatman', Math.PI / 2); label(p.n, x, y + 34); return; }
  if (k === 'cliff_edge' || k === 'valley_mouth' || k === 'barrier_gate') { label(p.n, x, y - 10, '#6a645a'); return; }
};
function drawCave(x, y) { if (drawStatic('icecave', x, y + 40, 200)) return; g.fillStyle = 'rgba(200,220,232,.9)'; g.beginPath(); g.moveTo(x - 90, y + 40); g.quadraticCurveTo(x - 80, y - 60, x, y - 70); g.quadraticCurveTo(x + 80, y - 60, x + 90, y + 40); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#1d2a33'; g.beginPath(); g.ellipse(x, y + 30, 36, 44, 0, Math.PI, 0); g.fill(); }
function drawBoat(x, y) { if (drawStatic('frozenboat', x, y + 34, 190)) return; g.fillStyle = 'rgba(40,70,95,.55)'; g.beginPath(); g.ellipse(x + 40, y + 6, 16, 8, 0, 0, TAU); g.fill(); g.fillStyle = '#6b4a2a'; g.strokeStyle = INK; g.beginPath(); g.moveTo(x - 70, y - 4); g.quadraticCurveTo(x, y + 26, x + 70, y - 4); g.lineTo(x + 56, y + 8); g.lineTo(x - 56, y + 8); g.closePath(); g.fill(); g.stroke(); g.strokeStyle = '#3a3330'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x + 10, y - 30); g.quadraticCurveTo(x + 40, y - 70, x + 40, y + 4); g.stroke(); }
function drawEntrance(k, x, y) { if ((k === 'well' || k === 'well_exit') && drawStatic('well', x, y + 20)) return;
  if (k === 'sand_ruin') { if (drawStatic('ruin', x, y + 20, 200)) return; g.fillStyle = '#b89a6a'; for (let i = -2; i <= 2; i++) { g.fillRect(x + i * 34 - 12, y - 30 - Math.abs(i) * -6, 24, 30 + (2 - Math.abs(i)) * 10); } g.fillStyle = '#1d1a17'; g.fillRect(x - 14, y - 22, 28, 22); return; }
  if (k === 'ice_hole') { g.fillStyle = 'rgba(30,55,75,.75)'; g.beginPath(); g.ellipse(x, y, 40, 20, 0, 0, TAU); g.fill(); g.strokeStyle = '#e6f2fa'; g.lineWidth = 2; g.stroke(); return; }
  if (k === 'blood_cellar') { g.fillStyle = '#2a1414'; g.beginPath(); g.moveTo(x - 40, y); g.lineTo(x - 24, y - 26); g.lineTo(x + 24, y - 26); g.lineTo(x + 40, y); g.closePath(); g.fill(); g.strokeStyle = CIN; g.stroke(); return; }
  g.fillStyle = '#7a7268'; g.beginPath(); g.ellipse(x, y, 34, 16, 0, 0, TAU); g.fill(); g.stroke(); g.fillStyle = '#1d1a17'; g.beginPath(); g.ellipse(x, y - 2, 24, 10, 0, 0, TAU); g.fill(); }
function drawBld(k) {
  const p = BLD_POS[k], x = p.x, y = p.y, l = S.bld[k], n = BUILDINGS[k].n, w = k === 'hall' ? 170 : 120;
  if (l && drawStatic('b_' + k, x, y + 8)) { label(`${n}・${l} 級`, x, y + 24, INK); return; }
  if (!l) { g.strokeStyle = 'rgba(29,26,23,.4)'; g.setLineDash([6, 6]); g.lineWidth = 1.5; g.strokeRect(x - w / 2, y - 50, w, 50); g.setLineDash([]); g.fillStyle = 'rgba(29,26,23,.25)'; for (let i = 0; i < 4; i++) g.fillRect(x - w / 2 + 10 + i * (w - 20) / 3 - 3, y - 8, 6, 8); label(`${n}（空地）`, x, y - 20, '#6a645a'); return; }
  g.strokeStyle = INK; g.lineWidth = 1.5; g.fillStyle = 'rgba(228,215,184,.95)'; g.fillRect(x - w / 2, y - 50, w, 50); g.strokeRect(x - w / 2, y - 50, w, 50);
  g.fillStyle = k === 'hall' ? INK : 'rgba(29,26,23,.88)'; g.beginPath(); g.moveTo(x - w / 2 - 14, y - 48); g.lineTo(x - w / 2 + 16, y - 82); g.lineTo(x + w / 2 - 16, y - 82); g.lineTo(x + w / 2 + 14, y - 48); g.closePath(); g.fill();
  g.fillStyle = k === 'herbal' || k === 'alchemy' ? JADE : k === 'smith' ? '#4a4540' : CIN; g.fillRect(x - 13, y - 30, 26, 30);
  if (k === 'smith') { g.fillStyle = 'rgba(179,38,30,.6)'; g.beginPath(); g.arc(x + w / 2 - 18, y - 12, 6 + Math.sin(gameT * 9) * 1.5, 0, TAU); g.fill(); }
  if (k === 'alchemy' || k === 'herbal') { g.strokeStyle = 'rgba(120,120,120,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + w / 2 - 20, y - 82); g.quadraticCurveTo(x + w / 2 - 10 + Math.sin(gameT * 2) * 6, y - 100, x + w / 2 - 18, y - 118); g.stroke(); }
  g.fillStyle = PAPER; g.font = `14px ${FONT}`; g.textAlign = 'center'; g.fillText(n, x, y - 60); label(`${l} 級`, x - w / 2 + 16, y - 8, '#6a645a');
}
function drawVillage(b) {
  if (drawStatic(b.id, b.x, b.y + 8, b.w)) return; const x = b.x, y = b.y, w = b.w * .7;
  g.strokeStyle = INK; g.lineWidth = 1.5; g.fillStyle = 'rgba(228,215,184,.95)'; g.fillRect(x - w / 2, y - 50, w, 50); g.strokeRect(x - w / 2, y - 50, w, 50);
  g.fillStyle = 'rgba(29,26,23,.85)'; g.beginPath(); g.moveTo(x - w / 2 - 14, y - 48); g.lineTo(x - w / 2 + 14, y - 80); g.lineTo(x + w / 2 - 14, y - 80); g.lineTo(x + w / 2 + 14, y - 48); g.closePath(); g.fill();
  if (b.id === 'inn' || b.id === 'dojo_bld') { g.fillStyle = PAPER; g.font = `14px ${FONT}`; g.textAlign = 'center'; g.fillText(b.id === 'inn' ? '落霞客棧' : '武館', x, y - 58); }
}
function drawCircles() {
  for (const ci of CIRCLES) { g.lineWidth = ci.on ? 3 : 1.6; g.strokeStyle = ci.on ? GOLD : 'rgba(29,26,23,.28)'; g.fillStyle = ci.on ? 'rgba(160,127,60,.12)' : 'rgba(29,26,23,.03)'; g.setLineDash(ci.on ? [] : [7, 7]); g.beginPath(); g.ellipse(ci.x, ci.y, ci.r, ci.r * .55, 0, 0, TAU); g.fill(); g.stroke(); }
  g.setLineDash([]);
}
function drawDog(x, y, f) { if (drawSprActor(g, x, y, f, 'dog', { t: gameT, moving: true })) return; g.save(); g.translate(x, y); g.fillStyle = 'rgba(29,26,23,.18)'; g.beginPath(); g.ellipse(0, 2, 12, 4, 0, 0, TAU); g.fill(); const fl = Math.cos(f) < 0 ? -1 : 1; g.scale(fl, 1); g.fillStyle = '#b8873a'; g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.ellipse(0, -9, 11, 6, 0, 0, TAU); g.fill(); g.stroke(); g.beginPath(); g.arc(10, -15, 5, 0, TAU); g.fill(); g.stroke(); g.beginPath(); g.moveTo(-10, -11); g.lineTo(-16, -18 + Math.sin(gameT * 12) * 3); g.stroke(); g.fillRect(-7, -4, 3, 5); g.fillRect(5, -4, 3, 5); g.restore(); }
let petPos = { x: 0, y: 0 };
function drawPet() { const tx = P.x - Math.cos(P.face) * 40, ty = P.y - Math.sin(P.face) * 40 + 10; if (Math.hypot(petPos.x - tx, petPos.y - ty) > 600) { petPos.x = tx; petPos.y = ty; } petPos.x += (tx - petPos.x) * .08; petPos.y += (ty - petPos.y) * .08;
  if (S.pet === 'dog') drawDog(petPos.x, petPos.y, P.face); else if (!drawSprActor(g, petPos.x, petPos.y - 34 + Math.sin(gameT * 6) * 4, P.face, 'myna', { t: gameT })) { g.fillStyle = INK; g.beginPath(); g.ellipse(petPos.x, petPos.y - 40 + Math.sin(gameT * 6) * 4, 7, 5, 0, 0, TAU); g.fill(); g.fillStyle = GOLD; g.beginPath(); g.arc(petPos.x + 6, petPos.y - 41, 2, 0, TAU); g.fill(); } }
function drawStele(id, s) { if (!regionOpen(RUMORS[id].region) && id !== 'stonegate') return; if (drawStatic('stele', s.x, s.y + 4, null, { alpha: S.rumors[id] ? .8 : 1 })) { if (!S.rumors[id]) { g.fillStyle = GOLD; g.font = `bold 16px ${FONT}`; g.textAlign = 'center'; g.fillText('碑', s.x, s.y - 70 + Math.sin(gameT * 3) * 2); } return; } g.fillStyle = S.rumors[id] ? '#8a847a' : '#6a645a'; g.strokeStyle = INK; g.lineWidth = 1.4; g.beginPath(); g.moveTo(s.x - 14, s.y); g.lineTo(s.x - 12, s.y - 40); g.quadraticCurveTo(s.x, s.y - 48, s.x + 12, s.y - 40); g.lineTo(s.x + 14, s.y); g.closePath(); g.fill(); g.stroke(); if (!S.rumors[id]) { g.fillStyle = GOLD; g.font = `bold 16px ${FONT}`; g.textAlign = 'center'; g.fillText('碑', s.x, s.y - 52 + Math.sin(gameT * 3) * 2); } }
function drawChest(c) { if (drawStatic(c.rich ? 'chest_rich' : 'chest', c.x, c.y + 4)) { if (Math.sin(gameT * 3 + c.x) > .7) { g.fillStyle = 'rgba(201,162,74,.7)'; g.beginPath(); g.arc(c.x + 14, c.y - 40, 3, 0, TAU); g.fill(); } return; } g.fillStyle = c.rich ? '#8c2a1a' : '#6b4a2a'; g.strokeStyle = INK; g.lineWidth = 1.5; g.fillRect(c.x - 16, c.y - 20, 32, 20); g.strokeRect(c.x - 16, c.y - 20, 32, 20); g.fillStyle = GOLD; g.fillRect(c.x - 3, c.y - 14, 6, 6); if (Math.sin(gameT * 3 + c.x) > .7) { g.fillStyle = 'rgba(201,162,74,.6)'; g.beginPath(); g.arc(c.x + 10, c.y - 24, 3, 0, TAU); g.fill(); } }
function drawStalk(s) { const fallA = s.up ? 0 : s.fall > 0 ? (1 - s.fall) * Math.PI / 2 : null; if (fallA === null) { g.fillStyle = '#4a6a46'; g.beginPath(); g.arc(s.x, s.y, 6, 0, TAU); g.fill(); return; }
  g.save(); g.translate(s.x, s.y); if (!s.up) g.rotate((Math.cos(s.ang) >= 0 ? 1 : -1) * fallA); g.strokeStyle = s.hp < 3 && s.up ? '#6a8a50' : '#3f5a3a'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -120); g.stroke(); g.strokeStyle = 'rgba(29,26,23,.5)'; g.lineWidth = 1; for (let yy = -20; yy > -120; yy -= 22) { g.beginPath(); g.moveTo(-5, yy); g.lineTo(5, yy); g.stroke(); } g.restore();
  if (s.up && BOSSFIGHT) label(`${'｜'.repeat(s.hp)}`, s.x, s.y + 16, '#3f5a3a'); }
function drawNode(nd) {
  const x = nd.x + (nd.shake > 0 ? Math.sin(gameT * 80) * 3 : 0), y = nd.y;
  { const R = nd.region, id = nd.kind === 'wood' ? ({ bamboo: 'bamboo', sand: 'poplar', snow: 'snowpine', cult: 'deadtree' }[R] || 'tree') : nd.kind === 'herb' ? ({ sand: 'shaji_herb', snow: 'xuelian_herb', cult: 'bloodherb' }[R] || 'herb') : ({ snow: 'snowore', cult: 'bloodore' }[R] || 'ore');
    if (!sprImg(id) && sprImg(nd.kind === 'wood' ? (R === 'snow' ? 'pine' : 'tree') : nd.kind === 'herb' ? 'herb' : 'ore') && drawStatic(nd.kind === 'wood' ? (R === 'snow' ? 'pine' : 'tree') : nd.kind === 'herb' ? 'herb' : 'ore', x, y + 6, null, { scale: .85 + nd.seed * .3, flip: nd.seed > .5, alpha: nd.hp < nd.max ? .75 + .25 * nd.hp / nd.max : 1 })) return;
    if (drawStatic(id, x, y + 6, null, { scale: .85 + nd.seed * .3, flip: nd.seed > .5, alpha: nd.hp < nd.max ? .75 + .25 * nd.hp / nd.max : 1 })) return; } g.strokeStyle = INK; g.lineWidth = 1.4;
  if (nd.kind === 'wood') { if (nd.region === 'bamboo') { g.strokeStyle = '#3f5a3a'; g.lineWidth = 5; for (const dx of [-8, 0, 8]) { g.beginPath(); g.moveTo(x + dx, y); g.lineTo(x + dx * 1.4, y - 70 - dx); g.stroke(); } g.fillStyle = 'rgba(63,90,58,.6)'; g.beginPath(); g.ellipse(x, y - 70, 24, 10, 0, 0, TAU); g.fill(); }
    else { g.fillStyle = '#5a4430'; g.fillRect(x - 4, y - 36, 8, 36); g.fillStyle = 'rgba(55,70,48,.85)'; g.beginPath(); g.arc(x, y - 46, 22, 0, TAU); g.arc(x - 14, y - 34, 14, 0, TAU); g.arc(x + 14, y - 34, 14, 0, TAU); g.fill(); g.stroke(); } }
  else if (nd.kind === 'herb') { g.strokeStyle = '#3f6b5a'; g.lineWidth = 2; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + i * 6, y - 10, x + i * 8, y - 18); g.stroke(); } g.fillStyle = CIN; g.beginPath(); g.arc(x, y - 20, 3, 0, TAU); g.fill(); }
  else { g.fillStyle = '#5a6068'; g.beginPath(); g.moveTo(x - 20, y); g.lineTo(x - 14, y - 20); g.lineTo(x + 2, y - 26); g.lineTo(x + 18, y - 14); g.lineTo(x + 20, y); g.closePath(); g.fill(); g.stroke(); g.strokeStyle = '#c9d0d8'; g.beginPath(); g.moveTo(x - 6, y - 16); g.lineTo(x + 4, y - 10); g.stroke(); }
}
function drawPlayer() {
  const L = lookOf(S); L.weapon = S.main; const flick = P.iframe > 0 && P.hurt > 0 && Math.sin(gameT * 50) > 0;
  if (P.guard > 0) { g.strokeStyle = 'rgba(201,162,74,.6)'; g.lineWidth = 3; g.beginPath(); g.arc(P.x, P.y - 18, 30, 0, TAU); g.stroke(); }
  if (S.zouhuo > 0) { g.fillStyle = 'rgba(140,20,10,.18)'; g.beginPath(); g.arc(P.x, P.y - 18, 32 + Math.sin(gameT * 10) * 4, 0, TAU); g.fill(); }
  if (S.ch2) drawAura();
  const hf = heroFrame(); drawHumanCtx(g, P.x, P.y, P.face, L, { spr: hf, weaponOver: hf === heroSpr(S) || S.main !== ORIGIN_WPN[S.origin], t: P.step, moving: P.moving && !hf.endsWith('_run'), flash: P.hurt, swing: P.swingT > 0 ? P.swingT / .18 : 0, alpha: P.invis > 0 ? .35 : flick ? .5 : 1 });
  if (P.home > 0) { g.strokeStyle = GOLD; g.lineWidth = 3; g.beginPath(); g.arc(P.x, P.y - 18, 34, -Math.PI / 2, -Math.PI / 2 + TAU * P.home / 3); g.stroke(); }
  if (AIM.key && AIM.out && !AIM.cancel) { g.strokeStyle = 'rgba(140,40,30,.5)'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(P.x, P.y - 10); g.lineTo(P.x + Math.cos(AIM.ang) * 260, P.y - 10 + Math.sin(AIM.ang) * 260); g.stroke(); }
}
function drawTele(e) {
  g.fillStyle = 'rgba(160,30,20,.22)'; g.strokeStyle = 'rgba(160,30,20,.5)'; g.lineWidth = 2;
  if (!e.boss && e.state === 'wind') { const d = e.def;
    if (d.ai === 'spike') { g.beginPath(); g.arc(e.sx, e.sy, 70, 0, TAU); g.fill(); g.stroke(); }
    else if (d.ai === 'bomb') { g.beginPath(); g.arc(e.x, e.y, 95, 0, TAU); g.fill(); g.stroke(); }
    else if (e.dashing) { g.save(); g.translate(e.x, e.y); g.rotate(e.face); g.fillRect(0, -e.r, 130, e.r * 2); g.restore(); }
    else if (d.ai === 'ranged') { g.save(); g.translate(e.x, e.y); g.rotate(Math.atan2(P.y - e.y, P.x - e.x)); g.fillRect(0, -3, 300, 6); g.restore(); }
    else { g.beginPath(); g.moveTo(e.x, e.y); g.arc(e.x, e.y, e.r + 46, e.face - .8, e.face + .8); g.closePath(); g.fill(); } }
  if (e.boss && e.act) { const a = e.act, k = a.phase === 'tele' ? a.t / a.tele : 1;
    if (a.type === 'thousand' && a.lines && a.state === 'tele') { const kk = clamp((a.t - a.t0) / a.tele, 0, 1); g.strokeStyle = `rgba(160,30,20,${.2 + kk * .5})`; g.lineWidth = 52 * (.3 + kk * .7); g.lineCap = 'butt'; for (const l of a.lines) { g.beginPath(); g.moveTo(l.x1, l.y1); g.lineTo(l.x2, l.y2); g.stroke(); } return; }
    if (a.phase !== 'tele') return;
    if (a.lines) for (const l of a.lines) { g.save(); g.translate(l.x, l.y); g.rotate(l.ang); g.fillStyle = `rgba(160,30,20,${.15 + k * .3})`; g.fillRect(0, -e.r - 6, l.len, (e.r + 6) * 2); g.restore(); }
    if (a.type === 'fan') { g.beginPath(); g.moveTo(e.x, e.y); g.arc(e.x, e.y, 360, a.ang - .55, a.ang + .55); g.closePath(); g.fillStyle = `rgba(160,30,20,${.1 + k * .2})`; g.fill(); }
    if (a.type === 'swipe' || a.type === 'spin') { g.beginPath(); g.arc(e.x, e.y, a.r * k, 0, TAU); g.fill(); g.beginPath(); g.arc(e.x, e.y, a.r, 0, TAU); g.stroke(); }
    if (a.type === 'leap') { g.beginPath(); g.arc(a.tx, a.ty, a.r * k, 0, TAU); g.fill(); g.beginPath(); g.arc(a.tx, a.ty, a.r, 0, TAU); g.stroke(); }
    if (a.marks) for (const m of a.marks) { g.fillStyle = `rgba(160,30,20,${.12 + k * .25})`; g.beginPath(); g.ellipse(m.x, m.y, m.r * k, m.r * k * .7, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(m.x, m.y, m.r, m.r * .7, 0, 0, TAU); g.stroke(); }
    if (a.type === 'cross' && BOSSFIGHT) { const F = BOSSFIGHT, L = F.r * 2.4; g.lineCap = 'butt'; g.strokeStyle = `rgba(160,30,20,${.15 + k * .45})`; g.lineWidth = 120 * (.3 + .7 * k); for (const an of [a.rot, a.rot + Math.PI / 2]) { g.beginPath(); g.moveTo(F.cx - Math.cos(an) * L / 2, F.cy - Math.sin(an) * L / 2); g.lineTo(F.cx + Math.cos(an) * L / 2, F.cy + Math.sin(an) * L / 2); g.stroke(); } }
    if (a.type === 'needles') { g.beginPath(); g.arc(e.x, e.y, 60 + 200 * k, 0, TAU); g.stroke(); }
    if (a.type === 'palms') { const an = Math.atan2(P.y - e.y, P.x - e.x); g.beginPath(); g.moveTo(e.x, e.y); g.arc(e.x, e.y, 300, an - .6, an + .6); g.closePath(); g.fillStyle = `rgba(160,30,20,${.08 + k * .18})`; g.fill(); } }
}
/* ---------- 招式特效圖（ChatGPT 繪製 fx_*.png，朝右） ---------- */
const FX_TINT = {};
function fxImg(id, col) { const im = sprImg(id); if (!im || !col) return im; const k = id + col; let t = FX_TINT[k]; if (!t) { t = document.createElement('canvas'); t.width = im.width; t.height = im.height; const c = t.getContext('2d'); c.drawImage(im, 0, 0); c.globalCompositeOperation = 'source-atop'; c.globalAlpha = .5; c.fillStyle = col; c.fillRect(0, 0, t.width, t.height); FX_TINT[k] = t; } return t; }
function drawFxSpr(id, x, y, ang, w, alpha, col, hScale) { const im = fxImg(id, col); if (!im) return false; const h = w * im.height / im.width * (hScale || 1); g.save(); g.translate(x, y); g.rotate(ang || 0); g.globalAlpha = clamp(alpha, 0, 1); g.drawImage(im, -w / 2, -h / 2, w, h); g.restore(); return true; }
const tintOf = c => c && c !== INK && c !== '#2b2420' ? c : null;
function drawProj(p) {
  { const a = Math.atan2(p.vy, p.vx), col = p.attr ? tintOf(attrCol(p.attr)) : null, fade = Math.min(1, p.life * 4);
    const m = { qiblade: ['fx_qi_gang', p.r * 4.6], qifinger: ['fx_qi_han', 150 * p.r / 10], palm: ['fx_palm', p.r * 2.8], wave: ['fx_slash', p.r * 2.6], line: ['fx_beam', 190], icicle: ['fx_ice', 64], orb: ['fx_whirl', 80], needle: ['fx_leaf', 30], dart: ['fx_dart', 38] }[p.kind];
    if (m && p.owner === 'p' && drawFxSpr(m[0], p.x, p.y - 14, p.kind === 'orb' ? gameT * 8 : a, m[1], fade * (p.kind === 'line' ? .9 : 1), p.kind === 'dart' || p.kind === 'icicle' || p.kind[0] === 'q' ? null : col)) return;
    if (p.kind === 'qiblade' || p.kind === 'qifinger') { drawQiProj(p, a, fade); return; }
    if (p.owner === 'e' && p.kind === 'needle' && drawFxSpr('fx_leaf', p.x, p.y - 14, a, 30, 1, JADE)) return; }
  g.save(); g.translate(p.x, p.y); g.rotate(Math.atan2(p.vy, p.vx)); const col = p.attr ? attrCol(p.attr) : INK;
  switch (p.kind) {
    case 'dart': g.fillStyle = INK; g.beginPath(); g.moveTo(10, 0); g.lineTo(-6, -4); g.lineTo(-3, 0); g.lineTo(-6, 4); g.fill(); break;
    case 'needle': g.strokeStyle = p.owner === 'e' ? JADE : col; g.lineWidth = 2; g.beginPath(); g.moveTo(-8, 0); g.lineTo(8, 0); g.stroke(); break;
    case 'palm': g.fillStyle = `rgba(29,26,23,${.35 * Math.min(1, p.life * 2)})`; g.beginPath(); g.ellipse(0, 0, p.r, p.r * .8, 0, 0, TAU); g.fill(); g.strokeStyle = col; g.lineWidth = 3; g.stroke(); break;
    case 'wave': g.strokeStyle = col; g.lineWidth = 7; g.globalAlpha = Math.min(1, p.life * 2); g.beginPath(); g.arc(-p.r * .4, 0, p.r, -1, 1); g.stroke(); break;
    case 'line': g.fillStyle = col; g.globalAlpha = .5 * Math.min(1, p.life * 3); g.fillRect(-60, -p.r * .45, 120, p.r * .9); break;
    case 'icicle': g.fillStyle = '#cfe4f0'; g.strokeStyle = '#33536a'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(14, 0); g.lineTo(-10, -6); g.lineTo(-10, 6); g.closePath(); g.fill(); g.stroke(); break;
    case 'orb': g.fillStyle = col; g.globalAlpha = .7; g.beginPath(); g.arc(0, 0, p.r, 0, TAU); g.fill(); break;
    case 'arrow': g.strokeStyle = '#6b4a2a'; g.lineWidth = 2; g.beginPath(); g.moveTo(-12, 0); g.lineTo(10, 0); g.stroke(); g.fillStyle = INK; g.beginPath(); g.moveTo(12, 0); g.lineTo(6, -3); g.lineTo(6, 3); g.fill(); break;
    case 'blow': g.fillStyle = '#6a4a7a'; g.fillRect(-6, -1.5, 12, 3); break;
    case 'blood': g.fillStyle = 'rgba(150,20,20,.85)'; g.beginPath(); g.arc(0, 0, p.r, 0, TAU); g.fill(); g.strokeStyle = 'rgba(60,10,10,.8)'; g.lineWidth = 1.5; g.stroke(); break;
    case 'anchor': if (drawFxSpr('anchor', 0, 0, gameT * 12, 54, 1)) break; g.strokeStyle = '#3a3330'; g.lineWidth = 4; g.beginPath(); g.arc(0, 4, 12, .2, Math.PI - .2); g.moveTo(0, -14); g.lineTo(0, 14); g.moveTo(-7, -9); g.lineTo(7, -9); g.stroke(); break;
    case 'coin': g.fillStyle = GOLD; g.beginPath(); g.arc(0, 0, p.r, 0, TAU); g.fill(); g.strokeStyle = '#6a4a10'; g.lineWidth = 1.5; g.stroke(); g.fillStyle = '#6a4a10'; g.fillRect(-2, -2, 4, 4); break;
    case 'talisman': g.fillStyle = '#e8d070'; g.fillRect(-9, -5, 18, 10); g.strokeStyle = CIN; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-5, 0); g.lineTo(5, 0); g.moveTo(0, -3); g.lineTo(0, 3); g.stroke(); break;
    case 'spit': g.fillStyle = 'rgba(110,140,60,.85)'; g.beginPath(); g.ellipse(0, 0, 8, 5, 0, 0, TAU); g.fill(); break;
    default: g.fillStyle = 'rgba(29,26,23,.8)'; g.beginPath(); g.arc(0, 0, p.r, 0, TAU); g.fill();
  }
  g.restore();
}
function drawFX(f) {
  const k = f.t / f.life, a = 1 - k;
  switch (f.type) {
    case 'qicharge': case 'qicloud': case 'qiorb': case 'iceburst': drawQiFx(f, k, a); break;
    case 'dot': g.fillStyle = f.col; g.globalAlpha = a; g.beginPath(); g.arc(f.x, f.y, f.r, 0, TAU); g.fill(); g.globalAlpha = 1; break;
    case 'spr': drawFxSpr(f.id, f.x, f.y, f.ang || 0, f.s * (.8 + k * .5), a * 1.2 * (f.al || 1), f.col, f.hs); break;
    case 'text': { const sz = f.size; g.font = `bold ${sz}px ${FONT}`; g.textAlign = 'center'; g.globalAlpha = Math.min(1, a * 2); g.lineWidth = 3; g.strokeStyle = 'rgba(235,225,202,.9)'; const yy = f.y - k * 34; g.strokeText(f.t, f.x, yy); g.fillStyle = f.col; g.fillText(f.t, f.x, yy); g.globalAlpha = 1; break; }
    case 'arc': if (drawFxSpr(f.w >= 14 ? 'fx_heavy' : 'fx_slash', f.x + Math.cos(f.ang) * f.r * .42, f.y - 16 + Math.sin(f.ang) * f.r * .42, f.ang, f.r * (1.15 + k * .2) * (f.arc > 3 ? 1.6 : 1), a * 1.4, tintOf(f.col))) break; g.strokeStyle = f.col; g.globalAlpha = a * .85; g.lineWidth = f.w * (1 - k * .5); g.lineCap = 'round'; g.beginPath(); g.arc(f.x, f.y, f.r * (.75 + k * .25), f.ang - f.arc / 2, f.ang + f.arc / 2); g.stroke(); g.globalAlpha = 1; break;
    case 'ring': { const id = f.col === GOLD || f.col === JADE ? 'fx_aura' : f.w >= 18 ? 'fx_crack' : 'fx_impact'; if (drawFxSpr(id, f.x, f.y - (id === 'fx_crack' ? 0 : 16), 0, 2 * (f.r0 + (f.r1 - f.r0) * Math.sqrt(k)), a * 1.3, id === 'fx_aura' ? null : tintOf(f.col), id === 'fx_crack' ? .55 : 1)) break; } g.strokeStyle = f.col; g.globalAlpha = a; g.lineWidth = f.w * a + 1; g.beginPath(); g.arc(f.x, f.y, f.r0 + (f.r1 - f.r0) * Math.sqrt(k), 0, TAU); g.stroke(); g.globalAlpha = 1; break;
    case 'ghost': drawHumanCtx(g, f.x, f.y, f.face, Object.assign(lookOf(S), { weapon: S.main }), { spr: heroSpr(S), alpha: a * .35 }); break;
    case 'ghostB': g.fillStyle = `rgba(36,51,43,${a * .3})`; g.beginPath(); g.ellipse(f.x, f.y - 20, 14, 22, 0, 0, TAU); g.fill(); break;
    case 'fist': if (drawFxSpr('fx_impact', f.x, f.y - 14, 0, f.r * 4 * (.7 + k * .5), a * 1.2)) break; g.strokeStyle = INK; g.globalAlpha = a; g.lineWidth = 4; g.beginPath(); g.arc(f.x, f.y - 14, f.r * (.6 + k * .6), 0, TAU); g.stroke(); g.globalAlpha = 1; break;
    case 'splat': if (drawFxSpr('fx_ink', f.x, f.y, f.seed * 6, f.r * 2.6, .7 * a, null, .55)) break; { const R = mulberry(Math.floor(f.seed * 1e6)); g.fillStyle = `rgba(29,26,23,${.35 * a})`; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(f.x + (R() - .5) * f.r, f.y + (R() - .5) * f.r * .5, f.r * (.2 + R() * .3), 0, TAU); g.fill(); } break; }
    case 'orbit': if (sprImg('fx_leaf')) { for (let i = 0; i < 3; i++) { const an = gameT * 5 + i * TAU / 3; drawFxSpr('fx_leaf', P.x + Math.cos(an) * 70, P.y - 14 + Math.sin(an) * 70, an + Math.PI / 2, 40, 1, tintOf(f.col)); } break; } for (let i = 0; i < 3; i++) { const an = gameT * 5 + i * TAU / 3; g.fillStyle = f.col; g.globalAlpha = .8; g.beginPath(); g.arc(P.x + Math.cos(an) * 70, P.y - 14 + Math.sin(an) * 70, 9, 0, TAU); g.fill(); g.globalAlpha = 1; } break;
    case 'cloud': if (drawFxSpr('fx_whirl', P.x, P.y - 10, gameT * 3, 320, .55 * Math.min(1, a * 3), JADE, .6)) break; g.fillStyle = `rgba(63,107,90,${.18 * Math.min(1, a * 3)})`; g.beginPath(); g.arc(P.x, P.y, 150, 0, TAU); g.fill(); break;
    case 'mist': if (drawFxSpr('fx_poison', f.x, f.y - 20, Math.sin(gameT + f.x) * .1, f.r * 2.3, .8 * Math.min(1, a * 3), null, .7)) break; g.fillStyle = `rgba(106,74,122,${.22 * Math.min(1, a * 3)})`; g.beginPath(); g.arc(f.x, f.y, f.r, 0, TAU); g.fill(); break;
    case 'icetrail': g.fillStyle = `rgba(200,225,240,${.5 * a})`; g.beginPath(); g.ellipse(f.x, f.y, 26, 12, 0, 0, TAU); g.fill(); break;
    case 'decoy': drawHumanCtx(g, f.x, f.y, Math.PI / 2, lookOf(S), { spr: heroSpr(S), alpha: .5 * a + .2 }); break;
    case 'hazard': { const al = Math.min(1, (f.life - f.t) / .6); if (f.kind === 'poison') { g.fillStyle = `rgba(100,140,50,${.35 * al})`; g.beginPath(); g.ellipse(f.x, f.y, f.r, f.r * .7, 0, 0, TAU); g.fill(); g.fillStyle = `rgba(170,210,90,${.4 * al})`; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(f.x + Math.cos(gameT * 2 + i * 1.7) * f.r * .5, f.y + Math.sin(gameT * 2 + i * 1.7) * f.r * .3, 6, 0, TAU); g.fill(); } break; }
      if (f.kind === 'ice') { g.fillStyle = `rgba(200,225,240,${.9 * al})`; g.strokeStyle = `rgba(51,83,106,${al})`; g.lineWidth = 1.5; g.beginPath(); g.moveTo(f.x, f.y - 56); g.lineTo(f.x + 16, f.y - 10); g.lineTo(f.x + 10, f.y); g.lineTo(f.x - 10, f.y); g.lineTo(f.x - 16, f.y - 10); g.closePath(); g.fill(); g.stroke(); }
      else { g.fillStyle = f.kind === 'fire' ? `rgba(200,90,30,${.35 * al})` : `rgba(140,15,15,${.45 * al})`; g.beginPath(); g.ellipse(f.x, f.y, f.r, f.r * .55, 0, 0, TAU); g.fill(); if (f.kind === 'fire') { g.fillStyle = `rgba(230,140,40,${.6 * al})`; for (let i = 0; i < 5; i++) { const a = i * 1.3 + f.x; const fx = f.x + Math.cos(a) * f.r * .5, fy = f.y + Math.sin(a) * f.r * .25; g.beginPath(); g.moveTo(fx - 6, fy); g.quadraticCurveTo(fx, fy - 22 - Math.sin(gameT * 12 + i) * 6, fx + 6, fy); g.fill(); } } } break; }
    case 'spike': if (f.ice) { g.fillStyle = 'rgba(200,225,240,.9)'; g.strokeStyle = '#33536a'; for (let i = 0; i < 6; i++) { const an = i * TAU / 6; g.beginPath(); g.moveTo(f.x + Math.cos(an) * 20 - 5, f.y + Math.sin(an) * 14); g.lineTo(f.x + Math.cos(an) * 20, f.y + Math.sin(an) * 14 - 44 * a); g.lineTo(f.x + Math.cos(an) * 20 + 5, f.y + Math.sin(an) * 14); g.fill(); g.stroke(); } break; } g.fillStyle = '#3f5a3a'; for (let i = 0; i < 6; i++) { const an = i * TAU / 6; g.beginPath(); g.moveTo(f.x + Math.cos(an) * 20 - 5, f.y + Math.sin(an) * 14); g.lineTo(f.x + Math.cos(an) * 20, f.y + Math.sin(an) * 14 - 40 * a); g.lineTo(f.x + Math.cos(an) * 20 + 5, f.y + Math.sin(an) * 14); g.fill(); } break;
    case 'slash': { const L = Math.hypot(f.x2 - f.x1, f.y2 - f.y1); if (drawFxSpr('fx_beam', (f.x1 + f.x2) / 2, (f.y1 + f.y2) / 2 - 14, Math.atan2(f.y2 - f.y1, f.x2 - f.x1), L, a, tintOf(f.col), 40 / Math.max(40, L * .25))) break; } g.strokeStyle = f.col || INK; g.globalAlpha = a; g.lineWidth = 8 * a + 2; g.lineCap = 'round'; g.beginPath(); g.moveTo(f.x1, f.y1); g.lineTo(f.x2, f.y2); g.stroke(); g.globalAlpha = 1; break;
    case 'fallen': g.save(); g.translate(f.x, f.y); g.rotate(f.ang); g.strokeStyle = `rgba(63,90,58,${a})`; g.lineWidth = 9; g.beginPath(); g.moveTo(0, 0); g.lineTo(230, 0); g.stroke(); g.restore(); break;
  }
}
function drawHole(h) { const a = Math.min(1, h.t / 1.5); g.fillStyle = `rgba(30,55,75,${.7 * a})`; g.beginPath(); g.ellipse(h.x, h.y, h.r, h.r * .55, 0, 0, TAU); g.fill(); g.strokeStyle = `rgba(230,242,250,${.8 * a})`; g.lineWidth = 2; g.stroke(); }
function drawPillar(pl) { if (drawStatic('pillar', pl.x, pl.y + 6, 70)) return; g.fillStyle = '#8a7a5a'; g.strokeStyle = INK; g.lineWidth = 1.5; g.fillRect(pl.x - 18, pl.y - 90, 36, 90); g.strokeRect(pl.x - 18, pl.y - 90, 36, 90); g.fillStyle = '#6b5a40'; g.fillRect(pl.x - 24, pl.y - 96, 48, 10); }
function drawPool(pr) { const alive = pr.hp > 0; g.fillStyle = alive ? (pr.flash > 0 ? '#fff' : `rgba(150,20,20,${.75 + Math.sin(gameT * 3 + pr.x) * .1})`) : 'rgba(40,20,20,.5)'; g.strokeStyle = '#2a1414'; g.lineWidth = 3; g.beginPath(); g.ellipse(pr.x, pr.y, pr.r + 8, (pr.r + 8) * .55, 0, 0, TAU); g.fill(); g.stroke();
  if (alive && BOSSFIGHT) { g.fillStyle = 'rgba(29,26,23,.4)'; g.fillRect(pr.x - 24, pr.y - 36, 48, 4); g.fillStyle = CIN; g.fillRect(pr.x - 24, pr.y - 36, 48 * pr.hp / pr.max, 4); } }
function drawTether(F) { const T = F.tether, b = F.boss; g.strokeStyle = 'rgba(40,60,80,.85)'; g.lineWidth = 2; g.beginPath(); g.moveTo(b.x, b.y - 60); g.quadraticCurveTo((b.x + P.x) / 2, Math.min(b.y, P.y) - 120, P.x, P.y - 20); g.stroke(); g.strokeStyle = 'rgba(160,30,20,.5)'; g.setLineDash([8, 6]); g.beginPath(); g.moveTo(P.x, P.y); g.lineTo(T.hole.x, T.hole.y); g.stroke(); g.setLineDash([]); }
function drawMist(e) { for (let i = 0; i < 6; i++) { const a = gameT * 2 + i; g.fillStyle = `rgba(140,20,20,${.18 + .08 * Math.sin(gameT * 5 + i)})`; g.beginPath(); g.arc(e.x + Math.cos(a) * 18, e.y - 30 + Math.sin(a * 1.3) * 12, 34 + i * 3, 0, TAU); g.fill(); } g.fillStyle = CIN; g.font = `14px ${FONT}`; g.textAlign = 'center'; g.fillText('血霧', e.x, e.y - 90); }
function drawWeather() { const w = curWeather(), hi = SET.quality === 'high';
  if (w === '沙暴') { const [px, py] = W2S(P.x, P.y); const gr = g.createRadialGradient(px, py, 120 * ZOOM, px, py, 420 * ZOOM); gr.addColorStop(0, 'rgba(190,150,90,.12)'); gr.addColorStop(1, 'rgba(170,130,70,.82)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    if (hi) { g.strokeStyle = 'rgba(140,100,50,.35)'; g.lineWidth = 1.2; g.beginPath(); for (let i = 0; i < 110; i++) { const rx = (i * 173 + gameT * 1300) % (W + 200) - 100, ry = (i * 97 + Math.sin(i + gameT) * 30) % H; g.moveTo(rx, ry); g.lineTo(rx - 26, ry + 3); } g.stroke(); } }
  if (w === '雪' && hi) { g.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 120; i++) { const rx = (i * 137 + Math.sin(gameT + i) * 20 + gameT * 40) % (W + 40) - 20, ry = (i * 251 + gameT * 90) % (H + 20) - 10; g.beginPath(); g.arc(rx, ry, 1.2 + (i % 3) * .6, 0, TAU); g.fill(); } }
  if (w === '血雨') { g.fillStyle = 'rgba(90,10,10,.12)'; g.fillRect(0, 0, W, H); if (hi) { g.strokeStyle = 'rgba(150,20,20,.45)'; g.lineWidth = 1.2; g.beginPath(); for (let i = 0; i < 90; i++) { const rx = (i * 137 + gameT * 800) % (W + 100) - 50, ry = (i * 251 + gameT * 1300) % (H + 60) - 30; g.moveTo(rx, ry); g.lineTo(rx - 5, ry + 18); } g.stroke(); } }
  if (curRegion() === 'snow' && !isNight()) { g.fillStyle = 'rgba(230,240,248,.08)'; g.fillRect(0, 0, W, H); } }
function questTargets() {
  const T = [], seen = new Set(); const add = (o, col, tag, minor) => { if (!o) return; const k = Math.round(o.x) + ',' + Math.round(o.y); if (seen.has(k)) return; seen.add(k); T.push({ x: o.x, y: o.y, col, tag, minor }); };
  add(objectivePos(), GOLD, '主線'); for (const r of activeTracks()) if (r !== focusTrack()) add(stepTarget(curStep(r)), '#8a6a3a', REGIONS[r].short, true);
  if (typeof sideTargets === 'function') sideTargets(add);
  if (S.comm) { const d = S.comm.def; let t = null;
    if (d.k === 'deliver') t = PLACES[d.to];
    else if (d.k === 'gather') { let bd = 1e9; for (const nd of NODES_R) { if (!nd.alive || nd.kind !== d.res || !regionOpen(nd.region) || d.region && nd.region !== d.region) continue; const dd = dist(P, nd); if (dd < bd) { bd = dd; t = nd; } } }
    else { let bd = 1e9; for (const c of Object.values(CAMPS)) { if (!c.types.includes(d.type) || c.region === 'secret' || !regionOpen(c.region) || c.inner && !S.cultOpen) continue; const dd = dist(P, c); if (dd < bd) { bd = dd; t = c; } } }
    add(t, JADE, '委託'); }
  for (const ev of EVENT_NPCS) if (S.events[ev] !== 'done' && placeVisible(ev, PLACES[ev]) && regionAt(PLACES[ev].x, PLACES[ev].y) === curRegion()) add(PLACES[ev], QI, '事件');
  return T;
}
function drawArrow(op, i) { const d = dist(P, op); if (d < 200) return; const an = Math.atan2(op.y - P.y, op.x - P.x); const [px, py] = W2S(P.x, P.y - 20); const r = 92 + (i || 0) * 34;
  g.save(); g.translate(px + Math.cos(an) * r, py + Math.sin(an) * r); g.rotate(an); g.fillStyle = op.col || GOLD; g.globalAlpha = .9; g.beginPath(); g.moveTo(20, 0); g.lineTo(-8, -12); g.lineTo(-3, 0); g.lineTo(-8, 12); g.closePath(); g.fill(); g.restore();
  g.globalAlpha = 1; g.font = `bold 12px ${FONT}`; g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = 'rgba(235,225,202,.9)'; const lt = `${op.tag || ''} ${Math.round(d / 10)} 步`, lx = px + Math.cos(an) * (r + 26), ly = py + Math.sin(an) * (r + 26) + 4; g.strokeText(lt, lx, ly); g.fillStyle = op.col || GOLD; g.fillText(lt, lx, ly); }
function drawCloseup() { const c = closeup; const k = c.t / c.life; if (k >= 1) { closeup = null; return; } const a = k < .15 ? k / .15 : k > .8 ? (1 - k) / .2 : 1;
  g.fillStyle = `rgba(29,26,23,${.55 * a})`; g.fillRect(0, 0, W, H); const bh = H * .16 * a; g.fillStyle = INK; g.fillRect(0, 0, W, bh); g.fillRect(0, H - bh, W, bh);
  g.save(); g.globalAlpha = a; g.translate(W / 2, H / 2); g.fillStyle = CIN; g.fillRect(-W * .4 * Math.min(1, k * 4), -6, W * .8 * Math.min(1, k * 4), 12); const sz = Math.min(W / Math.max(4, c.text.length) * .8, 110); g.font = `${sz}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = PAPER; g.fillText(c.text, 0, 0); g.restore(); g.textBaseline = 'alphabetic'; }

/* ---------- 小地圖與大地圖 ---------- */
const mini = $('mini'), mg = mini.getContext('2d'); let miniT = 0;
const fogCv = document.createElement('canvas'); fogCv.width = FOG_W; fogCv.height = FOG_H;
function fogImage() { const fg = fogCv.getContext('2d'); const im = fg.createImageData(FOG_W, FOG_H); for (let i = 0; i < FOG.length; i++) { im.data[i * 4] = 214; im.data[i * 4 + 1] = 203; im.data[i * 4 + 2] = 178; im.data[i * 4 + 3] = FOG[i] ? 0 : 255; } fg.putImageData(im, 0, 0); return fogCv; }
function drawMini() {
  miniT -= 1 / 30; if (miniT > 0) return; miniT = .2; const w = mini.width, h = mini.height, span = 1800, s = w / span;
  mg.clearRect(0, 0, w, h); mg.save(); mg.beginPath(); mg.rect(0, 0, w, h); mg.clip();
  const x0 = P.x - span / 2, y0 = P.y - span / 2 * h / w; mg.drawImage(tex, x0 * TS, y0 * TS, span * TS, span * h / w * TS, 0, 0, w, h);
  mg.imageSmoothingEnabled = true; mg.drawImage(fogImage(), x0 / FOG_C, y0 / FOG_C, span / FOG_C, span * h / w / FOG_C, 0, 0, w, h);
  const pt = (x, y) => [(x - x0) * s, (y - y0) * s];
  for (const k of ['station_village', 'station_bamboo', 'station_sand', 'station_snow', 'station_cult', 'station_miao', 'station_sea', 'station_zhong', 'station_kunlun', 'base']) { const p = PLACES[k]; if (!fogSeen(p.x, p.y)) continue; const [mx, my] = pt(p.x, p.y); mg.fillStyle = k === 'base' ? CIN : INK; mg.fillRect(mx - 3, my - 3, 6, 6); }
  for (const e of E) if (!e.dead && e.def.ai !== 'none' && e.seen) { const [mx, my] = pt(e.x, e.y); mg.fillStyle = e.boss || e.named ? CIN : e.elite ? GOLD : '#5a1416'; mg.beginPath(); mg.arc(mx, my, e.boss ? 4 : 2, 0, TAU); mg.fill(); }
  if (SET.arrow) for (const op of questTargets()) { let [mx, my] = pt(op.x, op.y); mx = clamp(mx, 5, w - 5); my = clamp(my, 5, h - 5); mg.fillStyle = op.col; mg.beginPath(); mg.arc(mx, my, 4.5, 0, TAU); mg.fill(); }
  const [px, py] = pt(P.x, P.y); mg.save(); mg.translate(px, py); mg.rotate(P.face); mg.fillStyle = INK; mg.beginPath(); mg.moveTo(7, 0); mg.lineTo(-4, -4.5); mg.lineTo(-4, 4.5); mg.fill(); mg.restore(); mg.restore();
}
function drawBigMap() {
  const c = $('bigmap'); if (!c) return; const x = c.getContext('2d'), s = c.width / WORLD_W;
  x.drawImage(tex, 0, 0, c.width, c.height); x.imageSmoothingEnabled = true; x.drawImage(fogImage(), 0, 0, c.width, c.height);
  const lab = (t, px, py, col, f) => { x.font = `${f || 15}px ${FONT}`; x.textAlign = 'center'; x.lineWidth = 3; x.strokeStyle = 'rgba(235,225,202,.9)'; x.strokeText(t, px * s, py * s); x.fillStyle = col || INK; x.fillText(t, px * s, py * s); };
  lab('落霞村', 3600, 1700 + OY, INK, 22); if (fogSeen(1300, 1800 + OY)) lab('翠竹林', 1300, 1700 + OY, '#3f5a3a', 22);
  if (fogSeen(6400, 3800)) lab('黃沙古道', 6500, 3500, '#8a6a3a', 22); if (fogSeen(1650, 1450)) lab('寒江雪嶺', 1700, 1250, '#33536a', 22); if (fogSeen(4450, 1450)) lab('血影教總壇', 5600, 1000, '#5a1416', 22); if (S.ch2 && fogSeen(2050, 5720)) lab('苗疆毒沼', 1900, 6250, '#4a5a2a', 22); if (S.ch2 && fogSeen(4700, 5720)) lab('東海漁村', 5300, 6350, '#33536a', 22); if (S.ch2 && fogSeen(8150, 3900)) lab('中原古城', 9300, 3000, '#6a4a2a', 22); if (S.ch2 && fogSeen(8150, 2350)) lab('崑崙山仙境', 9100, 1900, '#33536a', 22);
  for (const k in PLACES) { const p = PLACES[k]; if (!fogSeen(p.x, p.y) || k.startsWith('stone') || k === 'gate' || !placeVisible(k, p)) continue; if (p.npc && NPC_HIDE[p.npc] && NPC_HIDE[p.npc]()) continue; x.fillStyle = p.station ? CIN : INK; x.beginPath(); x.arc(p.x * s, p.y * s, p.station ? 5 : 3, 0, TAU); x.fill(); lab(p.n, p.x, p.y - 30, INK, 12); }
  for (const id in CAMPS) { const c2 = CAMPS[id]; if (!fogSeen(c2.x, c2.y)) continue; x.strokeStyle = 'rgba(90,20,22,.6)'; x.lineWidth = 1.5; x.beginPath(); x.arc(c2.x * s, c2.y * s, c2.r * s, 0, TAU); x.stroke(); lab(c2.n_, c2.x, c2.y + 6, '#5a1416', 12); }
  for (const reg of REGION_ORDER) if (Object.keys(RUMORS).filter(r => RUMORS[r].region === reg).every(r => S.rumors[r])) { const sp = { village: PLACES.well, bamboo: { x: 350, y: 280 + OY }, sand: PLACES.sand_ruin, snow: PLACES.ice_hole, cult: PLACES.blood_cellar, miao: PLACES.lotus_isle, sea: PLACES.wreck, zhong: PLACES.tomb_gate, kunlun: PLACES.pine_cave }[reg]; x.fillStyle = CIN; lab('◎ 秘境', sp.x, sp.y, CIN, 14); }
  for (const op of questTargets()) { x.strokeStyle = op.col; x.lineWidth = 3; x.beginPath(); x.arc(op.x * s, op.y * s, 10, 0, TAU); x.stroke(); lab(op.tag, op.x, op.y - 60, op.col, 13); }
  x.save(); x.translate(P.x * s, P.y * s); x.rotate(P.face); x.fillStyle = CIN; x.beginPath(); x.moveTo(10, 0); x.lineTo(-6, -6); x.lineTo(-6, 6); x.fill(); x.restore();
}

/* ---------- 江湖生平卡 ---------- */
function drawLifeCard(c, where) {
  const x = c.getContext('2d'); x.fillStyle = '#ebe1ca'; x.fillRect(0, 0, c.width, c.height); x.drawImage(tex, 1200 * TS, (1400 + OY) * TS, 2400 * TS, 3200 * TS, 0, 0, 900, 1200); x.fillStyle = 'rgba(235,225,202,.82)'; x.fillRect(40, 40, 820, 1120); x.strokeStyle = INK; x.lineWidth = 3; x.strokeRect(60, 60, 780, 1080);
  x.textAlign = 'center'; x.fillStyle = INK; x.font = `40px ${FONT}`; x.fillText('一命江湖・生平', 450, 150); x.font = `78px ${FONT}`; x.fillText(S.name, 450, 270);
  x.fillStyle = CIN; x.fillRect(640, 200, 90, 90); x.fillStyle = PAPER; x.font = `30px ${FONT}`; x.fillText(S.gen + '代', 685, 258);
  const hp = portImg(`hero_${S.origin}_${S.gender}_full`); if (hp) { x.drawImage(hp, 300, 320, 300, 403); x.strokeStyle = INK; x.lineWidth = 3; x.strokeRect(300, 320, 300, 403); } else { x.save(); x.translate(450, 520); drawHumanCtx(x, 0, 0, Math.PI / 2, Object.assign(lookOf(S), { weapon: S.main }), { scale: 4.2 }); x.restore(); }
  x.fillStyle = INK; x.font = `30px ${FONT}`; const lines = [`${ORIGINS[S.origin].n}・${realmOf(power())}`, where ? `死於${where}` : '歸隱', `善惡 ${S.karma}　擊敗 ${S.stats.kills}　最高 ${S.stats.bestCombo} 連擊`, `遊玩 ${Math.round(S.stats.play / 60)} 分鐘`, '所學：' + Object.keys(S.books).slice(0, 6).map(id => getBook(id).n).join('、')];
  lines.forEach((t, i) => x.fillText(t, 450, 640 + i * 60, 740)); x.font = `22px ${FONT}`; x.fillStyle = '#6a645a'; x.fillText(new Date().toLocaleDateString('zh-TW'), 450, 1080);
}

/* ---------- 主迴圈 ---------- */
let last = performance.now(), acc = 0, autoAcc = 0;
function frame(now) {
  requestAnimationFrame(frame); let dt = Math.min(.05, (now - last) / 1000);
  if (SET.quality === 'low') { acc += dt; if (acc < 1 / 31) return; dt = Math.min(.05, acc); acc = 0; }
  last = now;
  try {
    if (closeup) closeup.t += dt;
    if (dlg && autoT > 0) { autoT -= dt; if (autoT <= 0) advanceDlg(); }
    $('rotate').hidden = !rotateBlock();
    if (running && !PAUSED()) { if (hitStop > 0) hitStop -= dt; else update(dt); }
    else if (running) { for (let i = TIMERS.length - 1; i >= 0; i--) { } }
    if (running && S) updHUD(dt);
    render();
  } catch (e) { console.error(e); }
}
document.addEventListener('visibilitychange', () => { if (document.hidden) saveGame(); });
addEventListener('pagehide', saveGame);
/* ---------- 全螢幕（手機） ---------- */
const FS = { el: () => document.fullscreenElement || document.webkitFullscreenElement, can: () => { const d = document.documentElement; return !!(d.requestFullscreen || d.webkitRequestFullscreen) && (document.fullscreenEnabled !== false || document.webkitFullscreenEnabled); },
  standalone: () => matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: standalone)').matches || navigator.standalone, ios: /iP(hone|od|ad)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1), framed: (() => { try { return window.top !== window.self; } catch (e) { return true; } })() };
function enterFullscreen(quiet) { if (FS.el() || FS.standalone()) return Promise.resolve(true); const d = document.documentElement, rq = d.requestFullscreen || d.webkitRequestFullscreen;
  if (!rq || !FS.can()) { if (!quiet) fsHelp(); return Promise.resolve(false); }
  try { const r = rq.call(d, { navigationUI: 'hide' }); return Promise.resolve(r).then(() => { try { screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => { }); } catch (e) { } setTimeout(resize, 300); return true; }).catch(() => { if (!quiet) fsHelp(); return false; }); } catch (e) { if (!quiet) fsHelp(); return Promise.resolve(false); } }
function toggleFullscreen() { if (FS.el()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; } enterFullscreen(false); }
function fsHelp() { const msg = FS.ios ? 'iPhone 的 Safari 不能讓網頁直接全螢幕。請按下方「分享」→「加入主畫面」，從主畫面的圖示開啟，就是全螢幕。' : FS.framed ? '這個頁面被包在 Claude 的視窗裡，瀏覽器不准它全螢幕。要用新分頁單獨開啟遊戲嗎？（存檔會分開）' : '這個瀏覽器不支援全螢幕。可以試試 Chrome，或用選單「加到主畫面」從圖示開啟。';
  if (FS.framed && !FS.ios) confirmBox(msg, () => { window.open(location.href, '_blank'); }, () => { }, '新分頁開啟', '算了'); else say([{ who: 'narr', t: msg }]); }
document.addEventListener('pointerdown', () => { if (isTouch && running && !FS.el() && !FS.standalone() && !FS.tried) { FS.tried = true; enterFullscreen(true); } }, { passive: true });
['fullscreenchange', 'webkitfullscreenchange'].forEach(ev => document.addEventListener(ev, () => { const b = document.getElementById('b-fs'); if (b) b.textContent = FS.el() ? '縮' : '全'; setTimeout(resize, 200); }));
if (window.visualViewport) visualViewport.addEventListener('resize', () => setTimeout(resize, 50));
addEventListener('orientationchange', () => setTimeout(resize, 300));

/* ---------- 啟動 ---------- */
loadSettings(); applySettings(); applyPad(); genWorld(); genResources(); genDecor();
document.body.classList.toggle('touch', isTouch);
showTitle(); requestAnimationFrame(frame);

let seenT = 0;
/* 山壁後方的陰影：以玩家為光源，山壁背後完全遮住 */
const SHADOW_COL = '#2b2622';
function drawShadows(vis) {
  if (curRegion() === 'secret') return;
  g.fillStyle = SHADOW_COL; const F = 9000;
  for (const t of BLK()) { if (!vis(t.x + t.w / 2, t.y + t.h / 2, Math.max(t.w, t.h) / 2 + 400)) continue;
    if (P.x > t.x && P.x < t.x + t.w && P.y > t.y && P.y < t.y + t.h) continue;
    const cs = [[t.x, t.y], [t.x + t.w, t.y], [t.x + t.w, t.y + t.h], [t.x, t.y + t.h]];
    const base = Math.atan2(t.y + t.h / 2 - P.y, t.x + t.w / 2 - P.x); let mn = 1e9, mx = -1e9, a1, a2;
    for (const c of cs) { const a = angDiff(Math.atan2(c[1] - P.y, c[0] - P.x), base); if (a < mn) { mn = a; a1 = c; } if (a > mx) { mx = a; a2 = c; } }
    g.beginPath(); g.moveTo(a1[0], a1[1]);
    for (let k = 0; k <= 12; k++) { const a = base + mn + (mx - mn) * k / 12; g.lineTo(P.x + Math.cos(a) * F, P.y + Math.sin(a) * F); }
    g.lineTo(a2[0], a2[1]);
    g.closePath(); g.fill(); g.fillRect(t.x, t.y, t.w, t.h); }
}

/* ---------- 氣功特效 ---------- */
function drawQiProj(p, a, fade) {
  g.save(); g.translate(p.x, p.y - 14); g.rotate(a); g.globalAlpha = fade;
  if (p.kind === 'qiblade') { const r = p.r * 1.3; const gr = g.createLinearGradient(-r, 0, r * .6, 0); gr.addColorStop(0, 'rgba(201,150,46,0)'); gr.addColorStop(.7, 'rgba(201,150,46,.75)'); gr.addColorStop(1, 'rgba(255,240,200,.95)'); g.fillStyle = gr;
    g.beginPath(); g.arc(-r * .4, 0, r, -1.15, 1.15); g.arc(-r * .9, 0, r * 1.05, 1.0, -1.0, true); g.closePath(); g.fill(); g.strokeStyle = 'rgba(120,80,20,.7)'; g.lineWidth = 2; g.stroke(); }
  else { g.strokeStyle = 'rgba(111,182,216,.5)'; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(-60, 0); g.lineTo(10, 0); g.stroke(); g.strokeStyle = '#eef7fb'; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#d9ecf7'; g.beginPath(); g.moveTo(22, 0); g.lineTo(6, -7); g.lineTo(10, 0); g.lineTo(6, 7); g.closePath(); g.fill(); }
  g.restore();
}
function drawQiFx(f, k, a) {
  if (f.type === 'qicharge') { // 聚氣：氣流向身上收攏
    g.save(); g.translate(P.x, P.y - 34); const r = 80 * (1 - k) + 14; g.strokeStyle = f.col; g.globalAlpha = .35 + k * .5; g.lineWidth = 3 + k * 4; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke();
    g.fillStyle = f.col; for (let i = 0; i < 12; i++) { const an = i / 12 * TAU + k * 3; const rr = r * (1.1 + (i % 3) * .15); g.globalAlpha = .7 * (1 - k * .3); g.beginPath(); g.arc(Math.cos(an) * rr, Math.sin(an) * rr * .7, 3.5, 0, TAU); g.fill(); }
    g.globalAlpha = k; g.fillStyle = '#fffaf0'; g.beginPath(); g.arc(Math.cos(P.face) * 18, Math.sin(P.face) * 12 + 8, 6 + k * 8, 0, TAU); g.fill(); g.restore(); g.globalAlpha = 1; return; }
  if (f.type === 'qicloud') { // 雲袖：沿出招方向展開
    const R = f.r * (.35 + .65 * Math.sqrt(k)); const sx = f.x + Math.cos(f.ang) * R * .45, sy = f.y - 18 + Math.sin(f.ang) * R * .45;
    if (drawFxSpr('fx_qi_rou', sx, sy, f.ang + (f.flip ? .25 : -.25), R * 1.25, a * 1.3, null, f.flip ? -1 : 1)) return;
    g.save(); g.translate(f.x, f.y - 18); g.rotate(f.ang); g.globalAlpha = a * .8; for (let i = 0; i < 4; i++) { g.strokeStyle = i % 2 ? 'rgba(235,245,240,.9)' : f.col; g.lineWidth = 10 - i * 2; g.beginPath(); g.arc(0, 0, R * (1 - i * .12), -.85 + i * .1, .85 - i * .1); g.stroke(); } g.restore(); g.globalAlpha = 1; return; }
  if (f.type === 'qiorb') { const pul = 1 + Math.sin(f.t * 10) * .08, end = Math.min(1, (f.life - f.t) * 4);
    g.fillStyle = 'rgba(61,90,42,.18)'; g.globalAlpha = end; g.beginPath(); g.ellipse(f.x, f.y, f.r * 2.6, f.r * 1.6, 0, 0, TAU); g.fill();
    if (!drawFxSpr('fx_qi_du', f.x, f.y - 20, f.t * 2.5, f.r * 4.2 * pul, end)) { g.fillStyle = '#22301a'; g.beginPath(); g.arc(f.x, f.y - 20, f.r * pul, 0, TAU); g.fill(); g.strokeStyle = '#5e8a3a'; g.lineWidth = 3; for (let i = 0; i < 5; i++) { const an = f.t * 3 + i * TAU / 5; g.beginPath(); g.moveTo(f.x, f.y - 20); g.quadraticCurveTo(f.x + Math.cos(an + .8) * f.r * 1.6, f.y - 20 + Math.sin(an + .8) * f.r * 1.6, f.x + Math.cos(an) * f.r * 2.2, f.y - 20 + Math.sin(an) * f.r * 2.2); g.stroke(); } }
    g.globalAlpha = 1; return; }
  if (f.type === 'iceburst') { g.save(); g.translate(f.x, f.y - 20); g.globalAlpha = a; g.strokeStyle = '#d9ecf7'; g.fillStyle = 'rgba(111,182,216,.55)'; const n = 8; for (let i = 0; i < n; i++) { const an = i / n * TAU + .3, L = (18 + 30 * Math.sqrt(k)) * f.s; g.beginPath(); g.moveTo(Math.cos(an - .18) * 6, Math.sin(an - .18) * 6); g.lineTo(Math.cos(an) * L, Math.sin(an) * L); g.lineTo(Math.cos(an + .18) * 6, Math.sin(an + .18) * 6); g.closePath(); g.fill(); g.stroke(); } g.restore(); g.globalAlpha = 1; }
}

/* 第二章：主角帶正氣（淡金筆觸）或魔氣（朱黑筆觸） */
function drawAura() { const k = S.karma, xia = k >= 0, a = Math.min(1, Math.abs(k) / 60) * .55 + .15; g.save(); g.translate(P.x, P.y - 30); g.lineCap = 'round';
  for (let i = 0; i < 5; i++) { const an = gameT * (xia ? .9 : -1.1) + i * TAU / 5, r = 28 + Math.sin(gameT * 2 + i) * 4; g.strokeStyle = xia ? `rgba(201,162,74,${a})` : `rgba(${i % 2 ? '120,20,16' : '29,26,23'},${a})`; g.lineWidth = 3 - i * .3; g.beginPath(); g.arc(0, 0, r, an, an + .9); g.stroke(); }
  g.restore(); }
/* 第二章地點 */
const NPC_HIDE2 = { suxin: () => !!(S.bond && S.bond.sibling) };
function drawPlace2(k, p) { const x = p.x, y = p.y; if (typeof drawPlace3 === 'function' && drawPlace3(k, p)) return true;
  if (k === 'wuyi') { if (!drawStatic('b_stilt', x + 20, y - 10, 200)) { g.fillStyle = '#6a5a3a'; g.fillRect(x - 70, y - 120, 140, 60); g.fillStyle = INK; g.beginPath(); g.moveTo(x - 86, y - 116); g.lineTo(x, y - 160); g.lineTo(x + 86, y - 116); g.fill(); for (const dx of [-60, -20, 20, 60]) g.fillRect(x + dx - 3, y - 60, 6, 60); } return false; }
  if (k === 'zhaizhu') { for (const [dx, dy, w] of [[-170, -40, 170], [150, -70, 160], [0, -150, 190]]) if (!drawStatic('b_stilt', x + dx, y + dy, w)) { g.fillStyle = '#6a5a3a'; g.fillRect(x + dx - 50, y + dy - 90, 100, 45); } return false; }
  if (k === 'yubang') { for (const [dx, dy, w] of [[-180, -30, 170], [170, -50, 160], [10, -140, 180]]) if (!drawStatic('b_fishhut', x + dx, y + dy, w)) { g.fillStyle = '#8a7a6a'; g.fillRect(x + dx - 50, y + dy - 50, 100, 50); g.fillStyle = '#5a4a3a'; g.beginPath(); g.moveTo(x + dx - 60, y + dy - 46); g.lineTo(x + dx, y + dy - 84); g.lineTo(x + dx + 60, y + dy - 46); g.fill(); } return false; }
  if (k === 'laochuanfu') { if (!drawStatic('pier', x + 140, y + 30, 260)) { g.fillStyle = '#8a6a4a'; g.fillRect(x + 40, y - 10, 300, 36); } if (!drawStatic('fishboat', x + 230, y + 90, 170)) { } return false; }
  if (k === 'diaosou') { if (!drawStatic('searock', x + 40, y + 20, 150)) { } return false; }
  if (k === 'sibling') { if (!drawStatic('seacave', x, y - 10, 230)) { g.fillStyle = '#5a5a5a'; g.beginPath(); g.ellipse(x, y - 30, 110, 70, 0, Math.PI, 0); g.fill(); g.fillStyle = '#1d1a17'; g.beginPath(); g.ellipse(x, y - 10, 40, 46, 0, Math.PI, 0); g.fill(); } if (NPC_HIDE2.suxin()) { label(p.n, x, y + 24); return true; }
    npcAt(x - 40, y + 10, 'suxin', Math.PI / 2, NPCS.suxin.n); npcAt(x + 40, y + 14, 'changfeng', Math.PI / 2); if (stepIs('reach', 'place', 'sibling') || stepIs('choice', 'place', 'sibling')) { g.fillStyle = GOLD; g.font = `bold 22px ${FONT}`; g.textAlign = 'center'; g.fillText('！', x, y - 80 + Math.sin(gameT * 4) * 3); } return true; }
  if (k === 'siblings') { if (!(S.bond && S.bond.sibling)) return true; if (S.companion !== 'suxin') npcAt(x - 30, y, 'suxin', Math.PI / 2, '沈素心'); if (S.companion !== 'changfeng') npcAt(x + 30, y + 4, 'changfeng', Math.PI / 2, '顧長風'); return true; }
  if (k === 'liu_home') { if (!(S.bond && S.bond.liu) || S.companion === 'liu') return true; npcAt(x, y, 'liu', Math.PI / 2, '柳無痕'); return true; }
  if (k === 'lost_camp') { if (!drawStatic('tents', x, y + 10, 200)) { g.fillStyle = '#8a7a5a'; for (const dx of [-60, 40]) { g.beginPath(); g.moveTo(x + dx - 40, y); g.lineTo(x + dx, y - 50); g.lineTo(x + dx + 40, y); g.fill(); } } label(p.n, x, y + 30, '#6a645a'); return true; }
  if (k === 'rival_spot') { g.fillStyle = 'rgba(120,20,16,.5)'; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(x - 60 + i * 24, y + Math.sin(i) * 10, 8, 4, 0, 0, TAU); g.fill(); } if (stepIs('rescue', 'place', 'rival_spot')) label(p.n, x, y - 20, CIN); return true; }
  if (k === 'white_snake') { if (S.encounters.lingshe || Date.now() - (S.snakeT || 0) < 90000) return true; const t = gameT; g.strokeStyle = '#f0ece4'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); for (let i = 0; i <= 8; i++) { const px = x - i * 5, py = y + Math.sin(t * 6 - i * .9) * 5; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); g.fillStyle = CIN; g.beginPath(); g.arc(x + 2, y - 1, 1.5, 0, TAU); g.fill(); return true; }
  if (k === 'net_spot') { if (!drawStatic('nets', x, y + 10, 170)) { g.strokeStyle = 'rgba(80,70,60,.6)'; g.lineWidth = 1; for (let i = -4; i <= 4; i++) { g.beginPath(); g.moveTo(x + i * 14, y - 40); g.lineTo(x + i * 10, y); g.stroke(); } } label(p.n, x, y + 26, '#6a645a'); return true; }
  if (k === 'smuggle_ship') { if (!drawStatic('wreckship', x, y + 30, 260)) { g.fillStyle = '#5a3a20'; g.beginPath(); g.moveTo(x - 120, y - 20); g.quadraticCurveTo(x, y + 40, x + 120, y - 20); g.lineTo(x + 100, y + 10); g.lineTo(x - 100, y + 10); g.fill(); } label(p.n, x, y + 44, '#6a645a'); return true; }
  if (k === 'lotus_isle' || k === 'wreck' || k === 'isle_exit' || k === 'wreck_exit') { drawEntrance(k, x, y); label(p.n, x, y + 38); return true; }
  return false; }
