// src/hooks/useApi.js
import { useEffect, useState } from 'react'
import { apiGet } from '../utils/api'

export function useApi(path, deps = []) {
  const [data,setData] = useState(null)
  const [error,setError] = useState(null)
  const [loading,setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true)
    apiGet(path).then(d => {
      if (alive) { setData(d); setError(null) }
    }).catch(e => {
      if (alive) setError(e)
    }).finally(() => {
      if (alive) setLoading(false)
    })
    return () => { alive = false }
  }, deps)

  return { data, error, loading }
}
