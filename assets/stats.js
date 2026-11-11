/* Shared display rules for percentages. Inputs are percentage points, not fractions. */
(function () {
  'use strict';
  function percent(value, kind, digits) {
    var n = Number(value);
    if (value == null || !isFinite(n)) return '—';
    var places = digits == null ? 1 : Math.max(0, Math.min(3, Math.floor(digits)));
    var unit = Math.pow(10, -places);
    var bounded = kind === 'risk' || kind === 'survival' || kind === 'bounded';
    if (bounded) n = Math.max(0, Math.min(100, n));
    if (n > 0 && n < unit / 2) return '<' + unit.toFixed(places) + '%';
    if (bounded && n < 100 && n >= 100 - unit / 2) return '>' + (100 - unit).toFixed(places) + '%';
    var rounded = n.toFixed(places);
    if (places) rounded = rounded.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
    return rounded + '%';
  }
  window.STATS = { percent: percent };
})();
