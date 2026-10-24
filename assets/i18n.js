/* Shared language and data helpers for both editions of Your World, Your Life. */
(function () {
  "use strict";
  var lang = document.documentElement.lang === "en" ? "en" : "ja";
  var dictionaries = { ja: {}, en: {} };

  function add(parts) {
    ["ja", "en"].forEach(function (code) {
      var entries = parts && parts[code] || {};
      Object.keys(entries).forEach(function (key) { dictionaries[code][key] = entries[key]; });
    });
  }

  function t(key, vars) {
    var value = dictionaries[lang][key];
    if (value === undefined) value = dictionaries.ja[key];
    if (value === undefined) return key;
    return String(value).replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g, function (match, name) {
      return vars && vars[name] !== undefined ? String(vars[name]) : match;
    });
  }

  function countryName(country) {
    return country ? (lang === "en" && country.name_en || country.name) : "";
  }

  function countryValue(country, field, value) {
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

  function factText(fact) { return fact ? (lang === "en" && fact.t_en || fact.t) : ""; }
  function factSource(fact) { return fact ? (lang === "en" && fact.src_en || fact.src) : ""; }
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
    return cause ? (lang === "en" && causeNames[cause[0]] || cause[1]) : "";
  }

  window.I18N = {
    lang: lang,
    isEnglish: lang === "en",
    dictionaries: dictionaries,
    add: add,
    t: t,
    countryName: countryName,
    countryValue: countryValue,
    cultureOf: cultureOf,
    factText: factText,
    factSource: factSource,
    causeName: causeName
  };
}());
