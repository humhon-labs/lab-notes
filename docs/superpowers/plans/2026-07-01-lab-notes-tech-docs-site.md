# Humhon Labs Notes 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 빌드 없는 정적 사이트로 기술 문서를 리스트·카테고리·태그·검색으로 탐색/공유하는 "Humhon Labs Notes"를 만든다.

**Architecture:** 순수 HTML/CSS/JS. 글 메타데이터는 `data/posts.js`의 전역(`window.LAB_NOTES`)으로, 본문은 `content/*.md`로 분리한다. 목록 페이지(`index.html`)는 메타데이터만으로 필터링·검색하고, 상세 페이지(`post.html`)는 `.md`를 fetch해 벤더링된 `marked`로 렌더한다.

**Tech Stack:** HTML5, CSS(커스텀 프로퍼티 기반 다크/라이트 테마), Vanilla JS, 로컬 벤더링된 `marked.min.js`. 빌드/번들러 없음, npm 의존성 없음.

## Global Constraints

- 빌드 단계 없음. 번들러/트랜스파일러 없음. `package.json` 생성 금지.
- 외부 런타임 요청 없음: `marked`는 저장소에 벤더링(로컬 파일)한다.
- 모든 UI 텍스트는 한국어. 사이트명은 `Humhon Labs Notes`.
- 카테고리(고정 4종, 정확히 이 표기): `AI·Data`, `Backend·Infra`, `Product·Ops`, `PM`. (`·`는 U+00B7 middle dot)
- 테마 기본값 `dark`. 선택은 localStorage 키 `labnotes-theme`("dark"|"light")에 저장.
- 정적 서버 전제(예: `python3 -m http.server`). 검증은 서버를 띄워 수행한다.
- 실제 시드 글은 `content/loop-engineering.md` 1건. 나머지 3건은 제목에 "(샘플)" 표기.

---

### Task 1: 시드 데이터 & 콘텐츠 파일

**Files:**
- Create: `data/posts.js`
- Create: `content/loop-engineering.md`
- Create: `content/postgres-index-tuning.md`
- Create: `content/onboarding-metrics.md`
- Create: `content/retro-to-action.md`

**Interfaces:**
- Produces: 전역 `window.LAB_NOTES = { posts: Array<Post> }`. `Post = { slug:string, title:string, category:string, tags:string[], date:string("YYYY-MM-DD"), summary:string, source?:string }`. 각 `post.slug`는 `content/{slug}.md` 파일명과 1:1로 일치한다. 이후 `app.js`/`post.js`가 이 전역을 소비한다.

- [ ] **Step 1: `data/posts.js` 작성**

```js
window.LAB_NOTES = {
  posts: [
    {
      slug: 'loop-engineering',
      title: '루프가 되지 마라 — 잠자는 동안 Claude가 일하게 하라',
      category: 'AI·Data',
      tags: ['중요', 'DevOps', '기술검토'],
      date: '2026-07-01',
      summary: 'Boris Cherny의 "루프 엔지니어링" — 프롬프트 작성에서 자율 에이전트 루프 설계로 옮겨가는 개발 방식의 진화 정리.',
      source: 'https://x.com/elcopymaster/status/2071975894290248160'
    },
    {
      slug: 'postgres-index-tuning',
      title: 'PostgreSQL 인덱스 튜닝 기초 (샘플)',
      category: 'Backend·Infra',
      tags: ['기술검토', 'DevOps'],
      date: '2026-06-20',
      summary: 'B-tree/부분/복합 인덱스 선택 기준과 EXPLAIN ANALYZE로 병목을 찾는 흐름을 정리한 샘플 글.'
    },
    {
      slug: 'onboarding-metrics',
      title: '제품 온보딩 지표 설계 (샘플)',
      category: 'Product·Ops',
      tags: ['중요'],
      date: '2026-06-10',
      summary: 'Aha moment 정의부터 활성화율·리텐션 코호트까지, 온보딩 지표 체계를 세우는 샘플 글.'
    },
    {
      slug: 'retro-to-action',
      title: '스프린트 회고를 액션으로 바꾸기 (샘플)',
      category: 'PM',
      tags: ['기술검토'],
      date: '2026-05-30',
      summary: '회고에서 나온 논의를 담당자·기한이 있는 실행 항목으로 전환하는 진행 방식 샘플 글.'
    }
  ]
};
```

- [ ] **Step 2: `content/loop-engineering.md` 작성** (Notion 실제 글을 GFM으로 변환: 콜아웃→인용구, 표→GFM 표, 코드 펜스 유지, `<details>` 유지)

````markdown
# 루프가 되지 마라 — 잠자는 동안 Claude가 일하게 하라

> 🔁 이 트윗(@ElCopyMaster, 2026-06-30)이 링크하는 스페인어 X 아티클은 **"루프 엔지니어링(Loop Engineering)"** 을 다룹니다. 핵심 메시지: Claude Code를 만든 Anthropic의 **Boris Cherny**가 "이제 프롬프트를 쓰지 않는다 — 대신 Claude에게 프롬프트를 던지는 **루프(loop)를 설계한다**"고 밝히면서, 개발자의 일이 *프롬프트 작성 → 자율 시스템 설계*로 옮겨갔다는 것입니다.

## 1. 원본 게시물 정보

- 게시자: **Rafa Gonzalez | IA (@ElCopyMaster)** · 블루 인증 계정
- 게시일: **2026년 6월 30일** · 좋아요 약 38 · 답글 4
- 형식: 트윗 본문은 링크만 있고, 실제 내용은 연결된 **X 아티클** — 제목 *"Deja de ser el bucle. Así puedes hacer que Claude trabaje mientras duermes"* (루프가 되지 마라. 잠자는 동안 Claude가 일하게 만드는 법)
- 배경: 2026년 6월, Boris Cherny의 "나는 더 이상 Claude에게 프롬프트를 쓰지 않는다. 루프가 대신 프롬프트를 던진다"는 발언이 널리 회자되며 확산된 주제

## 2. 루프 엔지니어링이란?

> 🧠 **루프 엔지니어링** = "내가 매번 다음 지시를 손으로 타이핑하는 대신, AI 에이전트에게 **프롬프트를 주고(prompt) · 검증하고(check) · 기억하게 하고(remember) · 다시 돌리는(re-run)** 시스템 자체를 설계하는 것."

- AI를 "한 번 던지면 한 번 답하는 생성기"가 아니라, **행동 → 관찰 → 판단**을 스스로 반복하는 순환(cycle)으로 다룹니다.
- 인간의 역할이 **작업 실행자 → 아키텍트**로 이동합니다. 상위 레벨(설계)의 일이므로 효과가 누적됩니다.
- 에이전트 한 번의 실행이 1시간씩 걸리고 수십 개 파일을 건드리는 시대에는, **에이전트가 목표를 벗어나지 않고 계속 생산적으로 돌게 만드는 루프 설계**가 가장 레버리지 큰 일이 됩니다. → "잠자는 동안 돌아가는 에이전트".

## 3. 왜 프롬프트를 그만뒀나 (Boris Cherny)

- **레버리지**: 매 작업마다 프롬프트를 쓰는 것보다, 시스템을 한 번 설계하면 계속 재사용됩니다.
- **의도적 언더펀드(Underfund) 원칙**: 4명분 일에 2명만 배치하는 식으로 일부러 인력을 줄여, 팀이 반복 작업을 손으로 처리하는 대신 **자동화(루프)를 만들도록** 강제합니다. → 비용 구조가 "인건비 → 토큰 비용"으로 이동하며 장기적으로 저렴해집니다.
- 각자 워크트리(worktree)를 가진 루프를 돌리면 **여러 개를 동시에** 돌리고 결과만 나중에 검토할 수 있습니다.

## 4. AI 작업 방식의 4단계 진화

> 📈 각 단계는 이전 단계를 **대체하는 게 아니라 감싸는** 구조입니다. (프롬프트는 여전히 루프 안에 존재)

| 단계 | 시기 | 초점 |
|------|------|------|
| **프롬프트 엔지니어링** | 2022–2024 | 효과적인 문구·역할 지정·단계별 지시 작성 |
| **컨텍스트 엔지니어링** | 2025 | 추론 시점에 보이는 모든 것(대화 이력·검색 문서·툴 출력) 관리 |
| **하네스 엔지니어링** | 2026 | 에이전트 주변의 도구·제약·피드백·안전장치 등 환경 스캐폴딩 구축 |
| **루프 엔지니어링** | 2026 | 행동–관찰–판단이 반복되는 순환 그 자체를 설계 |

## 5. 에이전트 루프의 핵심 구성요소

- **검증 가능한 종료 조건**: "코드 개선" 같은 모호한 목표 ✕ → "테스트 통과" 같은 검증 가능한 목표 ○
- **실제 환경에 대한 툴 접근**: 파일 시스템, 터미널, 테스트 러너, 타입 체커, 버전 관리
- **컨텍스트 관리**: 요약·정리(pruning)·외부화로 컨텍스트 창 오버플로 방지
- **종료 및 에스컬레이션 로직**: 명시적 성공/실패 종료 + 막혔을 때 사람에게 넘기기
- **에러 복구**: 복구 가능한 오류(테스트 실패)와 치명적 오류(자격증명 누락)를 구분

## 6. 루프 의사코드 (구조 예시)

```python
state = init_state(goal)
for step in range(MAX_STEPS):
    thought = model.reason(state)
    action = model.choose_action(state)
    result = tools.execute(action)
    state = update(state, thought, action, result)
    state = compact(state)          # 컨텍스트 압축

    if verifier.passes(state):      # 검증 통과 → 성공 종료
        return success(state)
    if no_progress(state) or budget.exhausted():
        return escalate_to_human(state)   # 진전 없음/예산 소진 → 사람 호출
return escalate_to_human(state)
```

## 7. 검증(Verification) 패턴 3가지

1. **결정론적 검증**: 테스트·타입 체커·린터처럼 객관적이고 조작 불가능한 피드백.
2. **Reflexion 패턴**: 실패에서 얻은 교훈을 에이전트가 스스로 "메모(episodic memory)"로 남겨 다음 시도를 개선.
3. **Evaluator–Optimizer**: 한 모델은 후보를 생성하고, 다른 모델이 기준으로 평가 → 통과할 때까지 반복.

## 8. 실전 예시 — "CI 통과시키기" 루프

- 에이전트에게 **전용 git 워크트리**를 부여(격리)
- 첫 번째 실패 테스트 읽기 → 원인 파악 → 패치 적용 → 테스트 재실행 → 출력 확인
- 시도한 수정 내역을 **외부 로그**에 남겨 같은 실수 반복 방지
- 같은 테스트에서 **3회 연속 실패 시 사람에게 에스컬레이션**
- 성공하면 **드래프트 PR을 열고 정지**

## 9. 미리 대비해야 할 흔한 실패 모드

- 컨텍스트 오버플로/품질 저하
- 진전 감지가 없어 생기는 무한 루프
- 리워드 해킹(잘못된 지표를 최적화)
- 검증 없는 "성공했다"는 자기 보고
- 검증 안 된 중간 단계에서 누적되는 오류
- 예상치 못한 토큰 비용 폭증

## 10. 어디서 시작할까 — 내 첫 루프 만들기

<details>
<summary>요약 펼치기</summary>

1. 가장 손이 많이 가고 **반복적인 워크플로**를 고른다 (AI 출력을 매번 검토·복붙, 반복 판단이 필요한 작업).
2. 그 워크플로를 자율로 처리하도록 루프를 설계한다.
3. **검증 장치**를 둬서 매번 사람이 전부 검토하지 않아도 되게 한다.
4. 시스템이 계속 돌게 둔다 (그리고 결과만 검토한다).

</details>

## 11. 출처

- 원본 트윗: [@ElCopyMaster · X](https://x.com/elcopymaster/status/2071975894290248160)
- 연결 아티클(X, 스페인어): [Deja de ser el bucle…](https://x.com/i/article/2071971416572841986)
- Loop Engineering 완전 가이드: [tosea.ai](http://tosea.ai)
- Boris Cherny 배경: [Memeburn](https://memeburn.com/boris-cherny-says-loop-engineering-has-replaced-prompting/) · [Product Market Fit](https://www.productmarketfit.tech/p/stop-prompting-ai-and-start-building) · [The AI Corner](https://www.the-ai-corner.com/p/loop-engineering-coding-agents-2026)

> 🗓️ 정리 작성일: 2026-07-01 · X 아티클 본문은 로그인 필요로 직접 접근 불가하여, 주제(루프 엔지니어링)에 대한 2차 자료로 보강했습니다. Boris Cherny 인용문은 널리 회자되는 발언의 의역입니다.
````

- [ ] **Step 3: `content/postgres-index-tuning.md` 작성**

````markdown
# PostgreSQL 인덱스 튜닝 기초 (샘플)

> ⚠️ 이 글은 UI/필터 시연을 위한 **샘플 콘텐츠**입니다.

## 언제 인덱스를 고려하나

- 자주 실행되는 쿼리의 `WHERE`, `JOIN`, `ORDER BY`에 등장하는 컬럼
- 카디널리티가 높은(값이 다양한) 컬럼일수록 효과가 큼

## 인덱스 종류 빠른 정리

| 종류 | 쓰임새 |
|------|--------|
| B-tree | 등호·범위 조건의 기본값 |
| 부분(Partial) | 특정 조건 행만 인덱싱해 크기 절감 |
| 복합(Composite) | 다중 컬럼 조건, 선두 컬럼 순서가 중요 |

## 병목 찾기

```sql
EXPLAIN ANALYZE
SELECT * FROM orders WHERE user_id = 42 ORDER BY created_at DESC;
```

`Seq Scan`이 큰 테이블에서 보이면 인덱스 후보입니다. 인덱스 추가 후 `Index Scan`으로 바뀌는지, 실행 시간이 줄었는지 확인하세요.
````

- [ ] **Step 4: `content/onboarding-metrics.md` 작성**

````markdown
# 제품 온보딩 지표 설계 (샘플)

> ⚠️ 이 글은 UI/필터 시연을 위한 **샘플 콘텐츠**입니다.

## 핵심 질문

사용자가 처음 가치를 느끼는 순간(**Aha moment**)은 무엇인가?

## 지표 계층

1. **활성화율(Activation)**: 가입 후 핵심 행동까지 도달한 비율
2. **리텐션 코호트**: 가입 주차별 재방문 곡선
3. **Time-to-value**: 가입부터 첫 가치 경험까지 걸린 시간

## 주의점

- 허영 지표(가입 수)만 보지 말 것
- 코호트로 나눠 봐야 개선 효과가 드러남
````

- [ ] **Step 5: `content/retro-to-action.md` 작성**

````markdown
# 스프린트 회고를 액션으로 바꾸기 (샘플)

> ⚠️ 이 글은 UI/필터 시연을 위한 **샘플 콘텐츠**입니다.

## 회고가 공회전하는 이유

- 논의는 많지만 **담당자·기한**이 없어 실행되지 않음
- 지난 회고 항목을 다시 점검하지 않음

## 액션 아이템 규칙

1. 각 항목에 **담당자 1명**과 **기한**을 반드시 지정
2. 다음 회고 맨 앞에서 **이전 액션 점검**부터 시작
3. 3회 이상 안 되는 항목은 폐기하거나 재설계

## 템플릿

```
[액션] 무엇을 / 담당자 @이름 / 기한 YYYY-MM-DD
```
````

- [ ] **Step 6: 데이터 무결성 검증**

Run:
```bash
node -e "
require('./data/posts.js');
const fs = require('fs');
const posts = global.window ? global.window.LAB_NOTES.posts : (window.LAB_NOTES.posts);
" 2>/dev/null; \
node -e "
global.window = {};
require('./data/posts.js');
const fs = require('fs');
const posts = global.window.LAB_NOTES.posts;
const cats = ['AI·Data','Backend·Infra','Product·Ops','PM'];
let ok = true;
posts.forEach(p => {
  if (!cats.includes(p.category)) { console.log('BAD category:', p.slug, p.category); ok = false; }
  if (!fs.existsSync('content/' + p.slug + '.md')) { console.log('MISSING md:', p.slug); ok = false; }
  if (!p.title || !Array.isArray(p.tags) || !p.date || !p.summary) { console.log('BAD fields:', p.slug); ok = false; }
});
console.log(ok ? 'DATA OK (' + posts.length + ' posts)' : 'DATA FAIL');
"
```
Expected: `DATA OK (4 posts)`

- [ ] **Step 7: 커밋**

```bash
git add data/posts.js content/
git commit -m "feat: add seed data and article content"
```

---

### Task 2: 목록 페이지 + 공통 셸 (테마/스타일)

**Files:**
- Create: `assets/style.css`
- Create: `assets/theme.js`
- Create: `assets/app.js`
- Create: `index.html` (기존 파일 덮어쓰기)

**Interfaces:**
- Consumes: `window.LAB_NOTES.posts` (Task 1).
- Produces: DOM 계약 — `index.html`은 `#category-nav`, `#tag-filter`, `#post-list`, `#empty-state`, `#result-count`, `#search`, `#clear-tags`, `#theme-toggle` 요소를 제공한다. `theme.js`는 `#theme-toggle` 클릭으로 `document.documentElement[data-theme]`를 토글하고 localStorage(`labnotes-theme`)에 저장한다. `post.html`(Task 3)도 동일한 `.site-header`/`#theme-toggle`/`style.css`/`theme.js`를 재사용한다.

- [ ] **Step 1: `assets/style.css` 작성**

```css
:root {
  --bg: #0f1115;
  --bg-elev: #171a21;
  --bg-soft: #1e222b;
  --border: #2a2f3a;
  --text: #e6e9ef;
  --text-dim: #9aa3b2;
  --accent: #7c9cff;
  --accent-ink: #0f1115;
  --code-bg: #0b0d12;
  --shadow: 0 1px 3px rgba(0,0,0,.4);
}
:root[data-theme="light"] {
  --bg: #f7f8fa;
  --bg-elev: #ffffff;
  --bg-soft: #eef1f5;
  --border: #dfe3ea;
  --text: #1a1f29;
  --text-dim: #5b6472;
  --accent: #3355dd;
  --accent-ink: #ffffff;
  --code-bg: #f0f2f6;
  --shadow: 0 1px 3px rgba(0,0,0,.08);
}

* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.65;
}
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

.site-header {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 16px 24px; border-bottom: 1px solid var(--border);
  background: var(--bg-elev); position: sticky; top: 0; z-index: 10;
}
.brand { display: flex; align-items: center; gap: 12px; color: var(--text); }
.brand:hover { text-decoration: none; }
.brand-mark { font-size: 24px; }
.brand-text { display: flex; flex-direction: column; line-height: 1.2; }
.brand-text strong { font-size: 18px; }
.brand-text small { color: var(--text-dim); font-size: 12px; }
.header-actions { display: flex; align-items: center; gap: 10px; }
#search {
  background: var(--bg-soft); border: 1px solid var(--border); color: var(--text);
  border-radius: 8px; padding: 8px 12px; min-width: 220px; font-size: 14px;
}
#search:focus { outline: 2px solid var(--accent); outline-offset: 1px; }
.icon-btn {
  background: var(--bg-soft); border: 1px solid var(--border); color: var(--text);
  border-radius: 8px; width: 38px; height: 38px; font-size: 16px; cursor: pointer;
}
.icon-btn:focus-visible, .cat-btn:focus-visible, .tag-chip:focus-visible, .card:focus-visible {
  outline: 2px solid var(--accent); outline-offset: 2px;
}
.text-btn { background: none; border: none; color: var(--accent); cursor: pointer; font-size: 14px; padding: 6px 8px; }

.category-nav { display: flex; flex-wrap: wrap; gap: 8px; padding: 16px 24px 0; max-width: 1100px; margin: 0 auto; }
.cat-btn {
  background: var(--bg-soft); border: 1px solid var(--border); color: var(--text-dim);
  border-radius: 999px; padding: 6px 14px; font-size: 14px; cursor: pointer;
}
.cat-btn.active { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }

.layout { display: grid; grid-template-columns: 220px 1fr; gap: 24px; max-width: 1100px; margin: 0 auto; padding: 24px; }
.layout.single { grid-template-columns: 1fr; max-width: 820px; }
.sidebar-head { display: flex; align-items: center; justify-content: space-between; }
.sidebar h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .05em; color: var(--text-dim); margin: 0 0 8px; }
.tag-filter { display: flex; flex-wrap: wrap; gap: 8px; }
.tag-chip {
  background: var(--bg-soft); border: 1px solid var(--border); color: var(--text-dim);
  border-radius: 6px; padding: 4px 10px; font-size: 13px; cursor: pointer;
}
.tag-chip.active { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }

.result-count { color: var(--text-dim); font-size: 13px; margin-bottom: 12px; }
.post-list { display: grid; gap: 16px; }
.card {
  display: block; background: var(--bg-elev); border: 1px solid var(--border);
  border-radius: 12px; padding: 18px 20px; color: var(--text); box-shadow: var(--shadow);
  transition: border-color .15s, transform .15s;
}
.card:hover { text-decoration: none; border-color: var(--accent); transform: translateY(-2px); }
.card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.card h2 { margin: 4px 0 8px; font-size: 18px; }
.badge { background: var(--bg-soft); border: 1px solid var(--border); color: var(--text-dim); border-radius: 6px; padding: 2px 10px; font-size: 12px; }
.card time { color: var(--text-dim); font-size: 12px; }
.summary { color: var(--text-dim); margin: 0 0 12px; font-size: 14px; }
.tags { display: flex; flex-wrap: wrap; gap: 6px; }
.tag { color: var(--accent); font-size: 12px; }
.empty { color: var(--text-dim); text-align: center; padding: 48px 0; }

.post-meta h1 { font-size: 26px; margin: 8px 0 12px; }
.post-meta .source { display: inline-block; margin-top: 10px; font-size: 14px; }
.post-body { margin-top: 24px; }
.back { margin-top: 40px; }

.markdown h2 { margin-top: 32px; border-bottom: 1px solid var(--border); padding-bottom: 6px; }
.markdown h3 { margin-top: 24px; }
.markdown p, .markdown li { font-size: 15px; }
.markdown blockquote {
  margin: 16px 0; padding: 12px 16px; background: var(--bg-soft);
  border-left: 4px solid var(--accent); border-radius: 8px; color: var(--text);
}
.markdown blockquote p { margin: 6px 0; }
.markdown table { border-collapse: collapse; width: 100%; margin: 16px 0; font-size: 14px; display: block; overflow-x: auto; }
.markdown th, .markdown td { border: 1px solid var(--border); padding: 8px 12px; text-align: left; }
.markdown th { background: var(--bg-soft); }
.markdown pre { background: var(--code-bg); border: 1px solid var(--border); border-radius: 10px; padding: 16px; overflow-x: auto; }
.markdown code { font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace; font-size: 13.5px; }
.markdown p code, .markdown li code { background: var(--bg-soft); padding: 1px 6px; border-radius: 4px; }
.markdown pre code { background: none; padding: 0; }
.markdown details { background: var(--bg-soft); border: 1px solid var(--border); border-radius: 8px; padding: 8px 14px; margin: 16px 0; }
.markdown summary { cursor: pointer; font-weight: 600; }
.markdown a { text-decoration: underline; }
.notice { background: var(--bg-soft); border: 1px solid var(--border); border-radius: 8px; padding: 16px; color: var(--text-dim); }

.site-footer { text-align: center; color: var(--text-dim); font-size: 13px; padding: 32px 0; border-top: 1px solid var(--border); margin-top: 40px; }

@media (max-width: 720px) {
  .layout { grid-template-columns: 1fr; }
  .site-header { flex-wrap: wrap; }
  #search { min-width: 0; flex: 1; }
}
```

- [ ] **Step 2: `assets/theme.js` 작성**

```js
(function () {
  var KEY = 'labnotes-theme';
  var btn = document.getElementById('theme-toggle');
  if (!btn) return;
  function current() { return document.documentElement.getAttribute('data-theme') || 'dark'; }
  function setIcon() {
    var t = current();
    btn.textContent = t === 'dark' ? '☀️' : '🌙';
    btn.setAttribute('aria-label', t === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환');
  }
  setIcon();
  btn.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem(KEY, next); } catch (e) {}
    setIcon();
  });
})();
```

- [ ] **Step 3: `assets/app.js` 작성**

```js
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
```

- [ ] **Step 4: `index.html` 작성 (기존 파일 덮어쓰기)**

```html
<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Humhon Labs Notes</title>
  <link rel="stylesheet" href="assets/style.css" />
  <script>
    (function () {
      try { document.documentElement.setAttribute('data-theme', localStorage.getItem('labnotes-theme') || 'dark'); }
      catch (e) { document.documentElement.setAttribute('data-theme', 'dark'); }
    })();
  </script>
</head>
<body>
  <header class="site-header">
    <a class="brand" href="index.html">
      <span class="brand-mark">🧪</span>
      <span class="brand-text"><strong>Humhon Labs Notes</strong><small>기술 지식과 실무 경험을 기록하고 공유합니다</small></span>
    </a>
    <div class="header-actions">
      <input id="search" type="search" placeholder="검색: 제목·태그·요약" aria-label="글 검색" />
      <button id="theme-toggle" class="icon-btn" type="button" aria-label="테마 전환">🌙</button>
    </div>
  </header>

  <nav id="category-nav" class="category-nav" aria-label="카테고리"></nav>

  <main class="layout">
    <aside class="sidebar">
      <div class="sidebar-head">
        <h2>태그</h2>
        <button id="clear-tags" class="text-btn" type="button" style="display:none">초기화</button>
      </div>
      <div id="tag-filter" class="tag-filter"></div>
    </aside>

    <section class="content">
      <div id="result-count" class="result-count" aria-live="polite"></div>
      <div id="post-list" class="post-list"></div>
      <p id="empty-state" class="empty" style="display:none">조건에 맞는 글이 없습니다.</p>
    </section>
  </main>

  <footer class="site-footer">© Humhon Labs Notes</footer>

  <script src="data/posts.js"></script>
  <script src="assets/app.js"></script>
  <script src="assets/theme.js"></script>
</body>
</html>
```

- [ ] **Step 5: 서버 실행 후 정적 검증**

Run (백그라운드 서버):
```bash
python3 -m http.server 4173 >/tmp/labnotes-serve.log 2>&1 &
sleep 1
curl -s http://localhost:4173/index.html | grep -o 'id="post-list"' && \
curl -s http://localhost:4173/index.html | grep -o 'id="category-nav"' && \
curl -s http://localhost:4173/assets/app.js | grep -o "CATEGORIES" && \
echo "STATIC OK"
```
Expected: `id="post-list"`, `id="category-nav"`, `CATEGORIES`, `STATIC OK` 출력.

- [ ] **Step 6: 브라우저 동작 검증 (Playwright MCP)**

`playwright_navigate` → `http://localhost:4173/index.html`. 그다음 확인:
- `playwright_get_visible_text` 결과에 4개 글 제목이 모두 보인다(카테고리 `전체` 기본).
- `playwright_click` 카테고리 `Backend·Infra` 버튼 → 목록에 "PostgreSQL 인덱스 튜닝 기초 (샘플)"만 남는다.
- `전체` 복귀 후 태그 `#중요` 칩 클릭 → "루프…"와 "제품 온보딩…" 2건만 남는다(AND 필터).
- 검색창에 `postgres` 입력 → 해당 1건만.
- `#theme-toggle` 클릭 → `document.documentElement`의 `data-theme`가 `light`로 바뀐다(`playwright_evaluate`로 `document.documentElement.getAttribute('data-theme')` 확인). 새로고침 후에도 유지.

Expected: 위 모든 항목이 기대대로 동작.

- [ ] **Step 7: 서버 종료 & 커밋**

```bash
kill %1 2>/dev/null || pkill -f "http.server 4173"
git add index.html assets/style.css assets/theme.js assets/app.js
git commit -m "feat: add list page with category/tag/search filters and theme toggle"
```

---

### Task 3: 상세 페이지 + 마크다운 렌더

**Files:**
- Create: `assets/marked.min.js` (벤더링)
- Create: `assets/post.js`
- Create: `post.html`

**Interfaces:**
- Consumes: `window.LAB_NOTES.posts` (Task 1), 전역 `marked` (벤더링, `marked.parse(md:string):string` 제공), 공통 `style.css`/`theme.js` 및 `#theme-toggle` 계약 (Task 2).
- Produces: `post.html?slug=<slug>` 라우팅. `#post-meta`/`#post-body` DOM 계약.

- [ ] **Step 1: `marked` 벤더링**

Run:
```bash
mkdir -p assets
curl -fsSL https://cdn.jsdelivr.net/npm/marked@12.0.0/marked.min.js -o assets/marked.min.js
```
(만약 404면 `https://cdn.jsdelivr.net/npm/marked/marked.min.js`로 최신본을 받아 커밋 메시지에 실제 버전을 남긴다.)

- [ ] **Step 2: 벤더 파일 검증**

Run:
```bash
test "$(wc -c < assets/marked.min.js)" -gt 10000 && \
node -e "global.window=global; const m=require('./assets/marked.min.js'); const out=(m&&m.parse?m:global.marked).parse('# hi\n\n| a | b |\n|---|---|\n| 1 | 2 |'); console.log(/<h1/.test(out) && /<table/.test(out) ? 'MARKED OK' : 'MARKED FAIL');"
```
Expected: `MARKED OK`

- [ ] **Step 3: `assets/post.js` 작성**

```js
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
```

- [ ] **Step 4: `post.html` 작성**

```html
<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>글 · Humhon Labs Notes</title>
  <link rel="stylesheet" href="assets/style.css" />
  <script>
    (function () {
      try { document.documentElement.setAttribute('data-theme', localStorage.getItem('labnotes-theme') || 'dark'); }
      catch (e) { document.documentElement.setAttribute('data-theme', 'dark'); }
    })();
  </script>
</head>
<body>
  <header class="site-header">
    <a class="brand" href="index.html">
      <span class="brand-mark">🧪</span>
      <span class="brand-text"><strong>Humhon Labs Notes</strong><small>기술 지식과 실무 경험을 기록하고 공유합니다</small></span>
    </a>
    <div class="header-actions">
      <a class="text-btn" href="index.html">← 목록</a>
      <button id="theme-toggle" class="icon-btn" type="button" aria-label="테마 전환">🌙</button>
    </div>
  </header>

  <main class="layout single">
    <article class="post">
      <header id="post-meta" class="post-meta"></header>
      <div id="post-body" class="post-body markdown"></div>
      <p class="back"><a href="index.html">← 목록으로 돌아가기</a></p>
    </article>
  </main>

  <footer class="site-footer">© Humhon Labs Notes</footer>

  <script src="data/posts.js"></script>
  <script src="assets/marked.min.js"></script>
  <script src="assets/post.js"></script>
  <script src="assets/theme.js"></script>
</body>
</html>
```

- [ ] **Step 5: 서버 실행 후 상세 검증 (Playwright MCP)**

```bash
python3 -m http.server 4173 >/tmp/labnotes-serve.log 2>&1 &
sleep 1
```
`playwright_navigate` → `http://localhost:4173/post.html?slug=loop-engineering`. 확인:
- 제목 `루프가 되지 마라 …`가 `<h1>`로 보인다.
- 본문에 표(4단계 진화), 코드블록(python `for step in range`), 인용구(콜아웃 변환), `<details>` 접기 요소가 렌더된다 (`playwright_get_visible_html`로 `<table>`, `<pre>`, `<blockquote>`, `<details>` 존재 확인).
- 메타에 배지 `AI·Data`, 태그 `#중요 #DevOps #기술검토`, "원본 링크 ↗"가 보인다.
- 목록 카드 클릭 경로 확인: `index.html`에서 첫 카드 클릭 시 `post.html?slug=...`로 이동.
- 존재하지 않는 slug: `post.html?slug=none` → "요청한 글을 찾을 수 없습니다" 안내.

Expected: 위 항목 모두 통과.

- [ ] **Step 6: 서버 종료 & 커밋**

```bash
kill %1 2>/dev/null || pkill -f "http.server 4173"
git add assets/marked.min.js assets/post.js post.html
git commit -m "feat: add article detail page with vendored marked rendering"
```

---

### Task 4: README & 마무리 점검

**Files:**
- Modify: `README.md` (기존 `# lab-notes` 덮어쓰기)

**Interfaces:**
- Consumes: 전체 구조 (Task 1–3).
- Produces: 실행/글 추가 방법 문서.

- [ ] **Step 1: `README.md` 작성**

````markdown
# Humhon Labs Notes

기술 지식과 실무 경험을 기록·공유하는 정적 사이트. 빌드 단계 없이 순수 HTML/CSS/JS로 동작하며, 카테고리·태그·검색으로 글을 탐색합니다.

## 로컬 실행

글 본문을 `content/*.md`에서 불러오므로 **정적 서버**로 열어야 합니다(파일 더블클릭 `file://`은 본문 상세가 로드되지 않음).

```bash
python3 -m http.server 4173
# 브라우저에서 http://localhost:4173 접속
```

## 배포

정적 파일 그대로 GitHub Pages 등에 올리면 됩니다. 별도 빌드 없음.

## 글 추가하기

1. `content/<slug>.md` 파일에 본문(Markdown)을 작성합니다.
2. `data/posts.js`의 `posts` 배열에 항목을 추가합니다:

```js
{
  slug: '<slug>',              // content/<slug>.md 와 일치
  title: '제목',
  category: 'AI·Data',         // AI·Data | Backend·Infra | Product·Ops | PM
  tags: ['태그1', '태그2'],
  date: '2026-07-01',
  summary: '목록 카드에 보일 한두 줄 요약',
  source: 'https://...'        // 선택
}
```

## 구조

```
index.html          목록(카테고리·태그·검색)
post.html           글 상세(?slug=...)
assets/             style.css, app.js, post.js, theme.js, marked.min.js
data/posts.js       글 메타데이터(window.LAB_NOTES)
content/*.md        글 본문
docs/superpowers/   설계 spec · 구현 plan
```
````

- [ ] **Step 2: 마무리 점검 (Playwright MCP, 반응형/접근성)**

```bash
python3 -m http.server 4173 >/tmp/labnotes-serve.log 2>&1 &
sleep 1
```
- `playwright_navigate` → `http://localhost:4173/index.html`, `playwright_resize` 375×800(모바일) → 사이드바가 접히고 헤더가 줄바꿈되며 가로 스크롤이 생기지 않는지 확인.
- 카테고리/태그 버튼이 키보드 Tab으로 포커스되고 Enter로 작동(`playwright_press_key`)하는지 확인.
- 콘솔 에러 없음: `playwright_console_logs`에 error 레벨 로그가 없는지 확인.

Expected: 반응형 정상, 키보드 조작 정상, 콘솔 에러 없음.

- [ ] **Step 3: 서버 종료 & 커밋**

```bash
kill %1 2>/dev/null || pkill -f "http.server 4173"
git add README.md
git commit -m "docs: add README with run and authoring instructions"
```

---

## Self-Review 결과

**1. Spec coverage**
- 빌드 없는 정적 사이트 → Task 2/3 (순수 HTML/CSS/JS). ✅
- marked 로컬 벤더링 → Task 3 Step 1–2. ✅
- 데이터 모델(posts.js 전역) → Task 1. ✅
- 카테고리 대분류 네비 → Task 2 (`renderNav`, 고정 4종). ✅
- 태그 다중 AND 필터 + 초기화 → Task 2 (`matches`, `clear-tags`). ✅
- 검색(제목·요약·태그) → Task 2 (`matches`의 `hay`). ✅
- 카드 리스트/배지/날짜/요약 → Task 2 (`card`). ✅
- 상세 마크다운 렌더(콜아웃/표/코드/details) → Task 3 + 마크다운 CSS(Task 2). ✅
- 다크/라이트 토글 + localStorage → Task 2 (`theme.js` + head 인라인). ✅
- 결과 없음/로드 실패 상태 → Task 2(`#empty-state`), Task 3(`.notice`). ✅
- 반응형/접근성 → style.css `@media`, `aria-*`, Task 4 Step 2 점검. ✅
- 시드: 실제글 1 + 샘플 3 → Task 1. ✅
- README(실행/추가) → Task 4. ✅

**2. Placeholder scan:** "TBD/TODO/적절히 처리" 없음. 모든 코드 스텝에 완성 코드 포함. ✅ (단 marked 버전은 404 시 대체 절차 명시.)

**3. Type consistency:** DOM id 계약(`#category-nav`,`#tag-filter`,`#post-list`,`#empty-state`,`#result-count`,`#search`,`#clear-tags`,`#theme-toggle`,`#post-meta`,`#post-body`)이 HTML·JS 간 일치. `window.LAB_NOTES.posts` 필드명(`slug/title/category/tags/date/summary/source`)이 posts.js·app.js·post.js에서 동일. 카테고리 표기 `AI·Data/Backend·Infra/Product·Ops/PM`가 posts.js·app.js `CATEGORIES`·검증 스크립트에서 일치. ✅
