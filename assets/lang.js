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
    // 기존 글에서 쓰는 관리용 태그
    '중요':     { ko: '중요',     en: 'Important' },
    '경제':     { ko: '경제',     en: 'Economy' },
    '기술검토': { ko: '기술검토', en: 'Tech Review' },
    'DevOps':   { ko: 'DevOps',   en: 'DevOps' },
    // 본문 주제 기반 태그 (언어 중립 kebab 키)
    'llm':            { ko: 'LLM',          en: 'LLM' },
    'rag':            { ko: 'RAG',          en: 'RAG' },
    'knowledge-mgmt': { ko: '지식관리',     en: 'Knowledge Mgmt' },
    'obsidian':       { ko: 'Obsidian',     en: 'Obsidian' },
    'ai-agent':       { ko: 'AI 에이전트',  en: 'AI Agent' },
    'agent-skills':   { ko: 'Agent Skills', en: 'Agent Skills' },
    'claude-code':    { ko: 'Claude Code',  en: 'Claude Code' },
    'automation':     { ko: '자동화',       en: 'Automation' },
    'architecture':   { ko: '아키텍처',     en: 'Architecture' }
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
