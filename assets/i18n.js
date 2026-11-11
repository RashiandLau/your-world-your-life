/* Shared language and data helpers for both editions of Your World, Your Life. */
(function () {
  "use strict";
  var pageLocale = String(document.documentElement.lang || "ja").toLowerCase();
  var requested = pageLocale.split("-")[0];
  var scriptLocale = /^([a-z]{2,3})-(hans|hant)(?:-|$)/.exec(pageLocale);
  var lang = scriptLocale ? scriptLocale[1] + "-" + scriptLocale[2] : /^[a-z]{2,3}$/.test(requested) ? requested : "ja";
  var extraLocale = lang !== "ja" && lang !== "en";
  var route = document.documentElement.getAttribute && document.documentElement.getAttribute("data-locale-route") || lang;
  var dictionaries = { ja: {}, en: {} };
  if (extraLocale) dictionaries[lang] = {};
  var locale = { ja: "ja-JP", en: "en-US" };

  function add(parts) {
    Object.keys(parts || {}).forEach(function (code) {
      if (!dictionaries[code]) dictionaries[code] = {};
      var entries = parts && parts[code] || {};
      Object.keys(entries).forEach(function (key) { dictionaries[code][key] = entries[key]; });
    });
  }

  function t(key, vars) {
    var value = dictionaries[lang][key];
    if (value === undefined && !extraLocale) value = dictionaries.ja[key];
    if (value === undefined) return key;
    if (extraLocale && window.I18N && window.I18N.data && window.I18N.data.formatVars) vars = window.I18N.data.formatVars(key, vars) || vars;
    return String(value).replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g, function (match, name) {
      return vars && vars[name] !== undefined ? String(vars[name]) : match;
    });
  }

  function number(value, options) {
    return Number(value).toLocaleString(locale[lang] || pageLocale, options || {});
  }

  function money(ppp, country, display) {
    var amount = Number(ppp) || 0;
    if (lang === "ja") return number(Math.round(amount * 100)) + "円";
    if (extraLocale && display === "local" && country && country.cur && country.lcu_ok !== false && Number(country.ppp_lcu) > 0) {
      return "≈" + new Intl.NumberFormat(pageLocale, { style: "currency", currency: country.cur.code,
        maximumFractionDigits: country.cur.code === "IDR" ? 0 : 2 }).format(amount * country.ppp_lcu);
    }
    return "US$" + number(Math.round(amount)) + " PPP";
  }

  function countryName(country) {
    if (extraLocale && window.I18N && window.I18N.data && window.I18N.data.countryName) return window.I18N.data.countryName(country);
    return country ? (lang === "en" && country.name_en || country.name) : "";
  }

  function countryValue(country, field, value) {
    if (extraLocale && window.I18N && window.I18N.data && window.I18N.data.countryValue) return window.I18N.data.countryValue(country, field, value);
    if (lang !== "en" || !country || value == null) return value;
    var source = country[field], translated = country[field + "_en"];
    if (!source || !translated) return value;
    var village = field === "cities" && typeof value === "string" && /の近くの村$/.test(value);
    var base = village ? value.replace(/の近くの村$/, "") : value;
    var index = source.indexOf(base);
    if (index < 0 && field === "rel") {
      index = source.map(function (item) { return item[0]; }).indexOf(base);
      if (index >= 0) return translated[index][0];
    }
    if (index < 0 || translated[index] == null) return value;
    return village ? "a village near " + translated[index] : translated[index];
  }

  function cultureOf(entry) {
    if (extraLocale && window.I18N && window.I18N.data && window.I18N.data.cultureOf) return window.I18N.data.cultureOf(entry);
    if (!entry || lang !== "en") return entry;
    var translated = {};
    Object.keys(entry).forEach(function (key) { translated[key] = entry[key]; });
    ["foods", "sports", "langs", "greeting"].forEach(function (key) {
      if (entry[key + "_en"]) translated[key] = entry[key + "_en"];
    });
    if (entry.festivals) translated.festivals = entry.festivals.map(function (festival) {
      var copy = {};
      Object.keys(festival).forEach(function (key) { copy[key] = festival[key]; });
      if (festival.name_en) copy.name = festival.name_en;
      return copy;
    });
    if (entry.housing) {
      translated.housing = {};
      Object.keys(entry.housing).forEach(function (key) { translated.housing[key] = entry.housing[key]; });
      ["urban", "rural"].forEach(function (key) {
        if (entry.housing[key + "_en"]) translated.housing[key] = entry.housing[key + "_en"];
      });
    }
    if (entry.climate) {
      translated.climate = {};
      Object.keys(entry.climate).forEach(function (key) { translated.climate[key] = entry.climate[key]; });
      if (entry.climate.note_en) translated.climate.note = entry.climate.note_en;
    }
    return translated;
  }

  function factText(fact) { return fact ? (extraLocale ? window.I18N.data.factText(fact) : lang === "en" && fact.t_en || fact.t) : ""; }
  function factSource(fact) { return fact ? (extraLocale ? window.I18N.data.factSource(fact) : lang === "en" && fact.src_en || fact.src) : ""; }
  var causeNames = {
    pneumonia: "Lower respiratory infection (including pneumonia)", diarrhea: "Diarrheal disease",
    tb: "Tuberculosis", hiv: "HIV/AIDS", malaria: "Malaria",
    child_infection: "Childhood infection, including measles", neonatal: "Newborn illness",
    maternal: "Pregnancy or childbirth complications", nutrition: "Undernutrition",
    lung_cancer: "Lung cancer", stomach_cancer: "Stomach cancer",
    colorectal_cancer: "Colorectal cancer", liver_cancer: "Liver cancer",
    breast_cancer: "Breast cancer", other_cancer: "Other cancer",
    heart: "Ischemic heart disease", stroke: "Stroke", copd: "Chronic obstructive pulmonary disease",
    diabetes: "Diabetes", kidney: "Kidney disease", cirrhosis: "Cirrhosis",
    dementia: "Dementia", road: "Road accident", drowning: "Drowning",
    falls: "Fall", violence: "Violence", conflict: "Conflict",
    disaster: "Natural disaster", selfharm: "Suicide", other: "Other illness"
  };
  function causeName(cause) {
    if (extraLocale && window.I18N.data.causeName) return window.I18N.data.causeName(cause);
    return cause ? (lang === "en" && causeNames[cause[0]] || cause[1]) : "";
  }
  function causePhrase(cause) {
    if (extraLocale && window.I18N.data.causePhrase) return window.I18N.data.causePhrase(cause);
    var name = String(cause || "").replace(/^[A-Z](?=[a-z])/, function (letter) { return letter.toLowerCase(); });
    if (lang !== "en") return name;
    var countable = {
      "lower respiratory infection (including pneumonia)": "a lower respiratory infection (including pneumonia)",
      "diarrheal disease": "a diarrheal disease",
      "childhood infection, including measles": "a childhood infection, including measles",
      "newborn illness": "an illness soon after birth",
      "road accident": "a road accident",
      "fall": "a fall",
      "stroke": "a stroke",
      "natural disaster": "a natural disaster",
      "other illness": "an unspecified illness",
      "other cancer": "another type of cancer"
    };
    return countable[name] || name;
  }

  window.I18N = {
    lang: lang,
    route: route,
    isEnglish: lang === "en",
    isTranslated: lang !== "ja",
    isExtra: extraLocale,
    locale: locale[lang] || pageLocale,
    dictionaries: dictionaries,
    add: add,
    t: t,
    number: number,
    money: money,
    countryName: countryName,
    countryValue: countryValue,
    cultureOf: cultureOf,
    factText: factText,
    factSource: factSource,
    causeName: causeName,
    causePhrase: causePhrase
  };

  add({
    ja: {
      "app.suicideContext": "自殺には、いくつもの事情が重なります。誰か一人の責任として語ることはできません。",
      "app.crisisSupport": "つらさを感じたら、身近な人や地域の相談窓口に話してください。差し迫った危険があるときは、地域の緊急通報先に連絡してください。",
      "app.findSupport": "地域の相談先を探す",
      "app.safetySupport": "被害のあとも、相談できる場所があります。",
      "app.survivorCare": "遺された人も、悲しみや戸惑いを一人で抱える必要はありません。支えてくれる人に話してかまいません。",
      "app.checkupDeferredCare": "先送りにしていた治療を、もう一度相談できる場合があります。",
      "app.reportCare": "病気とケアの記録",
      "app.healthSupportAid": "暮らしを助ける道具を使った",
      "app.healthSupportCommunity": "身近な人に手助けを相談した",
      "app.lateCareHome": "自宅で受ける支えを相談した",
      "app.lateCareHospice": "緩和ケアについて相談した"
    },
    en: {
      "app.suicideContext": "Many circumstances can contribute to a suicide. It cannot be attributed to one person's actions.",
      "app.crisisSupport": "If you are struggling, talk to someone you trust or a local support service. If you are in immediate danger, contact your local emergency service.",
      "app.findSupport": "Find a local support service",
      "app.safetySupport": "Support remains available after harm.",
      "app.survivorCare": "People left behind may also need support. It is okay to talk about grief or confusion with someone you trust.",
      "app.checkupDeferredCare": "A checkup may give you another chance to discuss treatment you postponed.",
      "app.reportCare": "Health and care",
      "app.healthSupportAid": "Used an assistive device",
      "app.healthSupportCommunity": "Asked people nearby for practical help",
      "app.lateCareHome": "Asked about support at home for late-stage illness",
      "app.lateCareHospice": "Asked about palliative care"
    }
  });
}());
