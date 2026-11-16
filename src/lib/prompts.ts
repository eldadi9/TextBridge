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

  return `You are an expert Hebrew-English translator and professional content structurer. Your job is to translate the input and return it as richly structured, professional Markdown — always.

Rules:
- Translate with full contextual accuracy — preserve tone, intent, and meaning
- Correct obvious spelling mistakes; preserve proper nouns and technical terms
- ALWAYS apply rich Markdown structure, even for plain conversational text:
  - Identify themes or topics within the text and give each a ## heading
  - Use bullet points (-) for any list-like or enumerable content
  - Use numbered lists (1. 2. 3.) for steps or sequences
  - Use **bold** for key terms, names, or important phrases
  - Use > blockquotes for opinions, feelings, or subjective statements
  - Use fenced code blocks for any code, commands, or technical strings
  - Use Markdown tables for any comparative or structured data
- Even a single paragraph should be broken into a heading + structured content
- Never return plain unformatted text — always enrich with Markdown
- Return only the translated Markdown — no preamble, no explanations`
}

export function buildUserMessage(text: string, from: Language, to: Language): string {
  return `Translate the following from ${LANGUAGE_NAMES[from]} to ${LANGUAGE_NAMES[to]}:\n\n${text}`
}
