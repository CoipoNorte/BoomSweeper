import type { HighScore } from './types'

const DB_NAME = 'boomsweeper_db'
const DB_VERSION = 1
const STORE_NAME = 'highscores'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
        store.createIndex('score', 'score', { unique: false })
        store.createIndex('difficulty', 'difficulty', { unique: false })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveHighScore(score: HighScore): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.add(score)
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  } catch {
    // Fallback to localStorage
    const existing = JSON.parse(localStorage.getItem('boomsweeper_scores') || '[]')
    existing.push(score)
    localStorage.setItem('boomsweeper_scores', JSON.stringify(existing))
  }
}

export async function getHighScores(): Promise<HighScore[]> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.getAll()

    const scores = await new Promise<HighScore[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as HighScore[])
      request.onerror = () => reject(request.error)
    })

    db.close()
    return scores.sort((a, b) => b.score - a.score).slice(0, 20)
  } catch {
    const existing = JSON.parse(localStorage.getItem('boomsweeper_scores') || '[]')
    return (existing as HighScore[]).sort((a: HighScore, b: HighScore) => b.score - a.score).slice(0, 20)
  }
}

export async function clearHighScores(): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.clear()
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  } catch {
    localStorage.removeItem('boomsweeper_scores')
  }
}
