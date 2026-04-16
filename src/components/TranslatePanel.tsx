'use client'

import { useState, useCallback } from 'react'
import type { Language, TranslationMode, HistoryEntry } from '@/types'
import { useHistory } from '@/hooks/useHistory'
import { Nav } from '@/components/Nav'
import { LangBar } from '@/components/LangBar'
import { InputPanel } from '@/components/InputPanel'
import { OutputPanel } from '@/components/OutputPanel'
import HistoryStrip from '@/components/HistoryStrip'

export default function TranslatePanel() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [from, setFrom] = useState<Language>('he')
  const [to, setTo] = useState<Language>('en')
  const [markdownMode, setMarkdownMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  const { entries, addEntry, clearHistory } = useHistory()

  const mode: TranslationMode = markdownMode ? 'markdown' : 'plain'

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

  const handleClear = () => {
    setInputText('')
    setOutputText('')
    setError(null)
  }

  const handleHistorySelect = (entry: HistoryEntry) => {
    setInputText(entry.input)
    setOutputText(entry.output)
    setFrom(entry.from)
    setTo(entry.to)
    setMarkdownMode(entry.mode === 'markdown')
    setError(null)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--background)',
      }}
    >
      <Nav
        markdownMode={markdownMode}
        onMarkdownToggle={() => setMarkdownMode((v) => !v)}
        onHistoryClick={() => setShowHistory((v) => !v)}
      />

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '16px',
          gap: '16px',
          maxWidth: '1100px',
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
          onSelect={handleHistorySelect}
          onClear={clearHistory}
        />
      )}

      <footer
        style={{
          textAlign: 'center',
          padding: '14px 24px',
          fontSize: '11px',
          color: 'var(--muted)',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface)',
          letterSpacing: '0.2px',
        }}
      >
        TextBridge v1.0 &nbsp;·&nbsp; Built by EG &nbsp;·&nbsp; Powered by Claude AI
      </footer>
    </div>
  )
}
