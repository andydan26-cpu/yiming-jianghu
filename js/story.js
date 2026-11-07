'use strict';
/* 一命江湖 1a — 劇情資料
   對白格式：{ who, t }；t 可以是字串，或 { xia, mo, zhong } 依主角善惡口吻分版本。{name} 會換成主角名。 */

const NPCS = {
  master: { n: '師父 清虛子', look: { robe: '#d8d2c4', acc: '#33536a', hair: '#d9d6cf', hat: 'none', beard: true } },
  chief: { n: '村長', look: { robe: '#6b5a3a', acc: '#3a2a20', hair: '#d9d6cf', hat: 'none' } },
  innkeeper: { n: '客棧掌櫃', look: { robe: '#5a4a3a', acc: CIN, hair: INK, hat: 'none' } },
  dojo: { n: '武館館主', look: { robe: '#2a2420', acc: '#b8873a', hair: INK, hat: 'none' } },
  farmer: { n: '老農', look: { robe: '#7a6a4a', acc: '#3a2a20', hair: '#8a8278', hat: 'douli' } },
  mojiao: { n: '受傷的魔教弟子', look: { robe: '#4a1a1a', acc: CIN, hair: INK, hat: 'none' } },
  merchant: { n: '行商 老錢', look: { robe: '#7b5a2a', acc: GOLD, hair: INK, hat: 'douli' } },
  mystery: { n: '神秘商人', look: { robe: '#2a2420', acc: '#6a4a7a', hair: INK, hat: 'veil' } },
  drunk: { n: '醉翁', look: { robe: '#8a7a5a', acc: CIN, hair: '#d9d6cf', hat: 'none', beard: true } },
  liu: { n: '柳無痕', look: { robe: '#24332b', acc: JADE, hair: INK, hat: 'veil' } },
  caravan_boss: { n: '商幫把頭 駱三刀', look: { robe: '#8a6a3a', acc: '#a07f3c', hair: INK, hat: 'douli', beard: true } },
  caravan: { n: '遇劫的商隊', look: { robe: '#a08060', acc: '#6b4a2a', hair: INK, hat: 'douli' } },
  boatwife: { n: '船夫的妻子', look: { robe: '#5a6a7a', acc: '#d9ecf7', hair: INK, hat: 'none', gender: 'f' } },
  nun: { n: '冰窟老尼', look: { robe: '#e8ebee', acc: '#6f9fbf', hair: '#d9d6cf', hat: 'bald' } },
  oldman: { n: '走火入魔的老者', look: { robe: '#4a3a3a', acc: CIN, hair: '#d9d6cf', hat: 'none', beard: true } },
  fisher: { n: '江心釣客', look: { robe: '#6a6a5a', acc: '#d9ecf7', hair: '#d9d6cf', hat: 'douli', beard: true } },
  boatman: { n: '船夫 老韓', look: { robe: '#5a6a7a', acc: '#3a2a20', hair: INK, hat: 'douli' } },
  mole: { n: '血影教眾 小六', look: { robe: '#3a1416', acc: CIN, hair: INK, hat: 'none' } },
  tieba: { n: '鐵霸', look: { robe: '#6b4a2a', acc: '#a07f3c', hair: INK, hat: 'bald' } },
  gusou: { n: '寒江孤叟', look: { robe: '#6a6a5a', acc: '#d9ecf7', hair: '#d9d6cf', hat: 'douli', beard: true } },
  li: { n: '厲千秋', look: { robe: '#5a1418', acc: CIN, hair: INK, hat: 'none' } },
  prisoner: { n: '被囚的高手', look: { robe: '#8a847a', acc: '#3a3a3a', hair: '#8a8278', hat: 'none', beard: true } },
};

/* ---------- 開場（依出身與上一代改寫） ---------- */
function introLines(S, legacy) {
  const L = [];
  if (legacy) {
    L.push({ who: 'master', t: `……又是一年。山上那塊碑，刻的是${legacy.name}。` });
    L.push({ who: 'master', t: legacy.ended ? `那孩子走完了江湖，最後選擇歸隱。他留下的東西，現在是你的了。` : `那孩子死在${legacy.where}。他留下的秘笈與兵刃，為師一件一件替你收好了。` });
  }
  const o = S.origin;
  if (o === 'mingmen') L.push({ who: 'master', t: '{name}，你自幼在青崖長大，為師的劍法，你已學得七八分。' });
  if (o === 'langzi') L.push({ who: 'master', t: '{name}，你這浪子在山上待了三年，總算肯叫我一聲師父。' });
  if (o === 'pantu') L.push({ who: 'master', t: '{name}，你從血影教逃出來那夜，渾身是血倒在山門前。這些年，你的心魔可曾少些？' });
  if (o === 'shaolin') L.push({ who: 'master', t: '{name}，少林那邊來信說，你這俗家弟子力氣比和尚還大。' });
  L.push({ who: 'master', t: '徒兒，血影教重現江湖了。三大護法分據翠竹林、黃沙古道、寒江雪嶺，殺人如麻。' });
  L.push({ who: 'me', t: { xia: '師父，弟子願下山除害。', mo: '殺人如麻？那就讓他們嘗嘗被殺的滋味。', zhong: '三個護法……聽起來挺忙的。' } });
  L.push({ who: 'master', t: '奪下他們身上的血影令，才破得開東北總壇的結界。青崖派如今只剩你我二人──你師兄、師姐下山多年，音訊全無。山下這座青崖小築早已荒廢，就交給你重振。' });
  L.push({ who: 'master', t: '還有，這顆續命丹你貼身收好。江湖凶險，萬一哪天倒下了，它能救你一命──只有這一顆，別浪費。' });
  L.push({ who: 'narr', t: '得到續命丹 ×1：死亡時自動復活一次，在青崖小築醒來。' });
  L.push({ who: 'master', t: '急什麼，茶還沒涼。先去練武場對著木樁練幾招，再談下山。' });
  return L;
}

/* ---------- 主線節點 ----------
   step 類型：talk(npc) / build(b, lv) / reach(place) / clear(camp) / named(id) / event(id) / learn(books) /
             rumor(id) / sleep_night / night_ambush / boss(id) / commission */
const NODES = [
  { id: 'v1', region: 'village', t: '青崖拜別', steps: [{ type: 'talk', npc: 'master', d: '與師父清虛子交談' }] },
  { id: 'v2', region: 'village', t: '荒廢的小築', steps: [{ type: 'build', b: 'train', lv: 1, d: '砍樹取得木材，在青崖小築修建練武場' }],
    done: [{ who: 'master', t: '有模有樣。這本《青崖心法》你拿去，內功是武學的根。' }], reward: { book: 'qingya_heart' } },
  { id: 'v3', region: 'village', t: '落霞炊煙', steps: [{ type: 'talk', npc: 'chief', d: '到落霞村拜見村長' }],
    lines: [{ who: 'chief', t: '你就是清虛子道長的徒弟？好，好。這幾年山賊、野狼鬧得兇，村子不太平。' }, { who: 'chief', t: '客棧可以歇腳，武館的館主能教你幾手。村口還有個老農，好像遇上麻煩了。' }] },
  { id: 'v4', region: 'village', t: '山賊勒索', steps: [{ type: 'event', ev: 'farmer', d: '幫助村口被勒索的老農' }] },
  { id: 'v5', region: 'village', t: '狼窩異動', steps: [{ type: 'clear', camp: 'wolf_den', d: '清除北方的狼窩' }],
    done: [{ who: 'narr', t: '狼窩深處的石壁上，刻著一個朱紅色的記號──一滴血，被一道影子穿過。' }, { who: 'me', t: { xia: '血影教……竟然到了落霞村附近。', mo: '血影教的記號。看來他們也在這附近找東西。', zhong: '這圖畫得真醜。不過，八成是血影教。' } }] },
  { id: 'v6', region: 'village', t: '武館拜師', steps: [{ type: 'talk', npc: 'dojo', d: '到武館拜見館主' }],
    lines: [{ who: 'dojo', t: '青崖派的？哼，劍是好劍，可惜光有劍不夠。' }, { who: 'dojo', t: '我這裡有伏虎拳、金鐘罩，一本兩百兩。要學隨時來。' }] },
  { id: 'v7', region: 'village', t: '獨眼虎', steps: [{ type: 'named', id: 'wanglaosan', d: '擊敗山賊寨寨主王老三' }],
    done: [{ who: 'narr', t: '王老三倒在寨門前，懷裡掉出一張字條：「竹林那邊要的人，月底前送到。」' }] },
  { id: 'v8', region: 'village', t: '夜半刀光', steps: [{ type: 'sleep_night', d: '入夜後到客棧住宿' }],
    lines: [{ who: 'narr', t: '三更時分，窗紙無聲裂開。四道黑影，帶著竹葉的清香。' }] },
  { id: 'v9', region: 'village', t: '村民的請託', steps: [{ type: 'talk', npc: 'chief', d: '回報村長' }, { type: 'commission', d: '完成一件告示板上的委託' }],
    lines: [{ who: 'chief', t: '昨晚的事全村都聽見了。你若肯幫忙，告示板上的事就交給你；村裡有兩個孩子，也想跟你上山學藝。' }],
    reward: { unlock: ['commission', 'disciple'] } },
  { id: 'v10', region: 'village', t: '下山', steps: [{ type: 'talk', npc: 'master', d: '回青崖小築向師父稟報' }],
    lines: [{ who: 'master', t: '竹葉、血影的記號……是竹影刺客柳無痕。他是三護法裡最難纏的一個。' }, { who: 'master', t: '西去翠竹林、東出黃沙古道、北上寒江雪嶺──四方驛路，為師都叫人清開了。三護法各據一方，先打哪一個，你自己拿主意。' }, { who: 'master', t: '三枚血影令到手，再往東北走。去吧，記得：見地上紅光，便閃身。' }],
    reward: { unlock: ['bamboo', 'roads'] } },

  { id: 'b1', region: 'bamboo', t: '竹海迷途', steps: [{ type: 'reach', place: 'stone1', d: '在竹海迷霧中找到第一塊路石' }, { type: 'reach', place: 'stone2', d: '找到第二塊路石' }, { type: 'reach', place: 'stone3', d: '找到第三塊路石' }],
    done: [{ who: 'narr', t: '三塊路石連成一線，指向竹林深處的一座石冢。' }] },
  { id: 'b2', region: 'bamboo', t: '劍冢殘碑', steps: [{ type: 'reach', place: 'sword_tomb', d: '前往劍冢' }, { type: 'learn', books: ['liuyun_sword'], d: '在劍冢殘碑學會《流雲劍》（銀兩 300）' }] },
  { id: 'b3', region: 'bamboo', t: '刺客營', steps: [{ type: 'clear', camp: 'assassin_camp', d: '攻破北方的刺客營' }],
    done: [{ who: 'narr', t: '營中木籠裡關著一個瘦小的姑娘，和一隻不停學舌的八哥。' }, { who: 'narr', t: '「有人來了！有人來了！」八哥拍著翅膀，飛到你肩上。' }, { who: 'narr', t: '刺客營的箱底，壓著一本《草上飛》。' }],
    reward: { book: 'caoshangfei', pet: 'myna', disciple: 'liuxu' } },
  { id: 'b4', region: 'bamboo', t: '受傷的魔教弟子', steps: [{ type: 'event', ev: 'mojiao', d: '查看竹林中受傷的人' }] },
  { id: 'b5', region: 'bamboo', t: '蛇窟', steps: [{ type: 'clear', camp: 'snake_den', d: '清除南方的蛇窟，取回解毒草' }] },
  { id: 'b6', region: 'bamboo', t: '竹影傳說', steps: [{ type: 'rumor', id: 'liu_orphan', d: '找到記載柳無痕往事的石碑' }] },
  { id: 'b7', region: 'bamboo', t: '竹林夜襲', steps: [{ type: 'night_ambush', d: '夜晚時待在翠竹林，撐過刺客伏擊（可到客棧睡到晚上）' }] },
  { id: 'b8', region: 'bamboo', t: '青竹蛇', steps: [{ type: 'named', id: 'qingzhushe', d: '擊敗刺客營的青竹蛇' }] },
  { id: 'b9', region: 'bamboo', t: '竹下戰書', steps: [{ type: 'talk', npc: 'innkeeper', d: '回落霞村客棧，看看掌櫃要說什麼' }],
    lines: [
      { who: 'narr', t: '三更天，落霞村客棧的門柱上，釘著一片竹葉。葉面上一行小字，墨跡未乾──「明晨寅時，竹林空地。不來，便由我來。」' },
      { who: 'innkeeper', t: '哎喲，客官，這……這是竹影刺客的記號！上個月街尾王鏢頭，就是收了這麼一片葉子，第二天人就沒了。' },
      { who: 'me', t: { xia: '他要找的是我，不必連累旁人。掌櫃的，今夜關好門窗。', mo: '過了今夜，竹影刺客這四個字，就該從江湖上抹掉了。', zhong: '寅時？他倒是會挑，恰好趕得上吃早點。' } },
    ] },
  { id: 'b10', region: 'bamboo', t: '竹影無痕', steps: [{ type: 'boss', id: 'liu', d: '前往竹林空地，與柳無痕一決' }] },

  /* ---------- 黃沙古道 ---------- */
  { id: 's1', region: 'sand', t: '絲路驛站', steps: [{ type: 'reach', place: 'station_sand', d: '往東出山，找到黃沙古道的絲路驛站' }, { type: 'talk', npc: 'caravan_boss', d: '與商幫把頭交談' }],
    lines: [{ who: 'caravan_boss', t: '青崖派的？稀客。在這條道上，認得刀的人才活得久，你腰上那把看著還行。' }, { who: 'caravan_boss', t: '我叫駱三刀，絲路商幫的把頭。最近道上不太平，馬賊、盜墓賊都冒出來了，背後聽說是一個叫鐵霸的。' },
      { who: 'me', t: { xia: '鐵霸是血影教的護法。他欺壓商旅，我不會坐視。', mo: '鐵霸身上有我要的東西，順手替你們清清道。', zhong: '鐵霸？名字倒是挺硬。' } }, { who: 'caravan_boss', t: '有志氣。東邊的商隊今早該到了，還沒見影子……你若有空，幫我去看看。' }] },
  { id: 's2', region: 'sand', t: '遇劫的商隊', steps: [{ type: 'event', ev: 'caravan', d: '找到東邊遇劫的商隊' }] },
  { id: 's3', region: 'sand', t: '刀客墓', steps: [{ type: 'reach', place: 'blade_tomb', d: '前往東南的刀客墓' }, { type: 'learn', books: ['tiema'], place: 'blade_tomb', d: '在刀客墓學會《鐵馬步》（銀兩 400）' }],
    done: [{ who: 'narr', t: '墓碑上的刀痕深淺不一，一套是腳下的功夫，一套是掌上的勁力。碑腳的黃沙被人翻過，棺蓋撬開了一角。' }, { who: 'narr', t: '刀客的遺骨不見了，只剩一隻沾著火油味的手套。' },
      { who: 'me', t: { xia: '連死人都不放過……我替前輩找回遺骨，好生安葬。', mo: '偷到我看上的墓來了。這筆帳記下了。', zhong: '盜墓的手藝不錯，品味太差。' } }] },
  { id: 's4', region: 'sand', t: '沙暴', steps: [{ type: 'reach', place: 'oasis', storm: true, d: '沙暴中迷了路，往東北找到沙中水源' }],
    lines: [{ who: 'narr', t: '天邊一道黃牆壓過來，眨眼間天地無光。風裡夾著沙礫，打在臉上像針。' }, { who: 'caravan_boss', t: '（遠遠的喊聲）沙暴來了──往東北走，那邊有水源！別停下！' }],
    done: [{ who: 'narr', t: '一彎淺水藏在兩座沙丘之間，水邊插著一面破旗，上面畫著血影教的記號。' }, { who: 'me', t: { xia: '水源是商旅的命，他們連這裡都要佔。', mo: '佔水斷路，鐵霸倒懂得怎麼做生意。', zhong: '在這裡插旗，也不怕被沙埋了。' } }] },
  { id: 's5', region: 'sand', t: '蠍巢', steps: [{ type: 'clear', camp: 'scorpion_nest', d: '清除西邊的蠍巢' }],
    done: [{ who: 'caravan_boss', t: '蠍巢一清，往驛站的路總算能走了。來，這碗水你喝。商幫的規矩：護過我們的人，永遠有一碗水。' }] },
  { id: 's6', region: 'sand', t: '盜墓賊', steps: [{ type: 'named', id: 'guishouqi', d: '擊敗盜墓賊鬼手七' }, { type: 'reach', place: 'blade_tomb', d: '把刀客的遺骨送回刀客墓' }],
    done: [{ who: 'narr', t: '你把遺骨放回棺中，重新封土。風吹過墓碑，碑上的刀痕裡沙粒簌簌落下，露出最後一行字。' }, { who: 'narr', t: '「劈空一勁，不為殺人，為開路。」你照著刀痕比劃，掌中真氣竟順著刀意直貫而出。' }],
    reward: { book: 'pikong' } },
  { id: 's7', region: 'sand', t: '馬賊營', steps: [{ type: 'clear', camp: 'horse_camp', d: '攻入東邊的馬賊營，奪回商隊的貨' }],
    done: [{ who: 'narr', t: '馬賊營的地窖裡堆著商隊的貨箱，角落還蜷著一個瘦小的少年，滿臉煤灰，一見火光就發抖。' }, { who: 'narr', t: '「我……我叫石頭，是被抓來挖礦的。別把我留在黑地方……」' }],
    reward: { disciple: 'shitou', silver: 200 } },
  { id: 's8', region: 'sand', t: '鐵霸的規矩', steps: [{ type: 'talk', npc: 'caravan_boss', d: '回絲路驛站見駱三刀' }, { type: 'clear', camp: 'iron_pass', d: '拔掉鐵霸設在北邊的關卡' }],
    lines: [{ who: 'caravan_boss', t: '出事了。鐵霸放話：從今天起，黃沙古道歸他管，往北的路一律封死，過路一人一百兩。' }, { who: 'caravan_boss', t: '「留下買路錢」──這是他的老規矩。北邊那座關卡，就是他收錢的地方。' },
      { who: 'me', t: { xia: '路是大家走出來的，不是他一個人的。', mo: '他的規矩？今天起換我的規矩。', zhong: '一百兩？比落霞客棧住一晚還貴五倍。' } }] },
  { id: 's9', region: 'sand', t: '流沙谷', steps: [{ type: 'reach', place: 'valley_mouth', d: '追到北邊的流沙谷口' }],
    lines: [{ who: 'narr', t: '關卡上的馬賊逃了，一路往北，鑽進一片會吞人的流沙。' }],
    done: [{ who: 'narr', t: '流沙帶的另一頭，一座圓形的谷地被風蝕成碗狀。谷底立著四根石柱，一個光頭大漢扛著大環刀，正坐在柱下啃羊腿。' }, { who: 'narr', t: '他沒抬頭，只說了一句：「有本事過流沙，就有本事接我一刀。」' }] },
  { id: 's10', region: 'sand', t: '狂沙刀', steps: [{ type: 'boss', id: 'tieba', d: '越過流沙帶（需鐵馬步），在流沙谷與鐵霸一決' }] },

  /* ---------- 寒江雪嶺 ---------- */
  { id: 'w1', region: 'snow', t: '寒江渡口', steps: [{ type: 'reach', place: 'station_snow', d: '往北翻過山口，找到寒江驛站' }, { type: 'talk', npc: 'boatwife', d: '到寒江渡口問問情況' }],
    lines: [{ who: 'boatwife', t: '客官要過江？江面凍了三尺，用不著船了……只是我家那口子，說要去江心收網，三天都沒回來。' }, { who: 'boatwife', t: '這幾天江上不太平，北岸來了一夥穿白衣的人，見人就問「血影令」。還有一個老頭，天天坐在江心釣魚，釣了十幾年，一條也沒釣上來過。' },
      { who: 'me', t: { xia: '大嫂別急，我替你找人。', mo: '你男人的事，我順便打聽。', zhong: '冰上釣魚十幾年都沒收穫，這耐性我服。' } }] },
  { id: 'w2', region: 'snow', t: '狼群雪洞', steps: [{ type: 'clear', camp: 'snowwolf_den', d: '清除西南的狼群雪洞' }],
    done: [{ who: 'narr', t: '雪洞深處，一個穿皮襖的姑娘握著獵刀縮在石縫裡，身邊一隻白狐的皮毛在火光裡閃了一下，又鑽進雪裡不見了。' }, { who: 'narr', t: '「我叫雪兒，爹是這嶺上的獵戶。狼群是被那夥白衣人趕下來的……你，你能收我嗎？我會砍柴，也會認路。」' }],
    reward: { disciple: 'xueer' } },
  { id: 'w3', region: 'snow', t: '冰窟', steps: [{ type: 'reach', place: 'ice_cave', d: '前往西北的冰窟' }, { type: 'learn', books: ['hanbing_palm', 'hanbing_finger'], place: 'ice_cave', d: '在冰窟學會《寒冰掌》或《寒冰指》（銀兩 500）' }] },
  { id: 'w4', region: 'snow', t: '冰窟老尼', steps: [{ type: 'talk', npc: 'nun', d: '向冰窟深處的老尼請教' }],
    lines: [{ who: 'narr', t: '冰窟最深處，一個老尼盤坐冰上，眉毛結滿了霜。' }, { who: 'nun', t: { xia: '……你身上沒有血腥氣。坐吧，《玄冰心經》貧尼可以傳你，什麼時候想學，什麼時候來。', mo: '……', zhong: '心還沒定的人，學不了玄冰。等你想清楚自己要做什麼人，再來。' } },
      { who: 'narr', t: { xia: '老尼睜開眼，冰霜從她眉間簌簌落下。', mo: '她連眼都沒睜。', zhong: '她說完這句，又閉上了眼。' } }] },
  { id: 'w5', region: 'snow', t: '叛徒營', steps: [{ type: 'clear', camp: 'traitor_camp', d: '攻破北岸的冰魄門叛徒營' }],
    done: [{ who: 'narr', t: '叛徒營的帳中搜出一封信，落款是一枚血影印：「冰魄門叛眾，歸寒江護法調度。凡見青崖派弟子，格殺勿論。」' }, { who: 'me', t: { xia: '冰魄門的人背叛師門投靠血影教……寒江護法，就是那個人吧。', mo: '寒江護法，連一群叛徒都管不好。', zhong: '格殺勿論？我就站在這裡，來啊。' } }] },
  { id: 'w6', region: 'snow', t: '走火入魔的老者', steps: [{ type: 'event', ev: 'oldman', d: '查看雪原上蜷縮的老者' }] },
  { id: 'w7', region: 'snow', t: '斷崖雪夜', steps: [{ type: 'rumor', id: 'fall', d: '找到西北斷崖邊的石碑' }],
    done: [{ who: 'narr', t: '崖邊的雪被人踩出一條小徑，盡頭是萬丈深淵。風從崖下往上捲，像有什麼東西在下面呼吸。' }, { who: 'me', t: { xia: '雪夜墜崖還能活著回來……世上真有這種奇緣？', mo: '摔下去能學一身功夫？那他運氣比命硬。', zhong: '要是我在下雪的夜裡站在這裡……算了，先記著。' } }] },
  { id: 'w8', region: 'snow', t: '江心孤舟', steps: [{ type: 'talk', npc: 'fisher', d: '走上冰面，去見江心的釣客' }],
    lines: [{ who: 'narr', t: '江心冰面上鑿著一個洞，一個披蓑衣的老人坐在凍住的小舟裡，釣線垂進冰洞，一動也不動。' }, { who: 'fisher', t: '……噓。別嚇跑了魚。' },
      { who: 'me', t: { xia: '老人家，渡口的船夫三天前來江心收網，你可曾見過他？', mo: '別裝了。這方圓十里，只有你一個人天天坐在江心。', zhong: '老人家，釣了這麼多年，總該換個地方下竿了吧？' } }, { who: 'fisher', t: '船夫？見過。在冰面底下呢。……你若想見他，往上游走，看見冰上有個窟窿，就是了。' }, { who: 'fisher', t: '魚，總會上鉤的。' }] },
  { id: 'w9', region: 'snow', t: '冰面之下', steps: [{ type: 'reach', place: 'boatman', d: '往上游的冰面窟窿找失蹤的船夫' }],
    done: [{ who: 'narr', t: '冰窟窿邊上，一個人被凍在半截冰裡，只露出頭和一隻手，嘴唇發紫，竟還有氣。你運功替他震開冰殼。' }, { who: 'boatman', t: '咳……多、多謝……那老頭不是釣魚的……他是寒江護法！他把我凍在這裡當餌，說等青崖派的人來……' },
      { who: 'boatman', t: '他說……「魚，上鉤了。」' }, { who: 'me', t: { xia: '大哥先回渡口，你妻子等你三天了。剩下的，交給我。', mo: '拿活人當餌……好，我就是他要的魚。', zhong: '原來我才是那條魚。被人等了十幾年，也是一種榮幸。' } }] },
  { id: 'w10', region: 'snow', t: '寒江孤叟', steps: [{ type: 'boss', id: 'gusou', d: '回到結冰江面，與寒江孤叟一決' }] },

  /* ---------- 血影教總壇 ---------- */
  { id: 'c1', region: 'cult', t: '血色結界', steps: [{ type: 'reach', place: 'barrier_gate', d: '帶著三枚血影令，往東北總壇的血色結界' }],
    lines: [{ who: 'narr', t: '三枚血影令在懷中發燙，越靠近總壇，燙得越厲害。' }],
    done: [{ who: 'narr', t: '結界像一層凝住的血，映著天光微微流動。你取出三枚令牌，它們自己飛了起來，嵌進結界上三個凹槽。' }, { who: 'narr', t: '一聲裂帛般的長響，結界從中間撕開一道門。門後傳來鐘聲，總壇裡的人知道你來了。' }],
    reward: { cultOpen: true } },
  { id: 'c2', region: 'cult', t: '教眾營房', steps: [{ type: 'clear', camp: 'barracks', d: '潛入總壇，掃平西側的教眾營房' }] },
  { id: 'c3', region: 'cult', t: '血池殿外', steps: [{ type: 'clear', camp: 'pool_guard', d: '擊敗守在血池殿外的鐵面判官與守衛' }],
    done: [{ who: 'narr', t: '鐵面判官倒下時，面具裂成兩半。面具底下是一張年輕的臉，眼神空洞，像被抽乾了什麼。' }] },
  { id: 'c4', region: 'cult', t: '總壇藏經室', steps: [{ type: 'reach', place: 'scripture', d: '找到總壇西北的藏經室' }],
    done: [{ who: 'narr', t: '藏經室裡供著一部殘卷，封皮寫著「血影神功」。翻開來，前半部的字跡圓潤端正，後半部卻是另一個人狂亂的筆跡。' }, { who: 'narr', t: '前半部的筆法……你在哪裡見過。青崖小築的匾額，師父的字，也是這樣收筆的。' },
      { who: 'me', t: { xia: '……不，天下寫字收筆相似的人多得是。', mo: '有意思。這門邪功的根，竟和青崖派扯得上關係。', zhong: '一定是我看錯了。對，一定是。' } }] },
  { id: 'c5', region: 'cult', t: '內鬼', steps: [{ type: 'talk', npc: 'mole', d: '和那個神色慌張的教眾談談' }],
    lines: [{ who: 'mole', t: '別、別動手！我叫小六，是被抓上山的……我知道血牢在哪，也知道教主今晚要做什麼。' }, { who: 'mole', t: '教主要在血雨夜裡，把血牢裡關的那些高手……全煉進血池。你要救人，就得先撐過今晚的反撲。' },
      { who: 'me', t: { xia: '你肯說出來，就還不算無藥可救。躲好，等我。', mo: '你最好說的是真話。否則，下一個進血池的就是你。', zhong: '今晚？我連晚飯都還沒吃。' } }] },
  { id: 'c6', region: 'cult', t: '血雨夜', steps: [{ type: 'raid', d: '血雨中撐過教眾的三波反撲（在營房一帶）' }],
    lines: [{ who: 'narr', t: '天色驟暗，雨落下來，是紅的。總壇四面八方響起鐵鏈拖地的聲音。' }] },
  { id: 'c7', region: 'cult', t: '被囚的高手', steps: [{ type: 'clear', camp: 'priest_camp', d: '打倒血牢外的血池祭司' }, { type: 'reach', place: 'prison', d: '打開血牢，救出被囚的高手' }],
    done: [{ who: 'narr', t: '血牢裡關著十幾個人，衣衫襤褸，有少林的、有峨眉的，還有幾個說不出門派的老人。每個人的手腕上都有一道細細的血痕。' }, { who: 'prisoner', t: '多謝少俠……老夫被關了兩年，每月被抽一次內力。抽出來的，都流進了血池。' },
      { who: 'prisoner', t: '你是青崖派的？……幾年前，也有一對青崖的年輕人來過這裡，一個使雙劍的姑娘，一個背長劍的小伙子。他們逃出去了，往東海那邊去了。' }, { who: 'me', t: { xia: '師兄、師姐還活著……！', mo: '原來他們沒死。那就好，青崖派的帳，人多好算。', zhong: '東海……他們倒是會挑地方，至少有魚吃。' } }] },
  { id: 'c8', region: 'cult', t: '教主密室', steps: [{ type: 'reach', place: 'chamber', d: '潛進東北角的教主密室' }],
    done: [{ who: 'narr', t: '密室的暗格裡壓著三封書信，信紙都已泛黃。' }, { who: 'narr', t: '第一封蓋著一枚金印，寫著「中原之事，照舊辦理」，落款一個「林」字。第二封的紙上有淡淡的松香，只寫「薪柴不足，再送」，沒有落款。' },
      { who: 'narr', t: '第三封只有一行字，筆跡你再熟悉不過：「莫要傷他。」' }, { who: 'me', t: { xia: '……師父？不可能。一定有人仿他的字。', mo: '「莫要傷他」……這個「他」是誰？師父，你瞞了我什麼？', zhong: '三封信，三個人。厲千秋這個教主，看起來也只是個跑腿的。' } }] },
  { id: 'c9', region: 'cult', t: '決戰前夜', steps: [{ type: 'talk', npc: 'master', d: '回青崖小築，向師父稟報' }],
    lines: [{ who: 'master', t: '回來了？茶剛泡好，坐。' }, { who: 'me', t: { xia: '師父，總壇裡有一封信，字跡……和您的一樣。', mo: '師父。密室裡那封「莫要傷他」，是不是您寫的？', zhong: '師父，我在總壇撿到一封您的信。您字寫得真好看。' } },
      { who: 'narr', t: '師父端茶的手停了一下，只停了一下。' }, { who: 'master', t: '天下仿為師字跡的人，不只一個。……徒兒，明日血池殿一戰，你只管記住一件事。' }, { who: 'master', t: '厲千秋練的是吸人內力的邪功，四座血池是他的命根。先破血池，再取他性命。……去吧，茶還沒涼。' }] },
  { id: 'c10', region: 'cult', t: '血影教主', steps: [{ type: 'boss', id: 'li', d: '前往總壇血池殿，與血影教主厲千秋決戰' }] },
];

/* ---------- 頭目對白 ---------- */
const BOSS_LINES = {
  liu: {
    before: [
      { who: 'narr', t: '竹林空地，晨霧未散。葉落無聲，竹影交錯之間，一個頭戴垂紗斗笠的黑影，不知何時已站在那裡。' },
      { who: 'liu', t: '青崖派的人？你師父沒教過你，竹影從不失手。' },
      { who: 'me', t: { xia: '師父教過我的，是不讓滿手血腥的人再多殺一個。', mo: '不失手？那今日就來失一次手。', zhong: '師父教的東西太多，我記不全。不如你親自教教我？' } },
      { who: 'liu', t: '……竹影無痕，取你性命，只需一瞬。' },
    ],
    p2: '有點本事。那就不留手了。', p3: '竹影──千殺！',
    after: [
      { who: 'narr', t: '短劍脫手，釘入竹節。柳無痕單膝跪地，垂紗裂開一道口子，露出半張蒼白的臉。' },
      { who: 'liu', t: '我輸了。要殺便殺，柳某不皺一下眉頭。' },
      { who: 'liu', t: '只是……血影令在我懷裡。你拿去也好，省得我再替那個人殺人。' },
    ],
    spare: [
      { who: 'me', t: { xia: '你殺的人，我救不回來。但你還有命可以贖。走吧。', mo: '殺你太便宜。你欠我一條命，哪天我要來收。', zhong: '竹林這麼靜，殺人太吵。你走吧。' } },
      { who: 'liu', t: '……這份恩情，柳某記下了。這幾頁《梨花針》，算是當作利息。' },
      { who: 'narr', t: '話音未落，竹影一晃，人已不見。只留下釘在竹節上的那把短劍，和葉尖上一點未乾的墨。' },
    ],
    kill: [
      { who: 'me', t: { xia: '放你走，明日又有人收到竹葉。對不住了。', mo: '一瞬而已。你說的。', zhong: '江湖規矩，輸了的人沒得談。' } },
      { who: 'narr', t: '刀光一閃，竹葉紛紛落下。江湖從此少了一個名字。你在他懷中搜出一枚血影令，和一袋沉甸甸的銀子。' },
    ],
  },
  tieba: {
    before: [
      { who: 'narr', t: '流沙谷底，風打著旋兒。鐵霸丟下啃剩的羊骨，扛起大環刀站了起來，比你高出一個頭。' },
      { who: 'tieba', t: '道上的規矩，過我這條路，留下買路錢。你錢沒留，還拔了我的關卡，殺了我的人。' },
      { who: 'me', t: { xia: '你的規矩，是踩著商旅的屍骨立的。今天我來廢了它。', mo: '我的買路錢，就是你的命。', zhong: '買路錢我帶了，只是想先問問──能刷卡嗎？' } },
      { who: 'tieba', t: '哈哈哈！痛快！鐵某平生最講規矩──贏了的人說了算。來！' },
    ],
    p2: '好小子，有兩下子！流沙，給我轉起來！', p3: '狂沙──天斬！',
    after: [
      { who: 'narr', t: '大環刀斷成兩截，插進沙裡。鐵霸一屁股坐倒，喘得像頭牛，臉上卻是笑。' },
      { who: 'tieba', t: '輸了，輸了！鐵某說話算話，從今往後，這條道不收錢了。' },
      { who: 'tieba', t: '血影令拿去。那東西在我身上，跟塊燒紅的炭一樣，早不想要了。……你要殺要剮，給句痛快話。' },
    ],
    spare: [
      { who: 'me', t: { xia: '你講規矩，我也講。往後這條道上，護著商旅，就當贖罪。', mo: '留你一條命，往後這條道，替我看著。', zhong: '殺你還得挖坑，太累。走吧。' } },
      { who: 'tieba', t: '……好！鐵某欠你一條命。這幾頁殘頁是我從一個老刀客那裡贏來的，給你。還有我手下那小子，叫鐵柱，人老實，你要不嫌棄就帶走吧。' },
      { who: 'narr', t: '鐵霸扛起半截斷刀，大步走出流沙谷，再沒回頭。' },
    ],
    kill: [
      { who: 'me', t: { xia: '你殺的人太多，一句「規矩」抵不了。', mo: '贏了的人說了算。這是你說的。', zhong: '規矩就是規矩。' } },
      { who: 'narr', t: '風沙捲過谷底，把血跡一點一點埋掉。你從他腰間解下一袋金子，和一枚滾燙的血影令。' },
    ],
  },
  gusou: {
    before: [
      { who: 'narr', t: '江心的小舟還在，釣線還垂在冰洞裡。老人慢慢收竿，線的盡頭沒有鉤，只有一枚血影令。' },
      { who: 'gusou', t: '三十年了。老夫在這裡等一個人，等來的卻是你。' },
      { who: 'me', t: { xia: '拿無辜的船夫當餌，你等的人，就算來了，也不會原諒你。', mo: '等誰都一樣。今天你等到的是死。', zhong: '等了三十年？那你運氣不太好，等到我。' } },
      { who: 'gusou', t: '……也罷。魚，上鉤了。' },
    ],
    p2: '冰下有狼，天上有雹。你逃得掉嗎？', p3: '獨釣──寒江！',
    after: [
      { who: 'narr', t: '冰面裂成無數碎塊，老人跌坐在小舟裡，蓑衣上結滿了冰。' },
      { who: 'gusou', t: '三十年前，有個年輕人答應回來接我。他上了青崖山，就再沒下來……老夫替血影教賣命，只為了等他一句話。' },
      { who: 'gusou', t: '你身上有青崖的劍意。……替我問你師父，他當年說過的話，可還算數？' },
    ],
    spare: [
      { who: 'me', t: { xia: '這句話，我一定替你帶到。你也該離開這片冰了。', mo: '你的話我記下了。至於你的命，先寄在這裡。', zhong: '好，我回去問。要是他答不上來，我再回來告訴你。' } },
      { who: 'gusou', t: '……多謝。這幾頁是老夫一生的心得，拿去。' },
      { who: 'narr', t: '老人收起釣竿，划著那艘凍住的小舟──不，他是踏著冰，一步一步，消失在江霧裡。' },
    ],
    kill: [
      { who: 'me', t: { xia: '你等的人，不會來了。', mo: '三十年的魚，今天收網。', zhong: '江湖人，等不起三十年。' } },
      { who: 'narr', t: '老人沒有躲。冰面合攏，把小舟和他一起封進江心。你撿起那枚血影令，和他留在舟上的一袋碎銀。' },
    ],
  },
  li: {
    before: [
      { who: 'narr', t: '血池殿裡沒有燈，只有四座血池映出的紅光。厲千秋背對著你，赤足站在殿心，長髮披散，指甲紅得像剛蘸過血。' },
      { who: 'li', t: '青崖派的小輩。三護法，被你一個一個收拾了……有意思。' },
      { who: 'me', t: { xia: '血牢裡的人，我已經放了。你的血池，今天也要乾了。', mo: '三護法的令牌在我手上。你的命，也快了。', zhong: '你這殿裡的擺設太紅了，看得我眼睛疼。' } },
      { who: 'li', t: '本座的血影神功，你接得住幾招？' },
    ],
    p2: '血池，給本座──回來！', p3: '血影──神功！',
    after: [
      { who: 'narr', t: '最後一座血池碎裂，殷紅的池水灑了一地，轉眼化成黑煙。厲千秋跪倒在殿心，蒼白的臉上第一次露出恐懼。' },
      { who: 'li', t: '你……以為殺了本座，就結束了？' },
      { who: 'li', t: '哈……哈哈……血影教……不過是一把刀……握刀的人……' },
      { who: 'li', t: '真正的主人……不是我……' },
      { who: 'narr', t: '他的聲音斷了。血池殿裡一片死寂，只剩殿外的雨，不知何時已經變回了清水。' },
    ],
  },
};

/* ---------- 江湖事件 ---------- */
const EVENTS = {
  farmer: {
    npc: 'farmer',
    lines: [{ who: 'farmer', t: '少俠救命！這幫山賊天天來討保護費，今年的收成全被搶光了……' }, { who: 'narr', t: '山賊頭子斜眼看你：「識相的就分你一份。」' }],
    choices: [
      { label: '出手相救（俠義 +15）', act: 'wave', wave: { type: 'bandit', n: 5 }, karma: 15, rep: { village: 15 }, reward: { herb: 8, silver: 30 },
        after: [{ who: 'farmer', t: '謝謝少俠！這些藥草是自家種的，您收著。' }] },
      { label: '一起收保護費（魔性 +15）', alt: true, karma: -15, rep: { village: -20 }, reward: { silver: 80 },
        after: [{ who: 'narr', t: '山賊頭子哈哈大笑，塞給你一袋碎銀。老農跪在田邊，一句話也沒說。' }] },
    ],
  },
  mojiao: {
    npc: 'mojiao',
    lines: [{ who: 'mojiao', t: '咳……我是血影教的人，被同門暗算……求你……' }, { who: 'narr', t: '他傷得很重，再不救治就要沒命了。' }],
    choices: [
      { label: '用金創藥救他（俠義 +10）', need: 'potion', karma: 10, rep: { blood: 5 }, reward: { book: 'zhuihun_dart', xiu: 80 },
        after: [{ who: 'mojiao', t: '多謝……教主在總壇修煉血影神功，要先奪三護法的令牌才進得去。這本《追魂鏢》，是我唯一能給你的。' }] },
      { label: '了結他（魔性 +10）', alt: true, karma: -10, reward: { page: 3 },
        after: [{ who: 'narr', t: '你從他懷中搜出幾頁染血的武學殘頁。' }] },
    ],
  },
  caravan: {
    npc: 'caravan',
    lines: [{ who: 'narr', t: '一隊駱駝橫倒在沙丘下，貨箱散了一地。商人們被馬賊圍在中間，領頭的馬賊拿刀拍著一個胖少年的臉。' }, { who: 'caravan', t: '少俠救命！貨都給你們，別傷人！……少俠？你、你是哪邊的？' }, { who: 'narr', t: '馬賊頭子瞇眼看你：「同道？貨分你三成。」' }],
    choices: [
      { label: '護送商隊（俠義 +15）', act: 'wave', wave: { type: 'horse_bandit', n: 6 }, karma: 15, rep: { merchants: 25 }, reward: { book: 'xuanfeng_blade', silver: 150, disciple: 'qianduoduo' },
        after: [{ who: 'caravan', t: '恩人！這本《旋風刀》是我們從西域收來的，一直不知道給誰好，就給您了！' }, { who: 'narr', t: '胖少年擦著鼻涕湊過來：「我叫錢多多，算盤打得可快了！師父收我吧，我給您管帳！」' }] },
      { label: '趁火打劫（魔性 +20）', alt: true, karma: -20, rep: { merchants: -40 }, reward: { silver: 500 },
        after: [{ who: 'narr', t: '你和馬賊分了貨。商人們跪在沙裡，看你的眼神像看一頭狼。' }] },
    ],
  },
  oldman: {
    npc: 'oldman',
    lines: [{ who: 'narr', t: '雪原上蜷著一個老人，渾身冒著黑紅的氣，七竅都滲出血絲。他抓住你的衣角。' }, { who: 'oldman', t: '我……我練了不該練的功……血影心經……它在我體內亂竄……' }, { who: 'oldman', t: '我快不行了……這門功夫……你要不要？只要你肯學，我的內力……全都給你……' }],
    choices: [
      { label: '拒收魔功，替他散功（俠義 +10）', karma: 10, reward: { page: 8, xiu: 200 },
        after: [{ who: 'narr', t: '你運功替他把亂竄的真氣導出體外。老人吐出一口黑血，臉色慢慢有了人樣。' }, { who: 'oldman', t: '多謝……老朽這條命，是撿回來的。這幾頁是我年輕時抄的正經功夫，比那邪功乾淨。' }] },
      { label: '修煉魔功，吸他內力（魔性 +20）', alt: true, karma: -20, reward: { book: 'xueying_heart', xiu: 1200 },
        after: [{ who: 'narr', t: '你按住他的天靈，一股陰冷的真氣倒灌進你的經脈。老人的身體一點一點乾癟下去，最後化成一攤黑雪。' }, { who: 'narr', t: '你學會了《血影心經》。體內多了一股不屬於你的力量，在血管裡低語。' }] },
    ],
  },
};

/* ---------- 江湖傳聞（1a：兩區各 5 則） ---------- */
const RUMORS = {
  drunk: { region: 'village', t: '醉翁', body: '客棧小二說，常有個醉鬼老頭連住三晚就會出現，喊著要教人「喝酒打通經脈」。' },
  dog: { region: 'village', t: '流浪狗', body: '村口那隻黃狗誰餵牠三次，牠就跟誰走。' },
  tiger: { region: 'village', t: '獨眼虎', body: '王老三本是獵戶，那隻眼是被白額狼王抓瞎的。' },
  oldstory: { region: 'village', t: '青崖舊事', body: '村長記得三十年前，清虛子曾有一個師兄，某天半夜下山就再沒回來。' },
  well: { region: 'village', t: '後山枯井', body: '後山的枯井半夜會傳出風聲，像是底下通往別處。' },
  resonance: { region: 'bamboo', t: '劍冢共鳴', body: '有人說月夜持劍入冢，千劍齊鳴；但只有劍法精深之人聽得到。' },
  liu_orphan: { region: 'bamboo', t: '柳家孤兒', body: '柳無痕幼時全家被殺，是血影教把他撿回去養大的。' },
  myna: { region: 'bamboo', t: '會說話的鳥', body: '刺客營裡關著一隻八哥，老學刺客們說「有人來了」。' },
  stonegate: { region: 'bamboo', t: '竹海石門', body: '竹海最深處有一道石門，門上刻著一個「開」字。只是門前的斷崖，尋常腳力跳不過去。' },
  token: { region: 'bamboo', t: '血影令', body: '三護法各持一枚令牌，三令合一方可解開總壇血界。' },
  meteor_tale: { region: 'sand', t: '天降隕鐵', body: '商隊老人說，沙暴裡待得夠久，天上會掉下黑鐵。' },
  blade_tale: { region: 'sand', t: '刀客墓', body: '墓主是一位無名刀客，墓碑上的刀痕藏著兩套功夫。' },
  ghost_tale: { region: 'sand', t: '鬼手七', body: '鬼手七偷遍絲路，不偷有刀的人，只偷沒有的。' },
  guild_tale: { region: 'sand', t: '絲路商幫', body: '商幫的規矩是「護過我們的人，永遠有一碗水」。' },
  ruin_tale: { region: 'sand', t: '沙下古城', body: '風大的時候，沙丘下會露出一座古城的城垛。' },
  fall: { region: 'snow', t: '墜崖不死', body: '有個獵人雪夜從斷崖滾下，幾天後帶著一身功夫爬上來。據說他是在崖邊閃身躲雪崩時跌下去的。' },
  fisher_tale: { region: 'snow', t: '釣客', body: '寒江孤叟釣了三十年的魚，從沒釣到過，他等的不是魚。' },
  nun_tale: { region: 'snow', t: '冰窟老尼', body: '老尼只收心地乾淨的人，別人敲門，她連眼都不睜。' },
  fox_tale: { region: 'snow', t: '雪狐', body: '墜崖那獵人身邊，後來一直跟著一隻白狐。' },
  lake_tale: { region: 'snow', t: '冰湖之下', body: '冰湖最薄的地方，看得到底下有個洞口。只是四周都是冰縫，尋常腳力過不去。' },
  bloodmoon: { region: 'cult', t: '血月', body: '血雨之夜，心中殺氣越重的人，越聽得到血影心經在耳邊念。' },
  founder: { region: 'cult', t: '創教人', body: '血影教創教於三十年前，創教人的名字從未寫在教中任何典籍裡。' },
  pool_tale: { region: 'cult', t: '血池', body: '血池不是血，是被吸乾的內力化成的。' },
  roster: { region: 'cult', t: '囚徒名冊', body: '一份名冊，寫著各派被囚高手，有幾個名字被人用硬筆劃掉。' },
  abyss: { region: 'cult', t: '地底血獄', body: '總壇底下還有一層又一層，沒人走到過盡頭。' },
};

/* ---------- 委託 ---------- */
const COMMISSION_POOL = [
  { k: 'kill', type: 'wolf', n: 12, region: 'village', d: '清掉 12 隻野狼', reward: { silver: 60, fur: 3 } },
  { k: 'kill', type: 'bandit', n: 10, region: 'village', d: '擊退 10 名山賊', reward: { silver: 60, cloth: 3 } },
  { k: 'gather', res: 'herb', n: 10, d: '採 10 份藥草', reward: { silver: 50 } },
  { k: 'gather', res: 'wood', n: 20, d: '砍 20 份木材', reward: { silver: 50 } },
  { k: 'kill', type: 'snake', n: 10, region: 'bamboo', d: '清掉 10 條毒蛇', reward: { silver: 100, bone: 3 } },
  { k: 'kill', type: 'assassin', n: 8, region: 'bamboo', d: '擊退 8 名竹林刺客', reward: { silver: 120, page: 1 } },
  { k: 'deliver', to: 'station_bamboo', d: '把信送到翠竹林驛站', reward: { silver: 70 }, needBamboo: true },
  { k: 'deliver', to: 'chief', d: '把信送給落霞村長', reward: { silver: 40 } },
  { k: 'kill', type: 'scorpion', n: 12, region: 'sand', d: '清掉 12 隻沙蠍', reward: { silver: 160, bone: 4 } },
  { k: 'kill', type: 'horse_bandit', n: 10, region: 'sand', d: '擊退 10 名馬賊', reward: { silver: 200, cloth: 4 } },
  { k: 'gather', res: 'iron', n: 15, region: 'sand', d: '挖 15 份鐵礦', reward: { silver: 140 } },
  { k: 'deliver', to: 'station_sand', d: '把信送到絲路驛站', reward: { silver: 120 }, region: 'sand' },
  { k: 'kill', type: 'snowwolf', n: 12, region: 'snow', d: '清掉 12 隻雪狼', reward: { silver: 160, fur: 5 } },
  { k: 'kill', type: 'traitor', n: 10, region: 'snow', d: '擊退 10 名冰魄叛徒', reward: { silver: 200, page: 2 } },
  { k: 'deliver', to: 'ferry', d: '把信送到寒江渡口', reward: { silver: 120 }, region: 'snow' },
  { k: 'kill', type: 'cultist', n: 10, region: 'cult', d: '擊退 10 名血影教眾', reward: { silver: 300, page: 3 } },
  { k: 'kill', type: 'hexer', n: 8, region: 'cult', d: '擊退 8 名血影咒師', reward: { silver: 300, xuejing: 1 } },
];

/* ---------- 奇遇 ---------- */
const ENCOUNTERS = {
  drunk: { n: '醉翁傳功', d: '醉酒老人替你打通督脈 +5 重' },
  resonance: { n: '劍冢共鳴', d: '劍招傷害永久 +10%' },
  fall: { n: '墜崖奇緣', d: '山洞石壁上的心法：隨機一本已學秘笈 +3 重；雪狐跟上了你' },
  meteor: { n: '天降隕鐵', d: '隕鐵：手上的兵器直接升一階' },
  bloodmoon: { n: '血月異象', d: '血影心經 +3 重' },
};

/* ---------- 第一章結尾 ---------- */
const CH1_END = [
  { who: 'narr', t: '血影教主伏誅的消息，三天之內傳遍江湖。' },
  { who: 'narr', t: '落霞村的炊煙又升了起來，黃沙古道上的駝鈴重新響起，寒江的渡船，也在開春的冰水裡撐出了第一篙。' },
  { who: 'narr', t: '只有你知道，密室裡那三封信，還壓在你的行囊最底層。' },
  { who: 'master', t: '……厲千秋臨死說的話，你聽見了？' },
  { who: 'master', t: '江湖這潭水，比你以為的深。去歇一歇吧，徒兒。等你準備好了，再去看看那些信的主人。' },
  { who: 'narr', t: '第一章「血影之亂」，完。' },
  { who: 'narr', t: '那三封信的主人是誰？江湖沒有給你答案。只有時間，一天一天地過去。' },
];
