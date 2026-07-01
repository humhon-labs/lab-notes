# Humhon Labs Notes — 기술 문서 공유 사이트 설계

- 작성일: 2026-07-01
- 상태: 승인됨 (구현 대기)
- 저장소: `lab-notes`

## 1. 목적 & 성공 기준

기술 문서/노트를 정리해 **공유**하는 정적 사이트를 만든다. 글을 **리스트**로 보여주고, **카테고리**(대분류)와 **태그**(다수)로 분류/필터링하며, 키워드 **검색**으로 좁힐 수 있어야 한다. 기초 자료로 Notion "📚 나의 링크" DB의 글 1건("루프가 되지 마라 — 잠자는 동안 Claude가 일하게 하라")을 시드로 넣고, 필터 시연용 샘플 글 2~3개를 추가한다.

성공 기준:
- 목록에서 카테고리 네비 + 태그 필터 + 검색으로 글을 걸러낼 수 있다.
- 글을 클릭하면 상세 페이지에서 마크다운 본문이 렌더된다.
- 다크/라이트 테마 토글이 동작하고 선택이 유지된다.
- 빌드 단계 없이(정적 파일) 호스팅하거나 로컬 서버로 바로 확인 가능하다.

## 2. 기술 방식 (결정)

- **빌드 없는 정적 사이트**: 순수 HTML/CSS/JS. npm 의존성 0개.
- 마크다운 렌더링은 `marked.min.js`를 **로컬 벤더링**(CDN/외부 요청 없음).
- **호스팅(공유) 전제**: GitHub Pages 등 정적 호스팅 또는 로컬 `python3 -m http.server`로 실행. 글 본문을 `content/*.md`에서 `fetch`하므로 `index.html`을 `file://`로 직접 열면 본문 상세는 로드되지 않는다(목록/필터는 동작). README에 실행 방법 명시.

## 3. 파일 구조

```
lab-notes/
  index.html          # 목록: 카테고리 네비 + 태그 필터 + 검색 + 카드 리스트
  post.html           # 상세: ?slug=... 로 마크다운 렌더
  assets/
    style.css         # 다크/라이트 테마, 레이아웃, 컴포넌트
    app.js            # 목록 로직(필터·검색·렌더)
    post.js           # 상세 로직(.md fetch + marked 렌더)
    theme.js          # 테마 토글(공통, localStorage)
    marked.min.js     # 벤더링된 마크다운 파서
  data/
    posts.js          # window.LAB_NOTES = { posts:[...] } (메타데이터 전역)
  content/
    loop-engineering.md      # Notion 실제 글
    <sample-1>.md            # 샘플 (Backend·Infra)
    <sample-2>.md            # 샘플 (Product·Ops)
    <sample-3>.md            # 샘플 (PM)
  README.md           # 실행/글 추가 방법
  docs/superpowers/specs/2026-07-01-lab-notes-tech-docs-site-design.md
```

메타데이터는 `posts.js`에서 `window.LAB_NOTES` 전역으로 노출(fetch 불필요 → 목록은 `file://`에서도 동작). 본문만 `content/*.md`로 분리해 작성 편의를 확보.

## 4. 데이터 모델

`posts.js` 안 각 글 객체:

| 필드 | 타입 | 설명 |
|------|------|------|
| `slug` | string | 고유 ID, `content/{slug}.md` 파일명과 일치 |
| `title` | string | 글 제목 |
| `category` | string | 4개 중 1개 (아래 목록) |
| `tags` | string[] | 다수 태그 |
| `date` | string | `YYYY-MM-DD` |
| `summary` | string | 카드용 1~2줄 요약 |
| `source` | string? | 원본 URL(선택) |

카테고리(대분류, 고정 4종): `AI·Data`, `Backend·Infra`, `Product·Ops`, `PM`.

태그 후보(Notion 유래, 자유 확장): `중요`, `DevOps`, `기술검토`, `프롬프트`, `테스트자동화`, `디자인`, `도구`, `notebooklm` 등. 태그 목록은 posts에서 동적으로 수집해 필터 UI를 구성.

## 5. UI / 기능

**공통 헤더**
- 사이트명 `Humhon Labs Notes`
- 테마 토글 버튼(🌙/☀️), `theme.js`가 localStorage 키 `labnotes-theme`에 저장/복원. 기본값 다크.
- 검색 입력창(목록 페이지에서 활성)

**목록(index.html)**
- 카테고리 네비: `전체` + 4개 카테고리. 선택 시 해당 카테고리만 표시(단일 선택).
- 태그 필터: 전체 태그 칩. 클릭 토글로 다중 선택 → 선택된 **모든 태그를 포함(AND)** 하는 글만 표시. `초기화` 버튼 제공.
- 검색: 제목·요약·태그 텍스트 대상 대소문자 무시 부분일치(클라이언트 필터).
- 세 필터(카테고리 ∧ 태그 ∧ 검색)는 함께 AND로 적용.
- 카드 리스트: 각 카드에 제목, 카테고리 배지, 태그 칩, 날짜, 요약. 클릭 시 `post.html?slug=...` 이동.
- 결과 없음(empty) 상태 메시지 처리.

**상세(post.html)**
- `?slug=`로 해당 글 메타(`window.LAB_NOTES`)를 찾고 `content/{slug}.md`를 fetch → `marked`로 렌더.
- 상단 메타: 카테고리 배지, 태그, 날짜, 원본 링크(source 있을 때).
- 목록으로 돌아가기 링크.
- 로드 실패 시(파일 없음/`file://`) 안내 메시지.

**접근성 & 반응형**
- 시맨틱 마크업(`header`/`nav`/`main`/`article`), 키보드 조작 가능한 필터·토글, 적절한 `aria` 속성.
- 모바일~데스크톱 반응형 레이아웃.

## 6. 마크다운 변환 규칙 (Notion → GFM)

Notion 실제 글을 `content/loop-engineering.md`로 옮길 때:
- `<callout icon="X" ...>본문</callout>` → 인용구 `> X 본문` (CSS로 콜아웃 스타일).
- 표 → GFM 마크다운 표.
- 코드블록(python) → ```` ```python ```` 펜스 유지.
- `<details><summary>` → 그대로 HTML로 유지(marked가 HTML 통과, `<details>` 렌더).
- 상단 메타(작성일/출처 콜아웃)는 본문 하단 "출처" 섹션으로 정리.

## 7. 시드 콘텐츠

1. **loop-engineering.md** — Notion 실제 글.
   - `category: AI·Data`, `tags: [중요, DevOps, 기술검토]`
   - `source`: 원본 트윗 URL, `date: 2026-07-01`
   - 본문: 요약/루프 엔지니어링 정의/4단계 진화 표/의사코드/검증 패턴/실전 예시/실패 모드/출처.
2. **샘플 더미 3개** (제목에 "(샘플)" 표기, 나머지 카테고리 시연):
   - Backend·Infra 예: "PostgreSQL 인덱스 튜닝 기초 (샘플)" — tags: [기술검토, DevOps]
   - Product·Ops 예: "제품 온보딩 지표 설계 (샘플)" — tags: [중요]
   - PM 예: "스프린트 회고를 액션으로 바꾸기 (샘플)" — tags: [기술검토]

## 8. 범위 밖 (YAGNI)

- 서버/DB/인증/댓글, 빌드 파이프라인, Notion 실시간 동기화(1회 시드만), 구문 하이라이팅 라이브러리(코드블록은 CSS 스타일로 충분), 페이지네이션, 정렬 옵션. 필요 시 추후 확장.
