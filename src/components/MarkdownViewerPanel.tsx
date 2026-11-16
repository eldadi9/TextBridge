'use client'

import { useRef, useState } from 'react'
import { MarkdownRenderer } from './MarkdownRenderer'

function hasHebrew(text: string): boolean {
  return /[\u0590-\u05FF]/.test(text)
}

export default function MarkdownViewerPanel() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEmpty = !input.trim()
  const outputEmpty = !output.trim()
  const isRtl = hasHebrew(output || input)
  // Display only when paste/edit left something new to render
  const canDisplay = !isEmpty && input !== output

  function handleDisplay() {
    if (!canDisplay) return
    setOutput(input)
  }

  function handleClear() {
    setInput('')
    setOutput('')
    setFileName(null)
    setUploadError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleCopy() {
    if (outputEmpty) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const lower = file.name.toLowerCase()
    const okExt = lower.endsWith('.md') || lower.endsWith('.markdown') || lower.endsWith('.txt')
    if (!okExt) {
      setUploadError('Please upload a .md, .markdown, or .txt file.')
      return
    }

    setUploadError(null)
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? '')
      setInput(text)
      setOutput(text)
      setFileName(file.name)
    }
    reader.onerror = () => {
      setUploadError('Could not read that file. Try again.')
    }
    reader.readAsText(file)
  }

  return (
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
      <p
        style={{
          margin: 0,
          fontSize: '13px',
          color: 'var(--muted)',
          textAlign: 'center',
        }}
      >
        Upload a <code style={{ fontSize: '12px' }}>.md</code> file to preview instantly — or paste Markdown and click Display.
      </p>

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
        {/* INPUT = source (raw) — slightly narrower; Preview gets more room */}
        <div
          className="panel-input"
          style={{
            flex: '0.9 1 0',
            minWidth: 0,
            maxWidth: '100%',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: 'var(--surface)',
            borderRight: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  fontSize: '11px',
                  color: 'var(--accent)',
                  background: 'none',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-inter)',
                  padding: '3px 10px',
                }}
              >
                Upload .md
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".md,.markdown,.txt,text/markdown,text/plain"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                aria-label="Upload Markdown file"
              />
              <button
                type="button"
                onClick={handleClear}
                disabled={isEmpty && outputEmpty}
                style={{
                  fontSize: '11px',
                  color: isEmpty && outputEmpty ? 'var(--border-strong)' : 'var(--muted)',
                  background: 'none',
                  border: 'none',
                  cursor: isEmpty && outputEmpty ? 'default' : 'pointer',
                  fontFamily: 'var(--font-inter)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                Clear ✕
              </button>
            </div>
          </div>

          {fileName && (
            <span style={{ fontSize: '11px', color: 'var(--accent)' }}>
              Loaded: {fileName}
            </span>
          )}
          {uploadError && (
            <span style={{ fontSize: '12px', color: '#c0392b' }}>{uploadError}</span>
          )}

          <textarea
            value={input}
            onChange={e => {
              setInput(e.target.value)
              setFileName(null)
            }}
            dir={hasHebrew(input) ? 'rtl' : 'ltr'}
            placeholder={'# Paste Markdown here…\n\n## Or upload a .md file\n\n- Lists, tables, **bold** — all supported'}
            style={{
              flex: 1,
              width: '100%',
              minWidth: 0,
              maxWidth: '100%',
              background: 'var(--white)',
              border: '1px solid var(--border-strong)',
              borderRadius: '10px',
              padding: '14px 16px',
              fontSize: '13px',
              fontFamily: 'monospace',
              color: 'var(--ink)',
              resize: 'none',
              outline: 'none',
              lineHeight: '1.65',
              minHeight: '220px',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              overflowWrap: 'anywhere',
              wordBreak: 'break-word',
              boxShadow: 'inset 0 1px 3px rgba(60,40,10,0.04)',
              boxSizing: 'border-box',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--muted)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border-strong)')}
          />

          <button
            type="button"
            onClick={handleDisplay}
            disabled={!canDisplay}
            title={
              isEmpty
                ? 'Paste Markdown first'
                : !canDisplay
                  ? 'Already displayed — edit or paste new content to enable'
                  : 'Render Markdown preview'
            }
            style={{
              background: canDisplay ? 'var(--ink)' : 'var(--muted)',
              color: 'var(--surface)',
              border: 'none',
              borderRadius: '10px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: canDisplay ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--font-inter)',
              letterSpacing: '0.2px',
              transition: 'background 0.15s',
            }}
          >
            Display →
          </button>
        </div>

        {/* OUTPUT = always rendered preview — wider for tables & long text */}
        <div
          className="panel-preview"
          style={{
            flex: '1.25 1 0',
            minWidth: 0,
            maxWidth: '100%',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: 'var(--surface-alt)',
            overflow: 'hidden',
          }}
        >
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
              Preview
            </span>
            <button
              type="button"
              onClick={handleCopy}
              disabled={outputEmpty}
              style={{
                fontSize: '11px',
                color: outputEmpty ? 'var(--border-strong)' : 'var(--accent)',
                background: 'none',
                border: 'none',
                cursor: outputEmpty ? 'default' : 'pointer',
                fontFamily: 'var(--font-inter)',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              {copied ? 'Copied!' : 'Copy ⎘'}
            </button>
          </div>

          <div
            style={{
              flex: 1,
              width: '100%',
              minWidth: 0,
              maxWidth: '100%',
              background: 'var(--white)',
              border: '1px solid var(--border-strong)',
              borderRadius: '10px',
              padding: '14px 16px',
              minHeight: '220px',
              overflow: 'auto',
              boxSizing: 'border-box',
              boxShadow: 'inset 0 1px 3px rgba(60,40,10,0.04)',
            }}
          >
            {outputEmpty ? (
              <div
                style={{
                  color: 'var(--border-strong)',
                  fontSize: '14px',
                  fontStyle: 'italic',
                }}
              >
                Rendered Markdown will appear here…
              </div>
            ) : (
              <MarkdownRenderer content={output} isRtl={isRtl} />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
