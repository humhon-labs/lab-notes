# LLM Wiki — A Pattern for Growing a Personal Knowledge Base with LLMs

> 🧩 Andrej Karpathy's "LLM Wiki" note proposes a pattern where, instead of re-searching raw documents on every question like RAG, the **LLM incrementally builds and maintains an interlinked markdown wiki**. On top of three layers — raw sources, an LLM-owned wiki, and a schema (CLAUDE.md) — you repeat three operations (Ingest, Query, Lint), so knowledge is never re-derived but instead **accumulates as a single compounding asset**. Humans own curation and good questions; the LLM does the grunt work of summarizing, cross-referencing, and bookkeeping.

## 1. The Problem: RAG Doesn't Accumulate Knowledge

Most people's experience with LLMs and documents is **RAG**: upload a pile of files, and on every question the system retrieves relevant chunks and generates an answer. It works, but it has one fundamental limit.

> ⚠️ RAG **rediscovers knowledge from scratch on every query**. Ask a subtle question that requires synthesizing five documents, and the LLM has to find and piece together those fragments every single time. **Nothing is built up.**

NotebookLM, ChatGPT file uploads, and most RAG systems work this way. Because they start from the bottom each time, the waste grows as your exploration repeats.

## 2. The Core Idea: The Wiki as a Compounding Asset

This note proposes something different. Instead of retrieving from raw documents at query time, the **LLM incrementally builds and maintains a persistent wiki** — a structured, interlinked collection of markdown files that sits between you and the raw sources.

When you add a new source, the LLM doesn't just index it.

- It **reads** the source and extracts the key information.
- It **integrates** it into the existing wiki — updating entity pages, revising topic summaries.
- It **flags** where new data contradicts old claims.
- It strengthens or challenges the evolving synthesis.

In other words, knowledge is **compiled once and then kept current** — not re-derived on every query.

> 🌱 The key difference: the wiki is a **persistent, compounding artifact**. The cross-references are already there. The contradictions have already been flagged. The synthesis already reflects everything you've read. The wiki keeps getting richer with every source you add and every question you ask.

## 3. Division of Labor: Humans Curate, LLMs Maintain

You (almost) never write the wiki yourself. The **LLM writes and maintains all of it.**

| Actor | Role |
|-------|------|
| **Human** | Sourcing (curating what goes in), exploration, direction, **asking good questions** |
| **LLM** | Summarizing, cross-referencing, filing, bookkeeping — all the grunt work that makes a knowledge base actually useful over time |

Karpathy's actual workflow captures this split well.

> 🖥️ The LLM agent is open on one side, Obsidian on the other. The LLM makes edits based on our conversation, and I browse the results in real time — following links, checking the graph view, reading the updated pages. **Obsidian is the IDE; the LLM is the programmer; the wiki is the codebase.**

## 4. Architecture: Three Layers

The pattern is organized into three layers.

1. **Raw sources** — your curated collection of source documents: articles, papers, images, data files. They are **immutable**. The LLM reads from them but never modifies them. This is your **source of truth**.
2. **The wiki** — a directory of LLM-generated markdown files: summaries, entity pages, concept pages, comparisons, an overview, a synthesis. The LLM **owns this layer entirely**. It creates pages, updates them when new sources arrive, maintains cross-references, and keeps everything consistent. You read it; the LLM writes it.
3. **The schema** — a document that tells the LLM how the wiki is structured, what the conventions are, and what workflows to follow when ingesting, answering, or maintaining (`CLAUDE.md` for Claude Code, `AGENTS.md` for Codex). It's the **key configuration file**. It's what turns the LLM into a **disciplined wiki maintainer** rather than a generic chatbot. You and the LLM co-evolve it to fit your domain.

## 5. Three Operations: Ingest · Query · Lint

### Ingest

You drop a new source into the raw collection and tell the LLM to process it. An example flow.

1. The LLM reads the source.
2. It discusses the key takeaways with you.
3. It writes a summary page in the wiki.
4. It updates the index.
5. It updates relevant entity and concept pages across the wiki.
6. It appends an entry to the log.

> 📌 A single source might touch **10–15 wiki pages**. You can ingest one at a time and stay involved (reading summaries, guiding emphasis), or batch-ingest many with less supervision. Develop the workflow that fits your style and **document it in the schema** so future sessions reuse it.

### Query

You ask questions against the wiki. The LLM searches for relevant pages, reads them, and synthesizes an answer **with citations**. The form of the answer varies with the question — a markdown page, a comparison table, a slide deck (Marp), a chart (matplotlib), a canvas.

> 💡 The important insight: **good answers can be filed back into the wiki as new pages.** A comparison you asked for, an analysis, a connection you discovered — these are valuable and shouldn't disappear into chat history. This way your explorations **compound** in the knowledge base just like ingested sources do.

### Lint

Periodically, ask the LLM to health-check the wiki. What it looks for.

- **Contradictions** between pages
- **Stale claims** that newer sources have superseded
- **Orphan pages** with no inbound links
- **Important concepts** mentioned but lacking their own page
- Missing **cross-references**
- **Data gaps** that could be filled with a web search

The LLM is good at suggesting new questions to investigate and new sources to look for. This keeps the wiki healthy as it grows.

## 6. Two Files for Navigating the Wiki: index.md · log.md

Two special files help the LLM (and you) navigate the wiki as it grows. They serve different purposes.

| File | Nature | Role |
|------|--------|------|
| **index.md** | Content-oriented | A catalog of everything in the wiki. Each page listed with a link, a one-line summary, and optional metadata, organized by category. Updated on every ingest. On Query, the LLM **reads the index first** to find relevant pages, then drills in. |
| **log.md** | Chronological | An append-only record of what happened and when (ingests, queries, lint passes). Gives a timeline and helps the LLM understand what's been done recently. |

> 🛠️ Tip: if each log entry starts with a consistent prefix (`## [2026-04-02] ingest | Article Title`), the log becomes parseable with plain unix tools. `grep "^## \[" log.md | tail -5` gives the last 5 entries.

The index-first approach works surprisingly well up to **moderate scale (~100 sources, hundreds of pages)** and avoids the need for embedding-based RAG infrastructure.

## 7. Optional: CLI Tools and Search

As the wiki grows, you may want small tools that help the LLM operate on it more efficiently. The most obvious is a **search engine over the wiki pages.**

- At small scale, the index file is enough.
- As it grows, you want proper search. [qmd](https://github.com/tobi/qmd) — a local search engine for markdown with hybrid BM25/vector search plus LLM re-ranking, all on-device. It offers both a CLI (so the LLM can shell out to it) and an MCP server (so the LLM can use it as a native tool).
- Or, simpler: vibe-code a naive search script together with the LLM as the need arises.

## 8. Obsidian in Practice

<details>
<summary>Practical tips for using Obsidian as the wiki viewer/IDE (expand)</summary>

- **Web Clipper**: a browser extension that converts web articles to markdown. Great for quickly getting sources into your raw collection.
- **Download images locally**: In Settings → Files and links, set "Attachment folder path" to a fixed directory (e.g. `raw/assets/`). In Hotkeys, bind "Download attachments for current file" to a hotkey (e.g. Ctrl+Shift+D). After clipping, hit the hotkey and images download to local disk so the LLM can reference them directly. (Note: LLMs can't read markdown with inline images in one pass — the workaround is to read the text first, then view referenced images separately.)
- **Graph view**: the best way to see the shape of your wiki — what connects to what, which pages are hubs, which are orphans.
- **Marp**: a markdown-based slide format; generate presentations directly from wiki content.
- **Dataview**: queries page frontmatter (YAML: tags, dates, source counts) to generate dynamic tables and lists.
- **git**: the wiki is just a git repo of markdown files. You get version history, branching, and collaboration for free.

</details>

## 9. Why It Works (The Memex Connection)

The tedious part of maintaining a knowledge base is not the reading or the thinking — it's the **bookkeeping**: updating cross-references, keeping summaries current, flagging contradictions, maintaining consistency across dozens of pages.

> 🧠 Humans abandon wikis because the **maintenance burden grows faster than the value**. LLMs don't get bored, don't forget to update a cross-reference, and can touch 15 files in one pass. The wiki stays maintained because the **cost of maintenance is near zero**.

The idea is related in spirit to **Vannevar Bush's Memex (1945)** — a personal, actively curated knowledge store with associative trails between documents. Bush's vision was closer to this than to what the web became: private, actively curated, with the **connections between documents as valuable as the documents themselves**. The part he couldn't solve was who does the maintenance. The LLM handles that.

## 10. How to Start — An Abstract Pattern, the Specifics Are Yours

This note is **intentionally abstract**. It describes the idea, not a specific implementation. The exact directory structure, schema conventions, page formats, and tooling all depend on your domain, your preferences, and your LLM of choice.

- Everything mentioned above is **optional and modular** — pick what's useful, ignore what isn't.
- If your sources are text-only, you don't need image handling at all.
- If your wiki is small, the index file is all you need — no search engine.
- If you don't care about slide decks, just use markdown pages.

> 🚀 The right way to use this: share this document with your LLM agent and work **together** to instantiate a version that fits your needs. The document's only job is to communicate the pattern; your LLM can figure out the rest.

## Sources

- Original (Gist): [LLM Wiki — Andrej Karpathy](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
- Related: [Vannevar Bush, "As We May Think" (1945) — the original Memex concept](https://www.theatlantic.com/magazine/archive/1945/07/as-we-may-think/303881/)
- Tool: [qmd — local markdown search engine](https://github.com/tobi/qmd)

> 🗓️ Compiled on 2026-07-03 · A restructured summary note of Karpathy's "LLM Wiki" idea, centered on its three-layer / three-operation structure. It paraphrases and explains the core concepts and practical points rather than reproducing the original text verbatim.
