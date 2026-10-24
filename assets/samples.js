/* Deterministic sample lives for the home page and memorial browser. */
(function () {
  "use strict";

  // Two seeds for every broad region, era and sex combination. The era for a
  // seed is determined by its offset from 50000 modulo three.
  var SEEDS = [
    50000, 50001, 50002, 50003, 50004, 50005, 50006, 50007, 50008, 50010,
    50011, 50013, 50014, 50015, 50016, 50017, 50021, 50022, 50026, 50027,
    50028, 50032, 50036, 50037, 50038, 50039, 50041, 50042, 50049, 50054,
    50063, 50065, 50069, 50071, 50091, 50093, 50099, 50100, 50112, 50117,
    50137, 50138, 50170, 50172, 50178, 50191, 50215, 50278, 50283, 50594,
    50632, 51132, 51142, 51963, 52478, 54843, 55413, 55931, 56927, 58819
  ];
  var ERAS = ["past", "now", "future"];
  var cachedEngine = null;
  var cachedRecords = null;

  function regionOf(country) {
    var name = country && country.region_en || "";
    if (name.indexOf("Africa") !== -1) return "africa";
    if (name.indexOf("Asia") !== -1) return "asia";
    if (name.indexOf("Europe") !== -1) return "europe";
    if (name.indexOf("America") !== -1 || name.indexOf("Caribbean") !== -1) return "americas";
    return "oceania";
  }

  function build(engine) {
    if (cachedEngine === engine && cachedRecords) return cachedRecords;
    var records = SEEDS.map(function (seed, index) {
      var era = ERAS[(seed - 50000) % ERAS.length];
      var record = engine.simulateFull(seed, { era: era, method: "births" });
      record.era = era;
      record.sample = true;
      record.sampleRegion = regionOf(engine.BY[record.iso]);
      record.mins = 4 + index * 7 + seed % 5;
      record.candles = seed % 5;
      return record;
    });
    cachedEngine = engine;
    cachedRecords = records;
    return records;
  }

  // Local calendar days make the row change at the visitor's midnight.
  function dayNumber(date) {
    var d = date || new Date();
    return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  }

  function daily(records, date) {
    if (!records.length) return [];
    var day = dayNumber(date);
    var count = Math.min(3, records.length);
    var picked = [];
    // A coprime stride visits all 60 entries in each 20-day cycle.
    for (var i = 0; i < count; i++) {
      var slot = (day * 3 + i) % records.length;
      picked.push(records[(slot * 37 + 11) % records.length]);
    }
    return picked;
  }

  function filter(records, options) {
    options = options || {};
    return records.filter(function (record) {
      return (!options.region || record.sampleRegion === options.region) &&
        (!options.era || record.era === options.era);
    });
  }

  window.SAMPLE_LIVES = { build: build, daily: daily, filter: filter, regionOf: regionOf };
})();
