/* Short inner thoughts rooted in this person's circumstances. Loaded with life data. */
(function () {
  "use strict";
  function t(key, vars) { return window.I18N.t("emotion." + key, vars || {}); }
  function hash(value) {
    var h = 2166136261, s = String(value);
    for (var i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return h >>> 0;
  }
  function roll(p, tag) { return hash((p.id || p.name) + "|" + p.age + "|" + tag) / 4294967296; }
  function cultureSpread(p, kinds) {
    var culture = window.CULTURE && window.CULTURE[p.iso];
    var year = p.birthYear + p.age;
    var eras = culture && culture.pilot && culture.pilot.eras || [];
    var era = eras.filter(function (item) { return year >= item.start && year <= item.end; })[0];
    if (!era && eras.length && year > eras[eras.length - 1].end) era = eras[eras.length - 1];
    return !!(era && (era.spread || []).some(function (item) {
      return kinds.indexOf(item.kind) >= 0 && (item.context === "both" || item.context === (p.urban ? "urban" : "rural"));
    }));
  }
  function peer(p, richer) {
    return (p.peers || []).filter(function (person) {
      return person && person.name && (richer ? person.wealth > p.wealth : person.wealth < p.wealth);
    })[0];
  }
  function canMark(p, entry, tag, gap) {
    if (!entry || entry.fact || entry.decision || entry.innerVoice || p.age < 5) return false;
    if (p.emotionLastAge != null && p.age - p.emotionLastAge < (gap == null ? 2 : gap)) return false;
    return !(p.emotionUsed || {})[tag];
  }
  function mark(p, entry, feeling, tag, cause, vars, scene, gap) {
    if (!canMark(p, entry, tag, gap)) return false;
    vars = vars || {};
    var voice = t("voice." + (tag.indexOf("chain.start.") === 0 ? "chain.start" : tag.indexOf("chain.middle.") === 0 ? "chain.middle" : tag.indexOf("chain.end.") === 0 ? "chain.end" :
      tag.indexOf("purchaseWanted.") === 0 ? "purchaseWanted" : tag.indexOf("purchaseService.") === 0 ? "purchaseService" : tag.indexOf("purchase.") === 0 ? "purchase" : tag.indexOf("festival.") === 0 ? "festival" :
      tag.indexOf("friend.") === 0 ? "friend" : tag.indexOf("reunion.") === 0 ? "reunion" :
      tag.indexOf("dream.want.") === 0 ? "dream.want" : tag.indexOf("dream.fulfilled.") === 0 ? "dream.fulfilled" : tag), vars);
    if (!voice || voice === "emotion.voice." + tag || /undefined|NaN/.test(voice)) return false;
    if ((p.emotionVoices || {})[voice]) return false;
    if (scene) {
      var text = t("scene." + scene, vars);
      if (!text || text === "emotion.scene." + scene) return false;
      entry.t = text;
      entry.joy = null;
      entry.motivation = null;
      entry.culture = false;
    }
    entry.innerVoice = voice;
    entry.emotion = feeling;
    entry.emotionCause = cause;
    entry.emotionKey = tag;
    (p.emotionUsed || (p.emotionUsed = {}))[tag] = true;
    (p.emotionVoices || (p.emotionVoices = {}))[voice] = true;
    (p.emotionTrail || (p.emotionTrail = [])).push({ age: p.age, feeling: feeling, key: tag, cause: cause });
    p.emotionLastAge = p.age;
    if (feeling === "envy") {
      p.emotionAfter = { object: cause.object, age: p.age };
      if (cause.object === "bike" || cause.object === "tv") p.emotionWanted = { object: cause.object, age: p.age };
    }
    return true;
  }
  function comparison(p, entry) {
    var age = p.age, richPeer = peer(p, true), poorPeer = peer(p, false);
    var position = age >= 18 && p.income > 0 && window.MEGURI && window.MEGURI.incomePosition ? window.MEGURI.incomePosition(p).country : null;
    var less = p.wealth <= 2 || position != null && position < 35;
    var more = p.wealth >= 4 && (position == null || position > 60);
    var options = [];
    if (less && age >= 7 && age <= 20 && richPeer && (p.items || []).indexOf("bike") < 0)
      options.push(["envy", "bike", "bike", { peer: richPeer.name }]);
    if (less && age >= 8 && age <= 40 && cultureSpread(p, ["television"]) && (p.items || []).indexOf("tv") < 0)
      options.push(["envy", "tv", "tv", {}]);
    if (less && age >= 17 && age <= 28 && p.edu && p.edu.level !== "univ" && richPeer)
      options.push(["longing", "university", "university", { peer: richPeer.name }]);
    if (!p.urban && age >= 15 && age <= 30 && p.edu && p.edu.level !== "none" && (p.peers || []).some(function (x) { return x.urban; }))
      options.push(["envy", "city", "city", { peer: (p.peers || []).filter(function (x) { return x.urban; })[0].name }]);
    if (less && age >= 18 && cultureSpread(p, ["mobile", "phone", "internet"]))
      options.push(["longing", "abroad", "abroad", {}]);
    if (more && age >= 8 && age <= 40 && poorPeer && (p.items || []).indexOf("bike") >= 0)
      options.push(["awkward", "ownBike", "ownBike", { peer: poorPeer.name }]);
    if (more && age >= 18 && age <= 45 && poorPeer && (p.items || []).indexOf("tv") >= 0 && cultureSpread(p, ["television"]))
      options.push(["pride", "ownTv", "ownTv", { peer: poorPeer.name }]);
    if (age >= 19 && age <= 28 && p.edu && p.edu.level === "univ" && poorPeer)
      options.push(["guilt", "ownUniversity", "ownUniversity", { peer: poorPeer.name }]);
    if (more && p.urban && age >= 18 && age <= 40 && (p.peers || []).some(function (x) { return !x.urban; }))
      options.push(["pride", "ownCity", "ownCity", { peer: (p.peers || []).filter(function (x) { return !x.urban; })[0].name }]);
    options = options.filter(function (option) { return !(p.emotionUsed || {})[option[1]]; });
    if (!options.length) return false;
    var choice = options[Math.floor(roll(p, "comparison") * options.length)];
    var cause = { kind: "comparison", object: choice[2], peer: choice[3].peer || "", wealth: p.wealth, incomeRank: position,
      year: p.birthYear + age, schooling: p.edu && p.edu.level, spread: ["tv", "ownTv", "abroad"].indexOf(choice[2]) >= 0 };
    return mark(p, entry, choice[0], choice[1], cause, choice[3], choice[1], 3);
  }
  function everyday(p, entry) {
    var age = p.age, stats = p.stats || {};
    var mother = p.parents && p.parents.mom, father = p.parents && p.parents.dad;
    if (p.emotionAfter && age > p.emotionAfter.age && age - p.emotionAfter.age <= 5) {
      var after = p.emotionAfter;
      if (mark(p, entry, "resolve", "resolve", { kind: "prior-feeling", object: after.object, age: after.age }, {}, "resolve", 1)) {
        p.emotionAfter = null;
        return true;
      }
    }
    if (age <= 18 && p.edu && p.edu.stage !== "none" && (age === 11 || age === 15 || age === 18))
      if (mark(p, entry, "fear", "exam", { kind: "school", age: age }, {}, "exam")) return true;
    if (age >= 8 && age <= 17 && stats.hp < 48)
      if (mark(p, entry, "boredom", "bored", { kind: "wellbeing", value: stats.hp }, {}, "bored")) return true;
    if (age >= 18 && p.moved && stats.r < (p.temperament === "social" ? 38 : 48))
      if (mark(p, entry, "loneliness", "lonely", { kind: "move", place: p.city }, {}, "lonely")) return true;
    if (age >= 18 && p.moved && p.abroad)
      if (mark(p, entry, "homesickness", "homesick", { kind: "move", place: p.abroad }, {}, "homesick")) return true;
    if (age >= 18 && ((mother && mother.diedAt != null && age - mother.diedAt > 0 && (age - mother.diedAt) % 10 === 0) ||
      (father && father.diedAt != null && age - father.diedAt > 0 && (age - father.diedAt) % 10 === 0)))
      if (mark(p, entry, "grief", "anniversary", { kind: "family-loss", age: age }, {}, "anniversary")) return true;
    if (age >= 65 && stats.h >= 45 && stats.hp >= 50)
      if (mark(p, entry, "contentment", "old", { kind: "old-age", health: stats.h, wellbeing: stats.hp }, {}, "old")) return true;
    if (age >= 18 && stats.h >= 55 && stats.hp >= 55 && p.net >= 0)
      if (mark(p, entry, "relief", "breath", { kind: "stable-year", health: stats.h, wellbeing: stats.hp, net: p.net }, {}, "breath")) return true;
    return false;
  }
  function consider(p, entry, options) {
    options = options || {};
    if (p.emotionAfter && p.age - p.emotionAfter.age > 5) p.emotionAfter = null;
    if (options.emotionSource === "chain" && options.chainId && [0, 1, 2].indexOf(options.chainStep) >= 0) {
      var step = ["start", "middle", "end"][options.chainStep];
      mark(p, entry, step === "start" ? "longing" : step === "end" ? "relief" : "fear", "chain." + step + "." + options.chainId,
        { kind: "chain", object: options.chainId, step: step }, {}, null, 1);
      return;
    }
    if (options.purchaseKey) {
      var label = options.purchaseLabel || "";
      var wanted = p.emotionWanted && p.emotionWanted.object === options.purchaseKey;
      if (label && options.purchaseKind !== "investment" && (!options.purchaseAuto || wanted || roll(p, "purchase:" + options.purchaseKey) < 0.25)) {
        mark(p, entry, options.purchaseKind === "service" ? "relief" : "fulfilment", (wanted ? "purchaseWanted." : options.purchaseKind === "service" ? "purchaseService." : "purchase.") + options.purchaseKey,
          { kind: "purchase", object: options.purchaseKey, label: label, wanted: !!wanted }, { item: label }, null, wanted ? 0 : 2);
      }
      if (wanted) p.emotionWanted = null;
      return;
    }
    if (!options.everyday || options.emotionSource === "memory" || entry.quote || p.age < 6 || roll(p, "everyday") > 0.62) return;
    if (p.emotionLastAge != null && p.age - p.emotionLastAge < 3 && !p.emotionAfter) return;
    if (p.age >= 7 && p.age <= 40 && roll(p, "choice") < (p.temperament === "explore" ? 0.72 : p.temperament === "grit" ? 0.64 : 0.52) && comparison(p, entry)) return;
    everyday(p, entry) || comparison(p, entry);
  }
  function onMemory(p, entry, memory) {
    if (!memory || !memory.detail || roll(p, "memory") > 0.58) return;
    if (memory.kind === "festival") mark(p, entry, "joy", "festival." + memory.detail,
      { kind: "memory", object: memory.detail }, { detail: memory.detail }, null, 2);
    else if (memory.kind === "friend") mark(p, entry, "joy", "friend." + memory.person,
      { kind: "memory", object: memory.person }, { person: memory.person }, null, 2);
    else if (memory.kind === "trip" && p.moved) mark(p, entry, "relief", "reunion." + memory.detail,
      { kind: "memory", object: memory.detail }, { detail: memory.detail }, null, 2);
  }
  function onDream(p, entry, phase) {
    var dream = window.MEGURI && window.MEGURI.DREAMS.filter(function (item) { return item.key === p.dream; })[0];
    if (!dream) return;
    mark(p, entry, phase === "fulfilled" ? "fulfilment" : "longing", "dream." + phase + "." + p.dream,
      { kind: "dream", object: p.dream, achieved: phase === "fulfilled" }, { dream: dream.label }, null, 1);
  }
  function onDialogue(p, entry, moment) {
    if (moment === "exam" && entry && !entry.innerVoice) mark(p, entry, "fear", "examDialogue",
      { kind: "exam", age: p.age }, {}, null, 2);
  }
  function ending(p) {
    var trail = p.emotionTrail || [];
    if (!trail.length) return "";
    var picked = [], seen = {};
    trail.forEach(function (beat) {
      if (!seen[beat.feeling]) { seen[beat.feeling] = true; picked.push(beat); }
    });
    var priority = { longing: 8, envy: 7, homesickness: 6, grief: 6, fulfilment: 5, joy: 4, contentment: 3 };
    picked.sort(function (a, b) { return (priority[b.feeling] || 1) - (priority[a.feeling] || 1) || a.age - b.age; });
    var first = picked[0], second = picked.filter(function (beat) { return beat.feeling !== first.feeling && beat.age > first.age; })[0];
    function sentence(beat) {
      if (beat.feeling === "longing" && beat.cause.kind === "dream" && p.dream === beat.cause.object) {
        var dream = window.MEGURI && window.MEGURI.DREAMS.filter(function (item) { return item.key === p.dream; })[0];
        if (dream) return t(p.dreamAchieved ? "ending.dreamReached" : "ending.dreamUnreached", {
          dream: dream.label, dreamAction: window.I18N.dreamAction ? window.I18N.dreamAction(dream.key) : dream.label
        });
      }
      if (beat.feeling === "envy" && ["bike", "tv", "city"].indexOf(beat.cause.object) >= 0)
        return t("ending.envy." + beat.cause.object);
      return t("ending." + beat.feeling);
    }
    return sentence(first) + (second ? " " + sentence(second) : "");
  }
  window.MEGURI_EMOTIONS = { consider: consider, onMemory: onMemory, onDream: onDream, onDialogue: onDialogue, ending: ending };
})();
