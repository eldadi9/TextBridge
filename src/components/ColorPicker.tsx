'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type Format = 'hex' | 'rgb' | 'hsl'
type HSV = { h: number; s: number; v: number }

const STORAGE_KEY = 'textbridge_saved_colors'

function hsvToRgb({ h, s, v }: HSV) {
  const saturation = s / 100
  const value = v / 100
  const chroma = value * saturation
  const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = value - chroma
  let r = 0, g = 0, b = 0
  if (h < 60) [r, g] = [chroma, x]
  else if (h < 120) [r, g] = [x, chroma]
  else if (h < 180) [g, b] = [chroma, x]
  else if (h < 240) [g, b] = [x, chroma]
  else if (h < 300) [r, b] = [x, chroma]
  else [r, b] = [chroma, x]
  return [r, g, b].map(channel => Math.round((channel + m) * 255)) as [number, number, number]
}

function rgbToHsv(r: number, g: number, b: number): HSV {
  const channels = [r / 255, g / 255, b / 255]
  const max = Math.max(...channels)
  const min = Math.min(...channels)
  const delta = max - min
  let h = 0
  if (delta && max === channels[0]) h = (60 * (((channels[1] - channels[2]) / delta) % 6) + 360) % 360
  else if (delta && max === channels[1]) h = 60 * ((channels[2] - channels[0]) / delta + 2)
  else if (delta) h = 60 * ((channels[0] - channels[1]) / delta + 4)
  return { h, s: max ? (delta / max) * 100 : 0, v: max * 100 }
}

function toHex(rgb: [number, number, number]) {
  return `#${rgb.map(value => value.toString(16).padStart(2, '0')).join('')}`.toUpperCase()
}

function fromHex(hex: string) {
  return [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16)) as [number, number, number]
}

function formatColor(color: HSV, format: Format) {
  const [r, g, b] = hsvToRgb(color)
  if (format === 'hex') return toHex([r, g, b])
  if (format === 'rgb') return `rgb(${r}, ${g}, ${b})`
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn), delta = max - min
  const lightness = (max + min) / 2
  let hue = 0
  if (delta && max === rn) hue = (60 * (((gn - bn) / delta) % 6) + 360) % 360
  else if (delta && max === gn) hue = 60 * ((bn - rn) / delta + 2)
  else if (delta) hue = 60 * ((rn - gn) / delta + 4)
  const saturation = delta ? delta / (1 - Math.abs(2 * lightness - 1)) : 0
  return `hsl(${Math.round(hue)}, ${Math.round(saturation * 100)}%, ${Math.round(lightness * 100)}%)`
}

interface ColorPickerProps {
  open: boolean
  onClose: () => void
  onPush: (color: string) => void
}

export function ColorPicker({ open, onClose, onPush }: ColorPickerProps) {
  const [color, setColor] = useState<HSV>({ h: 140, s: 68, v: 67 })
  const [format, setFormat] = useState<Format>('hex')
  const [recent, setRecent] = useState<string[]>([])
  const [saved, setSaved] = useState<string[]>([])
  const [copyStatus, setCopyStatus] = useState('')
  const [position, setPosition] = useState({ x: 16, y: 72 })
  const saturationRef = useRef<HTMLDivElement>(null)
  const hueRef = useRef<HTMLDivElement>(null)
  const pickerRef = useRef<HTMLElement>(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const hex = useMemo(() => formatColor(color, 'hex'), [color])
  const displayed = useMemo(() => formatColor(color, format), [color, format])
  const close = useCallback(() => {
    setRecent([])
    onClose()
  }, [onClose])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
        if (Array.isArray(stored)) setSaved(stored.filter(value => typeof value === 'string' && /^#[0-9A-F]{6}$/i.test(value)))
      } catch { /* Ignore unavailable storage. */ }
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && close()
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open, close])

  function choose(next: HSV) {
    const normalized = { h: Math.max(0, Math.min(359.99, next.h)), s: Math.max(0, Math.min(100, next.s)), v: Math.max(0, Math.min(100, next.v)) }
    setColor(normalized)
    const picked = formatColor(normalized, 'hex')
    setRecent(colors => [picked, ...colors.filter(value => value !== picked)].slice(0, 8))
  }

  function selectHex(value: string) {
    choose(rgbToHsv(...fromHex(value)))
  }

  function updateSaturation(event: React.PointerEvent<HTMLDivElement>) {
    const rect = saturationRef.current?.getBoundingClientRect()
    if (!rect) return
    choose({ ...color, s: ((event.clientX - rect.left) / rect.width) * 100, v: (1 - (event.clientY - rect.top) / rect.height) * 100 })
  }

  function updateHue(event: React.PointerEvent<HTMLDivElement>) {
    const rect = hueRef.current?.getBoundingClientRect()
    if (rect) choose({ ...color, h: ((event.clientY - rect.top) / rect.height) * 360 })
  }

  function persist(colors: string[]) {
    setSaved(colors)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(colors)) } catch { /* Ignore unavailable storage. */ }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(displayed)
      setCopyStatus('Copied!')
    } catch { setCopyStatus('Copy failed') }
    window.setTimeout(() => setCopyStatus(''), 1200)
  }

  function startDragging(event: React.PointerEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest('button')) return
    const rect = pickerRef.current?.getBoundingClientRect()
    if (!rect) return
    dragOffset.current = { x: event.clientX - rect.left, y: event.clientY - rect.top }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function drag(event: React.PointerEvent<HTMLElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId) || !pickerRef.current) return
    const width = pickerRef.current.offsetWidth
    const height = pickerRef.current.offsetHeight
    setPosition({
      x: Math.max(0, Math.min(window.innerWidth - width, event.clientX - dragOffset.current.x)),
      y: Math.max(0, Math.min(window.innerHeight - height, event.clientY - dragOffset.current.y)),
    })
  }

  if (!open) return null

  return (
    <aside ref={pickerRef} className="tb-color-picker" style={{ left: position.x, top: position.y }} role="dialog" aria-modal="false" aria-labelledby="tb-color-title">
      <header onPointerDown={startDragging} onPointerMove={drag}>
        <div><span>🎨</span><h2 id="tb-color-title">Color Picker</h2><small>Drag to move</small></div>
        <button onClick={close} aria-label="Close color picker">×</button>
      </header>
      <div className="tb-color-canvas">
        <div ref={saturationRef} className="tb-saturation" style={{ backgroundColor: `hsl(${color.h},100%,50%)` }} onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); updateSaturation(event) }} onPointerMove={event => event.currentTarget.hasPointerCapture(event.pointerId) && updateSaturation(event)}>
          <span style={{ left: `${color.s}%`, top: `${100 - color.v}%` }} />
        </div>
        <div ref={hueRef} className="tb-hue" onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); updateHue(event) }} onPointerMove={event => event.currentTarget.hasPointerCapture(event.pointerId) && updateHue(event)}>
          <span style={{ top: `${color.h / 3.6}%` }} />
        </div>
      </div>
      <div className="tb-color-value"><i style={{ background: hex }} /><output aria-live="polite">{displayed}</output><button onClick={copy} aria-label="Copy color code">⧉</button></div>
      <div className="tb-color-tabs" role="tablist" aria-label="Color format">{(['hex', 'rgb', 'hsl'] as Format[]).map(value => <button key={value} role="tab" aria-selected={format === value} className={format === value ? 'active' : ''} onClick={() => setFormat(value)}>{value.toUpperCase()}</button>)}</div>
      <div className="tb-copy-status" role="status">{copyStatus}</div>
      <button className="tb-push-color" onClick={() => onPush(displayed)}><span>PUSH to context</span><strong>{format.toUpperCase()} →</strong></button>
      <ColorRow title="Recent" colors={recent} empty="Pick a color to start" onSelect={selectHex} />
      <ColorRow title={`Saved ${saved.length}`} colors={saved} empty="No saved colors yet" onSelect={selectHex} onDelete={index => persist(saved.filter((_, item) => item !== index))}>
        <button className="tb-add-color" onClick={() => persist([hex, ...saved.filter(value => value !== hex)])} aria-label="Save current color">+</button>
      </ColorRow>
    </aside>
  )
}

function ColorRow({ title, colors, empty, onSelect, onDelete, children }: { title: string; colors: string[]; empty: string; onSelect: (color: string) => void; onDelete?: (index: number) => void; children?: React.ReactNode }) {
  return <section className="tb-color-row"><h3>{title}</h3><div>{colors.map((value, index) => <span key={value}><button style={{ background: value }} onClick={() => onSelect(value)} aria-label={`Select ${value}`} />{onDelete && <button className="tb-delete-color" onClick={() => onDelete(index)} aria-label={`Delete ${value}`}>×</button>}</span>)}{children}</div>{!colors.length && <p>{empty}</p>}</section>
}
