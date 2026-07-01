(function () {
  var CATEGORIES = ['AI·Data', 'Backend·Infra', 'Product·Ops', 'PM'];
  var posts = (window.LAB_NOTES && window.LAB_NOTES.posts) ? window.LAB_NOTES.posts.slice() : [];
  posts.sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });

  var state = { category: 'all', tags: new Set(), q: '' };

  var navEl = document.getElementById('category-nav');
  var tagsEl = document.getElementById('tag-filter');
  var listEl = document.getElementById('post-list');
  var emptyEl = document.getElementById('empty-state');
  var searchEl = document.getElementById('search');
  var clearBtn = document.getElementById('clear-tags');
  var countEl = document.getElementById('result-count');

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderNav() {
    var cats = ['all'].concat(CATEGORIES);
    navEl.innerHTML = '';
    cats.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'cat-btn' + (state.category === c ? ' active' : '');
      b.textContent = c === 'all' ? '전체' : c;
      b.setAttribute('aria-pressed', state.category === c ? 'true' : 'false');
      b.addEventListener('click', function () { state.category = c; renderNav(); render(); });
      navEl.appendChild(b);
    });
  }

  var allTags = (function () {
    var counts = {};
    posts.forEach(function (p) { (p.tags || []).forEach(function (t) { counts[t] = (counts[t] || 0) + 1; }); });
    return Object.keys(counts).sort(function (a, b) { return a.localeCompare(b, 'ko'); });
  })();

  function renderTags() {
    tagsEl.innerHTML = '';
    allTags.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'tag-chip' + (state.tags.has(t) ? ' active' : '');
      b.textContent = '#' + t;
      b.setAttribute('aria-pressed', state.tags.has(t) ? 'true' : 'false');
      b.addEventListener('click', function () {
        if (state.tags.has(t)) state.tags.delete(t); else state.tags.add(t);
        renderTags(); render();
      });
      tagsEl.appendChild(b);
    });
    clearBtn.style.display = state.tags.size ? '' : 'none';
  }

  function matches(p) {
    if (state.category !== 'all' && p.category !== state.category) return false;
    if (state.tags.size) {
      var pt = p.tags || [];
      var ok = true;
      state.tags.forEach(function (t) { if (pt.indexOf(t) === -1) ok = false; });
      if (!ok) return false;
    }
    if (state.q) {
      var hay = (p.title + ' ' + (p.summary || '') + ' ' + (p.tags || []).join(' ')).toLowerCase();
      if (hay.indexOf(state.q) === -1) return false;
    }
    return true;
  }

  function card(p) {
    var a = document.createElement('a');
    a.className = 'card';
    a.href = 'post.html?slug=' + encodeURIComponent(p.slug);
    var tagsHtml = (p.tags || []).map(function (t) { return '<span class="tag">#' + escapeHtml(t) + '</span>'; }).join('');
    a.innerHTML =
      '<div class="card-top"><span class="badge">' + escapeHtml(p.category) + '</span>' +
      '<time>' + escapeHtml(p.date || '') + '</time></div>' +
      '<h2>' + escapeHtml(p.title) + '</h2>' +
      '<p class="summary">' + escapeHtml(p.summary || '') + '</p>' +
      '<div class="tags">' + tagsHtml + '</div>';
    return a;
  }

  function render() {
    var filtered = posts.filter(matches);
    listEl.innerHTML = '';
    filtered.forEach(function (p) { listEl.appendChild(card(p)); });
    emptyEl.style.display = filtered.length ? 'none' : '';
    if (countEl) countEl.textContent = filtered.length + '개의 글';
  }

  searchEl.addEventListener('input', function () { state.q = searchEl.value.trim().toLowerCase(); render(); });
  clearBtn.addEventListener('click', function () { state.tags.clear(); renderTags(); render(); });

  renderNav();
  renderTags();
  render();
})();
