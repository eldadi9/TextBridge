'use client'

import { useState } from 'react'
import type { AppMode } from '@/types'
import { Nav } from '@/components/Nav'
import TranslatePanel from '@/components/TranslatePanel'
import MarkdownViewerPanel from '@/components/MarkdownViewerPanel'
import { ColorPicker } from '@/components/ColorPicker'

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>('translate')
  const [markdownMode, setMarkdownMode] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const [pushedColor, setPushedColor] = useState<{ id: number; value: string } | null>(null)

  function handleAppModeChange(mode: AppMode) {
    setAppMode(mode)
    if (mode === 'viewer') setShowHistory(false)
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
        appMode={appMode}
        onAppModeChange={handleAppModeChange}
        markdownMode={markdownMode}
        onMarkdownToggle={() => setMarkdownMode(v => !v)}
        historyOpen={showHistory}
        onHistoryClick={() => setShowHistory(v => !v)}
        onColorPickerClick={() => setColorPickerOpen(true)}
      />

      {appMode === 'translate' ? (
        <TranslatePanel
          markdownMode={markdownMode}
          onMarkdownModeChange={setMarkdownMode}
          showHistory={showHistory}
          pushedColor={pushedColor}
        />
      ) : (
        <MarkdownViewerPanel />
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
        TextBridge v1.1 &nbsp;·&nbsp; Built by EG &nbsp;·&nbsp; Powered by OpenAI
      </footer>
      <ColorPicker
        open={colorPickerOpen && appMode === 'translate'}
        onClose={() => setColorPickerOpen(false)}
        onPush={value => setPushedColor({ id: Date.now(), value })}
      />
    </div>
  )
}
