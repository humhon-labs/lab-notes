(function () {
  var KEY = 'labnotes-theme';
  var L = window.LabLang;
  var btn = document.getElementById('theme-toggle');
  if (!btn) return;
  function current() { return document.documentElement.getAttribute('data-theme') || 'dark'; }
  function setIcon() {
    var t = current();
    btn.textContent = t === 'dark' ? '☀️' : '🌙';
    btn.setAttribute('aria-label', t === 'dark' ? L.t('theme_to_light') : L.t('theme_to_dark'));
  }
  setIcon();
  btn.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem(KEY, next); } catch (e) {}
    setIcon();
  });
})();
