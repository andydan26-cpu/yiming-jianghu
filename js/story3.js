'use strict';
/* 一命江湖 2b — 知己後半（表白、合擊）、終章、五種結局（文字） */

/* ---------- 知己 ---------- */
BOND_NEED.push(70, 78, 86, 93, 100);
Object.assign(BONDS, {
  yushuang: { n: '林語霜', g: 'm', home: 'lin_home', likes: ['silver', 'cloth'], line: '劍不是用來嚇人的。', unlock: s => !!(s.bond && s.bond.lin),
    ev: [
      [{ who: 'yushuang', t: '你就是那個在宴席上……不對，你還沒去過宴席。你就是爹爹常提的那個青崖弟子？' }, { who: 'yushuang', t: '我叫林語霜。爹爹說女孩子不該拿劍，所以我偷偷練。' }, { who: 'choice', t: '', choices: [{ label: '「那我們比一場？」', b: 7, after: [{ who: 'yushuang', t: '好啊！輸了可別哭。' }] }, { label: '「盟主說得對。」', b: 1, alt: true, after: [{ who: 'yushuang', t: '……你跟他們都一樣。' }] }] }],
      [{ who: 'yushuang', t: '會館的人都怕我，說我是盟主的女兒。只有茶樓的張半瞎敢罵我。' }, { who: 'choice', t: '她把一碗涼掉的茶推給你。', choices: [{ label: '「那我也罵你兩句？」', b: 8, after: [{ who: 'yushuang', t: '哈哈哈……你這人真奇怪。' }] }, { label: '恭敬地喝完茶', b: 3, alt: true, after: [{ who: 'yushuang', t: '……又一個怕我的。' }] }] }],
      [{ who: 'narr', t: '夜裡，林語霜一個人坐在別院的屋簷上，手裡捏著一封信。' }, { who: 'yushuang', t: '這是我娘留下的。她說爹爹年輕的時候，跟兩個兄弟去過崑崙，回來就變了一個人。' }, { who: 'choice', t: '', choices: [{ label: '坐到她身邊，陪她看月亮', b: 10, after: [{ who: 'narr', t: '她沒說話，把信折好，靠著你的肩膀坐到天亮。' }] }, { label: '「信裡還寫了什麼？」', b: 4, alt: true, after: [{ who: 'yushuang', t: '……沒什麼。別問了。' }] }] }],
      [{ who: 'yushuang', t: '我做了一個劍穗，本來要給爹爹的。他看都沒看。……送你吧。' }, { who: 'choice', t: '', choices: [{ label: '當場繫在劍上', b: 9, after: [{ who: 'yushuang', t: '……嗯，比在爹爹那裡好看。' }] }, { label: '「盟主會不高興吧？」', b: 3, alt: true, after: [{ who: 'yushuang', t: '他從來沒高興過。' }] }] }],
      [{ who: 'yushuang', t: '如果有一天，我爹爹做了錯事……你會殺他嗎？' }, { who: 'choice', t: '林語霜握著劍，指節發白。', choices: [{ label: '「我會先問你。」', b: 10, after: [{ who: 'yushuang', t: '……謝謝你。至少你會先問我。' }] }, { label: '「錯了就是錯了。」', b: 5, alt: true, after: [{ who: 'yushuang', t: '你說得對。可是……他是我爹。' }] }] }],
    ] },
  jinghong: { n: '林驚鴻', g: 'f', home: 'lin_home', likes: ['iron', 'silver'], line: '驚鴻一瞥，夠了。', unlock: s => !!(s.bond && s.bond.lin),
    ev: [
      [{ who: 'jinghong', t: '姑娘也是來登記的？……抱歉，我以為又是哪派送來說親的。' }, { who: 'jinghong', t: '在下林驚鴻。家父是盟主，所以我每天都在婉拒別人家的女兒。' }, { who: 'choice', t: '', choices: [{ label: '「放心，我是來打架的。」', b: 8, after: [{ who: 'jinghong', t: '哈！那就好。……跟我打一場？' }] }, { label: '「盟主公子果然架子大。」', b: 2, alt: true, after: [{ who: 'jinghong', t: '……抱歉。是我失禮了。' }] }] }],
      [{ who: 'jinghong', t: '家父教我的劍，叫驚鴻劍。他說劍要快，快到別人看不見，就不會有人問你殺了誰。' }, { who: 'choice', t: '他說這句話的時候，沒有笑。', choices: [{ label: '「劍慢一點，也沒關係。」', b: 8, after: [{ who: 'jinghong', t: '……從來沒人這樣跟我說過。' }] }, { label: '「那你殺過誰？」', b: 3, alt: true, after: [{ who: 'jinghong', t: '還沒有。我怕有一天，家父會讓我去。' }] }] }],
      [{ who: 'narr', t: '你在別院的練武場找到林驚鴻。他一身是傷，劍丟在一邊。' }, { who: 'jinghong', t: '家父讓我去抓一個苗疆的老人。我放走了她。這是……家法。' }, { who: 'choice', t: '', choices: [{ label: '替他上藥', b: 10, after: [{ who: 'narr', t: '你替他包紮的時候，他一直看著你，一句話也沒說。' }] }, { label: '「你做得對。」', b: 6, alt: true, after: [{ who: 'jinghong', t: '我知道。……可是好痛。' }] }] }],
      [{ who: 'jinghong', t: '這是我第一次自己挑的東西。古城最好的工匠打的髮簪。……別誤會，我只是覺得適合你。' }, { who: 'choice', t: '', choices: [{ label: '請他替你戴上', b: 9, after: [{ who: 'narr', t: '他的手有點抖，簪子戴了三次才戴好。' }] }, { label: '收下道謝', b: 4, alt: true, after: [{ who: 'jinghong', t: '……嗯。' }] }] }],
      [{ who: 'jinghong', t: '如果家父真的是那個人……我會站在你這邊。可我還是會難過。' }, { who: 'choice', t: '', choices: [{ label: '「難過的時候，我陪你。」', b: 10, after: [{ who: 'jinghong', t: '……說好了。' }] }, { label: '「那就別難過。」', b: 4, alt: true, after: [{ who: 'jinghong', t: '你說得真容易。' }] }] }],
    ] },
});
// 表白（第 6 段）與之後的故事（第 7–10 段，只有結為知己的人才有）
const CONFESS = {
  langu: [{ who: 'langu', t: '我煉好了解蠱的藥。……可是我發現，我中了另一種蠱，解不了。' }, { who: 'langu', t: '你別笑。苗疆的姑娘說出口的話，是不收回的。我要你留在我身邊。' }],
  suxin: [{ who: 'suxin', t: '你的劍穗上，那個多出來的結……我說是編錯了。其實沒有。' }, { who: 'suxin', t: '青崖的規矩，結穗是許諾。我想跟緊你──不是師姐跟師弟那種。' }],
  yushuang: [{ who: 'yushuang', t: '我不想再當誰的女兒了。我想當你的……你的什麼都好。' }, { who: 'yushuang', t: '你願意的話，就把我做的劍穗一直繫著。' }],
  changfeng: [{ who: 'changfeng', t: '師妹，我練了一晚上的話，現在全忘了。……我只記得一句。' }, { who: 'changfeng', t: '以後不管去哪裡，有師兄在。不對──有我在。' }],
  liu: [{ who: 'liu', t: '我欠你兩條命。我想了很久，怎麼還都還不清。' }, { who: 'liu', t: '那就……不還了。我把剩下的命，都給你。' }],
  jinghong: [{ who: 'jinghong', t: '家父教我劍要快，快到別人看不見。可我對你說這句話，想說得慢一點。' }, { who: 'jinghong', t: '我喜歡你。不是盟主的兒子喜歡，是林驚鴻喜歡。' }],
};
const BOND_LATE = {
  langu: [
    [{ who: 'langu', t: '我師父的消息……我在崑崙的傀儡殿裡找到了她的銀鐲。' }, { who: 'choice', t: '藍姑把銀鐲握得很緊。', choices: [{ label: '抱住她', b: 8, after: [{ who: 'narr', t: '她在你懷裡哭了很久，哭完了，把銀鐲戴在你手上。' }] }, { label: '「我替她報仇。」', b: 5, alt: true, after: [{ who: 'langu', t: '……一起去。' }] }] }],
    [{ who: 'langu', t: '你教我青崖的茶，我教你苗疆的蠱。換不換？' }, { who: 'choice', t: '', choices: [{ label: '「換。」', b: 8, after: [{ who: 'langu', t: '第一課：蠱跟茶一樣，要等。' }] }, { label: '「我怕蟲。」', b: 4, alt: true, after: [{ who: 'langu', t: '你怕蟲？哈哈哈哈！' }] }] }],
    [{ who: 'langu', t: '等江湖的事了了，你跟我回隱谷吧。谷裡的毒霧，我會替你散掉一半。' }, { who: 'choice', t: '', choices: [{ label: '「一半就夠了。」', b: 8, after: [{ who: 'langu', t: '……傻子。' }] }, { label: '「青崖山也很好。」', b: 6, alt: true, after: [{ who: 'langu', t: '那就兩邊住。我不挑。' }] }] }],
    [{ who: 'langu', t: '我把我們兩個的蠱，煉成了一對。你一隻，我一隻。……打架的時候，叫牠們一起出來。' }, { who: 'narr', t: '藍姑把她的雙蠱連環，一招一招教給了你。' }],
  ],
  suxin: [
    [{ who: 'suxin', t: '我去見師父了。他給我泡了一壺茶，這次我喝了。' }, { who: 'choice', t: '', choices: [{ label: '「茶好喝嗎？」', b: 8, after: [{ who: 'suxin', t: '……跟十年前一樣苦。' }] }, { label: '握住她的手', b: 8, after: [{ who: 'narr', t: '她的手很冰，慢慢地暖了起來。' }] }] }],
    [{ who: 'suxin', t: '小時候師兄常把我的劍藏起來。現在換我藏你的。' }, { who: 'choice', t: '', choices: [{ label: '「那我就跟著劍走。」', b: 8, after: [{ who: 'suxin', t: '……油嘴滑舌。' }] }, { label: '去找師兄告狀', b: 4, alt: true, after: [{ who: 'changfeng', t: '你們兩個，饒了我吧。' }] }] }],
    [{ who: 'suxin', t: '等這一切結束，我想在青崖山上開一間小小的學堂。教孩子們練劍、認字。' }, { who: 'choice', t: '', choices: [{ label: '「我來教劍，你來教字。」', b: 8, after: [{ who: 'suxin', t: '好。說好了。' }] }, { label: '「我只會教打架。」', b: 5, alt: true, after: [{ who: 'suxin', t: '那就教打架。' }] }] }],
    [{ who: 'suxin', t: '青崖雙劍，本來是師父為我跟師兄創的。……現在，我想跟你練。' }, { who: 'narr', t: '師姐把青崖雙劍的最後一式教給了你。兩把劍，像兩片並在一起的青葉。' }],
  ],
  yushuang: [
    [{ who: 'yushuang', t: '我把娘的信拿給爹爹看了。他看完，一個人坐了整夜。' }, { who: 'choice', t: '', choices: [{ label: '陪她等天亮', b: 8, after: [{ who: 'narr', t: '天亮時，盟主府的大門開了一條縫，又關上了。' }] }, { label: '「他後悔了嗎？」', b: 5, alt: true, after: [{ who: 'yushuang', t: '我不知道。他從來不後悔的。' }] }] }],
    [{ who: 'yushuang', t: '我偷偷去擂台打了一場，贏了！可惜沒人知道是我。' }, { who: 'choice', t: '', choices: [{ label: '「我知道。」', b: 8, after: [{ who: 'yushuang', t: '……嗯，這樣就夠了。' }] }, { label: '「下次叫我去看。」', b: 6, alt: true, after: [{ who: 'yushuang', t: '你來的話，我會緊張的。' }] }] }],
    [{ who: 'yushuang', t: '等事情結束，我想離開古城。去青崖也好，去哪裡都好。' }, { who: 'choice', t: '', choices: [{ label: '「青崖山的茶，很好喝。」', b: 8, after: [{ who: 'yushuang', t: '那我要喝一輩子。' }] }, { label: '「盟主府呢？」', b: 4, alt: true, after: [{ who: 'yushuang', t: '那裡從來不是家。' }] }] }],
    [{ who: 'yushuang', t: '爹爹的驚鴻劍，太快了，快到沒有人情。我改了一點，慢下來，讓兩個人一起出劍。' }, { who: 'narr', t: '林語霜把她改過的驚鴻照影教給了你。' }],
  ],
  changfeng: [
    [{ who: 'changfeng', t: '我跟師父喝了一壺酒。他說，我長得越來越像他年輕的時候。……我不知道該高興還是難過。' }, { who: 'choice', t: '', choices: [{ label: '「你比他好。」', b: 8, after: [{ who: 'changfeng', t: '……謝謝你。' }] }, { label: '陪他再喝一壺', b: 8, after: [{ who: 'narr', t: '那天晚上，師兄醉得一塌糊塗，嘴裡一直念著你的名字。' }] }] }],
    [{ who: 'changfeng', t: '師妹，你的劍法是我見過最好看的。……我是說，最好看的劍法。' }, { who: 'choice', t: '', choices: [{ label: '「你臉紅了。」', b: 8, after: [{ who: 'changfeng', t: '山上風大！' }] }, { label: '「謝謝師兄。」', b: 4, alt: true, after: [{ who: 'changfeng', t: '……嗯。' }] }] }],
    [{ who: 'changfeng', t: '等打完了，我想帶你去東海看日出。素心說，那是她見過最美的東西。' }, { who: 'choice', t: '', choices: [{ label: '「一言為定。」', b: 8, after: [{ who: 'changfeng', t: '哈哈！一言為定！' }] }, { label: '「青崖的日出也很美。」', b: 6, alt: true, after: [{ who: 'changfeng', t: '那就兩個都看。' }] }] }],
    [{ who: 'changfeng', t: '青崖雙劍，一個人使是一招，兩個人使才是一套。……師妹，跟我練吧。' }, { who: 'narr', t: '師兄把青崖雙劍的另一半，一招一招放進你手裡。' }],
  ],
  liu: [
    [{ who: 'liu', t: '仙人的人還在追我。……以前我不怕死。現在怕了。' }, { who: 'choice', t: '', choices: [{ label: '「因為我？」', b: 8, after: [{ who: 'liu', t: '……嗯。' }] }, { label: '「有我在，你死不了。」', b: 8, after: [{ who: 'liu', t: '那就別讓我死。' }] }] }],
    [{ who: 'liu', t: '我在竹林裡種了一片新竹子。等長高了，就是我們的。' }, { who: 'choice', t: '', choices: [{ label: '「我等它們長高。」', b: 8, after: [{ who: 'liu', t: '要等三年。' }, { who: 'narr', t: '他說得很認真，好像三年是一件很快樂的事。' }] }, { label: '「竹子會開花嗎？」', b: 5, alt: true, after: [{ who: 'liu', t: '六十年一次。……陪我等。' }] }] }],
    [{ who: 'liu', t: '我想把斗笠摘了。以後不用再遮著臉活。' }, { who: 'choice', t: '他把斗笠遞給你。', choices: [{ label: '收下斗笠', b: 8, after: [{ who: 'narr', t: '他的臉在陽光下有點蒼白，眼睛卻很亮。' }] }, { label: '「戴著也好看。」', b: 5, alt: true, after: [{ who: 'liu', t: '……那就偶爾戴。' }] }] }],
    [{ who: 'liu', t: '竹影步讓人以為你在那裡。兩個人一起用，敵人就分不清哪個是真的。' }, { who: 'narr', t: '柳無痕把竹影雙殺教給了你。竹葉落下的時候，兩道影子同時出手。' }],
  ],
  jinghong: [
    [{ who: 'jinghong', t: '我跟家父吵了一架。第一次。……原來吵架是這種感覺。' }, { who: 'choice', t: '', choices: [{ label: '「感覺怎麼樣？」', b: 8, after: [{ who: 'jinghong', t: '很痛快。也很難過。' }] }, { label: '摸摸他的頭', b: 8, after: [{ who: 'jinghong', t: '……我不是小孩子。' }, { who: 'narr', t: '他嘴上這麼說，頭卻沒有躲。' }] }] }],
    [{ who: 'jinghong', t: '你吃不吃糖葫蘆？古城東街那家最好吃。……我小時候，從來沒被准許去吃。' }, { who: 'choice', t: '', choices: [{ label: '拉著他去東街', b: 8, after: [{ who: 'narr', t: '盟主公子站在街邊吃糖葫蘆，吃得滿嘴糖渣，笑得像個孩子。' }] }, { label: '「現在去也不晚。」', b: 6, alt: true, after: [{ who: 'jinghong', t: '那你陪我。' }] }] }],
    [{ who: 'jinghong', t: '等這一切結束，我想去青崖山。聽說那裡的茶很苦。' }, { who: 'choice', t: '', choices: [{ label: '「苦完了會甜。」', b: 8, after: [{ who: 'jinghong', t: '那我要喝到甜。' }] }, { label: '「你喝不慣的。」', b: 4, alt: true, after: [{ who: 'jinghong', t: '喝不慣也要喝。' }] }] }],
    [{ who: 'jinghong', t: '驚鴻劍是家父的，驚鴻照影是我自己的。一個人出劍，一個人照影。' }, { who: 'narr', t: '林驚鴻把驚鴻照影教給了你。兩道劍光，一前一後，像水面上的鴻影。' }],
  ],
};
const HEJI_OF = { langu: 'shuanggu', suxin: 'qingya_shuang', changfeng: 'qingya_shuang', yushuang: 'jinghong_ying', jinghong: 'jinghong_ying', liu: 'zhuying_sha' };

/* ---------- 終章：線索結算 ---------- */
const FINAL_INTRO = [
  { t: '四方平定', big: true },
  { t: '苗疆的蠱、東海的船、古城的帳、崑崙的傀儡──四條線，最後都繞回同一個地方。' },
  { t: '三十年前，三個結拜兄弟在崑崙寫下一本書。' },
];
const FINAL_POINT = {
  linxiao: [{ t: '金印、旗號、名冊……每一條線索的盡頭，都站著一個穿白衣、受萬人敬仰的人。' }, { t: '武林大會的擂台搭好了。他在台上等你。', big: false }],
  xuanxiao: [{ t: '松香、鶴羽、仙丹……每一條線索的盡頭，都飄著一朵雲。' }, { t: '雲海天台上，雷聲已經響了三天。' }],
  qingxu: [{ t: '茶經密語、手札、傀儡的遺言……每一條線索的盡頭，都是一壺溫著的茶。' }, { t: '青崖山頂，師父在等你。' }],
};
// 落選的黑手：線索次多的那位在終章出場
const RUNNER_LINES = {
  meng_help: '林嘯天帶著正派聯軍趕到：「今日之事，林某也有一份！」──他們會替你出手',
  meng_hurt: '林嘯天帶著正派聯軍趕到：「新魔頭也一併剿了！」──正派高手會攻擊你',
  xian: '一隻白鶴在天上盤旋：玄霄真君趁亂吸功──敵我的內力都會被吸走',
  shi_help: '師父的身影落在你身後：「徒兒，為師替你擋著。」──他會替你療傷',
  shi_hurt: '師父的身影落在場邊：「青崖不出魔頭。」──他會出手清理門戶',
};

/* ---------- 五種結局 ---------- */
const FINAL_FALL = {
  linxiao: { t: '武林盟主林嘯天倒在擂台上。台下各派的掌門，沒有一個人上前扶他。' },
  xuanxiao: { t: '雲海天台的雷聲停了。玄霄真君老成了一個普通的老人，坐在雲上，再也飛不起來。' },
  qingxu: { t: '青崖山頂的茶涼了。師父閉著眼睛，嘴角帶著一點笑。' },
};
const THIRD_FATE = {
  linxiao: '林嘯天的金印被各派掌門當眾砸碎，他自請卸下盟主之位，從此閉門不出。',
  xuanxiao: '玄霄真君沒等到飛昇的那一天。雲海天台上，只剩一座冷掉的丹爐。',
  qingxu: '師父回到青崖山，繼續種他的茶。來的人問起三十年前的事，他只說：「喝茶。」',
};
const ENDINGS = {
  tianren: { n: '天人合一', frames: [{ t: '你沒有殺他。' }, { t: '你把三十年前那本《血影真經》放在火上。三個結拜兄弟寫下的字，一個一個捲成了灰。' }, { t: '盟主、仙人、師父──三個人追的東西，其實是同一個：不想輸給時間，不想輸給彼此。' }, { t: '你看穿了這一點，於是不再有正邪。' }, { t: '青崖派從此不屬於任何一方。江湖有事，就有人上青崖山喝一碗茶，把話說清楚。' }] },
  gujian: { n: '孤劍', frames: [{ t: '黑手伏誅。' }, { t: '可是你回頭的時候，身後已經沒有人了。' }, { t: '落霞村成了一片灰，故人一個一個死在你沒趕上的地方。' }, { t: '你回到青崖山。小築還在，弟子們的房間空著，茶罐裡的茶葉早就發霉了。' }, { t: '你獨自守著一座空山，每天練劍，練到天黑。' }] },
  daxia: { n: '一代大俠', frames: [{ t: '各派掌門齊聚古城，推舉你為新的武林盟主。' }, { t: '你把盟主府的大門拆了，換成一扇誰都推得開的柴門。' }, { t: '苗疆的寨子、東海的漁村、崑崙的道觀，都掛上了青崖的劍穗。' }, { t: '說書人張半瞎在茶樓講你的故事，講到第三百回，還沒講完。' }, { t: '青崖派，名震天下。' }] },
  xinmo: { n: '新魔降世', frames: [{ t: '你站在倒下的人身上，接過了他的一切。' }, { t: '血影真經、仙人的丹爐、黑市的帳本……江湖上所有見不得光的東西，都歸了你。' }, { t: '三年後，江湖換了一個名字。這個名字比血影教更可怕。' }, { t: '說書人不敢說你的故事。孩子哭的時候，大人只要說出你的名字，孩子就不哭了。' }, { t: '你坐在青崖山頂，看著山下的燈一盞一盞熄滅。' }] },
  xiaoao: { n: '笑傲江湖', frames: [{ t: '你收起劍，沒有接盟主令，也沒有接任何人的東西。' }, { t: '正派說你太邪，魔道說你太正。你只是笑一笑。' }, { t: '你回到青崖山，修好小築，收了幾個徒弟，教他們練劍、泡茶。' }, { t: '江湖有江湖的事。你有你的茶。' }] },
};
// 知己的尾聲（依結局不同）
const EPILOGUE = {
  none: { tianren: '你一個人下山，一個人上山。山風很好，你不覺得寂寞。', gujian: '空山裡沒有回音。', daxia: '盟主府的燈每晚都亮著，只有你一個人。', xinmo: '沒有人敢站在你身邊。', xiaoao: '山上的日子很長，你學會了一個人喝完一壺茶。' },
  langu: { tianren: '藍姑把隱谷的毒霧散了一半，在谷口種了一片青崖的茶。', gujian: '藍姑替你擋下了最後一擊。她倒下的時候，手腕上的銀鐲還在響。', daxia: '藍姑成了苗疆與中原之間的使者，每次回青崖，都帶一簍會動的禮物。', xinmo: '藍姑留在你身邊。她說：「你變成什麼，我就是什麼。」', xiaoao: '你們兩邊住：春天在青崖喝茶，秋天在隱谷煉蠱。' },
  suxin: { tianren: '師姐在青崖山上開了學堂，你教劍，她教字。', gujian: '師姐倒在你懷裡，手裡還握著那條多編了一個結的劍穗。', daxia: '師姐成了青崖派的掌門夫人，管得你一壺酒都喝不到。', xinmo: '師姐看著你，很久很久，最後還是說：「跟緊我。」', xiaoao: '師姐每天清晨陪你練劍，練完了，一起去看師父的茶園。' },
  yushuang: { tianren: '林語霜離開了古城，在青崖山下開了一間劍館，只收女弟子。', gujian: '林語霜替你擋下了那一劍。她最後說的是：「這次……我自己選的。」', daxia: '林語霜成了盟主夫人，比當年的盟主更受人敬重。', xinmo: '林語霜燒掉了娘的信，走到你身邊：「我不想再當誰的女兒了。」', xiaoao: '林語霜每天替你泡茶，泡得比師父還苦。你喝得一滴不剩。' },
  changfeng: { tianren: '師兄帶你去東海看了日出，又帶你回青崖看了一次。', gujian: '師兄擋在你身前，最後一句話是：「有師兄在……」', daxia: '師兄成了你最得力的左右手，喝醉了就逢人說：「這是我師妹！」', xinmo: '師兄沒有走。他說：「我答應過，有我在。」', xiaoao: '師兄在小築後面搭了一座看日出的亭子，每天早上叫你起床。' },
  liu: { tianren: '竹林裡的新竹長高了。他摘下斗笠，在竹林裡給你蓋了一間小屋。', gujian: '柳無痕的竹影步，最後一次讓敵人以為他在那裡──他用自己換了你。', daxia: '柳無痕不肯當盟主的護衛，只肯當你一個人的影子。', xinmo: '柳無痕說：「我只會殺人。現在，我替你殺。」', xiaoao: '你們在翠竹林住下，等竹子開花。六十年，不算太久。' },
  jinghong: { tianren: '林驚鴻在青崖山上學會了泡茶，第一壺泡得比師父還苦。', gujian: '林驚鴻的驚鴻劍，最後一次快到誰都看不見──快到他自己也沒躲開。', daxia: '林驚鴻替你打理盟主府，閒的時候，拉你去東街吃糖葫蘆。', xinmo: '林驚鴻跟家父吵完最後一架，走到你身邊，再也沒有回頭。', xiaoao: '林驚鴻每天早上練劍，練完就纏著你去山下買糖葫蘆。' },
};
