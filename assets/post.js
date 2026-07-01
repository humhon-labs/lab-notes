(function () {
  var params = new URLSearchParams(location.search);
  var slug = params.get('slug');
  var posts = (window.LAB_NOTES && window.LAB_NOTES.posts) || [];
  var meta = posts.filter(function (p) { return p.slug === slug; })[0];

  var metaEl = document.getElementById('post-meta');
  var bodyEl = document.getElementById('post-body');

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
    '<div class="card-top"><span class="badge">' + esc(meta.category) + '</span><time>' + esc(meta.date || '') + '</time></div>' +
    '<h1>' + esc(meta.title) + '</h1>' +
    '<div class="tags">' + tagsHtml + '</div>' + srcHtml;

  fetch('content/' + encodeURIComponent(slug) + '.md')
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(function (md) { bodyEl.innerHTML = marked.parse(md); })
    .catch(function () {
      bodyEl.innerHTML = '<p class="notice">본문을 불러오지 못했습니다. 이 사이트는 정적 서버로 열어야 합니다(예: <code>python3 -m http.server</code>). 파일을 직접 연 경우 브라우저 보안 정책으로 마크다운을 불러올 수 없습니다.</p>';
    });
})();
