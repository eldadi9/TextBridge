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
        padding: '12px 16px',
        background: 'var(--surface-alt)',
        borderBottom: '1px solid var(--border)',
        width: '100%',
        boxSizing: 'border-box',
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
