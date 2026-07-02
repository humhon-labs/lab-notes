(function () {
  var CATEGORIES = ['AI·Data', 'Backend·Infra', 'Product·Ops', 'PM'];
  var posts = (window.LAB_NOTES && window.LAB_NOTES.posts) ? window.LAB_NOTES.posts.slice() : [];
  posts.sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });

  var state = { category: 'all', tags: new Set(), q: '' };
  (function () {
    try {
      var p = new URLSearchParams(location.search);
      var cat = p.get('cat');
      if (cat && (cat === 'all' || CATEGORIES.indexOf(cat) !== -1)) state.category = cat;
      if (p.get('tags')) p.get('tags').split(',').filter(Boolean).forEach(function (t) { state.tags.add(t); });
      if (p.get('q')) state.q = p.get('q').toLowerCase();
    } catch (e) {}
  })();

  var navEl = document.getElementById('category-nav');
  var tagsEl = document.getElementById('tag-filter');
  var featuredEl = document.getElementById('featured');
  var listEl = document.getElementById('post-list');
  var emptyEl = document.getElementById('empty-state');
  var searchEl = document.getElementById('search');
  var clearBtn = document.getElementById('clear-tags');
  var resetBtn = document.getElementById('reset-all');
  var countEl = document.getElementById('result-count');

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function syncUrl() {
    try {
      var p = new URLSearchParams(location.search);
      ['cat', 'tags', 'q'].forEach(function (k) { p.delete(k); });
      if (state.category !== 'all') p.set('cat', state.category);
      if (state.tags.size) p.set('tags', Array.from(state.tags).join(','));
      if (state.q) p.set('q', state.q);
      var qs = p.toString();
      history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
    } catch (e) {}
  }

  // 필터 버튼은 최초 1회만 생성하고 이후 클래스/텍스트만 갱신한다
  // (재생성하면 키보드 포커스가 body로 튕겨 키보드 사용자가 처음부터 다시 탐색해야 함)
  var navBtns = [];
  function buildNav() {
    ['all'].concat(CATEGORIES).forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'cat-tab';
      b.textContent = c === 'all' ? '전체' : c;
      b.addEventListener('click', function () { state.category = c; syncUrl(); updateNav(); render(); });
      navEl.appendChild(b);
      navBtns.push({ cat: c, el: b });
    });
    updateNav();
  }
  function updateNav() {
    navBtns.forEach(function (x) {
      var active = state.category === x.cat;
      x.el.classList.toggle('active', active);
      x.el.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  var tagCounts = (function () {
    var counts = {};
    posts.forEach(function (p) { (p.tags || []).forEach(function (t) { counts[t] = (counts[t] || 0) + 1; }); });
    return counts;
  })();
  var allTags = Object.keys(tagCounts).sort(function (a, b) { return a.localeCompare(b, 'ko'); });

  var tagBtns = [];
  function buildTags() {
    allTags.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'tag-chip';
      b.addEventListener('click', function () {
        if (state.tags.has(t)) state.tags.delete(t); else state.tags.add(t);
        syncUrl(); updateTags(); render();
      });
      tagsEl.appendChild(b);
      tagBtns.push({ tag: t, el: b });
    });
    updateTags();
  }
  function updateTags() {
    tagBtns.forEach(function (x) {
      var active = state.tags.has(x.tag);
      x.el.classList.toggle('active', active);
      x.el.setAttribute('aria-pressed', active ? 'true' : 'false');
      x.el.innerHTML = (active ? '✓ ' : '') + '#' + escapeHtml(x.tag) + ' <span class="tag-count">' + tagCounts[x.tag] + '</span>';
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

  function card(p, featured) {
    var a = document.createElement('a');
    a.className = 'card' + (featured ? ' featured' : '');
    a.href = 'post.html?slug=' + encodeURIComponent(p.slug);
    var tagsHtml = (p.tags || []).map(function (t) { return '<span class="tag">#' + escapeHtml(t) + '</span>'; }).join('');
    a.innerHTML =
      '<div class="card-top"><span class="badge">' + escapeHtml(p.category) + '</span>' +
      '<time>' + escapeHtml(p.date || '') + '</time></div>' +
      '<h2>' + escapeHtml(p.title) + '</h2>' +
      '<p class="summary">' + escapeHtml(p.summary || '') + '</p>' +
      '<div class="card-foot"><div class="tags">' + tagsHtml + '</div>' +
      '<span class="read-min">' + (p.readMin || 1) + (featured ? '분 읽기' : '분') + '</span></div>';
    return a;
  }

  function render() {
    var filtered = posts.filter(matches);
    featuredEl.innerHTML = '';
    listEl.innerHTML = '';
    if (filtered.length) {
      featuredEl.appendChild(card(filtered[0], true));
      filtered.slice(1).forEach(function (p) {
        var li = document.createElement('li');
        li.appendChild(card(p, false));
        listEl.appendChild(li);
      });
    }
    emptyEl.style.display = filtered.length ? 'none' : '';
    if (countEl) countEl.textContent = filtered.length + '개의 글';
  }

  searchEl.value = state.q;
  searchEl.addEventListener('input', function () { state.q = searchEl.value.trim().toLowerCase(); syncUrl(); render(); });
  clearBtn.addEventListener('click', function () { state.tags.clear(); syncUrl(); updateTags(); render(); });
  resetBtn.addEventListener('click', function () {
    state.tags.clear(); state.category = 'all'; state.q = ''; searchEl.value = '';
    syncUrl(); updateNav(); updateTags(); render();
  });

  window.addEventListener('keydown', function (e) {
    if (e.key !== '/') return;
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    e.preventDefault();
    searchEl.focus();
  });

  buildNav();
  buildTags();
  render();
})();
