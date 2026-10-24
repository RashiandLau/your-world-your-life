/* Public pixel API and lightweight first-paint art. Full art loads after first paint. */
(function () {
  'use strict';
  function local(ja, en) { return document.documentElement.lang === 'en' ? en : ja; }
  function seeded(seed) {
    var a = seed >>> 0 || 1;
    return function () { a ^= a << 13; a ^= a >>> 17; a ^= a << 5; return ((a >>> 0) % 10000) / 10000; };
  }
  var pending = [];
  function remember(kind, canvas, opts) {
    if (pending.length > 32) pending.shift();
    pending.push([kind, canvas, opts]);
  }
  function draw(canvas, o, width, height, kind) {
    o = o || {};
    canvas.width = width; canvas.height = height;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#94c7d3'; ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#d9c8a4'; ctx.fillRect(0, height * 0.68, width, height * 0.32);
    ctx.fillStyle = '#719474'; ctx.fillRect(0, height * 0.84, width, height * 0.16);
    if (kind !== 'portrait') {
      ctx.fillStyle = '#987b62'; ctx.fillRect(width * 0.15, height * 0.37, width * 0.35, height * 0.45);
      ctx.fillStyle = '#765b57'; ctx.fillRect(width * 0.13, height * 0.30, width * 0.39, height * 0.09);
    }
    ctx.fillStyle = '#b57d60'; ctx.fillRect(width * 0.69, height * 0.45, width * 0.10, height * 0.22);
    ctx.fillStyle = '#355c68'; ctx.fillRect(width * 0.67, height * 0.65, width * 0.14, height * 0.20);
    remember(kind, canvas, o);
    return canvas;
  }
  function scene(canvas, o) { return draw(canvas, o, 320, 112, 'scene'); }
  function room(canvas, o) { return draw(canvas, o, 320, 100, 'room'); }
  function portrait(canvas, o) { return draw(canvas, o, 48, 56, 'portrait'); }  var LAND = [
    [[-168, 66], [-140, 70], [-100, 72], [-80, 72], [-62, 60], [-55, 50], [-66, 44], [-76, 35], [-81, 25], [-97, 26], [-97, 18], [-87, 15], [-78, 8], [-85, 10], [-105, 20], [-117, 32], [-124, 40], [-125, 49], [-135, 58], [-150, 60], [-165, 62]],
    [[-55, 60], [-42, 60], [-20, 70], [-20, 82], [-60, 82], [-70, 76]],
    [[-78, 8], [-60, 10], [-50, 0], [-35, -6], [-40, -22], [-48, -28], [-58, -38], [-65, -55], [-72, -50], [-72, -30], [-70, -18], [-81, -5], [-80, 2]],
    [[-10, 36], [-9, 43], [-2, 44], [-5, 48], [2, 51], [8, 54], [8, 57], [5, 62], [15, 69], [28, 71], [40, 67], [40, 55], [30, 46], [28, 41], [22, 37], [15, 38], [12, 44], [5, 43], [-5, 36]],
    [[-6, 50], [2, 51], [0, 54], [-3, 58], [-6, 57]],
    [[-17, 21], [-10, 30], [-6, 36], [10, 37], [20, 32], [32, 31], [35, 28], [43, 12], [51, 12], [42, -2], [40, -15], [33, -26], [20, -35], [15, -28], [12, -15], [9, -1], [9, 4], [-8, 4], [-17, 14]],
    [[44, -25], [48, -25], [50, -15], [47, -13]],
    [[26, 41], [36, 36], [35, 31], [43, 13], [52, 16], [58, 22], [57, 26], [50, 30], [62, 25], [68, 23], [72, 20], [77, 8], [80, 15], [88, 22], [92, 22], [98, 16], [100, 6], [104, 1], [104, 10], [109, 12], [108, 21], [117, 23], [122, 30], [122, 40], [129, 35], [130, 43], [140, 48], [142, 54], [135, 55], [160, 60], [162, 68], [180, 66], [180, 72], [130, 72], [100, 78], [70, 73], [60, 69], [45, 68], [40, 55], [40, 45], [30, 46]],
    [[130, 31], [136, 34], [140, 35], [142, 40], [141, 45], [144, 44], [140, 42], [136, 37], [131, 34]],
    [[95, 5], [105, -6], [115, -8], [125, -9], [134, -4], [141, -3], [141, -9], [120, -9], [106, -8], [100, -1]],
    [[109, 1], [117, 7], [119, 1], [116, -4], [110, -3]],
    [[120, 18], [122, 18], [126, 7], [122, 7]],
    [[114, -22], [122, -18], [130, -12], [137, -12], [142, -11], [146, -19], [153, -26], [150, -37], [140, -38], [132, -32], [115, -34]],
    [[172, -34], [178, -38], [174, -41], [167, -46]],
    [[80, 6], [82, 8], [80, 10]]
  ];
  function inPoly(x, y, poly) {
    var inside = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  var landDots = null;
  function dots(step) {
    if (landDots) return landDots;
    landDots = [];
    for (var lat = 78; lat > -56; lat -= step) for (var lon = -168; lon < 180; lon += step) {
      if (LAND.some(function (p) { return inPoly(lon, lat, p); })) landDots.push([lon, lat]);
    }
    return landDots;
  }
  // 経度 -170〜180、緯度 -56〜80 を 0..W, 0..H に写す
  function project(lon, lat, W, H) { return [(lon + 170) / 350 * W, (80 - lat) / 136 * H]; }
  function mapEsc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function mapShare(value) { return Number(value).toFixed(value > 0 && value < 0.1 ? 2 : 1).replace(/\.0$/, ""); }
  function mapRadius(value, W) { return Math.max(3.2, Math.min(25, (2.5 + Math.sqrt(Math.max(0, value)) * 4.2) * W / 540)); }
  function worldSVG(o) {
    var W = o.w || 700, H = o.h || 272, prepared = window.LANDDOTS;
    var fine = W >= 600;
    var d = prepared && prepared[fine ? "fine" : "dots"] || dots(o.step || 3);
    var radius = prepared ? 0.30 * (fine ? 1.6 : prepared.step) * Math.min(W / 350, H / 136) : (o.dot || 1.2);
    var s = '<svg class="world-map" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + mapEsc(o.label || local("世界地図", "World map")) + '">';
    s += '<rect class="map-ocean" x="1" y="1" width="' + (W - 2) + '" height="' + (H - 2) + '" rx="10"/>';
    if (o.graticule !== false) [23.5, 0, -23.5].forEach(function (lat) {
      var y = project(0, lat, W, H)[1].toFixed(1);
      s += '<line class="map-graticule" x1="1" y1="' + y + '" x2="' + (W - 1) + '" y2="' + y + '"/>';
    });
    d.forEach(function (p) { var xy = project(p[0], p[1], W, H); s += '<circle class="map-land" cx="' + xy[0].toFixed(1) + '" cy="' + xy[1].toFixed(1) + '" r="' + radius.toFixed(2) + '"/>'; });
    var bubbles = (o.bubbles || []).slice().sort(function (a, b) { return (+b.share || +b.value || 0) - (+a.share || +a.value || 0); });
    bubbles.forEach(function (b) {
      var xy = project(b.lon, b.lat, W, H), share = +b.share || +b.value || 0;
      var r = mapRadius(share || Math.pow((+b.r || 3) / 6, 2), W);
      var name = (document.documentElement.lang === "en" && b.name_en) || b.name || b.t || local("国名不明", "Unknown country");
      var title = document.documentElement.lang === "en" ? name + " · " + (share ? mapShare(share) + "% of world births (1 in " + Math.round(100 / share) + ")" : "under 0.01% of world births") : name + " · 世界の出生の" + (share ? mapShare(share) + "%（" + Math.round(100 / share) + "人に1人）" : "0.01%未満（ごく少数）");
      var iso = /^[a-z]{3}$/.test(b.iso || "") ? b.iso : "";
      if (o.links && iso) s += '<a class="map-link" href="' + mapEsc((o.hrefPrefix || "") + "c/" + iso + "/index.html") + '" aria-label="' + mapEsc(title) + '">';
      s += '<circle class="map-bubble" data-iso="' + mapEsc(iso) + '" data-name="' + mapEsc(name) + '" data-share="' + share + '" cx="' + xy[0].toFixed(1) + '" cy="' + xy[1].toFixed(1) + '" r="' + r.toFixed(1) + '"><title>' + mapEsc(title) + "</title></circle>";
      if (o.links && iso) s += "</a>";
    });
    if (o.labels) {
      var boxes = [];
      bubbles.slice(0, o.labels).forEach(function (b, i) {
        var xy = project(b.lon, b.lat, W, H), share = +b.share || +b.value || 0, r = mapRadius(share, W);
        var name = (document.documentElement.lang === "en" && b.name_en) || b.name || b.t || "", width = name.length * 10 + 6, x, y, box;
        var places = [[xy[0] + r + 5, xy[1] - 4], [xy[0] - r - width - 5, xy[1] - 4], [xy[0] - width / 2, xy[1] - r - 8], [xy[0] - width / 2, xy[1] + r + 14]];
        for (var k = 0; k < places.length; k++) {
          x = places[k][0]; y = places[k][1]; box = [x - 2, y - 11, x + width + 2, y + 3];
          if (box[0] < 5 || box[2] > W - 5 || box[1] < 5 || box[3] > H - 5) continue;
          if (boxes.some(function (v) { return box[0] < v[2] && box[2] > v[0] && box[1] < v[3] && box[3] > v[1]; })) continue;
          boxes.push(box);
          s += '<text class="map-label' + (i < 4 ? " map-label-primary" : "") + '" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '">' + mapEsc(name) + "</text>";
          break;
        }
      });
    }
    if (o.legend) {
      var values = o.legend.values || [17, 5, 1], lx = 12, ly = H - 82;
      s += '<g class="map-legend"><rect x="' + lx + '" y="' + ly + '" width="' + Math.min(W - 24, 278) + '" height="70" rx="5"/>';
      s += '<text class="map-legend-title" x="' + (lx + 9) + '" y="' + (ly + 15) + '">' + mapEsc(o.legend.title || local("円の大きさ", "Circle size")) + "</text>";
      values.slice(0, 3).forEach(function (v, i) {
        var value = +v || 0, cx = lx + 30 + i * 88, cy = ly + 46, rr = mapRadius(value, W);
        var label = typeof o.legend.format === "function" ? o.legend.format(value) : (typeof o.legend.format === "string" ? o.legend.format.replace("%s", mapShare(value)) : mapShare(value) + "%");
        s += '<circle class="map-legend-circle" cx="' + cx + '" cy="' + cy + '" r="' + rr.toFixed(1) + '"/><text class="map-legend-value" x="' + (cx + 24) + '" y="' + (cy + 4) + '">' + mapEsc(label) + "</text>";
      });
      s += "</g>";
    }
    var marks = o.marks || [];
    if (o.arc && marks.length > 1) {
      var start = project(marks[0].lon, marks[0].lat, W, H), end = project(marks[1].lon, marks[1].lat, W, H);
      s += '<path class="map-arc" d="M' + start[0].toFixed(1) + " " + start[1].toFixed(1) + " Q" + ((start[0] + end[0]) / 2).toFixed(1) + " " + (Math.min(start[1], end[1]) - Math.max(18, Math.abs(end[0] - start[0]) * 0.2)).toFixed(1) + " " + end[0].toFixed(1) + " " + end[1].toFixed(1) + '"/>';
    }
    marks.forEach(function (m, i) {
      var xy = project(m.lon, m.lat, W, H), label = m.text || "", width = Math.min(W - 20, label.length * 11 + 18);
      var bx = Math.max(8, Math.min(W - width - 8, xy[0] + 16)), by = Math.max(6, Math.min(H - 25, xy[1] + (i ? 17 : -33)));
      s += '<circle class="map-mark-ring' + (i ? ' map-mark-residence' : '') + '" cx="' + xy[0].toFixed(1) + '" cy="' + xy[1].toFixed(1) + '" r="10"/><circle class="map-mark-dot' + (i ? ' map-mark-residence' : '') + '" cx="' + xy[0].toFixed(1) + '" cy="' + xy[1].toFixed(1) + '" r="4.5"/>';
      if (label) s += '<path class="map-mark-line" d="M' + (xy[0] + 8).toFixed(1) + ' ' + xy[1].toFixed(1) + ' L' + bx.toFixed(1) + ' ' + (by + 11).toFixed(1) + '"/><rect class="map-mark-box" x="' + bx.toFixed(1) + '" y="' + by.toFixed(1) + '" width="' + width + '" height="22" rx="4"/><text class="map-mark-text" x="' + (bx + 8).toFixed(1) + '" y="' + (by + 15).toFixed(1) + '">' + mapEsc(label) + "</text>";
    });
    return s + "</svg>";
  }

  var api = { scene: scene, room: room, portrait: portrait, worldSVG: worldSVG, seeded: seeded };
  api._refresh = function () {
    var old = pending.slice(); pending.length = 0;
    old.forEach(function (entry) {
      if (!entry[1].isConnected && entry[1].isConnected !== undefined) return;
      api[entry[0]](entry[1], entry[2]);
    });
  };
  window.PIXEL = api;
  var source = document.currentScript && document.currentScript.src;
  if (!source || !document.createElement || !window.requestAnimationFrame) return;
  var version = new URL(source, document.baseURI).search;
  var base = new URL('pixelart/', source);
  var files = ['palette.js', 'sprites.js', 'scene.js', 'renderer.js'];
  function script(name) {
    return new Promise(function (resolve, reject) {
      var tag = document.createElement('script');
      tag.src = new URL(name + version, base).href;
      tag.onload = resolve;
      tag.onerror = function () { reject(new Error('Unable to load ' + name)); };
      document.head.appendChild(tag);
    });
  }
  var promise;
  api.ready = function () {
    if (!promise) {
      promise = files.reduce(function (step, name) { return step.then(function () { return script(name); }); }, Promise.resolve())
        .then(function () { api._refresh(); return api; })
        .catch(function (error) { promise = null; throw error; });
    }
    return promise;
  };
  window.requestAnimationFrame(function () { setTimeout(function () { api.ready().catch(function () {}); }, 0); });
})();
