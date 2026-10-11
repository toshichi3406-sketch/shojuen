let verifiedAt = -Infinity
let checking: Promise<void> | null = null

async function ensureSession(force = false) {
  if (!force && Date.now() - verifiedAt < 30_000) return
  if (!checking) {
    checking = (async () => {
      const response = await fetch("/api/workboard/auth/session", { cache: "no-store" })
      const session = await response.json().catch(() => ({}))
      if (response.status === 401 || response.status === 403 ||
          (response.ok && session.configured === true && session.authenticated === false)) {
        verifiedAt = -Infinity
        if (typeof window !== "undefined") window.dispatchEvent(new Event("workboard-session-expired"))
        throw new Error("ログインの有効期限が切れました。もう一度ログインしてください。変更は保存していません。")
      }
      if (!response.ok || typeof session.authenticated !== "boolean") {
        throw new Error("ログイン状態を確認できませんでした。通信状態を確認して再試行してください。")
      }
      verifiedAt = Date.now()
    })().finally(() => { checking = null })
  }
  await checking
}

export async function workboardFetch(input: string, init?: RequestInit): Promise<Response> {
  await ensureSession()
  if (init?.signal?.aborted) throw new DOMException("Aborted", "AbortError")
  const response = await fetch(input, init)
  // A 401 rejects the request before any write. Never retry other save failures.
  if (response.status !== 401) return response
  verifiedAt = -Infinity
  await ensureSession(true)
  return fetch(input, init)
}
