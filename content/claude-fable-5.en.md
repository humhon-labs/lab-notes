> 🧠 This is a developer-focused summary of the **Claude Fable 5 prompting guide** (Anthropic's official docs + a LinkedIn recap). Links below that start with § jump to the matching section within this article.

## ⭐ Executive Summary — What It Means

> **TL;DR** — Claude Fable 5 is less "a smarter model" than **"a model that works alone, for a long time, all the way to the end."** So the center of gravity in prompting shifts from *"how do I make it do this (reinforcing instructions)"* to *"how far do I delegate and where do I make it stop (setting the boundaries of autonomy)."*

**1. Why prompting changes (the root cause)**

- As model capability rises, the old "force it to comply" prompts (CRITICAL / YOU MUST, spelling out every step) actually *hurt* quality → **a single short instruction** is enough.
- Instead, running autonomously for hours to days creates **new failure modes**: over-planning, unrequested refactors and cleanup, false progress reports, ending early, and anxiety about remaining tokens. → The purpose of prompting shifts from "raising capability" to **"constraining capability in the right direction."**

**2. The whole guide compressed into 3 axes**

1. **Constrain** — spell out what not to do, when to stop, and what not to touch without being asked. → §3.1 prevent over-planning · §3.2 no unnecessary refactors · §3.3 checkpoints · §3.5 boundaries
2. **Delegate & Direct** — instead of listing steps, give the **goal + the reason (intent)**, and delegate via subagents, memory, and effort. → §3.2 effort · §3.6 subagents · §3.7 memory · §3.10 provide the reason
3. **Verify & Communicate** — ground every progress report in tool results, and write the final summary so someone who didn't see the process can read it. → §3.4 evidence-based progress · §3.11 readability · §3.12 send_to_user

**3. What practitioners should change today**

- Make `effort` **high by default**, `xhigh` only for the hardest tasks, `medium`/`low` for routine work — even Fable's low effort often exceeds prior models' ceiling. ↳ More: [§3.2 Consider every effort level](#s-effort)
- Bake **refusal handling + an Opus 4.8 fallback** into your code — the safety classifier can refuse legitimate adjacent work (security tooling, life sciences). ↳ More: [§2 API behavior changes (Refusal · Fallback)](#s-api)
- Strip out the **verbose rules and skills** written for older models — on Fable 5 they degrade performance instead. ↳ More: [§4 Scaffolding — revisit existing prompts/skills](#s-scaffold-review)
- Remove **"write your reasoning verbatim into the response"-type instructions** — they trigger `reasoning_extraction` refusals and only increase fallbacks. ↳ More: [§4 Scaffolding — no reasoning-replication instructions](#s-scaffold-reasoning)

> **In one sentence** — where you pushed older models to *"try harder,"* the key with Fable 5 is to draw boundaries: *"do it your way, but only up to here, and report only facts."*

## 1. Claude Fable 5 Overview

- **Positioning**: the most powerful model Anthropic has broadly released. Specialized for **end-to-end / long-horizon agentic work** that would take a person hours, days, or weeks. It pays off most on the hardest unsolved problems (testing it only on easy tasks underrates it).
- **Context / output**: **1M-token context** by default, up to **128K output tokens** per request.
- **Pricing**: **$10** input / **$50** output (per 1M) — a tier above Opus 4.8 ($5/$25). The default target for a "latest model upgrade" is still `claude-opus-4-8`; use Fable 5 only when explicitly selected.
- **Data retention**: **30-day retention required**. Not usable under Zero Data Retention (ZDR) (all requests 400).
- **Strength areas**: long autonomous runs, 1-shot implementation of complex-but-clear problems, high-resolution vision (using bash/crop tools on blurry or rotated images), enterprise documents/spreadsheets/slides, code review and debugging (exploring repository history), handling ambiguous multi-threaded requests, and **parallel subagent delegation/collaboration**.
- **Caution**: offensive cybersecurity and life-sciences domains are out of scope and may be refused (`refusal`).

## <span id="s-api" class="anchor"></span>2. API Behavior Changes (Migration Essentials)

| Item | What changed |
|------|--------------|
| **Thinking** | Always on (adaptive only). `thinking:{type:"disabled"}` and `budget_tokens` return a **400 error**. Control depth via `output_config.effort` |
| **Thinking output** | Raw chain-of-thought is never returned. `display:"summarized"` gives a summary; the default `"omitted"` gives an empty string. In multi-turn with the same model, return the thinking blocks back **verbatim** |
| **Refusal** | On a safety-classifier refusal you get **HTTP 200 + `stop_reason:"refusal"`**. Always check `stop_reason` before reading `content` |
| **Fallback** | Fallback is opt-in. Recommend baking in an `claude-opus-4-8` fallback via the `fallbacks` parameter (server-side, beta header `server-side-fallback-2026-06-01`) |
| **Prefill** | Trailing assistant prefill is unsupported (400) → replace with structured outputs (`output_config.format`) |
| **Tokenizer** | Same as Opus 4.8 (token counts nearly identical to 4.7/4.8; only the unit price differs) |

## 3. Prompting Guide — Core

> The snippets below are the original (English) text you paste straight into your system prompt. Fable 5 follows instructions well, so **a single short instruction** can steer most behaviors.

### 3.1 Longer turns

Hard tasks at high effort can run several minutes per request; autonomous runs can stretch to hours. Adjust **client timeouts, streaming, and progress indicators** first, and consider redesigning the harness to check asynchronously (scheduled jobs) instead of blocking. To prevent over-planning on ambiguous tasks:

```text
When you have enough information to act, act. Do not re-derive facts already established in the conversation, re-litigate a decision the user has already made, or narrate options you will not pursue in user-facing messages. If you are weighing a choice, give a recommendation, not an exhaustive survey. This does not apply to thinking blocks.
```

### <span id="s-effort" class="anchor"></span>3.2 Consider every effort level

`high` is the default, `xhigh` for the hardest tasks, `medium`/`low` for routine. Fable 5's low effort often beats older models' `xhigh`. To prevent unrequested cleanup/refactors at high effort:

```text
Don't add features, refactor, or introduce abstractions beyond what the task requires. A bug fix doesn't need surrounding cleanup and a one-shot operation usually doesn't need a helper. Don't design for hypothetical future requirements: do the simplest thing that works well. Avoid premature abstraction and half-finished implementations. Don't add error handling, fallbacks, or validation for scenarios that cannot happen. Trust internal code and framework guarantees. Only validate at system boundaries (user input, external APIs). Don't use feature flags or backwards-compatibility shims when you can just change the code.
```

### 3.3 Strong instruction-following — Conciseness / Checkpoints

Conciseness — lead with the conclusion:

```text
Lead with the outcome. Your first sentence after finishing should answer "what happened" or "what did you find": the thing the user would ask for if they said "just give me the TLDR." Supporting detail and reasoning come after. Being readable and being concise are different things, and readability matters more.

The way to keep output short is to be selective about what you include (drop details that don't change what the reader would do next), not to compress the writing into fragments, abbreviations, arrow chains like A → B → fails, or jargon.
```

Checkpoints — stop only when truly necessary:

```text
Pause for the user only when the work genuinely requires them: a destructive or irreversible action, a real scope change, or input that only they can provide. If you hit one of these, ask and end the turn, rather than ending on a promise.
```

### 3.4 Ground progress during long runs

An instruction that nearly eliminates false progress reports:

```text
Before reporting progress, audit each claim against a tool result from this session. Only report work you can point to evidence for; if something is not yet verified, say so explicitly. Report outcomes faithfully: if tests fail, say so with the output; if a step was skipped, say that; when something is done and verified, state it plainly without hedging.
```

### 3.5 State boundaries

Suppress unrequested actions (drafting emails, defensive git-branch backups, etc.):

```text
When the user is describing a problem, asking a question, or thinking out loud rather than requesting a change, the deliverable is your assessment. Report your findings and stop. Don't apply a fix until they ask for one. Before running a command that changes system state (restarts, deletes, config edits), check that the evidence actually supports that specific action. A signal that pattern-matches to a known failure may have a different cause.
```

### 3.6 Parallel subagents

Fable 5 orchestrates subagents well. Prefer **asynchronous communication** over blocking, and keep long-running subagents holding their context (cache reads save cost and time):

```text
Delegate independent subtasks to subagents and keep working while they run. Intervene if a subagent goes off track or is missing relevant context.
```

### 3.7 Build a memory system

Even a single Markdown file for recording/referencing lessons improves performance:

```text
Store one lesson per file with a one-line summary at the top. Record corrections and confirmed approaches alike, including why they mattered. Don't save what the repo or chat history already records; update an existing note rather than creating a duplicate; delete notes that turn out to be wrong.
```

To bootstrap memory from past sessions:

```text
Reflect on the previous sessions we've had together. Use subagents to identify core themes and lessons, and store them in [X]. Make sure you know to reference [X] for future use.
```

### 3.8 Prevent ending early (autonomous pipelines)

For the rare case where a long session ends a turn with "now I'll do X" and no tool call:

```text
You are operating autonomously. The user is not watching in real time and cannot answer questions mid-task, so asking "Want me to…?" or "Shall I…?" will block the work. For reversible actions that follow from the original request, proceed without asking. Offering follow-ups after the task is done is fine; asking permission after already discussing with the user before doing the work is not. Before ending your turn, check your last paragraph. If it is a plan, an analysis, a question, a list of next steps, or a promise about work you have not done ("I'll…", "let me know when…"), do that work now with tool calls. End your turn only when the task is complete or you are blocked on input only the user can provide.
```

### 3.9 Prevent context-budget anxiety

Exposing a remaining-token countdown to the model sometimes makes it propose ending/summarizing the session on its own. Avoid exposing it; if you must:

```text
You have ample context remaining. Do not stop, summarize, or suggest a new session on account of context limits. Continue the work.
```

### 3.10 Provide the "reason" behind a request

Telling it the intent helps it connect relevant information:

```text
I'm working on [the larger task] for [who it's for]. They need [what the output enables]. With that in mind: [request].
```

### 3.11 Readability of user-facing communication

So the final summary after a long agent run doesn't become cryptic:

```text
Terse shorthand is fine between tool calls (that's you thinking out loud, and brevity there is good). Your final summary is different: it's for a reader who didn't see any of that.

If you've been working for a while without the user watching (overnight, across many tool calls, since they last spoke), your final message is their first look at any of it. Write it as a re-grounding, not a continuation of your working thread: the outcome first, then the one or two things you need from them, each explained as if new. The vocabulary you built up while working is yours, not theirs; leave it behind unless you re-introduce it.

When you write the summary at the end, drop the working shorthand. Write complete sentences. Spell out terms. Don't use arrow chains, hyphen-stacked compounds, or labels you made up earlier. When you mention files, commits, flags, or other identifiers, give each one its own plain-language clause. Open with the outcome: one sentence on what happened or what you found. Then the supporting detail. If you have to choose between short and clear, choose clear.
```

### 3.12 The send_to_user tool

A client-side tool for when a long-running async agent must deliver content to the user **verbatim** without ending its turn. The tool input isn't summarized, so the content passes through as-is:

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

The definition alone rarely gets it called, so add a nudge to the system prompt:

```text
Between tool calls, when you have content the user must read verbatim (a partial deliverable, a direct answer to their question), call the send_to_user tool with that content. Use send_to_user only for user-facing content, not for narration or reasoning.
```

## 4. Recommended Scaffolding Changes

- **Start at the top of the difficulty range**: give it harder tasks than older models and let it handle scoping, questions, and execution.
- **Make self-verification explicit**: for long tasks, a verification subagent in a separate context beats self-critique. → `Establish a method for checking your own work at an interval of [X] as you build. Run this every [X interval], verifying your work with subagents against the specification.`
- <span id="s-scaffold-review" class="anchor"></span>**Revisit existing prompts/skills**: overly granular rules meant for older models actually degrade Fable 5's quality. Remove them and compare against baseline performance.
- <span id="s-scaffold-reasoning" class="anchor"></span>**No reasoning-replication instructions**: telling it to copy internal reasoning into the response text triggers `reasoning_extraction` refusals and increases fallbacks to Opus 4.8. If you need reasoning visibility, read adaptive thinking's structured `thinking` blocks, and surface progress via send_to_user.

## 5. Sources

- **Original link (registered)**: [LinkedIn — Claude Fable 5 Prompting Guide Summary (kimjooeon)](https://www.linkedin.com/posts/kimjooeon_claude-fable-5-prompting-guide-summary-share-7478223725356535808-XtLY/)
- **Anthropic official primary docs**:
	- Prompting Claude Fable 5 — `platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5`
	- Introducing Claude Fable 5 and Claude Mythos 5 — `platform.claude.com/docs/en/about-claude/models/introducing-claude-fable-5`
	- Effort / Adaptive thinking / Refusals and fallback (Build with Claude docs)

> 🗓️ Compiled 2026-07-03 · Reconstructed from Anthropic's official prompting guide and a LinkedIn recap. The English snippets in code blocks are the original text you paste straight into a system prompt, so they are kept untranslated.
