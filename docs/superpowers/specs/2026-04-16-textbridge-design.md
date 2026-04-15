# TextBridge — Design Specification
**Date:** 2026-04-16  
**Status:** Approved  
**Author:** Eldad Gonsherovich

---

## 1. Executive Summary

TextBridge is a personal bilingual translation web app (English ↔ Hebrew) with a Markdown mode that transforms translated output into structured, paste-ready Markdown for use in LLMs, prompts, PRDs, and docs. The core differentiator is intelligent contextual translation — not word-by-word — paired with a smart Markdown structuring layer that makes output immediately useful in AI workflows.

---

## 2. Product Overview

| Attribute | Value |
|---|---|
| Name | TextBridge |
| Type | Personal productivity web app |
| Primary user | Eldad — translating prompts and AI content between Hebrew and English |
| Core use case | Translate Hebrew prompts → English for LLMs; translate LLM output → Hebrew Markdown for docs/notes |
| AI model | OpenAI GPT-4o (Markdown mode) / GPT-4o-mini (plain mode) |
| Architecture | Next.js fullstack (frontend + API routes) |
| Deployment | Vercel |
| History | localStorage (local, no backend) |
| Auth | None — personal tool |
| n8n | Not in MVP — optional later for batch/export flows |

---

## 3. Problem Statement

Existing translators (Google Translate, DeepL) are:
- **Robotic** — literal word-by-word output that loses tone, context, and intent
- **Unstructured** — plain text output with no formatting, useless for pasting into LLMs or docs
- **Typo-intolerant** — fail or produce wrong output on messy real-world input
- **Unaware of AI/technical context** — don't preserve prompt language, technical terms, or product vocabulary

TextBridge solves this by combining strong contextual translation with an intelligent Markdown structuring layer — making translated output immediately paste-ready for AI workflows.

---

## 4. Goals

### MVP Goals
- Translate between English and Hebrew with high contextual accuracy
- Detect and handle typos, mixed-language input, and imperfect grammar gracefully
- Markdown mode: transform translated output into well-structured Markdown (headings, bullets, code blocks, tables)
- Raw/Preview toggle in output panel
- One-click copy of output
- localStorage history (recent translations)
- Language swap (EN ↔ HE)
- Deploy to Vercel, accessible from browser

### Non-Goals (MVP)
- User authentication or accounts
- Server-side history or database
- Mobile app or browser extension (possible later)
- Multi-language support beyond EN/HE
- File upload or batch translation
- n8n integration (possible later)
- Sharing or collaboration features

---

## 5. User Personas

### Primary: Eldad (Personal Tool)
- Switches daily between Hebrew and English for AI work
- Writes prompts in Hebrew, needs clean English for LLMs
- Gets LLM output in English, needs structured Hebrew Markdown for notes/docs
- Pastes content into Claude, ChatGPT, Notion, PRDs
- Needs typo tolerance — writes fast, doesn't always proofread input
- Values quality over speed — prefers accurate contextual translation over instant robotic output

---

## 6. User Stories

| # | Story |
|---|---|
| 1 | As a user, I can type Hebrew text and get a natural English translation |
| 2 | As a user, I can type English text and get natural Hebrew output |
| 3 | As a user, I can toggle Markdown mode to get structured Markdown output |
| 4 | As a user, I can toggle between Raw Markdown and rendered Preview in the output panel |
| 5 | As a user, I can copy the output with one click |
| 6 | As a user, I can swap the translation direction with one click |
| 7 | As a user, I can clear the input with one click |
| 8 | As a user, I can see my recent translations in a history strip |
| 9 | As a user, I can click a history item to reload a past translation |
| 10 | As a user, typos in my input are understood and corrected intelligently |

---

## 7. Primary Flows

### Flow 1 — Plain Translation
1. User types or pastes text in the input panel
2. User clicks "Translate →"
3. App calls `/api/translate` (POST) with `{text, from, to, mode: "plain"}`
4. API calls GPT-4o-mini with the plain translation prompt
5. Output appears in the output panel (plain text, LTR or RTL based on target language)
6. User copies or reads output
7. Translation saved to localStorage history

### Flow 2 — Markdown Translation
1. User enables Markdown toggle (ON)
2. User types or pastes text in the input panel
3. User clicks "Translate →"
4. App calls `/api/translate` with `{text, from, to, mode: "markdown"}`
5. API calls GPT-4o with the Markdown structuring prompt
6. Output appears in Preview mode (rendered Markdown) by default
7. User can switch to Raw mode to see raw Markdown text
8. User copies raw or rendered output
9. Translation saved to localStorage history

### Flow 3 — Language Swap
1. User clicks the ⇄ swap button
2. Source and target language labels swap
3. If output exists, it moves to the input panel (ready to re-translate)
4. Input clears

### Flow 4 — History
1. User sees recent translations in the history strip at the bottom
2. Clicking a chip reloads that translation (input + output + mode)
3. Up to 10 recent entries stored in localStorage

---

## 8. Core Features

### Translation Engine
- Powered by OpenAI API via Next.js API route (`/api/translate`)
- GPT-4o-mini for plain mode (fast, cheap)
- GPT-4o for Markdown mode (higher quality structuring)
- System prompt enforces: contextual translation, tone preservation, typo correction, technical term preservation

### Markdown Mode
- Analyzes the content type and applies appropriate structure:
  - Short statements → minimal formatting
  - Lists of items → bullet points
  - Step-by-step content → numbered lists
  - Documents/specs → headings + sections
  - Code or commands → code blocks
  - Tabular data → tables
- Output panel shows rendered Markdown by default
- Raw toggle shows the raw Markdown text for copying

### Typo Correction Layer
- Built into the system prompt — the model infers intent from misspelled words
- Does not alter proper nouns, brand names, technical terms, or commands
- Corrects obvious spelling errors silently (no annotation)

### History (localStorage)
- Stores last 10 translations: `{input, output, from, to, mode, timestamp}`
- Shown as chips in the history strip
- Clicking a chip restores the full translation state
- Cleared on explicit user action only

### Copy
- One button in the output panel header
- In Preview mode: copies the raw Markdown text (not rendered HTML)
- In Raw mode: copies the visible raw text
- Brief "Copied!" feedback on click

---

## 9. UI & UX Definition

### Layout
- Side-by-side panels: input left, output right
- Full-width on desktop, stacked on mobile (input top, output bottom)
- No sidebar, no modal-heavy flows — everything on one screen

### Top Navigation
- Left: "TextBridge" logo (Lora serif, ink dark)
- Right: Markdown toggle (label + switch + ON/OFF state) + History button

### Language Bar
- Centered between panels: `[English]  ⇄  [עברית]`
- Clicking ⇄ swaps direction and moves output to input
- Language labels are display-only in MVP (not dropdowns — only EN/HE supported)

### Input Panel
- White background, warm border
- Placeholder: *"Type or paste your text here… Typos are fine — TextBridge understands intent."*
- Clear button top-right of panel
- Translate button at the bottom, full-width, ink-dark

### Output Panel
- Warm cream background (distinguished from input)
- Header: Raw | Preview toggle (left) + Copy button (right)
- Raw/Preview toggle only visible when Markdown mode is ON
- Output text is RTL when target is Hebrew, LTR when target is English
- Loading state: subtle animated dots or skeleton lines

### History Strip
- Bottom of app, single horizontal scroll row
- Label "Recent" + up to 5 visible chips
- Chips show truncated input text (max 30 chars)

### Markdown Toggle
- Located in the top nav, right side
- Visual: label "Markdown" + toggle switch + "ON"/"OFF" text
- OFF state: muted tan/grey toggle
- ON state: ink-dark toggle (same ink as primary CTA — no green/neon)

---

## 10. Visual Design System — Warm Editorial

### Design Principles
- Calm, focused, editorial — like a quality notebook or publishing tool
- No neon, no glow, no dark blue cyber aesthetic
- Light mode only (MVP)
- Serif (Lora) for the logo and headings; Sans (Inter) for UI controls and body
- Ink-dark primary actions; warm tan/cream surfaces; muted borders

### Color Tokens

| Token | Value | Usage |
|---|---|---|
| `--background` | `#f0ece4` | Page background |
| `--surface` | `#faf7f2` | App shell, input panel |
| `--surface-alt` | `#f5f0e8` | Lang bar, output panel, history |
| `--border` | `#e2d9cc` | Default borders |
| `--border-strong` | `#d4c9b8` | Lang pills, textarea |
| `--muted` | `#9a8870` | Placeholder, secondary labels |
| `--accent` | `#7a6a56` | Toggle ON, secondary text |
| `--ink` | `#2c2416` | Logo, primary text, CTA button |
| `--white` | `#ffffff` | Textarea, output area backgrounds |

### Typography
- Logo: Lora serif, 18px, 700
- Panel labels: Inter, 10px, 600, uppercase, letter-spacing 1.5px
- Body / textarea: Inter, 14px, 400
- Buttons: Inter, 14px, 600
- History chips / small labels: Inter, 11px, 400–500
- Markdown H1 in output: Lora serif, 17px, 700
- Markdown H2 in output: Lora serif, 14px, 600

### Spacing & Shape
- Border radius: 10px panels, 8px buttons/pills, 6px chips, 50% swap button
- Panel padding: 20px
- Nav padding: 14px 24px
- Box shadow: `0 4px 24px rgba(60,40,10,0.08), 0 1px 4px rgba(60,40,10,0.05)`
- Inset shadow on inputs: `inset 0 1px 3px rgba(60,40,10,0.04)`

---

## 11. AI Behavior Requirements

### System Prompt — Plain Mode
```
You are an expert Hebrew-English translator. Your job is to produce natural, contextually accurate translations — not word-by-word literal output.

Rules:
- Understand the meaning, tone, and intent of the input
- Correct obvious spelling mistakes and infer the intended word
- Preserve proper nouns, brand names, technical terms, commands, and product vocabulary exactly
- Do not translate code, URLs, or technical identifiers
- Produce natural output in the target language as a native speaker would write it
- Do not add explanations, notes, or alternatives — return only the translation
```

### System Prompt — Markdown Mode
```
You are an expert Hebrew-English translator and content structurer. Your job is to translate the input and return the result as well-structured Markdown.

Rules:
- Translate with full contextual accuracy — preserve tone, intent, and meaning
- Correct obvious spelling mistakes; preserve proper nouns and technical terms
- Analyze the content type and apply appropriate Markdown structure:
  - Short statements or single ideas → minimal formatting, one or two lines
  - Lists of items or features → bullet points (-)
  - Sequential steps → numbered list (1. 2. 3.)
  - Documents, specs, or long content → headings (##) and sections
  - Code, commands, or technical strings → fenced code blocks (```)
  - Tabular or comparative data → Markdown tables
- Do not over-format — if the content is a single sentence, don't wrap it in bullets
- Return only the translated Markdown — no preamble, no explanations
```

### Model Selection
| Mode | Model | Reason |
|---|---|---|
| Plain | `gpt-4o-mini` | Fast, cheap, sufficient for direct translation |
| Markdown | `gpt-4o` | Better instruction-following for structured output |

### Error Handling
- If the API call fails: show a non-destructive inline error below the output panel — "Translation failed. Please try again." with a Retry button
- If input is empty: disable the Translate button (no error shown)
- If input is too long (>4000 chars): show character count warning, allow translation anyway

---

## 12. Translation Quality Rules

### Hebrew Quality
- Produce natural modern Hebrew — not biblical or overly formal
- Use common Israeli spoken/written register unless the input is clearly formal
- Preserve Hebrew punctuation conventions (geresh for abbreviations, etc.)
- RTL text direction applied automatically in output panel

### English Quality
- Produce clear, natural English — not ESL-sounding
- Match formality of input (casual input → casual output, formal input → formal output)
- Avoid passive voice where active reads more naturally

### Tone Preservation
- Casual/friendly tone → preserve informality
- Technical/professional tone → preserve precision
- Imperative commands → preserve imperative form
- Questions → translate as questions

### Typo Handling
- Infer the intended word from context
- Do not annotate corrections in the output
- Do not correct intentional informal spelling (slang, deliberate abbreviations)
- Preserve intentional capitalization (ALL CAPS for emphasis, camelCase for code)

### Technical Content
- Preserve: code, URLs, file paths, CLI commands, product names, API names, variable names
- Translate: surrounding prose, comments, documentation text
- In Markdown mode: wrap code/commands in fenced code blocks automatically

---

## 13. Markdown Formatting Rules

| Content Type | Markdown Structure |
|---|---|
| Single short statement | Plain text, no formatting |
| 2–5 items or features | Bullet list (`-`) |
| Sequential steps | Numbered list (`1.`) |
| Document with sections | `##` headings + paragraphs |
| Mixed document | `##` headings + bullets + paragraphs |
| Code/commands | ` ``` ` fenced code blocks |
| Tabular/comparative data | Markdown tables |
| Quote or blockquote | `>` blockquote |

**Anti-patterns (avoid):**
- Wrapping a single sentence in a bullet
- Adding a heading to a 2-line translation
- Using `###` or deeper headings for short content
- Adding horizontal rules unnecessarily

---

## 14. Edge Cases

| Case | Behavior |
|---|---|
| Mixed Hebrew/English input | Detect dominant language; translate non-dominant portions; preserve technical English terms |
| Input with code blocks | Preserve code exactly; translate surrounding prose |
| Input is already in target language | Translate anyway (user may want reformatting) |
| Very short input (1–3 words) | Plain translation, no Markdown structure |
| Very long input (>2000 chars) | Translate in full; show character count in input panel |
| Ambiguous direction (auto-detect) | Default to current language selection; user can swap if wrong |
| API timeout | Show retry error after 15 seconds |
| Output panel is empty | Copy button is disabled; no action on click |

---

## 15. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Translation latency (plain) | < 3 seconds for typical input |
| Translation latency (Markdown) | < 6 seconds for typical input |
| API key security | Server-side only (Next.js API route, never in browser) |
| localStorage usage | < 50KB (10 recent translations) |
| Mobile responsiveness | Stacked layout on screens < 768px |
| Accessibility | Readable contrast ratios, keyboard navigable |
| Browser support | Chrome, Firefox, Safari (last 2 versions) |

---

## 16. Security & Privacy

- OpenAI API key stored in `.env.local`, used only in server-side API route
- No user data sent to any third party beyond OpenAI for translation
- No analytics or tracking in MVP
- localStorage data never leaves the device
- No auth, no accounts, no PII collected

---

## 17. n8n Integration

**Not in MVP.**

Possible future use cases:
- Batch translation: send a list of texts, get back translated results
- Export to Notion/Google Docs: send translated Markdown to a destination
- Webhook endpoint: POST text → receive translated Markdown (for automation)
- Translation history backup: sync localStorage to a sheet or database

**Decision:** Keep in-app for now. Revisit if batch or export needs arise.

---

## 18. Future Roadmap

| Phase | Features |
|---|---|
| Post-MVP | Auto language detection (remove manual direction selector) |
| Post-MVP | Dark mode (Warm Dark variant of the design system) |
| Post-MVP | Keyboard shortcuts (Cmd+Enter to translate, Cmd+Shift+C to copy) |
| Later | Browser extension for in-page translation |
| Later | n8n webhook endpoint for batch/export |
| Later | Export to Notion / Google Docs |
| Later | Custom glossary (preserve specific terms your way) |

---

## 19. File Structure

```
TextBridge/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main translation UI
│   │   ├── layout.tsx            # Root layout, fonts, metadata
│   │   └── api/
│   │       └── translate/
│   │           └── route.ts      # POST /api/translate → OpenAI
│   ├── components/
│   │   ├── TranslatePanel.tsx    # Main side-by-side layout
│   │   ├── InputPanel.tsx        # Left input area
│   │   ├── OutputPanel.tsx       # Right output + raw/preview toggle
│   │   ├── LangBar.tsx           # Language selector + swap button
│   │   ├── MarkdownToggle.tsx    # Markdown ON/OFF toggle in nav
│   │   ├── HistoryStrip.tsx      # Recent translations strip
│   │   └── MarkdownRenderer.tsx  # Renders Markdown in output panel
│   ├── hooks/
│   │   └── useHistory.ts         # localStorage read/write for history
│   ├── lib/
│   │   └── prompts.ts            # System prompt templates (plain + markdown)
│   └── styles/
│       └── globals.css           # Design tokens as CSS variables + base styles
├── .env.local                    # OPENAI_API_KEY (not committed)
├── .env.example                  # Template for env vars
└── next.config.ts
```

---

## 20. Design Approved

- **Visual direction:** Warm Editorial
- **Palette:** Cream (#faf7f2), warm tan (#f5f0e8), ink dark (#2c2416), muted (#9a8870)
- **Typography:** Lora serif (logo + MD headings) + Inter sans (UI)
- **Layout:** Side-by-side panels, Markdown preview in output, history strip at bottom
- **Mockup:** Approved 2026-04-16
