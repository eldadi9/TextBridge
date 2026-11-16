'use client'

import type { HistoryEntry, Language } from '@/types'

const LANG_LABELS: Record<Language, string> = {
  en: 'EN',
  he: 'HE',
}

interface HistoryStripProps {
  entries: HistoryEntry[]
  selectedId: string | null
  onSelect: (entry: HistoryEntry) => void
  onClear: () => void
}

export default function HistoryStrip({ entries, selectedId, onSelect, onClear }: HistoryStripProps) {
  if (entries.length === 0) return null

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-alt)',
        borderTop: '1px solid var(--border)',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <span
        style={{
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: 'var(--muted)',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        Recent
      </span>

      <div
        style={{
          display: 'flex',
          gap: '6px',
          flex: 1,
          minWidth: 0,
          overflowX: 'auto',
        }}
      >
        {entries.map((entry) => {
          const selected = entry.id === selectedId
          return (
          <button
            key={entry.id}
            onClick={() => onSelect(entry)}
            title={entry.input}
            aria-pressed={selected}
            style={{
              background: selected ? 'var(--ink)' : 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '11px',
              color: selected ? 'var(--white)' : 'var(--accent)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              maxWidth: '220px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flexShrink: 0,
            }}
          >
            <span style={{ color: selected ? 'rgba(255,255,255,0.75)' : 'var(--muted)', marginRight: '4px' }}>
              {LANG_LABELS[entry.from]}→{LANG_LABELS[entry.to]}
            </span>
            {entry.input.length > 30 ? entry.input.slice(0, 30) + '…' : entry.input}
          </button>
          )
        })}
      </div>

      <button
        onClick={onClear}
        style={{
          marginLeft: 'auto',
          background: 'none',
          border: 'none',
          fontSize: '11px',
          color: 'var(--muted)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        Clear
      </button>
    </div>
  )
}
