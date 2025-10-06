// backend/src/services/eval/scorer.js
export function scoreAnswer({ question, answer, sources }) {
  const lowInfo = !answer || answer.length < 5
  const hasApology = /ไม่ทราบ|ขออภัย/i.test(answer)
  const sourced = Array.isArray(sources) && sources.length > 0
  const ok = !lowInfo && (!hasApology || sourced)
  return { ok, signals: { lowInfo, hasApology, sourced } }
}
