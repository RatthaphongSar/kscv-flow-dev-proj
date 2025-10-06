// backend/src/services/safety/redact.js
export function redactPII(text) {
  if (!text) return text
  let out = text
  out = out.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[email]')
  out = out.replace(/(?:\+?66|0)\d{8,9}\b/g, '[phone]')
  out = out.replace(/\b\d{13}\b/g, '[id]')
  return out
}
