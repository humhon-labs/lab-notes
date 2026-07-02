(function () {
  var params = new URLSearchParams(location.search);
  var slug = params.get('slug');
  var posts = ((window.LAB_NOTES && window.LAB_NOTES.posts) || []).slice();
  posts.sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
  var idx = posts.map(function (p) { return p.slug; }).indexOf(slug);
  var meta = idx !== -1 ? posts[idx] : null;

  var metaEl = document.getElementById('post-meta');
  var bodyEl = document.getElementById('post-body');
  var tocWrapEl = document.getElementById('toc-wrap');
  var tocEl = document.getElementById('toc');
  var footerEl = document.getElementById('post-footer');
  var relatedEl = document.getElementById('related');
  var noRelatedEl = document.getElementById('no-related');
  var prevNextEl = document.getElementById('prev-next');
  var progressEl = document.getElementById('read-progress');

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  if (!slug || !meta) {
    document.title = '글을 찾을 수 없음 · Humhon Labs Notes';
    metaEl.innerHTML = '';
    bodyEl.innerHTML = '<p class="notice">요청한 글을 찾을 수 없습니다. <a href="index.html">목록으로 돌아가기</a></p>';
    return;
  }

  document.title = meta.title + ' · Humhon Labs Notes';
  var tagsHtml = (meta.tags || []).map(function (t) { return '<span class="tag">#' + esc(t) + '</span>'; }).join('');
  var srcHtml = meta.source ? '<a class="source" href="' + esc(meta.source) + '" target="_blank" rel="noopener">원본 링크 ↗</a>' : '';
  metaEl.innerHTML =
    '<div class="card-top"><span class="badge">' + esc(meta.category) + '</span>' +
    '<span class="post-info">' + (meta.readMin || 1) + '분 읽기 · <time>' + esc(meta.date || '') + '</time></span></div>' +
    '<h1>' + esc(meta.title) + '</h1>' +
    '<div class="tags">' + tagsHtml + '</div>' + srcHtml;

  function miniCard(p) {
    var a = document.createElement('a');
    a.className = 'mini-card';
    a.href = 'post.html?slug=' + encodeURIComponent(p.slug);
    a.innerHTML =
      '<div class="mini-top"><span class="badge">' + esc(p.category) + '</span>' +
      '<span class="read-min">' + (p.readMin || 1) + '분</span></div>' +
      '<div class="mini-title">' + esc(p.title) + '</div>';
    return a;
  }

  function renderFooter() {
    footerEl.style.display = '';
    var related = posts
      .filter(function (p) { return p.slug !== slug; })
      .map(function (p) {
        var shared = (p.tags || []).filter(function (t) { return (meta.tags || []).indexOf(t) !== -1; }).length;
        return { p: p, shared: shared };
      })
      .filter(function (x) { return x.shared > 0; })
      .sort(function (a, b) { return b.shared - a.shared || (b.p.date || '').localeCompare(a.p.date || ''); })
      .slice(0, 2);

    relatedEl.innerHTML = '';
    related.forEach(function (x) {
      var li = document.createElement('li');
      li.appendChild(miniCard(x.p));
      relatedEl.appendChild(li);
    });
    noRelatedEl.style.display = related.length ? 'none' : '';

    var newer = idx > 0 ? posts[idx - 1] : null;
    var older = idx < posts.length - 1 ? posts[idx + 1] : null;
    prevNextEl.innerHTML = '';
    if (older) {
      var a = document.createElement('a');
      a.className = 'pn-card prev';
      a.href = 'post.html?slug=' + encodeURIComponent(older.slug);
      a.innerHTML = '<div class="pn-label">← 이전 글</div><div class="pn-title">' + esc(older.title) + '</div>';
      prevNextEl.appendChild(a);
    }
    if (newer) {
      var b = document.createElement('a');
      b.className = 'pn-card next';
      b.href = 'post.html?slug=' + encodeURIComponent(newer.slug);
      b.innerHTML = '<div class="pn-label">다음 글 →</div><div class="pn-title">' + esc(newer.title) + '</div>';
      prevNextEl.appendChild(b);
    }
  }

  function buildToc() {
    var heads = bodyEl.querySelectorAll('h2');
    if (!heads.length) return;
    tocWrapEl.style.display = '';
    var details = document.getElementById('toc-details');
    if (details && window.matchMedia('(max-width: 860px)').matches) details.open = false;
    tocEl.innerHTML = '';
    heads.forEach(function (h, i) {
      h.id = 'sec-' + i;
      var a = document.createElement('a');
      a.className = 'toc-link';
      a.href = '#sec-' + i;
      a.textContent = h.textContent;
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var top = h.getBoundingClientRect().top + window.scrollY - 84;
        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
        history.replaceState(null, '', location.pathname + location.search + '#sec-' + i);
      });
      tocEl.appendChild(a);
    });
  }

  var raf = null;
  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = null;
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
      if (progressEl) progressEl.style.width = pct + '%';
      var active = null;
      bodyEl.querySelectorAll('h2[id]').forEach(function (h) {
        if (h.getBoundingClientRect().top < 140) active = h.id;
      });
      var links = tocEl.querySelectorAll('.toc-link');
      if (!active && links.length) active = 'sec-0';
      links.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + active);
      });
    });
  }

  function injectCopyButtons() {
    bodyEl.querySelectorAll('pre').forEach(function (pre) {
      if (pre.dataset.copyReady) return;
      pre.dataset.copyReady = '1';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-btn';
      btn.setAttribute('aria-live', 'polite');
      btn.textContent = '복사';
      btn.addEventListener('click', function () {
        var code = pre.querySelector('code');
        var text = code ? code.textContent : pre.textContent;
        var done = function () {
          btn.textContent = '복사됨 ✓';
          btn.classList.add('copied');
          setTimeout(function () { btn.textContent = '복사'; btn.classList.remove('copied'); }, 1500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(done);
        else done();
      });
      pre.appendChild(btn);
    });
  }

  fetch('content/' + encodeURIComponent(slug) + '.md')
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
    // 신뢰-콘텐츠 전제: content/*.md는 직접 작성한 문서라 marked 출력을 살균 없이 렌더한다
    // (콜아웃/표/<details> 등 의도한 HTML 통과 필요). 외부 기여 마크다운을 받게 되면 살균기를 추가할 것.
    .then(function (md) {
      bodyEl.innerHTML = marked.parse(md);
      // 표는 div로 감싸 가로 스크롤을 처리한다 (table에 display:block을 주면 표 시맨틱이 깨짐)
      bodyEl.querySelectorAll('table').forEach(function (t) {
        var wrap = document.createElement('div');
        wrap.className = 'table-wrap';
        t.parentNode.insertBefore(wrap, t);
        wrap.appendChild(t);
      });
      buildToc();
      injectCopyButtons();
      renderFooter();
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      if (location.hash) {
        var target = document.getElementById(location.hash.slice(1));
        if (target) target.scrollIntoView();
      }
    })
    .catch(function () {
      bodyEl.innerHTML = '<p class="notice">본문을 불러오지 못했습니다. 이 사이트는 정적 서버로 열어야 합니다(예: <code>python3 -m http.server</code>). 파일을 직접 연 경우 브라우저 보안 정책으로 마크다운을 불러올 수 없습니다.</p>';
      renderFooter();
    });
})();
