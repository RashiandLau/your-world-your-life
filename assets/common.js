// 全ページ共通：先頭へ戻るボタンと表示テーマの切り替え
(function () {
  function labelFor(mode) {
    var english = document.documentElement.lang === "en";
    var labels = english ? { auto: "Display: automatic", light: "Display: light", dark: "Display: dark" } : { auto: "画面：自動", light: "画面：明るい", dark: "画面：暗い" };
    return labels[mode] || labels.auto;
  }
  var top = document.getElementById("toTop");
  if (top) {
    var onScroll = function () { top.classList.toggle("show", window.scrollY > 600); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  }
  var order = ["auto", "light", "dark"];
  window.MEGURI_THEME = {
    get: function () {
      try { return localStorage.getItem("meguri.theme") || "auto"; } catch (e) { return "auto"; }
    },
    cycle: function () {
      var next = order[(order.indexOf(this.get()) + 1) % order.length];
      try { localStorage.setItem("meguri.theme", next); } catch (e) {}
      if (next === "auto") document.documentElement.removeAttribute("data-theme");
      else document.documentElement.setAttribute("data-theme", next);
      return labelFor(next);
    },
    label: function () { return labelFor(this.get()); }
  };
  document.querySelectorAll("[data-theme-toggle]").forEach(function (b) {
    b.title = window.MEGURI_THEME.label();
    b.addEventListener("click", function () { b.title = window.MEGURI_THEME.cycle(); });
  });
})();
