/* Country list and comparison, with the generated table as a no-script fallback. ES5. */
(function () {
  "use strict";
  var C = window.COUNTRIES || [];
  var english = document.documentElement.lang === "en";
  var text = english ? {
    search: "Search countries", region: "Region", income: "Income group", all: "All",
    estimates: "Include estimates", columns: "More indicators", shown: " countries shown",
    compare: "Compare two countries", country: "Country", chance: "Chance",
    estimated: "estimated", first: "First country", second: "Second country",
    find: "Find a country", choose: "Choose a country", direction: "Direction of this measure",
    noMatch: "No countries match these filters."
  } : {
    search: "国名で探す", region: "地域", income: "所得区分", all: "すべて",
    estimates: "推定値も含める", columns: "指標を増やす", shown: "か国を表示",
    compare: "2か国を比べる", country: "国", chance: "確率",
    estimated: "推定", first: "1つ目の国", second: "2つ目の国",
    find: "国名で探す", choose: "国を選ぶ", direction: "数値の見方",
    noMatch: "条件に合う国がありません。"
  };
  var groups = [
    ["birth", "人口と出生", "Population and births"],
    ["health", "健康", "Health"],
    ["education", "教育", "Education"],
    ["money", "仕事とお金", "Work and money"],
    ["living", "暮らしの土台", "Everyday essentials"],
    ["issues", "課題", "Challenges"],
    ["culture", "文化", "Culture"]
  ];
  /* key, group, Japanese label, English label, format, direction (+1/-1/0) */
  var specs = [
    ["pop","birth","人口","Population","pop",0],
    ["share","birth","世界の出生に占める割合","Share of world births","pct2",0],
    ["tfr","birth","女性1人が産む子どもの数","Children per woman","num2",0],
    ["birth_reg","birth","出生登録","Birth registration","pct1",1],
    ["adol_fert","birth","10代の出産","Adolescent births per 1,000","num1",-1],
    ["contracept","birth","避妊法の利用","Contraceptive use","pct1",0],
    ["age_marr_f","birth","女性の初婚年齢","Women's age at first marriage","num1",0],
    ["age_marr_m","birth","男性の初婚年齢","Men's age at first marriage","num1",0],
    ["le","health","平均寿命","Life expectancy","years1",1],
    ["lef","health","女性の平均寿命","Female life expectancy","years1",1],
    ["lem","health","男性の平均寿命","Male life expectancy","years1",1],
    ["u5","health","5歳までの死亡","Deaths before age 5","pct1",-1],
    ["imr","health","1歳までの死亡","Deaths before age 1","pct1",-1],
    ["mmr","health","妊産婦死亡率（10万人あたり）","Maternal deaths per 100,000","int",-1],
    ["phys","health","医師（千人あたり）","Physicians per 1,000","num2",1],
    ["vax_dtp3","health","DTP3予防接種","DTP3 immunization","pct1",1],
    ["vax_measles","health","麻疹予防接種","Measles immunization","pct1",1],
    ["oop","health","自己負担の医療費","Out-of-pocket health spending","pct1",-1],
    ["hiv","health","HIVと暮らす人","People living with HIV","pct2",-1],
    ["smk_m","health","男性の喫煙","Men who smoke","pct1",-1],
    ["smk_f","health","女性の喫煙","Women who smoke","pct1",-1],
    ["life","health","暮らしの満足度（10点満点）","Life satisfaction (out of 10)","num1",1],
    ["school","education","期待教育年数","Expected years in school","years1",1],
    ["tert","education","高等教育の総就学率","Tertiary enrolment","pct1",1],
    ["lit","education","成人の識字率","Adult literacy","pct1",1],
    ["fem_sec","education","女子の中等教育就学率","Girls in secondary school","pct1",1],
    ["out_school","education","学校に通えない子ども","Children out of school","pct1",-1],
    ["prim_compl","education","初等教育の修了率","Primary completion","pct1",1],
    ["lsec_compl","education","前期中等教育の修了率","Lower secondary completion","pct1",1],
    ["childlab","education","働く子ども","Children in work","pct1",-1],
    ["gdp","money","1人あたりGDP（PPP $）","GDP per person (PPP US$)","money",1],
    ["gini","money","所得の不平等（ジニ係数）","Income inequality (Gini)","num2",-1],
    ["flfp","money","女性の労働参加","Women's labor participation","pct1",0],
    ["unemp","money","失業率","Unemployment","pct1",-1],
    ["agri","money","農業で働く人","Agricultural workers","pct1",0],
    ["ind_emp","money","工業で働く人","Industry workers","pct1",0],
    ["srv_emp","money","サービス業で働く人","Services workers","pct1",0],
    ["self_emp","money","自営業の人","Self-employment","pct1",0],
    ["vuln_emp","money","不安定な雇用","Vulnerable employment","pct1",-1],
    ["informal","money","公的な保護のない仕事","Informal employment","pct1",-1],
    ["remit","money","海外からの送金（GDP比）","Remittances (% of GDP)","pct1",0],
    ["pov","money","1日3ドル未満で暮らす人","Living under $3 a day","pct1",-1],
    ["pension_cov","money","年金を受け取れる人","Pension coverage","pct1",1],
    ["wealth_bottom40","money","下位40%の所得割合","Income share of bottom 40%","pct1",1],
    ["urban","living","都市で暮らす人","People living in cities","pct1",0],
    ["net","living","インターネット利用","Internet users","pct1",1],
    ["elec","living","電気を使える人","Access to electricity","pct1",1],
    ["water","living","基本的な飲み水","Basic drinking water","pct1",1],
    ["sanit","living","基本的なトイレ","Basic sanitation","pct1",1],
    ["mobile","living","携帯電話契約（100人あたり）","Mobile subscriptions per 100","num1",0],
    ["clean_fuel","living","清潔な調理燃料","Clean cooking fuels","pct1",1],
    ["slum","living","スラムに暮らす人","People living in slums","pct1",-1],
    ["cm","issues","18歳前に結婚した女性","Women married before 18","pct1",-1],
    ["undernourish","issues","栄養不足","Undernourishment","pct1",-1],
    ["food_insec","issues","食料不安","Food insecurity","pct1",-1],
    ["hom","issues","殺人（10万人あたり）","Homicides per 100,000","num1",-1],
    ["road","issues","交通事故死亡（10万人あたり）","Road deaths per 100,000","num1",-1],
    ["cc","issues","汚職の抑制","Control of corruption","num2",1],
    ["ge","issues","政府の有効性","Government effectiveness","num2",1],
    ["rl","issues","法の支配","Rule of law","num2",1],
    ["va","issues","発言と説明責任","Voice and accountability","num2",1],
    ["pv","issues","政治的安定","Political stability","num2",1],
    ["rel","culture","信仰","Religion","list",0],
    ["cities","culture","おもな都市","Major cities","list",0],
    ["dis","culture","起こりやすい災害","Common hazards","list",0],
    ["emig","culture","移り住む先として多い国","Common emigrant destinations","list",0]
  ];
  var byKey = {}, byIso = {}, i;
  for (i = 0; i < specs.length; i++) byKey[specs[i][0]] = specs[i];
  for (i = 0; i < C.length; i++) byIso[C[i].iso] = C[i];
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (ch) { return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]; }); }
  function name(c) { return english ? c.name_en : c.name; }
  function label(spec) { return english ? spec[3] : spec[2]; }
  function get(c, key) { return key === "le" ? (c.lef + c.lem) / 2 : c[key]; }
  function estimated(c, key) { return key === "le" ? c.est.indexOf("lef") !== -1 || c.est.indexOf("lem") !== -1 : c.est.indexOf(key) !== -1; }
  function norm(s) {
    s = String(s || "").toLowerCase();
    if (s.normalize) s = s.normalize("NFKC");
    return s.replace(/[\u30a1-\u30f6]/g, function (ch) { return String.fromCharCode(ch.charCodeAt(0) - 96); }).replace(/\s+/g, " ").trim();
  }
  var aliases = {jpn:"nihon nippon にほん にっぽん", usa:"america アメリカ", gbr:"britain uk"};
  function matches(c, q) { return norm(c.name).indexOf(q) !== -1 || norm(c.name_en).indexOf(q) !== -1 || c.iso.indexOf(q) !== -1 || norm(aliases[c.iso]).indexOf(q) !== -1; }
  function number(n, decimals) { return Number(n).toLocaleString(english ? "en-US" : "ja-JP", {minimumFractionDigits:decimals, maximumFractionDigits:decimals}); }
  function format(c, spec) {
    var key = spec[0], v = get(c, key), type = spec[4], j, arr;
    if (type === "list") {
      arr = c[key + (english ? "_en" : "")] || c[key] || [];
      if (key === "rel") return arr.map(function (x) { return x[0] + " " + x[1] + "%"; }).join(" · ");
      return arr.join(" · ");
    }
    if (v == null || isNaN(Number(v))) return "—";
    if (type === "pop") return english ? number(v / 100, 2) + "m" : number(v, 0) + "万人";
    if (type === "money") return "$" + number(v, 0);
    if (type === "int") return number(v, 0);
    j = type === "num2" || type === "pct2" ? 2 : 1;
    return number(v, j) + (type.indexOf("pct") === 0 ? "%" : type === "years1" ? (english ? " years" : "年") : "");
  }
  function query() {
    var p = {}, parts = (location.search || "").replace(/^\?/, "").split("&"), j, pair;
    for (j = 0; j < parts.length; j++) { pair = parts[j].split("="); if (pair[0]) { try { p[decodeURIComponent(pair[0])] = decodeURIComponent((pair[1] || "").replace(/\+/g, " ")); } catch (e) {} } }
    return p;
  }
  function storageGet(key) { try { return JSON.parse(localStorage.getItem(key) || "null"); } catch (e) { return null; } }
  function storageSet(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {} }
  function urlSet(p) {
    var items = [], key;
    for (key in p) if (p.hasOwnProperty(key) && p[key] !== "") items.push(encodeURIComponent(key) + "=" + encodeURIComponent(p[key]));
    if (history.replaceState) history.replaceState(null, "", location.pathname + (items.length ? "?" + items.join("&") : "") + location.hash);
  }
  function list() {
    var table = document.getElementById("country-table"), tool = document.getElementById("country-tools"), rows, income = {}, regions = {}, regionKeys = [], q = query(), saved, state, extra, j, c, html, spec, current;
    if (!table || !tool || !C.length) return;
    rows = table.tBodies[0].rows;
    for (j = 0; j < rows.length; j++) income[rows[j].getAttribute("data-iso")] = rows[j].getAttribute("data-income") || "";
    for (j = 0; j < C.length; j++) regions[english ? C[j].region_en : C[j].region] = true;
    for (current in regions) if (regions.hasOwnProperty(current)) regionKeys.push(current);
    regionKeys.sort();
    extra = ["pop","tfr","gini","school","tert","urban","net","elec","water","sanit","food_insec","cc","life","lit","pov","vax_dtp3","undernourish"];
    saved = storageGet("meguri.countries." + (english ? "en" : "ja"));
    state = {q:"", region:"", income:"", est:"1", sort:"share", dir:"desc", cols:[]};
    if (saved) for (current in state) if (saved.hasOwnProperty(current)) state[current] = saved[current];
    if (q.q !== undefined || q.region !== undefined || q.income !== undefined || q.est !== undefined || q.sort !== undefined || q.cols !== undefined || q.dir !== undefined) {
      state = {q:q.q || "", region:q.region || "", income:q.income || "", est:q.est === "0" ? "0" : "1", sort:q.sort || "share", dir:q.dir === "asc" ? "asc" : "desc", cols:(q.cols || "").split(",")};
    }
    if (!Array.isArray(state.cols)) state.cols = [];
    state.cols = state.cols.filter(function (key) { return extra.indexOf(key) !== -1; });
    if (!byKey[state.sort] && ["name","chance","share"].indexOf(state.sort) === -1) state.sort = "share";
    html = '<div class="country-filters"><label>' + text.search + '<input id="country-search" type="search" autocomplete="off"></label>';
    html += '<label>' + text.region + '<select id="country-region"><option value="">' + text.all + '</option>';
    for (j = 0; j < regionKeys.length; j++) html += '<option value="' + esc(regionKeys[j]) + '">' + esc(regionKeys[j]) + '</option>';
    html += '</select></label><label>' + text.income + '<select id="country-income"><option value="">' + text.all + '</option>';
    var incomes = [["HIC",english ? "High income" : "高所得"],["UMC",english ? "Upper middle income" : "高中所得"],["LMC",english ? "Lower middle income" : "低中所得"],["LIC",english ? "Low income" : "低所得"]];
    for (j = 0; j < incomes.length; j++) html += '<option value="' + incomes[j][0] + '">' + incomes[j][1] + '</option>';
    html += '</select></label><label class="country-check"><input id="country-est" type="checkbox">' + text.estimates + '</label></div>';
    html += '<details class="country-picker"><summary>' + text.columns + '</summary><div class="country-pick-grid">';
    for (j = 0; j < extra.length; j++) html += '<label><input type="checkbox" value="' + extra[j] + '">' + esc(label(byKey[extra[j]])) + '</label>';
    html += '</div></details><div class="country-tool-bottom"><span id="country-count" aria-live="polite"></span><a href="compare/index.html?a=ind&amp;b=jpn">' + text.compare + '</a></div>';
    tool.innerHTML = html;
    var search = document.getElementById("country-search"), region = document.getElementById("country-region"), inc = document.getElementById("country-income"), est = document.getElementById("country-est"), boxes = tool.querySelectorAll(".country-pick-grid input");
    search.value = state.q; region.value = state.region; inc.value = state.income; est.checked = state.est === "1";
    for (j = 0; j < boxes.length; j++) boxes[j].checked = state.cols.indexOf(boxes[j].value) !== -1;
    function persist() {
      storageSet("meguri.countries." + (english ? "en" : "ja"), state);
      urlSet({q:state.q, region:state.region, income:state.income, est:state.est, sort:state.sort, dir:state.dir, cols:state.cols.join(",")});
    }
    function render() {
      var keys = ["name","share","chance","le","u5","gdp"].concat(state.cols), filtered = [], thead = "", tbody = "", k, val, ev;
      for (j = 0; j < keys.length; j++) {
        spec = byKey[keys[j]];
        var title = keys[j] === "name" ? text.country : keys[j] === "chance" ? text.chance : label(spec);
        thead += '<th scope="col" aria-sort="' + (state.sort === keys[j] ? state.dir === "asc" ? "ascending" : "descending" : "none") + '"><button type="button" data-sort="' + keys[j] + '">' + esc(title) + (state.sort === keys[j] ? (state.dir === "asc" ? " ↑" : " ↓") : "") + '</button></th>';
      }
      for (j = 0; j < C.length; j++) {
        c = C[j];
        if (state.q && !matches(c, norm(state.q))) continue;
        if (state.region && (english ? c.region_en : c.region) !== state.region) continue;
        if (state.income && income[c.iso] !== state.income) continue;
        if (state.est === "0") {
          ev = false;
          for (k = 0; k < keys.length; k++) if (keys[k] !== "name" && keys[k] !== "chance" && estimated(c, keys[k])) { ev = true; break; }
          if (ev) continue;
        }
        filtered.push(c);
      }
      filtered.sort(function (a, b) {
        var av = state.sort === "name" ? name(a) : state.sort === "chance" ? a.share : get(a, state.sort);
        var bv = state.sort === "name" ? name(b) : state.sort === "chance" ? b.share : get(b, state.sort);
        if (typeof av === "string") return (state.dir === "asc" ? 1 : -1) * av.localeCompare(bv, english ? "en" : "ja");
        return ((Number(av) - Number(bv)) * (state.dir === "asc" ? 1 : -1)) || a.iso.localeCompare(b.iso);
      });
      for (j = 0; j < filtered.length; j++) {
        c = filtered[j]; tbody += '<tr><th scope="row"><a href="' + c.iso + '/index.html">' + esc(name(c)) + '</a></th>';
        for (k = 1; k < keys.length; k++) {
          val = keys[k] === "chance" ? (c.share ? (english ? "1 in " : "約") + number(Math.round(100 / c.share), 0) + (english ? "" : "人に1人") : (english ? "under 1 in 20,000" : "2万人に1人未満")) : format(c, byKey[keys[k]]);
          tbody += '<td>' + esc(val) + (estimated(c, keys[k]) ? '<small class="country-est">' + text.estimated + '</small>' : '') + '</td>';
        }
        tbody += '</tr>';
      }
      if (!filtered.length) tbody = '<tr><td colspan="' + keys.length + '">' + text.noMatch + '</td></tr>';
      table.tHead.innerHTML = '<tr>' + thead + '</tr>';
      table.tBodies[0].innerHTML = tbody;
      document.getElementById("country-count").textContent = filtered.length + text.shown;
      var buttons = table.tHead.querySelectorAll("button");
      for (j = 0; j < buttons.length; j++) buttons[j].onclick = function () {
        var key = this.getAttribute("data-sort");
        state.dir = state.sort === key && state.dir === "asc" ? "desc" : "asc";
        state.sort = key; persist(); render();
      };
    }
    search.oninput = function () { state.q = this.value; persist(); render(); };
    region.onchange = function () { state.region = this.value; persist(); render(); };
    inc.onchange = function () { state.income = this.value; persist(); render(); };
    est.onchange = function () { state.est = this.checked ? "1" : "0"; persist(); render(); };
    for (j = 0; j < boxes.length; j++) boxes[j].onchange = function () {
      state.cols = [];
      for (var n = 0; n < boxes.length; n++) if (boxes[n].checked) state.cols.push(boxes[n].value);
      persist(); render();
    };
    render();
  }
  function compareLink() {
    var link = document.querySelector("[data-compare-country]"), settings, real;
    if (!link) return;
    settings = storageGet((english ? "meguri.en." : "meguri.") + "settings");
    real = settings && settings.real;
    if (real && /^[a-z]{3}$/.test(real)) link.href = "../compare/index.html?a=" + encodeURIComponent(link.getAttribute("data-compare-country")) + "&b=" + encodeURIComponent(real);
  }
  function comparison() {
    var root = document.getElementById("country-compare"), controls, results, q, a, b, j;
    if (!root || !C.length) return;
    controls = document.getElementById("compare-controls"); results = document.getElementById("compare-results"); q = query();
    var saved = storageGet("meguri.compare." + (english ? "en" : "ja")) || {};
    a = byIso[q.a] ? q.a : byIso[saved.a] ? saved.a : "ind";
    b = byIso[q.b] ? q.b : byIso[saved.b] ? saved.b : "jpn";
    function picker(which, value, title) {
      var s = '<div class="compare-picker"><label for="compare-search-' + which + '">' + title + '</label><input type="search" id="compare-search-' + which + '" placeholder="' + text.find + '" autocomplete="off"><select id="compare-' + which + '" aria-label="' + title + '">';
      for (var n = 0; n < C.length; n++) s += '<option value="' + C[n].iso + '"' + (C[n].iso === value ? ' selected' : '') + '>' + esc(name(C[n])) + '</option>';
      return s + '</select></div>';
    }
    controls.innerHTML = '<div class="compare-pickers">' + picker("a", a, text.first) + picker("b", b, text.second) + '</div>';
    function cell(c, other, spec) {
      var val = get(c, spec[0]), opposite = get(other, spec[0]), numeric = spec[4] !== "list", ratio = 0, high, cls = "", bar = "", note = "";
      if (numeric && val != null && opposite != null && !isNaN(Number(val)) && !isNaN(Number(opposite))) {
        if (spec[0] === "cc" || spec[0] === "ge" || spec[0] === "rl" || spec[0] === "va" || spec[0] === "pv") ratio = Math.max(0, Math.min(100, (Number(val) + 2.5) * 20));
        else ratio = Math.max(0, Math.min(100, Number(val) / Math.max(Number(val), Number(opposite), 0.001) * 100));
        high = spec[5] && Number(val) !== Number(opposite) && (Number(val) - Number(opposite)) * spec[5] > 0;
        cls = high ? " compare-direction" : "";
        bar = '<span class="compare-bar" aria-hidden="true"><span style="width:' + ratio.toFixed(1) + '%"></span></span>';
      }
      if (estimated(c, spec[0])) note = '<small class="compare-est">' + text.estimated + '</small>';
      return '<td class="compare-value' + cls + '"' + (cls ? ' title="' + text.direction + '"' : '') + '><span class="compare-number">' + esc(format(c, spec)) + '</span>' + note + bar + '</td>';
    }
    function render() {
      var ca = byIso[a], cb = byIso[b], html = '', g, k, spec;
      for (g = 0; g < groups.length; g++) {
        html += '<section class="compare-section"><h2>' + (english ? groups[g][2] : groups[g][1]) + '</h2><div class="compare-table-scroll"><table class="compare-table"><thead><tr><th scope="col">' + (english ? "Indicator" : "指標") + '</th><th scope="col"><a href="../' + ca.iso + '/index.html">' + esc(name(ca)) + '</a></th><th scope="col"><a href="../' + cb.iso + '/index.html">' + esc(name(cb)) + '</a></th></tr></thead><tbody>';
        for (k = 0; k < specs.length; k++) {
          spec = specs[k]; if (spec[1] !== groups[g][0]) continue;
          html += '<tr><th scope="row">' + esc(label(spec)) + '</th>' + cell(ca, cb, spec) + cell(cb, ca, spec) + '</tr>';
        }
        html += '</tbody></table></div></section>';
      }
      results.innerHTML = html;
      storageSet("meguri.compare." + (english ? "en" : "ja"), {a:a,b:b});
      urlSet({a:a,b:b});
    }
    function wire(which) {
      var select = document.getElementById("compare-" + which), search = document.getElementById("compare-search-" + which);
      select.onchange = function () { if (which === "a") a = this.value; else b = this.value; render(); };
      search.oninput = function () {
        var term = norm(this.value), old = which === "a" ? a : b, html = "", n;
        for (n = 0; n < C.length; n++) if (!term || matches(C[n], term)) html += '<option value="' + C[n].iso + '">' + esc(name(C[n])) + '</option>';
        select.innerHTML = html || '<option value="" disabled>' + text.noMatch + '</option>';
        if (select.querySelector('option[value="' + old + '"]')) select.value = old;
        else if (html) {
          select.selectedIndex = 0;
          if (which === "a") a = select.value; else b = select.value;
          render();
        }
      };
    }
    wire("a"); wire("b"); render();
  }
  compareLink(); list(); comparison();
}());
