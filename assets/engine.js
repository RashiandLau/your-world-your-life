/* Your World, Your Life：人生シミュレーションの計算部分（画面には触れない） */
(function () {
  "use strict";
  var C = window.COUNTRIES;
  var CULTURE = window.CULTURE || {};
  var JOYS = window.JOYS || {};
  var HISTORY = window.HISTORY || {};
  var SCRIPTS = window.SCRIPTS || { countries: {}, fallbacks: {} };
  function t(key, japanese, vars) {
    if (window.I18N && window.I18N.lang === "en") {
      if (vars && vars.job && vars.jobPhrase == null) vars = Object.assign({}, vars, { jobPhrase: jobPhrase(vars.job) });
      return window.I18N.t(key, vars);
    }
    if (!vars) return japanese;
    return japanese.replace(/\{([a-zA-Z0-9_]+)\}/g, function (_, name) { return vars[name] == null ? "" : vars[name]; });
  }
  function countryName(c) { return window.I18N && window.I18N.lang === "en" ? window.I18N.countryName(c) : c.name; }
  function english() { return !!(window.I18N && window.I18N.lang === "en"); }
  function countKey(key, count) { return english() && Number(count) === 1 ? key + "_one" : key; }
  function jobPhrase(job) {
    var name = String(job || "").trim();
    if (!name || /^(?:a|an|the)\s/i.test(name)) return name;
    return (/^[aeiou]/i.test(name) && !/^uni(?:form|vers|que|on)/i.test(name) ? "an " : "a ") + name;
  }
  function countryValue(c, field, value) { return english() ? window.I18N.countryValue(c, field, value) : value; }
  function translatedList(prefix, items) { return items.map(function (value, i) { return t(prefix + "." + i, value); }); }
  function translatedEntries(prefix, items, fields) {
    return items.map(function (item, i) {
      fields.forEach(function (field) { if (item[field]) item[field] = t(prefix + "." + (item.key || i) + "." + field, item[field]); });
      return item;
    });
  }
  function dataRef(options, src, key, japanese, vars) {
    options.src = src;
    options.stat = t(key === "conscription" ? countKey("engine.reference." + key, vars && vars.years) : "engine.reference." + key, japanese, vars);
    return options;
  }
  function pct(value) { return Number(value).toFixed(1); }
  function historicalSource() { return t("engine.reference.historical_source", "歴史的事実"); }
  function factSourceLabel(fact) {
    var source = String(fact.src || "");
    if (source.indexOf("世界人口") >= 0) return "UN WPP 2024";
    if (source.indexOf("子どもの死亡率") >= 0) return "UN IGME";
    if (source.indexOf("Maddison") >= 0) return "Maddison Project";
    return historicalSource();
  }
  var BY = {};
  C.forEach(function (c) { BY[c.iso] = c; });
  function cultureOf(c) { return c && CULTURE[String(c.iso || "").toLowerCase()] || null; }
  function joysOf(c) { return c && JOYS[String(c.iso || "").toLowerCase()] || null; }
  function scriptOf(c) {
    if (!c) return null;
    return (SCRIPTS.countries || {})[String(c.iso || "").toLowerCase()] ||
      (SCRIPTS.fallbacks || {})[c.grp] || null;
  }
  function scriptText(event, field, index) {
    var key = event.key + (field ? "." + field : "") + (index == null ? "" : "." + index);
    if (window.I18N && typeof window.I18N.t === "function" && window.I18N.dictionaries &&
        window.I18N.dictionaries[window.I18N.lang] &&
        window.I18N.dictionaries[window.I18N.lang][key] != null) return window.I18N.t(key);
    var source = field === "decision" ? event.decision : field === "option" ? event.decision.options[index] : event;
    return source ? (english() ? source.en : source.ja) : "";
  }
  function scriptEligible(p, event, year) {
    if (!event || !event.id || (p.scriptSeen || {})[event.id]) return false;
    var ages = event.age || [0, 115];
    if (p.age < ages[0] || p.age > ages[1]) return false;
    if (event.id === "school_entry" && p.edu.stage !== "primary") return false;
    if (event.kind === "exam" && ["secondary", "univ"].indexOf(p.edu.stage) < 0 && p.edu.level !== "secondary" && p.edu.level !== "univ") return false;
    if (event.id === "first_work" && !p.job) return false;
    if (event.id === "retirement" && !p.job && !p.retired) return false;
    if (event.id === "prom" && p.edu.stage !== "secondary") return false;
    if (event.id === "school_drill" && ["primary", "secondary"].indexOf(p.edu.stage) < 0) return false;
    if (event.id === "national_service" && p.edu.level !== "univ") return false;
    if (event.kind === "child_program" && !p.kids.some(function (kid) { return kid.alive && p.age - kid.born < 18; })) return false;
    if (event.year != null && year !== event.year) return false;
    if (event.minYear != null && year < event.minYear) return false;
    if (event.maxYear != null && year > event.maxYear) return false;
    if (event.urban != null && p.urban !== event.urban) return false;
    if (event.sex && p.sex !== event.sex) return false;
    if (event.religion && (Array.isArray(event.religion) ? event.religion.indexOf(p.religion) < 0 : p.religion !== event.religion)) return false;
    if (event.wealth === "low" && p.wealth > 2 || event.wealth === "high" && p.wealth < 4) return false;
    return true;
  }
  function scriptEvent(p, c) {
    var bundle = scriptOf(c), year = p.birthYear + p.age;
    if (!bundle) return false;
    var categories = ["milestones", "institutions", "eras", "habits"], eligible = [];
    categories.forEach(function (category) {
      (bundle[category] || []).forEach(function (event) {
        if (!scriptEligible(p, event, year)) return;
        var probability = event.prob == null ? 1 : Number(event.prob);
        if (!isFinite(probability)) return;
        // Access to optional schooling and services varies with means and location.
        if (category === "institutions" || event.kind === "exam") probability *= clamp(1 + (p.wealth - 3) * 0.09 + (p.urban ? 0.06 : -0.06), 0.45, 1.4);
        if (category === "habits") probability *= p.urban ? 1.03 : 0.97;
        if (chance(clamp(probability, 0, 1))) eligible.push({ event: event, category: category });
      });
    });
    if (!eligible.length) return false;
    // A dated event is kept visible when it coincides with an ordinary milestone.
    var dated = eligible.filter(function (item) { return item.event.year != null; });
    var chosen = pick(dated.length ? dated : eligible), event = chosen.event;
    p.scriptSeen = p.scriptSeen || {};
    p.scriptSeen[event.id] = true;
    var cat = chosen.category === "milestones" ? "family" : chosen.category === "institutions" ? "society" : chosen.category === "eras" ? "world" : "family";
    var scriptOptions = { script: true, scriptId: event.id, cat: cat, big: chosen.category === "eras" };
    if (event.year != null) dataRef(scriptOptions, historicalSource(), "script_year", "{year}年に記録された出来事です。", { year: event.year });
    else if (event.kind === "exam" && hasNumber(c, "lsec_compl"))
      dataRef(scriptOptions, "World Bank WDI", "secondary_completion", "この国の前期中等教育修了率は{rate}％です。", { rate: pct(c.lsec_compl) });
    else if (event.source && event.minYear != null)
      dataRef(scriptOptions, historicalSource(), "script_since", "この制度は{year}年以降の出来事として記録されています。", { year: event.minYear });
    addLog(p, scriptText(event), scriptOptions);
    if (event.decision && event.decision.options && event.decision.options.length >= 2 && !p.pending && !p.eduMode && p.decisionCount < 24) {
      p.scriptPending = event;
      p.pending = "countryScript";
    }
    return true;
  }
  var YEN_PER_PPP = 100;
  var LOG_CATS = {
    health: { label: t("engine.category.health", "健康・医療") },
    family: { label: t("engine.category.family", "家族・暮らし") },
    work: { label: t("engine.category.work", "仕事・お金") },
    learn: { label: t("engine.category.learn", "学び") },
    society: { label: t("engine.category.society", "社会・政治") },
    disaster: { label: t("engine.category.disaster", "災害・環境") },
    economy: { label: t("engine.category.economy", "経済") },
    world: { label: t("engine.category.world", "世界の動き") }
  };

  // ---------- 乱数 ----------
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var R = Math.random;
  var NR = null;
  function setRandom(f) { R = f; }
  function nameRandom() { return NR ? NR() : R(); }
  function namePick(a) { return a[Math.floor(nameRandom() * a.length)]; }
  function skipNameDraws(n) { for (var i = 0; i < n; i++) R(); }
  function pick(a) { return a[Math.floor(R() * a.length)]; }
  function chance(p) { return R() < p; }
  function stableChance(p, identity, age, rate) {
    var key = p.id + ":" + identity + ":" + age, hash = 2166136261;
    for (var i = 0; i < key.length; i++) hash = Math.imul(hash ^ key.charCodeAt(i), 16777619);
    return (hash >>> 0) / 4294967296 < rate;
  }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function hasNumber(c, key) { return c && typeof c[key] === "number" && isFinite(c[key]); }
  function percentage(c, key, fallback) { return hasNumber(c, key) ? clamp(c[key], 0, 100) / 100 : fallback; }
  function eraMarriageAge(p, c) {
    var key = p.sex === "f" ? "age_marr_f" : "age_marr_m";
    if (!hasNumber(c, key)) return null;
    return clamp(c[key] + (p.era === "past" ? clamp((p.birthYear - 2026) * 0.035, -2.7, 0) : p.era === "future" ? 1 : 0), 16, 48);
  }
  function logisticCdf(x) { return 1 / (1 + Math.exp(-1.702 * x)); }
  function marriageChance(p, c, age) {
    var median = eraMarriageAge(p, c);
    if (median === null) return age >= 18 && age <= 45 ? 0.17 : 0;
    var now = logisticCdf((age + 0.5 - median) / 4.3), before = logisticCdf((age - 0.5 - median) / 4.3);
    return age >= 16 && age <= 55 ? clamp((now - before) / Math.max(0.01, 1 - before), 0, 0.85) : 0;
  }
  function sameSexMarriageLegal(c, year) {
    return hasNumber(c, "ss_marriage_year") && c.ss_marriage_year > 0 && year >= c.ss_marriage_year;
  }
  function retirementAge(p, c) {
    var key = p.sex === "f" ? "retirement_age_f" : "retirement_age_m";
    return hasNumber(c, key) ? clamp(Math.ceil(c[key]), 50, 75) : 65;
  }
  function sampleFamilyTarget(c, sex) {
    if (!hasNumber(c, "tfr")) return null;
    // Without a measured marriage-age curve, some planned births are lost to later partnership and decisions.
    var target = c.tfr * (hasNumber(c, sex === "f" ? "age_marr_f" : "age_marr_m") ? 1 : 1.2);
    return Math.floor(target) + (chance(target % 1) ? 1 : 0);
  }
  function pensionProbability(p, c) {
    if (!hasNumber(c, "pension_cov")) return !p.informal && c.gdp >= 5000 ? clamp(c.gdp / 40000, 0.2, 0.9) : 0;
    var rate = percentage(c, "pension_cov", 0);
    // Social insurance coverage is a population rate. Keep personal work status
    // as a relative modifier so very small national rates do not gain a floor.
    if (hasNumber(c, "informal")) rate *= 1 + (percentage(c, "informal", 0) - (p.informal ? 1 : 0)) * 0.4;
    if (hasNumber(c, "vuln_emp")) rate *= 1 + (percentage(c, "vuln_emp", 0) - (p.vulnerableWork ? 1 : 0)) * 0.2;
    if (hasNumber(c, "self_emp")) rate *= 1 + (percentage(c, "self_emp", 0) - (p.selfEmployed ? 1 : 0)) * 0.15;
    return clamp(rate, 0, 1);
  }
  function weighted(items, w) {
    var s = 0, i;
    for (i = 0; i < items.length; i++) s += w(items[i]);
    var x = R() * s;
    for (i = 0; i < items.length; i++) { x -= w(items[i]); if (x <= 0) return items[i]; }
    return items[items.length - 1];
  }
  function gauss() { return Math.sqrt(-2 * Math.log(R() || 1e-9)) * Math.cos(2 * Math.PI * R()); }

  // ---------- 名前 ----------
  var NAMES = {
    sa: { m: ["Arjun", "Rahul", "Imran", "Vikram", "Sanjay", "Farhan", "Rohit", "Anil", "Tariq", "Kabir"], f: ["Priya", "Ananya", "Fatima", "Kavya", "Sunita", "Ayesha", "Meera", "Nisha", "Rekha", "Sana"], l: ["Sharma", "Khan", "Das", "Reddy", "Hossain", "Iyer", "Ali", "Patil", "Chowdhury", "Nair"] },
    ea: { m: ["浩然", "子轩", "宇航", "明哲", "建国", "志强", "俊杰", "立新"], f: ["欣怡", "梓涵", "雨桐", "秀英", "丽娟", "思琪", "佳怡", "晓燕"], l: ["王", "李", "張", "劉", "陳", "楊", "黄", "趙"], cjk: 1 },
    jp: { m: ["蒼", "湊", "陽翔", "悠真", "大輝", "健太", "翔", "隆"], f: ["結菜", "陽葵", "紬", "美咲", "葵", "千尋", "花", "由佳"], l: ["佐藤", "鈴木", "高橋", "田中", "伊藤", "渡辺", "山本", "中村"], cjk: 1 },
    kr: { m: ["Minjun", "Seojun", "Jiho", "Hyunwoo", "Dohyun"], f: ["Seoyeon", "Jiwoo", "Hayoon", "Minji", "Yuna"], l: ["Kim", "Lee", "Park", "Choi", "Jung"], fam1: 1 },
    wa: { m: ["Chinedu", "Kwame", "Emeka", "Yaw", "Tunde", "Ibrahim", "Kofi", "Segun"], f: ["Ngozi", "Ama", "Aisha", "Funmi", "Akosua", "Chiamaka", "Efua", "Halima"], l: ["Okafor", "Mensah", "Adeyemi", "Bello", "Owusu", "Eze", "Boateng", "Musa"] },
    ca: { m: ["Jean", "Patrick", "Christian", "Didier", "Fiston", "Gloire"], f: ["Grace", "Esther", "Nadine", "Divine", "Merveille", "Sandrine"], l: ["Kabeya", "Mbuyi", "Ilunga", "Lukusa", "Kalala", "Ngoy"] },
    ea_af: { m: ["Dawit", "Juma", "Baraka", "Tesfaye", "Kato", "Sipho", "Otieno", "Musa"], f: ["Selam", "Neema", "Amani", "Hiwot", "Nakato", "Zanele", "Wanjiru", "Rehema"], l: ["Bekele", "Mwangi", "Okello", "Haile", "Ndlovu", "Kiprono", "Mollel", "Nsubuga"] },
    me: { m: ["Omar", "Ahmed", "Reza", "Youssef", "Ali", "Hamid", "Karim", "Tarek"], f: ["Fatima", "Maryam", "Leila", "Nour", "Sara", "Huda", "Amina", "Yasmin"], l: ["Hassan", "Karimi", "Abdullah", "Rahimi", "Mahmoud", "Osman", "Ibrahim", "Saleh"] },
    tr: { m: ["Mehmet", "Emre", "Mustafa", "Burak", "Can"], f: ["Zeynep", "Elif", "Ayşe", "Fatma", "Defne"], l: ["Yılmaz", "Demir", "Kaya", "Şahin", "Çelik"] },
    se: { m: ["Budi", "Minh", "Jose", "Somchai", "Aung", "Rizky", "Tuan", "Mark"], f: ["Siti", "Lan", "Maria", "Ploy", "Thida", "Dewi", "Hoa", "Joy"], l: ["Santoso", "Nguyen", "Reyes", "Saetang", "Win", "Wijaya", "Tran", "Cruz"] },
    la: { m: ["Mateus", "José", "Diego", "Luis", "Gabriel", "Carlos", "Pedro", "Miguel"], f: ["Ana", "Camila", "Lucía", "Beatriz", "Fernanda", "Valeria", "Julia", "Sofía"], l: ["Silva", "Hernández", "Santos", "García", "Oliveira", "López", "Souza", "Ramírez"] },
    we: { m: ["Liam", "Lukas", "Hugo", "Oliver", "Noah", "Felix", "Louis", "James"], f: ["Emma", "Mia", "Chloé", "Olivia", "Hannah", "Léa", "Amelia", "Sophie"], l: ["Smith", "Müller", "Martin", "Johnson", "Schmidt", "Bernard", "Brown", "Dubois"] },
    ru: { m: ["Ivan", "Dmitri", "Artyom", "Sergei", "Maksim"], f: ["Anna", "Daria", "Polina", "Olga", "Sofia"], l: ["Ivanov", "Smirnov", "Kuznetsov", "Popov", "Sokolov"], fem: 1 },
    eu: { m: ["Lars", "Milan", "Tomas", "Nikola", "Mateo", "Andrei", "Pavel", "Luka", "Erik", "Stefan"], f: ["Ingrid", "Elena", "Marta", "Ivana", "Sofia", "Katarina", "Zuzana", "Lucia", "Freja", "Nina"], l: ["Novak", "Kovač", "Petrov", "Horvat", "Nowak", "Rossi", "Berg", "Popescu", "Jensen", "Marković"] },
    cas: { m: ["Arman", "Nursultan", "Bekzod", "Temur", "Giorgi", "Levan", "Aram", "Tigran", "Rashad", "Murad"], f: ["Aigerim", "Madina", "Dilnoza", "Gulnora", "Nino", "Mariam", "Anahit", "Lilit", "Leyla", "Aysel"], l: ["Sadykov", "Karimov", "Yusupov", "Abdullayev", "Beridze", "Kapanadze", "Sargsyan", "Grigoryan", "Aliyev", "Mammadov"] },
    pac: { m: ["Jone", "Sione", "Tane", "Hemi", "Mika", "Peter", "Liam", "Ari", "Kila", "Noah"], f: ["Mere", "Litia", "Moana", "Aroha", "Salote", "Leilani", "Grace", "Ruby", "Mila", "Anika"], l: ["Naivalu", "Ratu", "Fale", "Tavita", "Kila", "Wari", "Williams", "Thompson", "Ngata", "Tau"] }
  };
  NAMES.ind_hindu = { m: ["Arjun", "Rahul", "Vikram", "Sanjay", "Rohit", "Anil"], f: ["Priya", "Ananya", "Kavya", "Sunita", "Meera", "Nisha"], l: ["Sharma", "Reddy", "Iyer", "Patil", "Nair", "Das"] };
  NAMES.ind_muslim = { m: ["Imran", "Farhan", "Tariq", "Kabir", "Aamir"], f: ["Fatima", "Ayesha", "Sana", "Zoya", "Maryam"], l: ["Khan", "Ali", "Siddiqui", "Ansari", "Qureshi"] };
  NAMES.ind_sikh = { m: ["Gurpreet", "Harpreet", "Jaspreet", "Amrit"], f: ["Simran", "Kiran", "Navpreet", "Gurleen"], l: ["Singh", "Kaur", "Gill", "Sandhu"] };
  NAMES.ind_christian = { m: ["Joseph", "Thomas", "John", "Mathew"], f: ["Mary", "Anna", "Grace", "Teresa"], l: ["Thomas", "Fernandes", "D'Souza", "Varghese"] };
  NAMES.pak = { m: ["Ahmed", "Ali", "Bilal", "Hamza", "Usman", "Imran"], f: ["Ayesha", "Fatima", "Zainab", "Sana", "Maryam"], l: ["Khan", "Ahmed", "Malik", "Qureshi", "Hussain"] };
  NAMES.bgd = { m: ["Rahim", "Hasan", "Arif", "Mahmud", "Imran"], f: ["Ayesha", "Nusrat", "Farzana", "Rima", "Samira"], l: ["Rahman", "Hossain", "Islam", "Chowdhury", "Ahmed"] };
  NAMES.afg = { m: ["Ahmad", "Farid", "Omar", "Hamid", "Zahir"], f: ["Laila", "Mariam", "Fatima", "Zarmina", "Amina"], l: ["Rahimi", "Ahmadi", "Khan", "Hussaini", "Naziri"] };
  NAMES.nga_muslim = { m: ["Ibrahim", "Musa", "Yusuf", "Sani", "Abdullahi"], f: ["Aisha", "Halima", "Zainab", "Maryam", "Hauwa"], l: ["Bello", "Musa", "Abubakar", "Usman", "Suleiman"] };
  NAMES.nga_christian = { m: ["Chinedu", "Emeka", "Tunde", "Samuel", "Daniel"], f: ["Ngozi", "Chiamaka", "Grace", "Esther", "Funmi"], l: ["Okafor", "Adeyemi", "Eze", "Okoro", "Adebayo"] };
  function namePool(c, religion) {
    var key = c.iso;
    if (key === "ind") key = /イスラム/.test(religion) ? "ind_muslim" : /シク/.test(religion) ? "ind_sikh" : /キリスト/.test(religion) ? "ind_christian" : "ind_hindu";
    if (key === "nga") key = /イスラム/.test(religion) ? "nga_muslim" : "nga_christian";
    return NAMES[key] || NAMES[c.grp] || NAMES.we;
  }
  function nameReligion(religion) {
    if (/イスラム|Islam|Muslim/i.test(religion || "")) return "muslim";
    if (/ヒンドゥー|Hindu/i.test(religion || "")) return "hindu";
    if (/シク|Sikh/i.test(religion || "")) return "sikh";
    if (/キリスト|Christian/i.test(religion || "")) return "christian";
    if (/仏教|Buddhis/i.test(religion || "")) return "buddhist";
    return "";
  }
  function nameChoice(c, religion, preferredGroup) {
    var data = window.NAMES_DATA;
    var entry = data && data.countries && data.countries[String(c.iso || "").toLowerCase()];
    if (!entry || !entry.groups || !entry.groups.length) return null;
    var groups = entry.groups.filter(function (group) { return data.pools && data.pools[group.pool]; });
    if (!groups.length) return null;
    var rel = nameReligion(religion);
    var matching = rel && groups.filter(function (group) { return group.religion === rel; });
    if (matching && matching.length) groups = matching;
    else if (rel) {
      var neutral = groups.filter(function (group) { return !group.religion; });
      if (neutral.length) groups = neutral;
    }
    if (preferredGroup) {
      var preferred = groups.filter(function (group) { return group.pool === preferredGroup; });
      if (preferred.length) groups = preferred;
    }
    var total = 0, i;
    for (i = 0; i < groups.length; i++) total += Math.max(0, Number(groups[i].weight) || 0);
    var mark = nameRandom() * total, chosen = groups[groups.length - 1];
    for (i = 0; i < groups.length; i++) {
      mark -= Math.max(0, Number(groups[i].weight) || 0);
      if (mark <= 0) { chosen = groups[i]; break; }
    }
    return { entry: entry, pool: data.pools[chosen.pool], group: chosen.pool, convention: chosen.convention };
  }
  function parentNamePart(parent, field) {
    return parent && typeof parent === "object" ? parent[field] || "" : "";
  }
  function firstSurname(name) { return name ? String(name).split(" ")[0] : ""; }
  function icelandicSuffix(given, sex) {
    var name = String(given || "");
    var genitive = { Gunnar: "Gunnars", Jón: "Jóns", Ólafur: "Ólafs", Einar: "Einars", Magnús: "Magnúsar", Sigurður: "Sigurðar", Helgi: "Helga", Ari: "Ara", Anna: "Önnu" };
    var stem = genitive[name] || (/ur$/i.test(name) ? name.slice(0, -2) + "s" : /[rns]$/i.test(name) ? name + (/s$/i.test(name) ? "" : "s") : name);
    return stem + (sex === "f" ? "dóttir" : "son");
  }
  function russianPatronymic(given, sex) {
    var stem = String(given || "").replace(/[iy]$/i, "");
    return stem + (sex === "f" ? "ovna" : "ovich");
  }
  function poolName(pool, field, birthYear, native, forcedIndex, forceModern) {
    var past = !forceModern && birthYear <= 1975 && pool.past && pool.past[field] && pool.past[field].length;
    var names = past ? pool.past[field] : pool[field];
    if (!names || !names.length) return "";
    var preferred = !past && pool.preferred && Number(pool.preferred[field]) || 0;
    var limit = preferred > 0 && nameRandom() < 0.8 ? Math.min(preferred, names.length) : names.length;
    var index = forcedIndex == null ? Math.floor(nameRandom() * limit) : forcedIndex % names.length;
    if (native && pool.native && pool.native[field]) {
      if (past && pool.native.past && pool.native.past[field] && pool.native.past[field][index]) return pool.native.past[field][index];
      var nativeIndex = past && pool[field] ? pool[field].indexOf(names[index]) : index;
      if (nativeIndex >= 0 && nativeIndex < pool.native[field].length) return pool.native[field][nativeIndex];
    }
    return names[index];
  }
  function makeName(c, sex, family, religion) {
    var context = family && typeof family === "object" ? family : {};
    var choice = nameChoice(c, religion || "", context.group);
    if (!choice) {
      var legacy = namePool(c, religion || "");
      var oldNames = sex === "m" ? legacy.m : legacy.f;
      var oldGiven = context.givenIndex == null ? namePick(oldNames) : oldNames[context.givenIndex % oldNames.length];
      var oldFamily = typeof family === "string" && family ? family : context.family || parentNamePart(context.father, "family") || namePick(legacy.l);
      var oldShown = legacy.fem && sex === "f" && !/a$/.test(oldFamily) ? oldFamily + "a" : oldFamily;
      return { given: oldGiven, family: oldFamily, firstSurname: firstSurname(oldFamily), full: legacy.cjk ? oldFamily + oldGiven : legacy.fam1 ? oldShown + " " + oldGiven : oldGiven + " " + oldShown };
    }
    var pool = choice.pool, convention = choice.convention || choice.entry.convention || "given-family";
    var birthYear = context.birthYear || c.birthYear || 2026;
    var native = !english() && /^(chn|jpn|kor)$/.test(String(c.iso || "").toLowerCase());
    var father = context.father, mother = context.mother;
    var given = poolName(pool, sex, birthYear, native, context.givenIndex, context.forceModern);
    var familyName = typeof family === "string" ? family : context.family || parentNamePart(father, "family") || "";
    var first = "", middle = "", shownFamily = "";
    if (convention === "patronymic") {
      familyName = parentNamePart(father, "given") || familyName || poolName(pool, "m", birthYear - 28, native);
      first = familyName;
    } else if (convention === "icelandic") {
      var parentGiven = parentNamePart(father, "given") || parentNamePart(mother, "given") || familyName || poolName(pool, "m", birthYear - 28, native);
      familyName = icelandicSuffix(parentGiven, sex);
      first = familyName;
    } else if (convention === "double-family") {
      var paternal = parentNamePart(father, "firstSurname") || firstSurname(parentNamePart(father, "family"));
      var maternal = parentNamePart(mother, "firstSurname") || firstSurname(parentNamePart(mother, "family"));
      if (paternal && maternal) familyName = paternal + " " + maternal;
      else if (!familyName) familyName = poolName(pool, "l", birthYear, native) + " " + poolName(pool, "l", birthYear, native);
      first = paternal || firstSurname(familyName);
    } else {
      if (!familyName && !(convention === "single-optional" && father)) familyName = poolName(pool, "l", birthYear, native);
      first = firstSurname(familyName);
    }
    if (convention === "arabic") {
      middle = parentNamePart(father, "given") || poolName(pool, "m", birthYear - 28, native);
    } else if (convention === "russian" && father && nameRandom() < 0.7) {
      middle = russianPatronymic(parentNamePart(father, "given"), sex);
    }
    if (convention === "single-optional" && !context.family && !father && nameRandom() < 0.5) familyName = "";
    shownFamily = familyName;
    if (convention === "russian" && sex === "f" && /(?:ov|ev|in|yn)$/i.test(shownFamily)) shownFamily += "a";
    var full = convention === "family-given" ? shownFamily + (native ? "" : " ") + given : [given, middle, shownFamily].filter(Boolean).join(" ");
    return { given: given, family: familyName, firstSurname: first, full: full, group: choice.group, middle: middle };
  }
  function uniqueName(c, sex, context, religion) {
    var result, attempts = 0;
    do { result = makeName(c, sex, context, religion); attempts++; }
    while (context.seen && context.seen.indexOf(result.full) >= 0 && attempts < 40);
    if (context.seen && context.seen.indexOf(result.full) >= 0) {
      for (var phase = 0; phase < 2 && context.seen.indexOf(result.full) >= 0; phase++) {
        context.forceModern = !!phase;
        for (var i = 0; i < 100 && context.seen.indexOf(result.full) >= 0; i++) {
          context.givenIndex = i;
          result = makeName(c, sex, context, religion);
        }
      }
      delete context.givenIndex;
      delete context.forceModern;
    }
    if (context.seen) context.seen.push(result.full);
    return result;
  }

  // ---------- 時代 ----------
  var ERAS = {
    past: { label: t("engine.era.past", "むかしの世界"), year: 1960, le: -14, gdp: 0.25, u5: 4.5 },
    now: { label: t("engine.era.now", "いまの世界"), year: 2026, le: 0, gdp: 1, u5: 1 },
    future: { label: t("engine.era.future", "これからの世界"), year: 2026, le: 4, gdp: 1.7, u5: 0.45 }
  };

  // ---------- 死亡率 ----------
  // 0–4歳は5歳未満死亡率から、5歳以降はゴンペルツ型の曲線を平均寿命に合わせて調整する
  var mortCache = {};
  var cohortCache = {};
  var lifeData = window.LIFETABLES || { who: {}, series: {} };
  // The home screen can initialize before the large reference tables arrive.
  function refreshData() {
    CULTURE = window.CULTURE || {};
    JOYS = window.JOYS || {};
    HISTORY = window.HISTORY || {};
    SCRIPTS = window.SCRIPTS || { countries: {}, fallbacks: {} };
    lifeData = window.LIFETABLES || { who: {}, series: {} };
    mortCache = {};
    cohortCache = {};
    worldBirthsCache = {};
    birthWeightTotals = {};
    window.MEGURI.lifeTablesLoaded = !!window.LIFETABLES;
  }
  function e0(q) {
    var l = 1, e = 0;
    for (var x = 0; x <= 115; x++) { var d = l * q[x]; e += l - d / 2; l -= d; }
    return e;
  }
  function table(u5, target) {
    var key = u5.toFixed(3) + "|" + target.toFixed(2);
    if (mortCache[key]) return mortCache[key];
    var B = 0.088, bg = 0.0004 + u5 * 0.004;
    function build(A) {
      var q = [];
      for (var x = 0; x <= 115; x++) {
        if (x === 0) q.push(u5 * 0.72);
        else if (x < 5) q.push(u5 * 0.07);
        else q.push(Math.min(1, A * Math.exp(B * (x - 30)) + bg));
      }
      q[115] = 1;
      return q;
    }
    var lo = 1e-6, hi = 0.2, q;
    for (var i = 0; i < 50; i++) {
      var mid = Math.sqrt(lo * hi);
      q = build(mid);
      if (e0(q) > target) lo = mid; else hi = mid;
    }
    mortCache[key] = q;
    return q;
  }
  function seriesValue(c, field, year) {
    var s = lifeData.series[c.iso.toUpperCase()];
    if (!s || !s[field]) return null;
    var v = s[field], pos = clamp((year - s.y0) / s.step, 0, v.length - 1);
    var lo = Math.floor(pos), hi = Math.ceil(pos);
    if (v[lo] == null && v[hi] == null) return null;
    if (v[lo] == null) return v[hi];
    if (v[hi] == null) return v[lo];
    return v[lo] + (v[hi] - v[lo]) * (pos - lo);
  }
  // 出生年の統計（5歳未満の死亡・所得・世界の出生に占める割合）。データがない項目は現在の値を返す
  var worldBirthsCache = {}, birthWeightTotals = {};
  function yearStats(c, year) {
    var u5 = seriesValue(c, "u5", year), g = seriesValue(c, "gdp", year), b = seriesValue(c, "births", year);
    var share = c.share;
    if (b != null) {
      var key = Math.round(year);
      if (!(key in worldBirthsCache)) {
        var sum = 0;
        C.forEach(function (x) { var v = seriesValue(x, "births", year); if (v != null) sum += v; });
        worldBirthsCache[key] = sum;
      }
      if (worldBirthsCache[key] > 0) share = Math.round(b / worldBirthsCache[key] * 10000) / 100;
    }
    return { u5: u5 == null ? c.u5 : u5, gdp: g == null ? c.gdp : Math.round(c.gdp * g), share: share };
  }
  function birthWeight(c, method, year, era) {
    if (era !== "past") return method === "pop" ? c.pop : c.share;
    var value = seriesValue(c, method === "pop" ? "pop" : "births", year);
    return value == null ? (method === "pop" ? c.pop : c.share * 1000) : Math.max(0, value);
  }
  function birthSnapshot(c, year, era, method) {
    era = era || (year < 2026 ? "past" : "now");
    method = method === "pop" ? "pop" : "births";
    var historical = era === "past", stats = historical ? yearStats(c, year) : { u5: c.u5, gdp: c.gdp, share: c.share };
    var totalKey = era + "|" + year + "|" + method;
    if (!(totalKey in birthWeightTotals)) birthWeightTotals[totalKey] = C.reduce(function (sum, item) { return sum + birthWeight(item, method, year, era); }, 0);
    var totalWeight = birthWeightTotals[totalKey];
    var fromSeries = function (field) { return historical && seriesValue(c, field, year) != null ? year : null; };
    return {
      iso: c.iso, year: year, method: method, u5: stats.u5, gdp: stats.gdp, share: stats.share,
      odds: totalWeight ? birthWeight(c, method, year, era) / totalWeight * 100 : 0,
      leFemale: historical ? targetStats(c, "f", year).le : c.lef,
      leMale: historical ? targetStats(c, "m", year).le : c.lem,
      school: c.school,
      sources: {
        u5: { name: "UN IGME", year: fromSeries("u5") },
        gdp: { name: "World Bank", year: fromSeries("gdp") },
        share: { name: "UN WPP", year: fromSeries("births") },
        odds: { name: method === "pop" ? "UN WPP population" : "UN WPP births", year: fromSeries(method === "pop" ? "pop" : "births") },
        le: { name: "UN WPP", year: fromSeries("lef") },
        school: { name: "UNESCO/UNDP", year: null }
      }
    };
  }
  function targetStats(c, sex, year) {
    var field = sex === "f" ? "lef" : "lem";
    var le = seriesValue(c, field, year), u5 = seriesValue(c, "u5", year);
    return { le: le == null ? c[field] : le, u5: u5 == null ? c.u5 : u5 };
  }
  function personStats(p, c, sex, year) {
    return p.era === "now" ? { le: sex === "f" ? c.lef : c.lem, u5: c.u5 } : targetStats(c, sex, year);
  }
  function whoBase(c, sex) {
    var w = lifeData.who[c.iso.toUpperCase()];
    if (!w || !w[sex] || w[sex].length !== 19) return null;
    var key = "base|" + c.iso + "|" + sex;
    if (mortCache[key]) return mortCache[key];
    var widths = [1, 4], q = [], i, j, annual;
    for (i = 0; i < 16; i++) widths.push(5);
    for (i = 0; i < 18; i++) {
      annual = 1 - Math.pow(1 - clamp(w[sex][i], 0, 1), 1 / widths[i]);
      for (j = 0; j < widths[i]; j++) q.push(annual);
    }
    var start = Math.max(q[84] * 1.08, 0.02);
    for (i = 85; i <= 115; i++) q.push(i === 115 ? 1 : Math.min(0.9999, start * Math.exp(0.105 * (i - 85))));
    mortCache[key] = q;
    return q;
  }
  function periodTable(c, sex, stats) {
    var target = Math.max(25, stats.le), child = clamp(stats.u5 / 100, 0.0001, 0.6);
    var key = "period|" + c.iso + "|" + sex + "|" + target.toFixed(2) + "|" + child.toFixed(5);
    if (mortCache[key]) return mortCache[key];
    var base = whoBase(c, sex);
    if (!base) return table(child, target);
    var baseSurvive = 1, i;
    for (i = 0; i < 5; i++) baseSurvive *= 1 - base[i];
    var childScale = Math.log(1 - child) / Math.log(Math.max(1e-12, baseSurvive));
    function build(scale) {
      var q = [];
      for (var age = 0; age <= 115; age++) {
        q.push(age < 5 ? 1 - Math.pow(1 - base[age], childScale) : Math.min(1, base[age] * scale));
      }
      q[115] = 1;
      return q;
    }
    var lo = 0.00001, hi = 100, q;
    for (i = 0; i < 38; i++) {
      var mid = Math.sqrt(lo * hi);
      q = build(mid);
      if (e0(q) > target) lo = mid; else hi = mid;
    }
    mortCache[key] = q;
    return q;
  }
  function survival(q) {
    var l = 1, out = [];
    for (var x = 0; x <= 110; x++) { out.push(l); l *= 1 - q[x]; }
    return out;
  }
  function eraOf(p) {
    if (p.era === "now") return ERAS.now;
    var ratio = seriesValue(BY[p.iso], "gdp", p.birthYear + p.age);
    return { gdp: ratio == null ? (ERAS[p.era] || ERAS.now).gdp : ratio };
  }
  function lifeTable(c, sex, eraKey, birthYear) {
    if (!birthYear || eraKey === "now" || !lifeData.series[c.iso.toUpperCase()]) {
      return periodTable(c, sex, { le: sex === "f" ? c.lef : c.lem, u5: c.u5 });
    }
    var key = "cohort|" + c.iso + "|" + sex + "|" + birthYear;
    if (cohortCache[key]) return cohortCache[key];
    var q = [], s = lifeData.series[c.iso.toUpperCase()];
    for (var age = 0; age <= 115; age++) {
      var position = clamp((birthYear + age - s.y0) / s.step, 0, s.lef.length - 1);
      var low = Math.floor(position), high = Math.ceil(position);
      var first = periodTable(c, sex, targetStats(c, sex, s.y0 + low * s.step))[age];
      var second = high === low ? first : periodTable(c, sex, targetStats(c, sex, s.y0 + high * s.step))[age];
      q.push(first + (second - first) * (position - low));
    }
    q[115] = 1;
    cohortCache[key] = q;
    return q;
  }
  function worldTable() {
    var u5 = 0, lf = 0, s = 0;
    C.forEach(function (c) { u5 += c.u5 * c.share; lf += (c.lef + c.lem) / 2 * c.share; s += c.share; });
    return table(u5 / s / 100, lf / s);
  }

  // ---------- 仕事 ----------
  var JOBS = {
    none: [[t("engine.job.farmhand", "農家の手伝い・小作"), 0.35, "agri"], [t("engine.job.street_vendor", "露天商"), 0.45], [t("engine.job.construction", "建設作業員"), 0.55], [t("engine.job.domestic", "家事労働者"), 0.4], [t("engine.job.day_laborer", "日雇いの運び手"), 0.4], [t("engine.job.fisher", "漁師"), 0.45, "agri"]],
    primary: [[t("engine.job.factory", "工場の作業員"), 0.7], [t("engine.job.restaurant", "飲食店の店員"), 0.6], [t("engine.job.motorbike_taxi", "バイクタクシーの運転手"), 0.65], [t("engine.job.market", "市場の商人"), 0.7], [t("engine.job.farmer", "農家"), 0.5, "agri"], [t("engine.job.garment", "縫製工"), 0.6]],
    secondary: [[t("engine.job.office", "事務員"), 1.0], [t("engine.job.sales", "販売員"), 0.85], [t("engine.job.truck", "トラック運転手"), 1.0], [t("engine.job.electrician", "電気工"), 1.1], [t("engine.job.cook", "調理師"), 0.95], [t("engine.job.care_worker", "介護士"), 0.9], [t("engine.job.police", "警察官"), 1.2]],
    univ: [[t("engine.job.teacher", "教師"), 1.4], [t("engine.job.nurse", "看護師"), 1.5], [t("engine.job.engineer", "技術者"), 2.0], [t("engine.job.accountant", "会計士"), 1.9], [t("engine.job.doctor", "医師"), 3.0], [t("engine.job.civil_servant", "公務員"), 1.6], [t("engine.job.programmer", "プログラマー"), 2.2], [t("engine.job.researcher", "研究者"), 1.8], [t("engine.job.lawyer", "弁護士"), 2.6]]
  };
  var EDU_LABEL = { pre: t("engine.edu.pre", "就学前"), none: t("engine.edu.none", "学校に通っていない"), primary: t("engine.edu.primary", "初等教育"), secondary: t("engine.edu.secondary", "中等教育"), univ: t("engine.edu.univ", "大学"), inprimary: t("engine.edu.inprimary", "小学校に在学中"), insecondary: t("engine.edu.insecondary", "中学・高校に在学中"), inuniv: t("engine.edu.inuniv", "大学に在学中") };
  var WEALTH_LABEL = ["", t("engine.wealth.poorest", "いちばん貧しい層の"), t("engine.wealth.poor", "暮らしに余裕のない"), t("engine.wealth.middle", "ふつうの"), t("engine.wealth.comfortable", "暮らし向きのよい"), t("engine.wealth.richest", "いちばん豊かな層の")];

  var TEMPERAMENTS = [
    { k: "explore", label: t("engine.temperament.explore", "好奇心が強い"), toy: t("engine.toy.explore", "ひっくり返して、どこが動くか探る") },
    { k: "active", label: t("engine.temperament.active", "活発"), toy: t("engine.toy.active", "おもちゃを抱えて、家じゅうを駆けまわる") },
    { k: "social", label: t("engine.temperament.social", "人なつこい"), toy: t("engine.toy.social", "近くの大人に見せて、いっしょに遊ぼうと誘う") },
    { k: "grit", label: t("engine.temperament.grit", "粘り強い"), toy: t("engine.toy.grit", "うまくいかなくても、やり方を変えて何度も試す") }
  ];

  var FOCI = [
    { k: "work", label: t("engine.focus.work", "仕事に打ち込む"), sl: t("engine.focus.study", "勉強に打ち込む"), d: t("engine.focus.work.effect", "収入・昇進↑ 健康・人間関係↓"), sd: t("engine.focus.study.effect", "知識↑↑ 幸福↓") },
    { k: "balance", label: t("engine.focus.balance", "バランス"), d: t("engine.focus.balance.effect", "少しずつ全部") },
    { k: "family", label: t("engine.focus.family", "家族・友人"), d: t("engine.focus.family.effect", "人間関係↑ 幸福↑") },
    { k: "health", label: t("engine.focus.health", "体を大切に"), d: t("engine.focus.health.effect", "健康↑ お金が少し↓") },
    { k: "learn", label: t("engine.focus.learn", "学び直し"), sl: t("engine.focus.read", "本を読む"), d: t("engine.focus.learn.effect", "知識↑ 転職の話↑"), sd: t("engine.focus.read.effect", "知識↑") },
    { k: "hobby", label: t("engine.focus.hobby", "趣味"), d: t("engine.focus.hobby.effect", "幸福↑ 腕前↑") }
  ];
  var HOBBIES = translatedList("engine.hobby", ["料理", "サッカー", "歌", "庭いじり", "読書", "裁縫", "釣り", "ダンス", "絵", "チェス", "楽器"]);

  var THEMES = translatedEntries("engine.theme", [
    { name: "学校に行けない子どもたち", desc: "今日生まれる一人ひとりの人生から、このテーマを考えます。",
      fact: "世界では小学校に通う年齢の子どもの約7,800万人が学校に通っていません（UNESCO、概算）。",
      hit: function (p) { return p.edu.stage === "none" && p.age >= 6 && p.age <= 9; }, text: "学校に通えないまま、同い年の子が通学する姿を見送りました。" },
    { name: "遠くの水場", desc: "毎日の水くみから、暮らしの違いを考えます。",
      fact: "世界では約20億人が、安全に管理された飲み水を使えていません（WHO・UNICEF、概算）。",
      hit: function (p, c) { return !p.urban && c.gdp < 12000 && p.age >= 6 && p.age <= 14; }, text: "毎朝、遠くの井戸まで水を汲みに歩きました。" },
    { name: "移り住む人たち", desc: "住む場所を変える選択から、暮らしの変化を考えます。",
      fact: "生まれた国の外で暮らす人は世界に約2億8,000万人います（IOM、概算）。",
      hit: function (p) { return p.moved > 0; }, text: "生まれた土地を離れて、新しい場所で暮らしはじめました。" }
  ], ["name", "desc", "fact", "text"]);
  function todayTheme(d) {
    d = d || new Date();
    var n = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);
    return THEMES[n % THEMES.length];
  }

  // ---------- 生まれる ----------
  function pickCountry(method) {
    return weighted(C, function (c) { return method === "pop" ? c.pop : c.share; });
  }
  function pickCountryYear(method, year) {
    return weighted(C, function (c) { return birthWeight(c, method, year, "past"); });
  }
  function classSeed(code, dateString) {
    var input = String(code) + "|" + String(dateString), hash = 2166136261;
    for (var i = 0; i < input.length; i++) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }
  function localDate() {
    var d = new Date();
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }
  function eraKeyFrom(s) {
    if (s === "any") return pick(["past", "now", "future"]);
    return ERAS[s] ? s : "now";
  }
  var JOB_SECTORS = { none: ["agri", "srv", "ind", "srv", "ind", "agri"], primary: ["ind", "srv", "srv", "srv", "agri", "ind"], secondary: ["srv", "srv", "srv", "ind", "srv", "srv", "srv"], univ: ["srv", "srv", "ind", "srv", "srv", "srv", "srv", "srv", "srv"] };
  Object.keys(JOBS).forEach(function (level) { JOBS[level].forEach(function (job, i) { job[2] = JOB_SECTORS[level][i]; }); });
  function jobFor(level, urban, c) {
    var pool = JOBS[level] || JOBS.none;
    if (hasNumber(c, "agri") || (hasNumber(c, "ind_emp") && hasNumber(c, "srv_emp"))) {
      var agri = hasNumber(c, "agri") ? c.agri : Math.max(0, 100 - c.ind_emp - c.srv_emp);
      var industry = hasNumber(c, "ind_emp") ? c.ind_emp : Math.max(0, 100 - agri) * 0.35;
      var services = hasNumber(c, "srv_emp") ? c.srv_emp : Math.max(0, 100 - agri - industry);
      var total = agri + industry + services, agriShare = agri / Math.max(1, total);
      var urbanShare = clamp(c.urban / 100, 0, 1), urbanAgri = Math.max(agriShare * 0.12, (agriShare - (1 - urbanShare)) / Math.max(0.01, urbanShare));
      var ruralAgri = clamp((agriShare - urbanShare * urbanAgri) / Math.max(0.01, 1 - urbanShare), 0, 1);
      var sector = chance(urban ? urbanAgri : ruralAgri) ? "agri" : chance(industry / Math.max(1, industry + services)) ? "ind" : "srv";
      var matches = pool.filter(function (j) { return j[2] === sector; });
      if (!matches.length) matches = JOBS.primary.concat(JOBS.none, JOBS.secondary, JOBS.univ).filter(function (j) { return j[2] === sector; });
      return pick(matches.length ? matches : pool);
    }
    if (urban) pool = pool.filter(function (j) { return j[2] !== "agri"; }) || pool;
    else if (chance(c.agri / 100)) {
      var ag = pool.filter(function (j) { return j[2] === "agri"; });
      if (ag.length) pool = ag;
    }
    return pick(pool.length ? pool : JOBS.none);
  }
  var JOB_LEVELS = ["none", "primary", "secondary", "univ"];
  var JOB_KEYS = {
    none: ["farmhand", "street_vendor", "construction", "domestic", "day_laborer", "fisher"],
    primary: ["factory", "restaurant", "motorbike_taxi", "market", "farmer", "garment"],
    secondary: ["office", "sales", "truck", "electrician", "cook", "care_worker", "police"],
    univ: ["teacher", "nurse", "engineer", "accountant", "doctor", "civil_servant", "programmer", "researcher", "lawyer"]
  };
  var ORIGINAL_ISCO = {
    none: [6, 5, 9, 9, 9, 6], primary: [8, 5, 8, 5, 6, 7],
    secondary: [4, 5, 8, 7, 5, 5, 5], univ: [2, 2, 2, 2, 2, 2, 2, 2, 2]
  };
  JOB_LEVELS.forEach(function (level) { JOBS[level].forEach(function (job, index) { job[3] = ORIGINAL_ISCO[level][index]; }); });
  var MORE_JOBS = [
    "porter|荷物運搬員|none|9|ind|0.42", "waste_collector|廃棄物収集員|none|9|srv|0.5", "dishwasher|皿洗い係|none|9|srv|0.42",
    "cleaner|清掃員|none|9|srv|0.5", "delivery_helper|配送助手|none|9|srv|0.49", "mining_laborer|鉱山作業員|none|9|ind|0.58",
    "kitchen_helper|調理補助員|none|9|srv|0.44", "harvest_worker|収穫作業員|none|9|agri|0.38", "road_laborer|道路作業員|none|9|ind|0.52",
    "laundry_worker|洗濯作業員|none|9|srv|0.46", "recycler|資源回収員|none|9|srv|0.43", "hotel_cleaner|宿泊施設清掃員|none|9|srv|0.46",
    "livestock_helper|家畜の世話係|none|9|agri|0.4", "dock_worker|港湾作業員|none|9|ind|0.58", "street_cleaner|道路清掃員|none|9|srv|0.47",
    "livestock_keeper|畜産農家|primary|6|agri|0.65", "gardener|庭師|primary|6|agri|0.7", "forestry_worker|林業作業員|primary|6|agri|0.65",
    "dairy_farmer|酪農家|primary|6|agri|0.7", "orchard_worker|果樹農家|primary|6|agri|0.68", "poultry_keeper|養鶏農家|primary|6|agri|0.58",
    "beekeeper|養蜂家|primary|6|agri|0.72", "irrigation_worker|灌漑作業員|primary|6|agri|0.7", "plumber|配管工|primary|7|ind|0.92",
    "carpenter|大工|primary|7|ind|0.94", "mason|左官|primary|7|ind|0.85", "mechanic|整備士|primary|7|ind|1.02",
    "welder|溶接工|primary|7|ind|0.98", "tailor|仕立て職人|primary|7|ind|0.68", "baker|パン職人|primary|7|ind|0.78",
    "metalworker|金属加工職人|primary|7|ind|0.85", "printer|印刷工|primary|7|ind|0.8", "cashier|レジ係|primary|5|srv|0.63",
    "hairdresser|美容師|primary|5|srv|0.76", "security_guard|警備員|primary|5|srv|0.76", "bus_driver|バス運転手|primary|8|srv|0.85",
    "taxi_driver|タクシー運転手|primary|8|srv|0.8", "machine_operator|機械運転員|primary|8|ind|0.82", "assembly_operator|組立作業員|primary|8|ind|0.75",
    "textile_operator|繊維機械運転員|primary|8|ind|0.7", "childcare_worker|保育職員|secondary|5|srv|0.92", "tour_guide|観光ガイド|secondary|5|srv|1.0",
    "hotel_receptionist|ホテル受付係|secondary|4|srv|0.87", "receptionist|受付係|secondary|4|srv|0.85", "bank_clerk|銀行事務員|secondary|4|srv|1.06",
    "data_entry|データ入力係|secondary|4|srv|0.82", "payroll_clerk|給与事務員|secondary|4|srv|1.04", "library_clerk|図書館職員|secondary|4|srv|0.9",
    "shipping_clerk|出荷事務員|secondary|4|srv|0.9", "records_clerk|記録管理員|secondary|4|srv|0.9", "call_center|電話相談員|secondary|4|srv|0.82",
    "travel_clerk|旅行事務員|secondary|4|srv|0.95", "lab_technician|検査技師|secondary|3|srv|1.25", "engineering_technician|技術補助員|secondary|3|ind|1.22",
    "it_support|情報機器支援員|secondary|3|srv|1.25", "bookkeeper|簿記担当者|secondary|3|srv|1.05", "paramedic|救急救命士|secondary|3|srv|1.32",
    "dental_assistant|歯科助手|secondary|3|srv|1.1", "surveyor|測量技師|secondary|3|ind|1.25", "agricultural_technician|農業技術員|secondary|3|agri|1.15",
    "broadcast_technician|放送技術員|secondary|3|srv|1.2", "insurance_agent|保険代理人|secondary|3|srv|1.15", "crane_operator|クレーン運転員|secondary|8|ind|1.05",
    "train_driver|列車運転士|secondary|8|srv|1.25", "forklift_driver|フォークリフト運転員|secondary|8|ind|0.96", "shop_manager|店舗責任者|secondary|1|srv|1.25",
    "farm_manager|農場責任者|secondary|1|agri|1.2", "restaurant_manager|飲食店責任者|secondary|1|srv|1.28", "architect|建築家|univ|2|ind|2.05",
    "pharmacist|薬剤師|univ|2|srv|1.9", "veterinarian|獣医師|univ|2|agri|1.9", "journalist|記者|univ|2|srv|1.5",
    "social_worker|社会福祉士|univ|2|srv|1.45", "economist|経済研究員|univ|2|srv|1.8", "university_lecturer|大学講師|univ|2|srv|1.85",
    "dentist|歯科医師|univ|2|srv|2.55", "psychologist|心理士|univ|2|srv|1.7", "urban_planner|都市計画士|univ|2|srv|1.7",
    "hotel_manager|宿泊施設責任者|univ|1|srv|1.7", "factory_manager|工場責任者|univ|1|ind|2.0", "logistics_manager|物流責任者|univ|1|srv|1.85",
    "hospital_manager|病院管理者|univ|1|srv|2.1", "school_principal|学校長|univ|1|srv|1.95", "finance_manager|財務責任者|univ|1|srv|2.25",
    "project_manager|事業責任者|univ|1|srv|1.9", "government_manager|行政管理者|univ|1|srv|1.9"
  ];
  MORE_JOBS.forEach(function (line) {
    var parts = line.split("|"), level = parts[2];
    JOBS[level].push([t("engine.job." + parts[0], parts[1]), Number(parts[5]), parts[4], Number(parts[3])]);
    JOB_KEYS[level].push(parts[0]);
  });
  var JOB_DETAILS = {};
  JOB_LEVELS.forEach(function (level, rank) {
    JOBS[level].forEach(function (job, index) { JOB_DETAILS[job[0]] = { job: job, key: JOB_KEYS[level][index], rank: rank }; });
  });
  var DREAM_JOBS = { doctor: "doctor", teacher: "teacher", nurse: "nurse", engineer: "engineer", lawyer: "lawyer", scientist: "researcher" };
  function jobBarrier(p, detail, c, location) {
    var key = detail.key;
    if (detail.job[3] === 1 && p.age < 25 && key !== "farm_manager" && key !== "shop_manager") return "experience";
    if (detail.job[3] <= 3 && c.gdp < 4500 && ["programmer", "it_support", "finance_manager", "economist", "urban_planner"].indexOf(key) >= 0) return "market";
    if (JOB_LEVELS.indexOf(p.edu.level) < detail.rank) return "education";
    if (p.stats.h < 35 && (detail.rank >= 2 || ["construction", "fisher", "factory", "truck", "police"].indexOf(key) >= 0)) return "health";
    if (p.registered === false && (detail.rank >= 2 || key === "factory")) return "papers";
    if (detail.rank === 3 && (p.wealth <= 1 && availableMoney(p) < 100 || ["doctor", "lawyer"].indexOf(key) >= 0 && availableMoney(p) < 80 && p.wealth <= 2)) return "money";
    if (key === "truck" && p.cared && p.wealth <= 2) return "family";
    if (location && (p.urban ? ["farmhand", "fisher"].indexOf(key) >= 0 :
        ["office", "programmer", "accountant", "civil_servant"].indexOf(key) >= 0)) return "region";
    return null;
  }
  function jobWeight(p, detail, c, pool) {
    var group = detail.job[3], occupationShare = c.isco_emp && Number(c.isco_emp[group]);
    var agri = Number(c.agri || 20) / 100, ind = Number(c.ind_emp || 25), srv = Number(c.srv_emp || 55);
    var urbanShare = clamp(Number(c.urban || 50) / 100, 0.01, 0.99);
    var urbanAgri = clamp(Math.max(agri * 0.12, (agri - (1 - urbanShare)) / urbanShare), 0, 1);
    var localAgri = p.urban ? urbanAgri : clamp((agri - urbanShare * urbanAgri) / (1 - urbanShare), 0, 1);
    var sector = detail.job[2], share = sector === "agri" ? localAgri : (1 - localAgri) * (sector === "ind" ? ind : srv) / Math.max(1, ind + srv);
    var count = pool.filter(function (item) { return item.job[2] === sector; }).length;
    return Math.max(0.001, share / Math.max(1, count) * (occupationShare >= 0 ? clamp(0.8 + occupationShare / 55, 0.7, 1.4) : 1));
  }
  function jobShortlist(p, c, offer) {
    var current = JOB_DETAILS[p.job], floor = offer ? (current ? current.rank : JOB_LEVELS.indexOf(p.edu.level)) : 0;
    var pool = Object.keys(JOB_DETAILS).map(function (name) { return JOB_DETAILS[name]; }).filter(function (detail) {
      if (detail.rank < floor || detail.rank > JOB_LEVELS.indexOf(p.edu.level)) return false;
      if (offer && (nameHeld(p, detail.job[0]) || detail.job[1] < (p.jobF || 0) * 0.95)) return false;
      return !jobBarrier(p, detail, c, true);
    });
    if (offer && !pool.length) pool = Object.keys(JOB_DETAILS).map(function (name) { return JOB_DETAILS[name]; }).filter(function (detail) {
      return !nameHeld(p, detail.job[0]) && detail.rank <= JOB_LEVELS.indexOf(p.edu.level) && !jobBarrier(p, detail, c, true);
    });
    var chosen = [], dreamKey = DREAM_JOBS[p.dream], dream = dreamKey && Object.keys(JOB_DETAILS).map(function (name) { return JOB_DETAILS[name]; }).filter(function (detail) { return detail.key === dreamKey; })[0];
    if (dream && !jobBarrier(p, dream, c, false) && (!offer || !nameHeld(p, dream.job[0]))) {
      chosen.push(dream);
      pool = pool.filter(function (detail) { return detail.job[0] !== dream.job[0]; });
    }
    var limit = offer ? 2 : chance(0.45) ? 4 : 3;
    if (!offer && p.jobWaits && chance(Math.min(0.2, 0.07 + p.jobWaits * 0.03)) && pool.length) {
      var better = pool.slice().sort(function (a, b) { return b.job[1] - a.job[1]; })[0];
      chosen.push(better); pool = pool.filter(function (detail) { return detail !== better; });
    }
    while (pool.length && chosen.length < limit) {
      var next = weighted(pool, function (detail) { return jobWeight(p, detail, c, pool); });
      chosen.push(next);
      pool = pool.filter(function (detail) { return detail !== next; });
    }
    return chosen;
  }
  function nameHeld(p, name) {
    return p.job === name || (p.jobHistory || []).indexOf(name) >= 0 || (p.log || []).some(function (entry) {
      var line = entry.raw || entry.t || "";
      return line.indexOf(name + "として働きはじめました。") === 0 || line.indexOf("You began working as a " + name + ".") === 0;
    });
  }
  function jobReasons(p, c, chosen) {
    var reasons = [], seen = {};
    var dreamKey = DREAM_JOBS[p.dream];
    var all = Object.keys(JOB_DETAILS).map(function (name) { return JOB_DETAILS[name]; });
    all.sort(function (a, b) { return (a.key === dreamKey ? -1 : b.key === dreamKey ? 1 : b.rank - a.rank); });
    all.forEach(function (detail) {
      if (reasons.length >= 3 || chosen.some(function (item) { return item.job[0] === detail.job[0]; })) return;
      var reason = jobBarrier(p, detail, c, detail.key !== dreamKey);
      if (!reason || seen[reason]) return;
      seen[reason] = true;
      reasons.push(t("engine.job.unavailable." + reason, "{job}：" + ({ education: "学歴が足りない", region: "この地域に求人がない", papers: "資格や書類がない", health: "健康上の理由", family: "家族の事情", money: "資格取得の費用が足りない", experience: "経験が必要", market: "この国では求人が少ない" }[reason]), { job: detail.job[0] }));
    });
    return reasons.slice(0, 3);
  }
  function wealthIncome(c, factor, wealth, era) {
    var w = Math.exp((wealth - 3) * c.gini * (3 * c.gini - 0.1));
    if (hasNumber(c, "wealth_bottom40") && wealth <= 2) w *= clamp(c.wealth_bottom40 / 40, 0.3, 1.2);
    return Math.max(300, c.gdp * era.gdp * 0.55 * 0.9 * (1 - c.tert / 350) * (1 + (factor - 1) * 0.35) * w * Math.exp(0.18 * gauss()));
  }

  function person(c, opts) {
    var sex = chance(0.512) ? "m" : "f";
    var era = ERAS[opts.era];
    var name = makeName(c, sex, { birthYear: opts.birthYear || era.year }, weighted(c.rel, function (r) { return r[1]; })[0]).full;
    if (NR) skipNameDraws(2);
    return { sex: sex, iso: c.iso, name: name, wealth: 1 + Math.floor(R() * 5), deathAge: sampleDeath(lifeTable(c, sex, opts.era, opts.birthYear)), urban: chance(c.urban / 100), year: opts.birthYear || era.year };
  }
  function sampleDeath(q) {
    for (var x = 0; x < 116; x++) if (chance(q[x])) return x;
    return 115;
  }

  function birth(settings) {
    settings = settings || {};
    var previousNameRandom = NR;
    try {
      if (/^[0-9]{4}$/.test(String(settings.classCode || ""))) {
        var saved = R;
        R = rng(classSeed(settings.classCode, localDate()));
        try { return birthInternal(settings); }
        finally { R = saved; }
      }
      return birthInternal(settings);
    } finally {
      NR = previousNameRandom;
    }
  }
  function birthInternal(settings) {
    var era = settings.edu === true ? "now" : eraKeyFrom(settings.era);
    var e = ERAS[era];
    var selectedYear = Number(settings.year);
    var birthYear = era === "past" ? (Number.isInteger(selectedYear) && selectedYear >= 1950 && selectedYear <= 2025 ? selectedYear : 1950 + Math.floor(R() * 76)) : 2026;
    var chosenIso = typeof settings.country === "string" ? settings.country.toLowerCase() : "";
    var c = /^[a-z]{3}$/.test(chosenIso) && BY[chosenIso] || (era === "past" ? pickCountryYear(settings.method, birthYear) : pickCountry(settings.method));
    var sex = chance(0.512) ? "m" : "f";
    var snapshot = birthSnapshot(c, birthYear, era, settings.method);
    var rel = weighted(c.rel, function (r) { return r[1]; })[0];
    var nameSeed = ((R() * 4294967296) >>> 0) ^ ((R() * 4294967296) >>> 0);
    NR = rng(nameSeed);
    var urban = chance(c.urban / 100);
    var wealth = 1 + Math.floor(R() * 5);
    var city = urban ? pick(c.cities) : pick(c.cities) + "の近くの村";
    if (english()) city = countryValue(c, "cities", city);
    var momAge = Math.round(clamp(20 + c.tfr * 2 + gauss() * 5, 16, 44));
    var dadAge = Math.round(clamp(momAge + 3 + gauss() * 4, 18, 60));
    var dadNm = makeName(c, "m", { birthYear: birthYear - dadAge }, rel);
    var momNm = makeName(c, "f", { birthYear: birthYear - momAge, group: dadNm.group }, rel);
    var familySeen = [];
    var nm = uniqueName(c, sex, { father: dadNm, mother: momNm, birthYear: birthYear, group: dadNm.group, seen: familySeen }, rel);
    var nSib = Math.max(0, Math.round((c.tfr - 1) * R() * 1.6));
    var sibs = [];
    for (var i = 0; i < nSib; i++) {
      var sibSex = chance(0.5) ? "m" : "f", sibAge = 2 + i * 2 + Math.floor(R() * 2);
      var sibNm = uniqueName(c, sibSex, { father: dadNm, mother: momNm, birthYear: birthYear - sibAge, group: nm.group, seen: familySeen }, rel);
      sibs.push({ sex: sibSex, age: sibAge, name: sibNm.full, given: sibNm.given, family: sibNm.family });
    }
    sibs.sort(function (a, b) { return b.age - a.age; });
    var momJob = jobFor(wealth >= 4 ? (chance(0.5) ? "univ" : "secondary") : wealth >= 3 ? "primary" : "none", urban, c)[0];
    var dadJob = jobFor(wealth >= 4 ? (chance(0.6) ? "univ" : "secondary") : wealth >= 3 ? "secondary" : "none", urban, c)[0];
    if (chance(0.3)) momJob = t("engine.job.homemaker", "家事・子育て");
    var le = sex === "f" ? snapshot.leFemale : snapshot.leMale;
    var month = 1 + Math.floor(R() * 12);
    var p = {
      v: 1, id: c.iso.toUpperCase() + "-" + birthYear + "-" + String(Math.floor(R() * 9e6) + 1e6),
      name: nm.full, given: nm.given, family: nm.family, firstSurname: nm.firstSurname, nameGroup: nm.group, sex: sex, iso: c.iso, city: city, urban: urban, birthUrban: urban, wealth: wealth,
      religion: rel, era: era, birthYear: birthYear, birthMonth: month, le: Math.round(le * 10) / 10, birthSnapshot: snapshot,
      settings: settings, age: 0, t: 0,
      stats: { h: Math.round(clamp(62 + (wealth - 3) * 4 + gauss() * 8, 25, 95)), hp: Math.round(clamp(55 + gauss() * 6, 30, 80)), k: 50, r: Math.round(clamp(50 + nSib * 2 + gauss() * 5, 30, 80)) },
      temperament: null, dream: null, dreamProgress: 0, dreamBlocked: [], choiceYears: {}, edu: { level: "pre", stage: "pre" }, job: null, jobYears: 0, jobHistory: [], jobWaits: 0, informal: !urban || wealth <= 2, income: 0, net: 0, debt: 0,
      registered: !hasNumber(c, "birth_reg") || chance(percentage(c, "birth_reg", 1)), slumHome: urban && hasNumber(c, "slum") && chance(percentage(c, "slum", 0)),
      familyTarget: sampleFamilyTarget(c, sex),
      maternalBirths: 0, maternalDeaths: 0, firstMarriageAge: null, firstBirthAge: null, outSchoolAt6: null,
      spouse: null, rel: "single", sameSexPartner: chance(0.04), conscriptionDecided: false,
      kids: [], grand: 0, pets: [], hobby: null, drink: false, moved: 0, jobChanges: 0,
      parents: { mom: { name: momNm.full, given: momNm.given, family: momNm.family, age: momAge, job: momJob, alive: true, wealth: wealth }, dad: { name: dadNm.full, given: dadNm.given, family: dadNm.family, age: dadAge, job: dadJob, alive: true, wealth: wealth } },
      sibs: sibs, focus: "balance", focusYears: {}, focusManual: false, happy: [], log: [], history: [], peers: [], pending: null, auto: false,
      breathers: [], themeHits: [], theme: todayTheme().name, spent: 0, saved: 0, swings: 0, ended: false, death: null, gentle: !!settings.gentle || settings.edu === true, eduMode: settings.edu === true,
      ledger: [], budget: [], items: [], investments: {}, loanDebt: 0, debtAccounts: {}, portfolioHistory: [], capitalIncomeTotal: 0, lifestyle: null, incomeHistory: [], netHistory: [], lifetimeEarnings: 0, maxNetWorth: 0,
      incomeSources: { main: 0, side: 0, remittances: 0, assets: 0, pension: 0, transfers: 0 },
      lifetimeIncomeSources: { main: 0, side: 0, remittances: 0, assets: 0, pension: 0, transfers: 0 },
      car: null, smoker: false, everSmoked: false, business: false, house: false, scholar: false, chronic: {}, importantChoices: [],
      decisionCount: 0, offered: 0, community: false, childSchoolPaid: false, elderChoice: false, earlyMarriage: false
    };
    skipNameDraws(6);
    if (!p.registered) addLog(p, t("engine.course.unregistered", "出生の届け出がまだ済んでいません。後に書類が必要になるかもしれません。"), dataRef({ cat: "society", tone: "bad" }, "UNICEF", "birth_registration", "この国の出生登録率は{rate}％です。", { rate: pct(c.birth_reg) }));
    if (p.slumHome) addLog(p, t("engine.course.slum", "家族は都市の非正規な居住地区で暮らし、公共サービスの利用に苦労することがありました。"), dataRef({ cat: "society", tone: "bad" }, "UN-Habitat", "slum", "この国の都市人口の{rate}％がスラム地区に暮らします。", { rate: pct(c.slum) }));
    var peerOpts = { era: era, birthYear: birthYear };
    for (var j = 0; j < 4; j++) p.peers.push(person(era === "past" ? pickCountryYear(settings.method, birthYear) : pickCountry(settings.method), peerOpts));
    var birthPopulation = seriesValue(c, "pop", birthYear);
    addLog(p, birthSentence(p, c), dataRef({ big: true, tone: "good" }, "UN WPP", "birth_population", "この年のこの国の人口は推計約{count}人です。", { count: Math.round(birthPopulation ? birthPopulation * 1000 : c.pop * 10000).toLocaleString(english() ? "en-US" : "ja-JP") }));
    var bornEvent = historyEvent(p, "birth", { people: [p.name, p.parents.mom.given, p.parents.dad.given], outcome: "born", text: p.log[p.log.length - 1].t });
    historyEvent(p, "family_origin", { people: [p.parents.mom.given, p.parents.dad.given], outcome: "raised", causeId: bornEvent.id,
      text: t("engine.history.family_origin", "{mother}と{father}が幼い日々を見守りました。", { mother: p.parents.mom.given, father: p.parents.dad.given }) });
    // These three observations also belong to lives that end in infancy.
    for (var everydayBirth = 0; everydayBirth < 3; everydayBirth++) everydayMoment(p, c, everydayBirth);
    p.vax = vaccinationAtBirth(p, c);
    addLog(p, p.vax.status === "full" ? t("engine.vax.full", "必要な予防接種を受けました。") :
      t(p.vax.status === "partial" ? "engine.vax.partial_detail" : "engine.vax.missed_detail",
        p.vax.status === "partial" ? "予防接種を一部受けました。{reason}" : "予防接種を受けられませんでした。{reason}",
        { reason: t("engine.vax.reason." + p.vax.reasonKey, "通うことが難しい事情がありました。") }),
      dataRef({ cat: "health", vax: true, reasonKey: p.vax.reasonKey, tone: p.vax.status === "full" ? "good" : "bad" }, "WHO/UNICEF", "vaccination", "この年のDTP3接種率は{dtp3}％、はしか接種率は{measles}％です。", { dtp3: pct(coverage(c, birthYear).dtp3), measles: pct(coverage(c, birthYear).measles) }));
    p.story = birthSentence(p, c);
    p.q = null;
    return p;
  }
  function sexWord(p) { return p.sex === "m" ? "男の子" : "女の子"; }
  function birthSentence(p, c) {
    if (english()) return t("engine.birth", "", { year: p.birthYear, month: p.birthMonth,
      country: countryName(c), place: countryValue(c, "cities", p.city), wealth: t("engine.birth.wealth." + p.wealth, ""),
      child: p.sex === "m" ? "boy" : "girl", siblings: p.sibs.length ? t(p.sibs.length === 1 ? "engine.birth.sibling" : "engine.birth.siblings", "", { count: p.sibs.length }) : t("engine.birth.first_child", ""),
      religion: countryValue(c, "rel", p.religion) });
    var s = p.birthYear + "年" + p.birthMonth + "月、" + c.name + "の" + (p.urban ? p.city : p.city.replace("の近くの村", "近郊の村")) + "で、" + WEALTH_LABEL[p.wealth] + "家庭に" + sexWord(p) + "として生まれました。";
    if (p.sibs.length) s += "年上のきょうだいが" + p.sibs.length + "人いました。";
    else s += "両親の最初の子どもでした。";
    s += "生まれた家庭の宗教的背景は" + p.religion.replace(/・.*/, "") + "でした。";
    return s;
  }

  // ---------- 記録 ----------
  function logCategory(text) {
    if (/避難|災害|洪水|地震|台風|干ばつ|山火事|被害|備えながら/.test(text)) return "disaster";
    if (/学校|教育|学び|学費|進学|大学|卒業|教室|勉強|留学|奨学金|本から学/.test(text)) return "learn";
    if (/母が亡く|父が亡く|先に旅立|幼くして亡く|結婚|子ども|孫|親|家族|きょうだい|ペット|家庭/.test(text)) return "family";
    if (/景気|経済|物価|所得|GDP|国内総生産/.test(text)) return "economy";
    if (/病|治療|診療|病院|健康|検査|通院|たばこ|せき|肺|体調|お酒|酒で|亡くなりました/.test(text)) return "health";
    if (/仕事|働|職|月給|商売|売上|店を|投資|預金|借入|借り|貸付|仕送り|お金|収入|家計|資金/.test(text)) return "work";
    if (/地域|世話役|制度|選挙|政治|安全|暴力事件/.test(text)) return "society";
    if (/移り住|故郷|国境|海外/.test(text)) return "world";
    return "family";
  }
  // A sentence can change while the same circumstance is still being repeated.
  // Keep the cooldown on the underlying event family, across culture and course logs.
  function proseFamily(text) {
    var groups = [
      ["food_shortage", /食料が足り|食べものが(十分でなく|足りず)|食事の(量|回数)を減ら|food was (scarce|limited)|smaller meals|fewer meals/i],
      ["water_access", /水を(くみに|運ぶ)|飲み水|water (collection|supply|access)|fetch water/i],
      ["electricity", /電気が届か|ランプの明かり|electricity|lamp light/i],
      ["cooking_fuel", /薪を使って|薪で料理|cooking fire|firewood|wood smoke/i],
      ["medical_access", /遠くの診療所|遠い診療所|distant clinic|faraway clinic/i],
      ["business_sales", /商売の売上|business sales|shop sales/i],
      ["economic_slowdown", /景気が(悪く|冷え)|economic slowdown|economy slowed/i],
      ["rain", /雨の多い季節|雨が続き|rainy season|heavy rain/i],
      ["heat", /暑さのなか|heat of the day|hot weather/i],
      ["cold", /冷え込む朝|cold morning/i],
      ["remittances", /仕送りが届|remittance|money from a relative/i],
      ["sanitation", /トイレが近くになく|sanitation|toilet nearby/i]
    ];
    for (var i = 0; i < groups.length; i++) if (groups[i][1].test(text)) return groups[i][0];
    return null;
  }
  // Alternatives for the most common yearly lines in a fixed 500-life sample.
  var FREQUENT_ALTS = [
    ["景気が悪くなり、仕事が減りました。", "景気が冷え込み、働く日が減りました。"],
    ["商売の売上が少し伸びました。", "商売に来る人が増え、売上が伸びました。"],
    ["今の仕事を続けることにしました。", "今の職場で働き続けました。"],
    ["初等教育を終えました。", "初等教育を修了しました。"],
    ["薪を使って食事を作り、室内に煙がこもらないようにしました。", "薪で料理をし、煙を外へ逃がしました。"],
    ["体調を崩し、家で休む日が続きました。", "体調がすぐれず、家で静かに休みました。"],
    ["健康診断で、血圧が高いと言われました。", "健診で血圧が高いと分かりました。"],
    ["大人になった子どもが、暮らしの費用を支えてくれました。", "成長した子どもが生活費を助けてくれました。"],
    ["中等教育に進みました。", "中等教育で学び始めました。"],
    ["腰を痛めて、しばらく仕事を休みました。", "腰の痛みで、仕事を数日休みました。"],
    ["初めて携帯電話を手にし、離れた家族へ声を届けました。", "携帯電話を持ち、遠くの家族と話しました。"],
    ["商売の売上が落ち、やりくりを考えました。", "商売の売上が減り、支出を見直しました。"],
    ["インフルエンザで寝込みました。", "インフルエンザにかかり、家で休みました。"],
    ["今は子どもを増やさないことにしました。", "子どもを迎える時期を先に延ばしました。"],
    ["思いがけず昔の恩師に会いました。", "偶然、昔の先生と再会しました。"],
    ["久しぶりに家族へ手紙を書きました。", "離れた家族に手紙を送りました。"],
    ["新しい料理を覚えました。", "初めての料理を作れるようになりました。"],
    ["若い同僚に仕事のこつを伝えました。", "若い仕事仲間に経験を伝えました。"],
    ["雨上がりの空気の匂いを楽しみました。", "雨上がりに外へ出て、澄んだ空気を吸いました。"],
    ["一日の終わりに静かな時間を持ちました。", "夜は静かに過ごしました。"],
    ["母を引き取り、そばで世話をしました。", "母と暮らし、身の回りの世話をしました。"],
    ["道での事故に巻き込まれ、しばらく通院しました。", "交通事故のあと、しばらく治療を受けました。"],
    ["公園の木陰でひと息つきました。", "公園の木陰に座って休みました。"],
    ["大学を卒業しました。", "大学での学びを終えました。"],
    ["家に電気が届かない夜、ランプを囲んで過ごしました。", "電気のない夜は、ランプのそばで過ごしました。"],
    ["診てもらえる医師を探し、遠くの診療所まで出かけました。", "医師の診察を受けに、遠い診療所へ行きました。"],
    ["古い道具を直してもう一度使いました。", "傷んだ道具を修理して使いました。"],
    ["毎朝、遠くの井戸まで水を汲みに歩きました。", "朝は離れた井戸へ水を汲みに行きました。"],
    ["中等教育を終えました。", "中等教育を修了しました。"],
    ["仕事帰りに寄り道して、店先を眺めました。", "帰宅途中に店の前で足を止めました。"]
  ];
  var FREQUENT_PATTERNS = [
    [/^(.+)に日本の物価で約([\d,]+)円を使いました。$/, "{item}のために日本の物価で約{amount}円を支払いました。", function (m) { return { item: m[1], amount: m[2] }; }],
    [/^(.+)の試合を見ながら、近所の人と話しました。$/, "近所の人と{sport}の試合を見ました。", function (m) { return { sport: m[1] }; }],
    [/^(.+)に見舞われ、家や持ちものに被害が出ました。$/, "{disaster}で家や持ちものが傷みました。", function (m) { return { disaster: m[1] }; }],
    [/^(\d+)月、家族や友人と(.+)を過ごしました。$/, "{month}月、{festival}を家族や友人と迎えました。", function (m) { return { month: m[1], festival: m[2] }; }],
    [/^子どもたちが(.+)をするのを、しばらく眺めました。$/, "子どもたちの{sport}を、そばで見守りました。", function (m) { return { sport: m[1] }; }]
  ];
  var FREQUENT_EN_PATTERNS = [
    [/^You spent about US\$([\d,]+) at PPP on (.+?)\. ?\.?$/, function (m) { return { amount: m[1], item: m[2] }; }],
    [/^You watched a (.+) match and talked with neighbors\.$/, function (m) { return { sport: m[1] }; }],
    [/^You spent (.+) with family and friends\.$/, function (m) { return { festival: m[1] }; }],
    [/^You watched children play (.+)\.$/, function (m) { return { sport: m[1] }; }]
  ];
  function frequentVariant(p, line) {
    if (english()) for (var e = 0; e < FREQUENT_EN_PATTERNS.length; e++) {
      var englishMatch = FREQUENT_EN_PATTERNS[e][0].exec(line);
      if (englishMatch) return chance(0.5) ? t("engine.frequent.english." + e, "", FREQUENT_EN_PATTERNS[e][1](englishMatch)) : line;
    }
    for (var i = 0; i < FREQUENT_ALTS.length; i++) {
      if (line === FREQUENT_ALTS[i][0]) return chance(0.5) ? t("engine.frequent." + i, FREQUENT_ALTS[i][1]) : line;
    }
    for (i = 0; i < FREQUENT_PATTERNS.length; i++) {
      var match = FREQUENT_PATTERNS[i][0].exec(line);
      if (match) {
        if (!chance(0.5)) return line;
        var vars = FREQUENT_PATTERNS[i][2](match);
        if (english() && vars.disaster) vars.disaster = window.I18N.engineDataName(vars.disaster);
        return t("engine.frequent.pattern." + i, FREQUENT_PATTERNS[i][1], vars);
      }
    }
    return line;
  }
  function addLog(p, text, o) {
    o = o || {};
    text = frequentVariant(p, text);
    var cat = LOG_CATS[o.cat] ? o.cat : logCategory(text);
    var rawText = text;
    if (english() && window.I18N.engineLog) {
      text = SMALL_EN && SMALL_EN[text] || window.I18N.engineLog(text);
      if (o.src) o.src = window.I18N.engineLog(o.src);
    }
    text = text.trim();
    if (!(english() ? /[。！？.!?]$/ : /[。！？]$/).test(text)) text += english() ? "." : "。";
    var family = o.family || proseFamily(text);
    var familyLast = p.proseFamilyLast || (p.proseFamilyLast = {});
    if (family && !o.big && !o.decision && !o.fact && familyLast[family] != null && p.age - familyLast[family] <= 5) return false;
    var tone = o.fact || o.decision ? "neutral" : (["good", "bad"].indexOf(o.tone) >= 0 ? o.tone : "neutral");
    if (!o.big && (p.log || []).some(function (entry) {
      return (entry.raw || entry.t) === (english() ? rawText : text) &&
        (!o.decision && !o.fact || p.age - entry.a < 8);
    })) { historyFromLog(p, o, text, cat, tone); return false; }
    var entry = { a: p.age, t: text, src: o.src || "", stat: o.stat || "", big: !!o.big, tag: o.tag || "", star: false,
      blocked: !!o.blocked, reasonKey: o.reasonKey || null, dream: !!o.dream, vax: !!o.vax,
      cat: cat, tone: tone,
      fact: !!o.fact, decision: !!o.decision, culture: !!o.culture, everyday: !!o.everyday,
      script: !!o.script, scriptId: o.scriptId || null, family: family,
      joy: Number.isInteger(o.joy) ? o.joy : null, motivation: Number.isInteger(o.motivation) ? o.motivation : null,
      festival: o.festival || "", m: o.m || null, y: o.y || p.birthYear + p.age };
    if (english()) entry.raw = rawText;
    p.log.push(entry);
    if (family) {
      familyLast[family] = p.age;
      var familySeen = p.proseFamilySeen || (p.proseFamilySeen = {});
      familySeen[family] = (familySeen[family] || 0) + 1;
    }
    if (p.log.length > 600) p.log.splice(0, p.log.length - 600);
    historyFromLog(p, o, entry.t, cat, tone);
    return true;
  }
  function historyFromLog(p, o, text, cat, tone) {
    if (o.historyType) historyEvent(p, o.historyType, { text: text, outcome: o.outcome || "occurred",
      people: o.people || [], job: o.job || null, dream: o.dreamKey || null, level: o.level || null,
      personId: o.personId || null, causeId: o.causeId || null, cat: cat, tone: tone, src: o.src || "", stat: o.stat || "" });
  }
  function historyEvent(p, type, detail) {
    detail = detail || {};
    var history = p.history || (p.history = []);
    var identity = detail.identity || (type === "school_start" || type === "school_finish" ? detail.level :
      type === "child_birth" || type.indexOf("child_") === 0 ? detail.personId : type === "dream_achieved" ? detail.dream : null);
    if (identity != null && history.some(function (event) { return event.type === type && event.identity === identity; })) return null;
    var event = { id: "e" + (history.length + 1), type: type, age: p.age, year: p.birthYear + p.age,
      people: (detail.people || []).filter(Boolean), place: p.abroad ? placeName(p.abroad) : p.city,
      job: detail.job || p.job || null, level: detail.level || null, from: detail.from || null, to: detail.to || null,
      outcome: detail.outcome || "occurred", text: detail.text || "",
      cat: detail.cat || "family", tone: detail.tone || "neutral", dream: detail.dream || null,
      causeId: detail.causeId || null, identity: identity || null, src: detail.src || "", stat: detail.stat || "" };
    history.push(event);
    return event;
  }
  function lastHistory(p, type, identity) {
    for (var i = (p.history || []).length - 1; i >= 0; i--)
      if (p.history[i].type === type && (identity == null || p.history[i].identity === identity)) return p.history[i];
    return null;
  }
  function syncRelationships(p) {
    if (!Array.isArray(p.history)) return;
    if (p.historyAbroad === undefined) p.historyAbroad = null;
    if ((p.abroad || null) !== p.historyAbroad) {
      var from = p.historyAbroad ? placeName(p.historyAbroad) : p.city;
      var to = p.abroad ? placeName(p.abroad) : p.city;
      historyEvent(p, "move", { outcome: "moved", from: from, to: to, text: t("engine.history.move", "{from}から{to}へ暮らしを移しました。", { from: from, to: to }),
        cat: "world", tone: "neutral", causeId: (lastHistory(p, "work_start") || lastHistory(p, "family_origin") || {}).id });
      p.historyAbroad = p.abroad || null;
    }
    if (p.spouse && !lastHistory(p, "spouse_marriage")) {
      historyEvent(p, "spouse_marriage", { people: [p.given, p.spouse.given], outcome: p.rel === "partnered" ? "partnered" : "married",
        text: t("engine.history.marriage", "{name}と暮らしをともにし始めました。", { name: p.spouse.given }), tone: "good" });
    }
    if (p.cared && !lastHistory(p, "parent_care")) {
      var parent = p.parents && (p.parents.mom.alive ? p.parents.mom : p.parents.dad.alive ? p.parents.dad : null);
      if (parent) historyEvent(p, "parent_care", { people: [p.given, parent.given], outcome: "cared",
        text: t("engine.history.parent_care", "{name}の世話を引き受けました。", { name: parent.given }), tone: "good",
        causeId: (lastHistory(p, "birth") || {}).id });
    }
  }
  function medianIncome(p) {
    return Math.max(300, yearStats(BY[p.iso], p.birthYear + p.age).gdp * 0.35);
  }
  function debtLimit(p) {
    var c = BY[p.iso] || {}, formal = clamp(Number(c.credit || 0) / 100, 0.15, 2.5);
    return Math.max(Number(p.income) || 0, medianIncome(p)) * (p.informal ? 1.2 : 1.2 + formal);
  }
  function money(p, label, amount) {
    p.net += amount;
    p.ledger.push([english() && window.I18N.engineMoney ? window.I18N.engineMoney(label) : label, amount]);
    p.debt = Math.max(p.loanDebt || 0, -p.net, 0);
    p.maxNetWorth = Math.max(p.maxNetWorth || 0, p.net);
    return amount;
  }

  // ---------- 家計 ----------
  function normalCdf(x) {
    var t = 1 / (1 + 0.2316419 * Math.abs(x));
    var d = 0.3989422804 * Math.exp(-x * x / 2);
    var v = 1 - d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    return x >= 0 ? v : 1 - v;
  }
  function incomePosition(p) {
    var c = BY[p.iso], gini = clamp((Number(c.gini) || 35) / 100, 0.2, 0.7);
    var lo = 0.1, hi = 2.5, i, sigma;
    for (i = 0; i < 24; i++) {
      sigma = (lo + hi) / 2;
      if (2 * normalCdf(sigma / Math.SQRT2) - 1 < gini) lo = sigma; else hi = sigma;
    }
    sigma = (lo + hi) / 2;
    var mean = Math.max(300, yearStats(c, p.birthYear + p.age).gdp * 0.55);
    var median = mean / Math.exp(sigma * sigma / 2);
    var income = Math.max(1, Number(p.income) || 0);
    return {
      country: clamp(Math.round(normalCdf(Math.log(income / median) / sigma) * 100), 1, 99),
      world: clamp(Math.round(normalCdf(Math.log(income / 3000) / 1.35) * 100), 1, 99)
    };
  }
  function dailyDollars(p) { return Math.max(0, Number(p.income) || 0) / 365; }
  var BUDGET_LABELS = translatedList("engine.budget", ["税金・社会保険", "食費", "住居", "交通", "医療", "教育・子育て", "衣服・娯楽・通信", "貯蓄"]);
  function budgetOf(p) {
    var income = Math.max(0, Number(p.income) || 0);
    var level = clamp(Math.log(Math.max(300, income) / 300) / Math.log(100000 / 300), 0, 1);
    var children = (p.kids || []).filter(function (k) { return k.alive && p.age - k.born < 18; }).length;
    var food = 0.55 - 0.4 * level;
    var tax = (p.informal ? 0.01 : 0.05) + level * (p.informal ? 0.13 : 0.25);
    var housing = 0.18 + 0.04 * level;
    var transport = 0.04 + 0.05 * level;
    var medical = 0.04 + 0.01 * level;
    var education = 0.015 + Math.min(0.12, children * 0.035);
    var lifestyle = LIFESTYLES.filter(function (x) { return x.key === p.lifestyle; })[0];
    var savings = clamp((0.025 + 0.13 * level - children * 0.008) * (lifestyle ? lifestyle.saving : 1), 0.002, 0.28);
    var fixed = food + tax + housing + transport + medical + education + savings;
    if (fixed > 0.96) {
      var scale = 0.96 / fixed;
      food *= scale; tax *= scale; housing *= scale; transport *= scale; medical *= scale; education *= scale; savings *= scale;
    }
    var shares = [tax, food, housing, transport, medical, education, 1 - (food + tax + housing + transport + medical + education + savings), savings];
    return BUDGET_LABELS.map(function (label, i) { return { label: label, share: shares[i], amount: income * shares[i] }; });
  }
  var ITEMS = translatedEntries("engine.item", [
    { key: "phone", label: "携帯電話", price: 60, effect: "家族と連絡しやすくなる", upkeep: 6, happiness: 1, minYear: 1985 },
    { key: "smartphone", label: "スマートフォン", price: 220, effect: "連絡と学びに役立つ", upkeep: 25, happiness: 2, knowledge: 1 },
    { key: "bike", label: "自転車", price: 130, effect: "通勤が少し速くなる", upkeep: 12, happiness: 1, speed: 12 },
    { key: "motorbike", label: "バイク", price: 900, effect: "遠い職場へ通いやすくなる", upkeep: 130, happiness: 2, speed: 28 },
    { key: "usedCar", label: "中古車", price: 4500, effect: "家族での移動が楽になる", upkeep: 650, happiness: 3, speed: 35 },
    { key: "newCar", label: "新車", price: 18000, effect: "移動の選択肢が増える", upkeep: 1100, happiness: 4, speed: 40 },
    { key: "fridge", label: "冷蔵庫", price: 350, effect: "食べ物を長く保存できる", upkeep: 35, health: 2 },
    { key: "tv", label: "テレビ", price: 280, effect: "家で楽しむ時間が増える", upkeep: 25, happiness: 2 },
    { key: "computer", label: "パソコン", price: 700, effect: "学びや仕事に使える", upkeep: 55, knowledge: 3 },
    { key: "roof", label: "屋根の修理", price: 500, effect: "雨の日も安心して暮らせる", upkeep: 0, health: 2, happiness: 2 },
    { key: "home", label: "持ち家", price: 30000, effect: "自分の住まいを持つ", upkeep: 500, happiness: 5 },
    { key: "washer", label: "洗濯機", price: 420, effect: "洗濯にかかる時間を減らす", upkeep: 45, happiness: 2, health: 1, category: "living" },
    { key: "aircon", label: "エアコン", price: 650, effect: "暑い日の室内を涼しくする", upkeep: 90, health: 2, happiness: 2, category: "living" },
    { key: "fan", label: "扇風機", price: 75, effect: "暑い日の暮らしを少し楽にする", upkeep: 8, happiness: 1, category: "living" },
    { key: "solarPanel", label: "太陽光パネル", price: 1400, effect: "家庭で使える電気を増やす", upkeep: 70, health: 1, happiness: 2, minYear: 1980, category: "living" },
    { key: "waterTank", label: "井戸・貯水タンク", price: 600, effect: "安全な水を手元に備える", upkeep: 30, health: 3, category: "living" },
    { key: "solarLamp", label: "ソーラーランプ", price: 50, effect: "夜も明かりの下で過ごせる", upkeep: 3, knowledge: 1, happiness: 1, minYear: 1990, category: "living" },
    { key: "goats", label: "家畜（ヤギ）", price: 180, effect: "家族の食料と小さな収入を支える", upkeep: 25, health: 1, happiness: 1, rural: true },
    { key: "cattle", label: "家畜（牛）", price: 750, effect: "農作業と家族の食料を支える", upkeep: 120, health: 1, happiness: 2, rural: true },
    { key: "farmTools", label: "農機具", price: 950, effect: "畑仕事の負担を減らす", upkeep: 65, health: 1, rural: true },
    { key: "streetStall", label: "屋台・小さな店の開業", price: 1200, effect: "自分の商売を始める", upkeep: 90, happiness: 2, business: true, incomeBoost: 1.08 },
    { key: "deliveryBike", label: "中古バイクで配達の仕事", price: 1150, effect: "配達の仕事に使える足を得る", upkeep: 140, happiness: 2, speed: 28, minYear: 1980, incomeBoost: 1.04 },
    { key: "gadget", label: "新しい電子機器", price: 900, effect: "学びと趣味の幅が広がる", upkeep: 80, happiness: 3, minYear: 1990, minIncome: 8000 },
    { key: "luxuryGoods", label: "高級品", price: 6000, effect: "買い物を楽しむ", happiness: 4, minIncome: 25000 },
    { key: "secondHome", label: "別荘", price: 70000, effect: "別の住まいで過ごせる", upkeep: 1500, happiness: 5, minIncome: 50000 }
  ], ["label", "effect"]);
  var SERVICES = translatedEntries("engine.service", [
    { key: "travel", label: "旅行", price: 800, effect: "新しい景色を見る", happiness: 5 },
    { key: "eatingOut", label: "外食", price: 120, effect: "家族や友人と食事を楽しむ", happiness: 2, minIncome: 2000 },
    { key: "hobbyClass", label: "趣味の教室", price: 320, effect: "新しい趣味を学ぶ", happiness: 3, knowledge: 1, minIncome: 5000 },
    { key: "foreignTrip", label: "海外旅行", price: 3500, effect: "海外の文化に触れる", happiness: 5, minIncome: 14000, minTour: 0.03, minYear: 1950 },
    { key: "privateSchool", label: "私立学校", price: 5500, effect: "子どもの学びの選択肢を広げる", happiness: 2, needsChild: true, minIncome: 16000 },
    { key: "privateHealth", label: "民間医療", price: 2200, effect: "診療の選択肢を増やす", health: 5, minIncome: 12000 },
    { key: "checkup", label: "健康診断", price: 120, effect: "体の状態を確かめる", health: 3 },
    { key: "schoolFees", label: "子の学費", price: 400, effect: "子どもの学びを支える", happiness: 2 },
    { key: "parents", label: "親への仕送り", price: 250, effect: "親の暮らしを支える", happiness: 2, relation: 4 },
    { key: "donation", label: "寄付", price: 150, effect: "地域を支える", happiness: 2, relation: 2, category: "donate" },
    { key: "vocationalTraining", label: "職業訓練", price: 350, effect: "仕事に役立つ技能を学ぶ", knowledge: 4, category: "learning" },
    { key: "languageClass", label: "語学教室", price: 280, effect: "新しい言葉を学ぶ", knowledge: 3, happiness: 1, category: "learning" },
    { key: "tutoring", label: "子どもの塾", price: 260, effect: "子どもの学びを助ける", relation: 2, happiness: 1, category: "learning", needsChild: true },
    { key: "healthInsurance", label: "健康保険に加入", price: 300, effect: "病気に備える", health: 2, happiness: 1, category: "learning" },
    { key: "dentalCare", label: "歯の治療", price: 180, effect: "歯の痛みを治療する", health: 3, category: "learning" },
    { key: "glasses", label: "めがね", price: 95, effect: "文字や景色を見やすくする", health: 1, knowledge: 1, category: "learning" },
    { key: "wedding", label: "結婚式の費用", price: 1400, effect: "家族や友人と節目を祝う", relation: 4, happiness: 3, category: "family", needsSpouse: true },
    { key: "parentRepair", label: "親の家の修理", price: 700, effect: "親の住まいを整える", relation: 4, happiness: 1, category: "family", needsParent: true },
    { key: "religiousDonation", label: "宗教行事への寄付", price: 90, effect: "地域の行事を支える", relation: 2, happiness: 1, category: "donate" },
    { key: "schoolDonation", label: "地域の学校への寄付", price: 180, effect: "地域の子どもの学びを支える", relation: 3, happiness: 1, category: "donate" },
    { key: "moveHouse", label: "引っ越し", price: 900, effect: "新しい場所で暮らし始める", happiness: 2, category: "living" }
  ], ["label", "effect"]);
  // Generated data registers both language dictionaries before the engine loads.
  // Keep the fallback empty for older embedded tests that load engine.js alone.
  (window.MONEY_DATA && window.MONEY_DATA.groups || []).forEach(function (group) {
    group.items.forEach(function (row) {
      var key = row[0], flags = row[4] || {};
      var offer = { key: key, label: t("engine.moneyOffer." + key + ".label", row[1]),
        effect: t("engine.moneyOffer." + key + ".effect", group.effect[0]), price: row[3], category: "offer:" + group.id };
      Object.keys(flags).forEach(function (flag) { offer[flag] = flags[flag]; });
      SERVICES.push(offer);
    });
  });
  var INVESTMENTS = translatedEntries("engine.investment", [
    { key: "savings", label: "預金", price: 100, effect: "年ごとに少しずつ増える。元本の変動は小さい" },
    { key: "index", label: "分散投資", price: 250, effect: "値動きはあるが長期の成長を目指す" },
    { key: "shop", label: "小さな店への出資", price: 300, effect: "大きく増える年も、減る年もある" },
    { key: "fixedDeposit", label: "定期預金", price: 200, effect: "預ける期間を決めて安定した利息を得る", rate: "fixed" },
    { key: "governmentBond", label: "国債", price: 250, effect: "国に貸し付けて利息を得る", rate: "bond" },
    { key: "stocks", label: "株式", price: 300, effect: "企業の成長に参加する。値動きが大きい", rate: "stocks" },
    { key: "gold", label: "金（ゴールド）", price: 240, effect: "価値の保存を目指す。価格は上下する", rate: "gold" },
    { key: "microfinance", label: "マイクロファイナンスの共同組合", price: 150, effect: "地域の小規模な事業に資金を回す", rate: "microfinance" }
  ], ["label", "effect"]);
  function optionPrice(p, choice) {
    var c = BY[p.iso] || {}, year = p.birthYear + p.age;
    // PPP dollars keep the same unit across lives, while local markets and earlier eras vary modestly.
    var country = clamp(0.78 + Math.log(Math.max(300, c.gdp || 300) / 500) * 0.075, 0.75, 1.16);
    var era = clamp(0.72 + (year - 1950) * 0.28 / 76, 0.65, 1.08);
    return Math.max(1, Math.round(choice.price * country * era));
  }
  function optionReason(p, choice, kind) {
    if (p.ended) return t("engine.spend.ended", "この一生は終わっています。");
    if (choice.countries && choice.countries.indexOf(p.iso) < 0) return t("engine.money.region", "この地域では一般的ではありません。");
    if (choice.religion && (Array.isArray(choice.religion) ? choice.religion.indexOf(nameReligion(p.religion)) < 0 : nameReligion(p.religion) !== choice.religion)) return t("engine.money.religion", "この宗教的背景には合いません。");
    if (choice.minWealth && p.wealth < choice.minWealth) return t("engine.money.wealth", "この選択にはより多くの蓄えが必要です。");
    if (choice.minEducation && ["none", "primary", "secondary", "univ"].indexOf(p.edu.level) < ["none", "primary", "secondary", "univ"].indexOf(choice.minEducation)) return t("engine.money.education", "この選択には学びや技能が必要です。");
    if (kind === "item" && (p.items || []).indexOf(choice.key) >= 0) return t("engine.spend.owned", "すでに持っています。");
    if (choice.minYear && p.birthYear + p.age < choice.minYear) return t("engine.spend.not_yet", "この時代にはまだ手に入りません。");
    if (choice.minIncome && p.income < Math.max(choice.minIncome, Number(BY[p.iso].cons_pc || 0) * 0.8)) return t("engine.econ.income", "所得が増えると選べます。");
    if (choice.minTour && Number(BY[p.iso].tour_out || 0) < choice.minTour) return t("engine.econ.travel", "海外旅行の機会が限られています。");
    if (choice.rural && p.urban) return t("engine.spend.rural", "農村での暮らし向けです。");
    if ((choice.needsChild || choice.key === "schoolFees") && !(p.kids || []).some(function (k) { return k.alive && p.age - k.born >= (choice.key === "tutoring" ? 6 : 0) && p.age - k.born < (choice.key === "tutoring" ? 19 : 22); })) return t("engine.spend.no_child", "学費を払う子どもがいません。");
    if ((choice.needsParent || choice.key === "parents") && !((p.parents && p.parents.mom && p.parents.mom.alive) || (p.parents && p.parents.dad && p.parents.dad.alive))) return t("engine.spend.no_parent", "仕送り先の親がいません。");
    if (choice.needsSpouse && !(p.spouse && p.spouse.alive)) return t("engine.spend.no_spouse", "結婚相手がいません。");
    return "";
  }
  function optionView(p, choice, kind) {
    var price = optionPrice(p, choice), reason = optionReason(p, choice, kind);
    var cash = availableMoney(p), shortage = Math.max(0, price - cash);
    var limit = Math.max(0, Math.min((p.income || 0) * 0.5 - (p.loanDebt || 0), debtLimit(p) + p.net));
    if (!reason && price > debtLimit(p) + p.net) reason = kind === "investment" ? t("engine.spend.investment_cash", "投資に使える現金が足りません。") : t("engine.spend.loan_limit", "借りられる額の目安を超えています。");
    var canLoan = kind !== "investment" && !reason && shortage > 0 && shortage <= limit && price <= debtLimit(p) + p.net;
    if (!reason && shortage) reason = kind === "investment" ? t("engine.spend.investment_cash", "投資に使える現金が足りません。") : t("engine.spend.cash_short", "手元のお金が足りません。");
    return { key: choice.key, label: choice.label, price: price, effect: choice.effect,
      category: choice.category || (kind === "item" ? "buy" : kind === "investment" ? "invest" : choice.key === "parents" ? "family" : choice.key === "donation" ? "donate" : choice.key === "schoolFees" || choice.key === "checkup" ? "learning" : "living"),
      applicable: !optionReason(p, choice, kind), available: !reason, why: reason, canLoan: canLoan };
  }
  function spendOptions(p) { return ITEMS.map(function (x) { return optionView(p, x, "item"); }).concat(SERVICES.map(function (x) { return optionView(p, x, "service"); })); }
  function investOptions(p) { return INVESTMENTS.map(function (x) { return optionView(p, x, "investment"); }); }
  function investmentTotal(p) {
    var total = 0, x = p.investments || {};
    Object.keys(x).forEach(function (key) { total += x[key] || 0; });
    return total;
  }
  function availableMoney(p) { return Math.max(0, (p.net || 0) + (p.loanDebt || 0) - investmentTotal(p)); }
  var LIFESTYLES = [
    { key: "frugal", label: t("engine.lifestyle.frugal", "節約"), saving: 1.5, happiness: -0.4, health: 0 },
    { key: "normal", label: t("engine.lifestyle.normal", "ふつう"), saving: 1, happiness: 0, health: 0 },
    { key: "comfortable", label: t("engine.lifestyle.comfortable", "ゆとり"), saving: 0.65, happiness: 0.7, health: 0.1 },
    { key: "luxury", label: t("engine.lifestyle.luxury", "ぜいたく"), saving: 0.2, happiness: 1.2, health: 0 }
  ];
  var ASSET_CLASSES = [
    ["deposits", "預金", 0.01, "low"], ["bonds", "国債", 0.02, "medium"],
    ["stocks", "株式", 0.06, "high"], ["gold", "金", 0.025, "high"],
    ["realEstate", "不動産", 0.05, "medium"], ["business", "事業", 0.075, "high"],
    ["retirement", "退職資金", 0.035, "medium"],
    ["goldJewellery", "金の装飾品", 0.02, "high"], ["livestock", "家畜", 0.035, "high"],
    ["farmland", "農地", 0.04, "medium"], ["rotatingSavings", "互助貯蓄", 0.005, "medium"],
    ["mobileWallet", "携帯ウォレット", 0.005, "low"], ["cooperativeShare", "協同組合の持分", 0.04, "medium"],
    ["foreignCurrency", "外貨", 0.0, "high"], ["crypto", "暗号資産", 0.03, "high"],
    ["speculativeLand", "投機的な土地", 0.06, "high"], ["treasuryBills", "短期国債", 0.015, "low"],
    ["rentalProperty", "賃貸用の住まい", 0.05, "medium"], ["smallShop", "小さな店", 0.055, "high"],
    ["educationFund", "教育費の積立", 0.01, "low"], ["healthFund", "医療費の積立", 0.01, "low"],
    ["harvestStore", "収穫物の保管", 0.02, "high"], ["peerLoan", "知人への貸付", 0.025, "high"]
  ];
  var ASSET_KEYS = { deposits: ["deposits", "savings", "fixedDeposit"], bonds: ["bonds", "governmentBond"],
    stocks: ["stocks", "index"], gold: ["gold"], realEstate: ["realEstate"],
    business: ["business", "shop", "microfinance"], retirement: ["retirement"],
    goldJewellery: ["goldJewellery"], livestock: ["livestock"], farmland: ["farmland"],
    rotatingSavings: ["rotatingSavings"], mobileWallet: ["mobileWallet"], cooperativeShare: ["cooperativeShare"],
    foreignCurrency: ["foreignCurrency"], crypto: ["crypto"], speculativeLand: ["speculativeLand"],
    treasuryBills: ["treasuryBills"], rentalProperty: ["rentalProperty"], smallShop: ["smallShop"],
    educationFund: ["educationFund"], healthFund: ["healthFund"], harvestStore: ["harvestStore"], peerLoan: ["peerLoan"] };
  function rotatingSavingsLabel(p) {
    var names = { ner: "tontine", eth: "ekub", nga: "susu", ind: "chit", bgd: "chit", idn: "arisan", mex: "tanda", chn: "hui", zaf: "stokvel" };
    var name = names[p.iso];
    return name ? t("engine.money.rotating." + name, name) : t("engine.asset.rotatingSavings", "互助貯蓄");
  }
  function depositRealRate(c, year) {
    var observedYear = Number(c.year && c.year.dep_rate) || 2025;
    var inflation = Number(c.infl_history && c.infl_history[year]);
    if (!isFinite(inflation)) inflation = Number(c.infl == null ? 2 : c.infl);
    var observed = (Number(c.dep_rate == null ? 1 : c.dep_rate) - inflation) / 100;
    // A single observed nominal deposit rate cannot describe every past or future year.
    var weight = clamp(1 - Math.abs(year - observedYear) / 8, 0, 1);
    return 0.005 + weight * (observed - 0.005);
  }
  function portfolio(p) {
    var inv = p.investments || {}, result = { cash: availableMoney(p), deposits: 0, bonds: 0, stocks: 0,
      gold: 0, realEstate: 0, business: 0, retirement: 0 };
    Object.keys(ASSET_KEYS).forEach(function (key) { result[key] = result[key] || 0; ASSET_KEYS[key].forEach(function (name) { result[key] += Number(inv[name]) || 0; }); });
    var d = p.debtAccounts || {}, allocated = Object.keys(d).reduce(function (sum, key) { return sum + (Number(d[key].balance) || 0); }, 0);
    result.debts = { mortgage: Number(d.mortgage && d.mortgage.balance) || 0,
      consumer: (d.bank && d.bank.category === "student" ? 0 : Number(d.bank && d.bank.balance) || 0) + (Number(d.credit_card && d.credit_card.balance) || 0) +
        (Number(d.family && d.family.balance) || 0) + (Number(d.payday && d.payday.balance) || 0) +
        (Number(d.bnpl && d.bnpl.balance) || 0) + (Number(d.shopCredit && d.shopCredit.balance) || 0) +
        Math.max(0, (p.loanDebt || 0) - allocated) +
        Math.max(0, investmentTotal(p) - (p.net || 0) - (p.loanDebt || 0)),
      informal: (Number(d.microfinance && d.microfinance.balance) || 0) + (Number(d.informal_lender && d.informal_lender.balance) || 0) +
        (Number(d.pawn && d.pawn.balance) || 0) + (Number(d.cropLoan && d.cropLoan.balance) || 0),
      student: (Number(d.student && d.student.balance) || 0) + (d.bank && d.bank.category === "student" ? Number(d.bank.balance) || 0 : 0) };
    result.debts.total = result.debts.mortgage + result.debts.consumer + result.debts.informal + result.debts.student;
    result.total = result.cash + Object.keys(ASSET_KEYS).reduce(function (sum, key) { return sum + result[key]; }, 0);
    result.netWorth = result.total - result.debts.total;
    result.history = (p.portfolioHistory || []).slice();
    return result;
  }
  function assetClasses(p) {
    var c = BY[p.iso] || {}, year = p.birthYear + p.age, cash = availableMoney(p), access = p.wealth <= 2 ? Number(c.acct_poor40 || 0) : Number(c.acct || 0);
    return ASSET_CLASSES.map(function (item) {
      var key = item[0], reason = "";
      if (p.ended) reason = t("engine.econ.ended", "この人生は終わっています。");
      else if (["gold", "business", "goldJewellery", "livestock", "farmland", "rotatingSavings", "harvestStore", "smallShop", "peerLoan"].indexOf(key) < 0 && access < 25 && !p.bankAccess) reason = t("engine.econ.account", "金融口座を利用しにくい状況です。");
      else if (key === "stocks" && (year < 1900 || Number(c.mktcap || 0) < 10 || cash < 100)) reason = t("engine.econ.market", "株式市場や投資資金へのアクセスが必要です。");
      else if (key === "realEstate" && cash < Math.max(500, medianIncome(p) * 0.3)) reason = t("engine.econ.wealth", "まとまった資金が必要です。");
      else if (key === "retirement" && year < 1940) reason = t("engine.econ.era", "この時代には利用できません。");
      if (!reason && key === "crypto" && year < 2013) reason = t("engine.money.era_crypto", "暗号資産は2013年ごろからの選択肢です。");
      if (!reason && key === "mobileWallet" && (year < 2005 || ["ner", "eth", "nga", "ind", "bgd", "idn"].indexOf(p.iso) < 0)) reason = t("engine.money.mobile", "この時代・地域では携帯送金を利用できません。");
      if (!reason && key === "rotatingSavings" && ["ner", "eth", "nga", "ind", "bgd", "idn", "mex", "chn", "zaf"].indexOf(p.iso) < 0) reason = t("engine.money.region", "この地域では一般的ではありません。");
      if (!reason && key === "goldJewellery" && ["ind", "bgd", "idn", "tur", "eth", "nga"].indexOf(p.iso) < 0) reason = t("engine.money.region", "この地域では一般的ではありません。");
      if (!reason && ["livestock", "farmland", "harvestStore"].indexOf(key) >= 0 && p.urban) reason = t("engine.spend.rural", "農村での暮らし向けです。");
      if (!reason && ["farmland", "speculativeLand", "rentalProperty"].indexOf(key) >= 0 && (p.wealth < 3 || cash < Math.max(100, medianIncome(p) * 0.08))) reason = t("engine.econ.wealth", "まとまった資金が必要です。");
      if (!reason && ["speculativeLand", "rentalProperty"].indexOf(key) >= 0 && p.wealth < 4) reason = t("engine.money.wealth", "この選択にはより多くの蓄えが必要です。");
      if (!reason && ["cooperativeShare", "treasuryBills", "peerLoan"].indexOf(key) >= 0 && year < 1950) reason = t("engine.econ.era", "この時代には利用できません。");
      return { key: key, label: key === "rotatingSavings" ? rotatingSavingsLabel(p) : t("engine.asset." + key, item[1]), available: !reason, reason: reason,
        expectedReturn: key === "deposits" ? depositRealRate(c, year) : item[2], risk: item[3] };
    });
  }
  function invest(p, key, amountPPP) {
    var amount = Number(amountPPP), option = assetClasses(p).filter(function (x) { return x.key === key; })[0];
    if (!option || !option.available || !isFinite(amount) || amount <= 0 || amount > availableMoney(p))
      return { ok: false, text: option && option.reason || t("engine.econ.cash", "使える現金が足りません。") };
    p.investments = p.investments || {};
    p.investments[key] = (p.investments[key] || 0) + amount;
    return { ok: true, text: t("engine.econ.invested", "資産に投資しました。") };
  }
  function sell(p, key, amountPPP) {
    var amount = Number(amountPPP), inv = p.investments || {};
    var holdings = ASSET_KEYS[key] || [];
    var total = holdings.reduce(function (sum, name) { return sum + (Number(inv[name]) || 0); }, 0);
    if (p.ended || !holdings.length || !isFinite(amount) || amount <= 0 || amount > total)
      return { ok: false, text: t("engine.econ.sell_unavailable", "売却できる資産が足りません。") };
    holdings.forEach(function (name) { var sold = Math.min(Number(inv[name]) || 0, amount); inv[name] = (Number(inv[name]) || 0) - sold; amount -= sold; });
    return { ok: true, text: t("engine.econ.sold", "資産を売却しました。") };
  }
  function borrowOptions(p) {
    var c = BY[p.iso] || {}, annual = Math.max(Number(p.income) || 0, medianIncome(p)), formal = Number(c.credit || 0), access = Number(c.borrow_fi || 0), rate = Math.max(0, Number(c.lend_rate == null ? 10 : c.lend_rate) / 100);
    var studentEligible = c.gdp >= 12000 && formal >= 70 && p.edu && p.edu.stage === "univ";
    var creditLabels = { bank: "銀行", mortgage: "住宅ローン", credit_card: "クレジットカード", microfinance: "マイクロファイナンス", informal_lender: "非公式の貸し手", family: "家族",
      pawn: "質屋", payday: "給料日前の短期融資", bnpl: "後払い", shopCredit: "商店の掛け買い", cropLoan: "作付け資金融資" };
    return [["bank", rate, annual * clamp(formal / 80, 0.25, 2), access >= 15 && !p.bankrupt && (!p.informal || studentEligible)],
      ["mortgage", rate + 0.02, annual * clamp(formal / 35, 0.5, 5), access >= 20 && !p.bankrupt && (p.house || p.wealth >= 3)],
      ["credit_card", rate + 0.14, annual * 0.35, c.gdp >= 10000 && Number(c.acct || 0) >= 55 && !p.bankrupt],
      ["microfinance", clamp(rate + 0.25, 0.25, 0.6), annual * 0.7, p.age >= 18 && !p.bankrupt],
      ["informal_lender", clamp(rate + 0.85, 0.6, 2), annual * 1.5, p.age >= 18],
      ["family", 0.02, annual * 0.4, p.age >= 16 && p.stats.r >= 35],
      ["pawn", 0.32, annual * 0.16, p.age >= 18 && (p.items || []).length > 0],
      ["payday", 0.85, annual * 0.12, p.age >= 18 && c.gdp >= 30000 && p.birthYear + p.age >= 1990 && !p.bankrupt],
      ["bnpl", 0.20, annual * 0.18, p.age >= 18 && c.gdp >= 7000 && p.birthYear + p.age >= 2010 && !p.bankrupt],
      ["shopCredit", 0.16, annual * 0.20, p.age >= 18 && p.birthYear + p.age >= 1950],
    ["cropLoan", 0.22, annual * 0.4, p.age >= 18 && !p.urban && p.birthYear + p.age >= 1970]].map(function (x) {
      var used = p.debtAccounts && p.debtAccounts[x[0]] ? p.debtAccounts[x[0]].balance : 0;
      var reason = "";
      if (p.ended) reason = t("engine.econ.ended", "この人生は終わっています。");
      else if (!x[3]) {
        reason = x[0] === "pawn" && !(p.items || []).length ? t("engine.money.collateral", "質に入れる品物が必要です。") :
          x[0] === "payday" && c.gdp < 30000 ? t("engine.money.rich_credit", "高所得国で扱われる短期融資です。") :
          x[0] === "bnpl" && p.birthYear + p.age < 2010 ? t("engine.econ.era", "この時代には利用できません。") :
          x[0] === "cropLoan" && p.urban ? t("engine.spend.rural", "農村での暮らし向けです。") :
          t("engine.econ.credit_unavailable", "この借入先は利用できません。");
      }
      return { key: x[0], label: x[0] === "bank" && studentEligible ? t("engine.credit.student", "学生向け銀行融資") : t("engine.credit." + x[0], creditLabels[x[0]]), rate: x[1], limit: Math.max(0, x[2] - used), available: !!x[3] && !p.ended,
        reason: reason };
    });
  }
  function borrow(p, key, amountPPP) {
    var amount = Number(amountPPP), option = borrowOptions(p).filter(function (x) { return x.key === key; })[0];
    if (!option || !option.available || !isFinite(amount) || amount <= 0 || amount > option.limit)
      return { ok: false, text: option && option.reason || t("engine.econ.credit_limit", "借入可能額を超えています。") };
    p.debtAccounts = p.debtAccounts || {};
    var account = p.debtAccounts[key] || { balance: 0, rate: option.rate };
    account.balance += amount; account.rate = option.rate;
    if (key === "bank" && p.edu && p.edu.stage === "univ" && BY[p.iso].gdp >= 12000) account.category = "student";
    p.debtAccounts[key] = account;
    p.loanDebt = (p.loanDebt || 0) + amount; p.debt = Math.max(p.loanDebt, -p.net, 0);
    (p.debtEvents || (p.debtEvents = [])).push({ age: p.age, text: t("engine.econ.borrowed", "借入を受けました。") + " " + option.label });
    return { ok: true, text: t("engine.econ.borrowed", "借入を受けました。") };
  }
  function repay(p, key, amountPPP) {
    var amount = Number(amountPPP), account = p.debtAccounts && p.debtAccounts[key];
    if (!account || !isFinite(amount) || amount <= 0 || amount > account.balance || amount > availableMoney(p))
      return { ok: false, text: t("engine.econ.repay_unavailable", "返済できる現金か借入残高が足りません。") };
    account.balance -= amount; p.loanDebt = Math.max(0, (p.loanDebt || 0) - amount);
    p.debt = Math.max(p.loanDebt, -p.net, 0);
    (p.debtEvents || (p.debtEvents = [])).push({ age: p.age, text: t("engine.econ.repaid", "借入を返済しました。") + " " + (borrowOptions(p).filter(function (x) { return x.key === key; })[0] || { label: key }).label });
    return { ok: true, text: t("engine.econ.repaid", "借入を返済しました。") };
  }
  function reduceDebtAccounts(p, amount) {
    var accounts = p.debtAccounts || {};
    Object.keys(accounts).sort(function (x, y) { return accounts[y].rate - accounts[x].rate; }).forEach(function (key) {
      var paid = Math.min(accounts[key].balance, amount);
      accounts[key].balance -= paid; amount -= paid;
    });
  }
  function setLifestyle(p, key) {
    if (p.ended || !LIFESTYLES.some(function (x) { return x.key === key; })) return { ok: false, text: t("engine.econ.lifestyle_unavailable", "暮らし方を選べません。") };
    p.lifestyle = key; p.lifestyleManual = true; return { ok: true, text: t("engine.econ.lifestyle_set", "暮らし方を変えました。") };
  }
  function spendCatalog(p) {
    var c = BY[p.iso] || {}, options = spendOptions(p), categories = {};
    options.forEach(function (item) {
      var choice = ITEMS.concat(SERVICES).filter(function (x) { return x.key === item.key; })[0], reason = item.why || "";
      if (!reason && item.key === "foreignTrip" && Number(c.tour_out || 0) < 0.03) reason = t("engine.econ.travel", "海外旅行の機会が限られています。");
      if (!reason && ["newCar", "secondHome", "privateSchool", "privateHealth"].indexOf(item.key) >= 0 && p.income < Math.max(10000, Number(c.cons_pc || 0) * 2)) reason = t("engine.econ.income", "所得が増えると選べます。");
      var cat = item.category;
      (categories[cat] || (categories[cat] = [])).push({ key: item.key, label: item.key === "rotatingSavings" ? rotatingSavingsLabel(p) : item.label, price: item.price,
        available: !reason, reason: reason, effect: item.effect });
    });
    return Object.keys(categories).map(function (category) { return { category: category, items: categories[category] }; });
  }
  function transportOf(p) {
    var items = p.items || [], c = BY[p.iso], distance = p.urban ? 7 : 12;
    if (c.urban < 30 && !p.urban) distance += 3;
    var mode = "徒歩", speed = 4.5;
    if (p.urban && c.gdp > 3500) { mode = "乗り合いバス"; speed = 14; }
    if (items.indexOf("bike") >= 0) { mode = "自転車"; speed = 12; }
    if (items.indexOf("motorbike") >= 0 || items.indexOf("deliveryBike") >= 0) { mode = "バイク"; speed = 28; }
    if (items.indexOf("usedCar") >= 0 || items.indexOf("newCar") >= 0) { mode = "車"; speed = items.indexOf("newCar") >= 0 ? 40 : 35; }
    return { mode: english() ? t("engine.transport." + { "徒歩": "walk", "乗り合いバス": "bus", "自転車": "bike", "バイク": "motorbike", "車": "car" }[mode], mode) : mode, minutes: Math.round(distance / speed * 60 + (mode === "乗り合いバス" ? 12 : mode === "車" ? 8 : 0)) };
  }
  function spend(p, key, opts) {
    opts = opts || {};
    var item = ITEMS.filter(function (x) { return x.key === key; })[0];
    var service = SERVICES.filter(function (x) { return x.key === key; })[0];
    var investment = INVESTMENTS.filter(function (x) { return x.key === key; })[0];
    var choice = item || service || investment;
    if (!choice) return { ok: false, message: t("engine.spend.invalid", "この使い道は選べません。") };
    var reason = optionReason(p, choice, item ? "item" : investment ? "investment" : "service");
    if (reason) return { ok: false, message: reason };
    var minimum = optionPrice(p, choice);
    var price = investment ? Math.max(minimum, Math.round(Number(opts.amount) || minimum)) : minimum;
    if (!isFinite(price) || price <= 0) return { ok: false, message: t("engine.spend.amount", "金額を確認してください。") };
    var cash = availableMoney(p), shortage = Math.max(0, price - cash);
    var limit = Math.max(0, Math.min((p.income || 0) * 0.5 - (p.loanDebt || 0), debtLimit(p) + p.net));
    if (price > debtLimit(p) + p.net || (shortage > 0 && (!opts.loan || investment || shortage > limit))) return { ok: false, message: investment ? t("engine.spend.investment_cash", "投資に使える現金が足りません。") : (opts.loan ? t("engine.spend.loan_limit", "借りられる額の目安を超えています。") : t("engine.spend.cash", "手元のお金が足りません。借入を選べば、年収の半分まで補えます。")) };
    if (investment) {
      if (!p.investments) p.investments = {};
      p.investments[key] = (p.investments[key] || 0) + price;
      p.ledger.push([english() ? t("engine.spend.investment_ledger", "", { item: choice.label, amount: Math.round(price).toLocaleString("en-US") }) : choice.label + "へ移したお金（日本の物価で" + Math.round(price * YEN_PER_PPP).toLocaleString("ja-JP") + "円）", 0]);
    } else {
      if (shortage) p.loanDebt = (p.loanDebt || 0) + shortage;
      money(p, english() ? t("engine.spend.payment", "", { item: choice.label }) : choice.label + "の支払い", -price);
      if (key === "rotatingSavings" || key === "goldJewellerySaving") {
        var savingsKey = key === "rotatingSavings" ? "rotatingSavings" : "goldJewellery";
        p.investments = p.investments || {};
        p.investments[savingsKey] = (p.investments[savingsKey] || 0) + price * 0.95;
        money(p, t("engine.money.savings_value", "蓄えの価値"), price * 0.95);
      }
      if (["microInsurance", "cropInsurance", "healthCover", "accidentCover", "homeCover", "floodCover", "livestockCover", "incomeCover"].indexOf(key) >= 0) {
        p.moneyProtection = p.moneyProtection || {}; p.moneyProtection[key] = p.birthYear + p.age;
      }
      if (item) {
        if (!p.items) p.items = []; p.items.push(key);
        if (key === "home" || key === "secondHome") {
          p.investments = p.investments || {};
          p.investments.realEstate = (p.investments.realEstate || 0) + price * 0.9;
          money(p, t("engine.econ.property_value", "住まいの価値"), price * 0.9);
          if (key === "home") p.house = true;
        }
        if (choice.business) p.business = true;
      }
      if (choice.incomeBoost && p.income > 0) p.income = Math.round(p.income * choice.incomeBoost);
      if (key === "moveHouse") p.moved = (p.moved || 0) + 1;
      p.stats.hp = clamp(p.stats.hp + (choice.happiness || 0), 1, 100);
      p.stats.h = clamp(p.stats.h + (choice.health || 0), 1, 100);
      p.stats.k = clamp(p.stats.k + (choice.knowledge || 0), 1, 100);
      p.stats.r = clamp(p.stats.r + (choice.relation || 0), 1, 100);
      p.spent++;
    }
    p.debt = Math.max(p.loanDebt || 0, -p.net, 0);
    var message = english() ? t(investment ? "engine.spend.invested" : "engine.spend.bought", "", { item: choice.label, amount: Math.round(price).toLocaleString("en-US"), loan: shortage ? t("engine.spend.loan_added", "") : "" }) : choice.label + "に日本の物価で約" + Math.round(price * YEN_PER_PPP).toLocaleString("ja-JP") + (investment ? "円を移しました。" : "円を使いました。") + (shortage ? "不足分を借り、利息がつきました。" : "");
    addLog(p, message + " " + t("engine.spend.effect_note", "暮らしへの変化：{effect}。", { effect: choice.effect }), { cat: investment ? "economy" : ["checkup", "healthInsurance", "dentalCare", "glasses"].indexOf(key) >= 0 ? "health" : ["schoolFees", "tutoring", "languageClass", "vocationalTraining"].indexOf(key) >= 0 ? "learn" : ["parents", "parentRepair", "wedding"].indexOf(key) >= 0 ? "family" : ["donation", "religiousDonation", "schoolDonation"].indexOf(key) >= 0 ? "society" : key === "travel" ? "world" : "work" });
    return { ok: true, message: message };
  }
  function autoSpend(p) {
    if (!p.auto || !p.job || p.age < 16 || p.age > 75) return;
    var options = [];
    if (p.birthYear + p.age >= 1990 && (p.items || []).indexOf("phone") < 0 && (p.items || []).indexOf("smartphone") < 0) options.push("phone");
    if ((p.items || []).indexOf("bike") < 0 && (p.items || []).indexOf("motorbike") < 0 && !p.urban) options.push("bike");
    if ((p.items || []).indexOf("motorbike") < 0 && p.income > 5000) options.push("motorbike");
    if ((p.items || []).indexOf("fridge") < 0) options.push("fridge");
    if ((p.items || []).indexOf("fan") < 0 && p.birthYear + p.age >= 1960) options.push("fan");
    if ((p.items || []).indexOf("washer") < 0 && p.income > 4000) options.push("washer");
    if ((p.items || []).indexOf("waterTank") < 0 && !p.urban) options.push("waterTank");
    if ((p.items || []).indexOf("solarLamp") < 0 && !p.urban && p.birthYear + p.age >= 1990) options.push("solarLamp");
    if ((p.items || []).indexOf("farmTools") < 0 && !p.urban && p.income > 1500) options.push("farmTools");
    if ((p.items || []).indexOf("deliveryBike") < 0 && p.income > 4000 && p.birthYear + p.age >= 1980) options.push("deliveryBike");
    if ((p.items || []).indexOf("roof") < 0 && !p.urban) options.push("roof");
    if ((p.kids || []).some(function (k) { return k.alive && p.age - k.born >= 6 && p.age - k.born < 18; })) options.push("schoolFees");
    if (p.age % 5 === 0) options.push("checkup");
    if (p.age < 40 && p.stats.k < 65 && p.age % 7 === 0) options.push("vocationalTraining");
    if (p.age % 8 === 0) options.push("dentalCare");
    if ((p.kids || []).some(function (k) { return k.alive && p.age - k.born >= 6 && p.age - k.born < 19; }) && p.income > 2500) options.push("tutoring");
    if (p.age % 9 === 0 && p.income > 5000) options.push("schoolDonation");
    if (options.length && chance(0.3)) {
      var affordable = options.filter(function (key) { var x = ITEMS.concat(SERVICES).filter(function (x) { return x.key === key; })[0]; return x && !optionReason(p, x, ITEMS.indexOf(x) >= 0 ? "item" : "service") && optionPrice(p, x) <= availableMoney(p) * 0.35; });
      if (affordable.length) spend(p, pick(affordable));
    }
  }

  // ---------- 決断 ----------
  // f(p) は選んだあとの処理。選択肢の文はすべてこのサイトのオリジナル。
  // Aspirations are possibilities, not promises. The same attempt can meet different barriers.
  var DREAMS = [
    ["doctor", "医師", 23, "learn"], ["teacher", "教師", 20, "learn"], ["nurse", "看護師", 20, "health"],
    ["engineer", "技術者", 21, "learn"], ["lawyer", "弁護士", 24, "learn"], ["artist", "芸術家・音楽家", 18, "learn"],
    ["athlete", "選手", 17, "health"], ["scientist", "研究者", 24, "learn"], ["business_owner", "事業主", 20, "work"],
    ["farmer_own_land", "自分の土地で農業", 20, "work"], ["study_abroad", "海外で学ぶ", 18, "learn"],
    ["move_to_city", "都市へ移る", 18, "world"], ["help_family", "家族を支える", 18, "family"],
    ["travel_world", "世界を旅する", 20, "world"], ["have_family", "家庭を持つ", 20, "family"],
    ["public_service", "公共の仕事", 20, "society"], ["religious_life", "信仰に関わる生活", 18, "family"],
    ["craftsperson", "職人", 18, "work"], ["pilot", "操縦士", 23, "learn"], ["journalist", "記者", 20, "learn"]
  ].map(function (d) { return { key: d[0], label: t("engine.dream." + d[0], d[1]), minAge: d[2], category: d[3] }; });
  var DREAM_BY = {};
  DREAMS.forEach(function (d) { DREAM_BY[d.key] = d; });
  var REASONS = [
    ["household", "家計が苦しく、今は費用を出せませんでした。", "work"],
    ["care_work", "家の仕事や弟妹の世話に時間が必要でした。", "family"],
    ["distance", "近くに通える学校や施設がありませんでした。", "learn"],
    ["fees", "学費や制服、教材の費用を用意できませんでした。", "learn"],
    ["family_permission", "親族の理解が得られず、今回は進めませんでした。", "family"],
    ["early_marriage", "若い時期の結婚で、学びに使える時間が減りました。", "family"],
    ["illness", "病気やけがのため、今回は続けられませんでした。", "health"],
    ["conflict", "治安の悪化で学校や施設が一時閉まりました。", "society"],
    ["disaster", "災害の影響で、計画を延期しました。", "disaster"],
    ["documents", "出生登録など必要な書類がそろいませんでした。", "society"],
    ["bias", "選考で偏見や不公平な扱いに直面しました。", "society"],
    ["exam", "試験に届かず、今回は進めませんでした。", "learn"],
    ["connections", "推薦してくれる人や仕事のつながりが見つかりませんでした。", "work"],
    ["jobs", "希望する働き口が見つかりませんでした。", "work"],
    ["migration_papers", "移動に必要な書類を取得できませんでした。", "society"],
    ["elder_care", "介護が必要な家族を支える時間が必要でした。", "family"]
  ].map(function (r) { return { key: r[0], text: t("engine.obstacle." + r[0], r[1]), cat: r[2] }; });
  function obstacle(p, kind) {
    var c = BY[p.iso], poor = p.wealth <= 2, norms = p.sex === "f" ? clamp((100 - Number(c.fem_sec || 75)) / 35 + Number(c.cm || 0) / 30 + (100 - Number(c.flfp || 50)) / 100, 0.2, 3) : 0.5;
    var conflict = conflictRate(c, p.birthYear + p.age);
    return weighted(REASONS, function (r) {
      var weights = { household: poor ? 3.1 : 0.5, care_work: poor ? 2.3 : 0.9, distance: p.urban ? 0.45 : 2,
        fees: poor ? 2.4 : 0.6, family_permission: norms, early_marriage: p.earlyMarriage === "accepted" ? 3 : Number(c.cm || 0) / 20 + 0.2,
        illness: p.stats.h < 50 ? 2.2 : 0.5, conflict: conflict > 5 ? 2.5 : 0.25, disaster: 0.55,
        documents: 0.65, bias: 0.65, exam: kind === "learn" ? 1.6 : 0.5, connections: 0.8,
        jobs: kind === "work" ? 0.7 + Number(c.unemp || 5) / 9 : 0.5, migration_papers: kind === "world" ? 2 : 0.2,
        elder_care: p.age > 25 ? 0.9 : 0.3 };
      return weights[r.key];
    });
  }
  function noteObstacle(p, kind, action) {
    var reason = obstacle(p, kind);
    var line = t("engine.choice.blocked", "{action}を試みましたが、{reason}", { action: action, reason: reason.text });
    addLog(p, line, { blocked: true, reasonKey: reason.key, cat: kind, dream: !!p.dream, tone: "bad" });
    if (p.dream) (p.dreamBlocked || (p.dreamBlocked = [])).push({ age: p.age, reasonKey: reason.key, text: reason.text });
  }
  function setDream(p, key) {
    if (key !== null && !DREAM_BY[key]) return false;
    p.dream = key;
    p.dreamProgress = 0;
    p.dreamBlocked = [];
    p.dreamAchieved = !!(key && lastHistory(p, "dream_achieved", key));
    if (key) addLog(p, t("engine.dream.set", "「{dream}」を将来の夢にしました。", { dream: DREAM_BY[key].label }), { dream: true, cat: DREAM_BY[key].category,
      historyType: "dream_set", dreamKey: key, outcome: "chosen" });
    return true;
  }
  function dreamReadiness(p, d) {
    var education = { pre: 0, none: 0, primary: 10, secondary: 25, univ: 45 }[p.edu.level] || 0;
    var professional = ["doctor", "engineer", "lawyer", "scientist", "pilot", "nurse", "teacher", "journalist"].indexOf(d.key) >= 0;
    var useful = professional ? education : Math.min(25, education);
    var economic = (p.wealth - 1) * (professional ? 7 : 4) + (p.wealth - 3) * 3;
    var health = p.stats.h < 35 ? -12 : 0;
    return clamp((p.dreamProgress || 0) + useful + economic + health, 0, 100);
  }
  function dreamRequirement(p, key) {
    var jobs = { doctor: "doctor", teacher: "teacher", nurse: "nurse", engineer: "engineer", lawyer: "lawyer", scientist: "researcher" };
    var jobLabels = { doctor: "医師", teacher: "教師", nurse: "看護師", engineer: "技術者", lawyer: "弁護士", scientist: "研究者" };
    if (jobs[key]) return p.edu.level === "univ" && p.job === t("engine.job." + jobs[key], jobLabels[key]);
    if (key === "pilot" || key === "journalist") return p.edu.level === "univ" && /pilot|journalist|パイロット|記者/i.test(p.job || "");
    if (key === "artist" || key === "athlete") return !!p.hobby && p.stats.h >= 40 && !!p.creativePractice;
    if (key === "business_owner") return !!p.business;
    if (key === "farmer_own_land") return !!p.house && !!p.job && /農|farm/i.test(p.job);
    if (key === "study_abroad") return !!p.scholar && !!p.abroad;
    if (key === "move_to_city") return !!p.urban && p.moved > 0;
    if (key === "travel_world") return p.moved >= 2 && !!p.abroad;
    if (key === "have_family") return !!p.spouse || p.kids.length > 0;
    if (key === "help_family") return (p.saved || 0) >= 1 || p.stats.r >= 65;
    if (key === "public_service") return !!p.community || /警察|公務|police|civil servant/i.test(p.job || "");
    if (key === "religious_life") return p.stats.r >= 60;
    if (key === "craftsperson") return p.stats.k >= 60 && /carpenter|mason|mechanic|welder|tailor|baker|metalworker|printer|garment|craft|大工|左官|整備|溶接|仕立|パン職人|金属加工|印刷|縫製/i.test(p.job || "");
    return true;
  }
  function dreamStatus(p) {
    if (!p.dream || !DREAM_BY[p.dream]) return { key: null, progress: 0, stage: t("engine.dream.stage.none", "まだ夢は決まっていません。"), blocked: [], achieved: false };
    var d = DREAM_BY[p.dream], progress = dreamReadiness(p, d), achieved = (p.history || []).some(function (event) { return event.type === "birth"; }) ?
      !!lastHistory(p, "dream_achieved", p.dream) : !!p.dreamAchieved && dreamRequirement(p, d.key);
    return { key: d.key, progress: achieved ? 100 : Math.min(99, Math.round(progress)),
      stage: achieved ? t("engine.dream.stage.achieved", "夢をかなえました。") : progress >= 60 ? t("engine.dream.stage.near", "夢に近づいています。") : progress >= 25 ? t("engine.dream.stage.progress", "少しずつ進んでいます。") : t("engine.dream.stage.start", "道を探しています。"),
      blocked: (p.dreamBlocked || []).slice(), achieved: achieved };
  }
  function coverage(c, year) {
    var history = c.vax_history || {}, years = Object.keys(history).map(Number).filter(function (y) { return y <= year; }).sort(function (a, b) { return b - a; });
    var h = years.length ? history[years[0]] : null;
    var dtp = h && h.dtp3 != null ? h.dtp3 : year < 1980 ? 20 : c.vax_dtp3;
    var measles = h && h.measles != null ? h.measles : year < 1980 ? 15 : c.vax_measles;
    return { dtp3: clamp(Number(dtp == null ? 80 : dtp), 0, 100), measles: clamp(Number(measles == null ? 80 : measles), 0, 100) };
  }
  function vaccinationAtBirth(p, c) {
    var v = coverage(c, p.birthYear), national = Math.max(v.dtp3, v.measles) / 100;
    var adjustment = (p.wealth - 3) * 0.055 + (p.urban ? (1 - c.urban / 100) : -c.urban / 100) * 0.07;
    if (conflictRate(c, p.birthYear) > 15) adjustment -= 0.07;
    var access = clamp(national + adjustment, 0.02, 0.99);
    var full = clamp(access * (Math.min(v.dtp3, v.measles) / Math.max(1, Math.max(v.dtp3, v.measles))), 0, 0.99);
    var partial = clamp(access - full, 0, 1 - full);
    var draw = R(), status = draw < full ? "full" : draw < full + partial ? "partial" : "none";
    if (status === "full") return { status: status, reasonKey: null };
    var reasons = ["distance", "cost", "supply", "conflict", "information", "family"];
    var weights = { distance: p.urban ? 0.6 : 2, cost: p.wealth <= 2 ? 2.1 : 0.5,
      supply: 1.2, conflict: conflictRate(c, p.birthYear) > 10 ? 2.6 : 0.25, information: 0.9, family: 0.5 };
    return { status: status, reasonKey: weighted(reasons, function (r) { return weights[r]; }) };
  }
  var vaxNormCache = {};
  function vaccinationNormalizer(p) {
    var cacheKey = p.iso + "|" + p.sex + "|" + p.era + "|" + p.birthYear;
    if (vaxNormCache[cacheKey]) return vaxNormCache[cacheKey];
    var c = BY[p.iso], v = coverage(c, p.birthYear), full = Math.min(v.dtp3, v.measles) / 100;
    var partial = Math.abs(v.dtp3 - v.measles) / 100, none = 1 - full - partial;
    var table = lifeTable(c, p.sex, p.era, p.birthYear).slice(0, 5), targetSurvival = 1;
    table.forEach(function (q) { targetSurvival *= 1 - q; });
    var lo = 0.3, hi = 3, k, survival;
    for (var i = 0; i < 26; i++) {
      k = (lo + hi) / 2;
      survival = 0;
      [[full, 0.68], [partial, 1.12], [none, 1.85]].forEach(function (entry) {
        var product = 1;
        table.forEach(function (q) { product *= 1 - clamp(q * entry[1] / k, 0, 1); });
        survival += entry[0] * product;
      });
      if (survival < targetSurvival) lo = k; else hi = k;
    }
    vaxNormCache[cacheKey] = (lo + hi) / 2;
    return vaxNormCache[cacheKey];
  }
  function advanceDream(p, amount) {
    if (!p.dream || p.dreamAchieved || lastHistory(p, "dream_achieved", p.dream)) return;
    p.dreamProgress = clamp((p.dreamProgress || 0) + amount, 0, 100);
    var d = DREAM_BY[p.dream];
    if (p.age >= d.minAge && dreamReadiness(p, d) >= 100 && dreamRequirement(p, d.key) && chance(clamp(0.08 + p.wealth * 0.04 + p.stats.k / 500, 0.1, 0.45))) {
      p.dreamAchieved = true;
      addLog(p, t("engine.dream.achieved", "長い道のりの末、「{dream}」という夢をかなえました。", { dream: d.label }), { dream: true, big: true, cat: d.category, tone: "good", historyType: "dream_achieved", dreamKey: d.key,
        outcome: "achieved",
        causeId: ((p.history || []).filter(function (x) { return x.type === "work_start" || x.type === "choice_success" || x.type === "school_finish"; }).slice(-1)[0] || {}).id });
    }
  }
  // Keys are stable API identifiers; descriptions and outcomes live in the translation dictionary.
  var CHOICES = [
    ["ask_school", 6, 17, 0, 0.51, "learn", 11, "学校に通い続けたいと頼む"], ["scholarship", 12, 25, 0.03, 0.35, "learn", 19, "奨学金に応募する"],
    ["night_school", 15, 55, 0.04, 0.58, "learn", 13, "夜間学校に通う"], ["move_city", 16, 50, 0.18, 0.42, "world", 12, "都市へ出る"],
    ["apprenticeship", 13, 40, 0.03, 0.58, "work", 13, "弟子入りを頼む"], ["vocational", 15, 45, 0.10, 0.48, "work", 16, "職業訓練を受ける"],
    ["marry", 18, 65, 0.04, 0.52, "family", 16, "恋人と結婚したいと伝える"], ["start_business", 18, 60, 0.42, 0.38, "work", 21, "起業する"],
    ["migrate", 18, 55, 0.32, 0.24, "world", 22, "移住を試みる"], ["family_discussion", 12, 30, 0, 0.45, "family", 12, "親族と将来について話し合う"],
    ["distant_hospital", 5, 75, 0.24, 0.62, "health", 11, "遠くの病院で治療を受ける"], ["ngo_program", 8, 28, 0, 0.39, "learn", 13, "地域の支援制度を探す"],
    ["relatives_help", 8, 35, 0, 0.47, "family", 9, "親族に助けを頼む"], ["save_money", 12, 70, 0, 0.73, "work", 7, "少しずつ貯金する"],
    ["sit_exam", 15, 35, 0.08, 0.42, "learn", 17, "試験に挑む"], ["seek_recommendation", 15, 55, 0.02, 0.43, "work", 11, "推薦を頼む"],
    ["try_job", 15, 65, 0.01, 0.47, "work", 13, "仕事に応募する"], ["practice_craft", 10, 65, 0.02, 0.72, "learn", 9, "技能を練習する"],
    ["rideHailing", 18, 65, 0.02, 0.62, "work", 8, "配車サービスで働く"],
    ["deliveryDriving", 18, 68, 0.01, 0.68, "work", 8, "配達の仕事をする"],
    ["onlineSelling", 18, 70, 0.02, 0.62, "work", 8, "ネットで品物を売る"],
    ["sideJobs", 18, 72, 0, 0.66, "work", 7, "副業を探す"],
    ["rentRoom", 21, 75, 0.01, 0.70, "work", 8, "部屋を貸す"],
    ["smallShop", 18, 70, 0.04, 0.56, "work", 10, "小さな店を開く"],
    ["franchise", 25, 65, 0.10, 0.48, "work", 10, "加盟店を始める"],
    ["homePiecework", 18, 70, 0.01, 0.70, "work", 7, "自宅で出来高の仕事をする"],
    ["seasonalMigration", 18, 65, 0.03, 0.52, "work", 9, "季節労働に出る"],
    ["tutoringWork", 18, 72, 0.01, 0.63, "work", 8, "学習を教える"],
    ["repairWork", 18, 72, 0.02, 0.60, "work", 8, "修理の仕事を請ける"],
    ["marketTrading", 18, 70, 0.03, 0.59, "work", 8, "市場で売買する"],
    ["cateringWork", 18, 72, 0.02, 0.63, "work", 8, "食事を作って売る"],
    ["childcareWork", 18, 70, 0.01, 0.65, "work", 8, "子どもの世話を請ける"],
    ["freelanceWork", 18, 70, 0.01, 0.60, "work", 8, "仕事を単発で請ける"],
    ["houseCleaning", 18, 72, 0.01, 0.66, "work", 8, "清掃の仕事を請ける"],
    ["farmWork", 18, 72, 0.01, 0.66, "work", 8, "農作業を請ける"],
    ["remoteWork", 18, 70, 0.02, 0.56, "work", 9, "遠隔の仕事を請ける"],
    ["lottery", 18, 80, 0.002, 0.08, "work", 0, "宝くじを買う"],
    ["sportsBetting", 18, 80, 0.003, 0.10, "work", 0, "合法のスポーツくじを買う"]
  ].map(function (a) { return { key: a[0], min: a[1], max: a[2], costFactor: a[3], base: a[4], cat: a[5], gain: a[6], label: a[7] }; });
  var CHOICE_BY = {};
  CHOICES.forEach(function (a) { CHOICE_BY[a.key] = a; });
  var MONEY_EARNINGS = ["rideHailing", "deliveryDriving", "onlineSelling", "sideJobs", "rentRoom", "smallShop", "franchise", "homePiecework", "seasonalMigration", "tutoringWork", "repairWork", "marketTrading", "cateringWork", "childcareWork", "freelanceWork", "houseCleaning", "farmWork", "remoteWork"];
  function sportsBettingLegal(p) {
    var year = p.birthYear + p.age;
    return (p.iso === "jpn" && year >= 2001) || (p.iso === "bra" && year >= 2018 && year < 2026);
  }
  function moneyEventOptions(p) {
    var c = BY[p.iso] || {}, year = p.birthYear + p.age;
    var observedInflation = c.infl_history && Object.prototype.hasOwnProperty.call(c.infl_history, year) ? Number(c.infl_history[year]) : null;
    var adult = p.age >= 18 && !p.ended;
    return [
      { key: "inheritance", annualProbability: 0.008, available: adult && p.age >= 30 },
      { key: "bonus", annualProbability: 0.016, available: adult && !!p.job && !p.retired },
      { key: "harvest", annualProbability: 0.015, available: adult && !p.urban },
      { key: "theft", annualProbability: 0.010, available: adult && availableMoney(p) > 0 },
      { key: "scam", annualProbability: 0.012, available: adult && year >= 1990 },
      { key: "inflation", annualProbability: observedInflation != null && observedInflation >= 10 ? 0.025 : 0, available: adult && observedInflation != null && observedInflation >= 10 },
      { key: "devaluation", annualProbability: observedInflation != null && observedInflation >= 25 ? 0.014 : 0, available: adult && observedInflation != null && observedInflation >= 25 },
      { key: "bankFailure", annualProbability: 0.003, available: adult && year >= 1900 && Number((p.investments || {}).deposits || 0) > 0 },
      { key: "relativeRequest", annualProbability: 0.018, available: adult && p.stats.r >= 25 },
      { key: "hospitalBill", annualProbability: 0.018, available: adult }
    ];
  }
  function triggerMoneyEvent(p, key) {
    var event = moneyEventOptions(p).filter(function (x) { return x.key === key && x.available; })[0];
    if (!event) return { ok: false, text: t("engine.choice.unavailable", "今年はこの行動を選べません。") };
    var c = BY[p.iso], income = Math.max(80, p.income || medianIncome(p) * 0.35), amount = 0;
    if (key === "inheritance") amount = income * 0.55;
    else if (key === "bonus") amount = income * 0.07;
    else if (key === "harvest") amount = income * 0.10;
    else if (key === "bankFailure") {
      amount = -Math.round(Math.min((p.investments || {}).deposits || 0, income * 0.12));
      p.investments.deposits += amount;
    } else if (key === "inflation" || key === "devaluation") {
      var rate = Number(c.infl_history[p.birthYear + p.age]);
      amount = -Math.min(availableMoney(p), income * clamp((rate - (key === "inflation" ? 8 : 20)) / 200, 0.015, key === "inflation" ? 0.10 : 0.18));
    } else {
      var factor = { theft: 0.045, scam: 0.065, relativeRequest: 0.05, hospitalBill: 0.09 }[key];
      if (key === "hospitalBill" && p.moneyProtection && ["healthCover", "microInsurance"].some(function (name) { return p.moneyProtection[name] >= p.birthYear + p.age - 1; })) factor *= 0.35;
      if (key === "theft" && p.moneyProtection && p.moneyProtection.microInsurance >= p.birthYear + p.age - 1) factor *= 0.5;
      amount = -Math.min(availableMoney(p), income * factor);
    }
    money(p, t("engine.moneyEvent." + key + ".label", key), Math.round(amount));
    p.swings++;
    var line = t("engine.moneyEvent." + key + ".text", key);
    addLog(p, line, { cat: "economy", tone: amount >= 0 ? "good" : "bad" });
    return { ok: true, amount: Math.round(amount), text: line };
  }
  function choiceOptions(p) {
    if (p.ended) return [];
    return CHOICES.filter(function (a) {
      if (p.age < a.min || p.age > a.max || p.choiceYears && p.choiceYears[a.key] === p.age) return false;
      if (a.key === "ask_school" && ["none", "primary", "pmid"].indexOf(p.edu.stage) < 0) return false;
      if (a.key === "night_school" && ["primary", "secondary", "univ"].indexOf(p.edu.stage) >= 0) return false;
      if (a.key === "move_city" && p.urban) return false;
      if (a.key === "marry" && p.rel !== "single") return false;
      if (a.key === "start_business" && p.business) return false;
      if (a.key === "distant_hospital" && p.stats.h >= 65) return false;
      if ((a.key === "lottery" || a.key === "sportsBetting") && p.eduMode) return false;
      if (a.key === "sportsBetting" && p.iso === "jpn" && p.age < 19) return false;
      if (MONEY_EARNINGS.indexOf(a.key) >= 0 && p.moneyActions && p.moneyActions[a.key]) return false;
      return true;
    }).map(function (a) {
      var cost = Math.round(Math.max(0, (p.income || medianIncome(p)) * a.costFactor));
      var chanceEstimate = clamp(a.base + (p.wealth - 3) * 0.095 + (p.stats.k - 50) / 350 + (p.temperament === "grit" ? 0.07 : 0) + (p.stats.h < 40 ? -0.13 : 0) - (conflictRate(BY[p.iso], p.birthYear + p.age) > 10 ? 0.12 : 0) - (p.registered === false && a.key === "migrate" ? 0.15 : 0), 0.025, 0.94);
      if (a.key === "lottery") chanceEstimate = 0.08;
      if (a.key === "sportsBetting") chanceEstimate = 0.20;
      if (a.key === "scholarship" && p.edu.level === "none") chanceEstimate *= 0.45;
      if (a.key === "save_money") cost = 0;
      var blockedReason = p.net + debtLimit(p) < cost ? t("engine.choice.no_money", "費用を用意できません。") : null;
      var year = p.birthYear + p.age;
      if (!blockedReason && ["rideHailing", "onlineSelling", "remoteWork"].indexOf(a.key) >= 0 && year < 2010) blockedReason = t("engine.econ.era", "この時代には利用できません。");
      if (!blockedReason && a.key === "deliveryDriving" && year < 1980) blockedReason = t("engine.econ.era", "この時代には利用できません。");
      if (!blockedReason && a.key === "rentRoom" && !p.house) blockedReason = t("engine.money.home", "貸せる住まいが必要です。");
      if (!blockedReason && a.key === "franchise" && (p.wealth < 4 || p.edu.level === "none" || p.edu.level === "primary")) blockedReason = t("engine.money.franchise", "資金と中等教育が必要です。");
      if (!blockedReason && ["tutoringWork", "remoteWork"].indexOf(a.key) >= 0 && ["none", "primary"].indexOf(p.edu.level) >= 0) blockedReason = t("engine.money.education", "この選択には学びや技能が必要です。");
      if (!blockedReason && a.key === "farmWork" && p.urban) blockedReason = t("engine.spend.rural", "農村での暮らし向けです。");
      if (!blockedReason && a.key === "lottery" && ["jpn", "bra", "mex"].indexOf(p.iso) < 0) blockedReason = t("engine.money.legal", "この国の制度では確認できません。");
      if (!blockedReason && a.key === "sportsBetting" && !sportsBettingLegal(p)) blockedReason = t("engine.money.legal", "この国の制度では確認できません。");
      var likelihood = chanceEstimate >= 0.65 ? "high" : chanceEstimate >= 0.35 ? "medium" : "low";
      return { key: a.key, label: t("engine.choice." + a.key, a.label), cost: cost, chance: chanceEstimate,
        chanceLabel: t("engine.choice.chance." + likelihood, { high: "高い", medium: "ふつう", low: "低い" }[likelihood]), blockedReason: blockedReason };
    });
  }
  function tryChoice(p, key) {
    var a = CHOICE_BY[key], option = choiceOptions(p).filter(function (o) { return o.key === key; })[0];
    if (!a || !option) return { ok: false, text: t("engine.choice.unavailable", "今年はこの行動を選べません。"), blockedReason: "unavailable" };
    if (option.blockedReason) return { ok: false, text: option.blockedReason, blockedReason: option.blockedReason };
    p.choiceYears = p.choiceYears || {};
    p.choiceYears[key] = p.age;
    if (key === "lottery" || key === "sportsBetting") {
      var ticket = Math.max(1, option.cost), won = chance(option.chance);
      money(p, t("engine.money.bet_ticket", "くじの代金"), -ticket);
      if (won) money(p, t("engine.money.bet_prize", "くじの賞金"), ticket * (key === "lottery" ? 5 : 3));
      addLog(p, t(won ? "engine.money.bet_won" : "engine.money.bet_lost", won ? "くじが当たりました。" : "くじは外れました。"), { cat: "economy", tone: won ? "good" : "bad" });
      return { ok: won, text: t(won ? "engine.money.bet_won" : "engine.money.bet_lost", won ? "くじが当たりました。" : "くじは外れました。") };
    }
    if (!option.blockedReason && chance(option.chance)) {
      if (option.cost) money(p, t("engine.choice.cost", "挑戦の費用"), -option.cost);
      if (key === "ask_school" || key === "ngo_program") {
        p.edu.stage = "primary";
        historyEvent(p, "school_start", { level: "primary", outcome: "enrolled", text: t("engine.history.school_start", "学校に通いはじめました。"),
          cat: "learn", tone: "good", causeId: (lastHistory(p, "family_origin") || {}).id });
      }
      if (key === "night_school" && p.edu.level === "none") p.edu.level = "primary";
      if (key === "scholarship") p.scholar = true;
      if (key === "move_city") { p.urban = true; p.moved++; p.slumHome = hasNumber(BY[p.iso], "slum") && chance(percentage(BY[p.iso], "slum", 0)); }
      if (key === "migrate") { p.abroad = pick(BY[p.iso].emig || []); p.moved++; }
      if (key === "marry" && p.rel === "single") {
        var partnerSex = p.sameSexPartner ? p.sex : p.sex === "m" ? "f" : "m";
        var legalMarriage = partnerSex !== p.sex || sameSexMarriageLegal(BY[p.iso], p.birthYear + p.age);
        p.rel = legalMarriage ? "married" : "partnered";
        if (legalMarriage && p.firstMarriageAge == null) p.firstMarriageAge = p.age;
        var n = makeName(BY[p.iso], partnerSex, { birthYear: p.birthYear, group: p.nameGroup }, p.religion);
        p.spouse = { name: n.full, given: n.given, family: n.family, firstSurname: n.firstSurname, d: 0, alive: true, since: p.age, sex: partnerSex };
        if (!legalMarriage && BY[p.iso].ss_criminalized === true && !p.gentle && !p.eduMode)
          addLog(p, t("engine.institution.partner_privacy", "法律上の危険を避けるため、二人の関係を周囲に伝える相手を慎重に選びました。"), dataRef({ cat: "society", tone: "bad" }, historicalSource(), "same_sex_criminalized", "この国では同性間の関係が法律で禁じられています。"));
      }
      if (key === "start_business") p.business = true;
      if (key === "distant_hospital") p.stats.h = clamp(p.stats.h + 11, 0, 100);
      if (key === "save_money") p.saved = (p.saved || 0) + 1;
      if (MONEY_EARNINGS.indexOf(key) >= 0) {
        p.moneyActions = p.moneyActions || {}; p.moneyActions[key] = true;
        p.income = Math.round(Math.max(p.income || 0, medianIncome(p) * 0.35) * (key === "franchise" ? 1.04 : 1.02));
      }
      if (key === "practice_craft" || key === "sit_exam" || key === "vocational") p.stats.k = clamp(p.stats.k + 5, 0, 100);
      if (key === "practice_craft") p.craftPracticed = true;
      if (key === "practice_craft" || key === "vocational" || key === "apprenticeship") p.creativePractice = true;
      var success = t("engine.choice.success", "{action}に取り組み、道が開けました。", { action: option.label });
      addLog(p, success, { dream: !!p.dream, cat: a.cat, tone: "good", historyType: "choice_success", outcome: key });
      syncRelationships(p);
      advanceDream(p, p.dream && DREAM_BY[p.dream].category === a.cat ? a.gain + 4 : a.gain * 0.3);
      return { ok: true, text: success, blockedReason: null };
    }
    var reason = obstacle(p, a.cat);
    var blocked = option.blockedReason || reason.text;
    var line = t("engine.choice.blocked", "{action}を試みましたが、{reason}", { action: option.label, reason: blocked });
    addLog(p, line, { blocked: true, reasonKey: option.blockedReason ? "household" : reason.key, cat: a.cat, dream: !!p.dream, tone: "bad" });
    if (p.dream) (p.dreamBlocked || (p.dreamBlocked = [])).push({ age: p.age, reasonKey: option.blockedReason ? "household" : reason.key, text: blocked });
    return { ok: false, text: line, blockedReason: blocked };
  }

  var DECISIONS = {
    conscription: function (p) {
      var years = hasNumber(BY[p.iso], "conscription_years") ? clamp(BY[p.iso].conscription_years, 0.25, 10) : 1;
      return { title: t("engine.institution.service_title", "兵役の通知"),
        body: t("engine.institution.service_body", "兵役の対象年齢になり、通知が届きました。"),
        note: t(countKey("engine.institution.service_note", years), "この国での兵役期間の目安は{years}年です。免除には審査があります。", { years: years }),
        choices: [
          { t: t("engine.institution.service_accept", "兵役に就く"), f: function (p) {
            p.conscriptionDecided = true; p.serviceYears = years;
            addLog(p, t(countKey("engine.institution.service_started", years), "兵役に就き、約{years}年間の訓練と任務を始めました。", { years: years }), dataRef({ cat: "society", tone: "neutral" }, historicalSource(), "conscription", "この国の兵役期間は約{years}年です。", { years: years }));
          } },
          { t: t("engine.institution.service_exemption", "免除を申請する"), f: function (p) {
            p.conscriptionDecided = true;
            // Eligibility depends on individual circumstances absent from country statistics.
            p.serviceExempt = chance(clamp(0.12 + (p.stats.h < 40 ? 0.18 : 0) + (p.edu.stage === "univ" ? 0.08 : 0), 0, 0.5));
            if (p.serviceExempt) addLog(p, t("engine.institution.service_exempted", "審査の結果、兵役の免除が認められました。"), dataRef({ cat: "society", tone: "neutral" }, historicalSource(), "conscription", "この国の兵役期間は約{years}年です。", { years: years }));
            else { p.serviceYears = years; addLog(p, t("engine.institution.service_required", "免除は認められず、兵役に就きました。"), dataRef({ cat: "society", tone: "neutral" }, historicalSource(), "conscription", "この国の兵役期間は約{years}年です。", { years: years })); }
          } }
        ] };
    },
    retire: function (p) {
      return { title: "退職後の働き方", body: "年齢と健康、年金と貯蓄を考え、働き方を選びます。",
        note: "退職後の収入は年金の加入状況と蓄えに左右されます。", choices: [
          { t: "退職する", f: function (p) { p.retired = true; if (!p.pensionAssessed) { p.pension = chance(pensionProbability(p, BY[p.iso])) ? p.income * 0.42 : 0; p.pensionAssessed = true; } p.income = p.pension + Math.min(availableMoney(p) * 0.025, medianIncome(p) * 0.3); p.stats.h += 2; p.stats.hp += 2; } },
          { t: "働き続ける", f: function (p) { p.retirementChoice = "working"; p.stats.h -= 1; } },
          { t: "短時間で働く", f: function (p) { p.partTime = true; p.income *= 0.6; p.stats.h += 2; p.stats.hp += 2; } },
          { t: "別の仕事に就く", f: function (p) { p.income *= 0.8; p.stats.k += 1; p.retirementChoice = "reemployed"; } },
          { t: "小さな商売を始める", f: function (p) { p.business = true; p.income *= 0.7; p.investments = p.investments || {}; p.investments.business = (p.investments.business || 0) + Math.min(availableMoney(p) * 0.2, medianIncome(p)); p.stats.hp += 1; } }
        ] };
    },
    partTime: function (p) {
      return { title: "短時間勤務を考える", body: "仕事と学び、家族、健康に使う時間を考えます。",
        note: "短時間勤務では収入と昇進機会が減る一方、時間の余裕が生まれます。", choices: [
          { t: "短時間勤務にする", f: function (p) { if (!p.job && p.edu && p.edu.stage === "univ") startJob(p, jobFor("primary", p.urban, BY[p.iso])); if (!p.partTime) { p.partTime = true; p.income *= 0.6; } p.stats.h += 3; p.stats.hp += 3; p.stats.r += 2; } },
          { t: "今の勤務を続ける", f: function (p) { p.stats.h -= 1; } },
          { t: "仕事を一時休む", f: function (p) { p.income *= 0.2; p.partTime = true; p.stats.h += 4; p.stats.r += 3; } }
        ] };
    },
    documentFee: function (p) {
      return { title: t("engine.course.fee_title", "書類の手続き"), body: t("engine.course.fee_body", "必要な書類の手続きで、窓口から非公式な支払いを求められました。"),
        note: t("engine.course.fee_note", "支払うかどうかで、手続きの結果と家計が変わります。"), choices: [
          { t: t("engine.course.fee_pay", "支払って手続きを進める"), f: function (p) { money(p, t("engine.course.fee_cost", "書類の手続き費"), -Math.max(10, p.income * 0.02)); p.registered = true; addLog(p, t("engine.course.fee_paid", "支払いのあと、必要な書類を受け取れました。"), { cat: "society", tone: "good" }); } },
          { t: t("engine.course.fee_decline", "支払わず正式な手続きを求める"), f: function (p) { if (chance(0.35)) { p.registered = true; addLog(p, t("engine.course.fee_resolved", "時間はかかりましたが、正式な手続きで書類を受け取れました。"), { cat: "society", tone: "good" }); } else addLog(p, t("engine.course.fee_delayed", "書類の発行が遅れ、別の機会に手続きを試すことにしました。"), { cat: "society", tone: "bad" }); } }
        ] };
    },
    toy: function (p) {
      return { title: "はじめてのおもちゃ", body: p.given + "は、もうしっかり歩けます。新しいおもちゃを渡すと、まず何をするでしょう。選んだ行動は、この子の気質を少しずつ形づくります。",
        note: "性格の違いの4割ほどは遺伝で説明できると考えられています。ほかにも、育つ中での経験が関わります（双子研究のまとめ）。",
        choices: TEMPERAMENTS.map(function (t) { return { t: t.toy, f: function (p) { p.temperament = t.k; addLog(p, "おもちゃを手にすると、" + t.toy.replace(/る$/, "りました").replace(/す$/, "しました").replace(/う$/, "いました") + "。"); } }; }) };
    },
    school: function (p) {
      return { title: "学校に行きたい", body: "同じ年ごろの子が、制服を着て学校へ向かっていきます。家の仕事は山のようにあります。" + p.given + "はどうしますか。",
        note: "学校に通えるかどうかは、家の暮らし向きや住む場所に大きく左右されます。",
        choices: [
          { t: "親に何度も頼んでみる", f: function (p) { var c = BY[p.iso]; if (chance(clamp(0.45 + (p.wealth - 3) * 0.11 + (p.urban ? 0.08 : -0.06) + (p.sex === "f" ? (Number(c.fem_sec || 75) - 75) / 300 : 0) - (conflictRate(c, p.birthYear + p.age) > 10 ? 0.13 : 0), 0.06, 0.85))) { p.edu = { level: "none", stage: "primary" }; addLog(p, "何度も頼み込んで、学校に通わせてもらえることになりました。", { big: true, tone: "good" }); advanceDream(p, 8); } else noteObstacle(p, "learn", t("engine.choice.ask_school", "学校に通い続けたいと頼む")); } },
          { t: "家の手伝いを続ける", f: function (p) { p.stats.r += 3; addLog(p, "家族を助けることを選びました。"); } }
        ] };
    },
    university: function (p) {
      return { title: "この先の進路", body: "中等教育を終えます。大学に進むにはお金も時間もかかります。働けばすぐに家計を助けられます。",
        note: "高等教育への進学率は、国によって数％から100％近くまで幅があります。",
        choices: [
          { t: "大学をめざす", f: function (p) { var c = BY[p.iso]; if (chance(clamp(0.43 + (p.stats.k - 50) / 120 + (p.wealth - 3) * 0.12 + c.tert / 350 + (p.scholar ? 0.13 : 0) - (p.stats.h < 40 ? 0.14 : 0) - (conflictRate(c, p.birthYear + p.age) > 10 ? 0.12 : 0), 0.035, 0.96))) { p.edu.stage = "univ"; addLog(p, "大学に合格しました。", { big: true, tone: "good", historyType: "school_start", level: "univ", outcome: "enrolled" }); advanceDream(p, 14); } else { noteObstacle(p, "learn", t("engine.choice.sit_exam", "試験に挑む")); finishSchool(p, "secondary"); } } },
          { t: "働きはじめる", f: function (p) { finishSchool(p, "secondary"); } }
        ] };
    },
    firstJob: function (p) {
      var c = BY[p.iso], jobs = jobShortlist(p, c, false);
      return { title: "最初の仕事", body: "働き口がいくつか見つかりました。どれにしますか。",
        note: c.name + "では、働く人のおよそ" + c.agri + "％が農業に従事しています。",
        reasons: jobReasons(p, c, jobs),
        choices: jobs.map(function (detail) { var j = detail.job; return { t: j[0], job: true, jobName: j[0], f: function (p) { startJob(p, j); } }; }).concat([{ t: t("engine.decision.firstJob.wait", "もう少し探す（1年待つ）"), wait: true, f: function (p) {
          p.jobWaits = (p.jobWaits || 0) + 1; p.income = 0;
          var pressure = p.jobWaits >= 2 ? medianIncome(p) * (6 - p.wealth) * 0.045 * (p.jobWaits - 1) : 0;
          if (pressure > 0) {
            money(p, t("engine.job.wait_cost", "仕事探しのあいだの家計費"), -pressure);
            addLog(p, t("engine.job.wait_pressure", "仕事探しが長引き、家計が苦しくなり、家族の気苦労も増えました。"), { cat: "work", tone: "bad" });
          }
          addLog(p, t("engine.job.waited", "もう1年、働き口を探すことにしました。"), { cat: "work" });
        } }]) };
    },
    jobOffer: function (p) {
      var jobs = jobShortlist(p, BY[p.iso], true);
      return { title: "新しい仕事の話", body: "いまは" + p.job + "として働き、" + p.jobYears + "年目になります。別の仕事について声をかけられました。",
        note: "転職で収入が上がることもあれば、慣れるまで収入が不安定になることもあります。",
        choices: jobs.map(function (detail) { var j = detail.job, stepDown = detail.rank < (JOB_DETAILS[p.job] || {}).rank || j[1] < (p.jobF || 0) * 0.95; return { t: stepDown ? "条件を下げて" + j[0] + "に移る" : j[0] + "に移る", job: true, jobName: j[0], stepDown: !!stepDown, f: function (p) { p.jobChanges++; startJob(p, j); } }; }).concat([
          { t: "いまの仕事を続ける", keep: true, f: function (p) { p.income *= 1.03; addLog(p, "今の仕事を続けることにしました。"); } }
        ]) };
    },
    marry: function (p) {
      var c = BY[p.iso], s = p.sameSexPartner ? p.sex : p.sex === "m" ? "f" : "m";
      var nm = makeName(c, s, { birthYear: p.birthYear + p.age - (p.sex === "m" ? -2 : 3), group: p.nameGroup }, p.religion);
      var age = Math.round(clamp(p.age + (p.sex === "m" ? -2 : 3) + gauss() * 3, 16, 80));
      p.cand = { name: nm.full, given: nm.given, family: nm.family, firstSurname: nm.firstSurname, age0: age - p.age, sex: s };
      var marriageAvailable = s !== p.sex || sameSexMarriageLegal(c, p.birthYear + p.age);
      return { title: marriageAvailable ? "結婚の話" : t("engine.institution.partner_title", "いっしょに暮らす話"),
        body: marriageAvailable ? nm.given + "（" + age + "歳）と知り合って" + (1 + Math.floor(R() * 4)) + "年になります。いっしょに暮らす話が出ています。" : t("engine.institution.partner_body", "{name}（{age}歳）と、いっしょに暮らすことを考えています。", { name: nm.given, age: age }),
        note: marriageAvailable ? "結婚する年齢や結婚を選ぶ人の割合は、国や時代によって異なります。" : t("engine.institution.partner_note", "この年、この国では同性の二人は結婚できません。"),
        choices: [
          { t: marriageAvailable ? "いっしょになる" : t("engine.institution.partner_together", "ともに暮らす"), f: function (p) {
            var legal = p.cand.sex !== p.sex || sameSexMarriageLegal(BY[p.iso], p.birthYear + p.age);
            p.spouse = { name: p.cand.name, given: p.cand.given, family: p.cand.family, firstSurname: p.cand.firstSurname, d: p.cand.age0, alive: true, since: p.age, sex: p.cand.sex };
            p.rel = legal ? "married" : "partnered";
            if (legal && p.firstMarriageAge == null) p.firstMarriageAge = p.age;
            p.stats.hp += 8; p.stats.r += 6;
            var marriageOptions = { big: true, tone: "good", cat: "family" };
            if (p.cand.sex === p.sex && hasNumber(BY[p.iso], "ss_marriage_year") && BY[p.iso].ss_marriage_year > 0)
              dataRef(marriageOptions, historicalSource(), "same_sex_marriage", "この国で同性婚が法的に認められたのは{year}年です。", { year: BY[p.iso].ss_marriage_year });
            addLog(p, t(legal ? "engine.institution.married" : "engine.institution.partnered", legal ? "{name}と結婚しました。" : "{name}と、ともに暮らし始めました。", { name: p.cand.given }), marriageOptions);
            if (!legal && BY[p.iso].ss_criminalized === true && !p.gentle && !p.eduMode)
              addLog(p, t("engine.institution.partner_privacy", "法律上の危険を避けるため、二人の関係を周囲に伝える相手を慎重に選びました。"), dataRef({ cat: "society", tone: "bad" }, historicalSource(), "same_sex_criminalized", "この国では同性間の関係が法律で禁じられています。"));
          } },
          { t: marriageAvailable ? "もう少し待つ" : t("engine.institution.partner_wait_choice", "もう少し待つ"), f: function (p) { addLog(p, t("engine.institution.partner_wait", "{name}との暮らしの話を、もう少し先に延ばしました。", { name: p.cand.given })); p.stats.hp -= 2; } }
        ] };
    },
    child: function (p) {
      return { title: "子どもを迎える？", body: "いま子どもは" + p.kids.length + "人です。" + (p.kids.length ? "もう一人、家族を迎えることを考えています。" : "子どもを迎えることを考えています。"),
        note: BY[p.iso].name + "の合計特殊出生率は、女性1人あたり" + BY[p.iso].tfr + "人です。",
        choices: [
          { t: "子どもを迎えたい", f: function (p) { if (chance(0.9)) newKid(p); else addLog(p, "この年は子どもが生まれませんでした。", { tone: "bad" }); } },
          { t: "いまはやめておく", f: function (p) { p.noKids = (p.noKids || 0) + 1; addLog(p, "今は子どもを増やさないことにしました。"); } }
        ] };
    },
    pet: function (p) {
      var a = pick(["犬", "猫", "ヤギ", "鶏", "インコ"]);
      return { title: "生きものを迎える？", body: "近所で" + a + "の子が生まれ、引き取り手を探しています。",
        note: "動物と暮らすことで、気持ちが落ち着くと感じる人もいます。",
        choices: [
          { t: "迎える", f: function (p) { p.pets.push(english() ? t("engine.animal." + ["犬", "猫", "ヤギ", "鶏", "インコ"].indexOf(a), a) : a); p.stats.hp += 4; money(p, a + "の世話", -p.income * 0.02); addLog(p, a + "を家族に迎えました。", { tone: "good" }); } },
          { t: "見送る", f: function (p) { addLog(p, a + "は、別の家にもらわれていきました。"); } }
        ] };
    },
    gamble: function (p) {
      return { title: "ひと勝負してみる？", body: "知り合いが「確実にもうかる話がある」と言っています。年収の半分ほどを出せば、倍になるかもしれないそうです。",
        note: "確実にもうかると約束されても、思いどおりの結果になるとは限りません。",
        choices: [
          { t: "乗ってみる", f: function (p) { var x = p.income * 0.5; if (chance(0.3)) { money(p, "ひと勝負のもうけ", x); addLog(p, "ひと勝負が当たり、お金が増えました。", { tone: "good" }); p.swings++; } else { money(p, "ひと勝負の損", -x); p.stats.hp -= 6; addLog(p, "話はうまくいかず、出したお金は戻りませんでした。", { tone: "bad" }); p.swings++; } } },
          { t: "断る", f: function (p) { addLog(p, "うまい話は断りました。"); } }
        ] };
    },
    move: function (p) {
      var c = BY[p.iso], to = pick(c.emig);
      return { title: "よその土地へ", body: "仕事を求めて" + to + "へ渡った知り合いから、仕送りの話を聞きました。あなたも行ってみますか。",
        note: c.name + "から移り住む人の主な行き先には、" + c.emig.join("、") + "があります。",
        choices: [
          { t: to + "へ渡ってみる", f: function (p) { if (chance(p.registered === false ? 0.25 : 0.55)) { p.moved++; p.abroad = to; p.income *= 1.8; p.stats.r -= 8; addLog(p, to + "に移り住み、働きはじめました。", { big: true, tone: "good" }); } else { money(p, "渡航の費用", -p.income * 0.3); addLog(p, to + "へ渡ろうとしましたが、かないませんでした。", { tone: "bad" }); if (p.registered === false) addLog(p, t("engine.course.move_papers", "渡航に必要な書類をそろえられませんでした。"), { cat: "world" }); } } },
          { t: "この土地に残る", f: function (p) { p.stats.r += 2; addLog(p, "生まれた土地に残ることにしました。"); } }
        ] };
    },
    drink: function (p) {
      return { title: "お酒の量が増えて", body: "眠れない夜が続き、酒に手が伸びる日が増えています。",
        note: "飲酒の問題からの回復には時間がかかることもあります。身近な人や専門家に相談する道もあります。",
        choices: [
          { t: "家族に打ち明けて、量を減らす", f: function (p) { p.stats.r += 3; addLog(p, "家族に打ち明け、少しずつお酒を減らしました。", { tone: "good" }); } },
          { t: "酒でまぎらわす", f: function (p) { p.drink = true; p.stats.h -= 6; addLog(p, "つらいことを、酒でまぎらわせるようになりました。", { tone: "bad" }); } }
        ] };
    },
    care: function (p) {
      var par = p.parents.mom.alive ? p.parents.mom : p.parents.dad;
      var who = par === p.parents.mom ? "母" : "父";
      return { title: who + "の世話", body: who + "が" + (par.age + p.age) + "歳になり、ひとりで暮らすのが難しくなってきました。",
        note: "年をとった親を支える方法は、家族の事情や利用できる制度によって異なります。",
        choices: [
          { t: "引き取っていっしょに暮らす", f: function (p) { p.stats.r += 6; p.stats.h -= 3; money(p, "親の世話", -p.income * 0.08); p.cared = true; addLog(p, who + "を引き取り、そばで世話をしました。"); } },
          { t: "ほかのきょうだいに頼む", f: function (p) { p.stats.r -= 3; addLog(p, who + "の世話はきょうだいに任せ、仕送りをしました。"); money(p, "仕送り", -p.income * 0.04); } }
        ] };
    },
    scholarship: function (p) {
      return { title: "遠くで学ぶ誘い", body: "学費の一部を支える制度に応募できます。利用するには、家を離れて学ぶ必要があります。",
        note: "奨学金は進学の助けになりますが、生活費や移動費まで賄えるとは限りません。",
        choices: [
          { t: "応募して学びに行く", f: function (p) { var c = BY[p.iso]; if (chance(clamp(0.28 + (p.wealth - 3) * 0.08 + (p.stats.k - 50) / 220 + c.tert / 400, 0.05, 0.75))) { p.scholar = true; p.stats.k += 9; p.stats.r -= 3; money(p, "遠くで学ぶ準備", -p.income * 0.12); addLog(p, "支援を受け、遠くで学ぶ機会を得ました。", { big: true, tone: "good" }); advanceDream(p, 16); } else noteObstacle(p, "learn", t("engine.choice.scholarship", "奨学金に応募する")); } },
          { t: "近くで学び続ける", f: function (p) { p.stats.k += 4; p.stats.r += 2; addLog(p, "住み慣れた場所で学びを続けました。", { tone: "good" }); } },
          { t: "いまは働く", f: function (p) { p.stats.r += 2; p.saved++; addLog(p, "進学を見送り、家計を支えました。"); } }
        ] };
    },
    treatment: function (p) {
      var oop = Number(BY[p.iso].oop) || 0;
      return { title: "治療の選び方", body: "体調が戻らず、どこで診てもらうか決めることになりました。",
        note: "医療費の自己負担が大きい地域では、治療を受ける時期や場所が家計に左右されがちです。",
        choices: [
          { t: "設備の整った病院に行く", f: function (p) { var cost = Math.max(100, p.income * (0.16 + oop / 300)); if (p.net + debtLimit(p) < cost || chance(clamp((p.wealth - 1) * 0.15 + (p.urban ? 0.23 : 0.08) - (conflictRate(BY[p.iso], p.birthYear + p.age) > 10 ? 0.15 : 0), 0.05, 0.88)) === false) { noteObstacle(p, "health", t("engine.choice.distant_hospital", "遠くの病院で治療を受ける")); return; } money(p, "病院での治療", -cost); p.stats.h += 10; improveTreatment(p, 0.3); addLog(p, "費用を工面して病院で治療を受けました。", { tone: "good" }); } },
          { t: "近くの診療所に通う", f: function (p) { money(p, "診療所での治療", -Math.max(30, p.income * 0.05)); p.stats.h += 6; improveTreatment(p, 0.2); addLog(p, "近くの診療所に通い、少しずつ回復しました。", { tone: "good" }); } },
          { t: "身近な手当てで様子を見る", f: function (p) { p.stats.h += chance(0.45) ? 3 : -4; p.stats.r += 2; improveTreatment(p, -0.12); addLog(p, "家族に助けられながら休養しました。", { cat: "health" }); } }
        ] };
    },
    home: function (p) {
      return { title: "住まいをどうする", body: "長く暮らせる家を持とうか考えています。まとまったお金が必要です。",
        note: "家を持つ費用は、多くの家庭で長年にわたる大きな支出です。",
        choices: [
          { t: "家を買うか建てる", f: function (p) { p.house = true; if (!p.items) p.items = []; if (p.items.indexOf("home") < 0) p.items.push("home"); money(p, "住まいの費用", -Math.max(500, p.income * 2)); p.stats.hp += 5; addLog(p, "自分たちの住まいを持ちました。", { big: true, tone: "good" }); } },
          { t: "いまの住まいを直す", f: function (p) { if (!p.items) p.items = []; if (p.items.indexOf("roof") < 0) p.items.push("roof"); money(p, "住まいの修繕", -Math.max(100, p.income * 0.25)); p.stats.h += 2; p.stats.hp += 2; addLog(p, "住まいの傷んだところを直しました。", { tone: "good" }); } },
          { t: "資金をためて待つ", f: function (p) { p.saved++; p.stats.hp -= 1; addLog(p, "住まいの話は先送りにしました。"); } }
        ] };
    },
    business: function (p) {
      return { title: "小さな商売", body: "得意なものを売る場所が見つかりました。仕入れにお金がかかります。",
        note: "小規模な商売は収入の道を増やしますが、売上は季節や景気で変わります。",
        choices: [
          { t: "自分で始める", f: function (p) { var cost = Math.max(100, p.income * 0.4); if (p.net + debtLimit(p) < cost || !chance(clamp(0.34 + (p.wealth - 3) * 0.12 - Number(BY[p.iso].unemp || 5) / 150, 0.05, 0.8))) { noteObstacle(p, "work", t("engine.choice.start_business", "起業する")); return; } p.business = true; money(p, "商売の元手", -cost); p.income *= 1.12; p.swings++; addLog(p, "小さな商売を始めました。", { big: true, tone: "good" }); advanceDream(p, 20); } },
          { t: "仲間と共同で始める", f: function (p) { p.business = true; money(p, "共同の元手", -Math.max(50, p.income * 0.2)); p.income *= 1.06; p.stats.r += 4; addLog(p, "仲間と店を切り盛りし始めました。", { tone: "good" }); } },
          { t: "いまの仕事に専念する", f: function (p) { p.stats.k += 2; addLog(p, "商売の話を見送り、いまの仕事を続けました。"); } }
        ] };
    },
    evacuation: function (p) {
      return { title: "避難の知らせ", body: "近くで災害が起き、早めに移動するよう呼びかけられました。",
        note: "早めの避難は危険を減らせますが、移動手段や避難先の確保が必要です。",
        choices: [
          { t: "早めに避難する", f: function (p) { money(p, "避難の費用", -Math.max(30, p.income * 0.03)); p.stats.r += 2; addLog(p, "家族と早めに安全な場所へ移りました。", { cat: "disaster", tone: "good" }); } },
          { t: "近所の人と備えて待つ", f: function (p) { p.stats.r += 4; p.stats.h -= 2; addLog(p, "近所の人と備えながら過ごしました。", { cat: "disaster" }); } },
          { t: "家に残って様子を見る", f: function (p) { p.stats.h -= 4; p.stats.hp -= 3; addLog(p, "家に残り、落ち着かない夜を過ごしました。", { cat: "disaster", tone: "bad" }); } }
        ] };
    },
    loan: function (p) {
      return { title: "友人からの頼み", body: "古い友人が、一時的にお金を貸してほしいと訪ねてきました。",
        note: "個人間の貸し借りは、返済だけでなく人間関係にも影響することがあります。",
        choices: [
          { t: "必要な額を貸す", f: function (p) { money(p, t("engine.money.friend_loan", "友人に貸したお金"), -Math.max(50, p.income * 0.15)); p.stats.r += 3; addLog(p, "友人の急場を助けました。", { tone: "good" }); } },
          { t: "返せる範囲で助ける", f: function (p) { money(p, t("engine.money.friend_help", "友人への援助"), -Math.max(20, p.income * 0.04)); p.stats.r += 2; addLog(p, "無理のない範囲で友人を助けました。", { tone: "good" }); } },
          { t: "お金は貸さず相談に乗る", f: function (p) { p.stats.r += 1; addLog(p, "友人の話を聞き、別の手立てを一緒に探しました。"); } }
        ] };
    },
    community: function (p) {
      return { title: "地域の役目", body: "暮らしの困りごとを話し合う集まりに、世話役として加わってほしいと言われました。",
        note: "地域の活動は人のつながりを広げる一方、時間や労力も必要です。",
        choices: [
          { t: "引き受ける", f: function (p) { p.community = true; p.stats.r += 7; p.stats.hp += 2; p.income *= 0.98; addLog(p, "地域の世話役を引き受けました。", { tone: "good" }); } },
          { t: "手伝える日にだけ参加する", f: function (p) { p.stats.r += 3; addLog(p, "できる日に集まりを手伝いました。"); } },
          { t: "今回は断る", f: function (p) { p.stats.hp += 1; addLog(p, "いまは自分の暮らしを優先しました。"); } }
        ] };
    },
    nightSchool: function (p) {
      return { title: "夜に学び直す", body: "仕事のあとに通える教室ができました。続けるには時間が要ります。",
        note: "大人の学び直しには、仕事や家事と両立できる時間が大切です。",
        choices: [
          { t: "教室に通う", f: function (p) { p.stats.k += 12; p.stats.hp -= 2; money(p, "夜学の費用", -Math.max(20, p.income * 0.04)); if (p.edu.level === "none") p.edu.level = "primary"; addLog(p, "夜の教室に通い、学び直しました。", { tone: "good" }); } },
          { t: "本や人から学ぶ", f: function (p) { p.stats.k += 5; p.stats.r += 2; addLog(p, "仕事の合間に少しずつ学びました。", { tone: "good" }); } },
          { t: "いまは休む", f: function (p) { p.stats.h += 2; addLog(p, "体を休める時間を選びました。"); } }
        ] };
    },
    childSchool: function (p) {
      var child = p.kids.filter(function (k) { return k.alive && p.age - k.born >= 14 && p.age - k.born <= 20; })[0];
      return { title: "子どもの進学費用", body: "子どもが次の学校に進みたいと話しています。学費と生活費をどうするか考えます。",
        note: "進学に必要なお金は、授業料以外の交通費や暮らしの費用にも及びます。",
        choices: [
          { t: "蓄えから支える", f: function (p) { money(p, "子どもの進学", -Math.max(150, p.income * 0.5)); p.childSchoolPaid = true; if (child) child.educationSupport = true; p.stats.r += 5; addLog(p, t("engine.history.child_education", "{name}の進学を支えました。", { name: child ? child.given : t("engine.history.child_generic", "子ども") }), { tone: "good", cat: "learn", historyType: child ? "child_education" : null, people: child ? [child.given] : [], personId: child && child.id, causeId: child && (lastHistory(p, "child_school", child.id) || lastHistory(p, "child_birth", child.id) || {}).id }); } },
          { t: "奨学金を一緒に探す", f: function (p) { p.childSchoolPaid = true; if (child) child.educationSupport = true; p.stats.k += 2; p.stats.r += 3; addLog(p, t("engine.history.child_education", "{name}の進学を支えました。", { name: child ? child.given : t("engine.history.child_generic", "子ども") }), { tone: "good", cat: "learn", historyType: child ? "child_education" : null, people: child ? [child.given] : [], personId: child && child.id, causeId: child && (lastHistory(p, "child_school", child.id) || lastHistory(p, "child_birth", child.id) || {}).id }); } },
          { t: "働きながら学ぶ道を話す", f: function (p) { p.stats.r += 2; addLog(p, "働きながら学ぶ方法を子どもと話し合いました。"); } }
        ] };
    },
    elderHome: function (p) {
      return { title: "これからの住まい", body: "年を重ね、どこで誰と暮らすかを考えるようになりました。",
        note: "高齢期の住まい方は、家族の事情、健康、使える支援によって変わります。",
        choices: [
          { t: p.kids.length ? "子どもの近くで暮らす" : "親しい人の近くで暮らす", f: function (p) { p.elderChoice = "family"; p.stats.r += 5; p.stats.hp += 3; addLog(p, p.kids.length ? "子どもの近くに住まいを移しました。" : "親しい人の近くに住まいを移しました。"); } },
          { t: "今の家で暮らす", f: function (p) { p.elderChoice = "home"; p.stats.hp += 2; money(p, "家の手入れ", -Math.max(30, p.income * 0.05)); addLog(p, "慣れた家で暮らし続けました。"); } },
          { t: "支援のある住まいを探す", f: function (p) { p.elderChoice = "support"; p.stats.h += 3; money(p, "支援のある住まい", -Math.max(60, p.income * 0.12)); addLog(p, "手助けを受けられる住まいを選びました。"); } }
        ] };
    },
    earlyMarriage: function (p) {
      return { title: "若いころの縁談", body: "まだ学びたいと思っているところへ、家族から結婚の話が出ました。自分の気持ちをどう伝えますか。",
        note: "18歳未満の結婚は、学びや将来の選択肢を狭めることがあります。",
        choices: [
          { t: "学業を続けたいと伝える", f: function (p) { p.stats.k += 5; p.stats.r -= 2; p.earlyMarriage = "refused"; addLog(p, "結婚を急がず、学びを続けたいと伝えました。"); } },
          { t: "信頼できる大人に相談する", f: function (p) { p.stats.r += 4; p.earlyMarriage = "delayed"; addLog(p, "相談できる人を見つけ、縁談を先に延ばしました。", { tone: "good" }); } },
          { t: "縁談を受け入れる", f: function (p) { p.earlyMarriage = "accepted"; p.stats.k -= 4; p.stats.hp -= 4; if (p.rel === "single") { var n = makeName(BY[p.iso], "m", { birthYear: p.birthYear - 3, group: p.nameGroup }, p.religion); p.spouse = { name: n.full, given: n.given, family: n.family, firstSurname: n.firstSurname, d: 3, alive: true, since: p.age, sex: "m" }; p.rel = "married"; if (p.firstMarriageAge == null) p.firstMarriageAge = p.age; } addLog(p, "若くして結婚し、学ぶ時間や暮らし方が変わりました。", dataRef({ big: true, tone: "bad" }, "UNICEF", "child_marriage", "この国で18歳前に結婚した女性は{rate}％です。", { rate: pct(BY[p.iso].cm) })); } }
        ] };
    },
    quitSmoking: function (p) {
      return { title: "たばことの付き合い", body: "せきが続き、たばこの量を見直そうと思いました。",
        note: "禁煙すると、年齢にかかわらず健康上の利益が少しずつ現れます。",
        choices: [
          { t: "やめてみる", f: function (p) { p.smoker = false; p.stats.h += 6; p.stats.hp += 2; addLog(p, "たばこをやめ、息が楽になる日が増えました。", { tone: "good" }); } },
          { t: "本数を減らす", f: function (p) { p.smoker = chance(0.55); p.stats.h += 2; addLog(p, "たばこの本数を減らしました。", { tone: "good" }); } },
          { t: "今は続ける", f: function (p) { p.stats.h -= 2; addLog(p, "たばこを続けることにしました。", { tone: "bad" }); } }
        ] };
    },
    returnHome: function (p) {
      return { title: "生まれた土地へ", body: "移り住んだ先での暮らしが落ち着いてきました。故郷から、帰ってこないかと便りが届きました。",
        note: "移住した人が帰郷するかどうかは、仕事と家族の事情に左右されます。",
        choices: [
          { t: "故郷に帰る", f: function (p) { p.abroad = null; p.returned = true; p.income *= 0.7; p.stats.r += 8; addLog(p, "故郷に戻り、新しい暮らしを始めました。", { big: true, tone: "good" }); } },
          { t: "今いる場所に残る", f: function (p) { p.stats.k += 2; p.stats.r -= 1; addLog(p, "移り住んだ先で暮らし続けました。"); } },
          { t: "しばらく行き来する", f: function (p) { money(p, "帰省の交通費", -Math.max(50, p.income * 0.08)); p.stats.r += 4; addLog(p, "故郷と今の住まいを行き来しました。"); } }
        ] };
    }
  };

  DECISIONS.countryScript = function (p) {
    var event = p.scriptPending;
    if (!event || !event.decision) return null;
    return {
      title: scriptText(event, "decision"), body: scriptText(event), note: "",
      choices: event.decision.options.map(function (option, index) {
        return { t: scriptText(event, "option", index), f: function (person) {
          var effect = option.effect;
          if (effect && ["h", "hp", "k", "r"].indexOf(effect.stat) >= 0 && isFinite(Number(effect.delta))) {
            person.stats[effect.stat] = clamp(person.stats[effect.stat] + Number(effect.delta), 1, 100);
          }
          addLog(person, t("engine.script.choice_outcome", "{event} 選択：{choice}", {
            event: scriptText(event), choice: scriptText(event, "option", index)
          }), { script: true, scriptId: event.id + ".choice", cat: "society" });
          person.scriptPending = null;
        } };
      })
    };
  };

  function localizeDecision(p, key, d) {
    if (key === "documentFee" || key === "conscription" || key === "countryScript" ||
        (key === "marry" && p.cand && p.cand.sex === p.sex && !sameSexMarriageLegal(BY[p.iso], p.birthYear + p.age))) return d;
    if (!d || !window.I18N || typeof window.I18N.t !== "function") return d;
    var c = BY[p.iso], vars = { name: p.given, country: countryName(c), agri: c.agri,
      job: p.job, jobPhrase: jobPhrase(p.job), years: p.jobYears, count: p.kids.length, another: p.kids.length ? "another" : "a", tfr: c.tfr,
      candidate: p.cand && p.cand.given, candidateAge: p.cand && p.cand.age0 + p.age,
      knownYears: Number((/知り合って(\d+)年/.exec(d.body) || [])[1]) || 0,
      parent: p.parents.mom.alive ? (english() ? "mother" : "母") : (english() ? "father" : "父") };
    var i, raw;
    if (key === "move") {
      raw = d.choices[0].t.replace(/へ渡ってみる$/, "");
      vars.destination = countryValue(c, "emig", raw);
      vars.destinations = c.emig.map(function (name) { return countryValue(c, "emig", name); }).join(english() ? ", " : "、");
    }
    if (key === "pet") {
      raw = /近所で(.+?)の子/.exec(d.body);
      vars.animal = raw ? t("engine.animal." + ["犬", "猫", "ヤギ", "鶏", "インコ"].indexOf(raw[1]), raw[1]) : (english() ? "animal" : "動物");
    }
    d.title = window.I18N.t("engine.decision." + key + ".title", vars);
    d.body = window.I18N.t(key === "child" ? countKey("engine.decision.child.body", vars.count) :
      key === "jobOffer" ? countKey("engine.decision.jobOffer.body", vars.years) : "engine.decision." + key + ".body", vars);
    d.note = window.I18N.t("engine.decision." + key + ".note", vars);
    for (i = 0; i < d.choices.length; i++) {
      if (key === "toy" || key === "firstJob") continue;
      if (key === "jobOffer") { d.choices[i].t = d.choices[i].keep ? t("engine.decision.jobOffer.keep", "いまの仕事を続ける") : t(d.choices[i].stepDown ? "engine.decision.jobOffer.step_down" : "engine.decision.jobOffer.take", d.choices[i].stepDown ? "条件を下げて{job}に移る" : "{job}に移る", { job: d.choices[i].jobName }); continue; }
      d.choices[i].t = window.I18N.t("engine.decision." + key + ".choice." + i, vars);
    }
    return d;
  }

  // Preview a choice on a detached person. The same choice function supplies the
  // amounts and persistent effects; a private RNG leaves the actual life untouched.
  function stakesMoney(amount) {
    var value = Math.round(amount * (english() ? 1 : YEN_PER_PPP));
    return (value > 0 ? "+" : value < 0 ? "−" : "") + (english() ? "US$" : "") + Math.abs(value).toLocaleString(english() ? "en-US" : "ja-JP") + (english() ? " PPP" : "円");
  }
  function decisionStakes(p, key, d, force) {
    if (!d) return d;
    if (p.auto && !force) {
      d.choices.forEach(function (choice) {
        var cached;
        Object.defineProperty(choice, "stakes", { enumerable: true, configurable: true,
          get: function () { if (!cached) decisionStakes(p, key, d, true); return cached; },
          set: function (value) { cached = value; } });
      });
      return d;
    }
    var savedRandom = R, country = BY[p.iso];
    d.choices.forEach(function (choice, index) {
      var compact = Object.assign({}, p, { log: [], peers: [], happy: [], portfolioHistory: [], incomeHistory: [], netHistory: [], themeHits: [] });
      var before = JSON.parse(JSON.stringify(compact)), after = JSON.parse(JSON.stringify(compact));
      after.pending = null;
      var probability = 1, plannedCost = 0, timeYears = 0;
      if (key === "school" && index === 0) probability = clamp(0.45 + (p.wealth - 3) * 0.11 + (p.urban ? 0.08 : -0.06) + (p.sex === "f" ? (Number(country.fem_sec || 75) - 75) / 300 : 0) - (conflictRate(country, p.birthYear + p.age) > 10 ? 0.13 : 0), 0.06, 0.85);
      if (key === "university" && index === 0) probability = clamp(0.43 + (p.stats.k - 50) / 120 + (p.wealth - 3) * 0.12 + country.tert / 350 + (p.scholar ? 0.13 : 0) - (p.stats.h < 40 ? 0.14 : 0) - (conflictRate(country, p.birthYear + p.age) > 10 ? 0.12 : 0), 0.035, 0.96);
      if (key === "scholarship" && index === 0) probability = clamp(0.28 + (p.wealth - 3) * 0.08 + (p.stats.k - 50) / 220 + country.tert / 400, 0.05, 0.75);
      if (key === "business" && index === 0) probability = p.net + debtLimit(p) < Math.max(100, p.income * 0.4) ? 0 : clamp(0.34 + (p.wealth - 3) * 0.12 - Number(country.unemp || 5) / 150, 0.05, 0.8);
      if (key === "treatment" && index === 0) probability = p.net + debtLimit(p) < Math.max(100, p.income * (0.16 + (Number(country.oop) || 0) / 300)) ? 0 : clamp((p.wealth - 1) * 0.15 + (p.urban ? 0.23 : 0.08) - (conflictRate(country, p.birthYear + p.age) > 10 ? 0.15 : 0), 0.05, 0.88);
      if (key === "conscription" && index === 1) probability = clamp(0.12 + (p.stats.h < 40 ? 0.18 : 0) + (p.edu.stage === "univ" ? 0.08 : 0), 0, 0.5);
      if (key === "documentFee" && index === 1) probability = 0.35;
      if (key === "child" && index === 0) probability = 0.9;
      if (key === "gamble" && index === 0) probability = 0.3;
      if (key === "move" && index === 0) probability = p.registered === false ? 0.25 : 0.55;
      if (key === "quitSmoking" && index === 1) probability = 0.45;
      if (key === "treatment") plannedCost = index === 0 ? Math.max(100, p.income * (0.16 + (Number(country.oop) || 0) / 300)) : index === 1 ? Math.max(30, p.income * 0.05) : 0;
      if (key === "business") plannedCost = index === 0 ? Math.max(100, p.income * 0.4) : index === 1 ? Math.max(50, p.income * 0.2) : 0;
      if (key === "nightSchool" && index === 0) plannedCost = Math.max(20, p.income * 0.04);
      if (key === "home") plannedCost = index === 0 ? Math.max(500, p.income * 2) : index === 1 ? Math.max(100, p.income * 0.25) : 0;
      if (key === "childSchool" && index === 0) plannedCost = Math.max(150, p.income * 0.5);
      if (key === "gamble" && index === 0) plannedCost = p.income * 0.5;
      if (key === "move" && index === 0) plannedCost = p.income * 0.3;
      if (key === "scholarship" && index === 0) plannedCost = p.income * 0.12;
      if (key === "firstJob" && choice.wait) timeYears = 1;
      if (key === "conscription" && index === 0) timeYears = hasNumber(country, "conscription_years") ? clamp(country.conscription_years, 0.25, 10) : 1;
      if (key === "university" && index === 0) timeYears = 4;
      if (key === "nightSchool" && index === 0) timeYears = 1;
      var privateRandom = rng((String(p.id || "person") + key + index).split("").reduce(function (n, letter) { return (Math.imul(n, 31) + letter.charCodeAt(0)) | 0; }, 17));
      var firstDraw = true;
      R = function () { if (firstDraw) { firstDraw = false; return 0.0001; } return privateRandom(); };
      try { choice.f(after); } catch (error) { after = before; }
      R = savedRandom;
      var actualCost = Math.max(0, (before.net || 0) - (after.net || 0));
      var effects = [], change = function (field, label) {
        var delta = Math.round((Number(after.stats[field]) - Number(before.stats[field])) * 10) / 10;
        if (delta) effects.push(t("engine.stakes." + label, label) + " " + (delta > 0 ? "+" : "") + delta);
      };
      if (after.income !== before.income) effects.push(t("engine.stakes.income", "収入") + " " + stakesMoney(after.income - before.income));
      change("h", "health"); change("hp", "happiness"); change("r", "family"); change("k", "education");
      if ((after.debt || 0) !== (before.debt || 0)) effects.push(t("engine.stakes.debt", "借金") + " " + stakesMoney(after.debt - before.debt));
      if (after.edu.level !== before.edu.level || after.edu.stage !== before.edu.stage) effects.push(t("engine.stakes.educationPath", "進学・修了"));
      if (after.rel !== before.rel || after.kids.length !== before.kids.length || after.elderChoice !== before.elderChoice) effects.push(t("engine.stakes.familyPath", "家族の暮らし"));
      if (after.business !== before.business || after.job !== before.job || after.retired !== before.retired || after.partTime !== before.partTime) effects.push(t("engine.stakes.workPath", "働き方"));
      if (after.informal !== before.informal || after.selfEmployed !== before.selfEmployed || after.retired !== before.retired) effects.push(t("engine.stakes.insurancePath", "年金加入見込み"));
      var stakes = choice.stakes = { immediateCost: Math.max(plannedCost, actualCost), timeYears: timeYears, successChance: probability,
        risk: probability >= 0.75 ? t("engine.stakes.high", "高い") : probability >= 0.4 ? t("engine.stakes.normal", "ふつう") : t("engine.stakes.low", "低い"),
        effects: effects.length ? effects : [t("engine.stakes.noChange", "暮らしに大きな変化はありませんでした。")], debtCapacity: debtLimit(after) };
      if (choice.job || key === "business" || key === "retire" || key === "partTime") {
        var detail = choice.job ? JOB_DETAILS[choice.jobName] : key === "business" ? null : p.job && JOB_DETAILS[p.job];
        var wages = [];
        if (detail && choice.job) {
          for (var sample = 0; sample < 6; sample++) {
            var wagePerson = JSON.parse(JSON.stringify(compact));
            R = rng(15091 + sample * 131 + index * 17);
            wages.push(occupationWage(wagePerson, country, detail.job));
          }
          R = savedRandom;
        } else if (key === "business") wages = [(after.income || 0) * 0.95, (after.income || 0) * 1.04];
        else wages = [after.income || 0, after.income || 0];
        wages.sort(function (a, b) { return a - b; });
        stakes.salaryRange = [Math.round(wages.length > 2 ? wages[1] : wages[0]), Math.round(wages.length > 2 ? wages[wages.length - 2] : wages[wages.length - 1])];
        stakes.training = detail ? t("engine.stakes.training." + JOB_LEVELS[detail.rank], JOB_LEVELS[detail.rank]) : t("engine.stakes.training.none", "追加要件なし");
        stakes.benefitEligibility = pensionProbability(after, country);
      }
    });
    R = savedRandom;
    return d;
  }

  function newKid(p) {
    var c = BY[p.iso], s = chance(0.512) ? "m" : "f";
    var self = { given: p.given, family: p.family, firstSurname: p.firstSurname || firstSurname(p.family) };
    var partner = p.spouse || {};
    var father = p.sex === "m" ? self : partner;
    var mother = p.sex === "f" ? self : partner;
    var seen = [p.name].concat((p.sibs || []).map(function (sib) { return sib.name; })).concat(p.kids.map(function (kid) { return kid.name; }));
    var nm = uniqueName(c, s, { father: father, mother: mother, family: father.family || p.family, group: p.nameGroup, birthYear: p.birthYear + p.age, seen: seen }, p.religion);
    var childId = "child-" + (p.kids.length + 1);
    p.kids.push({ id: childId, name: nm.full, given: nm.given, family: nm.family, firstSurname: nm.firstSurname, sex: s, born: p.age, alive: true, married: false, schoolStatus: "not_started", health: "well", educationSupport: false });
    if (p.firstBirthAge == null) p.firstBirthAge = p.age;
    p.lastChildAge = p.age;
    p.stats.hp += 6;
    addLog(p, english() ? t("engine.child.born", "", { name: nm.given, number: p.kids.length }) : (p.kids.length === 1 ? "最初の子ども" : p.kids.length + "人目の子ども") + "として、" + nm.given + "が生まれました。", { big: true, tone: "good" });
    historyEvent(p, "child_birth", { people: [nm.given, p.given], personId: childId, outcome: "born", text: p.log[p.log.length - 1].t,
      tone: "good", causeId: lastHistory(p, "spouse_marriage") && lastHistory(p, "spouse_marriage").id });
    if (p.sex === "f") {
      p.maternalBirths++;
      if (hasNumber(c, "mmr") && chance(clamp(c.mmr / 100000, 0, 0.2))) {
        p.maternalDeaths++;
        addLog(p, p.gentle ? t("engine.course.maternal_gentle", "出産後の合併症で、家族と別れることになりました。") : t("engine.course.maternal", "出産に伴う合併症で亡くなりました。"), dataRef({ cat: "health", big: true, tone: "bad" }, "WHO/UNICEF", "maternal_mortality", "この国の妊産婦死亡比は出生10万件あたり{rate}人です。", { rate: Math.round(BY[p.iso].mmr) }));
        die(p, t("engine.course.maternal_cause", "妊娠・出産にともなう合併症"));
      }
    }
  }
  function wageProfile(p, c) {
    if (p.wageProfile) return p.wageProfile;
    // Persistent differences belong to the person and place; employer size is redrawn on a job change.
    return p.wageProfile = {
      skill: clamp(0.85 + (p.stats.k - 50) * 0.006 + gauss() * 0.07, 0.65, 1.4),
      region: clamp(1 + gauss() * 0.09, 0.78, 1.25),
      employer: 1
    };
  }
  function occupationWage(p, c, j) {
    var profile = wageProfile(p, c), ratio = c.isco_wage && Number(c.isco_wage[j[3]]);
    profile.employer = clamp(Math.exp(gauss() * 0.18), 0.65, 1.65);
    var femaleFactor = p.sex === "f" ? clamp(0.91 - (60 - Number(c.flfp || 60)) * 0.002, 0.78, 0.96) : 1;
    var placeFactor = p.urban ? 1.09 : 0.87;
    var formalFactor = p.informal ? 0.82 : 1.08;
    var jobFactor = clamp(1 + (j[1] - 1) * 0.22, 0.75, 1.4);
    // Recenter the occupational ratio around the local mix of informal and farm work.
    var marketScale = 1.4 + clamp(Number(c.informal || 0) / 100, 0, 1) * 0.95 + clamp(Number(c.agri || 0) / 100, 0, 1) * 0.8;
    // Family starting wealth already shapes access to occupations; avoid counting the same gap twice.
    var wealthCorrection = Math.exp((3 - p.wealth) * clamp(0.5 - Number(c.gini || 0.35), 0.05, 0.32));
    var anchor = c.gdp * eraOf(p).gdp * 0.55;
    return clamp(wealthIncome(c, 1, p.wealth, eraOf(p)) *
      (ratio > 0 ? clamp(ratio, 0.3, 3.5) : jobFactor) *
      (ratio > 0 ? jobFactor : 1) * marketScale * wealthCorrection * profile.skill * profile.region * profile.employer * placeFactor * formalFactor * femaleFactor,
      Math.max(180, anchor * 0.42), Math.max(180, anchor * 3.2));
  }
  function incomeLine(p, key, tone, options) {
    if (!window.I18N || !window.I18N.t) return false;
    addLog(p, window.I18N.t("engine.income." + key, options && options.vars), options && options.ref || { cat: "work", tone: tone || "neutral" });
  }
  function annualWorkIncome(p, c, age) {
    if (!p.job || p.retired) return;
    var year = p.birthYear + age, group = JOB_DETAILS[p.job] && JOB_DETAILS[p.job].job[3];
    var agri = p.jobSector === "agri", casual = p.informal || p.vulnerableWork || group === 9;
    // Experience flattens in mid-career; physical work loses more hours later in life.
    var peak = agri || group >= 7 ? 42 : group <= 3 ? 52 : 47;
    var ageFactor = age < 24 ? 0.985 : age < peak ? 1.012 : age < peak + 10 ? 1.002 : agri || group >= 7 ? 0.98 : 0.991;
    p.income *= ageFactor;
    if (chance(agri ? 0.23 : casual ? 0.12 : 0.08)) {
      var good = chance(0.58), rate = agri ? (good ? 1.18 : 0.79) : (good ? 1.09 : 0.9);
      p.income *= rate;
      incomeLine(p, agri ? (good ? "harvestGood" : "harvestBad") : (good ? "pieceGood" : "pieceBad"), good ? "good" : "bad");
    }
    if (casual && chance(0.13)) { p.income *= 0.76; incomeLine(p, "daysLost", "bad"); }
    if (p.abroad && chance(0.14)) { p.income *= 1.1; incomeLine(p, "migrantSeason", "good"); }
    if (chance(0.12)) { p.income *= 1.06; incomeLine(p, casual ? "tips" : "overtime", "good"); }
    if (!casual && chance(0.065)) { p.income *= 1.11; incomeLine(p, "bonus", "good"); }
    if (p.jobYears > 0 && p.jobYears % 5 === 0 && age < peak) incomeLine(p, "experience", "good");
    if (age === peak + 10) incomeLine(p, "lateCareer", "neutral");
    if (p.jobYears >= 3 && chance(0.035 + (p.focus === "work" ? 0.025 : 0))) {
      p.income *= 1.16; incomeLine(p, "promotion", "good");
    } else if (chance(0.02)) { p.income *= 0.87; incomeLine(p, "demotion", "bad"); }
    if (casual && chance(0.008)) { p.income *= 0.9; incomeLine(p, "unpaid", "bad"); }
    if (casual && chance(0.025)) {
      p.wageArrears = (p.wageArrears || 0) + p.income * 0.16;
      p.income *= 0.84; incomeLine(p, "arrears", "bad");
    } else if (p.wageArrears && chance(0.55)) {
      p.income += p.wageArrears; p.wageArrears = 0; incomeLine(p, "arrearsPaid", "good");
    }
    if (chance(0.008 + (casual ? 0.006 : 0))) { p.income *= 0.82; incomeLine(p, "strike", "bad"); }
    var inflation = Number(c.infl_history && c.infl_history[year]);
    if (isFinite(inflation) && inflation > 10) {
      p.income *= clamp(1 - (inflation - 10) * 0.0025, 0.72, 1);
      if (inflation > 18) incomeLine(p, "inflation", "bad", { ref: dataRef({ cat: "work", tone: "bad" }, "World Bank WDI", "inflation", "{year}年の消費者物価上昇率は{rate}％でした。", { year: year, rate: pct(inflation) }) });
    }
    var conflict = conflictRate(c, year);
    if (conflict > 10) {
      p.income *= clamp(1 - conflict / 1000, 0.65, 0.96);
      incomeLine(p, "conflict", "bad", { ref: dataRef({ cat: "work", tone: "bad" }, "UCDP", "conflict", "{year}年、この国の紛争死者は人口10万人あたり{rate}人でした。", { year: year, rate: pct(conflict) }) });
    }
    if (p.crisisYear === year) { p.income *= 0.87; incomeLine(p, "crisis", "bad"); }
    var wageAnchor = Math.max(300, yearStats(c, year).gdp * 0.55);
    p.income = clamp(p.income, wageAnchor * 0.3, wageAnchor * 3.2);
  }
  function annualIncomeSources(p, c, age) {
    var sources = { main: p.job && !p.retired ? Math.max(0, p.income) : 0, side: 0, remittances: 0, assets: 0, pension: Math.max(0, p.pension || 0), transfers: 0 };
    if (age >= 16 && !p.retired && chance(p.job ? 0.12 : 0.2)) {
      sources.side = Math.max(30, (p.job ? p.income : medianIncome(p)) * (p.business ? 0.18 : 0.09) * clamp(1 + gauss() * 0.3, 0.4, 1.8));
      incomeLine(p, p.business ? "sideBusiness" : "sideWork", "good");
    }
    if (age >= 18 && (p.abroad || p.kids.some(function (k) { return k.alive && age - k.born >= 18; })) && chance(clamp(Number(c.remit || 0) / 100 + 0.07, 0.02, 0.32))) {
      sources.remittances = medianIncome(p) * (p.abroad ? 0.14 : 0.08);
      incomeLine(p, "remittanceReceived", "good", { ref: dataRef({ cat: "family", tone: "good" }, "World Bank WDI", "remittances", "この国への海外送金はGDPの{rate}％です。", { rate: pct(c.remit) }) });
    }
    if (p.abroad && age >= 18 && chance(0.26)) {
      var sent = Math.min(sources.main + sources.side, medianIncome(p) * 0.08);
      p.remittancesSent = (p.remittancesSent || 0) + sent;
      money(p, window.I18N && window.I18N.t ? window.I18N.t("engine.income.remittanceSentLabel") : "家族への仕送り", -sent);
      incomeLine(p, "remittanceSent", "neutral");
    }
    if (age >= 18 && c.gdp >= 12000 && !p.informal && (p.job === null || p.retired || p.stats.h < 35) && chance(clamp(c.gdp / 100000, 0.04, 0.35))) {
      sources.transfers = medianIncome(p) * 0.07;
      incomeLine(p, "transfer", "good");
    }
    if (age >= retirementAge(p, c) && !p.job && !sources.pension && c.gdp >= 12000) {
      sources.transfers = Math.max(sources.transfers, medianIncome(p) * 0.35);
      if (sources.transfers > 0) incomeLine(p, "oldAgeSupport", "neutral", { ref: hasNumber(c, "pension_cov") ? dataRef({ cat: "economy", tone: "neutral" }, "ILOSTAT", "pension_coverage", "この国で年金などの高齢期給付を受ける人は{rate}％です。", { rate: pct(c.pension_cov) }) : { cat: "economy", tone: "neutral" } });
    }
    p.mainIncome = sources.main;
    p.incomeSources = sources;
    p.income = sources.main + sources.side + sources.remittances + sources.pension + sources.transfers;
  }
  function startJob(p, j) {
    var c = BY[p.iso];
    var priorJob = p.job;
    p.job = j[0]; p.jobF = j[1]; p.jobSector = j[2] || "srv"; p.jobYears = 0;
    if (!p.jobHistory) p.jobHistory = [];
    if (p.jobHistory.indexOf(j[0]) < 0) p.jobHistory.push(j[0]);
    p.selfEmployed = hasNumber(c, "self_emp") ? chance(percentage(c, "self_emp", 0)) : !!p.business;
    p.vulnerableWork = hasNumber(c, "vuln_emp") && chance(percentage(c, "vuln_emp", 0));
    if (hasNumber(c, "informal")) p.informal = chance(percentage(c, "informal", 0));
    var iscoWage = c.isco_wage && Number(c.isco_wage[j[3]]);
    p.income = occupationWage(p, c, j);
    if (p.registered === false) { p.income *= 0.88; addLog(p, t("engine.course.job_papers", "必要な書類がなく、就ける仕事が少なくなりました。"), { cat: "work", tone: "bad" }); }
    if (p.informal && hasNumber(c, "informal")) addLog(p, t("engine.course.informal_work", "契約書のない仕事で、毎月の収入が一定ではありません。"), { cat: "work", tone: "bad" });
    p.mainIncome = p.income; p.lastAnnualIncome = p.income;
    p.incomeSources = { main: p.income, side: 0, remittances: 0, assets: 0, pension: 0, transfers: 0 };
    addLog(p, t("engine.job.started", "{job}として働きはじめました。月給は日本の物価に換算して約{monthYen}万円、1日あたりの所得は購買力平価で約{day}ドルでした。", { job: j[0], jobPhrase: jobPhrase(j[0]), month: Math.round(p.income / 12).toLocaleString("en-US"), monthYen: (p.income * YEN_PER_PPP / 120000).toFixed(1), day: dailyDollars(p).toFixed(1) }), iscoWage > 0 ? dataRef({ big: true, tone: "good" }, "ILOSTAT", "isco_wage", "この国の職業グループの賃金比率は全職種平均の{rate}倍です。", { rate: pct(iscoWage) }) : { big: true, tone: "good" });
    if (priorJob !== j[0] && !(p.history || []).some(function (event) { return event.type === "work_start" && event.age === p.age && event.job === j[0]; }))
      historyEvent(p, "work_start", { job: j[0], outcome: "employed", text: p.log[p.log.length - 1].t,
        cat: "work", tone: "good", causeId: (lastHistory(p, "work_start") || lastHistory(p, "school_finish") || lastHistory(p, "school_start") || {}).id });
    incomeLine(p, p.wageProfile.employer >= 1 ? "employerLarge" : "employerSmall", "neutral");
    incomeLine(p, p.wageProfile.skill >= 1 ? "skilled" : "learning", "neutral");
    incomeLine(p, p.urban ? "urbanWage" : "ruralWage", "neutral");
    if (p.informal && hasNumber(c, "informal")) incomeLine(p, "informalGap", "neutral", { ref: dataRef({ cat: "work", tone: "neutral" }, "ILOSTAT", "informal_employment", "この国で非公式に働く人は{rate}％です。", { rate: pct(c.informal) }) });
    if (p.sex === "f" && hasNumber(c, "flfp")) incomeLine(p, "femaleGap", "neutral", { ref: dataRef({ cat: "work", tone: "neutral" }, "ILOSTAT", "female_participation", "この国の女性の労働力参加率は{rate}％です。", { rate: pct(c.flfp) }) });
    var culture = cultureOf(c);
    if (culture && culture.greeting && chance(0.22)) addLog(p, english() ? t("engine.job.greeting", "", { greeting: window.I18N.cultureOf(culture).greeting }) : "仕事場で初めて会った人に「" + culture.greeting + "」とあいさつしました。", { culture: true, cat: "work" });
  }
  function finishSchool(p, level) {
    p.edu.level = level; p.edu.stage = "done";
    var c = BY[p.iso], field = level === "primary" ? "prim_compl" : level === "secondary" ? "lsec_compl" : "tert";
    var options = { tone: "good" };
    if (hasNumber(c, field)) dataRef(options, "World Bank WDI", level === "primary" ? "primary_completion" : level === "secondary" ? "secondary_completion" : "tertiary_enrollment",
      level === "primary" ? "この国の初等教育修了率は{rate}％です。" : level === "secondary" ? "この国の前期中等教育修了率は{rate}％です。" : "この国の高等教育就学率は{rate}％です。", { rate: pct(c[field]) });
    addLog(p, { primary: "初等教育を終えました。", secondary: "中等教育を終えました。", univ: "大学を卒業しました。" }[level] || "学校を離れました。", options);
    historyEvent(p, "school_finish", { level: level, outcome: "completed", text: p.log[p.log.length - 1].t,
      cat: "learn", tone: "good", causeId: lastHistory(p, "school_start", level) && lastHistory(p, "school_start", level).id });
  }

  // ---------- 1年ごとの出来事 ----------
  var SMALL = {
    child: ["近所の子どもたちと、日が暮れるまで遊びました。", "身近な大人に、昔から伝わる話を聞かせてもらいました。", "転んだあとも、自分で立ち上がりました。", "名前を呼ばれると、振り向くようになりました。", "地域の催しで、家族と人の輪に加わりました。", "雨の日、軒下で水たまりを眺めました。", "小石を並べて数を覚えました。", "家で聞いた歌をまねして口ずさみました。", "慣れない道を、小さな足で歩ききりました。", "近所の犬と顔なじみになりました。", "朝のひんやりした空気に驚きました。", "身近な子と秘密の遊びを考えました。", "大人の仕事をまねて遊びました。", "眠る前にお気に入りの話をせがみました。"],
    student: ["親友ができました。", "先生にほめられて、一日じゅううれしい気持ちでした。", "放課後、友だちとボールを追いかけました。", "はじめて一人で遠くまでおつかいに行きました。", "夜遅くまで、こっそり本を読みました。", "苦手な計算を何度も練習しました。", "友だちと将来の夢を話しました。", "学校行事の準備を手伝いました。", "図書室で知らない土地の本を読みました。", "年下の子に文字を教えました。", "試験の朝、少し早く起きました。", "失敗した友だちを励ましました。", "通学路の季節の変化に気づきました。", "初めて自分の意見を人前で話しました。"],
    adult: ["古い友人たちと久しぶりに集まり、夜ふけまで話しこみました。", "何も予定のない朝、温かい飲みものをゆっくり味わいました。", "近所の人が困っていたので、手を貸しました。", "季節の行事を家族と過ごしました。", "仕事帰りに見た夕焼けが、忘れられないほどきれいでした。", "古い道具を直してもう一度使いました。", "仕事仲間の相談に耳を傾けました。", "休日に少し遠くまで歩きました。", "新しい料理を覚えました。", "久しぶりに家族へ手紙を書きました。", "思いがけず昔の恩師に会いました。", "雨上がりの空気の匂いを楽しみました。", "若い同僚に仕事のこつを伝えました。", "一日の終わりに静かな時間を持ちました。"],
    old: ["親しい人が訪ねてきて、家がにぎやかになりました。", "若いころの写真を見返しました。", "膝をいたわって歩く日が増えました。", "近所の子どもに昔の話をしました。", "古い友人と久しぶりに声を交わしました。", "朝の散歩で同じ木の成長を見守りました。", "身近な人に、昔覚えた料理の作り方を教えました。", "読みかけの本を少しずつ読み進めました。", "昔よく通った道を歩きました。", "季節の花を窓辺に飾りました。", "若い人の話を聞く時間が楽しみになりました。", "長く使った道具を手入れしました。"],
    urban: ["朝の通りで店が開く音を聞きました。", "混んだ乗り物で知らない人に席を譲りました。", "街角の小さな市場に立ち寄りました。", "工事の音に街の変化を感じました。", "公園の木陰でひと息つきました。", "近所の店主と顔なじみになりました。", "帰り道の屋台で温かいものを買いました。"],
    rural: ["畑の土に触れ、雨が待ち遠しくなりました。", "近所の家から収穫物を分けてもらいました。", "夜空にいつもより多く星が見えました。", "道の途中で飼われている動物に会いました。", "近所の人から村の知らせを聞きました。", "木々の色が変わり、季節の移り変わりに気づきました。", "家の前の道を近所の人と整えました。"],
    poor: ["使い古した服を丁寧に繕いました。", "買い物の前に小銭を数えました。", "家族で食べものを分け合いました。", "借りた道具を大事に使いました。", "安い店を探して遠回りしました。", "急な出費に備えて少しずつ蓄えました。"],
    rich: ["休みの日に家族で小旅行に出ました。", "家の本棚に新しい本を加えました。", "知人を家に招いて食事をしました。", "使わなくなった品を人に譲りました。", "余裕のある日に町の催しを見に行きました。", "好きなことを学ぶ時間を作りました。"],
    kids: ["子どもの靴がまた小さくなりました。", "子どもの宿題を一緒に考えました。", "眠る前に子どもの話を聞きました。", "家族で次の休みの予定を話しました。", "子どもが描いた絵を壁に飾りました。", "子どもの好きな料理を作りました。", "小さな成長を日記に書き留めました。"],
    retired: ["平日の朝を急がずに過ごしました。", "長年の仕事仲間と近況を語りました。", "若い人に仕事の経験を伝えました。", "新しい散歩道を見つけました。", "昼の市場で買い物を楽しみました。", "時計を気にせず庭を手入れしました。"],
    abroad: ["故郷の味を思い出して料理をしました。", "新しい土地の言葉を一つ覚えました。", "遠くの家族と近況を伝え合いました。", "違う習慣に少しずつ慣れました。", "同郷の人と故郷の話をしました。", "新しい街の道を迷わず歩けました。"],
    widowed: ["二人で使った食器を静かに洗いました。", "懐かしい声をふと思い出しました。", "友人と食卓を囲み、近況を話しました。", "古い写真を一枚、机に飾りました。", "一人で過ごす夕方の時間にも、少しずつ慣れました。", "身近な人と、亡くなった伴侶の思い出を話しました。"]
  };
  // 各番号は同じ場面の別の語り口。気質、家計、住む場所で使う文を変える。
  var SMALL_VARIANTS = {
    child: ["庭先で見つけた虫を、しばらく観察しました。", "大人の手を引いて、行ったことのない道を歩きました。", "布を結び、見立て遊びの道具にしました。", "水を入れた器を並べ、音の違いを楽しみました。", "見慣れた人の顔を描き、渡しました。", "はじめて自分で靴を履こうとしました。"],
    student: ["教室で係を任され、朝早く準備しました。", "新しく習った言葉を家で使ってみました。", "放課後の小さな試合で、友だちを応援しました。", "家の用事を済ませてから、机に向かいました。", "地図を開いて、遠い町の名前を覚えました。", "難しい問題を友だちと相談して解きました。"],
    adult: ["朝のうちに用事を片づけ、午後はゆっくり過ごしました。", "初めて訪れた店で、店主と話しました。", "近所の人と道の掃除をしました。", "家にある材料で、いつもと違う料理を作りました。", "帰り道に空を見上げ、雨の気配に気づきました。", "古い服を繕って、また着られるようにしました。", "仕事帰りに寄り道して、店先を眺めました。", "休日に手紙を読み返しました。"],
    old: ["朝の支度を終え、窓から通りを眺めました。", "昔覚えた歌を、声に出して歌いました。", "座ってできる作業を選び、手を動かしました。", "近所の人に道を尋ねられ、案内しました。", "久しぶりに友人へ電話をかけました。", "季節の変わり目に、衣類を整理しました。"],
    urban: ["横断歩道で急ぐ人たちを見送りました。", "停留所で見知らぬ人と天気の話をしました。", "夕方の通りで、帰宅する人の列に加わりました。", "小さな店の前で、今日の献立を考えました。"],
    rural: ["近所の人と道具を貸し借りしました。", "朝、家の周りを歩いて風の向きを感じました。", "遠くから聞こえる鳥の声に足を止めました。", "収穫の時期を近所の人と相談しました。"],
    poor: ["手持ちの材料で、数日分の食事を考えました。", "壊れたかばんを修理して使いました。", "買うものを紙に書き、必要な品から選びました。", "出費を抑えるため、歩いて用事を済ませました。"],
    rich: ["家で使う道具を新しく買い替えました。", "遠くに住む知人を訪ねました。", "習いごとの時間を予定に入れました。", "地域の催しに寄付をしました。"],
    kids: ["子どもが覚えた歌を一緒に歌いました。", "子どもの話を聞きながら夕食を用意しました。", "子どもと次の休みの過ごし方を決めました。", "子どもの好きな本を探しました。"]
  };
  // Twelve lines per country-data theme: food, festivals, sport, climate and living conditions.
  var COUNTRY_SMALL = {
    food: [
      "食卓に{food}が並び、ゆっくり味わいました。", "{food}を分け合い、会話が弾みました。", "{food}の作り方を身近な人に聞きました。", "久しぶりの{food}を楽しみました。",
      "{food}を一緒に用意しました。", "{food}の香りに足を止めました。", "家で{food}を食べ、ひと息つきました。", "{food}を少し残し、あとで食べました。",
      "{food}を作る手順を覚えました。", "{food}を囲んで近況を話しました。", "{food}を食べ、家の味を思い出しました。", "{food}を身近な人に勧めました。"
    ],
    festival: [
      "{festival}の日、人々の声を聞きました。", "{festival}に合わせて家の用事を済ませました。", "{festival}の準備を少し手伝いました。", "{festival}の話を身近な人としました。",
      "{festival}の日、町の様子を眺めました。", "{festival}を迎え、家族に声をかけました。", "{festival}の思い出を聞きました。", "{festival}の日、友人と歩きました。",
      "{festival}をきっかけに知人と会いました。", "{festival}の朝、いつもより早く起きました。", "{festival}の話題で会話が弾みました。", "{festival}の日、家でゆっくり過ごしました。"
    ],
    sport: [
      "{sport}の話を友人としました。", "{sport}の試合結果を聞きました。", "{sport}をする人たちを見守りました。", "{sport}の練習を見かけました。",
      "{sport}の好きな人と知り合いました。", "{sport}の試合を身近な人と見ました。", "{sport}について新しいことを覚えました。", "{sport}の話題で笑い合いました。",
      "{sport}を少し練習しました。", "{sport}の道具を手入れしました。", "{sport}の試合で友人を応援しました。", "{sport}を楽しむ時間を作りました。"
    ],
    rain: ["{month}月、雨音を聞いて休みました。", "{month}月、雨をよけて歩きました。", "{month}月、雨上がりの道を歩きました。", "{month}月、雨具を乾かしました。"],
    heat: ["{month}月、日陰を選んで歩きました。", "{month}月、涼しい時間に外へ出ました。", "{month}月、暑さを避けて休みました。", "{month}月、飲み水を用意して出かけました。"],
    cold: ["{month}月、上着を重ねて出かけました。", "{month}月、冷えた手を温めました。", "{month}月、暖かい場所で休みました。", "{month}月、冷たい風を避けて歩きました。"],
    elec: ["電気を使える夜、明かりの下で過ごしました。", "家の明かりを消し、静かに休みました。"],
    water: ["飲み水を用意し、家でひと息つきました。", "水を大切に使い、食事を作りました。"],
    sanit: ["家の水回りを掃除しました。", "手洗いの水を用意しました。"],
    mobile: ["携帯電話で身近な人と連絡を取りました。", "電話で家族の近況を聞きました。"],
    lit: ["読める文字を増やそうと練習しました。", "短い文章を読み、内容を話しました。"],
    clean_fuel: ["台所の換気を確かめて料理しました。", "火を使う前に窓を開けました。"]
  };
  var CONTEXT_SMALL = {
    explore: ["知らない道を歩き、帰り道を覚えました。", "初めての店に入り、品物を眺めました。"],
    active: ["用事を早めに済ませ、外へ出ました。", "少し遠くまで歩き、体を動かしました。"],
    social: ["近所の人と近況を話しました。", "友人に声をかけ、短い時間を共に過ごしました。"],
    grit: ["難しい作業を、休みながら終えました。", "できなかったことをもう一度試しました。"],
    poor: ["手元の材料を工夫して食事を作りました。", "壊れた品を直し、もう少し使いました。"],
    rich: ["身近な人に食事をごちそうしました。", "新しい本を買い、少しずつ読みました。"],
    urban: ["通りの店先で季節の品を見ました。", "人通りの多い道をゆっくり歩きました。"],
    rural: ["近くの畑の様子を眺めました。", "家の周りの道を歩いて回りました。"],
    past: ["家族へ短い手紙を書きました。", "ラジオから流れる声に耳を傾けました。"],
    now: ["離れた人と近況を伝え合いました。", "今日の予定を見直しました。"],
    future: ["新しい道具の使い方を教わりました。", "変わっていく町の話を聞きました。"],
    child: ["身近な大人と落ち葉を集めました。", "小さな石を並べて遊びました。"],
    student: ["学んだことを友人と確かめました。", "課題を終えて友人と話しました。"],
    adult: ["仕事のあとに家の用事を済ませました。", "身近な人と週末の予定を話しました。"],
    old: ["昔の友人に近況を伝えました。", "ゆっくり歩いて季節の花を見ました。"],
    region0: ["近くの市場で品物を見ました。", "町の通りを歩き、人の声を聞きました。"],
    region1: ["地域の集まりで知人に会いました。", "近所の人と天気の話をしました。"],
    region2: ["家の周りを片づけました。", "身近な人に料理を教わりました。"]
  };
  var SMALL_EN = {};
  if (english()) Object.keys(SMALL).forEach(function (bucket) {
    SMALL[bucket].forEach(function (line, index) { SMALL_EN[line] = t("engine.small." + bucket + "." + index, ""); });
    (SMALL_VARIANTS[bucket] || []).forEach(function (line, index) { SMALL_EN[line] = t("engine.small." + bucket + ".variant." + index, ""); });
  });
  function smallLine(p, bucket) {
    var pool = SMALL[bucket], alternatives = SMALL_VARIANTS[bucket] || [];
    var temper = { explore: 0, active: 1, social: 2, grit: 3 }[p.temperament] || 0;
    var choices = [], fallback = [];
    pool.forEach(function (line, index) {
      var alt = alternatives[index];
      var preferred = (index + temper + (p.wealth <= 2 ? 1 : 0) + (p.urban ? 0 : 1)) % 2;
      if (preferred && alt) choices.push(alt);
      if (!preferred || !alt) choices.push(line);
      if (alt) fallback.push(preferred ? line : alt);
    });
    function fresh(line) {
      return !p.log.some(function (entry) { return (entry.raw || entry.t) === line; });
    }
    choices = choices.filter(fresh);
    if (!choices.length) choices = fallback.filter(fresh);
    return choices.length ? pick(choices) : null;
  }

  function festivalAllowed(name, religion) {
    if (/イード|ラマダン|犠牲祭|断食明け|グラン・マガル/.test(name)) return /イスラム/.test(religion);
    if (/ディワリ|ホーリー|ダシェラ|ナヴラトリ/.test(name)) return /ヒンドゥー/.test(religion);
    if (/クリスマス|復活祭|イースター|ティムカット|メスケル|マスカル|セマナ・サンタ|死者の日/.test(name)) return /キリスト|カトリック|正教|プロテスタント/.test(religion);
    if (/スラヴァ/.test(name)) return /正教/.test(religion);
    if (/ヴォドゥン祭/.test(name)) return /伝統宗教/.test(religion);
    if (/ハヌカ|過越/.test(name)) return /ユダヤ/.test(religion);
    if (/ウェーサーカ|仏誕/.test(name)) return /仏教/.test(religion);
    return true;
  }
  function numberField(c, key) { return typeof c[key] === "number" && isFinite(c[key]); }
  function cultureEvent(p, c) {
    var culture = cultureOf(c), a = p.age, year = p.birthYear + a, options = [];
    if (!culture) return false;
    var cultureEn = english() ? window.I18N.cultureOf(culture) : culture;
    var seen = p.cultureSeen || (p.cultureSeen = {});
    function offer(t, cat, weight, more) {
      var item = { t: t, cat: cat, weight: weight || 1 };
      if (more) Object.keys(more).forEach(function (key) { item[key] = more[key]; });
      options.push(item);
    }
    if (culture.foods && culture.foods.length) {
      var food = pick(culture.foods);
      var foodLines = a < 13 ? ["家族と食べた" + food + "の味を、覚えました。",
        "食卓で" + food + "を分け合いました。", "家族が用意した" + food + "を囲みました。", "はじめて食べた" + food + "を気に入りました。"] :
        a < 65 ? ["食卓に" + food + "が並ぶと、家族の会話が弾みました。",
          "久しぶりに" + food + "を食べ、故郷の味を思い出しました。", "家族と" + food + "を作って食べました。", "食材を買いそろえ、" + food + "を作りました。"] :
          ["若いころに食べた" + food + "を、家族に作ってみせました。",
            "食卓の" + food + "で、昔の出来事を思い出しました。", "家族に" + food + "の味を教えました。", "久しぶりに" + food + "を作り、ゆっくり味わいました。"];
      var foodLine = pick(foodLines);
      offer(english() ? t("engine.culture.food." + (a < 13 ? "child" : a < 65 ? "adult" : "old") + "." + foodLines.indexOf(foodLine), "", { food: cultureEn.foods[culture.foods.indexOf(food)] }) : foodLine, "family", 3);
    }
    if (culture.festivals && culture.festivals.length) {
      var festivals = culture.festivals.filter(function (f) { return festivalAllowed(f.name, p.religion); });
      if (festivals.length) {
        var festival = pick(festivals), month = festival.month;
        var when = typeof month === "number" ? month + "月、" : "今年も";
        offer(english() ? t("engine.culture.festival." + (a < 13 ? "child" : a < 65 ? "adult" : "old"), "", { month: typeof month === "number" ? month + "/" : "", festival: cultureEn.festivals[culture.festivals.indexOf(festival)].name }) : when + (a < 13 ? "身近な人と" + festival.name + "を迎え、町のにぎわいを楽しみました。" :
          a < 65 ? "家族や友人と" + festival.name + "を過ごしました。" :
          festival.name + "の日、身近な人に昔の祝い方を話しました。"), "family", 2.5,
          { festival: english() ? cultureEn.festivals[culture.festivals.indexOf(festival)].name : festival.name, m: month });
      }
    }
    if (culture.sports && culture.sports.length) {
      var sport = pick(culture.sports);
      offer(english() ? t("engine.culture.sport." + (a < 19 ? "child" : a < 65 ? "adult" : "old"), "", { sport: cultureEn.sports[culture.sports.indexOf(sport)] }) : a < 19 ? "友だちと" + sport + "を楽しみ、日が暮れるまで夢中になりました。" :
        a < 65 ? sport + "の試合を見ながら、近所の人と話しました。" :
        "子どもたちが" + sport + "をするのを、しばらく眺めました。", a < 19 ? "learn" : "family", 2);
    }
    if (a >= 6 && a <= 22 && culture.langs && culture.langs.length &&
        (p.edu.stage === "primary" || p.edu.stage === "secondary" || p.edu.stage === "univ")) {
      var lang = culture.langs.length > 1 && a >= 12 && chance(0.4) ? culture.langs[1] : culture.langs[0];
      offer(english() ? t("engine.culture.language", "", { language: cultureEn.langs[culture.langs.indexOf(lang)] }) : "学校で" + lang + "の読み書きを練習しました。", "learn", 2);
    }
    if (culture.greeting && a >= 16 && chance(0.25)) {
      offer(english() ? t(a < 50 ? "engine.culture.greeting.new" : "engine.culture.greeting.old", "", { greeting: cultureEn.greeting }) : a < 50 ? "新しい知り合いに「" + culture.greeting + "」と声をかけました。" :
        "久しぶりに会った人と「" + culture.greeting + "」とあいさつを交わしました。", "family", 1);
    }
    if (culture.housing) {
      var home = p.urban ? culture.housing.urban : culture.housing.rural;
      if (home && chance(0.2)) offer(english() ? t("engine.culture.housing", "", { home: p.urban ? cultureEn.housing.urban : cultureEn.housing.rural }) : home.replace(/暮らす$/, "暮らしていました").replace(/住む$/, "住んでいました")
        .replace(/並ぶ$/, "並んでいました").replace(/集まる$/, "集まっていました") + "。その日あったことを身近な人と話しました。", "family", 1);
    }
    if (culture.climate) {
      var climate = culture.climate, weather = [];
      if (climate.rainy && climate.rainy.length) weather.push({ months: climate.rainy, kind: "rain" });
      if (climate.hot && climate.hot.length) weather.push({ months: climate.hot, kind: "heat" });
      if (climate.cold && climate.cold.length) weather.push({ months: climate.cold, kind: "cold" });
      if (weather.length) {
        var season = pick(weather), weatherMonth = pick(season.months), disasters = c.dis || [];
        if (season.kind === "rain") offer(english() ? t("engine.culture.weather.rain", "", { month: weatherMonth }) : weatherMonth + "月、雨の多い季節に道の水たまりをよけて歩きました。", "family", 1.3, { m: weatherMonth });
        if (season.kind === "rain" && disasters.indexOf("洪水") >= 0 && chance(0.25)) offer(english() ? t("engine.culture.weather.flood", "", { month: weatherMonth }) : weatherMonth + "月、雨が続き、近くの川の水位を気にかけました。", "disaster", 0.8, { m: weatherMonth });
        if (season.kind === "heat") offer(english() ? t("engine.culture.weather.heat", "", { month: weatherMonth }) : weatherMonth + "月、暑さのなかで涼しい場所を探して休みました。", "family", 1.3, { m: weatherMonth });
        if (season.kind === "heat" && disasters.indexOf("干ばつ") >= 0 && chance(0.25)) offer(english() ? t("engine.culture.weather.drought", "", { month: weatherMonth }) : weatherMonth + "月、乾いた畑を見て雨が降るのを待ちました。", "disaster", 0.8, { m: weatherMonth });
        if (season.kind === "cold") offer(english() ? t("engine.culture.weather.cold", "", { month: weatherMonth }) : weatherMonth + "月、冷え込む朝に温かい飲み物で体を温めました。", "family", 1.3, { m: weatherMonth });
        if (season.kind === "cold" && climate.snow && chance(0.35)) offer(english() ? t("engine.culture.weather.snow", "", { month: weatherMonth }) : weatherMonth + "月、雪の積もった道をゆっくり歩きました。", "family", 0.8, { m: weatherMonth });
      }
    }
    var ruralFactor = p.urban ? 0.7 : 1.4, poorFactor = p.wealth <= 2 ? 1.5 : p.wealth >= 4 ? 0.5 : 1;
    if (numberField(c, "elec") && a >= 7 && chance(clamp((100 - c.elec) / 100 * ruralFactor * poorFactor, 0, 0.9))) {
      offer(a < 19 && p.edu.stage !== "none" ? "家に電気が届かず、ランプの明かりで宿題をしました。" :
        "家に電気が届かない夜、ランプを囲んで過ごしました。", "family", 2, { refField: "elec" });
      if (!seen.solar && year >= 2000 && p.wealth <= 3) offer("家族で初めて小さなソーラーランプを手に入れました。", "family", 0.8, { once: "solar" });
    }
    if (numberField(c, "water") && a >= 7 && a <= 45 && chance(clamp((100 - c.water) / 100 * ruralFactor * poorFactor * (p.sex === "f" ? 1.2 : 0.8), 0, 0.9))) {
      offer(a < 18 ? "家の水をくみに行くため、朝早く家族と歩きました。" :
        "水を運ぶ道のりが、毎日の家事の一部になりました。", "family", 2, { refField: "water" });
    }
    if (numberField(c, "clean_fuel") && a >= 8 && chance(clamp((100 - c.clean_fuel) / 100 * ruralFactor * poorFactor, 0, 0.85))) {
      offer("薪を使って食事を作り、室内に煙がこもらないようにしました。", "family", 1.5);
    }
    if (numberField(c, "sanit") && a >= 8 && chance(clamp((100 - c.sanit) / 100 * ruralFactor * poorFactor * 0.3, 0, 0.3))) {
      offer("安心して使えるトイレが近くになく、使える場所を探しました。", "health", 0.6);
    }
    if (numberField(c, "mobile") && !seen.phone && year >= 1995 && a >= 14 && chance(clamp(c.mobile / 130 * (p.wealth <= 2 ? 0.45 : 0.9), 0, 0.8))) {
      offer("初めて携帯電話を手にし、離れた家族へ声を届けました。", "family", 1.3, { once: "phone" });
    }
    if (numberField(c, "lit") && !seen.read && a >= 20 && p.edu.level !== "univ" && chance(clamp((100 - c.lit) / 100 * (p.edu.level === "none" ? 1.2 : 0.4), 0, 0.7))) {
      offer("大人になってから文字を習い、家族への便りを自分で読みました。", "learn", 1.5, { once: "read" });
    }
    if (numberField(c, "lit") && a >= 15 && p.edu.level === "secondary" && chance(clamp((100 - c.lit) / 250, 0, 0.3))) {
      offer("家族に届いた手紙を、いっしょに読みました。", "learn", 0.8);
    }
    if (numberField(c, "remit") && a >= 12 && chance(clamp(c.remit / 100 * 1.8, 0, 0.5))) {
      offer("遠くで働く親せきから仕送りが届き、家族で使い道を話しました。", "work", 1.3);
    }
    if (numberField(c, "unemp") && a >= 16 && a <= 40 && (!p.job || p.jobYears <= 2) && chance(clamp(c.unemp / 100 * 1.7, 0, 0.5))) {
      offer(p.job ? "今の仕事に就くまで、長く働き口を探しました。" : "働き口を探して、何度も町へ足を運びました。", "work", 1.3);
    }
    if (numberField(c, "childlab") && !p.eduMode && a >= 7 && a <= 14 && p.wealth <= 2 &&
        p.decisionCount < 20 && chance(clamp(c.childlab / 100 * ruralFactor, 0, 0.7))) {
      offer(p.gentle ? "家の仕事を手伝う日が増えました。" :
        p.edu.stage === "none" ? "家計を支えるため、幼いころから働きました。" :
        "学校が終わると、家計を助ける仕事をしました。", "work", 1.5, { refField: "childlab" });
    }
    if (numberField(c, "phys") && a >= 10 && p.stats.h < 75 && chance(clamp((1.5 - c.phys) / 3, 0, 0.45))) {
      offer("診てもらえる医師を探し、遠くの診療所まで出かけました。", "health", 1.2);
    }
    if (numberField(c, "pov") && p.wealth <= 2 && a >= 7 && chance(clamp(c.pov / 100 * 0.8, 0, 0.65))) {
      offer(p.gentle ? "出費が重なり、家族で食事を工夫しました。" :
        "苦しい年には、家族で食事の回数を減らしました。", "family", 1.2);
    }
    if (numberField(c, "fem_sec") && p.sex === "f" && a >= 12 && a <= 18 && p.edu.stage === "secondary" &&
        chance(clamp(c.fem_sec / 400, 0, 0.25))) offer("同級生の女の子たちと、授業で学んだことを話しました。", "learn", 0.7);
    if (numberField(c, "flfp") && p.sex === "f" && a >= 20 && a <= 55 && p.job &&
        chance(clamp(c.flfp / 500, 0, 0.2))) offer("仕事帰りに、働く女性たちと近況を話しました。", "work", 0.7);
    if (!options.length) return false;
    options = options.filter(function (item) {
      return !p.log.some(function (entry) { return (entry.raw || entry.t) === item.t; });
    });
    if (!options.length) return false;
    var chosen = weighted(options, function (item) { return item.weight; });
    var cultureOptions = { culture: true, cat: chosen.cat, festival: chosen.festival, m: chosen.m };
    if (chosen.refField === "elec") dataRef(cultureOptions, "World Bank WDI", "electricity_access", "この国で電気を利用できる人は{rate}％です。", { rate: pct(c.elec) });
    if (chosen.refField === "water") dataRef(cultureOptions, "World Bank WDI", "water_access", "この国で基本的な飲み水を利用できる人は{rate}％です。", { rate: pct(c.water) });
    if (chosen.refField === "childlab") dataRef(cultureOptions, "UNICEF/ILO", "child_labour", "この国で働く子どもの割合は{rate}％です。", { rate: pct(c.childlab) });
    addLog(p, chosen.t, cultureOptions);
    if (chosen.once) seen[chosen.once] = true;
    return true;
  }
  function countrySmallEvent(p, c) {
    var culture = cultureOf(c), options = [], age = p.age, year = p.birthYear + age;
    if (!culture || age < 6) return false;
    var translated = english() ? window.I18N.cultureOf(culture) : culture;
    if (culture.foods.length) {
      var fi = Math.floor(R() * culture.foods.length);
      options.push({ key: "food", vars: { food: translated.foods[fi] } });
    }
    var festivals = culture.festivals.filter(function (f) { return festivalAllowed(f.name, p.religion); });
    if (festivals.length) {
      var festival = pick(festivals), festivalIndex = culture.festivals.indexOf(festival);
      options.push({ key: "festival", vars: { festival: translated.festivals[festivalIndex].name } });
    }
    if (culture.sports.length) {
      var si = Math.floor(R() * culture.sports.length);
      options.push({ key: "sport", vars: { sport: translated.sports[si] } });
    }
    ["rain", "heat", "cold"].forEach(function (kind) {
      var field = kind === "rain" ? "rainy" : kind === "heat" ? "hot" : "cold";
      var months = culture.climate[field];
      if (months && months.length) options.push({ key: kind, vars: { month: pick(months) } });
    });
    if (year >= 2000 && c.elec >= 50) options.push({ key: "elec", vars: {} });
    if (year >= 2000 && c.water >= 50) options.push({ key: "water", vars: {} });
    if (year >= 2000 && c.sanit >= 50) options.push({ key: "sanit", vars: {} });
    if (c.mobile >= 40 && year >= 1995) options.push({ key: "mobile", vars: {} });
    if (year >= 2000 && c.lit >= 50 && age >= 7) options.push({ key: "lit", vars: {} });
    if (year >= 2000 && c.clean_fuel >= 20 && age >= 12) options.push({ key: "clean_fuel", vars: {} });
    var region = c.grp || "", stage = age < 13 ? 0 : age < 19 ? 1 : age < 65 ? 2 : 3;
    var temperament = { explore: 0, active: 1, social: 2, grit: 3 }[p.temperament] || 0;
    var situation = temperament + p.wealth + (p.urban ? 1 : 0) +
      ({ past: 0, now: 2, future: 4 }[p.era] || 0) + stage + (region.charCodeAt(0) || 0);
    while (options.length) {
      var option = options.splice(Math.floor(R() * options.length), 1)[0];
      var lines = COUNTRY_SMALL[option.key], offset = (situation + Math.floor(R() * Math.min(4, lines.length))) % lines.length;
      var line = t("engine.country_small." + option.key + "." + offset, lines[offset], option.vars);
      var smallOptions = { culture: true, cat: option.key === "sport" || option.key === "lit" ? "learn" : "family" };
      if (option.key === "elec") dataRef(smallOptions, "World Bank WDI", "electricity_access", "この国で電気を利用できる人は{rate}％です。", { rate: pct(c.elec) });
      if (option.key === "water") dataRef(smallOptions, "World Bank WDI", "water_access", "この国で基本的な飲み水を利用できる人は{rate}％です。", { rate: pct(c.water) });
      if (option.key === "sanit") dataRef(smallOptions, "WHO/UNICEF JMP", "sanitation_access", "この国で安全な衛生設備を利用できる人は{rate}％です。", { rate: pct(c.sanit) });
      if (option.key === "lit") dataRef(smallOptions, "UNESCO UIS", "literacy", "この国の識字率は{rate}％です。", { rate: pct(c.lit) });
      if (addLog(p, line, smallOptions)) return true;
    }
    return false;
  }
  function contextSmallEvent(p, c, bucket) {
    var stage = p.age < 6 ? "child" : p.age < 18 ? "student" : p.age < 65 ? "adult" : "old";
    var keys = p.age < 6 ? ["child"] : [p.temperament || "explore", p.age >= 18 ? p.wealth <= 2 ? "poor" : p.wealth >= 4 ? "rich" : null : null,
      p.urban ? "urban" : "rural", p.era, stage, bucket, "region" + ((c.grp || "a").charCodeAt(0) % 3)];
    keys = keys.filter(function (key) { return key && CONTEXT_SMALL[key]; });
    while (keys.length) {
      var key = keys.splice(Math.floor(R() * keys.length), 1)[0];
      var index = Math.floor(R() * CONTEXT_SMALL[key].length);
      var line = t("engine.context_small." + key + "." + index, CONTEXT_SMALL[key][index]);
      if (addLog(p, line)) return true;
    }
    return false;
  }
  // One observation per template, with country details and actual family names.
  // A template is never selected twice in a life, even if the wording's variables change.
  var EVERYDAY = {
    child: [
      "朝、{person}の声が聞こえると目を開けました。", "{person}の手が背中に触れると、静かになりました。", "家の外の足音を聞きながら、{person}のそばで眠りました。",
      "{rhythm}には、{person}のあとをついて歩きました。", "{person}が用意する食事の音を、台所の近くで聞きました。", "雨の日、{person}と窓の外を眺めました。",
      "小さな手で{person}の服の端をつかみました。", "{person}に呼ばれ、自分の名前を覚えました。", "家族が{joy}を楽しむのを、そばで見ていました。",
      "{person}と一緒に市場のにおいと声を覚えました。", "転んだあと、{person}のところまで歩いて戻りました。", "眠る前、{person}が話す今日の出来事を聞きました。",
      "{joy}の日、家の中にいつもと違う声がありました。", "{person}が帰ってくる足音を覚えました。", "風の強い日、{person}と戸口に立ちました。",
      "{rhythm}の前に、家族と水を分けて飲みました。", "{person}が笑うと、つられて笑いました。", "遊びに使った小石を、{person}に見せました。",
      "{joy}のあと、家族が片づけるのを手伝いました。", "熱を出した夜、{person}が何度も様子を見に来ました。", "{person}と道ばたの草の名前を覚えました。",
      "はじめて一人で運んだ器を、{person}に見せました。", "{rhythm}の光を、家の隅から眺めました。", "{person}と同じ歌の一節を繰り返しました。",
      "{joy}を楽しむ大人の輪に、少しだけ加わりました。", "洗ったばかりの布を{person}とたたみました。", "夕方、{person}と今日見たものを話しました。",
      "家の仕事をする{person}の手元をじっと見ました。", "{person}に教わって、道具を元の場所に戻しました。", "{joy}の時間を待つ家族の様子を覚えました。",
      "{person}が{food}を作る手元を、そばで見ていました。", "{sport}を楽しむ年上の子たちを見ていました。"
    ],
    student: [
      "{rhythm}のあと、{person}に今日の予定を話しました。", "{joy}の話で、友だちと帰り道が長くなりました。", "家で学んだ字を{person}に読んで聞かせました。",
      "教科書を閉じ、{joy}を楽しむ人たちの声を聞きました。", "{person}と明日の用意を確かめました。", "通い慣れた道で、いつもの店の開く音を聞きました。",
      "難しい問題を解いた紙を、{person}に見せました。", "{motivation}について、家の人の考えを聞きました。", "友だちと{joy}の約束をして別れました。",
      "{rhythm}には、家の用事を終えて机に向かいました。", "{person}の仕事を短い間だけ手伝いました。", "雨を待つ日も、友だちと明日の話をしました。",
      "{joy}を一緒に楽しむ人の名前を覚えました。", "借りた本を大事に持ち帰り、{person}に表紙を見せました。", "{motivation}のために何ができるか、初めて考えました。",
      "朝の支度を急ぐ{person}に、水を渡しました。", "近所の年下の子に、覚えたばかりのことを教えました。", "{joy}の後、家に戻っていつもの手伝いをしました。",
      "{person}と少し遠回りし、季節の変化を見つけました。", "友だちの失敗を笑わず、もう一度一緒に試しました。", "{rhythm}には、今日うまくできたことを思い返しました。",
      "{person}から使い慣れた道具の扱い方を教わりました。", "{joy}の話を、家に帰ってからも続けました。", "小さな買い物を任され、おつりを確かめました。",
      "「{motivation}」について、{person}と違う考えを持っていると気づきました。", "試験の結果より、帰り道に聞いた{person}の話を覚えています。", "{joy}を楽しみに、長い週を過ごしました。",
      "机がなくても、静かな場所を見つけて勉強しました。", "{person}と夕食の片づけをしながら、友だちの話をしました。", "{motivation}を大事にする人の話を聞きました。",
      "{food}の作り方を{person}に教わりました。", "{sport}の試合のあと、友だちと歩きながら話しました。"
    ],
    adult: [
      "長い一日のあと、{joy}の時間を少し持ちました。", "最初の給料から、{person}に小さな贈り物を買いました。", "{rhythm}には、仕事へ向かう人たちに交じりました。",
      "{person}と食卓を片づけながら、今日のことを話しました。", "{motivation}のため、使えるお金を紙に書き出しました。", "近所の人が困っていて、仕事帰りに手を貸しました。",
      "明かりのない夜、{person}と歌を思い出して口ずさみました。", "{joy}をきっかけに、久しぶりの友人と会いました。", "疲れた朝も起きて、まず今日の仕事の支度をしました。",
      "{person}のために、食事を一皿多く用意しました。", "{rhythm}の前に、家の戸締まりを確かめました。", "{motivation}を思い、断られたあとも別の道を探しました。",
      "{joy}の間、急ぎの用事をいったん脇に置きました。", "働いた手を洗い、{person}と席につきました。", "子どもの{child}が描いた絵を、引き出しにしまいました。",
      "{child}の学びに必要なものを、家計と相談して選びました。", "{person}の話を聞き終わるまで、手を止めました。", "{rhythm}には、隣の家にも一日が始まる音がしました。",
      "{motivation}を支えに、難しい仕事を一つずつ片づけました。", "{joy}の用意をしながら、{person}の近況を聞きました。", "家の明かりが消えたあとも、明日の支度を続けました。",
      "{child}が覚えた歌を、夕食のあとに一緒に歌いました。", "手元のお金が少ない月も、{joy}の楽しみを分け合いました。", "{person}と同じ道を歩き、急がずに話しました。",
      "{motivation}を選んだ理由を、{person}に話しました。", "{rhythm}のあと、道具を手入れして次の日に備えました。", "{joy}の話題で、隣人と顔を見合わせて笑いました。",
      "{child}の問いに、すぐ答えず一緒に考えました。", "うまくいかない日も、いつもの場所で仕事を始めました。", "{person}が残してくれた食事を、帰宅してから食べました。",
      "{motivation}のために取っておいたお金を、封筒に入れました。", "{joy}を楽しむ声が外から聞こえ、窓を開けました。", "{child}の学校であったことを、食卓でゆっくり聞きました。",
      "{person}と雨を避けて立ち止まり、少しだけ話しました。", "{rhythm}には、今日も畑や店や職場へ向かいました。", "{motivation}についての考えが変わり、{person}に伝えました。",
      "{joy}を楽しんだあと、残った家の仕事を終えました。", "疲れた{person}に、先に休むよう声をかけました。", "長い通勤の帰り、家の灯りが見えると足が軽くなりました。",
      "{motivation}を大切にしながら、今日できることを選びました。", "{person}と{food}を作り、残りを明日のために取っておきました。",
      "{sport}の話題で、仕事仲間と短く笑いました。"
    ],
    old: [
      "{rhythm}には、窓を開けて外の音を聞きました。", "{joy}を楽しむ若い人たちを、しばらく眺めました。", "{person}と昔通った道の話をしました。",
      "手の届く場所に道具を置き、少しずつ作業を進めました。", "{motivation}のために続けた日々を、{person}に話しました。", "{child}から届いた短い知らせを、もう一度読みました。",
      "{joy}を一緒に楽しむ約束を、友人としました。", "朝、{person}の声を聞いてから支度を始めました。", "長く使った器を洗い、また棚へ戻しました。",
      "{rhythm}のあと、椅子に座って近所の声を聞きました。", "{child}の子どもに、覚えている歌を教えました。", "{motivation}を大事にする人が家族に増えました。",
      "{joy}を楽しむため、歩く道を少し変えました。", "体の調子に合わせて休みながら、家の仕事を終えました。", "{person}と古い写真の場所を思い出しました。",
      "{rhythm}には、昔よりゆっくり歩いて用事を済ませました。", "{child}に、使い込んだ道具の直し方を見せました。", "{joy}のあと、友人を戸口まで見送りました。",
      "{person}の話を聞き、知らない近所の変化を教わりました。", "{motivation}について、若いころとは違う答えを持ちました。", "朝の光で、植えたものの育ち具合を確かめました。",
      "{joy}の話が出ると、思い出す人の顔がありました。", "{child}と二人で、食事の準備をしました。", "{rhythm}の前に、今日会う人の名前を思い浮かべました。",
      "{person}に、最近おいしかったものを伝えました。", "{motivation}のために残したものを、家族と確かめました。", "{joy}を楽しむ時間を、今も予定に入れました。",
      "弱った日には助けを受け、元気な日は誰かを手伝いました。", "{person}と静かに座り、通り過ぎる人を見ていました。", "{rhythm}には、今日も自分の手でできることを始めました。",
      "{food}の作り方を若い人に伝えました。", "{sport}の試合を{person}と最後まで見ました。"
    ],
    hard: [
      "暮らしが苦しい朝も、{rhythm}には起きて仕事に向かいました。", "食事を工夫した日、{person}が分けてくれた一口を覚えています。",
      "仕事が途切れても、次の日の働き口を探しに出ました。", "疲れて帰り、{joy}の時間だけは家族と過ごしました。",
      "道具が壊れたあと、直せるところを探してまた使いました。", "{motivation}を思い、わずかな蓄えを手放さずにいました。",
      "予定が変わった日も、{person}と明日の段取りを決めました。", "長い道のりを歩いて戻り、家の仕事も終えました。",
      "近所の人に助けられ、次に手が空いたときは自分も手伝いました。", "不安の残る夜、{person}と水や食べものの置き場所を確かめました。",
      "{rhythm}のあと、少し休んでから手を動かし続けました。", "難しい時期にも、{joy}の話で家族と短く笑いました。",
      "{food}が少しある日、{person}と分けて食べました。", "大変な日でも、{sport}の試合結果を隣人と話しました。"
    ]
  };
  function everydayMoment(p, c, fixed) {
    var data = joysOf(c);
    if (!data || !data.joys || !data.motivations || !data.rhythms) return false;
    // A separate stream leaves the calibrated mortality, family and income draws intact.
    var seedText = p.id + "|everyday|" + p.age + "|" + (fixed == null ? "year" : fixed), seed = 2166136261;
    for (var h = 0; h < seedText.length; h++) seed = Math.imul(seed ^ seedText.charCodeAt(h), 16777619);
    var local = rng(seed), localPick = function (items) { return items[Math.floor(local() * items.length)]; };
    if (fixed == null && local() > (p.age < 6 ? 0.7 : 0.78)) return false;
    var stage = p.age < 6 ? "child" : p.age < 18 ? "student" : p.age < 65 ? "adult" : "old";
    if (p.age >= 16 && (p.wealth <= 2 || p.displaced || conflictRate(c, p.birthYear + p.age) > 10) && local() < 0.35) stage = "hard";
    var seen = p.everydaySeen || (p.everydaySeen = {});
    var pool = EVERYDAY[stage], candidates = [];
    var localCulture = cultureOf(c);
    var livingKids = (p.kids || []).filter(function (kid) { return kid.alive; });
    for (var i = 0; i < pool.length; i++) {
      if (fixed != null && i !== fixed || fixed == null && stage === "child" && i < 3 || seen[stage + ":" + i]) continue;
      if (pool[i].indexOf("{child}") >= 0 && !livingKids.length) continue;
      if (pool[i].indexOf("{food}") >= 0 && !(localCulture && localCulture.foods && localCulture.foods.length)) continue;
      if (pool[i].indexOf("{sport}") >= 0 && !(localCulture && localCulture.sports && localCulture.sports.length)) continue;
      if (stage === "adult" && i === 1 && (!p.job || p.jobYears > 2 || p.age > 30)) continue;
      if (stage === "adult" && [14, 21, 27].indexOf(i) >= 0 && !livingKids.some(function (kid) { return p.age - kid.born >= 3; })) continue;
      if (stage === "adult" && [15, 32].indexOf(i) >= 0 && !livingKids.some(function (kid) { return p.age - kid.born >= 5; })) continue;
      if (stage === "old" && i === 10 && !p.grand) continue;
      candidates.push(i);
    }
    if (!candidates.length) return false;
    var index = fixed == null ? localPick(candidates) : fixed, line = pool[index];
    var people = [p.parents && p.parents.mom, p.parents && p.parents.dad, p.spouse].filter(function (person) { return person && person.alive; });
    var named = people.length ? localPick(people).name : null;
    var allowedJoys = data.joys.map(function (_, index) { return index; }).filter(function (index) {
      return festivalAllowed(data.joys[index].ja, p.religion);
    });
    var joyIndex = localPick(allowedJoys.length ? allowedJoys : data.joys.map(function (_, index) { return index; }));
    var motiveIndex = Math.floor(local() * data.motivations.length);
    if (p.childSchoolPaid || p.focus === "learn") {
      var education = data.motivations.findIndex(function (value) { return /学|教育|education|learning/i.test(value.ja + " " + value.en); });
      if (education >= 0 && local() < 0.7) motiveIndex = education;
    } else if (p.community || p.focus === "family") {
      var belonging = data.motivations.findIndex(function (value) { return /家族|地域|友|community|family|friends/i.test(value.ja + " " + value.en); });
      if (belonging >= 0 && local() < 0.7) motiveIndex = belonging;
    } else if (p.business || p.focus === "work") {
      var craft = data.motivations.findIndex(function (value) { return /仕事|技|商|work|craft/i.test(value.ja + " " + value.en); });
      if (craft >= 0 && local() < 0.7) motiveIndex = craft;
    }
    var code = english() ? "en" : "ja";
    var namedCulture = english() && window.I18N && window.I18N.cultureOf ? window.I18N.cultureOf(localCulture) : localCulture;
    var namedKids = stage === "adult" && [15, 32].indexOf(index) >= 0 ? livingKids.filter(function (kid) { return p.age - kid.born >= 5; }) :
      stage === "adult" && [14, 21, 27].indexOf(index) >= 0 ? livingKids.filter(function (kid) { return p.age - kid.born >= 3; }) : livingKids;
    var vars = {
      person: named || (english() ? "someone close" : "身近な人"), child: namedKids.length ? localPick(namedKids).given : "",
      joy: data.joys[joyIndex][code], motivation: data.motivations[motiveIndex][code],
      rhythm: localPick(data.rhythms)[code],
      food: namedCulture && namedCulture.foods && namedCulture.foods.length ? localPick(namedCulture.foods) : "",
      sport: namedCulture && namedCulture.sports && namedCulture.sports.length ? localPick(namedCulture.sports) : ""
    };
    var text = t("engine.everyday." + stage + "." + index, line, vars);
    if (!english()) {
      // Joys and motivations are infinitive clauses. Their final こと cannot
      // be followed by の間, のため, or another noun as though it were a name.
      [vars.joy, vars.motivation].forEach(function (phrase) {
        if (!/こと$/.test(phrase)) return;
        var stem = phrase.slice(0, -2);
        ["ため", "間", "あと", "後", "時間", "楽しみ", "約束", "用意", "日"].forEach(function (suffix) {
          text = text.split(phrase + "の" + suffix).join(stem + suffix);
        });
        text = text.split(phrase + "の話題で").join(phrase + "を話題にして");
        text = text.split(phrase + "の話").join(phrase + "についての話");
        text = text.split(phrase + "を楽しむ").join(stem + "時間を楽しむ");
        text = text.split(phrase + "を楽しんだ").join(stem + "時間を楽しんだ");
        text = text.split(phrase + "を楽しみに").join(stem + "のを楽しみに");
      });
    }
    var did = addLog(p, text, { cat: stage === "student" ? "learn" : "family", everyday: true,
      culture: line.indexOf("{food}") >= 0 || line.indexOf("{sport}") >= 0,
      joy: line.indexOf("{joy}") >= 0 ? joyIndex : null, motivation: line.indexOf("{motivation}") >= 0 ? motiveIndex : null });
    if (did) seen[stage + ":" + index] = true;
    return did;
  }
  function smallEvent(p, c, bucket) {
    if (chance(0.35) && countrySmallEvent(p, c)) return;
    if (chance(0.25) && contextSmallEvent(p, c, bucket)) return;
    if (!(chance(0.5) && cultureEvent(p, c))) {
      var line = smallLine(p, bucket);
      if (line) addLog(p, line);
    }
  }

  function residenceCountry(p) {
    return p.abroad ? C.filter(function (country) { return country.name === p.abroad; })[0] || BY[p.iso] : BY[p.iso];
  }
  function conflictRate(c, year) {
    var record = HISTORY[c.iso.toUpperCase()];
    return record && record.conflict && Number(record.conflict[year]) || 0;
  }
  // WHO 2018 lifetime IPV prevalence among ever-partnered women aged 15-49, SDG regions:
  // https://www.who.int/news/item/09-03-2021-devastatingly-pervasive-1-in-3-women-globally-experience-violence
  // grp is broader than the WHO regions. These rounded values are documented simulation
  // proxies, not country estimates. A country ipv field overrides its regional proxy.
  var IPV_REGION_PROXY = { sa: 35, ea: 20, wa: 33, ca: 33, se: 21, ea_af: 33,
    we: 22, la: 25, me: 30, ru: 20, cas: 18, tr: 29, jp: 20, kr: 20, pac: 40, eu: 20 };
  function partnerViolenceRate(c) {
    var lifetime = hasNumber(c, "ipv") ? c.ipv : IPV_REGION_PROXY[c.grp] || 25;
    return 1 - Math.pow(1 - clamp(lifetime, 0, 95) / 100, 1 / 30);
  }
  function violenceRandom(p, year) {
    var key = String(p.id || p.name || "") + ":" + year, seed = 2166136261;
    for (var i = 0; i < key.length; i++) seed = Math.imul(seed ^ key.charCodeAt(i), 16777619);
    return rng(seed);
  }
  function violenceEvent(p, c, year, draw) {
    if (p.gentle || p.eduMode || p.age < 14) return;
    draw = draw || R;
    var rate = Math.max(0, Number(c.hom) || 0), war = conflictRate(c, year);
    var events = [];
    if (p.sex === "f" && p.age >= 16 && p.age <= 49 && !p.everPartnerViolence && p.rel === "married" && p.spouse && p.spouse.alive && draw() < partnerViolenceRate(c)) events.push("domestic");
    if (p.age <= 75 && draw() < clamp(rate * 8 / 100000, 0, 0.08)) events.push("assault");
    if (p.age >= 16 && p.age <= 75 && draw() < clamp(rate * 5 / 100000, 0, 0.05)) events.push("robbery");
    if (p.age >= 16 && p.age <= 75 && draw() < clamp(governanceRisk(c, "rl") * 0.002 + war / 80000, 0, 0.05)) events.push("police");
    if (war > 1 && draw() < clamp(war / 20000, 0, 0.18)) events.push("conflict");
    if (!events.length) return;
    // Only one incident is narrated per year; independent hazards still determine exposure.
    var kind = events[Math.floor(draw() * events.length)], damage = { domestic: [8, 13], assault: [12, 8], robbery: [2, 9], police: [9, 11], conflict: [15, 14] }[kind];
    if (kind === "domestic") p.everPartnerViolence = true;
    p.stats.h -= damage[0]; p.stats.hp -= damage[1]; p.swings++;
    if (kind === "robbery") money(p, t("engine.violence.loss.robbery", "強盗で失った持ち金"), -Math.max(10, p.income * 0.12));
    if (kind === "domestic" || kind === "assault" || kind === "police" || kind === "conflict")
      money(p, t("engine.violence.loss.care", "暴力被害後の治療費"), -Math.max(10, p.income * 0.05));
    var lines = {
      domestic: "同居する相手から家庭内で暴力を受けました。けがで通院し、家で安心して眠れなくなりました。",
      assault: "帰宅中に見知らぬ人から暴行を受けました。けがで通院し、同じ道を通れなくなりました。",
      robbery: "帰り道で強盗に遭い、持ち金を奪われました。帰宅後も手の震えが止まりませんでした。",
      police: "警察官から暴力を受けました。治療を受け、通行のたびに身構えるようになりました。",
      conflict: "紛争中、近くで兵士の暴力を受けました。けがの治療と避難先探しが続きました。"
    };
    var line = t("engine.violence." + kind, lines[kind]);
    if (kind === "domestic") line += "\n" + t("engine.violence.support", "ひとりで抱えずに、身近な人や相談窓口に話してください。");
    var violenceOptions = { cat: "health", tone: "bad", big: true };
    if (kind === "domestic") dataRef(violenceOptions, hasNumber(c, "ipv") ? "WHO" : "WHO regional estimate", "partner_violence", "この地域で親密な相手から暴力を経験した女性は約{rate}％です。", { rate: pct(hasNumber(c, "ipv") ? c.ipv : IPV_REGION_PROXY[c.grp] || 25) });
    else if (kind === "conflict") dataRef(violenceOptions, "UCDP", "conflict", "{year}年、この国の紛争死者は人口10万人あたり{rate}人でした。", { year: year, rate: pct(war) });
    else if (kind === "police" && hasNumber(c, "rl")) dataRef(violenceOptions, "World Bank WGI", "rule_of_law", "この国の法の支配の推計値は{score}です。", { score: Number(c.rl).toFixed(2) });
    else if (kind === "police") dataRef(violenceOptions, "UCDP", "conflict", "{year}年、この国の紛争死者は人口10万人あたり{rate}人でした。", { year: year, rate: pct(war) });
    else dataRef(violenceOptions, "UNODC", "homicide", "この国の殺人死亡率は人口10万人あたり{rate}人です。", { rate: pct(rate) });
    addLog(p, line, violenceOptions);
    (p.violenceAftermath || (p.violenceAftermath = [])).push({ kind: kind, year: year });
  }
  function violenceAftermath(p) {
    if (p.gentle || p.eduMode || !p.violenceAftermath) return;
    var year = p.birthYear + p.age;
    p.violenceAftermath.forEach(function (incident) {
      var years = year - incident.year;
      if (years !== 1 && years !== 3 && years !== 5) return;
      var lines = {
        domestic: ["翌年も家庭内の暴力の記憶で眠れない夜があり、通院を続けました。", "家庭内の暴力から3年たっても、家の中で物音に身構えました。", "家庭内の暴力から5年後も、安心して眠れる場所を探しました。"],
        assault: ["翌年も暴行のけがで通院し、帰り道を遠回りしました。", "暴行から3年後も、ひとりで帰る夜には足が止まりました。", "暴行から5年後も、痛みで予定を変える日がありました。"],
        robbery: ["翌年も強盗で失ったお金を思い出し、支出に慎重になりました。", "強盗から3年後も、帰り道を変える習慣が残りました。", "強盗から5年後も、同じ道を通るとあの日の恐怖が戻りました。"],
        police: ["翌年も警察官から受けた暴力によるけがで通院しました。", "3年後も制服を見かけると、あの日の恐怖が戻りました。", "5年後も制服の人に声をかけられると、体がこわばりました。"],
        conflict: ["翌年も紛争で受けたけがの治療を続けました。", "紛争の暴力から3年後も、眠りが浅くなりました。", "紛争の暴力から5年後も、大きな物音に身構えました。"]
      };
      var index = years === 1 ? 0 : years === 3 ? 1 : 2;
      addLog(p, t("engine.violence.after." + incident.kind + "." + years, lines[incident.kind][index]), { cat: "health", tone: "bad" });
      if (years === 1) p.stats.hp -= 2;
    });
    p.violenceAftermath = p.violenceAftermath.filter(function (incident) { return year - incident.year < 5; });
  }
  function milestoneNarrative(p) {
    var a = p.age, c = BY[p.iso];
    if ([5, 15, 30, 50, 70].indexOf(a) < 0) return;
    var parentsGone = !p.parents.mom.alive || !p.parents.dad.alive;
    var lostChild = p.kids.some(function (kid) { return !kid.alive; });
    var unresolved = (p.debt || p.loanDebt || 0) > 0 || p.net < 0;
    var line;
    if (a === 5) {
      var u5 = personStats(p, c, p.sex, p.birthYear).u5;
      var oneIn = Math.max(2, Math.round(100 / Math.max(0.01, u5)));
      line = t("engine.milestone.5", "5歳になりました。同じ年にこの国で生まれた子の{oneIn}人に1人は、推計でもう生きていません。あなたは今日を迎えました。", { oneIn: oneIn });
    } else if (a === 15) {
      var inSchool = ["primary", "secondary", "univ"].indexOf(p.edu.stage) >= 0;
      line = t(inSchool ? "engine.milestone.15.school" : "engine.milestone.15.out",
        !inSchool ? "15歳になりました。通学する同い年の子を見送り、自分の一日には授業がありませんでした。家の事情は努力だけでは変わりませんでした。" :
          "15歳になりました。学んだことは増えましたが、次の学年に進めるかは家計と学校の事情にもかかっていました。");
    } else if (a === 30) {
      line = t(p.job ? "engine.milestone.30.work" : "engine.milestone.30.no_work",
        p.job ? "30歳になりました。仕事を続けてきましたが、病気や家族の事情で休んだ日も賃金には戻りませんでした。" :
          "30歳になりました。働き口を探した時間は、収入にも職歴にも数えられませんでした。");
    } else if (a === 50) {
      line = t(unresolved ? "engine.milestone.50.debt" : "engine.milestone.50.health",
        unresolved ? "50歳になりました。働いた年月を重ねても借入が残り、返済が次の月の選択を狭めました。" :
          "50歳になりました。健康を保てた日もあれば、体調に合わせて予定を変えた日もありました。");
    } else {
      line = t(lostChild ? "engine.milestone.70.child" : parentsGone ? "engine.milestone.70.parents" : "engine.milestone.70.living",
        lostChild ? "70歳になりました。先に亡くした子の年齢を今も数えました。祝いの日にも、あの子の席は空いたままでした。" :
          parentsGone ? "70歳になりました。親に話したかったことが残っています。体の衰えで、遠くへ出かける日も減りました。" :
            "70歳になりました。できることが少しずつ減り、手伝ってもらう日の重みを知りました。");
      var survivors = Math.max(1, Math.round(100 * survival(lifeTable(c, p.sex, p.era, p.birthYear))[70]));
      line += t("engine.milestone.70.cohort", "同じ年にこの国で生まれた100人のうち、70歳を迎えるのは推計{count}人でした。", { count: survivors });
    }
    addLog(p, line, a === 5 ? dataRef({ cat: "family", big: true, tone: "neutral" }, "UN IGME", "under_five", "この国では、5歳までに亡くなる子どもは約{oneIn}人に1人です。", { oneIn: Math.max(2, Math.round(100 / Math.max(0.01, personStats(p, c, p.sex, p.birthYear).u5))) }) :
      a === 70 ? dataRef({ cat: "family", big: true, tone: "bad" }, "WHO life tables", "survival_70", "この国で同じ年に生まれた100人のうち、推計{count}人が70歳を迎えます。", { count: Math.max(1, Math.round(100 * survival(lifeTable(c, p.sex, p.era, p.birthYear))[70])) }) : { cat: "family", big: true, tone: "bad" });
  }
  function governanceRisk(c, key) { return hasNumber(c, key) ? clamp((2.5 - c[key]) / 5, 0, 1) : 0; }
  function countryCourseEvents(p, c, year) {
    var a = p.age, conflict = conflictRate(c, year) > 10 ? 1.6 : 1;
    if (year === 2020 && hasNumber(c, "covid_stringency_avg")) {
      var stringency = clamp(c.covid_stringency_avg, 0, 100) / 100;
      if (c.covid_stay_home === true && hasNumber(c, "covid_stringency_max") && c.covid_stringency_max >= 40)
        addLog(p, t("engine.institution.covid_stay_home", "2020年、外出を控える措置がとられ、家で過ごす時間が増えました。"), dataRef({ cat: "society", tone: "neutral" }, "OxCGRT", "covid_stringency", "2020年の政策厳格度指数の最大値は{rate}／100でした。", { rate: pct(c.covid_stringency_max) }));
      else if (a >= 16)
        addLog(p, t("engine.institution.covid_customers", "2020年、感染拡大で店を訪れる客が減り、地域の仕事にも影響が出ました。"), dataRef({ cat: "economy", tone: "bad" }, "OxCGRT", "covid_average", "2020年の政策厳格度指数の平均値は{rate}／100でした。", { rate: pct(c.covid_stringency_avg) }));
      if (a >= 16 && p.job && chance(clamp(0.015 + stringency * 0.12 + (c.covid_stay_home ? 0.025 : 0), 0, 0.18))) {
        p.job = null; p.income = 0; p.swings++;
        addLog(p, t("engine.institution.covid_job_loss", "2020年、感染拡大と活動制限の影響で仕事を失いました。"), dataRef({ cat: "work", tone: "bad" }, "OxCGRT", "covid_average", "2020年の政策厳格度指数の平均値は{rate}／100でした。", { rate: pct(c.covid_stringency_avg) }));
      }
    }
    if (p.slumHome && a >= 6 && chance(0.07))
      addLog(p, t("engine.course.slum_services", "{year}年、住まいの地域では水や交通などの公共サービスを使いにくい日がありました。", { year: year }), dataRef({ cat: "society", tone: "bad" }, "World Bank WDI", "water_access", "この国で基本的な飲み水を利用できる人は{rate}％です。", { rate: pct(c.water) }));
    if (a >= 3 && (hasNumber(c, "food_insec") || hasNumber(c, "undernourish"))) {
      var food = percentage(c, "food_insec", percentage(c, "undernourish", 0));
      if (chance(clamp(food * (p.wealth <= 2 ? 1.4 : p.wealth >= 4 ? 0.6 : 1) * conflict * (p.disasterYear === year ? 1.5 : 1), 0, 0.9))) {
        p.stats.h -= hasNumber(c, "undernourish") && chance(clamp(percentage(c, "undernourish", 0) / Math.max(0.01, food), 0, 1)) ? 3 : 1;
        var priorFood = (p.proseFamilySeen || {}).food_shortage || 0;
        var foodStage = a < 18 ? "child" : a >= 65 ? "old" : "adult";
        var foodContext = priorFood ? p.disasterYear === year ? "disaster" : p.urban ? "urban" : "rural" : "first_" + foodStage;
        var foodKey = p.gentle ? "gentle" : foodContext;
        var foodMessage = "engine.course.food_prose." + foodKey;
        var foodTranslated = window.I18N && window.I18N.dictionaries && window.I18N.dictionaries[window.I18N.lang] &&
          window.I18N.dictionaries[window.I18N.lang][foodMessage];
        var foodText = foodTranslated ? window.I18N.t(foodMessage, { year: year }) :
          t("engine.course.food_prose." + foodKey, "{year}年、食料が足りず、家族で食事を分け合いました。", { year: year });
        addLog(p, foodText, dataRef({ cat: "health", tone: "bad", family: "food_shortage" }, hasNumber(c, "food_insec") ? "FAO" : "FAO/UN", hasNumber(c, "food_insec") ? "food_insecurity" : "undernourishment", hasNumber(c, "food_insec") ? "この国で食料不安を経験する人は{rate}％です。" : "この国で栄養不足の人は{rate}％です。", { rate: pct(food * 100) }));
      }
    }
    if (a >= 18 && a <= 65 && p.job && hasNumber(c, "rl") && chance(governanceRisk(c, "rl") * 0.035)) {
      p.income *= 0.97;
      addLog(p, t("engine.course.law", "{year}年、賃金をめぐる争いを相談しましたが、解決まで長くかかりました。", { year: year }), dataRef({ cat: "society", tone: "bad" }, "World Bank WGI", "rule_of_law", "この国の法の支配の推計値は{score}です。", { score: Number(c.rl).toFixed(2) }));
    }
    if (a >= 16 && hasNumber(c, "va") && chance(governanceRisk(c, "va") * 0.018))
      addLog(p, t("engine.course.voice", "{year}年、地域の新聞が休刊し、人々は情報を確かめながら意見を交わしました。", { year: year }), dataRef({ cat: "society", tone: "bad" }, "World Bank WGI", "voice", "この国の発言・説明責任の推計値は{score}です。", { score: Number(c.va).toFixed(2) }));
    if (a >= 12 && hasNumber(c, "pv") && chance(governanceRisk(c, "pv") * (conflict > 1 ? 0.1 : 0.025)))
      addLog(p, t("engine.course.stability", "{year}年、抗議や移動制限で学校や仕事の予定が変わりました。", { year: year }), dataRef({ cat: "society", tone: "bad" }, "World Bank WGI", "stability", "この国の政治的安定の推計値は{score}です。", { score: Number(c.pv).toFixed(2) }));
    if (!p.eduMode && !p.pending && a >= 18 && a <= 65 && (hasNumber(c, "cc") || hasNumber(c, "ge")) &&
        chance((governanceRisk(c, "cc") + governanceRisk(c, "ge")) * 0.025)) p.pending = "documentFee";
  }
  function baselineConflictShare(iso, sex, age, year) {
    var data = window.CAUSES;
    var sourceYear = year <= 2004 ? "2000" : year <= 2021 ? "2019" : "2023";
    var ageIndex = age < 15 ? 1 : age < 30 ? 2 : age < 50 ? 3 : age < 60 ? 4 : age < 70 ? 5 : 6;
    var cell = data && data.data[iso] && data.data[iso][sourceYear] && data.data[iso][sourceYear][sex] && data.data[iso][sourceYear][sex][ageIndex];
    if (!cell) return 0;
    var conflict = 0, total = 0;
    for (var i = 0; i < cell.length; i += 2) {
      total += cell[i + 1];
      if (data.causes[cell[i]][0] === "conflict") conflict += cell[i + 1];
    }
    return total ? conflict / total : 0;
  }
  function mortalityProbability(p, baseQ, year) {
    year = year || p.birthYear + p.age;
    if (baseQ == null) baseQ = lifeTable(BY[p.iso], p.sex, p.era, p.birthYear)[Math.min(115, Math.max(0, p.age - 1))];
    var health = p.stats && p.stats.h != null ? p.stats.h : 55;
    var base = clamp(baseQ * (p.age > 5 ? clamp(Math.exp((55 - health) / 35), 1, 4.5) : 1), 0, 1);
    // The life table already contains average maternal mortality. Births receive that risk explicitly in newKid.
    if (p.sex === "f" && p.age >= 15 && p.age <= 45 && p.maternalBirths != null && hasNumber(BY[p.iso], "mmr")) {
      var country = BY[p.iso], birthRate = p.age < 20 && hasNumber(country, "adol_fert") ? country.adol_fert / 1000 : country.tfr / 27;
      base = Math.max(0, base - country.mmr / 100000 * birthRate);
    }
    if (p.age <= 5 && p.vax && p.vax.status) {
      var multiplier = { full: 0.68, partial: 1.12, none: 1.85 }[p.vax.status] || 1;
      base = clamp(base * multiplier / vaccinationNormalizer(p), 0, 1);
    }
    var residence = residenceCountry(p);
    var rate = p.conflictYear === year ? p.conflictRateThisYear : conflictRate(residence, year);
    // WHO's country life table already includes ordinary conflict deaths. Only add the UCDP excess.
    var baseline = p.age <= 5 ? 0 : baseQ * baselineConflictShare(residence.iso, p.sex, p.age, year);
    var conflict = p.age <= 5 ? 0 : clamp(rate / 100000 * (p.age < 15 ? 1.1 : 1.8) - baseline, 0, 0.4);
    return { base: base, conflict: conflict, total: clamp(1 - (1 - base) * (1 - conflict), 0, 1) };
  }
  function applyHistory(p, year) {
    var country = residenceCountry(p), record = HISTORY[country.iso.toUpperCase()] || {}, rate = conflictRate(country, year);
    p.conflictYear = year;
    p.conflictRateThisYear = rate;
    if (rate > 1) {
      addLog(p, p.gentle ? t("engine.history.conflict_gentle", "地域の不安定な状況が続き、家族で安全な道を確かめました。") :
        t("engine.history.conflict", "地域で紛争が続き、通学や買い物の道がふさがれました。家族は毎朝、安全を確かめました。"), dataRef({ cat: "society", tone: "bad" }, "UCDP", "conflict", "{year}年、この国の紛争死者は人口10万人あたり{rate}人でした。", { year: year, rate: pct(rate) }));
      if (p.job && chance(clamp(rate / 180, 0.04, 0.65))) {
        var shock = 0.1 + 0.3 * clamp(rate / 300, 0, 1);
        p.income *= 1 - shock;
        addLog(p, "地域の混乱で仕事が減り、収入が落ちました。", dataRef({ cat: "economy", tone: "bad" }, "UCDP", "conflict", "{year}年、この国の紛争死者は人口10万人あたり{rate}人でした。", { year: year, rate: pct(rate) }));
      }
      if (["primary", "secondary", "univ"].indexOf(p.edu.stage) >= 0 && chance(clamp(rate / 250, 0.03, 0.5))) {
        p.schoolInterruptedYear = year;
        addLog(p, "安全を確かめる間、学校の授業に通えない日が続きました。", dataRef({ cat: "learn", tone: "bad" }, "UCDP", "conflict", "{year}年、この国の紛争死者は人口10万人あたり{rate}人でした。", { year: year, rate: pct(rate) }));
      }
      var refugees = record.refugees && Number(record.refugees[year]) || 0;
      var seriesPopulation = seriesValue(country, "pop", year);
      var population = seriesPopulation ? seriesPopulation * 1000 : country.pop * 10000;
      if (!p.displaced && refugees > 0 && chance(clamp(refugees / Math.max(1, population) * 0.35, 0, 0.22))) {
        p.displaced = true;
        p.moved++;
        p.abroad = country.emig && country.emig.length ? pick(country.emig) : null;
        addLog(p, p.abroad ? "安全を求めて家族と" + p.abroad + "へ移り、暮らしを始めました。" :
          "安全を求めて家族と国内の別の土地へ移りました。", dataRef({ cat: "society", big: true, tone: "bad" }, "UNHCR", "refugees", "{year}年、この国からの難民は{count}人と記録されています。", { year: year, count: Math.round(refugees).toLocaleString(english() ? "en-US" : "ja-JP") }));
      }
    } else if (p.displaced && year >= 1989 && year <= 2025 && chance(0.15)) {
      p.displaced = false;
      p.abroad = null;
      p.returned = true;
      addLog(p, "状況が落ち着き、家族と故郷へ戻りました。", { cat: "society", big: true, tone: "good" });
    }
    var facts = (window.FACTS || {})[country.iso.toUpperCase()] || [];
    facts.forEach(function (fact) {
      if (Number(fact.y) !== year || !fact.src || fact.src.indexOf("主な出来事") < 0) return;
      if (fact.cat === "economy" && /危機|不況|暴落|インフレ|景気後退|債務不履行|価格の下落/.test(fact.t)) {
        p.crisisYear = year;
        if (p.job) p.income *= 0.86;
        var crisisOptions = { cat: "economy", tone: "bad" }, yearInflation = Number(country.infl_history && country.infl_history[year]);
        if (isFinite(yearInflation)) dataRef(crisisOptions, "World Bank WDI", "inflation", "{year}年の消費者物価上昇率は{rate}％でした。", { year: year, rate: pct(yearInflation) });
        else dataRef(crisisOptions, historicalSource(), "historical_event", "{year}年に記録された出来事です：{event}", { year: year, event: english() && window.I18N.factText ? window.I18N.factText(fact) : fact.t });
        addLog(p, "経済の混乱で働き方を見直し、家計の支出を抑えました。", crisisOptions);
      } else if (fact.cat === "disaster") {
        p.disasterYear = year;
        p.stats.h -= 4;
        money(p, "災害後の暮らし", -Math.max(30, p.income * 0.08));
        addLog(p, "災害の後片づけと生活の立て直しに、時間とお金を使いました。", dataRef({ cat: "disaster", tone: "bad" }, historicalSource(), "historical_event", "{year}年に記録された出来事です：{event}", { year: year, event: english() && window.I18N.factText ? window.I18N.factText(fact) : fact.t }));
      } else if (fact.cat === "health" && /流行|感染|疫|病/.test(fact.t)) {
        p.stats.h -= 5;
        addLog(p, "感染症の広がりを受け、家族で体調に気を配りました。", dataRef({ cat: "health", tone: "bad" }, historicalSource(), "historical_event", "{year}年に記録された出来事です：{event}", { year: year, event: english() && window.I18N.factText ? window.I18N.factText(fact) : fact.t }));
      }
    });
  }

  function addYearFacts(p, year) {
    var facts = window.FACTS || {}, places = [BY[p.iso]], seen = p.factSeen || (p.factSeen = {}), count = 0;
    if (p.abroad) {
      var abroad = C.filter(function (country) { return country.name === p.abroad; })[0];
      if (abroad && abroad.iso !== p.iso) places.push(abroad);
    }
    places.forEach(function (country) {
      var entries = facts[country.iso.toUpperCase()] || [];
      entries.forEach(function (fact, index) {
        if (count >= 2 || !fact || !LOG_CATS[fact.cat]) return;
        var end = Array.isArray(fact.y) ? Number(fact.y[1]) : Number(fact.y);
        var key = country.iso + ":" + index;
        if (end !== year || end < p.birthYear || seen[key]) return;
        var projection = end > 2025;
        addLog(p, english() ? t("engine.fact.entry", "", { country: countryName(country), projection: projection ? t("engine.fact.projection", "") : "", text: window.I18N.factText(fact) }) : "【資料・" + country.name + "】" + (projection ? "見通しでは、" : "") + fact.t,
          { fact: true, cat: fact.cat, src: factSourceLabel(fact), stat: english() ? window.I18N.factText(fact) : fact.t, y: end });
        seen[key] = true;
        count++;
      });
    });
  }

  function inherit(p, parent) {
    var estate = medianIncome(p) * Math.pow(2.5, (parent.wealth || p.wealth) - 3) * (0.08 + 0.12 * R());
    if (estate <= 0 || p.age < 14) return;
    var received = estate / Math.max(1, (p.sibs || []).length + 1);
    money(p, t("engine.econ.inheritance", "親からの相続"), received);
    p.inheritanceReceived = (p.inheritanceReceived || 0) + received;
    addLog(p, t("engine.econ.inherited", "親から財産を受け継ぎました。"), { cat: "economy", tone: "neutral" });
  }
  var CHRONIC_COST = { diabetes: 0.025, hypertension: 0.012, hiv: 0.035, tb: 0.025, copd: 0.022, depression: 0.018 };
  function diagnoseCondition(p, key) {
    var conditions = p.chronic || (p.chronic = {});
    if (conditions[key]) return false;
    conditions[key] = { since: p.age, active: true, adherence: 0.5, spent: 0 };
    addLog(p, t("engine.chronic.diagnosed", "{condition}と分かり、治療を続けることになりました。", { condition: t("engine.chronic." + key, key) }), { cat: "health", big: true, tone: "bad" });
    return true;
  }
  function improveTreatment(p, change) {
    Object.keys(p.chronic || {}).forEach(function (key) {
      var condition = p.chronic[key];
      if (condition && condition.active !== false) condition.adherence = clamp((Number(condition.adherence) || 0) + change, 0, 1);
    });
  }
  function chronicYear(p, country) {
    var savedRandom = R;
    R = rng((String(p.id || "person") + ":chronic:" + p.age).split("").reduce(function (seed, letter) { return (Math.imul(seed, 31) + letter.charCodeAt(0)) | 0; }, 17));
    if (p.age >= 35 && !p.chronic?.diabetes && chance(clamp((p.age - 30) / 3000 + (p.stats.h < 45 ? 0.012 : 0), 0, 0.05))) diagnoseCondition(p, "diabetes");
    if (p.age >= 30 && !p.chronic?.hypertension && chance(clamp((p.age - 25) / 2000 + (p.stats.h < 45 ? 0.015 : 0), 0, 0.07))) diagnoseCondition(p, "hypertension");
    if (p.smoker && p.age >= 40 && !p.chronic?.copd && chance(0.012 + (p.age - 40) / 3000)) diagnoseCondition(p, "copd");
    if (p.age >= 15 && p.age <= 70 && !p.chronic?.tb && chance((Number(country.gdp) || 0) < 8000 ? 0.006 : 0.001)) diagnoseCondition(p, "tb");
    if (p.age >= 15 && p.age <= 75 && !p.chronic?.depression && p.stats.hp < 35 && chance(0.025)) diagnoseCondition(p, "depression");
    R = savedRandom;
    Object.keys(p.chronic || {}).forEach(function (key) {
      var condition = p.chronic[key];
      if (!condition || condition.active === false || !CHRONIC_COST[key]) return;
      var cost = Math.max(10, (Number(p.income) || medianIncome(p)) * CHRONIC_COST[key] * (Number(country.oop) || 30) / 30);
      if (p.net + debtLimit(p) >= cost) {
        money(p, t("engine.chronic.treatmentCost", "{condition}の治療費", { condition: t("engine.chronic." + key, key) }), -cost);
        condition.spent = (condition.spent || 0) + cost;
        condition.adherence = clamp((Number(condition.adherence) || 0) + 0.04, 0, 1);
      } else condition.adherence = clamp((Number(condition.adherence) || 0) - 0.18, 0, 1);
      // A bounded score cannot represent unlimited deterioration from several untreated conditions.
      if (condition.adherence < 0.4 && p.stats.h > 15) p.stats.h -= Math.min(2, (p.stats.h - 15) / 2);
      if ((p.age - condition.since) % 3 === 0) addLog(p, t("engine.chronic.followup", "{condition}の治療を続け、今年の費用は約{cost}でした。", { condition: t("engine.chronic." + key, key), cost: english() ? "US$" + Math.round(cost).toLocaleString("en-US") + " PPP" : Math.round(cost * YEN_PER_PPP).toLocaleString("ja-JP") + "円（日本の物価）" }), { cat: "health", tone: condition.adherence >= 0.5 ? "neutral" : "bad" });
      if (key === "tb" && p.age - condition.since >= 2 && condition.adherence >= 0.7) {
        condition.active = false;
        addLog(p, t("engine.chronic.tbRecovered", "結核の治療を終えました。"), { cat: "health", tone: "good" });
      }
    });
  }
  function yearEnd(p) {
    var c = BY[p.iso], e = eraOf(p), s = p.stats;
    if (!p.lifetimeIncomeSources) p.lifetimeIncomeSources = { main: 0, side: 0, remittances: 0, assets: 0, pension: 0, transfers: 0 };
    if (p.job && !p.retired && p.mainIncome != null) p.income = p.mainIncome * (p.lastAnnualIncome > 0 ? p.income / p.lastAnnualIncome : 1);
    p.age += 1; p.t = 0; p.ledger = [];
    var a = p.age;
    (p.choiceFollowups || []).filter(function (memory) { return memory.age < a; }).forEach(function (memory) {
      var years = a - memory.age;
      addLog(p, t(years === 1 ? "engine.stakes.followup_one" : "engine.stakes.followup", years === 1 ? "去年「{choice}」を選びました。その後、{outcome}" : "{years}年前に「{choice}」を選びました。その後、{outcome}", { years: years, choice: memory.choice, outcome: memory.outcome }), { big: true, cat: memory.cat || "society", tone: memory.tone || "neutral" });
    });
    p.choiceFollowups = (p.choiceFollowups || []).filter(function (memory) { return memory.age >= a; });
    if (!p.dream && a >= 8 && a <= 14 && chance(a === 14 ? 1 : 0.22)) {
      var candidates = DREAMS.filter(function (d) { return p.wealth >= 4 || d.minAge < 23 || d.category === "family"; });
      setDream(p, weighted(candidates, function (d) {
        return 1 + (p.temperament === "explore" && d.category === "learn" ? 1.4 : 0) +
          (p.temperament === "social" && d.category === "family" ? 1.4 : 0) +
          (!p.urban && d.key === "farmer_own_land" ? 1.2 : 0);
      }).key);
    }
    addYearFacts(p, p.birthYear + a);
    applyHistory(p, p.birthYear + a);
    violenceAftermath(p);
    if (p.parents.mom.alive && chance(lifeTable(c, "f", p.era, p.birthYear - p.parents.mom.age)[Math.min(115, p.parents.mom.age + a)] * 1.1)) { p.parents.mom.alive = false; p.parents.mom.diedAt = a; s.hp -= 10; inherit(p, p.parents.mom); addLog(p, t("engine.loss.mother", "母が亡くなりました。{name}は{age}歳でした。声を聞けない朝が続きました。", { name: p.parents.mom.name, age: p.parents.mom.age + a }), dataRef({ big: true, tone: "bad", historyType: "parent_death", people: [p.parents.mom.given], personId: p.parents.mom.name }, "WHO life tables", "annual_mortality", "{age}歳の年間死亡確率は生命表で約{rate}％です。", { age: p.parents.mom.age + a, rate: pct(lifeTable(c, "f", p.era, p.birthYear - p.parents.mom.age)[Math.min(115, p.parents.mom.age + a)] * 100) })); }
    if (p.parents.dad.alive && chance(lifeTable(c, "m", p.era, p.birthYear - p.parents.dad.age)[Math.min(115, p.parents.dad.age + a)] * 1.1)) { p.parents.dad.alive = false; p.parents.dad.diedAt = a; s.hp -= 10; inherit(p, p.parents.dad); addLog(p, t("engine.loss.father", "父が亡くなりました。{name}は{age}歳でした。いつもの場所に姿がなくなりました。", { name: p.parents.dad.name, age: p.parents.dad.age + a }), dataRef({ big: true, tone: "bad", historyType: "parent_death", people: [p.parents.dad.given], personId: p.parents.dad.name }, "WHO life tables", "annual_mortality", "{age}歳の年間死亡確率は生命表で約{rate}％です。", { age: p.parents.dad.age + a, rate: pct(lifeTable(c, "m", p.era, p.birthYear - p.parents.dad.age)[Math.min(115, p.parents.dad.age + a)] * 100) })); }

    // 年齢ごとの段階
    if (a <= 5) {
      if (chance(0.5)) smallEvent(p, c, "child");
      if (p.wealth <= 2 && c.gdp < 6000 && a === 3 && chance(0.35)) { s.h -= 5; addLog(p, "食べものが足りず、年齢に比べて小柄に育ちました。", dataRef({ tone: "bad" }, "FAO", "undernourishment", "この国で栄養不足の人は{rate}％です。", { rate: pct(c.undernourish) })); }
      if (chance(personStats(p, c, p.sex, p.birthYear + a).u5 / 30)) { s.h -= 6; addLog(p, pick(["高い熱が何日も続きました。", "ひどい下痢になり、家族が夜通し看病しました。", "肺炎になり、診療所で診てもらいました。", "体調を崩し、いつもより長く寝て過ごしました。"]), dataRef({ tone: "bad" }, "UN IGME", "under_five", "この国では、5歳までに亡くなる子どもは約{oneIn}人に1人です。", { oneIn: Math.max(2, Math.round(100 / Math.max(0.01, personStats(p, c, p.sex, p.birthYear + a).u5))) })); }
      if (a === 2) p.pending = "toy";
      if (a === 5) {
        if (!p.temperament) p.temperament = pick(TEMPERAMENTS).k;
        var tl = TEMPERAMENTS.filter(function (t) { return t.k === p.temperament; })[0].label;
        addLog(p, "5歳になるころ、まわりの大人は" + p.given + "のことを「" + tl + "」と話すようになりました。");
        addLog(p, "5歳の誕生日を迎えました。生まれた年の" + c.name + "の5歳未満死亡率は" + personStats(p, c, p.sex, p.birthYear).u5.toFixed(1) + "％でした。", dataRef({}, "UN IGME", "under_five_rate", "この国の5歳未満死亡率は{rate}％です。", { rate: pct(personStats(p, c, p.sex, p.birthYear).u5) }));
      }
    } else if (a === 6) {
      var pEnroll = hasNumber(c, "out_school") ? 1 - clamp(percentage(c, "out_school", 0) * clamp(1 + (3 - p.wealth) * 0.25 + ((p.registered === false ? 1 : 0) - (1 - percentage(c, "birth_reg", 1))) * 0.25, 0.25, 1.75), 0, 0.99) : clamp(c.school / 14 + (p.wealth - 3) * 0.1 + (p.urban ? 0.06 : -0.08), 0.15, 0.995);
      p.outSchoolAt6 = !chance(pEnroll);
      if (!p.outSchoolAt6) { p.edu = { level: "none", stage: "primary" }; addLog(p, "小学校に通いはじめました。", dataRef({ big: true, tone: "good", historyType: "school_start", level: "primary", outcome: "enrolled" }, "UNESCO UIS", "out_of_school", "この国の小学校年齢の不就学率は{rate}％です。", { rate: pct(c.out_school) })); }
      else { p.edu = { level: "none", stage: "none" }; addLog(p, "学校には通えず、家の仕事を手伝うことになりました。", dataRef({ big: true, tone: "bad" }, "UNESCO UIS", "out_of_school", "この国の小学校年齢の不就学率は{rate}％です。", { rate: pct(c.out_school) })); if (p.wealth <= 3) p.pending = "school"; }
    } else {
      var st = p.edu.stage;
       if (st === "primary") { if (p.schoolInterruptedYear !== p.birthYear + a) s.k += 3; if (a >= 12 && p.schoolInterruptedYear !== p.birthYear + a) { var primaryPass = !hasNumber(c, "prim_compl") || chance(clamp(percentage(c, "prim_compl", 1) / Math.max(0.05, 1 - percentage(c, "out_school", 0)) + (p.wealth - 3) * 0.025, 0, 1)); if (primaryPass) { finishSchool(p, "primary"); p.edu.stage = "pmid"; } else { p.edu.stage = "done"; addLog(p, t("engine.course.primary_unfinished", "何年も通いましたが、初等教育を修了できませんでした。次の学校への道が閉じました。"), dataRef({ cat: "learn", tone: "bad" }, "World Bank WDI", "primary_completion", "この国の初等教育修了率は{rate}％です。", { rate: pct(c.prim_compl) })); } } else if (chance(0.25)) { var schoolLine = smallLine(p, "student"); if (schoolLine) addLog(p, schoolLine); } }
      if (st === "pmid") {
        var pSec = hasNumber(c, "lsec_compl") ? clamp(percentage(c, "lsec_compl", 0) / Math.max(0.05, percentage(c, "prim_compl", 1)) + (p.wealth - 3) * 0.025 - ((p.registered === false ? 1 : 0) - (1 - percentage(c, "birth_reg", 1))) * 0.07, 0, 1) : clamp(c.school / 15 + (p.wealth - 3) * 0.10 + (s.k - 50) / 120 + (p.urban ? 0.05 : -0.06), 0.05, 0.98);
        if (chance(pSec)) { p.edu.stage = "secondary"; addLog(p, "中等教育に進みました。", hasNumber(c, "lsec_compl") ? dataRef({ tone: "good", historyType: "school_start", level: "secondary", outcome: "enrolled" }, "World Bank WDI", "secondary_completion", "この国の前期中等教育修了率は{rate}％です。", { rate: pct(c.lsec_compl) }) : { tone: "good", historyType: "school_start", level: "secondary", outcome: "enrolled" }); } else { p.edu.stage = "done"; }
       } else if (st === "secondary") { if (p.schoolInterruptedYear !== p.birthYear + a) s.k += 2.5; if (a >= 18 && p.schoolInterruptedYear !== p.birthYear + a) { p.edu.level = "secondary"; if (chance(clamp((c.tert / 100) / (clamp(c.school / 14, 0.25, 1) * 0.82) + (p.wealth - 3) * 0.04, 0.03, 0.99))) p.pending = "university"; else finishSchool(p, "secondary"); } else if (chance(0.2)) { var studentLine = smallLine(p, "student"); if (studentLine) addLog(p, studentLine); } }
       else if (st === "univ") { if (p.schoolInterruptedYear !== p.birthYear + a) s.k += 3; if (a >= 22 && p.schoolInterruptedYear !== p.birthYear + a) finishSchool(p, "univ"); }
      else if (st === "none" && a <= 9 && chance(0.4)) addLog(p, pick(["畑仕事を手伝いました。", "年下の子の世話を手伝いました。", "市場で品物を運ぶ手伝いをしました。", "家で食事の支度を手伝いました。"]));
    }
    if (p.dream && !p.dreamAchieved && a >= 8 && a <= 65) {
      var activity = (p.focus === "learn" ? 1.4 : 0.65) + (p.edu.stage === "secondary" || p.edu.stage === "univ" ? 0.9 : 0) +
        (p.wealth >= 4 ? 0.8 : 0) + (p.temperament === "grit" ? 0.5 : 0);
      if (p.stats.h < 35) activity *= 0.5;
      if (p.schoolInterruptedYear === p.birthYear + a) activity *= 0.4;
      advanceDream(p, activity);
      if (p.auto && a <= 38 && chance(p.wealth <= 2 ? 0.08 : 0.25)) {
        var eligible = choiceOptions(p).filter(function (o) { return !o.blockedReason && o.cost < Math.max(150, p.income * 0.2) && CHOICE_BY[o.key].cat === DREAM_BY[p.dream].category; });
        if (eligible.length) tryChoice(p, pick(eligible).key);
      }
    }

    // 仕事
    var studying = p.edu.stage === "primary" || p.edu.stage === "secondary" || p.edu.stage === "univ";
    var serviceAge = hasNumber(c, "conscription_age_" + p.sex) ?
      clamp(c["conscription_age_" + p.sex], 16, 30) : 18;
    if (!p.pending && a >= serviceAge && a <= serviceAge + 2 &&
        c["conscription_" + p.sex] === true && !p.conscriptionDecided) p.pending = "conscription";
    if (!p.job && !p.retired && !studying && a >= 14 && !p.pending) {
      if (a >= 15 || p.wealth <= 2) p.pending = "firstJob";
    }
    if (p.job && !p.retired) {
      p.jobYears++;
      var raise = 1 + (p.partTime ? 0.002 : p.focus === "work" ? 0.02 : 0.005) + (s.k - 50) / 6000;
      p.income *= raise * (a > 55 ? 0.99 : 1);
      if ((hasNumber(c, "informal") && p.informal) || p.vulnerableWork || (hasNumber(c, "self_emp") && p.selfEmployed)) p.income *= clamp(1 + gauss() * (p.vulnerableWork ? 0.09 : p.selfEmployed ? 0.07 : 0.05), 0.6, 1.35);
      if (p.era !== "now") {
        var oldGdp = seriesValue(c, "gdp", p.birthYear + a - 1);
        var newGdp = seriesValue(c, "gdp", p.birthYear + a);
        if (oldGdp > 0 && newGdp > 0) p.income *= newGdp / oldGdp;
      }
      if (!p.pending && p.jobYears >= 3 && p.offered < 3 && chance((p.partTime ? 0.025 : 0.07) + (p.focus === "learn" ? 0.07 : 0))) { p.pending = "jobOffer"; p.offered++; }
      if (!p.pending && a >= retirementAge(p, c) && !(p.seenDecisions || {}).retire) p.pending = "retire";
    }
    if (a >= retirementAge(p, c) && !p.job && !p.retired) p.income = Math.max(p.income, medianIncome(p) * 0.25);
    if (a === retirementAge(p, c) && hasNumber(c, "pension_cov")) {
      if (!p.retired) p.pension = chance(pensionProbability(p, c)) ? Math.max(1, p.income * 0.42) : 0;
      p.pensionAssessed = true;
      if (!p.pension) addLog(p, t("engine.course.no_pension", "高齢期を支える公的な給付は受けられず、家計をやりくりしました。"), dataRef({ cat: "economy", tone: "bad" }, "ILOSTAT", "pension_coverage", "この国で年金などの高齢期給付を受ける人は{rate}％です。", { rate: pct(c.pension_cov) }));
      else if (!p.retired) addLog(p, t("engine.course.pension", "高齢期の給付を受け始めました。"), dataRef({ cat: "economy", tone: "good" }, "ILOSTAT", "pension_coverage", "この国で年金などの高齢期給付を受ける人は{rate}％です。", { rate: pct(c.pension_cov) }));
    }
    // 家庭
    if (!p.pending && p.rel === "single" && (eraMarriageAge(p, c) !== null ? a >= 16 && a <= 55 : a >= 18 && a <= 45) && chance(marriageChance(p, c, a))) p.pending = "marry";
    if (p.sex === "f" && a >= 15 && a < 20 && hasNumber(c, "adol_fert") && p.firstBirthAge == null && chance(clamp(c.adol_fert / 1000, 0, 0.2))) newKid(p);
    if (p.ended) return;
    if (!p.pending && p.rel === "married" && p.spouse && p.spouse.sex !== p.sex && a >= (hasNumber(c, "adol_fert") ? 20 : 18) && a <= (p.sex === "f" ? 43 : 53) &&
        (p.familyTarget == null ? p.kids.length < Math.round(c.tfr + 1.5) && chance(Math.min(0.95, c.tfr / 5.5 * clamp(c.tfr / 2, 0.7, 1.05))) : p.kids.length < p.familyTarget && (p.lastChildAge == null || a - p.lastChildAge >= (hasNumber(c, "contracept") ? 2 + Math.round(c.contracept / 100 * 2) : 2)) && chance(0.8))) p.pending = "child";
    if (!p.pending && a >= 8 && p.pets.length < 2 && chance(0.02)) p.pending = "pet";
    if (!p.eduMode && !p.pending && p.job && a >= 19 && a <= 60 && chance(0.025)) p.pending = "gamble";
    if (!p.pending && p.job && !p.moved && a >= 19 && a <= 40 && c.gdp < 30000 &&
        chance(0.025 + (numberField(c, "remit") ? clamp(c.remit / 500, 0, 0.06) : 0))) p.pending = "move";
    if (!p.eduMode && !p.pending && p.job && a >= 25 && s.hp < 45 && !p.drink && chance(0.06)) p.pending = "drink";
    if (!p.pending && a >= 35 && !p.cared && (p.parents.mom.alive || p.parents.dad.alive) && (p.parents.mom.age + a > 72 || p.parents.dad.age + a > 72) && chance(0.15)) p.pending = "care";
    // 一度きりの選択は年齢と事情に応じて現れる。
    if (!p.seenDecisions) p.seenDecisions = {};
    var room = p.decisionCount < (a < 58 ? 20 : 24);
    if (!p.pending && room && !p.seenDecisions.partTime && (p.job || p.edu.stage === "univ") && a >= 18 && a <= 64 &&
        (studying || p.kids.some(function (k) { return k.alive && a - k.born < 8; }) || p.cared || s.h < 45 || a >= 55) &&
        chance(clamp(0.05 + Number(c.informal || 0) / 1000 + (p.sex === "f" ? (100 - Number(c.flfp || 50)) / 1000 : 0), 0.03, 0.25))) p.pending = "partTime";
    if (!p.pending && room && p.sex === "f" && p.rel === "single" && a >= 13 && a <= 17 && Number(c.cm) > 0 && chance(clamp(c.cm / 250, 0, 0.28))) p.pending = "earlyMarriage";
    if (!p.pending && room && a >= 17 && a <= 24 && p.edu.stage === "secondary" && !p.seenDecisions.scholarship && chance(0.08)) p.pending = "scholarship";
    if (!p.pending && room && a >= 20 && a <= 58 && p.job && !p.seenDecisions.business && chance(0.055)) p.pending = "business";
    if (!p.pending && room && a >= 23 && a <= 65 && p.job && !p.seenDecisions.home && chance(0.045)) p.pending = "home";
    if (!p.pending && room && a >= 20 && a <= 65 && p.edu.level !== "univ" && !p.seenDecisions.nightSchool && chance(0.04)) p.pending = "nightSchool";
    if (!p.pending && room && a >= 19 && a <= 70 && !p.seenDecisions.loan && chance(0.035)) p.pending = "loan";
    if (!p.pending && room && a >= 28 && a <= 72 && !p.seenDecisions.community && chance(0.035)) p.pending = "community";
    if (!p.pending && room && a >= 18 && a <= 75 && s.h < 58 && !p.seenDecisions.treatment && chance(0.075 + (Number(c.oop) || 0) / 1000)) p.pending = "treatment";
    if (!p.pending && room && a >= 14 && a <= 75 && !p.seenDecisions.evacuation && chance(0.035)) p.pending = "evacuation";
    if (!p.pending && room && p.kids.some(function (k) { return k.alive && a - k.born >= 14 && a - k.born <= 20; }) && !p.seenDecisions.childSchool && chance(0.12)) p.pending = "childSchool";
    if (!p.eduMode && !p.pending && room && p.smoker && a >= 25 && !p.seenDecisions.quitSmoking && chance(0.12)) p.pending = "quitSmoking";
    if (!p.pending && room && p.abroad && a >= 30 && !p.seenDecisions.returnHome && chance(0.08)) p.pending = "returnHome";
    if (!p.pending && p.decisionCount < 24 && a >= 68 && !p.elderChoice && !p.seenDecisions.elderHome && chance(0.18)) p.pending = "elderHome";
    if (p.pending && DECISIONS[p.pending]) p.seenDecisions[p.pending] = true;
    if (p.spouse && p.spouse.alive) {
      var sa = p.age + p.spouse.d;
      if (chance(lifeTable(c, p.spouse.sex, p.era, p.birthYear - p.spouse.d)[Math.min(115, sa)])) { p.spouse.alive = false; p.spouse.diedAt = a; p.rel = "widowed"; s.hp -= 18; addLog(p, t("engine.loss.spouse", "伴侶の{name}が先に旅立ちました。{age}歳で亡くなり、二人分の食卓を片づける日が続きました。", { name: p.spouse.given, age: sa }), dataRef({ big: true, tone: "bad", historyType: "spouse_death", people: [p.spouse.given], causeId: (lastHistory(p, "spouse_marriage") || {}).id }, "WHO life tables", "annual_mortality", "{age}歳の年間死亡確率は生命表で約{rate}％です。", { age: sa, rate: pct(lifeTable(c, p.spouse.sex, p.era, p.birthYear - p.spouse.d)[Math.min(115, sa)] * 100) })); }
    }
    p.kids.forEach(function (k) {
      var ka = a - k.born;
      if (!k.alive) return;
      if (ka < 5 && chance(personStats(p, c, k.sex, p.birthYear + k.born + ka).u5 / 100 / 5)) { k.alive = false; s.hp -= 25; addLog(p, t("engine.loss.child", "子の{name}が幼くして亡くなりました。{age}歳でした。小さな服をしまえないまま、季節が変わりました。", { name: k.given, age: ka }), dataRef({ big: true, tone: "bad", historyType: "child_death", people: [k.given], personId: k.id, causeId: (lastHistory(p, "child_birth", k.id) || {}).id }, "UN IGME", "under_five", "この国では、5歳までに亡くなる子どもは約{oneIn}人に1人です。", { oneIn: Math.max(2, Math.round(100 / Math.max(0.01, personStats(p, c, k.sex, p.birthYear + k.born + ka).u5))) })); return; }
      if (k.health === "ill" && a > k.illAt) { k.health = "well"; addLog(p, t("engine.history.child_recovered", "{name}の体調が戻り、また日々の暮らしを始めました。", { name: k.given }), { cat: "family", tone: "good", historyType: "child_recovered", people: [k.given], personId: k.id, causeId: (lastHistory(p, "child_illness", k.id) || {}).id }); }
      if (ka >= 2 && ka <= 15 && k.health === "well" && !lastHistory(p, "child_illness", k.id) && stableChance(p, k.id + ":ill", a, 0.025)) { k.health = "ill"; k.illAt = a; money(p, t("engine.history.child_care_cost", "{name}の治療", { name: k.given }), -Math.max(20, p.income * 0.03)); addLog(p, t("engine.history.child_illness", "{name}が病気になり、家族で治療と看病を続けました。", { name: k.given }), { cat: "family", tone: "bad", historyType: "child_illness", people: [k.given], personId: k.id, causeId: (lastHistory(p, "child_birth", k.id) || {}).id }); }
      if (ka >= 6 && ka <= 9 && k.schoolStatus === "not_started" && (ka === 6 ? chance(0.6) : stableChance(p, k.id + ":school", a, 0.6)) && k.health !== "ill") { k.schoolStatus = "enrolled"; addLog(p, t("engine.history.child_school", "{name}が学校に通いはじめました。", { name: k.given }), { cat: "learn", tone: "good", historyType: "child_school", people: [k.given], personId: k.id, causeId: (lastHistory(p, "child_birth", k.id) || {}).id }); }
      if (ka === 22 && k.educationSupport) { k.educationOutcome = "continued"; addLog(p, t("engine.history.child_education_result", "進学を支えると、{name}はその後も学び続けました。", { name: k.given }), { cat: "learn", tone: "good", historyType: "child_education_result", people: [k.given], personId: k.id, causeId: (lastHistory(p, "child_education", k.id) || {}).id }); }
      if (ka >= 19 && !k.married && chance(0.12)) { k.married = true; addLog(p, t("engine.history.child_marriage", "{name}が結婚し、新しい家庭を持ちました。", { name: k.given }), { cat: "family", tone: "good", historyType: "child_marriage", people: [k.given], personId: k.id, causeId: (lastHistory(p, "child_school", k.id) || lastHistory(p, "child_birth", k.id) || {}).id }); }
      if (k.married && ka >= 22 && chance(c.tfr / 10)) { p.grand++;
        var grandText = t("engine.history.grandchild", "{name}に子どもが生まれ、孫が{count}人になりました。", { name: k.given, count: p.grand });
        addLog(p, grandText, { big: p.grand === 1, cat: "family", tone: "good" });
        historyEvent(p, "grandchild_birth", { people: [k.given], outcome: "born", text: grandText, tone: "good",
          causeId: (lastHistory(p, "child_marriage", k.id) || {}).id }); }
    });
    if (p.kids.length && chance(0.2)) { var kk = pick(p.kids.filter(function (k) { return k.alive; }).concat([null])); if (kk) addLog(p, pick([kk.given + "と、これからのことを夜遅くまで語り合いました。", kk.given + "が新しく覚えたことを話してくれました。", kk.given + "のことで学校に呼ばれ、帰り道に長く話しました。", kk.given + "と買い物に出かけました。"])); }

    // 世の中と体
    if (a >= 16 && chance(0.06)) { if (p.job) p.income *= 0.9; p.swings++; addLog(p, "景気が悪くなり、仕事が減りました。", { tone: "bad" }); }
    if (chance(0.03)) { var d = pick(c.dis); p.disasterYear = p.birthYear + a; s.hp -= 5; if (p.job) money(p, d + "の被害", -p.income * 0.15); p.swings++; addLog(p, d + "に見舞われ、" + (p.gentle ? "暮らしが乱れました。" : "家や持ちものに被害が出ました。"), { tone: "bad" }); }
    countryCourseEvents(p, c, p.birthYear + a);
    scriptEvent(p, c);
    if (a >= 18) {
      var moneyEvents = moneyEventOptions(p).filter(function (entry) { return entry.available; });
      var moneyEventRate = moneyEvents.reduce(function (sum, entry) { return sum + entry.annualProbability; }, 0);
      if (moneyEvents.length && chance(Math.min(0.25, moneyEventRate))) {
        var moneyEvent = weighted(moneyEvents, function (entry) { return entry.annualProbability; });
        triggerMoneyEvent(p, moneyEvent.key);
      }
    }
    if (a >= 20 && chance(0.05 + Math.max(0, 50 - s.h) / 300)) { s.h -= 5; addLog(p, pick(["インフルエンザで寝込みました。", "腰を痛めて、しばらく仕事を休みました。", "健康診断で、血圧が高いと言われました。", "体調を崩し、家で休む日が続きました。"]), { tone: "bad" }); }
    var smokingRate = Number(p.sex === "m" ? c.smk_m : c.smk_f) || 0;
    if (!p.eduMode && !p.everSmoked && a >= 18 && a <= 35 && chance(smokingRate / 1000)) { p.smoker = true; p.everSmoked = true; addLog(p, "周りの人に誘われ、たばこを吸い始めました。", { tone: "bad" }); }
    if (p.smoker && a >= 35 && chance(0.015 + smokingRate / 2500)) { s.h -= 3; addLog(p, "せきが長引き、診療所で肺の具合を診てもらいました。", { tone: "bad" }); }
    if (a >= 10 && a <= 75 && chance((Number(c.road) || 0) / 2500)) { s.h -= 2; addLog(p, "道での事故に巻き込まれ、しばらく通院しました。", dataRef({ tone: "bad" }, "WHO", "road_deaths", "この国の交通事故死は人口10万人あたり{rate}人です。", { rate: pct(c.road) })); }
    if (a >= 18 && a <= 65 && chance((Number(c.hiv) || 0) / 1500) && !((p.chronic || {}).hiv)) { s.h -= 3; diagnoseCondition(p, "hiv"); }
    chronicYear(p, c);
    violenceEvent(p, residenceCountry(p), p.birthYear + a, violenceRandom(p, p.birthYear + a));
    if (p.business && a >= 20 && !p.retired && chance(0.22)) { var gain = p.income * (chance(0.7) ? 0.04 : -0.05); money(p, "小さな商売の収支", gain); addLog(p, gain >= 0 ? "商売の売上が少し伸びました。" : "商売の売上が落ち、やりくりを考えました。", { tone: gain >= 0 ? "good" : "bad" }); }
    if (!p.hobby && a >= 10 && chance(0.1)) {
      var hobbyCulture = cultureOf(c);
      var localSport = hobbyCulture && hobbyCulture.sports && hobbyCulture.sports.length && chance(0.65);
      p.hobby = localSport ? pick(english() ? window.I18N.cultureOf(hobbyCulture).sports : hobbyCulture.sports) : pick(HOBBIES);
      addLog(p, english() ? t("engine.hobby.started", "", { hobby: p.hobby }) : p.hobby + "が好きになりました。", { culture: !!localSport, cat: localSport ? "learn" : "family", tone: "good" });
    }
    if (a > 5 && a < 18 && chance(0.25)) smallEvent(p, c, "student");
    else if (a >= 18 && a < 65 && chance(0.35)) smallEvent(p, c, "adult");
    else if (a >= 65 && chance(0.4)) smallEvent(p, c, "old");
    var situations = [p.urban ? "urban" : "rural"];
    if (p.wealth <= 2) situations.push("poor");
    if (p.wealth >= 4) situations.push("rich");
    if (p.kids.length && a >= 20) situations.push("kids");
    if (p.retired) situations.push("retired");
    if (p.abroad) situations.push("abroad");
    if (p.rel === "widowed") situations.push("widowed");
    if (a >= 6 && chance(0.28)) smallEvent(p, c, pick(situations));
    everydayMoment(p, c);
    var th = THEMES.filter(function (t) { return t.name === p.theme; })[0];
    if (th && p.themeHits.length < 3 && th.hit(p, c) && chance(0.6)) { p.themeHits.push({ a: a, t: th.text }); addLog(p, th.text, { tag: th.name, src: ["UNESCO", "WHO/UNICEF", "IOM"][THEMES.indexOf(th)], stat: th.fact }); }

    // 重点
    if (a >= 6) {
      if (p.auto && !p.focusManual) p.focus = autoFocus(p);
      p.focusYears[p.focus] = (p.focusYears[p.focus] || 0) + 1;
    }
    var f = p.focus;
    if (f === "work") { s.r -= 1.5; s.h -= 0.8; s.hp -= 0.5; if (studying) s.k += 2.5; }
    if (f === "family") { s.r += 2; s.hp += 1.2; }
    if (f === "health") { s.h += 1.6; if (p.job) money(p, "体のための出費", -p.income * 0.03); }
    if (f === "learn") { s.k += 1.8; }
    if (f === "hobby") { s.hp += 1.8; if (!p.hobby) { var favored = cultureOf(c); p.hobby = favored && favored.sports && favored.sports.length ? pick(english() ? window.I18N.cultureOf(favored).sports : favored.sports) : pick(HOBBIES); } p.spent++; }
    if (f === "balance") { s.hp += 0.4; s.r += 0.4; s.h += 0.3; }
    // 年齢と暮らしに応じた水準へゆっくり戻る。
    var healthBaseline = clamp(76 - Math.max(0, a - 40) * 0.68 + (p.wealth - 3) * 3, 25, 86);
    s.h += (healthBaseline - s.h) * 0.14;
    if (p.drink) s.h -= 1.2;
    if (s.h < 28 && availableMoney(p) > Math.max(30, p.income * 0.025)) {
      var treatmentCost = Math.max(30, p.income * 0.025);
      money(p, "診療所での治療", -treatmentCost);
      s.h += 11;
      addLog(p, "体調が悪化したため診療所に通い、少し回復しました。", { cat: "health", tone: "good" });
    }
    s.hp += (55 + (p.wealth - 3) * 3 + ((p.rel === "married" || p.rel === "partnered") ? 4 : 0) - s.hp) * 0.12;
    s.r += (50 - s.r) * 0.03;
    if (a > 25) s.k -= 0.2;
    ["h", "hp", "k", "r"].forEach(function (k) { s[k] = clamp(s[k], k === "h" ? 5 : 1, 100); });

    // お金（PPPドル、年単位）。仕事の変化は自動的に起こり、収入源として記録する。
    annualWorkIncome(p, c, a);
    annualIncomeSources(p, c, a);
    if (p.auto && !p.lifestyleManual) {
      var incomeRatio = p.income / Math.max(1, medianIncome(p));
      p.lifestyle = incomeRatio < 0.8 ? "frugal" : incomeRatio < 2 ? "normal" : incomeRatio < 5 ? "comfortable" : "luxury";
    }
    var lifestyleEffect = LIFESTYLES.filter(function (x) { return x.key === p.lifestyle; })[0];
    if (lifestyleEffect) { s.hp = clamp(s.hp + lifestyleEffect.happiness, 1, 100); s.h = clamp(s.h + lifestyleEffect.health, 5, 100); }
    p.budget = budgetOf(p);
    var outstanding = Math.max(p.loanDebt || 0, -p.net, 0);
    if (p.job && !p.retired) {
      var keep = p.budget[7].amount + p.income * (f === "work" ? 0.015 : f === "hobby" ? -0.015 : 0);
      money(p, "稼ぎから残したお金", keep);
      if (keep > 0) p.saved++;
    }
    if (p.auto && a >= 18 && p.wealth >= 3 && availableMoney(p) > Math.max(200, p.income * 0.45)) {
      var reserve = Math.max(100, p.income * 0.3), investable = Math.min(availableMoney(p) - reserve, Math.max(100, p.income * 0.08));
      var target = p.wealth >= 4 && assetClasses(p).some(function (x) { return x.key === "stocks" && x.available; }) ? "stocks" : "deposits";
      invest(p, target, investable);
    }
    if (a >= 70 && p.kids.some(function (k) { return k.alive && a - k.born >= 18; }) && (p.net < 0 || p.income < medianIncome(p) * 0.4) && chance(0.55)) {
      money(p, t("engine.money.children_support", "子どもからの仕送り"), medianIncome(p) * 0.08);
      var helpingChild = p.kids.filter(function (kid) { return kid.alive && a - kid.born >= 18; })[0];
      if (!lastHistory(p, "child_support", helpingChild.id)) addLog(p, t("engine.history.child_support", "{name}が暮らしを支えてくれました。", { name: helpingChild.given }), { cat: "family", tone: "good", historyType: "child_support", people: [helpingChild.given], personId: helpingChild.id,
        causeId: (lastHistory(p, "child_education_result", helpingChild.id) || lastHistory(p, "child_school", helpingChild.id) || lastHistory(p, "child_birth", helpingChild.id) || {}).id });
    }
    if (outstanding > 0 && p.kids.some(function (k) { return k.alive && a - k.born >= 18; }) && chance(0.11)) {
      var familyAid = Math.min(outstanding * 0.25, Math.max(p.income, medianIncome(p)) * 0.12);
      money(p, "家族と分担した返済", familyAid);
      p.loanDebt = Math.max(0, p.loanDebt - familyAid);
      reduceDebtAccounts(p, familyAid);
      addLog(p, "子どもと相談し、借入の一部を返しました。", { cat: "economy", tone: "good" });
    }
    if (outstanding > Math.max(p.income, medianIncome(p)) * 1.5) {
      var saleKey = ["newCar", "usedCar", "cattle", "goats", "motorbike", "bike"].filter(function (key) { return (p.items || []).indexOf(key) >= 0; })[0];
      if (saleKey && chance(0.5)) {
        var saleItem = ITEMS.filter(function (item) { return item.key === saleKey; })[0];
        p.items.splice(p.items.indexOf(saleKey), 1);
        var seizedValue = saleItem.price * 0.55;
        money(p, t("engine.econ.seizure_value", "差し押さえた資産価値"), seizedValue);
        p.loanDebt = Math.max(0, (p.loanDebt || 0) - seizedValue);
        reduceDebtAccounts(p, seizedValue);
        addLog(p, t("engine.debt.seizure", "返済が滞り、{item}を差し押さえられました。", { item: saleItem.label }), { cat: "economy", tone: "bad" });
      }
    }
    (p.items || []).slice().forEach(function (key) {
      var item = ITEMS.filter(function (x) { return x.key === key; })[0];
      if (item && item.upkeep && money(p, item.label + "の維持費", -item.upkeep) > -item.upkeep) {
        p.items.splice(p.items.indexOf(key), 1);
        if (key === "home") p.house = false;
        addLog(p, item.label + "の維持費を払えず、手放しました。", { cat: "economy", tone: "bad" });
      }
    });
    var capitalIncome = 0, crisis = p.crisisYear === p.birthYear + a ||
      (p.era === "past" && [1973, 1982, 1997, 2008, 2009, 2020].indexOf(p.birthYear + a) >= 0);
    if (p.investments) Object.keys(p.investments).forEach(function (key) {
      var principal = p.investments[key];
      if (principal <= 0) return;
      // Central real returns and annual volatility mirror data/econ_assumptions.json.
      var rate = ["deposits", "savings", "fixedDeposit", "mobileWallet", "rotatingSavings", "educationFund", "healthFund"].indexOf(key) >= 0 ? depositRealRate(c, p.birthYear + a) :
        ["bonds", "governmentBond", "treasuryBills"].indexOf(key) >= 0 ? 0.02 + 0.08 * gauss() :
        ["stocks", "index"].indexOf(key) >= 0 ? 0.06 + 0.20 * gauss() :
        ["gold", "goldJewellery"].indexOf(key) >= 0 ? 0.025 + 0.15 * gauss() :
        ["realEstate", "farmland", "rentalProperty"].indexOf(key) >= 0 ? 0.05 + 0.10 * gauss() :
        key === "crypto" ? 0.03 + 0.62 * gauss() :
        key === "speculativeLand" ? 0.06 + 0.34 * gauss() :
        key === "foreignCurrency" ? 0.01 + 0.14 * gauss() :
        key === "retirement" ? 0.035 + 0.09 * gauss() : 0.055 + 0.22 * gauss();
      if (crisis && ["stocks", "index", "realEstate", "business", "shop", "speculativeLand", "crypto"].indexOf(key) >= 0) rate -= key === "realEstate" ? 0.14 : 0.3;
      rate = clamp(rate, key === "crypto" ? -0.85 : -0.7, key === "crypto" ? 1.4 : 0.8);
      var gain = principal * rate;
      p.investments[key] = Math.max(0, principal + gain);
      var investmentName = INVESTMENTS.filter(function (x) { return x.key === key; })[0];
      money(p, (investmentName ? investmentName.label : key) + "の運用", gain);
      capitalIncome += gain;
    });
    outstanding = Math.max(p.loanDebt || 0, -p.net, 0);
    if (outstanding > 0) {
      var accounts = p.debtAccounts || {}, typed = 0, interest = 0;
      Object.keys(accounts).forEach(function (key) { typed += accounts[key].balance; interest += accounts[key].balance * accounts[key].rate; });
      var legacy = Math.max(0, outstanding - typed);
      interest += legacy * (p.informal ? 0.18 : clamp(Number(c.lend_rate || 9) / 100, 0.03, 0.3));
      money(p, "借入の利息", -interest);
      var repayment = Math.min(Math.max(p.loanDebt || 0, -p.net, 0), Math.max(0, p.income) * (p.informal ? 0.18 : 0.24));
      if (repayment > 0) {
        money(p, t("engine.money.loan_repayment", "稼ぎから返したお金"), repayment);
        p.loanDebt = Math.max(0, (p.loanDebt || 0) - repayment);
        reduceDebtAccounts(p, repayment);
      }
      outstanding = Math.max(p.loanDebt || 0, -p.net, 0);
    } else if (availableMoney(p) > 0) {
      var cashGain = availableMoney(p) * depositRealRate(c, p.birthYear + a);
      money(p, "手元のお金の利子", cashGain); capitalIncome += cashGain;
    }
    if (p.investments && Number(p.investments.rentalProperty) > 0) {
      var rent = p.investments.rentalProperty * clamp(0.035 + gauss() * 0.012, 0, 0.08);
      money(p, window.I18N && window.I18N.t ? window.I18N.t("engine.income.rentLabel") : "家賃収入", rent); capitalIncome += rent;
      if (rent > 0) incomeLine(p, "rent", "good");
    }
    if (capitalIncome > Math.max(25, medianIncome(p) * 0.01)) incomeLine(p, "dividendInterest", "good");
    var excessDebt = Math.max(0, -debtLimit(p) - p.net, (p.loanDebt || 0) - debtLimit(p));
    if (excessDebt > 0) {
      var over = excessDebt / Math.max(1, medianIncome(p));
      if (p.house || (p.investments && p.investments.realEstate)) {
        var property = Math.min(excessDebt, (p.investments && p.investments.realEstate) || 0);
        if (p.investments) p.investments.realEstate = Math.max(0, (p.investments.realEstate || 0) - property);
        p.house = false; p.items = (p.items || []).filter(function (item) { return item !== "home"; });
        p.loanDebt = Math.max(0, p.loanDebt - property);
        reduceDebtAccounts(p, property);
        addLog(p, t("engine.debt.eviction", "担保の家や土地を失い、住まいを移しました。"), { cat: "economy", tone: "bad" });
      }
      if (over > 0.5) {
        if (over > 2 && a % 3 === 0) p.stats.h -= 1;
        p.stats.hp -= 2; p.stats.r -= 1;
        if (p.stats.h < 35) addLog(p, t("engine.debt.illness", "医療費を用意できず、治療を先延ばしにしました。"), { cat: "health", tone: "bad" });
        if (over > 1.5 && p.job && chance(0.1)) { var lostPay = p.incomeSources.main * 0.2; p.income -= lostPay; p.incomeSources.main -= lostPay; p.mainIncome -= lostPay; addLog(p, t("engine.debt.work", "返済のため、手取りの少ない仕事を続けました。"), { cat: "work", tone: "bad" }); }
        if (over > 1 && chance(0.12)) addLog(p, t("engine.debt.family", "借入の返済をめぐり、家族との関係が難しくなりました。"), { cat: "family", tone: "bad" });
        if (p.kids.some(function (k) { return k.alive && a - k.born >= 8 && a - k.born < 18; }) && chance(0.3)) {
          p.schoolInterruptedYear = p.birthYear + a;
          addLog(p, t("engine.debt.child_work", "返済のため、子どもが学校を休んで働く日が増えました。"), { cat: "learn", tone: "bad" });
        } else addLog(p, t("engine.debt.food", "返済を優先し、食費と医療費を切り詰めました。"), { cat: "economy", tone: "bad" });
        if (over > 2 && chance(0.08)) { p.moved++; addLog(p, t("engine.debt.migrate", "返済のため、仕事を求めて別の土地へ移りました。"), { cat: "economy", tone: "bad" }); }
      }
      if (!p.bankrupt && !p.informal && c.gdp > 15000 && Number(c.credit || 0) > 70 && over > 3 && chance(0.03)) {
        p.bankrupt = true; p.loanDebt = 0; p.net = 0; p.investments = {}; p.house = false;
        p.items = (p.items || []).filter(function (item) { return item !== "home" && item !== "secondHome"; });
        p.debtAccounts = {};
        addLog(p, t("engine.debt.bankruptcy", "正式な破産手続きで債務を整理しました。今後の借入は難しくなります。"), { cat: "economy", tone: "bad" });
      }
    }
    p.debt = Math.max(p.loanDebt || 0, -p.net, 0);
    autoSpend(p);
    var snapshot = portfolio(p);
    p.incomeSources.assets = Math.max(0, capitalIncome);
    p.income += p.incomeSources.assets;
    p.lastAnnualIncome = p.income;
    Object.keys(p.incomeSources).forEach(function (key) { p.lifetimeIncomeSources[key] = (p.lifetimeIncomeSources[key] || 0) + p.incomeSources[key]; });
    p.lifetimeEarnings = (p.lifetimeEarnings || 0) + p.income;
    (p.portfolioHistory || (p.portfolioHistory = [])).push({ age: a, netWorth: snapshot.netWorth, income: p.income, capitalIncome: capitalIncome, incomeSources: Object.assign({}, p.incomeSources) });
    p.capitalIncomeTotal = (p.capitalIncomeTotal || 0) + capitalIncome;
    (p.incomeHistory || (p.incomeHistory = [])).push(Math.round(p.income));
    (p.netHistory || (p.netHistory = [])).push(Math.round(p.net));
    p.maxNetWorth = Math.max(p.maxNetWorth || 0, p.net);

    p.happy.push(Math.round(s.hp));
    if (p.happy.length > 1 && Math.abs(p.happy[p.happy.length - 1] - p.happy[p.happy.length - 2]) > 8) p.swings++;

    if ([5, 15, 30, 50, 70].indexOf(a) >= 0 && p.breathers.indexOf(a) < 0) { p.breathers.push(a); p.breather = a; milestoneNarrative(p); }

    // 死亡
    // 誕生日までの一年間に当たる死亡率を使い、出生直後の年も含める。
    var q = lifeTable(c, p.sex, p.era, p.birthYear)[Math.min(115, a - 1)];
    var mortality = mortalityProbability(p, q, p.birthYear + a);
    syncRelationships(p);
    if (chance(mortality.total)) die(p, mortality.conflict > 0 && chance(mortality.conflict / mortality.total) && (!p.gentle || p.eduMode) ? "紛争" : null);
  }

  function autoFocus(p) {
    var s = p.stats;
    if (s.h < 40) return "health";
    if (p.edu.stage === "primary" || p.edu.stage === "secondary" || p.edu.stage === "univ") return pick(["work", "balance", "balance", "learn", "family"]);
    if (s.r < 40) return "family";
    return pick(["work", "work", "balance", "family", "balance", "hobby", "learn", "health"]);
  }

  function trackedDeathCause(p, selectedKey) {
    var match = { diabetes: ["diabetes"], hypertension: ["stroke", "heart"], hiv: ["hiv"], tb: ["tb"], copd: ["copd"] };
    var conditions = Object.keys(p.chronic || {}).filter(function (key) { return match[key] && p.chronic[key] && p.chronic[key].active !== false; });
    conditions.sort(function (a, b) {
      var risk = function (key) { return (1 - (Number(p.chronic[key].adherence) || 0)) + Math.min(1, (p.age - p.chronic[key].since) / 20); };
      return risk(b) - risk(a);
    });
    var selected = conditions.filter(function (key) { return selectedKey == null ? p.stats.h < 35 && (Number(p.chronic[key].adherence) || 0) < 0.5 : match[key].indexOf(selectedKey) >= 0; })[0];
    if (!selected) return null;
    return t("engine.chronic.cause." + selected, selected === "hypertension" ? "脳卒中" : selected === "diabetes" ? "糖尿病の合併症" : selected === "hiv" ? "HIV/エイズ関連の病気" : selected === "tb" ? "結核" : "慢性閉塞性肺疾患（COPD）");
  }
  function causeOfDeath(p) {
    if (p.age < 5 && p.vax && p.vax.status && chance(p.vax.status === "none" ? 0.22 : p.vax.status === "partial" ? 0.1 : 0.015)) {
      return chance(0.55) ? t("engine.vax.cause.measles", "はしか") : t("engine.vax.cause.diphtheria", "ジフテリア・百日せき・破傷風");
    }
    var causeData = window.CAUSES;
    var year = p.birthYear + p.age;
    var sourceYear = year <= 2004 ? "2000" : year <= 2021 ? "2019" : "2023";
    var ageIndex = p.age < 5 ? 0 : p.age < 15 ? 1 : p.age < 30 ? 2 : p.age < 50 ? 3 : p.age < 60 ? 4 : p.age < 70 ? 5 : 6;
    var cell = causeData && causeData.data[p.iso] && causeData.data[p.iso][sourceYear] && causeData.data[p.iso][sourceYear][p.sex] && causeData.data[p.iso][sourceYear][p.sex][ageIndex];
    if (cell && cell.length) {
      var choices = [], j, entry, key;
      for (j = 0; j < cell.length; j += 2) {
        entry = causeData.causes[cell[j]];
        if (!entry || !(cell[j + 1] > 0)) continue;
        key = entry[0];
        if ((p.gentle || p.eduMode) && key === "selfharm") continue;
        if (key === "maternal" && p.maternalBirths != null) continue;
        if (p.gentle && !p.eduMode && (key === "violence" || key === "conflict")) continue;
        choices.push({ key: key, label: english() ? window.I18N.causeName(entry) : entry[1], weight: cell[j + 1] });
      }
      if (choices.length) {
        var selectedCause = weighted(choices, function (x) { return x.weight; });
        p.causeShare = selectedCause.weight / 10;
        p.causeSourceYear = sourceYear;
        return trackedDeathCause(p, selectedCause.key) || selectedCause.label;
      }
    }
    var c = BY[p.iso], a = p.age, poor = c.gdp < 8000;
    var malaria = ["nga", "cod", "uga", "tza", "gha", "eth", "ken", "sdn", "mmr"].indexOf(p.iso) >= 0;
    var list, i;
    if (a < 1) list = ["生まれてまもない時期の病気", "肺炎", "早産による合併症"];
    else if (a < 5) list = ["肺炎", "下痢による脱水", "はしか"].concat(malaria ? ["マラリア", "マラリア"] : []);
    else if (a < 15) list = ["交通事故", "水の事故", "感染症"].concat(malaria ? ["マラリア"] : []);
    else if (a < 40) list = ["交通事故", "心臓の病気", "感染症"].concat(poor ? ["結核", p.sex === "f" && p.kids.length && p.maternalBirths == null ? "出産にともなう合併症" : "結核"] : ["がん"]);
    else if (a < 70) list = ["心筋梗塞", "脳卒中", "がん", "糖尿病の合併症", "肺の病気"].concat(poor ? ["結核", "感染症"] : []).concat(malaria ? ["マラリア"] : []);
    else list = ["心不全", "脳卒中", "肺炎", "がん", "老衰"];
    if (a < 1 && (Number(c.imr) || c.u5) > 25) list.push("肺炎", "感染症");
    if (a >= 1 && a < 15 && c.u5 > 7) list.push("感染症", "肺炎");
    if (a >= 5 && a < 75) {
      for (i = 0; i < Math.min(3, Math.floor((Number(c.road) || 0) / 12)); i++) list.push("交通事故");
      for (i = 0; i < Math.min(3, Math.floor((Number(c.hiv) || 0) / 3)); i++) list.push("HIV/エイズ関連の病気");
      if (!p.gentle || p.eduMode) for (i = 0; i < Math.min(3, Math.floor((Number(c.hom) || 0) / 8)); i++) list.push("暴力による死");
    }
    if (p.smoker && a >= 35) {
      list.push("肺がん", "慢性閉塞性肺疾患");
      if ((Number(p.sex === "m" ? c.smk_m : c.smk_f) || 0) >= 25) list.push("肺がん", "慢性閉塞性肺疾患");
    }
    var pickedCause = pick(list.filter(Boolean));
    return trackedDeathCause(p, /その他の病気|病気/.test(pickedCause) ? "other" : null) || (english() && window.I18N.engineCause ? window.I18N.engineCause(pickedCause) : pickedCause);
  }
  function causeShares(c, sex, age, year) {
    var data = window.CAUSES, iso = typeof c === "string" ? c : c && c.iso;
    var sourceYear = year <= 2004 ? "2000" : year <= 2021 ? "2019" : "2023";
    var ageIndex = age < 5 ? 0 : age < 15 ? 1 : age < 30 ? 2 : age < 50 ? 3 : age < 60 ? 4 : age < 70 ? 5 : 6;
    var cell = data && data.data[iso] && data.data[iso][sourceYear] && data.data[iso][sourceYear][sex] && data.data[iso][sourceYear][sex][ageIndex];
    var result = [], i, entry;
    if (!cell) return result;
    for (i = 0; i < cell.length && result.length < 3; i += 2) {
      entry = data.causes[cell[i]];
      if (entry && entry[0] !== "other") result.push({ label: english() ? window.I18N.causeName(entry) : entry[1], share: cell[i + 1] });
    }
    return result;
  }
  var LAST_WORDS = translatedList("engine.last", ["みんな、ありがとう。", "大切な時間を過ごせたよ。", "あの夕焼けを、もう一度見たかったな。", "これからも、元気でいてね。", "そばにいてくれて、うれしかった。", "また会おうね。", "窓を開けておいて。"]);

  function die(p, forcedCause) {
    syncRelationships(p);
    var cause = forcedCause ? (english() && window.I18N.engineCause ? window.I18N.engineCause(forcedCause) : forcedCause) : causeOfDeath(p);
    if ((p.gentle || p.eduMode) && /暴力|紛争|violence|conflict/i.test(cause)) cause = t("engine.death.safe_cause", "外傷");
    p.ended = true;
    p.pending = null;
    var where = p.abroad ? placeName(p.abroad) : countryName(BY[p.iso]);
    p.death = { age: p.age, year: p.birthYear + p.age, cause: cause, where: where, last: p.age >= 8 ? pick(LAST_WORDS) : null };
    var heirs = (p.kids || []).filter(function (child) { return child.alive; });
    p.inheritanceLeft = 0;
    if (heirs.length && p.net > 0) {
      p.bequest = p.net;
      p.inheritanceLeft = p.net;
      heirs.forEach(function (child) { child.inheritance = p.net / heirs.length; });
      addLog(p, t("engine.econ.bequest", "残した財産を子どもたちに引き継ぎました。"), { cat: "economy", tone: "neutral" });
    }
    addLog(p, english() ? t("engine.death.log", "", { age: p.age, cause: cause }) : p.age + "歳のとき、" + cause + "で亡くなりました。", p.causeShare != null && !forcedCause ?
      dataRef({ big: true, tone: "bad" }, "WHO GHE " + p.causeSourceYear, "cause_share", "この国の同じ性別・年齢層の死亡のうち、この死因は{rate}％を占めます。", { rate: pct(p.causeShare) }) :
      dataRef({ big: true, tone: "bad" }, "WHO life tables", "life_expectancy", "この国で生まれた人の平均寿命は推計{years}歳です。", { years: Math.round(p.le) }));
    historyEvent(p, "death", { people: [p.name], outcome: "died", text: p.log[p.log.length - 1].t, cat: "health", tone: "bad" });
    var familyLeft = p.kids.filter(function (kid) { return kid.alive; }).length;
    var deathLine = p.age < 18 ?
      t("engine.death.child_story", "短い生涯でした。家族には、成長を見届けられなかった時間が残りました。") :
      familyLeft ? t("engine.death.family_story", "子ども{count}人は、あなたを見送ったあとも、それぞれの人生を歩みました。", { count: familyLeft }) :
        p.debt > 0 ? t("engine.death.debt_story", "借金を残し、果たせない約束もありました。") :
          t("engine.death.story", "見慣れた場所からあなたの姿が消えました。一緒に過ごした時間は、家族や友人の胸に残りました。");
    addLog(p, deathLine, { cat: "family", big: true, tone: "bad" });
    addLog(p, t(countKey("engine.death.cohort", p.age), "この国で生まれた人の平均寿命は推計{expected}歳でした。あなたは{age}歳まで生きました。", { expected: Math.round(p.le), age: p.age }), dataRef({ cat: "health", big: true, tone: "neutral" }, "WHO life tables", "life_expectancy", "この国で生まれた人の平均寿命は推計{years}歳です。", { years: Math.round(p.le) }));
    if (p.age < 5 && p.vax && p.vax.status === "none" &&
        (cause === t("engine.vax.cause.measles", "はしか") || cause === t("engine.vax.cause.diphtheria", "ジフテリア・百日せき・破傷風"))) {
      p.death.vaxNote = t("engine.vax.death", "予防接種を受けられなかったことも、感染症への弱さに関わりました。");
      addLog(p, p.death.vaxNote, dataRef({ cat: "health", vax: true, big: true, tone: "bad" }, "WHO/UNICEF", "vaccination", "この年のDTP3接種率は{dtp3}％、はしか接種率は{measles}％です。", { dtp3: pct(coverage(BY[p.iso], p.birthYear).dtp3), measles: pct(coverage(BY[p.iso], p.birthYear).measles) }));
    }
    p.story = lifeStory(p) || reflection(p);
  }

  // ---------- 振り返り ----------
  var TEXTURES = translatedList("engine.texture", [
    "灯をともす人", "畑を耕す人", "港で待つ人", "種をまく人", "橋をかける人", "道をひらく人", "嵐をくぐる人", "星を数える人",
    "台所に立つ人", "糸を紡ぐ人", "坂をのぼる人", "地図を描く人", "井戸を掘る人", "鐘を鳴らす人", "川を渡る人", "風を読む人"
  ]);
  function texture(p) {
    var fy = p.focusYears, tot = Math.max(1, p.age - 5);
    var fam = ((fy.family || 0) + p.kids.length * 2 + (p.rel !== "single" ? 4 : 0)) / tot;
    var work = ((fy.work || 0) + p.jobYears / 4) / tot;
    var side = clamp(0.5 + (work - fam) * 0.9, 0.04, 0.96); // 0=そば 1=仕事
    var wind = clamp(0.15 + (p.moved * 0.35 + p.jobChanges * 0.12), 0.04, 0.96); // 0=根 1=風
    var wave = clamp(0.2 + p.swings / Math.max(8, p.age) * 1.5, 0.04, 0.96); // 0=凪 1=波
    var tmr = clamp(0.5 + ((fy.learn || 0) + p.saved / 3 - (fy.hobby || 0) - p.spent) / tot, 0.04, 0.96); // 0=今日 1=明日
    var idx = (side > 0.5 ? 8 : 0) + (wind > 0.5 ? 4 : 0) + (wave > 0.5 ? 2 : 0) + (tmr > 0.5 ? 1 : 0);
    return { axes: [[t("engine.axis.near", "そば"), t("engine.axis.work", "仕事"), side], [t("engine.axis.roots", "根"), t("engine.axis.wind", "風"), wind], [t("engine.axis.calm", "凪"), t("engine.axis.waves", "波"), wave], [t("engine.axis.today", "今日"), t("engine.axis.tomorrow", "明日"), tmr]], name: TEXTURES[idx] };
  }
  function degree(w) {
    var d = Math.abs(w - 0.5);
    var dir = w < 0.5 ? 0 : 1;
    return [d < 0.08 ? t("engine.degree.even", "半々") : (d > 0.3 ? t("engine.degree.strong", "大きく") : t("engine.degree.slight", "少し")), dir];
  }
  function summaryFacts(p) {
    var history = (p.history || []).some(function (event) { return event.type === "birth"; }) ? p.history : null;
    if (!history) return { education: p.edu.level, job: p.job, movedTo: p.abroad, kids: p.kids.length, grand: p.grand, cared: p.cared };
    var school = history.filter(function (event) { return event.type === "school_finish"; }).slice(-1)[0];
    var work = history.filter(function (event) { return event.type === "work_start"; }).slice(-1)[0];
    var move = history.filter(function (event) { return event.type === "move" && event.to !== p.city; }).slice(-1)[0];
    return { education: school ? school.level : "none", job: work && work.job, movedTo: move && move.to,
      kids: history.filter(function (event) { return event.type === "child_birth"; }).length,
      grand: history.filter(function (event) { return event.type === "grandchild_birth"; }).length,
      cared: history.some(function (event) { return event.type === "parent_care"; }) };
  }
  function summary(p) {
    if (english()) return summaryEn(p);
    var c = BY[p.iso], facts = summaryFacts(p);
    var s = c.name + ((p.birthUrban == null ? p.urban : p.birthUrban) ? "・" + p.city : "の村") + "の" + WEALTH_LABEL[p.wealth] + "家庭に、" + sexWord(p) + "として生まれました。";
    if (p.age >= 6) s += { none: "初等教育は修了しませんでした。", primary: "初等教育を終えました。", secondary: "中等教育を終えました。", univ: "大学を卒業しました。" }[facts.education] || "";
    if (facts.job) s += facts.job + "として" + (p.retired ? "働き、引退しました。" : "働きました。");
    if (facts.movedTo) s += facts.movedTo + "に移り住みました。";
    if (p.spouse) s += p.spouse.given + "と" + ((p.spouse.alive ? p.age : p.spouse.diedAt) - p.spouse.since) + "年連れ添い" + (p.spouse.alive ? "ました。" : "、先に見送りました。");
    else if (p.age >= 30) s += "結婚せずに暮らしました。";
    var kids = facts.kids;
    if (kids) s += t("engine.summary.children", "{count}人の子どもがいました。", { count: kids });
    if (facts.grand) s += "孫が" + facts.grand + "人生まれました。";
    if (facts.cared) s += "年を重ねた親をそばで支えました。";
    if (p.drink) s += "お酒の量に悩む時期がありました。";
    if (p.scholar) s += "支援を受けて遠くで学びました。";
    if (p.business) s += "小さな商売を営みました。";
    if (p.house) s += "自分の住まいを持ちました。";
    if (p.everSmoked) s += p.smoker ? "たばこを吸う習慣が続きました。" : "たばこをやめました。";
    if (p.earlyMarriage === "accepted") s += "10代で結婚しました。";
    if (p.returned) s += "のちに故郷へ戻りました。";
    if (p.death) s += p.death.age + "歳のとき、" + p.death.cause + "で亡くなりました。";
    return s;
  }
  function summaryEn(p) {
    var c = BY[p.iso], parts = [], facts = summaryFacts(p);
    function sentenceNoun(value) { return String(value || "").replace(/^[A-Z](?=[a-z])/, function (letter) { return letter.toLowerCase(); }); }
    parts.push(t("engine.summary.birth", "", { country: countryName(c), place: (p.birthUrban == null ? p.urban : p.birthUrban) ? countryValue(c, "cities", p.city) : t("engine.summary.village", ""), wealth: t("engine.birth.wealth." + p.wealth, ""), child: p.sex === "m" ? "boy" : "girl" }));
    if (p.age >= 6) parts.push(t("engine.summary.education." + facts.education, ""));
    if (facts.job) parts.push(t(p.retired ? "engine.summary.job_retired" : "engine.summary.job", "", { job: sentenceNoun(facts.job) }));
    if (facts.movedTo) parts.push(t("engine.summary.moved", "", { place: placeName(facts.movedTo) }));
    if (p.spouse) {
      var spouseYears = (p.spouse.alive ? p.age : p.spouse.diedAt) - p.spouse.since;
      parts.push(t(countKey(p.spouse.alive ? "engine.summary.spouse" : "engine.summary.spouse_lost", spouseYears), "", { name: p.spouse.given, years: spouseYears }));
    }
    else if (p.age >= 30) parts.push(t("engine.summary.unmarried", ""));
    if (facts.kids) parts.push(t(countKey("engine.summary.children", facts.kids), "", { count: facts.kids }));
    if (facts.grand) parts.push(t(countKey("engine.summary.grandchildren", facts.grand), "", { count: facts.grand }));
    if (facts.cared) parts.push(t("engine.summary.cared", ""));
    if (p.drink) parts.push(t("engine.summary.drink", ""));
    if (p.scholar) parts.push(t("engine.summary.scholar", ""));
    if (p.business) parts.push(t("engine.summary.business", ""));
    if (p.house) parts.push(t("engine.summary.house", ""));
    if (p.everSmoked) parts.push(t(p.smoker ? "engine.summary.smoker" : "engine.summary.quit_smoking", ""));
    if (p.earlyMarriage === "accepted") parts.push(t("engine.summary.early_marriage", ""));
    if (p.returned) parts.push(t("engine.summary.returned", ""));
    if (p.death) parts.push(t("engine.summary.death", "", { age: p.death.age, cause: sentenceNoun(p.death.cause) }));
    return parts.filter(Boolean).join(" ");
  }
  function placeName(value) {
    if (!english()) return value;
    var country = C.filter(function (c) { return c.name === value; })[0];
    if (country) return countryName(country);
    var destination = "";
    C.some(function (c) {
      var index = (c.emig || []).indexOf(value);
      if (index < 0 || !c.emig_en || !c.emig_en[index]) return false;
      destination = c.emig_en[index];
      return true;
    });
    return destination || value;
  }
  function historyStory(p) {
    var history = p.history || [], byId = {}, c = BY[p.iso] || {};
    history.forEach(function (event) { byId[event.id] = event; });
    var links = history.filter(function (event) { return event.causeId && byId[event.causeId] && event.type !== "death"; });
    var priority = { child_recovered: 9, child_education_result: 9, child_support: 8, child_education: 8, child_marriage: 7, child_school: 6,
      child_birth: 6, work_start: 5, move: 5, school_finish: 4, dream_achieved: 4, parent_care: 4, family_origin: 1 };
    links.sort(function (a, b) { return (priority[b.type] || 0) - (priority[a.type] || 0) || a.age - b.age; });
    var selected = [];
    links.forEach(function (event) {
      if (selected.length >= 2 || selected.some(function (other) { return other.type === event.type; })) return;
      selected.push(event);
    });
    if (!selected.length) selected.push(history.filter(function (event) { return event.type === "family_origin"; })[0]);
    selected = selected.filter(Boolean).sort(function (a, b) { return a.age - b.age; });
    var name = p.name || p.given, place = p.city || countryName(c), lines = [t("engine.history.story.birth", "{year}年、{name}は{place}で生まれました。",
      { year: p.birthYear, name: name, place: place })];
    selected.forEach(function (event) {
      var first = byId[event.causeId], person = event.people[0] || first && first.people[0] || p.parents.mom.given;
      var vars = { name: p.given || name, person: person, firstYear: first && first.year, year: event.year,
        firstAge: first && first.age, age: event.age, job: event.job || "", jobPhrase: jobPhrase(event.job), place: event.place || place,
        from: event.from || first && first.place || place, to: event.to || event.place || place,
        spouse: p.spouse && p.spouse.given || "", mother: p.parents.mom.given, father: p.parents.dad.given,
        level: first && first.level ? (window.I18N ? window.I18N.t("engine.history.level." + first.level) : first.level) : "" };
      var key = "engine.history.story." + event.type;
      var dictionary = window.I18N && window.I18N.dictionaries && window.I18N.dictionaries[english() ? "en" : "ja"];
      if (dictionary && dictionary[key]) lines.push(window.I18N.t(key, vars));
    });
    var remembered = (p.kids || []).filter(function (child) { return child.given; })[0] || p.spouse || p.parents.mom;
    if (remembered && remembered.given) lines.push(p.age < 15 ?
      t("engine.history.story.early_remember", "{person}もその時間をともに過ごしました。", { person: remembered.given }) :
      t("engine.history.story.remember", "晩年にも{person}と過ごした日々を思い出しました。", { person: remembered.given }));
    return lines.filter(Boolean).slice(0, 5).join(english() ? " " : "");
  }
  function historyInvariants(p) {
    var history = p.history || [], errors = [], seen = {}, ids = {};
    history.forEach(function (event) {
      if (ids[event.id]) errors.push("duplicate_event_id");
      ids[event.id] = true;
      if (event.year !== p.birthYear + event.age) errors.push("event_year");
      if (event.type === "school_start") {
        if (seen["school:" + event.level]) errors.push("duplicate_school_start");
        seen["school:" + event.level] = true;
      }
      if (event.type === "work_start") {
        if (seen["work:" + event.age + ":" + event.job]) errors.push("duplicate_work_start");
        seen["work:" + event.age + ":" + event.job] = true;
      }
    });
    history.forEach(function (event) { if (event.causeId && !ids[event.causeId]) errors.push("missing_cause"); });
    if (p.kids.length !== history.filter(function (event) { return event.type === "child_birth"; }).length) errors.push("child_count");
    if (p.grand !== history.filter(function (event) { return event.type === "grandchild_birth"; }).length) errors.push("grandchild_count");
    p.kids.forEach(function (child) {
      if (child.schoolStatus === "enrolled" && !history.some(function (event) { return event.type === "child_school" && event.identity === child.id; })) errors.push("child_school_state");
      if (child.married && !history.some(function (event) { return event.type === "child_marriage" && event.identity === child.id; })) errors.push("child_marriage_state");
    });
    if (p.spouse && !history.some(function (event) { return event.type === "spouse_marriage" && event.people.indexOf(p.spouse.given) >= 0; })) errors.push("spouse_history");
    if (p.job && !history.some(function (event) { return event.type === "work_start" && event.job === p.job; })) errors.push("job_history");
    (p.jobHistory || []).forEach(function (job) {
      if (!history.some(function (event) { return event.type === "work_start" && event.job === job; })) errors.push("career_history");
    });
    var dreamEvent = history.filter(function (event) { return event.type === "dream_achieved" && event.dream === p.dream; })[0];
    if (!!p.dreamAchieved !== !!dreamEvent) errors.push("dream_verdict");
    if (dreamEvent && p.dream === "craftsperson" && !history.some(function (event) {
      return event.type === "work_start" && /carpenter|mason|mechanic|welder|tailor|baker|metalworker|printer|garment|craft|大工|左官|整備|溶接|仕立|パン職人|金属加工|印刷|縫製/i.test(event.job || "");
    })) errors.push("craft_without_work");
    return errors;
  }
  // Compose from recorded events, rather than from the texture's sixteen labels.
  function lifeStory(p) {
    if (p && typeof p.story === "string" && !Array.isArray(p.kids)) return p.story;
    if (!window.I18N) return "";
    if (p && Array.isArray(p.history) && p.history.some(function (event) { return event.type === "birth"; })) return historyStory(p);
    var c = BY[p.iso] || {}, code = english() ? "en" : "ja";
    var name = p.name || p.given || (window.I18N && typeof window.I18N.t === "function" ? window.I18N.t("engine.story.unknown") : "この人");
    var birthplace = p.urban && p.city ? countryValue(c, "cities", p.city) : countryName(c);
    var destination = p.abroad ? placeName(p.abroad) : "";
    var seed = String(p.id || name + p.birthYear).split("").reduce(function (n, ch) { return (n * 33 + ch.charCodeAt(0)) >>> 0; }, 5381);
    var lines = [], choose = function (group, count, vars) {
      var variant = group.split("").reduce(function (n, ch) { return (n * 31 + ch.charCodeAt(0)) >>> 0; }, seed) % count;
      return window.I18N && typeof window.I18N.t === "function" ? window.I18N.t("engine.story." + group + "." + variant, vars) : "";
    };
    var year = Number.isFinite(Number(p.birthYear)) ? Number(p.birthYear) : 2026;
    lines.push(choose("birth", 3, { name: name, place: birthplace, year: year }));
    var mom = p.parents && p.parents.mom && p.parents.mom.given;
    var dad = p.parents && p.parents.dad && p.parents.dad.given;
    var spouse = p.spouse && p.spouse.given;
    var child = (p.kids || []).filter(function (kid) { return kid && kid.given && Number.isFinite(Number(kid.born)); })[0];
    if (p.age < 6 && mom && dad) lines.push(choose("parents", 2, { mother: mom, father: dad }));
    else if (child && spouse) lines.push(choose("spouseChild", 2, { spouse: spouse, child: child.given, year: year + Number(child.born) }));
    else if (child) lines.push(choose("child", 2, { child: child.given, year: year + Number(child.born) }));
    else if (spouse) lines.push(choose("spouse", 2, { spouse: spouse }));
    else if (mom && dad) lines.push(choose("parents", 2, { mother: mom, father: dad }));

    var counts = {};
    (p.hist || []).forEach(function (entry) { if (entry && entry.job) counts[entry.job] = (counts[entry.job] || 0) + 1; });
    var work = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; })[0] || p.job;
    var workYears = work && counts[work] || (work === p.job ? Number(p.jobYears) || 0 : 0);
    if (work && workYears >= 3 && destination) lines.push(choose("workMove", 2, { job: work, jobPhrase: jobPhrase(work), years: workYears, from: birthplace, to: destination }));
    else if (work && workYears >= 3 && !p.moved) lines.push(choose("workStay", 2, { job: work, jobPhrase: jobPhrase(work), years: workYears, place: birthplace }));
    else if (work && workYears >= 3) lines.push(choose("work", 2, { job: work, jobPhrase: jobPhrase(work), years: workYears, place: birthplace }));
    else if (destination) lines.push(choose("move", 2, { from: birthplace, to: destination }));
    else if (!p.moved && p.age >= 12) lines.push(choose("stay", 2, { place: birthplace }));

    var dream = p.dream && DREAM_BY[p.dream];
    var hardship = (p.log || []).filter(function (entry) {
      return entry && entry.tone === "bad" && entry.a > 0 && entry.a < p.age &&
        /^(health|economy|disaster|family|work|world|learn)$/.test(entry.cat || "");
    }).sort(function (a, b) {
      function weight(x) { return (x.big ? 5 : 0) + (x.blocked ? 3 : 0) +
        (p.happy && Number.isFinite(p.happy[x.a]) ? (100 - p.happy[x.a]) / 30 : 0); }
      return weight(b) - weight(a);
    })[0];
    var data = joysOf(c) || {}, supportEntry = (p.log || []).filter(function (entry) {
      return entry && entry.everyday && (entry.a >= 5 || p.age < 6) && ((Number.isInteger(entry.joy) && data.joys && data.joys[entry.joy]) ||
        (Number.isInteger(entry.motivation) && data.motivations && data.motivations[entry.motivation]));
    }).slice(-1)[0];
    var support = supportEntry && (Number.isInteger(supportEntry.motivation) && data.motivations && data.motivations[supportEntry.motivation] ||
      Number.isInteger(supportEntry.joy) && data.joys && data.joys[supportEntry.joy]);
    var supportText = support && support[code];
    var struggle = hardship && window.I18N && typeof window.I18N.t === "function" && window.I18N.t("engine.story.difficulty." + hardship.cat);
    if (dream && hardship) lines.push(choose(supportText ? "dreamHardshipSupport" : "dreamHardship", 2, {
      dream: dream.label, year: year + hardship.a, difficulty: struggle, support: supportText,
      outcome: p.dreamAchieved ? window.I18N.t("engine.story.outcome.reached") : window.I18N.t("engine.story.outcome.unfinished")
    }));
    else if (dream) lines.push(choose(p.dreamAchieved ? "dreamReached" : "dreamSought", 2, { dream: dream.label }));
    else if (hardship) lines.push(choose(supportText ? "hardshipSupport" : "hardship", 2, {
      year: year + hardship.a, difficulty: struggle, support: supportText
    }));
    else if (supportText && lines.length < 4) lines.push(choose("support", 2, { support: supportText }));

    var livingChild = (p.kids || []).filter(function (kid) { return kid && kid.alive && kid.given; })[0];
    var lastName = livingChild && livingChild.given || p.spouse && p.spouse.alive && p.spouse.given ||
      p.parents && p.parents.mom && p.parents.mom.alive && p.parents.mom.given ||
      p.parents && p.parents.dad && p.parents.dad.alive && p.parents.dad.given;
    if (lastName) lines.push(choose("lastPerson", 2, { name: name, person: lastName }));
    else lines.push(choose("lastPlace", 2, { name: name, place: destination || birthplace }));
    return lines.filter(Boolean).slice(0, 5).join(english() ? " " : "");
  }
  function textureStory(p) {
    var c = BY[p.iso] || {}, place = p.urban && p.city ? countryValue(c, "cities", p.city) : countryName(c);
    var vars = { name: p.name || p.given, place: place, to: p.abroad ? placeName(p.abroad) : "",
      job: p.job || "", jobPhrase: jobPhrase(p.job), years: Number(p.jobYears) || 0,
      child: (p.kids || []).filter(function (kid) { return kid && kid.given; }).map(function (kid) { return kid.given; })[0] || "" };
    var key = p.moved && vars.to ? "move" : vars.job && vars.years >= 3 ? "work" : vars.child ? "family" : "place";
    return window.I18N && typeof window.I18N.t === "function" ? window.I18N.t("engine.story.texture." + key, vars) : "";
  }
  function record(p) {
    syncRelationships(p);
    var history = (p.history || []).some(function (event) { return event.type === "birth"; }) ? p.history.slice() : [];
    if (p.ended && history.length) {
      var violations = historyInvariants(p);
      if (violations.length) throw new Error("History invariant: " + violations.join(", "));
    }
    var lastJob = history.filter(function (event) { return event.type === "work_start"; }).slice(-1)[0];
    var completedSchool = history.filter(function (event) { return event.type === "school_finish"; }).slice(-1)[0];
    var children = history.length ? history.filter(function (event) { return event.type === "child_birth"; }).length : p.kids.length;
    var grandchildren = history.length ? history.filter(function (event) { return event.type === "grandchild_birth"; }).length : p.grand;
    var c = BY[p.iso];
    var livedPlaces = [countryName(c)];
    history.filter(function (event) { return event.type === "move" && event.place && event.place !== p.city; }).forEach(function (event) {
      if (livedPlaces.indexOf(event.place) < 0) livedPlaces.push(event.place);
    });
    var q = lifeTable(c, p.sex, p.era, p.birthYear), l = survival(q);
    var longer = Math.round((l[Math.min(110, p.death.age + 1)] || 0) * 100);
    var best = p.happy.indexOf(Math.max.apply(null, p.happy.length ? p.happy : [0]));
    var tx = texture(p);
    tx.explanation = textureStory(p);
    var big = p.focusYears, top = Object.keys(big).sort(function (a, b) { return big[b] - big[a]; })[0];
    var jpyRate = YEN_PER_PPP;
    return {
      id: p.id, name: p.name, given: p.given, iso: p.iso, country: countryName(c), sex: p.sex, birthYear: p.birthYear, death: p.death,
      summary: summary(p), longer: longer, le: p.le, diff: Math.round((p.death.age - p.le) * 10) / 10,
      edu: p.age < 6 ? t("engine.edu.pre", "就学前") : EDU_LABEL[history.length ? completedSchool && completedSchool.level || "none" : p.edu.level] || "—", job: p.job || lastJob && lastJob.job || "—",
      spouse: p.spouse ? (english() ? t(countKey(p.spouse.alive ? "engine.record.spouse" : "engine.record.spouse_lost", (p.spouse.alive ? p.age : p.spouse.diedAt) - p.spouse.since), "", { name: p.spouse.given, years: ((p.spouse.alive ? p.age : p.spouse.diedAt) - p.spouse.since) }) : p.spouse.given + "（" + ((p.spouse.alive ? p.age : p.spouse.diedAt) - p.spouse.since) + "年" + (p.spouse.alive ? "）" : "、先立たれた）")) : "—",
      kids: children, grand: grandchildren,
      bestYear: p.happy.length ? (english() ? t("engine.record.best_year", "", { age: best + 1, year: p.birthYear + best + 1 }) : (best + 1) + "歳（" + (p.birthYear + best + 1) + "年）") : "—",
      lived: history.length ? livedPlaces.join(english() ? ", " : "、") : p.abroad ? (english() ? countryName(c) + ", " + placeName(p.abroad) : c.name + "、" + p.abroad) : countryName(c), hobby: p.hobby || "—",
      wealthLeft: Math.round(p.net * jpyRate), bequest: Math.round((p.bequest || 0) * jpyRate), lifetimeEarnings: Math.round((p.lifetimeEarnings || 0) * jpyRate), maxNetWorth: Math.round((p.maxNetWorth || 0) * jpyRate),
      items: (p.items || []).map(function (key) { var item = ITEMS.filter(function (x) { return x.key === key; })[0]; return item ? item.label : key; }),
      top: top ? (FOCI.filter(function (f) { return f.k === top; })[0].label + " " + (english() ? t(countKey("engine.record.years", big[top]), "", { count: big[top] }) : big[top] + "年")) : "—",
      texture: tx, story: p.story || lifeStory(p), history: history, timeline: history.slice(), themeHits: p.themeHits, theme: p.theme, urban: p.urban, wealth: p.wealth,
      dream: dreamStatus(p), vax: p.vax, chronic: p.chronic || {}, importantChoices: (p.importantChoices || []).slice(),
      household: Math.min(8, 1 + (p.spouse && p.spouse.alive ? 1 : 0) + p.kids.length),
      seeOff: english() ? t(p.kids.length || p.grand ? "engine.record.see_off_family" : p.age < 5 ? "engine.record.see_off_parents" : "engine.record.see_off_friends", "", { children: p.kids.filter(function (k) { return k.alive; }).length, grandchildren: p.grand }) : (p.kids.length ? "子ども" + p.kids.filter(function (k) { return k.alive; }).length + "人" : "") + (p.grand ? "、孫" + p.grand + "人" : "") + (p.kids.length || p.grand ? "と古い友人たち" : (p.age < 5 ? "両親" : "きょうだいと友人たち")),
       reflection: p.story || lifeStory(p), happy: p.happy.slice(), log: history.length ? history.map(function (x) { return { a: x.age, t: x.text, tone: x.tone, src: x.src, stat: x.stat, type: x.type, id: x.id }; }) :
         p.log.filter(function (x) { return x.big || x.decision; }).map(function (x) { return { a: x.a, t: x.t, tone: x.tone, src: x.src, stat: x.stat }; }),
      ended: Date.now()
    };
  }
  function reflection(p) {
    if (english()) return t(p.age < 5 ? "engine.reflection.short" : p.net < 0 && p.kids.length ? "engine.reflection.debt_family" : p.moved ? "engine.reflection.moved" : p.edu.level === "univ" ? "engine.reflection.learned" : p.stats.r > 70 ? "engine.reflection.connected" : "engine.reflection.daily", "");
    if (p.age < 5) return "短い時間でしたが、たしかにこの世界にいました。";
    if (p.net < 0 && p.kids.length) return "家計に苦しい時期もありました。子どもと過ごした時間が残りました。";
    if (p.moved) return "生まれた場所を離れ、新しい土地で暮らしを重ねました。";
    if (p.edu.level === "univ") return "学ぶ機会を得て、知識を広げました。";
    if (p.stats.r > 70) return "人とのつながりを大切にしながら暮らしました。";
    return "日々の小さな選択を重ねて、一生を歩みました。";
  }

  // 画面を通さずに一生を最後まで進める（見本づくり用）
  function simulateFull(seed, settings) {
    var saved = R;
    R = rng(seed);
    var p = birth(settings || { era: "now", method: "births" });
    p.auto = true;
    var guard = 0;
    while (!p.ended && guard++ < 130) {
      if (p.pending) { resolveAuto(p); continue; }
      yearEnd(p);
      if (p.pending && !p.ended) resolveAuto(p);
    }
    var r = record(p);
    R = saved;
    return r;
  }
  function decision(p) {
    if (p.eduMode && { gamble: true, drink: true, quitSmoking: true, documentFee: true }[p.pending]) { p.pending = null; return null; }
    return p.pending && DECISIONS[p.pending] ? decisionStakes(p, p.pending, localizeDecision(p, p.pending, DECISIONS[p.pending](p))) : null;
  }
  function choose(p, d, i) {
    if (p.eduMode && { gamble: true, drink: true, quitSmoking: true, documentFee: true }[p.pending]) { p.pending = null; return; }
    var ch = d.choices[i], choiceKey = p.pending, logStart = p.log.length;
    if (p.auto && ch.job && (p.pending === "firstJob" || p.pending === "jobOffer")) addLog(p, t("engine.job.auto_chose", "おまかせで{job}を選びました", { job: ch.jobName }), { cat: "work" });
    var decisionCats = { toy: "family", school: "learn", university: "learn", firstJob: "work", jobOffer: "work", conscription: "society",
      marry: "family", child: "family", pet: "family", gamble: "economy", move: "world", drink: "health", documentFee: "society",
      care: "family", scholarship: "learn", treatment: "health", home: "family", business: "work",
      evacuation: "disaster", loan: "economy", community: "society", nightSchool: "learn",
      childSchool: "learn", elderHome: "family", earlyMarriage: "family", quitSmoking: "health", returnHome: "world", countryScript: "society" };
    var decisionOptions = { big: false, decision: true, cat: decisionCats[p.pending] || logCategory(d.title) }, country = BY[p.iso];
    if (p.pending === "retire" && hasNumber(country, p.sex === "f" ? "retirement_age_f" : "retirement_age_m"))
      dataRef(decisionOptions, "World Bank WBL 2026", "pension_age", "この国の法定退職年齢は{age}歳です。", { age: retirementAge(p, country) });
    else if (p.pending === "earlyMarriage" && hasNumber(country, "cm"))
      dataRef(decisionOptions, "UNICEF", "child_marriage", "この国で18歳前に結婚した女性は{rate}％です。", { rate: pct(country.cm) });
    else if (p.pending === "conscription" && hasNumber(country, "conscription_years"))
      dataRef(decisionOptions, historicalSource(), "conscription", "この国の兵役期間は約{years}年です。", { years: country.conscription_years });
    else if (p.pending === "countryScript" && p.scriptPending && p.scriptPending.year != null)
      dataRef(decisionOptions, historicalSource(), "script_year", "{year}年に記録された出来事です。", { year: p.scriptPending.year });
    addLog(p, t("engine.decision.chosen", "{age}歳：{title} — {choice}を選びました。", { age: p.age, title: d.title, choice: ch.t }), decisionOptions);
    p.decisionCount = (p.decisionCount || 0) + 1;
    p.pending = null;
    ch.f(p);
    syncRelationships(p);
    var outcomeEntry = p.log.slice(logStart).filter(function (entry) { return !entry.decision; })[0];
    var outcome = outcomeEntry ? outcomeEntry.t : t("engine.stakes.noChange", "暮らしに大きな変化はありませんでした。");
    var memory = { age: p.age, key: choiceKey, choice: ch.t, outcome: outcome, cat: outcomeEntry && outcomeEntry.cat, tone: outcomeEntry && outcomeEntry.tone };
    if (choiceKey !== "toy") {
      (p.importantChoices || (p.importantChoices = [])).push(memory);
      (p.choiceFollowups || (p.choiceFollowups = [])).push(memory);
    }
  }
  function resolveAuto(p) {
    var d = decision(p);
    if (!d) { p.pending = null; return; }
    choose(p, d, p.pending === "firstJob" ? 0 : p.pending === "retire" ? (p.stats.h < 38 || p.pension || portfolio(p).netWorth > medianIncome(p) * 3 ? 0 : 2) : p.pending === "partTime" ? (p.stats.h < 38 || p.cared ? 0 : 1) : p.pending === "jobOffer" && chance(0.92) ? d.choices.length - 1 : p.pending === "university" ? (chance(0.94) ? 0 : 1) : p.pending === "child" ? (chance(p.familyTarget == null ? 0.78 : 0.98) ? 0 : 1) : p.pending === "marry" && eraMarriageAge(p, BY[p.iso]) !== null ? (chance(0.96) ? 0 : 1) : Math.floor(R() * d.choices.length));
  }

  window.MEGURI = {
    C: C, BY: BY, ERAS: ERAS, FOCI: FOCI, LOG_CATS: LOG_CATS, EDU_LABEL: EDU_LABEL, WEALTH_LABEL: WEALTH_LABEL, TEMPERAMENTS: TEMPERAMENTS,
    JOBS: JOBS, JOBS_COUNT: Object.keys(JOB_DETAILS).length, LIFESTYLES: LIFESTYLES, portfolio: portfolio, assetClasses: assetClasses, invest: invest, sell: sell,
    borrowOptions: borrowOptions, borrow: borrow, repay: repay, setLifestyle: setLifestyle, spendCatalog: spendCatalog,
    moneyEventOptions: moneyEventOptions, triggerMoneyEvent: triggerMoneyEvent,
    DREAMS: DREAMS, setDream: setDream, dreamStatus: dreamStatus, choiceOptions: choiceOptions, tryChoice: tryChoice,
    YEN_PER_PPP: YEN_PER_PPP, ITEMS: ITEMS, SERVICES: SERVICES, spendOptions: spendOptions, investOptions: investOptions, incomePosition: incomePosition, dailyDollars: dailyDollars, budgetOf: budgetOf, transportOf: transportOf, availableMoney: availableMoney, spend: spend,
    rng: rng, setRandom: setRandom, pickCountry: pickCountry, lifeTable: lifeTable, worldTable: worldTable, survival: survival, classSeed: classSeed, lifeTablesLoaded: !!window.LIFETABLES, refreshData: refreshData, yearStats: yearStats, birthSnapshot: birthSnapshot,
    birth: birth, yearEnd: yearEnd, decision: decision, choose: choose, resolveAuto: resolveAuto, record: record, lifeStory: lifeStory, historyInvariants: historyInvariants, texture: texture, degree: degree, causeShares: causeShares, mortalityProbability: mortalityProbability,
    simulateFull: simulateFull, todayTheme: todayTheme, sampleDeath: sampleDeath, causeOfDeath: causeOfDeath, summary: summary, addLog: addLog, makeName: makeName, cultureOf: cultureOf, scriptOf: scriptOf, scriptEvent: scriptEvent,
    violenceEvent: violenceEvent, violenceAftermath: violenceAftermath, milestoneNarrative: milestoneNarrative,
    decisionKeys: Object.keys(DECISIONS).filter(function (key) { return key !== "countryScript"; }), forceDecision: function (p, key) { p.pending = key; return decision(p); }
  };
})();
