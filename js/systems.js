'use strict';
/* 一命江湖 1a — 養成、經濟、任務、時間 */
const SHICHEN = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
function isNight() { return S && S.clock >= 480; }
function hourNow() { const c = S.clock; return c < 480 ? 6 + c / 480 * 16 : (22 + (c - 480) / 240 * 8) % 24; }
function shichen() { return SHICHEN[Math.floor(((hourNow() + 1) % 24) / 2)] + '時'; }
function curWeather() { if (!S || !P) return '晴'; const r = regionAt(P.x, P.y); return r === 'secret' ? '晴' : S.weather[r] || REGIONS[r].weather[0]; }
const WEATHER_MSG = { 雨: '下雨了：寒屬性傷害 +20%、移速 −5%', 沙暴: '沙暴來了：視野縮小、遠程射程 −30%', 雪: '下雪了：寒屬性傷害 +30%、閃身冷卻 +10%', 血雨: '血雨落下：敵我吸血效果加倍', 晴: '天晴了' };
function tickTime(dt) {
  S.clock = (S.clock + dt) % 720; S.stats.play += dt;
  S.weather.t -= dt; if (S.weather.t <= 0) { S.weather.t = rnd(180, 300); for (const r in REGIONS) { if (stepLocksWeather(r)) continue; const w = pick(REGIONS[r].weather); if (w !== S.weather[r]) { S.weather[r] = w; if (curRegion() === r) { toast(WEATHER_MSG[w] || w); if (!S.seenWeather) S.seenWeather = {}; if (!S.seenWeather[w] && w !== '晴') { S.seenWeather[w] = 1; tip('天氣變化', WEATHER_MSG[w]); } } } } }
  // 奇遇計時：沙暴中待滿 3 分鐘
  if (curRegion() === 'sand' && curWeather() === '沙暴') { S.stats.storm = (S.stats.storm || 0) + dt; P.stormT = (P.stormT || 0) + dt; if (P.stormT >= 180) encounter('meteor'); } else P.stormT = 0;
  if (curRegion() === 'cult' && curWeather() === '血雨' && isNight() && S.karma <= -50) encounter('bloodmoon');
  for (const k in S.buffs) S.buffs[k] = Math.max(0, S.buffs[k] - dt);
  for (const k in P.buffT) P.buffT[k] = Math.max(0, P.buffT[k] - dt);
  if (S.zouhuo > 0) { S.zouhuo = Math.max(0, S.zouhuo - dt); P.hp = Math.max(1, P.hp - maxHp() * 0.01 * dt); if (P.mp > maxMp() / 2) P.mp = maxMp() / 2; if (S.zouhuo === 0) toast('真氣歸位，走火入魔解除'); }
}

/* ---------- 資源 ---------- */
function gainRes(k, n, x, y) { if (n <= 0) return; S.res[k] = (S.res[k] || 0) + n; if (x !== undefined) fxText(x, y, `+${n}${RES[k].s}`, k === 'silver' ? '#8a6a20' : k === 'page' ? CIN : '#3d4a3a', 13); commGather(k, n); }
function addItem(it) { if (S.bag.length >= S.bagCap) { toast('背包滿了，裝備留在原地'); return false; } S.bag.push(it); if (it.set) S.codex.gear['set:' + it.set + ':' + it.slot] = 1; if (it.unique) S.codex.gear[it.unique] = 1; return true; }
function stepLocksWeather(r) { return activeTracks().some(t => { const s = curStep(t); return s && ((s.storm && r === 'sand') || (s.type === 'raid' && r === 'cult')); }); }
function hitNode(nd) {
  nd.hp--; nd.shake = .18; let n = 1; if (setN('qiaofu') >= 2 && Math.random() < .2) n++; if (S.pet === 'dog' && Math.random() < .3) n++;
  gainRes(nd.kind, n, nd.x, nd.y - nd.r - 10);
  if (nd.kind === 'wood' && nd.region === 'bamboo' && Math.random() < .06) gainRes('bamboo', 1, nd.x, nd.y - 40);
  if (nd.kind === 'herb' && nd.region === 'sand' && Math.random() < .12) gainRes('shaji', 1, nd.x, nd.y - 40);
  if (nd.kind === 'herb' && nd.region === 'snow' && Math.random() < .1) gainRes('xuelian', 1, nd.x, nd.y - 40);
  if (nd.kind === 'iron' && nd.region === 'snow' && Math.random() < .05) gainRes('frost', 1, nd.x, nd.y - 40);
  if (nd.kind === 'iron' && nd.region === 'sand' && curWeather() === '沙暴' && Math.random() < .08) gainRes('meteor', 1, nd.x, nd.y - 40);
  if (nd.kind === 'iron' && nd.region === 'cult' && Math.random() < .04) gainRes('xuejing', 1, nd.x, nd.y - 40);
  burst(nd.x, nd.y, nd.kind === 'herb' ? JADE : nd.kind === 'iron' ? '#4a5560' : '#4a3a28', 4); sfx('chop');
  if (nd.hp <= 0) { nd.alive = false; nd.re = 60; }
}
function addKarma(n) {
  const before = S.karma; S.karma = clamp(S.karma + n, -100, 100);
  toast(n > 0 ? `俠義 +${n}（善惡值 ${S.karma}）` : `魔性 +${-n}（善惡值 ${S.karma}）`, n < 0 ? 'red' : '');
  if (before < 30 && S.karma >= 30) toast('領悟絕學「浩然正氣」', 'red'); if (before > -30 && S.karma <= -30) toast('領悟絕學「血煞魔功」', 'red');
  S.rep.righteous = clamp(S.rep.righteous + Math.round(n / 2), -100, 100); S.rep.blood = clamp(S.rep.blood - Math.round(n / 2), -100, 100);
}
function addRep(o) { for (const k in o) S.rep[k] = clamp((S.rep[k] || 0) + o[k], -100, 100); }
function repTier(v) { return v >= 60 ? '崇敬' : v >= 20 ? '友好' : v > -20 ? '中立' : v > -60 ? '冷淡' : '仇視'; }
function giveReward(r, x, y) { if (!r) return; if (r.cultOpen) { S.cultOpen = true; toast('血色結界破開了', 'red'); } for (const k in r) { if (RES[k]) gainRes(k, r[k], x, y); } if (r.book) learnBook(S, r.book); if (r.pet) { if (!S.pets.includes(r.pet)) S.pets.push(r.pet); if (!S.pet) S.pet = r.pet; toast(`新夥伴：${petName(r.pet)}`); } if (r.disciple) unlockDisciple(r.disciple); if (r.unlock) r.unlock.forEach(u => { S.unlock[u] = true; });
  if (r.bidu) { S.bidu = true; toast('得到避毒香：毒霧侵蝕減半', 'red'); } if (r.rep) addRep(r.rep); if (r.bond) { S.bond = S.bond || {}; S.bond[r.bond] = 1; toast('新的候選知己出現了（角色面板「知己」）', 'red'); } if (r.pres_gift) { addItem(makeItem('acc', 3, { unique: 'baishe_scale' })); } }
const petName = k => ({ dog: '小黃狗', myna: '八哥', fox: '雪狐', cat: '招財貓' }[k] || k);

/* ---------- 主線（分區多線並行） ----------
   落霞村先走完；之後翠竹林、黃沙古道、寒江雪嶺三線同時進行，順序自由；三令到手後開啟總壇線。 */
const CH1_TRACKS = ['village', 'bamboo', 'sand', 'snow', 'cult'], CH2A_TRACKS = ['miao', 'sea'], CH2B_TRACKS = ['zhong', 'kunlun'];
const QTRACKS = CH1_TRACKS.concat(CH2A_TRACKS, CH2B_TRACKS, ['final']);
const TRACK_NODES = {}; QTRACKS.forEach(r => TRACK_NODES[r] = NODES.filter(n => n.region === r));
function trk(r) { if (!S.tr) S.tr = {}; if (!S.tr[r]) S.tr[r] = { n: 0, s: 0 }; return S.tr[r]; }
function trackDone(r) { return trk(r).n >= TRACK_NODES[r].length; }
function activeTracks() {
  if (!trackDone('village')) return ['village'];
  const a = ['bamboo', 'sand', 'snow'].filter(r => !trackDone(r));
  if (S.tokens >= 3 && !trackDone('cult')) a.push('cult');
  if (S.ch2) CH2A_TRACKS.forEach(r => { if (!trackDone(r)) a.push(r); });
  if (S.ch2b) CH2B_TRACKS.forEach(r => { if (!trackDone(r)) a.push(r); });
  if (S.finalBoss && !trackDone('final')) a.push('final');
  return a;
}
function focusTrack() { const a = activeTracks(); if (!a.length) return null; const here = typeof P !== 'undefined' && S ? curRegion() : null; if (a.includes(here)) return here; if (a.includes(S.focus)) return S.focus; return a[0]; }
function curNode(r) { r = r || focusTrack(); return r ? TRACK_NODES[r][trk(r).n] : null; }
function curStep(r) { r = r || focusTrack(); const n = curNode(r); return n ? n.steps[trk(r).s] : null; }
function chapterDone() { return CH1_TRACKS.every(trackDone); }
function ch2aDone() { return !!S.ch2 && CH2A_TRACKS.every(trackDone); }
function objectiveText() {
  const r = focusTrack(); if (!r) return S.ending ? `江湖已了（結局：${ENDINGS[S.ending].n}）。血獄試煉塔在總壇地底，江湖劫鐘在青崖小築；想開新的一代，到英雄榜歸隱。` : S.ch2 ? '四方平定，線索正在收攏……' : chapterDone() ? (S.ch2 ? '前往南方山口外的苗疆、東海' : '第一章完。') : '擊敗三護法，集齊三枚血影令（目前 ' + S.tokens + '/3）';
  const n = curNode(r), s = curStep(r); const others = activeTracks().filter(x => x !== r);
  let t = s ? `【${REGIONS[r].short}】${n.t}：${s.d}` : n.t;
  if (others.length) t += `\n其他主線：${others.map(x => REGIONS[x].short + '・' + curNode(x).t).join('　')}`;
  else if (r !== 'cult' && !trackDone('village') === false && S.tokens < 3 && trackDone(r)) t += '';
  return t;
}
function stepTarget(s) { if (!s) return null;
  if (s.type === 'talk') return PLACES[Object.keys(PLACES).find(k => PLACES[k].npc === s.npc)];
  if (s.type === 'build') return PLACES.base; if (s.type === 'reach') return PLACES[s.place]; if (s.type === 'clear') return CAMPS[s.camp];
  if (s.type === 'named') { const c = Object.values(CAMPS).find(c => c.named === s.id); return c; } if (s.type === 'event') return PLACES[s.ev];
  if (s.type === 'learn') return PLACES[s.place || 'sword_tomb']; if (s.type === 'rumor') return STELES[s.id]; if (s.type === 'sleep_night') return PLACES.inn;
  if (s.type === 'night_ambush') return PLACES.station_bamboo; if (s.type === 'boss') return PLACES[ARENAS[s.id].place]; if (s.type === 'raid') return CAMPS.barracks;
  if (s.type === 'commission') return S.comm ? commTarget() : PLACES.board_v;
  if (s.type === 'rescue' && typeof RESC !== 'undefined' && RESC && RESC.id === s.id) return rescueTarget(s.id);
  if (s.type === 'choice' || s.type === 'trial' || s.type === 'rescue') return PLACES[s.place];
  if (s.type === 'waves') return PLACES[s.place] || CAMPS[s.place]; return null; }
function objectivePos() { return stepTarget(curStep()); }
function bannerFor(r) { return REGIONS[r] ? REGIONS[r].n : ''; }
function advanceStep(r) {
  r = r || focusTrack(); if (!r) return; const T = trk(r), n = curNode(r); if (!n) return; T.s++;
  if (T.s >= n.steps.length) { const fin = () => { giveReward(n.reward); T.n++; T.s = 0; toast(`主線完成：${n.t}`, 'red'); sfx('quest');
      if (r === 'village' && trackDone('village')) banner('四方驛路', '翠竹林、黃沙古道、寒江雪嶺，順序自由');
      else { const nn = curNode(r); if (nn) banner(nn.t, bannerFor(r)); else if (CH1_TRACKS.includes(r) && r !== 'cult') banner(`${REGIONS[r].n}・平定`, `血影令 ${S.tokens}/3`); else if (r !== 'cult' && r !== 'final') banner(`${REGIONS[r].n}・平定`, '第二章'); }
      if (r !== 'cult' && S.tokens >= 3 && !trk('cult').started) { trk('cult').started = true; later(2.5, () => { banner('三令歸一', '前往東北的血影教總壇'); onNodeStart('cult'); }); }
      if (r === 'cult' && trackDone('cult')) later(1.5, () => say(CH1_END, () => { S.ch1done = true; banner('第一章 完', '血影之亂'); saveGame(); later(3, startChapter2); }));
      if (CH2A_TRACKS.includes(r) && trackDone(r) && ch2aDone() && !CH2B_TRACKS.every(trackDone)) later(2.5, () => banner('南疆平定', '還有中原古城、崑崙山仙境'));
      onNodeStart(r); saveGame(); };
    if (n.done) say(n.done, fin); else fin(); }
  else { toast(`主線：${curStep(r).d}`); onNodeStart(r, true); saveGame(); }
}
// 節點或步驟開始時的特殊處理
function onNodeStart(r, stepOnly) { const s = curStep(r); if (!s) return; const n = curNode(r);
  if (!stepOnly && n.lines && !n.steps.some(x => x.type === 'talk' || x.type === 'sleep_night' || x.type === 'raid') && !(S.linesShown || (S.linesShown = {}))[n.id]) { S.linesShown[n.id] = 1; later(1.2, () => say(n.lines)); }
  if (s.storm) { S.weather.sand = '沙暴'; S.weather.t = Math.max(S.weather.t, 200); }
  if (s.type === 'clear' && S.camps[s.camp] && !S.camps[s.camp].spawned) S.camps[s.camp].cleared = 0; // 主線要清的據點立刻重生
  if (s.type === 'raid') { S.weather.cult = '血雨'; }
  if (s.type === 'waves' && s.id === 'flood') { S.weather.miao = '毒霧'; } }
function matchTrack(type, key, val) { for (const r of activeTracks()) { const s = curStep(r); if (s && s.type === type && (key === undefined || s[key] === val)) return r; } return null; }
function stepIs(type, key, val) { return !!matchTrack(type, key, val); }
function questTalk(npc) {
  const r = matchTrack('talk', 'npc', npc); if (!r) return false; const n = curNode(r), T = trk(r);
  if (r === 'village' && T.n === 0 && T.s === 0) { say(introLines(S, S.prev ? S.prev : null), () => { S.introDone = true; offerTutorial(); advanceStep(r); }); return true; }
  const step = n.steps[T.s]; const lines = step.lines || (n.lines && !(S.linesShown || {})[n.id] && !n.steps.slice(0, T.s).some(x => x.type === 'talk') ? n.lines : null);
  if (lines) say(lines, () => advanceStep(r)); else advanceStep(r); return true;
}
function questBuild() { const r = matchTrack('build'); if (r) { const s = curStep(r); if (S.bld[s.b] >= s.lv) advanceStep(r); } }
function questClear(camp) { const r = matchTrack('clear', 'camp', camp); if (r) advanceStep(r); }
function questNamed(id) { const r = matchTrack('named', 'id', id); if (r) advanceStep(r); }
function questEvent(ev) { const r = matchTrack('event', 'ev', ev); if (r) advanceStep(r); }
function questLearn() { const r = matchTrack('learn'); if (r && curStep(r).books.some(b => S.books[b])) advanceStep(r); }
function questRumor(id) { const r = matchTrack('rumor', 'id', id); if (r) advanceStep(r); }
function questBoss(id) { const r = matchTrack('boss', 'id', id); if (r) advanceStep(r); }
function questKill(e) { if (S.comm && S.comm.def.k === 'kill' && e.type === S.comm.def.type) { S.comm.prog++; if (S.comm.prog >= S.comm.def.n) commDone(); } }
function questTick() {
  for (const r of activeTracks()) { const s = curStep(r); if (!s) continue;
    if (s.type === 'reach' && Math.hypot(P.x - PLACES[s.place].x, P.y - PLACES[s.place].y) < 130) { burst(PLACES[s.place].x, PLACES[s.place].y, GOLD, 12); advanceStep(r); return; }
    if (s.type === 'build') questBuild(); if (s.type === 'learn') questLearn();
    if (s.type === 'rumor' && S.rumors[s.id]) { advanceStep(r); return; }
    if (s.type === 'named' && S.namedDead[s.id]) { advanceStep(r); return; }
    if (s.type === 'night_ambush' && isNight() && curRegion() === 'bamboo' && !WAVES.night) startNightAmbush();
    if (s.type === 'raid' && !WAVES.raid && !dlg && dist(P, CAMPS.barracks) < 700) startRaid(r);
    if (s.type === 'event' && S.events[s.ev] === 'done') { advanceStep(r); return; }
    if (typeof ch2StepTick === 'function' && ch2StepTick(r, s)) return; }
}
// 舊存檔（1a 的單線主線）轉成分區多線
function migrateTracks(s) { if (s.tr) return; const n = s.node || 0, st = s.step || 0; s.tr = {};
  if (n < 10) s.tr.village = { n, s: st }; else { s.tr.village = { n: 10, s: 0 }; s.tr.bamboo = n < 20 ? { n: n - 10, s: st } : { n: 10, s: 0 }; } }
/* 波次（事件、夜襲） */
const WAVES = {};
function spawnWave(tag, type, n, x, y, onDone) { WAVES[tag] = onDone; for (let i = 0; i < n; i++) { const e = spawnEnemy(type, x + rnd(-160, 160), y + rnd(-160, 160), null, { elite: false }); e.tag = tag; e.aggro = true; } }
function checkWave(tag) { if (E.some(e => e.tag === tag && !e.dead)) return; const f = WAVES[tag]; delete WAVES[tag]; if (f) f(); }
function startRaid(r) { const n = curNode(r); const go0 = () => { let w = 0; const go = () => { w++; if (w > 3) { WAVES.raid = null; toast('撐過了血雨夜的反撲', 'red'); advanceStep(r); return; } toast(`教眾第 ${w} 波`); const c = CAMPS.barracks; spawnWave('raid', pick(['cultist', 'hexer', 'bloodpuppet', 'sacrifice']), 2 + w, P.x, P.y, go); spawnWave('raid', 'cultist', 1 + w, P.x, P.y, go); WAVES.raid = go; }; WAVES.raid = go; banner('血雨夜', '撐過三波反撲'); go(); };
  WAVES.raid = () => { }; if (n.lines) say(n.lines, go0); else go0(); }
function startNightAmbush() { let w = 0; const go = () => { w++; if (w > 3) { WAVES.night = null; toast('撐過了竹林夜襲', 'red'); advanceStep(); return; } toast(`刺客第 ${w} 波`); spawnWave('night', 'assassin', 3 + w, P.x, P.y, go); WAVES.night = go; }; WAVES.night = go; banner('竹林夜襲', '撐過三波刺客'); go(); }

/* ---------- 江湖事件 ---------- */
function runEvent(id) {
  const ev = EVENTS[id]; if (S.events[id] === 'done' || S.events[id] === 'wave') return;
  const choices = ev.choices.map(c => ({ label: c.label + (c.need === 'potion' && S.potions <= 0 ? '（沒有金創藥）' : ''), alt: c.alt, disabled: c.need === 'potion' && S.potions <= 0, fn: () => {
    if (c.need === 'potion') S.potions--;
    const finish = () => { S.events[id] = 'done'; addKarma(c.karma); if (c.rep) addRep(c.rep); giveReward(c.reward, PLACES[ev.npc] && PLACES[ev.npc].x, PLACES[ev.npc] && PLACES[ev.npc].y); say(c.after, () => { questEvent(id); saveGame(); }); };
    if (c.act === 'wave') { S.events[id] = 'wave'; toast('擊退所有山賊！'); spawnWave('ev_' + id, c.wave.type, c.wave.n, PLACES[ev.npc].x, PLACES[ev.npc].y, finish); }
    else finish(); } }));
  say(ev.lines.concat([{ who: 'choice', t: '你要怎麼做？', choices }]));
}

/* ---------- 委託 ---------- */
function commOffers() { ensureDaily(); return S.daily.comm.map((c, i) => Object.assign({ idx: i, special: true }, COMMISSION_POOL[c])); }
function takeComm(i) { const d = COMMISSION_POOL[S.daily.comm[i]]; S.comm = { def: d, prog: 0, idx: i, special: true }; toast(`接下委託：${d.d}`); }
function commGather(k, n) { if (S.comm && S.comm.def.k === 'gather' && S.comm.def.res === k) { S.comm.prog += n; if (S.comm.prog >= S.comm.def.n) commDone(); } }
function commTarget() { const d = S.comm.def; if (d.k === 'deliver') return PLACES[d.to]; if (d.k === 'kill') return Object.values(CAMPS).find(c => c.types.includes(d.type)); return null; }
function commDone() { const c = S.comm; S.comm = null; const r = {}; for (const k in c.def.reward) r[k] = c.def.reward[k] * (c.special ? 3 : 1); giveReward(r); S.daily.commDone.push(c.idx); S.daily.comm[c.idx] = -1; addRep({ village: 3 }); toast(`委託完成：${c.def.d}`, 'red'); sfx('quest'); if (stepIs('commission')) advanceStep(); }
function dayKey() { const d = new Date(Date.now() - 5 * 3600 * 1000); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function ensureDaily() {
  const k = dayKey(); if (S.daily.day === k) return;
  S.daily.day = k; S.daily.claimed = false; S.daily.commDone = [];
  const pool = COMMISSION_POOL.map((c, i) => i).filter(i => { const c = COMMISSION_POOL[i]; if (c.needBamboo) return !!S.unlock.bamboo; return !c.region || c.region === 'village' || regionOpen(c.region) && S.stations[c.region]; });
  S.daily.comm = []; while (S.daily.comm.length < 3 && pool.length) S.daily.comm.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
}
function claimDaily() { ensureDaily(); if (S.daily.claimed) return false; const r = DAILY_REWARDS[S.daily.streak % 7]; S.daily.streak++; S.daily.claimed = true; giveReward(r); return r; }

/* ---------- 建築 ---------- */
function bldCost(k) { const l = S.bld[k]; return l >= 5 ? null : BUILDINGS[k].cost[l + 1]; }
function bldBlock(k) { const l = S.bld[k]; if (l >= 5) return '已達最高級'; if (k !== 'hall' && l + 1 > S.bld.hall) return `需門派大殿 ${l + 1} 級`; const c = bldCost(k); if (!c) return '已達最高級'; if (!canPay(c)) return 'lack'; return null; }
function upgradeBld(k) { const r = bldBlock(k); if (r) return; pay(bldCost(k)); S.bld[k]++; toast(`${BUILDINGS[k].n}${S.bld[k] === 1 ? '修建完成' : '擴建至 ' + S.bld[k] + ' 級'}`, 'red'); sfx('build'); questBuild(); saveGame(); }
function bldDesc(k) { const l = S.bld[k];
  switch (k) { case 'hall': return `可收弟子 ${DISC_CAP[l]} 人；其他建築最高 ${l} 級。`; case 'train': return l ? `掛機修練指定兵器，每秒 +${TRAIN_RATE[l]} 熟練（離線最多 2 小時）；可打已擊敗頭目的頭目木人。` : '修好後可掛機修練熟練度。';
    case 'smith': return l ? `兵器與裝備最高可升到「${TIERS[SMITH_CAP[l] - 1]}」${l >= 5 ? '，成功率 +10%' : ''}；可拆解「${TIERS[SMITH_CAP[l] - 1]}」以下的裝備。` : '修好後可升階與拆解裝備。';
    case 'lib': return `秘笈最高可突破到第 ${LIB_CAP[l]} 重${l >= 3 ? '；可合成高階' : ''}${l >= 5 ? '、絕世' : ''}。`; case 'herbal': return l ? `金創藥回復 ${Math.round(potHeal(l) * 100)}%、最多帶 ${POT_MAX[l]} 瓶；可醫治受傷的弟子。` : '修好後可煉金創藥。';
    case 'alchemy': return l ? `可煉製 ${Object.values(PILLS).filter(p => p.lv <= l).map(p => p.n).join('、')}。` : '修好後可煉丹。'; case 'array': return '第二章青崖小築會被攻打，大陣等級決定守不守得住。';
    case 'vault': return `擺放頭目專屬裝備，每件全域傷害 +1%（目前 ${S.vaultItems.length} 件，最多 ${l * 2} 件）。`; } return ''; }

/* ---------- 經脈 ---------- */
function openMeridian(k) { const n = S.mer[k] + 1, c = merCost(n); const cc = {}; for (const x in c) if (c[x]) cc[x] = c[x]; if (!canPay(cc)) return; pay(cc); S.mer[k]++; const m = MERIDIANS.find(m => m.k === k); toast(`打通${m.n}第 ${S.mer[k]} 重`); if (k === 'ren') P.hp += 20; sfx('learn'); refreshStats(); saveGame(); }

/* ---------- 秘笈突破與合成 ---------- */
function breakCost(id) { const b = getBook(id), n = S.books[id].lv + 1, m = b.tier === 2 ? 2 : b.tier === 3 ? 4 : 1; return { page: Math.round(2 * n * m * (1 + titleBonus('study'))), silver: Math.round(50 * n * m * (1 + titleBonus('study'))) }; }
function breakBlock(id) { const s = S.books[id]; if (s.lv >= 10) return '已達第十重'; if (s.lv >= LIB_CAP[S.bld.lib]) return `需藏經閣 ${LIB_CAP.findIndex(c => c > s.lv)} 級`; { const b = getBook(id), need = artNeed(id); if ((s.prog || 0) < need) return `修練進度 ${Math.min(s.prog || 0, need)}/${need}（${{ weapon: '實戰命中', inner: '裝備時擊殺', qi: '施展次數', qing: '裝備時奔跑' }[b.cat] || '實戰'}累積）`; } if (!canPay(breakCost(id))) return 'lack'; return null; }
function breakBook(id) { if (breakBlock(id)) return; pay(breakCost(id)); const s = S.books[id]; s.lv++; s.prog = 0; s.capMsg = 0; toast(`《${getBook(id).n}》突破至第 ${s.lv} 重`, 'red'); sfx('learn'); refreshStats(); saveGame(); }
function fusionChance(a, b) { const A = getBook(a), B = getBook(b); let p = (A.tier === 2 ? 0.35 : 0.20) + (A.cat !== B.cat ? 0.05 : 0) - Math.floor(S.mer.du / 5) * 0.01 - (S.bld.lib >= 5 ? 0.05 : 0) - (S.nextFusionSafe ? 0.05 : 0) + titleBonus('zouhuo'); return Math.max(0.05, p); }
function fusionBlock(a, b) { if (!a || !b || a === b) return '選兩本不同的秘笈'; const A = getBook(a), B = getBook(b); if (S.books[a].lv < 10 || S.books[b].lv < 10) return '兩本都要第十重'; if (A.tier !== B.tier) return '只能同階合成（初階＋初階、高階＋高階）'; if (A.tier >= 3) return '絕世不能再合成';
  if (A.tier === 1 && S.bld.lib < 3) return '需藏經閣 3 級'; if (A.tier === 2 && S.bld.lib < 5) return '需藏經閣 5 級'; if (!canPay(fusionCost(a))) return 'lack'; return null; }
function fusionCost(a) { return getBook(a).tier === 1 ? { page: 20, silver: 500 } : { page: 60, silver: 2000 }; }
function fusionResult(a, b, cat, tieAttr) {
  const A = getBook(a), B = getBook(b);
  if (A.tier === 1) { const key = [A.attrs[0], B.attrs[0]].sort((x, y) => ATTR_ORDER.indexOf(x) - ATTR_ORDER.indexOf(y)).join('');
    const attrs = key.split(''); const other = cat === A.cat ? B.cat : A.cat; const cross = A.cat !== B.cat ? other : null;
    if (cat === 'weapon') { const h = HIGH_WEAPON[key]; return { n: h.n, cat, w: h.w, tier: 2, attrs, pat: h.pat, cross, mult: 2.2 }; }
    const suffix = { inner: '雙修', qi: '勁', qing: '步' }[cat]; const base = cat === 'qi' ? (attrs.includes('寒') ? 'icicle' : attrs.includes('剛') ? 'line' : attrs.includes('毒') ? 'orb' : 'sleeve') : null;
    return { n: attrs.join('') + suffix, cat, tier: 2, attrs, pat: base, cross, mult: 2.2 }; }
  const all = A.attrs.concat(B.attrs); const cnt = {}; all.forEach(x => cnt[x] = (cnt[x] || 0) + 1); const max = Math.max(...Object.values(cnt)); const tops = Object.keys(cnt).filter(k => cnt[k] === max); const main = tieAttr && tops.includes(tieAttr) ? tieAttr : tops[0];
  if (cat === 'weapon') { const u = ULTRA.weapon[main]; return { n: u[0], cat, w: u[1], tier: 3, attrs: [main], pat: u[2], mult: 4, tops }; }
  return { n: ULTRA[cat][main], cat, tier: 3, attrs: [main], pat: cat === 'qi' ? { 柔: 'sleeve', 剛: 'line', 寒: 'icicle', 毒: 'orb' }[main] : null, mult: 4, tops };
}
function doFusion(a, b, cat, tieAttr) {
  if (fusionBlock(a, b)) return null; const res = fusionResult(a, b, cat, tieAttr); const tier = getBook(a).tier;
  pay(fusionCost(a)); const chance = fusionChance(a, b); S.nextFusionSafe = false;
  S.books[a].lv = 1; S.books[a].prog = 0; S.books[b].lv = 1; S.books[b].prog = 0;
  if (Math.random() < chance) { zouhuo(tier === 1 ? 300 : 600, '合成失敗');
    if (tier === 2) { const m = pick(MERIDIANS.filter(m => S.mer[m.k] > 0)); if (m) { S.mer[m.k]--; toast(`${m.n}倒退 1 重`, 'red'); } }
    saveGame(); return { fail: true }; }
  const id = 'c' + Date.now().toString(36); res.src = '合成'; if (res.cross) res.crossBonus = res.cross; S.customBooks[id] = res; learnBook(S, id); closeupFx(res.n); saveGame(); return { id, res };
}

/* ---------- 裝備升階 ---------- */
function upgradeInfo(tier) { return UPGRADE[tier] || null; }
function upgradeCost(tier, isArmor, mat) { const u = upgradeInfo(tier); if (!u) return null; const c = { silver: u.silver }; c[isArmor ? mat : 'iron'] = u.iron; if (u.rare) c.rare = u.rareN; return c; }
function upgradeBlock(tier, isArmor, mat) { const u = upgradeInfo(tier); if (!u) return '已是神兵'; if (S.bld.smith < 1) return '需修建鐵匠鋪'; if (tier + 1 > SMITH_CAP[S.bld.smith]) return `需鐵匠鋪 ${SMITH_CAP.indexOf(tier + 1)} 級`; if (!canPay(upgradeCost(tier, isArmor, mat))) return 'lack'; return null; }
function rollUpgrade(tier) { const u = upgradeInfo(tier); const rate = Math.min(1, u.rate + (S.bld.smith >= 5 ? 0.1 : 0)); if (Math.random() < rate) return tier + 1; if (u.drop && Math.random() < u.drop && !S.huqi) return u.to; S.huqi = false; return tier; }
function upgradeWeapon(w) { const x = S.wpn[w]; if (upgradeBlock(x.tier, false)) return; pay(upgradeCost(x.tier, false)); const nt = rollUpgrade(x.tier); report(x.tier, nt, WEAPONS[w].name); x.tier = nt; saveGame(); }
function upgradeItem(it) { const mat = GEAR_BASE[it.slot].mat; if (upgradeBlock(it.tier, true, mat)) return; pay(upgradeCost(it.tier, true, mat)); const nt = rollUpgrade(it.tier); report(it.tier, nt, it.name); it.tier = nt; if (!it.unique) it.name = (it.set ? SETS[it.set].n.slice(0, 2) : '') + GEAR_NAMES[it.slot][nt - 1]; refreshStats(); saveGame(); }
function report(a, b, n) { if (b > a) { toast(`${n}升階成功：${TIERS[b - 1]}`, 'red'); sfx('build'); } else if (b < a) { toast(`升階失敗，${n}掉回${TIERS[b - 1]}`, 'red'); sfx('fail'); } else { toast('升階失敗，材料已損失'); sfx('fail'); } }
function dismantleBlock(it) { if (!S.bld.smith) return '鐵匠鋪還沒修建'; if (it.tier > SMITH_CAP[S.bld.smith]) return `「${TIERS[it.tier - 1]}」需鐵匠鋪 ${SMITH_CAP.findIndex(c => c >= it.tier)} 級才拆得動`; return ''; }
function dismantle(it) { const bl = dismantleBlock(it); if (bl) { toast(bl); return; } const mat = GEAR_BASE[it.slot].mat; const n = 2 * it.tier; S.bag = S.bag.filter(x => x !== it); gainRes(mat, n); if (Math.random() < .1) gainRes('page', 1); toast(`拆解得 ${RES[mat].n} ${n}`); }
function sellPrice(it) { return 15 * it.tier * it.tier + (it.set ? 20 : 0); }

/* ---------- 弟子 ---------- */
function unlockDisciple(id) { if (!S.disciples[id]) { S.disciples[id] = { state: 'cand' }; toast(`${DISCIPLES[id].n}想拜入青崖派，到青崖小築收徒`); } }
function discCount() { return Object.values(S.disciples).filter(d => d.state !== 'cand').length; }
function recruit(id) { if (discCount() >= DISC_CAP[S.bld.hall]) { toast('門派大殿等級不夠，收不下更多弟子'); return; } S.disciples[id] = { state: 'home', since: Date.now() }; toast(`收${DISCIPLES[id].n}為弟子`, 'red'); saveGame(); }
function openRegions() { return REGION_ORDER.filter(r => r === 'village' || (r === 'bamboo' ? S.unlock.bamboo : regionOpen(r) && S.stations[r])); }
function dispatch(id, region, min) { const d = S.disciples[id]; d.state = 'out'; d.region = region; d.until = Date.now() + min * 60000; d.min = min; toast(`${DISCIPLES[id].n}出發前往${REGIONS[region].n}，${min} 分鐘後回來`); saveGame(); }
let discAcc = 0;
function tickDisciples(dt) {
  discAcc += dt; if (discAcc < 10) return; const sec = discAcc; discAcc = 0;
  for (const id in S.disciples) { const d = S.disciples[id], def = DISCIPLES[id];
    if (d.state === 'home') { d.acc = (d.acc || 0) + (def.spec === 'silver' ? 6 : 3) * sec / 60; const n = Math.floor(d.acc); if (n) { d.acc -= n; S.res[def.spec] += n; } }
    if (d.state === 'out' && Date.now() >= d.until) discReturn(id);
    if (d.state === 'hurt' && Date.now() >= d.until) d.state = 'home'; }
}
function discReturn(id) { const d = S.disciples[id], def = DISCIPLES[id]; const amt = Math.round(d.min * 1.5);
  const MATS = { miao: ['herb', 'wood', 'cloth', 'guwang'], sea: ['iron', 'silver', 'bone', 'lingzhi'], bamboo: ['herb', 'wood', 'bone', 'bamboo'], sand: ['iron', 'bone', 'cloth', 'shaji'], snow: ['iron', 'herb', 'fur', 'xuelian'], cult: ['silver', 'cloth', 'page', 'xuejing'] };
  const RARE = { bamboo: 'bamboo', sand: 'shaji', snow: 'xuelian', cult: 'xuejing', miao: 'guwang', sea: 'lingzhi' }; const mats = MATS[d.region] || ['wood', 'herb', 'fur', 'cloth']; const got = {};
  for (let i = 0; i < amt; i++) { const k = Math.random() < .5 ? def.spec : pick(mats); const kk = k === RARE[d.region] && Math.random() > .15 ? mats[0] : k === 'page' && Math.random() > .3 ? 'silver' : k; got[kk] = (got[kk] || 0) + 1; }
  for (const k in got) S.res[k] += got[k];
  let msg = `${def.n}回來了，帶回 ${Object.keys(got).map(k => RES[k].n + ' ' + got[k]).join('、')}`;
  if (Math.random() < .1) { const miss = Object.keys(RUMORS).filter(r => RUMORS[r].region === d.region && !S.rumors[r]); if (miss.length) { const r = pick(miss); S.rumors[r] = 1; msg += `，還打聽到傳聞「${RUMORS[r].t}」`; } }
  if (Math.random() < .1) { d.state = 'hurt'; d.until = Date.now() + 600000; msg += '，但受了傷，要休養 10 分鐘（藥廬可醫治）'; } else d.state = 'home';
  toast(msg); }
function healDisciple(id) { if (S.res.herb < 5 || S.bld.herbal < 1) return; S.res.herb -= 5; S.disciples[id].state = 'home'; toast(`${DISCIPLES[id].n}傷好了`); }

/* ---------- 商人 ---------- */
function merchantStation() { const st = REGION_ORDER.filter(r => r === 'village' || S.stations[r] && regionOpen(r)); return st[Math.floor(Date.now() / 600000) % st.length]; }
function merchantPos() { const p = PLACES['station_' + merchantStation()]; return { x: p.x, y: p.y + 150 }; }
function merchantStock() { const seed = Math.floor(Date.now() / 600000); const R = mulberry(seed); const items = []; for (let i = 0; i < 3; i++) { const slot = ['robe', 'hat', 'boots', 'belt', 'acc'][Math.floor(R() * 5)]; const tier = R() < .3 ? 2 : 1; items.push({ slot, tier, key: seed + '-' + i }); } return items; }
const MYSTERY = { active: false, x: 0, y: 0, until: 0, next: 0 };
function tip(title, body) { if (typeof toast === 'function') toast(`【${title}】${body}`, 'red'); }
function tickMystery() { const now = Date.now(); if (MYSTERY.active && now > MYSTERY.until) { MYSTERY.active = false; toast('神秘商人消失在小路盡頭'); }
  if (!MYSTERY.active && now > MYSTERY.next) { MYSTERY.next = now + rnd(240000, 360000); if (Math.hypot(P.x - PLACES.base.x, P.y - PLACES.base.y) > 600 && curRegion() !== 'secret' && Math.random() < .6) { const a = rnd(0, TAU); MYSTERY.x = P.x + Math.cos(a) * 260; MYSTERY.y = P.y + Math.sin(a) * 260; collide(MYSTERY, 20, true); MYSTERY.active = true; MYSTERY.until = now + 120000; MYSTERY.sold = {}; toast('附近出現一位戴面紗的神秘商人（停留 2 分鐘）', 'red'); } } }
function discount() { return (S.origin === 'langzi' ? 0.9 : 1) * (S.rep.merchants >= 60 ? 0.8 : 1); }

/* ---------- 奇遇與江湖反應 ---------- */
function encounter(id) { if (S.encounters[id]) return; S.encounters[id] = 1; const e = ENCOUNTERS[id]; closeupFx(e.n); toast(`奇遇：${e.d}`, 'red');
  if (id === 'drunk') { S.mer.du += 5; say([{ who: 'drunk', t: '嗝……小子，連住三晚，就為了等我老頭子？好，好！喝了這碗，經脈自通！' }, { who: 'narr', t: '一股烈酒般的熱流沖進督脈，你的內力翻湧不止。' }]); }
  if (id === 'resonance') say([{ who: 'narr', t: '月光落進劍冢，千柄殘劍同時低鳴。你手中的劍，也跟著輕輕顫了一下。' }]);
  if (id === 'fall') { const ids = Object.keys(S.books).filter(b => S.books[b].lv < 10); const b = ids.length ? pick(ids) : null; if (b) S.books[b].lv = Math.min(10, S.books[b].lv + 3);
    P.x = PLACES.cliff_edge.x + 160; P.y = PLACES.cliff_edge.y + 260; collide(P, 16, true); giveReward({ pet: 'fox' });
    say([{ who: 'narr', t: '腳下一滑，你連人帶雪滾下斷崖。天旋地轉之間，一棵橫生的老松接住了你。' }, { who: 'narr', t: '松樹後是一個山洞，石壁上刻滿了小字。你在洞裡待了一夜，照著石壁一字一字地練。' }, { who: 'narr', t: b ? `天亮時，《${getBook(b).n}》突破了三重。` : '天亮時，你覺得渾身經脈都通透了。' }, { who: 'narr', t: '你從山洞另一頭爬出來時，一隻白狐蹲在雪地上看著你，然後一聲不響地跟在你身後。' }]); }
  if (id === 'meteor') { const w = S.wpn[S.main]; const before = w.tier; w.tier = Math.min(5, w.tier + 1); gainRes('meteor', 2);
    say([{ who: 'narr', t: '沙暴最濃的時候，頭頂一聲悶響，一塊拳頭大的黑鐵砸進你身邊的沙裡，燙得冒煙。' }, { who: 'narr', t: before < 5 ? `你把隕鐵按在${WEAPONS[S.main].name}上，鐵水般的光澤滲了進去──${WEAPONS[S.main].name}升到了「${TIERS[w.tier - 1]}」。` : '你的兵器已是神兵，隕鐵收進了行囊。' }]); }
  if (id === 'bloodmoon') { if (!S.books.xueying_heart) learnBook(S, 'xueying_heart', true); S.books.xueying_heart.lv = Math.min(10, S.books.xueying_heart.lv + 3);
    say([{ who: 'narr', t: '血雨打在臉上，溫熱的。耳邊響起細細的念誦聲，一句一句，全是《血影心經》的口訣。' }, { who: 'narr', t: '你沒有抵抗。心經在你體內運轉了三周天──突破了三重。' }]); }
  if (id === 'lingshe') { addItem(makeItem('acc', 3, { unique: 'baishe_scale' })); S.codex.gear.baishe_scale = 1; say([{ who: 'narr', t: '白蛇第三次從你腳邊游過，這回停了下來，在你面前褪下一片雪白的鱗，才慢慢沒入毒沼。' }]); }
  if (id === 'yuwang') { gainRes('page', 30); say([{ who: 'narr', t: '第十網拉上來，網底除了魚，還纏著一個油布包。打開一看，是一疊泡過海水的武學殘頁。' }]); }
  saveGame(); }
let reactT = 240;
function tickReactions(dt) { reactT -= dt; if (reactT > 0) return; reactT = 240; if (curRegion() === 'secret' || Math.hypot(P.x - PLACES.base.x, P.y - PLACES.base.y) < 600 || BOSSFIGHT) return;
  if (S.karma <= -50) { const e = spawnEnemy('assassin', P.x + 300, P.y, null, { elite: true }); e.aggro = true; e.hunter = '賞金獵人'; e.tag = 'hunter'; WAVES.hunter = () => { gainRes('silver', 150); gainRes('page', 2); toast('打退了賞金獵人'); }; toast('有人放出賞金，獵人追來了！', 'red'); }
  else if (S.karma >= 50) { const e = spawnEnemy('assassin', P.x + 300, P.y, null, { elite: true }); e.aggro = true; e.hunter = '挑戰的少年'; e.tag = 'challenger'; WAVES.challenger = () => { gainRes('silver', 100); addRep({ righteous: 5 }); toast('年輕高手抱拳離去：「受教了！」'); }; toast('一名想成名的少年攔路挑戰！'); } }

/* ---------- 成就 ---------- */
let achT = 0;
function tickAch(dt) { achT -= dt; if (achT > 0) return; achT = 2; for (const a of ACHIEVEMENTS) if (!S.ach[a.id] && a.test(S)) { S.ach[a.id] = 1; toast(`成就：${a.n}${a.title ? `（得稱號「${a.title}」）` : ''}`, 'red'); sfx('quest'); }
  const C = codexBooks(S); S.codexRw = S.codexRw || {}; for (const k in C) for (const th of [50, 100]) if (C[k].pct >= th && !S.codexRw[k + th]) { S.codexRw[k + th] = 1; const n = th === 50 ? 10 : 30; S.res.page += n; toast(`圖鑑「${C[k].n}」完成 ${th}%：殘頁 +${n}`, 'red'); } }

/* ---------- 江湖圖鑑（第一章） ---------- */
const SLOTS_SET = ['robe', 'hat', 'boots', 'belt', 'acc'];
const CH1_MON = Object.keys(ENEMIES).filter(k => k !== 'dummy' && !['miao', 'sea', 'zhong', 'kunlun'].includes(ENEMIES[k].region));
const CH2_MON = Object.keys(ENEMIES).filter(k => ['miao', 'sea', 'zhong', 'kunlun'].includes(ENEMIES[k].region) && k !== 'zp_hero');
const CH1_BOOKS = Object.keys(BOOKS).filter(k => !BOOKS[k].ch && !/第二章/.test(BOOKS[k].src));
const CH2_BOOKS = ['jincan', 'wudu_heart', 'langlijiao', 'fenlang', 'baizu', 'guanchao', 'leitai_fist', 'haoran_sword', 'taiqing', 'hanyun', 'tianji', 'hunyuan', 'shuanggu', 'jinghong_ying', 'qingya_shuang', 'zhuying_sha'];
const CH1_PEOPLE = ['master', 'chief', 'innkeeper', 'dojo', 'farmer', 'mojiao', 'merchant', 'mystery', 'drunk', 'liu', 'caravan_boss', 'boatwife', 'nun', 'oldman', 'fisher', 'boatman', 'mole', 'tieba', 'gusou', 'li', 'prisoner'];
const PEOPLE_BIO = {
  master: '青崖派掌門，白髮長鬚，愛品茶。寬厚慈祥，總說「急什麼，茶還沒涼」。', chief: '落霞村村長，老實念舊，記得三十年前青崖山上的舊事。', innkeeper: '落霞客棧掌櫃，膽小但消息靈通。', dojo: '落霞武館館主，嘴硬心軟，傳授伏虎拳與金鐘罩。',
  farmer: '村口種地的老農，被山賊勒索多年。', mojiao: '被同門暗算的血影教弟子。', merchant: '固定行商「老錢」，在各驛站之間輪流做生意。', mystery: '戴面紗的神秘商人，沒人知道是誰。', drunk: '連住三晚才會出現的醉酒老人，喝一碗就能打通經脈。',
  liu: '血影教護法・竹影刺客。幼時全家被殺，被血影教養大；冷漠寡言，恩怨分明。', caravan_boss: '絲路商幫把頭駱三刀，刀快、話直，最講義氣。', boatwife: '寒江渡口船夫的妻子，丈夫失蹤三天。', nun: '冰窟深處的老尼，只傳俠義之人玄冰心經。',
  oldman: '雪原上走火入魔的老者，誤練血影心經。', fisher: '江心孤舟上的釣客，釣了三十年的魚，從沒釣到過。', boatman: '寒江渡口的船夫老韓，被凍在冰下當作誘餌。', mole: '被抓上總壇的小教眾小六，想投誠。',
  tieba: '血影教護法・狂沙刀。魁梧光頭、豪邁粗魯，最講規矩：「留下買路錢！」', gusou: '血影教護法・寒江孤叟。蓑衣白鬍，在江心等一個三十年沒回來的人。', li: '血影教主。暗紅長袍、蒼白面容，練吸人內力的血影神功。臨死前說「真正的主人不是我」。',
  prisoner: '被囚在血牢的各派高手，每月被抽一次內力。',
};
function codexLists(s) { const c2 = !!s.ch2, N2 = ['wudu_tongzi', 'aluo', 'laojing', 'coral', 'tiebutou', 'heixiong', 'qingsong', 'baiyuan'], B2 = ['gumu', 'haitianba', 'jinsuanpan', 'yunhe', 'linxiao', 'xuanxiao', 'qingxu'];
  return { mon: c2 ? CH1_MON.concat(CH2_MON) : CH1_MON, named: Object.keys(NAMED).filter(k => c2 || !N2.includes(k)), boss: Object.keys(BOSS).filter(k => c2 || !B2.includes(k)), books: c2 ? CH1_BOOKS.concat(CH2_BOOKS) : CH1_BOOKS,
    people: c2 ? CH1_PEOPLE.concat(CH2_PEOPLE, CH2B_PEOPLE) : CH1_PEOPLE, rumors: Object.keys(RUMORS).filter(k => c2 || !['miao', 'sea', 'zhong', 'kunlun'].includes(RUMORS[k].region)),
    gear: Object.keys(UNIQUE_GEAR).filter(k => c2 || !['wudu_sachet', 'silver_snake', 'helm_rope', 'coral_crown', 'gumu_staff', 'shark_fang', 'baishe_scale', 'catch_chain', 'bear_belt', 'pine_crown', 'ape_ring', 'gold_abacus', 'crane_robe', 'meng_seal', 'xian_gourd', 'qingxu_cup'].includes(k)), sets: Object.keys(SETS).filter(k => c2 || !['wudu', 'yubang', 'leitai', 'taiqing'].includes(k)) }; }
function codexBooks(s) { const L = codexLists(s);
  const mon = L.mon.filter(k => s.codex.mon[k]).length + L.named.filter(k => s.namedDead[k]).length + L.boss.filter(k => s.bossDead[k]).length, monT = L.mon.length + L.named.length + L.boss.length;
  const book = L.books.filter(k => s.books[k]).length, bookT = L.books.length;
  const gear = L.gear.filter(k => s.codex.gear[k]).length + L.sets.reduce((a, k) => a + SLOTS_SET.filter(sl => s.codex.gear['set:' + k + ':' + sl]).length, 0), gearT = L.gear.length + L.sets.length * 5;
  const rumor = L.rumors.filter(k => s.rumors[k]).length, rumorT = L.rumors.length;
  const ppl = L.people.filter(k => (s.codex.people || {})[k]).length, pplT = L.people.length;
  const pc = (a, b) => Math.floor(a / b * 100);
  return { mon: { n: '怪物', pct: pc(mon, monT) }, book: { n: '秘笈', pct: pc(book, bookT) }, gear: { n: '裝備', pct: pc(gear, gearT) }, rumor: { n: '江湖傳聞', pct: pc(rumor, rumorT) }, people: { n: '人物', pct: pc(ppl, pplT) } };
}
function codexPct(s) { const C = codexBooks(s); return Math.floor(Object.values(C).reduce((a, c) => a + c.pct, 0) / 5); }

/* ---------- 離線收益 ---------- */
function offlineGain() {
  const off = Math.min(7200, Math.max(0, (Date.now() - S.time) / 1000)); if (off < 60) return null; const msg = [];
  if (S.bld.train) { const w = S.wpn[S.trainW], b = w.lv; gainMastery(S.trainW, TRAIN_RATE[S.bld.train] * off); if (w.lv > b) msg.push(`${WEAPONS[S.trainW].name}熟練 ${b}→${w.lv}`); }
  let got = {}; for (const id in S.disciples) { const d = S.disciples[id], def = DISCIPLES[id]; if (d.state === 'home') { const n = Math.floor((def.spec === 'silver' ? 6 : 3) * off / 60); S.res[def.spec] += n; got[def.spec] = (got[def.spec] || 0) + n; } }
  const g = Object.keys(got).filter(k => got[k]).map(k => RES[k].n + ' ' + got[k]); if (g.length) msg.push('弟子產出 ' + g.join('、'));
  return msg.length ? `你離開了 ${Math.round(off / 60)} 分鐘。${msg.join('；')}。` : null;
}

/* ---------- 死亡（硬核） ---------- */
function playerDown() {
  if (P.practice || BOSSFIGHT && BOSSFIGHT.practice) { P.hp = maxHp(); endBossFight(false); P.x = PLACES.train.x; P.y = PLACES.train.y; toast('演武落敗，不會刪檔'); return; }
  if (TUT.on) { P.hp = maxHp(); toast('教學中不會死亡'); return; }
  if (S.xuming > 0) { S.xuming--; P.hp = maxHp(); P.x = PLACES.base.x; P.y = PLACES.base.y + 160; closeupFx('續命'); toast(`續命丹生效，在青崖小築醒來（剩 ${S.xuming} 顆）`, 'red'); if (BOSSFIGHT) endBossFight(false); saveGame(); return; }
  P.dead = true; P.hp = 0; S.dead = true; input.atk = false; sfx('death');
  const where = regionName(curRegion()); recordHero(`死於${where}`); deleteSave();
  later(1.2, () => showDeath(where));
}
function retire() { recordHero(S.ending ? `破關・${ENDINGS[S.ending].n}` : '', '歸隱'); deleteSave(); running = false; S = null; E = []; closePanel(); $('hud').hidden = true; showTitle(); toast('已歸隱。青崖山上多了一座墓碑；下一代會繼承建築與部分物品。', 'red'); }
