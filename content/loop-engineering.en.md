# Don't Become the Loop — Let Claude Work While You Sleep

> 🔁 The Spanish X article linked from this tweet (@ElCopyMaster, 2026-06-30) is about **"Loop Engineering."** Core message: **Boris Cherny** of Anthropic — the maker of Claude Code — says he "no longer writes prompts; instead he designs the **loop** that throws prompts at Claude," signaling that a developer's job has shifted from *writing prompts → designing autonomous systems*.

## 1. Source Post

- Author: **Rafa Gonzalez | IA (@ElCopyMaster)** · verified (blue) account
- Posted: **June 30, 2026** · ~38 likes · 4 replies
- Format: the tweet body is only a link; the actual content is the linked **X article** — titled *"Deja de ser el bucle. Así puedes hacer que Claude trabaje mientras duermes"* (Don't become the loop. How to make Claude work while you sleep)
- Background: in June 2026, Boris Cherny's remark — "I no longer write prompts to Claude; the loop throws the prompts instead" — spread widely and popularized the topic

## 2. What Is Loop Engineering?

> 🧠 **Loop Engineering** = "Instead of hand-typing the next instruction every time, designing the system itself that **prompts · checks · remembers · re-runs** an AI agent."

- Treats AI not as a "one-shot generator that answers once per prompt," but as a **cycle** that repeats **act → observe → judge** on its own.
- The human role shifts from **task executor → architect**. Because it is higher-level (design) work, its effects compound.
- In an era where a single agent run takes an hour and touches dozens of files, **designing a loop that keeps the agent productive without drifting off-goal** becomes the highest-leverage work. → "an agent that runs while you sleep."

## 3. Why He Stopped Prompting (Boris Cherny)

- **Leverage**: designing the system once and reusing it beats writing a prompt for every task.
- **Deliberate underfunding principle**: intentionally understaffing — e.g., assigning 2 people to a 4-person job — forces the team to **build automation (loops)** instead of handling repetitive work by hand. → the cost structure shifts from "labor cost → token cost," which is cheaper in the long run.
- Running loops that each have their own worktree lets you run **several in parallel** and review only the results afterward.

## 4. The Four-Stage Evolution of Working with AI

> 📈 Each stage does not **replace** the previous one — it **wraps** it. (Prompts still live inside the loop.)

| Stage | Era | Focus |
|-------|-----|-------|
| **Prompt Engineering** | 2022–2024 | Writing effective phrasing, role assignment, step-by-step instructions |
| **Context Engineering** | 2025 | Managing everything visible at inference time (conversation history, retrieved docs, tool output) |
| **Harness Engineering** | 2026 | Building the environmental scaffolding around the agent — tools, constraints, feedback, safeguards |
| **Loop Engineering** | 2026 | Designing the act–observe–judge cycle itself |

## 5. Core Components of an Agent Loop

- **Verifiable termination condition**: a vague goal like "improve the code" ✕ → a verifiable goal like "tests pass" ○
- **Tool access to a real environment**: file system, terminal, test runner, type checker, version control
- **Context management**: prevent context-window overflow through summarization, pruning, and externalization
- **Termination & escalation logic**: explicit success/failure exits + handing off to a human when stuck
- **Error recovery**: distinguish recoverable errors (a failing test) from fatal ones (missing credentials)

## 6. Loop Pseudocode (Structure Example)

```python
state = init_state(goal)
for step in range(MAX_STEPS):
    thought = model.reason(state)
    action = model.choose_action(state)
    result = tools.execute(action)
    state = update(state, thought, action, result)
    state = compact(state)          # compress context

    if verifier.passes(state):      # verification passed → success exit
        return success(state)
    if no_progress(state) or budget.exhausted():
        return escalate_to_human(state)   # no progress / budget exhausted → call a human
return escalate_to_human(state)
```

## 7. Three Verification Patterns

1. **Deterministic verification**: objective, ungameable feedback such as tests, type checkers, and linters.
2. **Reflexion pattern**: the agent records lessons from its failures as its own "notes (episodic memory)" to improve the next attempt.
3. **Evaluator–Optimizer**: one model generates candidates, another evaluates them against criteria → repeat until it passes.

## 8. Real-World Example — a "Make CI Pass" Loop

- Give the agent a **dedicated git worktree** (isolation)
- Read the first failing test → find the cause → apply a patch → re-run the tests → check the output
- Record attempted fixes in an **external log** to avoid repeating the same mistake
- **Escalate to a human after 3 consecutive failures** on the same test
- On success, **open a draft PR and stop**

## 9. Common Failure Modes to Prepare For

- Context overflow / quality degradation
- Infinite loops caused by a lack of progress detection
- Reward hacking (optimizing the wrong metric)
- Self-reported "success" without verification
- Errors accumulating from unverified intermediate steps
- Unexpected token-cost blowups

## 10. Where to Start — Building Your First Loop

<details>
<summary>Expand summary</summary>

1. Pick the most hands-on, **repetitive workflow** (one where you review/copy-paste AI output every time, or that needs repeated judgment).
2. Design a loop to handle that workflow autonomously.
3. Put **verification in place** so a human doesn't have to review everything each time.
4. Let the system keep running (and review only the results).

</details>

## 11. Sources

- Original tweet: [@ElCopyMaster · X](https://x.com/elcopymaster/status/2071975894290248160)
- Linked article (X, Spanish): [Deja de ser el bucle…](https://x.com/i/article/2071971416572841986)
- Full Loop Engineering guide: [tosea.ai](http://tosea.ai)
- Boris Cherny background: [Memeburn](https://memeburn.com/boris-cherny-says-loop-engineering-has-replaced-prompting/) · [Product Market Fit](https://www.productmarketfit.tech/p/stop-prompting-ai-and-start-building) · [The AI Corner](https://www.the-ai-corner.com/p/loop-engineering-coding-agents-2026)

> 🗓️ Compiled 2026-07-01 · The X article body requires login and could not be accessed directly, so this was supplemented with secondary sources on the topic (loop engineering). The Boris Cherny quotes are paraphrases of his widely circulated remarks.
