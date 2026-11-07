'use strict';
/* 一命江湖 — 第三批：即時 1 對 1 論劍（PeerJS 點對點連線，免登入；只在 GitHub Pages 版開放）
   本檔最後載入（要包裝 main.js 的繪圖函式）。
   規則：三局兩勝、每局 90 秒、時間到比剩餘氣血百分比；平衡擂台把數值拉平，無限制擂台帶入全部養成。
   判定：被打的一方判定自己有沒有中招（閃身、無敵時間由自己算）。 */

const DUEL_ID = 'yimingjh-v1-', DUEL_ROUND = 90, DUEL_BAL_HP = 1200, DUEL_BAL_DMG = 40;
let DUEL = null;
ROOMS.push({ id: 'duel_room', x: 11600, y: 3500, w: 900, h: 900 });
const duelRoom = () => ROOMS.find(r => r.id === 'duel_room');
const duelLocal = () => /[?&]duel=local/.test(location.search);
// Claude 網頁連結版不能連外，論劍只在自己架的網址（GitHub Pages）開放
function duelOnline() { if (duelLocal()) return true; const h = location.hostname; return location.protocol.startsWith('http') && !!h && !/claude\.ai|claudeusercontent|anthropic|localhost|127\.0\.0\.1/.test(h); }

/* ---------- 連線：PeerJS（正式）／BroadcastChannel（同一台瀏覽器兩個分頁測試用） ---------- */
function loadPeer() { return new Promise((ok, no) => { if (window.Peer) return ok(); const s = document.createElement('script'); s.src = 'js/peerjs.min.js'; s.onload = () => window.Peer ? ok() : no(new Error('PeerJS 沒載入')); s.onerror = () => no(new Error('PeerJS 下載失敗')); document.head.appendChild(s); }); }
function wrapConn(conn) { const T = { send: o => { try { conn.open && conn.send(o); } catch (e) { } }, close: () => { try { conn.close(); } catch (e) { } } }; conn.on('data', d => T.onmsg && T.onmsg(d)); conn.on('close', () => T.onclose && T.onclose()); conn.on('error', () => T.onclose && T.onclose()); return T; }
function bcTransport(room, host) { const bc = new BroadcastChannel('yj-duel-' + room), me = Math.random().toString(36).slice(2); const T = { send: o => bc.postMessage({ from: me, o }), close: () => { bc.postMessage({ from: me, o: { t: 'bye' } }); bc.close(); } };
  bc.onmessage = ev => { if (ev.data.from === me) return; if (ev.data.o.t === 'bye') { T.onclose && T.onclose(); return; } T.onmsg && T.onmsg(ev.data.o); }; return T; }
function duelStatus(t) { if (!DUEL) return; DUEL.status = t; if (panel && panel.kind === 'duel') renderPanel(); }
function newPeer(id) { return new Promise((ok, no) => { const p = id ? new Peer(id, { debug: 0 }) : new Peer({ debug: 0 }); const to = setTimeout(() => { no(new Error('連不上配對伺服器')); try { p.destroy(); } catch (e) { } }, 9000); p.on('open', () => { clearTimeout(to); ok(p); }); p.on('error', e => { clearTimeout(to); no(e); }); }); }
function tryJoin(peer, id, ms) { return new Promise(ok => { const c = peer.connect(id, { reliable: true }); const to = setTimeout(() => { try { c.close(); } catch (e) { } ok(null); }, ms); c.on('open', () => { clearTimeout(to); ok(c); }); const err = e => { if (e && e.type === 'peer-unavailable') { clearTimeout(to); ok(null); } }; peer.on('error', err); }); }

function duelStart(kind, code) {
  if (DUEL) return; if (!S || !running || BOSSFIGHT || TOWER || SIEGE || RESC) return toast('現在不能論劍');
  if (!duelOnline()) return say([{ who: 'narr', t: '論劍要連上網路，只在 GitHub Pages 的版本開放；Claude 網頁連結的版本不能連外。' }]);
  DUEL = { phase: 'connect', mode: panel && panel.data && panel.data.mode || 'bal', status: '準備中……', kind };
  if (duelLocal()) { const room = code || '0000', host = kind === 'host'; DUEL.host = host; DUEL.code = room; DUEL.T = bcTransport(room, host); duelBind(); duelStatus(host ? `本機測試房 ${room}，等對手……` : '加入本機測試房……'); if (!host) duelHello(); return; }
  loadPeer().then(async () => {
    if (kind === 'host') { for (let i = 0; i < 6; i++) { const c = String(rint(1000, 9999)); try { DUEL.peer = await newPeer(DUEL_ID + c); DUEL.code = c; break; } catch (e) { if (e.type !== 'unavailable-id') throw e; } }
      if (!DUEL.peer) throw new Error('開房失敗'); DUEL.host = true; duelStatus(`房號 ${DUEL.code}：把房號給朋友，等對手加入……`); DUEL.peer.on('connection', c => { if (DUEL.T) { c.close(); return; } c.on('open', () => { DUEL.T = wrapConn(c); duelBind(); duelStatus('對手來了！'); }); }); return; }
    if (kind === 'join') { DUEL.peer = await newPeer(); duelStatus(`連線到房號 ${code}……`); const c = await tryJoin(DUEL.peer, DUEL_ID + code, 8000); if (!c) throw new Error('找不到這個房號（房主可能已離開）'); DUEL.host = false; DUEL.code = code; DUEL.T = wrapConn(c); duelBind(); duelHello(); return; }
    // 隨機配對：先找有人在等的大廳位子；都沒有就自己佔一個位子等人
    DUEL.peer = await newPeer(); duelStatus('尋找對手……');
    for (let i = 1; i <= 6 && DUEL; i++) { const c = await tryJoin(DUEL.peer, DUEL_ID + 'lobby-' + DUEL.mode + '-' + i, 2500); if (c) { DUEL.host = false; DUEL.code = 'lobby'; DUEL.T = wrapConn(c); duelBind(); duelHello(); return; } }
    if (!DUEL) return; try { DUEL.peer.destroy(); } catch (e) { }
    for (let i = 1; i <= 6 && DUEL; i++) { try { DUEL.peer = await newPeer(DUEL_ID + 'lobby-' + DUEL.mode + '-' + i); break; } catch (e) { if (e.type !== 'unavailable-id') throw e; } }
    if (!DUEL || !DUEL.peer) throw new Error('大廳滿了，等一下再試'); DUEL.host = true; DUEL.code = 'lobby'; duelStatus('沒有人在等，你先在大廳等對手（最多 2 分鐘）……');
    DUEL.lobbyT = setTimeout(() => { if (DUEL && !DUEL.T) { duelQuit('等不到對手，下次再來。'); } }, 120000);
    DUEL.peer.on('connection', c => { if (DUEL.T) { c.close(); return; } c.on('open', () => { clearTimeout(DUEL.lobbyT); DUEL.T = wrapConn(c); duelBind(); duelStatus('對手來了！'); }); });
  }).catch(e => { duelQuit((e && e.message) || '連線失敗'); });
}
function duelBind() { const T = DUEL.T; T.onmsg = duelMsg; T.onclose = () => { if (DUEL) duelQuit(DUEL.phase === 'over' ? null : '對手離線了。'); }; DUEL.pingT = setInterval(() => DUEL && DUEL.T && DUEL.T.send({ t: 'ping', at: Date.now() }), 2000); DUEL.clockT = setInterval(duelClock, 250); }
function duelMe() { return { name: S.name, origin: S.origin, gender: S.gender, hair: S.hair || 0, hairCol: S.hairCol, clothCol: S.clothCol, main: S.main, realm: realmOf(power()), karma: S.karma, mature: !!S.ch2, v: VERSION }; }
function duelHello() { DUEL.T.send({ t: 'hello', me: duelMe(), mode: DUEL.mode }); }
function duelQuit(msg) { const D = DUEL; if (!D) return; DUEL = null; clearInterval(D.pingT); clearInterval(D.clockT); clearTimeout(D.lobbyT); clearTimeout(D.nextT); try { D.T && D.T.send({ t: 'bye' }); D.T && D.T.close(); } catch (e) { } try { D.peer && D.peer.destroy(); } catch (e) { }
  E = E.filter(e => !e.duel); const ob = document.getElementById('obj'); if (ob) ob.style.visibility = ''; if (D.back) { travelTo(D.back.x, D.back.y, true); P.hp = maxHp(); P.mp = maxMp(); music(curRegion()); } if (panel && panel.kind === 'duel') renderPanel(); if (msg) toast(msg, 'red'); }

/* ---------- 對局 ---------- */
function duelMsg(m) { const D = DUEL; if (!D) return;
  if (m.t === 'ping') { D.T.send({ t: 'pong', at: m.at }); return; } if (m.t === 'pong') { D.ping = Date.now() - m.at; return; }
  if (m.t === 'hello') { D.op = m.me; if (D.host) { D.T.send({ t: 'hello', me: duelMe(), mode: D.mode }); D.T.send({ t: 'go', mode: D.mode }); duelBegin(); } else { D.mode = m.mode; } return; }
  if (m.t === 'go') { D.mode = m.mode; duelBegin(); return; }
  if (m.t === 'st') { D.os = m; D.recv2 = m.r || 0; if (D.ent) { D.ent.tx = m.x; D.ent.ty = m.y; D.ent.face = m.f; } return; }
  if (m.t === 'hit') { duelTakeHit(m); return; }
  if (m.t === 'dmg') { D.dealt = (D.dealt || 0) + m.v; if (D.ent) { fxText(D.ent.x + rnd(-10, 10), D.ent.y - 70, String(m.v), CIN, 18); D.ent.flash = .15; } return; }
  if (m.t === 'miss') { if (D.ent) fxText(D.ent.x, D.ent.y - 50, '閃過', ATTR.柔.col, 14); return; }
  if (m.t === 'fx') { if (D.ent) { arcFx(D.ent.x, D.ent.y, m.a, m.k === 'skill' ? 2.2 : 1.3, m.k === 'skill' ? 120 : 80, m.k === 'skill' ? CIN : INK, m.k === 'skill' ? 10 : 6, .2); D.ent.atkT = .25; } return; }
  if (m.t === 'dead') { if (D.host) duelRoundEnd('host'); return; }
  if (m.t === 'round') { duelRoundStart(m.n); return; }
  if (m.t === 'result') { duelShowResult(m); return; }
}
function duelBegin() { const D = DUEL; if (D.phase !== 'connect') return; D.phase = 'ready'; D.wins = [0, 0]; D.back = { x: P.x, y: P.y }; D.n = 0; closePanel();
  banner('論劍', `${D.mode === 'bal' ? '平衡擂台' : '無限制擂台'}　對手：${D.op.name}（${ORIGINS[D.op.origin].n}・${D.op.realm}）`); music('boss');
  const R = duelRoom(); travelTo(R.x + R.w / 2, R.y + R.h / 2, true);
  const e = spawnEnemy('zp_hero', R.x + R.w / 2, R.y + 200, null, { elite: false, noJie: true }); e.duel = true; e.tag = 'duel'; e.def = Object.assign({}, e.def, { ai: 'none', n: D.op.name, res: {} }); e.hp = e.maxHp = 1e9; e.aggro = false; e.tx = e.x; e.ty = e.y; D.ent = e;
  if (D.host) D.nextT = setTimeout(() => duelHostRound(1), 1500); }
function duelHostRound(n) { const D = DUEL; if (!D) return; D.T.send({ t: 'round', n }); duelRoundStart(n); }
function duelRoundStart(n) { const D = DUEL; if (!D) return; const R = duelRoom(); D.n = n; D.phase = 'count'; D.t = 3; D.left = DUEL_ROUND; D.fightAt = Date.now() + 3000; D.endAt = D.fightAt + DUEL_ROUND * 1000;
  D.myMax = D.mode === 'bal' ? DUEL_BAL_HP : maxHp(); D.myHp = D.myMax; P.hp = maxHp(); P.mp = maxMp(); P.x = R.x + R.w / 2; P.y = R.y + R.h / 2 + (D.host ? 110 : -110); P.face = D.host ? -Math.PI / 2 : Math.PI / 2; P.cd = {};
  if (D.ent) { D.ent.x = D.ent.tx = R.x + R.w / 2; D.ent.y = D.ent.ty = R.y + R.h / 2 + (D.host ? -110 : 110); } D.os = null; banner(`第 ${n} 局`, `${D.wins[D.host ? 0 : 1]} : ${D.wins[D.host ? 1 : 0]}`); }
function duelRoundEnd(loser) { const D = DUEL; if (!D || !D.host || D.phase !== 'fight') return; D.phase = 'end';
  let w; if (loser === 'host') w = 'guest'; else if (loser === 'guest') w = 'host'; else { const a = D.myHp / D.myMax, b = D.os ? D.os.pct : 1; w = Math.abs(a - b) < .005 ? 'draw' : a > b ? 'host' : 'guest'; }
  if (w === 'host') D.wins[0]++; if (w === 'guest') D.wins[1]++; const over = D.wins[0] >= 2 || D.wins[1] >= 2 || D.n >= 5;
  const m = { t: 'result', w, wins: D.wins.slice(), over, n: D.n, why: loser ? 'ko' : 'time' }; D.T.send(m); duelShowResult(m); }
function duelShowResult(m) { const D = DUEL; if (!D) return; D.phase = 'end'; D.wins = m.wins; const meW = (m.w === 'host') === D.host && m.w !== 'draw', mine = D.wins[D.host ? 0 : 1], his = D.wins[D.host ? 1 : 0];
  closeupFx(m.w === 'draw' ? '平手' : meW ? '勝' : '敗'); toast(`第 ${m.n} 局${m.why === 'time' ? '（時間到，比剩餘氣血）' : ''}：${m.w === 'draw' ? '平手' : meW ? '你贏了' : '你輸了'}　${mine} : ${his}`, 'red');
  if (m.over) { D.phase = 'over'; const win = mine > his; S.duel = S.duel || { w: 0, l: 0 }; if (win) { S.duel.w++; addRep(S.karma >= 0 ? { righteous: 5 } : { blood: 5 }); } else S.duel.l++; saveGame();
    later(2.5, () => { say([{ who: 'narr', t: win ? `論劍${mine} : ${his}，你贏了${D.op.name}。${S.karma >= 0 ? '正派聯盟' : '血影教'}聲望 +5。` : `論劍${mine} : ${his}，${D.op.name}技高一籌。` }, { who: 'narr', t: `生涯戰績：${S.duel.w} 勝 ${S.duel.l} 敗` }], () => duelQuit(null)); }); return; }
  if (D.host) D.nextT = setTimeout(() => duelHostRound(D.n + 1), 3000); }
function duelClock() { const D = DUEL; if (!D || !(D.phase === 'count' || D.phase === 'fight')) return; const now = Date.now(); if (D.phase === 'count' && now >= D.fightAt) { D.phase = 'fight'; toast('開打！', 'red'); } D.t = Math.max(0, (D.fightAt - now) / 1000); D.left = Math.max(0, (D.endAt - now) / 1000); if (D.phase === 'fight' && D.host && now >= D.endAt) duelRoundEnd(null); }
function duelTakeHit(m) { const D = DUEL; if (!D) return; D.recv = (D.recv || 0) + 1; duelClock(); if (D.phase !== 'fight') { D.lateHit = D.phase; return; }
  if (P.dodgeT > 0 || P.iframe > 0 || P.invis > 0 || (D.mode === 'all' && Math.random() < dodgeRate())) { D.T.send({ t: 'miss' }); fxText(P.x, P.y - 44, '閃避', ATTR.柔.col, 15); return; }
  const dmg = Math.max(1, Math.round(D.mode === 'bal' ? m.d : m.d * (1 - damageReduce()) * (P.guard > 0 ? .5 : 1)));
  D.got = (D.got || 0) + 1; D.T.send({ t: 'dmg', v: dmg }); D.myHp = Math.max(0, D.myHp - dmg); P.hurt = .2; P.iframe = .18; fxText(P.x, P.y - 50, String(dmg), CIN, m.c ? 22 : 16); burst(P.x, P.y - 20, CIN, 4); doShake(m.c ? 5 : 2);
  if (m.a === '寒') P.slowT = Math.max(P.slowT || 0, .8); if (m.a === '毒' && typeof poisonPlayer === 'function') { const h = P.hp; try { poisonPlayer(2, 0); } catch (e) { } P.hp = h; }
  if (D.myHp <= 0) { if (D.host) duelRoundEnd('host'); else D.T.send({ t: 'dead' }); D.phase = 'end'; } }
function tickDuel(dt) { const D = DUEL; const ob = document.getElementById('obj'); if (ob) ob.style.visibility = D && D.phase !== 'connect' ? 'hidden' : ''; if (!D) return;
  if (D.ent) { const e = D.ent; e.x += (e.tx - e.x) * Math.min(1, dt * 12); e.y += (e.ty - e.y) * Math.min(1, dt * 12); e.hp = 1e9; e.atkT = Math.max(0, (e.atkT || 0) - dt); }
  duelClock();
  if (D.phase === 'fight' || D.phase === 'count') { P.hp = Math.max(1, maxHp() * D.myHp / D.myMax); if (D.phase === 'count') { P.dodgeT = 0; } }
  if (D.T && D.phase !== 'connect') { D.sendT = (D.sendT || 0) - dt; if (D.sendT <= 0) { D.sendT = .05; D.T.send({ t: 'st', x: Math.round(P.x), y: Math.round(P.y), f: +P.face.toFixed(2), p: P.dodgeT > 0 ? 'dodge' : (P.swingT > 0 || P.lock > 0) ? 'atk' : P.moving ? 'run' : 'idle', pct: D.myHp / (D.myMax || 1), r: D.got || 0 }); } }
  const R = duelRoom(); if (D.phase !== 'connect' && D.back && !(P.x > R.x - 60 && P.x < R.x + R.w + 60 && P.y > R.y - 60 && P.y < R.y + R.h + 60)) duelQuit('你離開了論劍台，算認輸。'); }

/* ---------- 掛鉤：打到對手 → 傳給對方判定；藥不能吃；死不了 ---------- */
const _hurtEnemyDuel = hurtEnemy; hurtEnemy = function (e, dmg, o) {
  if (!e || !e.duel) return _hurtEnemyDuel(e, dmg, o); const D = DUEL; duelClock(); if (!D || D.phase !== 'fight') return;
  const h0 = e.hp; _hurtEnemyDuel(e, dmg, o); let d = h0 - e.hp; e.hp = 1e9; e.dead = false; if (d <= 0) return;
  if (D.mode === 'bal') d = d * DUEL_BAL_DMG / Math.max(1, wDmg(S.main)); D.sent = (D.sent || 0) + 1; D.T.send({ t: 'hit', d: Math.max(1, Math.round(d)), a: o && o.attr || null, c: d > dmg * 1.3 }); };
const _potionDuel = potion; potion = function () { if (DUEL) return toast('論劍不能吃藥'); return _potionDuel(); };
const _playerDownDuel = playerDown; playerDown = function () { if (DUEL) { P.hp = 1; return; } return _playerDownDuel(); };
const _basicDuel = basicAttack; basicAttack = function () { const c = P.atkT; _basicDuel(); if (DUEL && DUEL.T && P.atkT !== c) DUEL.T.send({ t: 'fx', k: 'atk', a: +P.face.toFixed(2) }); };
const _useSkillDuel = useSkill; useSkill = function (k, a) { const c = P.cd[k]; _useSkillDuel(k, a); if (DUEL && DUEL.T && P.cd[k] !== c) DUEL.T.send({ t: 'fx', k: 'skill', a: +(a === undefined ? P.face : a).toFixed(2) }); };
const _startHomeDuel = startHome; startHome = function () { if (DUEL) return toast('論劍中不能回城'); return _startHomeDuel(); };
const _tickCh2Duel = tickCh2; tickCh2 = function (dt) { _tickCh2Duel(dt); tickDuel(dt); };
// 對手的樣子：用他的出身、性別、髮型畫主角圖
const _drawEnemyDuel = drawEnemy; drawEnemy = function (e) {
  if (!e.duel) return _drawEnemyDuel(e); const D = DUEL; if (!D || !D.op) return; const o = D.op, os = D.os || {}, fake = { origin: o.origin, gender: o.gender, hair: o.hair, hairCol: o.hairCol, clothCol: o.clothCol, main: o.main, ch2: o.mature };
  const L = lookOf(fake); L.weapon = o.main; const base0 = heroSpr(fake), hb = `${base0}_h${o.hair || 0}`, base = sprImg(`${hb}_idle`) ? hb : base0, pose = e.atkT > 0 ? 'atk' : os.p || 'idle', id = sprImg(`${base}_${pose}`) ? `${base}_${pose}` : sprImg(`${base0}_${pose}`) ? `${base0}_${pose}` : base0;
  drawHumanCtx(g, e.x, e.y, e.face, L, { spr: id, weaponOver: o.main !== ORIGIN_WPN[o.origin], t: gameT, moving: os.p === 'run', flash: e.flash, alpha: os.p === 'dodge' ? .55 : 1 });
  g.font = `13px ${FONT}`; g.textAlign = 'center'; g.fillStyle = CIN; g.fillText(o.name, e.x, e.y - 92); };
const _drawCh2ScreenDuel = drawCh2Screen; drawCh2Screen = function () { _drawCh2ScreenDuel(); const D = DUEL; if (!D || D.phase === 'connect' || !D.op) return;
  const bw = Math.min(300, W * .32), y = 150, bar = (x, pct, name, right) => { g.fillStyle = 'rgba(29,26,23,.6)'; g.fillRect(x - 2, y - 2, bw + 4, 14); g.fillStyle = CIN; const w = bw * clamp(pct, 0, 1); g.fillRect(right ? x + bw - w : x, y, w, 10); g.font = `14px ${FONT}`; g.textAlign = right ? 'right' : 'left'; g.fillStyle = INK; g.fillText(name, right ? x + bw : x, y - 6); };
  bar(W / 2 - bw - 40, D.myHp / (D.myMax || 1), `${S.name}　${D.wins[D.host ? 0 : 1]} 勝`, false); bar(W / 2 + 40, D.os ? D.os.pct : 1, `${D.wins[D.host ? 1 : 0]} 勝　${D.op.name}`, true);
  g.font = `bold 22px ${FONT}`; g.textAlign = 'center'; g.fillStyle = D.phase === 'count' ? CIN : INK; g.fillText(D.phase === 'count' ? String(Math.ceil(D.t)) : D.phase === 'fight' ? String(Math.max(0, Math.ceil(D.left))) : '—', W / 2, y + 10);
  g.font = `12px ${FONT}`; g.fillStyle = D.ping > 200 ? CIN : '#6a645a'; g.fillText(`${D.mode === 'bal' ? '平衡擂台' : '無限制擂台'}・延遲 ${D.ping || '—'} ms${D.ping > 200 ? '（延遲偏高）' : ''}`, W / 2, y + 30); g.fillStyle = '#8a8278'; g.fillText(`出手命中 ${D.sent || 0}・對方挨打 ${D.recv2 || 0}・你挨打 ${D.got || 0}/${D.recv || 0}`, W / 2, y + 46); };

/* ---------- 面板（從練武場進入） ---------- */
const _trainPanelDuel = PANELS.train; PANELS.train = d => (S.bld.train ? `<div class="sub">論劍（連線對戰）</div>` + item('即時 1 對 1 論劍', S.duel ? `${S.duel.w} 勝 ${S.duel.l} 敗` : '', '三局兩勝，每局 90 秒；不能吃藥。贏家在善惡值較近的陣營得少量聲望。', '', btn('x4:open', '前往論劍台')) : '') + _trainPanelDuel(d);
PANELS.duel = d => { const D = DUEL, online = duelOnline(); d.mode = d.mode || 'bal';
  let h = online ? '' : '<p class="note"><b>論劍要連上網路，只在 GitHub Pages 的版本開放。</b>Claude 網頁連結的版本不能連外，這裡只能看看規則。</p>';
  h += `<div class="sub">擂台</div><div class="btns">${btn('x4:mode:bal', '平衡擂台', d.mode === 'bal')}${btn('x4:mode:all', '無限制擂台', d.mode === 'all', 'ghost')}</div><p class="note">${d.mode === 'bal' ? '平衡擂台：雙方氣血拉到同一標準、傷害按兵器基準換算，只比秘笈搭配與操作。' : '無限制擂台：經脈、裝備、秘笈重數全部帶入，養得越強越吃香。'}</p>`;
  if (D) return h + `<p class="note">${esc(D.status || '')}</p><div class="btns">${btn('x4:cancel', '取消', false, 'ghost')}</div>`;
  h += `<div class="sub">開始</div>` + item('隨機配對', '', '找一個同樣在等的對手（同一種擂台）。', '', btn('x4:rand', '配對', !online))
    + item('開房間', '', '開一個四位數房號，把房號給朋友。', '', btn('x4:host', '開房', !online))
    + item('加入房間', '', `<input id="duel-code" inputmode="numeric" maxlength="4" placeholder="四位數房號" style="width:8em;font:inherit;padding:4px">`, '', btn('x4:join', '加入', !online));
  return h + `<p class="note">被打的一方判定自己有沒有中招；延遲超過 200 毫秒時畫面會提醒。戰績：${S.duel ? `${S.duel.w} 勝 ${S.duel.l} 敗` : '還沒論過劍'}。</p>`; };
function duelAct(x, y) {
  if (x === 'open') { openPanel('duel', null, { title: '論劍台', mode: 'bal' }); return; }
  if (x === 'mode') { if (panel && panel.data) panel.data.mode = y; if (DUEL && DUEL.phase === 'connect') DUEL.mode = y; return; }
  if (x === 'cancel') { duelQuit('已取消'); return; }
  if (x === 'host') duelStart('host'); if (x === 'rand') duelStart('rand');
  if (x === 'join') { const c = (document.getElementById('duel-code') || {}).value || ''; if (!/^\d{4}$/.test(c)) return toast('請輸入四位數房號'); duelStart('join', c); } }
