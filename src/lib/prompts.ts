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
