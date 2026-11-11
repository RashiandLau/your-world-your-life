/* Indonesian pilot-era notes. Loaded after id.js on /id/ only. */
(function () {
  "use strict";
  var I = window.I18N;
  if (!I || I.lang !== "id" || !I.data) return;
  function numeric(source) {
    var m;
    if ((m = /^In (\d{4}), there were ([\d.]+) fixed-line subscriptions per 100 people, not a household coverage rate\.$/.exec(source)))
      return "Pada " + m[1] + ", terdapat " + m[2] + " langganan telepon rumah per 100 penduduk; angka ini bukan persentase rumah yang memilikinya.";
    if ((m = /^In (\d{4}), there were ([\d.]+) mobile subscriptions per 100 people, not a share of owners\.$/.exec(source)))
      return "Pada " + m[1] + ", terdapat " + m[2] + " langganan telepon genggam per 100 penduduk; angka ini bukan persentase pemiliknya.";
    if ((m = /^In (\d{4}), about ([\d.]+)% of people used the internet nationwide\.$/.exec(source)))
      return "Pada " + m[1] + ", sekitar " + m[2] + "% penduduk menggunakan internet secara nasional.";
    if ((m = /^In (\d{4}), less than ([\d.]+)% of people used the internet nationwide\.$/.exec(source)))
      return "Pada " + m[1] + ", kurang dari " + m[2] + "% penduduk menggunakan internet secara nasional.";
    if ((m = /^In (\d{4}), about ([\d.]+)% of people nationally had access to electricity; access varied by area\.$/.exec(source)))
      return "Pada " + m[1] + ", sekitar " + m[2] + "% penduduk memiliki akses listrik secara nasional; aksesnya berbeda menurut daerah.";
    if ((m = /^In (\d{4}), about ([\d.]+)% of rural residents had access to electricity; this is a rural population estimate\.$/.exec(source)))
      return "Pada " + m[1] + ", sekitar " + m[2] + "% penduduk desa memiliki akses listrik; angka ini merupakan perkiraan untuk seluruh penduduk desa.";
    if ((m = /^In (\d{4}), about ([\d.]+)% of workers were in agriculture, an ILO modeled estimate\.$/.exec(source)))
      return "Pada " + m[1] + ", sekitar " + m[2] + "% pekerja bekerja di bidang pertanian, menurut perkiraan model ILO.";
    if ((m = /^In (\d{4}), about ([\d.]+)% of residents lived in rural areas; urban and rural settings differed\.$/.exec(source)))
      return "Pada " + m[1] + ", sekitar " + m[2] + "% penduduk tinggal di desa; kehidupan di kota dan desa berbeda.";
    if ((m = /^In (\d{4}), about ([\d.]+)% of people lived in rural areas\. This national figure does not describe one household\.$/.exec(source)))
      return "Pada " + m[1] + ", sekitar " + m[2] + "% penduduk tinggal di desa. Angka nasional ini tidak menggambarkan satu keluarga tertentu.";
    if ((m = /^In (\d{4}), an estimated ([\d.]+)% of people lived in rural areas\. Stories can take place in towns or villages\.$/.exec(source)))
      return "Pada " + m[1] + ", diperkirakan " + m[2] + "% penduduk tinggal di desa. Kisah dapat berlangsung di kota atau desa.";
    if ((m = /^In (\d{4}), an estimated ([\d.]+)% of the population lived in rural areas\. This national figure does not describe a single household\.$/.exec(source)))
      return "Pada " + m[1] + ", diperkirakan " + m[2] + "% penduduk tinggal di desa. Angka nasional ini tidak menggambarkan satu keluarga tertentu.";
    if ((m = /^In (\d{4}), about ([\d.]+)% of people lived in rural areas\. This national share does not describe an individual household\.$/.exec(source)))
      return "Pada " + m[1] + ", sekitar " + m[2] + "% penduduk tinggal di desa. Persentase nasional ini tidak menggambarkan satu keluarga tertentu.";
    if ((m = /^The official primary school starting age was (\d+) in (\d{4})\.$/.exec(source)))
      return "Pada " + m[2] + ", usia resmi masuk sekolah dasar adalah " + m[1] + " tahun.";
    if ((m = /^The country profile records internet use of ([\d.]+)% in (\d{4}) and ([\d.]+)% in (\d{4})(; individual access differs)?\.$/.exec(source)))
      return "Profil negara mencatat penggunaan internet sebesar " + m[1] + "% pada " + m[2] + " dan " + m[3] + "% pada " + m[4] + (m[5] ? "; akses tiap orang dapat berbeda." : ".");
    if ((m = /^The share of households with a television rose from ([\d.]+)% in (\d{4}) to ([\d.]+)% in (\d{4})\.$/.exec(source)))
      return "Persentase rumah tangga yang memiliki televisi naik dari " + m[1] + "% pada " + m[2] + " menjadi " + m[3] + "% pada " + m[4] + ".";
    if ((m = /^Gross secondary enrolment rose from ([\d.]+)% in (\d{4}) to ([\d.]+)% in (\d{4})\.$/.exec(source)))
      return "Angka partisipasi kasar sekolah menengah naik dari " + m[1] + "% pada " + m[2] + " menjadi " + m[3] + "% pada " + m[4] + ".";
    if ((m = /^Gross secondary enrolment was ([\d.]+)% in (\d{4}) and ([\d.]+)% in (\d{4})\.$/.exec(source)))
      return "Angka partisipasi kasar sekolah menengah adalah " + m[1] + "% pada " + m[2] + " dan " + m[3] + "% pada " + m[4] + ".";
    if ((m = /^The country profile records ([\d.]+) mobile subscriptions per 100 people in (\d{4}) and ([\d.]+) in (\d{4})\.$/.exec(source)))
      return "Profil negara mencatat " + m[1] + " langganan telepon genggam per 100 penduduk pada " + m[2] + " dan " + m[3] + " pada " + m[4] + ".";
    if ((m = /^A country profile records ([\d.]+) mobile subscriptions per 100 people in (\d{4}) and ([\d.]+) in (\d{4}); subscriptions are not owners\.$/.exec(source)))
      return "Profil negara mencatat " + m[1] + " langganan telepon genggam per 100 penduduk pada " + m[2] + " dan " + m[3] + " pada " + m[4] + "; jumlah langganan bukan jumlah pemilik.";
    if ((m = /^The country profile shows ([\d.]+) mobile subscriptions per 100 people in (\d{4}) and ([\d.]+) in (\d{4}); multiple subscriptions count\.$/.exec(source)))
      return "Profil negara menunjukkan " + m[1] + " langganan telepon genggam per 100 penduduk pada " + m[2] + " dan " + m[3] + " pada " + m[4] + "; seorang pelanggan dapat memiliki lebih dari satu langganan.";
    if ((m = /^The country profile records ([\d.]+) mobile subscriptions per 100 people in (\d{4}) and ([\d.]+) in (\d{4}), including multiple subscriptions\.$/.exec(source)))
      return "Profil negara mencatat " + m[1] + " langganan telepon genggam per 100 penduduk pada " + m[2] + " dan " + m[3] + " pada " + m[4] + ", termasuk beberapa langganan milik orang yang sama.";
    if ((m = /^About ([\d.]+)% of the population lived in rural areas in (\d{4})\. Daily life varied between and within towns and villages\.$/.exec(source)))
      return "Sekitar " + m[1] + "% penduduk tinggal di desa pada " + m[2] + ". Keseharian berbeda antara kota dan desa, juga di dalam masing-masing tempat.";
    if ((m = /^About ([\d.]+)% of the population was rural in (\d{4}); rural life still (?:differs(?: by region)?|varies)\.$/.exec(source)))
      return "Sekitar " + m[1] + "% penduduk tinggal di desa pada " + m[2] + "; kehidupan desa tetap berbeda menurut daerah.";
    if ((m = /^In (\d{4}), ([\d.]+)% of homes had electricity nationally, compared with ([\d.]+)% in Chiapas and ([\d.]+)% in the Federal District\.$/.exec(source)))
      return "Pada " + m[1] + ", " + m[2] + "% rumah memiliki listrik secara nasional, dibandingkan dengan " + m[3] + "% di Chiapas dan " + m[4] + "% di Distrik Federal.";
    if ((m = /^In the (\d{4})s, worker mobility also changed who shared a home\.$/.exec(source)))
      return "Pada dekade " + m[1] + "-an, perpindahan pekerja turut mengubah siapa yang tinggal serumah.";
    if ((m = /^A (\d{4}) country study describes Bali's subak groups jointly coordinating irrigation and planting\.$/.exec(source)))
      return "Kajian negara pada " + m[1] + " menggambarkan kelompok subak di Bali yang bersama-sama mengatur pengairan dan penanaman.";
    if ((m = /^A (\d{4}) country study records migrants who kept ties to home villages after moving to large cities\.$/.exec(source)))
      return "Kajian negara pada " + m[1] + " mencatat pendatang yang tetap berhubungan dengan desa asal setelah pindah ke kota besar.";
    if ((m = /^In one (\d{4})s literacy project for rural women, learning also took place in temples and parts of homes\.$/.exec(source)))
      return "Dalam sebuah program belajar membaca bagi perempuan desa pada dekade " + m[1] + "-an, kegiatan belajar juga berlangsung di kuil dan bagian rumah.";
    if ((m = /^Educational opportunities expanded after (\d{4}), though access varied by place and family\.$/.exec(source)))
      return "Kesempatan belajar meluas setelah " + m[1] + ", meski aksesnya berbeda menurut tempat dan keluarga.";
    if ((m = /^In the (\d{4}) time-use survey, people averaged (\d+) hour (\d+) minutes eating and drinking and (\d+) hours (\d+) minute on household activities\.$/.exec(source)))
      return "Dalam survei penggunaan waktu " + m[1] + ", rata-rata orang memakai " + m[2] + " jam " + m[3] + " menit untuk makan dan minum, serta " + m[4] + " jam " + m[5] + " menit untuk kegiatan rumah tangga.";
    if ((m = /^The (\d{4}) time-use survey covers people aged (\d+)\+ and distinguishes urban and rural settings\.$/.exec(source)))
      return "Survei penggunaan waktu " + m[1] + " mencakup orang berusia " + m[2] + " tahun ke atas serta membedakan kota dan desa.";
    if ((m = /^In the (\d{4}) survey, people aged (\d+) and older averaged (\d+) hours (\d+) minutes of sleep a day\.$/.exec(source)))
      return "Dalam survei " + m[1] + ", orang berusia " + m[2] + " tahun ke atas tidur rata-rata " + m[3] + " jam " + m[4] + " menit sehari.";
    if ((m = /^In the (\d{4}) time-use survey, people aged (\d+)\+ averaged (\d+) hours (\d+) minutes a day on housework and family care\.$/.exec(source)))
      return "Dalam survei penggunaan waktu " + m[1] + ", orang berusia " + m[2] + " tahun ke atas menghabiskan rata-rata " + m[3] + " jam " + m[4] + " menit sehari untuk pekerjaan rumah dan merawat keluarga.";
    return "";
  }
  function patterned(source) {
    var m, food = { flatbread: "roti pipih", "rice noodles": "mi beras", soup: "sup",
      "rice dish": "hidangan nasi", millet: "jewawut", rice: "nasi" };
    if ((m = /^A household might share (.+); meals vary by place and means\.$/.exec(source)))
      return "Sebuah keluarga mungkin makan " + (food[m[1]] || m[1]) + " bersama; hidangannya berbeda menurut tempat dan kemampuan.";
    if ((m = /^A household might serve (.+); meals vary by region and family\.$/.exec(source)))
      return "Sebuah keluarga mungkin menyajikan " + m[1] + "; hidangannya berbeda menurut daerah dan keluarga.";
    if ((m = /^If someone leaves for work in (.+), include how they contact those at home\.$/.exec(source)))
      return "Jika seseorang pergi bekerja ke " + m[1] + ", pertimbangkan cara ia tetap menghubungi orang di rumah.";
    return "";
  }
  var exact = {
    "A household meal may centre on rice or flatbread; staples vary by region.":
      "Sebuah keluarga mungkin makan nasi atau roti pipih sebagai makanan pokok; pilihannya berbeda menurut daerah.",
    "Staples differ by region; decide the household's meal before writing a scene.":
      "Makanan pokok berbeda menurut daerah. Hidangan keluarga ini bergantung pada tempat tinggalnya.",
    "Even at a rice-centred meal, side dishes vary by island and household.":
      "Walaupun nasi menjadi makanan pokok, lauknya berbeda menurut pulau dan keluarga.",
    "Staples and ways of sharing food vary by region and household.":
      "Makanan pokok dan cara makan bersama berbeda menurut daerah dan keluarga.",
    "Beans and rice can anchor a meal, but menus vary by region and means.":
      "Kacang dan nasi mungkin menjadi hidangan utama, tetapi menu berbeda menurut daerah dan kemampuan keluarga.",
    "For an everyday bread purchase, establish the town and household means.":
      "Kebiasaan membeli roti sehari-hari bergantung pada kota dan kemampuan keluarga.",
    "A radio gathering is plausible, with adoption varying by region and means.":
      "Keluarga mungkin berkumpul mendengarkan radio, tetapi kepemilikannya berbeda menurut daerah dan kemampuan.",
    "Some households might have a radio while others might not.":
      "Sebagian rumah mungkin memiliki radio, sebagian lainnya belum.",
    "A radio scene is an estimate; check whether the home has electricity.":
      "Kehadiran radio di rumah ini adalah perkiraan; ketersediaan listrik juga perlu diperhatikan.",
    "Distinguish homes with and without radio.":
      "Sebagian rumah memiliki radio, sebagian lainnya tidak.",
    "Check the home's equipment before giving it a radio.":
      "Ketersediaan radio bergantung pada perlengkapan di rumah ini.",
    "A radio in the daily soundscape is an estimate.":
      "Suara radio dalam keseharian keluarga ini adalah perkiraan.",
    "The time radio reached a home varied by place and means.":
      "Waktu sebuah keluarga mulai memiliki radio berbeda menurut tempat dan kemampuan.",
    "Make a radio scene fit the household's equipment.":
      "Keberadaan radio bergantung pada perlengkapan keluarga ini.",
    "Show households with and without a radio.":
      "Ada keluarga yang memiliki radio dan ada yang belum.",
    "A household might gather around a radio; ownership is not assumed.":
      "Sebuah keluarga mungkin berkumpul mendengarkan radio; kepemilikannya tidak bisa dianggap pasti.",
    "Place radios and televisions according to the home and year.":
      "Ketersediaan radio dan televisi bergantung pada rumah serta tahunnya.",
    "Set the year and home before adding radio or television.":
      "Ketersediaan radio atau televisi bergantung pada tahun dan keadaan rumah.",
    "Show households with and without television separately.":
      "Sebagian rumah memiliki televisi, sebagian lainnya belum.",
    "Check whether a household has access to television.":
      "Akses televisi berbeda antar keluarga.",
    "Distinguish households with and without television.":
      "Ada keluarga yang memiliki televisi dan ada yang belum.",
    "A television scene should reflect island and urban differences.":
      "Akses televisi berbeda antar pulau serta antara kota dan desa.",
    "Do not assign television to every home.":
      "Tidak setiap rumah memiliki televisi.",
    "Whether a family watched television together varied by household.":
      "Kebiasaan menonton televisi bersama berbeda antar keluarga.",
    "Whether a family gathered around television depended on its equipment.":
      "Keluarga dapat berkumpul menonton televisi jika perlengkapannya tersedia.",
    "Regional differences in electricity access may also have affected opportunities to watch television.":
      "Perbedaan akses listrik antar daerah mungkin turut memengaruhi kesempatan menonton televisi.",
    "A television scene needs electricity and reception.":
      "Menonton televisi memerlukan listrik dan penerimaan siaran.",
    "Scenes can include households with and without television.":
      "Sebagian keluarga memiliki televisi, sebagian lainnya tidak.",
    "Whether a family gathers around evening television depends on the home.":
      "Kebiasaan menonton televisi bersama pada malam hari bergantung pada keadaan rumah.",
    "Whether the home gathers around evening television depends on the household.":
      "Kebiasaan menonton televisi bersama pada malam hari berbeda antar keluarga.",
    "A family might wait for news from a relative working in town.":
      "Sebuah keluarga mungkin menunggu kabar dari kerabat yang bekerja di kota.",
    "Do not give village and city jobs the same daily routine.":
      "Keseharian pekerjaan di desa dan di kota bisa berbeda.",
    "A rice-field scene might include neighbours discussing when to work.":
      "Di dekat sawah, tetangga mungkin membicarakan waktu mulai bekerja.",
    "Do not give household and town work the same schedule.":
      "Pekerjaan rumah dan pekerjaan di kota dapat memiliki jadwal berbeda.",
    "Change commute and workplace talk between city and rural settings.":
      "Perjalanan kerja dan percakapan di tempat kerja berbeda antara kota dan desa.",
    "Give rural and urban work different travel and work rhythms.":
      "Irama kerja dan perjalanan di desa bisa berbeda dari kota.",
    "Shape contact with a relative who moved to a city around the family's means.":
      "Cara menghubungi kerabat yang pindah ke kota bergantung pada kemampuan keluarga.",
    "For someone moving to town for work, choose how they keep in touch with family.":
      "Orang yang pindah ke kota untuk bekerja perlu mencari cara agar tetap berhubungan dengan keluarga.",
    "A worker might stop at a shop or go straight home.":
      "Sepulang kerja, seseorang mungkin mampir ke toko atau langsung pulang.",
    "The journey to work changes with the location of the town or village.":
      "Perjalanan ke tempat kerja bergantung pada letak kota atau desa.",
    "Mobile phones spread during this period, but access differed by household.":
      "Telepon genggam semakin banyak digunakan pada masa ini, tetapi aksesnya berbeda antar keluarga.",
    "A conversation over a meal or at a nearby shop is possible; meals vary by locality.":
      "Percakapan mungkin terjadi saat makan atau di toko sekitar; hidangannya berbeda menurut tempat.",
    "A school day might overlap with household errands; the trip to school varies by place.":
      "Hari sekolah mungkin beriringan dengan pekerjaan rumah; perjalanan ke sekolah berbeda menurut tempat.",
    "Sharing chores after school depends greatly on the household.":
      "Pembagian pekerjaan rumah sepulang sekolah sangat bergantung pada keluarga.",
    "Give city and rural pupils different routes to school.":
      "Jalan ke sekolah bagi murid di kota dan desa bisa berbeda.",
    "School experience varies by state and district; establish the location first.":
      "Pengalaman sekolah berbeda menurut negara bagian dan daerah.",
    "Distance to school and the language of instruction can differ between town and rural settings.":
      "Jarak sekolah dan bahasa pengantar dapat berbeda antara kota dan desa.",
    "Set the journey to school and classroom language for the particular place.":
      "Perjalanan ke sekolah dan bahasa di kelas bergantung pada tempatnya.",
    "After-school time depends on travel distance and chores.":
      "Waktu sepulang sekolah bergantung pada jarak perjalanan dan pekerjaan rumah.",
    "Set the state and household before writing school or work talk.":
      "Pengalaman sekolah dan kerja bergantung pada daerah serta keadaan keluarga.",
    "Homes and household forms vary by place and means.":
      "Bentuk rumah dan susunan keluarga berbeda menurut tempat dan kemampuan.",
    "Some families moved to cities while others stayed rural; avoid one housing pattern.":
      "Sebagian keluarga pindah ke kota, sementara yang lain tetap di desa; keadaan tempat tinggal tidak selalu sama.",
    "A Nile-side town and village offer different surroundings for a home.":
      "Lingkungan rumah di kota dan desa dekat Sungai Nil bisa berbeda.",
    "The trip to school or shops differs between a village and a city home.":
      "Perjalanan ke sekolah atau toko berbeda antara rumah di desa dan di kota.",
    "Show distinct town and rural settings.":
      "Lingkungan kota dan desa memiliki keadaan yang berbeda.",
    "Distinguish town row houses and apartments from homes in rural areas.":
      "Rumah berjajar dan apartemen di kota berbeda dari rumah di desa.",
    "A town apartment and village home create different trips to school and shops.":
      "Dari apartemen di kota dan rumah di desa, perjalanan ke sekolah serta toko dapat berbeda.",
    "A home telephone could be central to contact, depending on the household.":
      "Telepon rumah mungkin menjadi sarana penting untuk berhubungan, bergantung pada keluarga.",
    "Before arranging an online conversation, check whether access is available.":
      "Percakapan lewat internet hanya mungkin jika aksesnya tersedia.",
    "Check the year and household before giving a character internet access.":
      "Akses internet bergantung pada tahun dan keadaan keluarga."
  };
  I.data.pilotNote = function (source) {
    var translated = numeric(source) || patterned(source) || exact[source] || "";
    return translated.replace(/(\d)\.(\d)/g, "$1,$2");
  };
}());
