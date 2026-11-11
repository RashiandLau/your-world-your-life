/* Original fictional dialogue. Each pilot country has lines for every moment. */
(function () {
  "use strict";
  var pilots = ["ind", "nga", "bra", "jpn", "usa", "egy", "idn", "mex", "eth", "deu"];
  var moments = ["school", "exam", "job", "marriage", "birth", "illness", "parentDeath", "migration", "retirement", "everyday"];
  // Paired editions are written as speech in their own language, not literal translations.
  // A named dish is a possible meal in this fictional home, never a national custom.
  var lines = {
    ind: {
      school: ["家で使う言葉と教室の言葉、違っても大丈夫。分からないところは聞いてね。", "If a classroom word is unfamiliar, ask me. We can work it out."],
      exam: ["試験が終わったら、家で{food}を食べよう。", "When the exam's over, there'll be {food} at home."],
      job: ["町への行き帰り、今日のうちに確かめておこう。", "Before your first shift ends, let's sort out the trip back from town."],
      marriage: ["集まる人数は二人で決めて。台所の支度なら手伝うよ。", "You two choose the guest list. I can help with the cooking."],
      birth: ["赤ちゃんを見てる間に、食事を用意しようか。", "I'll put a meal together while you sit with the baby."],
      illness: ["{food}を少し持っていこうか。食べたい物があれば言ってね。", "Would a little {food} be welcome, or is there something else you'd like?"],
      parentDeath: ["台所のことは任せて。来る人へのお茶も出しておくよ。", "I'll see to tea for the visitors. Stay with your family."],
      migration: ["町に着いて落ち着いたら、家にも知らせてね。", "Once you've found your feet in town, send word home."],
      retirement: ["明日は通勤しなくていいね。朝ごはん、ゆっくり食べよう。", "No journey to work tomorrow. Let's make breakfast last."],
      everyday: ["今夜は{food}にする？　ほかに食べたい物は？", "Shall we make {food} tonight, or are you in the mood for something else?"]
    },
    nga: {
      school: ["帰りに家の手伝いがあるなら、先に時間を教えてね。", "Tell me if you need to get home for chores; we'll keep an eye on the time."],
      exam: ["終わったら一緒に帰ろう。{food}は残しておくよ。", "I'll save you some {food}. Come find me after the exam."],
      job: ["初日の仕事が終わる時刻、分かったら帰り道を考えよう。", "Once you know your finishing time, we'll work out how to get back."],
      marriage: ["誰を呼びたいか、二人の話を聞いてから椅子を並べるよ。", "Tell me who you want there, and I'll help set out the chairs."],
      birth: ["食事を届けようか。赤ちゃんに会うのは落ち着いてからでいいよ。", "I can bring supper. Meeting the baby can wait until you're ready."],
      illness: ["食事を持っていくよ。{food}なら食べられそう？", "I could bring {food}; would that suit you today?"],
      parentDeath: ["訪ねてくる人のことは手伝うよ。今は家族といて。", "I'll help with people coming by. Take the time you need with your family."],
      migration: ["着いたら知らせてね。家の人にも伝えるから。", "Send news when you get there; I'll pass it on at home."],
      retirement: ["明日の朝、いつもの道を通らなくていいのが不思議だね。", "It'll feel strange to miss that familiar road tomorrow morning."],
      everyday: ["{food}を作るなら、買い物は私が行くよ。", "If we're having {food}, I can do the shopping."]
    },
    bra: {
      school: ["教室は中庭の向こう。帰りにここで待ってるね。", "Your room is across the yard. I'll be right here afterwards."],
      exam: ["終わったら{food}を温めよう。話は食べてからでいい。", "I'll warm up {food}. You can tell me about the exam over lunch."],
      job: ["初めての給料日、家に入れる分も一緒に考える？", "Want to sit down and plan what to do with your first pay?"],
      marriage: ["祝いの席は二人らしくして。食事の支度は手伝うよ。", "Make the gathering yours. I can take care of some of the food."],
      birth: ["赤ちゃんを抱いてる間に、{food}を用意するね。", "I'll fix some {food} while you hold the baby."],
      illness: ["買い物に出るから、食べられそうな物を教えて。", "I'm going to the shops. What might you feel like eating?"],
      parentDeath: ["食事を運んでおくね。訪ねてくる人の分もあるよ。", "I've brought food for the house and whoever comes by."],
      migration: ["新しい町の住所が決まったら教えてね。", "Let me know your address when you're settled in the new city."],
      retirement: ["明日は仕事帰りの買い物じゃなくて、一緒に行けるね。", "Tomorrow we can go to the shops together, without rushing after work."],
      everyday: ["豆はもう煮てあるよ。ご飯を炊く？", "The beans are on already. Shall I put the rice on too?"]
    },
    jpn: {
      school: ["靴箱はここ。帰り道が分からなかったら私に言ってね。", "Here's the shoe rack. Tell me if you need help finding your way home."],
      exam: ["試験が終わったら帰り道で待ってる。おにぎりも持っていくね。", "I'll meet you on the way home, with something to eat."],
      job: ["初日は覚えることが多いね。帰りに何か買っていく？", "That's a lot for day one. Need anything from the shop on the way back?"],
      marriage: ["顔を合わせる日取りは二人で決めて。家の片づけは任せて。", "Choose a day that suits you both. I'll get the house ready for the visit."],
      birth: ["洗濯物は干しておくね。今は少し休んで。", "I'll hang the washing. Try to rest while the baby's asleep."],
      illness: ["おかゆなら作れるよ。何か食べられそう？", "I can make rice porridge. Does anything sound good?"],
      parentDeath: ["来客へのお茶は出すよ。今は座っていて。", "I'll make tea for anyone who comes. You can sit for a while."],
      migration: ["引っ越し先が決まったら住所を教えて。", "Send me the new address when you have it."],
      retirement: ["明日は目覚ましを遅くしてもいいね。朝ごはん、何にする？", "You can set the alarm later tomorrow. What would you like for breakfast?"],
      everyday: ["帰りにおにぎりを買ってきたよ。夕飯までに食べる？", "I picked up rice balls on the way. Want one before dinner?"]
    },
    usa: {
      school: ["教室は廊下の先。帰りの迎え場所も確認しておこう。", "Your room's down the hall. Let's check where your ride will meet you."],
      exam: ["終わったら外で待ってるよ。帰りに何か食べよう。", "I'll be outside when you're done. We can grab a bite afterwards."],
      job: ["最初の勤務表を見せて。帰りの足を考えよう。", "Let's look at your first schedule and figure out the ride home."],
      marriage: ["式の場所より先に、二人で呼びたい人を決めてね。", "Start with who you'd like there. The venue can come later."],
      birth: ["夕飯を玄関に置いていくよ。返事はあとでいいから。", "I'll leave dinner at the door. No need to answer right away."],
      illness: ["薬局に寄るよ。必要な物はある？", "I'm going by the pharmacy. Need anything?"],
      parentDeath: ["明日の食事は持っていくよ。来客のことも手伝える。", "I'll bring tomorrow's dinner. I can help with visitors too."],
      migration: ["新しい住所を教えて。道中も気をつけてね。", "Send me your new address. Take care on the journey."],
      retirement: ["もう朝の渋滞に合わせて出なくていいね。", "No more planning your mornings around that commute."],
      everyday: ["帰りに食料品店へ寄るよ。何か買ってくる？", "I'm stopping for groceries. Need me to pick anything up?"]
    },
    egy: {
      school: ["教室まで案内するよ。帰りにパンを買うなら一緒に行こう。", "I'll show you the classroom. We can stop for bread on the way home."],
      exam: ["終わったら家で{food}を食べよう。温かいうちにね。", "Come home to {food} when it's over. I'll keep it warm."],
      job: ["町までの道、仕事が終わる時刻にもう一度確かめよう。", "We'll check the route through town again when your shift ends."],
      marriage: ["集まる場所は二人で決めて。食事の手配は手伝うよ。", "You two decide where to gather. I can help arrange the meal."],
      birth: ["パンを買っておくね。今日は台所に立たなくていいよ。", "I'll get the bread. Leave the cooking to me today."],
      illness: ["買い物に行くところ。パンか温かい物、どちらがいい？", "I'm going out for food. Would bread or something warm help?"],
      parentDeath: ["家を訪ねる人には私が応じるよ。少し休んで。", "I'll answer the door when people come. Rest if you can."],
      migration: ["大きな町でも、家に便りをくれるとうれしいよ。", "Even from the city, send a little news home when you can."],
      retirement: ["明日は仕事へ急がなくていいね。朝のパンを買いに行こうか。", "No rush to work tomorrow. Shall we go for fresh bread?"],
      everyday: ["パンを買って帰るよ。{food}も食べたい？", "I'll bring bread home. Would you like {food} as well?"]
    },
    idn: {
      school: ["教室で使う言葉が家と違ったら、あとで聞いてね。", "If school uses a word you don't hear at home, ask me later."],
      exam: ["試験のあとに{food}を食べよう。急いで帰らなくていいよ。", "We'll have {food} after the exam. There's no need to hurry."],
      job: ["通う道は分かった？　初日の帰りに一緒に確かめよう。", "Know your way back? I'll go over the route with you after work."],
      marriage: ["集まる人数は二人で決めよう。食事の準備は手伝えるよ。", "You choose how many people to invite. I'll help make the food."],
      birth: ["ご飯を炊いておくね。赤ちゃんのそばにいて。", "I'll cook the rice. You stay with the baby."],
      illness: ["食事を届けようか。{food}ならどう？", "Can I bring a meal? Would {food} suit you?"],
      parentDeath: ["来る人には私が応じるよ。食事も用意しておく。", "I'll welcome anyone who comes and see that there's food."],
      migration: ["離れて暮らしても、落ち着いたら家に知らせてね。", "Once you've settled in, let us know how the new place feels."],
      retirement: ["明日は通勤の時間を気にせず、ご飯を食べよう。", "Tomorrow we can eat breakfast without watching the clock."],
      everyday: ["ご飯は炊けてるよ。おかずは何にしようか。", "The rice is ready. What should we have with it?"]
    },
    mex: {
      school: ["教室は向こう。帰りに市場へ寄るなら声をかけて。", "Your room's over there. Find me if you're going past the market later."],
      exam: ["試験が終わったら{food}を食べよう。話はそのとき聞くね。", "We'll eat {food} after the exam. Tell me how it went then."],
      job: ["初日の帰り道、市場が開いているうちに寄れるかな。", "Will the market still be open when your first shift ends?"],
      marriage: ["誰を呼ぶか決まったら、食事の量を考えよう。", "Once you've settled the guest list, we'll plan how much to cook."],
      birth: ["食事を持ってきたよ。今夜は台所を気にしないで。", "I brought supper. Leave the kitchen alone tonight."],
      illness: ["市場へ行くよ。食べやすい物を買ってこようか。", "I'm off to the market. Is there anything easy to eat you'd like?"],
      parentDeath: ["家に来る人の食事を用意しておくよ。", "I'll put out food for the people coming by the house."],
      migration: ["町の新しい住所が決まったら、家にも伝えてね。", "When you have an address in town, send it home."],
      retirement: ["明日は仕事の前に市場へ走らなくていいね。", "Tomorrow we can take our time at the market."],
      everyday: ["市場で{food}の材料を見てくるよ。ほかにいる？", "I'll look for what we need for {food}. Anything else?"]
    },
    eth: {
      school: ["家で使う言葉と授業の言葉が違ったら、遠慮なく聞いてね。", "If school sounds different from home, come and ask me about the words."],
      exam: ["終わったら{food}を一緒に食べよう。", "When it's done, come share some {food} with us."],
      job: ["仕事が終わるころ、帰り道の様子を確かめよう。", "Let's see what the trip home is like at the end of your shift."],
      marriage: ["二人が呼びたい人を聞かせて。席の支度を手伝うよ。", "Tell me who you'd like to gather. I'll help make room for them."],
      birth: ["食事を届けるよ。赤ちゃんを抱いて休んでいて。", "I'll bring a meal. Stay with the baby and get some rest."],
      illness: ["{food}を持っていこうか。食べられそうか教えてね。", "I can bring {food}, if that sounds good to you."],
      parentDeath: ["訪ねてくる人には私が応じる。食事も用意しておくよ。", "I'll see to visitors and make sure there's something to eat."],
      migration: ["新しい町に着いたら、家まで知らせを届けてね。", "When you reach the new town, let the family hear from you."],
      retirement: ["明日は早く出なくていいね。朝ごはんを一緒に食べよう。", "You won't need an early start tomorrow. Let's have breakfast together."],
      everyday: ["{food}を分けようか。まだ温かいよ。", "There's still warm {food}. Come and share it."]
    },
    deu: {
      school: ["教室は二階。帰りのバスの時刻も確かめよう。", "Your classroom's upstairs. Let's check the bus time for home."],
      exam: ["試験のあと、パン屋に寄る？　何か食べて帰ろう。", "Fancy stopping at the bakery after the exam?"],
      job: ["職場での呼び方、最初に聞いてみよう。帰りの電車も確認してね。", "Ask how people like to be addressed. Check the train home too."],
      marriage: ["集まる場所は二人で決めて。食事の準備は手伝うよ。", "Choose where you'd like everyone to gather. I'll help with the meal."],
      birth: ["パンと食事を玄関に置くね。起こさないようにするよ。", "I'll leave bread and supper at the door so I don't wake anyone."],
      illness: ["買い物を引き受けるよ。パン屋にも寄ろうか。", "I can do your shopping. Shall I stop at the bakery too?"],
      parentDeath: ["訪ねてくる人には私が応じるよ。お茶も入れる。", "I'll answer the door and put the kettle on for visitors."],
      migration: ["引っ越し先の住所を教えて。落ち着いたら会いに行くよ。", "Send me your new address. I'll visit once you're settled."],
      retirement: ["明日は通勤電車に乗らなくていいね。朝はパン屋へ行く？", "No commuter train tomorrow. Shall we walk to the bakery?"],
      everyday: ["パン屋へ寄るけど、夕食に何かいる？", "I'm stopping at the bakery. Need anything for supper?"]
    }
  };
  // A route or meal is mentioned only as an option for this one household.
  var setting = {
    ind: { schoolRural: ["家から教室まで遠かったら、帰る時刻を教えてね。", "If it's a long way home, tell me when you need to leave."], everydayRural: ["{food}を食べてから、家の用事をしようか。", "Shall we eat {food} before the chores?"], migrationEarly: ["町に着いたら手紙を出してね。返事は急がなくていいよ。", "Write when you get to town. No rush for a reply."], migrationModern: ["連絡のつく方法を、出発前に決めておこう。", "Let's agree how to reach each other before you leave."] },
    nga: { schoolRural: ["学校から戻る道、暗くなる前に一緒に確かめよう。", "Let's make sure you know the way back before it gets dark."], everydayRural: ["今日の家の用事が済んだら、{food}を食べよう。", "When the chores are done, come and have {food}."], migrationEarly: ["着いたら便りを出して。家でも待ってるよ。", "Send a letter when you arrive. We'll be looking out for it."], migrationModern: ["町に着いたら、連絡できるときに知らせてね。", "When you reach town, get in touch when you can."] },
    bra: { schoolRural: ["帰り道が長いから、出る時刻を一緒に見よう。", "It's a long trip home; let's check when you should set off."], everydayRural: ["ご飯と豆をよそっておくね。戻ったら食べて。", "I'll put aside rice and beans for when you get back."], migrationEarly: ["新しい町からの手紙、待ってるよ。", "I'll look forward to a letter from the new city."], migrationModern: ["引っ越したら、連絡のつく方法を教えてね。", "When you've moved, tell me the best way to reach you."] },
    jpn: { schoolRural: ["帰りの道が長いね。暗くなる前に出よう。", "It's a long way home. Let's leave while there's light."], everydayRural: ["帰ってきたら、温かいみそ汁をよそうね。", "I'll have soup ready when you come in."], migrationEarly: ["新しい住所へ手紙を書くね。決まったら知らせて。", "Give me the address when you know it; I'll write."], migrationModern: ["着いたら、連絡できる方法で一言ちょうだい。", "Send a quick word once you're there, however you can."] },
    usa: { schoolRural: ["帰りの迎え、校門のどこで待つか決めておこう。", "Let's pick the exact spot for your ride home."], everydayRural: ["町へ買い出しに行くけど、夕食に何かいる？", "I'm heading into town for groceries. Need anything for supper?"], migrationEarly: ["着いたら手紙をちょうだい。新しい住所も教えてね。", "Write when you arrive, and tell me your new address."], migrationModern: ["着いたら連絡して。道中、休みながらね。", "Let me know when you arrive. Take breaks on the road."] },
    egy: { schoolRural: ["村から学校までの道、帰りも同じところで待つよ。", "I'll wait at the same place for the walk back to the village."], everydayRural: ["村へ戻る前にパンを買っていくね。", "I'll pick up bread before heading back to the village."], migrationEarly: ["町から手紙を出してね。家で待ってるよ。", "Write from the city. We'll look out for your letter."], migrationModern: ["町に着いたら、家へ知らせてね。", "Once you're in the city, let the family know."] },
    idn: { schoolRural: ["学校までの道、帰りにもう一度歩いてみよう。", "We'll walk the route back together after school."], everydayRural: ["ご飯が炊けるまで、今日の用事を済ませよう。", "Let's finish the chores while the rice cooks."], migrationEarly: ["離れた町からも手紙を出してね。", "Send a letter from the new town when you can."], migrationModern: ["新しい住まいが決まったら、連絡先を教えて。", "Once you have a place, tell me how to reach you."] },
    mex: { schoolRural: ["村へ戻る道、今日は一緒に歩こう。", "I'll walk the road back to the village with you today."], everydayRural: ["町へ買い物に出るから、{food}の材料も見てくるよ。", "I'm shopping in town; I'll look for what we need for {food}."], migrationEarly: ["町から手紙をくれたら、家のみんなに読んで聞かせるね。", "Send a letter from town and I'll share your news at home."], migrationModern: ["新しい町に着いたら、連絡のつく方法を教えてね。", "Tell us how to reach you once you're settled in town."] },
    eth: { schoolRural: ["学校から戻る道が長いね。出る時刻を覚えておこう。", "It's a long walk back. Let's work out when to leave."], everydayRural: ["帰ってきたら{food}を分けよう。", "Come share some {food} when you're back."], migrationEarly: ["町から便りを出してね。家族にも伝えるよ。", "Send word from town; I'll pass it to the family."], migrationModern: ["着いたら知らせてね。連絡できる方法も決めよう。", "Let us know when you're there, and how best to reach you."] },
    deu: { schoolRural: ["帰りのバス、乗り遅れないよう時刻を見ておこう。", "Let's check the bus timetable for the trip home."], everydayRural: ["町のパン屋へ行くけど、何か買ってこようか。", "I'm going to the bakery in town. Shall I bring anything back?"], migrationEarly: ["新しい住所へ手紙を書くね。決まったら教えて。", "Give me your new address when you have it. I'll write."], migrationModern: ["引っ越したら、連絡先を教えてね。", "Send me your new contact details after the move."] }
  };
  var fallback = { ja: "帰りに少し話そうか。", en: "Shall we talk on the way back?" };
  var dictionaries = { ja: {}, en: {} };
  ["ja", "en"].forEach(function (lang) {
    var index = lang === "ja" ? 0 : 1;
    dictionaries[lang]["dialogue.common"] = fallback[lang];
    pilots.forEach(function (iso) {
      Object.keys(lines[iso]).forEach(function (moment) {
        dictionaries[lang]["dialogue." + iso + "." + moment] = lines[iso][moment][index];
      });
      Object.keys(setting[iso]).forEach(function (variant) {
        dictionaries[lang]["dialogue." + iso + "." + variant] = setting[iso][variant][index];
      });
    });
  });
  dictionaries.ja["dialogue.supper"] = "夕飯";
  dictionaries.en["dialogue.supper"] = "supper";
  if (window.I18N) window.I18N.add(dictionaries);

  function hash(value) {
    var h = 2166136261;
    for (var i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
    return h >>> 0;
  }
  function companion(p, role) {
    var people = p.dialoguePeople || (p.dialoguePeople = {});
    var data = window.NAMES_DATA, country = data && data.countries[p.iso];
    var group = country && country.groups.find(function (item) { return item.pool === p.nameGroup; });
    group = group || country && country.groups[0];
    var pool = group && data.pools[group.pool];
    if (!pool) return null;
    var native = p.iso === "jpn" && pool.native || pool;
    var sex = hash(p.name + role) % 2 ? "f" : "m";
    var names = native[sex] || native.m || native.f;
    var preferred = pool.preferred && pool.preferred[sex];
    if (preferred > 0) names = names.slice(0, preferred);
    if (!names || !names.length) return null;
    if (people[role] && names.indexOf(people[role]) >= 0) return people[role];
    delete people[role];
    var used = [p.given, p.parents && p.parents.mom && p.parents.mom.given,
      p.parents && p.parents.dad && p.parents.dad.given, p.spouse && p.spouse.given]
      .concat(Object.keys(people).map(function (key) { return people[key]; }));
    var start = hash(p.name + role + p.iso) % names.length;
    for (var i = 0; i < names.length; i++) {
      var name = names[(start + i) % names.length];
      if (used.indexOf(name) < 0) return (people[role] = name);
    }
    return null;
  }
  function momentOf(p, entry, options) {
    var raw = String(entry.raw || entry.t || "");
    if (options.historyType === "parent_death") return "parentDeath";
    if (options.historyType === "school_start" && options.level === "primary") return "school";
    if (options.outcome === "sit_exam" || options.historyType === "school_start" && options.level === "univ") return "exam";
    if (p.job && p.jobHistory && p.jobHistory.length === 1 && entry.big &&
        /働きはじめ|started working|began working/i.test(raw)) return "job";
    if (p.spouse && p.spouse.alive && /結婚しました|\bmarried\b/i.test(raw)) return "marriage";
    if (p.kids && p.kids.some(function (kid) { return kid.born === p.age; }) && /生まれました|was born/i.test(raw)) return "birth";
    if (p.moved && /移り住|移住|moved to|settled in/i.test(raw)) return "migration";
    if (p.retired && entry.everyday) return "retirement";
    if (entry.cat === "health" && entry.tone === "bad" && p.age >= 5 && !entry.fact) return "illness";
    if (entry.everyday && p.age >= 10) return "everyday";
    return null;
  }
  function speaker(p, moment) {
    var mom = p.parents && p.parents.mom, dad = p.parents && p.parents.dad;
    var parent = mom && mom.alive ? mom.given : dad && dad.alive ? dad.given : null;
    if (moment === "school") return { role: "teacher", name: companion(p, "teacher") };
    if (moment === "job" || moment === "retirement") return { role: "colleague", name: companion(p, "colleague") };
    if (moment === "exam" || moment === "parentDeath" || moment === "migration") return { role: "friend", name: companion(p, "friend") };
    if (moment === "everyday" && p.age < 12 && parent) return { role: "parent", name: parent };
    if (moment === "everyday" || moment === "illness") return { role: "neighbour", name: companion(p, "neighbour") };
    return { role: parent ? "parent" : "friend", name: parent || companion(p, "friend") };
  }
  function food(p, culture, lang, moment) {
    var choices = lang === "ja" ? culture.foods : lang === "en" ? culture.foods_en : window.I18N.cultureOf(culture).foods;
    if (!choices || !choices.length) return window.I18N.t("dialogue.supper");
    var dish = choices[hash(p.name + moment) % Math.min(choices.length, 2)].replace(/（.*$/, "").replace(/ \(.*$/, "");
    return lang === "en" ? dish.charAt(0).toLowerCase() + dish.slice(1) : dish;
  }
  function consider(p, entry, options) {
    options = options || {};
    var culture = window.CULTURE && window.CULTURE[p.iso];
    if (!culture || !culture.pilot || !culture.pilot.speech || pilots.indexOf(p.iso) < 0 || options.decision || entry.fact) return null;
    var year = p.birthYear + p.age;
    var eras = culture.pilot.eras;
    var era = eras.find(function (item) { return year >= item.start && year <= item.end; });
    var estimatedEra = !era && year > eras[eras.length - 1].end;
    if (!era && !estimatedEra) return null;
    var moment = momentOf(p, entry, options);
    if (!moment) return null;
    var decade = Math.floor(p.age / 10), counts = p.dialogueDecades || (p.dialogueDecades = {});
    if (counts[decade] >= 3 || p.dialogueLastAge != null && p.age - p.dialogueLastAge < 2) return null;
    var seen = p.dialogueSeen || (p.dialogueSeen = {});
    var base = "dialogue." + p.iso + ".";
    var keys = [];
    if (moment === "school" && !p.urban) keys.push(base + "schoolRural");
    if (moment === "everyday" && !p.urban) keys.push(base + "everydayRural");
    if (moment === "migration" && year < 1990) keys.push(base + "migrationEarly");
    if (moment === "migration" && year >= 2010) keys.push(base + "migrationModern");
    keys.push(base + moment);
    var key = keys.filter(function (candidate) { return dictionaries.ja[candidate] && !seen[candidate]; })[0];
    if (!key) return null;
    var person = speaker(p, moment);
    if (!person.name) return null;
    var lang = window.I18N.lang || document.documentElement.lang;
    if (lang !== "en" && !(window.I18N && window.I18N.isExtra)) lang = "ja";
    var text = window.I18N.t(key, { food: food(p, culture, lang, moment) });
    if (!text || text === key) return null;
    seen[key] = true;
    counts[decade] = (counts[decade] || 0) + 1;
    p.dialogueLastAge = p.age;
    var quote = { speaker: person.name, role: person.role, key: key, text: text, moment: moment, estimate: estimatedEra };
    if (window.MEGURI_EMOTIONS) window.MEGURI_EMOTIONS.onDialogue(p, entry, moment);
    if (p.log && p.log.length && ["job", "marriage", "birth", "migration", "exam"].indexOf(moment) >= 0) {
      for (var i = p.log.length - 2; i >= 0 && p.log[i].a === p.age && p.log.length - i <= 5; i--) {
        if (p.log[i].decision) {
          if (p.log.slice(i + 1, -1).every(function (row) { return row.decision; })) p.log[i].quote = quote;
          break;
        }
      }
    }
    return quote;
  }
  window.MEGURI_DIALOGUE = { consider: consider, pilots: pilots, moments: moments };
})();
