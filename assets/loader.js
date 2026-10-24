/* Load reference data after the first frame, while keeping simulation entry points gated. */
(function () {
  "use strict";
  var source = document.currentScript.src;
  var version = new URL(source, document.baseURI).search;
  var base = new URL("./", source);
  var files = ["lifetables.js", "facts.js", "history.js", "causes.js", "culture.js", "names.js", "joys.js", "scripts.js"];
  var promise = null;
  var api = { loaded: false, ready: ready };

  function script(name) {
    return new Promise(function (resolve, reject) {
      var tag = document.createElement("script");
      tag.src = new URL(name + version, base).href;
      tag.onload = resolve;
      tag.onerror = function () { tag.remove(); reject(new Error("Unable to load " + name)); };
      document.head.appendChild(tag);
    });
  }

  function ready() {
    if (!promise) {
      promise = Promise.all(files.map(script)).then(function () {
        window.MEGURI.refreshData();
        api.loaded = true;
      }).catch(function (error) { promise = null; throw error; });
    }
    return promise;
  }

  window.MEGURI_DATA = api;
  requestAnimationFrame(function () { setTimeout(function () { ready().catch(function () {}); }, 0); });
})();
