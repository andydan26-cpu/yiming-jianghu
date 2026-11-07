'use strict';
/* 一命江湖 — 每本武功各自的招式動畫
   1. 每本兵器秘笈有自己的特效圖（ChatGPT 繪製 img/spr/fx_<秘笈>.png，朝右），出招時有起手特效、飛行物也換成自己的圖。
   2. 原本共用同一種招式的秘笈，改成各自不同的出招方式。
   3. 合成出來的高階武功，依主屬性用四張通用特效圖（fx_gen_gang／rou／han／du）。 */

const BOOK_FX_SIZE = { qingya_sword: 130, liuyun_sword: 110, fuhu_fist: 130, hanbing_palm: 170, xueying_claw: 120, kuangsha_blade: 190, xuanfeng_blade: 140, lihua_needle: 46,
  zhuihun_dart: 54, bingpo_needle: 44, jincan: 50, fenlang: 150, leitai_fist: 140, haoran_sword: 220, baizu: 120, guanchao: 140, tianji: 50, shuanggu: 52, jinghong_ying: 140,
  qingya_shuang: 120, zhuying_sha: 60, xueyu_jian: 130, xiuluo_dao: 170, yanluo_zhang: 220, wuying_zhen: 44, canjian: 120 };
const GEN_FX = { 剛: 'fx_gen_gang', 柔: 'fx_gen_rou', 寒: 'fx_gen_han', 毒: 'fx_gen_du' };
const bookKey = b => b.id || Object.keys(BOOKS).find(k => BOOKS[k] === b) || '';
function bookFx(b) { const id = bookKey(b); if (BOOK_FX_SIZE[id]) return { id: 'fx_' + id, s: BOOK_FX_SIZE[id] }; if (false) return { id: 'fx_' + b.id, s: BOOK_FX_SIZE[b.id] }; return { id: GEN_FX[b.attrs[0]] || 'fx_gen_gang', s: 120 }; }
const fxAt = (id, x, y, ang, s, life, al) => FX.push({ type: 'spr', id, x, y, ang: ang || 0, s, t: 0, life: life || .4, al: al || 1 });
const ahead = (d, a) => ({ x: P.x + Math.cos(a === undefined ? P.face : a) * d, y: P.y + Math.sin(a === undefined ? P.face : a) * d });

/* 各秘笈專屬出招（取代共用的招式） */
const BOOK_MOVES = {
  // 驚鴻照影：三連刺之後，兩道鴻影從左右斜斜追出
  jinghong_ying: (dmg, o, ang, F) => { castPatternBase('thrust3', dmg, o, ang); later(.4, () => { for (const s of [-.28, .28]) shoot(P.x, P.y, P.face + s, 560, dmg * .7, Object.assign({}, o, { kind: 'wave', r: 34, life: .6, pierce: true, kb: 120, spr: F.id, sprS: F.s })); }); },
  // 殘劍九式：九道殘劍由左掃到右
  canjian: (dmg, o, ang, F) => { aim(200, ang); const f0 = P.face; P.lock = .55; for (let k = 0; k < 9; k++) later(k * .055, () => { const a = f0 - .8 + 1.6 * k / 8; P.face = a; meleeHit(140, .45, dmg * .42, Object.assign({}, o, { kb: k === 8 ? 260 : 20, multi: k > 0 })); const pt = ahead(70, a); fxAt(F.id, pt.x, pt.y, a, F.s * .8, .22); }); later(.5, () => { P.face = f0; }); },
  // 觀潮劍：三層潮浪一層比一層寬
  guanchao: (dmg, o, ang, F) => { aim(460, ang); const f0 = P.face; for (let k = 0; k < 3; k++) later(k * .2, () => { const n = 3 + k * 2; for (let i = 0; i < n; i++) shoot(P.x, P.y, f0 + (i - (n - 1) / 2) * .16, 430, dmg * .6, Object.assign({}, o, { kind: 'wave', r: 30, life: .7, pierce: true, kb: 180, spr: F.id, sprS: F.s * (.7 + k * .15) })); }); },
  // 青崖雙劍：雙劍繞身，再各自追向敵人
  qingya_shuang: (dmg, o, ang, F) => { castPatternBase('orbit', dmg, o, ang); for (const s of [-1, 1]) shoot(P.x + s * 30, P.y, (P.face || 0) + s * .9, 380, dmg * .8, Object.assign({}, o, { r: 14, life: 2.2, homing: true, pierce: true, spr: F.id, sprS: F.s * .8 })); },
  // 血獄劍經：血劍繞身三秒，最後炸成八道血刃
  xueyu_jian: (dmg, o, ang, F) => { castPatternBase('orbit', dmg, o, ang); later(3.1, () => { if (P.dead) return; for (let k = 0; k < 8; k++) shoot(P.x, P.y, TAU * k / 8, 560, dmg * .9, Object.assign({}, o, { kind: 'wave', r: 26, life: .6, pierce: true, spr: F.id, sprS: F.s * .8 })); ringFx(P.x, P.y, 20, 200, CIN, .4, 10); doShake(6); }); },
  // 閻羅掌：前方落下一隻鬼氣巨掌
  yanluo_zhang: (dmg, o, ang, F) => { aim(320, ang); const pt = ahead(210); P.lock = .3; FX.push({ type: 'ring', x: pt.x, y: pt.y, r0: 150, r1: 150, col: '#2b2420', t: 0, life: .35, w: 3 }); later(.3, () => { areaHit(pt.x, pt.y, 150, dmg * 1.4, Object.assign({}, o, { kb: 220, heavy: true })); fxAt(F.id, pt.x, pt.y - 20, 0, F.s, .55); ringFx(pt.x, pt.y, 30, 170, '#2b2420', .4, 16); doShake(10); sfx('heavy'); }); },
  // 百足噬心：毒影像蜈蚣一樣一節一節往前爬
  baizu: (dmg, o, ang, F) => { aim(300, ang); const f0 = P.face; P.lock = .35; for (let k = 0; k < 7; k++) later(k * .07, () => { const pt = ahead(60 + k * 45, f0 + Math.sin(k * 1.3) * .25); areaHit(pt.x, pt.y, 60, dmg * .35, Object.assign({}, o, { kb: 10, multi: true })); fxAt(F.id, pt.x, pt.y, f0, F.s * .6, .3); }); },
  // 修羅刀：三道刀芒，一道比一道大
  xiuluo_dao: (dmg, o, ang, F) => { aim(420, ang); const f0 = P.face; P.lock = .35; for (let k = 0; k < 3; k++) later(k * .15, () => shoot(P.x, P.y, f0 + (k - 1) * .12, 500 + k * 60, dmg * .8, Object.assign({}, o, { kind: 'wave', r: 34 + k * 10, life: .7, pierce: true, kb: 160 + k * 80, spr: F.id, sprS: F.s * (.7 + k * .25) }))); },
  // 天機鏢：鏢走螺旋，像八卦一樣轉出去
  tianji: (dmg, o, ang, F) => { aim(480, ang); const f0 = P.face; for (let k = 0; k < 14; k++) later(k * .035, () => shoot(P.x, P.y, f0 + Math.sin(k * .9) * .7, 600, dmg * .55, Object.assign({}, o, { r: 7, life: .75, kind: 'needle', spr: F.id, sprS: F.s }))); },
  // 竹影雙殺：目標四周落下竹葉飛刃
  zhuying_sha: (dmg, o, ang, F) => { aim(420, ang); const c = ahead(240); for (let k = 0; k < 12; k++) later(.05 + Math.random() * .6, () => { const x = c.x + rnd(-120, 120), y = c.y + rnd(-90, 90); areaHit(x, y, 46, dmg * .4, Object.assign({}, o, { kb: 10, multi: true })); fxAt(F.id, x, y - 10, Math.PI / 2 + rnd(-.4, .4), F.s, .3); }); },
  // 無影針：細針從目標四面八方憑空出現、往中心收
  wuying_zhen: (dmg, o, ang, F) => { aim(460, ang); const c = ahead(240); for (let k = 0; k < 10; k++) { const a = TAU * k / 10, x = c.x + Math.cos(a) * 190, y = c.y + Math.sin(a) * 190; later(k * .03, () => shoot(x, y, a + Math.PI, 520, dmg * .55, Object.assign({}, o, { r: 6, life: .4, kind: 'needle', spr: F.id, sprS: F.s }))); } },
  // 金蠶蠱針：一群金蠶慢慢追著咬
  jincan: (dmg, o, ang, F) => { aim(480, ang); for (let k = 0; k < 7; k++) shoot(P.x, P.y, P.face + (k - 3) * .4, 300, dmg * .7, Object.assign({}, o, { r: 9, life: 3, homing: true, spr: F.id, sprS: F.s })); },
  // 雙蠱連環：兩圈蠱蟲錯開飛出
  shuanggu: (dmg, o, ang, F) => { for (let w = 0; w < 2; w++) later(w * .22, () => { for (let k = 0; k < 12; k++) shoot(P.x, P.y, TAU * (k + w * .5) / 12, 440, dmg * .6, Object.assign({}, o, { r: 7, life: .9, kind: 'needle', spr: F.id, sprS: F.s })); }); },
};
let castPatternBase = null;
(function () { const base = castPattern; castPatternBase = (pat, dmg, o, ang) => base(pat, dmg, o, ang, null);
  castPattern = function (pat, dmg, o, ang, b) {
    if (!b) return base(pat, dmg, o, ang, b);
    const F = bookFx(b), oo = Object.assign({}, o, { spr: F.id, sprS: F.s });
    // 起手特效：在身前一閃
    later(.02, () => { const pt = ahead(46); fxAt(F.id, pt.x, pt.y, P.face, F.s * .9, .32, .9); });
    const run = (d, o2) => { const mv = BOOK_MOVES[bookKey(b)]; if (mv) mv(d, o2, ang, F); else castPatternBase(pat, d, o2, ang); };
    if (!b.heji) return run(dmg, oo);
    // 知己合擊：自己出一次，知己的水墨虛影從身側再出一次
    const m = setN('leitai') >= 6 ? 1.4 : 1; run(dmg * m, oo); const who = S.zhiji && !S.zhijiDead ? S.zhiji : null; if (!who) return;
    const a = (ang === undefined ? P.face : ang) + Math.PI / 2, gx = P.x + Math.cos(a) * 46, gy = P.y + Math.sin(a) * 46;
    FX.push({ type: 'heji', who, x: gx, y: gy, face: ang === undefined ? P.face : ang, t: 0, life: .9 });
    later(.18, () => { const ox = P.x, oy = P.y, lk = P.lock; P.x = gx; P.y = gy; run(dmg * m * .6, Object.assign({}, oo, { src: 'ally' })); P.x = ox; P.y = oy; P.lock = lk; });
  };
})();
// 飛行物：有專屬圖就用專屬圖
const _drawProjFx = drawProj; drawProj = function (p) { if (p.spr && p.owner === 'p') { const a = Math.atan2(p.vy, p.vx); if (drawFxSpr(p.spr, p.x, p.y, a, p.sprS || p.r * 4, Math.min(1, p.life * 4), null)) return; } _drawProjFx(p); };
