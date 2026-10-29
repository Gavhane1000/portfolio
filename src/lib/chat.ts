import { useSyncExternalStore } from 'react'

let open = false
let pendingPrompt: string | null = null
const listeners = new Set<() => void>()

export function openChat(prompt?: string) {
  open = true
  pendingPrompt = prompt ?? null
  listeners.forEach((l) => l())
}

export function closeChat() {
  open = false
  listeners.forEach((l) => l())
}

export function takePendingPrompt() {
  const p = pendingPrompt
  pendingPrompt = null
  return p
}

export function useChatOpen() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => open,
  )
}
