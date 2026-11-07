'use strict';
/* 一命江湖 — 介面與操作 */
const $ = id => document.getElementById(id);
const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
ENEMIES.dummy = { n: '木樁', hp: 999999, dmg: 0, spd: 0, r: 18, ai: 'none', xiu: 0, silver: [0, 0], drops: {}, look: 'dummy' };
let running = false, panel = null, dlg = null, modal = null, INTERACT = null, CIRCLES = [];
function PAUSED() { return !running || !!dlg || !!modal || !!panel && panel.pause || rotateBlock() || !!closeupPause(); }
function closeupPause() { return closeup && closeup.t < closeup.life; }
function rotateBlock() { return isTouch && innerHeight > innerWidth && running; }
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- 提示 ---------- */
function toast(t, kind) { const d = document.createElement('div'); d.className = 'toast ' + (kind || ''); d.textContent = t; const box = $('toasts'); box.appendChild(d); while (box.children.length > 4) box.firstChild.remove(); setTimeout(() => d.remove(), 2800); }
let bannerTO = 0;
function banner(t, s) { $('banner-t').textContent = t; $('banner-s').textContent = s || ''; $('banner').classList.add('on'); clearTimeout(bannerTO); bannerTO = setTimeout(() => $('banner').classList.remove('on'), 2200); }

/* ---------- 對話 ---------- */
function tone() { return S.karma >= 30 ? 'xia' : S.karma <= -30 ? 'mo' : 'zhong'; }
function lineText(l) { let t = typeof l.t === 'string' ? l.t : l.t[tone()]; return t.replace(/\{name\}/g, S.name); }
function whoName(w) { if (w === 'me') return S.name; if (w === 'narr') return '旁白'; if (w === 'choice') return '抉擇'; return NPCS[w] ? NPCS[w].n : w; }
const LOG = []; let autoT = 0;
function say(lines, done, quick) {
  if (!Array.isArray(lines)) lines = [lines];
  if (quick) { toast(`${whoName(lines[0].who)}：${lineText(lines[0])}`); if (done) done(); return; }
  if (dlg) { const prev = dlg; prev.queue = (prev.queue || []).concat([{ lines, done }]); return; }
  dlg = { lines, i: 0, done }; renderDlg();
}
function renderDlg() {
  const l = dlg.lines[dlg.i]; const el = $('dlg'); el.hidden = false;
  $('dlg-who').textContent = whoName(l.who); const txt = lineText(l); $('dlg-text').textContent = txt;
  LOG.push(`${whoName(l.who)}：${txt}`); if (LOG.length > 80) LOG.shift(); if (NPCS[l.who] && S && S.codex) { if (!S.codex.people) S.codex.people = {}; S.codex.people[l.who] = 1; }
  drawPortraitTo($('dlg-face'), l.who); $('dlg-face').hidden = l.who === 'narr' || l.who === 'choice';
  const ch = $('dlg-ch'); ch.innerHTML = ''; $('dlg-hint').hidden = !!l.choices;
  if (l.choices) l.choices.forEach(c => { const b = document.createElement('button'); b.textContent = c.label; if (c.alt) b.className = 'alt'; b.disabled = !!c.disabled; b.addEventListener('click', ev => { ev.stopPropagation(); if (c.disabled) return; sfx('seal'); closeDlg(); c.fn && c.fn(); }); ch.appendChild(b); });
  autoT = SET.autoSpeed ? 1.2 + txt.length * [0, .09, .06, .035][SET.autoSpeed] : 0;
}
function closeDlg() { const d = dlg; dlg = null; $('dlg').hidden = true; if (d && d.queue && d.queue.length) { const n = d.queue.shift(); dlg = { lines: n.lines, i: 0, done: n.done, queue: d.queue }; renderDlg(); } }
function advanceDlg() { if (!dlg) return; const l = dlg.lines[dlg.i]; if (l.choices) return; dlg.i++; if (dlg.i >= dlg.lines.length) { const d = dlg.done; closeDlg(); d && d(); } else renderDlg(); }
function skipDlg() { if (!dlg) return; while (dlg && dlg.i < dlg.lines.length - 1 && !dlg.lines[dlg.i].choices) dlg.i++; renderDlg(); }

/* ---------- 確認視窗 ---------- */
function confirmBox(text, yes, no, yesLabel, noLabel) { modal = { yes, no }; $('modal-text').textContent = text; $('modal-yes').textContent = yesLabel || '確定'; $('modal-no').textContent = noLabel || '取消'; $('modal').hidden = false; }
function closeModal(ok) { const m = modal; modal = null; $('modal').hidden = true; if (m) (ok ? m.yes : m.no) && (ok ? m.yes : m.no)(); }

/* ---------- 面板 ---------- */
function openPanel(kind, tab, data) { panel = { kind, tab, data, pause: !(running && inCombat()) }; renderPanel(); $('panel').hidden = false; sfx('click'); }
function closePanel() { panel = null; $('panel').hidden = true; }
function item(h3, lv, p, cost, btn) { return `<div class="item"><div class="it-main"><h3>${h3}${lv ? `<span class="lv">${lv}</span>` : ''}</h3>${p ? `<p>${p}</p>` : ''}${cost ? `<p class="cost">${cost}</p>` : ''}</div>${btn || ''}</div>`; }
function btn(act, label, dis, cls) { return `<button class="seal ${cls || ''}" data-act="${act}" ${dis ? 'disabled' : ''}>${label}</button>`; }
function resLine(keys) { return `<div class="note res-line">${(keys || ['silver', 'wood', 'iron', 'herb', 'page', 'xiu', 'fur', 'bone', 'cloth', 'bamboo', 'shaji', 'xuelian']).map(k => `${RES[k].n} <b>${Math.floor(S.res[k]).toLocaleString()}</b>`).join('　')}</div>`; }
function bookTag(id) { const b = getBook(id); return `<span class="attrs">${b.attrs.map(a => `<i class="at at-${a}">${a}</i>`).join('')}${b.align ? `<i class="al">${b.align}</i>` : ''}</span>`; }
const TABS = {
  char: { t: () => S.name, tabs: [['mer', '經脈'], ['wu', '武功'], ['gear', '裝備'], ['jh', '江湖'], ['bond', '知己'], ['codex', '圖鑑'], ['story', '劇情']] },
  base: { t: () => '青崖小築', tabs: [['bld', '建設'], ['forge', '鍛造'], ['lib', '藏經閣'], ['herbal', '藥廬'], ['alchemy', '煉丹房'], ['disc', '弟子'], ['vault', '藏寶閣'], ['pet', '夥伴']] },
  settings: { t: () => '設定', tabs: [['gen', '一般'], ['keys', '按鍵'], ['save', '存檔'], ['about', '關於']] },
};
function renderPanel() {
  if (!panel) return; const T = TABS[panel.kind];
  $('p-title').textContent = T ? T.t() : panel.data && panel.data.title || '';
  if (T && !panel.tab) panel.tab = T.tabs[0][0];
  $('p-tabs').innerHTML = T ? T.tabs.map(([k, n]) => `<button data-act="tab:${k}" class="${panel.tab === k ? 'on' : ''}">${n}</button>`).join('') : '';
  let h = ''; try { h = (PANELS[panel.kind + '.' + (panel.tab || '')] || PANELS[panel.kind])(panel.data) || ''; } catch (e) { h = `<p class="note">面板發生錯誤：${esc(e.message)}</p>`; console.error(e); }
  $('p-body').innerHTML = h;
}
const PANELS = {
  'char.mer': () => resLine(['xiu', 'herb', 'silver']) + MERIDIANS.map(m => { const n = S.mer[m.k] + 1, c = merCost(n), cc = {}; for (const k in c) if (c[k]) cc[k] = c[k]; return item(m.n, `第 ${S.mer[m.k]} 重`, '每重：' + m.d, costStr(cc), btn('mer:' + m.k, '打通', !canPay(cc))); }).join('') + `<p class="note">經脈沒有上限，重數越高需要的材料越多。</p>`,
  'char.wu': () => {
    let h = `<div class="sub">兵器（主：${WEAPONS[S.main].name}　副：${WEAPONS[S.sub].name}）</div>`;
    h += WORDER.map(w => { const x = S.wpn[w]; const ids = Object.keys(S.books).filter(id => { const b = getBook(id); return b.cat === 'weapon' && b.w === w; });
      const sel = i => `<select data-act="slot:${w}:${i}" ${x.lv < (i ? 5 : 2) ? 'disabled' : ''}><option value="">${x.lv < (i ? 5 : 2) ? `熟練 ${i ? 5 : 2} 級開啟` : '（空）'}</option>${ids.map(id => `<option value="${id}" ${S.slots[w][i] === id ? 'selected' : ''}>${getBook(id).n} ${bookLv(id)}重</option>`).join('')}</select>`;
      return `<div class="item col"><h3>${WEAPONS[w].name}<span class="lv" style="color:${TIER_COL[x.tier - 1]}">${TIERS[x.tier - 1]}・熟練 ${x.lv}</span></h3><div class="row">招式一 ${sel(0)}　招式二 ${sel(1)}</div><div class="row">${btn('main:' + w, S.main === w ? '主兵器' : '設為主', S.main === w)}${btn('sub:' + w, S.sub === w ? '副兵器' : '設為副', S.sub === w || S.main === w)}</div></div>`; }).join('');
    h += `<div class="sub">內功・氣功・輕功</div>`;
    for (const cat of ['inner', 'qi', 'qing']) { const ids = Object.keys(S.books).filter(id => getBook(id).cat === cat);
      h += `<div class="item col"><h3>${CAT_NAME[cat]}${cat === 'qing' ? `<span class="lv">閃避率 ${Math.round(dodgeRate() * 100)}%</span>` : cat === 'inner' ? '<span class="lv">效果永久；裝備中的才會因擊殺修練</span>' : ''}</h3><select data-act="slot:${cat}"><option value="">（空）</option>${ids.map(id => `<option value="${id}" ${S.slots[cat] === id ? 'selected' : ''}>${getBook(id).n} ${bookLv(id)}重</option>`).join('')}</select></div>`; }
    const al = equippedAligns(); if (al.has('正') && al.has('邪')) h += `<p class="note warn">同時帶著正派與邪派秘笈：戰鬥中每分鐘 3% 機率走火入魔。</p>`;
    h += `<div class="sub">已學秘笈</div>` + Object.keys(S.books).map(id => { const b = getBook(id), s = S.books[id]; return item(`${b.n}${bookTag(id)}`, `${CAT_NAME[b.cat]}・${['', '初階', '高階', '絕世'][b.tier]}・第 ${s.lv} 重`, `${s.lv < 10 ? artProgTxt(id) : '已達第十重，可合成'}${b.cross ? `　跨類加成：${CAT_NAME[b.cross]}` : ''}`); }).join('');
    return h + `<p class="note">配招隨時隨地都能換，但戰鬥中不會暫停。</p>`;
  },
  'char.gear': () => {
    const sets = GS.sets; let h = `<div class="sub">穿戴中</div>` + SLOTS.map(sl => { const it = S.gear[sl]; return item(`${SLOT_N[sl]}：${it ? `<span style="color:${TIER_COL[it.tier - 1]}">${esc(it.name)}</span>` : '（空）'}`, it ? TIERS[it.tier - 1] : '', it ? itemDesc(it) : '', '', it ? btn('unequip:' + sl, '卸下') : ''); }).join('');
    const sk = Object.keys(sets); if (sk.length) h += `<p class="note">${sk.map(k => `${SETS[k].n} ${sets[k]} 件：${[2, 4, 6].filter(n => sets[k] >= n).map(n => SETS[k]['b' + n]).join('、') || '未達 2 件'}`).join('<br>')}</p>`;
    h += `<div class="sub">背包 ${S.bag.length}/${S.bagCap}　金創藥 ${S.potions}/${POT_MAX[S.bld.herbal]}${S.xuming ? `　續命丹 ${S.xuming}` : ''}</div>`;
    h += S.bag.map((it, i) => item(`<span style="color:${TIER_COL[it.tier - 1]}">${esc(it.name)}</span>`, `${SLOT_N[it.slot === 'acc' ? 'acc1' : it.slot]}・${TIERS[it.tier - 1]}`, itemDesc(it), '', btn('equip:' + it.uid, '穿上'))).join('') || '<p class="note">背包是空的。</p>';
    return h;
  },
  'char.jh': () => {
    const k = S.karma; let h = `<dl class="kv"><dt>境界</dt><dd>${realmOf(power())}（戰力 ${power()}）</dd><dt>善惡值</dt><dd>${k}　${k >= 30 ? '俠義（可施展浩然正氣）' : k <= -30 ? '魔性（可施展血煞魔功）' : '未明'}</dd><dt>血影令</dt><dd>${S.tokens}/3</dd><dt>擊敗</dt><dd>${S.stats.kills}</dd><dt>最高連擊</dt><dd>${S.stats.bestCombo}</dd><dt>遊玩</dt><dd>${Math.round(S.stats.play / 60)} 分鐘</dd><dt>代數</dt><dd>第 ${S.gen} 代</dd></dl>`;
    h += `<div class="sub">勢力聲望</div><dl class="kv">${[['village', '落霞村民'], ['righteous', '正派聯盟'], ['blood', '血影教'], ['merchants', '絲路商幫（崇敬：行商八折）']].concat(S.ch2 ? [['wudu', '苗疆五毒寨（崇敬：五毒心法不需善惡值）'], ['fishers', '東海漁幫（友好：阿海來投）']] : []).map(([k, n]) => `<dt>${n}</dt><dd>${S.rep[k]}（${repTier(S.rep[k])}）</dd>`).join('')}</dl>`;
    if (S.ch2) { const C = S.clue || { meng: 0, xian: 0, shi: 0 }; h += `<div class="sub">線索（第二章最終頭目由此決定）</div><dl class="kv"><dt>盟主線</dt><dd>${'●'.repeat(C.meng) || '—'}</dd><dt>仙人線</dt><dd>${'●'.repeat(C.xian) || '—'}</dd><dt>師父線</dt><dd>${'●'.repeat(C.shi) || '—'}</dd></dl>`;
      const R = S.rescue || {}, RN = { saved: '救下了', saved_liu: '救下了柳無痕', lost: '沒趕上', ignored: '沒有去救', none: '無人可救' }; h += `<dl class="kv"><dt>◎昔日的對手</dt><dd>${RN[R.rival] || '未發生'}</dd><dt>◎落霞村遇襲</dt><dd>${RN[R.village] || '未發生'}</dd></dl>`; }
    const titles = ACHIEVEMENTS.filter(a => a.title && S.ach[a.id]);
    h += `<div class="sub">稱號</div><select data-act="title"><option value="">（不配戴）</option>${titles.map(a => `<option ${S.title === a.title ? 'selected' : ''}>${a.title}</option>`).join('')}</select>`;
    h += `<div class="sub">成就 ${ACHIEVEMENTS.filter(a => S.ach[a.id]).length}/${ACHIEVEMENTS.length}</div>` + Object.keys(ACH_CAT).map(c => `<p class="note"><b>${ACH_CAT[c]}</b></p>` + ACHIEVEMENTS.filter(a => a.cat === c).map(a => item(`${S.ach[a.id] ? '✓ ' : ''}${a.n}`, a.title ? `稱號：${a.title}` : '', a.d)).join('')).join('');
    return h;
  },
  'char.codex': () => { const C = codexBooks(S); let h = `<p class="note">江湖圖鑑・第一章 ${codexPct(S)}%　每冊完成 50% 與 100% 時給殘頁。</p>`;
    h += `<div class="btns">${Object.keys(C).map(k => btn('cdx:' + k, `${C[k].n} ${C[k].pct}%`, false, (panel.cdx || 'mon') === k ? '' : 'ghost')).join('')}</div>`;
    const k = panel.cdx || 'mon';
    if (k === 'mon') { h += `<div class="sub">一般怪物</div>` + codexLists(S).mon.map(k => { const n = S.codex.mon[k] || 0, d = ENEMIES[k]; return item(n ? d.n : '？？？', n ? `擊敗 ${n}・${REGIONS[d.region || (['bandit', 'wolf', 'archer', 'hive', 'bee'].includes(k) ? 'village' : 'bamboo')].short}` : '', n ? `${d.res ? '抗性：' + Object.keys(d.res).map(a => `${a} −${d.res[a] * 100}%`).join('、') : '無抗性'}` : '尚未遇見'); }).join('');
      h += `<div class="sub">具名精英</div>` + codexLists(S).named.map(k => item((S.namedDead[k] ? portThumb(k) : '') + (S.namedDead[k] ? NAMED[k].n : '？？？'), '', S.namedDead[k] ? NAMED[k].story : '尚未擊敗')).join('');
      h += `<div class="sub">頭目</div>` + codexLists(S).boss.map(k => item(S.bossDead[k] ? BOSS[k].n : '？？？', S.bossDead[k] ? REGIONS[BOSS[k].region].short : '', S.bossDead[k] ? `絕招：${BOSS[k].ult}` : '尚未擊敗')).join(''); }
    const LL = codexLists(S);
    if (k === 'book') h += LL.books.map(id => S.books[id] ? item(BOOKS[id].n + bookTag(id), CAT_NAME[BOOKS[id].cat], BOOKS[id].src) : item('？？？', CAT_NAME[BOOKS[id].cat], '取得線索：' + BOOKS[id].src)).join('');
    if (k === 'gear') h += codexLists(S).gear.map(u => S.codex.gear[u] ? item(UNIQUE_GEAR[u].n, SLOT_N[UNIQUE_GEAR[u].slot === 'acc' ? 'acc1' : UNIQUE_GEAR[u].slot], UNIQUE_GEAR[u].d) : item('？？？', '', '頭目或具名精英專屬')).join('') + `<div class="sub">套裝</div>` + codexLists(S).sets.map(k2 => item(SETS[k2].n, `${REGIONS[SETS[k2].region].short}・已見 ${SLOTS_SET.filter(sl => S.codex.gear['set:' + k2 + ':' + sl]).length}/5 部位`, `2 件：${SETS[k2].b2}　4 件：${SETS[k2].b4}　6 件：${SETS[k2].b6}`)).join('');
    if (k === 'rumor') h += LL.rumors.map(id => S.rumors[id] ? item(RUMORS[id].t, regionName(RUMORS[id].region), RUMORS[id].body) : item('？？？', regionName(RUMORS[id].region), '尚未發現')).join('');
    if (k === 'people') h += LL.people.map(id => S.codex.people[id] ? item(portThumb(id) + NPCS[id].n, '', PEOPLE_BIO[id] || '') : item('？？？', '', '尚未結識')).join('');
    return h;
  },
  'char.story': () => { let h = `<div class="sub">劇情回顧</div>` + QTRACKS.flatMap(r => TRACK_NODES[r].slice(0, trk(r).n)).map(n => `<details class="recap"><summary>${n.t}</summary>${(n.lines || []).concat(n.done || []).map(l => `<p>${esc(whoName(l.who))}：${esc(lineText(l))}</p>`).join('') || '<p class="note">（這一節沒有對白）</p>'}</details>`).join('');
    h += `<div class="sub">對白紀錄</div><div class="log">${LOG.slice(-40).map(l => `<p>${esc(l)}</p>`).join('') || '<p class="note">還沒有對白。</p>'}</div>`; return h; },
  'base.bld': () => resLine() + BORDER.map(k => { const l = S.bld[k], c = bldCost(k), r = bldBroken(k) ? '受損中，先修理' : bldBlock(k); if (bldBroken(k)) return item(BUILDINGS[k].n + '（受損）', `${l} 級`, '守山戰時被攻破，修好之前不能擴建，也不能使用。', costStr(repairCost(k)), btn('repair:' + k, '修理', !canPay(repairCost(k)))); return item(BUILDINGS[k].n, l ? `${l} 級` : '荒廢', bldDesc(k), c ? costStr(c) + (r && r !== 'lack' ? `　<span class="lack">${r}</span>` : '') : '已達最高級', btn('bld:' + k, l ? '擴建' : '修建', !!r)); }).join(''),
  'base.forge': () => {
    let h = resLine(['silver', 'iron', 'fur', 'bone', 'cloth', 'meteor', 'frost']); if (!S.bld.smith) h += '<p class="note">鐵匠鋪還沒修建。</p>';
    const rateTxt = t => { const u = UPGRADE[t]; return u ? `成功率 ${Math.round(Math.min(1, u.rate + (S.bld.smith >= 5 ? .1 : 0)) * 100)}%${u.drop ? `，失敗 ${u.drop * 100}% 掉階` : ''}` : ''; };
    h += `<div class="sub">兵器</div>` + WORDER.map(w => { const x = S.wpn[w], c = upgradeCost(x.tier, false), r = upgradeBlock(x.tier, false); return item(WEAPONS[w].name, `<span style="color:${TIER_COL[x.tier - 1]}">${TIERS[x.tier - 1]}</span>`, c ? `升為「${TIERS[x.tier]}」：傷害 +25%。${rateTxt(x.tier)}` : '已是神兵', c ? costStr(c) + (r && r !== 'lack' ? `　<span class="lack">${r}</span>` : '') : '', btn('upw:' + w, '升階', !!r)); }).join('');
    const all = SLOTS.map(s => S.gear[s]).filter(Boolean).concat(S.bag);
    h += `<div class="sub">防具與飾品</div>` + (all.map(it => { const mat = GEAR_BASE[it.slot].mat, c = upgradeCost(it.tier, true, mat), r = upgradeBlock(it.tier, true, mat); const worn = SLOTS.some(s => S.gear[s] === it);
      return item(`<span style="color:${TIER_COL[it.tier - 1]}">${esc(it.name)}</span>${worn ? '（穿戴中）' : ''}`, TIERS[it.tier - 1], (c ? rateTxt(it.tier) + '　' : '') + itemDesc(it), c ? costStr(c) + (r && r !== 'lack' ? `　<span class="lack">${r}</span>` : '') : '', `<div class="btns">${btn('upi:' + it.uid, '升階', !!r)}${!worn ? btn('dis:' + it.uid, '拆解', !!dismantleBlock(it), 'ghost') : ''}</div>${!worn && dismantleBlock(it) && S.bld.smith ? `<span class="lack">${dismantleBlock(it)}</span>` : ''}`); }).join('') || '<p class="note">沒有裝備。</p>');
    return h + (S.huqi ? '<p class="note">護器丹生效中：下一次失敗不掉階。</p>' : '');
  },
  'base.lib': () => {
    let h = resLine(['page', 'silver']) + `<p class="note">藏經閣 ${S.bld.lib} 級：武學最高練到第 ${LIB_CAP[S.bld.lib]} 重。<br>所有武學修練圓滿後，都要回藏經閣花殘頁與銀兩突破。<br>兵器招式：實戰命中累積修練。<br>內功心法：學會即永久生效；裝備中的心法才會因擊殺累積修練。<br>氣功：主動技，一次耗掉內力上限的一半以上（初階 50%、高階 60%、絕世 70%；絕學要內力全滿），靠施展次數累積修練（需求倍數成長）。<br>輕功：裝備中靠奔跑路程累積修練；加移動速度與閃避率（上限 65%）。<br>內力耗盡會「氣虛」：攻擊 −30%、受傷 +30%、移動 −25%，內力回到三成才解除。</p>`;
    const cats = ['weapon', 'inner', 'qi', 'qing'];
    for (const c of cats) { const ids = Object.keys(S.books).filter(id => getBook(id).cat === c); if (!ids.length) continue; h += `<div class="sub">${CAT_NAME[c]}</div>`;
      h += ids.map(id => { const b = getBook(id), s = S.books[id];
        const eff = `<b>現在：</b>${artEffect(id)}${s.lv < 10 ? `<br><b>下一重：</b>${artEffect(id, s.lv + 1)}` : ''}`;
        const r = breakBlock(id); return item(b.n + bookTag(id) + (c === 'inner' && S.slots.inner === id ? '（裝備中）' : ''), `第 ${s.lv} 重`, eff + (s.lv < 10 ? `<br>${artProgTxt(id)}` : ''), s.lv < 10 ? costStr(breakCost(id)) + (r && r !== 'lack' ? `　<span class="lack">${r}</span>` : '') : '', btn('brk:' + id, '突破', !!r)); }).join(''); }
    { const un = CH1_BOOKS.filter(id => !S.books[id]); if (un.length) h += `<div class="sub">尚未習得（第一重功效）</div>` + un.map(id => { const b = BOOKS[id]; return item(b.n, CAT_NAME[b.cat], artEffectRaw(id), '線索：' + b.src, ''); }).join(''); }
    const F = panel.fuse || (panel.fuse = { a: '', b: '', cat: '', tie: '' }); const tens = Object.keys(S.books).filter(id => S.books[id].lv >= 10);
    h += `<div class="sub">合成</div><p class="note">任兩本第十重、同階的秘笈可以合成（可跨類別）。原秘笈保留但退回第一重，新武功從第一重練起；有機率走火入魔。</p>`;
    const opt = v => `<option value="">（選擇）</option>` + tens.map(id => `<option value="${id}" ${v === id ? 'selected' : ''}>${getBook(id).n}</option>`).join('');
    h += `<div class="row">秘笈甲 <select data-act="fa">${opt(F.a)}</select>　秘笈乙 <select data-act="fb">${opt(F.b)}</select></div>`;
    if (F.a && F.b && F.a !== F.b) { const A = getBook(F.a), B = getBook(F.b); const cats = [...new Set([A.cat, B.cat])]; if (!cats.includes(F.cat)) F.cat = cats[0];
      if (cats.length > 1) h += `<div class="row">結果類別 <select data-act="fcat">${cats.map(c => `<option value="${c}" ${F.cat === c ? 'selected' : ''}>${CAT_NAME[c]}</option>`).join('')}</select></div>`;
      const block = fusionBlock(F.a, F.b); if (block && block !== 'lack') h += `<p class="note warn">${block}</p>`; else { const res = fusionResult(F.a, F.b, F.cat, F.tie);
        if (res.tops && res.tops.length > 1) h += `<div class="row">主屬性平手，選一個 <select data-act="ftie">${res.tops.map(a => `<option ${F.tie === a ? 'selected' : ''}>${a}</option>`).join('')}</select></div>`;
        h += item(`→ ${res.n}`, `${CAT_NAME[res.cat]}・${res.tier === 2 ? '高階' : '絕世'}`, `屬性：${res.attrs.join('')}${res.cross ? `　跨類加成：${CAT_NAME[res.cross]}` : ''}`, `${costStr(fusionCost(F.a))}　走火入魔機率 <b class="lack">${Math.round(fusionChance(F.a, F.b) * 100)}%</b>`, btn(panel.confirmFuse ? 'fuse2' : 'fuse', panel.confirmFuse ? '再按一次確認' : '合成', !!block, panel.confirmFuse ? 'red' : '')); } }
    else if (tens.length < 2) h += '<p class="note">目前沒有兩本第十重的秘笈。</p>';
    return h;
  },
  'base.herbal': () => { const l = S.bld.herbal; if (!l) return '<p class="note">藥廬還沒修建。</p>'; const mx = POT_MAX[l]; let h = resLine(['herb']) + item('金創藥', `${S.potions}/${mx}`, `回復 ${Math.round(potHealPct() * 100)}% 氣血。`, costStr({ herb: 3 }), `<div class="btns">${btn('brew', '煉製', S.res.herb < 3 || S.potions >= mx)}${btn('brewall', '煉滿', S.res.herb < 3 || S.potions >= mx, 'ghost')}</div>`);
    if (S.zouhuo > 0) h += item('解除走火入魔', '', `剩 ${Math.ceil(S.zouhuo)} 秒`, costStr({ herb: 10 }), btn('cure', '服藥', S.res.herb < 10));
    const hurt = Object.keys(S.disciples).filter(id => S.disciples[id].state === 'hurt'); h += hurt.map(id => item(`醫治 ${DISCIPLES[id].n}`, '', '受傷休養中', costStr({ herb: 5 }), btn('heal:' + id, '醫治', S.res.herb < 5))).join(''); return h; },
  'base.alchemy': () => { const l = S.bld.alchemy; if (!l) return '<p class="note">煉丹房還沒修建。</p>'; let h = resLine(['herb', 'bone', 'bamboo', 'meteor', 'frost']);
    h += Object.keys(PILLS).map(k => { const p = PILLS[k]; const ok = l >= p.lv && canPay(p.need); return item(p.n, `持有 ${k === 'xuming' ? S.xuming : S.pills[k] || 0}`, p.d + (l < p.lv ? `（需煉丹房 ${p.lv} 級）` : ''), costStr(p.need), `<div class="btns">${btn('pill:' + k, '煉製', !ok)}${k !== 'xuming' ? btn('use:' + k, '服用', !(S.pills[k] > 0), 'ghost') : ''}</div>`); }).join('');
    return h + '<p class="note">第一章其他區域（1b）會開放沙棘、雪蓮與稀有礦材。</p>'; },
  'base.disc': () => { let h = `<p class="note">門派大殿 ${S.bld.hall} 級：最多 ${DISC_CAP[S.bld.hall]} 名弟子（目前 ${discCount()}）。在家每分鐘產出專長資源，也可派到各區帶回材料。</p>`;
    const ids = Object.keys(S.disciples); if (!ids.length) h += '<p class="note">還沒有人想拜入青崖派。完成落霞村「村民的請託」後會有人來。</p>';
    h += ids.map(id => { const d = S.disciples[id], def = DISCIPLES[id];
      if (d.state === 'cand') return item(def.n, SPEC_N[def.spec], def.story, '', btn('rec:' + id, '收徒'));
      const st = d.state === 'home' ? '在家' : d.state === 'out' ? `出門中（${Math.max(0, Math.ceil((d.until - Date.now()) / 60000))} 分鐘後回來）` : '受傷休養';
      const regs = openRegions();
      return item(def.n, `${SPEC_N[def.spec]}・${st}`, def.story, '', d.state === 'home' ? `<div class="btns">${regs.map(r => [10, 20, 30].map(m => btn(`go:${id}:${r}:${m}`, `${REGIONS[r].short} ${m} 分`, false, 'ghost')).join('')).join('')}</div>` : ''); }).join(''); return h; },
  'base.vault': () => { const l = S.bld.vault; if (!l) return '<p class="note">藏寶閣還沒修建。</p>'; let h = `<p class="note">每擺一件頭目或精英專屬裝備，全域傷害 +1%（最多 ${l * 2} 件）。</p>`;
    h += S.vaultItems.map(it => item(esc(it.name), '陳列中', itemDesc(it), '', btn('vout:' + it.uid, '取回', false, 'ghost'))).join('');
    h += S.bag.filter(it => it.unique).map(it => item(esc(it.name), '背包', itemDesc(it), '', btn('vin:' + it.uid, '陳列', S.vaultItems.length >= l * 2))).join(''); return h; },
  'base.pet': () => { let h = '<p class="note">小夥伴不參戰，跟在身邊幫忙撿東西。</p>'; const d = { dog: '撿東西最勤快：採集時 30% 機率多一份', myna: '精英怪出現在附近時會學舌提醒', fox: '夜晚視野變大' };
    h += S.pets.map(p => item(`${portThumb(p)}${petName(p)}`, S.pet === p ? '同行中' : '', d[p], '', btn('pet:' + p, S.pet === p ? '同行中' : '帶上', S.pet === p))).join('') || '<p class="note">還沒有小夥伴。傳聞說村口的黃狗誰餵三次就跟誰走。</p>'; return h; },
  train: () => { let h = ''; const l = S.bld.train; if (!l) return '<p class="note">練武場還沒修建。到青崖小築「建設」修好它。</p>';
    h += `<div class="sub">掛機修練（每秒 +${TRAIN_RATE[l]} 熟練）</div>` + WORDER.map(w => item(WEAPONS[w].name, `熟練 ${S.wpn[w].lv}`, '', '', btn('tw:' + w, S.trainW === w ? '修練中' : '指定', S.trainW === w))).join('');
    h += `<div class="sub">頭目木人</div>` + Object.keys(BOSS).map(k => item(`演武・${BOSS[k].short}`, '', S.bossDead[k] ? '練習閃招，死了不刪檔，也沒有獎勵' : `擊敗${BOSS[k].short}後開放`, '', btn('practice:' + k, '開始', !S.bossDead[k]))).join('');
    h += item('新手教學', '', '跟著師父重新練一次基本功', '', btn('tut', '開始', false, 'ghost')); return h; },
  station: d => { let h = `<div class="sub">快速傳送</div>` + REGION_ORDER.map(k => { const p = PLACES['station_' + k]; const known = S.stations[k]; return item(p.n, known ? regionName(k) : '', known ? '' : '尚未發現', '', btn('travel:' + k, d.here === k ? '所在地' : '前往', !known || d.here === k)); }).join('');
    return h + commHtml(); },
  board: () => commHtml(),
  'char.bond': () => { const C = bondCands(); if (!S.ch2) return '<p class="note">第二章才會遇見候選知己。</p>'; if (!C.length) return `<p class="note">${S.gender === 'm' ? '苗疆隱谷的毒仙、東海失散的師姐……江湖路上，總會遇見放不下的人。' : '東海失散的師兄、竹林裡那個被你饒過的刺客……江湖路上，總會遇見放不下的人。'}</p>`;
    return `<p class="note">對話選擇、送禮、同行都會累積好感；每位 10 段故事。第 6 段是表白，結為知己後不能更換；第 10 段學會合擊秘笈。${S.zhiji ? `<br>知己：<b>${BONDS[S.zhiji].n}</b>${S.zhijiDead ? '（已故）' : ''}` : ''}</p>` + C.map(k => { const B = BONDS[k], p = bondPts(k), i = bondEvIdx(k); S.bondGift = S.bondGift || {}; const gifted = S.bondGift[k] === dayKey();
      return `<div class="item col"><h3>${portThumb(k) + B.n}<span class="lv">好感 ${p}</span></h3><div class="row">故事 ${i}/10　${i >= 10 ? '十段故事都走完了' : S.zhiji && S.zhiji !== k && i >= 5 ? '已與他人結為知己' : p >= BOND_NEED[i] ? '有新的故事，去找' + B.n + '說話' : `好感 ${BOND_NEED[i]} 開下一段`}　喜歡：${B.likes.map(r => RES[r].n).join('、')}</div>
        <div class="btns">${B.likes.concat(['silver']).filter((r, j, a) => a.indexOf(r) === j).map(r => btn(`gift:${k}:${r}`, `送${RES[r].n}`, gifted, 'ghost')).join('')}${btn('comp:' + k, S.companion === k ? '結束同行' : '同行', false)}</div></div>`; }).join(''); },
  wuyi: () => resLine(['silver']) + item('金蠶蠱針' + bookTag('jincan'), '兵器招式・暗器・毒', '蠱蟲鑽入敵人；敵人死後，蠱跳到下一個。', costStr({ silver: 600 }), btn('learn:jincan:600', S.books.jincan ? '已學會' : '學', !!S.books.jincan || S.res.silver < 600))
    + item('五毒心法' + bookTag('wudu_heart'), '內功心法・毒', S.karma <= -30 || S.rep.wudu >= 60 ? '白婆願意教你：毒傷隨重數提升。' : '白婆只教心夠狠的人（善惡值 ≤ −30），或五毒寨崇敬的朋友。', '', btn('learn:wudu_heart:0', S.books.wudu_heart ? '已學會' : '求教', !!S.books.wudu_heart || !(S.karma <= -30 || S.rep.wudu >= 60))),
  laochuanfu: () => resLine(['silver']) + item('浪裡蛟' + bookTag('langlijiao'), '輕功身法・柔', '閃身距離加長，可以踏過江面、海面與毒沼。', costStr({ silver: 600 }), btn('learn:langlijiao:600', S.books.langlijiao ? '已學會' : '學', !!S.books.langlijiao || S.res.silver < 600))
    + item('分浪刀' + bookTag('fenlang'), '兵器招式・刀・剛', S.books.fenlang ? '已學會。' : '老船夫說：「替我打退一回海盜船再說。」', '', btn('noop', S.books.fenlang ? '已學會' : '未解鎖', true)),
  inn: () => item('住宿一晚', '', '回滿氣血內力。可選擇睡到天亮或睡到入夜。', costStr({ silver: 20 }), `<div class="btns">${btn('sleep:day', '睡到天亮', S.res.silver < 20)}${btn('sleep:night', '睡到入夜', S.res.silver < 20, 'ghost')}</div>`),
  dojo: () => resLine(['silver']) + ['fuhu_fist', 'jinzhong'].map(id => item(BOOKS[id].n + bookTag(id), CAT_NAME[BOOKS[id].cat], '', costStr({ silver: 200 }), btn('learn:' + id + ':200', S.books[id] ? '已學會' : '學', !!S.books[id] || S.res.silver < 200))).join(''),
  tomb_blade: () => resLine(['silver']) + item('鐵馬步' + bookTag('tiema'), '輕功身法・剛', '刀痕深處的步法：閃身撞擊敵人並擊退；站得穩，流沙拖不走。', costStr({ silver: 400 }), btn('learn:tiema:400', S.books.tiema ? '已學會' : '參悟', !!S.books.tiema || S.res.silver < 400))
    + item('劈空勁' + bookTag('pikong'), '氣功・剛', S.books.pikong ? '已學會。' : '碑上最後一行字被黃沙蓋住了──替刀客找回遺骨、歸葬之後才看得見。', '', btn('noop', S.books.pikong ? '已學會' : '未解鎖', true)),
  ice_cave: () => resLine(['silver']) + ['hanbing_palm', 'hanbing_finger'].map(id => item(BOOKS[id].n + bookTag(id), CAT_NAME[BOOKS[id].cat], id === 'hanbing_palm' ? '冰壁上的掌印：掌風凍住前方敵人。' : '冰柱上的指痕：射出冰錐，命中凍結。', costStr({ silver: 500 }), btn(`learn:${id}:500`, S.books[id] ? '已學會' : '參悟', !!S.books[id] || S.res.silver < 500))).join('')
    + item('玄冰心經' + bookTag('xuanbing_heart'), '內功心法・寒', S.karma >= 30 ? '老尼願意傳你：學會即永久生效：寒屬性傷害與暴擊率隨重數提升。' : '老尼只傳俠義之人（善惡值 ≥ +30）。', '', btn('learn:xuanbing_heart:0', S.books.xuanbing_heart ? '已學會' : '求教', !!S.books.xuanbing_heart || S.karma < 30)),
  tomb_sword: () => resLine(['silver']) + item('流雲劍' + bookTag('liuyun_sword'), '兵器招式・劍', '殘碑上的劍痕，一招流雲，劍氣環身。', costStr({ silver: 300 }), btn('learn:liuyun_sword:300', S.books.liuyun_sword ? '已學會' : '參悟', !!S.books.liuyun_sword || S.res.silver < 300)),
  shop: d => { const mys = d.mystery; let h = resLine(['silver']); const disc = discount();
    const list = mys ? [{ k: 'book:guiying', n: '《鬼影步》', p: 1200 }, { k: 'book:liuyun_sleeve', n: '《流雲袖》', p: 1200 }, { k: 'gear:acc:3', n: '奇珍飾品（玄鐵）', p: 900 }, { k: 'gear:robe:2', n: '精鋼護衣', p: 300 }]
      : [{ k: 'potion', n: '金創藥', p: 30 }, { k: 'bag', n: '行囊（背包 +10 格）', p: 500 }, { k: 'mat:cloth', n: '布料 ×5', p: 40 }, { k: 'mat:fur', n: '皮毛 ×5', p: 40 }, { k: 'mat:bone', n: '獸骨 ×5', p: 40 }].concat(merchantStock().map(s => ({ k: `gear:${s.slot}:${s.tier}:${s.key}`, n: `${GEAR_NAMES[s.slot][s.tier - 1]}（${TIERS[s.tier - 1]}）`, p: s.tier === 2 ? 220 : 80 })));
    h += list.map(x => { const p = Math.round(x.p * disc); const sold = (mys ? MYSTERY.sold : (S.shopSold || {}))[x.k]; return item(x.n, '', '', costStr({ silver: p }), btn(`buy:${x.k}:${p}:${mys ? 1 : 0}`, sold ? '已售出' : '買', !!sold || S.res.silver < p || x.k === 'bag' && S.bagCap >= 100)); }).join('');
    h += `<div class="sub">賣出裝備</div>` + (S.bag.filter(it => !it.unique).map(it => item(esc(it.name), TIERS[it.tier - 1], itemDesc(it), `${sellPrice(it)} 兩`, btn('sell:' + it.uid, '賣', false, 'ghost'))).join('') || '<p class="note">沒有可賣的裝備。</p>'); return h; },
  heroes: () => { const hs = loadHeroes(); return (typeof running !== 'undefined' && running && S && S.origin ? `<div class="item"><div class="it-main"><h3>歸隱</h3><p>${S.ending ? '江湖已了。' : '江湖的事還沒了，現在歸隱就到此為止。'}${esc(S.name)}的名字會刻上墓碑；下一代會繼承青崖小築的建築、藏寶閣、丹藥與部分物品，從頭闖蕩。</p></div>${btn('retire', '歸隱山林', false, 'ghost')}</div>` : '') + `<p class="note">青崖山上，歷代弟子的墓碑一字排開。</p>` + (hs.map(x => item(`第 ${x.gen} 代　${esc(x.name)}`, x.origin, `${x.realm}・${x.ended ? (x.cause ? x.cause + '・歸隱' : '歸隱') : x.cause}・遊玩 ${x.play} 分鐘`, x.date)).join('') || '<p class="note">還沒有任何人留下名字。</p>'); },
  map: () => `<canvas id="bigmap" width="1260" height="780"></canvas><p class="note">墨跡畫到的地方才看得見。</p>`,
  'settings.gen': () => `<div class="form">
    <label>畫面品質 <select data-set="quality"><option value="high" ${SET.quality === 'high' ? 'selected' : ''}>高畫質（60 幀）</option><option value="low" ${SET.quality === 'low' ? 'selected' : ''}>省電（30 幀）</option></select></label>
    <label><input type="checkbox" data-set="dmgNum" ${SET.dmgNum ? 'checked' : ''}> 顯示傷害數字</label><label><input type="checkbox" data-set="shake" ${SET.shake ? 'checked' : ''}> 畫面震動</label>
    <label><input type="checkbox" data-set="arrow" ${SET.arrow ? 'checked' : ''}> 任務方向箭頭與地圖標記</label>
    <label>音樂 <input type="range" min="0" max="1" step="0.05" value="${SET.bgm}" data-set="bgm"></label><label>音效 <input type="range" min="0" max="1" step="0.05" value="${SET.sfx}" data-set="sfx"></label>
    <label>字體大小 <select data-set="font">${[['s', '小'], ['m', '中'], ['l', '大']].map(([v, n]) => `<option value="${v}" ${SET.font === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
    <label>對白自動播放 <select data-set="autoSpeed">${['關閉', '慢', '中', '快'].map((n, i) => `<option value="${i}" ${+SET.autoSpeed === i ? 'selected' : ''}>${n}</option>`).join('')}</select></label></div>`,
  'settings.keys': () => `<div class="sub">手機按鍵</div>${item('調整按鍵位置與大小', '', '拖動按鍵、雙指縮放或用 ＋／− 調大小', '', btn('editpad', '開始編輯'))}<div class="sub">電腦鍵位</div>` + Object.keys(SET.keys).filter(k => k !== 'inner').map(k => item(KEYNAME[k], '', '', '', `<button class="seal ghost" data-act="bind:${k}">${keyLabel(SET.keys[k])}</button>`)).join('') + btn('resetkeys', '還原預設鍵位', false, 'ghost'),
  'settings.save': () => `<p class="note">存檔每 10 秒自動存在這台裝置。換裝置時，把存檔碼貼到另一台；匯入後舊裝置的存檔作廢。</p>${S ? btn('export', '複製存檔碼') : ''}<textarea id="code-in" rows="4" placeholder="把存檔碼貼在這裡"></textarea>${btn('import', '匯入存檔碼', false, 'ghost')}<p class="note" id="code-msg"></p>${S && S.node >= NODES.length ? '' : ''}`,
  'settings.about': () => `<dl class="kv"><dt>版本</dt><dd id="ver">${VERSION}（測試版）</dd><dt>製作</dt><dd>梁家濬</dd><dt>打賞</dt><dd>連結待提供</dd><dt>意見回報</dt><dd>Google 表單連結待提供</dd></dl><p class="note">連點版本號七下可開啟開發者模式（只在測試版）。</p>${DEV.on ? devHtml() : ''}`,
};
const KEYNAME = { up: '上', down: '下', left: '左', right: '右', atk: '普攻', dodge: '閃身', s1: '招式一', s2: '招式二', inner: '內功外放', qi: '氣功', ult: '絕學', swap: '換兵器', pot: '金創藥', act: '互動', char: '角色面板', home: '回城', map: '地圖' };
const keyLabel = c => c ? c.replace('Key', '').replace('Digit', '').replace('Arrow', '方向') : '—';
function commHtml() { ensureDaily(); let h = `<div class="sub">今日委託（獎勵三倍）</div>`;
  if (!S.unlock.commission && !stepIs('commission')) return h + '<p class="note">完成落霞村「村民的請託」後開放。</p>';
  if (S.comm) h += item(S.comm.def.d, '進行中', `進度 ${Math.min(S.comm.prog, S.comm.def.n || 1)}/${S.comm.def.n || 1}`, '', btn('dropcomm', '放棄', false, 'ghost'));
  h += commOffers().map(c => S.daily.comm[c.idx] < 0 ? item(c.d, '已完成') : item(c.d, '', Object.keys(c.reward).map(k => RES[k].n + ' ' + c.reward[k] * 3).join('、'), '', btn('comm:' + c.idx, '接下', !!S.comm))).join(''); return h; }
function equippedAligns() { const s = new Set(); const ids = [S.slots.inner, S.slots.qi, S.slots.qing].concat(S.slots[S.main], S.slots[S.sub]); ids.forEach(id => { const b = id && getBook(id); if (b && b.align) s.add(b.align); }); return s; }

/* 面板事件 */
$('panel').addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b || b.tagName === 'SELECT') { if (e.target.id === 'panel') closePanel(); return; }
  const [a, x, y, z, w] = b.dataset.act.split(':'); sfx('click');
  const findIt = uid => S.bag.find(i => i.uid === uid) || SLOTS.map(s => S.gear[s]).find(i => i && i.uid === uid);
  switch (a) {
    case 'close': closePanel(); return; case 'tab': panel.tab = x; panel.confirmFuse = false; break;
    case 'mer': openMeridian(x); break; case 'main': S.main = x; if (S.sub === x) S.sub = WORDER.find(w2 => w2 !== x); break; case 'sub': S.sub = x; break;
    case 'unequip': if (S.bag.length < S.bagCap) { S.bag.push(S.gear[x]); S.gear[x] = null; refreshStats(); } else toast('背包滿了'); break;
    case 'equip': { const it = S.bag.find(i => i.uid === x); let sl = it.slot === 'acc' ? (S.gear.acc1 ? (S.gear.acc2 ? 'acc1' : 'acc2') : 'acc1') : it.slot; S.bag = S.bag.filter(i => i !== it); if (S.gear[sl]) S.bag.push(S.gear[sl]); S.gear[sl] = it; refreshStats(); break; }
    case 'bld': upgradeBld(x); break; case 'repair': repairBld(x); break; case 'gift': bondGift(x, y); break; case 'comp': setCompanion(x); break; case 'btalk': closePanel(); bondTalk(x); break; case 'waitnight': S.clock = 480; toast('你在漁幫等到天黑。海面開始漲潮了。'); closePanel(); break; case 'upw': upgradeWeapon(x); break; case 'upi': upgradeItem(findIt(x)); break; case 'dis': dismantle(findIt(x)); break;
    case 'brk': breakBook(x); break; case 'fuse': panel.confirmFuse = true; break;
    case 'fuse2': { const F = panel.fuse; const r = doFusion(F.a, F.b, F.cat, F.tie); panel.confirmFuse = false; if (r && !r.fail) toast(`合成出《${r.res.n}》！`, 'red'); panel.fuse = { a: '', b: '', cat: '', tie: '' }; break; }
    case 'brew': case 'brewall': { const mx = POT_MAX[S.bld.herbal]; let n = 0; do { if (S.res.herb < 3 || S.potions >= mx) break; S.res.herb -= 3; S.potions++; n++; } while (a === 'brewall'); if (n) toast(`煉成金創藥 ${n} 瓶`); break; }
    case 'cure': S.res.herb -= 10; S.zouhuo = 0; toast('服下湯藥，走火入魔解除'); break; case 'heal': healDisciple(x); break;
    case 'pill': { const p = PILLS[x]; if (!canPay(p.need)) break; pay(p.need); if (x === 'xuming') S.xuming++; else S.pills[x] = (S.pills[x] || 0) + 1; toast(`煉成${p.n}`, 'red'); break; }
    case 'use': { if (!(S.pills[x] > 0)) break; S.pills[x]--; if (x === 'liqi' || x === 'huxin') S.buffs[x] = 600; if (x === 'huqi') S.huqi = true; if (x === 'qingxin') { if (S.zouhuo > 0) S.zouhuo = 0; else S.nextFusionSafe = true; } toast(`服下${PILLS[x].n}`); break; }
    case 'rec': recruit(x); break; case 'go': dispatch(x, y, +z); break;
    case 'vin': { const it = S.bag.find(i => i.uid === x); S.bag = S.bag.filter(i => i !== it); S.vaultItems.push(it); break; } case 'vout': { const it = S.vaultItems.find(i => i.uid === x); if (S.bag.length < S.bagCap) { S.vaultItems = S.vaultItems.filter(i => i !== it); S.bag.push(it); } break; }
    case 'pet': S.pet = x; break; case 'tw': S.trainW = x; toast(`練武場改練${WEAPONS[x].name}`); break;
    case 'practice': closePanel(); startBoss(x || 'liu', true); return; case 'cdx': panel.cdx = x; break; case 'noop': return; case 'tut': closePanel(); startTutorial(); return;
    case 'travel': { const p = PLACES['station_' + x]; closePanel(); travelTo(p.x, p.y + 60); return; }
    case 'comm': takeComm(+x); break; case 'dropcomm': S.comm = null; break;
    case 'sleep': { S.res.silver -= 20; const wasNight = isNight(); S.clock = x === 'day' ? 30 : 490; P.hp = maxHp(); P.mp = maxMp(); closePanel(); toast(x === 'day' ? '一覺睡到天亮' : '睡到入夜'); if (x === 'day' && wasNight) { S.innNights++; if (S.innNights >= 3) encounter('drunk'); } else S.innNights = 0;
      if (stepIs('sleep_night') && (x === 'night' || wasNight)) { const n = curNode(); say(n.lines, () => spawnWave('inn', 'assassin', 4, PLACES.inn.x, PLACES.inn.y + 80, () => { toast('擊退夜襲的刺客', 'red'); advanceStep(); })); } return; }
    case 'learn': { const c = +y; if (S.res.silver < c || S.books[x]) break; S.res.silver -= c; learnBook(S, x); questLearn(); break; }
    case 'ch2': if (x === 'start') { S.ch1done = true; CH1_TRACKS.forEach(r => trk(r).n = TRACK_NODES[r].length); closePanel(); startChapter2(); } break;
    case 'buy': { const k = [x, y, z].filter(v => v !== undefined); const price = +b.dataset.act.split(':').slice(-2)[0], mys = b.dataset.act.endsWith(':1'); if (S.res.silver < price) break; const key = b.dataset.act.split(':').slice(1, -2).join(':');
      if (key === 'potion') { if (S.potions >= POT_MAX[S.bld.herbal]) { toast('金創藥帶不下了'); break; } S.potions++; } else if (key === 'bag') S.bagCap = Math.min(100, S.bagCap + 10); else if (key.startsWith('mat:')) S.res[key.split(':')[1]] += 5;
      else if (key.startsWith('book:')) { learnBook(S, key.split(':')[1]); MYSTERY.sold[key] = 1; } else if (key.startsWith('gear:')) { const [, sl, t] = key.split(':'); if (!addItem(makeItem(sl, +t))) break; if (mys) MYSTERY.sold[key] = 1; else { S.shopSold = S.shopSold || {}; S.shopSold[key] = 1; } }
      S.res.silver -= price; toast('買下了'); break; }
    case 'sell': { const it = S.bag.find(i => i.uid === x); S.bag = S.bag.filter(i => i !== it); gainRes('silver', sellPrice(it)); break; }
    case 'editpad': closePanel(); startPadEdit(); return; case 'bind': b.textContent = '按下新按鍵…'; bindWait = x; return; case 'resetkeys': SET.keys = defaultSettings().keys; saveSettings(); break;
    case 'export': { const code = exportCode(); const done = () => { const m = $('code-msg'); if (m) m.textContent = '已複製存檔碼。'; }; try { navigator.clipboard.writeText(code).then(done, () => { $('code-in').value = code; $('code-in').select(); $('code-msg').textContent = '請手動複製上方文字。'; }); } catch (er) { $('code-in').value = code; $('code-in').select(); } return; }
    case 'import': { const err = importCode($('code-in').value); if (err) { $('code-msg').textContent = err; return; } closePanel(); $('title').hidden = true; continueGame(); toast('存檔碼匯入成功', 'red'); return; }
    case 'dev': devAct(x, y); break;
    case 'x3': ch3Act(x, y, z, w); break;
    case 'x4': duelAct(x, y); if (x === 'open') return; break;
    case 'retire': confirmBox(`確定讓${S.name}歸隱嗎？這個角色會結束（存檔刪除、記上英雄榜），下一代從頭開始。`, () => retire(), null, '歸隱', '再想想'); return;
  }
  renderPanel();
});
$('panel').addEventListener('change', e => {
  const t = e.target; if (t.dataset.set) { const k = t.dataset.set; SET[k] = t.type === 'checkbox' ? t.checked : t.type === 'range' ? +t.value : (k === 'autoSpeed' ? +t.value : t.value); saveSettings(); applySettings(); return; }
  const a = t.dataset.act; if (!a) return; const [k, x, y] = a.split(':');
  if (k === 'slot') { if (y !== undefined) { const v = t.value || null; if (v) { const o = S.slots[x].indexOf(v); if (o >= 0) S.slots[x][o] = null; } S.slots[x][+y] = v; } else S.slots[x] = t.value || null; }
  if (k === 'title') S.title = t.value || null;
  if (k === 'fa') panel.fuse.a = t.value; if (k === 'fb') panel.fuse.b = t.value; if (k === 'fcat') panel.fuse.cat = t.value; if (k === 'ftie') panel.fuse.tie = t.value;
  panel.confirmFuse = false; renderPanel();
});
$('panel').addEventListener('input', e => { const t = e.target; if (t.dataset.set && t.type === 'range') { SET[t.dataset.set] = +t.value; applyVolume(); } });
function applySettings() { document.body.dataset.font = SET.font; applyVolume(); }
let bindWait = null;

/* ---------- 開發者模式（只在測試版） ---------- */
const DEV = { on: false, taps: 0 };
$('panel').addEventListener('click', e => { if (e.target.id === 'ver') { DEV.taps++; if (DEV.taps >= 7) { DEV.on = true; toast('開發者模式已開啟'); renderPanel(); } } });
function devHtml() { return `<div class="sub">開發者</div><div class="btns">${btn('dev:res', '資源 +1000')}${btn('dev:book', '全部秘笈第十重')}${btn('dev:mer', '八脈 +10')}${btn('dev:bld', '建築全 5 級')}${btn('dev:night', '切換晝夜')}${btn('dev:node', '跳過主線一步')}${btn('dev:boss', '傳送到竹林空地')}${btn('dev:xuming', '續命丹 +1')}${btn('dev:roads', '開通全部驛路')}${btn('dev:tokens', '血影令 +1')}${['sand', 'snow', 'cult', 'miao', 'sea', 'zhong', 'kunlun'].map(r => btn('dev:tp:' + r, '傳送到' + REGIONS[r].short)).join('')}${btn('ch2:start', '直接進第二章')}${btn('dev:weather', '切換天氣')}${btn('dev:final', '直接進終章')}${btn('dev:clear', '直接破關')}</div>`; }
function devAct(x, y) { if (x === 'roads') { S.unlock.bamboo = S.unlock.roads = true; REGION_ORDER.forEach(r => S.stations[r] = true); } if (x === 'tokens') S.tokens++; if (x === 'tp') { closePanel(); const p = PLACES['station_' + y]; travelTo(p.x, p.y + 80); } if (x === 'weather') { const r = curRegion(); if (REGIONS[r]) { const W = REGIONS[r].weather; const u = [...new Set(W)]; S.weather[r] = u[(u.indexOf(S.weather[r]) + 1) % u.length]; toast(S.weather[r]); } } if (x === 'res') Object.keys(RES).forEach(k => S.res[k] += 1000); if (x === 'book') { for (const id of ['qingya_sword', 'liuyun_sword', 'fuhu_fist', 'jinzhong', 'caoshangfei', 'qingya_heart']) { if (!S.books[id]) learnBook(S, id, true); S.books[id].lv = 10; } } if (x === 'mer') MERIDIANS.forEach(m => S.mer[m.k] += 10); if (x === 'bld') BORDER.forEach(k => S.bld[k] = 5);
  if (x === 'night') S.clock = isNight() ? 30 : 490; if (x === 'node' && curNode()) advanceStep(); if (x === 'boss') { S.unlock.bamboo = true; closePanel(); travelTo(PLACES.arena.x + 300, PLACES.arena.y); } if (x === 'xuming') S.xuming++; if (x === 'final' && S.ch2) { closePanel(); CH2A_TRACKS.concat(CH2B_TRACKS).forEach(r => trk(r).n = TRACK_NODES[r].length); S.ch2b = true; } if (x === 'clear') { S.ending = 'xiaoao'; S.cleared = true; toast('已破關：試煉塔、江湖劫開放'); } refreshStats(); }

/* ---------- HUD ---------- */
let hudT = 0;
function updHUD(dt) {
  const mh = maxHp(), mm = maxMp();
  $('h-hp').style.width = (clamp(P.hp / mh, 0, 1) * 100) + '%'; $('h-mp').style.width = (clamp(P.mp / mm, 0, 1) * 100) + '%';
  $('h-hpn').textContent = `${Math.ceil(Math.max(0, P.hp))}/${mh}`; $('h-mpn').textContent = `${Math.floor(P.mp)}/${mm}`;
  $('h-k').style.left = ((S.karma + 100) / 2) + '%';
  hudT -= dt; if (hudT <= 0) { hudT = .25;
    $('h-name').textContent = (S.title ? `〔${S.title}〕` : '') + S.name; $('h-realm').textContent = realmOf(power());
    $('h-time').textContent = `${shichen()}・${curWeather()}${isNight() ? '・夜' : ''}`;
    $('obj').textContent = objectiveText() + (S.comm ? `\n委託：${S.comm.def.d}（${Math.min(S.comm.prog, S.comm.def.n || 1)}/${S.comm.def.n || 1}）` : '');
    $('h-buffs').textContent = [S.zouhuo > 0 ? `走火入魔 ${Math.ceil(S.zouhuo)}s` : '', S.buffs.liqi > 0 ? '力氣丹' : '', S.buffs.huxin > 0 ? '護心丹' : '', P.poison > 0 ? '中毒' : '', S.comm ? `委託 ${Math.min(S.comm.prog, S.comm.def.n || 1)}/${S.comm.def.n || 1}` : ''].filter(Boolean).join('　');
    $('pot-n').textContent = S.potions;
    for (const k of ['s1', 's2', 'inner', 'qi']) { const r = slotBook(k); const b = r.id && getBook(r.id); $('n-' + k).textContent = b ? b.n.slice(0, 4) : '—'; $('b-' + k).classList.toggle('off', !b || P.mp < bookCost(b) * (b.cat === 'qi' ? 1 : 0.5)); }
    { const db = document.querySelector('#pad [data-b="dodge"]'); if (db) db.classList.toggle('off', P.mp < DODGE_MP); }
    $('b-ult').classList.toggle('glow', (S.karma >= 30 || S.karma <= -30) && P.mp >= mm * .99); $('b-ult').classList.toggle('off', S.karma > -30 && S.karma < 30);
    $('b-act').hidden = !INTERACT; if (INTERACT) $('n-act').textContent = INTERACT.short || '互動';
    $('prompt').hidden = !INTERACT || isTouch; if (INTERACT) $('prompt').textContent = `${keyLabel(SET.keys.act)}　${INTERACT.label}`;
    $('combo').hidden = P.comboHits < 5; $('combo').innerHTML = `<b>${P.comboHits}</b> 連擊${P.comboHits >= 10 ? `<small>傷害 +${Math.min(setN('yubang') >= 4 ? 70 : 50, Math.floor(P.comboHits / 10) * 5)}%</small>` : ''}`;
  }
  const cdSet = (id, v, max) => { const el = $('cd-' + id); if (!el) return; const r = clamp(v / max, 0, 1); el.style.height = (r * 100) + '%'; const n = $('cn-' + id); if (n) n.textContent = v > 0.05 ? Math.ceil(v) : ''; };
  for (const k of ['s1', 's2', 'inner', 'qi']) { const r = slotBook(k); cdSet(k, P.cd[k], r.id ? bookCd(getBook(r.id)) : 1); }
  cdSet('dodge', P.charges > 0 ? 0 : P.dodgeCd, dodgeCdMax()); cdSet('pot', P.cd.pot, 1); cdSet('swap', P.cd.swap, 1.2);
  $('home-bar').style.width = (P.home > 0 ? P.home / 3 * 100 : 0) + '%'; $('homebox').hidden = !(P.home > 0);
  const boss = BOSSFIGHT && BOSSFIGHT.boss; $('boss').hidden = !boss; if (boss) { $('boss-n').textContent = (boss.practice ? '演武・' + BOSS[boss.bid].short : BOSS[boss.bid].n) + `　第 ${['一', '二', '三'][boss.phase - 1]} 階段`; $('boss-hp').style.width = (clamp(boss.hp / boss.maxHp, 0, 1) * 100) + '%'; }
  $('lowhp').classList.toggle('on', P.hp < mh * .25 && !P.dead);
}

/* ---------- 操作：鍵盤 ---------- */
const keys = {};
addEventListener('keydown', e => {
  if (bindWait) { e.preventDefault(); SET.keys[bindWait] = e.code; bindWait = null; saveSettings(); renderPanel(); return; }
  const K = SET.keys; const game = Object.values(K).includes(e.code) || e.code === 'Space' || e.code.startsWith('Arrow');
  if (game && running) e.preventDefault(); keys[e.code] = true; if (e.repeat) return; audioInit();
  if (e.code === 'Escape') { if (modal) closeModal(false); else if (panel) closePanel(); else if (running) openPanel('settings'); return; }
  if (!running) return;
  if (modal) { if (e.code === 'Enter') closeModal(true); return; }
  if (dlg) { if (['Space', 'Enter', K.atk, K.act].includes(e.code)) advanceDlg(); return; }
  if (panel) { if (e.code === K.char && panel.kind === 'char') closePanel(); if (e.code === K.map && panel.kind === 'map') closePanel(); return; }
  if (P.dead) return;
  const act = Object.keys(K).find(k => K[k] === e.code) || (e.code === 'Space' ? 'dodge' : null);
  switch (act) { case 'atk': input.atk = true; break; case 'dodge': dodge(); break; case 's1': useSkill('s1'); break; case 's2': useSkill('s2'); break; case 'inner': useSkill('inner'); break; case 'qi': useSkill('qi'); break;
    case 'ult': ultimate(); break; case 'swap': swapWeapon(); break; case 'pot': potion(); break; case 'act': doInteract(); break; case 'char': openPanel('char'); break; case 'home': startHome(); break; case 'map': openMap(); break; }
});
addEventListener('keyup', e => { keys[e.code] = false; if (e.code === SET.keys.atk) input.atk = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; input.atk = false; });
function moveVec() {
  if (JOY.id !== null) { const l = Math.hypot(JOY.dx, JOY.dy); return l < .15 ? { x: 0, y: 0 } : { x: JOY.dx, y: JOY.dy }; }
  const K = SET.keys; let x = 0, y = 0; if (keys[K.left] || keys.ArrowLeft) x--; if (keys[K.right] || keys.ArrowRight) x++; if (keys[K.up] || keys.ArrowUp) y--; if (keys[K.down] || keys.ArrowDown) y++;
  const l = Math.hypot(x, y); return l ? { x: x / l, y: y / l } : { x: 0, y: 0 };
}

/* ---------- 操作：觸控（仿傳說對決） ---------- */
const JOY = { id: null, dx: 0, dy: 0 };
const joyEl = $('joy'), knob = $('joy-k');
joyEl.addEventListener('pointerdown', e => { if (!running || PAUSED() || PADEDIT) return; JOY.id = e.pointerId; try { joyEl.setPointerCapture(e.pointerId); } catch (_) { } joyMove(e); audioInit(); });
joyEl.addEventListener('pointermove', e => { if (e.pointerId === JOY.id) joyMove(e); });
const joyEnd = e => { if (e.pointerId !== JOY.id) return; JOY.id = null; JOY.dx = JOY.dy = 0; knob.style.transform = ''; };
joyEl.addEventListener('pointerup', joyEnd); joyEl.addEventListener('pointercancel', joyEnd);
function joyMove(e) { const r = joyEl.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2; let dx = e.clientX - cx, dy = e.clientY - cy; const m = r.width * .42, l = Math.hypot(dx, dy); if (l > m) { dx *= m / l; dy *= m / l; } JOY.dx = dx / m; JOY.dy = dy / m; knob.style.transform = `translate(${dx}px,${dy}px)`; }
const AIM = { key: null, ang: null, out: false, cancel: false, id: null };
document.querySelectorAll('#pad [data-b]').forEach(b => {
  const k = b.dataset.b;
  b.addEventListener('pointerdown', e => { e.preventDefault(); audioInit(); if (PADEDIT) return padEditDown(e, b); if (!running || PAUSED() || P.dead) return;
    try { b.setPointerCapture(e.pointerId); } catch (_) { }
    if (k === 'atk') { input.atk = true; return; }
    if (['s1', 's2', 'inner', 'qi'].includes(k)) { AIM.key = k; AIM.id = e.pointerId; AIM.out = false; AIM.cancel = false; AIM.ang = null; AIM.cx = e.clientX; AIM.cy = e.clientY; b.classList.add('press'); return; }
    if (k === 'dodge') dodge(); if (k === 'ult') ultimate(); if (k === 'swap') swapWeapon(); if (k === 'pot') potion(); if (k === 'act') doInteract(); if (k === 'home') startHome(); });
  b.addEventListener('pointermove', e => { if (PADEDIT) return padEditMove(e, b); if (AIM.id !== e.pointerId || AIM.key !== k) return; const dx = e.clientX - AIM.cx, dy = e.clientY - AIM.cy, d = Math.hypot(dx, dy);
    if (d > 22) { AIM.out = true; AIM.cancel = false; AIM.ang = Math.atan2(dy, dx); } else if (AIM.out) AIM.cancel = true; b.classList.toggle('cancel', AIM.cancel); });
  const up = e => { if (PADEDIT) return padEditUp(e, b); if (k === 'atk') { input.atk = false; return; } if (AIM.id !== e.pointerId || AIM.key !== k) return; b.classList.remove('press', 'cancel');
    if (!AIM.cancel) useSkill(k, AIM.out ? AIM.ang : null); AIM.key = null; AIM.id = null; AIM.ang = null; };
  b.addEventListener('pointerup', up); b.addEventListener('pointercancel', e => { if (k === 'atk') input.atk = false; if (AIM.key === k) { AIM.key = null; b.classList.remove('press', 'cancel'); } });
});
document.querySelectorAll('#topr [data-top]').forEach(b => b.addEventListener('click', () => { if (!running || P.dead) return; const t = b.dataset.top; if (t === 'fs') { toggleFullscreen(); return; } if (t === 'char') openPanel('char'); if (t === 'map') openMap(); if (t === 'set') openPanel('settings'); }));
addEventListener('contextmenu', e => e.preventDefault());

/* 按鍵位置編輯 */
const PAD_DEF = { atk: { r: 20, b: 16, s: 1 }, s1: { r: 157, b: 33, s: 1 }, s2: { r: 141, b: 93, s: 1 }, inner: { r: 97, b: 137, s: 1 }, qi: { r: 37, b: 153, s: 1 }, ult: { r: 16, b: 224, s: 1 }, dodge: { r: 230, b: 14, s: 1 }, swap: { r: 296, b: 14, s: 1 }, pot: { r: 362, b: 14, s: 1 }, home: { r: 428, b: 14, s: 1 }, act: { r: 216, b: 104, s: 1 } };
let PADEDIT = false, padDrag = null;
function applyPad() { const L = Object.assign({}, PAD_DEF, SET.layout || {}); document.querySelectorAll('#pad [data-b]').forEach(b => { const p = L[b.dataset.b]; if (!p) return; b.style.right = `calc(${p.r}px + env(safe-area-inset-right,0px))`; b.style.bottom = `calc(${p.b}px + env(safe-area-inset-bottom,0px))`; b.style.setProperty('--sz', p.s); }); }
function startPadEdit() { PADEDIT = true; document.body.classList.add('padedit'); $('padedit').hidden = false; $('b-act').hidden = false; }
function endPadEdit(save) { PADEDIT = false; document.body.classList.remove('padedit'); $('padedit').hidden = true; if (!save) { SET.layout = null; } saveSettings(); applyPad(); }
function padEditDown(e, b) { padDrag = { b, id: e.pointerId, x: e.clientX, y: e.clientY, p: Object.assign({}, (SET.layout || {})[b.dataset.b] || PAD_DEF[b.dataset.b]) }; try { b.setPointerCapture(e.pointerId); } catch (_) { } document.querySelectorAll('#pad .sel').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); }
function padEditMove(e, b) { if (!padDrag || padDrag.b !== b) return; const p = padDrag.p; const L = SET.layout = SET.layout || {}; L[b.dataset.b] = { r: clamp(p.r - (e.clientX - padDrag.x), 0, innerWidth - 60), b: clamp(p.b - (e.clientY - padDrag.y), 0, innerHeight - 60), s: p.s }; applyPad(); }
function padEditUp() { padDrag = null; }
$('padedit').addEventListener('click', e => { const a = e.target.dataset.pe; if (!a) return; const sel = document.querySelector('#pad .sel'); if (a === 'done') endPadEdit(true); if (a === 'reset') { SET.layout = null; applyPad(); } if ((a === 'plus' || a === 'minus') && sel) { const k = sel.dataset.b; const L = SET.layout = SET.layout || {}; const p = Object.assign({}, L[k] || PAD_DEF[k]); p.s = clamp(p.s + (a === 'plus' ? .1 : -.1), .6, 1.6); L[k] = p; applyPad(); } });

/* ---------- 互動 ---------- */
function doInteract() { if (INTERACT && !P.dead) INTERACT.fn(); }
function findInteract() {
  INTERACT = null; CIRCLES = []; let bd = 1e9; const c = (x, y, r, label, fn, short) => { const d = Math.hypot(P.x - x, (P.y - y) / .55); if (d > 1600) return; const ci = { x, y, r, on: false }; CIRCLES.push(ci); if (d < r && d < bd) { bd = d; CIRCLES.forEach(o => o.on = false); ci.on = true; INTERACT = { label, fn, short }; } };
  const pp = k => PLACES[k];
  c(pp('master').x, pp('master').y, 110, '與師父交談', () => { if (!questTalk('master')) say([{ who: 'master', t: pick(['急什麼，茶還沒涼。', '見地上紅光，便閃身。', '練武場的木人，打得不錯。', '江湖路遠，記得回來喝茶。']) }]); }, '師父');
  c(pp('base').x, pp('base').y + 60, 85, '青崖小築（建設、夥伴）', () => openPanel('base', 'bld'), '小築');
  for (const k in BLD_POS) { const b = BLD_POS[k], n = BUILDINGS[k].n, l = S.bld[k]; c(b.x, b.y + 55, 70, l ? `${n}（${l} 級）` : `${n}空地（未修建，按下去修建）`, () => openPanel('base', l ? BLD_TAB[k] : 'bld'), l ? n.slice(-2) : '修建'); }
  c(pp('train').x, pp('train').y, 120, S.bld.train ? `練武場（${S.bld.train} 級）` : '練武場（荒廢）', () => openPanel('train', null, { title: '練武場' }), '練武');
  c(pp('tomb').x, pp('tomb').y + 30, 80, '歷代墓碑（英雄榜）', () => openPanel('heroes', null, { title: '江湖英雄榜' }), '墓碑');
  for (const k of REGION_ORDER) { const p = pp('station_' + k); if (!regionOpen(k)) continue; c(p.x, p.y, 110, `${p.n}：快速傳送、委託`, () => openPanel('station', null, { title: p.n, here: k }), '驛站'); }
  c(pp('chief').x, pp('chief').y, 100, '與村長交談', () => { if (!questTalk('chief')) say([{ who: 'chief', t: pick(['最近山賊少了些，多虧你。', '告示板上的事，有空就幫幫忙。', '後山那口枯井？老一輩都說別靠近。']) }]); }, '村長');
  c(pp('inn').x, pp('inn').y, 100, '落霞客棧（住宿）', () => { if (!questTalk('innkeeper')) openPanel('inn', null, { title: '落霞客棧' }); }, '客棧');
  c(pp('dojo').x, pp('dojo').y, 100, '武館', () => { if (!questTalk('dojo')) openPanel('dojo', null, { title: '武館' }); }, '武館');
  for (const k of ['board_v', 'board_b', 'board_s', 'board_w', 'board_c']) if (placeVisible(k, pp(k))) c(pp(k).x, pp(k).y, 90, '告示板（委託）', () => openPanel('board', null, { title: '告示板' }), '告示');
  for (const ev of EVENT_NPCS) if (S.events[ev] !== 'done' && S.events[ev] !== 'wave' && placeVisible(ev, pp(ev))) c(pp(ev).x, pp(ev).y, 110, NPCS[ev].n, () => runEvent(ev), '事件');
  const TALK = { caravan_boss: ['caravan_boss', ['刀要磨，路要走。', '鐵霸的關卡一拔，商隊又敢上路了。', '護過我們的人，永遠有一碗水。']], ferry: ['boatwife', ['江上冷，客官多穿點。', '我家那口子要是回來，我給你煮魚湯。']], fisher: ['fisher', ['……噓。', '魚，總會上鉤的。']], mole: ['mole', ['我、我什麼都沒看見！', '血牢在東邊，別說是我說的。']] };
  for (const k in TALK) { const p = pp(k); const [npc, idle] = TALK[k]; if (!placeVisible(k, p) || NPC_HIDE[npc] && NPC_HIDE[npc]()) continue; c(p.x, p.y, 100, `與${NPCS[npc].n}交談`, () => { if (!questTalk(npc)) say([{ who: npc, t: pick(idle) }]); }, '交談'); }
  if (placeVisible('ice_cave', pp('ice_cave'))) c(pp('ice_cave').x, pp('ice_cave').y, 120, '冰窟（老尼、參悟秘笈）', () => { if (!questTalk('nun')) openPanel('ice_cave', null, { title: '冰窟' }); }, '冰窟');
  if (placeVisible('blade_tomb', pp('blade_tomb'))) c(pp('blade_tomb').x, pp('blade_tomb').y, 120, '刀客墓（參悟刀痕）', () => openPanel('tomb_blade', null, { title: '刀客墓' }), '刀客墓');
  if (!S.pets.includes('dog')) c(pp('dog').x, pp('dog').y, 100, `餵流浪黃狗（${S.dogFed}/3，5 兩）`, () => { if (S.res.silver < 5) return toast('身上沒錢'); if (P.dogT > 0) return toast('黃狗還在吃，等一下再餵'); S.res.silver -= 5; S.dogFed++; P.dogT = 5; if (S.dogFed >= 3) { giveReward({ pet: 'dog' }); } else toast('黃狗搖了搖尾巴'); }, '餵狗');
  if (S.unlock.bamboo) c(pp('sword_tomb').x, pp('sword_tomb').y, 120, '劍冢殘碑', () => { if (isNight() && S.wpn.sword.lv >= 10) encounter('resonance'); openPanel('tomb_sword', null, { title: '劍冢殘碑' }); }, '劍冢');
  const SEC_N = Object.assign({ well: ['後山枯井（進入秘境）', '爬出井口', '井底傳來風聲。'], ice: ['冰湖薄處（潛入冰下）', '爬回冰面', '冰下有光。'], ruin: ['沙丘下的城垛（進入古城）', '爬出古城', '沙下傳來回音。'], cellar: ['地底石階（往下走）', '走回地面', '石階深處有血腥味。'], isle: ['蓮葉盡頭的小島（進入洞口）', '回到蓮葉小島', '洞裡傳來蛙鳴。'], wreck: ['礁岩外的桅杆（潛進沉船）', '爬出沉船', '船艙裡有水聲。'] }, typeof SEC3 !== 'undefined' ? SEC3 : {});
  if (S.ch2) {
    for (const k of ['board_m', 'board_e']) if (placeVisible(k, pp(k))) c(pp(k).x, pp(k).y, 90, '告示板（委託）', () => openPanel('board', null, { title: '告示板' }), '告示');
    const T2 = { zhaizhu: ['zhaizhu', ['寨子裡的蠱，不是拿來害人的。', '白婆說你命硬，我信她。']], yubang: ['yubang', ['海上的事，問我就對了。', '海天霸……當年是我最好的兄弟。']], diaosou: ['diaosou', ['浪是追不上的，只能跟。', '哈哈，又來看浪？']] };
    for (const k in T2) { const p = pp(k); const [npc, idle] = T2[k]; if (!placeVisible(k, p)) continue; c(p.x, p.y, 100, `與${NPCS[npc].n}交談`, () => { if (questTalk(npc)) return; const tr = matchTrack('trial', 'id', npc); if (tr) return startTrial(tr, npc); if (k === 'yubang') { const st = matchTrack('waves', 'id', 'tide_night'); if (st && !isNight()) return say([{ who: 'yubang', t: '大潮要等入夜才會來。要不要在漁幫歇一會，等天黑？' }, { who: 'choice', t: '', choices: [{ label: '等到天黑', fn: () => { S.clock = 480; toast('天黑了。海面開始漲潮。'); } }, { label: '先不用', alt: true, fn: () => { } }] }]); } say([{ who: npc, t: pick(idle) }]); }, '交談'); }
    if (placeVisible('wuyi', pp('wuyi'))) c(pp('wuyi').x, pp('wuyi').y, 110, '巫醫竹樓（白婆、學毒功）', () => { if (!questTalk('wuyi')) openPanel('wuyi', null, { title: '巫醫竹樓' }); }, '竹樓');
    if (placeVisible('laochuanfu', pp('laochuanfu'))) c(pp('laochuanfu').x, pp('laochuanfu').y, 110, '老船夫的碼頭（學浪裡蛟）', () => { if (!questTalk('laochuanfu')) openPanel('laochuanfu', null, { title: '老船夫的碼頭' }); }, '碼頭');
    if (placeVisible('langu', pp('langu'))) c(pp('langu').x, pp('langu').y, 110, '與藍姑交談', () => { const tr = matchTrack('trial', 'id', 'langu'); if (tr) return startTrial(tr, 'langu'); if (questTalk('langu')) return; if (bondCands().includes('langu')) return bondTalk('langu'); say([{ who: 'langu', t: '怕毒就別進谷。' }]); }, '藍姑');
    if (S.bond && S.bond.sibling) { const p = pp('siblings'); for (const [k, dx] of [['suxin', -30], ['changfeng', 30]]) if (S.companion !== k) c(p.x + dx, p.y, 70, `與${NPCS[k].n}交談`, () => { if (bondCands().includes(k)) return bondTalk(k); say([{ who: k, t: BONDS[k].line }]); }, k === 'suxin' ? '師姐' : '師兄'); }
    if (S.bond && S.bond.liu && S.companion !== 'liu') { const p = pp('liu_home'); c(p.x, p.y, 80, '與柳無痕交談', () => { if (bondCands().includes('liu')) return bondTalk('liu'); say([{ who: 'liu', t: '一瞬而已。' }]); }, '柳無痕'); }
    if (S.companion) c(COMP.x, COMP.y, 70, `與${BONDS[S.companion].n}交談`, () => bondTalk(S.companion), '知己');
    { const p = pp('white_snake'); if (!S.encounters.lingshe && Date.now() - (S.snakeT || 0) >= 90000 && placeVisible('white_snake', p)) c(p.x, p.y, 90, '受傷的白蛇', () => say([{ who: 'narr', t: '一條雪白的小蛇蜷在草叢裡，尾巴上有一道傷口，正吐著信子看你。' }, { who: 'choice', t: '', choices: [{ label: '放牠走', fn: spareSnake }, { label: '抓來泡藥酒（得蠱王 1）', alt: true, fn: () => { gainRes('guwang', 1); S.snakeSpare = 0; S.snakeT = Date.now(); addKarma(-2); } }] }]), '白蛇'); }
    { const p = pp('net_spot'); if (placeVisible('net_spot', p)) c(p.x, p.y, 100, `幫漁幫撒網（${S.netN || 0}/10）`, castNet, '撒網'); }
  }
  for (const k in SECRET_LINKS) { const [ent, ex] = SECRET_LINKS[k]; const E1 = pp(ent), X1 = pp(ex); if (!placeVisible(ent, E1)) continue; const room = ROOMS.find(rm => X1.x > rm.x && X1.x < rm.x + rm.w && X1.y > rm.y && X1.y < rm.y + rm.h);
    c(E1.x, E1.y, 90, SEC_N[k][0], () => { toast(SEC_N[k][2]); travelTo(X1.x + 120, X1.y + 120, true); }, '秘境'); c(X1.x, X1.y, 90, SEC_N[k][1], () => travelTo(E1.x, E1.y + 70, true), '出口'); }
  for (const id in STELES) { const s = STELES[id]; if (!regionOpen(RUMORS[id].region) && id !== 'stonegate') continue; c(s.x, s.y, 90, S.rumors[id] ? `重讀石碑：${RUMORS[id].t}` : '石碑（江湖傳聞）', () => readRumor(id), '石碑'); }
  for (const id in CHESTS) { if (S.chests[id]) continue; const ch = CHESTS[id]; if (Math.hypot(P.x - ch.x, P.y - ch.y) < 160) c(ch.x, ch.y, 80, '打開寶箱', () => openChest(id), '寶箱'); }
  if (typeof ch3Interact === 'function') ch3Interact(c, pp);
  const m = merchantPos(); if (S.stations[merchantStation()]) c(m.x, m.y, 100, '行商 老錢', () => openPanel('shop', null, { title: '行商 老錢' }), '商人');
  if (MYSTERY.active) c(MYSTERY.x, MYSTERY.y, 100, '神秘商人', () => openPanel('shop', null, { title: '神秘商人', mystery: true }), '商人');
}
function readRumor(id) { const first = !S.rumors[id]; S.rumors[id] = 1; say([{ who: 'narr', t: `【${RUMORS[id].t}】${RUMORS[id].body}` }], () => { questRumor(id); const reg = RUMORS[id].region; if (first && Object.keys(RUMORS).filter(r => RUMORS[r].region === reg).every(r => S.rumors[r])) toast(`收齊${regionName(reg)}的傳聞：地圖標出秘境入口`, 'red'); }); }
function openChest(id) { const ch = CHESTS[id]; S.chests[id] = 1; S.stats.chests++; burst(ch.x, ch.y, GOLD, 16); sfx('learn');
  const reg = regionAt(ch.x, ch.y), hi = reg === 'sand' || reg === 'snow' ? 1 : reg === 'cult' ? 2 : 0;
  gainRes('silver', (ch.rich ? rint(150, 300) : rint(40, 90)) * (1 + hi), ch.x, ch.y - 20); gainRes('page', (ch.rich ? 3 : 1) + hi); if (Math.random() < (ch.rich ? 1 : .5)) addItem(makeItem(pick(['robe', 'hat', 'boots', 'belt', 'acc']), Math.min(4, (ch.rich ? 2 : 1) + hi), { set: Math.random() < .4 ? REGION_SET[reg === 'secret' ? pick(REGION_ORDER) : reg] : null }));
  if (ch.rich) gainRes(pick(RARE_ORES), 1 + hi); toast('打開了寶箱'); }
function travelTo(x, y, quiet) { P.x = x; P.y = y; P.home = 0; E = E.filter(e => e.tag); PR = []; if (BOSSFIGHT) endBossFight(false); if (!quiet) { $('loading-t').textContent = pick(WISDOM); $('loading').hidden = false; setTimeout(() => $('loading').hidden = true, 900); } }
function startHome() { if (P.dead || BOSSFIGHT) { if (BOSSFIGHT) toast('頭目戰中不能回城'); return; } P.home = 0.001; toast('回城中……原地不動 3 秒'); }
function openMap() { openPanel('map', null, { title: '江湖全圖' }); drawBigMap(); }

/* ---------- 教學 ---------- */
const TUT = { on: false, i: 0, steps: [{ k: 'move', d: '移動到練武場' }, { k: 'atk', d: '對木樁普攻 5 下', n: 5 }, { k: 'dodge', d: '閃身一次' }, { k: 'skill', d: '施展一次招式（一）' }, { k: 'gather', d: '用兵器打一棵樹採集木材' }] };
function offerTutorial() { say([{ who: 'choice', t: '師父要帶你到練武場對著木樁練基本功（約 3 分鐘）。', choices: [{ label: '接受指點', fn: startTutorial }, { label: '跳過教學', alt: true, fn: () => { S.tutorial = true; toast('跳過教學。設定或練武場可以重新開始。'); } }] }]); }
function startTutorial() { TUT.on = true; TUT.i = 0; TUT.n = 0; $('tut').hidden = false; for (let i = 0; i < 3; i++) { const d = spawnEnemy('dummy', PLACES.train.x - 60 + i * 60, PLACES.train.y - 70, null, { elite: false }); d.tut = true; } renderTut(); }
function renderTut() { const s = TUT.steps[TUT.i]; $('tut-t').textContent = s ? `新手教學 ${TUT.i + 1}/${TUT.steps.length}：${s.d}${s.n ? `（${TUT.n}/${s.n}）` : ''}` : ''; }
function tutEvent(k) { if (!TUT.on) return; const s = TUT.steps[TUT.i]; if (!s || s.k !== k) return; if (s.n) { TUT.n++; if (TUT.n < s.n) { renderTut(); return; } } TUT.i++; TUT.n = 0; if (TUT.i >= TUT.steps.length) endTutorial(); else renderTut(); }
function endTutorial() { TUT.on = false; $('tut').hidden = true; E = E.filter(e => !e.tut); S.tutorial = true; toast('教學完成。見地上紅光，便閃身。', 'red'); }
$('tut-skip').addEventListener('click', endTutorial);

/* ---------- 標題、創角、死亡 ---------- */
function showTitle() {
  // 沒有角色資料的空殼存檔（舊版看英雄榜時被蓋掉的）直接清掉，當作沒有存檔
  const okKey = k => { try { return validSave(JSON.parse(lsGet(k))); } catch (e) { return false; } };
  if (lsGet(SAVE_KEY) && !okKey(SAVE_KEY) && !okKey(SAVE_KEY + '_bak')) { lsDel(SAVE_KEY); lsDel(SAVE_KEY + '_bak'); }
  const has = okKey(SAVE_KEY) || okKey(SAVE_KEY + '_bak'); const el = $('title'); el.hidden = false; music('title');
  el.innerHTML = `<div class="title-in"><h1>一命<span>江湖</span></h1><p class="sub">水墨武俠・硬核江湖</p><div class="go">${has ? '<button class="seal big" id="t-cont">繼續闖蕩</button>' : ''}<button class="seal big ${has ? 'ghost' : ''}" id="t-new">${has ? '新角色' : '踏入江湖'}</button></div>
  <div class="go small"><button class="seal ghost" id="t-hero">英雄榜</button><button class="seal ghost" id="t-set">設定</button><button class="seal ghost" id="t-note">江湖公告</button></div>
  <p class="foot">版本 ${VERSION}　製作：梁家濬</p></div>`;
  if (has) $('t-cont').onclick = () => { audioInit(); continueGame(); };
  $('t-new').onclick = () => { audioInit(); if (has) confirmBox('開新角色會刪除目前的存檔（不會進英雄榜）。確定嗎？', () => { deleteSave(); showCreate(); }, null, '刪除並開新角色'); else showCreate(); };
  $('t-hero').onclick = () => { if (!S) S = { name: '', stub: true }; openPanel('heroes', null, { title: '江湖英雄榜' }); };
  $('t-set').onclick = () => openPanel('settings');
  $('t-note').onclick = () => showNotice(true);
  if (lsGet('yijian-notice') !== VERSION) showNotice();
}
function showNotice(force) { lsSet('yijian-notice', VERSION); $('notice').hidden = false; }
$('notice').addEventListener('click', e => { if (e.target.dataset.close !== undefined || e.target.id === 'notice') $('notice').hidden = true; });
const CREATE = { name: '', gender: 'm', origin: 'mingmen', hair: 0, hairCol: 0, clothCol: 0 };
function showCreate() {
  const el = $('create'); el.hidden = false; $('title').hidden = true; const leg = loadLegacy();
  const pickRow = (k, arr, lab) => `<div class="pk"><span>${lab}</span>${arr.map((v, i) => `<button class="chip ${CREATE[k] === i ? 'on' : ''}" data-ck="${k}:${i}" ${typeof v === 'string' && v.startsWith('#') ? `style="--c:${v}"` : ''}>${typeof v === 'string' && v.startsWith('#') ? '' : v || '依出身'}</button>`).join('')}</div>`;
  el.innerHTML = `<div class="create-in"><h2>創建角色</h2>${leg ? `<p class="note">上一代「${esc(leg.name)}」的全部秘笈、裝備、青崖小築的建築與藏寶，會傳給這一代。</p>` : ''}
    <div class="create-grid"><div class="cleft"><canvas id="cprev" width="220" height="260"></canvas></div><div class="cright">
    <label class="nm">姓名 <input id="c-name" maxlength="8" value="${esc(CREATE.name)}" placeholder="無名"></label>
    <div class="pk"><span>性別</span><button class="chip ${CREATE.gender === 'm' ? 'on' : ''}" data-ck="gender:m">男</button><button class="chip ${CREATE.gender === 'f' ? 'on' : ''}" data-ck="gender:f">女</button></div>
    ${pickRow('hair', HAIRS, '髮型')}${pickRow('hairCol', HAIR_COLS, '髮色')}${pickRow('clothCol', CLOTH_COLS, '衣色')}
    <div class="origins">${Object.keys(ORIGINS).map(k => { const o = ORIGINS[k]; return `<button class="ocard ${CREATE.origin === k ? 'on' : ''}" data-ck="origin:${k}"><b>${o.n}</b><small>善惡 ${o.karma >= 0 ? '+' : ''}${o.karma}</small><span>${o.books.map(b => '《' + BOOKS[b].n + '》').join('')}</span><em>${o.desc}</em></button>`; }).join('')}</div>
    <button class="seal big" id="c-go">踏入江湖</button></div></div></div>`;
  drawPreview();
}
$('create').addEventListener('click', e => { const b = e.target.closest('[data-ck]'); if (b) { const [k, v] = b.dataset.ck.split(':'); CREATE[k] = ['hair', 'hairCol', 'clothCol'].includes(k) ? +v : v; CREATE.name = $('c-name').value; sfx('click'); showCreate(); return; }
  if (e.target.id === 'c-go') { CREATE.name = ($('c-name').value || '無名').trim().slice(0, 8) || '無名'; $('create').hidden = true; const s = newState(CREATE); lsDel(LEGACY_KEY); startGame(s, true); } });
function drawPreview() { const c = $('cprev'); if (!c) return; const g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height); const hid = `hero_${CREATE.origin}_${CREATE.gender}_h${CREATE.hair}`; let hh = portImg(hid); if (hh) { const t = tintHero(hid, hh, `img/${hid}_m.png`, CREATE.hairCol, CREATE.clothCol); if (t === hh && (CREATE.hairCol || CREATE.clothCol) && RAW[`img/${hid}_m.png`] !== false) setTimeout(drawPreview, 250); hh = t; }
  if (hh) { const sc = Math.max(c.width / hh.width, c.height / hh.height); g.drawImage(hh, (c.width - hh.width * sc) / 2, (c.height - hh.height * sc) / 2, hh.width * sc, hh.height * sc); return; } if (hh === null) setTimeout(drawPreview, 300); const hp = portImg(`hero_${CREATE.origin}_${CREATE.gender}_full`); if (hp) { const sc = Math.max(c.width / hp.width, c.height / hp.height); g.drawImage(hp, (c.width - hp.width * sc) / 2, 0, hp.width * sc, hp.height * sc); return; } else if (hp === null) setTimeout(drawPreview, 300); g.save(); g.translate(110, 190); g.scale(4, 4); drawHumanCtx(g, 0, 0, Math.PI / 2, lookOf({ origin: CREATE.origin, gender: CREATE.gender, hair: CREATE.hair, hairCol: CREATE.hairCol, clothCol: CREATE.clothCol }), {}); g.restore(); }
function showDeath(where) {
  running = false; const el = $('death'); el.hidden = false; music('title');
  el.innerHTML = `<div class="death-in"><h2>${esc(S.name)}　死於${where}</h2><p>第 ${S.gen} 代・${ORIGINS[S.origin].n}・${realmOf(power())}・善惡 ${S.karma}・遊玩 ${Math.round(S.stats.play / 60)} 分鐘</p>
  <p class="note">硬核江湖，死了就是死了。存檔已刪除，名字刻上青崖山的墓碑。全部秘笈、裝備與蓋好的建築，會傳給下一代。</p><div class="go"><button class="seal big" id="d-next">開始下一代</button><button class="seal ghost" id="d-card">江湖生平卡</button></div></div>`;
  $('d-next').onclick = () => location.reload(); $('d-card').onclick = () => showCard(where);
}
function showCard(where) { const c = document.createElement('canvas'); c.width = 900; c.height = 1200; drawLifeCard(c, where); const url = c.toDataURL('image/png'); $('card').hidden = false; $('card-img').src = url; }
$('card').addEventListener('click', e => { if (e.target.id === 'card' || e.target.dataset.close !== undefined) $('card').hidden = true; });
$('modal-yes').addEventListener('click', () => closeModal(true)); $('modal-no').addEventListener('click', () => closeModal(false));
$('dlg').addEventListener('click', e => { if (e.target.closest('#dlg-tools')) return; advanceDlg(); });
$('dlg-skip').addEventListener('click', e => { e.stopPropagation(); skipDlg(); }); $('dlg-log').addEventListener('click', e => { e.stopPropagation(); openPanel('char', 'story'); });

function artProgTxt(id) { const b = getBook(id), s = S.books[id], n = artNeed(id); return `修練 ${Math.min(s.prog || 0, n)}/${n}${ART_UNIT[b.cat] ? " " + ART_UNIT[b.cat] : ""}${(s.prog || 0) >= n ? "（圓滿，可突破）" : ""}`; }
function artEffectRaw(id) { return artEffect(id, 1); }

/* ---------- 讀檔：出錯時不要卡在標題畫面 ---------- */
function repairSave(s) {
  const inRoom = ROOMS.some(rm => s.px > rm.x - 60 && s.px < rm.x + rm.w + 60 && s.py > rm.y - 60 && s.py < rm.y + rm.h + 60);
  if (!isFinite(s.px) || !isFinite(s.py) || (!inRoom && (s.px < 0 || s.px > MAP_W || s.py < 0 || s.py > MAP_H)) || ROOMS.some(rm => rm.id === 'tower_room' && s.px > rm.x - 60 && s.px < rm.x + rm.w + 60 && s.py > rm.y - 60 && s.py < rm.y + rm.h + 60)) { s.px = PLACES.base.x; s.py = PLACES.base.y + 160; }
  if (s.title && !ACHIEVEMENTS.some(a => a.title === s.title)) s.title = null;
  const okItem = it => it && (!it.unique || UNIQUE_GEAR[it.unique]) && (!it.set || SETS[it.set]);
  if (Array.isArray(s.bag)) s.bag = s.bag.filter(okItem); if (s.gear) for (const k in s.gear) if (s.gear[k] && !okItem(s.gear[k])) s.gear[k] = null;
  if (s.books) for (const k in s.books) if (!BOOKS[k] && !(s.customBooks || {})[k]) delete s.books[k];
  if (s.slots) for (const k in s.slots) { const v = s.slots[k]; if (Array.isArray(v)) s.slots[k] = v.map(id => id && s.books[id] ? id : null); else if (v && !s.books[v]) s.slots[k] = null; }
  if (s.companion && !(typeof BONDS !== 'undefined' && BONDS[s.companion])) s.companion = null; if (s.pet && !s.pets.includes(s.pet)) s.pet = null;
  return s;
}
function continueGame(retry) {
  let raw = lsGet(SAVE_KEY); let s = null, err = null;
  try { let main = null; try { main = JSON.parse(raw); } catch (e) { } if (!validSave(main)) { const bak = lsGet(SAVE_KEY + '_bak'); let b = null; try { b = JSON.parse(bak); } catch (e) { } if (validSave(b)) { raw = bak; toast('主存檔損壞，已讀取備份存檔', 'red'); } else if (main && !validSave(main)) throw new Error('存檔裡沒有角色資料（可能被空白資料蓋掉了），也沒有可用的備份。'); }
    s = JSON.parse(raw); s = migrate(s); repairSave(s); if (retry) { s.px = PLACES.base.x; s.py = PLACES.base.y + 160; s.companion = null; } startGame(s); return; }
  catch (e) { err = e; console.error(e); }
  running = false; $('title').hidden = false; $('hud').hidden = true;
  const code = (() => { try { return 'YJ1-0-' + btoa(unescape(encodeURIComponent(raw || ''))); } catch (e) { return ''; } })();
  let ov = document.getElementById('saveerr'); if (!ov) { ov = document.createElement('div'); ov.id = 'saveerr'; ov.style.cssText = 'position:fixed;inset:0;z-index:90;display:grid;place-items:center;background:rgba(29,26,23,.5);padding:16px'; document.body.appendChild(ov); } ov.hidden = false;
  ov.innerHTML = `<div style="max-width:560px;max-height:90dvh;overflow:auto;background:var(--paper);border:2px solid var(--ink);padding:16px"><h3 style="color:var(--cin);margin:0 0 8px">讀取存檔時出錯</h3><p>${esc(String(err && err.message || err))}</p><p class="note">${esc(String(err && err.stack || '').split('\n').slice(1, 3).join(' '))}</p>
    <div class="btns"><button class="seal" id="se-retry">回到青崖小築再試一次</button><button class="seal ghost" id="se-copy">複製存檔碼（傳給製作者）</button><button class="seal ghost" id="se-close">關閉</button></div><textarea id="se-code" style="width:100%;height:70px;margin-top:8px" readonly>${code}</textarea></div>`;
  $('se-retry').onclick = () => { ov.hidden = true; continueGame(true); };
  $('se-copy').onclick = () => { const t = $('se-code'); t.select(); try { navigator.clipboard.writeText(t.value); } catch (e) { document.execCommand('copy'); } $('se-copy').textContent = '已複製'; };
  $('se-close').onclick = () => { ov.hidden = true; };
}
