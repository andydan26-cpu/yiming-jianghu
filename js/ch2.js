'use strict';
/* 一命江湖 2a — 第二章系統：三年後、關鍵抉擇與線索、救援、世外高人考驗、守山戰、知己、毒霧海霧、兩場頭目戰
   本檔接在 systems.js 之後載入。 */

ENEMIES.hunter = { n: '黑衣追兵', hp: 420, dmg: 34, spd: 150, r: 16, ai: 'dash', xiu: 30, silver: [16, 30], drops: { cloth: 0.4, page: 0.06 }, look: 'man', robe: '#1d1a17', acc: '#6a6a6a', hat: 'veil', weapon: 'sword', multiDash: true };
Object.assign(PEOPLE_BIO, {
  wuyi: '苗疆巫醫白婆，嘴硬心軟，傳授金蠶蠱針與五毒心法。', zhaizhu: '五毒寨主岩崗，最恨漢人來偷蠱。', langu: '隱谷毒仙藍姑。苗服銀飾、赤足，腰掛竹簍；古怪重情，師父在崑崙失蹤。',
  yubang: '東海漁幫幫主浪裡白，和海天霸曾是同一條船上的兄弟。', laochuanfu: '東海碼頭的老船夫陳伯，傳授浪裡蛟。', diaosou: '孤島上的東海釣叟，赤膊拄魚叉：「浪是追不上的，只能跟。」',
  suxin: '青崖師姐沈素心。青衣束髮、使雙劍，溫柔堅定、護短。十年前看過禁閣的手札，連夜下山。', changfeng: '青崖師兄顧長風。青衫長髮、背長劍，爽朗重義：「有師兄在。」',
  gumu: '苗疆蠱師蠱母婆婆。佝僂老嫗、滿身銀飾、蛇杖；用高手的內力養蠱王，替「雲上的人」煉長生。', haitianba: '海盜首領鯊王海天霸。獨眼、鯊齒項鍊、雙彎刀；當年輸了一場被做局的賭，上了海盜船。',
});
WEATHER_MSG['毒霧'] = '毒霧升起：每秒少量掉血（避毒香減半、五毒套免疫），毒屬性傷害 +20%';
WEATHER_MSG['海霧'] = '海霧來了：視野縮小，海盜會從霧裡伏擊';

/* ---------- 三年後 ---------- */
function startChapter2() {
  if (S.ch2 || !chapterDone()) return; PAUSE_STORY = true;
  storyboard(CH2_INTRO, () => { PAUSE_STORY = false; S.ch2 = true; S.unlock.ch2 = true; S.ch2At = Date.now(); P.x = PLACES.master.x; P.y = PLACES.master.y + 90;
    say(CH2_START, () => { banner('第二章　江湖真相', '苗疆・東海・中原・崑崙'); CH2A_TRACKS.forEach(r => onNodeStart(r)); saveGame(); }); saveGame(); });
}
let PAUSE_STORY = false;
function storyboard(frames, done) {
  let el = document.getElementById('storyb'); if (!el) { el = document.createElement('div'); el.id = 'storyb'; document.body.appendChild(el); }
  let i = 0; el.hidden = false;
  const show = () => { const f = frames[i]; el.innerHTML = `<div class="sb-in ${f.big ? 'big' : ''}"><p>${esc(f.t).replace(/\n/g, '<br>')}</p></div><div class="sb-hint">點一下繼續（${i + 1}/${frames.length}）</div>`; };
  const next = () => { i++; if (i >= frames.length) { el.hidden = true; el.onclick = null; clearTimeout(el._t); done && done(); return; } show(); clearTimeout(el._t); el._t = setTimeout(next, frames[i].big ? 3200 : 5200); };
  el.onclick = next; show(); el._t = setTimeout(next, frames[0].big ? 3200 : 5200);
}

/* ---------- 主線步驟：抉擇、救援、波次、考驗 ---------- */
function clueAdd(k, id) { S.clue = S.clue || { meng: 0, xian: 0, shi: 0 }; S.clue[k]++; S.clueLog = S.clueLog || []; S.clueLog.push({ id, k }); const N = { meng: '盟主線', xian: '仙人線', shi: '師父線' }; toast(`線索：${N[k]} +1`, 'red'); }
function ch2StepTick(r, s) {
  if (dlg || BOSSFIGHT) return false; const p = PLACES[s.place];
  if (s.type === 'choice' && p && dist(P, p) < 140 && !(P.choiceCd > 0)) { P.choiceCd = 3; runChoice(r, s); return true; }
  if (s.type === 'rescue' && !RESC && p && dist(P, p) < 160 && !(P.choiceCd > 0)) { P.choiceCd = 3; runRescue(r, s); return true; }
  if (s.type === 'waves' && !WAVES[s.id] && (p || CAMPS[s.place])) { const q = p || CAMPS[s.place];
    if (dist(P, q) < 520) { if (s.night && !isNight()) { if (!(P.nightMsg > 0)) { P.nightMsg = 8; toast('要等入夜才會漲潮：找漁幫幫主「等到天黑」'); } return false; } startWavesStep(r, s); return true; } }
  return false;
}
function runChoice(r, s) {
  const opts = s.opts.map(o => ({ label: o.label, alt: o.alt, fn: () => { clueAdd(o.clue, s.id); if (o.karma) addKarma(o.karma); if (o.rep) addRep(o.rep); if (o.reward) giveReward(o.reward); say(o.after || [], () => { advanceStep(r); saveGame(); }); } }));
  say((s.lines || []).concat([{ who: 'choice', t: '你要怎麼做？', choices: opts }]));
}
function startWavesStep(r, s) {
  const n = curNode(r); let w = 0; const tag = s.id;
  const go = () => { w++; if (w > 3) { WAVES[tag] = null; toast('撐過了三波', 'red'); advanceStep(r); return; } toast(`第 ${w} 波`); const types = s.enemies;
    WAVES[tag] = go; spawnWave(tag, types[(w - 1) % types.length], 2 + w, P.x, P.y, go); spawnWave(tag, pick(types), 1 + w, P.x, P.y, go); };
  WAVES[tag] = () => { }; const start = () => { banner(n.t, '撐過三波'); go(); };
  if (n.lines && !(S.linesShown || (S.linesShown = {}))['w' + n.id]) { S.linesShown['w' + n.id] = 1; say(n.lines, start); } else start();
}
// ◎救援：決定去救之後 3 分鐘內要趕到並打退追兵
const RESCUE_DEF = {
  rival: { target: { x: 600, y: 5720 }, n: '林間空地', foes: ['hunter', 'hunter', 'hunter', 'hunter', 'hunter'] },
  village: { target: 'chief', n: '落霞村', foes: ['pirate', 'pirate', 'hunter', 'pirate_xbow', 'cultist', 'pirate'] },
};
let RESC = null;
function rescueTarget(id) { const t = RESCUE_DEF[id].target; return typeof t === 'string' ? PLACES[t] : t; }
function runRescue(r, s) {
  S.rescue = S.rescue || {}; const id = s.id;
  if (id === 'rival') {
    const who = S.liuSpared ? 'liu' : S.tiebaSpared ? 'tieba' : S.gusouSpared ? 'gusou' : null;
    if (!who) { say([{ who: 'narr', t: '林間有一行血跡，盡頭是一灘乾掉的血和一截斷劍。追兵早就走了，被追的人……也不在了。' }, { who: 'narr', t: '你忽然想起，第一章那些敗在你手下的人，你一個也沒有留。' }], () => { S.rescue.rival = 'none'; advanceStep(r); saveGame(); }); return; }
    const N = { liu: '柳無痕', tieba: '鐵霸', gusou: '寒江孤叟' }[who];
    say([{ who: 'narr', t: `樹幹上刻著一個暗號──是${N}的記號。旁邊用血寫著兩個字：「救我」。` }, { who: 'narr', t: '血跡往西邊延伸，遠處隱約傳來兵刃相交的聲音。追兵不只一個。' },
      { who: 'choice', t: `${N}當年敗在你手下，你饒了他一命。現在他被人追殺。`, choices: [
        { label: '立刻去救（3 分鐘內趕到）', fn: () => startRescue(r, 'rival', who) },
        { label: '這是他的命，不救', alt: true, fn: () => { S.rescue.rival = 'ignored'; addKarma(-5); say([{ who: 'narr', t: '你轉身離開。身後的兵刃聲，過了很久才停。' }], () => { advanceStep(r); saveGame(); }); } }] }]);
    return; }
  if (id === 'village') {
    say([{ who: 'narr', t: '一隻灰色的信鴿落在你肩上，腳上綁著一張紙條，字跡是落霞村長的：' }, { who: 'chief', t: '「黑衣人和海盜一起進村了！見人就搶，村口已經起火──」' }, { who: 'narr', t: '紙條到這裡就斷了。另一邊，海盜的船正趁亂往外海逃，船上載著搶來的貨，還有漁幫被抓走的人。' },
      { who: 'choice', t: '回落霞村，還是繼續追海盜？', choices: [
        { label: '立刻回援落霞村（3 分鐘內趕到）', fn: () => startRescue(r, 'village') },
        { label: '繼續追擊海盜', alt: true, fn: () => { S.rescue.village = 'ignored'; addRep({ village: -25, fishers: 20 }); gainRes('silver', 500); gainRes('page', 6);
          say([{ who: 'narr', t: '你追上海盜船，救回了漁幫的人，奪回了貨。' }, { who: 'narr', t: '三天後你回到落霞村。村口的老槐樹燒成了炭，村長站在廢墟邊，沒有看你。' }], () => { advanceStep(r); saveGame(); }); } }] }]);
  }
}
function startRescue(r, id, who) {
  const T = rescueTarget(id); RESC = { r, id, who, t: 180, started: false }; banner('◎ 救援', `3 分鐘內趕到${RESCUE_DEF[id].n}`); toast('救援開始：地圖上的紅圈就是目標', 'red');
}
function tickRescue(dt) {
  if (!RESC) return; const R = RESC; R.t -= dt; const T = rescueTarget(R.id);
  if (!R.started && dist(P, T) < 360) { R.started = true; const D = RESCUE_DEF[R.id];
    if (R.id === 'rival') { const N = { liu: 'liu', tieba: 'tieba', gusou: 'gusou' }[R.who]; R.ally = { x: T.x + 40, y: T.y - 20, npc: N }; }
    for (const k of D.foes) { const e = spawnEnemy(k, T.x + rnd(-200, 200), T.y + rnd(-200, 200), null, { elite: false }); e.tag = 'rescue'; e.aggro = true; }
    WAVES.rescue = () => rescueEnd(true); toast('打退追兵！', 'red'); }
  if (R.t <= 0) rescueEnd(false);
}
function rescueEnd(ok) {
  const R = RESC; if (!R) return; RESC = null; delete WAVES.rescue; E = E.filter(e => e.tag !== 'rescue' || !e.dead); S.rescue = S.rescue || {};
  if (R.id === 'rival') {
    if (ok) { S.rescue.rival = R.who === 'liu' ? 'saved_liu' : 'saved'; addKarma(10);
      const L = { liu: [{ who: 'liu', t: '……你來了。' }, { who: 'liu', t: '追我的人用的是崑崙劍法。我欠你兩條命了。……我跟你回青崖，以後你去哪，我就去哪。' }],
        tieba: [{ who: 'tieba', t: '哈哈哈！好小子，又被你救一回！老子講規矩，這份情一定還！' }, { who: 'narr', t: '鐵霸塞給你一包碎銀和幾頁刀譜，扛著刀往黃沙的方向走了。' }],
        gusou: [{ who: 'gusou', t: '……魚，又讓你釣上來一回。' }, { who: 'narr', t: '孤叟從蓑衣裡摸出一塊千年寒鐵丟給你，轉身走進了霧裡。' }] }[R.who];
      if (R.who === 'tieba') { gainRes('silver', 600); gainRes('page', 8); } if (R.who === 'gusou') { gainRes('frost', 3); gainRes('page', 6); }
      if (R.who === 'liu') { S.bond = S.bond || {}; S.bond.liu = 1; toast('柳無痕跟你回了青崖小築', 'red'); }
      say(L, () => { advanceStep(R.r); saveGame(); }); }
    else { S.rescue.rival = 'lost'; say([{ who: 'narr', t: '你趕到時，林間空地上只剩一攤血和斷掉的兵器。追兵走了，被追的人也不在了。' }], () => { advanceStep(R.r); saveGame(); }); }
  }
  if (R.id === 'village') {
    if (ok) { S.rescue.village = 'saved'; addRep({ village: 25 }); addKarma(10); say([{ who: 'chief', t: '恩人……你又救了落霞村一次。村口的槐樹燒了半邊，人都還在，人都還在啊！' }], () => { advanceStep(R.r); saveGame(); }); }
    else { S.rescue.village = 'lost'; addRep({ village: -10 }); say([{ who: 'narr', t: '你趕到時，落霞村已經燒了一半。村長坐在客棧門口，手裡抱著一塊燒焦的招牌。' }, { who: 'chief', t: '……你來了啊。來了就好。' }], () => { advanceStep(R.r); saveGame(); }); }
  }
}

/* ---------- 世外高人的考驗 ---------- */
let TRIAL = null;
function startTrial(r, id) {
  if (TRIAL) return;
  if (id === 'langu') { TRIAL = { id, r, t: 60, pot: S.potions, gu: 0 }; banner('藍姑的考驗', '毒霧中撐過 60 秒，不能吃藥'); toast('毒霧湧上來了！不能用金創藥', 'red'); }
  if (id === 'diaosou') { const k = waveSlow(); TRIAL = { id, r, n: 0, hits: 0, nextT: 1.5, waves: [], cx: PLACES.diaosou.x, cy: PLACES.diaosou.y, k }; banner('東海釣叟的考驗', `只靠閃身躲過 20 道浪潮（被打中 3 次失敗）${k < 1 ? `　浪裡蛟第 ${S.books.langlijiao.lv} 重：浪速 ${Math.round(k * 100)}%` : ''}`); }
}
function tickTrial(dt) {
  if (!TRIAL) return; const T = TRIAL;
  if (T.id === 'langu') { T.t -= dt;
    if (S.potions < T.pot) return trialEnd(false, '你吃了藥。藍姑冷冷地看著你：「毒，要用身體去記。改天再來。」');
    P.hp -= maxHp() * 0.011 * dt * (1 - poisonRes()); if (Math.random() < dt * 1.5) burst(P.x + rnd(-30, 30), P.y - 20, '#6a8a3a', 2);
    T.gu -= dt; if (T.gu <= 0) { T.gu = 9; for (let k = 0; k < 3; k++) { const e = spawnEnemy('gu', P.x + rnd(-250, 250), P.y + rnd(-250, 250), null, { elite: false }); e.aggro = true; e.tag = 'trial'; } }
    if (P.hp < maxHp() * 0.05) return trialEnd(false, '你眼前一黑，倒在毒霧裡。醒來時，藍姑正往你嘴裡灌解藥：「還差得遠。」');
    if (T.t <= 0) return trialEnd(true); }
  if (T.id === 'diaosou') {
    T.nextT -= dt; if (T.nextT <= 0 && T.n + T.waves.length < 20) { T.nextT = Math.max(.42, .8 - T.n * .004) / T.k; const a = pick([0, Math.PI / 2, Math.PI, -Math.PI / 2]) + rnd(-.3, .3); T.waves.push({ ang: a, d: -320, hit: false }); }
    for (const w of T.waves) { w.d += 520 * T.k * dt; const ox = P.x - T.cx, oy = P.y - T.cy, along = ox * Math.cos(w.ang) + oy * Math.sin(w.ang);
      if (!w.hit && Math.abs(along - w.d) < 22 && P.dodgeT <= 0 && P.iframe <= 0) { w.hit = true; T.hits++; hurtPlayer(maxHp() * .08, P.x - Math.cos(w.ang) * 40, P.y - Math.sin(w.ang) * 40); fxText(P.x, P.y - 60, `被浪打中 ${T.hits}/3`, '#33536a', 16); if (T.hits >= 3) return trialEnd(false, '第三道浪把你掀進海裡。釣叟大笑：「浪是追不上的，只能跟。再來！」'); } }
    const done = T.waves.filter(w => w.d > 320); T.n += done.length; T.waves = T.waves.filter(w => w.d <= 320);
    if (T.n >= 20) return trialEnd(true); }
}
// 浪裡蛟練得越高，浪越慢：每重 −5%，最慢 45%
function waveSlow() { const b = S.books.langlijiao; return b ? Math.max(.45, 1 - .05 * (b.lv - 1)) : 1; }
function trialEnd(ok, msg) { const T = TRIAL; TRIAL = null; E = E.filter(e => e.tag !== 'trial'); if (ok) { toast('考驗通過！', 'red'); closeupFx('考驗通過'); advanceStep(T.r); } else { P.hp = Math.max(P.hp, maxHp() * .3); say([{ who: 'narr', t: msg }]); } }

/* ---------- 毒霧、海霧 ---------- */
function poisonRes() { return Math.min(.8, (GS.pres || 0) + (setN('wudu') >= 2 ? .3 : 0) + titleBonus('pres')); }
let fogTipT = 0, ambushT = 40;
function tickCh2Weather(dt) {
  const reg = curRegion(), w = curWeather();
  if (w === '毒霧' && !TRIAL && !(setN('wudu') >= 6) && !(S.buffs.bidu > 0) && !P.dead) { S.stats.fog = (S.stats.fog || 0) + dt;
    const rate = 0.006 * (S.bidu ? .5 : 1) * (1 - poisonRes()); if (P.hp > maxHp() * .15) P.hp -= maxHp() * rate * dt;
    fogTipT -= dt; if (fogTipT <= 0 && P.hp < maxHp() * .4) { fogTipT = 30; toast('毒霧在啃你的氣血：避毒香、避毒丹或五毒套擋得住'); } }
  else if (w === '毒霧') S.stats.fog = (S.stats.fog || 0) + dt;
  if (w === '海霧' && reg === 'sea' && !BOSSFIGHT && !SIEGE) { ambushT -= dt; if (ambushT <= 0) { ambushT = rnd(35, 55); const a = rnd(0, TAU); for (let k = 0; k < 2; k++) { const e = spawnEnemy(pick(['pirate', 'water_ghost']), P.x + Math.cos(a) * 280 + rnd(-40, 40), P.y + Math.sin(a) * 280 + rnd(-40, 40), null, {}); e.aggro = true; } toast('海霧裡摸上來兩個人影！'); } }
}

/* ---------- 守山戰 ---------- */
let SIEGE = null;
function siegeCore() { return { x: PLACES.base.x, y: PLACES.base.y + 40 }; }
function tickSiege(dt) {
  if (!SIEGE) { if ((S.siegePending || 0) > 0 && !BOSSFIGHT && !RESC && !TRIAL && !dlg && dist(P, PLACES.base) < 1100) startSiege(); return; }
  const G = SIEGE, C = siegeCore(), L = S.bld.array || 0;
  for (const e of E) if (!e.dead && e.tag === 'siege') { e.homeX = C.x; e.homeY = C.y; e.wx = C.x + rnd(-60, 60); e.wy = C.y + rnd(-40, 40); if (dist(e, C) < 150) { G.hp -= e.dmg * .35 * dt; if (Math.random() < dt * 2) burst(C.x + rnd(-40, 40), C.y - 30, CIN, 2); } }
  if (L > 0) { G.boltT -= dt; if (G.boltT <= 0) { G.boltT = 3 - L * .35; const tg = E.filter(e => !e.dead && e.tag === 'siege' && dist(e, C) < 520).sort((a, b) => dist(a, C) - dist(b, C))[0];
    if (tg) { hurtEnemy(tg, 30 + 26 * L, { attr: '剛', src: 'skill', ang: Math.atan2(tg.y - C.y, tg.x - C.x), kb: 120 }); FX.push({ type: 'slash', x1: C.x, y1: C.y - 60, x2: tg.x, y2: tg.y - 20, t: 0, life: .3, col: GOLD }); } } }
  if (G.hp <= 0) return siegeEnd(false);
}
function startSiege() {
  const L = S.bld.array || 0; SIEGE = { hp: 500 + 350 * L, max: 500 + 350 * L, wave: 0, boltT: 2 };
  banner('守山戰', L ? `護山大陣 ${L} 級：城防 ${SIEGE.max}，大陣會自動反擊` : '護山大陣還沒修建──城防很薄，大陣也不會反擊'); sfx('quest'); music('boss');
  say([{ who: 'master', t: '徒兒，回來得正好。血影教的餘黨勾結了南方的人，要趁你不在攻山。守住大陣，別讓他們碰到小築！' }], siegeWave);
}
function siegeWave() { const G = SIEGE; if (!G) return; G.wave++; if (G.wave > 3) return siegeEnd(true); const C = siegeCore(); toast(`守山戰第 ${G.wave} 波`, 'red');
  const pool = ['cultist', 'hexer', 'pirate', 'miao_warrior', 'pirate_xbow', 'blowdart', 'hunter'];
  for (let k = 0; k < 4 + G.wave * 2; k++) { const a = rnd(0, TAU), d = rnd(650, 800); const e = spawnEnemy(pick(pool), C.x + Math.cos(a) * d, C.y + Math.sin(a) * d * .7, null, { elite: G.wave === 3 && k === 0 }); e.tag = 'siege'; e.homeX = C.x; e.homeY = C.y; }
  WAVES.siege = siegeWave; }
function siegeEnd(ok) { const G = SIEGE; SIEGE = null; delete WAVES.siege; E = E.filter(e => e.tag !== 'siege'); S.siegePending = Math.max(0, (S.siegePending || 0) - 1); music(curRegion());
  if (ok) { S.siegeWon = (S.siegeWon || 0) + 1; gainRes('silver', 500 * S.siegeWon); gainRes('page', 6); banner('守住了', '青崖小築安然無恙'); }
  else { const b = BORDER.filter(k => S.bld[k] > 0 && k !== 'hall'); const k = b.length ? pick(b) : null; if (k) { S.bldDmg = S.bldDmg || {}; S.bldDmg[k] = 1; } banner('城防被破', k ? `${BUILDINGS[k].n}受損，要回「建設」修理` : '小築受了點損傷'); }
  saveGame(); }
function repairCost(k) { const l = Math.max(1, S.bld[k]); return { wood: 40 * l, iron: 15 * l, silver: 120 * l }; }
function repairBld(k) { if (!S.bldDmg || !S.bldDmg[k]) return; const c = repairCost(k); if (!canPay(c)) return toast('材料不夠'); pay(c); delete S.bldDmg[k]; toast(`${BUILDINGS[k].n}修好了`, 'red'); saveGame(); }
const bldBroken = k => !!(S.bldDmg && S.bldDmg[k]);

/* ---------- 知己 ---------- */
function bondCands() { return Object.keys(BONDS).filter(k => BONDS[k].g === S.gender && BONDS[k].unlock(S)); }
function bondPts(k) { S.bondPts = S.bondPts || {}; return S.bondPts[k] || 0; }
function addBond(k, n) { S.bondPts = S.bondPts || {}; S.bondPts[k] = clamp((S.bondPts[k] || 0) + n, 0, 100); if (n > 0) fxText(P.x, P.y - 70, `${BONDS[k].n} 好感 +${n}`, '#b0607a', 15); }
function bondEvIdx(k) { S.bondEv = S.bondEv || {}; return S.bondEv[k] || 0; }
function bondTalk(k) {
  const B = BONDS[k], i = bondEvIdx(k);
  if (i < B.ev.length && bondPts(k) >= BOND_NEED[i]) { const lines = B.ev[i].map(l => l.who === 'choice' ? { who: 'choice', t: l.t || '你要怎麼回應？', choices: l.choices.map(c => ({ label: c.label, alt: c.alt, fn: () => { addBond(k, c.b); if (c.reward) giveReward(c.reward); S.bondEv[k] = i + 1; say(c.after || [], saveGame); } })) } : l);
    say(lines); return; }
  const more = i >= B.ev.length ? '（2b 的故事待續）' : `（好感 ${BOND_NEED[i]} 時有新的故事）`;
  say([{ who: k, t: B.line }, { who: 'narr', t: `好感 ${bondPts(k)}　${more}` }]);
}
function bondGift(k, res) { const B = BONDS[k]; S.bondGift = S.bondGift || {}; if (S.bondGift[k] === dayKey()) return toast('今天已經送過禮了'); const need = res === 'silver' ? 200 : RES_MAIN.includes(res) ? 10 : 2; if ((S.res[res] || 0) < need) return toast(`${RES[res].n}不夠（要 ${need}）`);
  S.res[res] -= need; S.bondGift[k] = dayKey(); const liked = B.likes.includes(res); addBond(k, liked ? 6 : 2); toast(liked ? `${B.n}很喜歡` : `${B.n}收下了`); saveGame(); }
function setCompanion(k) { S.companion = S.companion === k ? null : k; if (S.companion) { COMP.x = P.x - 40; COMP.y = P.y; toast(`${BONDS[k].n}與你同行`); } else toast('同行結束'); }
const COMP = { x: 0, y: 0, face: 0, atkT: 0, bondT: 90, moving: 0 };
function tickCompanion(dt) {
  const k = S.companion; if (!k || P.dead) return; if (!bondCands().includes(k)) { S.companion = null; return; }
  const d = dist(COMP, P); if (d > 700 || curRegion() === 'secret' && regionAt(COMP.x, COMP.y) !== 'secret') { COMP.x = P.x - 50; COMP.y = P.y + 10; }
  const tx = P.x - Math.cos(P.face) * 60, ty = P.y - Math.sin(P.face) * 60 + 10, dd = Math.hypot(tx - COMP.x, ty - COMP.y);
  COMP.moving = 0; if (dd > 30) { const sp = Math.min(dd * 3, 320); COMP.x += (tx - COMP.x) / dd * sp * dt; COMP.y += (ty - COMP.y) / dd * sp * dt; COMP.face = Math.atan2(ty - COMP.y, tx - COMP.x); COMP.moving = 1; }
  COMP.atkT -= dt; if (COMP.atkT <= 0) { const e = nearestEnemy(300, COMP); if (e) { COMP.atkT = 1.4; COMP.face = Math.atan2(e.y - COMP.y, e.x - COMP.x); hurtEnemy(e, wDmg(S.main) * .55, { src: 'ally', ang: COMP.face, kb: 60 }); arcFx(COMP.x, COMP.y, COMP.face, 1.4, 90, '#b0607a', 7, .2); } else COMP.atkT = .4; }
  COMP.bondT -= dt; if (COMP.bondT <= 0) { COMP.bondT = 90; addBond(k, 1); }
}

/* ---------- 白蛇、撒網 ---------- */
function spareSnake() { S.snakeSpare = (S.snakeSpare || 0) + 1; S.snakeT = Date.now(); if (S.snakeSpare >= 3) encounter('lingshe'); else toast(`白蛇看了你一眼，游走了（${S.snakeSpare}/3）`); saveGame(); }
function castNet() { if (S.encounters.yuwang) return toast('漁幫：「多謝幫忙，網今天夠了！」'); if (P.netT > 0) return toast('網還沒收回來'); P.netT = 15; S.netN = (S.netN || 0) + 1; gainRes(pick(['silver', 'bone', 'herb']), rint(3, 8)); if (S.netN >= 10) encounter('yuwang'); else toast(`幫漁幫撒網（${S.netN}/10）`); }

/* ---------- 每幀 ---------- */
function tickCh2(dt) {
  if (!S || PAUSE_STORY) return; P.choiceCd = Math.max(0, (P.choiceCd || 0) - dt); P.nightMsg = Math.max(0, (P.nightMsg || 0) - dt); P.netT = Math.max(0, (P.netT || 0) - dt);
  if (S.buffs.bidu > 0) S.buffs.bidu -= dt;
  tickRescue(dt); tickTrial(dt); tickCh2Weather(dt); tickSiege(dt); tickCompanion(dt);
  if (S.ch2 && S.rep.fishers >= 20 && !S.disciples.ahai) unlockDisciple('ahai');
}

/* ---------- 頭目：蠱母婆婆、海天霸 ---------- */
Object.assign(BOSS_ACTS, {
  gumu: [['gu', 'fogzone', 'gu'], ['flood', 'jars', 'fogzone', 'gu'], ['fogzone', 'gu', 'flood']],
  haitianba: [['twin', 'anchor', 'twin'], ['tide', 'pirates', 'anchor', 'twin'], ['anchor', 'twin', 'tide']],
});
Object.assign(BOSS_DROP, { gumu: { gear: ['acc', 'gumu_staff'], silver: 2000, page: 24, xiu: 2600, guwangke: 3 }, haitianba: { gear: ['acc', 'shark_fang'], silver: 2400, page: 24, xiu: 2600, shachi: 3 } });
const lotusPads = F => (ARENAS.gumu.lotus || []).map(([dx, dy]) => ({ x: F.cx + dx, y: F.cy + dy, r: 56 }));
const onPad = F => lotusPads(F).some(p => Math.hypot(P.x - p.x, P.y - p.y) < p.r);
const _startUlt = startUlt; startUlt = function (b) {
  if (b.bid === 'gumu') { b.act = { type: 'swarm', t: 0, cyc: 0, phase: 'tele2', tt: 0 }; toast('萬蠱噬心──站上蓮葉！', 'red'); return; }
  if (b.bid === 'haitianba') { b.act = { type: 'bigwave', t: 0, n: 0, w: null }; toast('怒海狂鯊──閃身穿過浪頭！', 'red'); return; }
  _startUlt(b);
};
const _startBossAct = startBossAct; startBossAct = function (b, type) {
  const F = BOSSFIGHT, a = { type, t: 0, phase: 'tele' };
  if (type === 'gu' || type === 'jars' || type === 'pirates') { a.tele = .5; b.act = a; return; }
  if (type === 'fogzone') { a.tele = .9; a.marks = []; for (let i = 0; i < (b.phase >= 2 ? 4 : 3); i++) a.marks.push({ x: clamp(P.x + rnd(-200, 200), F.cx - F.r + 60, F.cx + F.r - 60), y: clamp(P.y + rnd(-200, 200), F.cy - F.r + 60, F.cy + F.r - 60), r: 80 }); a.marks[0].x = P.x; a.marks[0].y = P.y; b.act = a; return; }
  if (type === 'flood') { a.tele = 1.3; b.act = a; toast('毒水要漲了！站上蓮葉！', 'red'); return; }
  if (type === 'twin') { a.tele = .35; a.k = 0; b.act = a; return; }
  if (type === 'anchor') { a.tele = .6; a.ang = Math.atan2(P.y - b.y, P.x - b.x); a.lines = [{ x: b.x, y: b.y, ang: a.ang, len: 560 }]; b.act = a; return; }
  if (type === 'tide') { a.tele = .8; b.act = a; toast('漲潮了！', 'red'); return; }
  _startBossAct(b, type);
};
const _runBossAct = runBossAct; runBossAct = function (b, dt) {
  const a = b.act, F = BOSSFIGHT;
  if (a.type === 'swarm') { a.t += dt;
    if (a.phase === 'tele2' && a.t >= 1.4) { a.phase = 'hit'; a.t = 0; if (!onPad(F)) { hurtPlayer(b.dmg * 1.5, b.x, b.y); poisonPlayer(3, b.dmg * .15); } ringFx(F.cx, F.cy, 20, F.r, '#5a7a2a', .5, 18); doShake(10);
      for (let k = 0; k < 3; k++) { const e = spawnEnemy('gu', F.cx + rnd(-F.r, F.r) * .8, F.cy + rnd(-F.r, F.r) * .8, null, { elite: false }); e.aggro = true; e.tag = 'bossadd'; } a.cyc++; }
    if (a.phase === 'hit' && a.t >= .7) { if (a.cyc >= 3) b.act = null; else { a.phase = 'tele2'; a.t = 0; } } return; }
  if (a.type === 'bigwave') { a.t += dt;
    if (!a.w) { if (a.n >= 4) { b.act = null; return; } const ang = a.n % 2 ? Math.PI : 0; a.w = { ang: ang + rnd(-.25, .25), d: -F.r - 40, tele: 1.0, hit: false }; a.n++; }
    const w = a.w; if (w.tele > 0) { w.tele -= dt; return; }
    w.d += 600 * dt; const ox = P.x - F.cx, oy = P.y - F.cy, along = ox * Math.cos(w.ang) + oy * Math.sin(w.ang);
    if (!w.hit && Math.abs(along - w.d) < 34 && P.dodgeT <= 0 && P.iframe <= 0) { w.hit = true; hurtPlayer(b.dmg * 1.6, P.x - Math.cos(w.ang) * 60, P.y - Math.sin(w.ang) * 60); P.x += Math.cos(w.ang) * 90; P.y += Math.sin(w.ang) * 90; }
    if (w.d > F.r + 40) a.w = null; return; }
  if (a.phase === 'tele' && ['gu', 'jars', 'pirates', 'fogzone', 'flood', 'twin', 'anchor', 'tide'].includes(a.type)) { a.t += dt; if (a.t < a.tele) return; a.t = 0; a.phase = 'go';
    if (a.type === 'gu') { for (let k = 0; k < 4; k++) { const e = spawnEnemy('gu', b.x + rnd(-90, 90), b.y + rnd(-90, 90), null, { elite: false }); e.aggro = true; e.tag = 'bossadd'; } b.act = null; return; }
    if (a.type === 'jars') { for (let k = 0; k < 2; k++) { const e = spawnEnemy('gujar', F.cx + rnd(-F.r, F.r) * .7, F.cy + rnd(-F.r, F.r) * .7, null, { elite: false }); e.aggro = true; e.tag = 'bossadd'; } b.act = null; return; }
    if (a.type === 'pirates') { for (let k = 0; k < 3; k++) { const e = spawnEnemy(k ? 'pirate' : 'pirate_xbow', F.cx + rnd(-F.r, F.r) * .8, F.cy - F.r * .8, null, { elite: false }); e.aggro = true; e.tag = 'bossadd'; } b.act = null; return; }
    if (a.type === 'fogzone') { F.zones = F.zones || []; for (const m of a.marks) { if (Math.hypot(P.x - m.x, P.y - m.y) < m.r) hurtPlayer(b.dmg * .7, m.x, m.y); F.zones.push({ x: m.x, y: m.y, r: m.r, t: 6 }); } b.act = null; return; }
    if (a.type === 'flood') { F.flood = 3.5; F.floodT = 0; b.act = null; return; }
    if (a.type === 'tide') { F.tide = 4; for (let k = 0; k < 2; k++) { const e = spawnEnemy('pirate', F.cx + rnd(-F.r, F.r) * .7, F.cy + F.r * .7, null, { elite: false }); e.aggro = true; e.tag = 'bossadd'; } b.act = null; return; }
    if (a.type === 'anchor') { shootE(b.x, b.y, a.ang, 560, b.dmg * .9, { kind: 'anchor', r: 22, life: 1, src: b }); later(1, () => { if (BOSSFIGHT) shootE(b.x + Math.cos(a.ang) * 560, b.y + Math.sin(a.ang) * 560, a.ang + Math.PI, 560, b.dmg * .6, { kind: 'anchor', r: 22, life: 1 }); }); b.act = null; sfx('heavy'); return; }
    if (a.type === 'twin') { a.phase = 'tele'; a.tele = .2; const ang = Math.atan2(P.y - b.y, P.x - b.x); b.x += Math.cos(ang) * 50; b.y += Math.sin(ang) * 50; if (dist(P, b) < b.r + 85) hurtPlayer(b.dmg * .75, b.x, b.y); arcFx(b.x, b.y, ang + (a.k ? .4 : -.4), 2, b.r + 85, '#2a3a4a', 12, .22); sfx('swing'); a.k++; if (a.k >= 2) b.act = null; return; }
  }
  _runBossAct(b, dt);
};
const _arenaMechanics = arenaMechanics; arenaMechanics = function (b, F, dt) {
  _arenaMechanics(b, F, dt);
  if (F.zones) { for (const z of F.zones) z.t -= dt; F.zones = F.zones.filter(z => z.t > 0); const z = F.zones.find(z => Math.hypot(P.x - z.x, P.y - z.y) < z.r); if (z && (F.zoneT = (F.zoneT || 0) - dt) <= 0) { F.zoneT = .5; hurtPlayer(maxHp() * .035, z.x, z.y); poisonPlayer(2, maxHp() * .01); } }
  if (F.flood > 0) { F.flood -= dt; F.floodT -= dt; if (F.floodT <= 0) { F.floodT = .5; if (!onPad(F) && P.dodgeT <= 0) { hurtPlayer(maxHp() * .05); fxText(P.x, P.y - 50, '毒水', '#5a7a2a', 15); } } }
  if (F.tide > 0) { F.tide -= dt; const dx = P.x - F.cx, dy = P.y - F.cy, d = Math.hypot(dx, dy) || 1; if (P.dodgeT <= 0) { P.x += dx / d * 70 * dt; P.y += dy / d * 70 * dt; } P.slowT = Math.max(P.slowT || 0, .3); if (d > F.r - 30 && (F.tideT = (F.tideT || 0) - dt) <= 0) { F.tideT = .6; hurtPlayer(maxHp() * .05); fxText(P.x, P.y - 50, '落海', '#33536a', 15); } }
};
const _bossDown = bossDown; bossDown = function (b) {
  if (b.bid !== 'gumu' && b.bid !== 'haitianba') return _bossDown(b);
  burst(b.x, b.y, CIN, 30); burst(b.x, b.y, INK, 30); doShake(16); const practice = b.practice, bid = b.bid; endBossFight(true);
  if (practice) { toast('演武結束'); return; }
  S.bossDead[bid] = true; const D = BOSS_DROP[bid]; for (const k of ['silver', 'page', 'xiu', 'guwangke', 'shachi']) if (D[k]) gainRes(k, D[k]);
  addItem(makeItem(D.gear[0], 3, { unique: D.gear[1] })); S.codex.gear[D.gear[1]] = 1; const L = BOSS_LINES[bid];
  const after = () => { questBoss(bid); S.siegePending = (S.siegePending || 0) + 1; later(4, () => { toast('青崖小築傳來急報：血影餘黨要趁虛攻山！回小築守住大陣', 'red'); }); saveGame(); };
  say(L.after.concat([{ who: 'choice', t: `${BOSS[bid].short}倒在你面前。你要如何處置？`, choices: [
    { label: '饒他一命（俠義 +10）', fn: () => { addKarma(10); S[bid + 'Spared'] = true; say(L.spare, after); } },
    { label: '斬草除根（魔性 +10）', alt: true, fn: () => { addKarma(-10); S[bid + 'Spared'] = false; gainRes('silver', 800); say(L.kill, after); } }] }]));
};

/* ---------- 新怪物的招式 ---------- */
// 礁岩蟹：正面硬殼、側面加倍；水鬼：潛水伏擊；毒蟾：爆出毒霧
function crabMul(e, o) { if (!e.def.shell) return 1; const a = o && o.ang !== undefined ? o.ang + Math.PI : Math.atan2(P.y - e.y, P.x - e.x); const front = Math.abs(angDiff(a, e.face)) < 1.0; if (front) { if (Math.random() < .3) fxText(e.x, e.y - 40, '硬殼', '#8a4a3a', 12); return .45; } if (Math.random() < .3) fxText(e.x, e.y - 40, '側擊', GOLD, 12); return 2; }
function ambushTick(e) { if (!e.def.ambush || e.surfaced) return; e.ghost = true; if (dist(e, P) < 230) { e.ghost = false; e.surfaced = true; e.aggro = true; burst(e.x, e.y, '#9ab8c8', 14); fxText(e.x, e.y - 40, '水鬼！', '#33536a', 14); e.state = 'wind'; e.t = .25; e.dashing = true; e.face = Math.atan2(P.y - e.y, P.x - e.x); } }
function namedSpecial2(e, dt, dx, dy, dd) {
  const sp = NAMED[e.named].special;
  if (sp === 'toadride' && e.spT <= 0 && dd < 380) { e.spT = 5; const tx = P.x, ty = P.y; FX.push({ type: 'hazard', kind: 'poison', x: tx, y: ty, r: 80, t: 0, life: 4, tick: 0, dmg: e.dmg * .2 }); later(.5, () => { if (!e.dead) { e.x = tx; e.y = ty; if (dist(P, e) < 90) hurtPlayer(e.dmg, e.x, e.y, e); ringFx(tx, ty, 10, 90, '#5a7a3a', .4, 12); doShake(6); } }); toast('五毒童子騎著大蟾跳了過來！'); }
  if (sp === 'snakes' && e.spT <= 0) { e.spT = 7; for (let k = 0; k < 3; k++) { const m = spawnEnemy('snake', e.x + rnd(-60, 60), e.y + rnd(-60, 60), e.camp, { elite: false }); m.aggro = true; m.parent = e; } fxText(e.x, e.y - 60, '群蛇', JADE, 15);
    if (!e.persuaded && e.hp < e.maxHp * .5 && !dlg) { e.persuaded = true; say([{ who: 'narr', t: '阿蘿喘著氣退到蛇群後面，咬著嘴唇盯著你。' }, { who: 'choice', t: '她看起來不想再打了。', choices: [
      { label: '勸她收手（俠義 +5）', fn: () => { addKarma(5); addRep({ wudu: 10 }); e.hp = 1; hurtEnemy(e, 10, { src: 'skill' }); say([{ who: 'narr', t: '阿蘿收起蛇笛：「……我只是想護住寨子。」她摘下手上的銀蛇鐲丟給你，走進了林子。' }]); } },
      { label: '繼續打', alt: true, fn: () => { } }] }]); } }
  if (sp === 'anchor' && e.spT <= 0 && dd < 460) { e.spT = 4; const a = Math.atan2(dy, dx); shootE(e.x, e.y, a, 480, e.dmg * .9, { kind: 'anchor', r: 20, life: 1.1, src: e }); fxText(e.x, e.y - 60, '甩錨', '#8a6a3a', 14); }
  if (sp === 'glide' && e.spT <= 0 && dd < 360 && e.state === 'move') { e.spT = 3; e.state = 'wind'; e.t = .25; e.dashing = true; }
}
// 金蠶蠱針：打死敵人時，蠱蟲跳到下一個
function jincanJump(e, o) { if (!o || o.book !== 'jincan' || !e.dead) return; const n = E.filter(x => !x.dead && x !== e && dist(x, e) < 320).sort((a, b) => dist(a, e) - dist(b, e))[0]; if (!n) return; const a = Math.atan2(n.y - e.y, n.x - e.x); shoot(e.x, e.y, a, 520, o.dmgBase || wDmg('dart') * 1.5, { attr: '毒', src: 'skill', book: 'jincan', r: 7, life: 1.2, homing: true, kind: 'needle' }); fxText(e.x, e.y - 40, '蠱跳', '#5a7a2a', 13); }

/* ---------- 繪圖 ---------- */
function drawCh2Ground(vis) {
  // 蠱母祭壇的蓮葉、鯊王船甲板（平時也看得到）
  const F = BOSSFIGHT;
  for (const bid of ['gumu', 'haitianba']) { const A = ARENAS[bid], ap = PLACES[A.place]; if (!vis(ap.x, ap.y, A.r + 100)) continue; const cx = F && F.bid === bid ? F.cx : ap.x, cy = F && F.bid === bid ? F.cy : ap.y;
    if (bid === 'haitianba') { g.save(); g.fillStyle = 'rgba(120,88,52,.55)'; g.beginPath(); g.ellipse(cx, cy, A.r + 30, (A.r + 30) * .72, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(60,40,20,.5)'; g.lineWidth = 2; for (let k = -A.r; k < A.r; k += 36) { g.beginPath(); g.moveTo(cx + k, cy - Math.sqrt(Math.max(0, (A.r + 30) ** 2 - k * k)) * .72); g.lineTo(cx + k, cy + Math.sqrt(Math.max(0, (A.r + 30) ** 2 - k * k)) * .72); g.stroke(); } g.restore();
      if (!drawStatic('shipmast', cx, cy - A.r * .55, 150)) { g.fillStyle = '#5a3a20'; g.fillRect(cx - 6, cy - A.r * .55 - 200, 12, 200); } }
    if (bid === 'gumu') drawStatic('gualtar', cx, cy - A.r + 30, 210);
    if (bid === 'gumu') { if (F && F.bid === 'gumu' && F.flood > 0) { g.fillStyle = 'rgba(70,110,40,.35)'; g.beginPath(); g.ellipse(cx, cy, A.r + 20, A.r + 20, 0, 0, TAU); g.fill(); }
      const glow = F && F.bid === 'gumu' && F.boss.act && (F.boss.act.type === 'swarm' || F.boss.act.type === 'flood');
      for (const [dx, dy] of A.lotus) { const x = cx + dx, y = cy + dy; if (!drawStatic('lotus', x, y + 18, 120)) { g.fillStyle = glow ? 'rgba(140,200,110,.95)' : 'rgba(88,130,70,.9)'; g.beginPath(); g.ellipse(x, y, 58, 36, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(40,60,30,.8)'; g.stroke(); } if (glow) { g.strokeStyle = `rgba(220,240,160,${.5 + Math.sin(gameT * 8) * .3})`; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y, 60, 40, 0, 0, TAU); g.stroke(); } } } }
  if (F && F.zones) for (const z of F.zones) { g.fillStyle = `rgba(90,130,40,${.25 + Math.sin(gameT * 5) * .06})`; g.beginPath(); g.arc(z.x, z.y, z.r, 0, TAU); g.fill(); }
  if (F && F.bid === 'gumu' && F.boss.act && F.boss.act.type === 'fogzone' && F.boss.act.phase === 'tele') for (const m of F.boss.act.marks) { g.strokeStyle = 'rgba(90,130,40,.8)'; g.setLineDash([8, 6]); g.lineWidth = 2; g.beginPath(); g.arc(m.x, m.y, m.r, 0, TAU); g.stroke(); g.setLineDash([]); }
  if (F && F.tide > 0) { g.fillStyle = 'rgba(70,110,135,.28)'; g.beginPath(); g.arc(F.cx, F.cy, F.r + 30, 0, TAU); g.fill(); }
  // 守山戰：大陣核心
  if (SIEGE) { const C = siegeCore(); g.strokeStyle = `rgba(160,127,60,${.5 + Math.sin(gameT * 4) * .2})`; g.lineWidth = 3; g.beginPath(); g.ellipse(C.x, C.y, 150, 100, 0, 0, TAU); g.stroke(); }
}
function drawCh2Top(vis) {
  const F = BOSSFIGHT;
  if (F && F.bid === 'haitianba' && F.boss.act && F.boss.act.type === 'bigwave' && F.boss.act.w) { const w = F.boss.act.w, nx = Math.cos(w.ang), ny = Math.sin(w.ang), px = -ny, py = nx;
    const x = F.cx + nx * w.d, y = F.cy + ny * w.d, L = F.r + 60; g.save(); g.lineCap = 'round';
    if (w.tele > 0) { g.strokeStyle = `rgba(51,83,106,${.4 + Math.sin(gameT * 12) * .2})`; g.lineWidth = 4; g.setLineDash([12, 8]); g.beginPath(); g.moveTo(x - px * L, y - py * L); g.lineTo(x + px * L, y + py * L); g.stroke(); g.setLineDash([]); }
    else { g.strokeStyle = 'rgba(70,110,135,.75)'; g.lineWidth = 46; g.beginPath(); g.moveTo(x - px * L, y - py * L); g.lineTo(x + px * L, y + py * L); g.stroke(); g.strokeStyle = 'rgba(240,248,250,.9)'; g.lineWidth = 10; g.beginPath(); g.moveTo(x + nx * 18 - px * L, y + ny * 18 - py * L); g.lineTo(x + nx * 18 + px * L, y + ny * 18 + py * L); g.stroke(); }
    g.restore(); }
  if (TRIAL && TRIAL.id === 'diaosou') { const T = TRIAL; g.save(); g.lineCap = 'round'; for (const w of T.waves) { const nx = Math.cos(w.ang), ny = Math.sin(w.ang), px = -ny, py = nx, x = T.cx + nx * w.d, y = T.cy + ny * w.d, L = 360;
      g.strokeStyle = 'rgba(70,110,135,.55)'; g.lineWidth = 26; g.beginPath(); g.moveTo(x - px * L, y - py * L); g.lineTo(x + px * L, y + py * L); g.stroke(); g.strokeStyle = 'rgba(245,250,252,.85)'; g.lineWidth = 6; g.beginPath(); g.moveTo(x + nx * 10 - px * L, y + ny * 10 - py * L); g.lineTo(x + nx * 10 + px * L, y + ny * 10 + py * L); g.stroke(); } g.restore(); }
  if (TRIAL && TRIAL.id === 'langu') { const gr = g.createRadialGradient(P.x, P.y, 60, P.x, P.y, 420); gr.addColorStop(0, 'rgba(90,130,40,0)'); gr.addColorStop(1, 'rgba(90,130,40,.35)'); g.fillStyle = gr; g.fillRect(P.x - 420, P.y - 420, 840, 840); }
  // 同行的知己
  if (S.companion && !P.dead) { const k = S.companion; if (!drawSprActor(g, COMP.x, COMP.y, COMP.face, k, { t: gameT, moving: COMP.moving, alpha: .92 })) drawHumanCtx(g, COMP.x, COMP.y, COMP.face, Object.assign({ weapon: 'sword' }, NPCS[k].look), { spr: k, t: gameT, alpha: .92 }); }
  // 救援中的盟友
  if (RESC && RESC.ally) { const a = RESC.ally; if (!drawSprActor(g, a.x, a.y, Math.PI / 2, a.npc, { t: gameT })) drawHumanCtx(g, a.x, a.y, Math.PI / 2, Object.assign({ weapon: 'sword' }, NPCS[a.npc].look), { spr: a.npc, t: gameT }); }
}
function drawCh2Screen() {
  // 海霧、毒霧的畫面層
  const w = curWeather(); if (w === '海霧') { const [px, py] = W2S(P.x, P.y); const gr = g.createRadialGradient(px, py, 120 * ZOOM, px, py, 520 * ZOOM); gr.addColorStop(0, 'rgba(225,232,234,0)'); gr.addColorStop(1, 'rgba(225,232,234,.82)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
  if (w === '毒霧') { g.fillStyle = 'rgba(110,140,60,.12)'; g.fillRect(0, 0, W, H); }
  // 守山戰城防、救援倒數、考驗進度
  const bar = (label, v, col) => { const bw = Math.min(360, W * .5), x = (W - bw) / 2, y = 120; g.fillStyle = 'rgba(29,26,23,.55)'; g.fillRect(x - 2, y - 2, bw + 4, 14); g.fillStyle = col; g.fillRect(x, y, bw * clamp(v, 0, 1), 10); g.font = `14px ${FONT}`; g.textAlign = 'center'; g.fillStyle = INK; g.fillText(label, W / 2, y - 6); };
  if (SIEGE) bar(`守山戰・第 ${SIEGE.wave} 波　城防 ${Math.max(0, Math.round(SIEGE.hp))}/${SIEGE.max}`, SIEGE.hp / SIEGE.max, GOLD);
  else if (RESC) bar(`◎ 救援：${RESCUE_DEF[RESC.id].n}　剩 ${Math.max(0, Math.ceil(RESC.t))} 秒`, RESC.t / 180, CIN);
  else if (TRIAL) bar(TRIAL.id === 'langu' ? `藍姑的考驗　剩 ${Math.max(0, Math.ceil(TRIAL.t))} 秒（不能吃藥）` : `東海釣叟的考驗　浪潮 ${TRIAL.n}/20　被打中 ${TRIAL.hits}/3`, TRIAL.id === 'langu' ? 1 - TRIAL.t / 60 : TRIAL.n / 20, TRIAL.id === 'langu' ? '#5a7a2a' : '#33536a');
}
