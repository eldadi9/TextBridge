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
