/* Original procedural pixel scenes. Coordinates are native 320 x 112 pixels. */
(function () {
  "use strict";
  var W = 320, H = 112;
  var places = [
    "home", "home_old", "hut", "mud_brick", "tin_roof", "concrete_block", "apartment", "townhouse", "villa",
    "school", "university", "field", "rice_paddy", "plantation", "farm_animals", "fishing_boat",
    "market", "street", "shop", "factory", "office", "construction", "hospital", "clinic",
    "mosque", "church", "temple", "shrine", "refugee_camp", "bus", "train", "airport",
    "beach", "mountain_village", "desert_village", "snowy_town", "megacity_skyline",
    "wedding_hall", "wedding", "cemetery", "funeral", "park", "stadium", "graduation"
  ];
  var PLACE_SET = {};
  var i;
  for (i = 0; i < places.length; i++) PLACE_SET[places[i]] = true;

  function px(c, x, y, w, h, color) {
    if (w > 0 && h > 0) { c.fillStyle = color; c.fillRect(x | 0, y | 0, w | 0, h | 0); }
  }
  function rng(seed) {
    var n = (seed >>> 0) || 1;
    return function () { n ^= n << 13; n ^= n >>> 17; n ^= n << 5; return (n >>> 0) / 4294967296; };
  }
  function fallbackPalette() {
    return { sky: "#99c9d8", skyLow: "#d3e5db", far: "#8eaaa0", mid: "#749687", ground: "#8ba969", groundDark: "#63835a", building: "#d6bea0", roof: "#936c61", trim: "#f2e2c6", leaf: "#4f865c", water: "#6baabd", light: "#f8d98c", shadow: "#536778", weather: "#d2e4e5" };
  }
  function palette(o) {
    var api = window.PIXELART_PALETTE;
    var p = api && api.forScene ? api.forScene(o) : null;
    if (!p) p = fallbackPalette();
    return p;
  }
  function sun(c, o, p, r) {
    var night = p.mode === "night" || o.time === "night", x = 259, y = night ? 17 : 19;
    px(c, 0, 0, W, 38, p.sky);
    px(c, 0, 38, W, 29, p.skyLow || p.sky);
    if (night) {
      px(c, x, y, 13, 13, p.light);
      px(c, x + 9, y - 3, 8, 12, p.sky);
      for (var s = 0; s < 20; s++) px(c, (r() * W) | 0, (r() * 45) | 0, s % 4 ? 1 : 2, 1, p.light);
    } else {
      px(c, x + 4, y - 4, 14, 2, p.light); px(c, x, y - 2, 22, 12, p.light);
      px(c, x + 4, y + 10, 14, 2, p.light);
      var f = (o.frame || 0) * 2;
      cloud(c, (28 + f) % 335 - 15, 13, p.trim, p.weather);
      cloud(c, (141 + f) % 346 - 26, 28, p.trim, p.weather);
    }
  }
  function cloud(c, x, y, a, b) {
    px(c, x + 9, y, 19, 3, a); px(c, x + 4, y + 3, 33, 5, a);
    px(c, x, y + 8, 45, 5, a); px(c, x + 5, y + 13, 33, 2, b);
  }
  function hill(c, x, y, w, h, color) {
    px(c, x + (w * 0.3) | 0, y, (w * 0.4) | 0, 4, color);
    px(c, x + (w * 0.16) | 0, y + 4, (w * 0.68) | 0, 7, color);
    px(c, x, y + 11, w, h - 11, color);
  }
  function farGround(c, o, p, r) {
    var grp = o.grp || "", urban = o.urban || /^(megacity_skyline|street|office|apartment|factory|train|airport)$/.test(o.place || "");
    if (urban) {
      for (var k = 0; k < 15; k++) {
        var bx = k * 23 - 4, bh = 18 + ((k * 17 + (o.seed || 1)) % 24);
        px(c, bx, 69 - bh, 18, bh, k % 3 ? p.far : p.mid);
        for (var q = 0; q < 3; q++) px(c, bx + 3 + q * 5, 73 - bh + (q % 2) * 8, 2, 3, p.skyLow);
      }
    } else if (/^(pac|la)$/.test(grp) || o.place === "beach" || o.place === "fishing_boat") {
      px(c, 0, 52, W, 20, p.water);
      for (k = 0; k < 11; k++) px(c, k * 32 + 7, 62 + k % 3, 14, 1, p.skyLow);
    } else if (/^(ru|cas|eu|jp|kr)$/.test(grp) || /^(mountain_village|snowy_town)$/.test(o.place || "")) {
      for (k = 0; k < 6; k++) {
        hill(c, k * 57 - 18, 47 + k % 2 * 7, 70, 25, p.far);
        px(c, k * 57 + 6, 47 + k % 2 * 7, 19, 3, p.trim);
      }
    } else if (/^(me|wa|ca|ea_af)$/.test(grp) || o.place === "desert_village") {
      for (k = 0; k < 5; k++) hill(c, k * 79 - 15, 52 + k % 2 * 4, 90, 19, p.far);
    } else {
      for (k = 0; k < 7; k++) hill(c, k * 51 - 12, 52 + k % 3 * 4, 63, 21, p.far);
    }
    px(c, 0, 70, W, 5, p.mid);
  }
  function tree(c, x, ground, p, kind) {
    var trunk = p.shadow, leaf = p.leaf;
    px(c, x - 2, ground - 29, 4, 29, trunk);
    if (kind === "palm") {
      px(c, x - 3, ground - 32, 7, 4, leaf);
      px(c, x - 15, ground - 35, 30, 3, leaf);
      px(c, x - 21, ground - 31, 11, 3, leaf);
      px(c, x + 10, ground - 31, 11, 3, leaf);
      px(c, x - 18, ground - 28, 4, 8, leaf); px(c, x + 15, ground - 28, 4, 8, leaf);
    } else if (kind === "pine") {
      px(c, x - 6, ground - 40, 12, 7, leaf);
      px(c, x - 11, ground - 33, 22, 7, leaf);
      px(c, x - 15, ground - 26, 30, 8, leaf);
      px(c, x - 12, ground - 18, 24, 3, p.mid);
    } else {
      px(c, x - 11, ground - 37, 22, 8, leaf);
      px(c, x - 16, ground - 29, 32, 10, leaf);
      px(c, x - 11, ground - 19, 23, 4, p.mid);
      px(c, x + 5, ground - 35, 5, 3, p.mid);
    }
  }
  function regionalNature(c, o, p) {
    var grp = o.grp || "", place = o.place || "";
    if (/^(office|hospital|clinic|wedding_hall|bus|train)$/.test(place)) return;
    if (/^(sa|se|wa|ca|ea_af|la|pac)$/.test(grp) || /^(beach|plantation|rice_paddy)$/.test(place)) {
      tree(c, 290, 81, p, "palm");
      if (!/^(street|megacity_skyline|factory)$/.test(place)) tree(c, 37, 78, p, "palm");
    } else if (/^(ru|cas|eu)$/.test(grp) || place === "snowy_town") {
      tree(c, 295, 82, p, "pine"); tree(c, 52, 81, p, "pine");
    } else {
      tree(c, 296, 83, p, "broad");
      if (place === "park") tree(c, 35, 82, p, "broad");
    }
  }
  function terrain(c, o, p) {
    var place = o.place || "home", ground = /^(beach|fishing_boat)$/.test(place) ? p.water : p.ground;
    if (/^(street|megacity_skyline|airport|bus|train|factory|construction)$/.test(place)) ground = p.shadow;
    if (/^(desert_village|mud_brick|refugee_camp)$/.test(place)) ground = p.building;
    px(c, 0, 75, W, 37, ground);
    px(c, 0, 75, W, 3, p.groundDark);
    if (/^(street|bus|train|airport|megacity_skyline)$/.test(place)) {
      for (var i = 0; i < 9; i++) px(c, i * 40 + 9, 104, 20, 2, p.trim);
    } else if (/^(beach|fishing_boat)$/.test(place)) {
      px(c, 0, 97, W, 15, p.building);
      for (i = 0; i < 13; i++) px(c, i * 27, 93 + i % 3, 15, 2, p.skyLow);
    } else {
      for (i = 0; i < 18; i++) px(c, (i * 29 + 8) % W, 84 + i % 5 * 5, 3, 1, p.groundDark);
    }
  }
  function building(c, x, base, w, h, p, type, lit) {
    var wall = p.building, roof = p.roof, trim = p.trim, windowColor = lit ? p.light : p.water;
    px(c, x, base - h, w, h, wall);
    if (type === "flat" || type === "concrete" || type === "tower") {
      px(c, x - 2, base - h - 3, w + 4, 4, roof);
    } else if (type === "dome") {
      px(c, x - 3, base - h - 2, w + 6, 4, roof);
      px(c, x + 6, base - h - 8, w - 12, 6, roof);
      px(c, x + 12, base - h - 11, w - 24, 3, roof);
    } else if (type === "pagoda") {
      px(c, x - 9, base - h - 2, w + 18, 4, roof);
      px(c, x - 3, base - h - 7, w + 6, 5, roof);
    } else {
      px(c, x - 6, base - h - 4, w + 12, 5, roof);
      px(c, x + 1, base - h - 8, w - 2, 4, roof);
    }
    px(c, x + 3, base - h + 5, 2, h - 5, p.shadow);
    px(c, x + w - 4, base - h + 5, 2, h - 5, p.groundDark);
    for (var row = 0; row < (h > 46 ? 3 : 1); row++) {
      for (var col = 0; col < Math.max(1, ((w - 14) / 21) | 0); col++) {
        var wx = x + 8 + col * 21, wy = base - h + 11 + row * 18;
        px(c, wx - 1, wy - 1, 11, 12, trim);
        px(c, wx, wy, 9, 10, windowColor);
        px(c, wx + 4, wy, 1, 10, trim);
        px(c, wx, wy + 4, 9, 1, trim);
      }
    }
    px(c, x + ((w / 2) | 0) - 5, base - 17, 11, 17, p.shadow);
    px(c, x + ((w / 2) | 0) - 3, base - 15, 2, 4, roof);
  }
  function houseType(o) {
    var g = o.grp || "", w = o.wealth || 3;
    if (o.urban && w >= 4) return w >= 5 ? "townhouse" : "apartment";
    if (w === 1) return /^(me|wa|ca|ea_af)$/.test(g) ? "mud_brick" : "hut";
    if (w === 2) return "tin_roof";
    if (w >= 5) return "villa";
    return "concrete_block";
  }
  function house(c, o, p, kind) {
    var x = 15, base = 79, w = 72, h = 36, type = "pitched";
    if (kind === "hut") { w = 52; h = 28; type = "pitched"; }
    if (kind === "mud_brick") { w = 60; h = 31; type = "flat"; }
    if (kind === "tin_roof") { w = 64; h = 31; }
    if (kind === "concrete_block") { w = 72; h = 38; type = "concrete"; }
    if (kind === "apartment") { w = 76; h = 68; type = "tower"; }
    if (kind === "townhouse") { w = 88; h = 51; }
    if (kind === "villa") { w = 100; h = 46; }
    var grp = o.grp || "";
    if (/^(jp|kr|ea|se)$/.test(grp) && type === "pitched") type = "pagoda";
    if (/^(me|tr)$/.test(grp) && kind === "villa") type = "dome";
    building(c, x, base, w, h, p, type, p.mode === "night");
    if (kind === "hut" || kind === "tin_roof") {
      for (var j = 0; j < 6; j++) px(c, x + j * 9, base - h - 3, 2, 3, p.trim);
    }
    if (kind === "villa") { px(c, x + 91, base - 20, 32, 4, p.trim); px(c, x + 100, base - 16, 3, 16, p.roof); }
  }
  function stripes(c, x, y, w, h, p) {
    px(c, x, y, w, h, p.trim);
    for (var i = 0; i < (w / 12) | 0; i++) px(c, x + i * 12, y, 6, h, p.roof);
  }
  function marketStall(c, x, p) {
    px(c, x + 4, 54, 3, 34, p.shadow); px(c, x + 63, 54, 3, 34, p.shadow);
    stripes(c, x, 46, 70, 10, p);
    px(c, x + 3, 73, 65, 4, p.roof);
    for (var i = 0; i < 7; i++) px(c, x + 7 + i * 8, 67 + i % 2 * 2, 5, 6, i % 2 ? p.leaf : p.light);
    px(c, x + 8, 77, 3, 11, p.shadow); px(c, x + 59, 77, 3, 11, p.shadow);
  }
  function vehicle(c, x, y, p, kind) {
    var w = kind === "train" ? 132 : kind === "bus" ? 88 : kind === "plane" ? 122 : 47;
    if (kind === "plane") {
      px(c, x, y, w, 12, p.trim); px(c, x + 47, y + 12, 24, 15, p.trim);
      px(c, x + 103, y - 11, 7, 12, p.trim); px(c, x + 15, y + 4, 16, 2, p.water);
      px(c, x + 17, y + 27, 2, 6, p.shadow); px(c, x + 97, y + 11, 2, 14, p.shadow);
    } else {
      px(c, x, y + 6, w, kind === "train" ? 24 : 20, p.building);
      px(c, x + 4, y + 2, w - 8, 5, p.roof);
      for (var i = 0; i < (w - 12) / 15; i++) px(c, x + 8 + i * 15, y + 10, 11, 8, p.water);
      px(c, x + 10, y + 25, 9, 5, p.shadow); px(c, x + w - 20, y + 25, 9, 5, p.shadow);
    }
  }
  function naturePlace(c, o, p, place, r) {
    var k, x;
    if (/^(field|rice_paddy|plantation|farm_animals)$/.test(place)) {
      for (k = 0; k < 7; k++) {
        px(c, 0, 80 + k * 5, W, 2, place === "rice_paddy" && k % 2 ? p.water : p.groundDark);
        for (var j = 0; j < 18; j++) {
          x = j * 18 + k % 2 * 7;
          px(c, x, 77 + k * 5, 2, 5, p.leaf);
          px(c, x - 2, 79 + k * 5, 6, 2, k % 3 ? p.leaf : p.light);
        }
      }
      if (place === "plantation") for (k = 0; k < 4; k++) tree(c, 22 + k * 83, 80, p, "palm");
      if (place === "farm_animals") {
        for (k = 0; k < 3; k++) { x = 21 + k * 45; px(c, x, 78, 17, 10, p.trim); px(c, x + 12, 74, 7, 8, p.trim); px(c, x + 2, 87, 3, 7, p.shadow); px(c, x + 13, 87, 3, 7, p.shadow); }
      }
    } else if (place === "fishing_boat") {
      px(c, 28, 71, 108, 12, p.roof); px(c, 42, 83, 78, 5, p.shadow);
      px(c, 81, 41, 3, 30, p.shadow); px(c, 84, 43, 34, 27, p.trim);
      for (k = 0; k < 7; k++) px(c, 35 + k * 12, 74, 6, 2, p.trim);
    } else if (place === "beach") {
      px(c, 104, 40, 3, 49, p.shadow);
      px(c, 77, 38, 55, 6, p.roof); px(c, 86, 32, 37, 6, p.roof);
      for (k = 0; k < 8; k++) px(c, k * 37 + 2, 99 + k % 2 * 5, 5, 1, p.trim);
    } else if (place === "park") {
      for (k = 0; k < 3; k++) tree(c, 48 + k * 102, 78, p, "broad");
      px(c, 103, 83, 68, 5, p.roof); px(c, 108, 88, 4, 12, p.shadow); px(c, 163, 88, 4, 12, p.shadow);
      for (k = 0; k < 9; k++) px(c, k * 39, 99, 10, 2, p.trim);
    } else if (place === "mountain_village" || place === "desert_village" || place === "snowy_town") {
      for (k = 0; k < 3; k++) building(c, 12 + k * 95, 80, 59, 26 + k % 2 * 7, p, place === "desert_village" ? "flat" : "pitched", p.mode === "night");
      if (place === "snowy_town") for (k = 0; k < 3; k++) px(c, 8 + k * 95, 44 - k % 2 * 7, 68, 4, p.trim);
    }
  }
  function civicPlace(c, o, p, place) {
    var k, x, type = "flat", w = 120, h = 50;
    if (/^(mosque|church|temple|shrine)$/.test(place)) {
      type = place === "mosque" ? "dome" : place === "temple" || place === "shrine" ? "pagoda" : "pitched";
      building(c, 35, 82, 104, 45, p, type, p.mode === "night");
      if (place === "mosque") { px(c, 149, 18, 9, 64, p.building); px(c, 145, 17, 17, 5, p.roof); px(c, 149, 11, 9, 6, p.roof); }
      if (place === "church") { px(c, 78, 17, 7, 19, p.building); px(c, 74, 18, 15, 3, p.roof); }
      if (place === "temple" || place === "shrine") { px(c, 153, 47, 3, 37, p.roof); px(c, 190, 47, 3, 37, p.roof); px(c, 148, 43, 50, 5, p.roof); }
      return;
    }
    if (place === "school" || place === "university" || place === "graduation") { h = place === "university" ? 57 : 45; w = 134; type = "pitched"; }
    if (place === "hospital" || place === "clinic") { h = place === "hospital" ? 67 : 39; w = place === "hospital" ? 132 : 87; type = "flat"; }
    if (place === "factory") { h = 40; w = 145; type = "flat"; }
    if (place === "office") { h = 67; w = 112; type = "tower"; }
    if (place === "construction") { h = 59; w = 117; type = "concrete"; }
    if (place === "shop") { h = 39; w = 79; type = "flat"; }
    building(c, 12, 82, w, h, p, type, p.mode === "night");
    if (place === "hospital" || place === "clinic") {
      px(c, 26, 25, 19, 4, p.roof); px(c, 33, 18, 5, 18, p.roof);
      px(c, 139, 74, 64, 7, p.trim); px(c, 142, 81, 3, 11, p.shadow);
    } else if (place === "factory") {
      for (k = 0; k < 3; k++) { x = 25 + k * 27; px(c, x, 16 + k % 2 * 6, 12, 23, p.roof); px(c, x + 3, 8 + k % 2 * 6, 8, 8, p.weather); }
      px(c, 185, 75, 70, 5, p.shadow);
    } else if (place === "construction") {
      for (k = 0; k < 5; k++) px(c, 23 + k * 23, 23, 3, 58, p.shadow);
      for (k = 0; k < 3; k++) px(c, 19, 30 + k * 18, 120, 3, p.shadow);
      px(c, 171, 19, 3, 62, p.shadow); px(c, 165, 17, 90, 3, p.shadow);
      px(c, 236, 20, 3, 36, p.shadow); px(c, 230, 56, 15, 7, p.roof);
    } else if (place === "school" || place === "university" || place === "graduation") {
      px(c, 171, 30, 3, 47, p.shadow); px(c, 174, 32, 27, 12, p.roof);
      px(c, 174, 44, 27, 3, p.trim);
    } else if (place === "shop") { stripes(c, 7, 42, 90, 9, p); px(c, 27, 58, 55, 19, p.water); }
  }
  function settlement(c, o, p, place) {
    var k, x;
    if (/^(home|home_old|hut|mud_brick|tin_roof|concrete_block|apartment|townhouse|villa)$/.test(place)) {
      house(c, o, p, place === "home" || place === "home_old" ? houseType(o) : place);
      if (place === "home_old") { px(c, 113, 79, 48, 5, p.roof); px(c, 119, 84, 3, 11, p.shadow); }
    } else if (place === "market") { marketStall(c, 9, p); marketStall(c, 219, p); }
    else if (place === "street" || place === "megacity_skyline") {
      for (k = 0; k < (place === "street" ? 6 : 8); k++) {
        x = k * 44 - 4;
        building(c, x, 81, 38, place === "street" ? 35 + k % 2 * 9 : 42 + k % 4 * 11, p, k % 2 ? "flat" : "tower", p.mode === "night");
      }
    } else if (place === "refugee_camp") {
      for (k = 0; k < 4; k++) {
        x = 9 + k * 71; px(c, x, 61, 58, 19, p.trim);
        px(c, x + 8, 55, 42, 6, p.trim); px(c, x + 19, 66, 17, 14, p.shadow);
        px(c, x + 3, 78, 52, 2, p.roof);
      }
    } else if (place === "bus" || place === "train" || place === "airport") {
      if (place === "airport") { building(c, 4, 79, 93, 39, p, "flat", p.mode === "night"); vehicle(c, 133, 45, p, "plane"); }
      else { building(c, 4, 74, 62, 29, p, "flat", p.mode === "night"); vehicle(c, 97, 51, p, place); }
    } else if (place === "wedding" || place === "wedding_hall" || place === "funeral" || place === "cemetery") {
      if (place === "cemetery" || place === "funeral") {
        for (k = 0; k < 7; k++) { x = 13 + k * 43; px(c, x, 67 + k % 2 * 4, 15, 19, p.shadow); px(c, x + 3, 63 + k % 2 * 4, 9, 4, p.shadow); }
        if (place === "funeral") building(c, 12, 79, 67, 33, p, "pitched", false);
      } else {
        building(c, 12, 80, 117, 43, p, "dome", p.mode === "night");
        px(c, 145, 46, 3, 36, p.roof); px(c, 229, 46, 3, 36, p.roof);
        px(c, 146, 47, 84, 4, p.trim);
        for (k = 0; k < 9; k++) px(c, 150 + k * 9, 52 + k % 2 * 2, 5, 5, k % 2 ? p.light : p.roof);
      }
    } else if (place === "stadium") {
      px(c, 0, 44, W, 33, p.shadow);
      for (k = 0; k < 4; k++) px(c, 0, 50 + k * 6, W, 3, k % 2 ? p.roof : p.trim);
      px(c, 0, 78, W, 21, p.ground);
      px(c, 4, 87, W - 8, 2, p.trim);
      px(c, 40, 78, 2, 21, p.trim); px(c, 278, 78, 2, 21, p.trim);
    }
  }
  function props(c, o, p, place) {
    var items = o.items || [], k;
    if (o.waterFetch) {
      for (k = 0; k < 2; k++) { px(c, 118 + k * 12, 85, 9, 12, p.light); px(c, 120 + k * 12, 82, 5, 3, p.shadow); }
    }
    if (items.indexOf("car") >= 0 || items.indexOf("usedCar") >= 0 || items.indexOf("newCar") >= 0) vehicle(c, 245, 78, p, "car");
    else if (items.indexOf("bike") >= 0 || items.indexOf("motorbike") >= 0) {
      px(c, 265, 96, 10, 10, p.shadow); px(c, 286, 96, 10, 10, p.shadow);
      px(c, 272, 91, 19, 3, p.roof); px(c, 280, 85, 3, 13, p.shadow);
    }
    if (o.pets && o.pets.length) { px(c, 223, 88, 13, 9, p.roof); px(c, 234, 84, 7, 7, p.roof); px(c, 226, 96, 2, 6, p.shadow); px(c, 235, 96, 2, 6, p.shadow); }
    if (place === "home" || place === "home_old") {
      px(c, 119, 66, 2, 16, p.shadow); px(c, 163, 66, 2, 16, p.shadow);
      px(c, 121, 66, 42, 2, p.trim);
      px(c, 129, 69, 11, 9, p.trim); px(c, 146, 69, 13, 8, p.roof);
    }
    if (o.festive || place === "wedding" || place === "wedding_hall" || place === "graduation") {
      for (k = 0; k < 20; k++) { px(c, 104 + k * 8, 30 + ((k / 5) | 0) % 2 * 3, 8, 1, p.shadow); px(c, 107 + k * 8, 31 + ((k / 5) | 0) % 2 * 3, 3, 4, k % 2 ? p.roof : p.light); }
    }
  }
  function people(c, o, p, place) {
    var ps = o.people || [], api = window.PIXELART_SPRITES, count = Math.min(ps.length, 9), start = place === "funeral" ? 130 : 135;
    for (var k = 0; k < count; k++) {
      var person = ps[k] || {}, pp = {}, prop;
      for (prop in person) if (Object.prototype.hasOwnProperty.call(person, prop)) pp[prop] = person[prop];
      pp.grp = pp.grp || o.grp; pp.place = place;
      pp.expression = pp.expression || o.expression || (o.happiness >= 70 ? "smile" : o.happiness < 35 ? "sad" : "neutral");
      pp.frame = k === 0 ? o.frame || 0 : 0;
      pp.studying = o.studying || place === "school";
      var xx = start + k * Math.min(23, 155 / Math.max(1, count));
      if (api && api.drawPerson) api.drawPerson(c, xx, 97 + k % 2, pp, p, rng((o.seed || 1) + k * 37));
      else { px(c, xx - 3, 77, 7, 9, p.light); px(c, xx - 5, 86, 11, 11, p.roof); px(c, xx - 4, 97, 3, 7, p.shadow); px(c, xx + 2, 97, 3, 7, p.shadow); }
    }
  }
  function lifeDetails(c, o, p, place) {
    var age = Number(o.age), family = Math.min((o.people || []).length, 6), k;
    var home = /^(home|home_old|hut|mud_brick|tin_roof|concrete_block|apartment|townhouse|villa)$/.test(place);
    if (!isFinite(age)) age = 30;
    /* A few objects stay with the person as the years advance. */
    if (age < 4) {
      px(c, 185, 94, 12, 9, p.roof); px(c, 188, 91, 6, 3, p.trim);
      px(c, 199, 99, 5, 5, p.light);
    } else if (age < 18) {
      px(c, 102, 84, 14, 14, p.roof); px(c, 105, 87, 8, 7, p.trim);
      px(c, 107, 82, 4, 3, p.shadow);
    } else if (age >= 65 || o.retired) {
      px(c, 199, 88, 48, 4, p.roof); px(c, 203, 92, 3, 12, p.shadow);
      px(c, 241, 92, 3, 12, p.shadow); px(c, 205, 84, 36, 3, p.trim);
      px(c, 263, 82, 2, 20, p.shadow); px(c, 260, 80, 5, 3, p.roof);
    } else if (home) {
      px(c, 105, 89, 14, 10, p.roof); px(c, 107, 91, 10, 5, p.trim);
      px(c, 110, 86, 4, 3, p.shadow);
    }
    if (home && family > 1) {
      for (k = 0; k < family - 1; k++) {
        px(c, 91 + k * 10, 101, 7, 3, k % 2 ? p.roof : p.shadow);
        px(c, 93 + k * 10, 98, 3, 3, p.trim);
      }
    }
    if (p.season === "spring") {
      for (k = 0; k < 5; k++) {
        px(c, 220 + k * 13, 103 - k % 2 * 3, 3, 3, p.light);
        px(c, 221 + k * 13, 106 - k % 2 * 3, 1, 4, p.leaf);
      }
    } else if (p.season === "autumn") {
      for (k = 0; k < 7; k++) px(c, 202 + k * 15, 99 + k % 3 * 3, 5, 2, k % 2 ? p.roof : p.leaf);
    } else if (p.season === "winter" && o.weather === "snow") {
      px(c, 0, 78, 116, 3, p.trim);
      px(c, 4, 103, 98, 4, p.trim);
    }
    var milestone = o.milestone || "";
    if (milestone === "wedding") {
      px(c, 169, 24, 112, 2, p.roof);
      for (k = 0; k < 9; k++) {
        px(c, 173 + k * 13, 26, 5, 5, k % 2 ? p.light : p.trim);
        px(c, 175 + k * 13, 31, 1, 3, p.roof);
      }
    } else if (milestone === "new_baby") {
      px(c, 216, 89, 34, 4, p.roof); px(c, 219, 92, 28, 10, p.trim);
      px(c, 221, 87, 24, 4, p.light); px(c, 223, 96, 20, 4, p.water);
      px(c, 219, 102, 3, 4, p.shadow); px(c, 244, 102, 3, 4, p.shadow);
    } else if (milestone === "moving") {
      for (k = 0; k < 3; k++) {
        var x = 98 + k * 22, y = k === 1 ? 75 : 82;
        px(c, x, y, 20, 19, p.roof); px(c, x + 2, y + 2, 16, 15, p.building);
        px(c, x + 8, y, 4, 19, p.trim); px(c, x, y + 7, 20, 2, p.trim);
      }
    } else if (milestone === "illness") {
      px(c, 224, 83, 30, 20, p.trim); px(c, 227, 80, 24, 5, p.shadow);
      px(c, 236, 86, 6, 14, p.roof); px(c, 232, 90, 14, 6, p.roof);
    } else if (milestone === "retirement") {
      px(c, 256, 75, 4, 29, p.shadow);
      px(c, 249, 77, 17, 11, p.leaf); px(c, 252, 72, 11, 6, p.leaf);
      px(c, 252, 90, 11, 10, p.building);
    } else if (milestone === "mourning") {
      px(c, 260, 80, 18, 19, p.leaf); px(c, 264, 84, 10, 11, p.ground);
      px(c, 266, 91, 6, 4, p.trim); px(c, 267, 98, 4, 6, p.roof);
      px(c, 284, 94, 3, 8, p.trim); px(c, 284, 91, 3, 3, p.light);
    }
  }
  function foreground(c, o, p, place) {
    var k;
    if (/^(field|rice_paddy|plantation|park|home|home_old|villa|mountain_village)$/.test(place)) {
      for (k = 0; k < 19; k++) {
        var x = (k * 41 + 9) % W, y = 105 + k % 3;
        px(c, x, y, 2, 4, p.leaf); px(c, x - 2, y + 1, 6, 2, p.leaf);
      }
    }
    if (place === "cemetery" || place === "funeral") {
      for (k = 0; k < 7; k++) { px(c, 15 + k * 44, 102, 3, 5, p.leaf); px(c, 12 + k * 44, 101, 9, 2, p.roof); }
    }
    if (o.candles) for (k = 0; k < Math.min(o.candles, 12); k++) { px(c, 265 + k * 4, 93, 2, 5, p.trim); px(c, 265 + k * 4, 91, 2, 2, p.light); }
  }
  function weather(c, o, p, r) {
    var kind = o.weather || "", month = typeof o.season === "number" ? o.season : +o.season;
    if (!kind) {
      if (o.season === "snow" || /^(ru|cas|eu|jp|kr)$/.test(o.grp || "") && (month === 12 || month > 0 && month <= 2)) kind = "snow";
      else if (o.season === "rain" || /^(sa|se|wa|ca|ea_af|pac)$/.test(o.grp || "") && month >= 6 && month <= 9) kind = "rain";
      else if (o.season === "heat" || o.grp === "me" && month >= 6 && month <= 8) kind = "heat";
    }
    var frame = (o.frame || 0) * 3, n, x, y;
    if (kind === "rain" || kind === "monsoon" || kind === "downpour") {
      n = kind === "rain" ? 58 : 128;
      for (var i = 0; i < n; i++) { x = ((r() * W + frame * 2) | 0) % W; y = ((r() * H + frame * 5) | 0) % H; px(c, x, y, 1, kind === "rain" ? 4 : 7, p.weather); }
    } else if (kind === "snow") {
      for (i = 0; i < 57; i++) { x = ((r() * W + frame) | 0) % W; y = ((r() * H + frame * 2) | 0) % H; px(c, x, y, 2, 2, p.trim); }
      px(c, 0, 107, W, 5, p.trim);
    } else if (kind === "dust" || kind === "fog") {
      for (i = 0; i < 12; i++) px(c, (i * 47 + frame * 2) % W, 25 + i % 5 * 13, kind === "fog" ? 30 : 16, 2, p.weather);
    } else if (kind === "heat" || kind === "heat_haze") {
      for (i = 0; i < 13; i++) px(c, i * 27 + frame % 4, 62 + i % 3 * 6, 16, 1, p.light);
    }
  }
  function lighting(c, o, p) {
    if (p.mode === "night" || o.time === "night") {
      for (var k = 0; k < 4; k++) { px(c, 61 + k * 75, 67, 2, 16, p.shadow); px(c, 57 + k * 75, 63, 10, 5, p.light); }
    }
  }
  function drawScene(ctx, o) {
    o = o || {};
    var p = palette(o), r = rng(o.seed || 1), place = PLACE_SET[o.place] ? o.place : "home";
    sun(ctx, o, p, r);
    farGround(ctx, o, p, r);
    regionalNature(ctx, o, p);
    terrain(ctx, o, p);
    if (/^(field|rice_paddy|plantation|farm_animals|fishing_boat|beach|park|mountain_village|desert_village|snowy_town)$/.test(place)) naturePlace(ctx, o, p, place, r);
    else if (/^(school|university|graduation|hospital|clinic|factory|office|construction|shop|mosque|church|temple|shrine)$/.test(place)) civicPlace(ctx, o, p, place);
    else settlement(ctx, o, p, place);
    props(ctx, o, p, place);
    lifeDetails(ctx, o, p, place);
    people(ctx, o, p, place);
    foreground(ctx, o, p, place);
    weather(ctx, o, p, r);
    lighting(ctx, o, p);
  }
  function drawRoom(ctx, o) {
    o = o || {};
    var p = palette(o), wealthy = (o.wealth || 3) >= 4, r = rng(o.seed || 3);
    px(ctx, 0, 0, W, 76, p.building); px(ctx, 0, 76, W, 24, p.ground);
    px(ctx, 0, 75, W, 3, p.roof);
    px(ctx, 22, 13, 60, 42, p.trim); px(ctx, 27, 18, 50, 32, p.sky);
    px(ctx, 50, 18, 3, 32, p.trim); px(ctx, 27, 32, 50, 3, p.trim);
    px(ctx, 18, 10, 6, 46, p.roof); px(ctx, 81, 10, 6, 46, p.roof);
    px(ctx, 231, 22, 41, 35, p.trim); px(ctx, 236, 26, 31, 24, p.leaf);
    px(ctx, 105, 63, 111, wealthy ? 15 : 10, wealthy ? p.trim : p.roof);
    px(ctx, 109, 58, 103, 8, p.trim); px(ctx, 111, 53, 33, 8, p.weather);
    px(ctx, 106, 78, 5, 16, p.shadow); px(ctx, 211, 78, 5, 16, p.shadow);
    if (wealthy) { px(ctx, 99, 43, 4, 41, p.water); px(ctx, 219, 43, 4, 41, p.water); px(ctx, 225, 24, 4, 60, p.shadow); px(ctx, 224, 24, 33, 3, p.shadow); }
    var api = window.PIXELART_SPRITES, age = o.lyingAge == null ? 30 : o.lyingAge;
    if (api && api.drawPerson && age < 1) api.drawPerson(ctx, 132, 66, { age: 0, sex: o.sex, grp: o.grp, outfit: "baby" }, p, r);
    else {
      px(ctx, 132, 51, 15, 11, p.light); px(ctx, 133, 48, 14, 4, p.shadow);
      px(ctx, 147, 55, 47, 9, p.roof); px(ctx, 192, 59, 14, 5, p.shadow);
    }
    if (o.heart) { px(ctx, 119, 29, 8, 6, p.roof); px(ctx, 132, 29, 8, 6, p.roof); px(ctx, 122, 35, 15, 7, p.roof); px(ctx, 126, 42, 7, 4, p.roof); }
    var visitors = o.visitors || [];
    for (var i = 0; i < Math.min(visitors.length, 5); i++) {
      var x = i % 2 ? 240 + ((i / 2) | 0) * 17 : 87 - ((i / 2) | 0) * 17;
      if (api && api.drawPerson) api.drawPerson(ctx, x, 91, { age: visitors[i].age, sex: visitors[i].sex, grp: o.grp, place: wealthy && i === 0 ? "hospital" : "room" }, p, rng((o.seed || 3) + i * 13));
      else { px(ctx, x, 65, 8, 10, p.light); px(ctx, x - 2, 75, 12, 16, p.roof); }
    }
  }
  window.PIXELART_SCENE = { drawScene: drawScene, drawRoom: drawRoom, places: places };
}());
