'use strict';
/* 一命江湖 2a — 第二章前半：苗疆毒沼、東海漁村與海島（資料）
   本檔接在 data.js、story.js 之後載入，只往既有的表裡加東西。 */

/* ---------- 資源 ---------- */
Object.assign(RES, { guwangke: { n: '蠱王殼', s: '蠱殼' }, shachi: { n: '鯊齒', s: '鯊齒' }, guwang: { n: '蠱王', s: '蠱王' }, lingzhi: { n: '海靈芝', s: '靈芝' } });
RARE_ORES.push('guwangke', 'shachi'); SPECIALTY.push('guwang', 'lingzhi');
Object.assign(PILLS, { bidu: { n: '避毒丹', need: { herb: 12, guwang: 1 }, lv: 2, d: '10 分鐘不受毒霧侵蝕' } });

/* ---------- 區域 ---------- */
Object.assign(REGIONS, {
  miao: { n: '苗疆毒沼', short: '苗疆', realm: '一流', tint: [150, 168, 112], weather: ['毒霧', '晴', '毒霧'] },
  sea: { n: '東海漁村與海島', short: '東海', realm: '一流', tint: [212, 198, 158], weather: ['晴', '海霧', '晴', '海霧'] },
});
REGION_ORDER.push('miao', 'sea');
Object.assign(SETS, {
  wudu: { n: '五毒套', region: 'miao', b2: '毒抗 +30%', b4: '中毒傷害 +25%', b6: '毒霧中不掉血且傷害 +20%' },
  yubang: { n: '漁幫套', region: 'sea', b2: '水上移速 +30%', b4: '連擊加成上限 +20%', b6: '漲潮（夜晚的東海）時全屬性 +10%' },
});
Object.assign(REGION_SET, { miao: 'wudu', sea: 'yubang' });
Object.assign(UNIQUE_GEAR, {
  wudu_sachet: { n: '五毒香囊', slot: 'acc', pres: 0.25, attr: '毒', attrDmg: 0.1, d: '毒抗 +25%、毒屬性傷害 +10%' },
  silver_snake: { n: '銀蛇手鐲', slot: 'acc', crit: 0.05, pres: 0.15, d: '暴擊 +5%、毒抗 +15%' },
  helm_rope: { n: '舵手結繩', slot: 'belt', hp: 80, pot: 0.15, d: '氣血 +80、藥效 +15%' },
  coral_crown: { n: '珊瑚頭飾', slot: 'hat', mp: 45, dcd: 0.08, d: '內力 +45、閃身冷卻 −8%' },
  gumu_staff: { n: '蠱母銀飾', slot: 'acc', crit: 0.06, attr: '毒', attrDmg: 0.24, pres: 0.2, d: '暴擊 +6%、毒屬性傷害 +24%、毒抗 +20%' },
  shark_fang: { n: '鯊齒項鍊', slot: 'acc', crit: 0.08, attr: '剛', attrDmg: 0.2, d: '暴擊 +8%、剛屬性傷害 +20%' },
  baishe_scale: { n: '白蛇鱗', slot: 'acc', pres: 0.3, hp: 40, d: '毒抗 +30%、氣血 +40' },
});

/* ---------- 秘笈 ---------- */
Object.assign(BOOKS.jincan, { src: '苗疆・巫醫竹樓，銀兩 600', ch: 2, chain: true });
Object.assign(BOOKS.wudu_heart, { src: '苗疆・巫醫竹樓（善惡值 ≤ −30，或五毒寨崇敬）', ch: 2 });
Object.assign(BOOKS.langlijiao, { src: '東海・老船夫，銀兩 600', ch: 2 });
Object.assign(BOOKS.fenlang, { src: '東海・老船夫（擊退來襲的海盜船）', ch: 2 });
['leitai_fist', 'haoran_sword', 'taiqing', 'hanyun'].forEach(k => Object.assign(BOOKS[k], { ch: 2 }));
Object.assign(BOOKS, {
  baizu: { n: '百足噬心', cat: 'weapon', w: 'fist', tier: 2, attrs: ['毒', '毒'], pat: 'claw', mp: 24, cd: 5, mult: 1.5, src: '世外高人・毒仙藍姑（毒霧中撐過 60 秒，不能吃藥）', ch: 2, master: true },
  guanchao: { n: '觀潮劍', cat: 'weapon', w: 'sword', tier: 2, attrs: ['柔', '柔'], pat: 'orbit', mp: 30, cd: 9, mult: 0.9, src: '世外高人・東海釣叟（只靠閃身躲過 20 道浪潮）', ch: 2, master: true },
});

/* ---------- 怪物（一流） ---------- */
Object.assign(ENEMIES, {
  gu: { n: '蠱蟲', hp: 60, dmg: 14, spd: 165, r: 10, ai: 'melee', xiu: 6, silver: [0, 2], drops: { herb: 0.15 }, look: 'bug', robe: '#4a5a2a', res: { 毒: 0.5 }, poison: true, region: 'miao' },
  miao_warrior: { n: '苗寨戰士', hp: 240, dmg: 28, spd: 100, r: 17, ai: 'melee', sweep: true, xiu: 24, silver: [10, 20], drops: { cloth: 0.35, fur: 0.2 }, look: 'man', robe: '#2a3a4a', acc: '#d9d6cf', weapon: 'spear', res: { 毒: 0.5 }, region: 'miao' },
  blowdart: { n: '吹箭巫', hp: 170, dmg: 22, spd: 85, r: 15, ai: 'ranged', xiu: 22, silver: [10, 20], drops: { cloth: 0.3, herb: 0.3 }, look: 'man', robe: '#3a2a4a', acc: '#a0c070', weapon: 'none', shot: 'poison', res: { 毒: 0.5 }, region: 'miao' },
  gujar: { n: '蠱罐', hp: 220, dmg: 6, spd: 0, r: 20, ai: 'summon', summon: 'gu', xiu: 22, silver: [6, 14], drops: { herb: 0.5, guwang: 0.05 }, look: 'jar', res: { 毒: 0.5 }, region: 'miao' },
  toad: { n: '毒蟾', hp: 130, dmg: 40, spd: 150, r: 15, ai: 'bomb', xiu: 18, silver: [4, 10], drops: { bone: 0.3 }, look: 'toad', robe: '#5a7a3a', poisonBomb: true, res: { 毒: 0.5 }, region: 'miao' },
  pirate: { n: '海盜', hp: 230, dmg: 27, spd: 130, r: 16, ai: 'melee', combo: true, xiu: 24, silver: [14, 26], drops: { cloth: 0.4 }, look: 'man', robe: '#3a3a4a', acc: CIN, weapon: 'blade', res: { 柔: 0.3 }, region: 'sea' },
  pirate_xbow: { n: '海盜弩手', hp: 180, dmg: 23, spd: 90, r: 15, ai: 'ranged', xiu: 22, silver: [12, 24], drops: { cloth: 0.35, iron: 0.3 }, look: 'man', robe: '#4a3a2a', acc: '#2a2a3a', weapon: 'bow', volley: 2, res: { 柔: 0.3 }, region: 'sea' },
  crab: { n: '礁岩蟹', hp: 300, dmg: 25, spd: 80, r: 19, ai: 'melee', xiu: 24, silver: [4, 10], drops: { bone: 0.5, shachi: 0.03 }, look: 'crab', robe: '#8a4a3a', shell: true, region: 'sea' },
  water_ghost: { n: '水鬼', hp: 190, dmg: 30, spd: 175, r: 15, ai: 'dash', xiu: 22, silver: [6, 14], drops: { cloth: 0.3, lingzhi: 0.05 }, look: 'man', robe: '#2a4a4a', acc: '#6a8a8a', weapon: 'fist', ambush: true, region: 'sea' },
});
Object.assign(NAMED, {
  wudu_tongzi: { n: '五毒童子', base: 'miao_warrior', hp: 3000, dmg: 38, r: 22, drop: 'wudu_sachet', special: 'toadride', story: '個子矮小的毒師，騎著一隻大蟾蜍，全身是毒，笑起來像搖鈴。', look: { robe: '#4a2a4a', acc: '#a0c070', hat: 'none', weapon: 'none' } },
  aluo: { n: '蛇女 阿蘿', base: 'blowdart', hp: 2600, dmg: 34, r: 19, drop: 'silver_snake', special: 'snakes', persuade: true, story: '召蛇作戰的苗女，其實只是想護住寨子。打到一半，可以勸她收手。', look: { robe: '#2a4a3a', acc: '#d9d6cf', hat: 'none', weapon: 'none', gender: 'f' } },
  laojing: { n: '獨臂舵手 老鯨', base: 'pirate', hp: 3400, dmg: 42, r: 24, drop: 'helm_rope', special: 'anchor', story: '拖著船錨當兵器的老舵手，一隻手臂留在了二十年前的風暴裡。', look: { robe: '#3a3a3a', acc: '#8a6a3a', hat: 'none', weapon: 'none', beard: true } },
  coral: { n: '珊瑚夜叉', base: 'water_ghost', hp: 2800, dmg: 36, r: 19, drop: 'coral_crown', special: 'glide', story: '在水面上滑行的女海盜，頭上戴著一圈紅珊瑚。', look: { robe: '#7a3a3a', acc: '#e08a7a', hat: 'none', weapon: 'blade', gender: 'f' } },
});
Object.assign(BOSS, {
  gumu: { n: '苗疆蠱師 蠱母婆婆', short: '蠱母婆婆', hp: 22000, dmg: 50, spd: 115, r: 26, robe: '#3a2a3a', acc: '#d9d6cf', hat: 'none', weapon: 'none', region: 'miao', res: { 毒: 0.5 }, ult: '萬蠱噬心' },
  haitianba: { n: '海盜首領 鯊王 海天霸', short: '海天霸', hp: 24000, dmg: 54, spd: 145, r: 30, robe: '#2a3a4a', acc: CIN, hat: 'none', weapon: 'blade', region: 'sea', res: { 柔: 0.3 }, ult: '怒海狂鯊' },
});
WISDOM.push('苗疆的毒霧會一點一點啃你的氣血，避毒香、避毒丹、五毒套都擋得住。', '海霧裡看不遠，海盜就從霧裡摸上來。', '礁岩蟹的殼很硬，繞到側面打。',
  '浪裡蛟能踏過江海；毒沼要輕功練到第五重才過得去。', '線索會一點一點指向某個人──你的選擇，決定那個人是誰。', '知己不是一天交成的；送禮、同行、說真心話。', '救人有時限，晚了就來不及了。');

/* ---------- 人物 ---------- */
Object.assign(NPCS, {
  wuyi: { n: '巫醫 白婆', look: { robe: '#4a3a5a', acc: '#a0c070', hair: '#d9d6cf', hat: 'none', gender: 'f' } },
  zhaizhu: { n: '五毒寨主 岩崗', look: { robe: '#2a3a4a', acc: '#d9d6cf', hair: INK, hat: 'none', beard: true } },
  langu: { n: '毒仙 藍姑', look: { robe: '#2a3a5a', acc: '#d9d6cf', hair: INK, hat: 'none', gender: 'f' } },
  yubang: { n: '漁幫幫主 浪裡白', look: { robe: '#4a5a6a', acc: '#d9ecf7', hair: INK, hat: 'douli' } },
  laochuanfu: { n: '老船夫 陳伯', look: { robe: '#5a5a4a', acc: '#3a2a20', hair: '#d9d6cf', hat: 'douli', beard: true } },
  diaosou: { n: '東海釣叟', look: { robe: '#7a6a4a', acc: '#3a2a20', hair: '#d9d6cf', hat: 'none', beard: true } },
  suxin: { n: '青崖師姐 沈素心', look: { robe: '#3f6b5a', acc: '#d9d6cf', hair: INK, hat: 'none', gender: 'f' } },
  changfeng: { n: '青崖師兄 顧長風', look: { robe: '#4a6a7a', acc: '#d9d6cf', hair: INK, hat: 'none' } },
  gumu: { n: '蠱母婆婆', look: { robe: '#3a2a3a', acc: '#d9d6cf', hair: '#d9d6cf', hat: 'none', gender: 'f' } },
  haitianba: { n: '鯊王 海天霸', look: { robe: '#2a3a4a', acc: CIN, hair: INK, hat: 'none', beard: true } },
  hunter: { n: '黑衣追兵', look: { robe: '#1d1a17', acc: '#6a6a6a', hair: INK, hat: 'veil' } },
  ahai: { n: '阿海', look: { robe: '#5a6a7a', acc: '#d9ecf7', hair: INK, hat: 'none' } },
});
const CH2_PEOPLE = ['wuyi', 'zhaizhu', 'langu', 'yubang', 'laochuanfu', 'diaosou', 'suxin', 'changfeng', 'gumu', 'haitianba'];

/* ---------- 三年後（第一章結尾後的水墨分鏡） ---------- */
const CH2_INTRO = [
  { t: '三年', big: true },
  { t: '血影教主伏誅之後，江湖安靜了三年。' },
  { t: '你守著青崖小築，看弟子們從孩子長成了少年。師父的茶，換過一季又一季。' },
  { t: '可是那三封信，你一封也沒有燒。' },
  { t: '這三年，江湖高手接連失蹤。西南苗疆的毒霧一年比一年濃，東海的海盜，旗號換了又換。' },
  { t: '「中原之事，照舊辦理。」\n「薪柴不足，再送。」\n「莫要傷他。」' },
  { t: '第二章　江湖真相', big: true },
];
const CH2_START = [
  { who: 'master', t: '……三年了。你那把劍，磨得比為師的茶還勤。' },
  { who: 'master', t: '南邊的山口開了。苗疆有人在養蠱抓人，東海的海盜也越來越不像海盜。' },
  { who: 'me', t: { xia: '師父，弟子想去查清楚那三封信。', mo: '那三封信的主人，我一個一個去找。', zhong: '三年沒出門，劍都快生根了。' } },
  { who: 'master', t: '……去吧。只是記著──江湖上的事，眼見未必為真。茶，為師替你溫著。' },
];

/* ---------- 主線：苗疆毒沼 ---------- */
NODES.push(
  { id: 'm1', region: 'miao', t: '入苗疆', steps: [{ type: 'reach', place: 'station_miao', d: '往西南出山口，找到苗疆驛站' }, { type: 'talk', npc: 'wuyi', d: '去巫醫竹樓討一支避毒香' }],
    lines: [{ who: 'narr', t: '山口外是另一個世界。樹長得比房子還高，地上的水泛著油綠的光，連風都帶著甜腥味。' }],
    done: [{ who: 'wuyi', t: '外地人？毒霧裡走了一路還站得住，算你命硬。拿著，這支避毒香點著，毒霧啃你會慢一半。' }, { who: 'wuyi', t: '這三年苗疆不太平。寨子裡的年輕人一個個被蠱蟲咬了，說是西南那個「蠱母」在煉什麼大東西。' },
      { who: 'me', t: { xia: '多謝婆婆。苗疆的事，我會查清楚。', mo: '蠱母？名字倒是挺嚇人。', zhong: '慢一半……那就是還會被啃。' } }],
    reward: { bidu: true } },
  { id: 'm2', region: 'miao', t: '五毒寨', steps: [{ type: 'talk', npc: 'zhaizhu', d: '去西邊的五毒寨拜見寨主' }, { type: 'learn', books: ['jincan', 'wudu_heart'], place: 'wuyi', d: '回巫醫竹樓學《金蠶蠱針》（銀兩 600）或《五毒心法》' }],
    lines: [{ who: 'zhaizhu', t: '漢人。上一個進寨的漢人，自稱是正派的大俠，結果是來偷蠱的。' }, { who: 'zhaizhu', t: '……不過你身上沒有那股銅臭味。白婆說你命硬，我信她。五毒寨的功夫，她那裡學得到。' },
      { who: 'me', t: { xia: '晚輩不是來偷東西的，是來幫忙的。', mo: '寨主放心，我對偷東西沒興趣，我對搶比較有興趣。', zhong: '銅臭味？我身上只有毒霧味。' } }],
    reward: { rep: { wudu: 15 } } },
  { id: 'm3', region: 'miao', t: '失蹤的高手', steps: [{ type: 'clear', camp: 'gu_nest', d: '清除東邊的蠱蟲窩' }, { type: 'reach', place: 'lost_camp', d: '沿著蠱蟲來的方向，找到荒廢的營地' }],
    done: [{ who: 'narr', t: '營地裡的帳篷都倒了，鍋裡的飯早已發霉。地上散著幾把兵器：一把峨眉刺、一柄少林戒刀，還有一枚刻著「崆峒」的令牌。' }, { who: 'narr', t: '每一具屍體都不見了，只有地上一圈圈乾掉的黑色印子，像被什麼東西吸乾了。' },
      { who: 'me', t: { xia: '都是名門高手……他們不是被殺，是被帶走了。', mo: '吸乾了。跟血池一樣。', zhong: '各派的人都在這裡露營？苗疆的風景有這麼好嗎。' } }] },
  { id: 'm4', region: 'miao', t: '★蠱蟲的來源', steps: [{ type: 'choice', id: 'gu_source', place: 'lost_camp', d: '在營地決定怎麼追查蠱蟲的來源',
      lines: [{ who: 'narr', t: '營地邊的樹上，釘著一張告示：「正派聯盟懸賞──苗疆蠱禍，有能者代為查辦，賞銀千兩。武林盟主 林嘯天」' }, { who: 'narr', t: '另一邊，蠱蟲爬過的痕跡往西北方延伸，一路通向崑崙的方向。' }],
      opts: [{ label: '親自追查到底（仙人線 +1）', clue: 'xian', after: [{ who: 'narr', t: '你順著蠱痕走了半日，痕跡在一塊石頭前消失了。石頭上留著一撮白色的鶴羽，聞起來有淡淡的松香。' }, { who: 'me', t: { xia: '松香……總壇密室那封「薪柴不足」的信，也是這個味道。', mo: '松香。又是松香。', zhong: '一根鶴毛，還挺香的。' } }] },
        { label: '接正派聯盟的懸賞代辦（盟主線 +1）', clue: 'meng', reward: { silver: 600 }, after: [{ who: 'narr', t: '你揭下告示，送到驛站。三天後，正派聯盟的使者送來銀票，信封上蓋著一枚金印。' }, { who: 'narr', t: '那枚金印……和總壇密室裡「中原之事，照舊辦理」的金印，一模一樣。' }] }] },
    { type: 'clear', camp: 'tribe_camp', d: '順路掃平西南的毒沼部落' }] },
  { id: 'm5', region: 'miao', t: '隱谷毒仙', steps: [{ type: 'reach', place: 'langu', d: '往西南的隱谷，找傳說中的毒仙' }, { type: 'trial', id: 'langu', place: 'langu', d: '接受藍姑的考驗：在毒霧中撐過 60 秒，不能吃藥' }],
    lines: [{ who: 'narr', t: '隱谷的入口被瘴氣和山壁夾著，一個赤腳的苗女坐在谷口的石頭上，腰間竹簍裡有什麼東西在動。' }, { who: 'langu', t: '怕毒就別進谷。……你要學毒？還是要找人？' },
      { who: 'me', t: { xia: '我在找失蹤的高手。', mo: '都要。', zhong: '我只是迷路了。' } }, { who: 'langu', t: '哼。在我的毒霧裡站滿一炷香不倒、不吃藥，我就告訴你我知道的事。毒，要用身體去記。' }],
    done: [{ who: 'langu', t: '……還站著？好。我叫藍姑。這三年，我也在找那些失蹤的人──我師父就是其中一個。' }, { who: 'langu', t: '這套《百足噬心》，是我師父的功夫。你替我記著它。' }],
    reward: { book: 'baizu', bond: 'langu' } },
  { id: 'm6', region: 'miao', t: '蠱母祭壇', steps: [{ type: 'clear', camp: 'altar', d: '破壞祭壇外圍的蠱陣' }],
    done: [{ who: 'narr', t: '蠱陣碎裂，地底傳來一聲尖嘯。祭壇中央的石盆裡，泡著一隻拳頭大的金色蠱蟲，身上插滿了細細的銀針──每根針上，都纏著一縷別人的內力。' }, { who: 'narr', t: '祭壇後方傳來老嫗的笑聲：「乖孩子，別碰婆婆的寶貝。等煉成了，有人要拿它去換長生的。」' }] },
  { id: 'm7', region: 'miao', t: '◎昔日的對手', steps: [{ type: 'rescue', id: 'rival', place: 'rival_spot', d: '北邊林間傳來求救的暗號' }] },
  { id: 'm8', region: 'miao', t: '★血書', steps: [{ type: 'choice', id: 'blood_letter', place: 'wuyi', d: '把祭壇裡找到的血書拿給巫醫看',
      lines: [{ who: 'wuyi', t: '這是從祭壇搜出來的？一塊人皮上用血寫的字，是失蹤高手臨死前留的。可惜是用暗語寫的，老婆子看不懂。' }, { who: 'wuyi', t: '寨裡來過幾個正派的長老，說能鑑定這種東西。你自己琢磨也行──只是暗語這種事，越琢磨越頭痛。' }],
      opts: [{ label: '自己破解血書（師父線 +1）', clue: 'shi', after: [{ who: 'narr', t: '你對著血書看了一夜。天亮時，你認出了那套暗語──是青崖派的「茶經密語」，師父小時候教你玩過的。' }, { who: 'narr', t: '血書只有八個字：「青崖舊人，煉蠱求生。」' }] },
        { label: '交給正派長老鑑定（盟主線 +1）', clue: 'meng', after: [{ who: 'narr', t: '長老們捧著血書看了半天，說要帶回中原請盟主定奪。' }, { who: 'narr', t: '臨走時，一個年輕的弟子偷偷塞給你一張紙條：「長老看完血書，臉都白了。他們說，這件事不能讓外人知道。」' }] }] }] },
  { id: 'm9', region: 'miao', t: '毒水漲潮', steps: [{ type: 'waves', id: 'flood', place: 'altar', enemies: ['gu', 'toad', 'miao_warrior', 'gujar'], d: '毒沼漲潮了！在祭壇外撐過三波蠱潮' }],
    lines: [{ who: 'narr', t: '天邊滾來一片綠霧，毒沼的水一寸一寸往上漲。蓮葉浮了起來，蠱蟲從水裡成群爬上岸。' }, { who: 'langu', t: '是蠱母在催潮！站在高處，別讓蠱潮淹過去！' }],
    done: [{ who: 'narr', t: '潮水退去，祭壇的石階露了出來。最上層，一個佝僂的老嫗拄著蛇杖，滿身的銀飾叮噹作響。' }] },
  { id: 'm10', region: 'miao', t: '蠱母婆婆', steps: [{ type: 'boss', id: 'gumu', d: '登上蠱母祭壇，與蠱母婆婆一決' }] },
);

/* ---------- 主線：東海漁村與海島 ---------- */
NODES.push(
  { id: 'e1', region: 'sea', t: '漁村', steps: [{ type: 'reach', place: 'station_sea', d: '往東南出山口，找到東海驛站' }, { type: 'talk', npc: 'yubang', d: '去漁村拜會漁幫幫主' }],
    lines: [{ who: 'narr', t: '鹹濕的海風撲面而來。沙灘上曬著漁網，漁村的屋頂壓著石頭，遠處的海面上，一片灰白的霧正慢慢往岸邊推。' }],
    done: [{ who: 'yubang', t: '青崖派？好幾年沒聽過這個名號了。……我是浪裡白，這片漁村歸漁幫管。' }, { who: 'yubang', t: '這三年海盜越鬧越兇，領頭的叫海天霸，人稱鯊王。他以前是我們漁幫的人。輸了一場賭，就拿刀上了海盜船。' },
      { who: 'me', t: { xia: '幫主放心，海盜的事我管了。', mo: '一場賭就能讓人換條命走……有意思。', zhong: '輸了一場賭就當海盜？那賭場老闆罪過大了。' } }],
    reward: { rep: { fishers: 15 } } },
  { id: 'e2', region: 'sea', t: '海盜船寨', steps: [{ type: 'clear', camp: 'pirate_post', d: '清除北邊的海盜前哨' }],
    done: [{ who: 'narr', t: '前哨的木箱裡裝的不是搶來的財寶，是一捆捆的鐵鏈和枷鎖，鎖頭上刻著號碼。' }, { who: 'me', t: { xia: '鐵鏈？他們運的是人。', mo: '海盜改行做人口生意了。', zhong: '這些鎖頭編了號……跟寄行李一樣。' } }] },
  { id: 'e3', region: 'sea', t: '老船夫', steps: [{ type: 'talk', npc: 'laochuanfu', d: '去東邊碼頭找老船夫' }, { type: 'learn', books: ['langlijiao'], place: 'laochuanfu', d: '跟老船夫學《浪裡蛟》（銀兩 600）' }, { type: 'waves', id: 'pirate_raid', place: 'laochuanfu', enemies: ['pirate', 'pirate_xbow', 'water_ghost'], d: '海盜船來襲！守住碼頭三波' }],
    lines: [{ who: 'laochuanfu', t: '年輕人，想出海？海上沒路，只有浪。浪裡蛟這門功夫，學會了才踏得上水。' }, { who: 'laochuanfu', t: '……你看那邊。又來了。海盜船，三天兩頭往這碼頭靠。' }],
    done: [{ who: 'laochuanfu', t: '好身手！這套《分浪刀》是我年輕時在船上學的，刀氣能劈開浪頭。老頭子拿著也沒用了，給你。' }],
    reward: { book: 'fenlang', rep: { fishers: 15 } } },
  { id: 'e4', region: 'sea', t: '★走私船', steps: [{ type: 'choice', id: 'smuggle', place: 'smuggle_ship', d: '查看南邊沙灘上擱淺的走私船',
      lines: [{ who: 'narr', t: '走私船擱淺在沙灘上，船艙裡還綁著三個海盜，嚇得直發抖。艙底堆滿了空的鐵籠，籠底沾著乾掉的血。' }, { who: 'narr', t: '船桅上掛著一面海盜旗。風一吹，旗子翻過來──反面縫著一個「林」字。' }],
      opts: [{ label: '把船和人上報漁幫，追查旗號（盟主線 +1）', clue: 'meng', rep: { fishers: 10 }, after: [{ who: 'yubang', t: '林字旗……這是中原正派聯盟的旗號！正派的人跟海盜做買賣？' }, { who: 'narr', t: '浪裡白把旗子收進木匣，臉色鐵青。' }] },
        { label: '放走船員，換他們說出貨送哪裡（仙人線 +1）', clue: 'xian', karma: -5, after: [{ who: 'narr', t: '海盜們跪著磕頭：「這些籠子裝的人，都送上崑崙！山上有人收，一個人換一百兩！」' }, { who: 'narr', t: '「誰收？」「沒見過臉……每次都是一隻白鶴飛下來，叼走賣身契……」' }] }] }] },
  { id: 'e5', region: 'sea', t: '東海釣叟', steps: [{ type: 'reach', place: 'diaosou', d: '踏浪出海，登上東邊的孤島（需浪裡蛟）' }, { type: 'trial', id: 'diaosou', place: 'diaosou', d: '接受東海釣叟的考驗：只靠閃身躲過 20 道浪潮' }],
    lines: [{ who: 'narr', t: '孤島上只有一塊礁石，一個赤膊的老漁夫拄著魚叉站在上面，任浪頭打在腳邊。' }, { who: 'diaosou', t: '浪是追不上的，只能跟。……你想學我的劍？那就先學會跟著浪走。' }],
    done: [{ who: 'diaosou', t: '哈哈哈！二十道浪，一道沒沾身。你這雙腳，比我年輕時還滑溜。' }, { who: 'diaosou', t: '《觀潮劍》拿去吧。記住，劍要像潮水──退的時候，是為了再湧上來。' }],
    reward: { book: 'guanchao' } },
  { id: 'e6', region: 'sea', t: '◎飛鴿傳書', steps: [{ type: 'rescue', id: 'village', place: 'chief', d: '一隻信鴿落在你肩上' }] },
  { id: 'e7', region: 'sea', t: '重逢', steps: [{ type: 'reach', place: 'sibling', d: '漁民說南邊海邊石洞住著兩個青崖派的人' }],
    done: [{ who: 'narr', t: '石洞裡生著火，牆上掛著兩把劍。一個青衣束髮的女子先站了起來，雙劍已經在手上；她身後，一個背著長劍的青衫男子按住了她的肩膀。' }, { who: 'suxin', t: '……你是誰？這把劍，是師父的劍穗。' },
      { who: 'changfeng', t: '素心，你看他的步法──是青崖的路數。……你是師父後來收的徒弟？' }, { who: 'me', t: { xia: '師兄、師姐！師父一直在等你們回去。', mo: '原來你們就是那兩個逃了的人。', zhong: '師兄師姐好。我是你們的師弟／師妹，幫你們看家看了好幾年。' } },
      { who: 'suxin', t: '師父……他還好嗎？' }, { who: 'changfeng', t: '我們不是逃。是不敢回去。……有些事，你聽了，可能就再也沒辦法叫他一聲師父了。' }],
    reward: { bond: 'sibling', rep: { fishers: 5 } } },
  { id: 'e8', region: 'sea', t: '★師門往事', steps: [{ type: 'choice', id: 'master_past', place: 'sibling', d: '聽師兄師姐說出當年離開青崖的原因',
      lines: [{ who: 'changfeng', t: '十年前，我們在青崖的禁閣裡看到一本手札。上面記著一門吸人內力的功夫──字跡，是師父的。' }, { who: 'suxin', t: '那天夜裡，師父發現我們進過禁閣。他什麼都沒說，只是給我們泡了一壺茶。……我們誰也不敢喝，連夜下了山。' },
        { who: 'changfeng', t: '後來我們在中原聽人說，那本手札是盟主派人放進禁閣的，為的是讓青崖派自己散掉。……我們也不知道該信哪一個。' }],
      opts: [{ label: '相信師兄師姐看到的（師父線 +1）', clue: 'shi', after: [{ who: 'suxin', t: '……謝謝你信我們。我們寧可是自己看錯了。' }, { who: 'narr', t: '火堆劈啪一聲。三個人誰也沒有再說話。' }] },
        { label: '認定是盟主在挑撥（盟主線 +1）', clue: 'meng', after: [{ who: 'changfeng', t: '你倒是信得過師父。……也好。總得有人信他。' }, { who: 'narr', t: '師姐別過臉去，沒有說話。' }] }] }] },
  { id: 'e9', region: 'sea', t: '漲潮之夜', steps: [{ type: 'waves', id: 'tide_night', place: 'yubang', night: true, enemies: ['pirate', 'pirate_xbow', 'water_ghost', 'pirate'], d: '海盜趁夜漲潮襲擊漁村：入夜後在漁村撐過三波' }],
    lines: [{ who: 'yubang', t: '今晚大潮！海天霸每回都挑大潮夜上岸，漁村就靠你了！' }],
    done: [{ who: 'narr', t: '最後一個海盜跳回海裡。遠處的海面上，一艘掛著鯊魚旗的大船亮起了燈。船頭站著一個獨眼的男人，正舉起酒罈朝你遙遙一敬。' }, { who: 'narr', t: '「浪來了！」他的吼聲隔著海浪傳過來，「有種就上我的船！」' }] },
  { id: 'e10', region: 'sea', t: '鯊王 海天霸', steps: [{ type: 'boss', id: 'haitianba', d: '登上南岸的鯊王船，與海天霸一決' }] },
);

/* ---------- 頭目對白 ---------- */
Object.assign(BOSS_LINES, {
  gumu: {
    before: [{ who: 'gumu', t: '乖孩子，你踩壞了婆婆好多蟲子。' }, { who: 'gumu', t: '那些高手的內力，婆婆一滴一滴養進蠱王裡。等煉成了，就有人拿長生來換──你也來當一點養分吧。' },
      { who: 'me', t: { xia: '拿活人養蠱，今天到此為止。', mo: '養分？婆婆，你的蠱王，我收下了。', zhong: '婆婆，蟲子是你自己放出來咬人的。' } }, { who: 'gumu', t: '乖孩子，吃下去。' }],
    p2: '毒水，漲起來吧！',
    after: [{ who: 'gumu', t: '咳、咳……你以為婆婆是主謀？婆婆只是個養蟲的……收貨的人，住在雲上面……' }, { who: 'narr', t: '蠱母的銀飾一件件掉在地上。那隻金色的蠱王從石盆裡爬出來，鑽進了你腳邊的泥裡，再也找不到了。' }],
    spare: [{ who: 'narr', t: '你收了劍。老嫗蜷在石階上，像一團被雨打濕的破布。藍姑走過來，替她拔掉了身上最後一根蠱針。' }],
    kill: [{ who: 'narr', t: '你一劍了結了她。祭壇上的蠱蟲失了主人，一隻隻僵死在石縫裡。' }],
  },
  haitianba: {
    before: [{ who: 'haitianba', t: '哈哈哈！敢上我的船？浪來了！' }, { who: 'haitianba', t: '漁幫那幫窩囊廢派你來的？我告訴你，當年我輸的那場賭，是有人做了局。做局的人，給了我一條船、一面旗──還有一門好生意。' },
      { who: 'me', t: { xia: '拿人換錢的生意，該收攤了。', mo: '那門生意，以後歸我。', zhong: '你上船之前，至少該先學會不賭。' } }, { who: 'haitianba', t: '來啊！看是你的劍快，還是我的浪快！' }],
    p2: '漲潮了！小的們，上！',
    after: [{ who: 'haitianba', t: '……好、好刀……是我輸了。這回，我認。' }, { who: 'haitianba', t: '那面旗子……是中原來的人給的。可收人的不在中原，在崑崙……兩邊，都不是好東西……' }],
    spare: [{ who: 'narr', t: '你收了劍。海天霸大笑一聲，自己跳進海裡，游向漁村的方向。浪裡白站在岸邊，沉默了很久，最後丟給他一條繩子。' }],
    kill: [{ who: 'narr', t: '你一刀斬斷了船桅。海天霸和他的鯊魚旗，一起沉進了漲潮的海裡。' }],
  },
});

/* ---------- 江湖傳聞（2a：兩區各 5 則） ---------- */
Object.assign(RUMORS, {
  baishe: { region: 'miao', t: '白蛇', body: '苗人說白蛇是毒沼的守護神，放牠三次的人會有好報。' },
  duxian: { region: 'miao', t: '毒仙', body: '隱谷的毒仙最恨人吃藥硬撐，她說毒要用身體去記。' },
  lost_tale: { region: 'miao', t: '失蹤的高手', body: '失蹤的高手都是內力深厚之人，而且都曾往西北走。' },
  guwang: { region: 'miao', t: '蠱王', body: '蠱母養了一隻蠱王，是煉續命丹的主藥。' },
  lotus_tale: { region: 'miao', t: '毒沼小島', body: '毒沼中央有一座長滿蓮葉的小島。苗人說，輕功不練到第五重，別想踩著毒水過去。' },
  net_tale: { region: 'sea', t: '撒網', body: '漁幫說，幫忙撒網十次，網裡總會撈到驚喜。' },
  tide_tale: { region: 'sea', t: '觀潮', body: '孤島上的老漁夫只教「能跟著浪走」的人。' },
  shark_tale: { region: 'sea', t: '鯊王', body: '海天霸曾是漁幫的人，後來輸了一場賭，就拿刀上了海盜船。' },
  flag_tale: { region: 'sea', t: '旗號', body: '走私船上的旗子反面，縫著一個「林」字。' },
  wreck_tale: { region: 'sea', t: '沉船', body: '退潮時，礁岩外會露出一艘沉船的桅杆。' },
});
COMMISSION_POOL.push(
  { k: 'kill', type: 'gu', n: 20, region: 'miao', d: '清掉 20 隻蠱蟲', reward: { silver: 260, herb: 8 } },
  { k: 'kill', type: 'miao_warrior', n: 8, region: 'miao', d: '擊退 8 名苗寨戰士', reward: { silver: 320, cloth: 5 } },
  { k: 'gather', res: 'herb', n: 15, region: 'miao', d: '採 15 份苗疆藥草', reward: { silver: 240, guwang: 1 } },
  { k: 'deliver', to: 'station_miao', d: '把信送到苗疆驛站', reward: { silver: 220 }, region: 'miao' },
  { k: 'kill', type: 'pirate', n: 10, region: 'sea', d: '擊退 10 名海盜', reward: { silver: 340, cloth: 5 } },
  { k: 'kill', type: 'crab', n: 8, region: 'sea', d: '清掉 8 隻礁岩蟹', reward: { silver: 300, bone: 6 } },
  { k: 'deliver', to: 'station_sea', d: '把信送到東海驛站', reward: { silver: 220 }, region: 'sea' },
);
Object.assign(ENCOUNTERS, {
  lingshe: { n: '靈蛇報恩', d: '白蛇鱗飾品：毒抗 +30%' },
  yuwang: { n: '漁網撈書', d: '殘頁 30' },
});
Object.assign(DISCIPLES.ahai, { how: 'fishers', story: '漁家少年，水性好。東海漁幫聲望友好後來投。' });

/* ---------- 知己（2a：好感事件前五段；表白與合擊在 2b） ---------- */
const BOND_NEED = [0, 12, 26, 42, 60];
const BONDS = {
  langu: { n: '藍姑', g: 'm', home: 'langu', likes: ['guwang', 'herb'], line: '怕毒就別進谷。', unlock: s => !!(s.bond && s.bond.langu),
    ev: [
      [{ who: 'langu', t: '你又來了。……我在煉一種解蠱的藥，缺一味蠱王。你在毒沼裡打到，留一隻給我。' }, { who: 'choice', t: '藍姑低頭搗藥，不看你。', choices: [{ label: '「我會替你留著。」', b: 6, after: [{ who: 'langu', t: '……嗯。' }] }, { label: '「蠱王很貴吧？」', b: 1, alt: true, after: [{ who: 'langu', t: '貴？比命便宜。' }] }] }],
      [{ who: 'langu', t: '我師父是苗疆最好的毒師。她說，毒是最誠實的東西──你怕它，它就咬你。' }, { who: 'langu', t: '三年前她說要去崑崙見一個「老朋友」，再也沒回來。' }, { who: 'choice', t: '', choices: [{ label: '「我會幫你找到她。」', b: 8, after: [{ who: 'langu', t: '你……不用說得這麼輕鬆。' }, { who: 'narr', t: '她嘴上這麼說，耳朵卻紅了。' }] }, { label: '「也許她已經……」', b: 2, alt: true, after: [{ who: 'langu', t: '我知道。不用你說。' }] }] }],
      [{ who: 'narr', t: '你到隱谷時，藍姑倒在藥爐邊，手臂上爬著一條黑線──她被自己煉的蠱反噬了。' }, { who: 'choice', t: '黑線正往她心口爬。', choices: [{ label: '運功替她逼出蠱毒', b: 10, after: [{ who: 'narr', t: '你掌心貼在她背上，一點一點把那股陰寒逼出來。天亮時，她睜開眼，第一句話是：「你的內力……很暖。」' }] }, { label: '去找巫醫白婆', b: 5, alt: true, after: [{ who: 'wuyi', t: '傻丫頭，又拿自己試藥。……多虧你跑得快。' }] }] }],
      [{ who: 'langu', t: '你知道嗎？苗疆的姑娘看上一個人，會在他的茶裡下情蠱。' }, { who: 'narr', t: '她把一碗茶推到你面前，眼睛盯著你。' }, { who: 'choice', t: '', choices: [{ label: '一口喝乾', b: 10, after: [{ who: 'langu', t: '……哈哈哈！傻子，那是普通的茶。' }, { who: 'narr', t: '她笑得前仰後合，笑完了，卻別過頭去不看你。' }] }, { label: '「這裡面有什麼？」', b: 3, alt: true, after: [{ who: 'langu', t: '沒什麼。……你還真是一點都不好玩。' }] }] }],
      [{ who: 'langu', t: '我把蠱王的殼磨成粉，做成了一個香囊。戴著它，毒霧啃不動你。' }, { who: 'langu', t: '給你。……別誤會，是怕你死在苗疆，沒人幫我找師父。' }, { who: 'choice', t: '', choices: [{ label: '收下，貼身戴著', b: 8, reward: { pres_gift: true }, after: [{ who: 'narr', t: '香囊上繡著一隻歪歪扭扭的蜈蚣。你忍住沒笑。' }] }, { label: '「你自己戴著更好。」', b: 4, alt: true, after: [{ who: 'langu', t: '……多管閒事。' }] }] }],
    ] },
  suxin: { n: '沈素心', g: 'm', home: 'siblings', likes: ['bamboo', 'silver'], line: '跟緊我。', unlock: s => !!(s.bond && s.bond.sibling),
    ev: [
      [{ who: 'suxin', t: '你小時候……不對，你是師父後來收的。可我總覺得，以前在練武場上見過你這樣出劍的人。' }, { who: 'suxin', t: '師父教我第一招的時候說：「跟緊我。」後來我教別人，也只會說這三個字。' }, { who: 'choice', t: '', choices: [{ label: '「那以後，我跟緊師姐。」', b: 7, after: [{ who: 'suxin', t: '……油嘴滑舌。' }, { who: 'narr', t: '她轉身走開，步子卻慢了半拍。' }] }, { label: '「我比較喜歡走前面。」', b: 2, alt: true, after: [{ who: 'suxin', t: '那就別讓我追不上。' }] }] }],
      [{ who: 'suxin', t: '雙劍要左右手各練各的，練到兩隻手互相不知道在做什麼，才算入門。來，我們對一場。' }, { who: 'choice', t: '師姐的雙劍點到你的喉前停住。', choices: [{ label: '「再來一次。」', b: 8, after: [{ who: 'suxin', t: '好。十次也陪你。' }] }, { label: '認輸', b: 3, alt: true, after: [{ who: 'suxin', t: '這麼快就認輸？青崖的弟子可不能這樣。' }] }] }],
      [{ who: 'narr', t: '夜裡，你看見師姐一個人站在小築的牆頭，望著師父的窗。' }, { who: 'suxin', t: '我想進去跟他說話。可是每次走到門口，就想起那壺沒喝的茶。' }, { who: 'choice', t: '', choices: [{ label: '陪她在牆頭坐到天亮', b: 10, after: [{ who: 'narr', t: '你們誰也沒說話。天快亮時，她靠在你肩上睡著了。' }] }, { label: '「我去幫你敲門。」', b: 5, alt: true, after: [{ who: 'suxin', t: '……不用。再給我一點時間。' }] }] }],
      [{ who: 'suxin', t: '你的劍穗散了。……我幫你重新編一個。' }, { who: 'narr', t: '她低著頭編得很仔細，青色的穗子上，悄悄多編了一個結。' }, { who: 'choice', t: '', choices: [{ label: '「這個結是什麼意思？」', b: 9, after: [{ who: 'suxin', t: '沒、沒什麼意思！就是……編錯了。' }] }, { label: '道謝收下', b: 5, alt: true, after: [{ who: 'suxin', t: '嗯。別再弄散了。' }] }] }],
      [{ who: 'suxin', t: '如果……我是說如果。如果師父真的是那個人，你會怎麼做？' }, { who: 'choice', t: '師姐看著你的眼睛。', choices: [{ label: '「不管怎樣，我都站在你這邊。」', b: 10, after: [{ who: 'suxin', t: '……傻瓜。' }, { who: 'narr', t: '她伸手替你理了理衣領，手指在你領口停了一下。' }] }, { label: '「我不知道。」', b: 6, alt: true, after: [{ who: 'suxin', t: '我也不知道。……至少你說了真話。' }] }] }],
    ] },
  changfeng: { n: '顧長風', g: 'f', home: 'siblings', likes: ['iron', 'silver'], line: '有師兄在。', unlock: s => !!(s.bond && s.bond.sibling),
    ev: [
      [{ who: 'changfeng', t: '師妹，路上要是有人欺負你，報我的名字。……雖然這幾年我的名字在江湖上也不太響了。' }, { who: 'changfeng', t: '有師兄在，誰也別想碰青崖的人。' }, { who: 'choice', t: '', choices: [{ label: '「那師兄可要說到做到。」', b: 7, after: [{ who: 'changfeng', t: '哈哈！一言為定！' }] }, { label: '「我自己打得過。」', b: 3, alt: true, after: [{ who: 'changfeng', t: '哦？那改天比一場，讓師兄看看。' }] }] }],
      [{ who: 'changfeng', t: '來，比劍。輸的人去山下買酒。' }, { who: 'choice', t: '師兄的長劍又快又直，像山上的風。', choices: [{ label: '全力應戰', b: 8, after: [{ who: 'changfeng', t: '好劍法！……這壺酒，師兄請了。' }] }, { label: '故意輸給他', b: 3, alt: true, after: [{ who: 'changfeng', t: '你放水了。下次不許這樣。' }] }] }],
      [{ who: 'narr', t: '夜裡，你看見師兄一個人在練武場揮劍，一招一式都是師父當年教的。' }, { who: 'changfeng', t: '我恨不了他。他教我的每一招，我都還記得。' }, { who: 'choice', t: '', choices: [{ label: '陪他把一整套劍法練完', b: 10, after: [{ who: 'narr', t: '兩把劍在月下劃出同樣的弧線。練完最後一招，師兄笑了，那是你第一次看他笑得這麼輕鬆。' }] }, { label: '遞給他一壺茶', b: 5, alt: true, after: [{ who: 'changfeng', t: '……茶？你是故意的吧。' }, { who: 'narr', t: '他還是接過去，喝了一口。' }] }] }],
      [{ who: 'changfeng', t: '這個給你。我在東海撿的貝殼，磨了三個月才磨亮。' }, { who: 'changfeng', t: '……別笑！我是說，你、你戴著好看。' }, { who: 'choice', t: '', choices: [{ label: '當場戴上', b: 9, after: [{ who: 'changfeng', t: '嗯。……嗯，果然好看。' }] }, { label: '收進懷裡', b: 5, alt: true, after: [{ who: 'changfeng', t: '收著也好。別弄丟了。' }] }] }],
      [{ who: 'changfeng', t: '師妹，我問你一句真話：要是有一天，師兄跟師父只能選一個，你選誰？' }, { who: 'choice', t: '師兄沒有笑。', choices: [{ label: '「我不會讓你們走到那一步。」', b: 10, after: [{ who: 'changfeng', t: '……好。有你這句話就夠了。' }] }, { label: '「這不公平。」', b: 6, alt: true, after: [{ who: 'changfeng', t: '是不公平。江湖本來就不公平。' }] }] }],
    ] },
  liu: { n: '柳無痕', g: 'f', home: 'liu_home', likes: ['bamboo', 'herb'], line: '一瞬而已。', unlock: s => s.rescue && s.rescue.rival === 'saved_liu',
    ev: [
      [{ who: 'liu', t: '……你又救了我一次。' }, { who: 'liu', t: '我欠人的，一定會還。說吧，要我殺誰。' }, { who: 'choice', t: '', choices: [{ label: '「不用殺誰。活著就好。」', b: 8, after: [{ who: 'liu', t: '……奇怪的人。' }] }, { label: '「先欠著。」', b: 3, alt: true, after: [{ who: 'liu', t: '好。我記著。' }] }] }],
      [{ who: 'liu', t: '我七歲那年，家裡十三口人，一夜之間只剩我一個。是血影教的人把我從屍堆裡撿回去的。' }, { who: 'liu', t: '後來我才知道，殺我全家的，也是血影教。' }, { who: 'choice', t: '', choices: [{ label: '默默陪他坐著', b: 9, after: [{ who: 'narr', t: '竹葉沙沙地響。過了很久，他低聲說了一句：「謝謝。」' }] }, { label: '「那你為什麼還替他們賣命？」', b: 3, alt: true, after: [{ who: 'liu', t: '因為除了殺人，我什麼都不會。' }] }] }],
      [{ who: 'liu', t: '追殺我的人，用的是崑崙的劍法。他們要我交出一樣東西──厲千秋死前交給我的一封信。' }, { who: 'liu', t: '信我燒了。內容我記得：「內力已足，速送崑崙。」' }, { who: 'choice', t: '', choices: [{ label: '「以後你不是一個人。」', b: 10, after: [{ who: 'liu', t: '……嗯。' }, { who: 'narr', t: '斗笠的垂紗後面，你好像看見他笑了一下。' }] }, { label: '「這封信很重要。」', b: 4, alt: true, after: [{ who: 'liu', t: '比我的命重要？……也許吧。' }] }] }],
      [{ who: 'liu', t: '竹影步的訣竅，在於「讓人以為你在那裡」。……過來，我教你。' }, { who: 'choice', t: '他站在你身後，手扶著你的手腕。', choices: [{ label: '專心學', b: 8, after: [{ who: 'liu', t: '……學得很快。' }] }, { label: '回頭看他', b: 10, after: [{ who: 'liu', t: '……看劍，不是看我。' }, { who: 'narr', t: '他的聲音有點啞。' }] }] }],
      [{ who: 'liu', t: '那天在竹林，你明明可以殺我。為什麼不殺？' }, { who: 'choice', t: '他第一次摘下斗笠看著你。', choices: [{ label: '「因為你的劍裡，有不想殺人的猶豫。」', b: 10, after: [{ who: 'liu', t: '……從來沒人看出來過。' }] }, { label: '「一時心軟。」', b: 5, alt: true, after: [{ who: 'liu', t: '一時心軟，救了一條命。……值得嗎？' }] }] }],
    ] },
};
// 知己住處（重逢後回青崖小築）
Object.assign(PLACES, { siblings: { x: 4520, y: 3330 + OY, n: '師兄師姐的廂房' }, liu_home: { x: 4080, y: 3330 + OY, n: '竹影客房' } });

/* ---------- 成就（2a） ---------- */
ACHIEVEMENTS.push(
  { id: 'ch2_start', cat: 'story', n: '三年後', d: '進入第二章', test: s => !!s.ch2 },
  { id: 'gumu', cat: 'story', n: '萬蠱歸塵', d: '擊敗蠱母婆婆', test: s => !!s.bossDead.gumu },
  { id: 'haitianba', cat: 'story', n: '斬浪', d: '擊敗鯊王海天霸', test: s => !!s.bossDead.haitianba, title: '斬浪客', bonus: { dmg: 0.02 } },
  { id: 'clue4', cat: 'story', n: '抽絲剝繭', d: '做出 4 個關鍵抉擇', test: s => s.clue && (s.clue.meng + s.clue.xian + s.clue.shi) >= 4 },
  { id: 'rescue2', cat: 'story', n: '千里馳援', d: '兩次救援都趕上', test: s => s.rescue && ['saved', 'saved_liu'].includes(s.rescue.rival) && s.rescue.village === 'saved' },
  { id: 'siege1', cat: 'fight', n: '守山', d: '守住一次青崖小築', test: s => (s.siegeWon || 0) >= 1 },
  { id: 'siege2', cat: 'fight', n: '固若金湯', d: '守住兩次青崖小築', test: s => (s.siegeWon || 0) >= 2, title: '青崖守將', bonus: { dr: 0.02 } },
  { id: 'master2', cat: 'book', n: '高人指點', d: '通過兩位世外高人的考驗', test: s => !!(s.books.baizu && s.books.guanchao) },
  { id: 'named14', cat: 'fight', n: '南疆名號', d: '擊敗苗疆與東海的 4 名具名精英', test: s => ['wudu_tongzi', 'aluo', 'laojing', 'coral'].every(k => s.namedDead[k]) },
  { id: 'bond60', cat: 'story', n: '知心', d: '與一位候選知己的好感達到 60', test: s => s.bondPts && Object.values(s.bondPts).some(v => v >= 60) },
  { id: 'fog30', cat: 'explore', n: '百毒不侵', d: '在毒霧中累積 30 分鐘', test: s => (s.stats.fog || 0) >= 1800, title: '百毒不侵', bonus: { pres: 0.1 } },
  { id: 'rumor_ch2', cat: 'explore', n: '南方耳目', d: '收齊苗疆與東海的 10 則傳聞', test: s => ['baishe', 'duxian', 'lost_tale', 'guwang', 'lotus_tale', 'net_tale', 'tide_tale', 'shark_tale', 'flag_tale', 'wreck_tale'].every(k => s.rumors[k]) },
);
window.PORTRAITS_2A = ['wuyi', 'zhaizhu', 'langu', 'yubang', 'laochuanfu', 'diaosou', 'suxin', 'changfeng', 'gumu', 'haitianba', 'wudu_tongzi', 'aluo', 'laojing', 'coral'];
