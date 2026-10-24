/* Original color families for the code-drawn scenes. */
(function () {
  'use strict';
  var BASE = {
    sky: '#8ec9dc', skyLow: '#d8e6cf', far: '#94b6ad', mid: '#668f82',
    ground: '#81a868', groundDark: '#568258', building: '#d0b99a', roof: '#835d55',
    trim: '#efe2c3', leaf: '#518668', water: '#5b9bb0', light: '#fff0b4',
    shadow: '#354c5c', weather: '#abcbd4'
  };
  var REGION = {
    sa: ['#d6b48e', '#a95f46', '#588967'], ea: ['#cdbba8', '#687d79', '#658f65'],
    jp: ['#d5c5ae', '#6d6260', '#698b70'], kr: ['#d1bdab', '#727375', '#638b70'],
    wa: ['#d9aa72', '#9b6b43', '#68875c'], ca: ['#c9a47a', '#93714f', '#588269'],
    ea_af: ['#c6a481', '#916b57', '#5f8d64'], me: ['#d8b995', '#9f7761', '#829078'],
    tr: ['#cfb39a', '#a46d56', '#71936e'], se: ['#cbb58e', '#986b50', '#5a8863'],
    la: ['#c8ac8c', '#a16d55', '#528469'], we: ['#d2c6b6', '#6e6b68', '#679078'],
    ru: ['#c9bdb3', '#6b777d', '#668779'], eu: ['#d3c6b8', '#756e70', '#659075'],
    cas: ['#d5b99a', '#947966', '#71866c'], pac: ['#c8b391', '#8b6e60', '#568e79']
  };
  function tint(color, amount) {
    var n = parseInt(color.slice(1), 16), channels = [n >> 16, n >> 8 & 255, n & 255];
    return '#' + channels.map(function (v) {
      var h = Math.max(0, Math.min(255, v + amount)).toString(16);
      return h.length < 2 ? '0' + h : h;
    }).join('');
  }
  function forScene(o) {
    o = o || {};
    var p = {}, key, region = REGION[o.grp] || REGION.eu;
    for (key in BASE) if (Object.prototype.hasOwnProperty.call(BASE, key)) p[key] = BASE[key];
    p.building = region[0]; p.roof = region[1]; p.leaf = region[2];
    p.mid = tint(p.leaf, -16); p.ground = tint(p.leaf, 23);
    var month = +(o.month || o.season) || 6;
    var season = o.seasonName || (month === 12 || month <= 2 ? 'winter' : month >= 9 && month <= 11 ? 'autumn' : month >= 3 && month <= 5 ? 'spring' : 'summer');
    if (season === 'winter') { p.ground = '#b7c8bb'; p.leaf = '#769186'; }
    else if (season === 'autumn') { p.leaf = '#aa8862'; p.ground = '#a9a277'; }
    else if (season === 'spring') { p.leaf = tint(p.leaf, 17); }
    var mode = o.mode || o.time || (o.weather === 'dawn' ? 'dawn' : o.weather === 'night' ? 'night' : o.age < 3 ? 'dawn' : o.age >= 70 ? 'dusk' : 'day');
    if (mode === 'dawn') { p.sky = '#bdabb6'; p.skyLow = '#efcda8'; p.light = '#ffe2a0'; }
    else if (mode === 'dusk') { p.sky = '#877fa0'; p.skyLow = '#e2a187'; p.light = '#f9d19a'; }
    else if (mode === 'night') { p.sky = '#283b5a'; p.skyLow = '#52657b'; p.far = '#43536a'; p.mid = '#354b59'; p.light = '#f6dda0'; }
    if (o.weather === 'rain' || o.weather === 'monsoon') { p.sky = '#718a9a'; p.skyLow = '#a6b8b5'; p.weather = '#bfd6dc'; }
    else if (o.weather === 'fog') { p.sky = '#b7c4c4'; p.skyLow = '#d5d9cf'; p.far = '#aebdb9'; }
    else if (o.weather === 'dust') { p.sky = '#c4a588'; p.skyLow = '#dbc09c'; p.weather = '#e4c9a0'; }
    else if (o.weather === 'snow') { p.sky = '#a8c4d1'; p.skyLow = '#dce5e3'; p.ground = '#e4e9e3'; }
    else if (o.weather === 'heat') { p.skyLow = '#ecd6aa'; }
    if (o.era === 'past') { p.building = tint(p.building, -12); p.trim = '#d9c6a3'; }
    else if (o.era === 'future') { p.building = tint(p.building, 12); p.trim = '#dce5e5'; }
    var mood = o.mood || (o.happiness >= 70 ? 'bright' : o.happiness < 35 ? 'somber' : 'calm');
    if (mood === 'somber' || mood === 'sad') p.skyLow = tint(p.skyLow, -12);
    if (mood === 'bright' || mood === 'happy') p.light = tint(p.light, 9);
    p.mode = mode; p.season = season; p.mood = mood;
    return p;
  }
  window.PIXELART_PALETTE = { forScene: forScene, regions: REGION, tint: tint };
})();
