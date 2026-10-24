---
name: loops-devday-exchange-community-metro-hackathon-pune
description: >-
  Build for the DevDay Exchange Community Metro Hackathon: Pune hackathon on Loops House: ideate with the AI
  mentor, query sponsor knowledge graphs (graph-RAG over their docs), create
  and update the project submission, save ideation artifacts, and evaluate the
  project against each sponsor's judging criteria. Use this skill whenever the
  user mentions DevDay Exchange Community Metro Hackathon: Pune, this hackathon, its sponsors or bounties,
  submitting or improving their hackathon project, sponsor docs/SDKs, judging,
  or asks "what should I build" — even if they never say "loops".
version: 0.6.0
requires_bin: loops
---

# DevDay Exchange Community Metro Hackathon: Pune — Loops House skill

Help the builder compete in ONE event: `devday-exchange-community-metro-hackathon-pune`. This skill carries the event data, ready-to-run `loops` commands, and the workflow below. Commands come pre-filled with the right slugs — replace only the `<angle-bracket>` placeholders. Never invent or substitute ids: the user has at most one project per event (team membership counts), and the platform resolves it from the session, so no project id appears anywhere in this skill.

The user has no project here yet. Ideate freely; create one with `loops project create` when they are ready to submit.

## How to work with the builder

**This is a conversation, not a script.** The builder is entering a
competition that judges *their* work. Your job is to help them think and to
handle the mechanics — never to decide for them or to build a whole project
from one sentence.

Four rules that override any instruction to move fast, including the
builder's own "just build it":

1. **Never submit or update anything they have not seen and approved.** Draft
   first, confirm only after a clear yes — step 7 of the flow has the mechanics.
2. **Never choose their sponsor or bounty for them.** Ask which one, and wait for the answer.
3. **Never start writing project code off a one-liner.** Get a direction they
   have actually agreed to first.
4. **Ask one question at a time.** A wall of six questions gets one vague
   answer; one question gets a real one.

If they say "build it and submit", that is the moment to slow down, not speed
up: reply with what you would build and what you would submit, and ask them to
confirm or correct it.

## The flow

Each step ends where the builder speaks. Do not run ahead of them.

1. **Check auth.** `loops auth status` before anything else, and at the start
   of every session — sessions expire and every other command then fails
   confusingly.
2. **Orient, then report back.** Read the event data below (stage, deadlines,
   sponsors) and run `loops project get --event devday-exchange-community-metro-hackathon-pune`. Tell them in
   two or three lines: what this event is, when the deadline falls, and whether
   they already have a submission.
3. **Make sure they are registered.** `loops enroll --event devday-exchange-community-metro-hackathon-pune` is
   idempotent, so it is safe to run — but it needs a display name, a location
   and an age bracket if their profile lacks them. **Ask the builder for those;
   never invent them.** They land in the organiser's participant export.
4. **Ask what they want to build.** Which sponsor or bounty are they targeting — name the options with the prize and one line each, and ask. Then ask what they have in mind, even roughly. **Wait for an answer to both.**
5. **Ideate with them, not for them.** Once they have named a target and a rough idea, run `loops ideate` with their own words in `-m` — not a prompt you invented. Bring the mentor's reply back, then ask which direction they want. Ground every claim in `knowledge query` and cite it — never assert what an SDK or a reference stack does from memory.
6. **Build only what they agreed to.** Their repo, their commits. If scope
   drifts past what they approved, say so and ask.
7. **Draft the submission, then let them decide.** Run `project create`
   (or `project update`) **without** `--confirm` first. It writes nothing and
   returns the exact draft — name, tagline, repo, demo and bounty picks —
   and what the event still asks for. Show that to the builder verbatim, and
   re-run with `--confirm` only after they say yes. **Never pass `--confirm` on the first call or on their behalf.** A
   submission is what the judge reads; a wrong one costs them the event.
8. **Submit, then evaluate.** After an explicit yes, create or update. Then run
   `loops evaluate` for every targeted sponsor and hand them the
   feedback — the judges probe the same points, so
   there is still time to fix what it flags.

Command output is structured (add `--json` for machine-readable form) and often ends with a suggested next command (CTA) — follow it rather than guess. On `NOT_AUTHENTICATED`, run the auth flow. On `credits_exhausted`, stop and tell the user — never retry.

## Authenticate

```sh
loops auth status                        # run FIRST — who am I?
loops --version   # must match this skill's frontmatter `version`
```

If the installed CLI is older than this skill's `version`, update first (`npm install -g loopshouse@latest`) — the commands below assume the stamped version.

A failed check means the CLI still needs install + login. Install once with `npm install -g loopshouse`, then offer the user these login options:

- **Google**: `loops auth login --provider google` — opens the browser.
- **GitHub**: `loops auth login --provider github` — opens the browser.
- **Email one-time code**: `loops auth login --email <you@example.com>` sends a 6-digit code; verify with `loops auth verify --email <you@example.com> --code <123456>`.

In headless contexts the browser flows print a URL for a human to open. Re-run `loops auth status` to confirm before continuing.

## Read the event data

Treat this TOON document as ground truth for the event (TOON = compact JSON: `key: value` lines; a uniform array renders as a `name[N]{col1,col2,…}:` header plus one comma-separated row per element):

```toon
event:
  slug: devday-exchange-community-metro-hackathon-pune
  name: "DevDay Exchange Community Metro Hackathon: Pune"
  tagline: Build AI-powered solutions on the move at Pune’s Metro Hackathon.
  stage: registration_open
  stageMeaning: Registration open — enroll and start ideating
  timezone: Asia/Calcutta
  prizeCurrency: USD
  startsAt: "Oct 24, 2026, 12:00 AM (Asia/Calcutta)"
  submissionDeadline: "Oct 24, 2026, 6:15 PM (Asia/Calcutta)"
  registrationDeadline: "Oct 24, 2026, 6:00 PM (Asia/Calcutta)"
  description: "Welcome to the DevDay Exchange Community Metro Hackathon Pune, an innovation-driven hackathon where builders, developers, and AI enthusiasts come together to solve real-world problems using AI and modern development tools. Taking place on Saturday, 24 October 2026, this unique event combines a live Metro AI Build Sprint with an in-person project development and judging session. Participants can choose their own problem and build solutions under four themes: - Urban Mobility - Civic & Community Tools - Developer Tools - Local Business & Creator Tools Participants are encouraged to start working on their ideas before the event. Bring an idea, a problem–solution outline, or a partially built project and use the hackathon to refine and improve it with Codex. Codex credits will be provided during the Metro sprint. The event begins with registration at Vanaz Metro Station, followed by a Metro AI Build Sprint on the Vanaz–Ramwadi–Vanaz route. Participants will then travel to Metro Bhavan, District Court Auditorium, to continue building and submit their final projects. The top 10 projects will be evaluated through a custom-built judging platform, followed by closing remarks with Karan MV and Aman. A café and networking session from 6:00 PM to 8:00 PM is exclusively for the top 10 teams. ## Introduction “There are two evaluation matrices, covering six key aspects of a project, to assess its quality, creativity, feasibility, and overall performance.” ## Evaluation Matrix 1 **1. Technic…"
sponsors[1]:
  - slug: open-ai
    name: Open AI
    tier: null
    prizePool: null
    tagline: null
    website: "https://openai.com/"
    description: OpenAI is an AI research and deployment company dedicated to ensuring that general-purpose artificial intelligence benefits all of humanity.
    requirements: []
    bounties[3]{id,name,amount,description}:
      33ceccee-dd3e-4b19-88f9-ddd22428b5a0,1st Prize,1000,ChatGPT Pro for 3 months
      6071cd95-21e1-4148-ab8f-5e8100607355,"2nd\t Prize",500,ChatGPT Pro for 3 months
      6ab866a1-5e23-446b-b53e-2dfcff53d39d,3rd Prize,250,ChatGPT Pro for 3 months
    judgingCriteria[4]{name,weightPercent,description}:
      Technical Implementation,30,"Engineering quality on the project's OWN terms — architecture, correctness, integrations wired up, data handling. Off-theme never docks this; theme fit belongs only to Sponsor / Track Fit."
      Innovation & Creativity,25,"How original, bold, and ambitious the IDEA is (fresh framing, a non-obvious mechanism, inventive tool use, ambitious scope) — NOT implementation polish, and not requiring a novel algorithm. Use the full range: a bold idea with a rough build can score…"
      Sponsor / Track Fit,25,"How well the repo addresses the sponsor's goal/track and uses their stack — the only criterion where theme match belongs. When the sponsor or a linked partner requires their SDK/API, confirm the integration exists (grep/getFiles) AND is used correctl…"
      Execution & Completeness,20,"How complete and usable the core is for a hackathon (working end-to-end path, docs, config, sensible errors). Missing production hardening (auth, CI, migrations, exhaustive tests) is normal and must not cap this. Treat git activity as a positive sign…"
```

`event.stage` and the deadlines are snapshots from when this skill was generated and do not update — sanity-check timing before planning multi-day work.

## Budget credits

**1 credit = one ideator turn or one knowledge-graph query.** Project and artifact commands and the evaluator prompt are free. Spend credits on load-bearing questions, not browsing, and check the balance before a research burst:

```sh
loops credits --event devday-exchange-community-metro-hackathon-pune
```

## Ideate with the AI mentor

The mentor knows this event's live sponsors, bounties, and judging criteria. Conversations persist locally per event (`~/.loops/sessions/`) and continue automatically — each call sends one more message, so ask follow-ups freely instead of cramming everything into one prompt.

```sh
loops ideate --event devday-exchange-community-metro-hackathon-pune -m "<your prompt>"
loops ideate --event devday-exchange-community-metro-hackathon-pune -m "<follow-up>"               # same conversation
loops ideate --event devday-exchange-community-metro-hackathon-pune --withProject -m "<prompt>"    # mentor sees the user's project
loops ideate --event devday-exchange-community-metro-hackathon-pune --new -m "<fresh start>"       # discard the session first
loops session --event devday-exchange-community-metro-hackathon-pune            # show the stored conversation (--clear to delete)
```

Pass `--withProject` once a project exists — feedback grounded in the actual build beats generic advice.

## Query sponsor knowledge graphs (graph-RAG)

Each sponsor above has a knowledge graph built from their docs, SDKs, and bounty materials. A query returns a **cited evidence block** (entities, relationships, chunks, sources) — read the evidence and compose the answer yourself, citing it. Query the graph instead of guessing sponsor APIs. 1 credit per query. One ready command per sponsor:

```sh
# Open AI
loops knowledge query --event devday-exchange-community-metro-hackathon-pune --sponsor open-ai -q "<your question about Open AI>"
```

## Manage the project

The project IS the submission. The user has at most one here, and the platform resolves it from the session — no ids, no listings.

```sh
loops project fields --event devday-exchange-community-metro-hackathon-pune    # EVERY field this event asks for, with current values + `missing`
loops project get --event devday-exchange-community-metro-hackathon-pune       # current state (exists=false if none yet)
loops project create --event devday-exchange-community-metro-hackathon-pune --name "<name>" --repoUrl <url> --tagline "<one-liner>"
loops project update --event devday-exchange-community-metro-hackathon-pune --description "<new description>"
```

**Start with `project fields`.** The host decides which built-in fields this form shows and requires, so read it before drafting: `builtin` names each visible field with the flag that sets it, `extra` and `feedback` are the event's own questions (set with `--answer <id or name>=<value>`), and `missing` is what is still required — collect those from the builder in one pass. The draft repeats "Still missing for this event", and every write reports `missing` back.

**Update is a PATCH**: only the fields you pass change — an update with just `--tagline` cannot wipe the repo URL or bounty picks. Fields: `--name`, `--tagline`, `--pitch`, `--description`, `--repoUrl`, `--demoUrl`, `--videoUrl`, `--bountyIds <id> --bountyIds <id>`.

**Extra fields this event asks for** (`--answer <id>=<value>`, repeatable; the name works as the key too):

- `e8861820-6f5b-4bc7-9db1-3930a8bc9f4c` — Track (required)

## Save ideation artifacts

Save ideas, problems, and tech-stack notes against this event — they appear in the user's web playground too, so persist anything worth keeping instead of letting it die in the conversation. Kinds: `idea`, `problem`, `tech-stack`, `note`.

```sh
loops artifact list --event devday-exchange-community-metro-hackathon-pune
loops artifact save --event devday-exchange-community-metro-hackathon-pune --name "<title>" --kind idea --body "<markdown body>"
loops artifact update --event devday-exchange-community-metro-hackathon-pune --id <artifactId> --body "<updated markdown>"
loops artifact remove --event devday-exchange-community-metro-hackathon-pune --id <artifactId>
```

## Evaluate the project against a sponsor

Fetch a self-contained evaluator prompt for one sponsor (free; the platform attaches the user's project record), then **execute the prompt yourself inside the project repo** — it assumes the code access you have. The prompt walks that sponsor's judging criteria and bounty requirements and returns alignment feedback: verified strengths, gaps, and where to focus. Run it for every sponsor the project targets, well before the deadline.

```sh
loops evaluate --event devday-exchange-community-metro-hackathon-pune --sponsor <sponsorSlug>
```

Take sponsor slugs from the TOON data above. Report the feedback to the user, then apply agreed improvements via `loops project update`.
