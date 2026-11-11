/* Life-specific wishes and scenes. Loaded with the rest of the life data. */
(function () {
  "use strict";
  function tr(key, vars) {
    return window.I18N && window.I18N.t ? window.I18N.t("memory." + key, vars || {}) : "";
  }
  function hash(value) {
    var n = 2166136261, text = String(value);
    for (var i = 0; i < text.length; i++) n = Math.imul(n ^ text.charCodeAt(i), 16777619);
    return n >>> 0;
  }
  function roll(p, tag) { return hash((p.id || p.name) + "|" + p.age + "|" + tag) / 4294967296; }
  function pick(p, tag, list) { return list[Math.floor(roll(p, tag) * list.length)]; }
  function emitLine(p, text, kind, options) {
    if (window.I18N && window.I18N.lang === "en" && /\.\u201d$/.test(text)) text = text.slice(0, -2) + "\u201d.";
    if (!text || !window.MEGURI || !window.MEGURI.addLog(p, text, options || { cat: "family", tone: "neutral" })) return null;
    var entry = p.log[p.log.length - 1];
    entry.memoryKind = kind;
    return entry;
  }
  function emit(p, key, vars, kind, options) { return emitLine(p, tr(key, vars), kind, options); }
  function english() { return window.I18N && window.I18N.lang !== "ja"; }
  function extraLocale() { return window.I18N && window.I18N.isExtra; }
  function placeName(p) {
    var c = window.MEGURI && window.MEGURI.BY[p.iso];
    return english() && window.I18N.countryValue && c ? window.I18N.countryValue(c, "cities", p.city) : p.city;
  }
  function eraMedium(culture, p) {
    if (p.wealth < 3 || !p.urban || !culture || !culture.pilot || !culture.pilot.eras) return "";
    var year = p.birthYear + p.age;
    var era = culture.pilot.eras.filter(function (item) { return year >= item.start && year <= item.end; })[0];
    if (!era) return "";
    var medium = year < 1970 ? "radio" : year < 1990 ? "television" : "";
    return medium && era.spread.some(function (item) { return item.kind === medium && (item.context === "both" || item.context === "urban"); }) ? medium : "";
  }
  function sceneLine(p, culture, kind, variant, person, detail) {
    var city = placeName(p), en = english();
    var young = variant === "child", old = variant === "old";
    if (extraLocale()) return window.I18N.data.memoryScene(kind, { city: city, person: person, detail: detail, variant: variant });
    if (kind === "place") {
      var medium = eraMedium(culture, p);
      if (medium) return en ?
        "You walked through " + detail + " with " + person + ", hearing a " + medium + " from a nearby home." :
        person + "と" + detail + "を歩くと、近くの家から" + (medium === "radio" ? "ラジオ" : "テレビ") + "の音が聞こえました。";
      if (p.urban) return en ?
        "You walked through " + detail + " with " + person + ", watching the busy street." :
        person + "と" + detail + "を歩き、行き交う人々を眺めました。";
      return en ?
        "You walked the road through " + detail + " with " + person + ", as evening settled over the houses." :
        person + "と" + detail + "の道を歩き、家々に灯りがともるのを見ました。";
    }
    if (kind === "festival") return en ?
      "On " + detail + ", you and " + person + " joined the gathering in " + city + " and walked home together." :
      detail + "に、" + person + "と" + city + "の人出にまぎれ、一緒に帰りました。";
    if (kind === "food") return en ?
      (young ? "At home, you and " : old ? "Years later, you and " : "One evening, you and ") + person + " shared " + detail + "." :
      person + "と" + detail + "を" + (young ? "分け合いました。" : old ? "久しぶりに味わいました。" : "囲みました。");
    if (kind === "sport") return en ?
      "You watched " + detail + " with " + person + " in " + city + (young ? " and joined the cheering" : old ? " and recalled an earlier match" : " and talked about it on the way home") + "." :
      city + "で" + person + "と" + detail + "を見て、" + (young ? "一緒に声を上げました。" : old ? "昔の試合の話をしました。" : "帰り道も試合の話が続きました。");
    if (kind === "friend") return en ?
      "You walked through " + detail + " with your friend " + person + ", talking all the way home." :
      "友だちの" + person + "と" + detail + "を歩き、帰り道まで話が尽きませんでした。";
    return en ?
      "You visited " + detail + " with " + person + " and talked about the place on the way home." :
      person + "と" + detail + "へ出かけ、帰り道に見た景色の話をしました。";
  }
  function getMemories(p) { return (p.memories || []).slice(); }
  function currentWish(p) {
    var dream = p.dream && window.MEGURI && window.MEGURI.DREAMS.filter(function (d) { return d.key === p.dream; })[0];
    return dream ? { key: dream.key, label: dream.label, achieved: !!p.dreamAchieved } : null;
  }
  function wishWords(wish) {
    if (extraLocale()) return window.I18N.data.memoryWish(wish);
    var ja = { doctor: "医師になりたい", nurse: "看護師になりたい", engineer: "技術者になりたい",
      lawyer: "弁護士になりたい", artist: "絵や音楽の仕事がしたい", scientist: "研究する仕事がしたい",
      study_abroad: "海外で学びたい", move_to_city: "都会で暮らしたい", travel_world: "世界を旅したい",
      have_family: "家族をつくりたい", public_service: "人の役に立つ仕事がしたい",
      religious_life: "信仰を大切に暮らしたい", craftsperson: "ものを作る仕事がしたい",
      pilot: "飛行機を操縦したい", journalist: "記者になりたい" };
    var en = { doctor: "that you wanted to become a doctor", nurse: "that you wanted to become a nurse",
      engineer: "that you wanted to become an engineer", lawyer: "that you wanted to become a lawyer",
      artist: "that you wanted to make art or music", scientist: "that you wanted to do research",
      study_abroad: "that you wanted to study abroad", move_to_city: "that you wanted to live in a city",
      travel_world: "that you wanted to travel the world", have_family: "that you wanted a family of your own",
      public_service: "that you wanted to work for your community", religious_life: "that you wanted a life shaped by faith",
      craftsperson: "that you wanted to make things for a living", pilot: "that you wanted to fly planes",
      journalist: "that you wanted to become a reporter" };
    return english() ? en[wish.key] || "about your dream of “" + wish.label + "”" : ja[wish.key] || "「" + wish.label + "」を目指したい";
  }
  function onDreamSet(p) {
    var wish = currentWish(p);
    if (!wish) return;
    var parent = p.parents && (p.parents.mom && p.parents.mom.alive ? p.parents.mom : p.parents.dad);
    var setting = p.edu && p.edu.stage !== "none" ? "school" : p.urban ? "street" : "fields";
    var person = parent && parent.given || p.given, city = placeName(p);
    var culture = window.CULTURE && window.CULTURE[p.iso] || {};
    var localCulture = english() && window.I18N.cultureOf ? window.I18N.cultureOf(culture) : culture;
    var sport = localCulture.sports && localCulture.sports.length ? pick(p, "wishSport", localCulture.sports) : "";
    var line;
    if (extraLocale()) line = window.I18N.data.memoryDreamLine({ city: city, person: person, wish: wishWords(wish) });
    else if (wish.key === "farmer_own_land") line = english() ?
      (p.urban ? "At a market in " + city : "Walking past fields in " + city) + " with " + person + ", you said you wanted to farm land of your own someday." :
      person + "と" + (p.urban ? city + "の市場で野菜を見ながら" : city + "の畑のそばを歩きながら") + "、いつか自分の土地で作物を育てたいと話しました。";
    else if (wish.key === "athlete" && sport) line = english() ?
      "Watching " + sport.toLowerCase() + " with " + person + " in " + city + ", you imagined competing one day." :
      city + "で" + person + "と" + sport + "を見て、自分もいつか試合に出たいと思いました。";
    else if (wish.key === "teacher" && setting === "school") line = english() ?
      "After listening to a teacher at school in " + city + ", you told " + person + " you wanted to teach one day." :
      city + "の学校で先生の話を聞き、帰り道に" + person + "へ自分も教える仕事をしたいと話しました。";
    else if (wish.key === "business_owner") line = english() ?
      "Looking at market stalls in " + city + " with " + person + ", you imagined running a shop of your own." :
      person + "と" + city + "の市場の店先を見て、いつか自分の店を持ちたいと思いました。";
    else if (wish.key === "help_family") line = english() ?
      "Watching " + person + " finish the day's work in " + city + ", you hoped to support your family one day." :
      city + "で" + person + "が家の仕事を続ける姿を見て、いつか家族を支えたいと思いました。";
    else if (setting === "school") line = english() ?
      "After school in " + city + ", you told " + person + " on the way home " + wishWords(wish) + "." :
      city + "の学校から帰る途中、" + person + "に" + wishWords(wish) + "と話しました。";
    else if (setting === "street") line = english() ?
      "Watching people at work in " + city + ", you told " + person + " " + wishWords(wish) + "." :
      city + "で働く人たちを見て、" + person + "に" + wishWords(wish) + "と話しました。";
    else line = english() ?
      "After chores in " + city + ", you told " + person + " " + wishWords(wish) + "." :
      city + "で家の仕事を終え、夕方に" + person + "に" + wishWords(wish) + "と話しました。";
    var entry = emitLine(p, line, "dreamWish", { dream: true, cat: "learn", tone: "neutral" });
    if (entry && window.MEGURI_EMOTIONS) window.MEGURI_EMOTIONS.onDream(p, entry, "want");
  }
  function onDreamReached(p) {
    var wish = currentWish(p);
    if (wish) {
      var entry = emit(p, "fulfilled", { dream: wish.label, dreamAction: english() ? window.I18N.dreamAction(wish.key) : "" },
        "fulfilment", { dream: true, cat: "family", tone: "good" });
      if (entry && window.MEGURI_EMOTIONS) window.MEGURI_EMOTIONS.onDream(p, entry, "fulfilled");
    }
  }
  function people(p) {
    var parents = p.parents ? [p.parents.mom, p.parents.dad] : [];
    var kids = (p.kids || []).filter(function (x) { return x.alive && x.given && p.age - x.born >= 3; });
    var friend = p.memoryFriend && p.age >= 8 && p.age < 50 ? [p.memoryFriend] : [];
    var pool = p.age < 18 ? parents.filter(function (x) { return x && x.alive && x.given; }) :
      [p.spouse].concat(kids, parents).filter(function (x) { return x && x.alive && x.given; });
    pool = pool.concat(friend);
    return pool.length ? pool : parents.filter(function (x) { return x && x.given; });
  }
  function friendName(p) {
    if (p.memoryFriend) return p.memoryFriend.given;
    var data = window.NAMES_DATA || {}, entry = data.countries && data.countries[p.iso];
    var countryGroups = entry && entry.groups || [];
    var group = countryGroups.some(function (item) { return item.pool === p.nameGroup; }) ? p.nameGroup :
      countryGroups[0] && countryGroups[0].pool;
    var names = group && data.pools && data.pools[group];
    var sex = p.sex === "f" ? "f" : "m";
    var source = names && p.iso === "jpn" && !english() && names.native ? names.native : names;
    names = source && source[sex] && source[sex].slice(0, names.preferred && names.preferred[sex] || source[sex].length);
    if (!names || !names.length) return "";
    var index = hash((p.id || p.name) + "|friend") % names.length;
    var given = names[index];
    if (given === p.given && names.length > 1) given = names[(index + 1) % names.length];
    p.memoryFriend = { given: given, friend: true };
    return given;
  }
  function scene(p, c, culture, festivalAllowed) {
    if (p.age < 5 || p.age - (p.lastMemorySceneAge || -10) < 3 || roll(p, "scene") > 0.72) return;
    var friend = p.age >= 8 && p.age < 50 ? friendName(p) : "";
    var companions = people(p);
    if (!companions.length) return;
    var person = pick(p, "person", companions).given;
    var translated = english() && window.I18N.cultureOf ? window.I18N.cultureOf(culture || {}) : culture || {};
    var options = [];
    var festivals = (culture && culture.festivals || []).filter(function (item) {
      return !festivalAllowed || festivalAllowed(item.name, p.religion);
    });
    if (festivals.length) options.push("festival");
    if (translated.foods && translated.foods.length) options.push("food");
    if (translated.sports && translated.sports.length) options.push("sport");
    if (p.city) options.push("place");
    if (friend) options.push("friend");
    var cities = english() ? c.cities_en || c.cities : c.cities;
    if (p.age >= 18 && p.moved && cities && cities.length > 1) options.push("trip");
    options = options.filter(function (kind) { return p.age - ((p.memorySceneLastKind || {})[kind] || -10) >= 8; });
    if (!options.length) return;
    var kind = pick(p, "sceneKind", options), detail = "";
    if (kind === "festival") {
      var festival = pick(p, "festival", festivals);
      detail = english() ? festival.name_en || festival.name : festival.name;
    } else if (kind === "food") detail = pick(p, "food", translated.foods);
    else if (kind === "sport") {
      detail = pick(p, "sport", translated.sports);
      if (window.I18N && window.I18N.lang === "en") detail = detail.charAt(0).toLowerCase() + detail.slice(1);
    }
    else if (kind === "trip") detail = pick(p, "trip", cities);
    else detail = english() && window.I18N.countryValue ? window.I18N.countryValue(c, "cities", p.city) : p.city;
    if (kind === "friend") person = friend;
    if (!detail) return;
    var variant = p.age < 18 ? "child" : p.age >= 65 ? "old" : "adult";
    var entry = emitLine(p, sceneLine(p, culture, kind, variant, person, detail), "scene", { cat: "family", tone: "good", culture: true, everyday: true, emotionSource: "memory" });
    if (!entry) return;
    entry.memorySceneKind = kind;
    if (window.MEGURI_EMOTIONS) window.MEGURI_EMOTIONS.onMemory(p, entry, { kind: kind, detail: detail, person: person });
    p.lastMemorySceneAge = p.age;
    (p.memorySceneLastKind || (p.memorySceneLastKind = {}))[kind] = p.age;
    var memory = { id: "m" + p.age + "-" + (p.memories || []).length, age: p.age, kind: kind, person: person, detail: detail, text: entry.t };
    if (kind === "festival" || kind === "friend" || (p.memories || []).length < 2 || roll(p, "remember") < 0.55) {
      (p.memories || (p.memories = [])).push(memory);
      entry.remembered = memory.id;
    }
  }
  function wishBeat(p) {
    var wish = currentWish(p);
    if (!wish) return;
    var age = p.age;
    var vars = { dream: wish.label, dreamAction: english() ? window.I18N.dreamAction(wish.key) : "" };
    if (age === 16) emit(p, "wish.teen", vars, "dreamWish", { dream: true, cat: "learn", tone: "neutral" });
    if (age === 30 || age === 44) {
      var kind = p.kids && p.kids.some(function (x) { return x.alive; }) ? "child" :
        p.dream === "business_owner" ? "shop" : p.dream === "travel_world" || p.dream === "study_abroad" ? "trip" : "home";
      emit(p, "wish.adult." + kind, vars, "dreamWish", { dream: true, cat: "family", tone: "neutral" });
    }
    if (age === 70) emit(p, "wish.old." + (p.grand ? "grand" : p.moved ? "homeplace" : "together"), vars, "dreamWish", { dream: true, cat: "family", tone: "neutral" });
    if (wish.achieved || age < 12 || age > 60) return;
    if (age - (p.lastWishStepAge || 0) >= 5 && roll(p, "step") < 0.85) {
      var step = p.edu && (p.edu.stage === "primary" || p.edu.stage === "secondary" || p.edu.stage === "univ") ? "school" :
        p.job ? "work" : p.saved > 0 ? "saving" : null;
      if (step && emit(p, "step." + step, vars, "step", { dream: true, cat: "learn", tone: "neutral" })) p.lastWishStepAge = age;
    }
    if (age - (p.lastWishSetbackAge || -20) >= 8) {
      var trouble = (p.log || []).filter(function (x) { return x.a === age && x.tone === "bad" &&
        (x.big || x.blocked) && ["health", "economy", "family", "world", "learn", "work", "society", "disaster"].indexOf(x.cat) >= 0; })[0];
      var reason = trouble && (trouble.cat === "health" ? "health" :
        trouble.cat === "society" || trouble.cat === "world" || trouble.cat === "disaster" ? "disruption" :
        trouble.cat === "family" ? "family" : trouble.cat === "learn" ? "study" : "money");
      if (trouble && emit(p, "setback." + reason, vars, "setback",
        { dream: true, cat: trouble.cat, tone: p.gentle || p.eduMode ? "neutral" : "bad" })) p.lastWishSetbackAge = age;
    }
    if (!p.wishTurned && age >= 48 && (p.dreamBlocked || []).length >= 2) {
      if (emit(p, "turn", vars, "turn", { dream: true, cat: "family", tone: "neutral" })) p.wishTurned = true;
    }
  }
  function recall(p) {
    if (p.age < 28 || p.age - (p.lastMemoryRecallAge || 0) < 13) return;
    var old = (p.memories || []).filter(function (m) { return m.age <= p.age - 10 && !(p.memoryRecalled || {})[m.id]; })[0];
    if (!old) return;
    var entry = emit(p, "recall." + old.kind, { age: old.age, person: old.person, detail: old.detail }, "recall", { cat: "family", tone: "neutral" });
    if (!entry) return;
    entry.memoryRef = old.id;
    (p.memoryRecalled || (p.memoryRecalled = {}))[old.id] = true;
    p.lastMemoryRecallAge = p.age;
  }
  function tick(p, c, culture, festivalAllowed) {
    if (!window.I18N || p.ended) return;
    wishBeat(p);
    scene(p, c, culture, festivalAllowed);
    recall(p);
  }
  function ending(value) {
    var memories = getMemories(value);
    if (!memories.length) return "";
    var selected = [memories[0]];
    if (memories.length > 2) selected.push(memories[Math.floor(memories.length / 2)]);
    if (memories.length > 1) selected.push(memories[memories.length - 1]);
    return tr("ending.intro") + " " + selected.filter(function (m, i) { return selected.indexOf(m) === i; }).map(function (m) {
      return tr("ending.scene", { age: m.age, scene: m.text });
    }).join(" ");
  }
  window.MEGURI_MEMORIES = { tick: tick, onDreamSet: onDreamSet, onDreamReached: onDreamReached,
    getMemories: getMemories, currentWish: currentWish, ending: ending };
})();
