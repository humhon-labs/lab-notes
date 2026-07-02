# Agent Skills — An Open Format for Giving Agents Knowledge and Workflows

> 🧩 **Agent Skills** is a lightweight, open format for equipping AI agents with specialized knowledge and repeatable workflows. A skill is simply a folder containing a `SKILL.md` file, and it works through **progressive disclosure** — instructions load only when needed. Originally built by Anthropic and released as an open standard, it has been adopted by Claude Code, Cursor, Gemini CLI, GitHub Copilot, and more. This note distills the concept and its structure.

## 1. What Are Agent Skills?

Agents are increasingly capable, yet they usually lack the **context** required to do real work reliably. Procedural knowledge like "this is how our company reviews contracts" or "run this data pipeline in this exact order" simply isn't baked into a model's weights.

Agent Skills is a format that packages this **procedural knowledge and company-, team-, or user-specific context** into portable, version-controlled folders that an agent **loads on demand**.

- **Core definition**: a skill = a **folder** containing a `SKILL.md` file. That file holds metadata plus instructions, and it can also bundle scripts, reference material, and templates.
- **Nature**: an **open, vendor-neutral format**. Build a skill once and reuse it across any skills-compatible agent.

## 2. Why Do They Matter?

> 📦 Skills externalize the know-how you used to paste into every prompt into **reusable files**.

What skills give an agent:

- **Domain expertise**: capture specialized knowledge — legal review processes, data-analysis pipelines, presentation-formatting rules — as reusable instructions and resources.
- **Repeatable workflows**: turn multi-step tasks into consistent, auditable procedures instead of results that vary run to run.
- **Cross-product reuse**: build a skill once and use it in any agent that supports the format. The know-how follows you even when you switch tools.

## 3. The Structure of a Skill

A skill is a directory containing, at minimum, a single `SKILL.md`. Everything else is optional.

```text
skill-name/
├── SKILL.md          # Required: metadata + instructions
├── scripts/          # Optional: executable code
├── references/       # Optional: docs loaded when needed
├── assets/           # Optional: templates, resources
└── ...               # Any additional files or directories
```

- `scripts/` — code the agent can **execute**. Ideally self-contained (or with documented dependencies), with helpful error messages and graceful edge-case handling. (Python, Bash, JavaScript, etc.; supported languages depend on the agent.)
- `references/` — **documentation read only when needed**. A place to split long content out of `SKILL.md`.
- `assets/` — reusable **resources** such as templates and forms.

## 4. The `SKILL.md` Format

`SKILL.md` is **YAML frontmatter followed by a Markdown body**. The frontmatter carries the minimal information an agent uses to decide *when* to invoke the skill; the body holds the actual instructions.

```markdown
---
name: pdf-processing
description: Extract text and tables from PDFs, fill forms, and merge files.
  Use when the user mentions PDFs, forms, or document extraction.
license: Apache-2.0
metadata:
  version: "1.0"
---

# PDF Processing

## Step-by-step instructions
1. ...

## Input / output examples
...

## Common edge cases
...
```

Frontmatter fields:

| Field | Required | Constraints |
|-------|----------|-------------|
| `name` | ✅ | Max 64 chars; lowercase letters, numbers, hyphens only. No leading/trailing or consecutive hyphens; must **match the parent directory name** |
| `description` | ✅ | Max 1024 chars, non-empty. State **what it does + when to use it**, with keywords |
| `license` | ❌ | License name or reference to a bundled license file |
| `compatibility` | ❌ | Max 500 chars. Environment needs: target product, required packages, network access, etc. |
| `metadata` | ❌ | Arbitrary key-value map (version, author, …) |
| `allowed-tools` | ❌ | Space-separated list of pre-approved tools. Experimental |

> ⚠️ The `description` makes or breaks a skill. Vague ("Helps with PDFs") ✕ → concrete ("Extracts text and tables from PDFs, fills forms, merges files. Use when working with PDFs, forms, or document extraction") ○. The agent picks a skill from this single sentence, so pack it with **behavior + trigger keywords**.

## 5. How They Work — Progressive Disclosure in Three Stages

> 🔎 The key idea: **don't keep every full instruction set in memory.** Keep only names and descriptions resident, and load the real instructions only when the task calls for them, saving context.

1. **Discovery** — at startup the agent loads only each skill's **`name` and `description`** — just enough to know when it might be relevant.
2. **Activation** — when a task matches a skill's description, the agent reads that skill's **full `SKILL.md` instructions** into context.
3. **Execution** — the agent follows the instructions, optionally **running bundled code** or **loading referenced files** from `references/` as needed.

Thanks to these three stages, an agent can keep **many skills on hand while keeping its context footprint small** — full instructions unfold only when actually needed.

## 6. How Do They Differ From MCP and Tools?

<details>
<summary>Skills vs. other extension mechanisms — expand</summary>

- **Tools / function calling**: define individual capabilities (APIs) an agent can call. A skill is closer to the **procedural knowledge** of *when and how* to combine those capabilities — and a skill can use tools internally.
- **MCP (Model Context Protocol)**: a protocol connecting an agent to external data and tool servers. A skill isn't a server; it's a **bundle of instructions and resources** shipped as a folder. The two are complementary.
- **Plain prompts**: a prompt must be pasted in each time; a skill is a version-controlled file you **build once, then reuse and share**.

</details>

## 7. Open Development and Adoption

- The Agent Skills format was originally developed by **Anthropic** and released as an **open standard**.
- It has since been adopted by a range of agent products — **Claude Code, Cursor, Gemini CLI, GitHub Copilot**, and a growing list of skills-compatible clients.
- The standard is open to contributions from the broader ecosystem, with discussion on GitHub and Discord. The core value: a single folder becomes a **shared unit of knowledge that travels across tools**.

## 8. Takeaways for Practitioners

- Skills freeze "**the thing you kept re-explaining in prompts**" into files you can reuse, version, and share.
- A well-written `description` *is* your routing logic — the agent chooses skills from descriptions alone.
- Split long instructions into `references/` and pull repeated logic into `scripts/` to **conserve context**.
- Because the format is vendor-neutral, a skill you build once survives a change of tools.

## Sources

- Official overview: [agentskills.io](https://agentskills.io/home)
- Format specification: [agentskills.io/specification](https://agentskills.io/specification)

> 🗓️ Compiled: 2026-07-03 · Reconstructed around the core concepts from the agentskills.io overview and specification pages. Link lists and CTAs were omitted.
