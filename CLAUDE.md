# CLAUDE.md — Humhon Labs Notes

이 저장소에서 작업하는 Claude Code(및 사람)를 위한 프로젝트 가이드. clone하면 이 규칙이 함께 따라온다.
(개인 전역 설정은 각자 `~/.claude/CLAUDE.md`에 있으며 이 파일과 별개다.)

## 프로젝트

기술 문서/노트를 리스트·카테고리·태그·검색으로 탐색·공유하는 **빌드 없는 정적 사이트**. 순수 HTML/CSS/JS.

## 규칙 (중요)

- UI 문구와 콘텐츠(사이트 결과물)는 **한국어**와 **영어**를 동시에 제공한다. 작업 중 대화(에이전트 응답)는 **한국어**로 한다.
- 소스 컨텐츠가 하나의 언어만 제공하면 다른 언어는 번역하여 제공한다.
- 다국어는 **언어 토글**(KO⇄EN)로 제공하며 병기하지 않는다. UI 문구는 `assets/lang.js`의 `STRINGS`/`t()` 사전으로 관리한다.
- **빌드 단계를 도입하지 않는다.** 번들러/트랜스파일러/`package.json` 금지. 정적 파일 그대로 배포한다.
- 외부 런타임 요청 없음: 서드파티 JS는 CDN이 아니라 로컬에 **벤더링**한다 (`assets/marked.min.js` = marked v12.0.0, 직접 수정 금지).
- 부득이 npm 의존성을 추가하게 되면 버전을 `^`/`~` 없이 **정확히 고정**하고, 설치는 `npm ci`를 기본으로 하며, 사용자 확인 후 진행한다.

## 실행 / 확인

```bash
python3 -m http.server 4173   # → http://localhost:4173
```
글 본문을 `content/*.md`에서 fetch하므로 반드시 정적 서버로 연다. `file://` 더블클릭은 목록만 뜨고 상세 본문은 로드되지 않는다.

## 구조

```
index.html          목록: 카테고리 네비 + 태그(AND) 필터 + 검색
post.html           상세: ?slug=... 마크다운 렌더
assets/
  style.css         다크/라이트 테마(CSS 커스텀 프로퍼티), 레이아웃, 마크다운 스타일
  app.js            목록 로직(필터·검색·렌더)
  post.js           상세 로직({slug}.{lang}.md fetch + marked 렌더, 영어본 없으면 ko fallback)
  theme.js          테마 토글(공통, localStorage 'labnotes-theme', 기본 dark)
  lang.js           언어 토글·i18n(공통, localStorage 'labnotes-lang', 브라우저 언어 감지, 기본 ko)
  marked.min.js     벤더링된 마크다운 파서 (marked v12.0.0)
data/posts.js       글 메타데이터 전역: window.LAB_NOTES = { posts: [...] }
content/*.md        글 본문 (slug ↔ {slug}.{lang}.md, ko 필수·en 선택)
scripts/            훅: validate-posts.py(PostToolUse 데이터 검증), guard-files.py(PreToolUse 금지파일 가드)
docs/superpowers/   설계 spec + 구현 plan
```

## 데이터 모델 (`data/posts.js`)

각 글 객체: `{ slug, readMin, title{ko,en}, category, tags[], date('YYYY-MM-DD'), summary{ko,en}, source? }`
- `slug` = `content/{slug}.{lang}.md` 파일명과 일치 (`ko` 필수, `en` 선택).
- `title`·`summary`는 `{ ko, en }` 객체. `assets/lang.js`의 `LabLang.pick()`이 현재 언어 값을 고른다(en 없으면 ko fallback).
- `readMin` = 예상 읽기 시간(분, 숫자). 목록 카드·상세 헤더에 "N분 읽기 / N min read"로 표시, 생략 시 1로 취급.
- `category`는 정확히 다음 4종 중 하나 (중간점은 U+00B7 `·`): `AI·Data`, `Backend·Infra`, `Product·Ops`, `PM`. (언어 중립)
- `tags` 값은 언어 중립 키. 표시 라벨은 `lang.js`의 `TAG_LABELS` 사전으로 매핑(사전에 없으면 값 그대로). 필터·검색·URL 공유는 태그 값 기준.
- 목록은 `date` 내림차순 정렬. 카테고리·태그·검색은 서로 AND로 함께 적용하되, **태그 다중 선택은 OR**(선택한 태그 중 하나라도 포함하면 노출). 검색은 두 언어(ko+en)를 모두 대상으로 한다.

## 글 추가 방법

1. `content/<slug>.ko.md`에 한국어 본문(GFM 마크다운) 작성(필수). 영어본은 `content/<slug>.en.md`로 작성(권장; 없으면 상세에서 한국어 fallback + 안내 배너). 콜아웃은 인용구(`>`), 표는 GFM 표로. **본문은 신뢰 전제로 살균 없이 렌더**되므로 신뢰할 수 있는 내용만 넣는다 (`post.js`가 `<details>` 등 HTML을 통과시킴).
2. `data/posts.js`의 `posts` 배열에 항목 추가. `title`·`summary`는 `{ ko, en }` 객체로, 카테고리 표기 정확히. 새 태그를 쓰면 `lang.js`의 `TAG_LABELS`에 라벨을 추가한다.
3. `python3 -m http.server`로 KO/EN 목록·상세 확인 후 커밋. (저장 시 `scripts/validate-posts.py` 훅이 데이터 모델을 자동 검증한다.)

## 배경 문서

- 설계: `docs/superpowers/specs/2026-07-01-lab-notes-tech-docs-site-design.md`
- 구현 계획: `docs/superpowers/plans/2026-07-01-lab-notes-tech-docs-site.md`
- 다국어 설계: `docs/superpowers/specs/2026-07-02-lab-notes-i18n-language-toggle-design.md`
- 다국어 구현 계획: `docs/superpowers/plans/2026-07-02-lab-notes-i18n-language-toggle.md`
