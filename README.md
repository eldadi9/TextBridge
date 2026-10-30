<div align="center">

# TextBridge

### Hebrew ↔ English AI translator with Markdown-structured output for LLM copy-paste

TextBridge translates between Hebrew and English using OpenAI, with two distinct output modes: clean natural translation, or fully Markdown-structured output ready for pasting into any LLM chat.

<p align="center">
  <a href="https://nextjs.org">
    <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white" alt="Next.js">
  </a>
  <a href="https://openai.com">
    <img src="https://img.shields.io/badge/OpenAI-GPT--4o-412991?logo=openai&logoColor=white" alt="OpenAI">
  </a>
  <a href="https://typescriptlang.org">
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  </a>
  <a href="https://vercel.com">
    <img src="https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel&logoColor=white" alt="Vercel">
  </a>
  <img src="https://img.shields.io/badge/Status-Live-22C55E" alt="Status">
</p>

</div>

---

## The Problem

Translating Hebrew content for use in English-language LLMs is a two-step process: translate first, then manually format for readability. TextBridge collapses both steps into one.

---

## What I Built

A focused translation tool with two modes:

**Plain mode** — Natural, contextually accurate Hebrew ↔ English translation. Reads like it was written in the target language, not translated.

**Markdown mode** — Translates and simultaneously structures the output with rich Markdown: headings, bullet points, numbered lists, bold text, blockquotes, tables, and code blocks where relevant. Output is copy-paste ready for ChatGPT, Claude, Gemini, or any LLM interface.

---

## Feature Highlights

<table>
  <tr>
    <td width="220"><strong>🌐 Hebrew ↔ English</strong></td>
    <td>Bidirectional translation with language swap — also swaps the text in both fields.</td>
  </tr>
  <tr>
    <td><strong>📝 Markdown Mode</strong></td>
    <td>Translates and structures output as rich Markdown in one step — designed for LLM copy-paste.</td>
  </tr>
  <tr>
    <td><strong>👁️ Preview / Raw Toggle</strong></td>
    <td>Switch between rendered Markdown preview and raw text view in Markdown mode.</td>
  </tr>
  <tr>
    <td><strong>📋 Copy Button</strong></td>
    <td>Copies the raw Markdown text to clipboard — ready to paste anywhere.</td>
  </tr>
  <tr>
    <td><strong>🕐 Translation History</strong></td>
    <td>Session history strip for quick access to previous translations.</td>
  </tr>
  <tr>
    <td><strong>⚡ Dual Model Routing</strong></td>
    <td>Plain mode uses gpt-4o-mini for speed; Markdown mode uses gpt-4o for richer structuring.</td>
  </tr>
</table>

---

## Architecture

```text
User Input (Hebrew or English)
          ↓
   Language selection + Mode toggle
          ↓
   POST /api/translate (Next.js App Router)
          ↓
   ┌──────────────────┬──────────────────────┐
   │ Plain mode       │ Markdown mode         │
   │ gpt-4o-mini      │ gpt-4o               │
   │ Natural output   │ Structured Markdown   │
   └──────────────────┴──────────────────────┘
          ↓
   Output Panel
   Preview | Raw | Copy
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| AI — Plain mode | OpenAI gpt-4o-mini |
| AI — Markdown mode | OpenAI gpt-4o |
| Styling | Tailwind CSS |
| Markdown rendering | react-markdown |
| Deployment | Vercel |

---

## Project Status

**Live on Vercel.**

- Translation with language swap
- Markdown mode with structured output
- Preview / raw toggle
- Copy to clipboard
- Session history

---

## What This Proves

- Next.js 16 App Router with server-side API routes
- OpenAI API integration with model routing by use case
- Practical product thinking: two distinct modes for two distinct user needs
- TypeScript + React component architecture
- Vercel deployment

---

<div align="center">
  <sub>Part of a portfolio of AI automation systems — <a href="https://github.com/eldadi9">github.com/eldadi9</a></sub>
</div>
