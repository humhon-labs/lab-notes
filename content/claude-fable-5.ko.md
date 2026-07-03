> 🧠 이 글은 **Claude Fable 5 프롬프팅 가이드**(Anthropic 공식 문서 + LinkedIn 요약)를 개발자·기술 실무자 관점에서 정리한 것입니다. 아래 §로 시작하는 링크는 이 글 안의 해당 섹션으로 이동합니다.

## ⭐ 핵심 요약 — 의미와 통찰

> **TL;DR** — Claude Fable 5는 "더 똑똑한 모델"이라기보다 **"혼자, 오래, 끝까지 일하는 모델"**이다. 그래서 프롬프팅의 무게중심이 *"어떻게 시킬까(지시 강화)"* 에서 *"어디까지 맡기고 어디서 멈추게 할까(자율성의 경계 설정)"* 로 이동한다.

**1. 왜 프롬프팅 방식이 바뀌는가 (근본 이유)**

- 모델 능력이 올라가면서, 과거에 필요했던 "억지로 시키는" 프롬프트(CRITICAL / YOU MUST, 단계 일일이 나열)가 오히려 품질을 떨어뜨린다 → **짧은 지시 한 줄**로 충분.
- 대신 몇 시간~며칠씩 자율 실행하면서 **새로운 실패 모드**가 생긴다: 과잉 계획, 요청하지 않은 리팩터·정리, 허위 진행 보고, 조기 종료, 남은 토큰에 대한 불안. → 프롬프팅의 목적이 "능력을 끌어올리기"에서 **"능력을 올바른 방향으로 제약하기"**로 전환된다.

**2. 가이드 전체를 3개 축으로 압축하면**

1. **경계를 정하라 (Constrain)** — 무엇을 하지 말고, 언제 멈추고, 무엇을 요청 없이는 건드리지 말지 명시. → §3.1 과잉계획 방지 · §3.2 불필요한 리팩터 금지 · §3.3 체크포인트 · §3.5 경계
2. **자율성을 신뢰하되 방향을 주라 (Delegate & Direct)** — 단계 나열 대신 **목표 + 이유(의도)**를 주고, 서브에이전트·메모리·effort로 위임. → §3.2 effort · §3.6 서브에이전트 · §3.7 메모리 · §3.10 이유 제공
3. **진실성·가독성을 강제하라 (Verify & Communicate)** — 진행 보고는 반드시 도구 결과에 근거하게, 최종 요약은 그 과정을 보지 못한 사람이 읽을 수 있게. → §3.4 진행 근거 확보 · §3.11 가독성 · §3.12 send_to_user

**3. 실무자가 오늘 바로 바꿀 것**

- `effort`는 **high 기본**, 최고 난도만 `xhigh`, 루틴은 `medium`/`low` — Fable의 저 effort도 이전 모델 최고치를 넘는 경우가 많음. ↳ 자세히: [§3.2 effort 레벨을 전부 고려하라](#s-effort)
- **refusal 처리 + Opus 4.8 폴백**을 코드에 기본 탑재 — 안전 분류기가 정상적인 인접 작업(보안 툴링·생명과학)도 거부할 수 있음. ↳ 자세히: [§2 API 동작 변경점 (Refusal·Fallback)](#s-api)
- 이전 모델용 **장황한 규정·스킬을 걷어내라** — Fable 5에서는 오히려 성능을 떨어뜨림. ↳ 자세히: [§4 스캐폴딩 — 기존 프롬프트/스킬 재검토](#s-scaffold-review)
- **"추론 과정을 응답에 그대로 써라"류 지시 제거** — `reasoning_extraction` 거부를 유발해 폴백만 늘어남. ↳ 자세히: [§4 스캐폴딩 — reasoning 재현 지시 금지](#s-scaffold-reasoning)

> **한 문장 정리** — 이전 모델엔 *"더 열심히 하라"*고 밀어붙였다면, Fable 5엔 *"네가 알아서 하되, 여기까지만 하고, 사실만 보고하라"*고 경계를 그어주는 것이 핵심이다.

## 1. Claude Fable 5 개요

- **포지셔닝**: Anthropic이 널리 출시한 모델 중 가장 강력한 모델. 사람 기준 몇 시간~며칠~몇 주가 걸리는 **end-to-end / long-horizon 에이전트 작업**에 특화. 가장 어려운 미해결 문제에 투입할 때 효과가 크다(쉬운 작업으로만 테스트하면 능력이 과소평가됨).
- **컨텍스트 / 출력**: 기본 **1M 토큰 컨텍스트**, 요청당 최대 **128K 출력 토큰**.
- **가격**: 입력 **$10** / 출력 **$50** (per 1M) — Opus 4.8($5/$25)보다 상위 티어. "최신 모델 업그레이드"의 기본 대상은 여전히 `claude-opus-4-8`이고, Fable 5는 명시적으로 선택할 때만 사용.
- **데이터 보존**: **30일 보존 필수**. Zero Data Retention(ZDR) 환경에서는 사용 불가(모든 요청 400).
- **강점 영역**: 장기 자율 실행, 복잡·명확한 문제의 1-shot 구현, 고해상도 비전(흐리거나 회전된 이미지에 bash·crop 도구 사용), 엔터프라이즈 문서/스프레드시트/슬라이드, 코드 리뷰·디버깅(리포지토리 히스토리 탐색), 모호한 멀티스레드 요청 처리, **병렬 서브에이전트 위임/협업**.
- **주의**: 공격적 사이버보안 및 생명과학 도메인은 대상이 아니며 거부(`refusal`)될 수 있음.

## <span id="s-api" class="anchor"></span>2. API 동작 변경점 (마이그레이션 핵심)

| 항목 | 변경 내용 |
|------|-----------|
| **Thinking** | 항상 켜짐(adaptive only). `thinking:{type:"disabled"}`와 `budget_tokens`는 **400 에러**. 깊이는 `output_config.effort`로 제어 |
| **Thinking 출력** | raw chain-of-thought는 절대 반환되지 않음. `display:"summarized"`는 요약, 기본 `"omitted"`는 빈 문자열. 같은 모델 멀티턴에서는 thinking 블록을 **그대로** 되돌려줄 것 |
| **Refusal** | 안전 분류기가 거부 시 **HTTP 200 + `stop_reason:"refusal"`**. `content` 읽기 전 반드시 `stop_reason` 체크 |
| **Fallback** | 폴백은 opt-in. `fallbacks` 파라미터(서버사이드, beta 헤더 `server-side-fallback-2026-06-01`)로 `claude-opus-4-8` 폴백을 기본 탑재 권장 |
| **Prefill** | 마지막 assistant 프리필 미지원(400) → structured outputs(`output_config.format`)로 대체 |
| **Tokenizer** | Opus 4.8과 동일(토큰 수는 4.7/4.8 대비 거의 동일, 단가만 상이) |

## 3. 프롬프팅 가이드 핵심

> 아래 스니펫은 시스템 프롬프트에 그대로 붙여 쓰는 원문(영문)입니다. Fable 5는 지시 이행력이 좋아 **짧은 지시 한 줄**로 대부분의 행동을 조정할 수 있습니다.

### 3.1 턴이 길어진다 (Longer turns)

어려운 작업은 고 effort에서 한 요청이 수 분씩, 자율 실행은 수 시간까지 이어질 수 있음. **클라이언트 타임아웃·스트리밍·진행 표시**를 먼저 조정하고, 블로킹 대신 비동기(스케줄 잡)로 확인하도록 하네스 재설계 고려. 모호한 작업에서 과잉 계획 방지:

```text
When you have enough information to act, act. Do not re-derive facts already established in the conversation, re-litigate a decision the user has already made, or narrate options you will not pursue in user-facing messages. If you are weighing a choice, give a recommendation, not an exhaustive survey. This does not apply to thinking blocks.
```

### <span id="s-effort" class="anchor"></span>3.2 effort 레벨을 전부 고려하라

`high`가 기본, `xhigh`는 최고 난도, `medium`/`low`는 루틴. Fable 5의 저 effort도 이전 모델의 `xhigh`를 능가하는 경우가 많음. 고 effort에서 요청하지 않은 정리·리팩터 방지:

```text
Don't add features, refactor, or introduce abstractions beyond what the task requires. A bug fix doesn't need surrounding cleanup and a one-shot operation usually doesn't need a helper. Don't design for hypothetical future requirements: do the simplest thing that works well. Avoid premature abstraction and half-finished implementations. Don't add error handling, fallbacks, or validation for scenarios that cannot happen. Trust internal code and framework guarantees. Only validate at system boundaries (user input, external APIs). Don't use feature flags or backwards-compatibility shims when you can just change the code.
```

### 3.3 강력한 지시 이행 — 간결성 / 체크포인트

결론부터 말하게 하는 간결성 지시:

```text
Lead with the outcome. Your first sentence after finishing should answer "what happened" or "what did you find": the thing the user would ask for if they said "just give me the TLDR." Supporting detail and reasoning come after. Being readable and being concise are different things, and readability matters more.

The way to keep output short is to be selective about what you include (drop details that don't change what the reader would do next), not to compress the writing into fragments, abbreviations, arrow chains like A → B → fails, or jargon.
```

꼭 필요할 때만 멈추게 하는 체크포인트 지시:

```text
Pause for the user only when the work genuinely requires them: a destructive or irreversible action, a real scope change, or input that only they can provide. If you hit one of these, ask and end the turn, rather than ending on a promise.
```

### 3.4 장기 실행 중 진행 상황 근거 확보

허위 진행 보고를 거의 제거한 지시:

```text
Before reporting progress, audit each claim against a tool result from this session. Only report work you can point to evidence for; if something is not yet verified, say so explicitly. Report outcomes faithfully: if tests fail, say so with the output; if a step was skipped, say that; when something is done and verified, state it plainly without hedging.
```

### 3.5 경계 명시

요청하지 않은 행동(이메일 초안, 방어적 git 브랜치 백업 등) 억제:

```text
When the user is describing a problem, asking a question, or thinking out loud rather than requesting a change, the deliverable is your assessment. Report your findings and stop. Don't apply a fix until they ask for one. Before running a command that changes system state (restarts, deletes, config edits), check that the evidence actually supports that specific action. A signal that pattern-matches to a known failure may have a different cause.
```

### 3.6 병렬 서브에이전트

Fable 5는 서브에이전트를 잘 부린다. 블로킹보다 **비동기 통신**을 선호하고 장기 서브에이전트가 컨텍스트를 유지하게 하라(캐시 read로 비용·시간 절감):

```text
Delegate independent subtasks to subagents and keep working while they run. Intervene if a subagent goes off track or is missing relevant context.
```

### 3.7 메모리 시스템 구축

Markdown 파일 하나로도 학습 내용을 기록/참조하게 하면 성능이 좋아짐:

```text
Store one lesson per file with a one-line summary at the top. Record corrections and confirmed approaches alike, including why they mattered. Don't save what the repo or chat history already records; update an existing note rather than creating a duplicate; delete notes that turn out to be wrong.
```

과거 세션에서 메모리를 부트스트랩:

```text
Reflect on the previous sessions we've had together. Use subagents to identify core themes and lessons, and store them in [X]. Make sure you know to reference [X] for future use.
```

### 3.8 조기 종료 방지 (자율 파이프라인)

장기 세션에서 도구 호출 없이 "이제 X를 하겠다"로 턴을 끝내는 드문 경우 방지:

```text
You are operating autonomously. The user is not watching in real time and cannot answer questions mid-task, so asking "Want me to…?" or "Shall I…?" will block the work. For reversible actions that follow from the original request, proceed without asking. Offering follow-ups after the task is done is fine; asking permission after already discussing with the user before doing the work is not. Before ending your turn, check your last paragraph. If it is a plan, an analysis, a question, a list of next steps, or a promise about work you have not done ("I'll…", "let me know when…"), do that work now with tool calls. End your turn only when the task is complete or you are blocked on input only the user can provide.
```

### 3.9 컨텍스트 예산 불안 방지

남은 토큰 카운트다운을 모델에 노출하면 스스로 세션 종료/요약을 제안하는 경우가 있음. 가급적 노출하지 말고, 필요하면:

```text
You have ample context remaining. Do not stop, summarize, or suggest a new session on account of context limits. Continue the work.
```

### 3.10 요청의 "이유"를 함께 제공

의도를 알려주면 관련 정보를 더 잘 연결한다:

```text
I'm working on [the larger task] for [who it's for]. They need [what the output enables]. With that in mind: [request].
```

### 3.11 사용자 커뮤니케이션 가독성

긴 에이전트 대화 후 최종 요약이 난해해지지 않도록:

```text
Terse shorthand is fine between tool calls (that's you thinking out loud, and brevity there is good). Your final summary is different: it's for a reader who didn't see any of that.

If you've been working for a while without the user watching (overnight, across many tool calls, since they last spoke), your final message is their first look at any of it. Write it as a re-grounding, not a continuation of your working thread: the outcome first, then the one or two things you need from them, each explained as if new. The vocabulary you built up while working is yours, not theirs; leave it behind unless you re-introduce it.

When you write the summary at the end, drop the working shorthand. Write complete sentences. Spell out terms. Don't use arrow chains, hyphen-stacked compounds, or labels you made up earlier. When you mention files, commits, flags, or other identifiers, give each one its own plain-language clause. Open with the outcome: one sentence on what happened or what you found. Then the supporting detail. If you have to choose between short and clear, choose clear.
```

### 3.12 send_to_user 도구

장기 비동기 에이전트가 턴을 끝내지 않고 사용자에게 **원문 그대로** 전달해야 할 때 쓰는 클라이언트 도구. 도구 입력은 요약되지 않아 내용이 그대로 전달됨:

```json
{
  "name": "send_to_user",
  "description": "Display a message directly to the user. Use this for progress updates, partial results, or content the user must see exactly as written before the task finishes.",
  "input_schema": {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "description": "The content to display to the user."
      }
    },
    "required": ["message"]
  }
}
```

도구 정의만으로는 잘 호출하지 않으므로 시스템 프롬프트에 유도 문구를 함께 넣을 것:

```text
Between tool calls, when you have content the user must read verbatim (a partial deliverable, a direct answer to their question), call the send_to_user tool with that content. Use send_to_user only for user-facing content, not for narration or reasoning.
```

## 4. 스캐폴딩 권장 변경

- **난이도 상단에서 시작**: 이전 모델보다 어려운 과제를 주고 스코핑·질문·실행을 맡겨라.
- **self-verification 명시**: 장기 작업에는 별도 컨텍스트의 검증 서브에이전트가 자기비판보다 낫다. → `Establish a method for checking your own work at an interval of [X] as you build. Run this every [X interval], verifying your work with subagents against the specification.`
- <span id="s-scaffold-review" class="anchor"></span>**기존 프롬프트/스킬 재검토**: 이전 모델용의 과도하게 세세한 규정은 오히려 Fable 5 품질을 떨어뜨림. 제거 후 기본 성능과 비교.
- <span id="s-scaffold-reasoning" class="anchor"></span>**reasoning 재현 지시 금지**: 내부 추론을 응답 텍스트로 그대로 옮기라는 지시는 `reasoning_extraction` 거부를 유발해 Opus 4.8로의 폴백을 늘림. 추론 가시성이 필요하면 adaptive thinking의 구조화된 `thinking` 블록을 읽고, 진행상황은 send_to_user로 노출할 것.

## 5. 출처

- **원본 링크(등록됨)**: [LinkedIn — Claude Fable 5 Prompting Guide Summary (kimjooeon)](https://www.linkedin.com/posts/kimjooeon_claude-fable-5-prompting-guide-summary-share-7478223725356535808-XtLY/)
- **Anthropic 공식 1차 문서**:
	- Prompting Claude Fable 5 — `platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5`
	- Introducing Claude Fable 5 and Claude Mythos 5 — `platform.claude.com/docs/en/about-claude/models/introducing-claude-fable-5`
	- Effort / Adaptive thinking / Refusals and fallback (Build with Claude 문서)

> 🗓️ 정리 작성일: 2026-07-03 · Anthropic 공식 프롬프팅 가이드와 LinkedIn 요약을 바탕으로 재구성했습니다. 코드 블록의 영문 스니펫은 시스템 프롬프트에 그대로 붙여 쓰는 원문이라 번역 없이 유지했습니다.
