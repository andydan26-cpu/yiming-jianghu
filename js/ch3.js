'use strict';
/* 一命江湖 2b — 第二章後半系統：中原古城、崑崙山仙境、終章與五種結局、表白與合擊、血獄試煉塔、江湖劫
   本檔接在 ui.js 之後載入（要往 PANELS 裡加面板）。 */

Object.assign(PEOPLE_BIO, {
  zhangbanxia: '古城茶樓的說書人，眼睛半瞎、耳朵極靈。知道三十年前三個結拜兄弟的故事。', saodi: '崑崙道觀後院的掃地道人，每天掃的是傀儡的灰。',
  guanzhu: '崑崙觀主鶴松道長，暫管一座越來越空的道觀。', leitai_master: '古城擂台主「鐵臂」周通：台上不問出身，只問拳頭。',
  yushuang: '盟主之女林語霜。偷偷練劍、敢說真話；她娘留下一封信，寫著父親年輕時的事。', jinghong: '盟主之子林驚鴻。驚鴻劍快得看不見，心卻慢；放走過一個苗疆老人。',
  linxiao: '武林盟主林嘯天，正道之首。三十年前三個結拜兄弟裡的老大，想做天下第一。', xuanxiao: '崑崙仙人玄霄真君，臉年輕、眼睛老。三兄弟裡的老二，想長生。',
  jinsuanpan: '黑市之主金算盤，三年來每一筆「薪柴錢」都經過他的算盤。', yunhe: '守山真人雲鶴，守了三十年的雲橋，守的是真君的丹爐。',
});
let TOWER = null, LEITAI = null;
WEATHER_MSG['雲海'] = '雲海翻湧：四周白茫茫一片，雲裡會飛來仙鶴（打下來掉仙鶴羽）';
NPCS.qingxu = Object.assign({}, NPCS.master, { n: '清虛子' });
REGIONS.final = { n: '終章', short: '終章', realm: '宗師', tint: [200, 190, 170], weather: ['晴'] };
CH2_START.splice(2, 0, { who: 'master', t: '東邊的山口也開了。中原古城的帳、崑崙山上的雲──都不太乾淨。' });

/* ---------- 啟動 2b 主線、終章 ---------- */
function ch2Done() { return !!S.ch2 && CH2A_TRACKS.concat(CH2B_TRACKS).every(trackDone); }
function tickCh3Story() {
  if (S.ch2 && !S.ch2b && !PAUSE_STORY && !dlg) { S.ch2b = true; CH2B_TRACKS.forEach(r => onNodeStart(r)); later(1.5, () => banner('東方山口開通', '中原古城・崑崙山仙境')); saveGame(); }
  if (S.ch2b && !S.finalBoss && !S.ending && ch2Done() && !dlg && !BOSSFIGHT && !PAUSE_STORY && !SIEGE) startFinalChapter();
  // 結局故事板播到一半就關掉遊戲：頭目已倒，直接補播結局，不用再打一次
  if (S.finalBoss && S.bossDead[S.finalBoss] && !S.ending && !dlg && !BOSSFIGHT && !PAUSE_STORY) playEnding(S.finalBoss, S.finalSpared !== false);
}
function finalTally() { const c = Object.assign({ meng: 0, xian: 0, shi: 0 }, S.clue || {}); const bc = S.zhiji && BOND_CLUE[S.zhiji]; if (bc) c[bc] += 2;
  const last = (S.clueLog || []).slice(-1)[0], lk = last ? last.k : 'shi';
  const order = ['meng', 'xian', 'shi'].sort((a, b) => (c[b] - c[a]) || ((b === lk) - (a === lk))); return { c, order, bc }; }
function startFinalChapter() {
  const T = finalTally(); S.finalBoss = FINAL_OF[T.order[0]]; S.finalRunner = T.order[1]; S.finalThird = FINAL_OF[T.order[2]]; S.finalTally = T.c; saveGame(); PAUSE_STORY = true;
  const frames = FINAL_INTRO.concat([{ t: `盟主線 ${T.c.meng}　仙人線 ${T.c.xian}　師父線 ${T.c.shi}` + (T.bc ? `\n（知己${BONDS[S.zhiji].n}牽動${CLUE_N[T.bc]} +2）` : '') }], FINAL_POINT[S.finalBoss], [{ t: '終章　一命', big: true }]);
  storyboard(frames, () => { PAUSE_STORY = false; trk('final'); onNodeStart('final'); banner('終章', BOSS[S.finalBoss].n); saveGame(); });
}
const _ch2StepTick = ch2StepTick; ch2StepTick = function (r, s) {
  if (s.type === 'final') { if (dlg || BOSSFIGHT || modal || !S.finalBoss || (P.choiceCd || 0) > 0) return false; const A = ARENAS[S.finalBoss], ap = PLACES[A.place];
    if (dist(P, ap) < A.r - 40) { P.choiceCd = 8; confirmBox(`${ap.n}。${BOSS[S.finalBoss].short}在等你。這一戰之後，江湖就不一樣了。（硬核：此戰若死，存檔將被刪除）`, startFinal, () => { const a = Math.atan2(P.y - ap.y, P.x - ap.x); P.x = ap.x + Math.cos(a) * (A.r + 60); P.y = ap.y + Math.sin(a) * (A.r + 60); collide(P, 16, true); }, '了斷', '再準備一下'); return true; } return false; }
  if (s.type === 'rescue' && s.id === 'disciple' && !RESC) { const p = PLACES[s.place]; if (!dlg && !BOSSFIGHT && p && dist(P, p) < 160 && !(P.choiceCd > 0)) { P.choiceCd = 3; runRescueDisciple(r); return true; } return false; }
  return _ch2StepTick(r, s);
};
const _stepTarget = stepTarget; stepTarget = function (s) { if (s && s.type === 'final') return S.finalBoss ? PLACES[ARENAS[S.finalBoss].place] : null; return _stepTarget(s); };

/* ---------- 終章決戰 ---------- */
function startFinal() {
  const bid = S.finalBoss, L = BOSS_LINES[bid], lin = bid === 'linxiao' && ['yushuang', 'jinghong'].includes(S.zhiji) && !S.zhijiDead;
  const go = () => { startBoss(bid, false); const F = BOSSFIGHT; if (F) { F.runner = runnerMode(); F.runT = 8; if (F.runner) later(1.2, () => toast(RUNNER_LINES[F.runner], 'red')); } };
  if (!lin) { say(L.before, go); return; }
  const k = S.zhiji, nm = BONDS[k].n;
  say(L.before.concat([{ who: k, t: '爹……收手吧。這一劍，讓我來說。' }, { who: 'choice', t: `${nm}擋在你和林嘯天中間。`, choices: [
    { label: `讓${nm}勸降`, fn: () => { const ok = bondPts(k) >= 90; S.quanxiang = ok; say(ok ? [{ who: 'linxiao', t: '……你娘，也是這樣看著我的。好。打完這一場，我認輸。' }, { who: 'narr', t: '（勸降成功：林嘯天會跳過第三階段）' }] : [{ who: 'linxiao', t: '小孩子懂什麼！讓開！' }, { who: 'narr', t: `（${nm}還不夠信任你，勸降失敗：好感 ${bondPts(k)}/90）` }], go); } },
    { label: '「這是我的事。」', alt: true, fn: go }] }]));
}
function runnerMode() { const r = S.finalRunner; if (!r || FINAL_OF[r] === S.finalBoss) return null; if (r === 'meng') return S.karma >= 0 ? 'meng_help' : 'meng_hurt'; if (r === 'xian') return 'xian'; return S.karma >= 0 ? 'shi_help' : 'shi_hurt'; }
function runnerTick(b, F, dt) {
  if (!F.runner || b.practice) return; F.runT -= dt; if (F.runT > 0) return; const m = F.runner;
  if (m === 'meng_help') { F.runT = 10; const ang = rnd(0, TAU); const x = b.x + Math.cos(ang) * 120, y = b.y + Math.sin(ang) * 120; FX.push({ type: 'slash', x1: x, y1: y, x2: b.x, y2: b.y, t: 0, life: .35, col: GOLD }); hurtEnemy(b, b.maxHp * .025, { src: 'ally', ang }); fxText(b.x, b.y - 80, '正派聯軍', GOLD, 15); }
  if (m === 'meng_hurt') { F.runT = 15; for (let k = 0; k < 2; k++) { const e = spawnEnemy('zp_hero', F.cx + rnd(-F.r, F.r) * .7, F.cy + F.r * .8, null, { elite: false }); e.aggro = true; e.tag = 'bossadd'; } toast('正派高手衝上來了！'); }
  if (m === 'xian') { F.runT = 12; P.mp = Math.max(0, P.mp - maxMp() * .15); hurtEnemy(b, b.maxHp * .02, { src: 'ally' }); fxText(P.x, P.y - 60, '內力被吸', '#8a9aa8', 15); ringFx(P.x, P.y, 10, 90, '#8a9aa8', .4, 8); }
  if (m === 'shi_help') { F.runT = 15; P.hp = Math.min(maxHp(), P.hp + maxHp() * .1); fxText(P.x, P.y - 60, '師父療傷', JADE, 15); ringFx(P.x, P.y, 10, 70, JADE, .4, 8); }
  if (m === 'shi_hurt') { F.runT = 13; const a0 = Math.atan2(P.y - F.cy, P.x - F.cx) + Math.PI; const sx = F.cx + Math.cos(a0) * F.r, sy = F.cy + Math.sin(a0) * F.r; for (let k = -2; k <= 2; k++) shootE(sx, sy, Math.atan2(P.y - sy, P.x - sx) + k * .12, 380, b.dmg * .5, { kind: 'needle', r: 6 }); fxText(sx, sy - 40, '清理門戶', INK, 15); }
}
function decideEnding(spare) {
  const allRumor = Object.keys(RUMORS).every(k => S.rumors[k]), masters = ['baizu', 'guanchao', 'tianji', 'hunyuan'].every(k => S.books[k]);
  if (allRumor && masters && spare) return 'tianren';
  const R = S.rescue || {}; if (['rival', 'village', 'disciple'].every(k => R[k] === 'ignored' || R[k] === 'none') || S.sheshen) return 'gujian';
  if (S.karma >= 30) return 'daxia'; if (S.karma <= -30) return 'xinmo'; return 'xiaoao';
}
function playEnding(bid, spare) {
  saveGame(); const key = decideEnding(spare), E1 = ENDINGS[key], zk = S.zhiji && !S.zhijiDead ? S.zhiji : 'none';
  if (key === 'gujian' && zk !== 'none') { S.zhijiDead = true; if (S.companion === zk) S.companion = null; }
  const frames = [FINAL_FALL[bid]].concat(E1.frames, [{ t: THIRD_FATE[S.finalThird] || '' }], [{ t: (EPILOGUE[zk] || EPILOGUE.none)[key] }], [{ t: E1.n, big: true }]);
  PAUSE_STORY = true; music('title');
  storyboard(frames, () => { PAUSE_STORY = false; S.ending = key; S.endedAt = Date.now(); S.cleared = true; const r = matchTrack('final'); if (r) advanceStep(r); banner(`結局・${E1.n}`, '血獄試煉塔、江湖劫已開放'); music(curRegion());
    later(3, () => say([{ who: 'narr', t: '江湖的事了了，你的路還沒走完。' }, { who: 'narr', t: '總壇地底的血獄試煉塔開了門；青崖小築的江湖劫鐘，敲一下，江湖就難一分。想開新的一代時，再到英雄榜歸隱。' }])); saveGame(); });
}

/* ---------- 救援：被擄的弟子 ---------- */
Object.assign(RESCUE_DEF, { disciple: { target: 'kid_spot', n: '雲崖', foes: ['puppet', 'puppet', 'talisman', 'thunder', 'puppet'] } });
function oldestDisciple() { return Object.keys(S.disciples).find(id => S.disciples[id].state !== 'cand') || null; }
function runRescueDisciple(r) {
  S.rescue = S.rescue || {}; const id = oldestDisciple(), nm = id ? DISCIPLES[id].n : '青崖的小弟子'; S.rescueWho = id;
  say([{ who: 'narr', t: '一隻紙鶴從青崖的方向飛來，落在你掌心，展開是一行歪歪扭扭的字。' }, { who: 'narr', t: `「師父救命！${nm}去崑崙送藥，被傀儡抓走了，拖到雲崖上去了──」` }, { who: 'narr', t: '另一邊，道觀的雲海試煉正要開始。錯過了，要再等一年。' },
    { who: 'choice', t: `${nm}是你在青崖收的第一個弟子。`, choices: [
      { label: '立刻去雲崖（3 分鐘內趕到）', fn: () => startRescue(r, 'disciple') },
      { label: '江湖路險，各安天命', alt: true, fn: () => { S.rescue.disciple = 'ignored'; addKarma(-5); if (id) delete S.disciples[id]; gainRes('page', 10); say([{ who: 'narr', t: `你把紙鶴收進懷裡，往道觀走去。從此，青崖小築再也沒有${nm}的聲音。` }], () => { advanceStep(r); saveGame(); }); } }] }]);
}
const _rescueEnd = rescueEnd; rescueEnd = function (ok) {
  const R = RESC; if (!R || R.id !== 'disciple') return _rescueEnd(ok);
  RESC = null; delete WAVES.rescue; E = E.filter(e => e.tag !== 'rescue' || !e.dead); S.rescue = S.rescue || {}; const id = S.rescueWho, nm = id ? DISCIPLES[id].n : '小弟子';
  if (ok) { S.rescue.disciple = 'saved'; addKarma(10); say([{ who: 'narr', t: `傀儡倒了一地。${nm}從繩子裡鑽出來，撲進你懷裡大哭：「師父！我以為我回不去了！」` }], () => { advanceStep(R.r); saveGame(); }); }
  else { S.rescue.disciple = 'lost'; if (id) delete S.disciples[id]; say([{ who: 'narr', t: `你趕到雲崖時，只剩一根斷掉的繩子，在風裡晃。${nm}，再也沒有回來。` }], () => { advanceStep(R.r); saveGame(); }); }
};

/* ---------- 世外高人：張半瞎、掃地道人 ---------- */
const _startTrial = startTrial; startTrial = function (r, id) {
  if (TRIAL) return;
  if (id === 'zhangbanxia') { const got = Object.keys(RUMORS).filter(k => S.rumors[k]); if (got.length < 3) { say([{ who: 'zhangbanxia', t: `你才讀過 ${got.length} 則傳聞？各地的石碑多讀幾塊，再來找老瞎子。` }]); return; }
    TRIAL = { id, r }; const qs = []; const pool = got.slice(); while (qs.length < 3 && pool.length) qs.push(pool.splice(rint(0, pool.length - 1), 1)[0]);
    const cut = t => t.length > 22 ? t.slice(0, 22) + '……' : t; let i = 0;
    const ask = () => { if (i >= 3) return trialEnd(true); const k = qs[i], wrong = Object.keys(RUMORS).filter(x => x !== k).sort(() => Math.random() - .5).slice(0, 2), opts = [k].concat(wrong).sort(() => Math.random() - .5);
      say([{ who: 'zhangbanxia', t: `第 ${i + 1} 題：傳聞「${RUMORS[k].t}」，說的是什麼？` }, { who: 'choice', t: '', choices: opts.map(o => ({ label: cut(RUMORS[o].body), fn: () => { if (o === k) { i++; fxText(P.x, P.y - 60, '答對', GOLD, 16); ask(); } else trialEnd(false, '張半瞎搖搖頭：「讀過，不等於記得。回去再讀讀。」'); } })) }]); };
    say([{ who: 'zhangbanxia', t: '好，聽好了。老瞎子只問你讀過的。' }], ask); return; }
  if (id === 'saodi') { TRIAL = { id, r, t: 30, spawned: 0, kills: 0 }; banner('掃地道人的考驗', '30 秒內擊敗 20 隻傀儡，不能受傷'); saodiSpawn(6); return; }
  _startTrial(r, id);
};
function saodiSpawn(n) { const T = TRIAL; for (let k = 0; k < n && T.spawned < 20; k++) { T.spawned++; const e = spawnEnemy(T.spawned % 4 ? 'minipuppet' : 'puppet', P.x + rnd(-260, 260), P.y + rnd(-200, 200), null, { elite: false }); e.aggro = true; e.tag = 'trial'; if (e.type === 'puppet') { e.hp = e.maxHp = 240; } } }
const _tickTrial = tickTrial; tickTrial = function (dt) {
  if (TRIAL && TRIAL.id === 'zhangbanxia') return;
  if (TRIAL && TRIAL.id === 'saodi') { const T = TRIAL; T.t -= dt; T.kills = T.spawned - E.filter(e => e.tag === 'trial' && !e.dead).length; if (E.filter(e => e.tag === 'trial' && !e.dead).length < 3) saodiSpawn(3);
    if (T.kills >= 20) return trialEnd(true); if (T.t <= 0) return trialEnd(false, '掃地道人把掃帚往地上一頓：「三十息到了。落葉，還沒掃完。」'); return; }
  _tickTrial(dt);
};
const _hurtPlayer = hurtPlayer; hurtPlayer = function (dmg, sx, sy, src) {
  if (TOWER && TOWER.buff === 'hp') dmg *= .8;
  const h0 = P.hp; _hurtPlayer(dmg, sx, sy, src);
  if (P.hp < h0 && TRIAL && TRIAL.id === 'saodi') trialEnd(false, '你身上沾了灰。掃地道人搖搖頭：「再掃一遍。」');
};

/* ---------- 頭目：金算盤、雲鶴真人、三位最終頭目 ---------- */
Object.assign(BOSS_ACTS, {
  jinsuanpan: [['coins', 'swipe', 'dash'], ['guards', 'coins', 'abacus', 'dash'], ['abacus', 'coins', 'guards', 'charge']],
  yunhe: [['needles', 'dash', 'swipe'], ['cranes', 'hail', 'dash', 'needles'], ['cranes', 'cracks', 'hail', 'fan']],
  linxiao: [['swipe', 'fan', 'dash'], ['helpers', 'fan', 'charge', 'dash'], ['clones', 'twin', 'helpers', 'fan']],
  xuanxiao: [['needles', 'thunder', 'hail'], ['drain', 'thunder', 'fogzone', 'needles'], ['gu', 'anchor', 'thunder', 'bloodrain']],
  qingxu: [['swipe', 'palms', 'dash'], ['teaneedle', 'palms', 'needles', 'dash'], ['bloodrain', 'cracks', 'spin', 'clones']],
});
Object.assign(BOSS_DROP, {
  jinsuanpan: { gear: ['acc', 'gold_abacus'], silver: 3600, page: 30, xiu: 3600, iron: 30 }, yunhe: { gear: ['robe', 'crane_robe'], silver: 3000, page: 30, xiu: 3600, xianhe: 3 },
  linxiao: { gear: ['acc', 'meng_seal'], silver: 6000, page: 50, xiu: 6000 }, xuanxiao: { gear: ['belt', 'xian_gourd'], silver: 6000, page: 50, xiu: 6000, xianhe: 4 }, qingxu: { gear: ['acc', 'qingxu_cup'], silver: 6000, page: 50, xiu: 6000 },
});
const NEW_BOSSES = ['jinsuanpan', 'yunhe', 'linxiao', 'xuanxiao', 'qingxu'];
const _startUlt2 = startUlt; startUlt = function (b) {
  if (b.bid === 'jinsuanpan') { b.act = { type: 'coinrain', t: 0, n: 0, marks: null }; toast('一本萬利──金錢雨！看地上的金圈', 'red'); return; }
  if (b.bid === 'yunhe') { b.act = { type: 'thousand', t: 0, wave: 0 }; toast('鶴唳九霄──躲進鶴影的空隙！', 'red'); return; }
  if (b.bid === 'linxiao') { b.act = { type: 'cross', t: 0, phase: 'tele', tele: 1.1, n: 2, rot: 0 }; toast('天下歸一──十字劍氣！', 'red'); return; }
  if (b.bid === 'xuanxiao') { b.act = { type: 'storm', t: 0, n: 0, marks: null }; toast('白日飛昇──天雷連落三次！', 'red'); return; }
  if (b.bid === 'qingxu') { b.act = { type: 'storm', t: 0, n: 0, marks: null, blood: true }; toast('血影歸元──血雨連落三次！', 'red'); return; }
  _startUlt2(b);
};
function arenaMarks(F, n, spread, r) { const a = []; for (let i = 0; i < n; i++) a.push({ x: clamp(P.x + rnd(-spread, spread), F.cx - F.r + 40, F.cx + F.r - 40), y: clamp(P.y + rnd(-spread, spread), F.cy - F.r + 40, F.cy + F.r - 40), r }); if (a[0]) { a[0].x = P.x; a[0].y = P.y; } return a; }
const _startBossAct2 = startBossAct; startBossAct = function (b, type) {
  const F = BOSSFIGHT, a = { type, t: 0, phase: 'tele' };
  if (type === 'coins') { a.tele = .45; a.ang = Math.atan2(P.y - b.y, P.x - b.x); b.act = a; return; }
  if (type === 'abacus') { a.tele = .6; a.k = 0; b.act = a; return; }
  if (type === 'guards' || type === 'cranes' || type === 'helpers') { a.tele = .5; b.act = a; return; }
  if (type === 'thunder') { a.tele = 1.0; a.marks = arenaMarks(F, b.phase >= 2 ? 6 : 4, 230, 70); b.act = a; return; }
  if (type === 'drain') { a.tele = .6; a.go = 2.2; b.act = a; return; }
  if (type === 'teaneedle') { a.tele = .55; b.act = a; return; }
  _startBossAct2(b, type);
};
const _runBossAct2 = runBossAct; runBossAct = function (b, dt) {
  const a = b.act, F = BOSSFIGHT;
  if (a.type === 'coinrain' || a.type === 'storm') { a.t += dt; if (!a.marks) { if (a.n >= 3) { b.act = null; return; } a.marks = arenaMarks(F, 9, 300, a.type === 'storm' && !a.blood ? 78 : 64); a.t = 0; a.n++; }
    if (a.t >= 1.1) { const col = a.blood ? CIN : a.type === 'coinrain' ? GOLD : '#c8d4e0'; for (const m of a.marks) { if (Math.hypot(P.x - m.x, P.y - m.y) < m.r) hurtPlayer(b.dmg * .9, m.x, m.y); ringFx(m.x, m.y, 10, m.r, col, .35, 9); if (a.type === 'storm' && !a.blood) FX.push({ type: 'slash', x1: m.x + rnd(-20, 20), y1: m.y - 420, x2: m.x, y2: m.y, t: 0, life: .25, col: '#e8f0ff' }); } doShake(6); sfx('heavy'); a.marks = null; } return; }
  if (a.type === 'drain' && a.phase === 'go') { a.go -= dt; const d = dist(P, b); if (d < 400 && P.dodgeT <= 0 && losP(b)) { P.mp = Math.max(0, P.mp - maxMp() * .12 * dt); b.hp = Math.min(b.maxHp, b.hp + b.maxHp * .004 * dt); a.on = true; } else a.on = false; if (P.dodgeT > 0 && d < 400) { b.act = null; fxText(P.x, P.y - 50, '掙脫', GOLD, 16); return; } if (a.go <= 0) b.act = null; return; }
  if (a.phase === 'tele' && ['coins', 'abacus', 'guards', 'cranes', 'helpers', 'thunder', 'drain', 'teaneedle'].includes(a.type)) { a.t += dt; if (a.t < a.tele) return; a.t = 0; a.phase = 'go';
    if (a.type === 'coins') { const n = b.phase >= 2 ? 11 : 9; for (let i = 0; i < n; i++) shootE(b.x, b.y, a.ang - .7 + 1.4 * i / (n - 1), 360, b.dmg * .55, { kind: 'coin', r: 8 }); sfx('dart'); b.act = null; return; }
    if (a.type === 'abacus') { for (let k = 0; k < 16; k++) shootE(b.x, b.y, TAU * k / 16 + a.k * .2, 280, b.dmg * .5, { kind: 'coin', r: 7 }); a.k++; if (a.k < (b.phase >= 3 ? 3 : 2)) { a.phase = 'tele'; a.tele = .35; } else b.act = null; sfx('dart'); return; }
    if (a.type === 'guards') { for (let k = 0; k < 2; k++) { const e = spawnEnemy('thug', F.cx + rnd(-F.r, F.r) * .7, F.cy + rnd(-F.r, F.r) * .7, null, { elite: false }); e.aggro = true; e.tag = 'bossadd'; e.chip = true; } toast('護院衝上來了：打倒他們撿籌碼回血'); b.act = null; return; }
    if (a.type === 'cranes') { for (let k = 0; k < 3; k++) { const e = spawnEnemy('crane', F.cx + rnd(-F.r, F.r) * .8, F.cy - F.r * .8, null, { elite: false }); e.aggro = true; e.tag = 'bossadd'; } b.act = null; return; }
    if (a.type === 'helpers') { for (let k = 0; k < 2; k++) { const e = spawnEnemy('zp_hero', F.cx + (k ? 1 : -1) * F.r * .7, F.cy - F.r * .6, null, { elite: false }); e.aggro = true; e.tag = 'bossadd'; } fxText(b.x, b.y - 80, '各派好漢，上台！', GOLD, 16); b.act = null; return; }
    if (a.type === 'thunder') { for (const m of a.marks) { if (Math.hypot(P.x - m.x, P.y - m.y) < m.r) hurtPlayer(b.dmg * .85, m.x, m.y); for (const e of E) if (!e.dead && e.tag === 'bossadd' && Math.hypot(e.x - m.x, e.y - m.y) < m.r) hurtEnemy(e, e.maxHp * .6, { src: 'env' }); FX.push({ type: 'slash', x1: m.x + rnd(-20, 20), y1: m.y - 420, x2: m.x, y2: m.y, t: 0, life: .25, col: '#e8f0ff' }); ringFx(m.x, m.y, 10, m.r, '#c8d4e0', .35, 9); } doShake(7); sfx('heavy'); b.act = null; return; }
    if (a.type === 'teaneedle') { for (let k = 0; k < 14; k++) shootE(b.x, b.y, TAU * k / 14 + gameT, 300, b.dmg * .5, { kind: 'needle', r: 6, slow: 1 }); later(.4, () => { if (BOSSFIGHT && !b.dead) for (let k = 0; k < 14; k++) shootE(b.x, b.y, TAU * (k + .5) / 14 + gameT, 300, b.dmg * .5, { kind: 'needle', r: 6, slow: 1 }); }); sfx('dart'); b.act = null; return; }
    if (a.type === 'drain') { toast('真君在吸你的內力：閃身掙脫，或拉開距離！'); return; }
  }
  _runBossAct2(b, dt);
};
function bridgeTiles(F) { if (F.tiles) return F.tiles; const T = []; const s = 110; for (let y = F.cy - F.r; y < F.cy + F.r; y += s) for (let x = F.cx - F.r; x < F.cx + F.r; x += s) { const cx = x + s / 2, cy = y + s / 2; if (Math.hypot(cx - F.cx, cy - F.cy) < F.r) T.push({ x, y, s, state: 0, t: 0 }); } F.tiles = T; F.tileT = 5; return T; }
const _arenaMechanics2 = arenaMechanics; arenaMechanics = function (b, F, dt) {
  _arenaMechanics2(b, F, dt); if (F.practice) return;
  if (b.bid === 'jinsuanpan') { F.dartT = (F.dartT || 2.5) - dt; if (F.dartT <= 0) { F.dartT = rnd(1.8, 3); const a = rnd(0, TAU), sx = F.cx + Math.cos(a) * (F.r + 40), sy = F.cy + Math.sin(a) * (F.r + 40), tgt = Math.random() < .5 ? P : b, ang = Math.atan2(tgt.y - sy, tgt.x - sx); shootE(sx, sy, ang, 420, b.dmg * .4, { kind: 'dart', r: 6, life: 2, hitBoss: true }); }
    for (const p of PR) if (p.hitBoss && p.owner === 'e' && !p.done && Math.hypot(p.x - b.x, p.y - b.y) < b.r + 6) { p.done = true; p.life = 0; hurtEnemy(b, b.maxHp * .012, { src: 'env' }); fxText(b.x, b.y - 70, '流鏢', GOLD, 13); }
    F.chips = F.chips || []; for (const e of E) if (e.chip && e.dead && !e.chipDone) { e.chipDone = true; F.chips.push({ x: e.x, y: e.y, t: 12 }); }
    for (const c of F.chips) { c.t -= dt; if (c.t > 0 && Math.hypot(P.x - c.x, P.y - c.y) < 40) { c.t = 0; P.hp = Math.min(maxHp(), P.hp + maxHp() * .08); fxText(P.x, P.y - 60, '籌碼 +回血', GOLD, 15); sfx('learn'); } } F.chips = F.chips.filter(c => c.t > 0); }
  if (b.bid === 'yunhe') { const T = bridgeTiles(F); F.tileT -= dt;
    if (F.tileT <= 0) { F.tileT = b.phase >= 2 ? 5 : 7; const k = b.phase >= 3 ? .45 : .32; for (const t of T) if (t.state === 0 && Math.random() < k && Math.hypot(t.x + 55 - F.cx, t.y + 55 - (F.cy + F.r - 60)) > 120) { t.state = 1; t.t = 1.5; } }
    for (const t of T) { if (t.state === 0) continue; t.t -= dt; if (t.t <= 0) { if (t.state === 1) { t.state = 2; t.t = 3; } else { t.state = 0; } } }
    if (P.dodgeT <= 0 && P.iframe <= 0) { const t = T.find(t => t.state === 2 && P.x > t.x && P.x < t.x + t.s && P.y > t.y && P.y < t.y + t.s); if (t) { hurtPlayer(maxHp() * .08); P.x = F.cx; P.y = F.cy + F.r - 60; P.iframe = .8; fxText(P.x, P.y - 60, '踩空，被雲送回橋頭', '#8a9aa8', 15); } } }
  if (b.bid === 'xuanxiao') { F.boltT = (F.boltT || 4) - dt; if (F.boltT <= 0) { F.boltT = rnd(3, 4.5); const m = { x: F.cx + rnd(-F.r, F.r) * .8, y: F.cy + rnd(-F.r, F.r) * .8, r: 70, t: 1.2 }; (F.bolts = F.bolts || []).push(m); }
    for (const m of (F.bolts || [])) { m.t -= dt; if (m.t <= 0 && !m.done) { m.done = true; if (Math.hypot(P.x - m.x, P.y - m.y) < m.r) hurtPlayer(b.dmg * .8, m.x, m.y); if (Math.hypot(b.x - m.x, b.y - m.y) < m.r + b.r) { hurtEnemy(b, b.maxHp * .03, { src: 'env' }); fxText(b.x, b.y - 80, '天雷反噬', GOLD, 15); } FX.push({ type: 'slash', x1: m.x, y1: m.y - 420, x2: m.x, y2: m.y, t: 0, life: .25, col: '#e8f0ff' }); ringFx(m.x, m.y, 10, m.r, '#c8d4e0', .35, 9); } } if (F.bolts) F.bolts = F.bolts.filter(m => !m.done || m.t > -.3); }
  runnerTick(b, F, dt);
};
const _updBoss = updBoss; updBoss = function (b, dt) {
  const fin = BOSS[b.bid] && BOSS[b.bid].final, F = BOSSFIGHT;
  if (fin && F && !b.practice) { const pr = b.hp / b.maxHp;
    if (!b.sheshenAsked && pr < .5 && !dlg) { b.sheshenAsked = true; say([{ who: 'narr', t: `${BOSS[b.bid].short}的破綻露了出來。可是要打穿那個破綻，得把自己的命也押上去。` }, { who: 'choice', t: '捨身一擊：重創對手，但你會失去最重要的東西（進入悲劇結局）。', choices: [
      { label: '捨身一擊', fn: () => { S.sheshen = true; hurtEnemy(b, b.maxHp * .3, { src: 'skill', ang: Math.atan2(b.y - P.y, b.x - P.x), kb: 0 }); P.hp = Math.max(1, P.hp * .3); closeupFx('捨身一擊'); doShake(18); } },
      { label: '不，還沒到那一步', alt: true, fn: () => { } }] }]); }
    if (b.phase === 2 && pr < .3 && b.bid === 'linxiao' && S.quanxiang && !b.yielded) { b.yielded = true; b.hp = 1; say([{ who: S.zhiji, t: '爹！夠了！' }, { who: 'linxiao', t: '……我認輸。' }], () => { if (BOSSFIGHT) killEnemy(b); }); return; }
    if (b.phase === 2 && pr < .3) { const p3 = BOSS_LINES[b.bid].p3; if (p3) later(.2, () => say({ who: b.bid === 'qingxu' ? 'master' : b.bid, t: p3 }, null, true)); } }
  _updBoss(b, dt);
};
const _bossDown2 = bossDown; bossDown = function (b) {
  if (!NEW_BOSSES.includes(b.bid)) return _bossDown2(b);
  burst(b.x, b.y, CIN, 30); burst(b.x, b.y, INK, 30); doShake(16); const practice = b.practice, bid = b.bid; endBossFight(true);
  if (practice) { toast('演武結束'); return; }
  S.bossDead[bid] = true; const D = BOSS_DROP[bid]; for (const k in D) if (RES[k]) gainRes(k, D[k]);
  addItem(makeItem(D.gear[0], 4, { unique: D.gear[1] })); S.codex.gear[D.gear[1]] = 1; const L = BOSS_LINES[bid];
  if (BOSS[bid].final) { say(L.after.concat([{ who: 'choice', t: `${BOSS[bid].short}倒在你面前。最後一劍，落不落下？`, choices: [
    { label: '收劍，不殺', fn: () => { addKarma(10); S.finalSpared = true; playEnding(bid, true); } },
    { label: '一劍了斷', alt: true, fn: () => { addKarma(-10); S.finalSpared = false; playEnding(bid, false); } }] }])); return; }
  const after = () => { questBoss(bid); if (['gumu', 'haitianba', 'jinsuanpan', 'yunhe'].filter(k => S.bossDead[k]).length <= 3) { S.siegePending = (S.siegePending || 0) + 1; later(4, () => toast('青崖小築傳來急報：有人要趁虛攻山！回小築守住大陣', 'red')); } saveGame(); };
  say(L.after.concat([{ who: 'choice', t: `${BOSS[bid].short}倒在你面前。你要如何處置？`, choices: [
    { label: '饒他一命（俠義 +10）', fn: () => { addKarma(10); S[bid + 'Spared'] = true; say(L.spare, after); } },
    { label: '斬草除根（魔性 +10）', alt: true, fn: () => { addKarma(-10); S[bid + 'Spared'] = false; gainRes('silver', 1000); say(L.kill, after); } }] }]));
};
// 終章的師父用自己的立繪
const _startBoss = startBoss; startBoss = function (bid, practice) { _startBoss(bid, practice); const F = BOSSFIGHT; if (F && S.jie > 0 && !practice) { const b = F.boss, m = 1 + .4 * S.jie; b.hp = b.maxHp = Math.round(b.hp * m); b.dmg *= m; } };

/* ---------- 新怪物、具名精英 ---------- */
const _namedSpecial2 = namedSpecial2; namedSpecial2 = function (e, dt, dx, dy, dd) {
  const sp = NAMED[e.named].special;
  if (sp === 'chain' && e.spT <= 0 && dd < 420 && dd > 120) { e.spT = 5; const a = Math.atan2(dy, dx); FX.push({ type: 'slash', x1: e.x, y1: e.y, x2: P.x, y2: P.y, t: 0, life: .3, col: '#6a6a6a' }); if (P.dodgeT <= 0) { P.x -= Math.cos(a) * Math.min(dd - 60, 260); P.y -= Math.sin(a) * Math.min(dd - 60, 260); hurtPlayer(e.dmg * .6, e.x, e.y, e); } fxText(e.x, e.y - 60, '鎖拿', INK, 15); return; }
  if (sp === 'roar' && e.spT <= 0 && dd < 220) { e.spT = 6; ringFx(e.x, e.y, 20, 220, INK, .4, 14); doShake(8); if (P.dodgeT <= 0) { const a = Math.atan2(dy, dx); P.x += Math.cos(a) * 140; P.y += Math.sin(a) * 140; hurtPlayer(e.dmg * .7, e.x, e.y, e); P.slowT = Math.max(P.slowT || 0, 1); } fxText(e.x, e.y - 60, '熊吼', INK, 16); return; }
  if (sp === 'talisman' && e.spT <= 0) { e.spT = 7; for (let k = 0; k < 3; k++) { const m = spawnEnemy('minipuppet', e.x + rnd(-60, 60), e.y + rnd(-60, 60), e.camp, { elite: false }); m.aggro = true; m.parent = e; } fxText(e.x, e.y - 60, '起偶', GOLD, 15); return; }
  if (sp === 'leapape' && e.spT <= 0 && dd < 420) { e.spT = 4.5; const tx = P.x, ty = P.y; ringFx(tx, ty, 10, 90, '#d9d6cf', .5, 8); later(.55, () => { if (!e.dead) { e.x = tx; e.y = ty; if (dist(P, e) < 95) hurtPlayer(e.dmg, e.x, e.y, e); ringFx(tx, ty, 10, 95, '#8a8278', .4, 12); doShake(6); } }); fxText(e.x, e.y - 60, '猿跳', INK, 15); return; }
  _namedSpecial2(e, dt, dx, dy, dd);
};

/* ---------- 知己：表白（第 6 段）與之後 ---------- */
const _bondCands = bondCands; bondCands = function () { return _bondCands().filter(k => !(S.zhijiDead && S.zhiji === k)); };
const _bondTalk = bondTalk; bondTalk = function (k) {
  const B = BONDS[k], i = bondEvIdx(k); if (i < 5) return _bondTalk(k);
  const wait = n => say([{ who: k, t: B.line }, { who: 'narr', t: `好感 ${bondPts(k)}　（好感 ${n} 時有新的故事）` }]);
  if (S.zhiji && S.zhiji !== k) return say([{ who: k, t: B.line }, { who: 'narr', t: `你已經與${BONDS[S.zhiji].n}結為知己。${B.n}笑了笑，什麼也沒說。` }]);
  if (i === 5) { if (bondPts(k) < BOND_NEED[5]) return wait(BOND_NEED[5]);
    return say(CONFESS[k].concat([{ who: 'choice', t: '這一次，說出口的話就收不回了。（結為知己後不能更換）', choices: [
      { label: `與${B.n}結為知己`, fn: () => { S.zhiji = k; S.bondEv[k] = 6; addBond(k, 5); closeupFx('結為知己'); toast(`你與${B.n}結為知己`, 'red'); say([{ who: 'narr', t: '從今以後，江湖再大，也是兩個人走。' }], saveGame); } },
      { label: '「再給我一點時間。」', alt: true, fn: () => say([{ who: k, t: '……嗯。我等你。' }]) }] }])); }
  const j = i - 6; if (j >= 4) return say([{ who: k, t: B.line }, { who: 'narr', t: `好感 ${bondPts(k)}　十段故事都走完了。` }]);
  if (bondPts(k) < BOND_NEED[i]) return wait(BOND_NEED[i]);
  const ev = BOND_LATE[k][j], last = j === 3;
  const fin = () => { S.bondEv[k] = i + 1; if (last) { const bk = HEJI_OF[k]; learnBook(S, bk); closeupFx(BOOKS[bk].n); toast(`學會合擊秘笈《${BOOKS[bk].n}》：施展時${B.n}的水墨虛影一同出手`, 'red'); } saveGame(); };
  if (last) return say(ev, fin);
  say(ev.map(l => l.who === 'choice' ? { who: 'choice', t: l.t || '你要怎麼回應？', choices: l.choices.map(c => ({ label: c.label, alt: c.alt, fn: () => { addBond(k, c.b); fin(); say(c.after || [], saveGame); } })) } : l));
};
// 合擊：施展知己的合擊秘笈時，知己的虛影從身側一同出手
const _castPattern = castPattern; castPattern = function (pat, dmg, o, ang, b) {
  if (!b || !b.heji) return _castPattern(pat, dmg, o, ang, b);
  const m = setN('leitai') >= 6 ? 1.4 : 1; _castPattern(pat, dmg * m, o, ang, b);
  const who = S.zhiji && !S.zhijiDead ? S.zhiji : null; if (!who) return; const a = (ang === undefined ? P.face : ang) + Math.PI / 2, gx = P.x + Math.cos(a) * 46, gy = P.y + Math.sin(a) * 46;
  FX.push({ type: 'heji', who, x: gx, y: gy, face: ang === undefined ? P.face : ang, t: 0, life: .9 });
  later(.18, () => { const ox = P.x, oy = P.y; P.x = gx; P.y = gy; _castPattern(pat, dmg * m * .6, Object.assign({}, o, { src: 'ally' }), ang, b); P.x = ox; P.y = oy; });
};

/* ---------- 數值掛鉤：擂台套、太清套、試煉塔加成、凝神丹、招財貓 ---------- */
const _maxMp = maxMp; maxMp = function () { return Math.round(_maxMp() * (setN('taiqing') >= 2 ? 1.15 : 1)); };
const _mpRegen = mpRegen; mpRegen = function () { return _mpRegen() * (setN('taiqing') >= 4 ? 1.25 : 1) * (S.buffs.ningshen > 0 ? 1.5 : 1) * (TOWER && TOWER.buff === 'mp' ? 1.6 : 1); };
const _critRate = critRate; critRate = function () { return Math.min(.8, _critRate() + (setN('leitai') >= 2 ? .05 : 0) + (TOWER && TOWER.buff === 'crit' ? .15 : 0)); };
const _critDmg = critDmg; critDmg = function () { return _critDmg() + (setN('leitai') >= 4 ? .2 : 0); };
const _dmgMul = dmgMul; dmgMul = function () { return _dmgMul() * (TOWER && TOWER.buff === 'atk' ? 1.2 : 1); };
const _moveSpeed = moveSpeed; moveSpeed = function () { return _moveSpeed() * (TOWER && TOWER.buff === 'spd' ? 1.2 : 1); };
const _gainRes = gainRes; gainRes = function (k, n, x, y) { if (k === 'silver' && S && S.pet === 'cat' && x !== undefined) n = Math.round(n * 1.1); _gainRes(k, n, x, y); };
const _giveReward = giveReward; giveReward = function (r, x, y) { _giveReward(r, x, y); if (r && r.pill_xian) { S.xianPill = true; S.mer.ren = (S.mer.ren || 0) + 3; toast('仙丹入腹：任脈 +3 重', 'red'); } };

/* ---------- 江湖劫 ---------- */
const _spawnEnemy = spawnEnemy; spawnEnemy = function (type, x, y, camp, opt) { const e = _spawnEnemy(type, x, y, camp, opt); if (e && S && S.jie > 0 && e.tag !== 'tower' && !(opt && opt.noJie)) { const m = 1 + .4 * S.jie; e.hp = e.maxHp = Math.round(e.maxHp * m); e.dmg *= m; e.jie = S.jie; } return e; };
const _killEnemy = killEnemy; killEnemy = function (e) { _killEnemy(e); if (!e.boss && e.jie > 0 && !e.tag) { const j = e.jie; if (Math.random() < .25 * j) gainRes('silver', rint(e.def.silver[0], e.def.silver[1] + 1), e.x, e.y - 30); if (Math.random() < .02 * j) addItem(makeItem(pick(['robe', 'hat', 'boots', 'belt', 'acc']), j >= 7 ? 4 : j >= 3 ? 3 : 2)); }
  if (TOWER && e.tag === 'tower') TOWER.kills = (TOWER.kills || 0) + 1; };
const _questClear = questClear; questClear = function (camp) { _questClear(camp); if (S.jie > 0) { S.jieProg = S.jieProg || {}; S.jieProg[S.jie] = (S.jieProg[S.jie] || 0) + 1; const n = S.jieProg[S.jie];
  if (n >= 10 && (S.jiePass || 0) < S.jie) { S.jiePass = S.jie; banner(`通過江湖${['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'][S.jie]}劫`, '首通特定劫數會得到稱號'); saveGame(); } else if (n < 10) toast(`江湖劫：清空據點 ${n}/10`); } };
function setJie(n) { if (!S.ending) return toast('破關之後才能敲響江湖劫鐘'); S.jie = clamp(n, 0, 10); E = E.filter(e => e.tag || e.boss); for (const id in S.camps) { S.camps[id].spawned = false; } toast(S.jie ? `江湖劫：${S.jie} 劫（敵人氣血與傷害 +${S.jie * 40}%、掉落 +${S.jie * 25}%）` : '江湖劫：回到平常的江湖', 'red'); saveGame(); }

/* ---------- 血獄試煉塔 ---------- */
const TOWER_BUFFS = { atk: ['鋒芒', '傷害 +20%'], hp: ['金身', '受到的傷害 −20%'], mp: ['氣海', '內力回復 +60%'], heal: ['回春', '每清一層回復 30% 氣血'], crit: ['會心', '暴擊率 +15%'], spd: ['疾風', '移動速度 +20%'] };
const TOWER_BOOKS = { 25: 'xueyu_jian', 50: 'xiuluo_dao', 75: 'yanluo_zhang', 100: 'wuying_zhen' };
const TOWER_POOL = ['bandit', 'wolf', 'assassin', 'snake', 'horse_bandit', 'scorpion', 'snowwolf', 'traitor', 'cultist', 'hexer', 'bloodpuppet', 'miao_warrior', 'blowdart', 'toad', 'pirate', 'pirate_xbow', 'crab', 'guard', 'xbow', 'thug', 'puppet', 'ape', 'talisman', 'thunder'];
function towerRoom() { return ROOMS.find(r => r.id === 'tower_room'); }
function towerOffer() { if (!S.towerOffer || S.towerOffer.day !== dayKey()) S.towerOffer = { day: dayKey(), k: Object.keys(TOWER_BUFFS).sort(() => Math.random() - .5).slice(0, 3) }; return S.towerOffer.k; }
function enterTower(buff) { if (!S.ending) return; const R = towerRoom(); TOWER = { floor: 0, buff, wait: 1.5, kills: 0 }; closePanel(); travelTo(R.x + R.w / 2, R.y + R.h - 120); banner('血獄試煉塔', `加成：${TOWER_BUFFS[buff][0]}（${TOWER_BUFFS[buff][1]}）`); music('boss'); }
function towerFloor() { const T = TOWER, R = towerRoom(); T.floor++; T.spawned = true; const f = T.floor, m = 1 + .15 * f, n = Math.min(14, 4 + Math.floor(f / 4)); banner(`第 ${f} 層`, f % 10 ? '清光敵人才能往上' : '守層頭目'); const pool = TOWER_POOL.slice(0, Math.min(TOWER_POOL.length, 6 + f));
  const put = (type, opt) => { const e = _spawnEnemy(type, R.x + 120 + Math.random() * (R.w - 240), R.y + 100 + Math.random() * (R.h * .55), null, Object.assign({ elite: false }, opt)); e.tag = 'tower'; e.aggro = true; e.hp = e.maxHp = Math.round(e.maxHp * m); e.dmg *= m; return e; };
  if (f % 10 === 0) { const k = pick(Object.keys(NAMED)); const e = put(NAMED[k].base, { named: k }); e.hp = e.maxHp = Math.round(e.maxHp * (1 + .08 * f)); for (let i = 0; i < 3; i++) put(pick(pool)); }
  else for (let i = 0; i < n; i++) put(pick(pool), { elite: Math.random() < Math.min(.3, f * .01) }); }
function towerClear() { const T = TOWER, f = T.floor; S.towerBest = Math.max(S.towerBest || 0, f); gainRes('xiu', 40 * f); gainRes('silver', 30 * f); if (T.buff === 'heal') P.hp = Math.min(maxHp(), P.hp + maxHp() * .3);
  if (f % 10 === 0) { gainRes('iron', 20 + f); gainRes('page', 5 + Math.floor(f / 10)); addItem(makeItem(pick(['robe', 'hat', 'boots', 'belt', 'acc']), f >= 50 ? 4 : 3)); toast(`守層頭目倒下：鐵礦、殘頁、修為與高階裝備`, 'red'); }
  const bk = TOWER_BOOKS[f]; if (bk && !S.books[bk]) { learnBook(S, bk); closeupFx(BOOKS[bk].n); toast(`血獄獨家秘笈《${BOOKS[bk].n}》`, 'red'); }
  if (f >= 125 && f % 25 === 0) { gainRes('page', 40); toast('高層獎勵：殘頁 40'); }
  T.spawned = false; T.wait = 2.5; saveGame(); }
function leaveTower(dead) { const T = TOWER; if (!T) return; TOWER = null; E = E.filter(e => e.tag !== 'tower'); const p = PLACES.tower_gate; travelTo(p.x, p.y + 80, true); P.hp = Math.max(P.hp, maxHp() * (dead ? 1 : P.hp / maxHp())); music(curRegion());
  banner(dead ? '被送出血獄' : '離開血獄', `這次登上第 ${T.floor} 層　最高 ${S.towerBest || 0} 層`); saveGame(); }
function tickTower(dt) { const T = TOWER; if (!T) return; const R = towerRoom(); if (!(P.x > R.x - 60 && P.x < R.x + R.w + 60 && P.y > R.y - 60 && P.y < R.y + R.h + 60)) { leaveTower(false); return; }
  if (!T.spawned) { T.wait -= dt; if (T.wait <= 0) towerFloor(); return; } if (!E.some(e => e.tag === 'tower' && !e.dead)) towerClear(); }
const _playerDown = playerDown; playerDown = function () { if (TOWER) { P.hp = maxHp(); P.mp = maxMp(); toast('你倒在血獄裡──被送出了塔（不會刪檔）', 'red'); leaveTower(true); return; } if (S.xuming > 0) S.xumingUsed = true; _playerDown(); };

/* ---------- 擂台挑戰、賭坊、兵器鋪、棋局 ---------- */
function startLeitai() { if (LEITAI || BOSSFIGHT) return; LEITAI = { round: 0, wait: 1 }; closePanel(); const p = PLACES.leitai; P.x = p.x; P.y = p.y + 140; toast('擂台挑戰開始：連勝五場，不能下台', 'red'); }
function tickLeitai(dt) { const L = LEITAI; if (!L) return; const p = PLACES.leitai;
  if (dist(P, p) > 380 || P.dead) { LEITAI = null; E = E.filter(e => e.tag !== 'leitai'); return toast('你下了擂台。連勝中斷。'); }
  if (L.spawned && !E.some(e => e.tag === 'leitai' && !e.dead)) { L.spawned = false; L.wait = 2; toast(`第 ${L.round} 場勝！`, 'red'); if (L.round >= 5) { LEITAI = null; gainRes('silver', 1500); if (!S.books.leitai_fist) { learnBook(S, 'leitai_fist'); closeupFx('擂台拳'); say([{ who: 'leitai_master', t: '五連勝！好！我周通說話算話，這套擂台拳是你的了！' }]); } else toast('五連勝！擂台主送上銀兩 1500', 'red'); saveGame(); } return; }
  if (!L.spawned) { L.wait -= dt; if (L.wait > 0) return; L.round++; L.spawned = true; banner(`擂台第 ${L.round} 場`, '');
    const T = [['thug'], ['guard', 'thug'], ['dogman', 'xbow'], ['thug', 'guard', 'thug'], ['heixiong']][L.round - 1];
    for (const t of T) { const e = t === 'heixiong' ? spawnEnemy('thug', p.x, p.y - 120, null, { named: 'heixiong' }) : spawnEnemy(t, p.x + rnd(-120, 120), p.y - 120, null, { elite: L.round >= 4 }); e.tag = 'leitai'; e.aggro = true; } } }
function gamble(bet, big) { if (S.res.silver < bet) return toast('銀兩不夠'); S.res.silver -= bet; const d = [rint(1, 6), rint(1, 6), rint(1, 6)], sum = d[0] + d[1] + d[2], triple = d[0] === d[1] && d[1] === d[2], win = !triple && (big ? sum >= 11 : sum <= 10);
  if (win) { S.res.silver += bet * 2; S.casinoWin = (S.casinoWin || 0) + 1; toast(`骰子 ${d.join('・')}＝${sum}，${big ? '大' : '小'}！贏了 ${bet} 兩`, 'red'); if (S.casinoWin >= 3 && !S.pets.includes('cat')) { giveReward({ pet: 'cat' }); say([{ who: 'gambler', t: '客官手氣真旺！這隻貓整天蹲在我的錢箱上，看來是跟定你了。' }]); } }
  else toast(`骰子 ${d.join('・')}＝${sum}${triple ? '（豹子，莊家通吃）' : ''}，輸了 ${bet} 兩`); saveGame(); }
function buyGear(slot, tier, price) { if (S.res.silver < price) return toast('銀兩不夠'); const it = makeItem(slot, tier, { set: Math.random() < .35 ? 'leitai' : null }); if (!addItem(it)) return; S.res.silver -= price; toast('買下了'); saveGame(); }
function playQiju() { if (S.encounters.qiju) return say([{ who: 'crane_old', t: '棋下完了。你回去吧，雲很好。' }]); let i = 0;
  const ask = () => { if (i >= QIJU_Q.length) { encounter('qiju'); S.mer.yangqiao = (S.mer.yangqiao || 0) + 5; refreshStats && refreshStats(); return say([{ who: 'crane_old', t: '三局全對。老頭子替你通一通陽蹻脈。' }]); } const q = QIJU_Q[i];
    say([{ who: 'crane_old', t: q.q }, { who: 'choice', t: '', choices: q.a.map((a, j) => ({ label: a, fn: () => { if (j === q.ok) { say([{ who: 'crane_old', t: q.yes }], () => { i++; ask(); }); } else say([{ who: 'crane_old', t: q.no + '……改天再來下。' }]); } })) }]); };
  say([{ who: 'crane_old', t: '雲上無事，陪老頭子下盤棋？三題，答對了有好處。' }], ask); }

/* ---------- 雲海與仙鶴 ---------- */
let craneT = 20;
function tickCh3Weather(dt) { const w = curWeather(); if (w === '雲海' && curRegion() === 'kunlun' && !BOSSFIGHT && !SIEGE) { craneT -= dt; if (craneT <= 0) { craneT = rnd(25, 40); for (let k = 0; k < 2; k++) { const a = rnd(0, TAU); const e = spawnEnemy('crane', P.x + Math.cos(a) * 320, P.y + Math.sin(a) * 320, null, { elite: false }); e.aggro = true; } toast('雲裡飛來兩隻仙鶴'); } } }

/* ---------- 每幀 ---------- */
const _tickCh2 = tickCh2; tickCh2 = function (dt) { _tickCh2(dt); if (!S || PAUSE_STORY) return; if (S.buffs.ningshen > 0) S.buffs.ningshen -= dt; tickCh3Story(); tickTower(dt); tickLeitai(dt); tickCh3Weather(dt); };

/* ---------- 互動 ---------- */
function ch3Interact(c, pp) {
  if (S.ending) { const p = pp('tower_gate'); c(p.x, p.y, 110, `血獄試煉塔（最高 ${S.towerBest || 0} 層）`, () => openPanel('tower', null, { title: '血獄試煉塔' }), '試煉塔'); const b = pp('jie_bell'); c(b.x, b.y, 90, `江湖劫鐘（目前 ${S.jie || 0} 劫）`, () => openPanel('jie', null, { title: '江湖劫鐘' }), '劫鐘'); }
  if (TOWER) { const X = pp('tower_exit'); c(X.x, X.y, 90, '離開血獄試煉塔', () => leaveTower(false), '出塔'); }
  if (!S.ch2) return;
  for (const k of ['board_z', 'board_k']) if (placeVisible(k, pp(k))) c(pp(k).x, pp(k).y, 90, '告示板（委託）', () => openPanel('board', null, { title: '告示板' }), '告示');
  const T3 = { leitai: ['leitai_master', '擂台主周通', () => openPanel('leitai', null, { title: '武林大會擂台' })], teahouse: ['zhangbanxia', '茶樓（張半瞎）', () => say([{ who: 'zhangbanxia', t: pick(['啪！話說三十年前……欸，客官下回再來。', '江湖傳聞，多讀多記，老瞎子哪天又要考你。', '茶要趁熱，書要趁新。']) }])],
    huiguan: ['huiguan', '正派會館', () => openPanel('huiguan', null, { title: '正派會館' })], weapon_shop: ['zy_smith', '兵器鋪', () => openPanel('zyshop', null, { title: '兵器鋪 歐老闆' })], casino: ['gambler', '賭坊', () => openPanel('casino', null, { title: '賭坊' })],
    taoguan: ['guanzhu', '崑崙道觀', () => openPanel('guanzhu', null, { title: '崑崙道觀' })], saodi: ['saodi', '道觀後院（掃地道人）', () => say([{ who: 'saodi', t: pick(['落葉掃不完的。', '你又踩到我剛掃好的地了。', '傀儡的灰，也是灰。']) }])], chess: ['crane_old', '雲中棋局（仙鶴老人）', playQiju] };
  for (const k in T3) { const p = pp(k); if (!placeVisible(k, p)) continue; const [npc, nm, idle] = T3[k]; c(p.x, p.y, 110, nm, () => { if (questTalk(npc)) return; const tr = matchTrack('trial', 'id', npc); if (tr) return startTrial(tr, npc); idle(); }, nm.slice(0, 2)); }
  if (stepIs('talk', 'npc', 'linxiao') || placeVisible('mengzhu_fu', pp('mengzhu_fu')) && !S.bossDead.linxiao) { const p = pp('mengzhu_fu'); c(p.x, p.y, 110, '盟主府', () => { if (questTalk('linxiao')) return; say([{ who: 'narr', t: '盟主府的大門緊閉，門口的家丁看了你一眼，又把頭轉開。' }]); }, '盟主府'); }
  if (S.bond && S.bond.lin) { const p = pp('lin_home'); for (const [k, dx] of [['yushuang', -30], ['jinghong', 30]]) if (S.companion !== k && !(S.zhijiDead && S.zhiji === k)) c(p.x + dx, p.y, 70, `與${NPCS[k].n}交談`, () => { if (bondCands().includes(k)) return bondTalk(k); say([{ who: k, t: BONDS[k].line }]); }, k === 'yushuang' ? '語霜' : '驚鴻'); }
}
const SEC3 = { tomb: ['古城地宮入口（往下走）', '爬回地面', '地底有風，帶著前朝的灰。'], cloud: ['古松洞（鑽進去）', '鑽出松洞', '洞裡的雲，比天上的還厚。'] };

/* ---------- 面板 ---------- */
Object.assign(PANELS, {
  tower: () => { const o = towerOffer(); return `<p class="note">最高 ${S.towerBest || 0} 層。每層隨機怪物組合，清光才能往上；每 10 層守層頭目。第 25／50／75／100 層有獨家秘笈。<b>在塔裡死亡只會被送出塔，不會刪檔。</b></p><div class="sub">選一個這次爬塔的加成</div>`
    + o.map(k => item(TOWER_BUFFS[k][0], '', TOWER_BUFFS[k][1], '', btn('x3:tower:' + k, '進塔', !!BOSSFIGHT))).join(''); },
  jie: () => `<p class="note">每升一劫，全地圖敵人氣血與傷害 +40%（疊加），掉落 +25%，裝備品階提高。在一個劫數下清空 10 個據點，就算通過那一劫。已通過：${S.jiePass || 0} 劫。</p><div class="btns">`
    + Array.from({ length: 11 }, (_, n) => btn('x3:jie:' + n, n ? `${n} 劫` : '平常', (S.jie || 0) === n, n > (S.jiePass || 0) + 1 ? 'ghost' : '')).join('') + '</div>',
  leitai: () => item('擂台挑戰', S.books.leitai_fist ? '擂台拳已學會' : '', '連勝五場，中途不能下台。第五場的對手是黑市的黑熊。五連勝送銀兩，第一次還有《擂台拳》。', '', btn('x3:leitai', '上台', !!LEITAI || trk('zhong').n < 2))
    + (trk('zhong').n < 2 ? '<p class="note">擂台主：「先過了我的三關再說。」</p>' : ''),
  huiguan: () => resLine(['silver']) + item('浩然劍' + bookTag('haoran_sword'), '兵器招式・劍・柔', S.karma >= 30 ? '會館執事願意傳你：劍氣一往無前。' : '正派會館只傳俠義之人（善惡值 ≥ +30）。', '', btn('x3:learn:haoran_sword', S.books.haoran_sword ? '已學會' : '求教', !!S.books.haoran_sword || S.karma < 30)),
  guanzhu: () => resLine(['silver']) + item('太清心法' + bookTag('taiqing'), '內功心法・柔', '靜心養氣，內力深厚。', costStr({ silver: 800 }), btn('learn:taiqing:800', S.books.taiqing ? '已學會' : '學', !!S.books.taiqing || S.res.silver < 800))
    + item('寒雲勁' + bookTag('hanyun'), '氣功・寒', S.books.hanyun ? '已學會。' : '觀主說：「先過雲海試煉。」', '', btn('noop', S.books.hanyun ? '已學會' : '未解鎖', true)),
  casino: () => resLine(['silver']) + `<p class="note">三顆骰子，押大（11–18）或小（3–10）；豹子莊家通吃。贏了 ${S.casinoWin || 0} 把${S.pets.includes('cat') ? '' : '（贏三把，莊家的招財貓會跟你走）'}。</p>`
    + [100, 500, 2000].map(b => item(`押 ${b} 兩`, '', '', '', `<div class="btns">${btn(`x3:bet:${b}:1`, '押大', S.res.silver < b)}${btn(`x3:bet:${b}:0`, '押小', S.res.silver < b, 'ghost')}</div>`)).join(''),
  zyshop: () => resLine(['silver']) + `<p class="note">古城最好的兵器鋪。偶爾會出擂台套。</p>` + ['robe', 'hat', 'boots', 'belt', 'acc'].map(sl => { const N = { robe: '護衣', hat: '頭冠', boots: '靴子', belt: '腰帶', acc: '飾品' }[sl];
    return item(N, '', '', '', `<div class="btns">${btn(`x3:buy:${sl}:3:1200`, '玄鐵 1200', S.res.silver < 1200)}${btn(`x3:buy:${sl}:4:4000`, '寶器 4000', S.res.silver < 4000 || !S.bossDead.jinsuanpan, 'ghost')}</div>`); }).join('') + (S.bossDead.jinsuanpan ? '' : '<p class="note">寶器要等黑市的帳清了才進得到貨。</p>'),
});
function ch3Act(x, y, z, w) {
  if (x === 'tower') enterTower(y); if (x === 'jie') setJie(+y); if (x === 'leitai') startLeitai();
  if (x === 'learn' && y === 'haoran_sword' && S.karma >= 30 && !S.books.haoran_sword) { learnBook(S, y); questLearn(); }
  if (x === 'bet') gamble(+y, z === '1'); if (x === 'buy') buyGear(y, +z, +w);
}

/* ---------- 繪圖 ---------- */
const _drawCh2Ground = drawCh2Ground; drawCh2Ground = function (vis) { _drawCh2Ground(vis); const F = BOSSFIGHT;
  // 擂台
  { const ap = PLACES.leitai; if (vis(ap.x, ap.y, 380)) { if (!drawStatic('leitai_stage', ap.x, ap.y + 240, 460)) { g.fillStyle = 'rgba(120,80,50,.5)'; g.fillRect(ap.x - 300, ap.y - 220, 600, 400); g.strokeStyle = 'rgba(60,40,20,.7)'; g.lineWidth = 4; g.strokeRect(ap.x - 300, ap.y - 220, 600, 400); g.fillStyle = CIN; for (const [dx, dy] of [[-300, -220], [300, -220], [-300, 180], [300, 180]]) g.fillRect(ap.x + dx - 6, ap.y + dy - 40, 12, 40); } } }
  // 賭坊的賭桌
  { const A = ARENAS.jinsuanpan, ap = PLACES[A.place]; if (vis(ap.x, ap.y, A.r + 60)) { g.fillStyle = 'rgba(70,40,30,.35)'; g.beginPath(); g.ellipse(ap.x, ap.y, A.r + 20, (A.r + 20) * .8, 0, 0, TAU); g.fill(); for (const [dx, dy] of A.tables) if (!drawStatic('gamble_table', ap.x + dx, ap.y + dy + 20, 110)) { g.fillStyle = 'rgba(40,90,60,.8)'; g.fillRect(ap.x + dx - 45, ap.y + dy - 20, 90, 40); g.strokeStyle = '#3a2a1a'; g.strokeRect(ap.x + dx - 45, ap.y + dy - 20, 90, 40); } } }
  // 雲橋
  { const A = ARENAS.yunhe, ap = PLACES[A.place]; if (vis(ap.x, ap.y, A.r + 60)) { const tiles = F && F.bid === 'yunhe' ? bridgeTiles(F) : null;
    if (tiles) for (const t of tiles) { if (t.state === 2) continue; g.fillStyle = t.state === 1 ? `rgba(200,210,220,${.4 + Math.sin(gameT * 14) * .25})` : 'rgba(150,130,100,.6)'; g.fillRect(t.x + 3, t.y + 3, t.s - 6, t.s - 6); g.strokeStyle = 'rgba(80,60,40,.5)'; g.strokeRect(t.x + 3, t.y + 3, t.s - 6, t.s - 6); }
    else { g.fillStyle = 'rgba(150,130,100,.45)'; g.beginPath(); g.arc(ap.x, ap.y, A.r, 0, TAU); g.fill(); g.strokeStyle = 'rgba(80,60,40,.35)'; g.lineWidth = 2; for (let k = -A.r; k <= A.r; k += 110) { g.beginPath(); g.moveTo(ap.x - A.r, ap.y + k); g.lineTo(ap.x + A.r, ap.y + k); g.stroke(); } } } }
  // 雲海天台、青崖山頂
  for (const bid of ['xuanxiao', 'qingxu']) { const A = ARENAS[bid], ap = PLACES[A.place]; if (!vis(ap.x, ap.y, A.r + 60)) continue; if (bid === 'xuanxiao') { g.fillStyle = 'rgba(240,244,246,.55)'; g.beginPath(); g.arc(ap.x, ap.y, A.r + 20, 0, TAU); g.fill(); g.strokeStyle = 'rgba(160,170,180,.5)'; g.lineWidth = 3; g.stroke(); }
    else { g.fillStyle = 'rgba(120,110,90,.25)'; g.beginPath(); g.ellipse(ap.x, ap.y, A.r + 20, (A.r + 20) * .8, 0, 0, TAU); g.fill(); if (!drawStatic('teatable', ap.x, ap.y - A.r + 70, 120)) { } } }
  if (F && F.bolts) for (const m of F.bolts) if (!m.done) { g.strokeStyle = `rgba(200,212,230,${.5 + Math.sin(gameT * 16) * .3})`; g.setLineDash([8, 6]); g.lineWidth = 2; g.beginPath(); g.arc(m.x, m.y, m.r, 0, TAU); g.stroke(); g.setLineDash([]); }
  if (F && F.boss.act && F.boss.act.marks && (F.boss.act.type === 'thunder' || F.boss.act.type === 'coinrain' || F.boss.act.type === 'storm')) { const a = F.boss.act, col = a.blood ? '150,20,20' : a.type === 'coinrain' ? '201,162,74' : '160,180,210'; for (const m of a.marks) { g.fillStyle = `rgba(${col},.18)`; g.strokeStyle = `rgba(${col},.8)`; g.setLineDash([8, 6]); g.lineWidth = 2; g.beginPath(); g.arc(m.x, m.y, m.r, 0, TAU); g.fill(); g.stroke(); g.setLineDash([]); } }
  if (F && F.chips) for (const c of F.chips) { g.fillStyle = GOLD; g.beginPath(); g.ellipse(c.x, c.y, 12, 7, 0, 0, TAU); g.fill(); g.strokeStyle = '#6a4a10'; g.stroke(); }
};
const _drawCh2Top = drawCh2Top; drawCh2Top = function (vis) { _drawCh2Top(vis); const F = BOSSFIGHT;
  if (F && F.boss.act && F.boss.act.type === 'drain' && F.boss.act.on) { const b = F.boss; g.strokeStyle = `rgba(140,160,190,${.5 + Math.sin(gameT * 20) * .3})`; g.lineWidth = 6; g.beginPath(); g.moveTo(P.x, P.y - 30); g.lineTo(b.x, b.y - 40); g.stroke(); }
  for (const f of FX) if (f.type === 'heji') { const a = .75 * (1 - f.t / f.life); if (!drawSprActor(g, f.x, f.y, f.face, f.who, { t: gameT, alpha: a })) drawHumanCtx(g, f.x, f.y, f.face, Object.assign({ weapon: 'sword' }, NPCS[f.who].look), { spr: f.who, t: gameT, alpha: a }); }
};
const _drawCh2Screen = drawCh2Screen; drawCh2Screen = function () { _drawCh2Screen(); const w = curWeather();
  if (w === '雲海' && curRegion() === 'kunlun') { const [px, py] = W2S(P.x, P.y); const gr = g.createRadialGradient(px, py, 160 * ZOOM, px, py, 600 * ZOOM); gr.addColorStop(0, 'rgba(250,252,253,0)'); gr.addColorStop(1, 'rgba(250,252,253,.75)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
  const bar = (label, v, col) => { const bw = Math.min(360, W * .5), x = (W - bw) / 2, y = 120; g.fillStyle = 'rgba(29,26,23,.55)'; g.fillRect(x - 2, y - 2, bw + 4, 14); g.fillStyle = col; g.fillRect(x, y, bw * clamp(v, 0, 1), 10); g.font = `14px ${FONT}`; g.textAlign = 'center'; g.fillStyle = INK; g.fillText(label, W / 2, y - 6); };
  if (TRIAL && TRIAL.id === 'saodi') bar(`掃地道人的考驗　傀儡 ${TRIAL.kills}/20　剩 ${Math.max(0, Math.ceil(TRIAL.t))} 秒（不能受傷）`, TRIAL.kills / 20, '#8a7a5a');
  if (TOWER) { g.font = `18px ${FONT}`; g.textAlign = 'center'; g.fillStyle = CIN; g.fillText(`血獄試煉塔・第 ${TOWER.floor} 層　（${TOWER_BUFFS[TOWER.buff][0]}）`, W / 2, 104); }
  if (LEITAI) bar(`擂台挑戰・第 ${LEITAI.round} 場`, LEITAI.round / 5, CIN);
  if (S.jie > 0 && !TOWER) { g.font = `14px ${FONT}`; g.textAlign = 'right'; g.fillStyle = CIN; g.fillText(`江湖劫 ${S.jie}`, W - 14, H - 14); }
};
function drawPlace3(k, p) { const x = p.x, y = p.y;
  if (k === 'taoguan') { if (!drawStatic('b_taoguan', x, y - 20, 300)) { g.fillStyle = 'rgba(220,214,200,.95)'; g.fillRect(x - 120, y - 140, 240, 90); g.fillStyle = INK; g.beginPath(); g.moveTo(x - 150, y - 136); g.lineTo(x, y - 200); g.lineTo(x + 150, y - 136); g.fill(); } return false; }
  if (k === 'puppet_lab') { if (!drawStatic('b_puppetlab', x, y, 220)) { g.fillStyle = 'rgba(120,110,100,.9)'; g.fillRect(x - 90, y - 90, 180, 90); } label(p.n, x, y + 24, '#6a645a'); return true; }
  if (k === 'blackmarket') { label(p.n, x, y + 24, '#5a1416'); return true; }
  if (k === 'mengzhu_fu') { if (!S.bossDead.linxiao && S.finalBoss !== 'linxiao') npcAt(x, y, 'linxiao', Math.PI / 2, NPCS.linxiao.n); if (stepIs('talk', 'npc', 'linxiao') || stepIs('choice', 'place', 'mengzhu_fu')) { g.fillStyle = GOLD; g.font = `bold 22px ${FONT}`; g.textAlign = 'center'; g.fillText('！', x, y - 70 + Math.sin(gameT * 4) * 3); } label(p.n, x, y + 24, INK); return true; }
  if (k === 'lin_home') { if (!(S.bond && S.bond.lin)) { label(p.n, x, y + 24, '#6a645a'); return true; } for (const [kk, dx] of [['yushuang', -30], ['jinghong', 30]]) if (S.companion !== kk && !(S.zhijiDead && S.zhiji === kk)) npcAt(x + dx, y, kk, Math.PI / 2, NPCS[kk].n.slice(-3)); return true; }
  if (k === 'chess') { if (!drawStatic('chessboard', x + 60, y + 10, 90)) { g.fillStyle = '#c8b48a'; g.fillRect(x + 30, y - 10, 60, 40); g.strokeStyle = INK; g.strokeRect(x + 30, y - 10, 60, 40); } return false; }
  if (k === 'kid_spot' || k === 'yunhai_trial') { label(p.n, x, y - 10, '#6a645a'); return true; }
  if (k === 'tower_gate') { if (!S.ending) return true; if (!drawStatic('b_tower', x, y + 10, 200)) { g.fillStyle = 'rgba(70,24,22,.92)'; g.fillRect(x - 50, y - 200, 100, 200); g.fillStyle = CIN; g.fillRect(x - 14, y - 40, 28, 40); } label(p.n, x, y + 28, CIN); return true; }
  if (k === 'jie_bell') { if (!S.ending) return true; if (!drawStatic('b_bell', x, y + 10, 110)) { g.fillStyle = '#6a5a3a'; g.fillRect(x - 40, y - 110, 6, 110); g.fillRect(x + 34, y - 110, 6, 110); g.fillRect(x - 46, y - 116, 92, 8); g.fillStyle = '#8a6a3a'; g.beginPath(); g.moveTo(x - 22, y - 50); g.quadraticCurveTo(x, y - 110, x + 22, y - 50); g.fill(); } label(p.n, x, y + 26, CIN); return true; }
  if (k === 'tomb_gate' || k === 'pine_cave' || k === 'tomb_exit' || k === 'cloud_exit' || k === 'tower_exit') { if (k === 'tower_exit' && !TOWER) return true; drawEntrance(k, x, y); label(p.n, x, y + 38); return true; }
  return false; }
