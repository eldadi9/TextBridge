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
