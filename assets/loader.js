/* Load life data in small batches. A birth action can start the load immediately. */
(function () {
  "use strict";
  // Keep the first playable screen usable on older Safari releases.
  if (!Object.assign) Object.assign = function (target) {
    if (target == null) throw new TypeError("Cannot assign to null or undefined");
    var result = Object(target);
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      if (source == null) continue;
      for (var key in Object(source)) {
        if (Object.prototype.hasOwnProperty.call(source, key)) result[key] = source[key];
      }
    }
    return result;
  };
  if (!Number.isInteger) Number.isInteger = function (value) {
    return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
  };
  if (!Number.isFinite) Number.isFinite = function (value) {
    return typeof value === "number" && isFinite(value);
  };
  if (!String.prototype.repeat) String.prototype.repeat = function (count) {
    count = Number(count);
    if (count < 0 || !isFinite(count)) throw new RangeError("Invalid repeat count");
    count = Math.floor(count) || 0;
    var piece = String(this), result = "";
    while (count) {
      if (count % 2) result += piece;
      count = Math.floor(count / 2);
      if (count) piece += piece;
    }
    return result;
  };
  if (!Array.prototype.find) Array.prototype.find = function (predicate, thisArg) {
    if (this == null || typeof predicate !== "function") throw new TypeError("Invalid find call");
    var list = Object(this);
    for (var i = 0; i < list.length; i++) {
      var value = list[i];
      if (predicate.call(thisArg, value, i, list)) return value;
    }
  };
  if (!Array.from) Array.from = function (source, map, thisArg) {
    if (source == null) throw new TypeError("Cannot convert null or undefined");
    var values = [], i = 0, item, iterator;
    if (typeof Symbol !== "undefined" && source[Symbol.iterator]) {
      iterator = source[Symbol.iterator]();
      while (!(item = iterator.next()).done) {
        values.push(map ? map.call(thisArg, item.value, i) : item.value);
        i++;
      }
    } else if (typeof source === "string") {
      for (i = 0; i < source.length; i++) {
        item = source.charAt(i);
        if (i + 1 < source.length && /[\uD800-\uDBFF]/.test(item)) item += source.charAt(++i);
        values.push(map ? map.call(thisArg, item, values.length) : item);
      }
    } else {
      for (i = 0; i < Number(source.length || 0); i++) values.push(map ? map.call(thisArg, source[i], i) : source[i]);
    }
    return values;
  };
  var scripts = document.currentScript ? null : document.getElementsByTagName("script");
  var current = document.currentScript || scripts[scripts.length - 1];
  var source = current.src;
  var sourcePath = source.split(/[?#]/)[0];
  var version = source.indexOf("?") < 0 ? "" : source.slice(source.indexOf("?"), source.indexOf("#") < 0 ? source.length : source.indexOf("#"));
  var base = sourcePath.slice(0, sourcePath.lastIndexOf("/") + 1);
  var birthFiles = ["data_history.js", "lifetables.js", "names.js", "culture.js", "joys.js", "dialogue.js"];
  var lifeFiles = ["facts.js", "history.js", "causes.js", "scripts.js", "chains.js", "memories.js", "emotions.js"];
  var loaded = {};
  var loading = {};
  var listeners = [];
  var completed = 0;
  var birthPromise = null;
  var fullPromise = null;
  var scheduled = null;
  var cancelScheduled = null;
  var api = { birthLoaded: false, loaded: false, readyBirth: readyBirth, ready: ready, prefetch: prefetch, onProgress: onProgress };

  function progress() {
    return { loaded: completed, total: birthFiles.length + lifeFiles.length,
      birthLoaded: api.birthLoaded, loadedAll: api.loaded };
  }

  // Subscribe to deferred-file progress; the returned function removes the listener.
  function onProgress(listener) {
    if (typeof listener !== "function") throw new TypeError("Progress listener must be a function");
    listeners.push(listener);
    listener(progress());
    return function () {
      var index = listeners.indexOf(listener);
      if (index >= 0) listeners.splice(index, 1);
    };
  }

  function reportProgress() {
    var state = progress();
    listeners.slice().forEach(function (listener) {
      try { listener(state); } catch (error) { setTimeout(function () { throw error; }, 0); }
    });
  }

  function script(name) {
    if (loaded[name]) return Promise.resolve();
    if (loading[name]) return loading[name].promise;
    var entry = {};
    loading[name] = entry;
    entry.promise = new Promise(function (resolve, reject) {
      var tag = document.createElement("script");
      tag.src = base + name + version;
      tag.onload = function () {
        loading[name] = null;
        loaded[name] = true;
        completed++;
        reportProgress();
        resolve();
      };
      tag.onerror = function () {
        loading[name] = null;
        if (tag.parentNode) tag.parentNode.removeChild(tag);
        reject(new Error("Unable to load " + name));
      };
      document.head.appendChild(tag);
    });
    return entry.promise;
  }

  function loadBatch(files) {
    // Two requests at a time leave bandwidth for the page.
    return files.reduce(function (step, _, index) {
      if (index % 2) return step;
      return step.then(function () { return Promise.all(files.slice(index, index + 2).map(script)); });
    }, Promise.resolve());
  }

  function readyBirth() {
    if (!birthPromise) {
      birthPromise = loadBatch(birthFiles).then(function () {
        window.MEGURI.refreshData();
        api.birthLoaded = true;
        reportProgress();
      }).catch(function (error) { birthPromise = null; throw error; });
    }
    return birthPromise;
  }

  function startFull() {
    if (!fullPromise) {
      fullPromise = readyBirth().then(function () { return loadBatch(lifeFiles); }).then(function () {
        window.MEGURI.refreshData();
        api.loaded = true;
        reportProgress();
      }).catch(function (error) { fullPromise = null; throw error; });
    }
    return fullPromise;
  }

  function ready() {
    if (scheduled) {
      cancelScheduled();
      scheduled = null;
      cancelScheduled = null;
    }
    return startFull();
  }

  function prefetch() {
    if (api.loaded || fullPromise) return ready();
    if (scheduled) return scheduled;
    scheduled = new Promise(function (resolve, reject) {
      function queue() {
        if (window.requestIdleCallback) {
          var id = requestIdleCallback(function () { scheduled = null; startFull().then(resolve, reject); }, { timeout: 2500 });
          cancelScheduled = function () { cancelIdleCallback(id); startFull().then(resolve, reject); };
        } else {
          var id = setTimeout(function () { scheduled = null; startFull().then(resolve, reject); }, 1200);
          cancelScheduled = function () { clearTimeout(id); startFull().then(resolve, reject); };
        }
      }
      if (document.readyState === "complete") queue();
      else {
        function onLoad() { window.removeEventListener("load", onLoad, false); queue(); }
        window.addEventListener("load", onLoad, false);
        cancelScheduled = function () { window.removeEventListener("load", onLoad, false); startFull().then(resolve, reject); };
      }
    });
    return scheduled;
  }

  window.MEGURI_DATA = api;
})();
