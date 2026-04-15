# TextBridge MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal English ↔ Hebrew translation web app with plain and Markdown modes, powered by OpenAI, deployed on Vercel.

**Architecture:** Next.js 14 App Router with server-side API route (`/api/translate`) that calls OpenAI and keeps the API key off the client. All state is client-side React; translation history persists in localStorage. No database, no auth.

**Tech Stack:** Next.js 14, React, TypeScript, Tailwind CSS, OpenAI SDK (`openai` npm package), `react-markdown` for rendering Markdown output, Google Fonts (Lora + Inter).

---

## File Map

| File | Responsibility |
|---|---|
| `src/app/layout.tsx` | Root layout — fonts, metadata, body background |
| `src/app/page.tsx` | Root page — renders `<TranslatePanel />` |
| `src/app/globals.css` | CSS design tokens + Tailwind base |
| `src/app/api/translate/route.ts` | POST handler — calls OpenAI, returns translation |
| `src/lib/prompts.ts` | System prompt strings for plain and markdown modes |
| `src/types/index.ts` | Shared TypeScript types |
| `src/hooks/useHistory.ts` | localStorage read/write for recent translations |
| `src/components/TranslatePanel.tsx` | Main layout — orchestrates all child components, holds state |
| `src/components/Nav.tsx` | Top nav — logo + Markdown toggle + History button |
| `src/components/LangBar.tsx` | Language selector row + swap button |
| `src/components/InputPanel.tsx` | Left panel — textarea + Clear + Translate button |
| `src/components/OutputPanel.tsx` | Right panel — output display + Raw/Preview toggle + Copy |
| `src/components/MarkdownRenderer.tsx` | Renders raw Markdown string as styled HTML |
| `src/components/HistoryStrip.tsx` | Bottom strip — recent translation chips |
| `.env.local` | `OPENAI_API_KEY` (not committed) |
| `.env.example` | Template showing required env vars |

---

## Task 1: Project Bootstrap

**Files:**
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/app/page.tsx`
- Create: `.env.example`
- Create: `.env.local`

- [ ] **Step 1: Initialise Next.js project**

Run from the TextBridge directory:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```
Accept all defaults. This installs Next.js 14, TypeScript, Tailwind, and ESLint.

- [ ] **Step 2: Install additional dependencies**

```bash
npm install openai react-markdown remark-gfm
```

- [ ] **Step 3: Add Google Fonts to layout**

Replace `src/app/layout.tsx` with:
```tsx
import type { Metadata } from 'next'
import { Inter, Lora } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
})

export const metadata: Metadata = {
  title: 'TextBridge',
  description: 'English ↔ Hebrew translator with Markdown mode',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${lora.variable}`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Set up design tokens in globals.css**

Replace `src/app/globals.css` with:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background:    #f0ece4;
  --surface:       #faf7f2;
  --surface-alt:   #f5f0e8;
  --border:        #e2d9cc;
  --border-strong: #d4c9b8;
  --muted:         #9a8870;
  --accent:        #7a6a56;
  --ink:           #2c2416;
  --white:         #ffffff;

  --font-inter: 'Inter', sans-serif;
  --font-lora:  'Lora', serif;
}

body {
  background-color: var(--background);
  color: var(--ink);
  font-family: var(--font-inter);
  min-height: 100vh;
}
```

- [ ] **Step 5: Create placeholder page**

Replace `src/app/page.tsx` with:
```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <p style={{ fontFamily: 'var(--font-lora)', color: 'var(--ink)' }}>
        TextBridge loading...
      </p>
    </main>
  )
}
```

- [ ] **Step 6: Set up env files**

Create `.env.example`:
```
OPENAI_API_KEY=sk-...
```

Create `.env.local`:
```
OPENAI_API_KEY=your-real-key-here
```

- [ ] **Step 7: Verify dev server starts**

```bash
npm run dev
```
Expected: server starts at `http://localhost:3000`, page shows "TextBridge loading..." with Lora font.

- [ ] **Step 8: Commit**

```bash
git init
git add -A
git commit -m "chore: bootstrap Next.js project with design tokens and fonts"
```

---

## Task 2: Types and Shared Interfaces

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Create types file**

Create `src/types/index.ts`:
```ts
export type Language = 'en' | 'he'
export type TranslationMode = 'plain' | 'markdown'

export interface TranslationRequest {
  text: string
  from: Language
  to: Language
  mode: TranslationMode
}

export interface TranslationResponse {
  output: string
  error?: string
}

export interface HistoryEntry {
  id: string
  input: string
  output: string
  from: Language
  to: Language
  mode: TranslationMode
  timestamp: number
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add shared TypeScript types"
```

---

## Task 3: System Prompts

**Files:**
- Create: `src/lib/prompts.ts`

- [ ] **Step 1: Create prompts file**

Create `src/lib/prompts.ts`:
```ts
import type { Language, TranslationMode } from '@/types'

const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  he: 'Hebrew',
}

export function buildSystemPrompt(mode: TranslationMode): string {
  if (mode === 'plain') {
    return `You are an expert Hebrew-English translator. Your job is to produce natural, contextually accurate translations — not word-by-word literal output.

Rules:
- Understand the meaning, tone, and intent of the input
- Correct obvious spelling mistakes and infer the intended word
- Preserve proper nouns, brand names, technical terms, commands, and product vocabulary exactly
- Do not translate code, URLs, or technical identifiers
- Produce natural output in the target language as a native speaker would write it
- Do not add explanations, notes, or alternatives — return only the translation`
  }

  return `You are an expert Hebrew-English translator and content structurer. Your job is to translate the input and return the result as well-structured Markdown.

Rules:
- Translate with full contextual accuracy — preserve tone, intent, and meaning
- Correct obvious spelling mistakes; preserve proper nouns and technical terms
- Analyze the content type and apply appropriate Markdown structure:
  - Short statements or single ideas → minimal formatting, one or two lines
  - Lists of items or features → bullet points (-)
  - Sequential steps → numbered list (1. 2. 3.)
  - Documents, specs, or long content → headings (##) and sections
  - Code, commands, or technical strings → fenced code blocks (\`\`\`)
  - Tabular or comparative data → Markdown tables
- Do not over-format — if the content is a single sentence, don't wrap it in bullets
- Return only the translated Markdown — no preamble, no explanations`
}

export function buildUserMessage(text: string, from: Language, to: Language): string {
  return `Translate the following from ${LANGUAGE_NAMES[from]} to ${LANGUAGE_NAMES[to]}:\n\n${text}`
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/prompts.ts
git commit -m "feat: add system prompt templates for plain and markdown modes"
```

---

## Task 4: Translation API Route

**Files:**
- Create: `src/app/api/translate/route.ts`

- [ ] **Step 1: Create the API route**

Create `src/app/api/translate/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { buildSystemPrompt, buildUserMessage } from '@/lib/prompts'
import type { TranslationRequest, TranslationResponse } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const MODEL: Record<string, string> = {
  plain: 'gpt-4o-mini',
  markdown: 'gpt-4o',
}

export async function POST(req: NextRequest): Promise<NextResponse<TranslationResponse>> {
  try {
    const body: TranslationRequest = await req.json()
    const { text, from, to, mode } = body

    if (!text || !text.trim()) {
      return NextResponse.json({ output: '', error: 'Empty input' }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: MODEL[mode] ?? 'gpt-4o-mini',
      messages: [
        { role: 'system', content: buildSystemPrompt(mode) },
        { role: 'user', content: buildUserMessage(text, from, to) },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    })

    const output = completion.choices[0]?.message?.content ?? ''
    return NextResponse.json({ output })
  } catch (err) {
    console.error('[translate]', err)
    return NextResponse.json(
      { output: '', error: 'Translation failed. Please try again.' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: Manually test the API route**

Start the dev server (`npm run dev`) then run:
```bash
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello, how are you?","from":"en","to":"he","mode":"plain"}'
```
Expected: `{"output":"שלום, מה שלומך?"}` (or similar natural Hebrew).

- [ ] **Step 3: Test Markdown mode**

```bash
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Features: fast translation, typo correction, markdown output","from":"en","to":"he","mode":"markdown"}'
```
Expected: response contains `{"output":"- תרגום מהיר\n- תיקון שגיאות כתיב\n- פלט Markdown"}` (or similar bullet structure).

- [ ] **Step 4: Commit**

```bash
git add src/app/api/translate/route.ts
git commit -m "feat: add /api/translate route with OpenAI integration"
```

---

## Task 5: useHistory Hook

**Files:**
- Create: `src/hooks/useHistory.ts`

- [ ] **Step 1: Create the hook**

Create `src/hooks/useHistory.ts`:
```ts
'use client'

import { useState, useCallback } from 'react'
import type { HistoryEntry, Language, TranslationMode } from '@/types'

const STORAGE_KEY = 'textbridge-history'
const MAX_ENTRIES = 10

function loadHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(loadHistory)

  const addEntry = useCallback(
    (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
      const newEntry: HistoryEntry = {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      }
      setEntries(prev => {
        const updated = [newEntry, ...prev].slice(0, MAX_ENTRIES)
        saveHistory(updated)
        return updated
      })
    },
    []
  )

  const clearHistory = useCallback(() => {
    setEntries([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { entries, addEntry, clearHistory }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useHistory.ts
git commit -m "feat: add useHistory hook with localStorage persistence"
```

---

## Task 6: Nav Component

**Files:**
- Create: `src/components/Nav.tsx`

- [ ] **Step 1: Create Nav**

Create `src/components/Nav.tsx`:
```tsx
'use client'

interface NavProps {
  markdownMode: boolean
  onMarkdownToggle: () => void
  onHistoryClick: () => void
}

export function Nav({ markdownMode, onMarkdownToggle, onHistoryClick }: NavProps) {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 24px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <span
        style={{
          fontFamily: 'var(--font-lora)',
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--ink)',
          letterSpacing: '0.3px',
        }}
      >
        TextBridge
      </span>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Markdown toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--accent)' }}>
            Markdown
          </span>
          <button
            onClick={onMarkdownToggle}
            aria-pressed={markdownMode}
            aria-label={`Markdown mode ${markdownMode ? 'on' : 'off'}`}
            style={{
              width: '38px',
              height: '22px',
              borderRadius: '11px',
              background: markdownMode ? 'var(--ink)' : 'var(--border-strong)',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: '16px',
                height: '16px',
                background: 'var(--white)',
                borderRadius: '50%',
                position: 'absolute',
                top: '3px',
                left: markdownMode ? '19px' : '3px',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
                display: 'block',
              }}
            />
          </button>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: markdownMode ? 'var(--ink)' : 'var(--muted)',
              minWidth: '24px',
            }}
          >
            {markdownMode ? 'ON' : 'OFF'}
          </span>
        </div>

        {/* History button */}
        <button
          onClick={onHistoryClick}
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '5px 10px',
            fontSize: '12px',
            color: 'var(--muted)',
            cursor: 'pointer',
            fontFamily: 'var(--font-inter)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          🕐 History
        </button>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Nav.tsx
git commit -m "feat: add Nav component with Markdown toggle"
```

---

## Task 7: LangBar Component

**Files:**
- Create: `src/components/LangBar.tsx`

- [ ] **Step 1: Create LangBar**

Create `src/components/LangBar.tsx`:
```tsx
'use client'

import type { Language } from '@/types'

const LANG_LABELS: Record<Language, string> = {
  en: 'English',
  he: 'עברית',
}

interface LangBarProps {
  from: Language
  to: Language
  onSwap: () => void
}

export function LangBar({ from, to, onSwap }: LangBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '14px',
        padding: '12px 24px',
        background: 'var(--surface-alt)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: '8px',
          padding: '6px 20px',
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--ink)',
          minWidth: '90px',
          textAlign: 'center',
        }}
      >
        {LANG_LABELS[from]}
      </div>

      <button
        onClick={onSwap}
        aria-label="Swap languages"
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          border: '1px solid var(--border-strong)',
          background: 'var(--surface)',
          cursor: 'pointer',
          fontSize: '14px',
          color: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        ⇄
      </button>

      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: '8px',
          padding: '6px 20px',
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--ink)',
          minWidth: '90px',
          textAlign: 'center',
        }}
      >
        {LANG_LABELS[to]}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/LangBar.tsx
git commit -m "feat: add LangBar component with swap button"
```

---

## Task 8: InputPanel Component

**Files:**
- Create: `src/components/InputPanel.tsx`

- [ ] **Step 1: Create InputPanel**

Create `src/components/InputPanel.tsx`:
```tsx
'use client'

interface InputPanelProps {
  value: string
  onChange: (value: string) => void
  onTranslate: () => void
  isLoading: boolean
}

export function InputPanel({ value, onChange, onTranslate, isLoading }: InputPanelProps) {
  const isEmpty = !value.trim()

  return (
    <div
      style={{
        flex: 1,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Panel header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: 'var(--muted)',
          }}
        >
          Input
        </span>
        <button
          onClick={() => onChange('')}
          disabled={isEmpty}
          style={{
            fontSize: '11px',
            color: isEmpty ? 'var(--border-strong)' : 'var(--muted)',
            background: 'none',
            border: 'none',
            cursor: isEmpty ? 'default' : 'pointer',
            fontFamily: 'var(--font-inter)',
            padding: '2px 6px',
            borderRadius: '4px',
          }}
        >
          Clear ✕
        </button>
      </div>

      {/* Textarea */}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Type or paste your text here… Typos are fine — TextBridge understands intent."
        style={{
          flex: 1,
          background: 'var(--white)',
          border: '1px solid var(--border-strong)',
          borderRadius: '10px',
          padding: '14px 16px',
          fontSize: '14px',
          fontFamily: 'var(--font-inter)',
          color: 'var(--ink)',
          resize: 'none',
          outline: 'none',
          lineHeight: '1.65',
          minHeight: '220px',
          boxShadow: 'inset 0 1px 3px rgba(60,40,10,0.04)',
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--muted)')}
        onBlur={e => (e.target.style.borderColor = 'var(--border-strong)')}
      />

      {/* Translate button */}
      <button
        onClick={onTranslate}
        disabled={isEmpty || isLoading}
        style={{
          background: isEmpty || isLoading ? 'var(--muted)' : 'var(--ink)',
          color: 'var(--surface)',
          border: 'none',
          borderRadius: '10px',
          padding: '12px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: isEmpty || isLoading ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-inter)',
          letterSpacing: '0.2px',
          transition: 'background 0.15s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        {isLoading ? 'Translating…' : 'Translate →'}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/InputPanel.tsx
git commit -m "feat: add InputPanel component"
```

---

## Task 9: MarkdownRenderer Component

**Files:**
- Create: `src/components/MarkdownRenderer.tsx`

- [ ] **Step 1: Create MarkdownRenderer**

Create `src/components/MarkdownRenderer.tsx`:
```tsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownRendererProps {
  content: string
  isRtl: boolean
}

export function MarkdownRenderer({ content, isRtl }: MarkdownRendererProps) {
  return (
    <div
      style={{
        direction: isRtl ? 'rtl' : 'ltr',
        lineHeight: '1.7',
        fontSize: '14px',
        color: 'var(--ink)',
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 style={{ fontFamily: 'var(--font-lora)', fontSize: '17px', fontWeight: 700, color: 'var(--ink)', marginBottom: '10px' }}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 style={{ fontFamily: 'var(--font-lora)', fontSize: '15px', fontWeight: 600, color: 'var(--ink)', margin: '12px 0 6px' }}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 style={{ fontFamily: 'var(--font-lora)', fontSize: '13px', fontWeight: 600, color: 'var(--accent)', margin: '10px 0 4px' }}>
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p style={{ marginBottom: '8px', color: 'var(--ink)' }}>{children}</p>
          ),
          ul: ({ children }) => (
            <ul style={{ paddingRight: isRtl ? '20px' : '0', paddingLeft: isRtl ? '0' : '20px', marginBottom: '8px' }}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol style={{ paddingRight: isRtl ? '20px' : '0', paddingLeft: isRtl ? '0' : '20px', marginBottom: '8px' }}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li style={{ marginBottom: '4px', color: 'var(--ink)' }}>{children}</li>
          ),
          code: ({ inline, children }: { inline?: boolean; children?: React.ReactNode }) =>
            inline ? (
              <code style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1px 5px', fontSize: '12px', fontFamily: 'monospace', color: 'var(--accent)', direction: 'ltr', display: 'inline-block' }}>
                {children}
              </code>
            ) : (
              <pre style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px', fontSize: '12px', fontFamily: 'monospace', color: 'var(--accent)', margin: '8px 0', direction: 'ltr', textAlign: 'left', overflowX: 'auto' }}>
                <code>{children}</code>
              </pre>
            ),
          table: ({ children }) => (
            <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '12px', fontSize: '13px' }}>
              {children}
            </table>
          ),
          th: ({ children }) => (
            <th style={{ border: '1px solid var(--border)', padding: '6px 10px', background: 'var(--surface-alt)', fontWeight: 600, textAlign: isRtl ? 'right' : 'left' }}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td style={{ border: '1px solid var(--border)', padding: '6px 10px', textAlign: isRtl ? 'right' : 'left' }}>
              {children}
            </td>
          ),
          blockquote: ({ children }) => (
            <blockquote style={{ borderRight: isRtl ? '3px solid var(--border-strong)' : 'none', borderLeft: isRtl ? 'none' : '3px solid var(--border-strong)', paddingRight: isRtl ? '12px' : '0', paddingLeft: isRtl ? '0' : '12px', margin: '8px 0', color: 'var(--muted)', fontStyle: 'italic' }}>
              {children}
            </blockquote>
          ),
          hr: () => <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '12px 0' }} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/MarkdownRenderer.tsx
git commit -m "feat: add MarkdownRenderer with RTL support and design token styling"
```

---

## Task 10: OutputPanel Component

**Files:**
- Create: `src/components/OutputPanel.tsx`

- [ ] **Step 1: Create OutputPanel**

Create `src/components/OutputPanel.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { MarkdownRenderer } from './MarkdownRenderer'
import type { Language, TranslationMode } from '@/types'

interface OutputPanelProps {
  output: string
  mode: TranslationMode
  targetLang: Language
  isLoading: boolean
  error: string | null
  onRetry: () => void
}

export function OutputPanel({ output, mode, targetLang, isLoading, error, onRetry }: OutputPanelProps) {
  const [viewMode, setViewMode] = useState<'preview' | 'raw'>('preview')
  const [copied, setCopied] = useState(false)
  const isRtl = targetLang === 'he'
  const isEmpty = !output.trim()

  async function handleCopy() {
    if (isEmpty) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      style={{
        flex: 1,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        background: 'var(--surface-alt)',
      }}
    >
      {/* Panel header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: 'var(--muted)',
          }}
        >
          Output
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Raw/Preview toggle — only in Markdown mode */}
          {mode === 'markdown' && (
            <div
              style={{
                display: 'flex',
                background: 'var(--border)',
                borderRadius: '6px',
                overflow: 'hidden',
                fontSize: '11px',
              }}
            >
              {(['preview', 'raw'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setViewMode(v)}
                  style={{
                    padding: '3px 10px',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-inter)',
                    fontSize: '11px',
                    background: viewMode === v ? 'var(--accent)' : 'transparent',
                    color: viewMode === v ? 'var(--white)' : 'var(--muted)',
                    fontWeight: viewMode === v ? 600 : 400,
                    textTransform: 'capitalize',
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          )}

          {/* Copy button */}
          <button
            onClick={handleCopy}
            disabled={isEmpty}
            style={{
              fontSize: '11px',
              color: isEmpty ? 'var(--border-strong)' : 'var(--accent)',
              background: 'none',
              border: 'none',
              cursor: isEmpty ? 'default' : 'pointer',
              fontFamily: 'var(--font-inter)',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            {copied ? 'Copied!' : 'Copy ⎘'}
          </button>
        </div>
      </div>

      {/* Output area */}
      <div
        style={{
          flex: 1,
          background: 'var(--white)',
          border: '1px solid var(--border-strong)',
          borderRadius: '10px',
          padding: '14px 16px',
          minHeight: '220px',
          overflowY: 'auto',
          boxShadow: 'inset 0 1px 3px rgba(60,40,10,0.04)',
        }}
      >
        {isLoading && (
          <div style={{ color: 'var(--muted)', fontSize: '14px', fontStyle: 'italic' }}>
            Translating…
          </div>
        )}

        {!isLoading && error && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ color: '#c0392b', fontSize: '13px' }}>{error}</span>
            <button
              onClick={onRetry}
              style={{
                alignSelf: 'flex-start',
                background: 'none',
                border: '1px solid var(--border-strong)',
                borderRadius: '6px',
                padding: '4px 12px',
                fontSize: '12px',
                color: 'var(--accent)',
                cursor: 'pointer',
                fontFamily: 'var(--font-inter)',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && isEmpty && (
          <div style={{ color: 'var(--border-strong)', fontSize: '14px', fontStyle: 'italic', direction: isRtl ? 'rtl' : 'ltr' }}>
            Translation will appear here…
          </div>
        )}

        {!isLoading && !error && !isEmpty && (
          <>
            {mode === 'markdown' && viewMode === 'preview' ? (
              <MarkdownRenderer content={output} isRtl={isRtl} />
            ) : (
              <pre
                style={{
                  fontFamily: mode === 'markdown' ? 'monospace' : 'var(--font-inter)',
                  fontSize: '13px',
                  color: 'var(--ink)',
                  whiteSpace: 'pre-wrap',
                  direction: isRtl ? 'rtl' : 'ltr',
                  margin: 0,
                }}
              >
                {output}
              </pre>
            )}
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/OutputPanel.tsx
git commit -m "feat: add OutputPanel with raw/preview toggle, copy, error, and loading states"
```

---

## Task 11: HistoryStrip Component

**Files:**
- Create: `src/components/HistoryStrip.tsx`

- [ ] **Step 1: Create HistoryStrip**

Create `src/components/HistoryStrip.tsx`:
```tsx
'use client'

import type { HistoryEntry } from '@/types'

interface HistoryStripProps {
  entries: HistoryEntry[]
  onSelect: (entry: HistoryEntry) => void
}

export function HistoryStrip({ entries, onSelect }: HistoryStripProps) {
  if (entries.length === 0) return null

  return (
    <div
      style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--surface-alt)',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        overflowX: 'auto',
      }}
    >
      <span
        style={{
          fontSize: '11px',
          color: 'var(--muted)',
          fontWeight: 500,
          letterSpacing: '0.5px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        Recent
      </span>
      {entries.slice(0, 5).map(entry => (
        <button
          key={entry.id}
          onClick={() => onSelect(entry)}
          title={entry.input}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-strong)',
            borderRadius: '20px',
            padding: '4px 12px',
            fontSize: '11px',
            color: 'var(--accent)',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            fontFamily: 'var(--font-inter)',
            flexShrink: 0,
            maxWidth: '180px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {entry.input.length > 30 ? entry.input.slice(0, 30) + '…' : entry.input}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/HistoryStrip.tsx
git commit -m "feat: add HistoryStrip component"
```

---

## Task 12: TranslatePanel — Main Orchestrator

**Files:**
- Create: `src/components/TranslatePanel.tsx`

- [ ] **Step 1: Create TranslatePanel**

Create `src/components/TranslatePanel.tsx`:
```tsx
'use client'

import { useState, useCallback } from 'react'
import { Nav } from './Nav'
import { LangBar } from './LangBar'
import { InputPanel } from './InputPanel'
import { OutputPanel } from './OutputPanel'
import { HistoryStrip } from './HistoryStrip'
import { useHistory } from '@/hooks/useHistory'
import type { Language, TranslationMode, HistoryEntry } from '@/types'

export function TranslatePanel() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [from, setFrom] = useState<Language>('en')
  const [to, setTo] = useState<Language>('he')
  const [mode, setMode] = useState<TranslationMode>('plain')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { entries, addEntry } = useHistory()

  const translate = useCallback(async () => {
    if (!input.trim()) return
    setIsLoading(true)
    setError(null)
    setOutput('')

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, from, to, mode }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error ?? 'Translation failed. Please try again.')
      } else {
        setOutput(data.output)
        addEntry({ input, output: data.output, from, to, mode })
      }
    } catch {
      setError('Translation failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [input, from, to, mode, addEntry])

  function handleSwap() {
    setFrom(to)
    setTo(from)
    setInput(output)
    setOutput('')
    setError(null)
  }

  function handleHistorySelect(entry: HistoryEntry) {
    setInput(entry.input)
    setOutput(entry.output)
    setFrom(entry.from)
    setTo(entry.to)
    setMode(entry.mode)
    setError(null)
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '960px',
        margin: '0 auto',
        background: 'var(--surface)',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 24px rgba(60,40,10,0.08), 0 1px 4px rgba(60,40,10,0.05)',
        overflow: 'hidden',
      }}
    >
      <Nav
        markdownMode={mode === 'markdown'}
        onMarkdownToggle={() => setMode(prev => prev === 'plain' ? 'markdown' : 'plain')}
        onHistoryClick={() => {/* history visible in strip below */}}
      />
      <LangBar from={from} to={to} onSwap={handleSwap} />
      <div style={{ display: 'flex', minHeight: '340px' }}>
        <InputPanel
          value={input}
          onChange={setInput}
          onTranslate={translate}
          isLoading={isLoading}
        />
        <OutputPanel
          output={output}
          mode={mode}
          targetLang={to}
          isLoading={isLoading}
          error={error}
          onRetry={translate}
        />
      </div>
      <HistoryStrip entries={entries} onSelect={handleHistorySelect} />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/TranslatePanel.tsx
git commit -m "feat: add TranslatePanel orchestrator with full translation flow"
```

---

## Task 13: Wire Up the Page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Update page.tsx**

Replace `src/app/page.tsx` with:
```tsx
import { TranslatePanel } from '@/components/TranslatePanel'

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '32px 16px',
        background: 'var(--background)',
      }}
    >
      <TranslatePanel />
    </main>
  )
}
```

- [ ] **Step 2: Run the full app and verify all features**

```bash
npm run dev
```

Open `http://localhost:3000` and verify:
- [ ] App renders with Warm Editorial styling (cream background, Lora logo)
- [ ] Type text in input → click Translate → output appears
- [ ] Markdown toggle switches between plain and markdown modes
- [ ] In Markdown mode, output shows rendered Markdown (Preview) or raw text (Raw)
- [ ] Copy button copies output text
- [ ] Swap button swaps languages and moves output to input
- [ ] Clear button clears input
- [ ] After a translation, a chip appears in the history strip
- [ ] Clicking a history chip restores that translation

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: wire up main page with TranslatePanel"
```

---

## Task 14: Mobile Responsive Layout

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add responsive breakpoint**

Append to `src/app/globals.css`:
```css
/* Mobile: stack panels vertically */
@media (max-width: 768px) {
  .panels-container {
    flex-direction: column !important;
  }
  .panel-input {
    border-right: none !important;
    border-bottom: 1px solid var(--border);
  }
}
```

- [ ] **Step 2: Add className to panels in TranslatePanel.tsx**

In `src/components/TranslatePanel.tsx`, update the panels wrapper div to add `className`:
```tsx
<div className="panels-container" style={{ display: 'flex', minHeight: '340px' }}>
```

And add `className="panel-input"` to `InputPanel` — update `src/components/InputPanel.tsx`, the outer div:
```tsx
<div
  className="panel-input"
  style={{ ... }}
>
```

- [ ] **Step 3: Verify on mobile size**

In Chrome DevTools, set viewport to 375px wide. Verify panels stack vertically with input on top.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/components/TranslatePanel.tsx src/components/InputPanel.tsx
git commit -m "feat: add mobile responsive stacked layout"
```

---

## Task 15: Deploy to Vercel

**Files:**
- None (deployment config)

- [ ] **Step 1: Push to GitHub**

```bash
git remote add origin https://github.com/YOUR_USERNAME/textbridge.git
git branch -M main
git push -u origin main
```

- [ ] **Step 2: Deploy on Vercel**

1. Go to vercel.com → New Project → Import from GitHub → select `textbridge`
2. Framework preset: Next.js (auto-detected)
3. Add environment variable: `OPENAI_API_KEY` = your key
4. Click Deploy

- [ ] **Step 3: Verify production**

Open the Vercel URL and verify:
- Translation works in both modes
- No API key visible in browser DevTools → Network tab (confirm it's server-side only)
- History persists across page refreshes
- Mobile layout is stacked on small screens

- [ ] **Step 4: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: production verification fixes"
git push
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] EN ↔ HE translation — Task 4, 12
- [x] Contextual translation, typo correction — Task 3 (prompts)
- [x] Markdown mode with intelligent structuring — Task 3, 4, 9, 10
- [x] Raw/Preview toggle — Task 10
- [x] Copy button with "Copied!" feedback — Task 10
- [x] Language swap (moves output to input) — Task 12
- [x] Clear input — Task 8
- [x] localStorage history (10 entries) — Task 5
- [x] History strip (5 chips, click to restore) — Task 11, 12
- [x] Loading state — Task 8, 10
- [x] Error state with Retry — Task 10, 12
- [x] Disabled Translate when input empty — Task 8
- [x] Disabled Copy when output empty — Task 10
- [x] GPT-4o-mini for plain, GPT-4o for Markdown — Task 4
- [x] API key server-side only — Task 4
- [x] Warm Editorial design system — Task 1 (tokens), all components
- [x] RTL output for Hebrew — Task 9, 10
- [x] Mobile responsive layout — Task 14
- [x] Vercel deployment — Task 15
