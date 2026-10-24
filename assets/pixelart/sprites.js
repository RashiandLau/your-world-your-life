/* Original, recolourable pixel sprites. ES5, no image assets or canvas transforms. */
(function (root) {
  "use strict";

  /* A space is transparent; each other character is looked up in the caller's colours. */
  var HAIR = {
    buzz: ["  KKKKKKKK  ", " KKKKKKKKKK ", " KK      KK "],
    short: ["   KKKKKKK  ", " KKKKKKKKKKK", " KK KKK  KK "],
    sidepart: [" KKKKKKKKKK ", " KKKKKKKKKK ", " KK      K  "],
    crop: ["  KKKKKKKKK ", " KKKKKKKKKKK", " K K K K  KK"],
    curls: [" K KK K KK K", "KKKKKKKKKKKK", "KKK KKK KKKK", "K          K"],
    afro: ["  KKKKKKKK  ", " KKKKKKKKKK ", "KKKKKKKKKKKK", "KKKKKKKKKKKK", "KK        KK"],
    bob: ["  KKKKKKKK  ", " KKKKKKKKKK ", " K        K ", " K        K ", "KK        KK", "KK        KK"],
    long: ["  KKKKKKKK  ", " KKKKKKKKKK ", " K        K ", " K        K ", " K        K ", " K        K ", " K        K ", " K        K "],
    braid: ["  KKKKKKKK  ", " KKKKKKKKKK ", " K        K ", " K        K ", " K        K ", " K        K ", " K        K ", " K        K ", " K        K ", " K        K "],
    bun: ["      KKK   ", "  KKKKKKKK  ", " KKKKKKKKKK ", " K        K "],
    ponytail: ["  KKKKKKKK  ", " KKKKKKKKKKK", " K        KK", "          KK", "          KK", "          KK"],
    locs: ["  KKKKKKKK  ", " KKKKKKKKKK ", " KK      KK ", " K        K ", " K K      K ", " K K      K ", " K K      K ", " K K      K "],
    waves: ["   KKKKKKK  ", " KKKKKKKKKKK", " KK KKK  KK ", " K        K "],
    bald: ["            "]
  };
  var HEADWEAR = {
    cap: ["   CCCCCCCC   ", "  CCCCCCCCCC  ", " CCCCCCCCCCCC ", "CCCCCCCCCCCCCC"],
    headscarf: ["   CCCCCCCC   ", "  CCCCCCCCCC  ", " CCC      CCC ", " CC        CC ", " CC        CC ", " CC        CC ", " CC        CC ", " CC        CC ", " CC        CC ", " CC        CC "],
    hijab: ["   CCCCCCCC   ", "  CCCCCCCCCC  ", " CCC      CCC ", " CC        CC ", " CC        CC ", " CC        CC ", " CC        CC ", " CCC      CCC ", "  CCCCCCCCCC  ", "  CCCCCCCCCC  "],
    turban: ["   CCCCCCCC   ", "  CCCCCCCCCC  ", " CCTCCCCCTCC ", "  CCCCCCCCCC  ", "   CCCCCCCC   "],
    sunhat: ["    CCCCCCC   ", "   CCCCCCCCC  ", "   CCCCCCCCC  ", "CCCCCCCCCCCCCC"],
    helmet: ["   CCCCCCCC   ", "  CCCCCCCCCC  ", " CCCCCCCCCCCC ", " CCTTTTTTTTCC ", " CC        CC "],
    beanie: ["     CCCC     ", "   CCCCCCCC   ", "  CCCCCCCCCC  ", "  CCTTTTTTCC  "],
    graduation: ["   CCCCCCCC   ", "CCCCCCCCCCCCCC", "     CCCC     ", "     CCCC     "]
  };
  var ACCESSORIES = {
    glasses: ["E EEE  EEE E", "EEE E  E EEE", " EEE    EEE "],
    cane: [" CC", "  C", "  C", "  C", "  C", "  C", "  C", "  C", "  C", "  C", "  C", " CCC"],
    bag: ["  CC   ", " C  C  ", "CCCCCC ", "CTTTTC ", "CCCCCC ", "CCCCCC "],
    phone: ["CCCC", "CTTC", "CTTC", "CTTC", "CCCC"],
    babyCarrier: ["CC      CC", " CC    CC ", "  CCCCC C ", "  C SS C  ", "  C SS C  ", "  CCCCC C ", "   CCCCC  "],
    necklace: [" C      C ", "  C    C  ", "   CCCC   ", "    TT    "],
    scarf: ["CCCCCCCCCC", "TTTTTTTTTT", "   CC     ", "   CC     "]
  };
  var MOTIFS = {
    plain: ["            "],
    buttons: ["     T      ", "     T      ", "     T      ", "     T      "],
    collar: ["  TT    TT  ", "   TT  TT   ", "    TTTT    "],
    tie: ["   TT  TT   ", "    TTTT    ", "     TT     ", "     TT     ", "     TT     ", "    TTTT    "],
    apron: ["  QQQQQQQQ  ", "  QQQQQQQQ  ", "  QQQQQQQQ  ", "  QQQQQQQQ  ", "  QQQQQQQQ  ", "  QQTTTTQQ  "],
    vest: ["  QQ    QQ  ", "  QQ    QQ  ", "  QQ    QQ  ", "  QQ TT QQ  ", "  QQQQQQQQ  "],
    jacket: ["  QQ    QQ  ", "  QQ    QQ  ", "  QQ TT QQ  ", "  QQ    QQ  ", "  QQ TT QQ  "],
    robe: [" QQQ    QQQ ", "  QQ    QQ  ", "   QQ  QQ   ", "    QQQQ    ", "    QQQQ    "],
    drape: [" QQQQ       ", " QQQQQ      ", "  QQQQQ     ", "   QQQQQ    ", "    QQQQQ   ", "     QQQQQ  "],
    stripe: [" TTTTTTTTTT ", "            ", " TTTTTTTTTT ", "            ", " TTTTTTTTTT "],
    sash: [" QQQQ       ", "  QQQQ      ", "   QQQQ     ", "    QQQQ    ", "     QQQQ   "],
    crosses: ["   TT  TT   ", "   TT  TT   ", "            ", "   TT  TT   "],
    safety: [" TTTTTTTTTT ", " QQQQQQQQQQ ", " TTTTTTTTTT "],
    pockets: [" QQ      QQ ", " QT      TQ ", " QQQ    QQQ "]
  };

  /* Named garments are data records. The motif uses the same pixels at any colour. */
  var OUTFITS = {
    casual: { color: "#587E9A", shade: "#34566F", trim: "#D7E4E4", cut: "shirt", motif: "plain" },
    casualBright: { color: "#CF755B", shade: "#A34F48", trim: "#EEC493", cut: "shirt", motif: "stripe" },
    sweater: { color: "#7E638B", shade: "#5B4969", trim: "#BEACC9", cut: "shirt", motif: "collar" },
    schoolUniform: { color: "#405B81", shade: "#2C3E60", trim: "#F0E8D5", cut: "shirt", motif: "collar" },
    universityJacket: { color: "#5D6E70", shade: "#384C4F", trim: "#E5DBBE", cut: "jacket", motif: "jacket" },
    officeSuit: { color: "#46566C", shade: "#29384C", trim: "#EAE9DE", cut: "jacket", motif: "tie" },
    officeBlouse: { color: "#E9E3D6", shade: "#B4B3B0", trim: "#678C96", cut: "shirt", motif: "buttons" },
    farmWork: { color: "#8D6A47", shade: "#674D36", trim: "#D6AE6D", cut: "shirt", motif: "pockets" },
    fisher: { color: "#3B788C", shade: "#275969", trim: "#CED7C2", cut: "shirt", motif: "stripe" },
    marketApron: { color: "#B76F4E", shade: "#8C523A", trim: "#E8CBA3", cut: "apron", motif: "apron" },
    factoryCoveralls: { color: "#5B7D80", shade: "#3B5A60", trim: "#D4B065", cut: "jacket", motif: "safety" },
    constructionVest: { color: "#C6943F", shade: "#8B672D", trim: "#F4D988", cut: "vest", motif: "safety" },
    medicalCoat: { color: "#F0F1E9", shade: "#B9C9C6", trim: "#64A3A9", cut: "jacket", motif: "jacket" },
    scrubs: { color: "#629FA1", shade: "#417C83", trim: "#B8DDCF", cut: "shirt", motif: "pockets" },
    militaryUniform: { color: "#6F775C", shade: "#4F5944", trim: "#C7BFA1", cut: "jacket", motif: "pockets" },
    ceremonialRobe: { color: "#63537E", shade: "#43395F", trim: "#D0B976", cut: "robe", motif: "robe" },
    modestTunic: { color: "#6F8A82", shade: "#4B665F", trim: "#D2BB91", cut: "robe", motif: "collar" },
    sari: { color: "#B66368", shade: "#843F4B", trim: "#E2B569", cut: "drape", motif: "drape" },
    salwarKameez: { color: "#6978A4", shade: "#475781", trim: "#DCC681", cut: "robe", motif: "sash" },
    kurta: { color: "#DBBE8A", shade: "#A88660", trim: "#F1E1B6", cut: "robe", motif: "buttons" },
    hanbok: { color: "#A45F76", shade: "#744259", trim: "#E4C59C", cut: "robe", motif: "sash" },
    kimono: { color: "#697BA7", shade: "#495B82", trim: "#E1C77E", cut: "robe", motif: "sash" },
    aoDai: { color: "#8B79A5", shade: "#665986", trim: "#DCCBBA", cut: "robe", motif: "buttons" },
    kaftan: { color: "#8F8660", shade: "#655F47", trim: "#DEC791", cut: "robe", motif: "collar" },
    poncho: { color: "#AA6956", shade: "#7B4A40", trim: "#DEB97A", cut: "wide", motif: "stripe" },
    weddingIvory: { color: "#EEE1C9", shade: "#C1AA91", trim: "#E0BE75", cut: "dress", motif: "sash" },
    weddingRed: { color: "#B94D57", shade: "#863642", trim: "#E5B764", cut: "dress", motif: "drape" },
    weddingBlue: { color: "#496D8F", shade: "#2B4F72", trim: "#DBBF8A", cut: "jacket", motif: "collar" },
    funeralDark: { color: "#434851", shade: "#2D3038", trim: "#A2A6A0", cut: "jacket", motif: "plain" },
    funeralWhite: { color: "#E8E8DD", shade: "#BABCB1", trim: "#D2C5A8", cut: "robe", motif: "plain" },
    raincoat: { color: "#D3A943", shade: "#9E7831", trim: "#F5D889", cut: "jacket", motif: "buttons" },
    winterCoat: { color: "#5D6B78", shade: "#3B4959", trim: "#B2B8B5", cut: "jacket", motif: "buttons" }
  };
  var BODY_TYPES = {
    petite: { shoulders: 10, waist: 8, legs: 3 },
    slender: { shoulders: 11, waist: 8, legs: 3 },
    average: { shoulders: 12, waist: 10, legs: 4 },
    broad: { shoulders: 15, waist: 12, legs: 4 },
    stocky: { shoulders: 14, waist: 14, legs: 4 },
    rounded: { shoulders: 13, waist: 15, legs: 4 },
    athletic: { shoulders: 15, waist: 9, legs: 4 },
    tall: { shoulders: 12, waist: 10, legs: 4 }
  };
  var AGE_STAGES = ["baby", "toddler", "child", "teen", "adult", "middleAge", "elder"];
  var AGE_HEIGHT = { baby: 13, toddler: 19, child: 25, teen: 33, adult: 39, middleAge: 38, elder: 36 };
  var SKIN_TONES = ["#F3D6BE", "#E8BC9C", "#D69E79", "#BB805D", "#956447", "#724A36", "#563828", "#3C2A23"];
  var GROUP_SKIN = {
    sa: [1, 5], ea: [0, 4], jp: [0, 3], kr: [0, 3], wa: [3, 7], ca: [3, 7], ea_af: [2, 7],
    me: [1, 5], tr: [0, 5], se: [1, 5], la: [1, 6], we: [0, 6], ru: [0, 4], eu: [0, 6], cas: [0, 5], pac: [1, 7]
  };
  var HAIR_NAMES = Object.keys(HAIR), BODY_NAMES = Object.keys(BODY_TYPES);

  function rect(ctx, x, y, w, h, color) {
    if (w <= 0 || h <= 0 || !color) return;
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }
  function hash(value) {
    var str = String(value == null ? "0" : value), h = 2166136261, i;
    for (i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul ? Math.imul(h, 16777619) : (h * 16777619); }
    return h >>> 0;
  }
  function shade(hex, amount) {
    var n = parseInt(String(hex).slice(1), 16), r, g, b;
    if (isNaN(n)) return hex;
    r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amount));
    g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amount));
    b = Math.max(0, Math.min(255, (n & 255) + amount));
    return "#" + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  function spriteRows(name) {
    if (!name) return null;
    if (HAIR[name]) return HAIR[name];
    if (HEADWEAR[name]) return HEADWEAR[name];
    if (ACCESSORIES[name]) return ACCESSORIES[name];
    return MOTIFS[name] || null;
  }
  function drawRows(ctx, rows, x, y, scale, colors) {
    var row, col, run, ch, i, j, width;
    if (!rows) return;
    scale = scale || 1;
    colors = colors || {};
    for (i = 0; i < rows.length; i++) {
      row = rows[i];
      for (j = 0; j < row.length;) {
        ch = row.charAt(j);
        if (ch === " " || !colors[ch]) { j++; continue; }
        run = j + 1;
        while (run < row.length && row.charAt(run) === ch) run++;
        width = run - j;
        rect(ctx, x + j * scale, y + i * scale, width * scale, scale, colors[ch]);
        j = run;
      }
    }
  }
  function drawSprite(ctx, name, x, y, scale, colors) {
    drawRows(ctx, spriteRows(name), x, y, scale, colors);
  }
  function stageFor(age) {
    if (typeof age === "string" && AGE_HEIGHT[age]) return age;
    age = Number(age) || 0;
    return age < 1 ? "baby" : age < 4 ? "toddler" : age < 13 ? "child" : age < 18 ? "teen" : age < 45 ? "adult" : age < 70 ? "middleAge" : "elder";
  }
  function choice(list, seed) { return list[hash(seed) % list.length]; }
  function chooseOutfit(p, o, stage, grp, seed) {
    var place = o.place || p.place || "", weather = o.weather || p.weather || "";
    if (p.outfit && OUTFITS[p.outfit]) return p.outfit;
    if (o.outfit && OUTFITS[o.outfit]) return o.outfit;
    if (/funeral|cemetery/.test(place)) return grp === "sa" || grp === "ea" ? "funeralWhite" : "funeralDark";
    if (/wedding/.test(place)) return grp === "sa" || grp === "ea" ? "weddingRed" : (p.sex === "f" ? "weddingIvory" : "weddingBlue");
    if (/school/.test(place) && (stage === "child" || stage === "teen")) return "schoolUniform";
    if (/university/.test(place)) return "universityJacket";
    if (/clinic|hospital/.test(place)) return hash(seed) % 2 ? "scrubs" : "medicalCoat";
    if (/factory/.test(place)) return "factoryCoveralls";
    if (/construction/.test(place)) return "constructionVest";
    if (/field|rice|plantation|farm/.test(place)) return "farmWork";
    if (/fishing|boat/.test(place)) return "fisher";
    if (/market|shop/.test(place)) return "marketApron";
    if (/office/.test(place)) return p.sex === "f" ? "officeBlouse" : "officeSuit";
    if (/mosque|church|temple|shrine/.test(place)) return "ceremonialRobe";
    if (/rain|monsoon/.test(weather)) return "raincoat";
    if (/snow/.test(weather)) return "winterCoat";
    if (grp === "sa") return choice(["sari", "salwarKameez", "kurta", "casual"], seed);
    if (grp === "jp") return choice(["casual", "casualBright", "kimono"], seed);
    if (grp === "kr") return choice(["casual", "casualBright", "hanbok"], seed);
    if (grp === "se") return choice(["casual", "aoDai", "modestTunic"], seed);
    if (grp === "me" || grp === "tr") return choice(["casual", "kaftan", "modestTunic"], seed);
    if (grp === "la") return choice(["casual", "poncho", "casualBright"], seed);
    return choice(["casual", "casualBright", "sweater"], seed);
  }
  function expression(ctx, left, top, width, mood, face, ink, frame) {
    var eyeY = top + 5, mid = left + Math.floor(width / 2), eyeL = left + 3, eyeR = left + width - 4, mouthY = top + 9;
    if (mood === "tired" || frame === 3) { rect(ctx, eyeL, eyeY, 2, 1, ink); rect(ctx, eyeR - 1, eyeY, 2, 1, ink); }
    else if (mood === "crying") { rect(ctx, eyeL, eyeY, 1, 1, ink); rect(ctx, eyeR, eyeY, 1, 1, ink); rect(ctx, eyeL, eyeY + 2, 1, 3, "#80B3C7"); rect(ctx, eyeR, eyeY + 2, 1, 3, "#80B3C7"); }
    else if (mood === "surprised") { rect(ctx, eyeL, eyeY, 2, 2, ink); rect(ctx, eyeR - 1, eyeY, 2, 2, ink); }
    else { rect(ctx, eyeL, eyeY, 1, 1, ink); rect(ctx, eyeR, eyeY, 1, 1, ink); }
    if (mood === "smile" || mood === "laughing") {
      rect(ctx, mid - 2, mouthY, 1, 1, ink); rect(ctx, mid - 1, mouthY + 1, 3, mood === "laughing" ? 2 : 1, "#914C53"); rect(ctx, mid + 2, mouthY, 1, 1, ink);
    } else if (mood === "sad" || mood === "crying") {
      rect(ctx, mid - 2, mouthY + 1, 1, 1, ink); rect(ctx, mid - 1, mouthY, 3, 1, "#914C53"); rect(ctx, mid + 2, mouthY + 1, 1, 1, ink);
    } else if (mood === "surprised") rect(ctx, mid, mouthY, 2, 2, "#914C53");
    else rect(ctx, mid - 1, mouthY, 3, 1, mood === "tired" ? face : "#914C53");
  }
  function drawPerson(ctx, x, ground, person, opts, palette) {
    var p = person || {}, o = opts || {}, pal = palette || {}, stage = stageFor(p.age != null ? p.age : o.age),
      height = AGE_HEIGHT[stage], seed = String(p.seed != null ? p.seed : (o.seed != null ? o.seed : ground)) + ":" + Math.round(x),
      grp = p.grp || o.grp || "", range = GROUP_SKIN[grp] || [0, 7],
      skin = p.skin || o.skin || SKIN_TONES[range[0] + hash(seed + ":skin") % (range[1] - range[0] + 1)],
      hair = p.hair || o.hair || (stage === "elder" ? "#A9AAA4" : choice(["#252027", "#37251E", "#4C3325", "#674630", "#9B6F43"], seed + ":haircolor")),
      bodyName = p.bodyType || o.bodyType || choice(BODY_NAMES, seed + ":body"), body = BODY_TYPES[bodyName] || BODY_TYPES.average,
      outfitName = chooseOutfit(p, o, stage, grp, seed), garment = OUTFITS[outfitName],
      main = p.clothesColor || o.clothesColor || (pal.outfit && pal.outfit.main) || garment.color,
      trim = (pal.outfit && pal.outfit.trim) || garment.trim, dark = shade(main, -29),
      trousers = p.trousers || (garment.cut === "dress" || garment.cut === "robe" || garment.cut === "drape" ? garment.shade : "#43546A"),
      left = Math.round(x - 6), top = Math.round(ground - height), headW = stage === "baby" ? 8 : stage === "toddler" ? 9 : stage === "child" ? 10 : 12,
      headLeft = Math.round(x - headW / 2), headTop = top + (stage === "baby" ? 1 : 2), headH = stage === "baby" ? 7 : stage === "toddler" ? 9 : stage === "child" ? 10 : 12,
      torsoTop = headTop + headH, shoulderW = Math.min(body.shoulders, stage === "baby" ? 9 : stage === "toddler" ? 10 : stage === "child" ? 11 : 16),
      shoulderX = Math.round(x - shoulderW / 2), legH = stage === "baby" ? 0 : stage === "toddler" ? 4 : stage === "child" ? 6 : stage === "teen" ? 9 : 11,
      bodyBottom = Math.round(ground - legH - 1), bodyH = Math.max(3, bodyBottom - torsoTop),
      hairName = p.hairStyle || o.hairStyle || choice(HAIR_NAMES, seed + ":style"),
      headwear = p.headwear || o.headwear || "", mood = p.expression || o.expression || "neutral",
      accessories = p.accessories || o.accessories || [], frame = o.frame || p.frame || 0,
      motifX = Math.round(x - 6), i, acc, armY, shoeY;
    if (typeof hairName === "number") hairName = HAIR_NAMES[((hairName % HAIR_NAMES.length) + HAIR_NAMES.length) % HAIR_NAMES.length];
    if (typeof accessories === "string") accessories = [accessories];
    if (stage === "baby") {
      armY = torsoTop;
      rect(ctx, x - 6, ground - 5, 12, 5, trim);
      rect(ctx, x - 5, ground - 6, 10, 4, main);
    } else {
      /* Split legs, shoes, arms and a silhouette selected from body data. */
      rect(ctx, x - body.legs - 1, bodyBottom, body.legs, legH, trousers);
      rect(ctx, x + 1, bodyBottom, body.legs, legH, shade(trousers, -15));
      shoeY = ground - 2;
      rect(ctx, x - body.legs - 2, shoeY, body.legs + 2, 2, "#373840");
      rect(ctx, x + 1, shoeY, body.legs + 2, 2, "#30353A");
      rect(ctx, shoulderX, torsoTop, shoulderW, Math.max(3, bodyH - 3), dark);
      rect(ctx, x - Math.floor(body.waist / 2), torsoTop + 3, body.waist, Math.max(2, bodyH - 3), main);
      rect(ctx, shoulderX + 1, torsoTop, shoulderW - 2, 3, main);
      if (garment.cut === "wide" || garment.cut === "robe" || garment.cut === "dress" || garment.cut === "drape") {
        rect(ctx, x - Math.max(6, Math.floor(body.waist / 2)), bodyBottom - 5, Math.max(12, body.waist), 5, main);
        rect(ctx, x + Math.max(4, Math.floor(body.waist / 2)) - 1, bodyBottom - 5, 2, 5, dark);
      }
      armY = torsoTop + 2 + (frame % 2 === 1 ? 1 : 0);
      rect(ctx, shoulderX - 3, armY, 3, Math.max(3, bodyH - 5), main);
      rect(ctx, shoulderX + shoulderW, armY, 3, Math.max(3, bodyH - 5), dark);
      rect(ctx, shoulderX - 3, armY + Math.max(3, bodyH - 5), 3, 2, skin);
      rect(ctx, shoulderX + shoulderW, armY + Math.max(3, bodyH - 5), 3, 2, skin);
      drawRows(ctx, MOTIFS[garment.motif], motifX, torsoTop + 1, 1, { Q: garment.shade, T: trim });
    }
    /* Head has its own outline, two highlights, hair and optional headwear. */
    rect(ctx, headLeft - 1, headTop + 1, headW + 2, headH - 1, shade(skin, -34));
    rect(ctx, headLeft, headTop + 1, headW, headH - 2, skin);
    rect(ctx, headLeft + 1, headTop + 2, 1, Math.max(2, headH - 5), shade(skin, 18));
    rect(ctx, headLeft + headW - 2, headTop + 3, 1, Math.max(2, headH - 6), shade(skin, -19));
    if (stage !== "baby" && stage !== "toddler") expression(ctx, headLeft, headTop, headW, mood, shade(skin, -27), "#2D2730", frame);
    else { rect(ctx, headLeft + 2, headTop + 5, 1, 1, "#2D2730"); rect(ctx, headLeft + headW - 3, headTop + 5, 1, 1, "#2D2730"); }
    if (!headwear || headwear === "cap" || headwear === "sunhat" || headwear === "beanie") drawSprite(ctx, hairName, x - 6, headTop - 2, 1, { K: hair });
    if (headwear && HEADWEAR[headwear]) drawSprite(ctx, headwear, x - 7, headTop - 3, 1, { C: p.headwearColor || o.headwearColor || trim, T: main });
    for (i = 0; i < accessories.length; i++) {
      acc = accessories[i];
      if (acc === "glasses") drawSprite(ctx, "glasses", x - 6, headTop + 4, 1, { E: "#39424B" });
      else if (acc === "cane") drawSprite(ctx, "cane", x + shoulderW / 2 + 3, ground - 12, 1, { C: "#77563B" });
      else if (acc === "bag") drawSprite(ctx, "bag", x + shoulderW / 2 + 2, torsoTop + 2, 1, { C: "#725647", T: "#C59A6C" });
      else if (acc === "phone") drawSprite(ctx, "phone", x + shoulderW / 2 + 2, armY + 2, 1, { C: "#343D45", T: "#88B5C4" });
      else if (acc === "babyCarrier" || acc === "baby_carrier") drawSprite(ctx, "babyCarrier", x - 5, torsoTop + 3, 1, { C: "#9A6A65", S: skin });
      else if (acc === "necklace") drawSprite(ctx, "necklace", x - 4, torsoTop, 1, { C: "#B99A57", T: "#E7D89E" });
      else if (acc === "scarf") drawSprite(ctx, "scarf", x - 5, torsoTop, 1, { C: trim, T: dark });
    }
  }
  function drawPersonScene(ctx, x, ground, opts, palette, random) {
    var p = opts || {}, extra = { grp: p.grp, place: p.place, weather: p.weather, seed: p.seed, frame: p.frame };
    if (typeof random === "function" && p.seed == null) extra.seed = Math.floor(random() * 1000000000);
    drawPerson(ctx, x, ground, p, extra, palette);
  }
  function drawPortrait(ctx, opts, palette) {
    var p = opts || {}, pal = palette || {}, stage = stageFor(p.age), grp = p.grp || "",
      seed = String(p.seed != null ? p.seed : 1), range = GROUP_SKIN[grp] || [0, 7],
      skin = p.skin || SKIN_TONES[range[0] + hash(seed + ":portrait-skin") % (range[1] - range[0] + 1)],
      light = shade(skin, 20), shadow = shade(skin, -27), deep = shade(skin, -44),
      hair = p.hair || (stage === "elder" ? "#ADB0AB" : choice(["#211C22", "#33241E", "#50372A", "#755036", "#A67645"], seed + ":portrait-hair")),
      hairStyle = p.hairStyle || choice(HAIR_NAMES, seed + ":portrait-style"),
      outfitName = chooseOutfit(p, p, stage, grp, seed), garment = OUTFITS[outfitName],
      main = p.clothesColor || (pal.outfit && pal.outfit.main) || garment.color,
      trim = (pal.outfit && pal.outfit.trim) || garment.trim,
      mood = p.expression || "neutral", headwear = p.headwear || "", acc = p.accessories || [],
      eye = p.eyeColor || choice(["#30282B", "#493B32", "#68523B"], seed + ":eyes"), i;
    if (typeof hairStyle === "number") hairStyle = HAIR_NAMES[((hairStyle % HAIR_NAMES.length) + HAIR_NAMES.length) % HAIR_NAMES.length];
    if (typeof acc === "string") acc = [acc];
    /* Bust: shoulder shape, collar, fabric folds and a small neck shadow. */
    rect(ctx, 4, 45, 40, 11, garment.shade);
    rect(ctx, 7, 39, 34, 17, main);
    rect(ctx, 10, 36, 28, 20, main);
    rect(ctx, 4, 47, 6, 9, shade(main, -19));
    rect(ctx, 39, 47, 5, 9, shade(main, -25));
    rect(ctx, 21, 34, 7, 7, shadow);
    rect(ctx, 22, 34, 5, 5, skin);
    rect(ctx, 19, 38, 4, 5, trim);
    rect(ctx, 27, 38, 4, 5, trim);
    drawRows(ctx, MOTIFS[garment.motif], 12, 43, 2, { Q: garment.shade, T: trim });
    if (stage === "baby") {
      rect(ctx, 5, 40, 38, 16, "#e6e4d4");
      rect(ctx, 9, 39, 30, 17, "#b6cdd0");
      rect(ctx, 13, 41, 22, 15, "#d9e4dc");
      rect(ctx, 20, 43, 8, 2, "#f4ece0");
    } else if (stage === "toddler") {
      rect(ctx, 8, 43, 32, 13, main);
      rect(ctx, 11, 43, 26, 3, trim);
    }
    if (garment.cut === "robe" || garment.cut === "drape" || garment.cut === "dress") {
      rect(ctx, 8, 51, 32, 5, main);
      rect(ctx, 8, 53, 32, 1, trim);
    }
    /* Ears, softened jaw, cheek highlights and nose give the large portrait its own detail. */
    rect(ctx, 11, 19, 3, 11, shadow); rect(ctx, 35, 19, 3, 11, shadow);
    rect(ctx, 13, 11, 23, 22, deep);
    rect(ctx, 14, 10, 21, 22, skin);
    rect(ctx, 16, 31, 17, 3, skin);
    rect(ctx, 19, 33, 11, 2, shadow);
    rect(ctx, 15, 14, 3, 13, light);
    rect(ctx, 32, 18, 2, 10, shadow);
    rect(ctx, 23, 23, 2, 5, shadow);
    rect(ctx, 21, 28, 5, 1, light);
    if (stage === "elder") { rect(ctx, 15, 27, 3, 1, shadow); rect(ctx, 31, 27, 3, 1, shadow); }
    if (stage === "baby" || stage === "toddler") {
      rect(ctx, 17, 22, 2, 2, eye); rect(ctx, 30, 22, 2, 2, eye);
      rect(ctx, 23, 29, 3, 1, "#9A5D60");
    } else {
      rect(ctx, 17, 20, 5, 1, hair); rect(ctx, 28, 20, 5, 1, hair);
      if (mood === "tired") { rect(ctx, 18, 23, 4, 1, shadow); rect(ctx, 28, 23, 4, 1, shadow); }
      else if (mood === "surprised") { rect(ctx, 18, 22, 3, 3, eye); rect(ctx, 29, 22, 3, 3, eye); }
      else { rect(ctx, 18, 22, 3, 2, eye); rect(ctx, 29, 22, 3, 2, eye); }
      if (mood === "crying") { rect(ctx, 18, 25, 1, 6, "#81BACB"); rect(ctx, 31, 25, 1, 6, "#81BACB"); }
      if (mood === "smile" || mood === "laughing") {
        rect(ctx, 20, 30, 2, 1, "#985455"); rect(ctx, 22, 31, 6, mood === "laughing" ? 3 : 1, "#985455"); rect(ctx, 28, 30, 2, 1, "#985455");
        if (mood === "laughing") rect(ctx, 23, 31, 4, 1, "#F1D9C8");
      } else if (mood === "sad" || mood === "crying") {
        rect(ctx, 20, 32, 2, 1, "#985455"); rect(ctx, 22, 30, 6, 1, "#985455"); rect(ctx, 28, 32, 2, 1, "#985455");
      } else if (mood === "surprised") rect(ctx, 23, 30, 4, 3, "#985455");
      else rect(ctx, 22, 31, 6, 1, "#985455");
    }
    if (!headwear || headwear === "cap" || headwear === "sunhat" || headwear === "beanie") {
      if (stage === "baby") rect(ctx, 18, 8, 12, 2, hair);
      else drawSprite(ctx, hairStyle, 12, 6, 2, { K: hair });
      if (/^(long|braid|bob|locs|ponytail)$/.test(hairStyle)) {
        rect(ctx, 12, 21, 2, 18, hair);
        rect(ctx, 35, 21, 2, 18, hair);
        if (hairStyle === "braid" || hairStyle === "locs") { rect(ctx, 12, 31, 2, 2, shade(hair, 20)); rect(ctx, 35, 34, 2, 2, shade(hair, 20)); }
      }
    }
    if (headwear && HEADWEAR[headwear]) drawSprite(ctx, headwear, 10, 4, 2, { C: p.headwearColor || trim, T: main });
    for (i = 0; i < acc.length; i++) {
      if (acc[i] === "glasses") drawSprite(ctx, "glasses", 12, 21, 2, { E: "#3C454E" });
      else if (acc[i] === "necklace") drawSprite(ctx, "necklace", 15, 38, 2, { C: "#BE9D5C", T: "#E6D59B" });
      else if (acc[i] === "scarf") drawSprite(ctx, "scarf", 15, 38, 2, { C: trim, T: garment.shade });
    }
  }
  var api = {
    drawPerson: drawPerson, drawPortrait: drawPortrait, drawSprite: drawSprite, drawRows: drawRows, stageFor: stageFor,
    hair: HAIR, headwear: HEADWEAR, accessories: ACCESSORIES, motifs: MOTIFS,
    outfits: OUTFITS, bodyTypes: BODY_TYPES, ageStages: AGE_STAGES, skinTones: SKIN_TONES,
    counts: { hair: HAIR_NAMES.length, headwear: Object.keys(HEADWEAR).length, accessories: Object.keys(ACCESSORIES).length,
      outfits: Object.keys(OUTFITS).length, bodyTypes: BODY_NAMES.length, ageStages: AGE_STAGES.length }
  };
  root.PIXELART_DATA = api;
  root.PIXELART_SPRITES = { drawPerson: drawPersonScene, drawSprite: drawSprite, data: api };
}(window));
