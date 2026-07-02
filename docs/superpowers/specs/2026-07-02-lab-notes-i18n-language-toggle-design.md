# Humhon Labs Notes — 다국어(KO ⇄ EN) 언어 토글 설계

- 작성일: 2026-07-02
- 상태: 승인됨 (구현 대기)
- 저장소: `lab-notes`
- 배경 규칙: `CLAUDE.md` — "작업 중 대화, UI 문구, 콘텐츠는 한국어와 영어를 동시에 제공한다. 소스 콘텐츠가 하나의 언어만 제공하면 다른 언어는 번역하여 제공한다."

## 1. 목적 & 성공 기준

현재 100% 한국어 전용인 사이트(UI 문구 / 콘텐츠 메타 / 글 본문 3개 층위 모두)를 **한국어·영어 이중언어**로 만든다. "동시에 제공"은 **언어 토글로 두 언어를 모두 갖춰 언제든 볼 수 있게 제공**한다는 의미로 해석한다(병기 아님 — 본문 가독성 우선).

성공 기준:
- 헤더의 `KO | EN` 토글로 UI·목록·상세의 표시 언어를 바꿀 수 있고, 선택이 유지된다.
- 처음 방문 시 브라우저 언어(`navigator.language`)에 따라 기본 언어가 자동 선택된다(`ko*` → 한국어, 그 외 → 영어).
- 실제 콘텐츠 2개(`loop-engineering`, `marc-lou-solo-saas`)는 본문까지 완전한 한·영 이중언어로 제공된다.
- 시연용 샘플 3개는 사이트에서 제거되어 노출되지 않는다.
- **빌드 단계 없이**(정적 파일) 동작한다. 외부 런타임 요청·npm 의존성 0개 유지.

> 후속 계획: 이 개발이 끝나면 **실제 콘텐츠 보강을 바로 진행**한다. 따라서 샘플 제거로 일시적으로 비는 카테고리는 곧 채워지며, 영어본이 아직 없는 신규 글에 대비해 본문 fallback(§7)은 기능으로 유지한다.

## 2. 기술 방식 (결정)

- **표시 방식: 언어 토글**(KO ⇄ EN). 한 번에 한 언어만 렌더. 병기·별도 페이지 방식은 채택하지 않음.
- **언어 전환 = `location.reload()`**. 목록의 필터·검색 상태는 이미 `syncUrl()`로 URL 쿼리에 보존되고 상세는 `?slug=`가 URL에 있어, reload해도 상태가 유지된다. 동적 리렌더보다 버그 여지가 적고 정적 아키텍처에 자연스럽다.
- **깜빡임 방지**: 각 HTML `<head>` 인라인 부트스트랩이 렌더 전에 언어를 결정해 `<html data-lang>`에 심는다(기존 테마 부트스트랩과 동일 패턴).
- **번역 주체**: 영어 본문은 직접 작성한다. 고유명사(Boris Cherny, Marc Lou 등)와 기술 용어는 원어를 유지한다.

## 3. 언어 상태 & 초기화 (`assets/lang.js` 신규)

우선순위:
```
1. localStorage['labnotes-lang']            ← 사용자가 직접 고른 값 (최우선)
2. navigator.language / navigator.languages ← 'ko'로 시작하면 ko, 그 외 en
3. 'ko'                                      ← 판단 불가 시 기본값(원본 콘텐츠 언어)
```

- `<head>` 인라인 부트스트랩(테마와 동일): try/catch로 위 우선순위 계산 → `document.documentElement.setAttribute('data-lang', lang)`.
- `lang.js`가 공통 로드되어: 현재 언어 헬퍼(`getLang()`), 문자열 조회(`t(key)`), 토글 버튼 배선(클릭 → `localStorage` 저장 → `location.reload()`), `data-i18n` 속성 채움, `<html lang>` 동기화를 담당.
- 로드 순서: `data/posts.js` → `assets/lang.js` → (`marked.min.js`) → `app.js`/`post.js` → `theme.js`. `lang.js`는 `app.js`/`post.js`보다 먼저 로드되어 `t()`·`getLang()`를 제공해야 한다.

## 4. UI 문구 이중화 (문자열 사전)

- `lang.js`에 `STRINGS = { ko: {...}, en: {...} }` 사전 정의. 키 예시: `search_placeholder`, `all`, `count_suffix`(N개의 글 / N posts), `read_min`(분 읽기 / min read), `copy`/`copied`, `prev`/`next`, `toc`, `related`, `no_related`, `not_found`, `load_error`, `korean_only_banner` 등.
- **JS 하드코딩 문구**: `app.js`·`post.js`의 한국어 리터럴을 `t('key')`로 치환.
  - `app.js`: `'전체'`, `filtered.length + '개의 글'`, `'분 읽기'`/`'분'`.
  - `post.js`: `'복사'`/`'복사됨 ✓'`, `'← 이전 글'`/`'다음 글 →'`, not-found·load-error 메시지, `'분 읽기'`.
- **HTML 정적 문구**: skip-link, 검색 placeholder·aria-label, 테마 버튼 aria-label, 헤더 태그라인, 필터 라벨("태그 필터")·"초기화", empty-state 문구·"필터 초기화", "목차", "관련 글", "← 목록" 등에 `data-i18n="key"`(또는 `data-i18n-attr`로 placeholder/aria-label 지정) 부여 → `lang.js`가 채움.
- 카테고리 값(`AI·Data`, `Backend·Infra`, `Product·Ops`, `PM`)은 이미 영어 표기라 **언어 중립**으로 그대로 사용. `'전체'`만 `t('all')`로 처리.
- 카테고리 네비는 **4종 고정 유지**. 샘플 제거로 `Backend·Infra`·`PM`이 일시적으로 글 0개가 되지만, 콘텐츠 보강 시 자동으로 채워진다. 빈 카테고리를 클릭하면 기존 empty-state가 표시된다(별도 처리 불필요).

## 5. 콘텐츠 메타 이중화 (`data/posts.js`)

- 샘플 3개 제거 후 남는 **실제 콘텐츠 2개**의 `title`, `summary`를 **`{ ko, en }` 객체**로 변경.
  ```js
  { slug, readMin,
    title:   { ko: '…', en: '…' },
    category, tags,
    date,
    summary: { ko: '…', en: '…' },
    source? }
  ```
- 소비 지점(`app.js` card/count, `post.js` meta/title/related/prev-next)은 `pick(p.title)` 형태 헬퍼(`pick(obj) => obj[getLang()] ?? obj.ko`)로 현재 언어 값을 꺼낸다. 문자열 fallback: `en`이 없으면 `ko`.
- **검색**(`app.js` matches): 두 언어 값을 모두 검색 대상에 포함해, 어느 언어로 입력해도 걸리게 한다(`title.ko + title.en + summary.ko + summary.en + tags`).

## 6. 태그 라벨 이중화 (표시만)

- 태그 **값**(`'중요'`, `'경제'`, `'기술검토'`, `'DevOps'`)은 검색·필터·URL 공유의 키로 **그대로 유지**한다. 필터 로직(AND, 동적 수집, `?tags=` 공유)을 건드리지 않는다.
- **표시 라벨만** 매핑 사전으로 이중화(`lang.js` 또는 `posts.js`에 배치):
  ```js
  TAG_LABELS = {
    '중요':     { ko: '중요',     en: 'Important' },
    '경제':     { ko: '경제',     en: 'Economy' },
    '기술검토': { ko: '기술검토', en: 'Tech Review' },
    'DevOps':   { ko: 'DevOps',   en: 'DevOps' }
  }
  ```
- 태그 칩/카드 태그 렌더 시 `tagLabel(t)` = `TAG_LABELS[t]?.[getLang()] ?? t`로 표시. 사전에 없는 태그는 값 그대로 표시(안전 fallback).

## 7. 콘텐츠 정리 & 본문 이중화 (`content/` 파일)

- **샘플 3개 제거**: `postgres-index-tuning`, `onboarding-metrics`, `retro-to-action`을 `data/posts.js` 배열과 `content/`(해당 `.md` 파일)에서 삭제한다. 더 이상 노출하지 않는다. (git 이력에 보존되므로 필요 시 복구 가능.)
- 파일 규칙 변경: `content/{slug}.md` → **`content/{slug}.{lang}.md`** (예: `loop-engineering.ko.md`, `loop-engineering.en.md`).
- 남는 실제 콘텐츠 2개(`loop-engineering`, `marc-lou-solo-saas`): 기존 `.md`를 `.ko.md`로 rename하고, `.en.md`를 신규 작성해 **둘 다 제공**한다.
- `post.js` fetch 로직 (샘플 전용이 아니라, 향후 **영어본이 아직 없는 신규 글**에도 대비하는 일반 fallback):
  1. `content/{slug}.{lang}.md`를 fetch.
  2. 응답이 `!ok`(예: 404)이고 현재 언어가 `ko`가 아니면 → `content/{slug}.ko.md`로 **fallback fetch** + 본문 상단에 안내 배너 표시.
  3. 그것도 실패하면 기존 load-error 메시지.
- **안내 배너**: `t('korean_only_banner')` = "⚠ 이 글은 한국어로만 제공됩니다 / This article is available in Korean only". 본문 렌더 영역 최상단에 삽입. (실제 2개는 영어본이 있어 배너가 뜨지 않으며, 이후 보강되는 영어본 없는 글에서만 노출된다.)
- 신뢰-콘텐츠 전제(살균 없이 `marked.parse`)는 그대로 유지.

## 8. 문서 갱신 (`CLAUDE.md`)

- 구조 표에 `assets/lang.js` 추가, 언어 토글 설명.
- 데이터 모델: `title`/`summary`가 `{ ko, en }` 객체임을 명시. `TAG_LABELS` 설명.
- slug↔파일 규칙을 **`slug ↔ content/{slug}.{lang}.md`**로 수정. 영어본 미제공 시 한국어 fallback 동작 명시.
- 글 추가 방법: `.ko.md`(필수) + `.en.md`(권장, 실제 콘텐츠) 작성, `posts.js` 메타는 `{ko,en}` 객체로 기입.

## 9. 영향 파일 요약

| 파일 | 변경 |
|------|------|
| `assets/lang.js` | **신규** — 상태·`t()`·`getLang()`·`pick()`·토글 배선·`data-i18n` 적용 |
| `index.html` | `<head>` 언어 부트스트랩, 헤더 `KO\|EN` 토글, 정적 문구 `data-i18n`, `lang.js` 로드 |
| `post.html` | 동일(부트스트랩·토글·`data-i18n`·`lang.js` 로드) |
| `assets/app.js` | 하드코딩 문구 `t()`화, 메타 `pick()`, 검색 이중언어, 태그 라벨 |
| `assets/post.js` | 문구 `t()`화, 메타 `pick()`, `{slug}.{lang}.md` fetch + fallback 배너 |
| `data/posts.js` | 샘플 3개 항목 제거; 실제 2개 `title`/`summary` → `{ko,en}` 객체; `TAG_LABELS` |
| `content/*.md` | 샘플 3개 삭제; 실제 2개 `.ko.md` rename + `.en.md` 신규 작성 |
| `CLAUDE.md` | 구조·데이터 모델·파일 규칙·글 추가 방법 갱신 |

## 10. 비목표 (YAGNI)

- 3개 이상 언어 확장, 언어별 URL 라우팅(`/en/…`), `?lang=` URL 파라미터 공유 — 이번 범위 아님(localStorage + 브라우저 감지로 충분).
- 샘플 3개 — 제거하여 노출하지 않음(영어 번역도 하지 않음). 개발 완료 후 실제 콘텐츠 보강을 바로 진행할 예정.
- 빈 카테고리(`Backend·Infra`·`PM`) 전용 UI 처리 — 하지 않음(4종 고정 유지, 콘텐츠 보강으로 채워짐).
- 자동 번역 파이프라인 — 없음(본문 영어화는 수작업).
