'use strict';
/* 一命江湖 2b — 第二章後半：中原古城、崑崙山仙境、最終頭目（資料）
   本檔接在 data2.js 之後載入，只往既有的表裡加東西。 */

/* ---------- 資源 ---------- */
Object.assign(RES, { xianhe: { n: '仙鶴羽', s: '鶴羽' }, renshen: { n: '人參', s: '人參' } });
RARE_ORES.push('xianhe'); SPECIALTY.push('renshen');
Object.assign(PILLS, { ningshen: { n: '凝神丹', need: { herb: 20, renshen: 2 }, lv: 3, d: '10 分鐘內內力回復 +50%' } });

/* ---------- 區域 ---------- */
Object.assign(REGIONS, {
  zhong: { n: '中原古城', short: '中原', realm: '宗師', tint: [196, 178, 140], weather: ['晴', '雨', '晴'] },
  kunlun: { n: '崑崙山仙境', short: '崑崙', realm: '宗師', tint: [214, 222, 228], weather: ['雪', '雲海', '雪', '雲海'] },
});
REGION_ORDER.push('zhong', 'kunlun');
Object.assign(SETS, {
  leitai: { n: '擂台套', region: 'zhong', b2: '暴擊率 +5%', b4: '暴擊傷害 +20%', b6: '合擊傷害 +40%' },
  taiqing: { n: '太清套', region: 'kunlun', b2: '內力 +15%', b4: '內力回復 +25%', b6: '走火入魔機率 −5%' },
});
Object.assign(REGION_SET, { zhong: 'leitai', kunlun: 'taiqing' });
Object.assign(UNIQUE_GEAR, {
  catch_chain: { n: '捕頭鐵尺', slot: 'acc', crit: 0.06, hp: 60, d: '暴擊 +6%、氣血 +60' },
  bear_belt: { n: '黑熊腰帶', slot: 'belt', hp: 140, d: '氣血 +140' },
  pine_crown: { n: '青松道冠', slot: 'hat', mp: 60, d: '內力 +60' },
  ape_ring: { n: '白猿指環', slot: 'acc', crit: 0.08, dcd: 0.06, d: '暴擊 +8%、閃身冷卻 −6%' },
  gold_abacus: { n: '金算盤', slot: 'acc', crit: 0.1, attr: '剛', attrDmg: 0.24, d: '暴擊 +10%、剛屬性傷害 +24%' },
  crane_robe: { n: '雲鶴道袍', slot: 'robe', hp: 160, mp: 60, d: '氣血 +160、內力 +60' },
  meng_seal: { n: '盟主金印', slot: 'acc', crit: 0.12, attr: '柔', attrDmg: 0.3, d: '暴擊 +12%、柔屬性傷害 +30%' },
  xian_gourd: { n: '仙人葫蘆', slot: 'belt', hp: 220, pot: 0.3, d: '氣血 +220、藥效 +30%' },
  qingxu_cup: { n: '師父的茶杯', slot: 'acc', crit: 0.1, mp: 80, attr: '寒', attrDmg: 0.25, d: '暴擊 +10%、內力 +80、寒屬性傷害 +25%' },
});

/* ---------- 秘笈 ---------- */
Object.assign(BOOKS.leitai_fist, { src: '中原古城・擂台（擂台連勝 5 場）' });
Object.assign(BOOKS.haoran_sword, { src: '中原古城・正派會館（善惡值 ≥ +30）' });
Object.assign(BOOKS.taiqing, { src: '崑崙山・道觀，銀兩 800' });
Object.assign(BOOKS.hanyun, { src: '崑崙山・道觀（通過雲海試煉）' });
Object.assign(BOOKS, {
  tianji: { n: '天機鏢', cat: 'weapon', w: 'dart', tier: 2, attrs: ['柔', '毒'], pat: 'fan', mp: 26, cd: 6, mult: 1.2, src: '世外高人・說書人張半瞎（答對三題江湖傳聞）', ch: 2, master: true },
  hunyuan: { n: '混元一氣', cat: 'inner', tier: 2, attrs: ['剛', '柔'], mp: 30, cd: 8, mult: 1.4, src: '世外高人・掃地道人（30 秒內不受傷擊敗 20 隻傀儡）', ch: 2, master: true },
  // 知己合擊秘笈（結為知己、好感 100 才學得到；施展時知己的水墨虛影一同出手）
  shuanggu: { n: '雙蠱連環', cat: 'weapon', w: 'dart', tier: 2, attrs: ['毒', '毒'], pat: 'ring', mp: 32, cd: 8, mult: 1.6, src: '知己・藍姑', ch: 2, heji: 'langu' },
  jinghong_ying: { n: '驚鴻照影', cat: 'weapon', w: 'sword', tier: 2, attrs: ['柔', '剛'], pat: 'thrust3', mp: 32, cd: 8, mult: 1.7, src: '知己・林家兄妹', ch: 2, heji: 'lin' },
  qingya_shuang: { n: '青崖雙劍', cat: 'weapon', w: 'sword', tier: 2, attrs: ['柔', '柔'], pat: 'orbit', mp: 32, cd: 8, mult: 1.3, src: '知己・青崖師兄姐', ch: 2, heji: 'sibling' },
  zhuying_sha: { n: '竹影雙殺', cat: 'weapon', w: 'dart', tier: 2, attrs: ['柔', '毒'], pat: 'fan', mp: 32, cd: 8, mult: 1.6, src: '知己・柳無痕', ch: 2, heji: 'liu' },
  // 血獄試煉塔獨家
  xueyu_jian: { n: '血獄劍經', cat: 'weapon', w: 'sword', tier: 2, attrs: ['柔', '柔'], pat: 'orbit', mp: 30, cd: 7, mult: 1.6, src: '血獄試煉塔・第 25 層', ch: 3 },
  xiuluo_dao: { n: '修羅刀', cat: 'weapon', w: 'blade', tier: 2, attrs: ['剛', '剛'], pat: 'wave', mp: 30, cd: 7, mult: 2.0, src: '血獄試煉塔・第 50 層', ch: 3 },
  yanluo_zhang: { n: '閻羅掌', cat: 'weapon', w: 'fist', tier: 2, attrs: ['寒', '寒'], pat: 'cone', mp: 30, cd: 7, mult: 1.9, src: '血獄試煉塔・第 75 層', ch: 3 },
  wuying_zhen: { n: '無影針', cat: 'weapon', w: 'dart', tier: 2, attrs: ['毒', '毒'], pat: 'fan', mp: 30, cd: 6, mult: 1.8, src: '血獄試煉塔・第 100 層', ch: 3 },
});

/* ---------- 怪物（宗師） ---------- */
Object.assign(ENEMIES, {
  guard: { n: '官兵', hp: 360, dmg: 36, spd: 115, r: 17, ai: 'melee', xiu: 34, silver: [16, 30], drops: { iron: 0.35, cloth: 0.3 }, look: 'man', robe: '#5a3a2a', acc: '#a07f3c', hat: 'douli', weapon: 'spear', res: { 剛: 0.3 }, noKb: true, region: 'zhong' },
  xbow: { n: '弩手', hp: 260, dmg: 30, spd: 95, r: 16, ai: 'ranged', volley: 3, xiu: 32, silver: [16, 30], drops: { iron: 0.4 }, look: 'man', robe: '#4a3a2a', acc: '#6b4a2a', hat: 'douli', weapon: 'bow', res: { 剛: 0.3 }, region: 'zhong' },
  thug: { n: '黑市打手', hp: 320, dmg: 34, spd: 140, r: 17, ai: 'melee', combo: true, xiu: 32, silver: [20, 36], drops: { cloth: 0.4, page: 0.04 }, look: 'man', robe: '#2a2a2a', acc: CIN, weapon: 'blade', region: 'zhong' },
  dogman: { n: '鬥犬販子', hp: 280, dmg: 26, spd: 100, r: 17, ai: 'summon', summon: 'hound', xiu: 30, silver: [18, 32], drops: { fur: 0.4 }, look: 'man', robe: '#6a5a3a', acc: '#3a2a20', weapon: 'fist', region: 'zhong' },
  hound: { n: '鬥犬', hp: 120, dmg: 24, spd: 200, r: 14, ai: 'melee', xiu: 10, silver: [0, 3], drops: { fur: 0.3 }, look: 'wolf', robe: '#6a4a2a', region: 'zhong' },
  puppet: { n: '道觀傀儡', hp: 420, dmg: 34, spd: 90, r: 19, ai: 'melee', sweep: true, xiu: 34, silver: [8, 18], drops: { iron: 0.45, bone: 0.2 }, look: 'man', robe: '#8a7a5a', acc: '#d9d6cf', hat: 'none', weapon: 'fist', res: { 寒: 0.5, 毒: 1 }, region: 'kunlun' },
  ape: { n: '雲猿', hp: 300, dmg: 34, spd: 185, r: 18, ai: 'dash', xiu: 30, silver: [4, 10], drops: { fur: 0.5, renshen: 0.03 }, look: 'bear', robe: '#d9d6cf', res: { 寒: 0.5 }, region: 'kunlun' },
  talisman: { n: '符童', hp: 180, dmg: 30, spd: 90, r: 13, ai: 'ranged', shot: 'talisman', xiu: 28, silver: [8, 18], drops: { herb: 0.4, page: 0.04 }, look: 'kid', robe: '#d9c070', res: { 寒: 0.5 }, region: 'kunlun' },
  furnace: { n: '丹爐', hp: 520, dmg: 10, spd: 0, r: 24, ai: 'summon', summon: 'minipuppet', xiu: 34, silver: [10, 20], drops: { herb: 0.5, renshen: 0.06 }, look: 'jar', res: { 寒: 0.5, 毒: 1 }, region: 'kunlun' },
  minipuppet: { n: '小傀儡', hp: 110, dmg: 20, spd: 170, r: 12, ai: 'melee', xiu: 8, silver: [0, 3], drops: { wood: 0.3 }, look: 'kid', robe: '#8a7a5a', res: { 毒: 1 }, region: 'kunlun' },
  thunder: { n: '雷傀儡', hp: 480, dmg: 42, spd: 80, r: 21, ai: 'slam', xiu: 38, silver: [10, 22], drops: { iron: 0.5, xianhe: 0.02 }, look: 'man', robe: '#4a4a5a', acc: GOLD, hat: 'none', weapon: 'fist', res: { 寒: 0.5, 毒: 1 }, thunder: true, region: 'kunlun' },
  crane: { n: '仙鶴', hp: 160, dmg: 18, spd: 210, r: 15, ai: 'dash', xiu: 16, silver: [0, 2], drops: { xianhe: 0.5 }, look: 'bird', robe: '#f0ece4', fly: true, region: 'kunlun' },
  zp_hero: { n: '正派高手', hp: 500, dmg: 40, spd: 140, r: 17, ai: 'dash', xiu: 0, silver: [0, 0], drops: {}, look: 'man', robe: '#efece4', acc: '#33536a', hat: 'none', weapon: 'sword', region: 'zhong' },
});
Object.assign(NAMED, {
  tiebutou: { n: '鐵捕頭', base: 'guard', hp: 5200, dmg: 52, r: 22, drop: 'catch_chain', special: 'chain', story: '六扇門出身的老捕頭，一條鐵尺鎖過無數江洋大盜。現在只替盟主府抓人。', look: { robe: '#3a2a20', acc: GOLD, hat: 'douli', weapon: 'spear', beard: true } },
  heixiong: { n: '黑熊', base: 'thug', hp: 5600, dmg: 56, r: 26, drop: 'bear_belt', special: 'roar', story: '黑市第一打手，一身橫練，吼一聲能把人震退三步。', look: { robe: '#1d1a17', acc: '#6a4a2a', hat: 'none', weapon: 'fist', beard: true } },
  qingsong: { n: '青松道童', base: 'talisman', hp: 4600, dmg: 46, r: 18, drop: 'pine_crown', special: 'talisman', story: '道觀裡最小的道童，操縱傀儡比走路還熟。他不知道傀儡裡裝的是什麼。', look: { robe: '#3f6b5a', acc: '#d9d6cf', hat: 'none', weapon: 'none' } },
  baiyuan: { n: '白猿老祖', base: 'ape', hp: 6000, dmg: 54, r: 28, drop: 'ape_ring', special: 'leapape', story: '雲海裡活了三百年的老白猿，據說偷過仙人的桃。', look: { robe: '#f0ece4' } },
});
Object.assign(BOSS, {
  jinsuanpan: { n: '黑市之主 金算盤', short: '金算盤', hp: 30000, dmg: 62, spd: 140, r: 28, robe: '#5a4a2a', acc: GOLD, hat: 'none', weapon: 'fist', region: 'zhong', res: { 剛: 0.3 }, ult: '一本萬利' },
  yunhe: { n: '守山真人 雲鶴', short: '雲鶴真人', hp: 32000, dmg: 64, spd: 160, r: 26, robe: '#e8e4dc', acc: '#33536a', hat: 'none', weapon: 'sword', region: 'kunlun', res: { 寒: 0.5 }, ult: '鶴唳九霄' },
  linxiao: { n: '武林盟主 林嘯天', short: '林嘯天', hp: 46000, dmg: 74, spd: 165, r: 28, robe: '#efece4', acc: GOLD, hat: 'none', weapon: 'sword', region: 'zhong', res: { 剛: 0.3 }, ult: '天下歸一', final: true },
  xuanxiao: { n: '崑崙仙人 玄霄真君', short: '玄霄真君', hp: 46000, dmg: 74, spd: 150, r: 28, robe: '#f4f2ec', acc: '#8a9aa8', hat: 'none', weapon: 'none', region: 'kunlun', res: { 寒: 0.5 }, ult: '白日飛昇', final: true },
  qingxu: { n: '青崖派掌門 清虛子', short: '清虛子', hp: 48000, dmg: 76, spd: 160, r: 26, robe: '#5a6a5a', acc: '#d9d6cf', hat: 'none', weapon: 'sword', region: 'village', ult: '血影歸元', final: true },
});
WISDOM.push('中原官兵站得穩，剛勁打不退他們。', '崑崙的傀儡不怕毒，用別的屬性對付。', '雲海天會飛來仙鶴，打下來掉仙鶴羽。', '擂台連勝五場，擂台主會教你擂台拳。',
  '說書人張半瞎只考你自己讀過的傳聞。', '三條線索，誰多誰就是最後的那個人。', '表白之後，就不能回頭了。');

/* ---------- 人物 ---------- */
Object.assign(NPCS, {
  zhangbanxia: { n: '說書人 張半瞎', look: { robe: '#5a4a3a', acc: '#2a2a2a', hair: '#8a8278', hat: 'none', beard: true } },
  saodi: { n: '掃地道人', look: { robe: '#7a7466', acc: '#4a4a4a', hair: '#d9d6cf', hat: 'none', beard: true } },
  guanzhu: { n: '崑崙觀主 鶴松道長', look: { robe: '#d9d6cf', acc: '#33536a', hair: '#d9d6cf', hat: 'none', beard: true } },
  leitai_master: { n: '擂台主 鐵臂周通', look: { robe: '#8a3a2a', acc: '#1d1a17', hair: INK, hat: 'none', beard: true } },
  huiguan: { n: '正派會館執事', look: { robe: '#efece4', acc: '#33536a', hair: INK, hat: 'none' } },
  yushuang: { n: '盟主之女 林語霜', look: { robe: '#efece4', acc: '#b0607a', hair: INK, hat: 'none', gender: 'f' } },
  jinghong: { n: '盟主之子 林驚鴻', look: { robe: '#efece4', acc: '#33536a', hair: INK, hat: 'none' } },
  linxiao: { n: '武林盟主 林嘯天', look: { robe: '#efece4', acc: GOLD, hair: '#5a4a3a', hat: 'none', beard: true } },
  xuanxiao: { n: '玄霄真君', look: { robe: '#f4f2ec', acc: '#8a9aa8', hair: '#f0ece4', hat: 'none', beard: true } },
  jinsuanpan: { n: '金算盤', look: { robe: '#5a4a2a', acc: GOLD, hair: INK, hat: 'none', beard: true } },
  yunhe: { n: '雲鶴真人', look: { robe: '#e8e4dc', acc: '#33536a', hair: '#d9d6cf', hat: 'none', beard: true } },
  zy_smith: { n: '兵器鋪 歐老闆', look: { robe: '#6a5a4a', acc: '#2a2a2a', hair: INK, hat: 'none', beard: true } },
  gambler: { n: '賭坊莊家 錢三手', look: { robe: '#7a2a2a', acc: GOLD, hair: INK, hat: 'none' } },
  crane_old: { n: '仙鶴老人', look: { robe: '#f0ece4', acc: '#2a2a2a', hair: '#f0ece4', hat: 'none', beard: true } },
  qingfeng: { n: '小道士 清風', look: { robe: '#3f6b5a', acc: '#d9d6cf', hair: INK, hat: 'none' } },
});
const CH2B_PEOPLE = ['zhangbanxia', 'saodi', 'guanzhu', 'leitai_master', 'yushuang', 'jinghong', 'linxiao', 'xuanxiao', 'jinsuanpan', 'yunhe'];
Object.assign(DISCIPLES.qingfeng, { how: 'kunlun', story: '崑崙道觀的小道士，看見了傀儡殿裡的東西，連夜逃下山。' });

/* ---------- 主線：中原古城 ---------- */
NODES.push(
  { id: 'z1', region: 'zhong', t: '古城', steps: [{ type: 'reach', place: 'station_zhong', d: '往東出山口，找到古城驛站' }, { type: 'talk', npc: 'huiguan', d: '進城，到正派會館報上名號' }],
    lines: [{ who: 'narr', t: '城牆比青崖山還高。城門口貼滿了懸賞告示，最上面那張畫著一個戴斗笠的人，底下寫著：「血影餘孽，格殺勿論。」' }, { who: 'narr', t: '畫像畫得很潦草，可你越看越覺得眼熟──那是師父年輕時的樣子。' }],
    done: [{ who: 'huiguan', t: '青崖派？……這幾年倒是少聽見了。在下會館執事，盟主吩咐過，各路豪傑進城都要登記。' }, { who: 'huiguan', t: '對了，盟主的公子和小姐這幾日也在會館。年輕人，多走動走動。' },
      { who: 'me', t: { xia: '晚輩來中原，是想查清楚南方那些事的來龍去脈。', mo: '登記？好，記清楚了，我叫什麼。', zhong: '盟主的公子小姐？我只是來吃碗麵的。' } }],
    reward: { bond: 'lin', rep: { righteous: 5 } } },
  { id: 'z2', region: 'zhong', t: '擂台', steps: [{ type: 'talk', npc: 'leitai_master', d: '去城中央的武林大會擂台' }, { type: 'waves', id: 'leitai3', place: 'leitai', enemies: ['thug', 'guard', 'thug'], d: '上擂台連過三關' }],
    lines: [{ who: 'leitai_master', t: '新面孔！要上台？台上不問出身，只問拳頭。' }, { who: 'leitai_master', t: '三關過了，你在中原就算有名有姓。五場連勝，我周通親手教你擂台拳！' }],
    done: [{ who: 'leitai_master', t: '好！好身手！……可惜啊，這擂台過幾天就要借給盟主辦武林大會，到時候上台的，可就不是這些蝦兵蟹將了。' }],
    reward: { silver: 800, rep: { righteous: 5 } } },
  { id: 'z3', region: 'zhong', t: '茶樓說書', steps: [{ type: 'talk', npc: 'zhangbanxia', d: '去茶樓聽說書' }, { type: 'trial', id: 'zhangbanxia', place: 'teahouse', d: '接受張半瞎的考驗：答對三題江湖傳聞' }],
    lines: [{ who: 'zhangbanxia', t: '啪！話說三十年前，江湖上有三個結拜兄弟，一個要做天下第一，一個要長生不老，一個……一個只想喝茶。' }, { who: 'zhangbanxia', t: '欸，這位客官，你身上有青崖山的茶味。……想聽下回分解？先陪我老瞎子玩個遊戲。' },
      { who: 'me', t: { xia: '前輩請說。', mo: '說吧。我耐心不多。', zhong: '說書還要考試？' } }, { who: 'zhangbanxia', t: '江湖傳聞，你讀過幾則？老瞎子問三題，答對了，我就把壓箱底的功夫給你。' }],
    done: [{ who: 'zhangbanxia', t: '三題全對！你這雙眼，比老瞎子的亮。《天機鏢》拿去，鏢走天機，一出手就沒有回頭路。' }, { who: 'zhangbanxia', t: '至於那三個結拜兄弟……老大後來當了盟主，老二上了崑崙，老三……老三回了一座小山，種茶。' }],
    reward: { book: 'tianji' } },
  { id: 'z4', region: 'zhong', t: '黑市', steps: [{ type: 'clear', camp: 'thug_alley', d: '清掉城西南的黑市後巷' }, { type: 'reach', place: 'blackmarket', d: '進城，找到黑市的門路' }],
    done: [{ who: 'narr', t: '黑市藏在一排賣香燭的攤子後面。攤販看見你身上的血跡，二話不說就讓了路。' }, { who: 'narr', t: '最裡面的帳房鎖著一口鐵箱，箱子上貼著封條，蓋著兩枚印：一枚金印，一枚鶴印。' }] },
  { id: 'z5', region: 'zhong', t: '官兵營', steps: [{ type: 'clear', camp: 'guard_camp', d: '城東的官兵營關著苗疆抓來的人，去把他們放出來' }],
    lines: [{ who: 'huiguan', t: '城東官兵營最近押進一批苗人，說是蠱師。……可我看見的，都是些老人和孩子。' }],
    done: [{ who: 'narr', t: '牢門打開，苗人們縮在角落。一個老婦人認出你身上的避毒香：「是白婆的香……你是苗疆的朋友。」' }, { who: 'narr', t: '「他們說，抓夠一百個苗人，就能向盟主交差，說苗疆蠱禍已平。」' }],
    reward: { rep: { wudu: 15, righteous: -5 } } },
  { id: 'z6', region: 'zhong', t: '★黑市帳本', steps: [{ type: 'choice', id: 'ledger', place: 'blackmarket', d: '撬開黑市帳房的鐵箱',
      lines: [{ who: 'narr', t: '鐵箱裡是一本帳。每個月一筆「薪柴錢」，三年從未斷過：人從苗疆、東海送出，經過古城，最後上了崑崙。' }, { who: 'narr', t: '付款那一欄蓋著金印；收貨那一欄，畫著一隻小小的鶴。' }],
      opts: [{ label: '順著金印往上查（盟主線 +1）', clue: 'meng', after: [{ who: 'narr', t: '金印的主人不難查。古城裡能用金印的，只有一個地方──盟主府。' }, { who: 'me', t: { xia: '正派之首，拿人換錢……', mo: '盟主的生意，做得比黑市還大。', zhong: '這印蓋得還挺正，一看就是常蓋。' } }] },
        { label: '順著鶴印往上查（仙人線 +1）', clue: 'xian', after: [{ who: 'narr', t: '帳本最後一頁夾著一根白色的鶴羽，聞起來有淡淡的松香。' }, { who: 'narr', t: '和苗疆蠱痕盡頭的那撮鶴羽，是同一種。' }] }] }] },
  { id: 'z7', region: 'zhong', t: '盟主', steps: [{ type: 'talk', npc: 'linxiao', d: '盟主府遞來請帖，去見武林盟主' }],
    lines: [{ who: 'linxiao', t: '你就是平了苗疆、東海的那位少俠？好，好！江湖代有人才出。' }, { who: 'linxiao', t: '在下林嘯天，忝為武林盟主。說來慚愧，這些年蠱禍海患，盟裡總是慢了一步。' },
      { who: 'me', t: { xia: '盟主言重了，晚輩只是盡本分。', mo: '盟主客氣。慢一步，有時候是故意的吧？', zhong: '盟主府的茶，比會館的好喝。' } }, { who: 'linxiao', t: '三日後我設宴，替少俠接風。還有幾位老朋友，想讓你見見。' }] },
  { id: 'z8', region: 'zhong', t: '★盟主賜宴', steps: [{ type: 'choice', id: 'banquet', place: 'mengzhu_fu', d: '赴盟主府的接風宴',
      lines: [{ who: 'narr', t: '宴席擺在盟主府正廳，各派掌門都到了。酒過三巡，林嘯天站起來，舉杯朝你走來。' }, { who: 'linxiao', t: '少俠，林某有一事相求。血影教雖滅，創教之人卻還活著，三十年來躲在一座小山上，收徒、種茶。' },
        { who: 'linxiao', t: '他教出來的徒弟，個個本事了得──就像你。這面盟主令，你接不接？' }],
      opts: [{ label: '接下盟主令，聽他說下去（師父線 +1）', clue: 'shi', rep: { righteous: 10 }, after: [{ who: 'linxiao', t: '好！這是血影教的創教手札，字跡你應該認得。' }, { who: 'narr', t: '泛黃的手札上，是你從小看到大的字──每一筆都和師父寫在茶罐上的一模一樣。' }] },
        { label: '當席揭穿帳本與金印（盟主線 +1）', clue: 'meng', karma: 5, rep: { righteous: -10 }, after: [{ who: 'narr', t: '你把帳本拍在桌上。滿廳的掌門面面相覷，林嘯天的笑容一點也沒變。' }, { who: 'linxiao', t: '少俠喝多了。來人，送客。……我們後會有期。' }] }] }] },
  { id: 'z9', region: 'zhong', t: '地下賭坊', steps: [{ type: 'waves', id: 'den_guards', place: 'gamble_den', enemies: ['thug', 'dogman', 'thug', 'xbow'], d: '闖進城南的地下賭坊，打退三波護院' }],
    lines: [{ who: 'gambler', t: '客官要玩大的？大的在地底下。……只是莊家今晚心情不好，輸的人，可是要拿命來賠的。' }],
    done: [{ who: 'narr', t: '賭坊深處，一個胖子坐在金子堆成的台子上撥算盤。每撥一下，就有人倒下一個。' }, { who: 'narr', t: '「客官，你砸了我三波生意。」他頭也不抬，「這筆帳，我們好好算算。」' }] },
  { id: 'z10', region: 'zhong', t: '金算盤', steps: [{ type: 'boss', id: 'jinsuanpan', d: '在地下賭坊與黑市之主金算盤一決' }] },
);

/* ---------- 主線：崑崙山仙境 ---------- */
NODES.push(
  { id: 'k1', region: 'kunlun', t: '上崑崙', steps: [{ type: 'reach', place: 'station_kunlun', d: '往東北出山口，找到崑崙驛站' }, { type: 'talk', npc: 'guanzhu', d: '上山拜見崑崙觀主' }],
    lines: [{ who: 'narr', t: '雲從腳下湧上來。山路一轉，遠處的峰頂浮在雲海上，像一座座孤島。' }, { who: 'narr', t: '路邊的松樹上，掛著一串串紙紮的鶴。風一吹，紙鶴翅膀拍個不停。' }],
    done: [{ who: 'guanzhu', t: '福生無量天尊。青崖的朋友？……貧道鶴松，暫管這座道觀。' }, { who: 'guanzhu', t: '山上的事，少俠最好別問太多。真君在雲海天台閉關三十年，觀裡的人，越來越少了。' },
      { who: 'me', t: { xia: '道長，觀裡的人去了哪裡？', mo: '越來越少？被誰吃了？', zhong: '這裡的雲，比青崖的厚。' } }, { who: 'guanzhu', t: '……傀儡殿裡，多了很多傀儡。' }],
    reward: { rep: { righteous: 5 } } },
  { id: 'k2', region: 'kunlun', t: '雲中猿群', steps: [{ type: 'clear', camp: 'ape_cliff', d: '趕走擾觀的雲猿' }, { type: 'learn', books: ['taiqing'], place: 'taoguan', d: '回道觀學《太清心法》（銀兩 800）' }],
    lines: [{ who: 'guanzhu', t: '猿群這幾年脾氣越來越壞。老人們說，是山上的靈氣被人吸走了。' }],
    done: [{ who: 'guanzhu', t: '太清心法，講的是一個「靜」字。少俠殺氣太重，正好用得上。' }] },
  { id: 'k3', region: 'kunlun', t: '掃地道人', steps: [{ type: 'reach', place: 'saodi', d: '去道觀後院，看看那個一直在掃地的老道人' }, { type: 'trial', id: 'saodi', place: 'saodi', d: '接受掃地道人的考驗：30 秒內不受傷擊敗 20 隻傀儡' }],
    lines: [{ who: 'saodi', t: '落葉掃不完的。……你踩到我剛掃好的地了。' }, { who: 'saodi', t: '想學功夫？觀裡的傀儡，你三十息之內打倒二十個，身上不許沾一點灰。' },
      { who: 'me', t: { xia: '晚輩願意一試。', mo: '二十個？太少了。', zhong: '不沾灰……那我先洗個澡？' } }],
    done: [{ who: 'saodi', t: '一點灰也沒沾。……好。《混元一氣》給你。剛柔本是一氣，就像落葉和掃帚。' }, { who: 'saodi', t: '那些傀儡，以前都是人。貧道每天掃地，掃的是他們的灰。' }],
    reward: { book: 'hunyuan' } },
  { id: 'k4', region: 'kunlun', t: '傀儡殿', steps: [{ type: 'clear', camp: 'puppet_hall', d: '闖進傀儡殿' }],
    done: [{ who: 'narr', t: '倒下的傀儡衣服底下，露出了真正的衣衫：峨眉的、少林的、崆峒的……都是苗疆營地裡失蹤的那些人的門派。' }, { who: 'narr', t: '殿角的供桌下，縮著一個小道士，抱著拂塵發抖：「別、別殺我……我什麼都沒看見……」' },
      { who: 'me', t: { xia: '別怕，跟我下山吧。', mo: '看見了就是看見了。走，跟我回青崖。', zhong: '你叫什麼？……清風？好名字，跟我走吧。' } }],
    reward: { disciple: 'qingfeng' } },
  { id: 'k5', region: 'kunlun', t: '◎被擄的弟子', steps: [{ type: 'rescue', id: 'disciple', place: 'taoguan', d: '一隻紙鶴從青崖方向飛來' }] },
  { id: 'k6', region: 'kunlun', t: '★仙人賜丹', steps: [{ type: 'choice', id: 'pill', place: 'taoguan', d: '雲海上落下一隻白鶴，有人在道觀前等你',
      lines: [{ who: 'narr', t: '白鶴落地，化成一個白衣老道。他的臉年輕得像二十歲，眼睛卻老得像三百歲。' }, { who: 'xuanxiao', t: '好根骨。三年前在血池殿，貧道就聞到你了。' },
        { who: 'xuanxiao', t: '這顆丹，吃了延壽三十年、內力翻倍。江湖人為它殺得頭破血流，貧道送你。' }],
      opts: [{ label: '收下仙丹（仙人線 +1）', clue: 'xian', reward: { pill_xian: true }, after: [{ who: 'narr', t: '丹藥入口即化，一股暖流從丹田升起──暖得過頭了，像有一根細細的線，從你的經脈一路通向雲上。' }, { who: 'xuanxiao', t: '善。等你養足了，貧道再來取。' }] },
        { label: '婉拒，悄悄把丹藥交給掃地道人化驗（師父線 +1）', clue: 'shi', after: [{ who: 'saodi', t: '這丹方……是用人的內力煉的。配方的底子，是一門很老的功夫。' }, { who: 'saodi', t: '貧道年輕時見過一次。寫那本手札的人，在青崖山上種茶。' }] }] }] },
  { id: 'k7', region: 'kunlun', t: '雲海試煉', steps: [{ type: 'waves', id: 'cloud_sea', place: 'yunhai_trial', enemies: ['ape', 'thunder', 'talisman', 'puppet'], d: '到雲海崖接受道觀的雲海試煉：撐過三波' }],
    lines: [{ who: 'guanzhu', t: '想學寒雲勁，得先過雲海試煉。雲海崖上什麼都會冒出來──也包括你心裡的東西。' }],
    done: [{ who: 'guanzhu', t: '雲散了，你還站著。寒雲勁是你的了。' }], reward: { book: 'hanyun' } },
  { id: 'k8', region: 'kunlun', t: '★傀儡的真相', steps: [{ type: 'choice', id: 'puppet_truth', place: 'puppet_lab', d: '摸進道觀東邊的煉偶房',
      lines: [{ who: 'narr', t: '煉偶房裡吊著上百具傀儡，每一具的心口都插著一根銀針，針上纏著一縷內力。地上堆著一本名冊。' }, { who: 'narr', t: '角落裡一具傀儡的手指動了一下。它的嘴一開一合，好像還想說話。' }],
      opts: [{ label: '帶走名冊，看看是誰送來的人（盟主線 +1）', clue: 'meng', after: [{ who: 'narr', t: '名冊上的名字，一半是苗疆和東海抓來的，另一半──是這些年和盟主作對、後來「暴病身亡」的各派高手。' }, { who: 'narr', t: '每一頁的角落，都蓋著那枚金印。' }] },
        { label: '拔掉傀儡心口的銀針，聽它說話（師父線 +1）', clue: 'shi', after: [{ who: 'narr', t: '傀儡的眼睛亮了一瞬：「……三兄弟……真經……清虛……他當年……也在這裡……」' }, { who: 'narr', t: '話沒說完，它就散成了一地木屑。' }] }] }] },
  { id: 'k9', region: 'kunlun', t: '守觀', steps: [{ type: 'waves', id: 'temple_guard', place: 'taoguan', enemies: ['puppet', 'thunder', 'minipuppet', 'talisman'], d: '傀儡圍攻道觀！守住三波' }],
    lines: [{ who: 'guanzhu', t: '少俠！殿裡的傀儡全醒了，往道觀這邊來了！' }],
    done: [{ who: 'guanzhu', t: '……是雲鶴師兄放的傀儡。他守山三十年，守的是真君的丹爐，不是這座道觀。' }, { who: 'guanzhu', t: '他在雲橋上等你。少俠──雲橋時隱時現，踩空了，就是萬丈雲海。' }] },
  { id: 'k10', region: 'kunlun', t: '雲鶴真人', steps: [{ type: 'boss', id: 'yunhe', d: '踏上崑崙雲橋，與守山真人雲鶴一決' }] },
);

/* ---------- 終章 ---------- */
NODES.push(
  { id: 'f1', region: 'final', t: '終章', steps: [{ type: 'final', d: '線索已經指向一個人。去做個了斷' }] },
);
const CLUE_N = { meng: '盟主線', xian: '仙人線', shi: '師父線' };
const FINAL_OF = { meng: 'linxiao', xian: 'xuanxiao', shi: 'qingxu' };
// 知己牽動的線索（+2）
const BOND_CLUE = { langu: 'xian', yushuang: 'meng', jinghong: 'meng', suxin: 'shi', changfeng: 'shi', liu: 'xian' };

/* ---------- 頭目對白 ---------- */
Object.assign(BOSS_LINES, {
  jinsuanpan: {
    before: [{ who: 'jinsuanpan', t: '客官，賭坊的規矩：坐下了，就得押點什麼。' }, { who: 'jinsuanpan', t: '三年來，人從南邊運上崑崙，錢從崑崙流進盟主府，每一筆都經過我這把算盤。你砸了我的生意，那就拿命來平帳吧。' },
      { who: 'me', t: { xia: '這本帳，今天一筆一筆算清楚。', mo: '平帳？好。你的金子，歸我。', zhong: '我一向不賭。今天破個例。' } }, { who: 'jinsuanpan', t: '開盤！' }],
    p2: '來人！把籌碼全押上！',
    after: [{ who: 'jinsuanpan', t: '咳……算錯了……我算錯了一筆……' }, { who: 'jinsuanpan', t: '帳上的金印、鶴印，我都只是過手……還有一筆最老的帳，三十年前的……那本真經，是三個人一起寫的……' }],
    spare: [{ who: 'narr', t: '你收了手。金算盤把算盤珠子一顆顆撥回原位，忽然大笑起來：「虧本生意，我這輩子頭一回做。」' }],
    kill: [{ who: 'narr', t: '算盤碎了一地，金珠子滾進賭坊的每一個角落。' }],
  },
  yunhe: {
    before: [{ who: 'yunhe', t: '青崖的小輩。你師父當年也站在這座橋上，跟貧道說過一模一樣的話。' }, { who: 'yunhe', t: '貧道守山三十年，守的是真君飛昇的那一天。你要過去，先問過這座橋。' },
      { who: 'me', t: { xia: '守的若是害人的丹爐，這座山不守也罷。', mo: '橋會斷，人也會。', zhong: '我師父說過什麼？' } }, { who: 'yunhe', t: '雲起！' }],
    p2: '雲散，橋斷！',
    after: [{ who: 'yunhe', t: '……橋，斷了。也好。' }, { who: 'yunhe', t: '真君……要的不是長生。他要的是三十年前，那兩個兄弟欠他的東西……' }],
    spare: [{ who: 'narr', t: '你收了劍。雲鶴真人盤腿坐在斷橋邊，望著雲海，一動也不動，像一隻終於可以休息的老鶴。' }],
    kill: [{ who: 'narr', t: '你一劍斬斷了最後一截雲橋。雲鶴真人隨著斷橋，沉進了雲海裡。' }],
  },
  linxiao: {
    before: [{ who: 'linxiao', t: '你來了。武林大會，正好缺一個壓軸。' }, { who: 'linxiao', t: '血影教是我養的，又怎樣？江湖要太平，總得有人替天下除掉不聽話的人。那些高手的內力，不送上崑崙，也是白白浪費。' },
      { who: 'linxiao', t: '至於你師父──三十年前，是他先背叛了我們。' }, { who: 'me', t: { xia: '拿天下當藉口殺人的，不配叫盟主。', mo: '天下第一？那個位子，我坐比較合適。', zhong: '三十年前的事，跟我現在要揍你，沒什麼關係。' } }, { who: 'linxiao', t: '上台吧。' }],
    p2: '各派的好漢，給我上台！', p3: '這一招，本是要用在你師父身上的。',
    after: [{ who: 'linxiao', t: '……我只是……想當天下第一而已。三十年前，我們三個在崑崙說好的……' }],
  },
  xuanxiao: {
    before: [{ who: 'xuanxiao', t: '你終於來了。三年前的血池，三十年前的真經，都是為了今天。' }, { who: 'xuanxiao', t: '凡人的內力，是成仙路上的柴。苗疆的、東海的、中原的……還差一點點。你剛好。' },
      { who: 'me', t: { xia: '拿活人當柴燒，這仙，你成不了。', mo: '要吸，就看誰吸誰。', zhong: '我不太好燒，柴很濕。' } }, { who: 'xuanxiao', t: '雷來。' }],
    p2: '凡人，也配看貧道的真身？', p3: '三十年前那兩人的招式，貧道也學會了。',
    after: [{ who: 'xuanxiao', t: '差……差一點點……就飛昇了……' }, { who: 'narr', t: '他年輕的臉一寸一寸老下去，最後變成一個乾瘦的老人，望著天，喃喃念著兩個名字。' }],
  },
  qingxu: {
    before: [{ who: 'master', t: '……徒兒。茶溫好了。' }, { who: 'master', t: '三十年前，為師和兩個結拜兄弟寫了一本《血影真經》。他們拿去殺人、成仙，為師拿去……創了血影教，想用它鎮住他們。後來，什麼都鎮不住了。' },
      { who: 'master', t: '那三封信裡，「莫要傷他」是為師寫的。他們要傷的，是你。' }, { who: 'me', t: { xia: '師父，弟子……不得不動手。', mo: '你騙了我一輩子。', zhong: '這壺茶，等打完再喝吧。' } }, { who: 'master', t: '來吧。讓為師看看，你學到第幾重了。' }],
    p2: '這一招，是你小時候最怕的。', p3: '血影真經……為師本想帶進棺材裡的。',
    after: [{ who: 'master', t: '……好。好徒兒。你比為師強了。' }, { who: 'master', t: '茶……別讓它涼了。' }],
  },
});

/* ---------- 江湖傳聞（2b：兩區各 5 則） ---------- */
Object.assign(RUMORS, {
  zy_leitai: { region: 'zhong', t: '擂台', body: '古城擂台連勝五場的人，擂台主周通會親手傳他擂台拳。' },
  zy_tea: { region: 'zhong', t: '張半瞎', body: '茶樓的說書人眼睛半瞎，耳朵卻靈得很，誰讀過哪些傳聞，他一聽就知道。' },
  zy_ledger: { region: 'zhong', t: '薪柴錢', body: '黑市每月有一筆「薪柴錢」，三年從未斷過。' },
  zy_lin: { region: 'zhong', t: '盟主家', body: '盟主林嘯天有一雙兒女，劍法都是盟主親傳，脾氣卻一點也不像他。' },
  zy_tomb: { region: 'zhong', t: '地宮', body: '古城底下有一座前朝地宮，入口就在城南海邊的亂石裡。' },
  kl_crane: { region: 'kunlun', t: '仙鶴老人', body: '雲中有一位愛下棋的仙鶴老人，答對他的棋局，能打通一條經脈。' },
  kl_puppet: { region: 'kunlun', t: '傀儡', body: '崑崙的傀儡不怕毒，因為它們心口插的不是木頭，是銀針。' },
  kl_pill: { region: 'kunlun', t: '仙丹', body: '真君的仙丹能延壽三十年，代價是什麼，沒人說得清。' },
  kl_bridge: { region: 'kunlun', t: '雲橋', body: '崑崙雲橋時隱時現，踩空的人，會被雲送回橋頭。' },
  kl_pine: { region: 'kunlun', t: '古松', body: '崑崙西側的古松底下有個洞，洞裡的雲，比天上的還厚。' },
});
COMMISSION_POOL.push(
  { k: 'kill', type: 'thug', n: 10, region: 'zhong', d: '擊退 10 名黑市打手', reward: { silver: 420, cloth: 6 } },
  { k: 'kill', type: 'guard', n: 8, region: 'zhong', d: '教訓 8 名欺壓百姓的官兵', reward: { silver: 400, iron: 8 } },
  { k: 'deliver', to: 'station_zhong', d: '把信送到古城驛站', reward: { silver: 300 }, region: 'zhong' },
  { k: 'kill', type: 'puppet', n: 10, region: 'kunlun', d: '打碎 10 具道觀傀儡', reward: { silver: 420, iron: 10 } },
  { k: 'kill', type: 'ape', n: 8, region: 'kunlun', d: '趕走 8 隻雲猿', reward: { silver: 380, fur: 8 } },
  { k: 'gather', res: 'herb', n: 15, region: 'kunlun', d: '採 15 份崑崙藥草', reward: { silver: 320, renshen: 1 } },
  { k: 'deliver', to: 'station_kunlun', d: '把信送到崑崙驛站', reward: { silver: 300 }, region: 'kunlun' },
);
Object.assign(ENCOUNTERS, {
  qiju: { n: '雲中棋局', d: '陽蹻脈 +5 重' },
});
// 雲中棋局：仙鶴老人的三道題
const QIJU_Q = [
  { q: '黑棋被圍，只剩一口氣。這時候該？', a: ['做眼求活', '往外衝', '認輸'], ok: 0, yes: '眼做成了，這塊棋就死不了。', no: '一口氣往外衝，衝不出去的。' },
  { q: '對手送你一子，吃還是不吃？', a: ['先看他為什麼送', '照吃不誤', '不吃'], ok: 0, yes: '送子的人，多半想要你的地。', no: '貪吃的人，最後輸的是整盤棋。' },
  { q: '棋下到最後，誰贏？', a: ['先停手的人', '吃子最多的人', '地最多的人'], ok: 2, yes: '對，棋就是這麼簡單。人，才複雜。', no: '不對不對，棋比人簡單多了。' },
];

/* ---------- 成就（2b） ---------- */
ACHIEVEMENTS.push(
  { id: 'jinsuanpan', cat: 'story', n: '平帳', d: '擊敗黑市之主金算盤', test: s => !!s.bossDead.jinsuanpan },
  { id: 'yunhe', cat: 'story', n: '斷橋', d: '擊敗守山真人雲鶴', test: s => !!s.bossDead.yunhe },
  { id: 'final', cat: 'story', n: '江湖真相', d: '擊敗第二章最終頭目', test: s => !!s.ending, title: '一劍了斷', bonus: { dmg: 0.03 } },
  { id: 'clue8', cat: 'story', n: '真相大白', d: '做出全部 8 個關鍵抉擇', test: s => s.clue && (s.clue.meng + s.clue.xian + s.clue.shi) >= 8 },
  { id: 'zhiji', cat: 'story', n: '執子之手', d: '與一位候選人結為知己', test: s => !!s.zhiji },
  { id: 'heji', cat: 'book', n: '合擊', d: '學會知己的合擊秘笈', test: s => ['shuanggu', 'jinghong_ying', 'qingya_shuang', 'zhuying_sha'].some(k => s.books[k]) },
  { id: 'master4', cat: 'book', n: '四高人', d: '通過四位世外高人的考驗', test: s => ['baizu', 'guanchao', 'tianji', 'hunyuan'].every(k => s.books[k]), title: '高人門下', bonus: { dmg: 0.02 } },
  { id: 'siege3', cat: 'fight', n: '青崖不倒', d: '守住三次青崖小築', test: s => (s.siegeWon || 0) >= 3 },
  { id: 'leitai5', cat: 'fight', n: '擂台霸主', d: '擂台連勝 5 場', test: s => !!s.books.leitai_fist },
  { id: 'cat', cat: 'collect', n: '招財進寶', d: '在賭坊贏三把，收服招財貓', test: s => s.pets.includes('cat') },
  { id: 'named18', cat: 'fight', n: '中原名號', d: '擊敗中原與崑崙的 4 名具名精英', test: s => ['tiebutou', 'heixiong', 'qingsong', 'baiyuan'].every(k => s.namedDead[k]) },
  { id: 'rumor45', cat: 'explore', n: '江湖百曉生', d: '收齊全部 45 則江湖傳聞', test: s => Object.keys(RUMORS).every(k => s.rumors[k]), title: '百曉生', bonus: { drop: 0.05 } },
  { id: 'tower25', cat: 'fight', n: '血獄二十五', d: '血獄試煉塔登上第 25 層', test: s => (s.towerBest || 0) >= 25 },
  { id: 'tower100', cat: 'fight', n: '血獄百層', d: '血獄試煉塔登上第 100 層', test: s => (s.towerBest || 0) >= 100, title: '血獄登頂', bonus: { dmg: 0.03 } },
  { id: 'jie1', cat: 'fight', n: '小有名氣', d: '通過江湖劫一劫', test: s => (s.jiePass || 0) >= 1, title: '小有名氣', bonus: { dmg: 0.01 } },
  { id: 'jie3', cat: 'fight', n: '名動一方', d: '通過江湖劫三劫', test: s => (s.jiePass || 0) >= 3, title: '名動一方', bonus: { dmg: 0.02 } },
  { id: 'jie5', cat: 'fight', n: '威震武林', d: '通過江湖劫五劫', test: s => (s.jiePass || 0) >= 5, title: '威震武林', bonus: { dmg: 0.03 } },
  { id: 'jie7', cat: 'fight', n: '一代宗師', d: '通過江湖劫七劫', test: s => (s.jiePass || 0) >= 7, title: '一代宗師', bonus: { dmg: 0.04 } },
  { id: 'jie10', cat: 'fight', n: '天下第一', d: '通過江湖劫十劫', test: s => (s.jiePass || 0) >= 10, title: '天下第一', bonus: { dmg: 0.05, dr: 0.05 } },
  { id: 'legend', cat: 'story', n: '一代傳奇', d: '不靠續命丹破關', test: s => !!s.ending && !s.xumingUsed, title: '一代傳奇' },
);
window.PORTRAITS_2B = ['zhangbanxia', 'saodi', 'guanzhu', 'leitai_master', 'yushuang', 'jinghong', 'linxiao', 'xuanxiao', 'jinsuanpan', 'yunhe', 'tiebutou', 'heixiong', 'qingsong', 'baiyuan', 'crane_old', 'gambler'];
