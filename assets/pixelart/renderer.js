/* Cached high resolution renderer. Loaded after the first paint. */
(function () {
  'use strict';
  var api = window.PIXEL, composer = window.PIXELART_SCENE, data = window.PIXELART_DATA;
  var palette = window.PIXELART_PALETTE;
  if (!api || !composer || !data || !palette) return;
  var cache = {}, order = [], MAX = 72, hits = 0, misses = 0;
  function rect(ctx, x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }
  function portrait(ctx, o) {
    var p = palette.forScene(o), skin = (data.skinTones || ['#ad7856'])[(Math.abs(o.seed || 0) + (o.age || 0)) % ((data.skinTones || ['#ad7856']).length)];
    rect(ctx, 0, 0, 48, 56, p.skyLow);
    rect(ctx, 0, 40, 48, 16, p.mid);
    rect(ctx, 4, 53, 40, 3, p.shadow);
    if (data.drawPortrait) data.drawPortrait(ctx, o, p);
    else {
      rect(ctx, 9, 40, 30, 16, p.roof);
      rect(ctx, 13, 9, 22, 32, skin);
      rect(ctx, 12, 7, 24, 6, p.shadow);
      rect(ctx, 18, 24, 2, 2, p.shadow); rect(ctx, 28, 24, 2, 2, p.shadow);
      rect(ctx, 22, 32, 5, 2, p.roof);
    }
  }
  function render(kind, canvas, opts) {
    opts = opts || {};
    var w = kind === 'portrait' ? 48 : 320, h = kind === 'room' ? 100 : kind === 'portrait' ? 56 : 112;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    var key = kind + ':' + JSON.stringify(opts), image = cache[key];
    if (!image) {
      image = document.createElement('canvas'); image.width = w; image.height = h;
      var ctx = image.getContext('2d');
      if (kind === 'scene') composer.drawScene(ctx, opts, data);
      else if (kind === 'room') composer.drawRoom(ctx, opts, data);
      else portrait(ctx, opts);
      cache[key] = image; order.push(key); misses++;
      if (order.length > MAX) delete cache[order.shift()];
    } else hits++;
    var target = canvas.getContext('2d');
    target.imageSmoothingEnabled = false;
    target.drawImage(image, 0, 0);
    return canvas;
  }
  api.scene = function (canvas, opts) { return render('scene', canvas, opts); };
  api.room = function (canvas, opts) { return render('room', canvas, opts); };
  api.portrait = function (canvas, opts) { return render('portrait', canvas, opts); };
  api._cacheStats = function () { return { hits: hits, misses: misses, size: order.length }; };
  api.highResolution = true;
})();
