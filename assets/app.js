/* Your World, Your Life：最初の画面・出生届・一生の画面・ふりかえり・死亡記録 */
(function () {
  "use strict";
  var E = window.MEGURI, P = window.PIXEL, C = E.C, BY = E.BY;
  var english = document.documentElement.lang === "en";
  function t(key, vars) { return window.I18N.t("app." + key, vars); }
  function country(c) { return c ? (english && c.name_en || c.name) : ""; }
  function countryIn(c) {
    if (!english || !c) return country(c);
    if (c.iso === "gmb") return "the Gambia";
    return { cod: 1, usa: 1, phl: 1, gbr: 1, caf: 1, dom: 1, cog: 1, nld: 1, are: 1, slb: 1, mdv: 1 }[c.iso] ? "the " + country(c) : country(c);
  }
  function religion(p) { return english ? window.I18N.countryValue(BY[p.iso], "rel", p.religion) : p.religion; }
  function abroad(p) { return english ? window.I18N.countryValue(BY[p.iso], "emig", p.abroad) : p.abroad; }
  function abroadIn(p) { var value = abroad(p), destination = C.filter(function (c) { return country(c) === value; })[0]; return destination ? countryIn(destination) : value; }
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function fmt(n) { return Math.round(n).toLocaleString(english ? "en-US" : "ja-JP"); }
  function yen(ppp) {
    if (english) return (ppp < 0 ? "-" : "") + "$" + Math.abs(ppp).toLocaleString("en-US", { maximumFractionDigits: 0 });
    var v = ppp * E.YEN_PER_PPP;
    var s = v < 0 ? "-" : "";
    v = Math.abs(v);
    if (v >= 1e8) return s + (v / 1e8).toFixed(1) + "億円";
    if (v >= 1e4) return s + (v / 1e4).toFixed(v >= 1e6 ? 0 : 1) + "万円";
    return s + fmt(v) + "円";
  }

  // ---------- 保存 ----------
  var storagePrefix = english ? "meguri.en." : "meguri.";
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(storagePrefix + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(storagePrefix + k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(storagePrefix + k); } catch (e) {} }
  };
  function guessCountry() {
    var l = (navigator.language || "").toLowerCase();
    var m = { ja: "jpn", ko: "kor", zh: "chn", de: "deu", fr: "fra", vi: "vnm", th: "tha", ru: "rus", tr: "tur", id: "idn", "en-gb": "gbr", "en-us": "usa", "pt-br": "bra", "es-mx": "mex", hi: "ind", bn: "bgd", fa: "irn", ar: "egy" };
    return m[l] || m[l.split("-")[0]] || "";
  }
  var settings = Object.assign({ era: "now", year: "random", method: "births", length: "30", gentle: false, real: guessCountry() }, store.get("settings", {}));
  if (settings.year !== "random" && !(Number.isInteger(+settings.year) && +settings.year >= 1950 && +settings.year <= 2025)) settings.year = "random";
  var sharedStart = window.SHARE && window.SHARE.parseStartParams(window.location.search, C.map(function (c) { return c.iso; }));
  if (sharedStart && sharedStart.year) { settings.era = sharedStart.era; settings.year = sharedStart.era === "past" ? String(sharedStart.year) : "random"; }
  function saveSettings() { store.set("settings", settings); }
  var eduMode = /(?:^|[?&])edu=1(?:&|$)/.test(window.location.search || "");
  var homeUrl = eduMode ? "index.html?edu=1" : "index.html";
  if (eduMode) document.documentElement.classList.add("edu-mode");

  var life = store.get("life", null);
  if (life && (life.v !== 1 || !BY[life.iso])) life = null;
  var speed = 1, paused = false, fast = false, minimized = false, currentDecision = null;
  var dataActionPending = false;
  function withData(callback) {
    if (window.MEGURI_DATA.loaded) { callback(); return; }
    if (dataActionPending) return;
    dataActionPending = true;
    var buttons = $$('[data-born]');
    buttons.forEach(function (button) { button.dataset.oldLabel = button.textContent; button.textContent = t("preparing"); button.disabled = true; });
    window.MEGURI_DATA.ready().then(function () {
      dataActionPending = false;
      buttons.forEach(function (button) { button.textContent = button.dataset.oldLabel; button.disabled = false; });
      callback();
    }, function () {
      dataActionPending = false;
      buttons.forEach(function (button) { button.textContent = button.dataset.oldLabel; button.disabled = false; });
      toast(t("loadFailed"));
    });
  }

  // ---------- 共通UI ----------
  var toastT;
  function toast(msg) {
    if (english && window.I18N.appTranslate) msg = window.I18N.appTranslate(msg);
    var t = $("#toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }
  var modalOnClose = null;
  function openModal(title, html, onMount, onClose) {
    if (english && window.I18N.appTranslateHtml) {
      title = window.I18N.appTranslate(title);
      html = window.I18N.appTranslateHtml(html);
    }
    $("#mTitle").textContent = title;
    // 前のモーダルで付けたクリック処理が残らないよう、本文の要素ごと入れ替える
    var oldBody = $("#mBody"), body = oldBody.cloneNode(false);
    oldBody.parentNode.replaceChild(body, oldBody);
    body.innerHTML = html;
    $("#modal").classList.add("open");
    modalOnClose = onClose || null;
    if (onMount) onMount($("#mBody"));
    $("#mBody").scrollTop = 0;
  }
  function closeModal() {
    $("#modal").classList.remove("open");
    var f = modalOnClose; modalOnClose = null;
    if (f) f();
  }
  $("#mClose").addEventListener("click", closeModal);
  $("#modal").addEventListener("click", function (e) { if (e.target.id === "modal") closeModal(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && $("#modal").classList.contains("open")) closeModal();
    if (e.key === "Escape" && $("#bMore") && $("#bMore").getAttribute("aria-expanded") === "true") {
      $("#bMore").setAttribute("aria-expanded", "false");
      $("#bMore").focus();
    }
    if (currentDecision && $("#modal").classList.contains("open") && /^[1-5]$/.test(e.key) && document.activeElement.tagName !== "TEXTAREA") {
      var b = $$(".choice", $("#mBody"))[+e.key - 1];
      if (b) b.click();
    }
    if (e.key === " " && !$("#life").hidden && !$("#modal").classList.contains("open") && document.activeElement.tagName !== "TEXTAREA") { e.preventDefault(); togglePause(); }
  });
  function show(view) {
    ["home", "lab", "cert", "life", "dead"].forEach(function (v) { $("#" + v).hidden = v !== view; });
    window.scrollTo(0, 0);
  }

  // ---------- 音 ----------
  var audio = null;
  function toggleMusic() {
    if (audio) { audio.stop(); audio = null; syncMusic(); return; }
    var ctx = null;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      var master = ctx.createGain(), filter = ctx.createBiquadFilter(), dry = ctx.createGain(), wet = ctx.createGain(), reverb = ctx.createConvolver();
      var impulse = ctx.createBuffer(2, Math.floor(ctx.sampleRate * 1.4), ctx.sampleRate);
      for (var ch = 0; ch < 2; ch++) {
        var data = impulse.getChannelData(ch);
        for (var n = 0; n < data.length; n++) data[n] = (Math.random() * 2 - 1) * Math.pow(1 - n / data.length, 2.6);
      }
      reverb.buffer = impulse;
      filter.type = "lowpass"; filter.frequency.value = 780; filter.Q.value = 0.25;
      dry.gain.value = 0.82; wet.gain.value = 0.18;
      filter.connect(dry); dry.connect(master);
      filter.connect(reverb); reverb.connect(wet); wet.connect(master);
      master.connect(ctx.destination);
      if (ctx.state === "suspended" && typeof ctx.resume === "function") ctx.resume();
      var audioStarted = ctx.currentTime;
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.052, ctx.currentTime + 2);
      var active = [], timer = null, chordAt = ctx.currentTime + 0.05, melodyAt = chordAt + 1.5, chordStep = 0, melodyStep = 0;
      var chords = [[130.81, 196, 261.63, 329.63], [110, 164.81, 220, 261.63], [87.31, 130.81, 174.61, 261.63], [98, 146.83, 196, 293.66]];
      var melody = [392, 440, 523.25, 659.25, 587.33, 440, 392, 329.63, 293.66, 392];
      function note(freq, when, length, level, type, attack) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = type; o.frequency.setValueAtTime(freq, when);
        g.gain.setValueAtTime(0.0001, when);
        g.gain.linearRampToValueAtTime(level, when + attack);
        g.gain.setValueAtTime(level, when + Math.max(attack, length - 1.5));
        g.gain.exponentialRampToValueAtTime(0.0001, when + length);
        o.connect(g); g.connect(filter); active.push({ node: o, start: when });
        o.onended = function () { var i = active.map(function (x) { return x.node; }).indexOf(o); if (i >= 0) active.splice(i, 1); o.disconnect(); g.disconnect(); };
        o.start(when); o.stop(when + length + 0.05);
      }
      function schedule() {
        var until = ctx.currentTime + 2.5;
        while (chordAt < until) {
          chords[chordStep % chords.length].forEach(function (f) { note(f, chordAt, 7.5, 0.13, "triangle", 1.8); });
          chordStep++; chordAt += 8;
        }
        while (melodyAt < until) {
          if (melodyStep % 4 !== 3) note(melody[melodyStep % melody.length], melodyAt, 2.3, 0.11, "sine", 0.45);
          melodyStep++; melodyAt += 2.6;
        }
        timer = setTimeout(schedule, 1300);
      }
      schedule();
      audio = { stop: function () {
        clearTimeout(timer);
        var end = ctx.currentTime + 2;
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setValueAtTime(Math.min(0.052, Math.max(0, (ctx.currentTime - audioStarted) / 2 * 0.052)), ctx.currentTime);
        master.gain.linearRampToValueAtTime(0, end);
        active.forEach(function (x) { try { x.node.stop(Math.max(end, x.start + 0.01)); } catch (e) {} });
        setTimeout(function () { ctx.close(); }, 2200);
      } };
    } catch (e) { if (ctx) ctx.close(); toast(t("musicUnavailable")); }
    syncMusic();
  }
  function syncMusic() { $$("[data-music]").forEach(function (b) { b.setAttribute("aria-pressed", audio ? "true" : "false"); b.textContent = audio ? t("musicOn") : t("musicOff"); }); }
  document.addEventListener("click", function (e) { var b = e.target.closest("[data-music]"); if (b) toggleMusic(); });
  document.addEventListener("click", function (e) {
    var more = $("#bMore");
    if (more && more.getAttribute("aria-expanded") === "true" && !e.target.closest(".life-more-menu")) more.setAttribute("aria-expanded", "false");
  });

  // =====================================================================
  // 見本の一生（決まった種から毎回同じものをつくる）
  // =====================================================================
  var COMMENTS = {
    long: ["長かったなあ。最後の10年がいちばん穏やかだった。", "100年近く生きた人の記録は、それだけで一冊の本みたい。", "孫の顔を見られてよかった。"],
    short: ["もう少し時間があれば、と思わずにいられない。", "数字の重さを、はじめて自分ごととして感じた。"],
    moved: ["国を出る決断をした場面で、しばらく手が止まった。", "遠くで働いて仕送りを続けた一生。家族は誇りに思ったはず。"],
    poor: ["お金はなかったけれど、ずっと誰かと笑っていた気がする。", "学校に行けなかったのがずっと引っかかっている。"],
    univ: ["大学に行けたのは、生まれた家のおかげでもあると思う。", "仕事ひとすじ。でも最後に思い出したのは家族のことだった。"],
    any: ["思っていたより、ずっと普通の一生だった。それがよかった。", "同じ1秒に生まれた人たちの近況が、妙に気になった。", "途中から自分で決めるのをやめて、見守ることにした。"]
  };
  var samples = [];
  function buildSamples() {
    if (samples.length) return;
    samples = window.SAMPLE_LIVES.build(E);
    samples.forEach(function (r, index) {
      var key = r.death.age >= 80 ? "long" : r.death.age < 45 ? "short" : r.lived.indexOf(english ? "," : "、") >= 0 ? "moved" : r.edu === E.EDU_LABEL.univ ? "univ" : r.wealth <= 2 ? "poor" : "any";
      var rr = window.PIXEL.seeded(9001 + index);
      var pool = COMMENTS[key].concat(COMMENTS.any);
      r.comment = pool[Math.floor(rr() * pool.length)];
      r.headline = headline(r);
    });
  }
  function headline(r) {
    if (english) {
      if (r.death.age < 5) return "A short life that was truly here";
      if (r.job !== "—") return r.death.age + " years lived as " + r.job;
      return r.death.age + " years of life in " + countryIn(BY[r.iso]);
    }
    if (r.death.age < 5) return "短く、たしかにここにいた一生";
    if (r.job !== "—") return r.job + "として生きた" + r.death.age + "年";
    return r.country + "で" + r.death.age + "年を生きた一生";
  }
  function memCard(r, lg) {
    return '<button class="memcard' + (lg ? " lg" : "") + '" data-rec="' + esc(r.id) + '"><canvas class="pixel" data-scene="' + esc(r.id) + '"></canvas><div class="b"><div class="n">' + esc(r.name) + '</div><div class="y">' + r.birthYear + " – " + r.death.year + " · " + esc(r.country) + "</div>" + (lg ? '<div class="w">' + esc(r.headline) + '</div><div class="c">' + "🕯".repeat(r.candles) + "</div>" : "") + "</div></button>";
  }
  function paintScenes(root) {
    $$("canvas[data-scene]", root).forEach(function (cv) {
      var r = findRecord(cv.getAttribute("data-scene"));
      if (!r) return;
      var ppl = [{ age: Math.min(80, r.death.age), sex: r.sex }];
      for (var i = 0; i < Math.min(4, r.kids); i++) ppl.push({ age: Math.max(4, r.death.age - 28 - i * 3), sex: i % 2 ? "f" : "m" });
      P.scene(cv, { seed: hash(r.id), urban: r.urban, wealth: r.wealth, people: ppl, grp: BY[r.iso].grp, festive: true, mode: "dusk", candles: r.candles || 0 });
    });
  }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function findRecord(id) {
    return samples.filter(function (s) { return s.id === id; })[0] || store.get("past", []).filter(function (s) { return s.id === id; })[0];
  }
  function shareCard(r) {
    var hearts = store.get("hearts", {});
    var on = !!hearts[r.id];
    return '<article class="share"><h3>' + esc(r.name) + '</h3> <span class="who">' + esc(r.country) + " · " + (r.sex === "m" ? "男性" : "女性") + " · " + r.death.age + '歳</span><span class="when">' + r.mins + '分前</span><p class="sum">' + esc(r.summary) + '</p><p class="q">「' + esc(r.comment) + '」</p><div class="acts"><button class="heart" data-heart="' + esc(r.id) + '" aria-pressed="' + on + '">心にとめる</button>' + (on ? "<span>あなたがこの一生を心にとめました</span>" : "") + '<button class="report" data-report>通報</button></div></article>';
  }

  // =====================================================================
  // 最初の画面
  // =====================================================================
  function renderHome() {
    var t0 = Date.now();
    setInterval(function () {
      var s = (Date.now() - t0) / 1000;
      $("#cBorn").textContent = fmt(s * 4.2);
      $("#cDied").textContent = fmt(s * 2.0);
    }, 250);
    var th = E.todayTheme();
    $("#themeName").textContent = english && th.name_en || th.name;
    $("#themeDesc").textContent = english && th.desc_en || th.desc;
    var prev = "";
    setInterval(function () {
      var c = E.pickCountry(settings.method);
      if (country(c) === prev) return;
      prev = country(c);
      $("#justBorn").textContent = t("justBorn", { country: country(c) });
    }, 1700);

    var heroMap = $("#heroMap");
    heroMap.innerHTML = P.worldSVG({ w: 540, h: 300, links: true, hrefPrefix: "", labels: 8,
      label: t("birthMapLabel"),
      bubbles: C.map(function (c) { return { lon: c.lon, lat: c.lat, iso: c.iso, name: country(c), name_en: c.name_en, share: c.share }; }) }) +
      '<div class="map-tooltip" id="mapTooltip" role="status" hidden></div>';
    heroMap.insertAdjacentHTML("afterend", '<div class="map-legend-row" aria-label="円の大きさと出生割合"><span class="map-legend-heading">円の大きさ · 世界の出生の割合</span><span class="map-legend-item"><i class="map-legend-swatch map-legend-large"></i>17%</span><span class="map-legend-item"><i class="map-legend-swatch map-legend-medium"></i>5%</span><span class="map-legend-item"><i class="map-legend-swatch map-legend-small"></i>1%</span></div><p class="map-caption">円の大きさは各国の出生割合を示します。円を押すと国別ページが開きます。</p>');
    var mapTooltip = $("#mapTooltip"), tappedIso = "", touchClick = false;
    function showMapTip(bubble, clientX, clientY) {
      var share = +bubble.getAttribute("data-share"), box = heroMap.getBoundingClientRect();
      mapTooltip.textContent = bubble.getAttribute("data-name") + " · " + (english ? share ? share.toFixed(share < 0.1 ? 2 : 1).replace(/\.0$/, "") + "% of births · around 1 in " + Math.round(100 / share) : "under 0.01% of births" : share ? share.toFixed(share < 0.1 ? 2 : 1).replace(/\.0$/, "") + "% · " + Math.round(100 / share) + "人に1人" : "0.01%未満 · ごく少数");
      mapTooltip.hidden = false;
      mapTooltip.style.left = Math.max(8, Math.min(box.width - mapTooltip.offsetWidth - 8, clientX - box.left + 12)) + "px";
      mapTooltip.style.top = Math.max(8, Math.min(box.height - mapTooltip.offsetHeight - 8, clientY - box.top - mapTooltip.offsetHeight - 8)) + "px";
    }
    heroMap.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      var bubble = e.target.closest(".map-bubble");
      if (bubble) showMapTip(bubble, e.clientX, e.clientY);
      else mapTooltip.hidden = true;
    });
    heroMap.addEventListener("pointerleave", function (e) { if (e.pointerType !== "touch") mapTooltip.hidden = true; });
    heroMap.addEventListener("pointerdown", function (e) { touchClick = e.pointerType === "touch"; });
    heroMap.addEventListener("focusin", function (e) {
      var bubble = e.target.querySelector(".map-bubble");
      if (bubble) { var box = bubble.getBoundingClientRect(); showMapTip(bubble, box.left + box.width / 2, box.top); }
    });
    heroMap.addEventListener("focusout", function () { mapTooltip.hidden = true; });
    heroMap.addEventListener("click", function (e) {
      var link = e.target.closest(".map-link");
      if (!link) return;
      var bubble = link.querySelector(".map-bubble"), iso = bubble.getAttribute("data-iso");
      if (touchClick) {
        touchClick = false;
        if (tappedIso !== iso) { e.preventDefault(); tappedIso = iso; showMapTip(bubble, e.clientX, e.clientY); }
      }
    });
    var top = C.slice().sort(function (a, b) { return b.share - a.share; }).slice(0, 9);
    var rest = 100 - top.reduce(function (s, c) { return s + c.share; }, 0);
    var max = Math.max(top[0].share, rest);
    $("#birthBars").innerHTML = top.map(function (c) { return [country(c), c.share, "c/" + c.iso + "/index.html"]; }).concat([[t("otherCountries"), rest, null]]).map(function (x) {
      return "<div class=\"birth-bar\"><div>" + (x[2] ? '<a href="' + x[2] + '" style="color:inherit;text-decoration:none">' + esc(x[0]) + "</a>" : esc(x[0])) + '</div><div class="track"><div class="fill" style="width:' + (x[1] / max * 100).toFixed(1) + '%;' + (x[2] ? "" : "opacity:.55") + '"></div></div><div class="pct">' + x[1].toFixed(1) + "%</div></div>";
    }).join("");

    // 設定
    $$("[data-setting]").forEach(function (seg) {
      var key = seg.getAttribute("data-setting");
      var sync = function () { $$("button", seg).forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-v") === String(settings[key]) ? "true" : "false"); }); };
      seg.addEventListener("click", function (e) {
        var b = e.target.closest("button"); if (!b) return;
        settings[key] = b.getAttribute("data-v"); saveSettings(); sync(); eraHelp();
        if (key === "method" && window.MEGURI_DATA.loaded) simPopulation();
      });
      sync();
    });
    function eraHelp() {
      var chosen = settings.year === "random" ? t("yearRandom") : t("yearValue", { year: settings.year });
      $("#eraHelp").textContent = t("era." + settings.era) + (settings.era === "past" ? " " + t("yearBeforeBirth", { year: chosen }) : "");
      $("#birthYearControl").hidden = settings.era !== "past";
    }
    var yearControl = document.createElement("label");
    yearControl.id = "birthYearControl";
    yearControl.className = "birth-year-control";
    yearControl.innerHTML = '<span>' + esc(t("yearLabel")) + '</span><select id="birthYear" aria-label="' + esc(t("yearLabel")) + '"><option value="random">' + esc(t("yearRandom")) + '</option>' + Array.from({ length: 76 }, function (_, i) { return 2025 - i; }).map(function (year) { return '<option value="' + year + '">' + year + '</option>'; }).join("") + '</select>';
    $("#eraHelp").parentNode.insertBefore(yearControl, $("#eraHelp"));
    $("#birthYear").value = String(settings.year);
    $("#birthYear").addEventListener("change", function () { settings.year = this.value; saveSettings(); eraHelp(); });
    eraHelp();
    var sel = $("#realCountry");
    sel.innerHTML = '<option value="">' + t("noCountry") + '</option>' + C.slice().sort(function (a, b) { return country(a).localeCompare(country(b), english ? "en" : "ja"); }).map(function (c) { return '<option value="' + c.iso + '">' + esc(country(c)) + "</option>"; }).join("");
    sel.value = settings.real || "";
    sel.addEventListener("change", function () { settings.real = sel.value; saveSettings(); });
    var gb = $("#gentleBtn");
    var syncG = function () { gb.setAttribute("aria-pressed", settings.gentle ? "true" : "false"); gb.textContent = settings.gentle ? t("gentleOn") : t("gentleOff"); };
    gb.addEventListener("click", function () { settings.gentle = !settings.gentle; saveSettings(); syncG(); });
    syncG();
    if (eduMode) {
      $("#ageNote").textContent = english ? "Ages 12+" : "12歳以上";
      $("#eduNotice").hidden = false;
      $("#classCodeBox").hidden = false;
      $("#normalLabLink").hidden = true;
      $("#openLab").hidden = false;
    } else {
      $("#openLab").hidden = true;
      $("#normalLabLink").hidden = false;
    }
    $("#labBack").href = homeUrl;
    syncMusic();
    syncResume();
    requestAnimationFrame(function () { setTimeout(function () {
      window.MEGURI_DATA.ready().then(function () {
        // Allow a birth click to run as soon as the data is ready.
        setTimeout(function () {
          if (!eduMode) {
            buildSamples();
            $("#miniMem").innerHTML = window.SAMPLE_LIVES.daily(samples).map(function (r) { return memCard(r); }).join("");
            $("#memTrack").innerHTML = samples.slice(0, 12).map(function (r) { return memCard(r, true); }).join("");
            paintScenes($("#home"));
            renderShares();
          }
          simPopulation();
        }, 0);
      }, function () {});
    }, 0); });
  }
  function syncResume() {
    var b = $("#resumeBtn");
    if (life && !life.ended && (!eduMode || (life.settings && life.settings.edu))) { b.hidden = false; b.textContent = t("resume", { name: life.given, age: life.age }); }
    else b.hidden = true;
  }
  function renderShares(all) {
    var list = all ? samples : samples.slice(3, 6);
    var html = list.map(shareCard).join("");
    if (all) return html;
    $("#shares").innerHTML = html;
  }
  function simPopulation() {
    var saved = Math.random;
    var R = E.rng(4242);
    E.setRandom(R);
    var cnt = {}, ages = {};
    for (var i = 0; i < 10000; i++) {
      var c = E.pickCountry(settings.method);
      var sex = R() < 0.512 ? "m" : "f";
      cnt[c.iso] = (cnt[c.iso] || 0) + 1;
      (ages[c.iso] = ages[c.iso] || []).push(E.sampleDeath(E.lifeTable(c, sex, "now", 2026)));
    }
    E.setRandom(saved);
    var order = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; });
    $("#simCounts").innerHTML = order.slice(0, 10).map(function (k) { return "<b>" + esc(BY[k].name) + "</b> " + fmt(cnt[k]) + "人"; }).join("　");
    var tot = C.reduce(function (s, c) { return s + (settings.method === "pop" ? c.pop : c.share); }, 0);
    $("#simTable").innerHTML = order.slice(0, 7).map(function (k) {
      var c = BY[k], real = (settings.method === "pop" ? c.pop : c.share) / tot * 100;
      var avg = ages[k].reduce(function (s, x) { return s + x; }, 0) / ages[k].length;
      return '<tr><td><a href="c/' + k + '/index.html">' + esc(c.name) + "</a></td><td>" + (cnt[k] / 100).toFixed(1) + '%<span class="r">実際 ' + real.toFixed(1) + "%</span></td><td>" + avg.toFixed(1) + '歳<span class="r">実際 ' + ((c.lef + c.lem) / 2).toFixed(1) + "歳</span></td></tr>";
    }).join("");
  }

  // ---------- 最初の画面のモーダル ----------
  // 読み込んだファイルの記録は、数値は数値・文字は文字であることを確かめてから受け入れる
  function validRecord(r) {
    var num = function (v) { return typeof v === "number" && isFinite(v); };
    var str = function (v) { return typeof v === "string" && v.length < 2000; };
    if (!r || !str(r.id) || !BY[r.iso] || !r.death || !r.texture || !Array.isArray(r.texture.axes)) return false;
    if (![r.birthYear, r.death.age, r.death.year, r.longer, r.le, r.diff, r.kids, r.grand, r.wealthLeft, r.ended, r.wealth].every(num)) return false;
    if (![r.name, r.given, r.country, r.summary, r.death.cause, r.death.where, r.edu, r.job, r.spouse, r.bestYear, r.lived, r.hobby, r.top, r.seeOff, r.reflection, r.texture.name, r.theme].every(str)) return false;
    if (!r.texture.axes.every(function (x) { return Array.isArray(x) && str(x[0]) && str(x[1]) && num(x[2]); })) return false;
    if (!Array.isArray(r.log) || !Array.isArray(r.happy) || !Array.isArray(r.themeHits)) return false;
    r.log = r.log.filter(function (x) { return x && num(x.a) && str(x.t); });
    r.themeHits = r.themeHits.filter(function (x) { return x && num(x.a) && str(x.t); });
    r.happy = r.happy.filter(num);
    return r.sex === "m" || r.sex === "f";
  }
  var MODALS = {
    teacher: function () {
      openModal("先生へ", '<p>45分の授業なら、はじめに5分でこの画面の注意点を読み、10分で一人の一生を進め、15分で実験室に20〜100人を生まれさせ、残り15分で結果を話し合えます。</p><p>「生まれた国と学ぶ機会にはどんな関係がある？」「人数を増やすと割合はどう変わる？」「一人の記録と集計結果はそれぞれ何を伝える？」などを問いにできます。</p><p>クラスコードは同じ日・同じ4けたを入力した人が同じ赤ちゃんから始めるためのものです。比較するときは国の決め方もそろえてください。入力と結果はこの端末の中で処理され、送信されません。</p><p>授業用でも、貧困、病気、幼い子どもの死、児童婚、紛争が起こる場合があります。先に伝え、必要な人が見学や中断を選べるようにしてください。</p>');
    },
    memorials: function () {
      var regions = ["africa", "asia", "europe", "americas", "oceania"];
      var regionOpts = '<option value="">' + esc(t("allRegions")) + '</option>' + regions.map(function (key) { return '<option value="' + key + '">' + esc(t("region." + key)) + '</option>'; }).join("");
      var eraOpts = '<option value="">' + esc(t("allEras")) + '</option>' + ["past", "now", "future"].map(function (key) { return '<option value="' + key + '">' + esc(t("sampleEra." + key)) + '</option>'; }).join("");
      openModal("見本の一生", '<p>このサイトが自動でつくった、終わりまで送られた一生です。カードを押すと記録を開きます。</p><p class="mem-filters"><label>' + esc(t("filterRegion")) + '<select id="memRegion">' + regionOpts + '</select></label><label>' + esc(t("filterEra")) + '<select id="memEra">' + eraOpts + '</select></label></p><div id="memList" style="display:grid;gap:12px"></div>', function (b) {
        var draw = function () {
          var region = $("#memRegion", b).value, era = $("#memEra", b).value;
          $("#memList", b).innerHTML = window.SAMPLE_LIVES.filter(samples, { region: region, era: era }).map(function (r) { return memCard(r, true); }).join("");
          $$(".memcard", b).forEach(function (m) { m.style.width = "100%"; });
          paintScenes(b);
        };
        $("#memRegion", b).addEventListener("change", draw);
        $("#memEra", b).addEventListener("change", draw);
        draw();
      });
    },
    shares: function () { openModal("みんなの一生（見本）", '<p class="small">ここに並ぶ一生とひとことは、このサイトが自動でつくった例です。</p><div style="display:grid;gap:24px">' + renderShares(true) + "</div>"); },
    random: function () { var r = samples[Math.floor(Math.random() * samples.length)]; showRecord(r, true); },
    past: function () {
      var past = store.get("past", []);
      var html = past.length ? '<div style="display:grid;gap:6px">' + past.slice().reverse().map(function (r) {
        return '<button class="choice" data-rec="' + esc(r.id) + '"><span class="k">' + r.death.age + "歳</span><span><b>" + esc(r.name) + "</b><br><span class=\"small\">" + r.birthYear + " – " + r.death.year + " · " + esc(r.country) + " · " + esc(r.death.cause) + "</span></span></button>";
      }).join("") + '</div><p style="margin-top:16px"><button class="btn btn-sm" id="wipe">すべて消す</button></p>' : "<p>まだ終えた一生はありません。最初の画面の「生まれる」から始めてみてください。</p>";
      openModal("前世の記録", "<p>このブラウザで終えた一生です（最新30件）。</p>" + html, function (b) {
        var w = $("#wipe", b);
        if (w) w.addEventListener("click", function () {
          if (w.dataset.sure) { ["past", "life", "hearts", "feedback"].forEach(store.del); life = null; syncResume(); closeModal(); toast("このブラウザの記録をすべて消しました"); }
          else { w.dataset.sure = "1"; w.textContent = "本当に消す（元に戻せません）"; w.classList.add("btn-primary"); }
        });
      });
    },
    feedback: function () {
      openModal("ご意見", '<p>気づいたことを書いておけます。<b>この見本サイトでは送信しません。</b>このブラウザに保存するだけです。</p><textarea id="fb" maxlength="2000" placeholder="例：決断の場面がもっと欲しい"></textarea><p style="margin-top:10px"><button class="btn btn-primary" id="fbSave">保存する</button></p><p class="small" id="fbCount"></p>', function (b) {
        var list = store.get("feedback", []);
        $("#fbCount", b).textContent = list.length ? "これまでに保存したメモ：" + list.length + "件" : "";
        $("#fbSave", b).addEventListener("click", function () {
          var v = $("#fb", b).value.trim(); if (!v) return;
          list.push({ t: v, at: new Date().toISOString() }); store.set("feedback", list); closeModal(); toast("このブラウザに保存しました（送信はしていません）");
        });
      });
    },
    changelog: function () {
      openModal("更新履歴", "<p><b>v0.1 · 2026年10月22日</b></p><ul><li>最初の公開。172か国、3つの時代、決断11種類、ひと休み5回。</li><li>死亡記録に「この一生の手ざわり」を追加。</li><li>記録の書き出し・読み込みに対応。</li></ul>");
    },
    transfer: function () {
      openModal("記録を移す", '<p>このブラウザにある前世の記録（終えた一生）をファイルに書き出し、別のブラウザで読み込めます。途中の一生は移せないので、終えてから書き出してください。</p><p><button class="btn btn-primary" id="exp">書き出す</button> <label class="btn">読み込む<input type="file" id="imp" accept="application/json" hidden></label></p><p class="small">読み込むと、同じ名前の一生は上書きされ、ほかは追加されます。</p>', function (b) {
        $("#exp", b).addEventListener("click", function () {
          var data = { app: "Your World, Your Life", v: 1, at: new Date().toISOString(), past: store.get("past", []) };
          var a = document.createElement("a");
          a.href = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: "application/json" }));
          a.download = "your-world-your-life-records.json"; a.click();
          setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
        });
        $("#imp", b).addEventListener("change", function (e) {
          var f = e.target.files[0]; if (!f) return;
          f.text().then(function (txt) {
            var d = JSON.parse(txt);
            if (!d || (d.app !== "meguri" && d.app !== "Your World, Your Life") || !Array.isArray(d.past)) throw new Error("bad");
            var past = store.get("past", []), ids = {};
            past.forEach(function (r) { ids[r.id] = r; });
            d.past.forEach(function (r) { if (validRecord(r)) ids[r.id] = r; });
            store.set("past", Object.keys(ids).map(function (k) { return ids[k]; }).sort(function (a, b) { return a.ended - b.ended; }).slice(-30));
            closeModal(); toast("前世の記録を読み込みました");
          }).catch(function () { toast("このファイルは読み込めませんでした"); });
        });
      });
    },
    homescreen: function () {
      openModal("ホーム画面に追加", "<p>スマートフォンでは、ブラウザの共有メニュー（iPhone の Safari）または ︙ メニュー（Android の Chrome）から「ホーム画面に追加」を選ぶと、アプリのように開けます。</p><p>記録は追加したブラウザの中に残ります。</p>");
    }
  };
  document.addEventListener("click", function (e) {
    var o = e.target.closest("[data-open]");
    if (o && MODALS[o.getAttribute("data-open")]) {
      var modalName = o.getAttribute("data-open");
      if (/^(memorials|shares|random)$/.test(modalName) && !samples.length) withData(function () { if (!samples.length) buildSamples(); MODALS[modalName](); });
      else MODALS[modalName]();
      return;
    }
    var rec = e.target.closest("[data-rec]");
    if (rec) { var r = findRecord(rec.getAttribute("data-rec")); if (r) { closeModal(); showRecord(r, !!r.sample); } return; }
    var h = e.target.closest("[data-heart]");
    if (h) {
      var hearts = store.get("hearts", {}), id = h.getAttribute("data-heart");
      if (hearts[id]) delete hearts[id]; else hearts[id] = 1;
      store.set("hearts", hearts);
      var art = h.closest(".share");
      var tmp = document.createElement("div"); tmp.innerHTML = shareCard(samples.filter(function (s) { return s.id === id; })[0]);
      art.replaceWith(tmp.firstChild);
      return;
    }
    if (e.target.closest("[data-report]")) { toast("見本のため、通報は受け付けていません"); return; }
    if (e.target.closest("[data-born]")) { startBirth(); return; }
    var sc = e.target.closest("[data-scroll]");
    if (sc) { $("#memTrack").scrollBy({ left: +sc.getAttribute("data-scroll") * 600, behavior: "smooth" }); }
  });
  $("#resumeBtn").addEventListener("click", function () { if (life) withData(enterLife); });

  // =====================================================================
  // 出生届
  // =====================================================================
  function secPerYear(p) { return (+p.settings.length || 30) * 60 / Math.max(20, p.le); }
  function startBirth() {
    if (!window.MEGURI_DATA.loaded) { withData(startBirth); return; }
    if (life && !life.ended) {
      var canResume = !eduMode || (life.settings && life.settings.edu);
      var notice = english ? esc(life.given) + " (age " + life.age + ") is still living this life. Starting a new one means the life in progress will be lost without reaching its end." : esc(life.given) + "（" + life.age + "歳）の一生が途中です。新しく生まれると、いまの一生は終わらないまま消えます。";
      openModal("いまの一生", "<p>" + notice + "</p><p>" + (canResume ? "<button class=\"btn\" id=\"goOn\">続きから</button> " : "") + "<button class=\"btn btn-primary\" id=\"goNew\">新しく生まれる</button></p>", function (b) {
        if (canResume) $("#goOn", b).addEventListener("click", function () { closeModal(); enterLife(); });
        $("#goNew", b).addEventListener("click", function () { closeModal(); life = null; store.del("life"); startBirth(); });
      });
      return;
    }
    E.setRandom(Math.random);
    var birthSettings = { era: eduMode ? "now" : settings.era, year: settings.year, method: settings.method, length: settings.length, gentle: settings.gentle };
    if (sharedStart) {
      if (sharedStart.country) birthSettings.country = sharedStart.country;
      if (sharedStart.year && !eduMode) { birthSettings.era = sharedStart.era; birthSettings.year = sharedStart.year; }
    }
    if (eduMode) {
      birthSettings.edu = true;
      var code = $("#classCode").value;
      if (/^[0-9]{4}$/.test(code)) birthSettings.classCode = code;
    }
    life = E.birth(birthSettings);
    sharedStart = null;
    store.set("life", life);
    showBirthRoulette(life);
  }
  function showBirthRoulette(p) {
    var chosen = BY[p.iso], reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var snapshot = p.birthSnapshot || E.birthSnapshot(chosen, p.birthYear, p.era, p.settings.method);
    var overlay = document.createElement("div"), timer = null, finished = false, start = Date.now();
    var candidates = C.map(function (c) { return { country: c, odds: E.birthSnapshot(c, p.birthYear, p.era, p.settings.method).odds }; }).filter(function (item) { return item.odds > 0; });
    var total = candidates.reduce(function (sum, item) { return sum + item.odds; }, 0);
    var bubbles = C.map(function (c) { return { lon: c.lon, lat: c.lat, iso: c.iso, name: country(c), name_en: c.name_en, share: E.birthSnapshot(c, p.birthYear, p.era, p.settings.method).odds }; });
    overlay.className = "birth-roulette";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", t("rouletteTitle"));
    overlay.innerHTML = '<div class="roulette-content"><div class="roulette-top"><span>' + esc(t("rouletteYear", { year: p.birthYear })) + '</span><button type="button" class="roulette-skip">' + esc(t("skip")) + '</button></div><div class="roulette-map">' +
      P.worldSVG({ w: 540, h: 300, bubbles: bubbles, label: t("rouletteMap") }) +
      '</div><div class="roulette-result" aria-live="off"><div class="roulette-name"></div><div class="roulette-share"></div><div class="birth-reveal-facts" hidden></div></div></div>';
    document.body.appendChild(overlay);
    document.body.classList.add("roulette-open");
    var name = $(".roulette-name", overlay), share = $(".roulette-share", overlay);
    function showCountry(c) {
      var active = $(".map-bubble.is-current", overlay);
      if (active) active.classList.remove("is-current");
      var bubble = $(".map-bubble[data-iso='" + c.iso + "']", overlay);
      if (bubble) { bubble.classList.add("is-current"); bubble.parentNode.appendChild(bubble); }
      name.textContent = country(c);
      var odds = E.birthSnapshot(c, p.birthYear, p.era, p.settings.method).odds;
      share.textContent = t("rouletteOdds", { percent: odds.toFixed(odds < 0.1 ? 2 : 1).replace(/\.0$/, "") });
    }
    function clean() {
      clearTimeout(timer);
      document.body.classList.remove("roulette-open");
      overlay.remove();
    }
    function toCertificate() {
      if (finished) return;
      finished = true;
      clean();
      renderCert(p);
      show("cert");
    }
    function reveal() {
      if (finished) return;
      clearTimeout(timer);
      showCountry(chosen);
      overlay.classList.add("roulette-landed");
      $(".roulette-result", overlay).setAttribute("aria-live", "polite");
      name.textContent = t("revealCountry", { country: country(chosen) });
      share.textContent = t("revealOdds", { percent: snapshot.odds.toFixed(snapshot.odds < 0.1 ? 2 : 1).replace(/\.0$/, ""), year: snapshot.year });
      var facts = $(".birth-reveal-facts", overlay);
      facts.hidden = false;
      facts.innerHTML = '<div><span>' + esc(t("revealFamilyLabel")) + '</span><strong>' + esc(t("revealFamily", { mother: p.parents.mom.given, father: p.parents.dad.given, level: p.wealth })) + '</strong></div>' +
        '<div><span>' + esc(t("revealRiskLabel")) + '</span><strong>' + esc(t("revealRisk", { percent: snapshot.u5.toFixed(1) })) + '</strong></div>';
      $(".roulette-skip", overlay).textContent = t("viewCertificate");
      if (!reduced) timer = setTimeout(toCertificate, 2600);
    }
    function pickWeighted() {
      var n = Math.random() * total;
      for (var i = 0; i < candidates.length; i++) {
        n -= candidates[i].odds;
        if (n < 0) return candidates[i].country;
      }
      return candidates.length ? candidates[candidates.length - 1].country : chosen;
    }
    function tick() {
      var elapsed = Date.now() - start;
      if (elapsed >= 4000) { reveal(); return; }
      showCountry(pickWeighted());
      timer = setTimeout(tick, 65 + Math.round(340 * Math.pow(elapsed / 4000, 2)));
    }
    $(".roulette-skip", overlay).addEventListener("click", toCertificate);
    $(".roulette-skip", overlay).focus();
    if (reduced) reveal(); else tick();
  }
  function dotsW(n) { return "●●●●●".slice(0, n) + "○○○○○".slice(0, 5 - n); }
  function joysFor(iso) { return window.JOYS && window.JOYS[String(iso || "").toLowerCase()]; }
  function joyText(item) { return item && (english ? item.en : item.ja) || ""; }
  function joyList(items) {
    return '<ul class="joy-list">' + items.filter(function (item) { return !!joyText(item); }).map(function (item) {
      return '<li>' + esc(joyText(item)) + '</li>';
    }).join('') + '</ul>';
  }
  function countryJoysBlock(iso) {
    var joys = joysFor(iso);
    if (!joys) return '';
    return '<section class="country-joys"><h3>' + esc(t('joyHeading')) + '</h3>' +
      '<div class="country-joys-columns"><div><h4>' + esc(t('joysLabel')) + '</h4>' + joyList(joys.joys || []) + '</div>' +
      '<div><h4>' + esc(t('motivationsLabel')) + '</h4>' + joyList(joys.motivations || []) + '</div></div>' +
      '<p class="small">' + esc(t('joyNote')) + '</p></section>';
  }
  function renderCert(p) {
    var c = BY[p.iso], spy = secPerYear(p);
    var ys = p.birthSnapshot || E.birthSnapshot(c, p.birthYear, p.era, p.settings.method);
    var real = settings.real && settings.real !== p.iso ? BY[settings.real] : null;
    var realStats = real ? E.birthSnapshot(real, p.birthYear, p.era, p.settings.method) : null;
    var cmp = real ? '<h3>' + esc(t("compareTitle", { year: p.birthYear })) + '</h3><table><thead><tr><th>' + esc(t("compareMetric")) + '</th><th>' + esc(country(real)) + '</th><th>' + esc(country(c)) + '</th></tr></thead><tbody>' +
      '<tr><td>' + esc(t("certU5")) + '</td><td>' + realStats.u5.toFixed(1) + '%<small class="birth-source">' + esc(sourceText("u5", realStats)) + '</small></td><td>' + ys.u5.toFixed(1) + '%<small class="birth-source">' + esc(sourceText("u5", ys)) + '</small></td></tr>' +
      '<tr><td>' + esc(t("certGdp")) + '</td><td>$' + fmt(realStats.gdp) + '<small class="birth-source">' + esc(sourceText("gdp", realStats)) + '</small></td><td>$' + fmt(ys.gdp) + '<small class="birth-source">' + esc(sourceText("gdp", ys)) + '</small></td></tr>' +
      '<tr><td>' + esc(t("certLe")) + '</td><td>' + ((realStats.leFemale + realStats.leMale) / 2).toFixed(1) + '<small class="birth-source">' + esc(sourceText("le", realStats)) + '</small></td><td>' + ((ys.leFemale + ys.leMale) / 2).toFixed(1) + '<small class="birth-source">' + esc(sourceText("le", ys)) + '</small></td></tr></tbody></table><p class="small">' + esc(t("compareNote")) + '</p>' : "";
    var mom = p.parents.mom, dad = p.parents.dad;
    var culture = window.CULTURE && window.CULTURE[String(c.iso || p.iso).toLowerCase()];
    if (culture) culture = window.I18N.cultureOf(culture);
    var cultureRows = culture ? [
      [t("cultureFood"), (culture.foods || []).join(t("listSeparator"))],
      [t("cultureFestivals"), (culture.festivals || []).map(function (f) { return f.name + (typeof f.month === "number" ? t("festivalMonth", { month: english ? window.I18N.appMonth(f.month) : f.month }) : ""); }).join(t("listSeparator"))],
      [t("cultureSports"), (culture.sports || []).join(t("listSeparator"))],
      [t("cultureLanguages"), (culture.langs || []).join(t("listSeparator"))],
      [t("cultureGreeting"), culture.greeting || ""]
    ] : [];
    var livingRows = [
      [t("livingElectricity"), typeof c.elec === "number" ? c.elec.toFixed(1).replace(/\.0$/, "") + "%" : t("noData")],
      [t("livingWater"), typeof c.water === "number" ? c.water.toFixed(1).replace(/\.0$/, "") + "%" : t("noData")],
      [t("livingMobile"), typeof c.mobile === "number" ? t("livingMobileValue", { count: c.mobile.toFixed(1).replace(/\.0$/, "") }) : t("noData")]
    ];
    if (typeof c.vax_dtp3 === "number" && isFinite(c.vax_dtp3)) {
      livingRows.push([t("vaxCoverage"), t("vaxCoverageValue", { percent: c.vax_dtp3.toFixed(1).replace(/\.0$/, "") })]);
    }
    var cultureBlock = '<h3 style="font-size:15px;margin:22px 0 12px">' + esc(t("cultureHeading")) + '</h3><div class="grid">' +
      cultureRows.concat(livingRows).map(function (row) {
        return '<div><div class="lab">' + esc(row[0]) + '</div><div class="v">' + esc(row[1] || t("noData")) + '</div></div>';
      }).join("") + '</div>';
    function sourceText(metric, data) {
      var source = (data || ys).sources[metric];
      return t(source.year ? "sourceYear" : "sourceLatest", { source: source.name, year: source.year });
    }
    var rows = [
      [t("certSex"), t(p.sex === "m" ? "certMale" : "certFemale")],
      [t("certCountry"), country(c)], [t("certPlace"), p.city + " · " + t(p.urban ? "certUrban" : "certRural")],
      [t("certYear"), t("yearValue", { year: p.birthYear })], [t("certEra"), E.ERAS[p.era].label],
      [t("certFamily"), t("certFamilyValue", { level: p.wealth, dots: dotsW(p.wealth) })],
      [t("vaxAtBirth"), vaxText(p.vax)],
      [t("certParents"), t("certParentsValue", { mother: mom.given, father: dad.given, motherAge: mom.age, fatherAge: dad.age })],
      [t("certReligion"), religion(p)], [t("certLe"), t("yearsValue", { count: p.le.toFixed(1) })],
      [t("certU5"), ys.u5.toFixed(1) + "%", sourceText("u5")],
      [t("certGdp"), "$" + fmt(ys.gdp), sourceText("gdp")]
    ];
    $("#cert").innerHTML = '<div class="cert"><svg class="guilloche" viewBox="0 0 720 900" preserveAspectRatio="none" aria-hidden="true">' + guilloche() + '</svg><div class="band"><h2>' + esc(t("certificateTitle")) + '</h2><span class="no">No. ' + esc(p.id) + '</span></div><div class="body">' +
      '<div class="lab">' + esc(t("certName")) + '</div><div class="name">' + esc(p.name) + '</div>' +
      '<p class="story">' + esc(p.story) + '</p><p class="time">' + esc(t("certTime", { minutes: p.settings.length, seconds: spy.toFixed(0) })) + '</p>' +
      '<div class="grid">' + rows.map(function (row) { return '<div><div class="lab">' + esc(row[0]) + '</div><div class="v">' + esc(row[1]) + '</div>' + (row[2] ? '<small class="birth-source">' + esc(row[2]) + '</small>' : '') + '</div>'; }).join('') + '</div>' +
      cultureBlock + countryJoysBlock(p.iso) +
      '<div class="cert-map">' + P.worldSVG({ w: 640, h: 300, marks: [{ lon: c.lon, lat: c.lat, text: t("certMapMark", { country: country(c) }) }], label: t("certMapLabel", { country: country(c) }) }) + '</div>' +
      '<p class="small" style="text-align:center;margin:0">' + esc(t("certMapCaption", { country: country(c) })) + '</p>' +
      '<div class="note">' + esc(t("certBirthShare", { year: ys.year, country: country(c), percent: ys.share, oneIn: Math.round(100 / Math.max(0.01, ys.share)) })) + '<small class="birth-source">' + esc(sourceText("share")) + '</small></div>' + cmp +
      '<h3 style="font-size:15px;margin-top:18px">' + esc(t("certPeersTitle")) + '</h3><div class="peers">' + p.peers.map(function (q) {
        return '<div><b>' + esc(q.name) + '</b><br><span class="small">' + esc(t("certPeer", { country: country(BY[q.iso]), place: t(q.urban ? "certUrban" : "certRural"), sex: t(q.sex === "m" ? "certMale" : "certFemale") })) + '</span></div>';
      }).join('') + '</div><p class="small">' + esc(t("certPeersNote")) + '</p></div>' +
      '<div class="foot"><button class="btn btn-primary btn-big" id="beginLife">' + esc(t("beginLife")) + '</button><button class="btn" id="shareBirth">' + esc(t("saveBirth")) + '</button><button class="btn btn-sm" id="copyBirth">' + esc(t("copyBirth")) + '</button></div></div>';
    $("#beginLife").addEventListener("click", enterLife);
    $("#shareBirth").addEventListener("click", function () {
      openSharePreview(window.SHARE.birthCard(p), "your-world-your-life-birth-" + p.id + ".png", "Your World, Your Life | " + p.name + "　" + p.story);
    });
    $("#copyBirth").addEventListener("click", function () {
      copy("Your World, Your Life | " + p.name + "　" + p.story);
    });
  }
  function openSharePreview(canvas, filename, message, url) {
    var src;
    try { src = canvas.toDataURL("image/png"); }
    catch (e) { toast("画像を作成できませんでした"); return; }
    url = url || window.SHARE.PUBLIC_URL + (english ? 'en/' : '');
    var xUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(String(message || '').replace(/\s+https?:\/\/\S+$/, '')) + '&url=' + encodeURIComponent(url);
    var lineUrl = 'https://social-plugins.line.me/lineit/share?url=' + encodeURIComponent(url);
    openModal(t('sharePreviewTitle'), '<div class="share-preview"><img id="sharePreviewImage" alt="' + esc(t('sharePreviewAlt')) + '"><div class="share-preview-actions"><button type="button" class="btn btn-primary" id="shareSend">' + esc(t('shareSend')) + '</button><button type="button" class="btn" id="shareSave">' + esc(t('shareSave')) + '</button><button type="button" class="btn" id="shareCopy">' + esc(t('shareCopy')) + '</button></div><div class="share-preview-links"><a id="shareX" href="' + esc(xUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(t('shareX')) + '</a><a id="shareLine" href="' + esc(lineUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(t('shareLine')) + '</a></div><p class="share-preview-privacy">' + esc(t('sharePrivacy')) + '</p></div>', function (body) {
      $("#sharePreviewImage", body).src = src;
      $("#shareSave", body).addEventListener("click", function () { window.SHARE.download(canvas, filename).catch(function () {}); });
      $("#shareSend", body).addEventListener("click", function () { window.SHARE.shareImage(canvas, filename, message, url).catch(function () { toast(t('shareFailed')); }); });
      $("#shareCopy", body).addEventListener("click", function () {
        var value = String(message || '') + (String(message || '').indexOf(url) >= 0 ? '' : '\n' + url);
        function fallback() {
          var area = document.createElement('textarea'); area.value = value; area.style.position = 'fixed'; area.style.opacity = '0'; document.body.appendChild(area); area.select();
          var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
          document.body.removeChild(area); toast(t(ok ? 'shareCopyDone' : 'shareCopyFailed'));
        }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(value).then(function () { toast(t('shareCopyDone')); }, fallback);
        else fallback();
      });
    });
  }
  function guilloche() {
    var s = "";
    for (var i = 0; i < 14; i++) {
      var d = "M0 " + (120 + i * 50);
      for (var x = 0; x <= 720; x += 20) d += " L" + x + " " + (120 + i * 50 + Math.sin(x / 40 + i) * 26).toFixed(1);
      s += '<path d="' + d + '" fill="none" stroke="var(--stamp)" stroke-width="0.6"/>';
    }
    return s;
  }
  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { toast("コピーしました"); }, function () { toast("コピーできませんでした"); });
    else toast("この環境ではコピーできませんでした");
  }

  // =====================================================================
  // 一生の画面
  // =====================================================================
  function enterLife() {
    if (!life) return;
    if (!window.MEGURI_DATA.loaded) { withData(enterLife); return; }
    speed = 1; paused = false; fast = false;
    buildLifeShell();
    renderLife(true);
    show("life");
    showLifeHint();
    if (life.pending) openDecision();
  }
  function showLifeHint() {
    var seen = false;
    try { seen = localStorage.getItem("meguri.lifeHintSeen") === "1"; } catch (e) {}
    if (seen || $("#lifeHint")) return;
    var hint = document.createElement("aside");
    hint.id = "lifeHint";
    hint.className = "life-hint";
    hint.setAttribute("role", "dialog");
    hint.setAttribute("aria-label", t("hintTitle"));
    hint.innerHTML = '<b>' + esc(t("hintTitle")) + '</b>' +
      '<button type="button" data-hint-target=".ctrls [data-speed]">↗ ' + esc(t("hintSpeed")) + '</button>' +
      '<button type="button" data-hint-target="#pFocus">↗ ' + esc(t("hintFocus")) + '</button>' +
      '<button type="button" data-hint-target="#pLogPanel">↗ ' + esc(t("hintLog")) + '</button>' +
      '<button type="button" class="hint-dismiss">' + esc(t("hintDismiss")) + '</button>';
    $("#life").appendChild(hint);
    hint.addEventListener("click", function (event) {
      if (event.target.classList.contains("hint-dismiss")) {
        try { localStorage.setItem("meguri.lifeHintSeen", "1"); } catch (e) {}
        hint.remove();
        return;
      }
      var target = event.target.getAttribute("data-hint-target");
      var element = target && $(target);
      if (element) { element.scrollIntoView({ behavior: "smooth", block: "center" }); element.classList.add("hint-pointed"); setTimeout(function () { element.classList.remove("hint-pointed"); }, 1800); }
    });
  }
  function buildLifeShell() {
    var sp = [1, 2, 4, 8, 12, 16];
    $("#life").innerHTML = '<div class="lifebar"><div class="in">' +
      '<a class="lg" href="' + homeUrl + '" aria-label="Your World, Your Life" style="color:inherit;text-decoration:none"><span class="lg-full">Your World, Your <b>Life</b></span><span class="lg-short">YW<b>YL</b></span></a>' +
      '<div class="age" id="lAge"></div><div><div class="sub" id="lSub"></div><div class="prog"><i id="lProg"></i></div></div>' +
      '<div class="ctrls"><button id="bPause"><span class="control-icon">❚❚</span><span class="control-label"> ' + esc(t("pauseControl")) + '</span></button>' + sp.map(function (s) { return '<button data-speed="' + s + '">' + s + "×</button>"; }).join("") +
      '<button id="bSpeedCycle" type="button" aria-label="' + esc(t("hintSpeed")) + '">1×</button><button id="bNext">' + esc(t("nextDecisionControl")) + ' »</button>' +
      '<div class="life-more-menu"><button id="bMore" type="button" aria-expanded="false" aria-controls="lifeMoreItems" aria-label="' + esc(t("moreActions")) + '">⋯</button><div class="life-more-items" id="lifeMoreItems"><button id="bAuto" aria-pressed="false">おまかせ</button><button data-music aria-pressed="false">♪ 音</button><button id="bNote">✎ メモを残す</button><button data-theme-toggle aria-label="' + esc(t("themeControl")) + '">◑</button>' + (eduMode ? "" : '<button data-open="feedback">ご意見</button>') + '<button id="bQuit">中断</button></div></div></div></div></div>' +
      '<div class="lifegrid">' +
      '<div class="col-l"><div class="panel idcard" id="pId"></div><div class="panel" id="pStat"></div></div>' +
      '<div class="col-m"><div class="panel scene"><canvas class="pixel" id="cScene"></canvas><div class="cap" id="sceneCap"></div></div><div class="panel" id="pFocus"></div><div class="panel money-mobile-host" id="pMoneyMobile"></div><div class="panel" id="pLogPanel"><h3>一生の記録<small>新しい順 · 行を押すと☆</small></h3><p class="small" id="logHead"></p><ul class="log" id="pLog"></ul></div></div>' +
      '<div class="col-r"><div class="panel" id="pFam"></div><div class="panel" id="pPeers"></div><div class="panel" id="pMap"></div><div class="panel map-place" id="pPlace"></div><div class="panel" id="pSurv"></div><div class="panel" id="pCountry"></div></div>' +
      "</div>";
    syncMusic();
    $$("[data-theme-toggle]", $("#life")).forEach(function (b) { b.addEventListener("click", function () { b.title = window.MEGURI_THEME.cycle(); }); });
    $("#bPause").addEventListener("click", togglePause);
    $$("[data-speed]").forEach(function (b) { b.addEventListener("click", function () { speed = +b.getAttribute("data-speed"); fast = false; paused = false; syncCtrls(); }); });
    $("#bSpeedCycle").addEventListener("click", function () { speed = sp[(sp.indexOf(speed) + 1) % sp.length]; fast = false; paused = false; syncCtrls(); });
    $("#bNext").addEventListener("click", function () { fast = true; paused = false; syncCtrls(); });
    $("#bMore").addEventListener("click", function () { this.setAttribute("aria-expanded", this.getAttribute("aria-expanded") === "true" ? "false" : "true"); });
    $("#lifeMoreItems").addEventListener("click", function (e) { if (e.target.closest("button")) $("#bMore").setAttribute("aria-expanded", "false"); });
    $("#bAuto").addEventListener("click", function () { life.auto = !life.auto; if (life.auto) life.focusManual = false; syncCtrls(); toast(life.auto ? "これからの決断と毎年の重点をおまかせにします" : "おまかせをやめました"); });
    $("#bNote").addEventListener("click", function () {
      var was = paused; paused = true;
      openModal("メモを残す", "<p>" + life.age + "歳のいま、思ったことを書いておけます。一生の記録に残ります。</p><textarea id=\"noteT\" maxlength=\"400\"></textarea><p style=\"margin-top:10px\"><button class=\"btn btn-primary\" id=\"noteS\">残す</button></p>", function (b) {
        $("#noteT", b).focus();
         $("#noteS", b).addEventListener("click", function () { var v = $("#noteT", b).value.trim(); if (v) { E.addLog(life, (english ? "Note: " : "メモ：") + v, { big: true }); store.set("life", life); renderLog(); } closeModal(); });
      }, function () { paused = was; });
    });
    $("#bQuit").addEventListener("click", function () {
      var was = paused; paused = true;
      openModal("中断する", "<p>最初の画面に戻ります。この一生は" + life.age + "歳のところで止まり、このブラウザに残ります。「続きから」で再開できます。</p><p><button class=\"btn btn-primary\" id=\"quitGo\">最初の画面へ</button></p>", function (b) {
        $("#quitGo", b).addEventListener("click", function () { store.set("life", life); modalOnClose = null; closeModal(); syncResume(); show("home"); });
      }, function () { paused = was; });
    });
    $("#pLog").addEventListener("click", function (e) {
      var li = e.target.closest("li"); if (!li) return;
      var it = life.log[+li.getAttribute("data-i")]; if (!it) return;
      it.star = !it.star; li.classList.toggle("star", it.star); store.set("life", life);
    });
    $("#pLog").addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var li = e.target.closest("li[data-i]"); if (!li) return;
      e.preventDefault(); li.click();
    });
    $("#pFocus").addEventListener("click", function (e) {
      if (e.target.closest("[data-money-open]")) { moneyModal(); return; }
      if (e.target.closest("[data-dream-open]")) { openDreams(); return; }
      if (e.target.closest("[data-choice-open]")) { openChoices(); return; }
      var b = e.target.closest("[data-focus]"); if (!b || b.disabled) return;
      life.focus = b.getAttribute("data-focus"); life.focusManual = true; renderFocus();
    });
    window.addEventListener("resize", positionMoneyPanel);
    syncCtrls();
  }
  function togglePause() { paused = !paused; fast = false; syncCtrls(); }
  function syncCtrls() {
    if ($("#life").innerHTML === "") return;
    $("#bPause").innerHTML = paused ? '<span class="control-icon">▶</span><span class="control-label"> ' + esc(t("resumeControl")) + '</span>' : '<span class="control-icon">❚❚</span><span class="control-label"> ' + esc(t("pauseControl")) + '</span>';
    $("#bPause").setAttribute("aria-label", paused ? t("resumeControl") : t("pauseControl"));
    $("#bPause").setAttribute("aria-pressed", paused ? "true" : "false");
    $$("[data-speed]").forEach(function (b) { b.setAttribute("aria-pressed", !fast && +b.getAttribute("data-speed") === speed ? "true" : "false"); });
    $("#bSpeedCycle").textContent = speed + "×";
    $("#bSpeedCycle").setAttribute("aria-label", t("speedControl", { speed: speed }));
    $("#bNext").setAttribute("aria-pressed", fast ? "true" : "false");
    $("#bAuto").setAttribute("aria-pressed", life && life.auto ? "true" : "false");
    if (life) {
      var yearSeconds = Math.max(0.1, secPerYear(life) / (fast ? 60 : speed)).toFixed(secPerYear(life) / speed < 3 ? 1 : 0);
      $("#lSub").textContent = english ? (life.birthYear + life.age) + " · " + life.name + " · One year ≈ " + yearSeconds + " sec" : (life.birthYear + life.age) + "年 · " + life.name + " · 1年 ≈ " + yearSeconds + "秒";
    }
  }

  function renderLife() {
    var p = life, c = BY[p.iso];
    $("#lAge").innerHTML = p.age + (english ? "<small> yrs</small>" : "<small>歳</small>");
    syncCtrls();
    renderId(); renderStat(); renderScene(); renderFocus(); renderLog(); renderFam(); renderPeers(); renderMap(); renderPlace(); renderSurv();
    if (!$("#pCountry").dataset.done) {
      $("#pCountry").dataset.done = "1";
      $("#pCountry").innerHTML = "<h3>" + esc(c.name) + '</h3><table class="ctab">' + [["年間出生数", "約" + fmt(c.share / 100 * 13193) + "万人"], ["人口", "約" + fmt(c.pop) + "万人"], ["平均寿命 女性 / 男性", c.lef + " / " + c.lem + "歳"], ["5歳までの死亡", c.u5 + "%"], ["1人あたりGDP（PPP）", "$" + fmt(c.gdp)], ["ジニ係数", c.gini], ["都市に住む人", c.urban + "%"], ["農業で働く人", c.agri + "%"], ["学校で過ごす年数の見込み", c.school + "年"], ["高等教育の就学率", c.tert + "%"], ["インターネット利用", c.net + "%"], ["電気を使える人", c.elec + "%"], ["基本的な飲み水を使える人", c.water + "%"], ["基本的なトイレを使える人", c.sanit + "%"], ["携帯電話の契約", "100人あたり" + c.mobile + "件"], ["読み書きができる大人", c.lit + "%"], ["1日$3.00未満で暮らす人", c.pov + "%"], ["医師", "1,000人あたり" + c.phys.toFixed(2) + "人"], ["海外からの仕送り", "GDPの" + c.remit + "%"], ["合計特殊出生率", c.tfr + "人"], ["妊産婦死亡（10万あたり）", c.mmr], ["暮らしの満足度（0–10）", c.life]].map(function (r) { return "<tr><td>" + r[0] + "</td><td>" + esc(r[1]) + "</td></tr>"; }).join("") +
        '</table><p class="small" style="margin-top:8px">公開統計の概算です。<a href="c/' + c.iso + '/index.html" target="_blank" rel="noopener">' + esc(c.name) + "のページ</a></p>";
      if (english) {
        var facts = [["Births per year", "About " + fmt(c.share / 100 * 131930000) ], ["Population", "About " + fmt(c.pop * 10000)], ["Life expectancy, women / men", c.lef + " / " + c.lem + " years"], ["Deaths before age five", c.u5 + "%"], ["GDP per person (PPP)", "$" + fmt(c.gdp)], ["Gini index", c.gini], ["People living in cities", c.urban + "%"], ["People working in agriculture", c.agri + "%"], ["Expected years in school", c.school + " years"], ["Tertiary education enrollment", c.tert + "%"], ["Internet use", c.net + "%"], ["People with electricity", c.elec + "%"], ["People with basic drinking water", c.water + "%"], ["People with basic sanitation", c.sanit + "%"], ["Mobile subscriptions", c.mobile + " per 100 people"], ["Literate adults", c.lit + "%"], ["People living on less than $3 a day", c.pov + "%"], ["Doctors", c.phys.toFixed(2) + " per 1,000 people"], ["Remittances from abroad", c.remit + "% of GDP"], ["Fertility rate", c.tfr + " births per woman"], ["Maternal deaths per 100,000 births", c.mmr], ["Life satisfaction (0–10)", c.life]];
        $("#pCountry").innerHTML = '<h3>' + esc(country(c)) + '</h3><table class="ctab">' + facts.map(function (row) { return '<tr><td>' + esc(row[0]) + '</td><td>' + esc(row[1]) + '</td></tr>'; }).join('') + '</table><p class="small" style="margin-top:8px">Approximate values from public statistics. <a href="c/' + c.iso + '/index.html" target="_blank" rel="noopener">Open ' + esc(country(c)) + ' country page</a></p>';
      }
    }
  }
  function mrz(p) {
    var lat = /^[A-Za-z\s]+$/.test(p.name);
    var fam = lat ? p.family.toUpperCase().replace(/[^A-Z]/g, "") : "YOURWORLDYOURLIFE";
    var giv = lat ? p.given.toUpperCase().replace(/[^A-Z]/g, "") : "";
    var pad = function (s) { return (s + "<".repeat(36)).slice(0, 36); };
    var l1 = pad("I<" + p.iso.toUpperCase() + fam + "<<" + giv);
    var l2 = pad(String(p.birthYear).slice(2) + ("0" + p.birthMonth).slice(-2) + "01" + (p.sex === "m" ? "M" : "F") + p.iso.toUpperCase() + "<" + ("00" + p.age).slice(-3));
    return esc(l1) + "<br>" + esc(l2);
  }
  function eduNow(p) {
    var st = p.edu.stage;
    if (english) {
      if (st === "pre") return "Not yet in school";
      if (st === "primary") return "In primary school";
      if (st === "secondary") return "In secondary school";
      if (st === "univ") return "At university";
      return E.EDU_LABEL[p.edu.level] || "—";
    }
    if (st === "pre") return "就学前";
    if (st === "primary") return "小学校に在学中";
    if (st === "secondary") return "中学・高校に在学中";
    if (st === "univ") return "大学に在学中";
    return E.EDU_LABEL[p.edu.level] || "—";
  }
  function renderId() {
    var p = life, c = BY[p.iso];
    var tm = p.temperament ? E.TEMPERAMENTS.filter(function (t) { return t.k === p.temperament; })[0].label : null;
    var rows = english ? [["Sex", p.sex === "m" ? "Male" : "Female"], ["Birth", country(c) + " · " + new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date(2000, p.birthMonth - 1, 1)) + " " + p.birthYear], ["Home", p.abroad ? abroad(p) : p.city + ", " + country(c)], ["Religion", religion(p)], ["Birth household", dotsW(p.wealth)], ["Education", eduNow(p)]] : [["性別", p.sex === "m" ? "男性" : "女性"], ["出生", c.name + " · " + p.birthYear + "年" + p.birthMonth + "月"], ["居住地", (p.abroad ? abroad(p) : p.city + ", " + c.name)], ["信仰", religion(p)], ["生まれた家庭", dotsW(p.wealth)], ["学歴", eduNow(p)]];
    if (p.job) rows.push([english ? "Job" : "職業", p.job + (p.retired ? (english ? " (retired)" : "（引退）") : "")]);
    if (tm && p.age >= 5) rows.push([english ? "Temperament" : "気質", tm]);
    $("#pId").innerHTML = '<div class="band"><span>' + (english ? 'Identity record' : '身元記録') + ' · ' + p.iso.toUpperCase() + "</span><span>" + p.birthYear + '</span></div><div class="in"><canvas class="pixel" id="cFace" style="width:62px"></canvas><div><div class="nm">' + esc(p.name) + "</div><dl>" + rows.map(function (r) { return "<dt>" + r[0] + "</dt><dd>" + esc(r[1]) + "</dd>"; }).join("") + '</dl></div></div><div class="mrz">' + mrz(p) + "</div>";
    P.portrait($("#cFace"), { seed: hash(p.id), grp: c.grp, sex: p.sex, age: p.age, wealth: p.wealth, era: p.era, happiness: p.stats.hp, mood: sceneMood(p.stats.hp), items: p.items || [] });
  }
  var INCOME_SOURCE_KEYS = ["main", "side", "remittances", "assets", "pension", "transfers"];
  var INCOME_SOURCE_LABELS = { main: "moneySourceMain", side: "moneySourceSide", remittances: "moneySourceRemittances", assets: "moneySourceAssets", pension: "moneySourcePension", transfers: "moneySourceTransfers" };
  function incomeSourcesLine(sources) {
    if (!sources) return "";
    var total = INCOME_SOURCE_KEYS.reduce(function (sum, key) { return sum + Math.max(0, Number(sources[key]) || 0); }, 0);
    if (!total) return "";
    return '<p class="small money-income-sources">' + esc(t('moneyIncomeSources')) + ' ' + INCOME_SOURCE_KEYS.filter(function (key) { return Number(sources[key]) > 0; }).map(function (key) { return esc(t(INCOME_SOURCE_LABELS[key])) + Math.round(Number(sources[key]) / total * 100) + '%'; }).join(' · ') + '</p>';
  }
  function renderStat() {
    var p = life, s = p.stats, c = BY[p.iso];
    var bars = [["健康", s.h, "var(--good)"], ["幸福", s.hp, "var(--gold)"], ["知識", s.k, "var(--stamp)"], ["人間関係", s.r, "var(--accent)"]].map(function (b) {
      return '<div class="statbar"><span>' + b[0] + '</span><span class="t"><i style="width:' + b[1].toFixed(0) + "%;background:" + b[2] + '"></i></span><span class="n">' + b[1].toFixed(0) + "</span></div>";
    }).join("");
    var pos = p.income > 0 ? E.incomePosition(p) : null;
    var budget = E.budgetOf(p);
    var items = (p.items || []).map(function (key) { return E.ITEMS.filter(function (x) { return x.key === key; })[0]; }).filter(Boolean);
    var commute = E.transportOf(p);
    function localAmount(v) {
      if (english) return Number(v).toLocaleString("en-US", { maximumFractionDigits: v < 1 ? 2 : 0 });
      if (v >= 1e8) return (v / 1e8).toFixed(1).replace(/\.0$/, "") + "億";
      if (v >= 1e4) return fmt(v / 1e4) + "万";
      if (v > 0 && v < 1) return v.toLocaleString("ja-JP", { maximumSignificantDigits: 2 });
      return fmt(v);
    }
    var localMoney = c.lcu_ok === false ? "" : english ? '<div class="small">Approximate local currency: ' + localAmount(p.income * c.ppp_lcu) + ' ' + esc(c.cur.code) + ' per year (' + localAmount(p.income * c.ppp_lcu / 12) + ' ' + esc(c.cur.code) + ' per month). <span title="Estimated with a purchasing-power parity (PPP) conversion factor; this is not an exchange rate or actual pay.">?</span></div>' : '<div class="small">現地通貨では 年およそ' + localAmount(p.income * c.ppp_lcu) + esc(c.cur.ja) + '（月およそ' + localAmount(p.income * c.ppp_lcu / 12) + esc(c.cur.ja) + '） <span title="購買力平価（PPP）の換算係数で現地通貨に置き換えた目安です。実際の為替レートや給与額ではありません。">？</span></div>';
    var wage = p.income > 0 ? '<div class="money-hero"><div class="small">年収（日本の物価で）</div><strong>' + yen(p.income) + '</strong><div>月収 ' + yen(p.income / 12) + ' · 時給 ' + yen(p.income / 2000) + '</div>' + localMoney + '<div>日本の平均年収（約460万円）の ' + (p.income * E.YEN_PER_PPP / 4600000 * 100).toFixed(0) + '%</div><div>1日あたり $' + E.dailyDollars(p).toFixed(2) + ' — 世界銀行の貧困ライン（1日 $3.00）' + (E.dailyDollars(p) < 3 ? 'を下回っています' : 'の約' + (E.dailyDollars(p) / 3).toFixed(1) + '倍') + '</div></div>' : '<div class="money-hero"><div class="small">年収（日本の物価で）</div><strong>—</strong><div>まだ本人の収入はありません</div></div>';
    if (english) wage = p.income > 0 ? '<div class="money-hero"><div class="small">Annual income in US dollars at purchasing-power parity (PPP)</div><strong>' + yen(p.income) + '</strong><div>Monthly ' + yen(p.income / 12) + ' · hourly ' + yen(p.income / 2000) + '</div>' + localMoney + '<div>' + (p.income * E.YEN_PER_PPP / 4600000 * 100).toFixed(0) + '% of the approximate Japanese average annual income (US$46,000 PPP)</div><div>' + '$' + E.dailyDollars(p).toFixed(2) + ' per day · ' + (E.dailyDollars(p) < 3 ? 'below the World Bank $3.00 poverty line' : (E.dailyDollars(p) / 3).toFixed(1) + ' times the World Bank $3.00 poverty line') + '</div></div>' : '<div class="money-hero"><div class="small">Annual income in US dollars at purchasing-power parity (PPP)</div><strong>—</strong><div>No personal income yet</div></div>';
    var positions = pos ? '<div class="money-positions"><div class="small">収入の位置（下からの推定順位）</div>' + [[country(c), pos.country], [english ? "World" : "世界", pos.world]].map(function (row) { return '<div class="money-position"><span>' + esc(row[0]) + '</span><span class="money-track"><i style="left:' + row[1] + '%"></i></span><b>' + row[1] + '%</b></div>'; }).join("") + '</div>' : '';
    var portfolio = typeof E.portfolio === 'function' ? E.portfolio(p) : null;
    var wealth = '<div class="money-wealth"><div><span>' + esc(t('moneyNetWorth')) + '</span><b>' + yen(portfolio ? portfolio.netWorth : (p.net || 0)) + '</b></div><div><span>' + esc(t('moneyDebt')) + '</span><b>' + yen(portfolio && portfolio.debts ? portfolio.debts.total : (p.debt || 0)) + '</b></div></div>';
    var possessions = '<div class="money-section"><div class="small">' + (english ? 'Possessions' : '持ち物') + '</div><div class="money-chips">' + (items.length ? items.map(function (item) { return '<span>' + esc(item.label) + '</span>'; }).join('') : '<span>' + (english ? 'None yet' : 'まだありません') + '</span>') + '</div><div class="small">' + (english ? 'Transport: ' + esc(commute.mode) + ' · one-way commute about ' + commute.minutes + ' minutes' : '移動手段：' + commute.mode + ' · 通勤片道 約' + commute.minutes + '分') + '</div></div>';
    var ledger = '<div class="ledger"><b>この1年のお金の動き</b>' + ((p.ledger || []).length ? p.ledger.slice(-6).reverse().map(function (x) { return '<div><span>' + esc(x[0]) + '</span><span>' + (x[1] > 0 ? '+' : '') + yen(x[1]) + '</span></div>'; }).join('') : '<p class="small">まだ記録はありません。</p>') + '</div>';
    var palette = ['#49647a', '#b77c45', '#8b9a69', '#6c8a9c', '#ba8490', '#ad9c5f', '#777b92', '#67947b'];
    var budgetHtml = p.income > 0 ? '<div class="money-section"><div class="small">' + (english ? 'Estimated use of annual income' : '1年の収入の行き先（推計）') + '</div><div class="money-budget" role="img" aria-label="' + (english ? 'How annual income is spent' : '1年の収入の使いみち') + '">' + budget.map(function (x, i) { return '<i style="width:' + (x.share * 100).toFixed(2) + '%;background:' + palette[i] + '" title="' + esc(x.label) + ' ' + (x.share * 100).toFixed(0) + '%"></i>'; }).join('') + '</div><div class="money-legend">' + budget.map(function (x, i) { return '<span><i style="background:' + palette[i] + '"></i>' + esc(x.label) + ' ' + (x.share * 100).toFixed(0) + '%</span>'; }).join('') + '</div></div>' : '';
    $("#pMoneyMobile").innerHTML = '';
    $("#pStat").innerHTML = "<h3>状態<small>0–100</small></h3><div class=\"status-grid\">" + bars + '</div><p class="small" style="margin:6px 0 0"><a href="#" id="statHelp">▸ 状態は何を表していますか？</a></p><div class="money-panel">' + wage + incomeSourcesLine(p.incomeSources) + positions + wealth + possessions + moneySparkline(p) + ledger + budgetHtml + '<p class="small"><a href="#" id="moneyHelp">金額はどう計算していますか？</a></p><button class="btn btn-sm" id="bMoney">' + esc(t('moneyDialogTitle')) + '</button></div>';
    positionMoneyPanel();
    $("#statHelp").addEventListener("click", function (e) {
      e.preventDefault();
      openModal("状態について", "<p><b>健康</b>は病気やけがで下がり、年齢とともにゆっくり下がります。低いほど、1年以内に亡くなる確率が上がります。</p><p><b>幸福</b>は出来事で上下し、暮らし向きや家族に引き寄せられます。人生地図の色の濃さになります。</p><p><b>知識</b>は学校と学びで上がり、仕事や進学の選択肢に影響します。</p><p><b>人間関係</b>は家族や友人との時間で上がります。</p><p class=\"small\">どれもこのサイトが作った目安で、実際の統計ではありません。</p>");
    });
    $("#moneyHelp").addEventListener("click", function (e) { e.preventDefault(); openModal(english ? "About the money estimates" : "金額の計算について", english ? "<p>Annual income is estimated from GDP per person, work, education, and family circumstances. It is not an actual payslip.</p><p>Amounts are shown in US dollars at purchasing-power parity (PPP), not converted at market exchange rates.</p><p>Household spending, income rankings, and commuting time are simplified estimates. They cannot capture every real difference between countries or families.</p>" : "<p>国ごと・年ごとの1人あたりGDPと、仕事、学歴、家庭の状況から年収を見積もっています。実際の給与明細ではありません。</p><p>内部の金額は購買力平価（PPP）のドルで計算し、画面では1ドルを100円として『日本の物価で買える量』に置き換えています。為替で円に交換できる額ではありません。</p><p>家計の使いみち、国内・世界での収入順位、通勤時間も簡易モデルによる推計です。国や家庭ごとの実際の差は表しきれません。</p>"); });
    $("#bMoney").addEventListener("click", moneyModal);
  }
  function positionMoneyPanel() {
    var panel = $("#life .money-panel"), mobile = $("#pMoneyMobile"), stat = $("#pStat");
    if (!panel || !mobile || !stat) return;
    if (window.matchMedia("(max-width: 760px)").matches) mobile.appendChild(panel);
    else stat.appendChild(panel);
  }
  function moneySparkline(p) {
    var inc = p.incomeHistory || [], net = p.netHistory || [];
    if (inc.length < 2 || net.length < 2) return '';
    var count = Math.min(inc.length, net.length), values = inc.slice(0, count).concat(net.slice(0, count));
    var min = Math.min.apply(null, values), max = Math.max.apply(null, values), span = Math.max(1, max - min);
    function path(series) { return series.slice(0, count).map(function (v, i) { return (i ? 'L' : 'M') + (i / Math.max(1, count - 1) * 180).toFixed(1) + ' ' + (45 - (v - min) / span * 42).toFixed(1); }).join(' '); }
    return '<div class="money-section"><div class="small">これまでの年収と純資産</div><svg class="money-spark" viewBox="0 0 180 48" role="img" aria-label="年収と純資産の推移"><path d="' + path(inc) + '" stroke="#49647a"/><path d="' + path(net) + '" stroke="#b77c45"/></svg><div class="money-legend"><span>青：年収</span><span>茶：純資産</span></div></div>';
  }
  var assetNames = { cash: 'moneyAsset.cash', deposits: 'moneyAsset.deposits', bonds: 'moneyAsset.bonds', stocks: 'moneyAsset.stocks', gold: 'moneyAsset.gold', realEstate: 'moneyAsset.realEstate', business: 'moneyAsset.business', retirement: 'moneyAsset.retirement',
    goldJewellery: 'engine.asset.goldJewellery', livestock: 'engine.asset.livestock', farmland: 'engine.asset.farmland', rotatingSavings: 'engine.asset.rotatingSavings', mobileWallet: 'engine.asset.mobileWallet', cooperativeShare: 'engine.asset.cooperativeShare', foreignCurrency: 'engine.asset.foreignCurrency', crypto: 'engine.asset.crypto', speculativeLand: 'engine.asset.speculativeLand', treasuryBills: 'engine.asset.treasuryBills', rentalProperty: 'engine.asset.rentalProperty', smallShop: 'engine.asset.smallShop', educationFund: 'engine.asset.educationFund', healthFund: 'engine.asset.healthFund', harvestStore: 'engine.asset.harvestStore', peerLoan: 'engine.asset.peerLoan' };
  function assetLabel(key) { return assetNames[key].indexOf('engine.') === 0 ? window.I18N.t(assetNames[key]) : t(assetNames[key]); }
  var debtNames = { mortgage: 'moneyDebtType.mortgage', consumer: 'moneyDebtType.consumer', informal: 'moneyDebtType.informal', student: 'moneyDebtType.student' };
  function moneyPortfolio(p) {
    if (typeof E.portfolio === 'function') return E.portfolio(p);
    return { cash: typeof E.availableMoney === 'function' ? E.availableMoney(p) : 0, total: Math.max(0, Number(p.net) || 0), netWorth: Number(p.net) || 0,
      debts: { total: Number(p.debt) || 0 }, history: (p.hist || []).map(function (x) { return { age: x.a, netWorth: x.net, income: x.inc, capitalIncome: 0 }; }) };
  }
  function moneyHistoryChart(history) {
    var rows = (history || []).filter(function (x) { return x && isFinite(Number(x.netWorth)) && isFinite(Number(x.age)); });
    if (!rows.length) return '<p class="small">' + esc(t('moneyNoData')) + '</p>';
    var low = Math.min(0, Math.min.apply(null, rows.map(function (x) { return Number(x.netWorth) || 0; })));
    var high = Math.max(1, Math.max.apply(null, rows.map(function (x) { return Math.max(Number(x.netWorth) || 0, Number(x.income) || 0, Number(x.capitalIncome) || 0); })));
    var minAge = Number(rows[0].age), maxAge = Number(rows[rows.length - 1].age), ageSpan = Math.max(1, maxAge - minAge), valueSpan = high - low;
    function X(x) { return (12 + (Number(x.age) - minAge) / ageSpan * 276).toFixed(1); }
    function Y(v) { return (88 - (Number(v) - low) / valueSpan * 76).toFixed(1); }
    var line = rows.map(function (x, i) { return (i ? 'L' : 'M') + X(x) + ' ' + Y(x.netWorth); }).join(' ');
    var bars = rows.map(function (x) {
      var width = Math.max(2, Math.min(8, 250 / rows.length));
      var labour = Math.max(0, Number(x.income) || 0);
      return '<rect x="' + (Number(X(x)) - width) + '" y="' + Y(labour) + '" width="' + width + '" height="' + Math.max(0, Number(Y(0)) - Number(Y(labour))) + '" fill="var(--stamp)" opacity=".55"/><rect x="' + X(x) + '" y="' + Y(Math.max(0, Number(x.capitalIncome) || 0)) + '" width="' + width + '" height="' + Math.max(0, Number(Y(0)) - Number(Y(Math.max(0, Number(x.capitalIncome) || 0)))) + '" fill="var(--gold)" opacity=".8"/>';
    }).join('');
    return '<svg class="money-life-chart" viewBox="0 0 300 100" role="img" aria-label="' + esc(t('moneyHistoryTitle')) + '">' + bars + '<path d="' + line + '" fill="none" stroke="var(--accent)" stroke-width="2.5"/></svg><div class="money-legend"><span><i style="background:var(--accent)"></i>' + esc(t('moneyNetWorth')) + '</span><span><i style="background:var(--stamp)"></i>' + esc(t('moneyLabourIncome')) + '</span><span><i style="background:var(--gold)"></i>' + esc(t('moneyCapitalIncome')) + '</span></div>';
  }
  function moneyShareButtons(kind, key, percent) {
    return '<div class="money-share" role="group" aria-label="' + esc(t('moneyAmountShare')) + '">' + [10, 25, 50, 100].map(function (value) {
      return '<button type="button" data-share-kind="' + kind + '" data-share-key="' + esc(key) + '" data-pct="' + value + '" aria-pressed="' + (percent === value) + '">' + esc(value === 100 ? t('moneyAll') : t('moneyPercentChoice', { percent: value })) + '</button>';
    }).join('') + '</div>';
  }
  function moneyInlineAction(kind, key, maximum, percent, disabled, verb, showShare, disabledLabel) {
    var share = kind === 'invest' || kind === 'sell' || kind === 'repay';
    var amount = kind === 'spend' ? maximum : kind === 'borrow' ? Math.min(maximum, Math.max(1, Math.floor(maximum * .25))) : Math.min(maximum, Math.max(1, Math.floor(maximum * percent / 100)));
    var label = verb || t(kind === 'invest' ? 'moneyInvestAction' : kind === 'sell' ? 'moneySellAction' : kind === 'borrow' ? 'moneyBorrowAction' : 'moneyRepayAction');
    var unavailable = disabled || !(amount > 0);
    var buttonLabel = unavailable ? disabledLabel || t('moneyUnavailable') : label + ' ' + yen(amount);
    return '<div class="money-action-set">' + (share && showShare !== false && !unavailable ? moneyShareButtons(kind, key, percent) : '') +
      '<button type="button" class="btn money-do" data-money-do="' + kind + '" data-key="' + esc(key) + '" data-amount="' + amount + '"' + (unavailable ? ' disabled' : '') + ' title="' + esc(buttonLabel) + '">' + esc(buttonLabel) + '</button></div>';
  }
  function moneyRow(label, value, effect, actions, extra, reason, result, key) {
    var detail = result || effect || reason || '';
    return '<article class="money-option money-row' + (extra ? ' ' + extra : '') + '" data-money-row="' + esc(key || '') + '"><div class="money-row-copy"><div class="money-row-main"><b>' + esc(label) + '</b>' + (value ? '<span class="money-row-value">' + esc(value) + '</span>' : '') + '</div>' +
      (detail ? '<p class="' + (result ? 'money-item-result' : 'money-row-effect') + '"' + (result ? ' role="status"' : '') + ' title="' + esc(detail) + '">' + esc(detail) + '</p>' : '') + '</div>' +
      (actions ? '<div class="money-row-actions">' + actions + '</div>' : '') + '</article>';
  }
  function moneyShortReason(reason, item, p) {
    if (!reason) return '';
    if (item && (p.items || []).indexOf(item.key) >= 0) return t('moneyOwned');
    var reasons = [
      ['moneyNotEnough', ['engine.spend.cash_short', 'engine.spend.investment_cash', 'engine.spend.loan_limit', 'engine.econ.cash']],
      ['moneyCountryLocked', ['engine.money.region', 'engine.econ.travel']],
      ['moneyNeedSavings', ['engine.money.wealth']],
      ['moneyNeedLearning', ['engine.money.education']],
      ['moneyNotYet', ['engine.spend.not_yet', 'engine.econ.era']],
      ['moneyNeedIncome', ['engine.econ.income']],
      ['moneyRuralOnly', ['engine.spend.rural']],
      ['moneyNeedChild', ['engine.spend.no_child']],
      ['moneyNeedParent', ['engine.spend.no_parent']],
      ['moneyNeedSpouse', ['engine.spend.no_spouse']],
      ['moneyBelief', ['engine.money.religion']]
    ];
    for (var i = 0; i < reasons.length; i++) {
      if (reasons[i][1].some(function (key) { return reason === window.I18N.t(key); })) return t(reasons[i][0]);
    }
    return reason;
  }
  function moneyRecommendations(p, catalog, category, order) {
    var cash = Number(E.availableMoney ? E.availableMoney(p) : moneyPortfolio(p).cash) || 0;
    var hasChild = (p.kids || []).some(function (child) { return child.alive; });
    var groupTypes = {};
    (window.MONEY_DATA && window.MONEY_DATA.groups || []).forEach(function (group) { groupTypes['offer:' + group.id] = group.category; });
    var choices = [];
    (catalog || []).forEach(function (group) { (group.items || []).forEach(function (item) {
      var type = groupTypes[group.category] || group.category;
      var bucket = type === 'buy' ? 'goods' : type === 'learning' ? 'care' : type === 'family' || type === 'donate' ? 'people' : 'everyday';
      if (category !== 'all' && category !== bucket) return;
      var score = 0;
      if (item.price <= cash * .15) score += 4;
      if (['clinicVisit', 'checkup', 'cleanWater'].indexOf(item.key) >= 0 || hasChild && ['schoolFees', 'childMeals'].indexOf(item.key) >= 0) score += 8;
      if (p.age < 18 && ['textbooks', 'notebooks', 'libraryCard'].indexOf(item.key) >= 0) score += 5;
      if (p.age >= 16 && p.age < 55 && ['bike', 'busPass', 'vocationalTraining', 'tradeWorkshop', 'smartphone'].indexOf(item.key) >= 0) score += 6;
      if (!p.urban && ['waterTank', 'solarLamp', 'farmTools'].indexOf(item.key) >= 0) score += 5;
      choices.push({ item: item, type: type, bucket: bucket, score: score });
    }); });
    if (!order.keys) {
      choices.sort(function (a, b) { return Number(b.item.available) - Number(a.item.available) || b.score - a.score || a.item.price - b.item.price || a.item.key.localeCompare(b.item.key); });
      if (category === 'all') {
        var available = choices.filter(function (x) { return x.item.available; });
        var featured = available.filter(function (x) { return x.bucket === 'goods'; }).slice(0, 3).concat(available.filter(function (x) { return x.bucket !== 'goods'; }).slice(0, 3));
        choices = featured.concat(choices.filter(function (x) { return featured.indexOf(x) < 0; }));
      }
      order.keys = choices.map(function (x) { return x.item.key; });
    } else choices.sort(function (a, b) { return order.keys.indexOf(a.item.key) - order.keys.indexOf(b.item.key); });
    return choices;
  }
  function moneyModal() {
    var p = life, was = paused, tab = 'spend', spendCategory = 'all', shares = {}, expanded = {}, orders = {}, lastResult = null;
    paused = true;
    var tabs = [['spend', 'moneyTabSpend'], ['invest', 'moneyTabInvestNew'], ['borrow', 'moneyTabBorrowRepay'], ['assets', 'moneyTabAssets']];
    function shareFor(kind, key) { return shares[kind + ':' + key] || 25; }
    function resultFor(key) { return lastResult && lastResult.key === key ? lastResult.text : ''; }
    function shortBorrowReason(option) {
      if (p.age < 18 && ['microfinance', 'informal_lender', 'pawn', 'payday', 'bnpl', 'shopCredit', 'cropLoan'].indexOf(option.key) >= 0) return t('moneyAgeLocked');
      if (p.age < 16 && option.key === 'family') return t('moneyAgeLocked');
      return moneyShortReason(option.reason, null, p);
    }
    function listRows(rows, scope) {
      var count = expanded[scope] ? rows.length : Math.min(10, rows.length);
      return '<div class="money-list">' + rows.slice(0, count).join('') + '</div>' + (rows.length > count ? '<button type="button" class="money-more" data-money-more="' + esc(scope) + '">' + esc(t('moneyMore')) + ' (' + (rows.length - count) + ')</button>' : '');
    }
    function draw(b, keepScroll) {
      var scroll = keepScroll && b.querySelector('.money-options') ? b.querySelector('.money-options').scrollTop : 0;
      var port = moneyPortfolio(p), debts = port.debts || {}, cash = Number(port.cash) || 0, content = '';
      if (tab === 'spend') {
        var catalog = typeof E.spendCatalog === 'function' ? E.spendCatalog(p) : [];
        if (!catalog.length && typeof E.spendOptions === 'function') catalog = [{ category: 'living', items: E.spendOptions(p) }];
        var categories = [['all', 'moneyCategoryAll'], ['goods', 'moneyCategoryGoods'], ['everyday', 'moneyCategoryEveryday'], ['care', 'moneyCategoryCare'], ['people', 'moneyCategoryPeople']];
        var scope = 'spend:' + spendCategory, choices = moneyRecommendations(p, catalog, spendCategory, orders[scope] || (orders[scope] = {}));
        content = '<div class="money-tabs money-category-tabs" role="group" aria-label="' + esc(t('moneyTabSpend')) + '">' + categories.map(function (x) {
          return '<button type="button" data-spend-category="' + x[0] + '" aria-pressed="' + (spendCategory === x[0]) + '">' + esc(t(x[1])) + '</button>';
        }).join('') + '</div>' + (choices.length ? listRows(choices.map(function (entry) {
          var x = entry.item, reason = moneyShortReason(x.reason, x, p), verb = t(entry.type === 'buy' ? 'moneyBuyAction' : 'moneyPayAction');
          return moneyRow(x.label, '', x.effect || '', moneyInlineAction('spend', x.key, x.price || 0, 100, !x.available, verb, false, reason), '', reason, resultFor(x.key), x.key);
        }), scope) : '<p class="small">' + esc(t('moneyNoData')) + '</p>') + '<p class="money-price-note">' + esc(t('moneyPriceNote')) + '</p>';
      } else if (tab === 'invest') {
        var classes = typeof E.assetClasses === 'function' ? E.assetClasses(p) : [];
        classes.sort(function (a, b) { return Number(Boolean(port[b.key])) - Number(Boolean(port[a.key])) || Number(b.available) - Number(a.available); });
        content = listRows(classes.map(function (x) {
          var holding = Number(port[x.key]) || 0, reason = x.available ? '' : moneyShortReason(x.reason, null, p);
          var meta = t('moneyExpectedReturn') + ' ' + (Number(x.expectedReturn) * 100).toFixed(1) + '% · ' + t('moneyRisk') + ' ' + t('moneyRisk' + ({ low: 'Low', medium: 'Medium', high: 'High' }[x.risk] || 'Medium'));
          var share = shareFor('asset', x.key);
          var actions = '<div class="money-row-controls">' + (x.available && cash > 0 || holding > 0 ? moneyShareButtons('asset', x.key, share) : '') + '<div class="money-action-pair">' +
            moneyInlineAction('invest', x.key, cash, share, !x.available || cash <= 0, null, false, reason || t('moneyNotEnough')) + (holding > 0 ? moneyInlineAction('sell', x.key, holding, share, false, null, false) : '') + '</div></div>';
          return moneyRow(x.label, holding > 0 ? yen(holding) : '', meta, actions, 'money-complex', reason || (cash <= 0 ? t('moneyNotEnough') : ''), resultFor(x.key), x.key);
        }), 'invest');
      } else if (tab === 'borrow') {
        var options = typeof E.borrowOptions === 'function' ? E.borrowOptions(p) : [];
        options.sort(function (a, b) {
          var owedA = Number(p.debtAccounts && p.debtAccounts[a.key] && p.debtAccounts[a.key].balance) || 0;
          var owedB = Number(p.debtAccounts && p.debtAccounts[b.key] && p.debtAccounts[b.key].balance) || 0;
          return Number(owedB > 0) - Number(owedA > 0) || Number(b.available) - Number(a.available);
        });
        content = listRows(options.map(function (x) {
          var owed = Number(p.debtAccounts && p.debtAccounts[x.key] && p.debtAccounts[x.key].balance) || 0;
          var meta = t('moneyRate') + ' ' + (Number(x.rate) * 100).toFixed(1) + '% · ' + t('moneyLimit') + ' ' + yen(x.limit || 0);
          var warning = x.key === 'informal_lender' ? t('moneyInformalWarning') : ['payday', 'bnpl', 'pawn'].indexOf(x.key) >= 0 ? t('moneyShortCreditWarning') : '';
          var share = shareFor('repay', x.key), borrowReason = x.available ? '' : shortBorrowReason(x);
          var actions = '<div class="money-row-controls">' + (owed > 0 && cash > 0 ? moneyShareButtons('repay', x.key, share) : '') + '<div class="money-action-pair">' +
            moneyInlineAction('borrow', x.key, x.limit || 0, 25, !x.available || !(x.limit > 0), null, false, borrowReason || t('moneyUnavailable')) +
            (owed > 0 ? moneyInlineAction('repay', x.key, Math.min(owed, cash), share, cash <= 0, null, false, t('moneyNotEnough')) : '') + '</div></div>';
          return moneyRow(x.label, owed > 0 ? t('moneyDebt') + ' ' + yen(owed) : '', meta + (warning ? ' · ' + warning : ''), actions, owed > 0 ? 'money-complex' : '', borrowReason, resultFor(x.key), x.key);
        }), 'borrow');
      } else {
        var keys = Object.keys(assetNames).filter(function (key) { return Number(port[key]) > 0 && key !== 'cash'; });
        content = '<h3>' + esc(t('moneyAssets')) + '</h3><strong class="money-net-worth">' + esc(t('moneyNetWorth')) + ' ' + yen(port.netWorth || 0) + '</strong><div class="money-asset-grid">' +
          (keys.length ? keys.map(function (key) { return '<div><span>' + esc(assetLabel(key)) + '</span><b>' + yen(port[key]) + '</b></div>'; }).join('') : '<p class="small">' + esc(t('moneyNoData')) + '</p>') + '</div>' +
          '<h3>' + esc(t('moneyDebtBreakdown')) + '</h3><div class="money-asset-grid">' + Object.keys(debtNames).filter(function (key) { return Number(debts[key]) > 0; }).map(function (key) { return '<div><span>' + esc(t(debtNames[key])) + '</span><b>' + yen(debts[key]) + '</b></div>'; }).join('') + '</div>' +
          '<h3>' + esc(t('moneyTabLifestyle')) + '</h3><div class="money-lifestyles">' + (Array.isArray(E.LIFESTYLES) ? E.LIFESTYLES : []).map(function (x) { return '<button type="button" data-money-do="lifestyle" data-key="' + esc(x.key) + '" aria-pressed="' + (p.lifestyle === x.key) + '"><b>' + esc(x.label) + '</b><small>' + esc(t('moneyLifestyleEffect.' + x.key)) + '</small>' + (resultFor(x.key) ? '<small class="money-lifestyle-result">' + esc(resultFor(x.key)) + '</small>' : '') + '</button>'; }).join('') + '</div>';
      }
      b.innerHTML = '<div class="money-cash"><span>' + esc(t('moneyCash')) + ' <b>' + yen(cash) + '</b></span><span>' + esc(t('moneyDebt')) + ' <b>' + yen(debts.total || 0) + '</b></span></div>' +
        '<div class="money-tabs money-main-tabs" role="tablist">' + tabs.map(function (x) { return '<button type="button" role="tab" data-tab="' + x[0] + '" aria-selected="' + (tab === x[0]) + '">' + esc(t(x[1])) + '</button>'; }).join('') + '</div>' +
        '<span class="money-sr-only" role="status" aria-live="polite">' + esc(lastResult ? lastResult.text : '') + '</span><div class="money-options" role="tabpanel">' + content + '</div>';
      var optionsNode = b.querySelector('.money-options');
      if (optionsNode) optionsNode.scrollTop = scroll;
    }
    openModal(t('moneyDialogTitle'), '', function (b) {
      b.classList.add('money-dialog-body');
      draw(b);
      b.addEventListener('click', function (e) {
        var choice = e.target.closest('[data-tab]');
        if (choice) { tab = choice.dataset.tab; lastResult = null; draw(b); return; }
        var category = e.target.closest('[data-spend-category]');
        if (category) { spendCategory = category.dataset.spendCategory; lastResult = null; draw(b); return; }
        var more = e.target.closest('[data-money-more]');
        if (more) { expanded[more.dataset.moneyMore] = true; draw(b, true); return; }
        var preset = e.target.closest('[data-pct]');
        if (preset) { shares[preset.dataset.shareKind + ':' + preset.dataset.shareKey] = Number(preset.dataset.pct); draw(b, true); return; }
        var button = e.target.closest('[data-money-do]');
        if (!button || button.disabled) return;
        var kind = button.dataset.moneyDo, key = button.dataset.key, amount = Number(button.dataset.amount || 0);
        var fn = E[kind === 'lifestyle' ? 'setLifestyle' : kind];
        if (typeof fn !== 'function') { lastResult = { key: key, text: t('moneyUnavailable') }; draw(b, true); return; }
        var label = button.closest('[data-money-row]') && button.closest('[data-money-row]').querySelector('b').textContent || key;
        var response = kind === 'lifestyle' || kind === 'spend' ? fn(p, key) : fn(p, key, amount);
        var resultKey = kind === 'spend' ? (button.textContent.indexOf(t('moneyBuyAction')) === 0 ? 'moneyDoneBuy' : 'moneyDoneSpend') : 'moneyDone' + kind.charAt(0).toUpperCase() + kind.slice(1);
        var result = response && response.ok !== false ? kind === 'lifestyle' ? (response.text || t('moneyCurrent')) : t(resultKey, { item: label, amount: yen(amount) }) : response && (response.text || response.message) || t('moneyUnavailable');
        lastResult = { key: key, text: result };
        if (response && response.ok !== false) { store.set('life', p); renderStat(); renderLog(); }
        draw(b, true);
      });
    }, function () { paused = was; });
  }
  function household(p) {
    var ppl = [{ age: p.age, sex: p.sex }];
    var home = p.age < 18 || (p.rel === "single" && p.age < 26 && !p.moved);
    if (home) {
      if (p.parents.mom.alive) ppl.push({ age: p.parents.mom.age + p.age, sex: "f" });
      if (p.parents.dad.alive) ppl.push({ age: p.parents.dad.age + p.age, sex: "m" });
      p.sibs.slice(0, 5).forEach(function (s) { if (s.age + p.age < 22) ppl.push({ age: s.age + p.age, sex: s.sex }); });
    } else {
      if (p.spouse && p.spouse.alive) ppl.push({ age: p.age + p.spouse.d, sex: p.spouse.sex });
      p.kids.forEach(function (k) { var ka = p.age - k.born; if (k.alive && ka < 20) ppl.push({ age: ka, sex: k.sex }); });
    }
    return { ppl: ppl.slice(0, 8), home: home };
  }
  function scenePlace(text) {
    text = text || "";
    if (english) {
      if (/refugee camp|displaced camp/i.test(text)) return "refugee_camp";
      if (/airport|airplane|flight/i.test(text)) return "airport";
      if (/train|railway|bus ride|bus station/i.test(text)) return "train";
      if (/mosque/i.test(text)) return "mosque";
      if (/church/i.test(text)) return "church";
      if (/temple/i.test(text)) return "temple";
      if (/shrine/i.test(text)) return "shrine";
      if (/cemetery|graveyard/i.test(text)) return "cemetery";
      if (/stadium|football match|sports ground/i.test(text)) return "stadium";
      if (/beach|seaside/i.test(text)) return "beach";
      if (/rice paddy|rice field/i.test(text)) return "rice_paddy";
      if (/fishing boat/i.test(text)) return "fishing_boat";
      if (/plantation/i.test(text)) return "plantation";
      if (/funeral|died|death|passed away|farewell|mourn/i.test(text)) return "funeral";
      if (/married|wedding|ceremony/i.test(text)) return "wedding";
      if (/graduat/i.test(text)) return "graduation";
      if (/grandchild/i.test(text)) return "home_old";
      if (/clinic/i.test(text)) return "clinic";
      if (/goat|chicken|livestock/i.test(text)) return "farm_animals";
      if (/construct/i.test(text)) return "construction";
      if (/hospital|pneumonia|illness|fever/i.test(text)) return "hospital";
      if (/teach|school|university|college|student/i.test(text)) return "school";
      if (/nurs|doctor|caregiver/i.test(text)) return "hospital";
      if (/farm|fish/i.test(text)) return "field";
      if (/factory|sewing/i.test(text)) return "factory";
      if (/market|vendor|shop|merchant/i.test(text)) return "market";
      if (/street|downtown/i.test(text)) return "street";
      if (/office|account|civil servant|programmer|research|lawyer|engineer/i.test(text)) return "office";
    }
    if (/難民キャンプ|避難キャンプ/.test(text)) return "refugee_camp";
    if (/空港|飛行機/.test(text)) return "airport";
    if (/列車|鉄道|バス停|バスに乗/.test(text)) return "train";
    if (/モスク/.test(text)) return "mosque";
    if (/教会/.test(text)) return "church";
    if (/寺院|お寺/.test(text)) return "temple";
    if (/神社/.test(text)) return "shrine";
    if (/墓地|墓参り/.test(text)) return "cemetery";
    if (/競技場|スタジアム/.test(text)) return "stadium";
    if (/海辺|浜辺|ビーチ/.test(text)) return "beach";
    if (/田んぼ|水田/.test(text)) return "rice_paddy";
    if (/漁船/.test(text)) return "fishing_boat";
    if (/プランテーション/.test(text)) return "plantation";
    if (/葬|亡くなり|亡くなった|亡くなりました/.test(text)) return "funeral";
    if (/結婚した|結婚しま|結婚式|婚礼|挙式/.test(text)) return "wedding";
    if (/卒業/.test(text)) return "graduation";
    if (/孫/.test(text)) return "home_old";
    if (/診療所/.test(text)) return "clinic";
    if (/ヤギ|鶏|家畜/.test(text)) return "farm_animals";
    if (/建設/.test(text)) return "construction";
    if (/寝込|入院|熱|肺炎|病/.test(text)) return "hospital";
    if (/教師|教員|学校|小学校|中学校|高校|大学|進学|在学/.test(text)) return "school";
    if (/看護師|医師|介護/.test(text)) return "hospital";
    if (/農|漁|小作/.test(text)) return "field";
    if (/工場|縫製/.test(text)) return "factory";
    if (/露天|市場|販売|商人/.test(text)) return "market";
    if (/通り|街路|商店|まちなか/.test(text)) return "street";
    if (/事務|会計|公務員|プログラマー|研究者|弁護士|技術者/.test(text)) return "office";
    return "";
  }
  function sceneWeather(iso, month, seed) {
    var entry = window.CULTURE && window.CULTURE[String(iso || "").toLowerCase()];
    var climate = entry && entry.climate;
    if (!climate) return "clear";
    if (climate.cold && climate.cold.indexOf(month) >= 0) return climate.snow ? "snow" : "fog";
    if (climate.rainy && climate.rainy.indexOf(month) >= 0) return climate.rainy.length >= 4 && seed % 5 === 0 ? "monsoon" : "rain";
    if (climate.hot && climate.hot.indexOf(month) >= 0) return "heat";
    return "clear";
  }
  function sceneMood(happiness, tone) {
    if (tone === "bad") return "sad";
    if (tone === "good") return "happy";
    return happiness < 35 ? "sad" : happiness > 65 ? "happy" : "neutral";
  }
  function sceneTime(text, seed) {
    if (/夜|夜中|night|midnight/i.test(text || "")) return "night";
    if (/夕|日暮|dusk|sunset|evening/i.test(text || "")) return "dusk";
    if (/朝|夜明|dawn|sunrise|morning/i.test(text || "")) return "dawn";
    return seed % 7 === 0 ? "dusk" : "day";
  }
  function renderScene() {
    if (renderScene.stopAnimation) renderScene.stopAnimation();
    var p = life, c = BY[p.iso], h = household(p);
    var sceneAt = "", waterFetch = false, eventText = "", eventMonth = null, yearEvents = [];
    for (var i = p.log.length - 1; i >= 0 && p.log[i].a === p.age; i--) {
      var logText = p.log[i].t || "";
      yearEvents.push(logText);
      if (!eventText) eventText = logText;
      if (!eventMonth && p.log[i].m >= 1 && p.log[i].m <= 12) eventMonth = p.log[i].m;
      if (/水を汲|水くみ|fetch.*water/i.test(logText)) waterFetch = true;
      if (!sceneAt) sceneAt = scenePlace(logText);
    }
    if (!sceneAt && p.age >= 6 && !p.retired && p.age % 2 === 0) {
      if (["primary", "secondary", "univ"].indexOf(p.edu.stage) >= 0) sceneAt = "school";
      else if (p.job) sceneAt = scenePlace(p.job);
    }
    var month = p.month || eventMonth || (1 + (((p.birthMonth || 1) - 1 + p.age * 7) % 12));
    var canvas = $("#cScene");
    var sceneSeed = hash(p.id) + p.age * 37;
    var events = yearEvents.join(" ");
    var milestone = /葬|死別|亡くな|見送|funeral|widow|died|passed away|mourning/i.test(events) ? "mourning" :
      (p.kids || []).some(function (kid) { return kid.born === p.age; }) || /子どもが生まれ|赤ちゃんが生まれ|gave birth|new baby|child was born/i.test(events) ? "new_baby" :
      /結婚|婚礼|挙式|married|wedding/i.test(events) ? "wedding" :
      /引っ越|引越|移り住|転居|moved (?:to|house)|relocat/i.test(events) ? "moving" :
      /退職|引退|retired|retirement/i.test(events) ? "retirement" :
      /入院|病気|肺炎|寝込|hospital|illness|pneumonia|diagnos/i.test(events) || p.stats.h < 30 ? "illness" : "";
    var sceneOptions = { seed: hash(p.id), urban: p.urban || p.moved, moved: !!p.moved, retired: !!p.retired, milestone: milestone, wealth: p.wealth, people: h.ppl, grp: c.grp, age: p.age, era: p.era, place: sceneAt || "home", studying: ["primary", "secondary", "univ"].indexOf(p.edu.stage) >= 0, items: p.items || [], pets: p.pets || [], waterFetch: waterFetch, season: month, month: month, weather: sceneWeather(p.iso, month, sceneSeed), time: sceneTime(eventText, sceneSeed), happiness: p.stats.hp, mood: sceneMood(p.stats.hp), health: p.stats.h, event: eventText };
    P.scene(canvas, sceneOptions);
    if (window.requestAnimationFrame) {
      var motion = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
      var raf = 0, lastFrame = 0, frame = 0, active = true;
      function stopAnimation() {
        active = false;
        if (raf) window.cancelAnimationFrame(raf);
        raf = 0;
        if (renderScene.stopAnimation === stopAnimation) renderScene.stopAnimation = null;
        document.removeEventListener("visibilitychange", resumeAnimation);
        if (motion) {
          if (motion.removeEventListener) motion.removeEventListener("change", resumeAnimation);
          else if (motion.removeListener) motion.removeListener(resumeAnimation);
        }
      }
      function animate(now) {
        raf = 0;
        if (!active || $("#life").hidden || !canvas.isConnected) { stopAnimation(); return; }
        if (document.hidden || motion && motion.matches) return;
        if (now - lastFrame >= 167) {
          frame = (frame + 1) % 4;
          sceneOptions.frame = frame;
          P.scene(canvas, sceneOptions);
          lastFrame = now;
        }
        raf = window.requestAnimationFrame(animate);
      }
      function resumeAnimation() {
        if (!active) return;
        if (document.hidden || motion && motion.matches) {
          if (raf) window.cancelAnimationFrame(raf);
          raf = 0;
          if (motion && motion.matches && frame !== 0) {
            frame = 0; sceneOptions.frame = 0; P.scene(canvas, sceneOptions);
          }
        } else if (!raf) {
          lastFrame = performance.now();
          raf = window.requestAnimationFrame(animate);
        }
      }
      renderScene.stopAnimation = stopAnimation;
      document.addEventListener("visibilitychange", resumeAnimation);
      if (motion) {
        if (motion.addEventListener) motion.addEventListener("change", resumeAnimation);
        else if (motion.addListener) motion.addListener(resumeAnimation);
      }
      resumeAnimation();
    }
    var place = p.abroad ? p.abroad : c.name + "・" + p.city;
    var with_ = h.home ? "両親" + (p.sibs.length ? "ときょうだい" + p.sibs.length + "人" : "") + "と一緒に" :
      (p.spouse && p.spouse.alive ? "配偶者" : "") + (h.ppl.length > 2 ? (p.spouse && p.spouse.alive ? "と" : "") + "子ども" + (h.ppl.length - (p.spouse && p.spouse.alive ? 2 : 1)) + "人" : "") + (h.ppl.length > 1 ? "と一緒に" : "ひとりで");
    var sceneLabel = sceneAt ? t("scenePlace." + sceneAt) : "";
    if (english) {
      var family = h.home ? "with parents" + (p.sibs.length ? " and " + p.sibs.length + " siblings" : "") : h.ppl.length > 1 ? "with " + (p.spouse && p.spouse.alive ? "a spouse" : "family") + (h.ppl.length > 2 ? " and children" : "") : "alone";
      $("#sceneCap").textContent = (abroad(p) || country(c) + " · " + p.city) + " · " + (sceneAt ? "A day at the " + sceneLabel : (p.urban || p.moved ? "apartment building" : p.wealth >= 4 ? "spacious home" : "small home") + " · " + family);
    } else $("#sceneCap").textContent = place + " · " + (sceneAt ? sceneLabel + "で過ごす一日" : (p.urban || p.moved ? "集合住宅" : (p.wealth >= 4 ? "広い家" : "小さな家")) + " · " + with_);
  }
  function dreamStatus(p) {
    return typeof E.dreamStatus === "function" && p.dream ? E.dreamStatus(p) : null;
  }
  function dreamName(key) {
    var dream = (E.DREAMS || []).filter(function (x) { return x.key === key; })[0];
    return dream ? dream.label : key || t("dreamNone");
  }
  function dreamBlocks(p, status) {
    if (status && Array.isArray(status.blocked)) return status.blocked;
    return (p.log || []).filter(function (x) { return x.blocked; }).map(function (x) {
      return { age: x.a, reasonKey: x.reasonKey, text: x.t };
    });
  }
  function dreamBlockText(x) { return x.text || x.t || x.reasonKey || "—"; }
  function vaxText(vax) {
    var key = vax && vax.status;
    return t(key === "full" ? "vaxFull" : key === "partial" ? "vaxPartial" : key === "none" ? "vaxNone" : "vaxUnknown");
  }
  function dreamLine(p) {
    if (p.age < 8) return '<p class="dream-before">' + esc(t("dreamFromEight")) + '</p>';
    var status = dreamStatus(p), progress = status ? Math.max(0, Math.min(100, Number(status.progress) || 0)) : 0;
    var blocks = dreamBlocks(p, status).slice(-2).reverse();
    var info = p.dream ? '<span class="dream-name">' + esc(dreamName(p.dream)) + '</span><span class="dream-stage">' + esc(status && status.stage || "") + '</span>' : '<span class="dream-empty">' + esc(t("dreamNone")) + '</span>';
    return '<div class="dream-compact"><div class="dream-top"><strong>' + esc(t("dreamTitle")) + '</strong>' + info + '<button type="button" data-dream-open' + (typeof E.setDream !== "function" || !Array.isArray(E.DREAMS) ? ' disabled' : '') + '>' + esc(t(p.dream ? "dreamChange" : "dreamChoose")) + '</button></div>' +
      (p.dream ? '<div class="dream-meter" role="progressbar" aria-label="' + esc(t("dreamProgress", { progress: Math.round(progress) })) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(progress) + '"><i style="width:' + progress + '%"></i></div>' : '') +
      blocks.map(function (x) { return '<p class="dream-block">' + esc(t("dreamObstacle", { age: x.age, reason: dreamBlockText(x) })) + '</p>'; }).join("") + '</div>';
  }
  function openDreams() {
    if (!life || life.age < 8 || typeof E.setDream !== "function" || !Array.isArray(E.DREAMS)) return;
    var groups = {}, order = [];
    E.DREAMS.forEach(function (dream) { var category = dream.category || "other"; if (!groups[category]) { groups[category] = []; order.push(category); } groups[category].push(dream); });
    var html = '<div class="dream-picker">' + order.map(function (category) {
      var label = t("dreamCategory." + category);
      if (label === "dreamCategory." + category) label = category;
      return '<section><h3>' + esc(label) + '</h3><div class="dream-options">' + groups[category].map(function (dream) {
        var description = t("dreamDesc." + dream.key);
        if (description === "dreamDesc." + dream.key) description = "";
        return '<button type="button" data-dream="' + esc(dream.key) + '" aria-pressed="' + (life.dream === dream.key) + '"><b>' + esc(dream.label) + '</b>' + (description ? '<small>' + esc(description) + '</small>' : '') + '</button>';
      }).join("") + '</div></section>';
    }).join("") + '</div>';
    openModal(t("dreamChoose"), html || '<p>' + esc(t("dreamUnavailable")) + '</p>', function (body) {
      body.addEventListener("click", function (event) {
        var button = event.target.closest("[data-dream]");
        if (!button || button.disabled) return;
        if (E.setDream(life, button.getAttribute("data-dream"))) {
          store.set("life", life); renderFocus(); renderLog(); closeModal();
        }
      });
    });
  }
  function choiceChance(chance) {
    if (chance == null || !isFinite(Number(chance))) return "";
    return t(Number(chance) >= 0.7 ? "choiceHigh" : Number(chance) < 0.4 ? "choiceLow" : "choiceMedium");
  }
  function choiceContent(result) {
    var options = typeof E.choiceOptions === "function" ? E.choiceOptions(life) : [];
    if (!Array.isArray(options)) options = [];
    return (result ? '<p class="choice-result" role="status">' + esc(t("choiceResult", { text: result.text || result.blockedReason || t("choiceFailed") })) + '</p>' : '') +
      (options.length ? '<div class="life-choices">' + options.map(function (option) {
        var cost = Number(option.cost) || 0, chance = choiceChance(option.chance);
        return '<div class="life-choice"><div><b>' + esc(option.label) + '</b><small>' + esc(cost > 0 ? t("choiceCost", { cost: yen(cost) }) : t("choiceFree")) + (chance ? ' · ' + esc(t("choiceChance", { chance: chance })) : '') + '</small>' +
          (option.blockedReason ? '<span class="choice-blocked">' + esc(option.blockedReason) + '</span>' : '') + '</div><button type="button" data-try-choice="' + esc(option.key) + '">' + esc(t("choiceTry")) + '</button></div>';
      }).join("") + '</div>' : '<p>' + esc(t(typeof E.choiceOptions === "function" ? "choiceNone" : "choiceUnavailable")) + '</p>');
  }
  function openChoices() {
    if (!life) return;
    openModal(t("choiceTitle"), choiceContent(null), function (body) {
      body.addEventListener("click", function (event) {
        var button = event.target.closest("[data-try-choice]");
        if (!button || button.disabled || typeof E.tryChoice !== "function") return;
        if (typeof E.setRandom === "function") E.setRandom(Math.random);
        var result = E.tryChoice(life, button.getAttribute("data-try-choice"));
        store.set("life", life); renderLife();
        body.innerHTML = choiceContent(result || { ok: false });
      });
    });
  }
  function renderFocus() {
    var p = life, c = BY[p.iso];
    var studying = ["primary", "secondary", "univ"].indexOf(p.edu.stage) >= 0;
    var desc = p.job ? p.job + " · この仕事" + Math.max(1, p.jobYears) + "年目" + (p.informal ? " · 非正規" : "") : studying ? eduNow(p) : p.age < 6 ? (p.age < 2 ? "赤ちゃん" : "幼い子ども") : "家の手伝い";
    desc += " · " + (p.abroad || c.name) + (p.rel === "married" ? " · 結婚している" : p.rel === "widowed" ? " · 死別" : "") + (p.kids.length ? " · 子ども" + p.kids.length + "人" : "");
    if (english) desc = (p.job ? p.job + " · year " + Math.max(1, p.jobYears) + (p.informal ? " · informal work" : "") : studying ? eduNow(p) : p.age < 2 ? "Baby" : p.age < 6 ? "Young child" : "Helping at home") + " · " + (abroad(p) || country(c)) + (p.rel === "married" ? " · married" : p.rel === "widowed" ? " · widowed" : "") + (p.kids.length ? " · " + p.kids.length + " children" : "");
    var html = '<div class="focus-heading"><h3>' + esc(t('focusTitle')) + '</h3><button type="button" class="btn btn-sm" data-money-open>' + esc(t('moneyFocusButton')) + '</button></div><p class="focus-status" title="' + esc(desc) + '">' + esc(desc) + "</p>";
    if (p.age < 6) {
      html += '<p class="focus-note">' + esc(t('focusChildNote')) + '</p>';
    } else {
      html += '<div class="focus">' + E.FOCI.map(function (f) {
        var label = studying && f.sl ? f.sl : f.label, d = studying && f.sd ? f.sd : f.d;
        return '<button type="button" data-focus="' + esc(f.k) + '" aria-pressed="' + (p.focus === f.k) + '" title="' + esc(d) + '">' + esc(label) + '</button>';
      }).join("") + '</div><p class="focus-effect">' + esc((function () { var selected = E.FOCI.filter(function (f) { return f.k === p.focus; })[0]; return selected ? (studying && selected.sd ? selected.sd : selected.d) : ''; })()) + '</p>';
    }
    html += dreamLine(p) + '<div class="choice-compact"><span>' + esc(t("choiceTitle")) + '</span><button type="button" data-choice-open' + (typeof E.choiceOptions !== "function" || typeof E.tryChoice !== "function" ? ' disabled' : '') + '>' + esc(t("choiceOpen")) + '</button></div>';
    $("#pFocus").innerHTML = html;
  }
  function referenceNote(entry) {
    if (!entry || !entry.src) return '';
    var src = entry.fact ? window.I18N.factSource(entry) : entry.src;
    var note = entry.stat ? t('referenceNote', { src: src, stat: entry.stat }) : t('referenceSource', { src: src });
    return '<span class="log-note" title="' + esc(note) + '">' + esc(note) + '</span>';
  }
  function renderLog() {
    var p = life;
    $("#logHead").textContent = "同じ瞬間に生まれた4人も、それぞれの一生を進んでいます。";
    var keys = ["health", "family", "work", "learn", "society", "disaster", "economy", "world"];
    var row = $("#logFilters");
    if (row) row.remove();
    var out = [], shownAge = null;
    for (var i = p.log.length - 1; i >= 0 && out.length < 220; i--) {
      var x = p.log[i];
      var cat = keys.indexOf(x.cat) >= 0 ? x.cat : "family";
      var firstOfAge = shownAge !== x.a;
      shownAge = x.a;
      var isDecision = !!x.decision || /決断：|Decision:/.test(x.t || "");
      var tone = x.tone === "good" || x.tone === "bad" ? x.tone : "neutral";
      var classes = (x.big ? "big " : "") + (x.star ? "star " : "") + (x.fact ? "fact " : "") + (x.blocked ? "blocked " : "") + (x.dream ? "dream-progress " : "") + (x.vax ? "vaccination " : "") + (isDecision ? "decision " : "") + (firstOfAge ? "log-year-start " : "") + "log-cat-" + cat + " log-tone-" + tone;
      var body;
      body = '<span class="log-text">' + esc(x.fact ? window.I18N.factText(x) : x.t) + '</span>' + referenceNote(x);
      out.push('<li tabindex="0" data-i="' + i + '" class="' + classes + '" title="' + esc(t('logStarHint')) + '"><span class="a">' + (firstOfAge ? esc(x.a) + esc(t('logAge')) : '') + '</span><span class="log-body">' + body + "</span></li>");
    }
    $("#pLog").innerHTML = out.length ? out.join("") : '<li data-i="-1" class="log-empty">' + esc(t('logEmpty')) + '</li>';
  }
  function renderFam() {
    var p = life, rows = [];
    var par = function (x, who) { return x.alive ? x.name + " · " + (x.age + p.age) + "歳<br><span class=\"small\">" + esc(x.job) + "</span>" : x.name + "<br><span class=\"small\">" + (x.age + x.diedAt) + "歳で死去</span>"; };
    if (english) par = function (x) { return x.alive ? x.name + " · age " + (x.age + p.age) + "<br><span class=\"small\">" + esc(x.job) + "</span>" : x.name + "<br><span class=\"small\">Died at age " + (x.age + x.diedAt) + "</span>"; };
    rows.push(["母", par(p.parents.mom)]);
    rows.push(["父", par(p.parents.dad)]);
    if (p.sibs.length) rows.push(["きょうだい", p.sibs.map(function (s, i) { return (s.sex === "m" ? "兄" : "姉") + " " + (s.age + p.age) + "歳"; }).join(" · ")]);
    if (p.spouse) rows.push(["配偶者", esc(p.spouse.name) + (p.spouse.alive ? " · " + (p.age + p.spouse.d) + "歳" : "（死別）")]);
    if (p.kids.length) rows.push(["子ども", p.kids.map(function (k) { return esc(k.given) + (k.alive ? " " + (p.age - k.born) + "歳" : "（死去）"); }).join(" · ")]);
    if (p.grand) rows.push(["孫", p.grand + "人"]);
    if (p.pets.length) rows.push(["動物", p.pets.join("・")]);
    if (english) {
      rows = [];
      rows.push(["Mother", par(p.parents.mom)]);
      rows.push(["Father", par(p.parents.dad)]);
      if (p.sibs.length) rows.push(["Siblings", p.sibs.map(function (s) { return (s.sex === "m" ? "Brother" : "Sister") + ", age " + (s.age + p.age); }).join(" · ")]);
      if (p.spouse) rows.push(["Spouse", esc(p.spouse.name) + (p.spouse.alive ? " · age " + (p.age + p.spouse.d) : " (died)")]);
      if (p.kids.length) rows.push(["Children", p.kids.map(function (k) { return esc(k.given) + (k.alive ? ", age " + (p.age - k.born) : " (died)"); }).join(" · ")]);
      if (p.grand) rows.push(["Grandchildren", String(p.grand)]);
      if (p.pets.length) rows.push(["Animals", p.pets.join(", ")]);
    }
    $("#pFam").innerHTML = '<h3>家族と暮らし</h3><dl class="fam">' + rows.map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + r[1] + "</dd></div>"; }).join("") + "</dl>";
  }
  function stageOf(q, age) {
    if (english) {
      if (age > q.deathAge) return ["Died at age " + q.deathAge, true];
      if (age < 6) return ["Early childhood"];
      if (age < 16) return [q.wealth >= 3 || q.urban ? "Attending school" : "Helping at home"];
      if (age < 24) return [q.wealth >= 4 ? "Studying at university" : "Starting work"];
      if (age < 65) return ["Working"];
      return ["Retired"];
    }
    if (age > q.deathAge) return [q.deathAge + "歳で亡くなりました", true];
    if (age < 6) return ["幼少期"];
    if (age < 16) return [q.wealth >= 3 || q.urban ? "学校に通っています" : "家の仕事を手伝っています"];
    if (age < 24) return [q.wealth >= 4 ? "大学で学んでいます" : "働きはじめました"];
    if (age < 65) return ["働いています"];
    return ["引退しました"];
  }
  function renderPeers() {
    var p = life;
    $("#pPeers").innerHTML = (english ? '<h3>People born in the same second<small>Now, at the same age</small></h3><div class="peerlist">' : "<h3>同じ1秒に生まれた人たち<small>いま、同じ年齢で</small></h3><div class=\"peerlist\">") + p.peers.map(function (q) {
      var st = stageOf(q, p.age);
      return "<div><span><b>" + esc(q.name) + "</b><small>" + esc(country(BY[q.iso])) + " · " + (english ? q.sex === "m" ? "Male" : "Female" : q.sex === "m" ? "男" : "女") + '</small></span><span class="small" style="' + (st[1] ? "color:var(--ink3)" : "") + '">' + st[0] + "</span></div>";
    }).join("") + "</div>";
  }
  function renderMap() {
    var p = life, n = Math.max(100, Math.ceil((p.age + 1) / 10) * 10), cells = "";
    var le = Math.round(p.le);
    for (var i = 0; i < n; i++) {
      var cls = i < p.happy.length ? "lived" : "";
      if (i === le) cls += " le";
      if (i === p.age) cls += " now";
      var st = i < p.happy.length ? ' style="background:color-mix(in srgb,var(--stamp) ' + Math.max(12, p.happy[i]) + '%,var(--card))"' : "";
      cells += '<i class="' + cls + '"' + st + ' title="' + (english ? 'Age ' + i : i + '歳') + '"></i>';
    }
    $("#pMap").innerHTML = english ? "<h3>Life map<small>One square = one year</small></h3><div class=\"lifemap\">" + cells + '</div><p class="small" style="margin:8px 0 0">Darker squares show happier years · gray outline = ' + esc(country(BY[p.iso])) + " life expectancy for " + (p.sex === "m" ? "men" : "women") + ": " + p.le + " years</p>" : "<h3>人生地図<small>1マス = 1年</small></h3><div class=\"lifemap\">" + cells + '</div><p class="small" style="margin:8px 0 0">色が濃いほど幸福だった年 · 灰色の枠 = ' + esc(BY[p.iso].name) + "の" + (p.sex === "m" ? "男性" : "女性") + "の平均寿命 " + p.le + "歳</p>";
  }
  function renderPlace() {
    var p = life, birth = BY[p.iso];
    var key = p.iso + "|" + (p.abroad || ""), panel = $("#pPlace");
    if (panel.dataset.placeKey === key) return;
    panel.dataset.placeKey = key;
    var residence = p.abroad ? window.COUNTRIES.filter(function (c) { return c.name === p.abroad; })[0] : null;
    var otherPlaces = { "ニューカレドニア": [165.6, -21.5], "フランス領ギアナ": [-53.1, 3.9], "プエルトリコ": [-66.1, 18.2], "レユニオン": [55.5, -21.1] };
    if (!residence && p.abroad && otherPlaces[p.abroad]) residence = { lon: otherPlaces[p.abroad][0], lat: otherPlaces[p.abroad][1], name: p.abroad };
    var marks = [{ lon: birth.lon, lat: birth.lat, text: english ? "Place of birth · " + country(birth) : "生まれた場所 · " + birth.name }];
    if (residence) marks.push({ lon: residence.lon, lat: residence.lat, text: english ? "Current home · " + (abroad(p) || residence.name_en || residence.name) : "いま住む場所 · " + residence.name });
    var caption = english ? p.abroad ? "Now living in " + abroadIn(p) + ". Born in " + p.city + "." : "Born in " + p.city + " (" + country(birth) + ")." : p.abroad ? "いまは" + p.abroad + "で暮らしています。生まれた街は" + p.city + "です。" : "生まれた街：" + p.city + "（" + birth.name + "）";
    panel.innerHTML = (english ? "<h3>Where you live</h3>" : "<h3>暮らしている場所</h3>") + P.worldSVG({ w: 320, h: 180, marks: marks, arc: !!residence,
      label: english ? p.abroad ? "Move from " + countryIn(birth) + " to " + abroadIn(p) : "Birthplace in " + countryIn(birth) : p.abroad ? birth.name + "から" + p.abroad + "への移動" : birth.name + "の出生地" }) + '<p class="small map-place-caption">' + esc(caption) + "</p>";
  }
  function survSVG(p, W, H) {
    var c = BY[p.iso];
    var a = E.survival(E.lifeTable(c, p.sex, p.era, p.birthYear)), w = E.survival(E.worldTable());
    var X = function (x) { return 26 + x / 100 * (W - 34); }, Y = function (y) { return 8 + (1 - y) * (H - 30); };
    var line = function (s) { var d = ""; for (var x = 0; x <= 100; x++) d += (x ? " L" : "M") + X(x).toFixed(1) + " " + Y(s[x]).toFixed(1); return d; };
    var g = "";
    [0, 0.25, 0.5, 0.75, 1].forEach(function (t) { g += '<line x1="26" x2="' + (W - 8) + '" y1="' + Y(t) + '" y2="' + Y(t) + '" stroke="var(--rule)" stroke-width="0.6"/><text x="22" y="' + (Y(t) + 3) + '" font-size="12" text-anchor="end" fill="var(--ink3)">' + t * 100 + "%</text>"; });
    [0, 20, 40, 60, 80, 100].forEach(function (x) { g += '<text x="' + X(x) + '" y="' + (H - 10) + '" font-size="12" text-anchor="middle" fill="var(--ink3)">' + x + "</text>"; });
    var age = Math.min(100, p.age);
    var cur = a[age] || 0;
    return '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + (english ? 'Survival curve' : '生存曲線') + '">' + g +
      '<path d="' + line(a) + " L" + X(100) + " " + Y(0) + " L" + X(0) + " " + Y(0) + 'Z" fill="var(--stamp)" fill-opacity="0.12"/>' +
      '<path d="' + line(w) + '" fill="none" stroke="var(--ink3)" stroke-dasharray="3 3" stroke-width="1.2"/>' +
      '<path d="' + line(a) + '" fill="none" stroke="var(--stamp)" stroke-width="2"/>' +
      '<line x1="' + X(age) + '" x2="' + X(age) + '" y1="8" y2="' + Y(0) + '" stroke="var(--accent)" stroke-width="1"/>' +
      '<circle cx="' + X(age) + '" cy="' + Y(cur) + '" r="3.5" fill="var(--accent)"/><text x="' + (X(age) + 6) + '" y="' + (cur > 0.85 ? Y(cur) + 14 : Y(cur) - 5) + '" font-size="12" fill="var(--ink)">' + (english ? 'Surviving ' : '生存 ') + Math.round(cur * 100) + "%</text></svg>";
  }
  function renderSurv() {
    var p = life;
    $("#pSurv").innerHTML = english ? "<h3>Survival curve<small>Share of the birth cohort still alive</small></h3>" + survSVG(p, 300, 160) + '<p class="small" style="margin:4px 0 0"><span style="color:var(--stamp)">━</span> ' + esc(country(BY[p.iso])) + " (" + (p.sex === "m" ? "men" : "women") + ')' + ' <span style="color:var(--ink3)">┅</span> World average</p>' : "<h3>生存曲線<small>同じ年に生まれた人のうち、生きている人の割合</small></h3>" + survSVG(p, 300, 160) + '<p class="small" style="margin:4px 0 0"><span style="color:var(--stamp)">━</span> ' + esc(BY[p.iso].name) + "の" + (p.sex === "m" ? "男性" : "女性") + '　<span style="color:var(--ink3)">┅</span> 世界平均</p>';
  }

  // ---------- 決断・ひと休み ----------
  function openDecision() {
    var p = life;
    var d = E.decision(p);
    if (!d) { p.pending = null; return; }
    var stakeMoney = function (amount) { return english ? "US$" + fmt(amount) + " PPP" : yen(amount); };
    currentDecision = d; minimized = false;
    $("#decPeek").classList.remove("show");
    openModal(t("decision.title"), '<div class="small">' + esc(t("decision.ageYear", { age: p.age, year: p.birthYear + p.age })) + ' <button class="btn btn-sm btn-ghost" id="dMin" style="float:right">' + esc(t("decision.minimize")) + '</button></div><h2 class="dec-title">' + esc(d.title) + "</h2><p>" + esc(d.body) + '</p><p class="dec-note">' + esc(d.note) + "</p>" +
      d.choices.map(function (ch, i) {
        var s = ch.stakes || {}, first = t("decision.cost") + " " + stakeMoney(s.immediateCost || 0) + " · " + t("decision.time") + " " + (s.timeYears ? t("decision.years", { count: s.timeYears }) : t("decision.now")) + " · " + t("decision.chance") + " " + (s.risk || "—");
        var second = t("decision.effects") + " " + (s.effects || []).join(" / ");
        if (s.salaryRange) second += " · " + t("decision.salary") + " " + stakeMoney(s.salaryRange[0]) + "–" + stakeMoney(s.salaryRange[1]) + " · " + t("decision.training") + " " + s.training + " · " + t("decision.pension") + " " + Math.round(s.benefitEligibility * 100) + "% · " + t("decision.debt") + " " + stakeMoney(s.debtCapacity);
        return (ch.wait && d.reasons && d.reasons.length ? '<div class="dec-unavailable">' + d.reasons.map(function (reason) { return '<p>' + esc(reason) + '</p>'; }).join("") + '</div>' : '') + '<button class="choice" data-c="' + i + '" style="padding:8px 10px"><span class="k">' + (i + 1) + '</span><span style="min-width:0"><strong>' + esc(ch.t) + '</strong><small style="display:block;font-size:11px;line-height:1.35;color:var(--ink2);font-weight:400">' + esc(first) + '</small><small style="display:block;font-size:11px;line-height:1.35;color:var(--ink2);font-weight:400">' + esc(second) + '</small></span></button>';
      }).join("") +
      '<p style="margin-top:12px"><button class="btn btn-sm" id="dAuto">' + esc(t("decision.auto")) + '</button></p>', function (b) {
        b.addEventListener("click", function (e) {
          var ch = e.target.closest("[data-c]");
          if (ch) { pickChoice(+ch.getAttribute("data-c")); return; }
          if (e.target.id === "dAuto") { p.auto = true; p.focusManual = false; syncCtrls(); pickChoice(Math.floor(Math.random() * d.choices.length)); return; }
          if (e.target.id === "dMin") { minimized = true; modalOnClose = null; closeModal(); $("#decPeek").classList.add("show"); }
        });
      }, function () { if (currentDecision && !minimized) { minimized = true; $("#decPeek").classList.add("show"); } });
  }
  $("#decOpen").addEventListener("click", function () { if (life && life.pending) openDecision(); });
  function pickChoice(i) {
    var d = currentDecision;
    if (!d || !life || life.pending == null) return;
    currentDecision = null; minimized = false;
    modalOnClose = null; closeModal();
    $("#decPeek").classList.remove("show");
    E.choose(life, d, i);
    store.set("life", life);
    renderLife();
  }
  var BREATH_Q = {
    5: "あなたの5歳のころ、毎日あたりまえのようにそばにあったものを、ひとつ思い浮かべてください。",
    15: "15歳のあなたは、何になりたいと思っていましたか。",
    30: "30歳のころ、あなたのそばには誰がいましたか。（これからなら、誰がいてほしいですか。）",
    50: "「もう十分だ」と思えるのは、どんなときですか。",
    70: "誰かに最後にひとつだけ伝えるとしたら、何を伝えますか。"
  };
  function breatherText(p, a) {
    var c = BY[p.iso], real = settings.real ? BY[settings.real] : null;
    var surv = E.survival(E.lifeTable(c, p.sex, p.era, p.birthYear))[a];
    if (english) {
      var sentence = p.given + ", age " + a + ". ";
      if (a === 5) sentence += "In " + countryIn(c) + ", " + c.u5.toFixed(1) + "% of children die before their fifth birthday. This child reached it.";
      else if (a === 15) sentence += "Expected years in school in " + countryIn(c) + ": " + c.school + ". This child is now " + eduNow(p).replace(/^[A-Z](?=[a-z])/, function (letter) { return letter.toLowerCase(); }) + ".";
      else sentence += "Of " + (p.sex === "m" ? "men" : "women") + " born in " + countryIn(c) + " in the same year, about " + Math.round(surv * 100) + "% are still alive.";
      if (real && real.iso !== p.iso) sentence += " In " + countryIn(real) + ", the figure is " + Math.round(E.survival(E.lifeTable(real, p.sex, p.era, p.birthYear))[a] * 100) + "%.";
      return sentence;
    }
    var s = p.given + "、" + a + "歳。";
    if (a === 5) s += c.name + "では、子どもの" + c.u5.toFixed(1) + "%が5歳を迎えられません。この子は迎えました。";
    else if (a === 15) s += c.name + "で学校で過ごす年数の見込みは" + c.school + "年です。この子はいま「" + eduNow(p) + "」です。";
    else s += "同じ年に" + c.name + "で生まれた" + (p.sex === "m" ? "男性" : "女性") + "のうち、約" + Math.round(surv * 100) + "%がいまも生きています。";
    if (real && real.iso !== p.iso) s += "あなたの" + real.name + "では、" + Math.round(E.survival(E.lifeTable(real, p.sex, p.era, p.birthYear))[a] * 100) + "%です。";
    return s;
  }
  function openBreather() {
    var p = life, a = p.breather;
    p.breather = null;
    var peers = p.peers.map(function (q) { return english ? esc(q.name.split(" ")[0]) + " (" + esc(country(BY[q.iso])) + "): " + stageOf(q, a)[0] : esc(q.name.split(" ")[0]) + "（" + esc(BY[q.iso].name) + "）：" + stageOf(q, a)[0]; }).join(" · ");
    var timer = null;
    var questionsEn = { 5: "Think of something that was always there when you were five.", 15: "What did you want to become at fifteen?", 30: "Who was beside you at thirty, or who did you wish was there?", 50: "What does having enough mean to you?", 70: "What would you tell someone if you had one last message?" };
    var breatherHtml = english ? '<div class="small">Age ' + a + ' · ' + (p.birthYear + a) + '</div><h2 class="dec-title">' + esc(p.given) + ', age ' + a + '</h2><p>' + esc(breatherText(p, a)) + '</p><p class="dec-note">People born in the same second — ' + peers + '</p><p><b>' + questionsEn[a] + '</b></p><textarea id="brT" maxlength="400" placeholder="Your words will be saved in this life record"></textarea><p style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-primary" id="brW">Write and continue</button><button class="btn" id="brS">Keep it to yourself and continue</button></p><p class="small" id="brAuto"></p>' : '<div class="small">' + a + "歳 · " + (p.birthYear + a) + '年</div><h2 class="dec-title">' + esc(p.given) + "、" + a + "歳</h2><p>" + esc(breatherText(p, a)) + '</p><p class="dec-note">同じ1秒に生まれた人たち — ' + peers + "</p><p><b>" + BREATH_Q[a] + '</b></p><textarea id="brT" maxlength="400" placeholder="書いたことは、この一生の記録に残ります"></textarea><p style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-primary" id="brW">書き留めて、続ける</button><button class="btn" id="brS">胸にしまって、続ける</button></p><p class="small" id="brAuto"></p>';
    openModal(english ? "Pause and reflect" : "ひと休み", breatherHtml, function (b) {
        var go = function (write) {
          clearInterval(timer);
          var v = $("#brT", b).value.trim();
           if (write && v) E.addLog(p, english ? "At age " + a + ", during a pause: " + v : a + "歳のひと休みに：" + v, { big: true });
          modalOnClose = null; closeModal(); store.set("life", p); renderLog();
        };
        $("#brW", b).addEventListener("click", function () { go(true); });
        $("#brS", b).addEventListener("click", function () { go(false); });
        if (p.auto) {
          var n = 8;
          var tick = function () { if (document.activeElement === $("#brT", b) || $("#brT", b).value) { $("#brAuto", b).textContent = english ? "Take your time to finish writing." : "書き終えるまで待ちます。"; return; } $("#brAuto", b).textContent = english ? "Auto mode: continuing in " + n + " seconds." : "おまかせ中のため、" + n + "秒後に続きます。"; if (n-- <= 0) go(false); };
          tick(); timer = setInterval(tick, 1000);
        }
      }, function () { clearInterval(timer); });
  }

  // ---------- 時間を進める ----------
  var last = performance.now();
  setInterval(function () {
    var now = performance.now(), dt = Math.min(0.5, (now - last) / 1000);
    last = now;
    if (!life || life.ended || $("#life").hidden || paused) return;
    if ($("#modal").classList.contains("open")) return;
    // ひと休みのあとなどに決断が残っていたら、画面を出し直す（出さないと時間が止まったままになる）
    if (life.breather) { openBreather(); return; }
    if (life.pending) {
      if (life.auto) { E.resolveAuto(life); store.set("life", life); renderLife(); }
      else if (!minimized) openDecision();
      return;
    }
    var spy = secPerYear(life);
    life.t += dt * (fast ? 60 : speed) / spy;
    $("#lProg").style.width = (Math.min(1, life.t) * 100).toFixed(1) + "%";
    if (life.t < 1) return;
    try {
      E.setRandom(Math.random);
      E.yearEnd(life);
      if (!life.hist) life.hist = [];
      life.hist.push({ a: life.age, y: life.birthYear + life.age,
        h: Math.round(life.stats.h), hp: Math.round(life.stats.hp), k: Math.round(life.stats.k), r: Math.round(life.stats.r),
        inc: Math.round(life.income || 0), net: Math.round(life.net || 0), job: life.job || "",
        edu: life.edu ? life.edu.stage + "/" + life.edu.level : "", rel: life.rel || "single",
        kids: life.kids ? life.kids.length : 0, place: life.abroad ? abroad(life) : life.iso, focus: life.focus || "balance", ret: !!life.retired });
      store.set("life", life);
      if (life.ended) { finishLife(); return; }
      var guard = 0;
      while (life.pending && life.auto && guard++ < 10) { E.resolveAuto(life); }
      renderLife();
    } catch (err) {
      // 1年分の処理で失敗しても止めずに次の年へ進める
      if (window.console) console.error("Your World, Your Life: 1年の処理でエラー", err);
      life.pending = null;
      return;
    }
    if (life.breather) { fast = false; syncCtrls(); openBreather(); }
    else if (life.pending) { fast = false; syncCtrls(); openDecision(); }
  }, 100);

  // =====================================================================
  // 最期とふりかえり
  // =====================================================================
  function appearedSupports(p) {
    var data = joysFor(p.iso) || {}, seen = { joys: {}, motivations: {} };
    (p.log || []).forEach(function (entry) {
      [['joy', 'joys'], ['motivation', 'motivations']].forEach(function (field) {
        var index = entry[field[0]], group = field[1];
        if (entry.everyday && Number.isInteger(index) && index >= 0 && data[group] && data[group][index]) seen[group][index] = true;
      });
    });
    var result = {};
    ['joys', 'motivations'].forEach(function (group) {
      result[group] = Object.keys(seen[group]).map(Number).sort(function (a, b) { return a - b; }).map(function (index) {
        var item = data[group][index];
        return { ja: item.ja, en: item.en };
      });
    });
    return result;
  }
  function finishLife() {
    var p = life;
    renderLife();
    var r = buildReportRecord(p);
    var past = store.get("past", []);
    past.push(r);
    store.set("past", past.slice(-30));
    store.del("life");
    life = null;
    syncResume();
    playEnding(r, function () { showRecord(r, false); });
  }
  function buildReportRecord(p) {
    var r = E.record(p);
    r.era = p.era;
    r.birthMonth = p.birthMonth;
    r.itemKeys = (p.items || []).slice();
    r.hist = p.hist || [];
    var finalPortfolio = moneyPortfolio(p);
    r.moneyHistory = Array.isArray(finalPortfolio.history) ? finalPortfolio.history.map(function (x) { return { age: x.age, netWorth: x.netWorth, income: x.income, capitalIncome: x.capitalIncome, incomeSources: x.incomeSources }; }) : [];
    r.lifetimeIncomeSources = Object.assign({}, p.lifetimeIncomeSources || {});
    r.debtEvents = (Array.isArray(p.debtEvents) ? p.debtEvents.slice() : []).concat((p.log || []).filter(function (x) { return x.cat === 'economy' && /借|返済|ローン|debt|loan|borrow|repay/i.test(x.t || ''); }).map(function (x) { return { age: x.a, text: x.t }; })).sort(function (a, b) { return (a.age || 0) - (b.age || 0); });
    r.inheritanceReceived = p.inheritanceReceived == null ? null : Number(p.inheritanceReceived);
    r.inheritanceLeft = p.inheritanceLeft == null ? (finalPortfolio.netWorth == null ? null : Math.max(0, Number(finalPortfolio.netWorth))) : Number(p.inheritanceLeft);
    r.peers = (p.peers || []).slice(0, 4).map(function (q) { return { name: q.name, iso: q.iso, sex: q.sex, deathAge: q.deathAge }; });
    r.stars = (p.log || []).filter(function (x) { return x.star; }).slice(-20).map(function (x) { return { a: x.a, t: x.t }; });
    r.notes = (p.log || []).filter(function (x) { return /^(メモ：|Note: )/.test(x.t) || x.t.indexOf("ひと休みに：") >= 0 || x.t.indexOf("during a pause: ") >= 0; }).slice(-12).map(function (x) { return { a: x.a, t: x.t }; });
    r.big = (p.log || []).filter(function (x) { return x.big || x.fact || x.src && x.stat || x.decision || x.t.indexOf("決断：") >= 0; }).slice(-120).map(function (x) { return { a: x.a, t: x.t, t_en: x.t_en, cat: x.cat, tone: x.tone, fact: x.fact, src: x.src, src_en: x.src_en, stat: x.stat }; });
    var dream = dreamStatus(p);
    r.dream = p.dream || null;
    r.dreamResult = dream ? { progress: dream.progress, stage: dream.stage, achieved: !!dream.achieved, blocked: dreamBlocks(p, dream).map(function (x) { return { age: x.age, reasonKey: x.reasonKey, text: dreamBlockText(x) }; }) } : null;
    r.vax = p.vax ? { status: p.vax.status, reasonKey: p.vax.reasonKey } : null;
    r.foci = p.focusYears || {};
    r.decisions = p.decisionCount || 0;
    r.parentsDeath = p.parents ? { mother: p.parents.mom && p.parents.mom.diedAt, father: p.parents.dad && p.parents.dad.diedAt } : null;
    r.childrenNames = (p.kids || []).map(function (x) { return { name: x.given, born: x.born }; });
    r.supports = appearedSupports(p);
    return r;
  }
  function playEnding(r, done) {
    var big = r.log.filter(function (x) { return !/^(メモ：|Note: )|ひと休みに：|during a pause: /.test(x.t); });
    var picks = [big[0]];
    var middle = big.slice(1, -1);
    var n = Math.min(6, middle.length);
    for (var i = 0; i < n; i++) picks.push(middle[Math.floor(i * middle.length / n)]);
    picks.push(big[big.length - 1]);
    var slides = picks.filter(Boolean);
    var suicide = r.death.cause === "自殺" || r.death.cause === "Suicide";
    var storyLines = (r.story || r.reflection || '').match(/[^。.!?]+[。.!?]/g) || [];
    if (storyLines.length > 2) slides.splice(slides.length - 1, 0, { a: r.death.age, t: storyLines.slice(0, -2).join(english ? ' ' : ''), tone: 'neutral' });
    var endingStory = storyLines.slice(-2).join(english ? ' ' : '');
    var lastSlide = { a: r.death.age, t: (endingStory || r.story || r.reflection || '') + ' ' + t('endingCause', { cause: r.death.cause }), last: true, tone: 'bad' };
    slides[slides.length - 1] = lastSlide;
    var el = $("#ending"), idx = 0, timer;
    var grp = BY[r.iso].grp;
    el.innerHTML = '<button class="skip">スキップ</button><canvas class="pixel"></canvas><div class="age"></div><div class="line"></div><div class="dots">' + slides.map(function () { return "<i></i>"; }).join("") + '</div><div class="hint">画面を押すと次へ進みます</div>';
    el.classList.add("show");
    var cv = $("canvas", el);
    var draw = function () {
      var s = slides[idx];
      var slideSeed = hash(r.id) + idx;
      var slideMonth = 1 + (((r.birthMonth || 1) - 1 + idx * 3) % 12);
      var slideHappiness = r.happy && r.happy[s.a];
      var slideMood = sceneMood(slideHappiness, s.tone);
      if (idx === 0) P.room(cv, { seed: slideSeed, sex: "f", lyingAge: 30, heart: true, grp: grp, wealth: r.wealth, era: r.era, month: slideMonth, time: "dawn", mood: "happy", visitors: [{ age: 34, sex: "m" }, { age: 0, sex: r.sex }] });
      else if (s.last) P.room(cv, { seed: slideSeed, sex: r.sex, lyingAge: r.death.age, grp: grp, wealth: r.wealth, era: r.era, month: slideMonth, time: "dusk", mood: "sad", visitors: Array.apply(null, Array(Math.min(4, r.kids))).map(function (_, k) { return { age: Math.max(3, r.death.age - 26 - k * 3), sex: k % 2 ? "m" : "f" }; }) });
      else P.scene(cv, { seed: slideSeed, urban: r.urban, wealth: r.wealth, grp: grp, age: s.a, era: r.era, place: scenePlace(s.t) || "home", season: slideMonth, month: slideMonth, weather: sceneWeather(r.iso, slideMonth, slideSeed), time: sceneTime(s.t, slideSeed), happiness: slideHappiness, mood: slideMood, event: s.t, waterFetch: /水を汲|水くみ|fetch.*water/i.test(s.t), studying: /学校|在学|卒業|school|studying|graduat/i.test(s.t), items: r.itemKeys || (r.items || []).map(function (item) { return item === "自転車" || item === "Bicycle" ? "bike" : item === "バイク" || item === "Motorbike" ? "motorbike" : item === "中古車" || item === "Used car" ? "usedCar" : item === "新車" || item === "New car" ? "newCar" : item; }), pets: r.pets || [], people: [{ age: s.a < 1 ? 0 : s.a, sex: r.sex, mood: slideMood }] });
      var ageLabel = $(".age", el);
      var slideTone = s.tone === 'good' || s.tone === 'bad' ? s.tone : 'neutral';
      ageLabel.className = 'age log-tone-' + slideTone;
      ageLabel.textContent = s.a + (english ? ' years' : '歳');
      var line = $(".line", el);
      line.textContent = s.t;
      if (s.last && suicide) {
        var note = document.createElement("span");
        note.className = "cause-note";
        note.textContent = "つらい気持ちを抱えているときは、ひとりで抱えずに、身近な人や相談窓口に話してください。";
        line.appendChild(note);
      }
      line.style.animation = "none"; void line.offsetWidth; line.style.animation = "";
      $$(".dots i", el).forEach(function (d, k) { d.classList.toggle("on", k <= idx); });
    };
    var end = function () { clearInterval(timer); el.classList.remove("show"); el.innerHTML = ""; el.onclick = null; done(); };
    var next = function () { idx++; if (idx >= slides.length) end(); else draw(); };
    el.onclick = function (e) { if (e.target.closest(".skip")) { end(); return; } clearInterval(timer); timer = setInterval(next, 3600); next(); };
    draw();
    timer = setInterval(next, 3600);
  }

  // ---------- 死亡記録 ----------
  function reportCard(title, body, note) {
    return '<section class="report-card"><h2>' + esc(title) + '</h2>' + (note ? '<p class="report-note">' + esc(note) + '</p>' : '') + body + '</section>';
  }
  var reportPopulation = null;
  function reportAverages() {
    if (reportPopulation) return reportPopulation;
    var state = [], focus = {}, count = 0, keys = ['work', 'balance', 'family', 'health', 'learn', 'hobby'];
    for (var i = 0; i < 200; i++) {
      E.setRandom(E.rng(81000 + i));
      var p = E.birth({ era: 'now', method: 'births' }), guard = 0;
      p.auto = true;
      while (!p.ended && guard++ < 130) {
        if (p.pending) { E.resolveAuto(p); continue; }
        E.yearEnd(p);
        if (p.pending && !p.ended) E.resolveAuto(p);
        if (!p.ended) {
          var a = p.age, s = state[a] || (state[a] = { n: 0, h: 0, hp: 0, k: 0, r: 0 });
          s.n++; s.h += p.stats.h; s.hp += p.stats.hp; s.k += p.stats.k; s.r += p.stats.r;
        }
      }
      var fy = p.focusYears || {}, total = keys.reduce(function (n, k) { return n + (fy[k] || 0); }, 0);
      if (total) { count++; keys.forEach(function (k) { focus[k] = (focus[k] || 0) + (fy[k] || 0) / total; }); }
    }
    E.setRandom(Math.random);
    keys.forEach(function (k) { focus[k] = count ? focus[k] / count : 0; });
    reportPopulation = { state: state, focus: focus };
    return reportPopulation;
  }
  function tipAttr(s) { return ' data-report-tip="' + esc(s) + '" tabindex="0" role="button" aria-label="' + esc(s) + '" aria-describedby="reportTipHint"'; }
  function initReportTooltips() {
    var host = $('#dead'), tip = document.createElement('div');
    tip.id = 'reportTooltip'; tip.className = 'report-tooltip'; tip.setAttribute('role', 'tooltip'); tip.hidden = true;
    host.appendChild(tip);
    var active = null, activeSvg = null;
    function clear() {
      if (active) active.classList.remove('report-active');
      if (activeSvg) {
        var old = activeSvg.querySelector('.report-crosshair');
        if (old) old.remove();
        activeSvg.querySelectorAll('.report-bar-active').forEach(function (bar) { bar.classList.remove('report-bar-active'); });
      }
      active = activeSvg = null;
      tip.hidden = true;
    }
    function reveal(el, x, y) {
      if (!el || !el.hasAttribute('data-report-tip')) { clear(); return; }
      tip.textContent = el.getAttribute('data-report-tip'); tip.hidden = false;
      var rect = el.getBoundingClientRect();
      x = x == null ? rect.left + rect.width / 2 : x; y = y == null ? rect.top : y;
      var left = x + 12, top = y - tip.offsetHeight - 12;
      if (left + tip.offsetWidth > window.innerWidth - 8) left = x - tip.offsetWidth - 12;
      if (top < 8) top = y + 12;
      tip.style.left = Math.max(8, Math.min(left, window.innerWidth - tip.offsetWidth - 8)) + 'px';
      tip.style.top = Math.max(8, Math.min(top, window.innerHeight - tip.offsetHeight - 8)) + 'px';
    }
    function select(el) {
      if (!el) { clear(); return; }
      if (active !== el) {
        if (active) active.classList.remove('report-active');
        active = el;
        el.classList.add('report-active');
      }
      var svg = el.closest('svg.report-svg');
      if (activeSvg && activeSvg !== svg) {
        var previous = activeSvg.querySelector('.report-crosshair');
        if (previous) previous.remove();
        activeSvg.querySelectorAll('.report-bar-active').forEach(function (bar) { bar.classList.remove('report-bar-active'); });
      }
      activeSvg = svg;
      if (!svg || !el.hasAttribute('data-report-age')) return reveal(el);
      var ns = 'http://www.w3.org/2000/svg', x = Number(el.getAttribute('data-report-x'));
      var view = svg.viewBox.baseVal, timeline = view.height < 100, top = timeline ? 18 : 16, bottom = timeline ? 64 : view.height - 32;
      var group = svg.querySelector('.report-crosshair');
      if (!group) { group = document.createElementNS(ns, 'g'); group.setAttribute('class', 'report-crosshair'); svg.appendChild(group); }
      group.replaceChildren();
      function shape(name, attrs) { var node = document.createElementNS(ns, name); Object.keys(attrs).forEach(function (key) { node.setAttribute(key, attrs[key]); }); group.appendChild(node); return node; }
      shape('line', { x1: x, x2: x, y1: top, y2: bottom, class: 'report-crosshair-line' });
      (el.getAttribute('data-report-points') || '').split(';').filter(Boolean).forEach(function (point) {
        var parts = point.split('|');
        shape('circle', { cx: x, cy: parts[0], r: 4.5, fill: parts[1], class: 'report-crosshair-dot' });
      });
      var label = el.getAttribute('data-report-age');
      var labelX = Math.max(22, Math.min(view.width - 22, x));
      var labelY = timeline ? 51 : bottom + 4;
      shape('rect', { x: labelX - 19, y: labelY, width: 38, height: 19, rx: 3, class: 'report-crosshair-label-bg' });
      var text = shape('text', { x: labelX, y: labelY + 14, 'text-anchor': 'middle', class: 'report-crosshair-label' });
      text.textContent = label;
      svg.querySelectorAll('.report-bar-active').forEach(function (bar) { bar.classList.remove('report-bar-active'); });
      var bar = svg.querySelector('[data-report-bar-age="' + label + '"]');
      if (bar) bar.classList.add('report-bar-active');
      var point = svg.createSVGPoint(); point.x = x; point.y = top;
      var screen = point.matrixTransform(svg.getScreenCTM());
      reveal(el, screen.x, screen.y);
    }
    function nearest(svg, clientX) {
      var point = svg.createSVGPoint(); point.x = clientX; point.y = 0;
      var x = point.matrixTransform(svg.getScreenCTM().inverse()).x;
      var points = Array.prototype.slice.call(svg.querySelectorAll('[data-report-age]'));
      return points.reduce(function (best, el) { return !best || Math.abs(Number(el.getAttribute('data-report-x')) - x) < Math.abs(Number(best.getAttribute('data-report-x')) - x) ? el : best; }, null);
    }
    function pointer(e) {
      var svg = e.target.closest('svg.report-svg');
      if (svg && svg.querySelector('[data-report-age]')) { select(nearest(svg, e.clientX)); return; }
      var el = e.target.closest('[data-report-tip]');
      if (activeSvg) clear();
      if (el) { select(el); reveal(el, e.clientX, e.clientY); }
      else clear();
    }
    host.onpointerover = pointer;
    host.onpointermove = pointer;
    host.onclick = pointer;
    host.onfocusin = function (e) { select(e.target.closest('[data-report-tip]')); };
    host.onkeydown = function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      var el = e.target.closest('[data-report-age]');
      if (!el) return;
      var list = Array.prototype.slice.call(el.closest('svg').querySelectorAll('[data-report-age]'));
      var next = list[Math.max(0, Math.min(list.length - 1, list.indexOf(el) + (e.key === 'ArrowRight' ? 1 : -1)))];
      e.preventDefault(); next.focus(); select(next);
    };
    host.onpointerleave = clear;
    host.onpointerup = function (e) { if (e.pointerType === 'touch') clear(); };
    host.onfocusout = function (e) { if (!host.contains(e.relatedTarget)) clear(); };
  }
  function reportTile(label, value, detail) {
    return '<div class="report-tile"><span>' + esc(label) + '</span><strong>' + esc(value) + '</strong>' + (detail ? '<small>' + esc(detail) + '</small>' : '') + '</div>';
  }
  function reportMilestones(r) {
    var age = Math.max(0, Number(r.death.age) || 0);
    var events = [{ a: 0, t: english ? 'Born in ' + (r.country || 'this country') : (r.country || 'この国') + 'で生まれる', cat: 'family' }];
    if (Array.isArray(r.history) && r.history.length) {
      events = (Array.isArray(r.timeline) ? r.timeline : r.history).map(function (event) {
        return { id: event.id, a: event.age, t: event.text, cat: event.cat, tone: event.tone,
          src: event.src, stat: event.stat, type: event.type };
      }).filter(function (event) { return event.t && event.a >= 0 && event.a <= age && event.type !== 'choice_success'; });
    } else {
    var source = r.big || r.log || [];
    source.forEach(function (x) {
      var eventText = String(x.fact ? window.I18N.factText(x) : x.t || '');
      if (eventText.indexOf('決断：') >= 0 || /^Decision:| — .+を選びました。$/.test(eventText)) return;
      if (x.tone !== 'good' && x.tone !== 'bad' && !(x.src && x.stat) && !/学校|通いはじめ|働きはじめ|結婚|子ども|生まれました|移り住|故郷に戻|亡くなりました|旅立ちました|仕事から退|大学|卒業|school|stud|work|marri|child|born|moved|returned|died|retired|graduat/i.test(eventText)) return;
      if (!isFinite(Number(x.a)) || x.a < 0 || x.a > age) return;
      events.push({ a: Number(x.a), t: eventText, tone: x.tone, cat: x.cat || (/学校|大学|卒業|school|university|graduat/i.test(eventText) ? 'learn' : /働|仕事|work|job/i.test(eventText) ? 'work' : 'family'), src: x.src, src_en: x.src_en, stat: x.stat, fact: x.fact });
    });
    function addMissing(a, t, cat, pattern, tone) {
      if (!isFinite(Number(a)) || a < 0 || a > age) return;
      if (!events.some(function (x) { return x.a === Number(a) && pattern.test(x.t); })) events.push({ a: Number(a), t: t, cat: cat, tone: tone || 'neutral' });
    }
    if (Array.isArray(r.hist)) {
      var prior = null;
      r.hist.forEach(function (x) {
        if (!prior || !/^(primary|secondary|univ)\//.test(prior.edu || '')) {
          if (/^(primary|secondary|univ)\//.test(x.edu || '')) addMissing(x.a, english ? 'Started school' : '学校で学びはじめる', 'learn', /学校|学び|通い|school|stud/i);
        }
        if ((!prior || !prior.job) && x.job) addMissing(x.a, english ? 'Started working as ' + x.job : x.job + 'として働きはじめる', 'work', /働きはじめ|仕事を始|started work/i, 'good');
        if ((!prior || prior.rel !== 'married') && x.rel === 'married') addMissing(x.a, english ? 'Got married' : '結婚する', 'family', /結婚|marri/i, 'good');
        if (prior && prior.rel === 'married' && x.rel === 'widowed') addMissing(x.a, english ? 'Said goodbye to a spouse' : '配偶者を見送る', 'family', /旅立ち|配偶者を見送|亡くな|spouse|widow/i, 'bad');
        if (prior && x.place !== prior.place && x.place !== r.iso) addMissing(x.a, english ? 'Moved to ' + x.place : x.place + 'へ移り住む', 'world', /移り住|渡っ|moved/i);
        if (prior && !prior.ret && x.ret) addMissing(x.a, english ? 'Retired from work' : '仕事から退く', 'work', /仕事から退|引退|retir/i);
        prior = x;
      });
    }
    (r.childrenNames || []).forEach(function (x) { if (!isFinite(Number(x.born)) || x.born < 0 || x.born > age) return; if (!events.some(function (event) { return event.a === Number(x.born) && event.t.indexOf(x.name || '子ども') >= 0 && /生まれ|born/i.test(event.t); })) events.push({ a: Number(x.born), t: english ? (x.name || 'A child') + ' was born' : (x.name || '子ども') + 'が生まれる', cat: 'family', tone: 'good' }); });
    if (r.parentsDeath) {
      addMissing(r.parentsDeath.mother, english ? 'Said goodbye to mother' : '母を見送る', 'family', /母が亡く|母を見送|mother.*died/i, 'bad');
      addMissing(r.parentsDeath.father, english ? 'Said goodbye to father' : '父を見送る', 'family', /父が亡く|父を見送|father.*died/i, 'bad');
    }
    if (r.bestYear && ( /^(\d+)歳/.test(r.bestYear) || /age (\d+)/i.test(r.bestYear))) events.push({ a: +RegExp.$1, t: english ? 'Happiest year' : '幸福を最も強く感じた年', cat: 'health', tone: 'good' });
    events.push({ a: age, t: english ? 'Life ended in ' + (r.death.where || r.country || '') : (r.death.where || r.country || '') + 'で生涯を終える', cat: 'health' });
    }
    events.sort(function (a, b) { return a.a - b.a; });
    var seen = {};
    if (!r.history || !r.history.length) events = events.filter(function (x) { var key = x.a + ':' + x.t; if (seen[key]) return false; seen[key] = true; return true; });
    var W = 640, left = 25, right = 615, base = 44, span = Math.max(1, age);
    var ticks = '';
    for (var a = 0; a <= age; a += 10) {
      var px = left + a / span * (right - left);
      ticks += '<line x1="' + px + '" x2="' + px + '" y1="36" y2="52" stroke="var(--rule)"/>' + (age <= 70 || a % 20 === 0 ? '<text x="' + px + '" y="74" text-anchor="middle">' + a + '</text>' : '');
    }
    var dots = events.map(function (x) {
      var px = left + x.a / span * (right - left), key = /結婚|子ども|生まれ|生涯を終|亡く/.test(x.t);
      var reference = x.src && x.stat ? t('referenceNote', { src: x.fact ? window.I18N.factSource(x) : x.src, stat: x.stat }) : '';
      var detail = t('reportTimelineDetail', { age: x.a, year: r.birthYear + x.a, event: x.t, reference: reference, expected: (Number(r.le) || 0).toFixed(1) });
      return '<circle cx="' + px + '" cy="' + base + '" r="' + (key ? 6 : 4.5) + '" fill="var(--ink2)" data-report-age="' + x.a + '" data-report-x="' + px + '" data-report-points="44|var(--ink2)"' + tipAttr(detail) + '><title>' + esc(t('reportTimelineAge', { age: x.a })) + ' ' + esc(x.t) + '</title></circle>';
    }).join('');
    var svg = '<svg class="report-svg" viewBox="0 0 640 90" role="group" aria-label="' + esc(t('reportTimelineAria')) + '"><title>' + esc(t('reportTimelineTitle')) + '</title><line x1="25" x2="615" y1="44" y2="44" stroke="var(--ink2)" stroke-width="2"/>' + ticks + dots + '<text x="320" y="88" text-anchor="middle">' + esc(t('reportTimelineAxis')) + '</text></svg>';
    function rows(list) { return '<ol class="report-events">' + list.map(function (x) { var tone = x.tone === 'good' || x.tone === 'bad' ? x.tone : 'neutral'; return '<li class="log-cat-' + (/^(health|family|work|learn|society|disaster|economy|world)$/.test(x.cat) ? x.cat : 'family') + ' log-tone-' + tone + '"><b>' + esc(t('reportTimelineAge', { age: x.a })) + ' ·</b><span class="report-event-body"><span class="report-event-text">' + esc(x.t) + '</span>' + referenceNote(x) + '</span></li>'; }).join('') + '</ol>'; }
    var compact = window.matchMedia && window.matchMedia('(max-width:760px)').matches;
    return reportCard(t('reportTimelineTitle'), svg + (compact ? rows(events) : rows(events.slice(0, 15)) + (events.length > 15 ? '<details class="report-more"><summary>' + esc(t('reportTimelineMore', { count: events.length - 15 })) + '</summary>' + rows(events.slice(15)) + '</details>' : '')), t('reportTimelineNote'));
  }
  function reportStateChart(hist, age) {
    if (!hist.length) return '';
    var keys = english ? [['h', 'Health', 'var(--log-health)'], ['hp', 'Happiness', 'var(--accent)'], ['k', 'Knowledge', 'var(--log-learn)'], ['r', 'Relationships', 'var(--log-work)']] : [['h', '健康', 'var(--log-health)'], ['hp', '幸福', 'var(--accent)'], ['k', '知識', 'var(--log-learn)'], ['r', '人間関係', 'var(--log-work)']];
    var left = 44, top = 14, width = 570, height = 170, span = Math.max(1, age), svg = '';
    [0, 25, 50, 75, 100].forEach(function (n) { var y = top + (100 - n) / 100 * height; svg += '<line x1="' + left + '" x2="' + (left + width) + '" y1="' + y + '" y2="' + y + '" stroke="var(--rule)"/><text x="37" y="' + (y + 4) + '" text-anchor="end">' + n + '</text>'; });
    [0, 20, 40, 60, 80, 100].forEach(function (n) { if (n > age) return; var x = left + n / span * width; svg += '<text x="' + x + '" y="215" text-anchor="middle">' + n + '</text>'; });
    keys.forEach(function (key) {
      var points = hist.filter(function (x) { return isFinite(Number(x[key[0]])); }).map(function (x, i) { return (i ? 'L' : 'M') + (left + Math.max(0, Number(x.a) || 0) / span * width).toFixed(1) + ' ' + (top + (100 - Math.max(0, Math.min(100, Number(x[key[0]])))) / 100 * height).toFixed(1); }).join(' ');
      if (points) svg += '<path d="' + points + '" fill="none" stroke="' + key[2] + '" stroke-width="2.5" vector-effect="non-scaling-stroke"/>';
    });
    var population = reportAverages().state;
    hist.forEach(function (x) {
      var a = Math.max(0, Number(x.a) || 0), base = population[Math.min(population.length - 1, a)], w = Math.max(5, width / span);
      var detail = english ? 'Age ' + a + ': health ' + Math.round(x.h) + ', happiness ' + Math.round(x.hp) + ', knowledge ' + Math.round(x.k) + ', relationships ' + Math.round(x.r) + '.' : a + '歳。健康 ' + Math.round(x.h) + '、幸福 ' + Math.round(x.hp) + '、知識 ' + Math.round(x.k) + '、人間関係 ' + Math.round(x.r) + '。';
      if (base && base.n) detail += english ? ' Same-age average across 200 simulated lives: health ' + Math.round(base.h / base.n) + ', happiness ' + Math.round(base.hp / base.n) + ', knowledge ' + Math.round(base.k / base.n) + ', relationships ' + Math.round(base.r / base.n) + '.' : ' 200人の模擬人生の同年齢平均：健康 ' + Math.round(base.h / base.n) + '、幸福 ' + Math.round(base.hp / base.n) + '、知識 ' + Math.round(base.k / base.n) + '、人間関係 ' + Math.round(base.r / base.n) + '。';
      var marks = keys.map(function (key) { return (top + (100 - Math.max(0, Math.min(100, Number(x[key[0]]) || 0))) / 100 * height).toFixed(1) + '|' + key[2]; }).join(';');
      svg += '<rect x="' + Math.max(left, left + a / span * width - w / 2) + '" y="' + top + '" width="' + w + '" height="' + height + '" fill="transparent" data-report-age="' + a + '" data-report-x="' + (left + a / span * width).toFixed(1) + '" data-report-points="' + marks + '"' + tipAttr(detail) + '/>';
    });
    var legend = '<div class="report-legend">' + keys.map(function (x) { return '<span><i style="background:' + x[2] + '"></i>' + x[1] + '</span>'; }).join('') + '</div>';
    return reportCard(english ? 'Changes in well-being' : '状態の移り変わり', '<svg class="report-svg" viewBox="0 0 640 230" role="group" aria-label="' + (english ? 'Health, happiness, knowledge, and relationships by age' : '年齢ごとの健康、幸福、知識、人間関係') + '"><title>' + (english ? 'Changes in well-being' : '状態の移り変わり') + '</title>' + svg + '</svg>' + legend, english ? 'Values are model estimates. The comparison uses 200 simulated lives drawn by birth shares from 172 countries.' : '値は物語の目安です。比較値は172か国から出生数に応じて選んだ200人の模擬人生によります。');
  }
  function reportMoneyLife(r, c) {
    var rows = Array.isArray(r.moneyHistory) && r.moneyHistory.length ? r.moneyHistory : (r.hist || []).map(function (x) { return { age: x.a, netWorth: x.net, income: x.inc, capitalIncome: 0 }; });
    var peak = r.maxNetWorth == null ? (rows.length ? Math.max.apply(null, rows.map(function (x) { return Number(x.netWorth) || 0; })) : null) : Number(r.maxNetWorth) / E.YEN_PER_PPP;
    var labour = 0, capital = 0;
    rows.forEach(function (x) { var assetIncome = x.incomeSources ? Math.max(0, Number(x.incomeSources.assets) || 0) : 0; capital += assetIncome || Math.max(0, Number(x.capitalIncome) || 0); labour += Math.max(0, (Number(x.income) || 0) - assetIncome); });
    var share = labour + capital > 0 ? Math.round(capital / (labour + capital) * 100) : 0;
    var events = Array.isArray(r.debtEvents) ? r.debtEvents : [];
    var received = r.inheritanceReceived == null ? '—' : yen(Number(r.inheritanceReceived));
    var left = r.inheritanceLeft == null ? (r.wealthLeft == null ? '—' : yen(Number(r.wealthLeft) / E.YEN_PER_PPP)) : yen(Number(r.inheritanceLeft));
    var typicalIncome = (Number(c.gdp) || 0) * .55;
    var tiles = '<div class="report-tiles">' + reportTile(t('moneyPeakWealth'), peak == null ? '—' : yen(peak)) + reportTile(t('moneyCapitalIncome'), rows.length ? share + '%' : '—', rows.length ? t('moneyLabourIncome') + ' ' + (100 - share) + '%' : '') + reportTile(t('moneyInheritanceReceived'), received) + reportTile(t('moneyInheritanceLeft'), left) + '</div>';
    var sourceTotals = r.lifetimeIncomeSources || {};
    var sourceSum = INCOME_SOURCE_KEYS.reduce(function (sum, key) { return sum + Math.max(0, Number(sourceTotals[key]) || 0); }, 0);
    var sourceColors = ['var(--stamp)', 'var(--accent)', 'var(--log-family)', 'var(--gold)', 'var(--good)', 'var(--log-work)'];
    var sourceChart = sourceSum ? '<h3>' + esc(t('moneyLifetimeSources')) + '</h3><div class="money-budget" role="img" aria-label="' + esc(t('moneyLifetimeSources')) + '">' + INCOME_SOURCE_KEYS.map(function (key, i) { return '<i style="width:' + (Math.max(0, Number(sourceTotals[key]) || 0) / sourceSum * 100).toFixed(2) + '%;background:' + sourceColors[i] + '"></i>'; }).join('') + '</div><div class="money-legend">' + INCOME_SOURCE_KEYS.filter(function (key) { return Number(sourceTotals[key]) > 0; }).map(function (key) { var i = INCOME_SOURCE_KEYS.indexOf(key); return '<span><i style="background:' + sourceColors[i] + '"></i>' + esc(t(INCOME_SOURCE_LABELS[key])) + ' ' + Math.round(Number(sourceTotals[key]) / sourceSum * 100) + '%</span>'; }).join('') + '</div>' : '';
    var debtList = events.length ? '<ul class="report-events">' + events.slice(0, 10).map(function (x) { var eventAge = x.age == null ? x.a : x.age; return '<li><b>' + esc(eventAge == null ? '' : eventAge + (english ? ' years · ' : '歳 · ')) + '</b><span>' + esc(x.text || x.t || x.type || '') + '</span></li>'; }).join('') + '</ul>' : '<p class="small">' + esc(t('moneyNoDebtEvents')) + '</p>';
    var comparison = typicalIncome ? '<p class="report-note">' + esc(t('moneyCountryCompare', { country: country(c), amount: yen(typicalIncome) })) + (peak != null ? ' · ' + esc(t('moneyPeakVsIncome', { years: (peak / typicalIncome).toFixed(1) })) : '') + '</p>' : '';
    return reportCard(t('moneyLifeTitle'), tiles + sourceChart + '<h3>' + esc(t('moneyHistoryTitle')) + '</h3>' + moneyHistoryChart(rows) + '<h3>' + esc(t('moneyDebtEvents')) + '</h3>' + debtList + comparison);
  }
  function reportMoneyChart(hist, age, c) {
    if (!hist.length) return '';
    var ref = (Number(c.gdp) || 0) * 0.55, japan = 4600000 / E.YEN_PER_PPP;
    function plottedNet(x) { return Math.max(Number(x.net) || 0, -3 * Math.max(0, Number(x.inc) || 0)); }
    var vals = hist.map(plottedNet).concat(hist.map(function (x) { return Number(x.inc) || 0; }), [0, ref, japan]);
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals), range = Math.max(1, hi - lo), left = 80, top = 16, width = 534, height = 166;
    var Y = function (n) { return top + (hi - n) / range * height; }, X = function (n) { return left + Math.max(0, n) / Math.max(1, age) * width; };
    var svg = '';
    [0, 0.5, 1].forEach(function (f) { var n = lo + range * f, y = Y(n); svg += '<line x1="' + left + '" x2="614" y1="' + y + '" y2="' + y + '" stroke="var(--rule)"/><text x="75" y="' + (y + 4) + '" text-anchor="end">' + (english ? Math.round(n / 1000) : Math.round(n * E.YEN_PER_PPP / 10000)) + '</text>'; });
    [[japan, 'var(--log-work)'], [ref, 'var(--log-family)']].forEach(function (x) { svg += '<line x1="' + left + '" x2="614" y1="' + Y(x[0]) + '" y2="' + Y(x[0]) + '" stroke="' + x[1] + '" stroke-dasharray="5 4" stroke-width="1.5"/>'; });
    hist.forEach(function (x) { var v = Number(x.inc) || 0, w = Math.max(2, width / Math.max(1, age) * 0.65); svg += '<rect x="' + (X(x.a) - w / 2) + '" y="' + Y(Math.max(0, v)) + '" width="' + w + '" height="' + Math.max(0, Math.abs(Y(v) - Y(0))) + '" fill="var(--stamp)" opacity=".6" data-report-bar-age="' + x.a + '"/>'; });
    var path = hist.map(function (x, i) { return (i ? 'L' : 'M') + X(x.a).toFixed(1) + ' ' + Y(plottedNet(x)).toFixed(1); }).join(' ');
    svg += '<path d="' + path + '" fill="none" stroke="var(--accent)" stroke-width="2.5" vector-effect="non-scaling-stroke"/>';
    hist.forEach(function (x) {
      var a = Math.max(0, Number(x.a) || 0), w = Math.max(5, width / Math.max(1, age));
      var raw = Number(x.net) || 0, plotted = plottedNet(x);
      var detail = english ? 'Age ' + a + ' (' + (Number(x.y) || 0) + '). Annual income ' + yen((Number(x.inc) || 0)) + ', recorded net worth ' + yen(raw) + (raw < plotted ? ', chart value ' + yen(plotted) : '') + ' in US dollars at purchasing-power parity (PPP). Approximate average Japanese annual income US$46,000 PPP; estimated annual income for ' + country(c) + ' ' + yen(ref) + '.' : a + '歳（' + (Number(x.y) || 0) + '年）。年収 ' + yen((Number(x.inc) || 0)) + '、純資産の記録値 ' + yen(raw) + (raw < plotted ? '、グラフ上の値 ' + yen(plotted) : '') + '（日本の物価で）。日本の平均年収 約460万円、' + c.name + 'の年収目安 ' + yen(ref) + '。';
      svg += '<rect x="' + Math.max(left, X(a) - w / 2) + '" y="' + top + '" width="' + w + '" height="' + height + '" fill="transparent" data-report-age="' + a + '" data-report-x="' + X(a).toFixed(1) + '" data-report-points="' + Y(plotted).toFixed(1) + '|var(--accent);' + Y(Number(x.inc) || 0).toFixed(1) + '|var(--stamp)"' + tipAttr(detail) + '/>';
    });
    [0, 20, 40, 60, 80, 100].forEach(function (n) { if (n <= age) svg += '<text x="' + X(n) + '" y="215" text-anchor="middle">' + n + '</text>'; });
    var legend = english ? '<div class="report-legend"><span><i style="background:var(--stamp)"></i>Annual income</span><span><i style="background:var(--accent)"></i>Net worth (with chart floor)</span><span><i style="background:var(--log-work)"></i>Approximate Japanese average (US$46,000 PPP)</span><span><i style="background:var(--log-family)"></i>' + esc(country(c)) + ' estimated income</span></div>' : '<div class="report-legend"><span><i style="background:var(--stamp)"></i>年収</span><span><i style="background:var(--accent)"></i>純資産（表示下限あり）</span><span><i style="background:var(--log-work)"></i>日本の平均年収（約460万円）</span><span><i style="background:var(--log-family)"></i>' + esc(c.name) + 'の年収目安</span></div>';
    return english ? reportCard('Money over time', '<svg class="report-svg" viewBox="0 0 640 230" role="group" aria-label="Annual income and net worth by age, in thousands of US dollars at purchasing-power parity"><title>Money over time, thousands of US dollars at PPP</title>' + svg + '</svg>' + legend, 'Approximate US dollars at purchasing-power parity (PPP), shown in thousands. The net worth line has a floor at three times annual income below zero; hover over points for recorded values. Country income is estimated at 55% of GDP per person.') : reportCard('お金の移り変わり', '<svg class="report-svg" viewBox="0 0 640 230" role="group" aria-label="年齢ごとの年収と純資産。単位は万円"><title>お金の移り変わり、単位は万円</title>' + svg + '</svg>' + legend, '日本の物価で換算した目安・単位は万円。純資産の線は同じ年の年収のマイナス3倍で下限を設け、元の記録値は点に触れると確認できます。国の年収目安は一人あたりGDPの55％で計算。');
  }
  function reportLifeMap(r) {
    var hist = Array.isArray(r.hist) ? r.hist : [], happy = Array.isArray(r.happy) ? r.happy : [];
    if (!hist.length && !happy.length) return '';
    var age = Math.max(0, Number(r.death.age) || 0), expected = Math.max(0, Math.round(Number(r.le) || 0)), end = Math.min(120, Math.max(age, expected)), rows = Math.floor(end / 10) + 1;
    var byAge = {};
    hist.forEach(function (x) { byAge[x.a] = x.hp; });
    var svg = '', colors = ['#e8f2ed', '#a6d5c8', '#6bad9f', '#327d72', '#16554f'];
    for (var decade = 0; decade < rows; decade++) {
      svg += '<text x="7" y="' + (23 + decade * 27) + '">' + (decade * 10) + '代</text>';
      for (var col = 0; col < 10; col++) {
        var a = decade * 10 + col, hp = byAge[a] == null ? happy[a - 1] : byAge[a], x = 59 + col * 28, y = 7 + decade * 27;
        if (a > end) break;
        var level = hp == null ? -1 : Math.min(4, Math.floor(Math.max(0, Math.min(100, Number(hp))) / 20));
        var ev = (r.big || r.log || []).filter(function (item) { return Number(item.a) === a && item.t; })[0];
        var detail = a + '歳（' + (r.birthYear + a) + '年）、幸福 ' + (hp == null ? '記録なし' : Math.round(hp) + '/100') + '。' + (ev ? '出来事：' + ev.t + '。' : 'この年の主な出来事は記録されていません。') + ' この国の平均寿命の目安 ' + expected + '歳。';
        svg += '<rect x="' + x + '" y="' + y + '" width="22" height="22" rx="3" fill="' + (level < 0 ? 'var(--rule)' : colors[level]) + '"' + (a === expected ? ' stroke="var(--accent)" stroke-width="3"' : '') + tipAttr(detail) + '><title>' + esc(detail) + '</title></rect>';
      }
    }
    return reportCard('人生地図', '<svg class="report-map" viewBox="0 0 350 ' + (rows * 27 + 12) + '" role="group" aria-label="1マスが1年。色が濃いほど幸福が高い"><title>人生地図</title>' + svg + '</svg><div class="report-map-legend"><span>つらい年</span>' + colors.map(function (color) { return '<i style="background:' + color + '"></i>'; }).join('') + '<span>幸せな年</span></div><p class="report-note">1マスが1年。左端は年代です。<i class="report-expected"></i>で囲んだマスは、この国の平均寿命の目安（' + expected + '歳）です。</p>');
  }
  function reportSurvival(r, c, real, era) {
    var country = E.survival(E.lifeTable(c, r.sex, era, r.birthYear));
    var other = real ? E.survival(E.lifeTable(real, r.sex, era, r.birthYear)) : null;
    var world = E.survival(E.worldTable());
    var X = function (a) { return 44 + a / 110 * 570; }, Y = function (v) { return 16 + (1 - Math.max(0, Math.min(1, Number(v) || 0))) * 160; };
    function line(series) { var d = ''; for (var i = 0; i <= 110; i++) d += (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(series[i]).toFixed(1); return d; }
    var svg = '';
    [0, 0.25, 0.5, 0.75, 1].forEach(function (n) { var y = Y(n); svg += '<line x1="44" x2="614" y1="' + y + '" y2="' + y + '" stroke="var(--rule)"/><text x="38" y="' + (y + 4) + '" text-anchor="end">' + Math.round(n * 100) + '</text>'; });
    [0, 20, 40, 60, 80, 100].forEach(function (n) { svg += '<text x="' + X(n) + '" y="208" text-anchor="middle">' + n + '</text>'; });
    svg += '<path d="' + line(world) + '" fill="none" stroke="var(--ink2)" stroke-dasharray="3 5" stroke-width="2"/>';
    if (other) svg += '<path d="' + line(other) + '" fill="none" stroke="var(--log-learn)" stroke-dasharray="5 4" stroke-width="2"/>';
    svg += '<path d="' + line(country) + '" fill="none" stroke="var(--stamp)" stroke-width="2.5"/>';
    var a = Math.min(110, Math.max(0, Number(r.death.age) || 0));
    svg += '<line x1="' + X(a) + '" x2="' + X(a) + '" y1="16" y2="176" stroke="var(--accent)" stroke-width="1.5"/><circle cx="' + X(a) + '" cy="' + Y(country[a]) + '" r="5" fill="var(--accent)"/>';
    for (var year = 0; year <= 110; year++) {
      var detail = year + '歳まで生きる割合：' + c.name + ' ' + Math.round((country[year] || 0) * 100) + '％、世界平均 ' + Math.round((world[year] || 0) * 100) + '％' + (real ? '、あなたの国（' + real.name + '） ' + Math.round((other[year] || 0) * 100) + '％' : '') + '。';
      svg += '<rect x="' + X(year) + '" y="16" width="5.2" height="160" fill="transparent" data-report-age="' + year + '" data-report-x="' + X(year).toFixed(1) + '" data-report-points="' + Y(country[year]).toFixed(1) + '|var(--stamp);' + Y(world[year]).toFixed(1) + '|var(--ink2)' + (other ? ';' + Y(other[year]).toFixed(1) + '|var(--log-learn)' : '') + '"' + tipAttr(detail) + '/>';
    }
    return reportCard('生存曲線', '<svg class="report-svg" viewBox="0 0 640 222" role="group" aria-label="同じ年に生まれた人の生存割合と、この人が亡くなった年齢"><title>生存曲線</title>' + svg + '</svg><div class="report-legend"><span><i style="background:var(--stamp)"></i>' + esc(c.name) + '</span><span><i style="background:var(--ink2)"></i>世界平均</span>' + (real ? '<span><i style="background:var(--log-learn)"></i>' + esc(real.name) + '</span>' : '') + '<span><i style="background:var(--accent)"></i>享年 ' + a + '歳</span></div>', '縦軸は生存割合（％）、横軸は年齢です。');
  }
  function reportFocus(foci) {
    var defs = [['work', '仕事'], ['balance', 'バランス'], ['family', '家族'], ['health', '健康'], ['learn', '学び'], ['hobby', '趣味']];
    var total = defs.reduce(function (n, x) { return n + (Number(foci[x[0]]) || 0); }, 0);
    if (!total) return '';
    var colors = ['var(--log-work)', 'var(--stamp)', 'var(--log-family)', 'var(--log-health)', 'var(--log-learn)', 'var(--accent)'];
    var avg = reportAverages().focus;
    var parts = defs.map(function (x, i) { var n = Number(foci[x[0]]) || 0; return n ? '<span style="width:' + (n / total * 100).toFixed(2) + '%;background:' + colors[i] + '"' + tipAttr(x[1] + 'を重点にしたのは ' + n + '年（' + (n / total * 100).toFixed(1) + '％）。200人の模擬人生では平均 ' + (avg[x[0]] * 100).toFixed(1) + '％。') + '></span>' : ''; }).join('');
    var legend = defs.map(function (x, i) { var n = Number(foci[x[0]]) || 0; return '<span><i style="background:' + colors[i] + '"></i>' + x[1] + ' ' + n + '年</span>'; }).join('');
    return reportCard('時間の使い方', '<div class="report-stack" role="group" aria-label="' + esc(defs.map(function (x) { return x[1] + ' ' + (Number(foci[x[0]]) || 0) + '年'; }).join('、')) + '">' + parts + '</div><div class="report-legend">' + legend + '</div>', '6歳からの毎年の重点を数えました。');
  }
  function reportDream(r) {
    var result = r.dreamResult, progress = result ? Math.max(0, Math.min(100, Number(result.progress) || 0)) : 0;
    var title = r.dream ? dreamName(r.dream) : t("dreamNotChosen");
    var blocks = result && Array.isArray(result.blocked) ? result.blocked : [];
    return reportCard(t("dreamAndWalls"), '<div class="report-dream"><p><b>' + esc(title) + '</b>' + (r.dream ? ' · ' + esc(t("dreamProgress", { progress: Math.round(progress) })) + ' · ' + esc(t(result && result.achieved ? "dreamAchieved" : "dreamUnachieved")) : '') + '</p>' +
      (r.dream && result && result.stage ? '<p class="report-dream-stage">' + esc(t("dreamStage", { stage: result.stage })) + '</p>' : '') +
      (blocks.length ? '<ul>' + blocks.map(function (x) { return '<li>' + esc(t("dreamObstacle", { age: x.age, reason: dreamBlockText(x) })) + '</li>'; }).join('') + '</ul>' : '<p class="report-dream-stage">' + esc(t("dreamObstaclesNone")) + '</p>') +
      '<p class="report-vax">' + esc(t("vaxStatus", { status: vaxText(r.vax) })) + '</p></div>');
  }
  function reportSupports(r) {
    var supports = r.supports || {}, joys = Array.isArray(supports.joys) ? supports.joys : [];
    var motivations = Array.isArray(supports.motivations) ? supports.motivations : [];
    var body = joys.length || motivations.length ?
      '<div class="country-joys-columns">' +
        (joys.length ? '<div><h3>' + esc(t('joysLabel')) + '</h3>' + joyList(joys) + '</div>' : '') +
        (motivations.length ? '<div><h3>' + esc(t('motivationsLabel')) + '</h3>' + joyList(motivations) + '</div>' : '') +
      '</div>' : '<p>' + esc(t('supportsUnrecorded')) + '</p>';
    return reportCard(t('reportSupports'), body);
  }
  function showRecord(r, isSample, fromLab, returnOnly) {
    var c = BY[r.iso], real = settings.real && settings.real !== r.iso ? BY[settings.real] : null;
    if (!c) return;
    var age = Math.max(0, Number(r.death.age) || 0), era = r.era || (r.birthYear < 2026 ? 'past' : 'now');
    var hist = Array.isArray(r.hist) ? r.hist : [], tx = r.texture || { name: '一人だけの一生', axes: [] };
    var school = hist.filter(function (x) { return /^(primary|secondary|univ)\//.test(x.edu || ''); }).length;
    var work = hist.filter(function (x) { return !!x.job && !x.ret; }).length;
    var happy = hist.length ? hist.filter(function (x) { return Number(x.hp) >= 60; }).length : (r.happy || []).filter(function (x) { return x >= 60; }).length;
    var avgIncome = work && r.lifetimeEarnings != null ? r.lifetimeEarnings / work : null;
    var diff = age - (Number(r.le) || age), causeYear = r.death.year <= 2004 ? 2000 : r.death.year <= 2021 ? 2019 : 2023;
    var causeTop = E.causeShares(c, r.sex, age, r.death.year) || [];
    var causeFact = causeTop.length ? '<div class="report-cause"><b>WHO推計で見る、この国の同年代の主な死因</b><span>' + causeTop.map(function (x) { return esc(x.label) + ' ' + (x.share / 10).toFixed(1) + '%'; }).join(' · ') + '</span><small>' + causeYear + '年の推計をもとに、この一生の死因を抽選しています。</small></div>' : '';
    var stats = '<div class="report-tiles">' +
      reportTile('享年と平均寿命', age + '歳', r.le == null ? '' : (diff >= 0 ? '+' : '−') + Math.abs(diff).toFixed(1) + '年') +
      reportTile('学校で過ごした年数', hist.length ? school + '年' : '—') +
      reportTile('働いた年数', hist.length ? work + '年' : '—') +
      reportTile('生涯で稼いだお金', r.lifetimeEarnings == null ? '—' : yen(r.lifetimeEarnings / E.YEN_PER_PPP), english ? t('moneyLabel') : '日本の物価で') +
      reportTile('いちばん多かった資産', r.maxNetWorth == null ? '—' : yen(r.maxNetWorth / E.YEN_PER_PPP), english ? t('moneyLabel') : '日本の物価で') +
      reportTile(english ? 'Children and grandchildren' : '子ども・孫', english ? (r.kids || 0) + ' children · ' + (r.grand || 0) + ' grandchildren' : (r.kids || 0) + '人・' + (r.grand || 0) + '人') +
      reportTile(english ? 'Decisions made' : '決断の数', r.decisions == null ? '—' : r.decisions + (english ? '' : '回')) +
      reportTile(english ? 'Happier years' : '幸せだった年の数', hist.length || (r.happy || []).length ? happy + (english ? happy === 1 ? ' year' : ' years' : '年') : '—', english ? 'Years with happiness at 60 or higher' : '幸福が60以上の年') + '</div>';
    var detail = [['最終学歴', r.edu], ['最後の仕事', r.job], ['ともに生きた人', r.spouse], ['最期を見送った人', r.seeOff], ['いちばん幸せだった年', r.bestYear], ['暮らした国', r.lived], [english ? 'Hobby' : '趣味', r.hobby], ['遺した財産', r.wealthLeft == null ? '—' : yen(r.wealthLeft / E.YEN_PER_PPP)], ['持ち物', r.items && r.items.length ? r.items.join('・') : '—'], ['いちばん時間を注いだこと', r.top]];
    var details = '<dl class="report-details">' + detail.map(function (x) { return '<div><dt>' + esc(x[0]) + '</dt><dd>' + esc(x[1] == null ? '—' : x[1]) + '</dd></div>'; }).join('') + '</dl>';
    var moves = 0, swings = 0;
    hist.forEach(function (x, i) { if (i && x.place !== hist[i - 1].place) moves++; if (i && Math.abs(Number(x.hp) - Number(hist[i - 1].hp)) > 8) swings++; });
    var fy = r.foci || {};
    var axisInfo = [
      ['家族・友人を大切にした', '仕事に力を注いだ', '家族を重点にした年が' + (fy.family || 0) + '年、仕事が' + (fy.work || 0) + '年。子どもや働いた期間も位置の計算に含めました。'],
      ['ひとつの土地で暮らした', '住む場所や仕事を変えた', '記録に残る住む国の変化は' + moves + '回。仕事の変化も位置の計算に含めました。'],
      ['おだやかな一生', '浮き沈みの大きい一生', '幸福の値が前年から9以上変わった年は' + swings + '年。出来事による変化も位置の計算に含めました。'],
      ['今を楽しんだ', '将来に備えた', '趣味を重点にした年が' + (fy.hobby || 0) + '年、学びが' + (fy.learn || 0) + '年。支出や貯蓄の選択も位置の計算に含めました。']
    ];
    var axes = (tx.axes || []).map(function (x, i) { var info = axisInfo[i], v = Math.max(0, Math.min(1, Number(x[2]) || 0)); return '<div class="report-texture-axis"><div class="report-texture-ends"><span>' + info[0] + '</span><span>' + info[1] + '</span></div><div class="report-texture-line"><i style="left:' + (v * 100).toFixed(0) + '%"></i></div><p>' + info[2] + '</p></div>'; }).join('');
    var peers = Array.isArray(r.peers) ? r.peers : [];
    var peerHtml = '';
    if (peers.length) {
      var maxPeer = Math.max.apply(null, peers.map(function (x) { return Number(x.deathAge) || 0; }).concat([age, 1]));
      var all = [{ name: r.name, iso: r.iso, deathAge: age, self: true }].concat(peers);
      peerHtml = reportCard('同じ1秒に生まれた人たち', '<div class="report-peers">' + all.map(function (x) { var n = Math.max(0, Number(x.deathAge) || 0), peerCountry = BY[x.iso] || c; return '<div class="report-peer' + (x.self ? ' self' : '') + '"' + tipAttr(english ? (x.name || 'Unnamed person') + ': ' + n + ' years. Estimated life expectancy in ' + countryIn(peerCountry) + ': ' + ((Number(peerCountry.lef) + Number(peerCountry.lem)) / 2).toFixed(1) + ' years.' : (x.name || '名前のない人') + '：' + n + '歳。' + peerCountry.name + 'の平均寿命の目安 ' + ((Number(peerCountry.lef) + Number(peerCountry.lem)) / 2).toFixed(1) + '歳。') + '><span>' + esc(x.name || (english ? 'Unnamed person' : '名前のない人')) + '<small>' + esc(country(peerCountry)) + '</small></span><div class="report-peer-track"><i style="width:' + (n / maxPeer * 100).toFixed(1) + '%"></i></div><b>' + n + (english ? ' years old' : '歳') + '</b></div>'; }).join('') + '</div>', '同じ瞬間に生まれた人にも、それぞれ違う時間がありました。');
    }
    function comparison(label, mine, average, unit, decimals) {
      var known = mine != null && isFinite(Number(mine)), baseline = average != null && isFinite(Number(average));
      var a = known ? Number(mine) : 0, b = baseline ? Number(average) : 0;
      var marker = !known || !baseline ? '—' : a > b ? '▲' : a < b ? '▼' : english ? '=' : '＝';
      var showNum = function (n) { return decimals ? Number(n).toFixed(decimals) : fmt(n); };
      var tip = english ? label + ': this life ' + (known ? showNum(a) + unit : 'not recorded') + '; ' + country(c) + ' estimate ' + (baseline ? showNum(b) + unit : 'not recorded') + '.' : label + '：この一生は' + (known ? showNum(a) + unit : '記録なし') + '、' + c.name + 'の目安は' + (baseline ? showNum(b) + unit : '記録なし') + '。';
      return '<tr' + tipAttr(tip) + '><th>' + esc(label) + '</th><td>' + (known ? showNum(a) + unit : '—') + '</td><td>' + (baseline ? showNum(b) + unit : '—') + '</td><td>' + marker + '</td></tr>';
    }
    var compare = '<div class="report-table-wrap"><table class="report-table"><thead><tr><th>' + (english ? 'Measure' : '項目') + '</th><th>' + (english ? 'This life' : 'この一生') + '</th><th>' + (english ? esc(country(c)) + ' estimate' : esc(c.name) + 'の目安') + '</th><th>' + (english ? 'Diff.' : '差') + '</th></tr></thead><tbody>' +
      comparison(english ? 'Lifespan' : '寿命', age, r.le, english ? ' years' : '歳', 1) + comparison(english ? 'Years in school' : '学校の年数', hist.length ? school : null, c.school, english ? ' years' : '年', 1) +
      comparison(english ? 'Annual income' : '年収', english && avgIncome != null ? avgIncome / E.YEN_PER_PPP : avgIncome, (Number(c.gdp) || 0) * 0.55 * (english ? 1 : E.YEN_PER_PPP), english ? ' USD PPP' : '円', 0) + comparison(english ? 'Children' : '子どもの数', r.kids, c.tfr, english ? ' children' : '人', 1) + '</tbody></table></div>';
    var theme = r.themeHits && r.themeHits.length ? reportCard('今日のテーマ', '<p class="report-theme">' + esc(r.theme) + '</p>' + r.themeHits.map(function (x) { return '<p><b>' + x.a + '歳</b> ' + esc(x.t) + '</p>'; }).join('')) : '';
    function memories(title, list) { return list && list.length ? reportCard(title, '<ul class="report-memories">' + list.map(function (x) { return '<li><b>' + x.a + '歳 ·</b><span>' + esc(x.t) + '</span></li>'; }).join('') + '</ul>') : ''; }
    var gift = isSample ? '' : reportCard('贈ることば', '<label for="giftT">' + esc(r.given || r.name) + 'へ</label><textarea id="giftT" maxlength="300">' + esc(r.gift || '') + '</textarea><button class="btn btn-primary btn-sm" id="giftS">ことばを残す</button>', '書いたことばは、この記録に保存されます。');
    var story = r.story || r.reflection || '';
    var html = '<div class="report-actions"><a href="' + homeUrl + '" id="backHome">← ' + (fromLab ? '実験室へ' : '最初の画面へ') + '</a><button class="btn btn-sm" id="saveRecCard">この一生をカードで保存</button><button class="btn btn-sm" id="printRec">印刷・PDFで保存</button></div>' +
      (isSample ? '<p class="report-sample">この一生は、このサイトがつくった見本です。</p>' : '') +
      '<article class="life-report"><header class="report-hero"><div class="report-kicker">人生の記録 <span>記録番号 ' + esc(r.id) + '</span></div><div class="report-identity"><canvas id="reportPortrait" aria-label="' + esc(r.name) + 'の肖像"></canvas><div><p class="report-origin">' + esc(c.name) + ' · ' + (r.sex === 'm' ? '男性' : '女性') + '</p><h1>' + esc(r.name) + '</h1><p class="report-years">' + r.birthYear + '年 – ' + r.death.year + '年 · 享年' + age + '歳 · ' + esc(r.death.where || c.name) + '</p></div></div><p class="report-summary">' + esc(r.summary || '') + '</p><p class="report-death">死因 · ' + esc(r.death.cause || '不明') + '</p>' +
      (r.death.cause === '自殺' || r.death.cause === 'Suicide' ? '<p class="report-note">つらい気持ちを抱えているときは、ひとりで抱えずに、身近な人や相談窓口に話してください。</p>' : '') + causeFact + '</header>' +
      reportCard(t('lifeStoryTitle'), '<p class="report-story">' + esc(story) + '</p>') +
      '<p class="report-tip-hint" id="reportTipHint">グラフに指やカーソルを合わせると、くわしい数字が出ます。キーボードでは図の点に移動してください。</p>' +
      reportCard('数字で見る一生', stats) + reportMilestones(r) + reportStateChart(hist, age) + reportMoneyChart(hist, age, c) + reportMoneyLife(r, c) +
      reportLifeMap(r) + reportSurvival(r, c, real, era) + reportFocus(r.foci || {}) + reportDream(r) + peerHtml +
      reportCard('この国の平均とくらべて', compare, '国の数値は統計からの目安です。年収は一人あたりGDPの55％で換算しています。') +
      reportCard('一生のあらまし', details) + reportSupports(r) + reportCard('この一生の手ざわり', '<p class="report-story">' + esc(tx.explanation || story) + '</p><div class="report-texture-axes">' + axes + '</div>', '点の位置は、この一生の選択と出来事から計算した目安です。') +
      reportCard('ふりかえって', '<p>' + esc(story) + '</p>') + theme + memories('☆をつけた思い出', r.stars) + memories('残したメモ', r.notes) + gift +
      '<div class="endbtns"><button class="btn btn-primary btn-big" id="shareLifeBottom">' + esc(t('shareLife')) + '</button><button class="btn btn-big" data-born>もう一度生まれる</button><a class="btn" href="' + homeUrl + '">最初の画面へ</a><button class="btn" id="copyRec">この一生の要約をコピー</button></div></article>';
    if (english && window.I18N.appTranslateHtml) html = window.I18N.appTranslateHtml(html);
    if (returnOnly) return html;
    $('#dead').innerHTML = html;
    initReportTooltips();
    P.portrait($('#reportPortrait'), { seed: hash(r.id), sex: r.sex, age: age, grp: c.grp, wealth: r.wealth, era: r.era, happiness: r.happy && r.happy[age], mood: sceneMood(r.happy && r.happy[age]), items: r.itemKeys || [] });
    show('dead');
    $('#printRec').addEventListener('click', function () { window.print(); });
    var shareLife = function () {
      var url = window.SHARE.startUrl(r);
      openSharePreview(window.SHARE.lifeCard(r), 'your-world-your-life-life-' + r.id + '.png', window.SHARE.lifeText(r, url), url);
    };
    $('#shareLifeBottom').addEventListener('click', shareLife);
    $('#saveRecCard').addEventListener('click', function () { openSharePreview(window.SHARE.lifeCard(r), 'your-world-your-life-life-' + r.id + '.png', 'Your World, Your Life | ' + r.name + '（' + r.birthYear + '–' + r.death.year + '）' + r.summary); });
    $('#copyRec').addEventListener('click', function () { copy('Your World, Your Life | ' + r.name + '（' + r.birthYear + '–' + r.death.year + '）' + r.summary); });
    $('#backHome').addEventListener('click', function (e) { e.preventDefault(); show(fromLab ? 'lab' : 'home'); });
    var gs = $('#giftS');
    if (gs) gs.addEventListener('click', function () { var past = store.get('past', []); r.gift = $('#giftT').value.trim(); past.forEach(function (x) { if (x.id === r.id) x.gift = r.gift; }); store.set('past', past); toast('贈ることばを残しました'); });
  }

  // ---------- 授業用の実験室 ----------
  var labRecords = [], labSort = "age", labAscending = true, labRunning = false;
  function openLab() { show("lab"); }
  $("#openLab").addEventListener("click", openLab);
  $("#openLabNormal").addEventListener("click", openLab);
  $("#labBack").addEventListener("click", function (e) { e.preventDefault(); show("home"); });
  function renderLab() {
    var count = labRecords.length, totalAge = 0, child = 0, school = 0, university = 0, countries = {}, order, max;
    labRecords.forEach(function (r) {
      totalAge += r.death.age;
      if (r.death.age < 5) child++;
      if ([E.EDU_LABEL.primary, E.EDU_LABEL.secondary, E.EDU_LABEL.univ].indexOf(r.edu) >= 0) school++;
      if (r.edu === E.EDU_LABEL.univ) university++;
      countries[r.iso] = (countries[r.iso] || 0) + 1;
    });
    var tiles = english ? [["People", fmt(count)], ["Average lifespan", (count ? totalAge / count : 0).toFixed(1) + " years"], ["Died before age five", (count ? child / count * 100 : 0).toFixed(1) + "%"], ["Completed school", (count ? school / count * 100 : 0).toFixed(1) + "%"], ["Reached university", (count ? university / count * 100 : 0).toFixed(1) + "%"], ["Countries", fmt(Object.keys(countries).length)]] : [["人数", count + "人"], ["平均寿命", (count ? totalAge / count : 0).toFixed(1) + "歳"], ["5歳までに亡くなった割合", (count ? child / count * 100 : 0).toFixed(1) + "%"], ["学校を出られた割合", (count ? school / count * 100 : 0).toFixed(1) + "%"], ["大学まで行った割合", (count ? university / count * 100 : 0).toFixed(1) + "%"], ["国の数", Object.keys(countries).length + "か国"]];
    $("#labTiles").innerHTML = tiles.map(function (x) { return '<div class="lab-tile"><span>' + x[0] + '</span><b>' + x[1] + '</b></div>'; }).join("");
    var real = settings.real && BY[settings.real];
    $("#labCompare").textContent = real ? english ? "Compare with your country: estimated life expectancy in " + countryIn(real) + " (women and men averaged) is " + ((real.lef + real.lem) / 2).toFixed(1) + " years. This simulation averages " + (totalAge / count).toFixed(1) + " years." : "あなたの国と比べる：" + real.name + "の平均寿命（現在の男女平均）は約" + ((real.lef + real.lem) / 2).toFixed(1) + "歳。この実験の平均は" + (totalAge / count).toFixed(1) + "歳です。" : "";
    order = Object.keys(countries).sort(function (a, b) { return countries[b] - countries[a] || country(BY[a]).localeCompare(country(BY[b]), english ? "en" : "ja"); });
    max = countries[order[0]];
    $("#labCountries").innerHTML = order.map(function (iso) { return '<div class="lab-country"><span>' + esc(country(BY[iso])) + '</span><span class="track"><i style="width:' + (countries[iso] / max * 100).toFixed(1) + '%"></i></span><b>' + fmt(countries[iso]) + (english ? countries[iso] === 1 ? ' person' : ' people' : '人') + '</b></div>'; }).join("");
    renderLabRows();
    $("#labResults").hidden = false;
  }
  function renderLabRows() {
    var items = labRecords.map(function (r, i) { return { record: r, index: i }; });
    function value(r) {
      if (labSort === "age") return r.death.age;
      if (labSort === "cause") return r.death.cause;
      if (labSort === "sex") return english ? (r.sex === "m" ? "Male" : "Female") : (r.sex === "m" ? "男性" : "女性");
      return r[labSort];
    }
    items.sort(function (a, b) {
      var x = value(a.record), y = value(b.record);
      var result = typeof x === "number" ? x - y : String(x).localeCompare(String(y), english ? "en" : "ja");
      return (labAscending ? 1 : -1) * result || a.index - b.index;
    });
    $("#labRows").innerHTML = items.map(function (x) {
      var r = x.record;
      return '<tr data-lab-index="' + x.index + '" tabindex="0" aria-label="' + esc(english ? 'Open the record for ' + r.name : r.name + 'の記録を開く') + '"><td>' + esc(r.name) + '</td><td>' + esc(r.country) + '</td><td>' + (english ? (r.sex === "m" ? "Male" : "Female") : (r.sex === "m" ? "男性" : "女性")) + '</td><td>' + r.death.age + (english ? ' years' : '歳') + '</td><td>' + esc(r.edu) + '</td><td>' + esc(r.job) + '</td><td>' + esc(r.death.cause) + '</td></tr>';
    }).join("");
    $$("[data-lab-sort]").forEach(function (b) { b.parentNode.setAttribute("aria-sort", b.getAttribute("data-lab-sort") === labSort ? (labAscending ? "ascending" : "descending") : "none"); });
  }
  $("#labRun").addEventListener("click", function () {
    if (!window.MEGURI_DATA.loaded) { withData(function () { $("#labRun").click(); }); return; }
    if (labRunning) return;
    if (typeof E.simulateFull !== "function") { $("#labProgress").textContent = "実験室を始められませんでした。"; return; }
    var target = +$("#labCount").value, done = 0, records = [];
    labRunning = true; $("#labRun").disabled = true; $("#labResults").hidden = true;
    $("#labProgress").textContent = "0 / " + target + "人";
    function chunk() {
      try {
        for (var i = 0; i < 4 && done < target; i++) {
          var record = E.simulateFull(Math.floor(Math.random() * 2147483647), { era: "now", method: settings.method, edu: true });
          record.era = "now";
          records.push(record);
          done++;
        }
      } catch (e) { labRunning = false; $("#labRun").disabled = false; $("#labProgress").textContent = "途中で計算を続けられなくなりました。"; return; }
      $("#labProgress").textContent = done + " / " + target + "人";
      if (done < target) (window.requestAnimationFrame || function (f) { setTimeout(f, 0); })(chunk);
      else { labRecords = records; labRunning = false; $("#labRun").disabled = false; $("#labProgress").textContent = target + "人の結果です。"; renderLab(); }
    }
    setTimeout(chunk, 0);
  });
  $("#lab").addEventListener("click", function (e) {
    var sort = e.target.closest("[data-lab-sort]");
    if (sort) { var key = sort.getAttribute("data-lab-sort"); labAscending = key === labSort ? !labAscending : true; labSort = key; renderLabRows(); return; }
    var row = e.target.closest("[data-lab-index]");
    if (row) showRecord(labRecords[+row.getAttribute("data-lab-index")], true, true);
  });
  $("#lab").addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.hasAttribute("data-lab-index")) { e.preventDefault(); showRecord(labRecords[+e.target.getAttribute("data-lab-index")], true, true); }
  });

  window.MEGURI_REPORT = { buildRecord: buildReportRecord, buildHtml: function (r) { return showRecord(r, false, false, true); } };
  // ---------- 起動 ----------
  renderHome();
  if (life && life.ended) life = null;
})();
