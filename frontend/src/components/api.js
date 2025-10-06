// src/utils/api.js
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'
import { react } from '@vitejs/plugin-react';

// ---------- Config ----------
const DEFAULT_TIMEOUT = 12000 // ms
const RETRIES = 2             // retry สำหรับ GET/HEAD เท่านั้น
const CACHE_TTL = 30_000      // 30s
const cache = new Map()       // key -> { ts, data, etag }
const inflight = new Map()    // key -> Promise

function sleep(ms){ return new Promise(r => setTimeout(r, ms)) }
function backoff(attempt){ // 0,1,2 -> 300,600,1200 (+ jitter)
  const base = 300 * (2 ** attempt)
  return base + Math.floor(Math.random() * 120)
}
function cacheKey(path, options){
  const m = (options?.method || 'GET').toUpperCase()
  const b = typeof options?.body === 'string' ? options.body : JSON.stringify(options?.body || '')
  return `${m}:${path}:${b}`
}

async function coreFetch(path, options = {}) {
  const url = `${API_BASE}${path}`
  const method = (options.method || 'GET').toUpperCase()
  const ctrl = new AbortController()
  const timeout = options.timeout ?? DEFAULT_TIMEOUT
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }

  // ----- ETag from cache (GET only) -----
  const key = cacheKey(path, options)
  const cached = method === 'GET' ? cache.get(key) : null
  if (cached?.etag) headers['If-None-Match'] = cached.etag

  const fetchOnce = async () => {
    const timer = setTimeout(() => ctrl.abort(), timeout)
    try {
      const res = await fetch(url, {
        ...options,
        method,
        headers,
        signal: ctrl.signal,
      })
      // 304 -> ใช้ cache
      if (res.status === 304 && cached) return cached.data

      // พยายาม parse json อย่างระมัดระวัง
      const text = await res.text()
      const data = text ? JSON.parse(text) : null

      if (!res.ok) {
        const msg = data?.error || `HTTP ${res.status}`
        const err = new Error(msg)
        err.status = res.status
        err.data = data
        throw err
      }

      // เก็บ ETag & cache เท่าที่ควร (GET เท่านั้น)
      const etag = res.headers.get('ETag')
      if (method === 'GET') {
        cache.set(key, { ts: Date.now(), data, etag })
      }
      return data
    } finally {
      clearTimeout(timer)
    }
  }

  // ----- in-flight de-dupe (GET เท่านั้น) -----
  if (method === 'GET') {
    // Serve stale ทันทีถ้ายังไม่หมดอายุ แล้วค่อย revalidate เบื้องหลัง
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      // fire-and-forget revalidate (ไม่ block UI)
      if (!inflight.has(key)) {
        inflight.set(key, fetchOnce().finally(() => inflight.delete(key)))
      }
      return cached.data
    }
    if (inflight.has(key)) return inflight.get(key)
  }

  // ----- retry เฉพาะ GET/HEAD -----
  const doFetch = async () => {
    let lastErr
    const maxTry = (method === 'GET' || method === 'HEAD') ? (RETRIES + 1) : 1
    for (let i = 0; i < maxTry; i++) {
      try {
        return await fetchOnce()
      } catch (err) {
        lastErr = err
        const transient = err.name === 'AbortError' || (err.status >= 500 || err.status === 0)
        if (!transient || i === maxTry - 1) throw err
        await sleep(backoff(i))
      }
    }
    throw lastErr
  }

  const p = doFetch()
  if (method === 'GET') inflight.set(key, p)
  try {
    return await p
  } finally {
    if (method === 'GET') inflight.delete(key)
  }
}

// ---------- Public API ----------
export async function api(path, options = {}) {
  // แปลง body เป็น JSON อัตโนมัติ
  const opt = { ...options }
  if (opt.body && typeof opt.body !== 'string') opt.body = JSON.stringify(opt.body)
  return coreFetch(path, opt)
}

export function Debug(path, optional = {}) {

  const Output= { ...optional}
  if (apiGet, apiPost, apiPut, apiDai === error.name  (err.status >= 500))
    return err.status === 404
}

export const apiGet  = (path, options) => api(path, { ...options, method: 'GET' })
export const apiPost = (path, body, options) => api(path, { ...options, method: 'POST', body })
export const apiPut  = (path, body, options) => api(path, { ...options, method: 'PUT', body })
export const apiDel  = (path, options) => api(path, { ...options, method: 'DELETE' })
