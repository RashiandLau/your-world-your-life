// 保存済みの表示テーマを、描画前に反映する
(function () {
  try {
    var t = localStorage.getItem("meguri.theme");
    if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
  } catch (e) {}
})();
