# A Self-Operating Portfolio With Zero Update Cost — One Markdown Vault as the Single SSOT

> 🗂️ Instead of hand-syncing nine scattered profiles (resume, LinkedIn, personal site, FAQ, AI chatbot, and more) every time, this note reconstructs an infrastructure that treats **one markdown knowledge base (a vault) as the single source of truth (SSOT)** and auto-derives everything else. Push one markdown file to the vault → an LLM ETL step normalizes it into SiteData → the site copy, persona views, FAQ, and AI chatbot all refresh at once. Reliability rests on a 3-tier fallback; stability rests on a 4-way permission split. Reconstructed from Hansol Lim's "Building an AI Portfolio (1)."

## 1. The Real Cost Is "Where Do I Have to Fix This?"

Edit one line of your resume at 2 a.m. before an interview, and LinkedIn is now out of sync; fix that, and your personal site is off too. For a job seeker, the expensive cost is not the minute spent editing a line — it is the **cognitive load of re-deriving, every single time, which of your profiles needs touching.**

The original author counted nine profiles:

- Resume PDF · LinkedIn · GitHub profile · business card
- Site portfolio view · site FAQ · AI chatbot answer context
- Cover-letter template · interview self-introduction script

Every new job, project, or article forces a mental sweep of all nine to decide what to update. Because the load is high, something eventually gets missed. Once, an interviewer asked about a project shown "on the site" — and it wasn't there. When updates are expensive, you stop wanting to write at all.

## 2. The Fix — Collapse the Source of Truth Into One Place

The decision is simple: **pick one of the nine as the "original," and make the other eight follow from it automatically.**

The original is a markdown personal knowledge base (a vault) with an Obsidian-style, object-oriented folder structure — one folder per object type.

| Folder (object type) | Example | Current count |
|---|---|---|
| `organizations` | companies worked at | 14 |
| `projects` | completed projects | 13 |
| `artifacts` | posts, talks, outputs | 11 |
| `people` / `concepts` / `places` / `events` / `action log` | people, concepts, places, events, activity log | — |

On top of this sit separate sealed layers: 1,008 blog posts, 49 Medium posts, 174 LinkedIn posts, and one book.

> ✍️ The update rule becomes: "When there is a new company, add **one markdown file** to `organizations`. That's it. The other eight profiles follow."

## 3. The Pipeline: How One Markdown File Rewrites the Whole Site

Committing and pushing markdown to the vault wakes the main repo's build workflow, which runs seven steps.

1. Read the vault's changes.
2. **LLM ETL** — transform the vault into normalized site data (SiteData).
3. Commit and push that SiteData back into the vault submodule.
4. Generate a build-time fallback snapshot.
5. Validate against a **zod schema**.
6. Run lint.
7. Build and deploy to the hosting platform.

Step 2 is the interesting one. The LLM reads the human-written markdown (the object instances) and aligns it into a single structured view. It covers the fields below, condensed into **one `ObjectView` instance**.

```text
identity · pillars · personas · viewHeaders
portfolioCopy (home / hire / collab / builder / curious / ask)
career · education · certifications · languages · publications · faq
```

## 4. Everything Derives From One Instance

That single `ObjectView` instance is the **single SSOT for the entire site homepage**. The outputs below are all just different visualizations of the same instance.

- **Four persona views** — `hire` / `collab` / `builder` / `curious`
- Career, credentials, languages, and publications bundles
- **FAQ**
- **AI chatbot** — reads the same instance as its context

> 🤖 There is no separate step to "train" the chatbot. The operator doesn't teach the bot; the **bot reads the operator's writing alongside them**. The moment a new company is added, the chatbot starts answering about it on a factual basis.

Structured questions get instant answers via a **FAQ fast-path**; only free-form questions flow into the **RAG pipeline**. This one pattern is what drives update cost toward zero: **the human writes markdown, and the site and chatbot read that markdown.** Causality flows in exactly one direction.

## 5. Reliability — A 3-Tier Fallback So the Service Never Dies

"If the pipeline breaks somewhere, won't the portfolio break too?" The answer is the 3-tier fallback. The data loader tries the tiers **in order** and **caches the first success for 5 minutes.**

| Tier | Source | Nature |
|---|---|---|
| 1 | Latest SiteData in remote **Blob** | Always freshest |
| 2 | SiteData in the local **vault submodule** | Copy bundled into the build |
| 3 | **Fallback snapshot baked into the code** at build time | Last resort |

The remote Blob access token also falls back across **three environment variables in order** — if one token expires, another picks it up.

> 🛡️ The effect is clear: even if the vault repo's CI dies, the main repo's CI dies, or the Blob is briefly unreachable, the site stays up. More precisely, it keeps answering with **"the data as of the last time it was alive."** Whichever tier wobbles, the user five minutes later never notices.

## 6. Stability — A 4-Way Permission Split (Human · AI Session · CI)

The vault is not written by a single actor. Three actors converge on the same vault submodule via commit and push.

- Manual human edits (directly in Obsidian)
- Edits via a **Claude / Cowork session**
- The main repo's build workflow (LLM ETL auto-updating only the one SiteData file)

Crucially, none of these three uploads to the Blob directly. Blob sync is handled by the vault repo's (`hsol-info-blob`) own GitHub Actions, triggered on push. The permissions split four ways.

| Permission | Actor |
|---|---|
| (a) Write to the vault | **Human + Claude session** |
| (b) Upload to Blob | Vault repo's own CI |
| (c) Normalize SiteData · update submodule | Main repo CI |
| (d) Build · deploy | Main repo CI + hosting platform |

> 🔐 The very fact that permissions are scattered creates stability — if one wobbles, another keeps the site alive. The only place the user touches is (a): **one markdown file + a git push.** "The ops team of a one-person SaaS is one human and one AI session" is not a metaphor here; it is wired into the system.

## 7. ASIS → TOBE Comparison

| Event | ASIS (edit = update several places) | TOBE (edit = one markdown file) |
|---|---|---|
| New job start/end | Resume, LinkedIn, portfolio view, chatbot context — 4 places | 1 md in `organizations` → push |
| New project done | Resume, site copy, interview script — 3 places | 1 md in `projects` → push |
| New post/talk/output | Site publications, LinkedIn, cover-letter template — 3 places | 1 md in `artifacts` → push |
| FAQ answer change | Self-intro script, interview answers, site FAQ, chatbot — 4 places | Edit one ObjectView `faq` item → push |
| Tone adjustment | All site copy, self-intro, interview script | Edit one persona-manual ObjectView → push |
| Pre-interview check | Hunt for mismatches across resume, site, LinkedIn | Just sleep (the site is already current) |

The biggest difference isn't in the table: cognitive load. In ASIS, "where do I fix this?" came first every time; in TOBE, that question disappeared entirely.

## 8. The Minimum Reproducible Unit

It looks grand, but it compresses into a **minimum unit one person can run**: 1 vault · 6 meta-ontology types · 1 LLM ETL step · 3-tier fallback · 4-way permission split.

<details>
<summary>Expand the 5 components</summary>

1. **Vault** — one markdown knowledge base. Obsidian or a plain git repo, either works. Split folders by object type (companies, projects, outputs, concepts) and you have a starting line.
2. **Meta-ontology declaration** — write down object types, link types, and action types explicitly. A schema that lives only in your head collapses in six months. Keep the data model as its own folder inside the vault so future-you and future-AI-sessions write by the same rules.
3. **LLM ETL** — one step that turns the vault into normalized SiteData. Claude or GPT both work. But if a response is truncated by the token budget, **don't force-parse it — preserve it as a failure dump**. Parsing a truncated output ships bad data to the site.
4. **3-tier fallback** — try remote cache, local vault, and in-code fallback in series, with a ~5-minute cache TTL. Fall back across three tokens too, to absorb environment differences.
5. **Permission separation** — split write, deploy, and external-sync permissions across different actors. If one worker holds every permission, a single mistake wipes the site.

</details>

## 9. What Disappeared

- Last-minute resume polishing → the site is always current; the resume is just a point-in-time snapshot of it.
- Writing a separate "interview self-intro" page → the `hire` persona view does that job.
- Introducing yourself before a meeting → recruiters ask first in the ChatDock, and the bot answers from the vault's ObjectView.
- Missed-update incidents → never happened again.

The biggest change wasn't saved time — it was that **"where do I have to fix this?" stopped appearing in my head every day.** For a job seeker, the best self-expression isn't a resume but **accumulated writing**; the vault is the vessel that holds it, and the site is merely one cross-section. A portfolio only survives if its update cost converges to zero.

## 10. Source

- Original: [Building an AI Portfolio (1) — A Self-Operating Portfolio With Zero Update Cost (Hansol Lim, in Korean)](https://medium.com/@hsol/ai-%ED%8F%AC%ED%8A%B8%ED%8F%B4%EB%A6%AC%EC%98%A4-%EB%A7%8C%EB%93%A4%EA%B8%B0-1-%EA%B0%B1%EC%8B%A0-%EB%B9%84%EC%9A%A9-0%EC%9D%98-%EC%9E%90%EA%B0%80-%EC%9A%B4%EC%98%81-%ED%8F%AC%ED%8A%B8%ED%8F%B4%EB%A6%AC%EC%98%A4-13bbebce1e01)
- Author's site: [hsol.info](https://hsol.info)

> 🗓️ Compiled: 2026-07-03 · A note reconstructing part 1 (job-seeker lens) of the "Building an AI Portfolio" series from an architecture angle. Counts, folder structure, and pipeline steps follow the original; details may be updated in later parts (e.g., the recruiter lens).
