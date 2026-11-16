'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Language, TranslationMode, HistoryEntry } from '@/types'
import { useHistory } from '@/hooks/useHistory'
import { LangBar } from '@/components/LangBar'
import { InputPanel } from '@/components/InputPanel'
import { OutputPanel } from '@/components/OutputPanel'
import HistoryStrip from '@/components/HistoryStrip'

interface TranslatePanelProps {
  markdownMode: boolean
  onMarkdownModeChange: (value: boolean) => void
  showHistory: boolean
  pushedColor: { id: number; value: string } | null
}

export default function TranslatePanel({
  markdownMode,
  onMarkdownModeChange,
  showHistory,
  pushedColor,
}: TranslatePanelProps) {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [from, setFrom] = useState<Language>('he')
  const [to, setTo] = useState<Language>('en')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null)

  const { entries, addEntry, clearHistory } = useHistory()

  const mode: TranslationMode = markdownMode ? 'markdown' : 'plain'

  useEffect(() => {
    if (pushedColor) setInputText(current => current ? `${current.trimEnd()}\n${pushedColor.value}` : pushedColor.value)
  }, [pushedColor])

  const translate = useCallback(async (text: string) => {
    if (!text.trim()) return
    setLoading(true)
    setError(null)
    setOutputText('')

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, from, to, mode }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setOutputText(data.output)
        addEntry({ input: text, output: data.output, from, to, mode })
      }
    } catch {
      setError('Translation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [from, to, mode, addEntry])

  const handleTranslate = () => translate(inputText)

  const handleRetry = () => translate(inputText)

  const handleSwap = () => {
    setFrom(to)
    setTo(from)
    if (outputText) {
      setInputText(outputText)
      setOutputText('')
    }
  }

  const handleHistorySelect = (entry: HistoryEntry) => {
    setInputText(entry.input)
    setOutputText(entry.output)
    setFrom(entry.from)
    setTo(entry.to)
    onMarkdownModeChange(entry.mode === 'markdown')
    setError(null)
    setActiveHistoryId(entry.id)
  }

  return (
    <>
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 20px',
          gap: '16px',
          maxWidth: '90%',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <LangBar from={from} to={to} onSwap={handleSwap} />

        <div
          className="panels-row"
          style={{
            display: 'flex',
            gap: '16px',
            flex: 1,
            width: '100%',
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          <InputPanel
            value={inputText}
            onChange={setInputText}
            onTranslate={handleTranslate}
            isLoading={loading}
            inputLang={from}
          />
          <OutputPanel
            output={outputText}
            mode={mode}
            targetLang={to}
            isLoading={loading}
            error={error}
            onRetry={handleRetry}
          />
        </div>
      </main>

      {showHistory && (
        <HistoryStrip
          entries={entries}
          selectedId={activeHistoryId}
          onSelect={handleHistorySelect}
          onClear={() => {
            setActiveHistoryId(null)
            clearHistory()
          }}
        />
      )}
    </>
  )
}
