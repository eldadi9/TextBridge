'use client'

interface InputPanelProps {
  value: string
  onChange: (value: string) => void
  onTranslate: () => void
  isLoading: boolean
  inputLang: string
}

export function InputPanel({ value, onChange, onTranslate, isLoading, inputLang }: InputPanelProps) {
  const isEmpty = !value.trim()
  const isRTL = inputLang === 'he'

  return (
    <div
      className="panel-input"
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
        dir={isRTL ? 'rtl' : 'ltr'}
        lang={inputLang}
        placeholder={isRTL ? 'הקלד או הדבק טקסט כאן… TextBridge מבין גם עם שגיאות כתיב.' : 'Type or paste your text here… Typos are fine — TextBridge understands intent.'}
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
