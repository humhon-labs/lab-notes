# KO/EN Language Toggle (i18n) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 빌드 없는 정적 사이트에 한국어·영어 언어 토글(KO ⇄ EN)을 얹어 UI·메타·본문을 이중언어로 제공한다.

**Architecture:** 기존 `theme.js`의 localStorage + `<head>` 부트스트랩 패턴을 그대로 복제한다. 새 `assets/lang.js`가 언어 상태와 문자열 사전(`t()`), 메타 선택(`pick()`), 태그 라벨(`tagLabel()`), 토글 배선, 정적 문구(`data-i18n`) 적용을 담당한다. 언어 전환은 `location.reload()`로 처리하며(필터·slug 상태는 URL에 보존됨), 본문은 `content/{slug}.{lang}.md`로 분리하고 영어본이 없으면 한국어로 fallback + 안내 배너를 띄운다.

**Tech Stack:** 순수 HTML/CSS/JS(ES5 스타일, 기존 코드와 동일). 빌드/번들러/npm 없음. `marked.min.js`(v12.0.0, 벤더링) 유지.

## Global Constraints

- **빌드 단계 금지**: 번들러/트랜스파일러/`package.json` 도입 금지. 정적 파일 그대로.
- **외부 런타임 요청 0**: CDN·서드파티 네트워크 호출 금지. `marked.min.js`는 로컬 벤더링(직접 수정 금지).
- **다국어**: UI 문구·콘텐츠는 한국어와 영어를 모두 제공. 소스가 한 언어면 다른 언어는 번역 제공.
- **카테고리 표기 정확히 4종**(중간점 U+00B7 `·`): `AI·Data`, `Backend·Infra`, `Product·Ops`, `PM`. (언어 중립, 변경 금지)
- **코드 스타일**: 기존 파일과 동일한 IIFE + `var` + ES5 스타일 유지. 세미콜론 사용.
- **테스트 방식**: 자동 테스트 프레임워크 없음. 각 태스크는 `python3 -m http.server 4173` 후 `http://localhost:4173`에서 브라우저 수동 검증(또는 Playwright MCP)으로 마무리.

**언어 결정 우선순위(부트스트랩·lang.js 공통):**
```
1. localStorage['labnotes-lang']  ('ko'|'en')     ← 최우선
2. navigator.languages[0] / navigator.language     ← 'ko'로 시작 → ko, 그 외 비어있지 않으면 en
3. 'ko'                                            ← 기본값
```

**window.LabLang 공개 API (Task 1이 정의, Task 2·3이 소비):**
- `LabLang.get()` → `'ko'|'en'` (현재 언어)
- `LabLang.t(key)` → 현재 언어의 UI 문자열 (없으면 ko, 그것도 없으면 key 자체)
- `LabLang.pick(obj)` → `{ko,en}` 객체에서 현재 언어 값 (문자열이면 그대로; 없으면 ko fallback)
- `LabLang.tagLabel(tag)` → 태그 표시 라벨 (사전에 없으면 tag 원값)
- `LabLang.set(lang)` → localStorage 저장 후 `location.reload()`
- `LabLang.applyStatic(root?)` → `data-i18n` / `data-i18n-attr` 속성 채움

---

## File Structure

| 파일 | 책임 |
|------|------|
| `assets/lang.js` (신규) | 언어 상태 + `STRINGS`/`TAG_LABELS` 사전 + `t/pick/tagLabel/get/set/applyStatic` + 토글 배선 |
| `index.html` (수정) | head 언어 부트스트랩, 헤더 `KO\|EN` 토글, 정적 문구 `data-i18n`, `lang.js` 로드 |
| `post.html` (수정) | 동일(부트스트랩·토글·`data-i18n`·`lang.js` 로드) |
| `assets/app.js` (수정) | 목록: `t()` 문구, `pick()` 메타, 이중언어 검색, `tagLabel()` |
| `assets/post.js` (수정) | 상세: `t()` 문구, `pick()` 메타, `{slug}.{lang}.md` fetch + fallback 배너 |
| `data/posts.js` (수정) | 샘플 3개 제거, `title`/`summary` → `{ko,en}` 객체 |
| `assets/style.css` (수정) | `.lang-toggle`, `.lang-banner` 스타일 추가 |
| `assets/theme.js` (수정) | 테마 버튼 `aria-label`을 `t()`로 i18n화 |
| `content/*.md` | 샘플 3개 삭제, 실제 2개 `.ko.md` rename + `.en.md` 신규 |
| `CLAUDE.md` (수정) | 데이터 모델·파일 규칙·구조 갱신 |

---

## Task 1: 언어 코어(`lang.js`) + 정적 UI 이중화 + 토글

**Files:**
- Create: `assets/lang.js`
- Modify: `index.html`, `post.html`, `assets/style.css`

**Interfaces:**
- Produces: `window.LabLang` API(위 Global Constraints 참조). 이후 Task 2·3이 `var L = window.LabLang;`로 소비.

- [ ] **Step 1: `assets/lang.js` 생성 (전체 코드)**

```js
(function () {
  var DEFAULT = 'ko';

  var STRINGS = {
    ko: {
      skip_to_content: '본문으로 건너뛰기',
      tagline: '기술 지식과 실무 경험을 기록하고 공유합니다',
      search_placeholder: '검색: 제목·태그·요약',
      search_aria: '글 검색',
      theme_to_light: '라이트 모드로 전환',
      theme_to_dark: '다크 모드로 전환',
      lang_toggle_aria: '언어 전환 (한국어/English)',
      filters_aria: '필터',
      tag_filter_label: '태그 필터',
      clear: '초기화',
      reset_filters: '필터 초기화',
      empty: '조건에 맞는 글이 없습니다.',
      all: '전체',
      count_suffix: '개의 글',
      read_min_card: '분',
      read_min_full: '분 읽기',
      to_list: '← 목록',
      toc: '목차',
      related: '관련 글',
      no_related: '같은 태그의 다른 글이 아직 없습니다.',
      prev: '← 이전 글',
      next: '다음 글 →',
      copy: '복사',
      copied: '복사됨 ✓',
      not_found_title: '글을 찾을 수 없음',
      not_found_body: '요청한 글을 찾을 수 없습니다. ',
      to_list_link: '목록으로 돌아가기',
      load_error: '본문을 불러오지 못했습니다. 이 사이트는 정적 서버로 열어야 합니다(예: python3 -m http.server). 파일을 직접 연 경우 브라우저 보안 정책으로 마크다운을 불러올 수 없습니다.',
      korean_only_banner: '⚠ 이 글은 한국어로만 제공됩니다 / This article is available in Korean only',
      source_link: '원본 링크 ↗',
      post_title_suffix: ' · Humhon Labs Notes'
    },
    en: {
      skip_to_content: 'Skip to content',
      tagline: 'Recording and sharing technical knowledge and hands-on experience',
      search_placeholder: 'Search: title, tags, summary',
      search_aria: 'Search posts',
      theme_to_light: 'Switch to light mode',
      theme_to_dark: 'Switch to dark mode',
      lang_toggle_aria: 'Toggle language (한국어/English)',
      filters_aria: 'Filters',
      tag_filter_label: 'Tag filter',
      clear: 'Clear',
      reset_filters: 'Reset filters',
      empty: 'No posts match your filters.',
      all: 'All',
      count_suffix: ' posts',
      read_min_card: ' min',
      read_min_full: ' min read',
      to_list: '← List',
      toc: 'Contents',
      related: 'Related posts',
      no_related: 'No other posts share these tags yet.',
      prev: '← Previous',
      next: 'Next →',
      copy: 'Copy',
      copied: 'Copied ✓',
      not_found_title: 'Post not found',
      not_found_body: 'The requested post could not be found. ',
      to_list_link: 'Back to list',
      load_error: 'Failed to load the article. This site must be served over a static server (e.g. python3 -m http.server). If you opened the file directly, the browser blocks loading markdown.',
      korean_only_banner: '⚠ 이 글은 한국어로만 제공됩니다 / This article is available in Korean only',
      source_link: 'Original link ↗',
      post_title_suffix: ' · Humhon Labs Notes'
    }
  };

  var TAG_LABELS = {
    '중요':     { ko: '중요',     en: 'Important' },
    '경제':     { ko: '경제',     en: 'Economy' },
    '기술검토': { ko: '기술검토', en: 'Tech Review' },
    'DevOps':   { ko: 'DevOps',   en: 'DevOps' }
  };

  function detect() {
    try {
      var s = localStorage.getItem('labnotes-lang');
      if (s === 'ko' || s === 'en') return s;
    } catch (e) {}
    try {
      var n = (navigator.languages && navigator.languages[0]) || navigator.language || '';
      if (n.toLowerCase().indexOf('ko') === 0) return 'ko';
      if (n) return 'en';
    } catch (e) {}
    return DEFAULT;
  }

  // 부트스트랩이 심은 data-lang을 신뢰하되, 없으면 여기서 재계산
  var current = document.documentElement.getAttribute('data-lang');
  if (current !== 'ko' && current !== 'en') current = detect();

  function get() { return current; }

  function t(key) {
    var d = STRINGS[current] || STRINGS[DEFAULT];
    if (d && d[key] != null) return d[key];
    if (STRINGS[DEFAULT][key] != null) return STRINGS[DEFAULT][key];
    return key;
  }

  function pick(obj) {
    if (obj == null) return '';
    if (typeof obj === 'string') return obj;
    if (obj[current] != null) return obj[current];
    if (obj[DEFAULT] != null) return obj[DEFAULT];
    return '';
  }

  function tagLabel(tag) {
    var m = TAG_LABELS[tag];
    if (!m) return tag;
    return m[current] != null ? m[current] : (m[DEFAULT] != null ? m[DEFAULT] : tag);
  }

  function set(lang) {
    if (lang !== 'ko' && lang !== 'en') return;
    try { localStorage.setItem('labnotes-lang', lang); } catch (e) {}
    location.reload();
  }

  function applyStatic(root) {
    var scope = root || document;
    scope.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    scope.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      // 형식: "placeholder:search_placeholder;aria-label:search_aria"
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var kv = pair.split(':');
        if (kv.length === 2) el.setAttribute(kv[0].trim(), t(kv[1].trim()));
      });
    });
  }

  function wireToggle() {
    var btn = document.getElementById('lang-toggle');
    if (!btn) return;
    btn.setAttribute('aria-label', t('lang_toggle_aria'));
    btn.innerHTML =
      '<span class="lang-opt' + (current === 'ko' ? ' on' : '') + '">KO</span>' +
      '<span class="lang-sep" aria-hidden="true">|</span>' +
      '<span class="lang-opt' + (current === 'en' ? ' on' : '') + '">EN</span>';
    btn.addEventListener('click', function () { set(current === 'ko' ? 'en' : 'ko'); });
  }

  function init() {
    document.documentElement.setAttribute('lang', current);
    document.documentElement.setAttribute('data-lang', current);
    applyStatic(document);
    wireToggle();
  }

  window.LabLang = { get: get, t: t, pick: pick, tagLabel: tagLabel, set: set, applyStatic: applyStatic };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
```

- [ ] **Step 2: `index.html` — head 부트스트랩 추가**

기존 테마 부트스트랩 `<script>`(9–13행) **바로 아래**에 언어 부트스트랩을 추가:

```html
  <script>
    (function () {
      function detect() {
        try { var s = localStorage.getItem('labnotes-lang'); if (s === 'ko' || s === 'en') return s; } catch (e) {}
        try { var n = (navigator.languages && navigator.languages[0]) || navigator.language || ''; if (n.toLowerCase().indexOf('ko') === 0) return 'ko'; if (n) return 'en'; } catch (e) {}
        return 'ko';
      }
      try { document.documentElement.setAttribute('data-lang', detect()); }
      catch (e) { document.documentElement.setAttribute('data-lang', 'ko'); }
    })();
  </script>
```

- [ ] **Step 3: `index.html` — 정적 문구에 `data-i18n` 부여 + 언어 토글 버튼 + `lang.js` 로드**

다음 요소들을 교체한다(속성만 추가, 기존 텍스트는 fallback용으로 남겨둠):

```html
  <a class="skip-link" href="#content" data-i18n="skip_to_content">본문으로 건너뛰기</a>
```
```html
      <div class="brand-text"><h1>Humhon Labs Notes</h1><small data-i18n="tagline">기술 지식과 실무 경험을 기록하고 공유합니다</small></div>
```
```html
      <div class="search-wrap">
        <input id="search" type="search" placeholder="검색: 제목·태그·요약" aria-label="글 검색" data-i18n-attr="placeholder:search_placeholder;aria-label:search_aria" />
        <span class="kbd-hint" aria-hidden="true">/</span>
      </div>
      <button id="lang-toggle" class="lang-toggle" type="button" aria-label="언어 전환"></button>
      <button id="theme-toggle" class="icon-btn" type="button" aria-label="테마 전환">🌙</button>
```
```html
  <nav class="filters" aria-label="필터" data-i18n-attr="aria-label:filters_aria">
```
```html
      <span class="tag-row-label" data-i18n="tag_filter_label">태그 필터</span>
      <span id="tag-filter" class="tag-filter"></span>
      <button id="clear-tags" class="text-btn" type="button" style="display:none" data-i18n="clear">초기화</button>
```
```html
    <div id="empty-state" class="empty" style="display:none">
      <p data-i18n="empty">조건에 맞는 글이 없습니다.</p>
      <button id="reset-all" class="reset-btn" type="button" data-i18n="reset_filters">필터 초기화</button>
    </div>
```

스크립트 로드 순서 변경 — `data/posts.js` 다음, `app.js` **앞**에 `lang.js`를 넣는다:

```html
  <script src="data/posts.js"></script>
  <script src="assets/lang.js"></script>
  <script src="assets/app.js"></script>
  <script src="assets/theme.js"></script>
```

- [ ] **Step 4: `post.html` — 동일 적용**

head 부트스트랩(Step 2와 동일 블록)을 테마 부트스트랩 아래 추가. 헤더에 언어 토글 + `data-i18n` 부여:

```html
  <a class="skip-link" href="#content" data-i18n="skip_to_content">본문으로 건너뛰기</a>
```
```html
      <span class="brand-text"><strong>Humhon Labs Notes</strong><small data-i18n="tagline">기술 지식과 실무 경험을 기록하고 공유합니다</small></span>
```
```html
    <div class="header-actions">
      <a class="text-btn" href="index.html" data-i18n="to_list">← 목록</a>
      <button id="lang-toggle" class="lang-toggle" type="button" aria-label="언어 전환"></button>
      <button id="theme-toggle" class="icon-btn" type="button" aria-label="테마 전환">🌙</button>
    </div>
```
```html
        <summary class="section-label" data-i18n="toc">목차</summary>
```
```html
        <div class="section-label" data-i18n="related">관련 글</div>
        <ul id="related" class="related-grid"></ul>
        <p id="no-related" class="no-related" style="display:none" data-i18n="no_related">같은 태그의 다른 글이 아직 없습니다.</p>
```

스크립트 로드 순서 — `data/posts.js` 다음, `marked.min.js`/`post.js` 앞에 `lang.js`:

```html
  <script src="data/posts.js"></script>
  <script src="assets/lang.js"></script>
  <script src="assets/marked.min.js"></script>
  <script src="assets/post.js"></script>
  <script src="assets/theme.js"></script>
```

- [ ] **Step 5: `assets/style.css` — 토글/배너 스타일 추가**

`.icon-btn` 규칙(70행 근처) 뒤에 추가:

```css
.lang-toggle {
  background: var(--bg-soft); border: 1px solid var(--border);
  color: var(--text-dim); border-radius: 8px; padding: 6px 10px;
  font-size: 12px; font-weight: 600; letter-spacing: .02em; cursor: pointer;
  display: inline-flex; align-items: center; gap: 5px;
}
.lang-toggle:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.lang-toggle .lang-opt.on { color: var(--accent); }
.lang-toggle .lang-sep { color: var(--border-strong); font-weight: 400; }
.lang-banner {
  margin: 0 0 20px; padding: 10px 14px; border-radius: 8px;
  background: var(--bg-soft); border: 1px solid var(--border);
  color: var(--text-dim); font-size: 13.5px;
}
```

- [ ] **Step 6: `assets/theme.js` — aria-label i18n화**

`var KEY = 'labnotes-theme';`(2행) 아래에 `L` 참조를 추가:

```js
  var L = window.LabLang;
```

`setIcon` 함수의 aria-label 설정(9행)을 교체(하드코딩 한국어 → `t()`):

```js
    btn.setAttribute('aria-label', t === 'dark' ? L.t('theme_to_light') : L.t('theme_to_dark'));
```

(로드 순서상 `theme.js`는 `lang.js` 뒤에 로드되므로 `window.LabLang` 사용 가능. 언어 전환 시 reload되어 현재 언어로 다시 그려진다.)

- [ ] **Step 7: 브라우저 검증**

Run: `python3 -m http.server 4173` → `http://localhost:4173` 접속.

검증 체크리스트:
1. 헤더에 `KO | EN` 토글이 보이고, 현재 언어 쪽이 강조(accent 색)된다.
2. `EN` 클릭 → 페이지 reload 후 skip-link/태그라인/검색 placeholder/"태그 필터"/empty 문구 등 **정적 UI가 영어로** 바뀐다. (카드 목록은 아직 한국어 — Task 2에서 처리)
3. 다시 `KO` 클릭 → 한국어로 복귀. 새로고침해도 마지막 선택 유지(localStorage).
4. DevTools Application → Local Storage에 `labnotes-lang` 저장 확인.
5. `localStorage.removeItem('labnotes-lang')` 후, 브라우저 언어가 영어면 EN, 한국어면 KO로 초기 표시되는지 확인.
6. `<html>` 요소의 `lang`/`data-lang` 속성이 현재 언어와 일치.
7. (DevTools) EN 모드에서 테마 버튼 `aria-label`이 `Switch to light/dark mode`로 표시된다(한국어 잔존 없음).

- [ ] **Step 8: 커밋**

```bash
git add assets/lang.js index.html post.html assets/style.css assets/theme.js
git commit -m "feat(i18n): add lang.js core, KO/EN toggle, and static UI translation

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: 콘텐츠 메타 이중화(`posts.js`) + 목록/상세 렌더 소비 전환

**Files:**
- Modify: `data/posts.js`, `assets/app.js`, `assets/post.js`

**Interfaces:**
- Consumes: `window.LabLang.{get,t,pick,tagLabel}` (Task 1).
- Produces: `window.LAB_NOTES.posts[].title` / `.summary`가 `{ko,en}` 객체. 이후 Task 3(post.js 본문 fetch)이 동일 `posts` 배열을 사용.

- [ ] **Step 1: `data/posts.js` 전체 교체 (샘플 3개 제거 + `{ko,en}` 메타)**

```js
window.LAB_NOTES = {
  posts: [
    {
      slug: 'loop-engineering',
      readMin: 12,
      title: {
        ko: '루프가 되지 마라 — 잠자는 동안 Claude가 일하게 하라',
        en: "Don't Become the Loop — Let Claude Work While You Sleep"
      },
      category: 'AI·Data',
      tags: ['중요', 'DevOps', '기술검토'],
      date: '2026-07-01',
      summary: {
        ko: 'Boris Cherny의 "루프 엔지니어링" — 프롬프트 작성에서 자율 에이전트 루프 설계로 옮겨가는 개발 방식의 진화 정리.',
        en: 'Boris Cherny\'s "loop engineering" — how development is shifting from writing prompts to designing autonomous agent loops.'
      },
      source: 'https://x.com/elcopymaster/status/2071975894290248160'
    },
    {
      slug: 'marc-lou-solo-saas',
      readMin: 6,
      title: {
        ko: '마크 루(Marc Lou)가 혼자서 SaaS·AI 제품을 키운 7가지 방법',
        en: 'How Marc Lou Grew SaaS & AI Products Solo — 7 Methods'
      },
      category: 'Product·Ops',
      tags: ['경제', '중요'],
      date: '2026-06-27',
      summary: {
        ko: '발리 기반 솔로프러너 Marc Lou의 1인 SaaS 성공 방법론 7가지 — 빠른 출시, 결제로 검증, 퍼스널 브랜드와 제품 포트폴리오의 복리 효과.',
        en: 'Bali-based solopreneur Marc Lou\'s 7 methods for solo SaaS success — ship fast, validate with payments, and compound a personal brand with a product portfolio.'
      },
      source: 'https://www.threads.com/@binx_lab/post/DaEwxm1mCG3'
    }
  ]
};
```

- [ ] **Step 2: `assets/app.js` — 상단에 `L` 참조 추가**

3행(`var posts = ...`) **앞**에 추가:

```js
  var L = window.LabLang;
```

- [ ] **Step 3: `assets/app.js` — 카테고리 '전체' 라벨(53행)**

```js
      b.textContent = c === 'all' ? L.t('all') : c;
```

- [ ] **Step 4: `assets/app.js` — 태그 칩 라벨(95행)**

```js
      x.el.innerHTML = (active ? '✓ ' : '') + '#' + escapeHtml(L.tagLabel(x.tag)) + ' <span class="tag-count">' + tagCounts[x.tag] + '</span>';
```

- [ ] **Step 5: `assets/app.js` — 이중언어 검색(108–110행)**

`matches` 함수의 검색 블록을 두 언어 모두 대상으로 교체:

```js
    if (state.q) {
      var both = function (o) { return (o && typeof o === 'object') ? ((o.ko || '') + ' ' + (o.en || '')) : (o || ''); };
      var hay = (both(p.title) + ' ' + both(p.summary) + ' ' + (p.tags || []).join(' ')).toLowerCase();
      if (hay.indexOf(state.q) === -1) return false;
    }
```

- [ ] **Step 6: `assets/app.js` — 카드 렌더(120–126행)**

`card` 함수의 `innerHTML` 조립을 교체(제목·요약 `pick`, 태그 `tagLabel`, 읽기시간 라벨 `t`):

```js
    var tagsHtml = (p.tags || []).map(function (t) { return '<span class="tag">#' + escapeHtml(L.tagLabel(t)) + '</span>'; }).join('');
    a.innerHTML =
      '<div class="card-top"><span class="badge">' + escapeHtml(p.category) + '</span>' +
      '<time>' + escapeHtml(p.date || '') + '</time></div>' +
      '<h2>' + escapeHtml(L.pick(p.title)) + '</h2>' +
      '<p class="summary">' + escapeHtml(L.pick(p.summary)) + '</p>' +
      '<div class="card-foot"><div class="tags">' + tagsHtml + '</div>' +
      '<span class="read-min">' + (p.readMin || 1) + (featured ? L.t('read_min_full') : L.t('read_min_card')) + '</span></div>';
```

- [ ] **Step 7: `assets/app.js` — 결과 카운트(143행)**

```js
    if (countEl) countEl.textContent = filtered.length + L.t('count_suffix');
```

- [ ] **Step 8: `assets/post.js` — 상단에 `L` 참조 추가**

`var params = ...`(2행) 앞에 추가:

```js
  var L = window.LabLang;
```

- [ ] **Step 9: `assets/post.js` — not-found 분기(25–30행)**

```js
  if (!slug || !meta) {
    document.title = L.t('not_found_title') + L.t('post_title_suffix');
    metaEl.innerHTML = '';
    bodyEl.innerHTML = '<p class="notice">' + L.t('not_found_body') + '<a href="index.html">' + L.t('to_list_link') + '</a></p>';
    return;
  }
```

- [ ] **Step 10: `assets/post.js` — 상세 메타 헤더(32–39행)**

```js
  document.title = L.pick(meta.title) + L.t('post_title_suffix');
  var tagsHtml = (meta.tags || []).map(function (t) { return '<span class="tag">#' + esc(L.tagLabel(t)) + '</span>'; }).join('');
  var srcHtml = meta.source ? '<a class="source" href="' + esc(meta.source) + '" target="_blank" rel="noopener">' + L.t('source_link') + '</a>' : '';
  metaEl.innerHTML =
    '<div class="card-top"><span class="badge">' + esc(meta.category) + '</span>' +
    '<span class="post-info">' + (meta.readMin || 1) + L.t('read_min_full') + ' · <time>' + esc(meta.date || '') + '</time></span></div>' +
    '<h1>' + esc(L.pick(meta.title)) + '</h1>' +
    '<div class="tags">' + tagsHtml + '</div>' + srcHtml;
```

- [ ] **Step 11: `assets/post.js` — miniCard(45–48행)**

```js
    a.innerHTML =
      '<div class="mini-top"><span class="badge">' + esc(p.category) + '</span>' +
      '<span class="read-min">' + (p.readMin || 1) + L.t('read_min_card') + '</span></div>' +
      '<div class="mini-title">' + esc(L.pick(p.title)) + '</div>';
```

- [ ] **Step 12: `assets/post.js` — prev/next 카드(79·86행)**

```js
      a.innerHTML = '<div class="pn-label">' + L.t('prev') + '</div><div class="pn-title">' + esc(L.pick(older.title)) + '</div>';
```
```js
      b.innerHTML = '<div class="pn-label">' + L.t('next') + '</div><div class="pn-title">' + esc(L.pick(newer.title)) + '</div>';
```

- [ ] **Step 13: `assets/post.js` — 복사 버튼 문구(144·150·151행)**

```js
      btn.textContent = L.t('copy');
```
```js
        var done = function () {
          btn.textContent = L.t('copied');
          btn.classList.add('copied');
          setTimeout(function () { btn.textContent = L.t('copy'); btn.classList.remove('copied'); }, 1500);
        };
```

> 주의: 이 태스크에서는 본문 fetch 로직(160행 이하)은 아직 변경하지 않는다. `content/{slug}.md`가 그대로 존재하므로 상세 본문은 계속 로드된다. 본문 이중화는 Task 3에서 처리.

- [ ] **Step 14: 브라우저 검증**

Run: `python3 -m http.server 4173` → 접속.

검증 체크리스트:
1. 목록: 샘플 3개가 사라지고 실제 2개(`loop-engineering`, `marc-lou-solo-saas`)만 보인다.
2. `EN` 토글 → 카드 제목/요약/태그(#Important, #Economy 등)/"N posts"/"min read"가 영어로. `KO`로 되돌리면 한국어.
3. 카드 어디에도 `[object Object]`가 없다.
4. 검색창에 `loop`(영문) 또는 `루프`(한글) 입력 시 두 언어 모두에서 해당 글이 검색된다.
5. 카테고리 네비의 `Backend·Infra`·`PM` 클릭 시 empty-state 문구가 (현재 언어로) 표시된다.
6. 글 상세 진입 → 제목/태그/읽기시간/관련·이전·다음/복사 버튼 문구가 현재 언어로 표시(본문은 아직 기존 `.md`).

- [ ] **Step 15: 커밋**

```bash
git add data/posts.js assets/app.js assets/post.js
git commit -m "feat(i18n): bilingual post metadata + list/detail rendering; drop samples

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: 본문 이중화 — content 파일 분리 + `{lang}.md` fetch + fallback 배너

**Files:**
- Delete: `content/postgres-index-tuning.md`, `content/onboarding-metrics.md`, `content/retro-to-action.md`
- Rename: `content/loop-engineering.md` → `.ko.md`, `content/marc-lou-solo-saas.md` → `.ko.md`
- Create: `content/loop-engineering.en.md`, `content/marc-lou-solo-saas.en.md`
- Modify: `assets/post.js` (fetch 블록만)

**Interfaces:**
- Consumes: `window.LabLang.{get,t}` (Task 1). `content/{slug}.{lang}.md` 규약.

- [ ] **Step 1: 샘플 삭제 + 실제 글 rename**

```bash
git rm content/postgres-index-tuning.md content/onboarding-metrics.md content/retro-to-action.md
git mv content/loop-engineering.md content/loop-engineering.ko.md
git mv content/marc-lou-solo-saas.md content/marc-lou-solo-saas.ko.md
```

- [ ] **Step 2: `content/loop-engineering.en.md` 작성 (원문 번역)**

`content/loop-engineering.ko.md`를 Read한 뒤 전문을 영어로 번역해 `content/loop-engineering.en.md`로 저장한다. 번역 원칙:
- 마크다운 **구조를 1:1 보존**(같은 헤딩 레벨/개수, 표·인용구·리스트·`<details>` 그대로).
- **고유명사·기술 용어는 원어 유지**: Boris Cherny, Claude, Anthropic, Loop Engineering, Rafa Gonzalez(@ElCopyMaster). 스페인어 원제(*"Deja de ser el bucle…"*)는 그대로 두고 괄호로 영어 병기.
- 자연스러운 기술 문서 영어체. 한국어 존댓말투는 영어 평서체로.
- 코드블록·URL·수치는 변경 금지.

- [ ] **Step 3: `content/marc-lou-solo-saas.en.md` 작성 (원문 번역)**

`content/marc-lou-solo-saas.ko.md`를 Read한 뒤 동일 원칙으로 영어 번역 저장. 고유명사 유지: Marc Lou, Threads, @binx_lab, SaaS. 금액·수치(월 $80K, 연 $1M 등) 그대로.

- [ ] **Step 4: `assets/post.js` — fetch 블록 교체(160–186행 전체)**

기존 `fetch('content/' + encodeURIComponent(slug) + '.md') ...` 체인을 아래로 교체:

```js
  function finishRender(md, koFallback) {
    var html = marked.parse(md);
    if (koFallback) {
      html = '<div class="lang-banner">' + esc(L.t('korean_only_banner')) + '</div>' + html;
    }
    bodyEl.innerHTML = html;
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
  }

  function showLoadError() {
    bodyEl.innerHTML = '<p class="notice">' + L.t('load_error') + '</p>';
    renderFooter();
  }

  var lang = L.get();
  // 신뢰-콘텐츠 전제: content/*.md는 직접 작성한 문서라 marked 출력을 살균 없이 렌더한다.
  fetch('content/' + encodeURIComponent(slug) + '.' + lang + '.md')
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(function (md) { finishRender(md, false); })
    .catch(function () {
      if (lang === 'ko') { showLoadError(); return; }
      // 영어본이 없으면 한국어로 fallback + 안내 배너
      fetch('content/' + encodeURIComponent(slug) + '.ko.md')
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
        .then(function (md) { finishRender(md, true); })
        .catch(function () { showLoadError(); });
    });
```

- [ ] **Step 5: 브라우저 검증**

Run: `python3 -m http.server 4173` → 접속.

검증 체크리스트:
1. `EN` 모드에서 `loop-engineering`·`marc-lou-solo-saas` 상세 진입 → **영어 본문**이 렌더되고 배너 없음. 목차/표/코드블록/복사 버튼 정상.
2. `KO` 모드에서 같은 글 → 한국어 본문, 배너 없음.
3. (fallback 확인) DevTools Console에서 임시로 영어본이 없는 상황 시뮬레이션: `marc-lou-solo-saas.en.md`를 잠시 다른 이름으로 옮긴 뒤 EN 모드로 상세 진입 → 한국어 본문 + 상단 `⚠ … Korean only` 배너 표시. 확인 후 파일명 복구. (또는 향후 en 없는 신규 글로 확인)
4. 존재하지 않는 slug(`post.html?slug=nope`) → not-found 문구가 현재 언어로.

- [ ] **Step 6: 커밋**

```bash
git add -A content assets/post.js
git commit -m "feat(i18n): per-language article bodies with Korean fallback banner

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: 문서 갱신(`CLAUDE.md`)

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: 구조 섹션에 `lang.js` 추가**

`assets/` 트리의 `theme.js` 줄 아래에 추가:

```
  lang.js       언어 토글·i18n(공통, localStorage 'labnotes-lang', 브라우저 언어 감지, 기본 ko)
```

- [ ] **Step 2: 데이터 모델 섹션 갱신**

각 글 객체 설명을 이중언어 반영으로 교체:

```markdown
각 글 객체: `{ slug, readMin, title{ko,en}, category, tags[], date('YYYY-MM-DD'), summary{ko,en}, source? }`
- `title`·`summary`는 `{ ko, en }` 객체. `assets/lang.js`의 `LabLang.pick()`이 현재 언어 값을 고른다(en 없으면 ko fallback).
- `tags` 값은 언어 중립 키. 표시 라벨은 `lang.js`의 `TAG_LABELS` 사전으로 매핑(사전에 없으면 값 그대로). 필터·검색·URL 공유는 태그 값 기준.
- `category`는 4종 고정(언어 중립). 목록/상세 검색은 두 언어(ko+en) 모두를 대상으로 한다.
```

- [ ] **Step 3: 파일 규칙 갱신**

`slug` 관련 줄과 글 추가 방법을 교체:

```markdown
- `slug` = `content/{slug}.{lang}.md` 파일명과 일치. (`ko`=필수, `en`=권장)
- 상세 본문은 현재 언어의 `{slug}.{lang}.md`를 fetch하며, 영어본이 없으면 `{slug}.ko.md`로 fallback하고 상단에 안내 배너를 띄운다.
```

글 추가 방법 1번 항목을 교체:

```markdown
1. `content/<slug>.ko.md`에 한국어 본문 작성(필수). 영어본은 `content/<slug>.en.md`로 작성(권장; 없으면 한국어 fallback + 배너). 본문은 신뢰 전제로 살균 없이 렌더.
```

글 추가 방법 2번 항목을 교체:

```markdown
2. `data/posts.js`의 `posts` 배열에 항목 추가. `title`·`summary`는 `{ ko, en }` 객체로, 카테고리 표기 정확히.
```

언어 토글을 규칙 섹션에 한 줄 추가:

```markdown
- 다국어는 **언어 토글**(KO⇄EN)로 제공한다. 병기하지 않는다. UI 문구는 `lang.js`의 `t()` 사전으로 관리한다.
```

- [ ] **Step 4: 배경 문서 링크에 이번 spec/plan 추가**

`## 배경 문서` 목록에 추가:

```markdown
- 다국어 설계: `docs/superpowers/specs/2026-07-02-lab-notes-i18n-language-toggle-design.md`
- 다국어 구현 계획: `docs/superpowers/plans/2026-07-02-lab-notes-i18n-language-toggle.md`
```

- [ ] **Step 5: 커밋**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for KO/EN i18n data model and file conventions

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## 완료 기준 (전체)

- 모든 페이지에서 `KO|EN` 토글이 동작하고 선택이 유지되며, 최초 방문 시 브라우저 언어로 기본값이 잡힌다.
- UI 문구·카드 메타·태그 라벨·상세 메타가 선택 언어로 표시된다(`[object Object]` 없음).
- 실제 글 2개는 본문까지 한·영 이중언어. 영어본 없는 글은 한국어 + 배너로 fallback.
- 샘플 3개는 목록·content에서 제거됨.
- 빌드 없이 `python3 -m http.server`로 그대로 동작. 외부 요청·npm 의존성 0.
