/* Country list and comparison, with the generated table as a no-script fallback. ES5. */
(function () {
  "use strict";
  var C = window.COUNTRIES || [];
  var lang = (document.documentElement.lang || "ja").split("-")[0];
  var english = lang === "en", indonesian = lang === "id";
  var text = indonesian ? {
    search: "Cari negara", region: "Wilayah", income: "Kelompok pendapatan", all: "Semua",
    estimates: "Sertakan perkiraan", columns: "Tampilkan lebih banyak ukuran", shown: " negara ditampilkan",
    compare: "Bandingkan dua negara", country: "Negara", chance: "Peluang",
    estimated: "perkiraan", first: "Negara pertama", second: "Negara kedua",
    find: "Cari negara", choose: "Pilih negara", direction: "Arah nilai ukuran ini",
    noMatch: "Tidak ada negara yang cocok dengan penyaring ini.",
    year: "", yearPrefix: "Tahun ", estimatedYear: "tahun data tidak tercatat",
    gross: "Angka partisipasi kasar dapat melampaui 100% karena mencakup murid di luar kelompok usia resmi.",
    cohort: "Perkiraan tingkat kelulusan dapat melampaui 100% karena mencakup kelulusan lebih cepat atau lebih lambat."
  } : english ? {
    search: "Search countries", region: "Region", income: "Income group", all: "All",
    estimates: "Include estimates", columns: "More indicators", shown: " countries shown",
    compare: "Compare two countries", country: "Country", chance: "Chance",
    estimated: "estimated", first: "First country", second: "Second country",
    find: "Find a country", choose: "Choose a country", direction: "Direction of this measure",
    noMatch: "No countries match these filters.",
    year: "", yearPrefix: "Year ", estimatedYear: "year not recorded", gross: "Gross enrolment: all ages enrolled, divided by the population of the official age group; it can exceed 100%.",
    cohort: "Cohort completion rate: late or early completion can put this estimate above 100%."
  } : {
    search: "国名で探す", region: "地域", income: "所得区分", all: "すべて",
    estimates: "推定値も含める", columns: "指標を増やす", shown: "か国を表示",
    compare: "2か国を比べる", country: "国", chance: "確率",
    estimated: "推定", first: "1つ目の国", second: "2つ目の国",
    find: "国名で探す", choose: "国を選ぶ", direction: "数値の見方",
    noMatch: "条件に合う国がありません。",
    year: "年", yearPrefix: "", estimatedYear: "年の記録なし", gross: "総就学率：対象年齢以外の学生も含むため、100%を超えることがあります。",
    cohort: "学年ごとの修了率：対象年齢以外の修了者も含む推計で、100%を超えることがあります。"
  };
  var metricNotes = indonesian ? {
    share: "Bagian dari seluruh kelahiran di dunia", le: "Rata-rata sederhana harapan hidup perempuan dan laki-laki",
    birth_reg: "Anak berusia di bawah lima tahun", contracept: "Perempuan usia 15–49 tahun",
    u5: "Persentase kelahiran hidup, semua jenis kelamin", imr: "Persentase kelahiran hidup, semua jenis kelamin",
    mmr: "Kematian ibu per 100.000 kelahiran hidup", vax_dtp3: "Anak usia 12–23 bulan", vax_measles: "Anak usia 12–23 bulan",
    oop: "Bagian dari seluruh biaya kesehatan", hiv: "Orang dewasa usia 15–49 tahun", smk_m: "Laki-laki dewasa", smk_f: "Perempuan dewasa",
    tert: "Partisipasi kasar pendidikan tinggi; termasuk usia di luar kelompok resmi", fem_sec: "Partisipasi kasar sekolah menengah perempuan; termasuk usia di luar kelompok resmi",
    prim_compl: "Perkiraan kelulusan kelompok murid", lsec_compl: "Perkiraan kelulusan kelompok murid", out_school: "Anak usia sekolah dasar", childlab: "Anak usia 7–14 tahun",
    flfp: "Perempuan usia 15 tahun ke atas", unemp: "Bagian dari angkatan kerja", agri: "Bagian dari pekerja", ind_emp: "Bagian dari pekerja", srv_emp: "Bagian dari pekerja", self_emp: "Bagian dari pekerja", vuln_emp: "Bagian dari pekerja", informal: "Pekerja di luar pertanian", remit: "Bagian dari PDB", pov: "Bagian dari penduduk", pension_cov: "Penduduk yang memenuhi syarat", wealth_bottom40: "Bagian dari pendapatan nasional",
    urban: "Bagian dari penduduk", net: "Bagian dari penduduk", elec: "Bagian dari penduduk", water: "Bagian dari penduduk", sanit: "Bagian dari penduduk", clean_fuel: "Bagian dari penduduk", slum: "Penduduk kota", cm: "Perempuan usia 20–24 tahun", undernourish: "Bagian dari penduduk", food_insec: "Bagian dari penduduk"
  } : english ? {
    share: "Share of births worldwide", le: "Unweighted mean of women's and men's life expectancy", birth_reg: "Children under 5", contracept: "Women aged 15–49", u5: "Deaths per live births, both sexes", imr: "Deaths per live births, both sexes",
    mmr: "Maternal deaths per 100,000 live births", vax_dtp3: "Children aged 12–23 months", vax_measles: "Children aged 12–23 months",
    oop: "Share of all health spending", hiv: "Adults aged 15–49", smk_m: "Adult men", smk_f: "Adult women",
    tert: "Gross tertiary enrolment; all ages / official tertiary age group", fem_sec: "Gross secondary enrolment, girls; all ages / official age group",
    prim_compl: "Cohort completion estimate", lsec_compl: "Cohort completion estimate", out_school: "Primary-school-age children", childlab: "Children aged 7–14",
    flfp: "Women aged 15+", unemp: "Share of labor force", agri: "Share of workers", ind_emp: "Share of workers", srv_emp: "Share of workers", self_emp: "Share of workers", vuln_emp: "Share of workers", informal: "Non-agricultural workers", remit: "Share of GDP", pov: "Share of population", pension_cov: "Eligible population", wealth_bottom40: "Share of national income",
    urban: "Share of population", net: "Share of population", elec: "Share of population", water: "Share of population", sanit: "Share of population", clean_fuel: "Share of population", slum: "Urban population", cm: "Women aged 20–24", undernourish: "Share of population", food_insec: "Share of population"
  } : {
    share: "世界の出生数に占める割合", le: "女性と男性の平均寿命の単純平均", birth_reg: "5歳未満の子どものうち", contracept: "15～49歳の女性のうち", u5: "出生児に占める割合・男女計", imr: "出生児に占める割合・男女計",
    mmr: "出生10万人あたりの妊産婦死亡", vax_dtp3: "生後12～23か月の子どものうち", vax_measles: "生後12～23か月の子どものうち",
    oop: "医療費全体に占める割合", hiv: "15～49歳のうち", smk_m: "成人男性のうち", smk_f: "成人女性のうち",
    tert: "高等教育の総就学率・対象年齢以外も含む", fem_sec: "女子の中等教育の総就学率・対象年齢以外も含む",
    prim_compl: "学年ごとの修了率", lsec_compl: "学年ごとの修了率", out_school: "小学校の学齢児のうち", childlab: "7～14歳の子どものうち",
    flfp: "15歳以上の女性のうち", unemp: "労働力人口のうち", agri: "就業者のうち", ind_emp: "就業者のうち", srv_emp: "就業者のうち", self_emp: "就業者のうち", vuln_emp: "就業者のうち", informal: "農業以外の就業者のうち", remit: "GDPに占める割合", pov: "人口に占める割合", pension_cov: "対象人口のうち", wealth_bottom40: "国全体の所得に占める割合",
    urban: "人口に占める割合", net: "人口に占める割合", elec: "人口に占める割合", water: "人口に占める割合", sanit: "人口に占める割合", clean_fuel: "人口に占める割合", slum: "都市人口のうち", cm: "20～24歳の女性のうち", undernourish: "人口に占める割合", food_insec: "人口に占める割合"
  };
  var grossKeys = {tert:true, fem_sec:true, prim_compl:true, lsec_compl:true};
  var groups = [
    ["birth", "人口と出生", "Population and births", "Penduduk dan kelahiran"],
    ["health", "健康", "Health", "Kesehatan"],
    ["education", "教育", "Education", "Pendidikan"],
    ["money", "仕事とお金", "Work and money", "Pekerjaan dan pendapatan"],
    ["living", "暮らしの土台", "Everyday essentials", "Kebutuhan sehari-hari"],
    ["issues", "課題", "Challenges", "Tantangan"],
    ["culture", "文化", "Culture", "Budaya"]
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
  var idLabels = {
    pop: "Jumlah penduduk", share: "Pangsa kelahiran dunia", tfr: "Jumlah anak per perempuan",
    birth_reg: "Pencatatan kelahiran", adol_fert: "Kelahiran remaja per 1.000 orang",
    contracept: "Pemakaian kontrasepsi", age_marr_f: "Usia perempuan saat menikah pertama kali",
    age_marr_m: "Usia laki-laki saat menikah pertama kali", le: "Harapan hidup",
    lef: "Harapan hidup perempuan", lem: "Harapan hidup laki-laki",
    u5: "Kematian sebelum usia lima tahun", imr: "Kematian sebelum usia satu tahun",
    mmr: "Kematian ibu per 100.000 kelahiran", phys: "Dokter per 1.000 orang",
    vax_dtp3: "Imunisasi DTP3", vax_measles: "Imunisasi campak",
    oop: "Biaya kesehatan yang dibayar sendiri", hiv: "Orang yang hidup dengan HIV",
    smk_m: "Laki-laki yang merokok", smk_f: "Perempuan yang merokok",
    life: "Kepuasan hidup (dari 10)", school: "Perkiraan lama bersekolah",
    tert: "Partisipasi pendidikan tinggi", lit: "Penduduk dewasa yang melek huruf",
    fem_sec: "Partisipasi perempuan di sekolah menengah", out_school: "Anak yang tidak bersekolah",
    prim_compl: "Kelulusan sekolah dasar", lsec_compl: "Kelulusan sekolah menengah pertama",
    childlab: "Anak yang bekerja", gdp: "PDB per orang (dolar AS, PPP)",
    gini: "Ketimpangan pendapatan (Gini)", flfp: "Perempuan dalam angkatan kerja",
    unemp: "Pengangguran", agri: "Pekerja pertanian", ind_emp: "Pekerja industri",
    srv_emp: "Pekerja jasa", self_emp: "Pekerja mandiri", vuln_emp: "Pekerjaan rentan",
    informal: "Pekerjaan informal", remit: "Kiriman uang dari luar negeri (bagian PDB)",
    pov: "Penduduk yang hidup dengan kurang dari US$3 per hari", pension_cov: "Cakupan pensiun",
    wealth_bottom40: "Bagian pendapatan kelompok 40% terbawah", urban: "Penduduk kota",
    net: "Pengguna internet", elec: "Akses listrik", water: "Akses air minum dasar",
    sanit: "Akses sanitasi dasar", mobile: "Langganan telepon seluler per 100 orang",
    clean_fuel: "Bahan bakar memasak yang bersih", slum: "Penduduk kawasan kumuh",
    cm: "Perempuan yang menikah sebelum usia 18 tahun", undernourish: "Kekurangan gizi",
    food_insec: "Kerawanan pangan", hom: "Pembunuhan per 100.000 orang",
    road: "Kematian di jalan per 100.000 orang", cc: "Pengendalian korupsi",
    ge: "Efektivitas pemerintah", rl: "Penegakan hukum", va: "Kebebasan bersuara dan akuntabilitas",
    pv: "Stabilitas politik", rel: "Agama", cities: "Kota utama",
    dis: "Bencana yang sering terjadi", emig: "Negara tujuan perpindahan penduduk"
  };
  var idRegions = {
    "Central Africa": "Afrika Tengah", "Central America and the Caribbean": "Amerika Tengah dan Karibia",
    "Central Asia": "Asia Tengah", "East Africa": "Afrika Timur", "East Asia": "Asia Timur",
    "Eastern Europe": "Eropa Timur", "North Africa": "Afrika Utara", "North America": "Amerika Utara",
    "Northern Europe": "Eropa Utara", "Oceania": "Oseania", "South America": "Amerika Selatan",
    "South Asia": "Asia Selatan", "Southeast Asia": "Asia Tenggara", "Southern Africa": "Afrika Selatan",
    "Southern Europe": "Eropa Selatan", "West Africa": "Afrika Barat", "West Asia": "Asia Barat",
    "Western Europe": "Eropa Barat"
  };
  var byKey = {}, byIso = {}, i;
  for (i = 0; i < specs.length; i++) byKey[specs[i][0]] = specs[i];
  for (i = 0; i < C.length; i++) byIso[C[i].iso] = C[i];
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (ch) { return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]; }); }
  function name(c) { return indonesian ? window.I18N.countryName(c) : english ? c.name_en : c.name; }
  function label(spec) { return indonesian ? idLabels[spec[0]] : english ? spec[3] : spec[2]; }
  function region(c) { return indonesian ? idRegions[c.region_en] : english ? c.region_en : c.region; }
  function get(c, key) { return key === "le" ? (c.lef + c.lem) / 2 : c[key]; }
  function estimated(c, key) { return key === "le" ? c.est.indexOf("lef") !== -1 || c.est.indexOf("lem") !== -1 : c.est.indexOf(key) !== -1; }
  function norm(s) {
    s = String(s || "").toLowerCase();
    if (s.normalize) s = s.normalize("NFKC");
    return s.replace(/[\u30a1-\u30f6]/g, function (ch) { return String.fromCharCode(ch.charCodeAt(0) - 96); }).replace(/\s+/g, " ").trim();
  }
  var aliases = {jpn:"nihon nippon にほん にっぽん", usa:"america アメリカ", gbr:"britain uk"};
  function matches(c, q) { return norm(name(c)).indexOf(q) !== -1 || norm(c.name).indexOf(q) !== -1 || norm(c.name_en).indexOf(q) !== -1 || c.iso.indexOf(q) !== -1 || norm(aliases[c.iso]).indexOf(q) !== -1; }
  function number(n, decimals) { return Number(n).toLocaleString(indonesian ? "id-ID" : english ? "en-US" : "ja-JP", {minimumFractionDigits:decimals, maximumFractionDigits:decimals}); }
  function percent(v, key, decimals) {
    var kind = grossKeys[key] ? "gross" : key === "u5" || key === "imr" ? "risk" : "bounded";
    if (window.STATS && window.STATS.percent) {
      var rendered = window.STATS.percent(v, kind, decimals);
      return indonesian ? rendered.replace(/(\d)\.(\d)/g, "$1,$2") : rendered;
    }
    if (v > 0 && v < Math.pow(10, -decimals) / 2) return "<" + number(Math.pow(10, -decimals), decimals) + "%";
    if (!grossKeys[key] && v < 100 && Number(v.toFixed(decimals)) >= 100) return ">" + number(100 - Math.pow(10, -decimals), decimals) + "%";
    return number(v, decimals) + "%";
  }
  function detail(c, key) {
    var parts = [], years = c.year || {};
    if (key === "le") {
      if (years.lef && years.lem && years.lef === years.lem) parts.push(text.yearPrefix + years.lef + text.year);
    } else if (years[key]) parts.push(text.yearPrefix + years[key] + text.year);
    if (metricNotes[key]) parts.push(metricNotes[key]);
    if (key === "tert" || key === "fem_sec") parts.push(text.gross);
    if (key === "prim_compl" || key === "lsec_compl") parts.push(text.cohort);
    return parts.join(" · ");
  }
  function format(c, spec) {
    var key = spec[0], v = get(c, key), type = spec[4], j, arr;
    if (type === "list") {
      arr = c[key + (english ? "_en" : "")] || c[key] || [];
      if (key === "rel") return arr.map(function (x) { return (indonesian ? window.I18N.countryValue(c, key, x[0]) : x[0]) + " " + percent(x[1], "rel", 1); }).join(" · ");
      if (indonesian) return arr.map(function (x) { return window.I18N.countryValue(c, key, x); }).join(" · ");
      return arr.join(" · ");
    }
    if (v == null || isNaN(Number(v))) return "—";
    if (type === "pop") return indonesian ? number(v / 100, 2) + " juta" : english ? number(v / 100, 2) + "m" : number(v, 0) + "万人";
    if (type === "money") return (indonesian ? "US$" : "$") + number(v, 0);
    if (type === "int") return number(v, 0);
    j = type === "num2" || type === "pct2" ? 2 : 1;
    return type.indexOf("pct") === 0 ? percent(v, key, j) : number(v, j) + (type === "years1" ? (indonesian ? " tahun" : english ? " years" : "年") : "");
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
    for (j = 0; j < C.length; j++) regions[region(C[j])] = true;
    for (current in regions) if (regions.hasOwnProperty(current)) regionKeys.push(current);
    regionKeys.sort();
    extra = ["pop","tfr","gini","school","tert","urban","net","elec","water","sanit","food_insec","cc","life","lit","pov","vax_dtp3","undernourish"];
    saved = storageGet("meguri.countries." + lang);
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
    var incomes = [["HIC",indonesian ? "Pendapatan tinggi" : english ? "High income" : "高所得"],
      ["UMC",indonesian ? "Pendapatan menengah atas" : english ? "Upper middle income" : "高中所得"],
      ["LMC",indonesian ? "Pendapatan menengah bawah" : english ? "Lower middle income" : "低中所得"],
      ["LIC",indonesian ? "Pendapatan rendah" : english ? "Low income" : "低所得"]];
    for (j = 0; j < incomes.length; j++) html += '<option value="' + incomes[j][0] + '">' + incomes[j][1] + '</option>';
    html += '</select></label><label class="country-check"><input id="country-est" type="checkbox">' + text.estimates + '</label></div>';
    html += '<details class="country-picker"><summary>' + text.columns + '</summary><div class="country-pick-grid">';
    for (j = 0; j < extra.length; j++) html += '<label><input type="checkbox" value="' + extra[j] + '">' + esc(label(byKey[extra[j]])) + '</label>';
    html += '</div></details><div class="country-tool-bottom"><span id="country-count" aria-live="polite"></span><a href="compare/index.html?a=ind&amp;b=jpn">' + text.compare + '</a></div>';
    html += '<p class="small">' + esc(text.gross) + ' ' + esc(text.cohort) + '</p>';
    tool.innerHTML = html;
    var search = document.getElementById("country-search"), region = document.getElementById("country-region"), inc = document.getElementById("country-income"), est = document.getElementById("country-est"), boxes = tool.querySelectorAll(".country-pick-grid input");
    search.value = state.q; region.value = state.region; inc.value = state.income; est.checked = state.est === "1";
    for (j = 0; j < boxes.length; j++) boxes[j].checked = state.cols.indexOf(boxes[j].value) !== -1;
    function persist() {
      storageSet("meguri.countries." + lang, state);
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
        if (state.region && region(c) !== state.region) continue;
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
        if (typeof av === "string") return (state.dir === "asc" ? 1 : -1) * av.localeCompare(bv, lang);
        return ((Number(av) - Number(bv)) * (state.dir === "asc" ? 1 : -1)) || a.iso.localeCompare(b.iso);
      });
      for (j = 0; j < filtered.length; j++) {
        c = filtered[j]; tbody += '<tr><th scope="row">' + (indonesian ? esc(name(c)) : '<a href="' + c.iso + '/index.html">' + esc(name(c)) + '</a>') + '</th>';
        for (k = 1; k < keys.length; k++) {
          val = keys[k] === "chance" ? (c.share ? (indonesian ? "1 dari " : english ? "1 in " : "約") + number(Math.round(100 / c.share), 0) + (indonesian || english ? "" : "人に1人") : (indonesian ? "kurang dari 1 dari 20.000" : english ? "under 1 in 20,000" : "2万人に1人未満")) : format(c, byKey[keys[k]]);
          tbody += '<td>' + esc(val) + (estimated(c, keys[k]) ? '<small class="country-est">' + text.estimated + '</small>' : '') + (detail(c, keys[k]) ? '<small class="country-est">' + esc(detail(c, keys[k])) + '</small>' : '') + '</td>';
        }
        tbody += '</tr>';
      }
      if (!filtered.length) tbody = '<tr><td colspan="' + keys.length + '">' + text.noMatch + '</td></tr>';
      table.tHead.innerHTML = '<tr>' + thead + '</tr>';
      table.tBodies[0].innerHTML = tbody;
      document.getElementById("country-count").textContent = (indonesian ? number(filtered.length, 0) : filtered.length) + text.shown;
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
    settings = storageGet((lang === "ja" ? "meguri." : "meguri." + lang + ".") + "settings");
    real = settings && settings.real;
    if (real && /^[a-z]{3}$/.test(real)) link.href = "../compare/index.html?a=" + encodeURIComponent(link.getAttribute("data-compare-country")) + "&b=" + encodeURIComponent(real);
  }
  function comparison() {
    var root = document.getElementById("country-compare"), controls, results, q, a, b, j;
    if (!root || !C.length) return;
    controls = document.getElementById("compare-controls"); results = document.getElementById("compare-results"); q = query();
    var saved = storageGet("meguri.compare." + lang) || {};
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
      if (detail(c, spec[0])) note += '<small class="compare-est">' + esc(detail(c, spec[0])) + '</small>';
      return '<td class="compare-value' + cls + '"' + (cls ? ' title="' + text.direction + '"' : '') + '><span class="compare-number">' + esc(format(c, spec)) + '</span>' + note + bar + '</td>';
    }
    function render() {
      var ca = byIso[a], cb = byIso[b], html = '', g, k, spec;
      for (g = 0; g < groups.length; g++) {
        html += '<section class="compare-section"><h2>' + (indonesian ? groups[g][3] : english ? groups[g][2] : groups[g][1]) + '</h2><div class="compare-table-scroll"><table class="compare-table"><thead><tr><th scope="col">' + (indonesian ? "Ukuran" : english ? "Indicator" : "指標") + '</th><th scope="col">' + (indonesian ? esc(name(ca)) : '<a href="../' + ca.iso + '/index.html">' + esc(name(ca)) + '</a>') + '</th><th scope="col">' + (indonesian ? esc(name(cb)) : '<a href="../' + cb.iso + '/index.html">' + esc(name(cb)) + '</a>') + '</th></tr></thead><tbody>';
        for (k = 0; k < specs.length; k++) {
          spec = specs[k]; if (spec[1] !== groups[g][0]) continue;
          html += '<tr><th scope="row">' + esc(label(spec)) + '</th>' + cell(ca, cb, spec) + cell(cb, ca, spec) + '</tr>';
        }
        html += '</tbody></table></div></section>';
      }
      results.innerHTML = html;
      storageSet("meguri.compare." + lang, {a:a,b:b});
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
