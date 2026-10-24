/* Your World, Your Life：ブラウザの中だけで描く共有カード */
(function () {
  "use strict";
  function english() { return document.documentElement.lang === "en"; }
  function local(ja, en) { return english() ? en : ja; }
  function localized(value) {
    return english() && window.I18N && window.I18N.appTranslate ? window.I18N.appTranslate(value) : value;
  }
  function englishMonth(month) {
    var n = Number(month);
    return n >= 1 && n <= 12 && n === Math.floor(n) ? new Date(Date.UTC(2000, n - 1, 1)).toLocaleString("en-US", { timeZone: "UTC", month: "long" }) : "—";
  }
  var PAPER = "#EBF0ED", CARD = "#F7FAF8", ACCENT = "#8C1D3C", STAMP = "#0F6E68";
  var INK = "#13212A", MUTED = "#53646A", RULE = "#C7D2CE";
  var SERIF = '"Hiragino Mincho ProN","MeguriSerif","Yu Mincho",YuMincho,"Noto Serif JP",Georgia,serif';
  var SANS = '"Hiragino Sans","Hiragino Kaku Gothic ProN","MeguriSans","Noto Sans JP",Meiryo,Arial,sans-serif';
  var toastTimer;
  var PUBLIC_URL = "https://rashiandlau.github.io/your-world-your-life/";
  function tr(key, ja, en, vars) {
    if (window.I18N && window.I18N.t) return window.I18N.t("app." + key, vars);
    return local(ja, en).replace(/\{(\w+)\}/g, function (_, name) { return vars && vars[name] != null ? vars[name] : ""; });
  }
  function clean(value, fallback) {
    var result = localized(String(value == null ? "" : value)).trim();
    return result && (!english() || !/[\u3040-\u30ff\u3400-\u9fff]/.test(result)) ? result : fallback;
  }
  function startUrl(record) {
    var url = PUBLIC_URL + (english() ? "en/" : "");
    var iso = String(record && record.iso || "").toLowerCase();
    var year = Number(record && record.birthYear);
    var era = record && record.era || (year >= 1950 && year <= 2025 ? "past" : "now");
    var params = new URLSearchParams();
    if (/^[a-z]{3}$/.test(iso) && country(iso)) params.set("c", iso.toUpperCase());
    if (era === "past" && Number.isInteger(year) && year >= 1950 && year <= 2025) { params.set("y", String(year)); params.set("e", "past"); }
    else if ((era === "now" || era === "future") && year === 2026) { params.set("y", "2026"); params.set("e", era); }
    return url + (params.toString() ? "?" + params.toString() : "");
  }
  function parseStartParams(search, countries) {
    var params = new URLSearchParams(String(search || "").replace(/^\?/, ""));
    var result = {}, iso = String(params.get("c") || "").toLowerCase();
    if (/^[a-z]{3}$/.test(iso) && countries.indexOf(iso) >= 0) result.country = iso;
    var rawYear = params.get("y"), year = Number(rawYear), era = params.get("e") || (year >= 1950 && year <= 2025 ? "past" : "now");
    if (rawYear && /^\d{4}$/.test(rawYear) && ((era === "past" && year >= 1950 && year <= 2025) || ((era === "now" || era === "future") && year === 2026))) {
      result.year = year; result.era = era;
    }
    return result;
  }
  function lifeText(record, url) {
    record = record || {};
    var c = country(record.iso), place = clean(english() ? c && (c.name_en || c.name) : c && c.name, tr("shareUnknownCountry", "ある国", "another country"));
    var name = clean(record.name, tr("shareUnknownPerson", "ひとり", "one person"));
    var year = Number(record.birthYear), age = Number(record.death && record.death.age);
    var safeYear = Number.isInteger(year) ? year : tr("shareUnknownYear", "ある年", "one year");
    var safeAge = Number.isInteger(age) && age >= 0 ? age : null;
    var vars = { year: safeYear, country: place, name: name, age: safeAge };
    var sentence = safeAge == null ? tr("shareTextNoAge", "{year}年、{country}に生まれた{name}の一生。あなたはどこに生まれる？", "{name} was born in {country} in {year}. Where might your life begin?", vars) : tr("shareTextWithAge", "{year}年、{country}に生まれた{name}は{age}年を生きました。あなたはどこに生まれる？", "{name} was born in {country} in {year} and lived for {age} years. Where might your life begin?", vars);
    return sentence + "\n" + (url || startUrl(record));
  }
  var sensitive = /自殺|自傷|自死|命を絶|暴|殺|襲|虐|戦|銃|刃物|殴|刺|撃|爆|死|亡くな|事故|けが|怪我|suicid|self.harm|violent|violence|assault|murder|kill|abuse|weapon|shoot|war|attack|stab|injur|trauma|died|death|accident/i;
  function cardStory(record) {
    var source = clean(record && (record.story || record.reflection || record.summary), "");
    var sentences = source.match(/[^。.!?]+[。.!?]?/g) || [];
    var first = sentences.map(function (s) { return s.trim(); }).filter(function (s) { return s && !sensitive.test(s); })[0];
    return first || tr("shareStoryFallback", "ひとつの人生を歩みました。", "A life, one story among many.");
  }
  function cardFacts(record) {
    record = record || {};
    var education = clean(record.edu, "—"), work = clean(record.job, "—");
    var kids = Number(record.kids), children = Number.isInteger(kids) && kids >= 0 ? (english() ? String(kids) : kids + "人") : "—";
    return [tr("shareFactEducation", "学び", "Education") + "  " + education,
      tr("shareFactWork", "仕事", "Work") + "  " + work,
      tr("shareFactChildren", "子ども", "Children") + "  " + children,
      tr("shareFactMoney", "いちばん多かった資産", "Peak net worth") + "  " + yen(record.maxNetWorth)];
  }

  function canvasFor(vertical) {
    var canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = vertical ? 1350 : 1080;
    return canvas;
  }
  function type(ctx, size, serif, bold) { ctx.font = (bold ? "700 " : "") + size + "px " + (serif ? SERIF : SANS); }
  function line(ctx, x1, y1, x2, y2, color, width) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.strokeStyle = color; ctx.lineWidth = width || 1; ctx.stroke();
  }
  function dot(ctx, x, y, radius, color) {
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
  }
  function text(ctx, value, x, y, size, color, serif, bold) {
    ctx.fillStyle = color; type(ctx, size, serif, bold); ctx.fillText(String(value == null ? "" : value), x, y);
  }
  function fitted(ctx, value, x, y, maxWidth, size, minSize, color) {
    var n = size;
    type(ctx, n, true, true);
    while (n > minSize && ctx.measureText(String(value)).width > maxWidth) { n -= 2; type(ctx, n, true, true); }
    text(ctx, value, x, y, n, color, true, true);
  }
  function wrap(ctx, value, x, y, maxWidth, lineHeight, maxLines, color) {
    var chars = String(value || "").split("");
    var rows = [], row = "", i, ch, next;
    if (english()) {
      var words = String(value || "").split(/\s+/), word;
      for (i = 0; i < words.length; i++) {
        word = words[i];
        next = row ? row + " " + word : word;
        if (row && ctx.measureText(next).width > maxWidth) { rows.push(row); row = word; }
        else row = next;
      }
      if (row) rows.push(row);
      if (rows.length > maxLines) {
        rows = rows.slice(0, maxLines);
        while (ctx.measureText(rows[maxLines - 1] + "…").width > maxWidth && rows[maxLines - 1].length) rows[maxLines - 1] = rows[maxLines - 1].slice(0, -1);
        rows[maxLines - 1] = rows[maxLines - 1].replace(/\s+$/, "") + "…";
      }
      ctx.fillStyle = color;
      for (i = 0; i < rows.length; i++) ctx.fillText(rows[i], x, y + i * lineHeight);
      return rows.length;
    }
    for (i = 0; i < chars.length; i++) {
      ch = chars[i]; next = row + ch;
      if (row && ctx.measureText(next).width > maxWidth && "。、，．！？)]）』」".indexOf(ch) < 0) {
        rows.push(row); row = ch;
      } else row = next;
    }
    if (row) rows.push(row);
    if (rows.length > maxLines) {
      rows = rows.slice(0, maxLines);
      rows[maxLines - 1] = rows[maxLines - 1].replace(/[。、，．！？\s]+$/, "");
      while (ctx.measureText(rows[maxLines - 1] + "…").width > maxWidth && rows[maxLines - 1].length) rows[maxLines - 1] = rows[maxLines - 1].slice(0, -1);
      rows[maxLines - 1] += "…";
    }
    ctx.fillStyle = color;
    for (i = 0; i < rows.length; i++) ctx.fillText(rows[i], x, y + i * lineHeight);
    return rows.length;
  }
  function country(iso) {
    var countries = window.COUNTRIES || [], i;
    for (i = 0; i < countries.length; i++) if (countries[i].iso === iso) return countries[i];
    return null;
  }
  function birthplace(p, c) {
    if (!english()) return p.city || "—";
    if (p.city_en) return p.city_en;
    if (window.I18N && window.I18N.countryValue) return localized(window.I18N.countryValue(c, "cities", p.city)) || "—";
    if (c && c.cities && c.cities_en) {
      var city = String(p.city || ""), suffix = "の近くの村", rural = city.slice(-suffix.length) === suffix;
      var index = c.cities.indexOf(rural ? city.slice(0, -suffix.length) : city);
      if (index >= 0 && c.cities_en[index]) return rural ? "a village near " + c.cities_en[index] : c.cities_en[index];
    }
    return localized(p.city) || "—";
  }
  function cardBase(canvas, heading, serial) {
    var ctx = canvas.getContext("2d"), h = canvas.height;
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, 1080, h);
    ctx.fillStyle = CARD; ctx.fillRect(40, 40, 1000, h - 80);
    ctx.strokeStyle = RULE; ctx.lineWidth = 2; ctx.strokeRect(40, 40, 1000, h - 80);
    ctx.fillStyle = ACCENT; ctx.fillRect(40, 40, 1000, 16);
    text(ctx, heading, 88, 123, 27, STAMP, false, true);
    ctx.textAlign = "right"; text(ctx, serial || "", 992, 119, 19, MUTED, false, false); ctx.textAlign = "left";
    line(ctx, 88, 148, 992, 148, RULE, 2);
    line(ctx, 88, h - 118, 992, h - 118, RULE, 2);
    text(ctx, "Your World, Your Life", 88, h - 73, 23, INK, true, true);
    ctx.textAlign = "right"; text(ctx, local("世界にひとつの記録", "One life, one story"), 992, h - 75, 17, MUTED, false, false); ctx.textAlign = "left";
    return ctx;
  }
  function map(ctx, x, y, w, h, c) {
    var points = window.LANDDOTS && (window.LANDDOTS.dots || window.LANDDOTS.fine) || [];
    var i, pt, lon, lat;
    ctx.fillStyle = "#E3EEEA"; ctx.fillRect(x, y, w, h);
    for (i = 0; i < points.length; i++) {
      pt = points[i]; lon = +pt[0]; lat = +pt[1];
      ctx.fillStyle = "#A8BDB7";
      ctx.fillRect(x + (lon + 170) / 350 * w, y + (80 - lat) / 136 * h, 2.5, 2.5);
    }
    if (c && isFinite(+c.lon) && isFinite(+c.lat)) {
      var mx = x + (+c.lon + 170) / 350 * w, my = y + (80 - +c.lat) / 136 * h;
      dot(ctx, mx, my, 15, CARD); dot(ctx, mx, my, 10, ACCENT);
    }
  }
  function birthCard(p, options) {
    options = options || {};
    var canvas = canvasFor(!!options.vertical), ctx = cardBase(canvas, local("出生届", "Birth record"), "No. " + (p.id || ""));
    var c = country(p.iso), h = canvas.height, share = c && +c.share;
    if (c && p.era && p.era !== "now" && window.MEGURI && window.MEGURI.yearStats) share = window.MEGURI.yearStats(c, p.birthYear).share;
    var ratio = share > 0 ? Math.round(100 / share) : null;
    var birth = english() ? englishMonth(p.birthMonth) + " " + String(p.birthYear || "—") : String(p.birthYear || "—") + "年 " + String(p.birthMonth || "—") + "月";
    text(ctx, local("名前", "Name"), 88, 205, 21, MUTED, false, true);
    fitted(ctx, localized(p.name) || local("名前のない子", "Unnamed child"), 88, 284, 900, 65, 32, INK);
    line(ctx, 88, 313, 992, 313, RULE, 1);
    text(ctx, local("生まれた日", "Born"), 88, 362, 20, MUTED, false, true);
    text(ctx, birth, 88, 412, 33, INK, true, true);
    text(ctx, local("生まれた場所", "Birthplace"), 510, 362, 20, MUTED, false, true);
    fitted(ctx, localized(c ? (english() ? c.name_en || c.name : c.name) : p.country || p.iso || "—") + " · " + birthplace(p, c), 510, 412, 460, 32, 20, INK);
    text(ctx, local("性別", "Sex"), 88, 473, 20, MUTED, false, true);
    text(ctx, p.sex === "m" ? local("男性", "Male") : p.sex === "f" ? local("女性", "Female") : "—", 88, 521, 30, INK, true, true);
    text(ctx, local("家の暮らし向き", "Family circumstances"), 510, 473, 20, MUTED, false, true);
    for (var i = 0; i < 5; i++) dot(ctx, 523 + i * 42, 510, 11, i < (+p.wealth || 0) ? STAMP : RULE);
    text(ctx, english() ? (p.wealth || "—") + " out of 5" : "5段階中 " + (p.wealth || "—"), 750, 520, 19, MUTED, false, false);
    line(ctx, 88, 559, 992, 559, RULE, 1);
    text(ctx, local("この国で生まれる割合", "Chance of being born here"), 88, 603, 20, MUTED, false, true);
    text(ctx, english() ? (share > 0 ? (share < 0.1 ? share.toFixed(2) : share.toFixed(1)) + "% of world births (1 in " + ratio.toLocaleString("en-US") + ")" : "Under 0.01% of world births") : (share > 0 ? "世界の出生の" + (share < 0.1 ? share.toFixed(2) : share.toFixed(1)) + "%（" + ratio + "人に1人）" : "世界の出生の0.01%未満"), 88, 652, 27, ACCENT, true, true);
    var mapY = 686, mapH = options.vertical ? 305 : 220;
    map(ctx, 88, mapY, options.vertical ? 904 : 440, mapH, c);
    var scene = document.createElement("canvas"), P = window.PIXEL;
    if (P && P.scene) {
      P.scene(scene, { seed: String(p.id || "").length * 37 + (+p.birthYear || 1), age: 0, sex: p.sex, grp: c && c.grp, urban: !!p.urban, wealth: p.wealth, people: [{ age: 0, sex: p.sex }] });
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(scene, options.vertical ? 315 : 548, options.vertical ? mapY + mapH + 18 : mapY, options.vertical ? 450 : 444, options.vertical ? 157 : 155);
      ctx.imageSmoothingEnabled = true;
    }
    text(ctx, local("ここから、まだ知らない一生が始まる。", "A life yet to unfold begins here."), 88, h - 148, 21, STAMP, true, false);
    return canvas;
  }
  function yen(value) {
    if (value == null || !isFinite(+value)) return "—";
    var v = Math.round(+value);
    if (english()) return "$" + Math.round(v / (window.MEGURI && window.MEGURI.YEN_PER_PPP || 100)).toLocaleString("en-US") + " PPP";
    if (Math.abs(v) >= 100000000) return (v / 100000000).toFixed(1) + "億円";
    if (Math.abs(v) >= 10000) return (v / 10000).toFixed(1) + "万円";
    return v.toLocaleString("ja-JP") + "円";
  }
  function metric(ctx, x, y, label, value, width) {
    width = width || 429;
    ctx.fillStyle = "#EBF0ED"; ctx.fillRect(x, y, width, 117);
    text(ctx, label, x + 18, y + 34, width < 250 ? 15 : 19, MUTED, false, true);
    fitted(ctx, value, x + 18, y + 87, width - 36, width < 250 ? 25 : 31, width < 250 ? 16 : 20, INK);
  }
  function lifeMap(ctx, values, x, y) {
    var list = values || [], cols = 30, step = 24, i, n;
    for (i = 0; i < list.length; i++) {
      n = Number(list[i]);
      ctx.fillStyle = n >= 70 ? STAMP : n >= 50 ? "#8FBEA9" : n >= 30 ? "#D5BFA2" : ACCENT;
      ctx.fillRect(x + i % cols * step, y + Math.floor(i / cols) * step, 16, 16);
    }
    if (!list.length) text(ctx, local("記録された年はありません", "No years recorded"), x, y + 25, 20, MUTED, false, false);
  }
  function landscapeLifeCard(r) {
    var canvas = document.createElement("canvas"), ctx = canvas.getContext("2d");
    canvas.width = 1200; canvas.height = 630;
    ctx.fillStyle = "#F2F5EF"; ctx.fillRect(0, 0, 1200, 630);
    ctx.fillStyle = "#123A3D"; ctx.fillRect(0, 0, 1200, 15);
    ctx.fillStyle = "#FFFFFF"; ctx.fillRect(32, 32, 1136, 566);
    ctx.strokeStyle = "#CDDCD3"; ctx.lineWidth = 2; ctx.strokeRect(32, 32, 1136, 566);
    var c = country(r.iso), scene = document.createElement("canvas"), P = window.PIXEL;
    ctx.fillStyle = "#DCEBE4"; ctx.fillRect(746, 64, 390, 338);
    if (P && P.scene) {
      P.scene(scene, { seed: String(r.id || "").length * 37 + (+r.birthYear || 1), age: Math.max(18, Math.min(65, Number(r.death && r.death.age) || 30)), sex: r.sex, grp: c && c.grp, urban: !!r.urban, wealth: r.wealth, era: r.era, place: "home", people: [{ age: 35, sex: r.sex }] });
      ctx.imageSmoothingEnabled = false; ctx.drawImage(scene, 746, 64, 390, 338); ctx.imageSmoothingEnabled = true;
    }
    ctx.fillStyle = "#123A3D"; ctx.fillRect(746, 402, 390, 117);
    type(ctx, 23, false, true); wrap(ctx, cardStory(r), 770, 442, 342, 30, 2, "#FFFFFF");
    text(ctx, tr("shareCardEyebrow", "ひとつの人生の記録", "A LIFE IN THE WORLD"), 68, 105, 21, STAMP, false, true);
    var place = clean(english() ? c && (c.name_en || c.name) : c && c.name, "—");
    text(ctx, place, 68, 156, 29, ACCENT, false, true);
    fitted(ctx, clean(r.name, tr("shareUnknownPerson", "ひとり", "one person")), 68, 241, 644, 61, 34, INK);
    var birth = Number(r.birthYear), death = Number(r.death && r.death.year), age = Number(r.death && r.death.age);
    var years = (Number.isInteger(birth) ? birth : "—") + " – " + (Number.isInteger(death) ? death : "—") + "  ·  " + (Number.isInteger(age) ? tr("shareAge", "{age}歳", "Age {age}", { age: age }) : "—");
    text(ctx, years, 68, 292, 24, MUTED, false, false);
    line(ctx, 68, 320, 710, 320, RULE, 2);
    var facts = cardFacts(r);
    facts.forEach(function (fact, i) {
      type(ctx, 18, false, false);
      var y = 361 + i * 44;
      wrap(ctx, fact, 68, y, 640, 22, 1, INK);
    });
    line(ctx, 68, 537, 1136, 537, RULE, 2);
    text(ctx, "Your World, Your Life", 68, 574, 21, INK, true, true);
    ctx.textAlign = "right"; text(ctx, PUBLIC_URL, 1136, 574, 16, MUTED, false, false); ctx.textAlign = "left";
    return canvas;
  }
  function lifeCard(r, options) {
    options = options || {};
    if (!options.vertical) return landscapeLifeCard(r);
    var canvas = canvasFor(options.vertical !== false), ctx = cardBase(canvas, local("人生の記録", "Life record"), "No. " + (r.id || ""));
    var c = country(r.iso), h = canvas.height, age = r.death && r.death.age != null ? r.death.age : "—";
    var deathYear = r.death && r.death.year != null ? r.death.year : "—";
    var portrait = document.createElement("canvas"), P = window.PIXEL;
    if (P && P.portrait) {
      P.portrait(portrait, { seed: String(r.id || "").length * 37 + (+r.birthYear || 1), age: +age || 0, sex: r.sex, grp: c && c.grp });
      ctx.imageSmoothingEnabled = false; ctx.drawImage(portrait, 88, 187, 160, 180); ctx.imageSmoothingEnabled = true;
    }
    text(ctx, localized(english() && c ? c.name_en || c.name : r.country || c && c.name || r.iso || "—"), 283, 209, 23, STAMP, false, true);
    fitted(ctx, localized(r.name) || local("名前のない人", "Unnamed person"), 283, 290, 700, 59, 29, INK);
    text(ctx, english() ? String(r.birthYear || "—") + " – " + deathYear + "  ·  Aged " + age : String(r.birthYear || "—") + "年 – " + deathYear + "年  ·  享年" + age + "歳", 283, 341, 24, MUTED, false, false);
    line(ctx, 88, 399, 992, 399, RULE, 2);
    text(ctx, local("この一生のひとこと", "In a few words"), 88, 445, 20, STAMP, false, true);
    type(ctx, 33, true, false);
    wrap(ctx, localized(r.summary) || local("ひとつの一生を歩みました。", "A life was lived."), 88, 499, 896, 49, h > 1080 ? 4 : 3, INK);
    var vertical = h > 1080, metricY = vertical ? 690 : 648, hist = r.hist || [];
    var school = hist.filter(function (entry) { return /^(primary|secondary|univ)\//.test(entry.edu || ""); }).length;
    var schoolKnown = hist.length || r.schoolYears != null;
    var schoolCount = hist.length ? school : r.schoolYears;
    var schoolValue = schoolCount != null ? schoolCount + local("年", +schoolCount === 1 ? " year" : " years") : localized(r.edu) || "—";
    if (vertical) {
      metric(ctx, 88, metricY, schoolKnown ? local("学校で過ごした年数", "Years in school") : local("学び", "Education"), schoolValue);
      metric(ctx, 563, metricY, local("子ども", "Children"), (r.kids == null ? "—" : r.kids + local("人", "")));
      metric(ctx, 88, metricY + 133, local("生涯で稼いだお金", "Lifetime earnings (PPP)"), yen(r.lifetimeEarnings));
      metric(ctx, 563, metricY + 133, local("一生の手ざわり", "Character of this life"), localized(r.texture && (english() ? r.texture.name_en || r.texture.name : r.texture.name)) || "—");
    } else {
      metric(ctx, 88, metricY, schoolKnown ? local("学校の年数", "School years") : local("学び", "Education"), schoolValue, 210);
      metric(ctx, 319, metricY, local("子ども", "Children"), r.kids == null ? "—" : r.kids + local("人", ""), 210);
      metric(ctx, 550, metricY, local("生涯の収入", "Lifetime income"), yen(r.lifetimeEarnings), 210);
      metric(ctx, 781, metricY, local("手ざわり", "Life pattern"), localized(r.texture && (english() ? r.texture.name_en || r.texture.name : r.texture.name)) || "—", 210);
    }
    var mapY = vertical ? metricY + 324 : 800;
    text(ctx, local("幸せの記録", "A record of happiness"), 88, mapY, 21, STAMP, false, true);
    text(ctx, local("1マスに1年分の気持ち", "Each square shows how one year felt"), 88, mapY + 31, 18, MUTED, false, false);
    lifeMap(ctx, r.happy, 88, mapY + 52);
    if (h > 1080) text(ctx, local("選んだ日々の積み重ねが、この一生になった。", "The days you lived became this one life."), 88, h - 148, 21, STAMP, true, false);
    return canvas;
  }
  function notify(message) {
    var target = document.getElementById && document.getElementById("toast");
    if (!target) return;
    target.textContent = message; target.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { target.classList.remove("show"); }, 2600);
  }
  function blobFor(canvas) {
    return new Promise(function (resolve, reject) {
      if (!canvas.toBlob) { reject(new Error(local("PNGを作成できません", "Could not create PNG"))); return; }
      canvas.toBlob(function (blob) { if (blob) resolve(blob); else reject(new Error(local("PNGを作成できません", "Could not create PNG"))); }, "image/png");
    });
  }
  function saveBlob(blob, filename) {
    var url = URL.createObjectURL(blob), link = document.createElement("a");
    link.href = url; link.download = filename || "your-world-your-life-card.png";
    link.style.display = "none"; document.body.appendChild(link); link.click(); document.body.removeChild(link);
    setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
    notify(local("画像の保存を始めました", "Image download started"));
  }
  function download(canvas, filename) {
    return blobFor(canvas).then(function (blob) { saveBlob(blob, filename); }, function (error) { notify(local("画像を保存できませんでした", "Could not download the image")); throw error; });
  }
  function shareOrDownload(canvas, filename, message) {
    return blobFor(canvas).then(function (blob) {
      var file = typeof File !== "undefined" ? new File([blob], filename || "your-world-your-life-card.png", { type: "image/png" }) : null;
      var nav = typeof navigator !== "undefined" ? navigator : null, can = false;
      if (file && nav && nav.share && nav.canShare) {
        try { can = nav.canShare({ files: [file] }); } catch (e) { can = false; }
      }
      if (can) return nav.share({ files: [file], text: message || "Your World, Your Life" }).then(function () { notify(local("画像を共有しました", "Image shared")); }, function (error) {
        notify(error && error.name === "AbortError" ? local("共有を取り消しました", "Sharing canceled") : local("画像を共有できませんでした", "Could not share the image"));
        throw error;
      });
      saveBlob(blob, filename);
    }, function (error) { notify(local("画像を作成できませんでした", "Could not create the image")); throw error; });
  }
  function shareImage(canvas, filename, message, url) {
    var nav = typeof navigator !== "undefined" ? navigator : null;
    if (!nav || !nav.share) { notify(tr("shareUnavailable", "この端末では共有画面を開けません。保存やコピーをお使いください。", "Sharing is unavailable here. Save or copy instead.")); return Promise.resolve(false); }
    return blobFor(canvas).then(function (blob) {
      var file = typeof File !== "undefined" ? new File([blob], filename || "your-world-your-life-card.png", { type: "image/png" }) : null;
      var payload = { text: String(message || "Your World, Your Life").replace(/\s+https?:\/\/\S+$/, ""), url: url || PUBLIC_URL };
      if (file && nav.canShare) {
        try { if (nav.canShare({ files: [file] })) payload.files = [file]; } catch (e) {}
      }
      return nav.share(payload).then(function () { notify(tr("shareDone", "共有画面に渡しました", "Shared with your device")); return true; }, function (error) {
        if (error && error.name !== "AbortError") notify(tr("shareFailed", "共有画面を開けませんでした", "Could not open sharing"));
        return false;
      });
    });
  }
  window.SHARE = { birthCard: birthCard, lifeCard: lifeCard, download: download, shareOrDownload: shareOrDownload, shareImage: shareImage,
    startUrl: startUrl, parseStartParams: parseStartParams, lifeText: lifeText, cardStory: cardStory, cardFacts: cardFacts, PUBLIC_URL: PUBLIC_URL };
})();
