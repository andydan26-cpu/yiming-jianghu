'use strict';
/* 一命江湖 — 世界：地點、地形、據點、資源點、迷霧、地圖繪製
   1b 起地圖擴大：北方是寒江雪嶺（西北）與血影教總壇（東北），東方是黃沙古道。
   1a 的落霞村與翠竹林整塊往南移 OY，秘境房間移到地圖東側外 ROOM_DX。 */
const TS = 0.4; // 底圖縮放（2a 起地圖往南擴大，畫布面積要壓在手機上限內）
const OY = 1800, ROOM_DX = 2700, OLD_MAP_W = 5200;

/* ---------- 1a 原始座標（載入時平移） ---------- */
const PLACES = {
  base: { x: 4300, y: 2900, n: '青崖小築' }, master: { x: 4300, y: 3080, n: '師父 清虛子', npc: 'master' },
  tomb: { x: 4720, y: 3330, n: '英雄榜（歷代墓碑）' }, train: { x: 4300, y: 3360, n: '練武場' },
  station_village: { x: 4900, y: 2960, n: '青崖驛站', station: 'village' }, station_bamboo: { x: 1350, y: 1900, n: '翠竹林驛站', station: 'bamboo' },
  chief: { x: 3560, y: 1840, n: '村長', npc: 'chief' }, inn: { x: 3780, y: 1800, n: '落霞客棧', npc: 'innkeeper' },
  dojo: { x: 3400, y: 2020, n: '武館', npc: 'dojo' }, board_v: { x: 3660, y: 2040, n: '告示板' }, board_b: { x: 1420, y: 1980, n: '告示板' },
  farmer: { x: 3150, y: 2350, n: '老農', npc: 'farmer' }, dog: { x: 3480, y: 2220, n: '流浪黃狗' },
  stone1: { x: 2250, y: 1720, n: '路石' }, stone2: { x: 2050, y: 1320, n: '路石' }, stone3: { x: 2300, y: 980, n: '路石' },
  sword_tomb: { x: 1800, y: 1150, n: '劍冢殘碑' }, mojiao: { x: 1700, y: 2450, n: '受傷的人', npc: 'mojiao' },
  arena: { x: 650, y: 1650, n: '竹林空地' }, well: { x: 4950, y: 470, n: '後山枯井' }, well_exit: { x: 5480, y: 640, n: '井口', room: true },
  gate: { x: 2600, y: 1900, n: '西行山道' },
};
// 青崖小築的建築位置（門口座標；互動圈在門口前方）
const BLD_POS = { hall: { x: 4300, y: 2640 }, smith: { x: 3980, y: 2770 }, lib: { x: 4620, y: 2770 }, herbal: { x: 3980, y: 3030 }, alchemy: { x: 4620, y: 3030 }, vault: { x: 4030, y: 2530 }, array: { x: 4570, y: 2530 } };
const BLD_TAB = { hall: 'disc', smith: 'forge', lib: 'lib', herbal: 'herbal', alchemy: 'alchemy', vault: 'vault', array: 'bld' };
// 村子裡的建築（底部中心座標、寬度）
const VILLAGE_BLDS = [{ id: 'house1', x: 3560, y: 1790, w: 170 }, { id: 'house2', x: 3290, y: 1760, w: 160 }, { id: 'house1', x: 4000, y: 1990, w: 160 }, { id: 'house2', x: 3820, y: 2190, w: 160 }, { id: 'house1', x: 3260, y: 2170, w: 150 },
  { id: 'inn', x: 3780, y: 1755, w: 230 }, { id: 'dojo_bld', x: 3400, y: 1975, w: 220 }];
// 地形：mount 不可通過；water 需浪裡蛟；cliff 需草上飛；gate 需主線開路；sand 流沙需鐵馬步；crack 冰縫需踏雪無痕；barrier 血色結界
const TERRAIN = [
  { t: 'mount', x: 2520, y: 0, w: 160, h: 1750 }, { t: 'mount', x: 2520, y: 2050, w: 160, h: 1550 }, { t: 'gate', key: 'bamboo', x: 2520, y: 1750, w: 160, h: 300 },
  { t: 'mount', x: 2700, y: 3320, w: 700, h: 280 }, { t: 'mount', x: 4950, y: 2280, w: 250, h: 420 }, { t: 'mount', x: 3950, y: 450, w: 380, h: 200 },
  { t: 'mount', x: 0, y: 560, w: 600, h: 80 }, { t: 'cliff', x: 600, y: 560, w: 160, h: 80 }, { t: 'mount', x: 760, y: 560, w: 140, h: 80 }, { t: 'mount', x: 760, y: 0, w: 80, h: 560 },
  { t: 'water', x: 0, y: 2700, w: 170, h: 900 }, { t: 'mount', x: 1900, y: 2300, w: 300, h: 180 },
];
const ROOMS = [{ id: 'well_room', x: 5400, y: 300, w: 900, h: 900 }];
const CAMPS = {
  bandit_camp: { x: 3150, y: 950, r: 320, types: ['bandit', 'bandit', 'archer'], n: 6, region: 'village', named: 'wanglaosan', n_: '山賊寨' },
  wolf_den: { x: 4650, y: 1050, r: 300, types: ['wolf'], n: 6, region: 'village', named: 'wolfking', n_: '狼窩' },
  hive_wood: { x: 3250, y: 3080, r: 280, types: ['hive', 'bandit'], n: 4, region: 'village', n_: '野蜂林' },
  v_field1: { x: 3950, y: 1350, r: 300, types: ['wolf', 'bandit', 'archer'], n: 5, region: 'village', n_: '荒野' },
  v_field2: { x: 2950, y: 2650, r: 300, types: ['bandit', 'wolf'], n: 5, region: 'village', n_: '荒野' },
  assassin_camp: { x: 950, y: 900, r: 330, types: ['assassin', 'blowgun', 'assassin'], n: 7, region: 'bamboo', named: 'qingzhushe', n_: '刺客營' },
  snake_den: { x: 1500, y: 3000, r: 300, types: ['snake', 'snake', 'blowgun'], n: 6, region: 'bamboo', n_: '蛇窟' },
  deep_bamboo: { x: 500, y: 2250, r: 300, types: ['sprite', 'cracker', 'assassin'], n: 6, region: 'bamboo', n_: '竹林深處' },
  tomb_guard: { x: 2150, y: 800, r: 260, types: ['assassin', 'sprite'], n: 4, region: 'bamboo', named: 'duanjianke', n_: '劍冢外圍' },
  b_field: { x: 1750, y: 1750, r: 300, types: ['assassin', 'snake', 'cracker'], n: 5, region: 'bamboo', n_: '竹海' },
  secret_bamboo: { x: 350, y: 280, r: 220, types: ['sprite', 'assassin'], n: 3, region: 'bamboo', elite: true, n_: '竹海石門後' },
  well_room: { x: 5850, y: 750, r: 330, types: ['bandit', 'wolf', 'archer'], n: 5, region: 'secret', elite: true, n_: '枯井秘境', room: true },
};
const CHESTS = {
  v1: { x: 3900, y: 720 }, v2: { x: 4960, y: 2050 }, v3: { x: 2800, y: 3200 }, v4: { x: 3300, y: 1300 }, v5: { x: 4450, y: 1650 },
  b1: { x: 300, y: 3450 }, b2: { x: 1150, y: 450 }, b3: { x: 2300, y: 2650 }, b4: { x: 1950, y: 3350 }, b5: { x: 2350, y: 300 },
  s1: { x: 200, y: 180, rich: true }, s2: { x: 6100, y: 500, rich: true, room: true }, island: { x: 70, y: 3300, rich: true },
};
const STELES = {
  drunk: { x: 3840, y: 1740 }, dog: { x: 3420, y: 2180 }, tiger: { x: 3000, y: 1180 }, oldstory: { x: 3960, y: 3330 }, well: { x: 4800, y: 560 },
  resonance: { x: 1740, y: 1240 }, liu_orphan: { x: 1100, y: 1500 }, myna: { x: 1050, y: 1080 }, stonegate: { x: 900, y: 720 }, token: { x: 1500, y: 2080 },
};
const BAMBOO_STALKS = [[480, 1460], [820, 1440], [940, 1700], [790, 1900], [460, 1890], [360, 1650]];

/* 平移 1a 內容 */
(function shiftOld() {
  const mv = o => { if (o.room) o.x += ROOM_DX; o.y += OY; };
  Object.values(PLACES).forEach(mv); Object.values(BLD_POS).forEach(mv); VILLAGE_BLDS.forEach(mv);
  TERRAIN.forEach(mv); Object.values(CAMPS).forEach(mv); Object.values(CHESTS).forEach(mv); Object.values(STELES).forEach(mv);
  ROOMS.forEach(r => { r.x += ROOM_DX; r.y += OY; }); BAMBOO_STALKS.forEach(p => p[1] += OY);
})();

/* ---------- 1b 新地圖 ---------- */
const MAP_W = 10300, MAP_H = 7800, WORLD_W = 12600; // 2b：東側加上中原古城、崑崙山仙境；秘境房間往東移 ROOM_DX2
const OLD_E = 7800, ROOM_DX2 = 2500, CITY = { x0: 8700, y0: 3100, x1: 9900, y1: 4700 };
const SOUTH_Y = 5400;
const SWAMP_QING_LV = 5; // 毒沼：輕功練到這一重才過得去 // 2a：南方山脊（以南是第二章的苗疆、東海）
const NORTH_Y = 1720; // 北方山脊（南緣 1800）
Object.assign(PLACES, {
  // 寒江雪嶺（西北）
  station_snow: { x: 1650, y: 1450, n: '寒江驛站', station: 'snow' }, board_w: { x: 1800, y: 1520, n: '告示板' },
  ferry: { x: 2650, y: 1180, n: '寒江渡口', npc: 'boatwife' }, ice_cave: { x: 650, y: 360, n: '冰窟', npc: 'nun' },
  oldman: { x: 3000, y: 1500, n: '走火入魔的老者', npc: 'oldman' }, cliff_edge: { x: 230, y: 230, n: '斷崖' },
  fisher: { x: 2350, y: 760, n: '江心孤舟', npc: 'fisher' }, boatman: { x: 1050, y: 880, n: '冰面窟窿' },
  river_arena: { x: 1800, y: 820, n: '結冰江面', arena: 'gusou' }, ice_hole: { x: 3550, y: 820, n: '冰湖薄處' },
  // 黃沙古道（東）
  station_sand: { x: 5850, y: 4650, n: '絲路驛站', station: 'sand' }, board_s: { x: 6000, y: 4720, n: '告示板' },
  caravan_boss: { x: 5700, y: 4540, n: '商幫把頭', npc: 'caravan_boss' }, caravan: { x: 6450, y: 4150, n: '遇劫的商隊', npc: 'caravan' },
  blade_tomb: { x: 7250, y: 4950, n: '刀客墓' }, oasis: { x: 7400, y: 3050, n: '沙中水源' },
  sand_valley: { x: 6300, y: 2080, n: '流沙谷', arena: 'tieba' }, valley_mouth: { x: 6000, y: 2640, n: '流沙谷口' }, sand_ruin: { x: 7500, y: 2050, n: '沙丘下的城垛' },
  // 血影教總壇（東北）
  station_cult: { x: 4450, y: 1450, n: '荒廟驛站', station: 'cult' }, board_c: { x: 4600, y: 1520, n: '告示板' },
  barrier_gate: { x: 6450, y: 1660, n: '血色結界' }, scripture: { x: 5800, y: 420, n: '總壇藏經室' }, mole: { x: 6050, y: 820, n: '神色慌張的教眾', npc: 'mole' },
  prison: { x: 7350, y: 780, n: '血牢' }, chamber: { x: 7380, y: 330, n: '教主密室' }, blood_hall: { x: 6600, y: 470, n: '血池殿', arena: 'li' }, blood_cellar: { x: 4150, y: 260, n: '地底石階' },
  // 秘境出口
  ice_exit: { x: 8180, y: 3360, n: '冰洞出口', room: true }, ruin_exit: { x: 8180, y: 4460, n: '古城出口', room: true }, cellar_exit: { x: 8180, y: 260, n: '石階出口', room: true },
});
ROOMS.push({ id: 'ice_room', x: 8100, y: 3300, w: 900, h: 900 }, { id: 'ruin_room', x: 8100, y: 4400, w: 900, h: 900 }, { id: 'cellar_room', x: 8100, y: 200, w: 900, h: 900 });
const SECRET_LINKS = { well: ['well', 'well_exit'], ice: ['ice_hole', 'ice_exit'], ruin: ['sand_ruin', 'ruin_exit'], cellar: ['blood_cellar', 'cellar_exit'] };
TERRAIN.push(
  // 北方山脊：三處山口
  { t: 'mount', x: 0, y: NORTH_Y, w: 1500, h: 80 }, { t: 'gate', key: 'roads', x: 1500, y: NORTH_Y, w: 300, h: 80 }, { t: 'mount', x: 1800, y: NORTH_Y, w: 2500, h: 80 },
  { t: 'gate', key: 'roads', x: 4300, y: NORTH_Y, w: 300, h: 80 }, { t: 'mount', x: 4600, y: NORTH_Y, w: 2700, h: 80 }, { t: 'gate', key: 'roads', x: 7300, y: NORTH_Y, w: 300, h: 80 }, { t: 'mount', x: 7600, y: NORTH_Y, w: 200, h: 80 },
  // 雪嶺與總壇之間
  { t: 'mount', x: 3880, y: 0, w: 60, h: 560 }, { t: 'mount', x: 3880, y: 900, w: 60, h: NORTH_Y - 900 },
  // 落霞村與黃沙古道之間
  { t: 'mount', x: 5200, y: 1800, w: 160, h: 2650 }, { t: 'gate', key: 'roads', x: 5200, y: 4450, w: 160, h: 300 }, { t: 'mount', x: 5200, y: 4750, w: 160, h: 650 },
  // 寒江雪嶺：冰縫圍住冰湖薄處
  { t: 'crack', x: 3380, y: 640, w: 340, h: 50 }, { t: 'crack', x: 3380, y: 950, w: 340, h: 50 }, { t: 'crack', x: 3380, y: 690, w: 50, h: 260 }, { t: 'crack', x: 3670, y: 690, w: 50, h: 260 },
  { t: 'mount', x: 380, y: 0, w: 60, h: 160 }, { t: 'mount', x: 0, y: 470, w: 300, h: 60 },
  // 黃沙古道：流沙帶擋住流沙谷
  { t: 'sand', x: 5360, y: 2440, w: 2440, h: 130 },
  { t: 'mount', x: 6850, y: 3900, w: 300, h: 120 }, { t: 'mount', x: 5600, y: 3700, w: 200, h: 260 },
  // 血影教總壇：外牆與血色結界
  { t: 'wall', x: 5400, y: 120, w: 2300, h: 50 }, { t: 'wall', x: 5400, y: 120, w: 50, h: 1500 }, { t: 'wall', x: 7650, y: 120, w: 50, h: 1500 },
  { t: 'wall', x: 5400, y: 1570, w: 900, h: 50 }, { t: 'barrier', x: 6300, y: 1570, w: 300, h: 50 }, { t: 'wall', x: 6600, y: 1570, w: 1100, h: 50 },
);
Object.assign(CAMPS, {
  // 寒江雪嶺
  snowwolf_den: { x: 520, y: 1330, r: 300, types: ['snowwolf'], n: 6, region: 'snow', n_: '狼群雪洞' },
  traitor_camp: { x: 2750, y: 330, r: 320, types: ['traitor', 'traitor', 'icespirit'], n: 6, region: 'snow', named: 'hanwuyi', n_: '叛徒營' },
  bear_den: { x: 3450, y: 1420, r: 280, types: ['snowbear', 'snowwolf'], n: 4, region: 'snow', named: 'oldbear', n_: '雪熊洞' },
  w_field: { x: 2300, y: 1420, r: 300, types: ['snowwolf', 'iceball', 'traitor'], n: 5, region: 'snow', n_: '雪原' },
  w_field2: { x: 1300, y: 330, r: 300, types: ['icespirit', 'snowbear', 'iceball'], n: 5, region: 'snow', n_: '冰坡' },
  ice_room: { x: 8550, y: 3750, r: 330, types: ['traitor', 'icespirit', 'snowwolf'], n: 5, region: 'secret', elite: true, n_: '冰湖之下' },
  // 黃沙古道
  scorpion_nest: { x: 5950, y: 3350, r: 300, types: ['scorpion', 'scorpion', 'wormhole'], n: 6, region: 'sand', n_: '蠍巢' },
  horse_camp: { x: 7150, y: 3600, r: 330, types: ['horse_bandit', 'horse_bandit', 'vulture'], n: 6, region: 'sand', named: 'shalifei', n_: '馬賊營' },
  robber_camp: { x: 6700, y: 5100, r: 260, types: ['oilthief', 'scorpion'], n: 4, region: 'sand', named: 'guishouqi', n_: '古墓盜洞' },
  iron_pass: { x: 6300, y: 2850, r: 300, types: ['horse_bandit', 'oilthief', 'vulture'], n: 6, region: 'sand', n_: '鐵霸的關卡' },
  s_field: { x: 6150, y: 3950, r: 300, types: ['horse_bandit', 'vulture', 'scorpion'], n: 5, region: 'sand', n_: '戈壁' },
  s_field2: { x: 7350, y: 4400, r: 300, types: ['wormhole', 'oilthief', 'scorpion'], n: 5, region: 'sand', n_: '沙丘' },
  ruin_room: { x: 8550, y: 4850, r: 330, types: ['horse_bandit', 'scorpion', 'oilthief'], n: 5, region: 'secret', elite: true, n_: '沙下古城' },
  // 血影教總壇
  cult_outer: { x: 5000, y: 1250, r: 300, types: ['cultist', 'hexer'], n: 5, region: 'cult', n_: '血影外營' },
  bat_cave: { x: 4500, y: 650, r: 300, types: ['batnest', 'cultist', 'sacrifice'], n: 5, region: 'cult', n_: '蝠窟' },
  barracks: { x: 5900, y: 1250, r: 320, types: ['cultist', 'hexer', 'sacrifice'], n: 7, region: 'cult', inner: true, n_: '教眾營房' },
  pool_guard: { x: 6550, y: 1000, r: 280, types: ['bloodpuppet', 'cultist'], n: 5, region: 'cult', inner: true, named: 'judge', n_: '血池殿外' },
  priest_camp: { x: 7200, y: 1250, r: 300, types: ['hexer', 'bloodpuppet', 'batnest'], n: 6, region: 'cult', inner: true, named: 'priestess', n_: '血牢外' },
  cellar_room: { x: 8550, y: 650, r: 330, types: ['bloodpuppet', 'hexer', 'cultist'], n: 5, region: 'secret', elite: true, n_: '地底血獄' },
});
Object.assign(CHESTS, {
  w1: { x: 150, y: 1650 }, w2: { x: 3700, y: 300 }, w3: { x: 2000, y: 1250 }, w4: { x: 1150, y: 1650 }, w5: { x: 3550, y: 820, rich: true },
  d1: { x: 7650, y: 5250 }, d2: { x: 5500, y: 2700 }, d3: { x: 7650, y: 3300 }, d4: { x: 6900, y: 2200 }, d5: { x: 5450, y: 5250 },
  c1: { x: 4050, y: 1550 }, c2: { x: 5200, y: 300 }, c3: { x: 5550, y: 1450 }, c4: { x: 7550, y: 1450 }, c5: { x: 6900, y: 250 },
  s3: { x: 8850, y: 3450, rich: true, room: true }, s4: { x: 8850, y: 4550, rich: true, room: true }, s5: { x: 8850, y: 350, rich: true, room: true },
});
Object.assign(STELES, {
  meteor_tale: { x: 5980, y: 4500 }, blade_tale: { x: 7100, y: 5000 }, ghost_tale: { x: 6550, y: 4950 }, guild_tale: { x: 5650, y: 4700 }, ruin_tale: { x: 7550, y: 2750 },
  fall: { x: 380, y: 330 }, fisher_tale: { x: 2700, y: 1250 }, nun_tale: { x: 820, y: 520 }, fox_tale: { x: 200, y: 1100 }, lake_tale: { x: 3250, y: 1100 },
  bloodmoon: { x: 4700, y: 1350 }, founder: { x: 5900, y: 330 }, pool_tale: { x: 6350, y: 760 }, roster: { x: 7200, y: 950 }, abyss: { x: 4250, y: 380 },
});
// 頭目場地機關
const ARENAS = {
  liu: { place: 'arena', r: 400 },
  tieba: { place: 'sand_valley', r: 340, pillars: [[-200, -120], [200, -120], [-200, 140], [200, 140]] },
  gusou: { place: 'river_arena', r: 380 },
  li: { place: 'blood_hall', r: 330, pools: [[-210, -110], [210, -110], [-210, 150], [210, 150]] },
};

/* ---------- 2a 第二章：苗疆毒沼（西南）、東海漁村與海島（東南） ---------- */
Object.assign(PLACES, {
  // 苗疆毒沼
  station_miao: { x: 2050, y: 5720, n: '苗疆驛站', station: 'miao' }, board_m: { x: 2200, y: 5790, n: '告示板' },
  wuyi: { x: 1450, y: 5960, n: '巫醫竹樓', npc: 'wuyi' }, zhaizhu: { x: 900, y: 6120, n: '五毒寨', npc: 'zhaizhu' },
  lost_camp: { x: 3420, y: 6480, n: '荒廢的營地' }, langu: { x: 330, y: 7480, n: '隱谷', npc: 'langu' },
  rival_spot: { x: 3450, y: 5800, n: '林間血跡' }, white_snake: { x: 1250, y: 6620, n: '受傷的白蛇' },
  gu_altar: { x: 1700, y: 7120, n: '蠱母祭壇', arena: 'gumu' }, lotus_isle: { x: 3220, y: 7200, n: '蓮葉盡頭的小島' },
  // 東海漁村與海島
  station_sea: { x: 4700, y: 5720, n: '東海驛站', station: 'sea' }, board_e: { x: 4850, y: 5790, n: '告示板' },
  yubang: { x: 5350, y: 6020, n: '漁幫', npc: 'yubang' }, laochuanfu: { x: 6620, y: 6120, n: '老船夫的碼頭', npc: 'laochuanfu' },
  smuggle_ship: { x: 6780, y: 7280, n: '擱淺的走私船' }, diaosou: { x: 7400, y: 6520, n: '孤島', npc: 'diaosou' },
  sibling: { x: 4330, y: 7280, n: '海邊石洞', npc: 'suxin' }, shark_deck: { x: 5650, y: 7080, n: '鯊王船', arena: 'haitianba' },
  net_spot: { x: 5650, y: 6250, n: '曬網場' }, wreck: { x: 4080, y: 7380, n: '礁岩外的桅杆' },
  // 秘境出口
  isle_exit: { x: 8180, y: 5560, n: '小島洞口', room: true }, wreck_exit: { x: 8180, y: 6660, n: '沉船艙口', room: true },
});
ROOMS.push({ id: 'isle_room', x: 8100, y: 5500, w: 900, h: 900 }, { id: 'wreck_room', x: 8100, y: 6600, w: 900, h: 900 });
Object.assign(SECRET_LINKS, { isle: ['lotus_isle', 'isle_exit'], wreck: ['wreck', 'wreck_exit'] });
// 蓮葉之路：毒沼中央留一條蜿蜒的通道
const LOTUS_PATH = [[2560, 6520], [2600, 6640], [2690, 6740], [2790, 6820], [2880, 6910], [2970, 6990], [3060, 7070], [3150, 7140]];
// 毒沼：以 80 步的格子鋪滿，蓮葉路與小島留空（要能踏水的輕功才走得過其他地方）
(function genSwamp() { const C = 80, x0 = 2420, y0 = 6560, x1 = 3780, y1 = 7460, near = (x, y) => { for (let i = 0; i < LOTUS_PATH.length - 1; i++) { const [ax, ay] = LOTUS_PATH[i], [bx, by] = LOTUS_PATH[i + 1]; const L = (bx - ax) ** 2 + (by - ay) ** 2, t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / L)); } return Math.hypot(x - 3220, y - 7200) < 150; };
  for (let y = y0; y < y1; y += C) { let run = null; for (let x = x0; x <= x1; x += C) { const free = x >= x1 || near(x + C / 2, y + C / 2); if (!free) { if (!run) run = { t: 'swamp', x, y, w: 0, h: C }; run.w += C; } else if (run) { TERRAIN.push(run); run = null; } } } })();
TERRAIN.push(
  // 南方山脊：三處山口（擊敗血影教主、三年後開通）
  { t: 'mount', x: 0, y: SOUTH_Y, w: 1750, h: 80 }, { t: 'gate', key: 'ch2', x: 1750, y: SOUTH_Y, w: 300, h: 80 }, { t: 'mount', x: 2050, y: SOUTH_Y, w: 2100, h: 80 },
  { t: 'gate', key: 'ch2', x: 4150, y: SOUTH_Y, w: 300, h: 80 }, { t: 'mount', x: 4450, y: SOUTH_Y, w: 1750, h: 80 }, { t: 'gate', key: 'ch2', x: 6200, y: SOUTH_Y, w: 300, h: 80 }, { t: 'mount', x: 6500, y: SOUTH_Y, w: 1300, h: 80 },
  // 苗疆與東海之間
  { t: 'mount', x: 3880, y: 5480, w: 60, h: 820 }, { t: 'mount', x: 3880, y: 6600, w: 60, h: 1200 },
  // 隱谷：山壁圍住，只留北口
  { t: 'mount', x: 40, y: 7100, w: 260, h: 60 }, { t: 'mount', x: 460, y: 7100, w: 240, h: 60 }, { t: 'mount', x: 640, y: 7160, w: 60, h: 600 },
  // 瘴氣牆（鬼影步）：西邊的毒林
  { t: 'miasma', x: 60, y: 6150, w: 380, h: 50 }, { t: 'miasma', x: 440, y: 6150, w: 50, h: 380 }, { t: 'miasma', x: 60, y: 6480, w: 380, h: 50 },
  // 東海：海面
  { t: 'water', x: 6960, y: 5480, w: 840, h: 2320 }, { t: 'water', x: 3940, y: 7470, w: 3020, h: 330 },
);
Object.assign(CAMPS, {
  // 苗疆毒沼（一流）
  gu_nest: { x: 3000, y: 6080, r: 300, types: ['gu', 'gu', 'gujar'], n: 7, region: 'miao', n_: '蠱蟲窩' },
  tribe_camp: { x: 650, y: 6800, r: 320, types: ['miao_warrior', 'blowdart', 'toad'], n: 6, region: 'miao', named: 'wudu_tongzi', n_: '毒沼部落' },
  snake_grove: { x: 2700, y: 5800, r: 300, types: ['miao_warrior', 'gu', 'toad'], n: 6, region: 'miao', named: 'aluo', n_: '蛇林' },
  m_field: { x: 1500, y: 6450, r: 300, types: ['blowdart', 'gu', 'toad'], n: 5, region: 'miao', n_: '毒林' },
  altar: { x: 1150, y: 6950, r: 300, types: ['gujar', 'miao_warrior', 'blowdart'], n: 6, region: 'miao', n_: '祭壇外圍' },
  isle_room: { x: 8550, y: 5950, r: 330, types: ['gu', 'miao_warrior', 'toad'], n: 6, region: 'secret', elite: true, n_: '蓮葉小島' },
  // 東海漁村與海島（一流）
  pirate_post: { x: 6150, y: 5720, r: 300, types: ['pirate', 'pirate', 'pirate_xbow'], n: 6, region: 'sea', n_: '海盜前哨' },
  pirate_fort: { x: 6450, y: 6850, r: 330, types: ['pirate', 'pirate_xbow', 'pirate'], n: 7, region: 'sea', named: 'laojing', n_: '海盜船寨' },
  crab_reef: { x: 4550, y: 6880, r: 300, types: ['crab', 'crab', 'water_ghost'], n: 6, region: 'sea', n_: '礁岩蟹窟' },
  shore: { x: 6700, y: 6500, r: 280, types: ['water_ghost', 'pirate'], n: 5, region: 'sea', named: 'coral', n_: '淺灘' },
  e_field: { x: 5150, y: 6600, r: 300, types: ['pirate', 'pirate_xbow', 'crab'], n: 5, region: 'sea', n_: '海岸' },
  wreck_room: { x: 8550, y: 7050, r: 330, types: ['pirate', 'water_ghost', 'crab'], n: 6, region: 'secret', elite: true, n_: '沉船艙底' },
});
Object.assign(CHESTS, {
  m1: { x: 250, y: 6340, rich: true }, m2: { x: 3700, y: 5650 }, m3: { x: 120, y: 7650 }, m4: { x: 1200, y: 7600 }, m5: { x: 3700, y: 6420 },
  e1: { x: 7400, y: 6700, rich: true }, e2: { x: 4100, y: 6200 }, e3: { x: 5900, y: 7350 }, e4: { x: 6850, y: 5700 }, e5: { x: 5000, y: 7300 },
  s6: { x: 8850, y: 5650, rich: true, room: true }, s7: { x: 8850, y: 6750, rich: true, room: true },
});
Object.assign(STELES, {
  baishe: { x: 1150, y: 6520 }, duxian: { x: 520, y: 7040 }, lost_tale: { x: 3250, y: 6340 }, guwang: { x: 2150, y: 6740 }, lotus_tale: { x: 2480, y: 6480 },
  net_tale: { x: 5500, y: 6130 }, tide_tale: { x: 7300, y: 6380 }, shark_tale: { x: 6050, y: 6950 }, flag_tale: { x: 6700, y: 7180 }, wreck_tale: { x: 4250, y: 7150 },
});
Object.assign(ARENAS, {
  gumu: { place: 'gu_altar', r: 360, lotus: [[-200, -120], [200, -120], [0, 30], [-210, 170], [210, 170]] },
  haitianba: { place: 'shark_deck', r: 360, deck: true },
});

/* ---------- 2b 第二章後半：中原古城（東）、崑崙山仙境（東北） ---------- */
// 秘境房間整排往東移，騰出東側新地圖
(function shiftRooms() { const mv = o => { if (o.x > 8000) o.x += ROOM_DX2; };
  [PLACES, CAMPS, CHESTS, STELES].forEach(T => Object.values(T).forEach(mv)); ROOMS.forEach(mv); })();
Object.assign(PLACES, {
  // 中原古城
  station_zhong: { x: 8150, y: 3900, n: '古城驛站', station: 'zhong' }, board_z: { x: 8320, y: 3990, n: '告示板' },
  leitai: { x: 9300, y: 3480, n: '武林大會擂台', npc: 'leitai_master', arena: 'linxiao' }, teahouse: { x: 8960, y: 4060, n: '茶樓', npc: 'zhangbanxia' },
  huiguan: { x: 9620, y: 3420, n: '正派會館', npc: 'huiguan' }, lin_home: { x: 9640, y: 3760, n: '林家別院' },
  weapon_shop: { x: 9620, y: 4120, n: '兵器鋪', npc: 'zy_smith' }, casino: { x: 8980, y: 4470, n: '賭坊', npc: 'gambler' },
  blackmarket: { x: 9560, y: 4480, n: '黑市' }, mengzhu_fu: { x: 9300, y: 4120, n: '盟主府', npc: 'linxiao' },
  gamble_den: { x: 9300, y: 5040, n: '地下賭坊', arena: 'jinsuanpan' }, tomb_gate: { x: 8080, y: 5250, n: '古城地宮入口' },
  // 崑崙山仙境
  station_kunlun: { x: 8150, y: 2350, n: '崑崙驛站', station: 'kunlun' }, board_k: { x: 8320, y: 2430, n: '告示板' },
  taoguan: { x: 9150, y: 1380, n: '崑崙道觀', npc: 'guanzhu' }, saodi: { x: 9620, y: 1120, n: '道觀後院', npc: 'saodi' },
  cloud_bridge: { x: 8800, y: 520, n: '崑崙雲橋', arena: 'yunhe' }, yunhai_tai: { x: 9900, y: 520, n: '雲海天台', arena: 'xuanxiao' },
  kid_spot: { x: 9350, y: 260, n: '雲崖' }, yunhai_trial: { x: 8150, y: 420, n: '雲海崖' }, chess: { x: 8220, y: 1120, n: '雲中棋局', npc: 'crane_old' },
  puppet_lab: { x: 10080, y: 1460, n: '煉偶房' }, pine_cave: { x: 7990, y: 1560, n: '古松洞' },
  // 青崖山頂（師父線的決戰）、血獄試煉塔入口
  qingya_peak: { x: 4300, y: 3880, n: '青崖山頂', arena: 'qingxu' }, jie_bell: { x: 4060, y: 5080, n: '江湖劫鐘' }, tower_gate: { x: 4650, y: 1620, n: '血獄試煉塔' },
  // 秘境出口
  tomb_exit: { x: 11680, y: 260, n: '地宮出口', room: true }, cloud_exit: { x: 11680, y: 1360, n: '松洞出口', room: true }, tower_exit: { x: 11680, y: 2460, n: '塔門', room: true },
});
ROOMS.push({ id: 'tomb_room', x: 11600, y: 200, w: 900, h: 900 }, { id: 'cloud_room', x: 11600, y: 1300, w: 900, h: 900 }, { id: 'tower_room', x: 11600, y: 2400, w: 900, h: 900 });
Object.assign(SECRET_LINKS, { tomb: ['tomb_gate', 'tomb_exit'], cloud: ['pine_cave', 'cloud_exit'] });
TERRAIN.push(
  // 舊地圖東緣的山脊：兩處山口（擊敗血影教主、三年後開通）
  { t: 'mount', x: OLD_E, y: 0, w: 80, h: 1950 }, { t: 'gate', key: 'ch2', x: OLD_E, y: 1950, w: 80, h: 300 }, { t: 'mount', x: OLD_E, y: 2250, w: 80, h: 1500 },
  { t: 'gate', key: 'ch2', x: OLD_E, y: 3750, w: 80, h: 300 }, { t: 'mount', x: OLD_E, y: 4050, w: 80, h: 1350 },
  // 崑崙與中原之間
  { t: 'mount', x: 7880, y: 2560, w: 1120, h: 80 }, { t: 'gate', key: 'ch2', x: 9000, y: 2560, w: 300, h: 80 }, { t: 'mount', x: 9300, y: 2560, w: 1000, h: 80 },
  // 崑崙：雲線山脊（中間一道缺口，東邊斷崖要草上飛之類的輕功）
  { t: 'mount', x: 7880, y: 900, w: 570, h: 60 }, { t: 'mount', x: 8700, y: 900, w: 900, h: 60 }, { t: 'cliff', x: 9600, y: 900, w: 200, h: 60 }, { t: 'mount', x: 9800, y: 900, w: 500, h: 60 },
  // 中原古城城牆（四面城門）
  { t: 'wall', city: 1, x: CITY.x0, y: CITY.y0, w: 500, h: 50 }, { t: 'wall', city: 1, x: CITY.x0 + 700, y: CITY.y0, w: 500, h: 50 },
  { t: 'wall', city: 1, x: CITY.x0, y: CITY.y1 - 50, w: 500, h: 50 }, { t: 'wall', city: 1, x: CITY.x0 + 700, y: CITY.y1 - 50, w: 500, h: 50 },
  { t: 'wall', city: 1, x: CITY.x0, y: CITY.y0, w: 50, h: 700 }, { t: 'wall', city: 1, x: CITY.x0, y: CITY.y0 + 900, w: 50, h: 700 },
  { t: 'wall', city: 1, x: CITY.x1 - 50, y: CITY.y0, w: 50, h: 700 }, { t: 'wall', city: 1, x: CITY.x1 - 50, y: CITY.y0 + 900, w: 50, h: 700 },
  // 東邊大海
  { t: 'water', x: OLD_E, y: 5400, w: MAP_W - OLD_E, h: MAP_H - 5400 },
);
// 古城裡的房子（底部中心座標、寬度）
const CITY_BLDS = [{ id: 'b_teahouse', x: 8960, y: 3980, w: 220 }, { id: 'b_huiguan', x: 9620, y: 3340, w: 230 }, { id: 'b_shop', x: 9620, y: 4040, w: 190 }, { id: 'b_casino', x: 8980, y: 4390, w: 220 },
  { id: 'b_mansion', x: 9300, y: 4040, w: 240 }, { id: 'b_cityhouse', x: 8880, y: 3420, w: 170 }, { id: 'b_cityhouse', x: 8880, y: 3720, w: 160 }, { id: 'b_cityhouse', x: 9720, y: 3700, w: 150 }, { id: 'b_stall', x: 9560, y: 4420, w: 150 }];
CITY_BLDS.forEach(b => TERRAIN.push({ t: 'bld', x: b.x - b.w * .4, y: b.y - b.w * .32, w: b.w * .8, h: b.w * .32 - 8 }));
Object.assign(CAMPS, {
  // 中原古城（宗師）
  guard_camp: { x: 10080, y: 3420, r: 220, types: ['guard', 'xbow', 'guard'], n: 6, region: 'zhong', named: 'tiebutou', n_: '官兵營' },
  thug_alley: { x: 8260, y: 4900, r: 300, types: ['thug', 'dogman', 'thug'], n: 6, region: 'zhong', named: 'heixiong', n_: '黑市後巷' },
  z_field: { x: 8260, y: 3080, r: 280, types: ['thug', 'guard', 'dogman'], n: 5, region: 'zhong', n_: '城外官道' },
  z_field2: { x: 9980, y: 5130, r: 240, types: ['guard', 'xbow', 'thug'], n: 5, region: 'zhong', n_: '碼頭倉庫' },
  dog_yard: { x: 10080, y: 4520, r: 220, types: ['dogman', 'hound', 'thug'], n: 5, region: 'zhong', n_: '鬥犬場' },
  tomb_room: { x: 12050, y: 650, r: 330, types: ['guard', 'thug', 'xbow'], n: 6, region: 'secret', elite: true, n_: '古城地宮' },
  // 崑崙山仙境（宗師）
  ape_cliff: { x: 8550, y: 1620, r: 280, types: ['ape', 'ape', 'talisman'], n: 6, region: 'kunlun', named: 'baiyuan', n_: '雲中猿群' },
  puppet_hall: { x: 9700, y: 1900, r: 280, types: ['puppet', 'talisman', 'puppet'], n: 6, region: 'kunlun', named: 'qingsong', n_: '傀儡殿' },
  furnace_yard: { x: 9120, y: 2150, r: 260, types: ['furnace', 'puppet', 'talisman'], n: 5, region: 'kunlun', n_: '丹爐場' },
  k_field: { x: 8650, y: 2250, r: 250, types: ['ape', 'puppet', 'talisman'], n: 5, region: 'kunlun', n_: '雲坡' },
  k_field2: { x: 10060, y: 2250, r: 230, types: ['thunder', 'ape'], n: 4, region: 'kunlun', n_: '雷峰' },
  cloud_room: { x: 12050, y: 1750, r: 330, types: ['puppet', 'ape', 'thunder'], n: 6, region: 'secret', elite: true, n_: '雲上洞天' },
});
Object.assign(CHESTS, {
  z1: { x: 7990, y: 2760 }, z2: { x: 10200, y: 2760 }, z3: { x: 8000, y: 5320, rich: true }, z4: { x: 10220, y: 5320 }, z5: { x: 9800, y: 4560 },
  k1: { x: 7990, y: 120 }, k2: { x: 10220, y: 1000, rich: true }, k3: { x: 8100, y: 1900 }, k4: { x: 10220, y: 1950 }, k5: { x: 9250, y: 1020 },
  s8: { x: 12350, y: 350, rich: true, room: true }, s9: { x: 12350, y: 1450, rich: true, room: true },
});
Object.assign(STELES, {
  zy_leitai: { x: 9020, y: 3260 }, zy_tea: { x: 8800, y: 4180 }, zy_ledger: { x: 9750, y: 4380 }, zy_lin: { x: 9500, y: 3260 }, zy_tomb: { x: 8250, y: 5200 },
  kl_crane: { x: 8400, y: 1150 }, kl_puppet: { x: 9900, y: 1600 }, kl_pill: { x: 9000, y: 1580 }, kl_bridge: { x: 8550, y: 980 }, kl_pine: { x: 8100, y: 1700 },
});
Object.assign(ARENAS, {
  jinsuanpan: { place: 'gamble_den', r: 330, tables: [[-170, -100], [170, -100], [-170, 120], [170, 120]] },
  yunhe: { place: 'cloud_bridge', r: 330, bridge: true },
  linxiao: { place: 'leitai', r: 320, stage: true }, xuanxiao: { place: 'yunhai_tai', r: 330, thunder: true }, qingxu: { place: 'qingya_peak', r: 330, peak: true },
});

function regionAt(x, y) { if (x > 10500) return 'secret'; if (x >= OLD_E + 40 && y < 5400) return y < 2600 ? 'kunlun' : 'zhong'; if (y >= SOUTH_Y + 40) return x < 3910 ? 'miao' : 'sea'; if (y < 1800) return x < 3900 ? 'snow' : 'cult'; if (x > 5280) return 'sand'; return x < 2600 ? 'bamboo' : 'village'; }
function regionName(r) { return r === 'secret' ? '秘境' : REGIONS[r].n; }
function curRegion() { return regionAt(P.x, P.y); }
const regionOpen = r => r === 'village' || r === 'secret' || (r === 'bamboo' ? !!S.unlock.bamboo : ['miao', 'sea', 'zhong', 'kunlun'].includes(r) ? !!S.unlock.ch2 : !!S.unlock.roads);

/* 建築擋路（只擋下半部，門口前方的互動圈可以走） */
VILLAGE_BLDS.forEach(b => TERRAIN.push({ t: 'bld', x: b.x - b.w * .4, y: b.y - b.w * .32, w: b.w * .8, h: b.w * .32 - 8 }));
for (const k in BLD_POS) { const b = BLD_POS[k], w = k === 'hall' ? 200 : 150; TERRAIN.push({ t: 'bld', k, x: b.x - w * .4, y: b.y - w * .3, w: w * .8, h: w * .3 - 8 }); }
TERRAIN.push({ t: 'bld', x: 4300 - 120, y: 2900 + OY - 90, w: 240, h: 82 });

/* ---------- 地形碰撞 ---------- */
const BLOCK_MSG = { gate: '山道還沒清開，先完成落霞村的主線', water: '江面過不去：需要能踏水的輕功（例如浪裡蛟）', cliff: '斷崖跳不過去：需要裝上草上飛之類的輕功',
  sand: '流沙會把人拖下去：需要裝上站得穩的輕功（例如鐵馬步）', crack: '冰面裂縫太寬：需要裝上踏雪無痕之類的寒屬性輕功', barrier: '血色結界擋住去路：要集齊三枚血影令才破得開',
  swamp: `毒沼深不見底：要把裝備中的輕功練到第 ${SWAMP_QING_LV} 重以上，才踩得過毒水`, miasma: '瘴氣牆：吸一口就頭暈，需要裝上鬼影步或高階輕功' };
function canPass(t) {
  if (t.t === 'bld') return !!(t.k && !S.bld[t.k]);
  if (t.t === 'mount' || t.t === 'wall') return false;
  if (t.t === 'gate') return !!S.unlock[t.key || 'bamboo'];
  if (t.t === 'barrier') return !!S.cultOpen;
  const q = S.slots.qing ? getBook(S.slots.qing) : null;
  if (t.t === 'water') return !!(q && q.water);
  if (t.t === 'swamp') return !!(q && S.books[S.slots.qing] && S.books[S.slots.qing].lv >= SWAMP_QING_LV);
  if (t.t === 'miasma') return !!(q && (q.attrs.includes('毒') || q.tier >= 2));
  if (t.t === 'cliff') return !!(q && (q.attrs.includes('柔') || q.tier >= 2));
  if (t.t === 'sand') return !!(q && (q.attrs.includes('剛') || q.tier >= 2));
  if (t.t === 'crack') return !!(q && (q.attrs.includes('寒') || q.tier >= 2));
  return true;
}
const ENEMY_BLOCK = new Set(['mount', 'gate', 'water', 'cliff', 'bld', 'wall', 'barrier', 'sand', 'crack', 'swamp', 'miasma']);
function collide(o, r, isPlayer) {
  for (const t of TERRAIN) {
    if (isPlayer ? canPass(t) : !ENEMY_BLOCK.has(t.t)) continue;
    const cx = clamp(o.x, t.x, t.x + t.w), cy = clamp(o.y, t.y, t.y + t.h);
    const dx = o.x - cx, dy = o.y - cy, d = Math.hypot(dx, dy);
    if (d < r) {
      if (d > 0.01) { o.x = cx + dx / d * r; o.y = cy + dy / d * r; }
      else { const l = o.x - t.x, rr = t.x + t.w - o.x, u = o.y - t.y, b = t.y + t.h - o.y, m = Math.min(l, rr, u, b); if (m === l) o.x = t.x - r; else if (m === rr) o.x = t.x + t.w + r; else if (m === u) o.y = t.y - r; else o.y = t.y + t.h + r; }
      if (isPlayer && BLOCK_MSG[t.t] && !P.blockMsg) { P.blockMsg = 2.5; toast(t.t === 'gate' && t.key === 'roads' ? '驛路還沒開通：先完成落霞村的主線「下山」' : t.t === 'gate' && t.key === 'ch2' ? '山口還封著：擊敗血影教主之後才會開通' : BLOCK_MSG[t.t]); }
    }
  }
  const inRoom = ROOMS.find(rm => o.x > rm.x - 50 && o.x < rm.x + rm.w + 50 && o.y > rm.y - 50 && o.y < rm.y + rm.h + 50);
  if (inRoom) { o.x = clamp(o.x, inRoom.x + r, inRoom.x + inRoom.w - r); o.y = clamp(o.y, inRoom.y + r, inRoom.y + inRoom.h - r); }
  else { o.x = clamp(o.x, 40, MAP_W - 40); o.y = clamp(o.y, 40, MAP_H - 40); }
}

/* ---------- 資源點 ---------- */
let NODES_R = [];
function genResources() {
  const R = mulberry(2026);
  const plan = { village: { wood: 70, herb: 40, iron: 16 }, bamboo: { wood: 80, herb: 45, iron: 10 }, sand: { wood: 22, herb: 30, iron: 60 }, snow: { wood: 45, herb: 40, iron: 45 }, cult: { wood: 15, herb: 25, iron: 30 }, miao: { wood: 60, herb: 70, iron: 12 }, sea: { wood: 25, herb: 25, iron: 55 }, zhong: { wood: 18, herb: 22, iron: 34 }, kunlun: { wood: 34, herb: 46, iron: 40 } };
  const avoid = [...Object.values(PLACES).map(p => ({ x: p.x, y: p.y, r: 170 })), ...Object.values(CAMPS).map(c => ({ x: c.x, y: c.y, r: c.r * 0.6 })), { x: 4300, y: 2900 + OY, r: 720 },
    ...Object.values(ARENAS).map(a => ({ x: PLACES[a.place].x, y: PLACES[a.place].y, r: a.r + 60 }))];
  NODES_R = [];
  for (const reg in plan) for (const k in plan[reg]) { let n = plan[reg][k], tries = 0;
    while (n > 0 && tries++ < 30000) { const x = 80 + R() * (MAP_W - 160), y = 80 + R() * (MAP_H - 160); if (regionAt(x, y) !== reg) continue;
      if (avoid.some(a => Math.hypot(a.x - x, a.y - y) < a.r)) continue; if (TERRAIN.some(t => x > t.x - 40 && x < t.x + t.w + 40 && y > t.y - 40 && y < t.y + t.h + 40)) continue;
      if (reg === 'cult' && x > 5350 && x < 7750 && y > 80 && y < 1660 && R() < .5) continue; if (inCity(x, y, 40)) continue;
      const mx = { wood: 5, herb: 3, iron: 4 }[k]; NODES_R.push({ kind: k, region: reg, x, y, hp: mx, max: mx, alive: true, re: 0, r: { wood: 22, herb: 14, iron: 20 }[k], shake: 0, seed: R() }); n--; } }
}
let DECOR = [];
const DECOR_SET = {
  bamboo: [['bamboo', .38], ['rock', .52], ['grass', .85], ['bush', 1]],
  village: [['pine', .22], ['rock', .38], ['grass', .75], ['bush', 1]],
  sand: [['dune_rock', .3], ['deadtree', .42], ['camelthorn', .78], ['bones', .9], ['rock', 1]],
  snow: [['snowpine', .32], ['snowrock', .55], ['snowgrass', .85], ['pine', 1]],
  cult: [['bloodrock', .3], ['banner', .4], ['bones', .62], ['deadtree', .8], ['rock', 1]],
  miao: [['swamptree', .28], ['mushroom', .44], ['fern', .76], ['bones', .84], ['bush', 1]],
  sea: [['palm', .24], ['searock', .5], ['shell', .64], ['seagrass', .9], ['rock', 1]],
  zhong: [['willow', .18], ['pine', .26], ['rock', .42], ['grass', .82], ['bush', 1]],
  kunlun: [['cloudpine', .26], ['snowrock', .46], ['snowpine', .6], ['snowgrass', .86], ['rock', 1]],
};
function genDecor() {
  const R = mulberry(4242); DECOR = [];
  const avoid = [...Object.values(PLACES).map(p => ({ x: p.x, y: p.y, r: 190 })), ...Object.values(CAMPS).map(c => ({ x: c.x, y: c.y, r: 140 })), { x: 4300, y: 2900 + OY, r: 560 },
    ...Object.values(ARENAS).map(a => ({ x: PLACES[a.place].x, y: PLACES[a.place].y, r: a.r + 40 })), ...VILLAGE_BLDS.map(b => ({ x: b.x, y: b.y - 40, r: b.w * .6 })), ...CITY_BLDS.map(b => ({ x: b.x, y: b.y - 40, r: b.w * .6 })),
    ...Object.values(STELES).map(s => ({ x: s.x, y: s.y, r: 90 })), ...Object.values(CHESTS).map(s => ({ x: s.x, y: s.y, r: 80 }))];
  for (let i = 0; i < 13000 && DECOR.length < 1500; i++) { const x = 60 + R() * (MAP_W - 120), y = 60 + R() * (MAP_H - 120); const reg = regionAt(x, y);
    if (avoid.some(a => Math.hypot(a.x - x, a.y - y) < a.r)) continue; if (TERRAIN.some(t => x > t.x - 30 && x < t.x + t.w + 30 && y > t.y - 30 && y < t.y + t.h + 30)) continue;
    if (reg === 'snow' && y > 650 && y < 1000) continue; // 結冰的江面
    if (reg === 'sea' && x > 6900) continue; if (inCity(x, y, 60)) continue;
    const r = R(); const set = DECOR_SET[reg] || DECOR_SET.village; const id = set.find(s => r < s[1])[0];
    DECOR.push({ id, x, y, s: .75 + R() * .5, flip: R() < .5, reg }); }
  DECOR.push({ id: 'lantern', x: 4170, y: 2990 + OY, s: 1 }, { id: 'lantern', x: 4430, y: 2990 + OY, s: 1, flip: true });
}
const inCity = (x, y, m) => x > CITY.x0 - m && x < CITY.x1 + m && y > CITY.y0 - m && y < CITY.y1 + m;
function mulberry(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ---------- 迷霧 ---------- */
const FOG_C = 100, FOG_W = Math.ceil(WORLD_W / FOG_C), FOG_H = Math.ceil(MAP_H / FOG_C);
let FOG = new Uint8Array(FOG_W * FOG_H);
function fogString() { let s = ''; for (let i = 0; i < FOG.length; i += 6) { let v = 0; for (let j = 0; j < 6; j++) v |= (FOG[i + j] ? 1 : 0) << j; s += String.fromCharCode(48 + v); } return s; }
function fogDecode(s, len) { const a = new Uint8Array(len); if (!s) return a; for (let i = 0; i < s.length; i++) { const v = s.charCodeAt(i) - 48; for (let j = 0; j < 6; j++) if (i * 6 + j < len) a[i * 6 + j] = (v >> j) & 1; } return a; }
function fogLoad(s) { FOG = fogDecode(s, FOG_W * FOG_H); }
// 1a 存檔的迷霧（64×36）搬到新地圖
function fogMigrate1a(s) { const ow = 64, oh = 36, old = fogDecode(s, ow * oh); const W2 = 92, nf = new Uint8Array(W2 * FOG_H); const oy = OY / FOG_C, rdx = ROOM_DX / FOG_C;
  for (let cy = 0; cy < oh; cy++) for (let cx = 0; cx < ow; cx++) { if (!old[cy * ow + cx]) continue; const nx = cx >= 53 ? cx + rdx : cx, ny = cy + oy; if (nx < W2 && ny < FOG_H) nf[ny * W2 + nx] = 1; }
  let out = ''; for (let i = 0; i < nf.length; i += 6) { let v = 0; for (let j = 0; j < 6; j++) v |= (nf[i + j] ? 1 : 0) << j; out += String.fromCharCode(48 + v); } return out; }
// 2a 以前的迷霧（寬 92 格）：秘境那一段往東移 25 格
function fogMigrate2b(s) { const ow = 92, old = fogDecode(s, ow * FOG_H), nf = new Uint8Array(FOG_W * FOG_H), d = ROOM_DX2 / FOG_C;
  for (let cy = 0; cy < FOG_H; cy++) for (let cx = 0; cx < ow; cx++) { if (!old[cy * ow + cx]) continue; const nx = cx >= 80 ? cx + d : cx; if (nx < FOG_W) nf[cy * FOG_W + nx] = 1; }
  const keep = FOG; FOG = nf; const out = fogString(); FOG = keep; return out; }
function fogReveal(x, y, r) { const c0 = Math.max(0, Math.floor((x - r) / FOG_C)), c1 = Math.min(FOG_W - 1, Math.floor((x + r) / FOG_C)), r0 = Math.max(0, Math.floor((y - r) / FOG_C)), r1 = Math.min(FOG_H - 1, Math.floor((y + r) / FOG_C));
  let changed = false; for (let cy = r0; cy <= r1; cy++) for (let cx = c0; cx <= c1; cx++) { const px = cx * FOG_C + 50, py = cy * FOG_C + 50; if ((px - x) ** 2 + (py - y) ** 2 < r * r) { const i = cy * FOG_W + cx; if (!FOG[i]) { FOG[i] = 1; changed = true; } } } return changed; }
function fogSeen(x, y) { const cx = Math.floor(x / FOG_C), cy = Math.floor(y / FOG_C); if (cx < 0 || cy < 0 || cx >= FOG_W || cy >= FOG_H) return false; return !!FOG[cy * FOG_W + cx]; }

/* ---------- 底圖 ---------- */
const tex = document.createElement('canvas'); tex.width = Math.round(WORLD_W * TS); tex.height = Math.round(MAP_H * TS);
function genWorld() {
  const g = tex.getContext('2d'), R = mulberry(77123), T = TS;
  g.fillStyle = '#ebe1ca'; g.fillRect(0, 0, tex.width, tex.height);
  const blob = (x, y, rad, col, a) => { const gr = g.createRadialGradient(x * T, y * T, 0, x * T, y * T, rad * T); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.beginPath(); g.arc(x * T, y * T, rad * T, 0, TAU); g.fill(); };
  for (let i = 0; i < 9900; i++) { const x = R() * MAP_W, y = R() * MAP_H; const rg = REGIONS[regionAt(x, y)]; blob(x, y, 90 + R() * 200, rg.tint.join(','), 0.34); }
  for (let i = 0; i < 4600; i++) blob(R() * MAP_W, R() * MAP_H, 30 + R() * 130, '40,34,28', 0.02 + R() * 0.04);
  // 秘境底色
  for (const rm of ROOMS) { g.fillStyle = rm.id === 'tomb_room' ? '#c4b8a4' : rm.id === 'cloud_room' ? '#e4e8ea' : rm.id === 'tower_room' ? '#5a3430' : rm.id === 'isle_room' ? '#b8c4a0' : rm.id === 'wreck_room' ? '#b4bcc0' : rm.id === 'ice_room' ? '#d6dde0' : rm.id === 'cellar_room' ? '#c8b0a8' : rm.id === 'ruin_room' ? '#dccaa0' : '#d9cdb2'; g.fillRect(rm.x * T, rm.y * T, rm.w * T, rm.h * T); for (let i = 0; i < 80; i++) blob(rm.x + R() * rm.w, rm.y + R() * rm.h, 60 + R() * 120, '60,50,40', 0.08); }
  // 寒江：結冰的江面
  { const gr = g.createLinearGradient(0, 600 * T, 0, 1050 * T); gr.addColorStop(0, 'rgba(200,215,225,0)'); gr.addColorStop(.15, 'rgba(196,214,226,.75)'); gr.addColorStop(.85, 'rgba(196,214,226,.75)'); gr.addColorStop(1, 'rgba(200,215,225,0)'); g.fillStyle = gr; g.fillRect(0, 600 * T, 3880 * T, 450 * T);
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1; for (let i = 0; i < 160; i++) { const x = R() * 3880, y = 660 + R() * 330, l = 20 + R() * 80; g.beginPath(); g.moveTo(x * T, y * T); g.lineTo((x + l) * T, (y + (R() - .5) * 10) * T); g.stroke(); }
    g.strokeStyle = 'rgba(80,110,130,.25)'; for (let i = 0; i < 40; i++) { let x = R() * 3880, y = 680 + R() * 290; g.beginPath(); g.moveTo(x * T, y * T); for (let k = 0; k < 4; k++) { x += (R() - .5) * 60; y += (R() - .5) * 40; g.lineTo(x * T, y * T); } g.stroke(); } }
  // 總壇：暗紅石地
  { g.fillStyle = 'rgba(90,30,28,.18)'; g.fillRect(5450 * T, 170 * T, 2200 * T, 1400 * T); for (let i = 0; i < 260; i++) blob(5450 + R() * 2200, 170 + R() * 1400, 30 + R() * 90, '110,28,24', 0.08); }
  // 東海：海面、沙灘、孤島
  { const gr = g.createLinearGradient(6700 * T, 0, 7100 * T, 0); gr.addColorStop(0, 'rgba(226,210,170,0)'); gr.addColorStop(1, 'rgba(226,210,170,.7)'); g.fillStyle = gr; g.fillRect(6700 * T, 5480 * T, 400 * T, 2320 * T);
    g.fillStyle = 'rgba(70,110,135,.55)'; g.fillRect(6960 * T, 5480 * T, 840 * T, 2320 * T); g.fillRect(3940 * T, 7470 * T, 3020 * T, 330 * T);
    for (let i = 0; i < 380; i++) { const onE = R() < .65, x = onE ? 6980 + R() * 800 : 3960 + R() * 2980, y = onE ? 5500 + R() * 2280 : 7490 + R() * 300; g.strokeStyle = `rgba(235,242,246,${.35 + R() * .35})`; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x * T, y * T); g.quadraticCurveTo((x + 18) * T, (y - 7) * T, (x + 36) * T, y * T); g.stroke(); }
    blob(7400, 6560, 230, '214,196,150', .95); blob(7380, 6540, 150, '150,170,110', .5); }
  // 東海往東延伸到中原、崑崙外海
  { g.fillStyle = 'rgba(70,110,135,.55)'; g.fillRect(OLD_E * T, 5400 * T, (MAP_W - OLD_E) * T, (MAP_H - 5400) * T); for (let i = 0; i < 260; i++) { const x = OLD_E + 20 + R() * (MAP_W - OLD_E - 40), y = 5420 + R() * 2360; g.strokeStyle = `rgba(235,242,246,${.35 + R() * .35})`; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x * T, y * T); g.quadraticCurveTo((x + 18) * T, (y - 7) * T, (x + 36) * T, y * T); g.stroke(); }
    const gr = g.createLinearGradient(0, 5250 * T, 0, 5420 * T); gr.addColorStop(0, 'rgba(226,210,170,0)'); gr.addColorStop(1, 'rgba(226,210,170,.75)'); g.fillStyle = gr; g.fillRect((OLD_E + 80) * T, 5250 * T, (MAP_W - OLD_E - 80) * T, 170 * T); }
  // 崑崙：雪白的山地與雲海
  { g.fillStyle = 'rgba(236,240,242,.38)'; g.fillRect((OLD_E + 80) * T, 0, (MAP_W - OLD_E - 80) * T, 2560 * T); for (let i = 0; i < 420; i++) blob(OLD_E + 80 + R() * (MAP_W - OLD_E - 80), R() * 2560, 60 + R() * 160, R() < .5 ? '250,252,253' : '200,212,222', .16 + R() * .14);
    for (let i = 0; i < 70; i++) { const x = OLD_E + 120 + R() * (MAP_W - OLD_E - 200), y = 60 + R() * 880; g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x * T, y * T); g.bezierCurveTo((x + 30) * T, (y - 20) * T, (x + 60) * T, (y + 20) * T, (x + 100) * T, y * T); g.stroke(); } }
  // 中原：黃土、城內石板
  { g.fillStyle = 'rgba(176,150,104,.16)'; g.fillRect((OLD_E + 80) * T, 2640 * T, (MAP_W - OLD_E - 80) * T, 2760 * T);
    g.fillStyle = 'rgba(160,152,138,.42)'; g.fillRect(CITY.x0 * T, CITY.y0 * T, (CITY.x1 - CITY.x0) * T, (CITY.y1 - CITY.y0) * T); g.strokeStyle = 'rgba(90,84,74,.14)'; g.lineWidth = 1;
    for (let y = CITY.y0 + 60; y < CITY.y1; y += 60) { g.beginPath(); g.moveTo(CITY.x0 * T, y * T); g.lineTo(CITY.x1 * T, y * T); g.stroke(); } for (let x = CITY.x0 + 90; x < CITY.x1; x += 90) { g.beginPath(); g.moveTo(x * T, CITY.y0 * T); g.lineTo(x * T, CITY.y1 * T); g.stroke(); } }
  // 苗疆：毒沼與蓮葉
  { g.fillStyle = 'rgba(70,90,40,.12)'; g.fillRect(0, 5480 * T, 3880 * T, 2320 * T);
    for (const t of TERRAIN) if (t.t === 'swamp') { for (let yy = t.y + 20; yy < t.y + t.h; yy += 40) for (let xx = t.x + 20; xx < t.x + t.w; xx += 40) { g.fillStyle = 'rgba(58,82,40,.5)'; g.beginPath(); g.arc((xx + (R() - .5) * 14) * T, (yy + (R() - .5) * 14) * T, (30 + R() * 10) * T, 0, TAU); g.fill(); } for (let i = 0; i < t.w * t.h / 2500; i++) { g.fillStyle = `rgba(${120 + R() * 40},${150 + R() * 40},60,${.25 + R() * .3})`; g.beginPath(); g.arc((t.x + R() * t.w) * T, (t.y + R() * t.h) * T, (3 + R() * 6) * T, 0, TAU); g.fill(); } }
    for (const t of TERRAIN) if (t.t === 'miasma') { for (let i = 0; i < 30; i++) blob(t.x + R() * t.w, t.y + R() * t.h, 40 + R() * 40, '120,150,60', .25); } }
  // 道路
  g.lineCap = 'round'; g.lineJoin = 'round';
  const road = (pts, col) => { for (const [w, a] of [[46, .13], [22, .14]]) { g.strokeStyle = `rgba(${col || '120,96,64'},${a})`; g.lineWidth = w * T; g.beginPath(); g.moveTo(pts[0][0] * T, pts[0][1] * T); for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; g.quadraticCurveTo(pts[i][0] * T, pts[i][1] * T, mx * T, my * T); } const l = pts[pts.length - 1]; g.lineTo(l[0] * T, l[1] * T); g.stroke(); } };
  const o = pts => pts.map(([x, y]) => [x, y + OY]);
  road(o([[4300, 2950], [4100, 2600], [3800, 2200], [3600, 1950]])); road(o([[3600, 1950], [3100, 1900], [2600, 1900], [2100, 1900], [1350, 1900]]));
  road(o([[3600, 1950], [3400, 1400], [3150, 1000]])); road(o([[3600, 1950], [4200, 1500], [4650, 1050]])); road(o([[1350, 1900], [1100, 1700], [650, 1650]])); road(o([[1350, 1900], [1600, 1400], [1800, 1150]]));
  road([[4900, 4760], [5280, 4600], [5850, 4650], [6450, 4200], [7250, 4950]], '150,120,70'); road([[5850, 4650], [6200, 3900], [6300, 2850], [6000, 2640]], '150,120,70');
  road([[1800, 3150], [1650, 2300], [1650, 1450], [2650, 1180]], '120,130,140'); road([[1650, 1450], [900, 900], [650, 360]], '120,130,140');
  road([[3600, 3750], [4450, 2300], [4450, 1450], [5000, 1250], [6450, 1660]], '110,50,40');
  road([[1900, 5300], [2050, 5720], [1450, 5960], [900, 6120]], '90,110,60'); road([[2050, 5720], [2200, 6400], [1900, 6800], [1700, 7120]], '90,110,60'); road([[1450, 5960], [800, 6600], [400, 7050], [330, 7450]], '90,110,60');
  road([[4300, 5300], [4700, 5720], [5350, 6020], [6620, 6120]], '150,130,100'); road([[6350, 5300], [6150, 5720], [5350, 6020]], '150,130,100');
  road([[7600, 3900], [8150, 3900], [8700, 3900], [9300, 3900], [9900, 3900], [10250, 3900]], '130,110,80'); road([[9300, 2700], [9300, 3100], [9300, 4700], [9300, 5040]], '130,110,80'); road([[7600, 2100], [8150, 2350], [8650, 2250], [9150, 2600]], '150,160,170'); road([[8150, 2350], [8550, 1300], [8580, 930], [8800, 520]], '150,160,170'); road([[8580, 1100], [9150, 1380], [9620, 1120]], '150,160,170'); road([[9150, 1380], [9150, 2560]], '150,160,170'); road([[5350, 6020], [5300, 6700], [5650, 7080]], '150,130,100'); road([[3920, 6450], [4700, 5720]], '150,130,100'); road([[6450, 1600], [6450, 600]], '110,50,40');
  // 流沙帶
  for (const t of TERRAIN) if (t.t === 'sand') { g.fillStyle = 'rgba(180,140,80,.45)'; g.fillRect(t.x * T, t.y * T, t.w * T, t.h * T); g.strokeStyle = 'rgba(110,80,40,.45)'; g.lineWidth = 1.2; for (let i = 0; i < 70; i++) { const cx = t.x + R() * t.w, cy = t.y + R() * t.h; g.beginPath(); g.arc(cx * T, cy * T, (6 + R() * 14) * T, R() * 6, R() * 6 + 4); g.stroke(); } }
  // 冰縫
  for (const t of TERRAIN) if (t.t === 'crack') { g.fillStyle = 'rgba(40,70,95,.55)'; g.fillRect(t.x * T, t.y * T, t.w * T, t.h * T); g.strokeStyle = 'rgba(235,245,250,.7)'; g.lineWidth = 1; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo((t.x + R() * t.w) * T, t.y * T); g.lineTo((t.x + R() * t.w) * T, (t.y + t.h) * T); g.stroke(); } }
  // 水
  for (const t of TERRAIN) if (t.t === 'water') { g.fillStyle = 'rgba(110,135,150,.45)'; g.fillRect(t.x * T, t.y * T, t.w * T, t.h * T); for (let i = 0; i < 40; i++) { g.strokeStyle = 'rgba(230,240,245,.5)'; g.lineWidth = 1; const yy = t.y + R() * t.h, xx = t.x + R() * t.w; g.beginPath(); g.moveTo(xx * T, yy * T); g.quadraticCurveTo((xx + 15) * T, (yy - 5) * T, (xx + 30) * T, yy * T); g.stroke(); } }
  // 山
  const mountain = (x, y, w, h, a, snow) => { const gr = g.createLinearGradient(0, (y - h) * T, 0, y * T); gr.addColorStop(0, `rgba(30,27,24,${a})`); gr.addColorStop(.55, `rgba(30,27,24,${a * .45})`); gr.addColorStop(1, 'rgba(30,27,24,0.05)'); g.fillStyle = gr; g.beginPath(); g.moveTo((x - w / 2) * T, y * T); const peaks = 2 + Math.floor(R() * 3); const tops = []; for (let i = 1; i <= peaks; i++) { const px = x - w / 2 + w * i / (peaks + 1) + (R() - .5) * w * .12; const ph = h * (.55 + R() * .45); g.lineTo((px - w * .08) * T, (y - ph * .7) * T); g.lineTo(px * T, (y - ph) * T); g.lineTo((px + w * .07) * T, (y - ph * .75) * T); tops.push([px, ph]); } g.lineTo((x + w / 2) * T, y * T); g.closePath(); g.fill(); g.strokeStyle = `rgba(30,27,24,${a * .9})`; g.lineWidth = 1.6; g.stroke();
    if (snow) { g.fillStyle = 'rgba(245,248,250,.85)'; for (const [px, ph] of tops) { g.beginPath(); g.moveTo((px - w * .05) * T, (y - ph * .8) * T); g.lineTo(px * T, (y - ph) * T); g.lineTo((px + w * .045) * T, (y - ph * .82) * T); g.closePath(); g.fill(); } } };
  for (const t of TERRAIN) if (t.t === 'mount') { const step = 110; for (let yy = t.y + 60; yy <= t.y + t.h + 40; yy += step * 0.7) for (let xx = t.x; xx <= t.x + t.w + 20; xx += step) mountain(xx + (R() - .5) * 30, yy, 160 + R() * 100, 140 + R() * 120, .35 + R() * .25, yy < 1900 || xx > OLD_E - 40 && yy < 2700); }
  for (let i = 0; i < 280; i++) { const side = Math.floor(R() * 4), tt = R() * (side < 2 ? MAP_W : MAP_H), d = R() * 120; let x, y; if (side === 0) { x = tt; y = d + 100; } else if (side === 1) { x = tt; y = MAP_H - d; } else if (side === 2) { x = d; y = tt; } else { x = MAP_W - d; y = tt; } if (!(y > SOUTH_Y && (x > 6900 || (y > 7400 && x > 3900)))) mountain(x, y, 220 + R() * 300, 140 + R() * 200, .3 + R() * .25, y < 1800 || x > OLD_E && y < 2600); }
  // 總壇圍牆
  for (const t of TERRAIN) if (t.t === 'wall' && t.city) { g.fillStyle = 'rgba(96,90,82,.92)'; g.fillRect(t.x * T, t.y * T, t.w * T, t.h * T); g.strokeStyle = 'rgba(40,36,32,.7)'; g.lineWidth = 1.5; g.strokeRect(t.x * T, t.y * T, t.w * T, t.h * T); g.fillStyle = 'rgba(60,56,50,.85)'; const n = Math.max(t.w, t.h) / 50; for (let i = 0; i < n; i++) { if (t.w > t.h) g.fillRect((t.x + i * 50) * T, (t.y - 12) * T, 26 * T, 12 * T); else g.fillRect((t.x - 12) * T, (t.y + i * 50) * T, 12 * T, 26 * T); } }
  for (const t of TERRAIN) if (t.t === 'wall' && !t.city) { g.fillStyle = 'rgba(52,22,20,.85)'; g.fillRect(t.x * T, t.y * T, t.w * T, t.h * T); g.strokeStyle = 'rgba(179,38,30,.6)'; g.lineWidth = 1.5; g.strokeRect(t.x * T, t.y * T, t.w * T, t.h * T); g.fillStyle = 'rgba(20,10,10,.6)'; const n = Math.max(t.w, t.h) / 60; for (let i = 0; i < n; i++) { if (t.w > t.h) g.fillRect((t.x + i * 60) * T, (t.y - 12) * T, 30 * T, 12 * T); else g.fillRect((t.x - 12) * T, (t.y + i * 60) * T, 12 * T, 30 * T); } }
  // 斷崖
  for (const t of TERRAIN) if (t.t === 'cliff') { g.fillStyle = 'rgba(20,18,16,.75)'; g.fillRect(t.x * T, t.y * T, t.w * T, t.h * T); g.strokeStyle = 'rgba(235,225,202,.5)'; g.lineWidth = 1; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo((t.x + R() * t.w) * T, t.y * T); g.lineTo((t.x + R() * t.w) * T, (t.y + t.h) * T); g.stroke(); } }
  // 裝飾點染
  for (let i = 0; i < 5300; i++) { const x = R() * MAP_W, y = R() * MAP_H; const id = regionAt(x, y);
    if (TERRAIN.some(t => x > t.x && x < t.x + t.w && y > t.y && y < t.y + t.h)) continue;
    if (id === 'bamboo') { if (R() < .5) { g.fillStyle = `rgba(63,90,58,${.05 + R() * .06})`; g.beginPath(); g.ellipse(x * T, y * T, (20 + R() * 40) * T, (8 + R() * 14) * T, 0, 0, TAU); g.fill(); } }
    else if (id === 'sand') { g.strokeStyle = `rgba(150,110,60,${.08 + R() * .08})`; g.lineWidth = 1.2; g.beginPath(); const w = 40 + R() * 120; g.moveTo((x - w) * T, y * T); g.quadraticCurveTo(x * T, (y - 12 - R() * 14) * T, (x + w) * T, y * T); g.stroke(); }
    else if (id === 'snow') { g.fillStyle = `rgba(255,255,255,${.25 + R() * .3})`; g.beginPath(); g.ellipse(x * T, y * T, (30 + R() * 60) * T, (10 + R() * 18) * T, 0, 0, TAU); g.fill(); }
    else if (id === 'miao') { if (R() < .5) { g.fillStyle = `rgba(70,100,40,${.05 + R() * .07})`; g.beginPath(); g.ellipse(x * T, y * T, (20 + R() * 50) * T, (8 + R() * 16) * T, 0, 0, TAU); g.fill(); } }
    else if (id === 'sea') { if (x < 6900 && y < 7450) { g.fillStyle = `rgba(200,180,130,${.06 + R() * .08})`; g.beginPath(); g.ellipse(x * T, y * T, (30 + R() * 60) * T, (10 + R() * 18) * T, 0, 0, TAU); g.fill(); } }
    else if (id === 'kunlun') { g.fillStyle = `rgba(255,255,255,${.22 + R() * .3})`; g.beginPath(); g.ellipse(x * T, y * T, (30 + R() * 70) * T, (10 + R() * 20) * T, 0, 0, TAU); g.fill(); }
    else if (id === 'zhong') { if (!inCity(x, y, 0) && R() < .5) { g.fillStyle = `rgba(150,120,70,${.05 + R() * .07})`; g.beginPath(); g.ellipse(x * T, y * T, (20 + R() * 50) * T, (8 + R() * 16) * T, 0, 0, TAU); g.fill(); } }
    else if (id === 'cult') { if (R() < .4) { g.fillStyle = `rgba(110,28,24,${.04 + R() * .06})`; g.beginPath(); g.ellipse(x * T, y * T, (20 + R() * 40) * T, (8 + R() * 14) * T, 0, 0, TAU); g.fill(); } }
    else if (R() < .3) { g.fillStyle = `rgba(90,110,60,${.04 + R() * .05})`; g.beginPath(); g.ellipse(x * T, y * T, (20 + R() * 50) * T, (8 + R() * 16) * T, 0, 0, TAU); g.fill(); } }
  // 蓮葉之路
  for (const [x, y] of []) { g.fillStyle = 'rgba(88,130,70,.9)'; g.beginPath(); g.ellipse(x * T, y * T, 34 * T, 22 * T, R(), 0, TAU); g.fill(); g.strokeStyle = 'rgba(40,60,30,.8)'; g.lineWidth = 1; g.stroke(); g.fillStyle = 'rgba(230,170,190,.8)'; g.beginPath(); g.arc((x + 8) * T, (y - 4) * T, 5 * T, 0, TAU); g.fill(); }
  // 紙纖維
  for (let i = 0; i < 15000; i++) { const x = R() * tex.width, y = R() * tex.height, a = R() * TAU, l = 2 + R() * 7; g.strokeStyle = `rgba(80,68,52,${.04 + R() * .05})`; g.lineWidth = .6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
}

/* ---------- 山壁遮擋視線 ---------- */
let _BLK = null; const BLK = () => _BLK || (_BLK = TERRAIN.filter(t => t.t === 'mount' || t.t === 'wall'));
function segHitsRect(x1, y1, x2, y2, t) {
  let t0 = 0, t1 = 1; const dx = x2 - x1, dy = y2 - y1;
  const p = [-dx, dx, -dy, dy], q = [x1 - t.x, t.x + t.w - x1, y1 - t.y, t.y + t.h - y1];
  for (let i = 0; i < 4; i++) { if (p[i] === 0) { if (q[i] < 0) return false; } else { const r = q[i] / p[i]; if (p[i] < 0) { if (r > t1) return false; if (r > t0) t0 = r; } else { if (r < t0) return false; if (r < t1) t1 = r; } } }
  return true;
}
function los(ax, ay, bx, by) {
  const mnx = Math.min(ax, bx), mxx = Math.max(ax, bx), mny = Math.min(ay, by), mxy = Math.max(ay, by);
  for (const t of BLK()) { if (t.x > mxx || t.x + t.w < mnx || t.y > mxy || t.y + t.h < mny) continue; if (segHitsRect(ax, ay, bx, by, t)) return false; }
  return true;
}
const losP = o => los(P.x, P.y, o.x, o.y);
function inBlocker(x, y) { for (const t of BLK()) if (x > t.x && x < t.x + t.w && y > t.y && y < t.y + t.h) return true; return false; }
