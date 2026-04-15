'use client'

import { useState, useCallback } from 'react'
import type { HistoryEntry } from '@/types'

const STORAGE_KEY = 'textbridge-history'
const MAX_ENTRIES = 10

function loadHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(loadHistory)

  const addEntry = useCallback(
    (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
      const newEntry: HistoryEntry = {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      }
      setEntries(prev => {
        const updated = [newEntry, ...prev].slice(0, MAX_ENTRIES)
        saveHistory(updated)
        return updated
      })
    },
    []
  )

  const clearHistory = useCallback(() => {
    setEntries([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { entries, addEntry, clearHistory }
}
