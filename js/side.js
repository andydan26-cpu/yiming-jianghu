'use strict';
/* 一命江湖 — 支線任務：九區各 3 條（人物小故事、連環任務、善惡抉擇、收集與探索）
   本檔接在 ch3.js 之後載入。找 NPC 說話時，主線優先；沒有主線要說的，才輪到支線。 */

Object.assign(NPCS, {
  bamboo_hermit: { n: '竹林樵夫 阿竹', look: { robe: '#5a6a4a', acc: '#3a2a20', hair: INK, hat: 'douli' } },
  pilgrim: { n: '逃出的教眾 小七', look: { robe: '#5a2a2a', acc: '#2a1a1a', hair: INK, hat: 'none' } },
});
Object.assign(PLACES, { bamboo_hermit: { x: 1550, y: 3820, n: '樵夫的竹棚', npc: 'bamboo_hermit' }, pilgrim: { x: 4300, y: 1560, n: '荒廟後的破棚', npc: 'pilgrim' } });
Object.assign(BOOKS, {
  canjian: { n: '殘劍九式', cat: 'weapon', w: 'sword', tier: 2, attrs: ['剛', '柔'], pat: 'thrust3', mp: 28, cd: 6, mult: 1.8, src: '支線・殘缺的劍譜（集齊五頁）' },
  heying: { n: '鶴影步', cat: 'qing', tier: 2, attrs: ['柔', '寒'], water: true, src: '支線・白鶴信使' },
});

/* ---------- 支線資料 ----------
   步驟：talk 找人說話｜give 交出資源｜kill 打倒某種怪｜clear 清空據點｜find 到某處找東西｜elite 到某處打倒現身的強敵｜choice 抉擇（在 giver 或某處） */
const SIDE = [
  // ── 落霞村 ──
  { id: 'v_wine', region: 'village', n: '客棧的蜜酒', kind: '人物', giver: 'innkeeper',
    offer: [{ who: 'innkeeper', t: '客官，小店的招牌蜜酒斷貨了。野蜂林那幾窩蜂兇得很，沒人敢去取蜜。' }],
    steps: [{ k: 'kill', type: 'hive', n: 3, d: '搗掉野蜂林的 3 個蜂窩' }, { k: 'talk', npc: 'innkeeper', d: '回客棧找老闆娘', lines: [{ who: 'innkeeper', t: '這麼多蜜！今晚就釀。等酒熟了，第一罈留給你。' }] }],
    reward: { silver: 200, herb: 6, potion: 1 } },
  { id: 'v_thief', region: 'village', n: '偷雞賊', kind: '善惡', giver: 'chief',
    offer: [{ who: 'chief', t: '村裡接連丟雞，大家都說是山賊。可我在雞窩邊撿到一隻小小的草鞋……你幫我看看？' }],
    steps: [{ k: 'find', x: 3400, y: 4300, d: '去村南雞窩邊找線索', t: '泥地上一串小腳印，往村南的草棚去了。' },
      { k: 'choice', x: 3700, y: 4450, d: '跟著腳印找到草棚', lines: [{ who: 'narr', t: '草棚裡縮著一個瘦得皮包骨的孩子，懷裡抱著一隻雞，旁邊躺著發燒的妹妹。' }, { who: 'narr', t: '「別、別告訴村長……我妹妹三天沒吃東西了……」' }],
        opts: [{ label: '把雞留給他，再塞給他一點銀兩（俠義 +8）', karma: 8, rep: { village: 5 }, silver: -40, after: [{ who: 'narr', t: '孩子哭著磕頭。後來村長收他在村裡幫忙，雞再也沒丟過。' }] },
          { label: '把他拎去見村長（魔性 +5）', karma: -5, reward: { silver: 100 }, after: [{ who: 'chief', t: '……是個孩子啊。唉，罰他掃三個月的雞窩吧。賞錢你拿著。' }] }] }],
    reward: { page: 2 } },
  { id: 'c1_sword', region: 'village', n: '殘缺的劍譜・一', kind: '連環', chain: 'sword', giver: 'dojo',
    offer: [{ who: 'dojo', t: '小子，武館祖上傳下一本《殘劍九式》，十年前被人撕成五頁，散到天南地北。' }, { who: 'dojo', t: '第一頁聽說被狼叼進了北邊的狼窩。替我找回來，五頁湊齊，劍法教你。' }],
    steps: [{ k: 'clear', camp: 'wolf_den', d: '清空北邊的狼窩' }, { k: 'find', place: 'wolf_den', d: '在狼窩裡翻找劍譜', t: '狼窩深處的骨頭堆裡，壓著一張發黃的紙──《殘劍九式》第一頁。' },
      { k: 'talk', npc: 'dojo', d: '把第一頁交給武館師父', lines: [{ who: 'dojo', t: '是它！第二頁……當年被一個竹林刺客搶走了。去翠竹林的劍冢問問。' }] }],
    reward: { silver: 150 } },
  // ── 翠竹林 ──
  { id: 'c2_sword', region: 'bamboo', n: '殘缺的劍譜・二', kind: '連環', chain: 'sword', after: 'c1_sword', giver: 'bamboo_hermit',
    offer: [{ who: 'bamboo_hermit', t: '劍譜？前幾天有幾個刺客在劍冢邊上搶一張紙，打得竹葉亂飛。' }],
    steps: [{ k: 'reach', place: 'sword_tomb', d: '去劍冢殘碑' }, { k: 'kill', type: 'assassin', n: 6, d: '打倒搶劍譜的刺客（6 名）' },
      { k: 'talk', npc: 'bamboo_hermit', d: '回竹棚找樵夫', lines: [{ who: 'bamboo_hermit', t: '刺客身上掉了這個。是你要的劍譜吧？第三頁，聽說賣給了黃沙的馬賊。' }] }],
    reward: { silver: 200, bamboo: 4 } },
  { id: 'b_axe', region: 'bamboo', n: '樵夫的斧頭', kind: '人物', giver: 'bamboo_hermit',
    offer: [{ who: 'bamboo_hermit', t: '我那把祖傳的斧頭，被竹林裡的竹精捲走了。那些竹精，一碰就扎人。' }],
    steps: [{ k: 'kill', type: 'sprite', n: 5, d: '打倒 5 隻竹精，找回斧頭' }, { k: 'talk', npc: 'bamboo_hermit', d: '把斧頭還給阿竹', lines: [{ who: 'bamboo_hermit', t: '就是它！斧柄上還刻著我爹的名字。這些竹子，你拿去蓋房子吧。' }] }],
    reward: { wood: 40, silver: 150 } },
  { id: 'b_treasure', region: 'bamboo', n: '竹林三寶', kind: '收集', giver: 'bamboo_hermit',
    offer: [{ who: 'bamboo_hermit', t: '竹心、藥草、木材，竹林三寶。我想給山下的郎中送一份，可我這腿腳……' }],
    steps: [{ k: 'give', npc: 'bamboo_hermit', res: 'bamboo', n: 6, d: '交給阿竹竹心 6 份' }, { k: 'give', npc: 'bamboo_hermit', res: 'herb', n: 10, d: '交給阿竹藥草 10 份' }],
    done: [{ who: 'bamboo_hermit', t: '郎中說，夠救半個村子的人了。這幾頁殘頁是我在竹林撿的，給你。' }], reward: { silver: 300, page: 3 } },
  // ── 黃沙古道 ──
  { id: 'c3_sword', region: 'sand', n: '殘缺的劍譜・三', kind: '連環', chain: 'sword', after: 'c2_sword', giver: 'caravan_boss',
    offer: [{ who: 'caravan_boss', t: '一張舊劍譜？對，沙裡飛的人拿它來換過酒。現在大概壓在馬賊營的箱底。' }],
    steps: [{ k: 'clear', camp: 'horse_camp', d: '清空馬賊營' }, { k: 'find', place: 'horse_camp', d: '在馬賊營翻找劍譜', t: '酒罈底下壓著《殘劍九式》第三頁，沾了一角酒漬。' },
      { k: 'talk', npc: 'caravan_boss', d: '回去找商幫把頭', lines: [{ who: 'caravan_boss', t: '找到了？第四頁……寒江渡口的船娘說過，有人把一張紙沉進了冰湖。' }] }],
    reward: { silver: 300, iron: 10 } },
  { id: 's_oasis', region: 'sand', n: '沙中水源', kind: '善惡', giver: 'caravan_boss',
    offer: [{ who: 'caravan_boss', t: '東北的沙中水源，商幫想圈起來收過路費。可牧民說那是他們祖宗的井。你去看看，替我拿個主意。' }],
    steps: [{ k: 'choice', place: 'oasis', d: '去沙中水源看看', lines: [{ who: 'narr', t: '水源邊擠滿了牧民和瘦駱駝。一個老牧民捧著破碗，跪在你面前：「客人，別讓商幫把井圍起來……」' }],
      opts: [{ label: '讓水源人人可用（俠義 +10）', karma: 10, rep: { merchants: -10, village: 5 }, after: [{ who: 'narr', t: '牧民們在水源邊插了一根旗竿，旗上畫了一把劍。' }] },
        { label: '替商幫圈下水源（魔性 +10）', karma: -10, rep: { merchants: 15 }, reward: { silver: 600 }, after: [{ who: 'caravan_boss', t: '好！這是你的那一份。牧民？他們會找到別的井的。' }] }] }],
    reward: { page: 2 } },
  { id: 's_scorpion', region: 'sand', n: '蠍尾入藥', kind: '收集', giver: 'caravan_boss',
    offer: [{ who: 'caravan_boss', t: '商隊裡好幾個人被蠍子螫了。郎中說要用蠍尾以毒攻毒。' }],
    steps: [{ k: 'kill', type: 'scorpion', n: 8, d: '打倒 8 隻沙蠍，取下蠍尾' }, { k: 'talk', npc: 'caravan_boss', d: '把蠍尾交給商幫把頭', lines: [{ who: 'caravan_boss', t: '八條蠍尾，一條不少。商幫欠你一份情。' }] }],
    reward: { silver: 400, iron: 20, rep: { merchants: 10 } } },
  // ── 寒江雪嶺 ──
  { id: 'c4_sword', region: 'snow', n: '殘缺的劍譜・四', kind: '連環', chain: 'sword', after: 'c3_sword', giver: 'boatwife',
    offer: [{ who: 'boatwife', t: '紙？冬天的時候，有個人在西邊冰面的窟窿裡丟了一個鐵盒，盒子沉下去之前，冒出一隻雪熊……' }],
    steps: [{ k: 'kill', type: 'snowbear', n: 3, d: '打倒 3 隻雪熊' }, { k: 'find', place: 'boatman', d: '去西邊的冰面窟窿撈鐵盒', t: '你從冰窟窿裡撈起一個生鏽的鐵盒，裡面是《殘劍九式》第四頁，乾乾的，一點也沒濕。' },
      { k: 'talk', npc: 'boatwife', d: '回渡口找船娘', lines: [{ who: 'boatwife', t: '最後一頁？那個丟盒子的人說過一句：「剩下的，在血影教的藏經室。」' }] }],
    reward: { silver: 350, frost: 1 } },
  { id: 'w_husband', region: 'snow', n: '船娘的丈夫', kind: '人物', giver: 'boatwife',
    offer: [{ who: 'boatwife', t: '我家那口子去雪原打獵，七天沒回來。有人說看見叛徒營的人押著一個獵戶……' }],
    steps: [{ k: 'find', x: 2150, y: 1300, d: '去雪原找獵戶的蹤跡', t: '雪地裡露出一條灰色的圍巾，是船娘親手織的。腳印往北邊的叛徒營去了。' }, { k: 'clear', camp: 'traitor_camp', d: '清空北邊的叛徒營，救出獵戶' },
      { k: 'talk', npc: 'boatwife', d: '回渡口報信', lines: [{ who: 'boatwife', t: '他回來了！凍掉了兩根腳趾，人還在！……這鍋魚湯，你一定要喝完。' }] }],
    reward: { silver: 300, potion: 2 } },
  { id: 'w_lotus', region: 'snow', n: '雪蓮供佛', kind: '收集', giver: 'nun',
    offer: [{ who: 'nun', t: '冰窟裡的佛前缺了雪蓮。老尼腿腳不便，施主若肯代勞，功德無量。' }],
    steps: [{ k: 'give', npc: 'nun', res: 'xuelian', n: 5, d: '交給老尼雪蓮 5 朵' }],
    done: [{ who: 'nun', t: '阿彌陀佛。這幾頁經文殘卷，送給施主，也許用得上。' }], reward: { silver: 200, page: 5, karma: 3 } },
  // ── 血影教總壇 ──
  { id: 'c5_sword', region: 'cult', n: '殘缺的劍譜・五', kind: '連環', chain: 'sword', after: 'c4_sword', giver: 'pilgrim', need: s => !!s.cultOpen,
    offer: [{ who: 'pilgrim', t: '藏經室？我以前在那裡掃地。最裡面的架子上有一張舊劍譜，教裡的巫師說要拿去燒。' }],
    steps: [{ k: 'reach', place: 'scripture', d: '潛進總壇藏經室' }, { k: 'kill', type: 'hexer', n: 6, d: '打倒守經的巫師（6 名）' }, { k: 'find', place: 'scripture', d: '在藏經室找最後一頁', t: '燒了一半的火盆邊，壓著《殘劍九式》第五頁。' },
      { k: 'talk', npc: 'dojo', d: '把五頁劍譜帶回落霞村武館', lines: [{ who: 'dojo', t: '五頁……五頁都齊了！十年了。小子，這套劍法，你比我更配用。' }] }],
    reward: { book: 'canjian', silver: 500 } },
  { id: 'c_children', region: 'cult', n: '血牢裡的孩子', kind: '善惡', giver: 'pilgrim', need: s => !!s.cultOpen,
    offer: [{ who: 'pilgrim', t: '血牢外的祭司營裡關著好幾個孩子，是要拿去祭血池的。我不敢回去……求你。' }],
    steps: [{ k: 'clear', camp: 'priest_camp', d: '清空血牢外的祭司營' },
      { k: 'choice', place: 'prison', d: '打開血牢', lines: [{ who: 'narr', t: '血牢裡關著五個孩子。牆角另有一口鐵箱，裝滿了教眾搜刮來的金銀。' }, { who: 'narr', t: '帶著孩子，就扛不走箱子。' }],
        opts: [{ label: '帶孩子們離開（俠義 +12）', karma: 12, rep: { village: 10, blood: -10 }, after: [{ who: 'narr', t: '孩子們一個牽著一個，跟著你走出了總壇。最小的那個，一路都抓著你的衣角。' }] },
          { label: '扛走鐵箱（魔性 +12）', karma: -12, reward: { silver: 900 }, after: [{ who: 'narr', t: '你扛著鐵箱走出血牢。身後的哭聲，很久才停。' }] }] }],
    reward: { page: 3 } },
  { id: 'c_crystal', region: 'cult', n: '血咒', kind: '收集', giver: 'pilgrim',
    offer: [{ who: 'pilgrim', t: '入教的時候，他們在我身上下了血咒。巫醫說，要三塊血晶才解得開。' }],
    steps: [{ k: 'give', npc: 'pilgrim', res: 'xuejing', n: 3, d: '交給小七血晶 3 塊' }],
    done: [{ who: 'pilgrim', t: '……胸口那塊黑印不見了。我想回家，回去種田。謝謝你。' }], reward: { silver: 300, page: 4, karma: 5 } },
  // ── 苗疆毒沼 ──
  { id: 'd1_crane', region: 'miao', n: '白鶴信使・一', kind: '連環', chain: 'crane', giver: 'zhaizhu', need: s => !!s.ch2,
    offer: [{ who: 'zhaizhu', t: '寨子東邊掉下一隻白鶴，腳上綁著一封信。苗人不碰仙家的東西，你去看看。' }],
    steps: [{ k: 'find', x: 2400, y: 6200, d: '去寨子東邊找那隻白鶴', t: '白鶴已經死了，腳上的竹筒裡是一封寫了一半的信：「師兄，崑崙的事我查清了──」後面被毒水泡爛了。' },
      { k: 'talk', npc: 'zhaizhu', d: '把信拿給寨主看', lines: [{ who: 'zhaizhu', t: '竹筒上刻的是東海漁幫的記號。去問問海邊的老船夫。' }] }],
    reward: { silver: 300 } },
  { id: 'm_apprentice', region: 'miao', n: '巫醫的徒弟', kind: '人物', giver: 'wuyi', need: s => !!s.ch2,
    offer: [{ who: 'wuyi', t: '我那傻徒弟去毒林採藥，到現在還沒回來。那片林子裡的毒蟾，一口能噴倒一頭牛。' }],
    steps: [{ k: 'find', x: 1600, y: 6600, d: '去毒林找巫醫的徒弟', t: '小徒弟爬在樹上，底下圍著一圈毒蟾，鼓著肚子朝他噴氣。' }, { k: 'kill', type: 'toad', n: 4, d: '趕走 4 隻毒蟾' },
      { k: 'talk', npc: 'wuyi', d: '把徒弟帶回巫醫竹樓', lines: [{ who: 'wuyi', t: '回來就好、回來就好！……還敢不敢一個人亂跑了？這兩顆避毒丹拿去，算老婆子謝你。' }] }],
    reward: { silver: 350, pill: { bidu: 2 } } },
  { id: 'm_jars', region: 'miao', n: '蠱罐', kind: '善惡', giver: 'zhaizhu', need: s => !!s.ch2,
    offer: [{ who: 'zhaizhu', t: '蠱蟲窩裡的蠱罐，寨裡的老人說要燒掉；可巫醫說蠱罐能入藥救人。你先把它們砸開。' }],
    steps: [{ k: 'kill', type: 'gujar', n: 3, d: '砸開 3 個蠱罐' },
      { k: 'choice', npc: 'zhaizhu', d: '回五毒寨，決定蠱罐的去處', lines: [{ who: 'zhaizhu', t: '碎罐子你帶回來了。燒，還是留給寨子？' }],
        opts: [{ label: '燒掉，免得再有人拿來害人（俠義 +8）', karma: 8, after: [{ who: 'zhaizhu', t: '……也好。燒乾淨了，就不會有人惦記。' }] },
          { label: '留給五毒寨入藥（五毒寨聲望 +15）', karma: -3, rep: { wudu: 15 }, reward: { guwang: 1 }, after: [{ who: 'zhaizhu', t: '好！五毒寨記你一份情。這隻蠱王，你收著。' }] }] }],
    reward: { silver: 300 } },
  // ── 東海 ──
  { id: 'd2_crane', region: 'sea', n: '白鶴信使・二', kind: '連環', chain: 'crane', after: 'd1_crane', giver: 'laochuanfu', need: s => !!s.ch2,
    offer: [{ who: 'laochuanfu', t: '這記號……是我們漁幫送信用的。這封信是從走私船上寄出去的，海盜那邊應該有人知道收信的是誰。' }],
    steps: [{ k: 'kill', type: 'pirate', n: 8, d: '打倒 8 名海盜，逼問消息' }, { k: 'find', place: 'smuggle_ship', d: '去南邊擱淺的走私船翻航海日誌', t: '日誌最後一頁寫著：「寄信者，古城茶樓。收信者，崑崙雲鶴門下。」' },
      { k: 'talk', npc: 'laochuanfu', d: '回碼頭告訴老船夫', lines: [{ who: 'laochuanfu', t: '古城茶樓？那裡的說書人什麼都知道。去中原問他吧。' }] }],
    reward: { silver: 400, shachi: 1 } },
  { id: 'e_pearl', region: 'sea', n: '小妹的珍珠', kind: '人物', giver: 'yubang', need: s => !!s.ch2,
    offer: [{ who: 'yubang', t: '漁村的小妹哭了一整天，她娘留下的珍珠被礁岩蟹夾走了。我們的人一靠近就被夾。' }],
    steps: [{ k: 'kill', type: 'crab', n: 6, d: '打倒 6 隻礁岩蟹，找回珍珠' }, { k: 'talk', npc: 'yubang', d: '把珍珠交給漁幫幫主', lines: [{ who: 'yubang', t: '小妹笑了。……這是漁幫的一點心意，別推辭。' }] }],
    reward: { silver: 400, rep: { fishers: 10 } } },
  { id: 'e_map', region: 'sea', n: '沉船寶圖', kind: '探索', giver: 'yubang', need: s => !!s.ch2,
    offer: [{ who: 'yubang', t: '漁網撈上來半張寶圖，畫的是海岸邊一塊鯨骨形的石頭。我們不敢去，聽說那裡有水鬼守著。' }],
    steps: [{ k: 'find', x: 5000, y: 6300, d: '照著寶圖找鯨骨石', t: '鯨骨石下的沙子是鬆的──沙裡忽然冒出一個黑影！' }, { k: 'elite', x: 5000, y: 6300, type: 'water_ghost', d: '打倒守寶的水鬼' },
      { k: 'find', x: 5000, y: 6300, d: '挖開鯨骨石下的沙', t: '沙底埋著一口小鐵箱，裡面是發亮的銀錠和一塊奇怪的礦石。' }],
    reward: { silver: 800, rare: 1, page: 3 } },
  // ── 中原古城 ──
  { id: 'd3_crane', region: 'zhong', n: '白鶴信使・三', kind: '連環', chain: 'crane', after: 'd2_crane', giver: 'zhangbanxia', need: s => !!s.ch2,
    offer: [{ who: 'zhangbanxia', t: '那封信？寫信的是茶樓的抄書先生。三個月前，他被黑市的打手拖走，再也沒回來。' }],
    steps: [{ k: 'kill', type: 'thug', n: 8, d: '打倒 8 名黑市打手，問出抄書先生的下落' },
      { k: 'talk', npc: 'huiguan', d: '去正派會館打聽', lines: [{ who: 'huiguan', t: '抄書先生……他最後一次來，說要把一封信送給崑崙雲鶴真人的徒弟。那個徒弟，三年前就死了。' }] }],
    reward: { silver: 500 } },
  { id: 'z_debt', region: 'zhong', n: '賭債', kind: '人物', giver: 'gambler', need: s => !!s.ch2,
    offer: [{ who: 'gambler', t: '有個賭鬼欠了我五百兩，拿女兒抵債。嘿，客官要是替他還，人你帶走。' }],
    steps: [{ k: 'give', npc: 'gambler', res: 'silver', n: 500, d: '替賭鬼還五百兩賭債' }],
    done: [{ who: 'gambler', t: '爽快！小姑娘，跟恩人走吧。' }, { who: 'narr', t: '小姑娘朝你深深一拜，跑回了城外的家。後來聽說，她爹再也沒進過賭坊。' }], reward: { karma: 8, page: 3 } },
  { id: 'z_fakemed', region: 'zhong', n: '假藥', kind: '善惡', giver: 'huiguan', need: s => !!s.ch2,
    offer: [{ who: 'huiguan', t: '城裡有人賣假藥，吃死了兩個孩子。賣藥的把貨藏在城西的破屋裡。' }],
    steps: [{ k: 'choice', x: 8400, y: 4400, d: '去城西的破屋', lines: [{ who: 'narr', t: '破屋裡堆滿了藥瓶。賣藥的胖子跪在地上：「大俠饒命！這一半的錢分你，咱們就當沒見過！」' }],
      opts: [{ label: '押他去會館，把假藥全燒了（俠義 +8）', karma: 8, rep: { righteous: 10 }, after: [{ who: 'huiguan', t: '城裡的百姓，會記住你的。' }] },
        { label: '收下那一半的錢（魔性 +8）', karma: -8, reward: { silver: 700 }, after: [{ who: 'narr', t: '你把銀票揣進懷裡。走出破屋時，街角有個孩子在咳嗽。' }] }] }],
    reward: { page: 2 } },
  // ── 崑崙山 ──
  { id: 'd4_crane', region: 'kunlun', n: '白鶴信使・四', kind: '連環', chain: 'crane', after: 'd3_crane', giver: 'guanzhu', need: s => !!s.ch2,
    offer: [{ who: 'guanzhu', t: '雲鶴師兄的徒弟……他叫白羽。三年前查真君的丹爐，被發現了。他的墳在西邊的古松洞口。' }],
    steps: [{ k: 'find', place: 'pine_cave', d: '去古松洞口找白羽的墳', t: '松樹下有一座無字的小墳。你把那封泡爛了一半的信，壓在墳前的石頭下。' },
      { k: 'talk', npc: 'guanzhu', d: '回道觀告訴觀主', lines: [{ who: 'guanzhu', t: '信終於送到了。……白羽留下一套步法，他說等哪天有人替他把信送到，就傳給那個人。' }] }],
    reward: { book: 'heying', silver: 600 } },
  { id: 'k_feather', region: 'kunlun', n: '掃帚上的羽毛', kind: '收集', giver: 'saodi', need: s => !!s.ch2,
    offer: [{ who: 'saodi', t: '掃帚禿了。仙鶴羽紮的掃帚，掃得最乾淨。' }],
    steps: [{ k: 'give', npc: 'saodi', res: 'xianhe', n: 3, d: '交給掃地道人仙鶴羽 3 根' }],
    done: [{ who: 'saodi', t: '好掃帚。……貧道沒什麼好給的，這幾頁殘經，你拿去。' }], reward: { silver: 500, page: 6 } },
  { id: 'k_chess', region: 'kunlun', n: '失落的棋子', kind: '探索', giver: 'crane_old', need: s => !!s.ch2,
    offer: [{ who: 'crane_old', t: '老頭子的三顆白子，被雲猿偷去玩，丟得滿山都是。找回來，老頭子請你吃人參。' }],
    steps: [{ k: 'find', x: 8150, y: 800, d: '在雲海崖附近找第一顆白子', t: '雲縫裡卡著一顆溫潤的白子。' }, { k: 'find', x: 9450, y: 1650, d: '在傀儡殿附近找第二顆白子', t: '傀儡殿的台階上，滾著第二顆白子。' },
      { k: 'find', x: 10180, y: 1250, d: '在道觀東邊的山崖找第三顆白子', t: '崖邊的雪裡，第三顆白子閃著光。' }, { k: 'talk', npc: 'crane_old', d: '把三顆白子還給仙鶴老人', lines: [{ who: 'crane_old', t: '齊了！這盤棋，又能下了。人參拿去，補補。' }] }],
    reward: { silver: 400, renshen: 3 } },
];
const SIDE_BY = {}; SIDE.forEach(q => SIDE_BY[q.id] = q);

/* ---------- 狀態 ---------- */
function sideSt(id) { S.side = S.side || {}; return S.side[id]; }
function sideActive() { S.side = S.side || {}; return SIDE.filter(q => S.side[q.id] && !S.side[q.id].done); }
function sideAvail(q) { if (sideSt(q.id) || !regionOpen(q.region)) return false; if (q.after && !(sideSt(q.after) || {}).done) return false; if (q.need && !q.need(S)) return false; if (['miao', 'sea', 'zhong', 'kunlun'].includes(q.region) && !S.ch2) return false; return true; }
function sideStep(q) { const st = sideSt(q.id); return st && !st.done ? q.steps[st.s] : null; }
function sideTargetOf(q, s) { s = s || sideStep(q); if (!s) return null;
  if (s.k === 'talk' || s.k === 'give' || (s.k === 'choice' && s.npc)) return giverPos(s.npc);
  if (s.place) return PLACES[s.place] || CAMPS[s.place]; if (s.x !== undefined) return { x: s.x, y: s.y }; if (s.k === 'clear') return CAMPS[s.camp];
  if (s.k === 'kill') { let bd = 1e9, t = null; for (const c of Object.values(CAMPS)) { if (!c.types.includes(s.type) || c.region === 'secret' || !regionOpen(c.region) || c.inner && !S.cultOpen) continue; const d = dist(P, c); if (d < bd) { bd = d; t = c; } } return t; } return null; }
function giverPos(npc) { const k = Object.keys(PLACES).find(k => PLACES[k].npc === npc); return k ? PLACES[k] : null; }
function sideAdvance(q) { const st = sideSt(q.id); st.s++; st.n = 0; if (st.s >= q.steps.length) return sideFinish(q); const s = q.steps[st.s]; toast(`支線「${q.n}」：${s.d}`); saveGame(); }
function sideFinish(q) { const st = sideSt(q.id); st.done = true; const fin = () => { sideReward(q.reward); toast(`支線完成：${q.n}`, 'red'); sfx('quest'); saveGame(); }; if (q.done) say(q.done, fin); else fin(); }
function sideReward(r) { if (!r) return; const R = Object.assign({}, r);
  if (R.karma) { addKarma(R.karma); delete R.karma; } if (R.potion) { S.potions = Math.min(POT_MAX[Math.max(1, S.bld.herbal)] || 99, S.potions + R.potion); toast(`金創藥 +${R.potion}`); delete R.potion; }
  if (R.pill) { for (const k in R.pill) S.pills[k] = (S.pills[k] || 0) + R.pill[k]; toast(`${Object.keys(R.pill).map(k => PILLS[k].n + ' +' + R.pill[k]).join('、')}`); delete R.pill; }
  if (R.rare) { gainRes(pick(RARE_ORES.filter(k => k !== 'xianhe')), R.rare); delete R.rare; }
  if (R.silver && R.silver < 0) { S.res.silver = Math.max(0, S.res.silver + R.silver); delete R.silver; }
  if (R.book && S.books[R.book]) { gainRes('page', 10); delete R.book; } giveReward(R); }
function sideAccept(q) { S.side = S.side || {}; S.side[q.id] = { s: 0, n: 0 }; toast(`接下支線「${q.n}」：${q.steps[0].d}`, 'red'); sfx('quest'); saveGame(); }
function runSideChoice(q, s) {
  say((s.lines || []).concat([{ who: 'choice', t: '你要怎麼做？', choices: s.opts.map(o => ({ label: o.label, alt: o.alt, fn: () => { if (o.karma) addKarma(o.karma); if (o.rep) addRep(o.rep); if (o.silver) S.res.silver = Math.max(0, S.res.silver + o.silver); if (o.reward) sideReward(o.reward); sideSt(q.id).choice = o.label; say(o.after || [], () => sideAdvance(q)); } })) }]));
}

/* ---------- 找人說話 ---------- */
function sideTalk(npc) {
  // 進行中、這一步就在這個人身上
  for (const q of sideActive()) { const s = sideStep(q); if (!s) continue;
    if (s.k === 'talk' && s.npc === npc) { say(s.lines || [], () => sideAdvance(q)); return true; }
    if (s.k === 'give' && s.npc === npc) { const have = S.res[s.res] || 0, nm = RES[s.res].n;
      if (have < s.n) { say([{ who: npc, t: `${nm}還不夠呢。（需要 ${s.n}，你有 ${have}）` }]); return true; }
      say([{ who: 'choice', t: `交出${nm} ${s.n}？`, choices: [{ label: '交出', fn: () => { S.res[s.res] -= s.n; sideAdvance(q); } }, { label: '再等等', alt: true, fn: () => { } }] }]); return true; }
    if (s.k === 'choice' && s.npc === npc) { runSideChoice(q, s); return true; } }
  // 可以接的新支線
  S.sideSnooze = S.sideSnooze || {};
  const q = SIDE.find(q => q.giver === npc && sideAvail(q) && !(Date.now() - (S.sideSnooze[q.id] || 0) < 90000));
  if (q) { say(q.offer.concat([{ who: 'choice', t: `支線・${q.kind}「${q.n}」`, choices: [{ label: '接下', fn: () => sideAccept(q) }, { label: '改天再說', alt: true, fn: () => { S.sideSnooze[q.id] = Date.now(); } }] }])); return true; }
  return false;
}
const _questTalkSide = questTalk; questTalk = function (npc) { if (_questTalkSide(npc)) return true; return sideTalk(npc); };

/* ---------- 每幀：找東西、到地點、精英現身 ---------- */
let sideT = 0;
function tickSide(dt) { if (!S || dlg || PAUSE_STORY || BOSSFIGHT) return; sideT -= dt; if (sideT > 0) return; sideT = .25;
  for (const q of sideActive()) { const s = sideStep(q); if (!s) continue; const T = sideTargetOf(q, s); if (!T) continue; const d = dist(P, T);
    if (s.k === 'find' && d < 110) { burst(T.x, T.y, GOLD, 14); sfx('learn'); say([{ who: 'narr', t: s.t }], () => sideAdvance(q)); return; }
    if (s.k === 'reach' && d < 140) { sideAdvance(q); return; }
    if (s.k === 'choice' && !s.npc && d < 140) { runSideChoice(q, s); return; }
    if (s.k === 'elite' && d < 360) { const tag = 'side_' + q.id; if (!E.some(e => e.tag === tag && !e.dead)) { if (sideSt(q.id).spawned) { sideSt(q.id).spawned = false; sideAdvance(q); return; } const e = spawnEnemy(s.type, T.x, T.y - 40, null, { elite: true }); e.tag = tag; e.aggro = true; e.surfaced = true; e.ghost = false; sideSt(q.id).spawned = true; toast('有東西衝出來了！'); } } } }
const _killEnemySide = killEnemy; killEnemy = function (e) { _killEnemySide(e);
  for (const q of sideActive()) { const s = sideStep(q); if (!s) continue; if (s.k === 'kill' && e.type === s.type) { const st = sideSt(q.id); st.n = (st.n || 0) + 1; if (st.n >= s.n) sideAdvance(q); else if (st.n % 2 === 0 || st.n === 1) toast(`支線「${q.n}」：${st.n}/${s.n}`); }
    if (s.k === 'elite' && e.tag === 'side_' + q.id) { sideSt(q.id).spawned = false; sideAdvance(q); } } };
const _questClearSide = questClear; questClear = function (camp) { _questClearSide(camp); for (const q of sideActive()) { const s = sideStep(q); if (s && s.k === 'clear' && s.camp === camp) sideAdvance(q); } };
// 主線要清的據點會立刻重生；支線要清的據點也一樣
const _tickCh2Side = tickCh2; tickCh2 = function (dt) { _tickCh2Side(dt); tickSide(dt); for (const q of sideActive()) { const s = sideStep(q); if (s && s.k === 'clear' && S.camps[s.camp] && !S.camps[s.camp].spawned && !sideSt(q.id).reset) { sideSt(q.id).reset = true; S.camps[s.camp].cleared = 0; } } };

/* ---------- 地圖標記、互動 ---------- */
function sideTargets(add) {
  for (const q of sideActive()) { const T = sideTargetOf(q); if (T) add(T, '#33536a', '支線', true); }
}
const _ch3InteractSide = ch3Interact; ch3Interact = function (c, pp) { _ch3InteractSide(c, pp);
  for (const k of ['bamboo_hermit', 'pilgrim']) { const p = pp(k); if (!placeVisible(k, p)) continue; c(p.x, p.y, 100, `與${NPCS[p.npc].n}交談`, () => { if (questTalk(p.npc)) return; say([{ who: p.npc, t: k === 'pilgrim' ? '血影教的人……還在找我。' : '竹子砍不完，日子也過不完。' }]); }, '交談'); } };
function sideMarkFor(npc) { if (sideActive().some(q => { const s = sideStep(q); return s && s.npc === npc && (s.k === 'talk' || s.k === 'give' || s.k === 'choice'); })) return '…'; return SIDE.some(q => q.giver === npc && sideAvail(q)) ? '？' : null; }
const _drawCh2TopSide = drawCh2Top; drawCh2Top = function (vis) { _drawCh2TopSide(vis);
  const done = new Set(); for (const k in PLACES) { const p = PLACES[k]; if (!p.npc || done.has(p.npc) || !vis(p.x, p.y, 200)) continue; done.add(p.npc); if (!placeVisible(k, p) || stepIs('talk', 'npc', p.npc)) continue; const m = sideMarkFor(p.npc); if (!m) continue;
    g.fillStyle = '#33536a'; g.font = `bold 22px ${FONT}`; g.textAlign = 'center'; g.fillText(m, p.x + 26, p.y - 74 + Math.sin(gameT * 4 + 1) * 3); }
  for (const q of sideActive()) { const s = sideStep(q); if (!s || !(s.k === 'find' || s.k === 'elite' || (s.k === 'choice' && !s.npc) || s.k === 'reach')) continue; const T = sideTargetOf(q, s); if (!T || !vis(T.x, T.y)) continue;
    g.strokeStyle = `rgba(51,83,106,${.5 + Math.sin(gameT * 5) * .3})`; g.lineWidth = 2; g.beginPath(); g.ellipse(T.x, T.y, 40, 18, 0, 0, TAU); g.stroke(); if (s.k === 'find') { g.fillStyle = '#c9a24a'; for (let i = 0; i < 3; i++) { const a = gameT * 3 + i * 2.1; g.fillRect(T.x + Math.cos(a) * 18 - 2, T.y - 14 + Math.sin(a) * 8 - 2, 4, 4); } } }
};
// 角色面板「支線」
TABS.char.tabs.splice(4, 0, ['side', '支線']);
PANELS['char.side'] = () => { const act = sideActive(), av = SIDE.filter(sideAvail), dn = SIDE.filter(q => (sideSt(q.id) || {}).done);
  let h = `<p class="note">支線 ${dn.length}/${SIDE.length}。頭上有藍色「？」的人有事相求，藍色「…」表示支線要找他。地圖上的藍圈是支線目標。</p>`;
  h += `<div class="sub">進行中</div>` + (act.length ? act.map(q => { const s = sideStep(q), st = sideSt(q.id); return item(`${q.n}`, `${REGIONS[q.region].short}・${q.kind}`, `${s.d}${s.k === 'kill' ? `（${st.n || 0}/${s.n}）` : ''}`, '', ''); }).join('') : '<p class="note">沒有進行中的支線。</p>');
  h += `<div class="sub">可以接的</div>` + (av.length ? av.map(q => item(q.n, `${REGIONS[q.region].short}・${q.kind}`, `找${NPCS[q.giver].n}`, '', '')).join('') : '<p class="note">暫時沒有，去別的地方看看。</p>');
  if (dn.length) h += `<div class="sub">已完成</div><p class="note">${dn.map(q => q.n + (sideSt(q.id).choice ? `（${sideSt(q.id).choice.replace(/（.*）/, '')}）` : '')).join('、')}</p>`;
  return h; };
// 成就
ACHIEVEMENTS.push(
  { id: 'side9', cat: 'story', n: '路見不平', d: '完成 9 條支線', test: s => s.side && Object.values(s.side).filter(x => x.done).length >= 9 },
  { id: 'side27', cat: 'story', n: '江湖百事通', d: '完成全部 27 條支線', test: s => s.side && SIDE.every(q => s.side[q.id] && s.side[q.id].done), title: '江湖百事通', bonus: { drop: 0.05 } },
  { id: 'sidesword', cat: 'book', n: '殘劍重圓', d: '集齊五頁《殘劍九式》', test: s => !!(s.side && s.side.c5_sword && s.side.c5_sword.done) },
  { id: 'sidecrane', cat: 'story', n: '鶴書已達', d: '把白鶴的信送到', test: s => !!(s.side && s.side.d4_crane && s.side.d4_crane.done) },
);
