# CLIx — The command atlas

## Utility interface

### Expansion packs and duplicate control

The **Recon → validation** section adds a scoped Juice Shop training workflow: setup, recon, a minimal local DOM XSS proof, evidence, reporting, remediation and retest. It includes six local-lab task references and two guides. Action labels identify service creation, traffic, file writes and cleanup. Commands are never executed by CLIx; exploit behaviour is documented from upstream guidance, not live-tested here. Use a deliberately vulnerable isolated lab, not a third-party target. The lab is loopback-bound and uses disposable container state.

It now also includes **Modern web penetration test — step by step**. This 10-phase guide uses OWASP WSTG for coverage planning, a ZAP baseline for passive review in the local lab, and explicit checkpoints for authority, non-destructive hypothesis testing, minimal proof, evidence, report writing and retesting. ZAP commands are intentionally labelled local-lab-only: they produce target traffic and reports. The guide does not provide unauthorised-target, credential, persistence, disruptive, or data-exfiltration workflows.

The cybersecurity expansion (`data/pack-cybersecurity.js`) adds 27 sourced task recipes and five guides within the existing Security topic. Coverage includes local code/dependency scanning, capture inspection, offline IDS analysis, YARA triage, forensic-image listings, Defender status and narrow AWS security checks. It does not install tools or run scans. Examples are documentation-checked, not tested against live targets. Tool-version, permission and data-handling caveats are included in the references and guides.

Development, Cloud & operations, and Data & files are separate, sourced content packs under `data/pack-*.js`. Existing commands are categorised alongside the new task references. Recipes are labelled TASK rather than presented as new executables. Packs survive upstream catalogue refreshes.

Before integrating a new pack, run:

```powershell
node scripts/audit-packs.cjs --report
node scripts/test-packs.cjs
```

The audit rejects duplicate IDs, repeated platform/name pairs, and example-code duplicates against the base catalogue, security pack and other expansion packs. Code comparison normalises whitespace and placeholder names, so changing `{{file}}` to `{{path}}` does not evade the check. It also checks required fields, HTTPS source links and guide references. It does not prove semantic uniqueness or that external documentation is correct for every installed tool version. `data/pack-audit.json` records the latest audit. Base upstream entries may still repeat examples between parent/subcommand pages; the existing example total includes those appearances.

The current interface opens directly to search. No hero, platform ticker or promotional footer. The visual direction uses charcoal, acid green, warm paper, lilac and coral accents; glass command cards, pixel markers, Swiss typography and subtly imperfect paper details. `identity.css` applies this visual layer over the compact utility layout.

Security, Research and OPSEC filters organise existing tools and 18 additional task references. The separate Guides view contains six practical workflows, each with prerequisites, steps, linked command references, limitations and primary-source documentation. Task references are labelled TASK: these are useful invocations, not claims of 18 new executables.

`data/security.js` contains the original task references, curated topic mappings and guide content. It is separate from the generated catalogue so updates do not overwrite it. Tools are not installed or executed by CLIx. Live scans require an authorised scope; guides default to local files and localhost where practical. Topic labels are for navigation, not endorsements or security guarantees.

UI overrides: `utility.css`. Additional QA: `node scripts/test-utility.cjs` (Playwright required). Tests cover topic filters, guide search, command links, mobile overflow, offline guides, and removal of the hero.

Open **index.html** in your browser. No install, account, API key, or build step is required. All command data is included locally. Google Fonts is optional; system fonts are used offline.

## Included

- Full-text search over names, descriptions and examples, with exact-name ranking.
- Platform and tool-family filters, alphabetical sorting and pagination.
- Command detail view with every example, copy buttons and documentation/source links.
- Browser-local saved commands, random discovery, `/` search shortcut and shareable command URL fragments.
- Responsive desktop/mobile layout, keyboard-accessible dialogs and reduced-motion support.
- No command execution, analytics, backend or credentials.

## Linux and APT expansion

Copy icons are available beside command names, card examples, and every detailed example. Names and examples are separate copy actions; neither executes anything.

The **Linux + shared tools** filter includes Linux pages and the common collection. Common entries are included for discovery, not certified for every Linux distribution. The strict Linux filter is still available. The APT & Debian filter now includes apt-get, apt-cache, apt-mark, apt-file, aptitude, repository tools and dpkg.

152 additional subcommand references are indexed. These are subcommands, not 152 new executables. Most are extracted from existing tldr examples; supplementary APT references use original concise descriptions and illustrative examples checked against Debian trixie APT 3.0.3 manuals. Source attribution is shown per entry. Older APT versions may differ. No claim of complete Linux coverage is made.

`scripts/expand.py` makes the expansion repeatable and is called by the regular catalogue updater. It can also run against the local catalogue without downloading. Shared source examples may appear on both parent and subcommand pages; the example count includes these appearances.

## Coverage and source

The catalogue is the English **tldr-pages** collection: commands, subcommands and platform variants. It is not every command in existence, nor every option in each command's manual. Tools must be installed separately. The `common` collection is not a promise of universal OS compatibility. Linux distribution-specific tools such as apt, dnf and pacman are indexed under their source platform; use tool filters or search to find them.

Content source: https://github.com/tldr-pages/tldr

Definitions and examples copyright tldr-pages contributors, **CC BY 4.0**: https://creativecommons.org/licenses/by/4.0/

Adaptations: Markdown stripped to structured descriptions/examples; source and documentation links retained. Interface and search added by CLIx. Each entry links to the upstream page. Download timestamp is shown in About. Upstream links track main and can change after this snapshot.

## Refresh the catalogue

With Python 3 and internet access, from this folder:

```powershell
python scripts/sync.py
```

This downloads the official English release and replaces `data/catalog.js`. It leaves browser bookmarks unchanged. The data bundle is generated; edit the parser, not individual generated records. New source adapters can produce the same entry fields: id, name, platform, description, examples [{description, code}], docs, source.

## Local server (optional)

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Visit http://127.0.0.1:4173. Direct file opening also works. Clipboard and saved-command support depend on browser settings; copy has a fallback. Bookmarks are per browser/origin, so file and HTTP modes have separate bookmarks.

## Safety

Examples are references, not safe-to-run guarantees. Replace placeholders, review destructive flags, and confirm tool versions, operating system and shell syntax. CLIx never runs commands. External links open third-party sites only when clicked.

## Structure

`index.html` / `style.css` / `app.js`: static application.

`data/catalog.js`: included offline data.

`scripts/sync.py`: repeatable source import.

`scripts/test.cjs`: catalogue and browser QA (Playwright required for browser checks).
