'use client'

interface NavProps {
  markdownMode: boolean
  onMarkdownToggle: () => void
  onHistoryClick: () => void
}

export function Nav({ markdownMode, onMarkdownToggle, onHistoryClick }: NavProps) {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <img
          src="/favicon.svg"
          alt="TextBridge logo"
          width={24}
          height={24}
          style={{ display: 'block' }}
        />
        <span
          style={{
            fontFamily: 'var(--font-lora)',
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--ink)',
            letterSpacing: '0.3px',
          }}
        >
          TextBridge
        </span>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Markdown toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--accent)' }}>
            Markdown
          </span>
          <button
            onClick={onMarkdownToggle}
            aria-pressed={markdownMode}
            aria-label={`Markdown mode ${markdownMode ? 'on' : 'off'}`}
            style={{
              width: '38px',
              height: '22px',
              borderRadius: '11px',
              background: markdownMode ? 'var(--ink)' : 'var(--border-strong)',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: '16px',
                height: '16px',
                background: 'var(--white)',
                borderRadius: '50%',
                position: 'absolute',
                top: '3px',
                left: markdownMode ? '19px' : '3px',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
                display: 'block',
              }}
            />
          </button>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: markdownMode ? 'var(--ink)' : 'var(--muted)',
              minWidth: '24px',
            }}
          >
            {markdownMode ? 'ON' : 'OFF'}
          </span>
        </div>

        {/* History button */}
        <button
          onClick={onHistoryClick}
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '5px 10px',
            fontSize: '12px',
            color: 'var(--muted)',
            cursor: 'pointer',
            fontFamily: 'var(--font-inter)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          🕐 History
        </button>
      </div>
    </nav>
  )
}
