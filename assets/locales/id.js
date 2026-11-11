/* Indonesian data names and formatting. Loaded only by the Indonesian route. */
(function () {
  "use strict";
  var I = window.I18N;
  if (!I || I.lang !== "id") return;
  var iso2 = {"ind":"IN","chn":"CN","nga":"NG","pak":"PK","cod":"CD","idn":"ID","eth":"ET","usa":"US","bgd":"BD","bra":"BR","egy":"EG","tza":"TZ","mex":"MX","phl":"PH","uga":"UG","sdn":"SD","ken":"KE","afg":"AF","ago":"AO","yem":"YE","vnm":"VN","moz":"MZ","rus":"RU","irq":"IQ","zaf":"ZA","irn":"IR","ner":"NE","mdg":"MG","civ":"CI","cmr":"CM","mli":"ML","uzb":"UZ","tur":"TR","gha":"GH","tcd":"TD","mmr":"MM","dza":"DZ","som":"SO","bfa":"BF","zmb":"ZM","col":"CO","jpn":"JP","mwi":"MW","gbr":"GB","deu":"DE","fra":"FR","mar":"MA","sau":"SA","syr":"SY","tha":"TH","npl":"NP","sen":"SN","per":"PE","arg":"AR","zwe":"ZW","gin":"GN","ben":"BJ","bdi":"BI","mys":"MY","ven":"VE","rwa":"RW","kaz":"KZ","gtm":"GT","ita":"IT","can":"CA","khm":"KH","ssd":"SS","prk":"KP","esp":"ES","aus":"AU","tgo":"TG","tjk":"TJ","ecu":"EC","sle":"SL","bol":"BO","png":"PG","hti":"HT","caf":"CF","pol":"PL","kor":"KR","hnd":"HN","jor":"JO","lka":"LK","ukr":"UA","dom":"DO","cog":"CG","isr":"IL","mrt":"MR","lbr":"LR","chl":"CL","nld":"NL","tun":"TN","lao":"LA","tkm":"TM","pse":"PS","rou":"RO","kgz":"KG","pry":"PY","nic":"NI","lby":"LY","are":"AE","bel":"BE","eri":"ER","aze":"AZ","slv":"SV","swe":"SE","cub":"CU","lbn":"LB","omn":"OM","prt":"PT","gmb":"GM","cze":"CZ","nam":"NA","che":"CH","hun":"HU","aut":"AT","pan":"PA","gab":"GA","grc":"GR","gnb":"GW","blr":"BY","bwa":"BW","mng":"MN","srb":"RS","nzl":"NZ","gnq":"GQ","dnk":"DK","lso":"LS","irl":"IE","nor":"NO","bgr":"BG","cri":"CR","kwt":"KW","svk":"SK","sgp":"SG","geo":"GE","fin":"FI","arm":"AM","ury":"UY","jam":"JM","hrv":"HR","tls":"TL","swz":"SZ","qat":"QA","mda":"MD","com":"KM","dji":"DJ","bih":"BA","alb":"AL","slb":"SB","bhr":"BH","ltu":"LT","xkx":"XK","svn":"SI","fji":"FJ","guy":"GY","mkd":"MK","tto":"TT","cyp":"CY","mus":"MU","lva":"LV","sur":"SR","btn":"BT","est":"EE","vut":"VU","blz":"BZ","mne":"ME","stp":"ST","lux":"LU","cpv":"CV","brn":"BN","mdv":"MV"};
  var regions = typeof Intl.DisplayNames === "function" ? new Intl.DisplayNames(["id"], { type: "region" }) : null;
  var overrides = { usa: "Amerika Serikat", gbr: "Britania Raya", cod: "Republik Demokratik Kongo",
    cog: "Republik Kongo", civ: "Pantai Gading", tza: "Tanzania", pse: "Palestina" };
  var religions = { Hinduism: "Hindu", Islam: "Islam", Christianity: "Kristen", Buddhism: "Buddha",
    Catholic: "Katolik", Protestant: "Protestan", "Orthodox Christian": "Kristen Ortodoks",
    "Other Christian": "Kristen lainnya", Sikhism: "Sikh", Judaism: "Yahudi",
    "Traditional religions": "Kepercayaan tradisional", "Folk beliefs or no religion": "Kepercayaan tradisional atau tidak beragama",
    "No religion or folk beliefs": "Tidak beragama atau menganut kepercayaan tradisional",
    "No religion or other": "Tidak beragama atau menganut kepercayaan lain",
    "Other or no religion": "Menganut kepercayaan lain atau tidak beragama",
    "No religion": "Tidak beragama", "Shinto or Buddhism": "Shinto atau Buddha",
    "Folk religion": "Kepercayaan tradisional", Other: "Lainnya", None: "Tidak beragama" };
  var causes = { pneumonia: "infeksi saluran pernapasan bawah", diarrhea: "penyakit diare", tb: "tuberkulosis",
    hiv: "HIV/AIDS", malaria: "malaria", child_infection: "infeksi pada anak", neonatal: "penyakit pada bayi baru lahir",
    maternal: "komplikasi kehamilan atau persalinan", nutrition: "kekurangan gizi", lung_cancer: "kanker paru-paru",
    stomach_cancer: "kanker lambung", colorectal_cancer: "kanker usus besar", liver_cancer: "kanker hati",
    breast_cancer: "kanker payudara", other_cancer: "kanker lain", heart: "penyakit jantung koroner",
    stroke: "stroke", copd: "penyakit paru obstruktif kronis", diabetes: "diabetes", kidney: "penyakit ginjal",
    cirrhosis: "sirosis hati", dementia: "demensia", road: "kecelakaan lalu lintas", drowning: "tenggelam",
    falls: "jatuh", violence: "kekerasan", conflict: "konflik", disaster: "bencana alam",
    selfharm: "bunuh diri", other: "penyakit lain" };
  var disasters = { Floods: "banjir", Flood: "banjir", Earthquakes: "gempa bumi", Earthquake: "gempa bumi",
    Drought: "kekeringan", Droughts: "kekeringan", Cyclones: "siklon", "Heat waves": "gelombang panas",
    "Cold waves": "gelombang dingin", "Disease outbreaks": "wabah penyakit", "Heavy rain": "hujan lebat",
    Hurricanes: "badai topan", Sandstorms: "badai pasir", "Severe storms": "badai besar",
    "Storm surges": "gelombang badai", Tornadoes: "angin puting beliung", Typhoons: "topan",
    "Volcanic eruptions": "letusan gunung berapi", Windstorms: "badai angin",
    Tsunamis: "tsunami", Wildfires: "kebakaran hutan", Landslides: "tanah longsor" };
  var foodNames = { "Chicken rice": "Nasi ayam", "Fish and chips": "Ikan dan kentang goreng", "Grilled fish": "Ikan bakar",
    "Cornbread": "Roti jagung", "Cinnamon roll": "Roti gulung kayu manis", "Irish stew": "Semur Irlandia",
    "Maple taffy": "Permen sirup mapel", "Cassava": "Singkong", "Cassava leaves": "Daun singkong",
    "Frites": "Kentang goreng", "Hamburger": "Hamburger", "Jerk chicken": "Ayam jerk", "Jollof rice": "Nasi jollof" };
  var foodDescriptions = { "spiced rice": "nasi berbumbu", "thick maize porridge": "bubur jagung kental",
    "cassava leaves": "daun singkong", "peanut stew": "semur kacang", "meat and vegetable stew": "semur daging dan sayuran",
    "fried wheat dough": "adonan gandum goreng", "fermented flatbread": "roti pipih fermentasi",
    "stewed leafy greens": "sayuran daun yang dimasak", "baked potato dish": "hidangan kentang panggang",
    "flatbread": "roti pipih", "spiced stew": "semur berbumbu", "rice cooked with meat and carrots": "nasi dengan daging dan wortel",
    "thick millet porridge": "bubur jewawut kental", "meatballs": "bakso", "rice noodle soup": "sup mi beras",
    "cooked rice": "nasi", "rice with beans": "nasi dan kacang", "fish and coconut salad": "salad ikan dan kelapa",
    "salt-grilled fish": "ikan bakar bergaram", "fried potatoes": "kentang goreng", "fermented milk dish": "hidangan susu fermentasi" };
  function foodLabel(value) {
    var match = /^(.*?) \((.*?)\)$/.exec(value);
    if (!match) return foodNames[value] || value;
    var title = foodNames[match[1]] || match[1];
    return foodDescriptions[match[2]] ? title + " (" + foodDescriptions[match[2]] + ")" : title;
  }
  var housingTexts = {
    "In cities, people live in apartments and houses": "Di kota, orang tinggal di apartemen dan rumah.",
    "People live in provincial towns and villages": "Orang tinggal di kota kecil dan desa.",
    "Towns have apartment blocks and houses": "Kota kecil memiliki gedung apartemen dan rumah.",
    "People live in village houses": "Orang tinggal di rumah-rumah desa.",
    "People live in town apartments and houses": "Orang tinggal di apartemen dan rumah di kota kecil.",
    "People live in villages near grasslands": "Orang tinggal di desa dekat padang rumput.",
    "Towns have houses and apartment blocks": "Kota kecil memiliki rumah dan gedung apartemen.",
    "In villages, homes may use wood and plant materials": "Di desa, rumah dapat dibuat dari kayu dan bahan tumbuhan.",
    "People live in suburban neighborhoods": "Orang tinggal di kawasan pinggiran kota.",
    "Homes also line coastal settlements": "Rumah-rumah juga berjajar di permukiman pesisir.",
    "Homes also line riverside settlements": "Rumah-rumah juga berjajar di permukiman tepi sungai."
  };
  var climateTexts = {
    "Conditions vary widely; much of the country has a summer rainy season": "Keadaan iklim sangat beragam. Di banyak wilayah, musim hujan jatuh pada musim panas.",
    "Seasons differ between north and south": "Pergantian musim berbeda antara wilayah utara dan selatan.",
    "The rainy season varies in length from north to south": "Lama musim hujan berbeda antara wilayah utara dan selatan.",
    "Heat varies through the year": "Suhu panas berubah sepanjang tahun.",
    "Warm days are common": "Hari yang hangat sering terjadi.",
    "Many areas have wet and dry seasons": "Banyak wilayah mengalami musim hujan dan musim kemarau.",
    "Temperatures and rainy seasons differ between highlands and lowlands": "Suhu dan musim hujan berbeda antara dataran tinggi dan dataran rendah.",
    "Heat and snowfall vary by region": "Suhu panas dan turunnya salju berbeda menurut wilayah.",
    "Climate and rainy seasons vary across this large country": "Iklim dan musim hujan berbeda di berbagai wilayah negara yang luas ini.",
    "There is a rainy season and a typhoon season": "Ada musim hujan dan musim topan.",
    "Temperatures differ between highlands and lowlands": "Suhu berbeda antara dataran tinggi dan dataran rendah.",
    "Many areas have long winters": "Musim dingin berlangsung lama di banyak wilayah.",
    "Climate differs between inland and coastal areas": "Iklim berbeda antara daerah pedalaman dan pesisir.",
    "Summer and winter temperatures differ": "Suhu musim panas dan musim dingin berbeda.",
    "There is a rainy season, and winter snowfall varies by region": "Ada musim hujan. Banyaknya salju pada musim dingin berbeda menurut wilayah.",
    "Many areas have cold winters": "Musim dingin terasa dingin di banyak wilayah.",
    "Climate differs greatly between inland and coastal areas": "Iklim pedalaman dan pesisir sangat berbeda."
  };
  var greetingMeanings = { hello: "halo", welcome: "selamat datang", "good morning": "selamat pagi",
    "how are you?": "apa kabar?", "peace be upon you": "semoga damai menyertaimu" };
  function greetingLabel(value) {
    var match = /^(.*?) \((.*?)\)$/.exec(value);
    return match ? match[1] + " (" + (greetingMeanings[match[2]] || match[2]) + ")" : value;
  }
  var festivalNames = { "Independence Day": "Hari Kemerdekaan", "Republic Day": "Hari Republik",
    "National Day": "Hari Nasional", "New Year": "Tahun Baru", "Lunar New Year": "Tahun Baru Imlek",
    "Christmas": "Natal", "Easter": "Paskah", "Children's Day": "Hari Anak", "Teachers' Day": "Hari Guru",
    "Constitution Day": "Hari Konstitusi", "Democracy Day": "Hari Demokrasi", "Freedom Day": "Hari Kebebasan",
    "Victory Day": "Hari Kemenangan", "Youth Day": "Hari Pemuda", "Culture Day": "Hari Kebudayaan",
    "Flag Day": "Hari Bendera", "National Foundation Day": "Hari Berdirinya Negara",
    "Music Festival": "Festival Musik", "Sports Day": "Hari Olahraga", "Thanksgiving": "Hari Syukur",
    "Cherry blossom viewing": "Menikmati bunga sakura", "Olive harvest season": "Musim panen zaitun" };
  var languageNames = { English: "Inggris", French: "Prancis", German: "Jerman", Spanish: "Spanyol",
    Portuguese: "Portugis", Italian: "Italia", Japanese: "Jepang", Chinese: "Mandarin", Korean: "Korea",
    Arabic: "Arab", Hindi: "Hindi", Urdu: "Urdu", Bengali: "Bengali", Indonesian: "Indonesia",
    Malay: "Melayu", Dutch: "Belanda", Russian: "Rusia", Turkish: "Turki", Persian: "Persia",
    Thai: "Thai", Vietnamese: "Vietnam", Swahili: "Swahili", Greek: "Yunani", Hebrew: "Ibrani",
    Polish: "Polandia", Ukrainian: "Ukraina", Tamil: "Tamil", Filipino: "Filipina", Burmese: "Burma",
    Norwegian: "Norwegia", Swedish: "Swedia", Danish: "Denmark", Finnish: "Finlandia",
    Romanian: "Rumania", Hungarian: "Hungaria", Czech: "Ceko", Slovak: "Slowakia",
    Slovenian: "Slovenia", Croatian: "Kroasia", Serbian: "Serbia", Albanian: "Albania" };
  function name(c) {
    if (!c) return "";
    if (overrides[c.iso]) return overrides[c.iso];
    var code = iso2[c.iso];
    return regions && code ? regions.of(code) : c.name_en;
  }
  function countryValue(c, field, value) {
    if (!c || value == null) return value;
    var source = c[field] || [], translated = c[field + "_en"] || [];
    var village = field === "cities" && /の近くの村$/.test(String(value));
    var base = village ? String(value).replace(/の近くの村$/, "") : value;
    var index = source.indexOf(base);
    if (index < 0 && field === "rel") index = source.map(function (row) { return row[0]; }).indexOf(base);
    if (index < 0) return value;
    var english = translated[index];
    if (field === "rel") return religions[english && english[0]] || (english && english[0]) || "Lainnya";
    if (field === "emig") {
      var destination = (window.COUNTRIES || []).filter(function (entry) { return entry.name === base; })[0];
      return destination ? name(destination) : english;
    }
    if (field === "dis") return disasters[english] || english;
    return village ? "desa dekat " + english : english;
  }
  function culture(entry) {
    if (!entry) return entry;
    var out = {}, i;
    var cultureText = window.I18N.data.cultureText || function (kind, value) {
      if (kind === "food") return foodLabel(value);
      if (kind === "greeting") return greetingLabel(value);
      if (kind === "language") return languageNames[value] || value;
      if (kind === "festival") return festivalNames[value] || value;
      return value;
    };
    Object.keys(entry).forEach(function (key) { out[key] = entry[key]; });
    ["foods", "sports", "langs"].forEach(function (key) { if (entry[key + "_en"]) out[key] = entry[key + "_en"].slice(); });
    if (out.foods) out.foods = out.foods.map(function (value) { return cultureText("food", value); });
    if (entry.greeting_en) out.greeting = cultureText("greeting", entry.greeting_en);
    if (out.langs) out.langs = out.langs.map(function (value) { return cultureText("language", value); });
    var sport = { football: "sepak bola", soccer: "sepak bola", badminton: "bulu tangkis", basketball: "bola basket",
      volleyball: "bola voli", cricket: "kriket", swimming: "renang", cycling: "bersepeda", running: "lari" };
    if (out.sports) out.sports = out.sports.map(function (s) { return cultureText("sport", s) || sport[String(s).toLowerCase()] || s; });
    if (entry.festivals) out.festivals = entry.festivals.map(function (f) { var copy = {};
      Object.keys(f).forEach(function (key) { copy[key] = f[key]; });
      copy.name = cultureText("festival", f.name_en || f.name); return copy; });
    if (entry.housing) { out.housing = {}; Object.keys(entry.housing).forEach(function (key) { out.housing[key] = entry.housing[key]; });
      ["urban", "rural"].forEach(function (key) { var value = entry.housing[key + "_en"]; out.housing[key] = housingTexts[value] || value || entry.housing[key]; }); }
    if (entry.climate) { out.climate = {}; Object.keys(entry.climate).forEach(function (key) { out.climate[key] = entry.climate[key]; });
      out.climate.note = climateTexts[entry.climate.note_en] || entry.climate.note_en || entry.climate.note; }
    return out;
  }
  var historicalTexts = {
    "A state of emergency was declared.": "Keadaan darurat diberlakukan.",
    "Economic liberalization began.": "Kebijakan liberalisasi ekonomi dimulai.",
    "Chandrayaan-3 landed on the Moon.": "Wahana Chandrayaan-3 mendarat di Bulan.",
    "The Great Leap Forward began.": "Kebijakan Lompatan Jauh ke Depan dimulai.",
    "The reform and opening-up policy began.": "Kebijakan reformasi dan keterbukaan dimulai.",
    "Beijing hosted the Summer Olympics.": "Beijing menjadi tuan rumah Olimpiade Musim Panas.",
    "Nigeria gained independence from Britain.": "Nigeria merdeka dari Britania Raya.",
    "The Biafran War began.": "Perang Biafra dimulai.",
    "Civilian rule was restored.": "Pemerintahan sipil kembali berkuasa.",
    "The first constitution took effect, establishing a republic.": "Konstitusi pertama mulai berlaku dan republik dibentuk.",
    "East Pakistan broke away and Bangladesh gained independence.": "Pakistan Timur memisahkan diri dan Bangladesh merdeka.",
    "Severe floods struck many parts of the country.": "Banjir besar melanda banyak wilayah negara itu.",
    "The country gained independence from Belgium.": "Negara itu merdeka dari Belgia.",
    "Zaire was renamed the Democratic Republic of the Congo.": "Zaire berganti nama menjadi Republik Demokratik Kongo.",
    "The Second Congo War began.": "Perang Kongo Kedua dimulai.",
    "A military-led political upheaval took place.": "Pergolakan politik yang dipimpin militer terjadi.",
    "Suharto's rule ended.": "Pemerintahan Soeharto berakhir.",
    "An earthquake and tsunami struck off Sumatra.": "Gempa bumi dan tsunami melanda lepas pantai Sumatra.",
    "The monarchy ended.": "Sistem monarki berakhir.",
    "The Derg government collapsed.": "Pemerintahan Derg runtuh.",
    "Fighting began in the Tigray region.": "Pertempuran dimulai di wilayah Tigray.",
    "The Civil Rights Act became law.": "Undang-Undang Hak Sipil disahkan.",
    "Apollo 11 made the first human landing on the Moon.": "Apollo 11 membawa manusia mendarat di Bulan untuk pertama kalinya.",
    "The financial crisis brought a deep recession.": "Krisis keuangan memicu resesi yang berat.",
    "Bangladesh gained independence from Pakistan.": "Bangladesh merdeka dari Pakistan.",
    "A powerful cyclone struck the coast.": "Siklon kuat melanda pesisir.",
    "The Rana Plaza building collapsed.": "Gedung Rana Plaza runtuh.",
    "Military rule began.": "Pemerintahan militer dimulai.",
    "Civilian government returned.": "Pemerintahan sipil kembali berkuasa.",
    "Rio de Janeiro hosted the Summer Olympics.": "Rio de Janeiro menjadi tuan rumah Olimpiade Musim Panas.",
    "The Free Officers' revolution took place.": "Revolusi Perwira Bebas terjadi.",
    "A peace treaty was signed with Israel.": "Perjanjian damai dengan Israel ditandatangani.",
    "President Mubarak resigned after mass protests.": "Presiden Mubarak mengundurkan diri setelah unjuk rasa besar-besaran.",
    "Tanganyika gained independence.": "Tanganyika merdeka.",
    "Tanganyika and Zanzibar united.": "Tanganyika dan Zanzibar bersatu.",
    "The Chama Cha Mapinduzi party was formed.": "Partai Chama Cha Mapinduzi dibentuk.",
    "Mexico City hosted the Summer Olympics.": "Mexico City menjadi tuan rumah Olimpiade Musim Panas.",
    "A major earthquake struck Mexico City.": "Gempa bumi besar melanda Mexico City.",
    "The North American Free Trade Agreement took effect.": "Perjanjian Perdagangan Bebas Amerika Utara mulai berlaku.",
    "Martial law was declared.": "Darurat militer diberlakukan.",
    "The People Power Revolution ended Marcos's rule.": "Revolusi Kekuatan Rakyat mengakhiri pemerintahan Marcos.",
    "Typhoon Haiyan made landfall.": "Topan Haiyan menerjang daratan.",
    "Uganda gained independence from Britain.": "Uganda merdeka dari Britania Raya.",
    "A coup brought Idi Amin to power.": "Kudeta membawa Idi Amin ke tampuk kekuasaan.",
    "Yoweri Museveni came to power.": "Yoweri Museveni mulai berkuasa.",
    "Sudan gained independence from joint British and Egyptian rule.": "Sudan merdeka dari pemerintahan bersama Britania Raya dan Mesir.",
    "A coup brought Omar al-Bashir to power.": "Kudeta membawa Omar al-Bashir ke tampuk kekuasaan.",
    "South Sudan became independent.": "Sudan Selatan merdeka.",
    "Kenya gained independence from Britain.": "Kenya merdeka dari Britania Raya.",
    "A multiparty general election was held.": "Pemilihan umum multipartai digelar.",
    "A new constitution took effect.": "Konstitusi baru mulai berlaku.",
    "Soviet forces invaded.": "Pasukan Soviet menyerbu negara itu.",
    "The Taliban government fell.": "Pemerintahan Taliban jatuh.",
    "The Taliban regained power.": "Taliban kembali berkuasa.",
    "Angola gained independence from Portugal.": "Angola merdeka dari Portugal.",
    "The long civil war ended.": "Perang saudara yang panjang berakhir.",
    "President dos Santos left office.": "Presiden dos Santos mengakhiri masa jabatannya.",
    "The monarchy ended in North Yemen.": "Sistem monarki di Yaman Utara berakhir.",
    "North and South Yemen united.": "Yaman Utara dan Yaman Selatan bersatu.",
    "Foreign military intervention in the civil war began.": "Campur tangan militer asing dalam perang saudara dimulai.",
    "The Geneva Accords set a temporary north-south division.": "Perjanjian Jenewa menetapkan pemisahan sementara wilayah utara dan selatan.",
    "The Vietnam War ended.": "Perang Vietnam berakhir.",
    "The Doi Moi economic reforms began.": "Reformasi ekonomi Đổi Mới dimulai.",
    "Mozambique gained independence from Portugal.": "Mozambik merdeka dari Portugal.",
    "A peace agreement ended the civil war.": "Perjanjian damai mengakhiri perang saudara.",
    "Cyclone Idai made landfall.": "Siklon Idai menerjang daratan.",
    "The Soviet Union dissolved.": "Uni Soviet bubar.",
    "A financial crisis hit Russia.": "Krisis keuangan melanda Rusia.",
    "Sochi hosted the Winter Olympics.": "Sochi menjadi tuan rumah Olimpiade Musim Dingin.",
    "The monarchy fell and Iraq became a republic.": "Sistem monarki runtuh dan Irak menjadi republik.",
    "The Iran-Iraq War began.": "Perang Iran-Irak dimulai.",
    "A US- and UK-led coalition invaded.": "Koalisi yang dipimpin Amerika Serikat dan Britania Raya menyerbu negara itu.",
    "The Republic of South Africa was established.": "Republik Afrika Selatan didirikan.",
    "The first all-race general election was held.": "Pemilihan umum pertama yang melibatkan semua kelompok ras digelar.",
    "South Africa hosted the football World Cup.": "Afrika Selatan menjadi tuan rumah Piala Dunia sepak bola.",
    "The Iranian Revolution ended the monarchy.": "Revolusi Iran mengakhiri sistem monarki.",
    "An international agreement on Iran's nuclear program was reached.": "Kesepakatan internasional mengenai program nuklir Iran tercapai.",
    "Niger gained independence from France.": "Niger merdeka dari Prancis.",
    "A military coup took place.": "Kudeta militer terjadi.",
    "Madagascar gained independence from France.": "Madagaskar merdeka dari Prancis.",
    "A political crisis brought a change of government.": "Krisis politik menyebabkan pergantian pemerintahan.",
    "Cyclone Batsirai made landfall.": "Siklon Batsirai menerjang daratan.",
    "Côte d'Ivoire gained independence from France.": "Pantai Gading merdeka dari Prancis.",
    "A civil war began.": "Perang saudara dimulai.",
    "The political crisis after the presidential election ended.": "Krisis politik setelah pemilihan presiden berakhir.",
    "French-administered East Cameroon gained independence.": "Kamerun Timur yang dikelola Prancis merdeka.",
    "The former British Southern Cameroons joined to form a federal republic.": "Bekas wilayah Kamerun Selatan yang dikelola Britania Raya bergabung membentuk republik federal.",
    "A referendum led to a unitary state.": "Referendum menghasilkan negara kesatuan.",
    "Mali gained independence from France.": "Mali merdeka dari Prancis.",
    "Military rule ended.": "Pemerintahan militer berakhir.",
    "Fighting intensified in the north.": "Pertempuran di wilayah utara semakin sengit.",
    "Uzbekistan gained independence from the Soviet Union.": "Uzbekistan merdeka dari Uni Soviet.",
    "Founding president Islam Karimov died.": "Presiden pertama, Islam Karimov, meninggal dunia.",
    "Exchange restrictions on the som were eased.": "Pembatasan penukaran mata uang som dilonggarkan.",
    "The İzmit earthquake struck.": "Gempa bumi İzmit terjadi.",
    "A major earthquake struck the southeast.": "Gempa bumi besar melanda wilayah tenggara.",
    "Ghana gained independence from Britain.": "Ghana merdeka dari Britania Raya.",
    "Ghana became a republic.": "Ghana menjadi republik.",
    "Chad gained independence from France.": "Chad merdeka dari Prancis.",
    "Fighting in N'Djamena intensified the civil war.": "Pertempuran di N'Djamena memperparah perang saudara.",
    "A military council took power after President Idriss Déby's death.": "Dewan militer mengambil alih kekuasaan setelah Presiden Idriss Déby meninggal.",
    "Large pro-democracy protests took place.": "Unjuk rasa besar yang menuntut demokrasi berlangsung.",
    "Algeria gained independence from France.": "Aljazair merdeka dari Prancis.",
    "Protests spread across the country.": "Unjuk rasa meluas ke seluruh negeri.",
    "The president resigned after mass protests.": "Presiden mengundurkan diri setelah unjuk rasa besar-besaran.",
    "Italian and British territories united at independence.": "Wilayah yang dikelola Italia dan Britania Raya bersatu saat merdeka.",
    "Siad Barre's government collapsed.": "Pemerintahan Siad Barre runtuh.",
    "Upper Volta gained independence from France.": "Volta Hulu merdeka dari Prancis.",
    "The country was renamed Burkina Faso.": "Negara itu berganti nama menjadi Burkina Faso.",
    "President Compaoré resigned after protests.": "Presiden Compaoré mengundurkan diri setelah unjuk rasa.",
    "Zambia gained independence from Britain.": "Zambia merdeka dari Britania Raya.",
    "External debt payments were suspended.": "Pembayaran utang luar negeri ditangguhkan.",
    "A major earthquake struck Quindío.": "Gempa bumi besar melanda Quindío.",
    "The government and FARC signed a peace agreement.": "Pemerintah dan FARC menandatangani perjanjian damai.",
    "Tokyo hosted the Summer Olympics.": "Tokyo menjadi tuan rumah Olimpiade Musim Panas.",
    "The Great Hanshin earthquake struck.": "Gempa bumi besar Hanshin terjadi.",
    "The Great East Japan earthquake and tsunami struck.": "Gempa bumi dan tsunami besar melanda Jepang Timur.",
    "Malawi gained independence from Britain.": "Malawi merdeka dari Britania Raya.",
    "The first multiparty general election was held.": "Pemilihan umum multipartai pertama digelar.",
    "Cyclone Freddy caused widespread damage.": "Siklon Freddy menyebabkan kerusakan luas.",
    "Elizabeth II became queen.": "Elizabeth II menjadi ratu.",
    "A referendum approved a devolved Scottish parliament.": "Referendum menyetujui pembentukan parlemen Skotlandia dengan kewenangan tersendiri.",
    "The United Kingdom left the European Union.": "Britania Raya keluar dari Uni Eropa.",
    "The Berlin Wall was built.": "Tembok Berlin dibangun.",
    "The Berlin Wall opened.": "Tembok Berlin dibuka.",
    "East and West Germany reunited.": "Jerman Timur dan Jerman Barat bersatu kembali.",
    "The Fifth Republic began.": "Republik Kelima dimulai.",
    "Student protests grew into a nationwide strike.": "Unjuk rasa mahasiswa berkembang menjadi pemogokan nasional.",
    "France hosted the football World Cup.": "Prancis menjadi tuan rumah Piala Dunia sepak bola.",
    "Morocco gained independence from France.": "Maroko merdeka dari Prancis.",
    "Hassan II became king.": "Hassan II menjadi raja.",
    "A major earthquake struck near Marrakesh.": "Gempa bumi besar melanda daerah dekat Marrakesh.",
    "An oil embargo drove a sharp rise in world oil prices.": "Embargo minyak menyebabkan harga minyak dunia melonjak tajam.",
    "Coalition forces were stationed after Iraq invaded Kuwait.": "Pasukan koalisi ditempatkan setelah Irak menyerbu Kuwait.",
    "Women were allowed to drive.": "Perempuan diizinkan mengemudi.",
    "The Ba'ath Party took power.": "Partai Ba'ath mengambil alih kekuasaan.",
    "Civil war began after protests.": "Perang saudara dimulai setelah unjuk rasa.",
    "The Assad government collapsed.": "Pemerintahan Assad runtuh.",
    "Students protested for democracy.": "Para mahasiswa berunjuk rasa menuntut demokrasi.",
    "The Indian Ocean tsunami struck the southern coast.": "Tsunami Samudra Hindia melanda pesisir selatan.",
    "Multiparty politics returned after a democracy movement.": "Sistem multipartai kembali setelah gerakan demokrasi.",
    "The monarchy was abolished and Nepal became a republic.": "Sistem monarki dihapus dan Nepal menjadi republik.",
    "A major earthquake struck.": "Gempa bumi besar terjadi.",
    "Senegal gained independence from France.": "Senegal merdeka dari Prancis.",
    "A separatist conflict began in Casamance.": "Konflik separatis dimulai di Casamance.",
    "Power passed peacefully to the opposition for the first time.": "Kekuasaan beralih secara damai kepada pihak oposisi untuk pertama kalinya.",
    "A major earthquake struck Ancash.": "Gempa bumi besar melanda Ancash.",
    "A major earthquake struck near Pisco.": "Gempa bumi besar melanda daerah dekat Pisco.",
    "Civilian rule returned.": "Pemerintahan sipil kembali berkuasa.",
    "An economic crisis led to a sovereign debt default.": "Krisis ekonomi menyebabkan gagal bayar utang negara.",
    "Zimbabwe gained independence from Britain.": "Zimbabwe merdeka dari Britania Raya.",
    "Hyperinflation accelerated.": "Hiperinflasi semakin cepat.",
    "President Mugabe resigned.": "Presiden Mugabe mengundurkan diri.",
    "Guinea gained independence from France.": "Guinea merdeka dari Prancis.",
    "An Ebola outbreak spread.": "Wabah Ebola menyebar.",
    "Dahomey gained independence from France.": "Dahomey merdeka dari Prancis.",
    "The country was renamed Benin.": "Negara itu berganti nama menjadi Benin.",
    "A multiparty presidential election was held.": "Pemilihan presiden multipartai digelar.",
    "Burundi gained independence from Belgium.": "Burundi merdeka dari Belgia.",
    "A new constitution was approved.": "Konstitusi baru disetujui.",
    "The Federation of Malaya gained independence from Britain.": "Federasi Malaya merdeka dari Britania Raya.",
    "The Federation of Malaysia was formed.": "Federasi Malaysia dibentuk.",
    "The Asian financial crisis affected the country.": "Krisis keuangan Asia berdampak pada negara itu.",
    "Military rule ended and democratic government began.": "Pemerintahan militer berakhir dan pemerintahan demokratis dimulai.",
    "An economic crisis deepened after oil prices fell.": "Krisis ekonomi memburuk setelah harga minyak turun.",
    "Rwanda gained independence from Belgium.": "Rwanda merdeka dari Belgia.",
    "The genocide against the Tutsi took place.": "Genosida terhadap orang Tutsi terjadi.",
    "Kazakhstan gained independence from the Soviet Union.": "Kazakhstan merdeka dari Uni Soviet.",
    "The capital moved from Almaty to Akmola.": "Ibu kota dipindahkan dari Almaty ke Akmola.",
    "Protests over fuel prices grew into nationwide unrest.": "Unjuk rasa soal harga bahan bakar meluas menjadi kerusuhan nasional.",
    "A peace agreement ended the long civil war.": "Perjanjian damai mengakhiri perang saudara yang panjang.",
    "Rome hosted the Summer Olympics.": "Roma menjadi tuan rumah Olimpiade Musim Panas.",
    "A major corruption investigation began.": "Penyelidikan besar mengenai korupsi dimulai.",
    "An earthquake struck L'Aquila.": "Gempa bumi melanda L'Aquila.",
    "Canada marked its centennial and Montreal hosted Expo 67.": "Kanada memperingati seratus tahun berdirinya negara itu dan Montreal menjadi tuan rumah Expo 67.",
    "The constitution was patriated from the British Parliament.": "Kewenangan atas konstitusi dialihkan dari Parlemen Britania Raya ke Kanada.",
    "Vancouver hosted the Winter Olympics.": "Vancouver menjadi tuan rumah Olimpiade Musim Dingin.",
    "The Khmer Rouge took power.": "Khmer Merah mengambil alih kekuasaan.",
    "The Paris Peace Agreements were signed.": "Perjanjian Perdamaian Paris ditandatangani.",
    "A general election was held under UN supervision.": "Pemilihan umum digelar di bawah pengawasan PBB.",
    "South Sudan gained independence from Sudan.": "Sudan Selatan merdeka dari Sudan.",
    "A peace agreement aimed at ending the civil war was signed.": "Perjanjian damai untuk mengakhiri perang saudara ditandatangani.",
    "The Korean War began.": "Perang Korea dimulai.",
    "An armistice was signed in the Korean War.": "Gencatan senjata dalam Perang Korea ditandatangani.",
    "Kim Il Sung died.": "Kim Il Sung meninggal dunia.",
    "Democratization advanced after Franco's death.": "Demokratisasi berlanjut setelah Franco meninggal dunia.",
    "Spain hosted the football World Cup.": "Spanyol menjadi tuan rumah Piala Dunia sepak bola.",
    "Barcelona hosted the Summer Olympics.": "Barcelona menjadi tuan rumah Olimpiade Musim Panas.",
    "A referendum approved constitutional changes concerning Indigenous Australians.": "Referendum menyetujui perubahan konstitusi terkait penduduk asli Australia.",
    "Sydney hosted the Summer Olympics.": "Sydney menjadi tuan rumah Olimpiade Musim Panas.",
    "Major bushfires broke out across the country.": "Kebakaran semak besar terjadi di berbagai wilayah negara itu."
  };
  function factText(f) {
    var s = String(f.t_en || ""), m;
    if (!s && typeof f.stat === "string" && f.stat) return f.stat;
    if ((m = /^Life expectancy rose by ([\d.]+) years between (\d+) and (\d+)\.$/.exec(s)))
      return "Harapan hidup naik " + m[1] + " tahun antara " + m[2] + " dan " + m[3] + ".";
    if ((m = /^Life expectancy fell by ([\d.]+) years between (\d+) and (\d+)\.$/.exec(s)))
      return "Harapan hidup turun " + m[1] + " tahun antara " + m[2] + " dan " + m[3] + ".";
    if ((m = /^Real GDP per person changed by a factor of ([\d.]+) between (\d+) and (\d+)\.$/.exec(s)))
      return "PDB riil per orang berubah menjadi " + m[1] + " kali lipat antara " + m[2] + " dan " + m[3] + ".";
    if ((m = /^Population changed from ([\d,]+) in (\d+) to ([\d,]+) in (\d+)\.$/.exec(s)))
      return "Jumlah penduduk berubah dari " + I.number(Number(m[1].replace(/,/g, ""))) + " pada " + m[2] + " menjadi " + I.number(Number(m[3].replace(/,/g, ""))) + " pada " + m[4] + ".";
    if ((m = /^The share of children dying before age five changed from ([\d.]+)% in (\d+) to ([\d.]+)% in (\d+)\.$/.exec(s)))
      return "Angka kematian anak sebelum usia lima tahun berubah dari " + m[1] + "% pada " + m[2] + " menjadi " + m[3] + "% pada " + m[4] + ".";
    if ((m = /^The UN projects the population will (grow|shrink) by about ([\d.]+)% from (\d+) to (\d+)\.$/.exec(s)))
      return "Menurut proyeksi PBB, jumlah penduduk akan " + (m[1] === "grow" ? "bertambah" : "berkurang") + " sekitar " + m[2] + "% dari " + m[3] + " hingga " + m[4] + ".";
    return historicalTexts[s] || "Peristiwa sejarah dicatat pada tahun " + f.y + ".";
  }
  function factSource(f) {
    var source = String(f.src_en || "");
    if (/World Population Prospects/.test(source)) return "Proyeksi Penduduk Dunia PBB 2024 (melalui Our World in Data)";
    if (/child mortality/.test(source)) return "Perkiraan kematian anak PBB (melalui Our World in Data)";
    if (/Maddison/.test(source)) return "Maddison Project (melalui Our World in Data)";
    return "Catatan peristiwa sejarah";
  }
  var joyPhrases = {
    "building peaceful time with family": "menikmati waktu tenang bersama keluarga",
    "keeping opportunities to learn open for children": "membuka kesempatan belajar bagi anak-anak",
    "seeing familiar faces at a local gathering": "bertemu wajah-wajah yang dikenal di acara warga",
    "conversation over coffee": "mengobrol sambil minum kopi",
    "pausing for a cup of tea": "beristirahat sambil minum teh",
    "the busy hours of the morning market": "ramainya pasar pada pagi hari",
    "the morning journey to work": "perjalanan berangkat kerja pada pagi hari",
    "brief conversations at midday break": "obrolan singkat saat istirahat siang",
    "family supper after sunset": "makan malam bersama keluarga seusai matahari terbenam",
    "buying ingredients on the way home from work": "membeli bahan makanan sepulang kerja",
    "the evening hours of preparing dinner": "waktu menyiapkan makan malam",
    "helping children with homework at night": "menemani anak mengerjakan tugas sekolah pada malam hari",
    "pausing over a favorite drink": "menikmati minuman kesukaan sejenak",
    "evening prayer or a quiet moment alone": "berdoa pada malam hari atau menikmati waktu sendiri",
    "weekend washing and household tasks": "mencuci dan mengurus rumah pada akhir pekan",
    "stopping by a neighborhood shop": "mampir ke toko dekat rumah",
    "talking with a friend in the shade": "mengobrol dengan teman di tempat teduh",
    "making a secure home for loved ones": "membangun rumah yang aman bagi orang tercinta",
    "passing music and stories to family": "mewariskan musik dan cerita kepada keluarga",
    "passing a learned skill to someone younger": "mengajarkan keterampilan kepada yang lebih muda",
    "sharing what one has grown": "berbagi hasil tanaman sendiri",
    "resting in a nearby park": "beristirahat di taman dekat rumah",
    "keeping a connection to home": "menjaga hubungan dengan kampung halaman",
    "drawing strength from faith or prayer": "mendapat kekuatan dari iman atau doa",
    "helping friends and neighbors": "membantu teman dan tetangga",
    "learning again to open a new path": "belajar lagi agar ada pilihan baru",
    "a short chat with neighbors": "mengobrol sebentar dengan tetangga",
    "stepping outside after rain": "keluar rumah sesudah hujan",
    "saving bit by bit for the future": "menyisihkan uang sedikit demi sedikit untuk masa depan",
    "caring for the land for the next generation": "merawat tanah bagi generasi berikutnya",
    "days spent preparing fields as seasons change": "menyiapkan ladang saat musim berganti",
    "time around the table with family": "waktu makan bersama keluarga",
    "doing one's work with care": "mengerjakan pekerjaan dengan sungguh-sungguh",
    "being someone the community can rely on": "menjadi orang yang dapat diandalkan warga",
    "telling family about the day after coming home": "bercerita kepada keluarga setelah pulang",
    "catching up with friends": "bertukar kabar dengan teman",
    "an afternoon with friends at home": "menghabiskan sore bersama teman di rumah",
    "making dinner with children": "memasak makan malam bersama anak-anak",
    "choosing seasonal food at the market": "memilih bahan makanan musiman di pasar",
    "the bustle when relatives visit": "ramainya rumah saat kerabat datang",
    "a walk in the sea breeze": "berjalan-jalan sambil menikmati angin laut",
    "teaching a song to a child": "mengajari anak sebuah lagu",
    "sharing freshly baked bread": "berbagi roti yang baru matang",
    "playing cards with friends": "bermain kartu bersama teman",
    "quiet reading on a day off": "membaca dengan tenang pada hari libur",
    "cooking with a friend": "memasak bersama teman",
    "watching a television program together": "menonton acara televisi bersama",
    "an old favorite song on the radio": "mendengar lagu lama kesukaan di radio",
    "a walk around the neighborhood at dusk": "berjalan-jalan di sekitar rumah menjelang malam",
    "looking through photos with family": "melihat foto-foto lama bersama keluarga",
    "humming a favorite song": "bersenandung lagu kesukaan",
    "tidying up with music playing": "beres-beres sambil mendengarkan musik",
    "tending a garden or potted plants": "merawat kebun atau tanaman dalam pot",
    "walking a road with a view of the hills": "berjalan menyusuri jalan dengan pemandangan bukit",
    "talking while doing handwork": "mengobrol sambil mengerjakan kerajinan",
    "spending time with friends under the cherry blossoms": "berkumpul bersama teman di bawah pohon sakura"
  };
  var sports = { football: "sepak bola", cricket: "kriket", badminton: "bulu tangkis", basketball: "bola basket",
    baseball: "bisbol", "ice hockey": "hoki es", skiing: "ski", "rugby union": "rugbi",
    "table tennis": "tenis meja", "distance running": "lari jarak jauh", wrestling: "gulat",
    "water polo": "polo air" };
  function joyText(item) {
    var source = String(item && item.en || ""), match, result = joyPhrases[source];
    if (!result && (match = /^sharing (.+) with family or friends$/.exec(source))) result = "berbagi " + match[1] + " bersama keluarga atau teman";
    if (!result && (match = /^enjoying (.+) with friends$/.exec(source))) result = "menikmati " + (sports[match[1]] || match[1]) + " bersama teman";
    if (!result && (match = /^marking (.+) with family or friends$/.exec(source))) result = "merayakan " + match[1] + " bersama keluarga atau teman";
    if (!result) result = "menikmati kegiatan sehari-hari bersama orang terdekat";
    var key = "joy." + source;
    if (I.dictionaries.id[key] === undefined) { var row = {}; row[key] = result; I.add({ id: row }); }
    return I.t(key);
  }
  I.add({ id: {
    "memory.scene.place": "Kamu berjalan bersama {person} melewati {detail} sambil memperhatikan suasana sekitar.",
    "memory.scene.festival": "Saat {detail}, kamu dan {person} ikut berkumpul di {city}.",
    "memory.scene.food": "Kamu dan {person} menikmati {detail} bersama.",
    "memory.scene.sport": "Kamu menonton {detail} bersama {person} di {city}.",
    "memory.scene.friend": "Kamu berjalan pulang bersama temanmu, {person}, sambil mengobrol.",
    "memory.scene.visit": "Kamu pergi ke {detail} bersama {person} lalu mengobrol dalam perjalanan pulang.",
    "memory.wish": "ingin {action}",
    "memory.wishFallback": "mewujudkan cita-citamu",
    "memory.dreamLine": "Di {city}, kamu bercerita kepada {person} bahwa kamu {wish}."
  } });
  I.data = { countryName: name, countryValue: countryValue, cultureOf: culture,
    formatVars: function (key, vars) {
      if (!vars || !/^(?:engine\.everyday\.(?:rain|heat|cold)\.|engine\.culture\.weather\.|engine\.frequent\.pattern\.3$)/.test(key)) return vars;
      var month = Number(vars.month);
      if (!Number.isInteger(month) || month < 1 || month > 12) return vars;
      var formatted = {};
      Object.keys(vars).forEach(function (field) { formatted[field] = vars[field]; });
      formatted.month = new Intl.DateTimeFormat("id-ID", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2000, month - 1, 1)));
      return formatted;
    },
    joyText: joyText,
    memoryScene: function (kind, values) { return I.t("memory.scene." + (I.dictionaries.id["memory.scene." + kind] ? kind : "visit"), values); },
    memoryWish: function (wish) { return I.t("memory.wish", { action: I.dreamAction ? I.dreamAction(wish.key) : I.t("memory.wishFallback") }); },
    memoryDreamLine: function (values) { return I.t("memory.dreamLine", values); },
    dataName: function (value) {
      var c = (window.COUNTRIES || []).filter(function (entry) { return entry.name === value || entry.name_en === value; })[0];
      return c ? name(c) : disasters[value] || value;
    },
    factText: factText, factSource: factSource,
    causeName: function (cause) { return cause ? causes[cause[0]] || "penyakit lain" : ""; },
    causePhrase: function (cause) { return String(cause || ""); } };
  I.add({ id: {
    "app.suicideContext": "Bunuh diri dapat dipengaruhi banyak keadaan. Tidak tepat menyalahkan satu orang.",
    "app.crisisSupport": "Jika kamu sedang kesulitan, bicaralah dengan orang yang kamu percaya atau layanan bantuan setempat. Jika ada bahaya mendesak, hubungi layanan darurat setempat.",
    "app.findSupport": "Cari layanan bantuan setempat", "app.safetySupport": "Bantuan tetap tersedia setelah mengalami kekerasan.",
    "app.survivorCare": "Orang yang ditinggalkan juga boleh mencari dukungan saat berduka atau merasa bingung.",
    "app.checkupDeferredCare": "Pemeriksaan kesehatan bisa menjadi kesempatan untuk membicarakan pengobatan yang sempat tertunda.",
    "app.reportCare": "Kesehatan dan perawatan", "app.healthSupportAid": "Menggunakan alat bantu",
    "app.healthSupportCommunity": "Meminta bantuan praktis dari orang terdekat",
    "app.lateCareHome": "Menanyakan bantuan perawatan di rumah",
    "app.lateCareHospice": "Menanyakan perawatan paliatif",
    "map.world": "Peta dunia", "map.unknown": "Negara tidak diketahui",
    "map.circle": "Ukuran lingkaran", "map.birthShare": "{country} · {share}% kelahiran dunia (1 dari {ratio})",
    "map.underThreshold": "{country} · kurang dari 0,01% kelahiran dunia",
    "app.theme.auto": "Tampilan: otomatis", "app.theme.light": "Tampilan: terang", "app.theme.dark": "Tampilan: gelap"
  } });
}());
