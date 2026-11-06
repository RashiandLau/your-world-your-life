/* Private, browser-local records and reflection. No network access. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.MEGURI_REFLECTION = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';

  var KEY = 'meguri.records.v2';
  var LEGACY = [{ key: 'meguri.past', locale: 'ja' }, { key: 'meguri.en.past', locale: 'en' }];

  function copy(value) {
    try { return JSON.parse(JSON.stringify(value)); } catch (e) { return null; }
  }
  function finite(value) { return typeof value === 'number' && isFinite(value); }
  function validId(value) { return typeof value === 'string' && value.length > 0 && value.length < 2000; }
  function normalizeRecord(record, legacyLocale) {
    if (!record || !validId(record.id) || !record.death || !finite(Number(record.death.age))) return null;
    var result = copy(record);
    if (!result) return null;
    if (typeof result.locale !== 'string' || !/^[a-z]{2,3}$/.test(result.locale)) {
      if (legacyLocale === 'ja' || legacyLocale === 'en') result.locale = legacyLocale;
      else if (typeof result.summary === 'string') result.locale = /[\u3040-\u30ff\u3400-\u9fff]/.test(result.summary) ? 'ja' : 'en';
      else delete result.locale;
    }
    result.playerDirected = result.playerDirected === true;
    result.personalNote = typeof result.personalNote === 'string' ? result.personalNote.slice(0, 2000) : '';
    result.retained = result.retained === true;
    result.resident = result.resident === true;
    if (Array.isArray(result.stars)) result.stars = result.stars.slice(-24);
    return result;
  }
  function mergeRecords() {
    var byId = Object.create(null);
    for (var i = 0; i < arguments.length; i++) {
      var list = arguments[i];
      if (!Array.isArray(list)) continue;
      for (var j = 0; j < list.length; j++) {
        var record = normalizeRecord(list[j]);
        if (record) byId[record.id] = record;
      }
    }
    return Object.keys(byId).map(function (id) { return byId[id]; }).sort(function (a, b) {
      return (Number(a.ended) || 0) - (Number(b.ended) || 0) || a.id.localeCompare(b.id);
    });
  }
  function axesOf(record) {
    var raw = record && record.texture && record.texture.axes;
    if (!Array.isArray(raw) || raw.length !== 4) return null;
    var values = raw.map(function (axis) { return axis && Number(axis[2]); });
    return values.every(function (value) { return finite(value) && value >= 0 && value <= 1; }) ? values : null;
  }
  function pattern(record) {
    var axes = axesOf(record);
    return axes ? axes.map(function (value) { return value >= 0.5 ? '1' : '0'; }).join('') : null;
  }
  function profile(records) {
    var directed = (Array.isArray(records) ? records : []).filter(function (record) {
      return record && record.playerDirected === true && axesOf(record);
    });
    if (!directed.length) return null;
    var axes = [0, 0, 0, 0];
    directed.forEach(function (record) {
      axesOf(record).forEach(function (value, i) { axes[i] += value; });
    });
    axes = axes.map(function (value) { return value / directed.length; });
    return { count: directed.length, axes: axes, strength: axes.map(function (value) { return Math.abs(value - 0.5) * 2; }) };
  }
  function pairedMoment(records, index) {
    var choices = [];
    (Array.isArray(records) ? records : []).forEach(function (record) {
      if (!record || record.playerDirected !== true) return;
      var seen = Object.create(null);
      [record.stars, record.big, record.memories].forEach(function (items) {
        if (!Array.isArray(items)) return;
        items.forEach(function (item) {
          var age = Number(item && (item.a == null ? item.age : item.a));
          var text = item && (item.t || item.text);
          if (!finite(age) || typeof text !== 'string' || !text.trim()) return;
          var key = age + '\u0000' + text;
          if (seen[key]) return;
          seen[key] = true;
          choices.push({ record: record, moment: { a: age, t: text } });
        });
      });
    });
    if (choices.length < 2) return null;
    var offset = Math.abs(Math.floor(Number(index) || 0)) % choices.length;
    var first = choices[offset], second = choices[(offset + Math.max(1, Math.floor(choices.length / 2))) % choices.length];
    return [copy(first), copy(second)];
  }
  function createArchive(storage) {
    function parse(key) {
      try {
        var raw = storage.getItem(key);
        return raw == null ? null : JSON.parse(raw);
      } catch (e) { return null; }
    }
    function write(records) {
      try {
        storage.setItem(KEY, JSON.stringify(records));
        return { ok: true, records: records };
      } catch (e) {
        return { ok: false, records: records, error: e && e.name || 'storage' };
      }
    }
    function load() {
      var current = parse(KEY);
      if (Array.isArray(current)) return mergeRecords(current);
      var old = LEGACY.map(function (source) {
        var list = parse(source.key);
        return Array.isArray(list) ? list.map(function (record) { return normalizeRecord(record, source.locale); }).filter(Boolean) : [];
      });
      var migrated = mergeRecords.apply(null, old);
      write(migrated); // Keep legacy keys; a failed write must never erase them.
      return migrated;
    }
    function merge(records) {
      return write(mergeRecords(load(), records));
    }
    function save(record) {
      var normalized = normalizeRecord(record);
      if (!normalized) return { ok: false, records: load(), error: 'invalid_record' };
      return merge([normalized]);
    }
    function remove(id) {
      if (!validId(id)) return { ok: false, records: load(), error: 'invalid_id' };
      return write(load().filter(function (record) { return record.id !== id; }));
    }
    function importData(data) {
      var records = Array.isArray(data) ? data : data && (data.records || data.past);
      if (!Array.isArray(records)) return { ok: false, records: load(), error: 'invalid_import' };
      return merge(records);
    }
    return {
      key: KEY,
      list: load,
      save: save,
      merge: merge,
      remove: remove,
      clear: function () { return write([]); },
      importData: importData,
      exportData: function () { return { app: 'Your World, Your Life', v: 2, past: load() }; }
    };
  }
  return { key: KEY, normalizeRecord: normalizeRecord, mergeRecords: mergeRecords,
    createArchive: createArchive, profile: profile, pairedMoment: pairedMoment, pattern: pattern };
});
