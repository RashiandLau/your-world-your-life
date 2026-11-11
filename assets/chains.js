/* Small, dated story threads. All household outcomes are simulation estimates. */
(function () {
  "use strict";
  var rows = [
    ["ind91", "ind", 1991, "economy", "U.S. Department of State", "制度の変化を聞き、家族で仕事の行く先を話しました。", "Economic reforms began, and the family talked about how work might change.", "知り合いの仕事を手伝い、新しい売り方を覚えました。", "Helping an acquaintance at work taught you a different way to sell.", "覚えたやり方を仕事に生かし、収入が少し増えました。", "You put what you learned to work, and earnings rose a little.", "k", 2],
    ["chn78", "chn", 1978, "economy", "World Bank", "改革の知らせを聞き、家族でこれからの働き方を話しました。", "News of the reforms led the family to discuss different kinds of work.", "家の外の仕事も試し、できることが増えました。", "You tried work outside the household and learned a new task.", "経験が次の仕事につながり、収入が少し増えました。", "That experience led to another job, with a little more income.", "k", 2],
    ["nga99", "nga", 1999, "society", "U.S. Department of State", "民政への移行を迎え、家族でこれからの暮らしを話しました。", "As civilian rule returned, the family talked about what might change locally.", "地域の集まりで学び直しの場を知りました。", "At a local gathering, you found a place to continue learning.", "学んだことを日々の仕事に役立てました。", "You began using what you learned in your daily work.", "k", 2],
    ["bra85", "bra", 1985, "society", "Library of Congress", "文民政権への移行を聞き、家族で社会の変化を話しました。", "The return of civilian government gave the family much to discuss.", "身近な人と集まり、地域の課題を考えました。", "You met with neighbors and talked through local concerns.", "話し合いを重ね、地域に頼れる知り合いが増えました。", "Those conversations left you with more people to turn to nearby.", "r", 2],
    ["deu89", "deu", 1989, "society", "U.S. Department of State", "壁が開いた知らせを聞き、家族で古い地図を広げました。", "When news came that the Wall had opened, the family unfolded an old map.", "行き来できる場所が増え、離れていた友人を訪ねました。", "New routes opened, and you visited a friend you had not seen for years.", "連絡を取り合うようになり、家族の予定にも新しい場所が加わりました。", "You kept in touch, and visits became part of the family calendar.", "r", 2],
    ["egy11", "egy", 2011, "society", "U.S. Department of State", "抗議運動が続き、家族で外出や仕事の予定を確かめ合いました。", "During the protests, the family checked travel and work plans together.", "予定を変えながら働き、家計を切り詰めました。", "Changing work plans meant watching household spending closely.", "仕事の手順を立て直し、毎日の予定が落ち着きました。", "You reorganized your work, and the daily routine settled.", "hp", -2],
    ["jpn11", "jpn", 2011, "disaster", "USGS / NOAA", "大きな地震が起き、仙台で家族と無事を確かめました。沿岸の津波の知らせも届きました。", "When the earthquake struck, your family in Sendai checked on one another. News of the coastal tsunami followed.", "家のちょっとした傷みを確かめ、直す順番を家族で決めました。", "Your family checked minor damage at home and agreed on what to repair first.", "家の小さな傷みを直し、普段の暮らしを少しずつ取り戻しました。", "After small repairs, your daily routine gradually returned.", "hp", -2],
    ["ukr22", "ukr", 2022, "conflict", "UCDP", "戦争が広がり、近くの頼れる人と連絡を取り、当面の暮らしを考えました。", "As war spread, you checked in with someone nearby and planned for the days ahead.", "同じ街の別の場所にしばらく身を寄せ、家族と連絡を続けました。", "You stayed elsewhere in the same city for a while and kept in touch with family.", "身近な人と予定を合わせ、日々の暮らしを続けました。", "You adjusted plans with people nearby and carried on with daily life.", "hp", -2],
    ["rus91", "rus", 1991, "society", "U.S. Department of State", "ソ連が解体され、家族で仕事や暮らしの変化を話しました。", "As the Soviet Union came to an end, your family talked about changes to work and daily life.", "働き方を変えようとする知り合いと情報を分け合いました。", "You shared information with acquaintances looking for new ways to work.", "頼れる人とのつながりが、次の仕事を考える手がかりになりました。", "Those connections stayed with you and helped you consider your next work.", "r", 1]
  ];
  var dictionaries = { ja: {}, en: {} };
  rows.forEach(function (row) {
    ["start", "middle", "end"].forEach(function (step, index) {
      dictionaries.ja["chain." + row[0] + "." + step] = row[5 + index * 2];
      dictionaries.en["chain." + row[0] + "." + step] = row[6 + index * 2];
    });
  });
  var fallback = {
    fuel: ["調理の煙が家にこもり、窓を開ける日が続きました。", "Smoke from cooking lingered indoors, so the windows stayed open.", "せきが続き、火のそばで過ごす時間を減らしました。", "A lingering cough led you to spend less time near the stove.", "家計を相談し、煙の少ない調理器具に替えました。", "After discussing the cost, the household switched to a cleaner stove."],
    housing: ["家賃が上がると聞き、家族で住み続ける費用を話し合いました。", "After hearing about higher rent, the family discussed what it would cost to stay.", "出費を抑えるため、しばらく部屋を分け合いました。", "To keep costs down, everyone shared the available rooms for a while.", "家賃を払える住まいを見つけ、引っ越し代を家計から出しました。", "The family found a place it could afford and paid for the move."],
    school: ["近くの学校へ通う道を、家族で探しました。", "The family looked for a workable route to a nearby school.", "通学の手立てが決まり、授業に出る日が増えました。", "Once the journey was arranged, you attended classes more often.", "通い続けるうちに、読めるものが増えました。", "Regular classes helped you read more on your own."],
    care: ["年を重ねた親の通院が増え、家族で付き添いを分担しました。", "A parent needed more clinic visits, and the family shared the trips.", "付き添いの日は仕事を早く切り上げ、収入が少し減りました。", "Leaving work early for appointments reduced your earnings a little.", "予定を組み直し、無理なく通院を続けられるようにしました。", "The family rearranged its days so the visits could continue."],
    air_rise: ["国内のPM2.5が10年前より増えたと知り、家族で空気のことを話しました。", "A national report showed more fine particles in the air than a decade earlier, and your family talked about the air around them.", "料理の煙も気になり、窓を開けるよう家族で声を掛け合いました。", "The family also paid attention to cooking smoke and reminded one another to open a window.", "近所の人と料理の工夫を教え合い、続けられる方法を見つけました。", "You exchanged cooking ideas with neighbors and found a routine you could keep."],
    air_fall: ["国内のPM2.5が10年前より減ったと知り、家族で空気のことを話しました。", "A national report showed fewer fine particles in the air than a decade earlier, and your family talked about the air around them.", "外の空気が改善しても、家の中の煙には気をつけて換気しました。", "You learned that indoor cooking smoke was a separate concern and checked the ventilation while cooking.", "近所の人と料理の工夫を教え合い、続けられる方法を見つけました。", "You exchanged cooking ideas with neighbors and found a routine you could keep."]
  };
  Object.keys(fallback).forEach(function (id) {
    ["start", "middle", "end"].forEach(function (step, index) {
      dictionaries.ja["chain." + id + "." + step] = fallback[id][index * 2];
      dictionaries.en["chain." + id + "." + step] = fallback[id][index * 2 + 1];
    });
  });
  dictionaries.ja["chain.estimate"] = "家族の経緯は資料をもとにした推計です。";
  dictionaries.en["chain.estimate"] = "This household path is a simulation estimate based on the source.";
  dictionaries.ja["chain.historical"] = "{year}年の出来事を起点にした推計です。";
  dictionaries.en["chain.historical"] = "An estimated household path beginning with the event in {year}.";
  dictionaries.ja["chain.fuel.source"] = "清潔な調理燃料の利用率をもとにした推計です。";
  dictionaries.en["chain.fuel.source"] = "Estimate based on access to clean cooking fuels.";
  dictionaries.ja["chain.housing.source"] = "都市人口と住居の指標をもとにした推計です。";
  dictionaries.en["chain.housing.source"] = "Estimate based on urban population and housing indicators.";
  dictionaries.ja["chain.school.source"] = "不就学率をもとにした推計です。";
  dictionaries.en["chain.school.source"] = "Estimate based on the out-of-school rate.";
  dictionaries.ja["chain.care.source"] = "医療費の家計負担をもとにした推計です。";
  dictionaries.en["chain.care.source"] = "Estimate based on out-of-pocket health spending.";
  dictionaries.ja["chain.air_rise.source"] = "世界銀行の全国PM2.5統計では2010年から2020年に増加。家ごとの空気の状態は分かりません。";
  dictionaries.en["chain.air_rise.source"] = "World Bank national PM2.5 rose from 2010 to 2020; this does not measure household exposure.";
  dictionaries.ja["chain.air_fall.source"] = "世界銀行の全国PM2.5統計では2010年から2020年に減少。家ごとの空気の状態は分かりません。";
  dictionaries.en["chain.air_fall.source"] = "World Bank national PM2.5 fell from 2010 to 2020; this does not measure household exposure.";
  dictionaries.ja["chain.source.wb"] = "世界銀行";
  dictionaries.en["chain.source.wb"] = "World Bank";
  dictionaries.ja["chain.source.state"] = "米国国務省";
  dictionaries.en["chain.source.state"] = "U.S. Department of State";
  dictionaries.ja["chain.source.loc"] = "米国議会図書館";
  dictionaries.en["chain.source.loc"] = "Library of Congress";
  dictionaries.ja["chain.source.uis"] = "ユネスコ統計研究所";
  dictionaries.en["chain.source.uis"] = "UNESCO UIS";
  dictionaries.ja["chain.source.who"] = "WHO・世界銀行";
  dictionaries.en["chain.source.who"] = "WHO / World Bank";
  dictionaries.ja["chain.source.quake"] = "米国地質調査所・米国海洋大気庁";
  dictionaries.en["chain.source.quake"] = "USGS / NOAA";
  dictionaries.ja["chain.source.ucdp"] = "ウプサラ紛争データプログラム";
  dictionaries.en["chain.source.ucdp"] = "Uppsala Conflict Data Program";
  dictionaries.ja["chain.jpn11.end_help"] = "家族や近所の力を借り、身近な修理を進めました。";
  dictionaries.en["chain.jpn11.end_help"] = "With help from family and neighbors, you made small repairs.";
  dictionaries.ja["chain.jpn11.end_savings"] = "手元の貯えから修理費を払い、普段の暮らしを少しずつ取り戻しました。";
  dictionaries.en["chain.jpn11.end_savings"] = "You paid for small repairs from your savings, then gradually returned to your routine.";
  dictionaries.ja["chain.repair_cost"] = "住まいの修理費";
  dictionaries.en["chain.repair_cost"] = "Home repairs";
  dictionaries.ja["chain.moving_cost"] = "引っ越し代";
  dictionaries.en["chain.moving_cost"] = "Moving costs";
  if (window.I18N) window.I18N.add(dictionaries);

  function text(key, vars) {
    if (window.I18N) return window.I18N.t("chain." + key, vars);
    return dictionaries.ja["chain." + key];
  }
  function candidate(p, env, year) {
    if (!p || !env || !env.country || env.country.iso !== p.iso || p.abroad || p.chainState || year < (p.chainCooldownUntil || 0)) return null;
    var seen = p.chainSeen || {}, fact;
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      if (row[1] !== p.iso || row[2] !== year || seen[row[0]] || p.abroad || p.age < 18 || p.age > 60) continue;
      if ((row[0] === "ind91" || row[0] === "chn78" || row[0] === "egy11") && !p.job) continue;
      if (row[0] === "jpn11" && !/^(仙台|Sendai)$/.test(p.city || "")) continue;
      if (row[0] === "ukr22" && (!p.urban || !/^(キーウ|ハルキウ|オデーサ|Kyiv|Kharkiv|Odesa)$/.test(p.city || ""))) continue;
      fact = row[0] === "ukr22" ? !!(window.HISTORY && window.HISTORY.UKR &&
        Number(window.HISTORY.UKR.conflict[year]) > 0) :
        (env.facts || []).some(function (item) { return item.y === year && item.cat === row[3] && /^主な出来事/.test(item.src || ""); });
      if (fact) return { id: row[0], source: row[0] === "jpn11" ? "quake" : row[0] === "ukr22" ? "ucdp" :
        row[4] === "World Bank" ? "wb" : row[4] === "Library of Congress" ? "loc" : "state",
        historical: true, year: year, effect: row[11], amount: row[12] };
    }
    // Country rows are current snapshots; never project these triggers into past decades.
    if (year < 2020 || year > 2026 || p.age < 7 || p.age > 65) return null;
    var c = env.country, options = [];
    if (p.age >= 15 && p.wealth <= 3 && c.clean_fuel < 50 && !seen.fuel) options.push({ id: "fuel", source: "who", effect: "h", amount: -1 });
    if (p.age >= 18 && p.urban && !p.house && p.wealth <= 3 && c.urban >= 50 && c.slum >= 20 && !seen.housing) options.push({ id: "housing", source: "wb", effect: "hp", amount: -1 });
    if (p.age <= 12 && c.out_school >= 10 && p.edu && p.edu.level === "none" && ["none", "done"].indexOf(p.edu.stage) >= 0 && !seen.school) options.push({ id: "school", source: "uis", effect: "k", amount: 1 });
    if (p.age >= 25 && p.job && c.oop >= 40 && p.parents &&
        [p.parents.mom, p.parents.dad].some(function (parent) { return parent && parent.alive && parent.age + p.age >= 65; }) && !seen.care)
      options.push({ id: "care", source: "who", effect: "hp", amount: -1 });
    // Only the two measured 2010-to-2020 national trends below are used, for at most five years.
    // These are context for conversation, never a personal exposure or disease probability.
    if (year >= 2020 && year <= 2025 && p.age >= 18 && p.age <= 60) {
      if (p.iso === "nga" && !seen.air_rise) options.push({ id: "air_rise", source: "wb", effect: "r", amount: 1 });
      if (p.iso === "chn" && !seen.air_fall) options.push({ id: "air_fall", source: "wb", effect: "r", amount: 1 });
    }
    return options[0] || null;
  }
  function eligible(p, env, year) { return !!candidate(p, env, year); }
  function yearEnd(p, env, year) {
    if (!p || !env || typeof env.log !== "function") return null;
    var state = p.chainState;
    if (!state) {
      state = candidate(p, env, year);
      if (!state || (env.random && env.random() >= (state.historical ? 0.35 : 0.035))) return null;
      state.started = year;
      state.step = 0;
      p.chainState = state;
      (p.chainSeen || (p.chainSeen = {}))[state.id] = year;
    }
    var step = year - state.started;
    if (step !== [0, 2, 4][state.step]) return null;
    var label = ["start", "middle", "end"][state.step];
    var note = state.historical ? text("historical", { year: state.year }) :
      state.step === 0 ? text(state.id + ".source") : text("estimate");
    var tone = state.step === 0 ? "neutral" : state.amount < 0 && state.step === 1 ? "bad" : "good";
    var options = { cat: state.id === "school" ? "learn" : state.id === "fuel" || state.id === "care" ? "health" : "society",
      tone: tone, big: true, src: text("source." + state.source), stat: note };
    if (state.id === "school" && state.step === 1 && p.edu && p.edu.level === "none") {
      p.edu.stage = "primary";
      options.historyType = "school_start";
      options.level = "primary";
      options.outcome = "enrolled";
    }
    var line = text(state.id + "." + label);
    if (state.id === "jpn11" && state.step === 2) {
      var repair = Number.isFinite(p.net) && p.net > 0 && env.money ? Math.min(p.net, Math.max(10, p.income * 0.01)) : 0;
      if (repair > 0) { env.money(p, text("repair_cost"), -repair); line = text("jpn11.end_savings"); }
      else line = text("jpn11.end_help");
    }
    env.log(line, options);
    if (state.step === 1 && p.stats && Number.isFinite(p.stats[state.effect])) p.stats[state.effect] += state.amount;
    if (state.step === 1 && state.id === "care" && Number.isFinite(p.income)) p.income *= 0.99;
    if (state.step === 2) {
      if (state.historical && state.effect === "k" && Number.isFinite(p.income)) p.income *= 1.01;
      if (state.id === "fuel" && p.stats && Number.isFinite(p.stats.h)) p.stats.h += 1;
      if (state.id === "school" && p.stats && Number.isFinite(p.stats.k)) p.stats.k += 2;
      if (["housing", "care", "egy11", "jpn11", "ukr22"].indexOf(state.id) >= 0 && p.stats && Number.isFinite(p.stats.hp)) p.stats.hp += ["egy11", "jpn11", "ukr22"].indexOf(state.id) >= 0 ? 2 : 1;
      if (state.id === "housing" && env.money && Number.isFinite(p.income)) env.money(p, text("moving_cost"), -Math.max(10, p.income * 0.01));
      p.chainState = null;
      p.chainCooldownUntil = year + 8;
    } else state.step++;
    return state.id;
  }
  window.MEGURI_CHAINS = { eligible: eligible, yearEnd: yearEnd };
})();
