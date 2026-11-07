'use strict';
/* 一命江湖 1a — 資料檔：數值與內容都放這裡，改數字不必碰主程式 */
const VERSION = '0.2b';
const SAVE_KEY = 'yijian-1a-save';
const HERO_KEY = 'yijian-heroes';
const LEGACY_KEY = 'yijian-legacy';
const SETTINGS_KEY = 'yijian-settings';

const TAU = Math.PI * 2;
const INK = '#1d1a17', CIN = '#b3261e', PAPER = '#ebe1ca', GOLD = '#a07f3c', QI = '#33536a', JADE = '#3f6b5a';
const FONT = "'LXGW WenKai TC','Kaiti TC','STKaiti','BiauKai',serif";

/* ---------- 資源與材料 ---------- */
const RES = {
  silver: { n: '銀兩', s: '銀' }, wood: { n: '木材', s: '木' }, iron: { n: '鐵礦', s: '鐵' },
  herb: { n: '藥草', s: '藥' }, page: { n: '殘頁', s: '頁' }, xiu: { n: '修為', s: '修' },
  fur: { n: '皮毛', s: '皮' }, bone: { n: '獸骨', s: '骨' }, cloth: { n: '布料', s: '布' },
  bamboo: { n: '竹心', s: '竹心' }, meteor: { n: '隕鐵', s: '隕' }, frost: { n: '千年寒鐵', s: '寒鐵' },
  shaji: { n: '沙棘', s: '沙棘' }, xuelian: { n: '雪蓮', s: '雪蓮' }, xuejing: { n: '血晶', s: '血晶' },
};
const RES_MAIN = ['silver', 'wood', 'iron', 'herb', 'page', 'xiu'];
const RARE_ORES = ['meteor', 'frost', 'xuejing'];
const SPECIALTY = ['bamboo', 'shaji', 'xuelian'];

/* ---------- 屬性 ---------- */
const ATTR = {
  剛: { col: '#2b2420', edge: '#c9a24a', status: '擊退' },
  柔: { col: '#3f6b5a', edge: '#7fae96', status: '多段' },
  寒: { col: '#6f9fbf', edge: '#d9ecf7', status: '減速' },
  毒: { col: '#6a4a7a', edge: '#8fb36a', status: '中毒' },
};

/* ---------- 兵器 ---------- */
const WEAPONS = {
  sword: { name: '劍', dmg: 14, cd: 0.30, range: 78, arc: 1.9, ranged: false },
  blade: { name: '刀', dmg: 26, cd: 0.60, range: 92, arc: 3.2, ranged: false },
  fist:  { name: '拳掌', dmg: 9, cd: 0.19, range: 58, arc: 1.7, ranged: false },
  dart:  { name: '暗器', dmg: 8, cd: 0.34, range: 520, arc: 0, ranged: true },
};
const WORDER = ['sword', 'blade', 'fist', 'dart'];
const TIERS = ['凡鐵', '精鋼', '玄鐵', '寒鐵', '神兵'];
const TIER_COL = ['#8a8278', '#1d1a17', '#2f5d6b', '#9aa8b0', '#b3261e'];
const UPGRADE = [
  null,
  { rate: 1.00, drop: 0, drop2: 0, iron: 12, silver: 80, smith: 1 },
  { rate: 0.80, drop: 0, drop2: 0, iron: 30, silver: 200, smith: 2 },
  { rate: 0.60, drop: 0.30, to: 2, iron: 60, silver: 450, rare: 1, rareN: 3, smith: 3 },
  { rate: 0.40, drop: 0.50, to: 3, iron: 110, silver: 900, rare: 2, rareN: 5, smith: 4 },
];

/* ---------- 秘笈 ----------
   cat: weapon 兵器招式 / inner 內功 / qi 氣功 / qing 輕功
   tier: 1 初階 2 高階 3 絕世；attrs: 屬性陣列；align: 正 / 邪 / null；pat: 招式型態 */
const BOOKS = {
  // 初階・兵器招式
  qingya_sword: { n: '青崖劍法', cat: 'weapon', w: 'sword', tier: 1, attrs: ['柔'], align: '正', pat: 'thrust3', mp: 14, cd: 3, mult: 1.6, src: '名門弟子起始；師父傳授' },
  liuyun_sword: { n: '流雲劍', cat: 'weapon', w: 'sword', tier: 1, attrs: ['柔'], pat: 'orbit', mp: 28, cd: 10, mult: 0.55, src: '翠竹林・劍冢，銀兩 300' },
  fuhu_fist: { n: '伏虎拳', cat: 'weapon', w: 'fist', tier: 1, attrs: ['剛'], pat: 'palm', mp: 18, cd: 4, mult: 3, src: '少林俗家起始；落霞村武館，銀兩 200' },
  hanbing_palm: { n: '寒冰掌', cat: 'weapon', w: 'fist', tier: 1, attrs: ['寒'], pat: 'cone', mp: 20, cd: 5, mult: 2.2, freeze: 1.2, src: '寒江雪嶺・冰窟（1b）' },
  xueying_claw: { n: '血影爪', cat: 'weapon', w: 'fist', tier: 1, attrs: ['毒'], align: '邪', pat: 'claw', mp: 16, cd: 4, mult: 0.9, src: '魔教叛徒起始；總壇教眾掉落' },
  kuangsha_blade: { n: '狂沙刀法', cat: 'weapon', w: 'blade', tier: 1, attrs: ['剛'], pat: 'spin', mp: 16, cd: 4, mult: 1.0, src: '擊敗鐵霸（1b）' },
  xuanfeng_blade: { n: '旋風刀', cat: 'weapon', w: 'blade', tier: 1, attrs: ['剛'], pat: 'wave', mp: 26, cd: 8, mult: 3.2, src: '黃沙・護送商隊（1b）' },
  lihua_needle: { n: '梨花針', cat: 'weapon', w: 'dart', tier: 1, attrs: ['毒'], pat: 'fan', mp: 16, cd: 4, mult: 1.0, src: '饒柳無痕一命' },
  zhuihun_dart: { n: '追魂鏢', cat: 'weapon', w: 'dart', tier: 1, attrs: ['毒'], pat: 'homing', mp: 22, cd: 7, mult: 2.2, src: '江湖浪子起始；救治魔教弟子' },
  bingpo_needle: { n: '冰魄神針', cat: 'weapon', w: 'dart', tier: 1, attrs: ['寒'], pat: 'ring', mp: 20, cd: 6, mult: 1.0, src: '擊敗寒江孤叟（1b）' },
  // 初階・內功
  qingya_heart: { n: '青崖心法', cat: 'inner', tier: 1, attrs: ['柔'], align: '正', mp: 20, cd: 8, mult: 1.2, src: '名門弟子起始；修好練武場後師父傳授' },
  jinzhong: { n: '金鐘罩', cat: 'inner', tier: 1, attrs: ['剛'], align: '正', mp: 20, cd: 8, mult: 1.5, src: '少林俗家起始；落霞村武館，銀兩 200' },
  xuanbing_heart: { n: '玄冰心經', cat: 'inner', tier: 1, attrs: ['寒'], mp: 20, cd: 8, mult: 1.2, src: '冰窟老尼（1b）' },
  xueying_heart: { n: '血影心經', cat: 'inner', tier: 1, attrs: ['毒'], align: '邪', mp: 20, cd: 8, mult: 1.0, src: '魔教叛徒起始' },
  // 初階・輕功
  caoshangfei: { n: '草上飛', cat: 'qing', tier: 1, attrs: ['柔'], src: '江湖浪子起始；清除劍冢旁的刺客營' },
  tiema: { n: '鐵馬步', cat: 'qing', tier: 1, attrs: ['剛'], src: '黃沙・刀客墓（1b）' },
  taxue: { n: '踏雪無痕', cat: 'qing', tier: 1, attrs: ['寒'], src: '擊敗寒江孤叟（1b）' },
  guiying: { n: '鬼影步', cat: 'qing', tier: 1, attrs: ['毒'], src: '神秘商人（稀有）' },
  // 初階・氣功
  pikong: { n: '劈空勁', cat: 'qi', tier: 1, attrs: ['剛'], pat: 'line', mp: 18, cd: 5, mult: 2.4, src: '黃沙・刀客墓任務（1b）' },
  liuyun_sleeve: { n: '流雲袖', cat: 'qi', tier: 1, attrs: ['柔'], pat: 'sleeve', mp: 18, cd: 5, mult: 0.8, src: '神秘商人（稀有）' },
  hanbing_finger: { n: '寒冰指', cat: 'qi', tier: 1, attrs: ['寒'], pat: 'icicle', mp: 16, cd: 4, mult: 2.0, freeze: 1.5, src: '冰窟（1b）' },
  shigu: { n: '蝕骨氣', cat: 'qi', tier: 1, attrs: ['毒'], align: '邪', pat: 'orb', mp: 18, cd: 6, mult: 0.6, src: '總壇教眾掉落（1b）' },
  // 第二章（資料先列，1a 不會取得）
  jincan: { n: '金蠶蠱針', cat: 'weapon', w: 'dart', tier: 1, attrs: ['毒'], align: '邪', pat: 'homing', mp: 22, cd: 7, mult: 2.4, src: '苗疆巫醫（第二章）' },
  wudu_heart: { n: '五毒心法', cat: 'inner', tier: 1, attrs: ['毒'], align: '邪', mp: 20, cd: 8, mult: 1.1, src: '苗疆巫醫（第二章）' },
  langlijiao: { n: '浪裡蛟', cat: 'qing', tier: 1, attrs: ['柔'], water: true, src: '東海老船夫（第二章）' },
  fenlang: { n: '分浪刀', cat: 'weapon', w: 'blade', tier: 1, attrs: ['剛'], pat: 'cross', mp: 24, cd: 7, mult: 2.6, src: '東海任務（第二章）' },
  leitai_fist: { n: '擂台拳', cat: 'weapon', w: 'fist', tier: 1, attrs: ['剛'], pat: 'combo5', mp: 20, cd: 5, mult: 0.9, src: '中原擂台（第二章）' },
  haoran_sword: { n: '浩然劍', cat: 'weapon', w: 'sword', tier: 1, attrs: ['柔'], align: '正', pat: 'beam', mp: 20, cd: 5, mult: 2.4, src: '中原正派會館（第二章）' },
  taiqing: { n: '太清心法', cat: 'inner', tier: 1, attrs: ['柔'], align: '正', mp: 20, cd: 8, mult: 1.2, src: '崑崙道觀（第二章）' },
  hanyun: { n: '寒雲勁', cat: 'qi', tier: 1, attrs: ['寒'], pat: 'cloud', mp: 24, cd: 9, mult: 0.5, src: '崑崙雲海試煉（第二章）' },
};
// 高階・兵器招式合成表（屬性組合 → 武功）
const HIGH_WEAPON = {
  '柔柔': { n: '太虛劍意', w: 'sword', pat: 'orbit' }, '剛剛': { n: '霸王開山', w: 'blade', pat: 'wave' },
  '寒寒': { n: '玄冰萬里', w: 'fist', pat: 'cone' }, '毒毒': { n: '百毒穿心', w: 'dart', pat: 'fan' },
  '剛柔': { n: '剛柔並濟', w: 'fist', pat: 'palm' }, '剛寒': { n: '冰河斷流', w: 'blade', pat: 'wave' },
  '剛毒': { n: '腐骨掌', w: 'fist', pat: 'palm' }, '柔寒': { n: '寒江雪劍', w: 'sword', pat: 'orbit' },
  '柔毒': { n: '蛇影劍', w: 'sword', pat: 'thrust3' }, '寒毒': { n: '冰魄寒光', w: 'dart', pat: 'ring' },
};
const ULTRA = {
  weapon: { 柔: ['一劍無痕', 'sword', 'blink'], 剛: ['天崩地裂', 'blade', 'quake'], 寒: ['千里冰封', 'fist', 'freezeall'], 毒: ['萬毒歸宗', 'dart', 'plague'] },
  inner: { 柔: '太虛神功', 剛: '不壞金身', 寒: '冰魄玄功', 毒: '血影神功' },
  qing: { 柔: '御風行', 剛: '破軍步', 寒: '雪落無聲', 毒: '幽冥鬼步' },
  qi: { 柔: '萬流歸海', 剛: '碎山勁', 寒: '凝霜指', 毒: '萬蝕氣' },
};
const ATTR_ORDER = ['剛', '柔', '寒', '毒'];
const CAT_NAME = { weapon: '兵器招式', inner: '內功心法', qi: '氣功', qing: '輕功身法' };

/* ---------- 出身與外觀 ---------- */
const ORIGINS = {
  mingmen: { n: '名門弟子', books: ['qingya_sword', 'qingya_heart'], karma: 10, robe: '#efece4', acc: '#33536a', hat: 'douli', desc: '青崖派正統。師父多傳一招，練武場開局就是 1 級。' },
  langzi: { n: '江湖浪子', books: ['zhuihun_dart', 'caoshangfei'], karma: 0, robe: '#7b6a52', acc: '#5a4a3a', hat: 'none', cloak: true, desc: '四處漂泊。銀兩 300，固定行商打九折。' },
  pantu: { n: '魔教叛徒', books: ['xueying_claw', 'xueying_heart'], karma: -20, robe: '#2a1416', acc: CIN, hat: 'mask', desc: '逃離血影教。殘頁 10。' },
  shaolin: { n: '少林俗家', books: ['fuhu_fist', 'jinzhong'], karma: 5, robe: '#b8873a', acc: '#6b3a1f', hat: 'bald', desc: '拳掌出身。最大氣血 +30。' },
};
const HAIRS = ['束髮', '散髮', '高馬尾', '雙髻', '短髮', '道髻'];
const HAIR_COLS = ['#1d1a17', '#3a2a20', '#5a4a3a', '#8a8278', '#d9d6cf', '#4a1a1a'];
const CLOTH_COLS = ['', '#efece4', '#3f6b5a', '#33536a', '#7b3a2a', '#2a2420']; // 空字串 = 依出身

/* ---------- 經脈 ---------- */
const MERIDIANS = [
  { k: 'ren', n: '任脈', d: '最大氣血 +20' },
  { k: 'du', n: '督脈', d: '最大內力 +12、回復加快' },
  { k: 'chong', n: '衝脈', d: '所有傷害 +8%' },
  { k: 'dai', n: '帶脈', d: '移速 +4%、閃身冷卻縮短' },
  { k: 'yinwei', n: '陰維脈', d: '暴擊率 +0.5%（上限 75%，之後每重傷害 +1%）' },
  { k: 'yangwei', n: '陽維脈', d: '暴擊傷害 +3%' },
  { k: 'yinqiao', n: '陰蹻脈', d: '四屬性抗性 +1%（上限 75%）' },
  { k: 'yangqiao', n: '陽蹻脈', d: '屬性傷害 +3%' },
];
function merCost(n) { return { xiu: Math.round(25 * Math.pow(n, 1.7)), herb: Math.max(0, 2 * (n - 10)), silver: Math.max(0, 50 * (n - 20)) }; }

/* ---------- 建築（升到 1–5 級的花費） ---------- */
const BUILDINGS = {
  hall: { n: '門派大殿', cost: [null, null, { wood: 60, iron: 20, silver: 300 }, { wood: 150, iron: 60, silver: 900 }, { wood: 300, iron: 150, silver: 2500, rare: 2 }, { wood: 600, iron: 300, silver: 6000, rare: 5 }] },
  train: { n: '練武場', cost: [null, { wood: 20, silver: 50 }, { wood: 50, iron: 15, silver: 200 }, { wood: 100, iron: 40, silver: 500 }, { wood: 200, iron: 90, silver: 1400 }, { wood: 400, iron: 200, silver: 3500 }] },
  smith: { n: '鐵匠鋪', cost: [null, { wood: 15, iron: 8, silver: 60 }, { wood: 40, iron: 30, silver: 250 }, { wood: 90, iron: 70, silver: 600 }, { wood: 180, iron: 160, silver: 1600 }, { wood: 360, iron: 350, silver: 4000 }] },
  lib: { n: '藏經閣', cost: [null, { wood: 30, silver: 100 }, { wood: 70, iron: 20, silver: 300 }, { wood: 140, iron: 50, silver: 700 }, { wood: 280, iron: 120, silver: 1800, page: 20 }, { wood: 560, iron: 260, silver: 4500, page: 60 }] },
  herbal: { n: '藥廬', cost: [null, { wood: 15, herb: 5, silver: 40 }, { wood: 40, herb: 15, silver: 180 }, { wood: 80, herb: 30, silver: 400 }, { wood: 160, herb: 60, silver: 1000 }, { wood: 320, herb: 120, silver: 2500 }] },
  alchemy: { n: '煉丹房', cost: [null, { wood: 40, herb: 20, silver: 200 }, { wood: 80, herb: 40, silver: 500 }, { wood: 160, herb: 80, silver: 1200 }, { wood: 320, herb: 160, silver: 3000, spec: 5 }, { wood: 640, herb: 320, silver: 7000, spec: 15 }] },
  array: { n: '護山大陣', cost: [null, { wood: 100, iron: 50, silver: 500 }, { wood: 200, iron: 100, silver: 1200 }, { wood: 400, iron: 200, silver: 2800 }, { wood: 800, iron: 400, silver: 6000 }, { wood: 1600, iron: 800, silver: 12000 }] },
  vault: { n: '藏寶閣', cost: [null, { wood: 60, silver: 300 }, { wood: 120, iron: 40, silver: 800 }, { wood: 240, iron: 100, silver: 2000 }, { wood: 480, iron: 220, silver: 5000 }, { wood: 960, iron: 480, silver: 11000 }] },
};
const BORDER = ['hall', 'train', 'smith', 'lib', 'herbal', 'alchemy', 'array', 'vault'];
const DISC_CAP = [0, 1, 2, 4, 6, 9];
const TRAIN_RATE = [0, 0.5, 1, 1.6, 2.3, 3];
const LIB_CAP = [1, 3, 5, 7, 9, 10];
const SMITH_CAP = [1, 2, 3, 4, 5, 5];
const POT_MAX = [3, 5, 7, 9, 11, 13];
const potHeal = l => 0.4 + 0.08 * Math.max(0, l - 1);

/* ---------- 丹藥 ---------- */
const PILLS = {
  liqi: { n: '力氣丹', need: { herb: 10, shaji: 2 }, lv: 1, d: '10 分鐘傷害 +15%' },
  huxin: { n: '護心丹', need: { herb: 10, bone: 3 }, lv: 1, d: '10 分鐘減傷 15%' },
  huqi: { n: '護器丹', need: { herb: 8, bamboo: 2 }, lv: 2, d: '下一次升階失敗不掉階' },
  qingxin: { n: '清心丹', need: { herb: 15, xuelian: 2 }, lv: 2, d: '解除走火入魔，或下一次合成機率 −5%' },
  xuming: { n: '續命丹', need: { herb: 50, bamboo: 10, meteor: 3, frost: 3 }, lv: 5, d: '死亡時自動復活一次' },
};

/* ---------- 裝備 ---------- */
const SLOTS = ['robe', 'hat', 'boots', 'belt', 'acc1', 'acc2'];
const SLOT_N = { robe: '衣', hat: '帽', boots: '靴', belt: '腰帶', acc1: '飾品', acc2: '飾品' };
const GEAR_BASE = {
  robe: { hp: 30, dr: 0.02, mat: 'cloth' }, hat: { mp: 15, mat: 'cloth' }, boots: { spd: 0.04, dcd: 0.04, mat: 'fur' },
  belt: { pot: 0.08, mat: 'fur' }, acc: { crit: 0.03, mat: 'bone' },
};
const GEAR_NAMES = {
  robe: ['布衣', '勁裝', '軟甲', '寒絲衣', '天蠶衣'], hat: ['布巾', '竹笠', '鐵盔', '寒玉冠', '紫金冠'],
  boots: ['草鞋', '布靴', '皮靴', '踏雲靴', '追風靴'], belt: ['麻繩', '布帶', '皮帶', '玉帶', '金縷帶'],
  acc: ['木珠', '銅錢串', '玉珮', '寒玉環', '龍紋珮'],
};
const SETS = {
  qiaofu: { n: '樵夫套', region: 'village', b2: '採集量 +20%', b4: '移速 +5%', b6: '金創藥效 +30%' },
  zhuying: { n: '竹影套', region: 'bamboo', b2: '閃身冷卻 −10%', b4: '柔屬性傷害 +15%', b6: '閃身後下一擊必暴擊' },
  kuangsha: { n: '狂沙套', region: 'sand', b2: '氣血 +10%', b4: '剛屬性傷害 +15%', b6: '擊退距離加倍、撞擊傷害 +50%' },
  hanjiang: { n: '寒江套', region: 'snow', b2: '寒抗 +20%', b4: '寒屬性傷害 +15%', b6: '冰凍時間 +1 秒' },
  xueying: { n: '血影套', region: 'cult', b2: '吸血 +3%', b4: '毒屬性傷害 +15%', b6: '氣血半數以下時傷害 +25%' },
};
const REGION_SET = { village: 'qiaofu', bamboo: 'zhuying', sand: 'kuangsha', snow: 'hanjiang', cult: 'xueying' };
const UNIQUE_GEAR = {
  tiger_fang: { n: '虎牙墜', slot: 'acc', crit: 0.06, d: '暴擊 +6%' },
  wolf_belt: { n: '狼王皮腰帶', slot: 'belt', pot: 0.2, spd: 0.04, d: '藥效 +20%、移速 +4%' },
  bamboo_pin: { n: '青竹髮簪', slot: 'hat', mp: 30, d: '內力 +30' },
  broken_jade: { n: '斷劍玉珮', slot: 'acc', attr: '柔', attrDmg: 0.12, d: '柔屬性傷害 +12%' },
  liu_hat: { n: '竹影斗笠', slot: 'hat', mp: 40, dcd: 0.1, d: '內力 +40、閃身冷卻 −10%' },
  ghost_wrist: { n: '鬼手護腕', slot: 'acc', crit: 0.05, attr: '毒', attrDmg: 0.08, d: '暴擊 +5%、毒屬性傷害 +8%' },
  sand_boots: { n: '飛沙靴', slot: 'boots', spd: 0.1, dcd: 0.06, d: '移速 +10%、閃身冷卻 −6%' },
  han_cloak: { n: '寒無衣斗篷', slot: 'robe', hp: 60, dr: 0.04, d: '氣血 +60、減傷 4%' },
  bear_charm: { n: '熊掛', slot: 'acc', attr: '剛', attrDmg: 0.15, d: '剛屬性傷害 +15%' },
  iron_mask: { n: '鐵面具', slot: 'hat', mp: 30, dr: 0.05, d: '內力 +30、減傷 5%' },
  blood_ring: { n: '血晶戒指', slot: 'acc', crit: 0.04, attr: '毒', attrDmg: 0.12, d: '暴擊 +4%、毒屬性傷害 +12%' },
  tieba_wrist: { n: '狂沙護腕', slot: 'acc', crit: 0.05, attr: '剛', attrDmg: 0.18, d: '暴擊 +5%、剛屬性傷害 +18%' },
  gusou_coat: { n: '寒江蓑衣', slot: 'robe', hp: 90, dr: 0.06, d: '氣血 +90、減傷 6%' },
  li_jade: { n: '血影玉珮', slot: 'acc', crit: 0.06, attr: '毒', attrDmg: 0.2, d: '暴擊 +6%、毒屬性傷害 +20%' },
};

/* ---------- 區域 ---------- */
const REGIONS = {
  village: { n: '青崖山・落霞村', short: '落霞', realm: '不入流', tint: [205, 190, 158], weather: ['晴', '晴', '雨'] },
  bamboo: { n: '翠竹林', short: '竹林', realm: '三流', tint: [150, 178, 146], weather: ['雨', '晴', '雨'] },
  sand: { n: '黃沙古道', short: '黃沙', realm: '二流', tint: [222, 196, 140], weather: ['晴', '沙暴', '晴', '沙暴'] },
  snow: { n: '寒江雪嶺', short: '雪嶺', realm: '二流', tint: [232, 236, 238], weather: ['雪', '雪', '晴'] },
  cult: { n: '血影教總壇', short: '總壇', realm: '一流', tint: [168, 120, 112], weather: ['血雨', '晴', '血雨'] },
};
const REGION_ORDER = ['village', 'bamboo', 'sand', 'snow', 'cult'];
const REALMS = [['不入流', 0], ['三流', 150], ['二流', 300], ['一流', 550], ['宗師', 900], ['大宗師', 1300], ['天人', 2000]];

/* ---------- 怪物 ---------- */
const ENEMIES = {
  bandit: { n: '山賊', hp: 25, dmg: 8, spd: 95, r: 16, ai: 'melee', xiu: 4, silver: [2, 6], drops: { cloth: 0.35 }, look: 'man', robe: '#3a332b', acc: CIN },
  wolf: { n: '野狼', hp: 20, dmg: 6, spd: 150, r: 15, ai: 'dash', xiu: 3, silver: [0, 2], drops: { fur: 0.45, bone: 0.25 }, look: 'wolf', robe: '#5b554c' },
  archer: { n: '山賊弓手', hp: 22, dmg: 7, spd: 85, r: 15, ai: 'ranged', xiu: 4, silver: [2, 6], drops: { cloth: 0.3 }, look: 'man', robe: '#4a3f30', acc: '#6b4a2a', weapon: 'bow' },
  hive: { n: '野蜂巢', hp: 45, dmg: 4, spd: 0, r: 18, ai: 'summon', summon: 'bee', xiu: 5, silver: [0, 3], drops: { herb: 0.5 }, look: 'hive' },
  bee: { n: '野蜂', hp: 6, dmg: 3, spd: 170, r: 8, ai: 'melee', xiu: 0, silver: [0, 0], drops: {}, look: 'bee', minion: true },
  assassin: { n: '竹林刺客', hp: 50, dmg: 13, spd: 120, r: 15, ai: 'dash', xiu: 8, silver: [5, 10], drops: { cloth: 0.35 }, look: 'man', robe: '#1f2a22', acc: JADE, hat: 'douli' },
  snake: { n: '毒蛇', hp: 40, dmg: 11, spd: 105, r: 12, ai: 'melee', xiu: 7, silver: [1, 4], drops: { bone: 0.35 }, look: 'snake', robe: '#3f5a3a', res: { 毒: 0.5 }, poison: true },
  blowgun: { n: '吹箭手', hp: 38, dmg: 12, spd: 90, r: 14, ai: 'ranged', xiu: 7, silver: [4, 8], drops: { cloth: 0.3 }, look: 'man', robe: '#2f3a2a', acc: '#6a4a7a' },
  sprite: { n: '竹精', hp: 60, dmg: 12, spd: 60, r: 16, ai: 'spike', xiu: 9, silver: [3, 7], drops: { bamboo: 0.12, wood: 0.5 }, look: 'sprite' },
  cracker: { n: '爆竹童子', hp: 30, dmg: 22, spd: 160, r: 12, ai: 'bomb', xiu: 6, silver: [2, 5], drops: {}, look: 'kid' },
  // 黃沙古道（二流）
  horse_bandit: { n: '馬賊', hp: 120, dmg: 18, spd: 150, r: 18, ai: 'dash', xiu: 14, silver: [8, 16], drops: { cloth: 0.35, fur: 0.2 }, look: 'man', robe: '#6b4a2a', acc: '#a07f3c', hat: 'douli', weapon: 'blade', res: { 剛: 0.3 }, noKb: true, region: 'sand' },
  scorpion: { n: '沙蠍', hp: 95, dmg: 16, spd: 80, r: 16, ai: 'ranged', xiu: 12, silver: [3, 8], drops: { bone: 0.4 }, look: 'scorpion', robe: '#8a5a2a', shot: 'poison', region: 'sand' },
  vulture: { n: '禿鷹', hp: 80, dmg: 17, spd: 175, r: 15, ai: 'dash', xiu: 12, silver: [2, 6], drops: { fur: 0.35, bone: 0.25 }, look: 'bird', robe: '#4a3a2a', fly: true, region: 'sand' },
  wormhole: { n: '沙蟲穴', hp: 150, dmg: 6, spd: 0, r: 22, ai: 'summon', summon: 'sandworm', xiu: 15, silver: [4, 10], drops: { iron: 0.6, shaji: 0.15 }, look: 'wormhole', region: 'sand' },
  sandworm: { n: '小沙蟲', hp: 18, dmg: 8, spd: 140, r: 10, ai: 'melee', xiu: 0, silver: [0, 0], drops: {}, look: 'worm', robe: '#a07a4a', minion: true, region: 'sand' },
  oilthief: { n: '火油賊', hp: 70, dmg: 38, spd: 165, r: 14, ai: 'bomb', xiu: 11, silver: [5, 12], drops: { cloth: 0.3 }, look: 'man', robe: '#5a3a24', acc: CIN, weapon: 'none', burn: true, region: 'sand' },
  // 寒江雪嶺（二流）
  snowwolf: { n: '雪狼', hp: 105, dmg: 17, spd: 165, r: 16, ai: 'dash', xiu: 13, silver: [1, 5], drops: { fur: 0.5, bone: 0.25 }, look: 'wolf', robe: '#d9dde0', res: { 寒: 0.5 }, region: 'snow' },
  traitor: { n: '冰魄叛徒', hp: 100, dmg: 16, spd: 90, r: 15, ai: 'ranged', xiu: 13, silver: [6, 12], drops: { cloth: 0.35 }, look: 'man', robe: '#6f8fa8', acc: '#d9ecf7', weapon: 'dart', shot: 'ice', res: { 寒: 0.5 }, region: 'snow' },
  snowbear: { n: '雪熊', hp: 230, dmg: 28, spd: 85, r: 22, ai: 'slam', xiu: 18, silver: [2, 6], drops: { fur: 0.6, bone: 0.4 }, look: 'bear', robe: '#e8ebee', res: { 寒: 0.5 }, region: 'snow' },
  icespirit: { n: '冰靈', hp: 110, dmg: 17, spd: 60, r: 16, ai: 'spike', xiu: 14, silver: [3, 8], drops: { frost: 0.04, herb: 0.4 }, look: 'icespirit', spikeKind: 'ice', res: { 寒: 0.5 }, region: 'snow' },
  iceball: { n: '爆冰球', hp: 60, dmg: 26, spd: 155, r: 13, ai: 'bomb', xiu: 10, silver: [1, 4], drops: {}, look: 'iceball', freezeBomb: true, res: { 寒: 0.5 }, region: 'snow' },
  // 血影教總壇（一流）
  cultist: { n: '血影教眾', hp: 175, dmg: 24, spd: 155, r: 16, ai: 'dash', xiu: 22, silver: [12, 24], drops: { cloth: 0.4, xuejing: 0.03 }, look: 'man', robe: '#3a1416', acc: CIN, weapon: 'blade', multiDash: true, region: 'cult' },
  hexer: { n: '血影咒師', hp: 150, dmg: 21, spd: 85, r: 15, ai: 'ranged', xiu: 22, silver: [12, 24], drops: { cloth: 0.35, page: 0.05 }, look: 'man', robe: '#4a1a24', acc: '#6a4a7a', weapon: 'none', shot: 'blood', volley: 3, region: 'cult' },
  bloodpuppet: { n: '血傀', hp: 260, dmg: 27, spd: 95, r: 19, ai: 'melee', xiu: 24, silver: [6, 14], drops: { bone: 0.4, xuejing: 0.04 }, look: 'man', robe: '#5a2020', acc: '#2a1414', weapon: 'fist', drain: 0.6, region: 'cult' },
  batnest: { n: '血蝠群', hp: 190, dmg: 6, spd: 0, r: 22, ai: 'summon', summon: 'bat', xiu: 22, silver: [6, 14], drops: { herb: 0.5 }, look: 'batnest', region: 'cult' },
  bat: { n: '血蝠', hp: 24, dmg: 10, spd: 190, r: 9, ai: 'melee', xiu: 0, silver: [0, 0], drops: {}, look: 'bat', robe: '#3a1416', minion: true, fly: true, region: 'cult' },
  sacrifice: { n: '獻祭者', hp: 110, dmg: 44, spd: 160, r: 14, ai: 'bomb', xiu: 18, silver: [6, 14], drops: { xuejing: 0.05 }, look: 'man', robe: '#7a1a1a', acc: '#2a1414', weapon: 'none', bloodPool: true, region: 'cult' },
};
const AFFIXES = { 狂暴: '攻速 +50%', 毒血: '被打時噴毒', 分身: '半血時分裂', 鐵壁: '不被擊退、減傷 30%', 疾行: '移速 +50%' };
const NAMED = {
  wanglaosan: { n: '獨眼虎 王老三', base: 'bandit', camp: 'bandit_camp', hp: 260, dmg: 18, r: 22, drop: 'tiger_fang', story: '山賊寨寨主，原是獵戶，一隻眼被狼王抓瞎。' },
  wolfking: { n: '白額狼王', base: 'wolf', camp: 'wolf_den', hp: 220, dmg: 14, r: 24, drop: 'wolf_belt', story: '狼窩之王，長嘯時群狼狂暴。' },
  qingzhushe: { n: '青竹蛇', base: 'assassin', camp: 'assassin_camp', hp: 480, dmg: 22, r: 18, drop: 'bamboo_pin', story: '女刺客，消失在竹影中。' },
  duanjianke: { n: '斷劍客', base: 'assassin', camp: 'sword_tomb', hp: 520, dmg: 24, r: 19, drop: 'broken_jade', story: '守劍冢的瘋劍客，招式亂中有序。' },
  guishouqi: { n: '鬼手七', base: 'oilthief', hp: 1300, dmg: 30, r: 19, drop: 'ghost_wrist', special: 'steal', story: '盜墓賊，偷遍絲路。被他碰一下，錢袋就輕了。', look: { robe: '#3a3028', acc: '#8a6a3a', hat: 'veil', weapon: 'dart' } },
  shalifei: { n: '沙裡飛', base: 'horse_bandit', hp: 1450, dmg: 32, r: 21, drop: 'sand_boots', special: 'circle', story: '馬賊快刀，騎馬繞著人打轉，一轉身就是一刀。' },
  hanwuyi: { n: '寒無衣', base: 'traitor', hp: 1400, dmg: 30, r: 19, drop: 'han_cloak', special: 'icewall', story: '冰魄門叛徒的首領，揮手就是一道冰牆。' },
  oldbear: { n: '白毛老熊', base: 'snowbear', hp: 1800, dmg: 36, r: 30, drop: 'bear_charm', special: 'slam', story: '冬眠被吵醒的老熊，連普通一掌都能震裂地面。' },
  judge: { n: '鐵面判官', base: 'cultist', hp: 2600, dmg: 40, r: 21, drop: 'iron_mask', special: 'judge', story: '教中執法，按你的「罪狀」量刑，殺人越多挨得越重。', look: { robe: '#1d1a17', acc: CIN, hat: 'mask', weapon: 'blade' } },
  priestess: { n: '血池祭司', base: 'hexer', hp: 2200, dmg: 34, r: 19, drop: 'blood_ring', special: 'heal', story: '一直替教眾回血，要先打倒她。', look: { robe: '#7a1a24', acc: '#d9d6cf', hat: 'veil', weapon: 'none' } },
};
const BOSS = {
  liu: { n: '竹影刺客 柳無痕', short: '柳無痕', hp: 4500, dmg: 28, spd: 150, r: 24, robe: '#24332b', acc: JADE, hat: 'veil', weapon: 'sword', region: 'bamboo', ult: '竹影千殺' },
  tieba: { n: '狂沙刀 鐵霸', short: '鐵霸', hp: 9500, dmg: 40, spd: 135, r: 30, robe: '#6b4a2a', acc: '#a07f3c', hat: 'bald', weapon: 'blade', region: 'sand', res: { 剛: 0.3 }, ult: '狂沙天斬' },
  gusou: { n: '寒江孤叟', short: '寒江孤叟', hp: 9000, dmg: 36, spd: 120, r: 26, robe: '#6a6a5a', acc: '#d9ecf7', hat: 'douli', weapon: 'none', beard: true, region: 'snow', res: { 寒: 0.5 }, ult: '獨釣寒江' },
  li: { n: '血影教主 厲千秋', short: '厲千秋', hp: 16000, dmg: 46, spd: 150, r: 28, robe: '#5a1418', acc: CIN, hat: 'none', weapon: 'fist', region: 'cult', ult: '血影神功' },
};

/* ---------- 江湖小語 ---------- */
const WISDOM = [
  '見地上紅光，便閃身。', '刀不在快，在準。', '內力見底還硬放招，是會走火入魔的。', '夜裡的怪比較兇，掉的東西也比較好。',
  '下雨天，寒屬性的招式更利。', '連擊越長，傷害越高；挨一下就歸零。', '冰凍的敵人，接一記剛屬性的招式會碎。',
  '回青崖小築，氣血會慢慢回滿。', '驛站之間可以快速傳送。', '江湖傳聞裡，藏著奇遇的線索。', '頭目只打一次，死了就沒了──你也是。',
  '輕功學得好，舊地圖也有新路。', '正派與邪派的秘笈一起帶，小心心魔。', '弟子派出去，回來會帶東西。',
  '沙暴裡看不遠，暗器也飛不遠。', '下雪天，寒屬性更利，閃身也慢一些。', '血雨之夜，吸血的人更兇。', '馬賊站得穩，剛勁打他們效果打折。',
  '雪嶺的怪不怕冷，寒屬性招式只剩一半威力。', '流沙帶，沒有鐵馬步就別硬闖。', '三枚血影令，破得開總壇結界。',
];

/* ---------- 弟子 ---------- */
const DISCIPLES = {
  aniu: { n: '阿牛', spec: 'wood', how: 'chief', story: '樵夫之子，力氣大、話少，想學劍。' },
  xiaocui: { n: '小翠', spec: 'herb', how: 'chief', story: '郎中的孫女，認得百草。' },
  liuxu: { n: '柳絮', spec: 'herb', how: 'camp', story: '被刺客擄走的孤女，跟柳無痕同姓但無關。' },
  shitou: { n: '石頭', spec: 'iron', how: 'horse_camp', story: '從馬賊礦坑逃出來，怕黑。' },
  qianduoduo: { n: '錢多多', spec: 'silver', how: 'caravan', story: '商幫學徒，算盤精。' },
  tiezhu: { n: '鐵柱', spec: 'iron', how: 'tieba', story: '鐵霸手下的少年馬賊。' },
  xueer: { n: '雪兒', spec: 'wood', how: 'wolves', story: '雪嶺獵戶之女，跟雪狐很熟。' },
  ahai: { n: '阿海', spec: 'silver', how: 'ch2', story: '漁家少年，水性好。' },
  qingfeng: { n: '清風', spec: 'herb', how: 'ch2', story: '崑崙逃下山的小道士。' },
};
const SPEC_N = { wood: '伐木', herb: '採藥', iron: '挖礦', silver: '經商' };

/* ---------- 成就與稱號 ---------- */
const ACH_CAT = { fight: '戰鬥', explore: '探索', book: '秘笈', story: '劇情', collect: '收集' };
const bossN = s => Object.keys(BOSS).filter(k => s.bossDead[k]).length;
const ACHIEVEMENTS = [
  // 戰鬥
  { id: 'kill100', cat: 'fight', n: '初試啼聲', d: '擊敗 100 名敵人', test: s => s.stats.kills >= 100 },
  { id: 'kill500', cat: 'fight', n: '刀下無數', d: '擊敗 500 名敵人', test: s => s.stats.kills >= 500 },
  { id: 'kill1000', cat: 'fight', n: '千人斬', d: '擊敗 1,000 名敵人', test: s => s.stats.kills >= 1000, title: '千人斬', bonus: { dmg: 0.02 } },
  { id: 'combo50', cat: 'fight', n: '行雲流水', d: '連擊達到 50', test: s => s.stats.bestCombo >= 50 },
  { id: 'combo100', cat: 'fight', n: '連綿不絕', d: '連擊達到 100', test: s => s.stats.bestCombo >= 100, title: '連綿不絕', bonus: { dmg: 0.01 } },
  { id: 'elite20', cat: 'fight', n: '精英剋星', d: '擊敗 20 隻精英怪', test: s => (s.stats.elites || 0) >= 20 },
  { id: 'named6', cat: 'fight', n: '名號響亮', d: '擊敗 6 名具名精英', test: s => Object.keys(s.namedDead).length >= 6 },
  { id: 'named10', cat: 'fight', n: '一方之霸', d: '擊敗第一章全部 10 名具名精英', test: s => Object.keys(s.namedDead).length >= 10, title: '一方之霸', bonus: { drop: 0.03 } },
  { id: 'combo_ice', cat: 'fight', n: '碎冰', d: '觸發一次碎冰合擊', test: s => !!(s.stats.combos && s.stats.combos.碎冰) },
  { id: 'combo_poison', cat: 'fight', n: '毒爆', d: '觸發一次毒爆合擊', test: s => !!(s.stats.combos && s.stats.combos.毒爆) },
  // 探索
  { id: 'chest10', cat: 'explore', n: '尋寶新手', d: '開啟 10 個隱藏寶箱', test: s => s.stats.chests >= 10 },
  { id: 'chest25', cat: 'explore', n: '尋寶人', d: '開啟第一章 25 個隱藏寶箱', test: s => s.stats.chests >= 25, title: '尋寶人', bonus: { drop: 0.05 } },
  { id: 'secret2', cat: 'explore', n: '別有洞天', d: '進入 2 個秘境', test: s => Object.keys(s.secrets || {}).length >= 2 },
  { id: 'secret5', cat: 'explore', n: '洞天福地', d: '進入第一章全部 5 個秘境', test: s => Object.keys(s.secrets || {}).length >= 5 },
  { id: 'stations', cat: 'explore', n: '四方驛路', d: '發現第一章全部 5 座驛站', test: s => REGION_ORDER.every(r => s.stations[r]) },
  { id: 'enc3', cat: 'explore', n: '奇人奇事', d: '遇到 3 次江湖奇遇', test: s => Object.keys(s.encounters).length >= 3, title: '福緣深厚', bonus: { drop: 0.03 } },
  { id: 'storm', cat: 'explore', n: '風沙客', d: '在沙暴中累積待滿 5 分鐘', test: s => (s.stats.storm || 0) >= 300 },
  // 秘笈
  { id: 'books10', cat: 'book', n: '秘笈收藏家', d: '學會 10 本秘笈', test: s => Object.keys(s.books).length >= 10, title: '秘笈通', bonus: { study: -0.05 } },
  { id: 'books16', cat: 'book', n: '博覽群書', d: '學會 16 本秘笈', test: s => Object.keys(s.books).length >= 16 },
  { id: 'lv10', cat: 'book', n: '登峰造極', d: '任一本秘笈修到第十重', test: s => Object.values(s.books).some(b => b.lv >= 10) },
  { id: 'fuse1', cat: 'book', n: '融會貫通', d: '成功合成一本高階武功', test: s => Object.values(s.customBooks).some(b => b.tier >= 2) },
  { id: 'zouhuo10', cat: 'book', n: '九死一生', d: '走火入魔 10 次', test: s => s.stats.zouhuo >= 10, title: '九死一生', bonus: { zouhuo: -0.01 } },
  { id: 'meridian30', cat: 'book', n: '打通經脈', d: '經脈累計 30 重', test: s => Object.values(s.mer).reduce((a, b) => a + b, 0) >= 30 },
  { id: 'meridian80', cat: 'book', n: '奇經八脈', d: '經脈累計 80 重', test: s => Object.values(s.mer).reduce((a, b) => a + b, 0) >= 80, title: '經脈通達', bonus: { dmg: 0.01 } },
  // 劇情
  { id: 'liu', cat: 'story', n: '竹影無痕', d: '擊敗柳無痕', test: s => !!s.bossDead.liu },
  { id: 'tieba', cat: 'story', n: '狂沙止息', d: '擊敗鐵霸', test: s => !!s.bossDead.tieba },
  { id: 'gusou', cat: 'story', n: '寒江獨釣', d: '擊敗寒江孤叟', test: s => !!s.bossDead.gusou },
  { id: 'li', cat: 'story', n: '血影之亂', d: '擊敗血影教主厲千秋', test: s => !!s.bossDead.li, title: '除魔衛道', bonus: { dmg: 0.02 } },
  { id: 'xia', cat: 'story', n: '俠之大者', d: '善惡值達到 +60', test: s => s.karma >= 60, title: '俠之大者', bonus: { dmg: 0.01 } },
  { id: 'mo', cat: 'story', n: '魔焰滔天', d: '善惡值達到 −60', test: s => s.karma <= -60, title: '魔焰滔天', bonus: { dmg: 0.01 } },
  { id: 'spare3', cat: 'story', n: '得饒人處', d: '饒過三位頭目', test: s => ['liuSpared', 'tiebaSpared', 'gusouSpared'].every(k => s[k] === true) },
  // 收集
  { id: 'rumor10', cat: 'collect', n: '包打聽', d: '收集 10 則江湖傳聞', test: s => Object.keys(s.rumors).length >= 10 },
  { id: 'rumor25', cat: 'collect', n: '江湖百曉生', d: '收集第一章全部 25 則傳聞', test: s => Object.keys(s.rumors).length >= 25, title: '百曉生', bonus: { study: -0.03 } },
  { id: 'set6', cat: 'collect', n: '整套行頭', d: '穿齊一整套 6 件套裝', test: s => typeof GS !== 'undefined' && GS && Object.values(GS.sets).some(n => n >= 6) },
  { id: 'tier4', cat: 'collect', n: '寒光出鞘', d: '任一把兵器升到寒鐵', test: s => WORDER.some(w => s.wpn[w].tier >= 4) },
  { id: 'pets3', cat: 'collect', n: '同行夥伴', d: '收服 3 隻小夥伴', test: s => s.pets.length >= 3 },
  { id: 'disc6', cat: 'collect', n: '門庭若市', d: '收 6 名弟子', test: s => Object.values(s.disciples).filter(d => d.state !== 'cand').length >= 6 },
  { id: 'codex50', cat: 'collect', n: '圖鑑過半', d: '江湖圖鑑第一章完成 50%', test: s => typeof codexPct === 'function' && codexPct(s) >= 50, title: '見多識廣', bonus: { drop: 0.02 } },
  { id: 'codex100', cat: 'collect', n: '圖鑑大成', d: '江湖圖鑑第一章完成 100%', test: s => typeof codexPct === 'function' && codexPct(s) >= 100, title: '博聞強記', bonus: { dmg: 0.02 } },
];
const DAILY_REWARDS = [{ silver: 50 }, { herb: 10 }, { silver: 80 }, { iron: 10 }, { silver: 120 }, { wood: 30 }, { page: 5 }];

/* 1b 的水墨立繪（img/<id>.jpg） */
window.PORTRAITS_1B = ['tieba', 'gusou', 'li', 'caravan_boss', 'boatwife', 'nun', 'oldman', 'mole', 'fisher', 'guishouqi', 'shalifei', 'hanwuyi', 'oldbear', 'judge', 'priestess', 'boatman', 'prisoner'];
