// src/utils/api.js
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4001/api';

// refresh stampede guard — ทุกแท็บ/คำขอแชร์ Promise เดียวกัน
let refreshPromise = null;

function jsonOrNull(res) {
  const ct = res.headers.get('content-type') || '';
  if (res.status === 204) return null;
  if (ct.includes('application/json')) return res.json();
  return res.text().then(t => (t?.length ? { raw: t } : null));
}

export async function api(path, options = {}) {
  // default
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = 15000, // 15s
    retryOn401 = true, // ให้รีเฟรชและรีทราย
    signal: externalSignal,
    ...rest
  } = options;

  // build request
  const finalHeaders = new Headers(headers);
  let finalBody = body;

  // Add mock auth token for testing (reads from localStorage)
  if (!finalHeaders.has('Authorization')) {
    const token = localStorage.getItem('access_token');
    if (token) {
      finalHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  if (body && !(body instanceof FormData) && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json');
  }
  if (body && finalHeaders.get('Content-Type')?.includes('application/json')) {
    finalBody = JSON.stringify(body);
  }

  // timeout
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(new Error('Request timeout')), timeout);
  if (externalSignal) {
    externalSignal.addEventListener('abort', () => ctrl.abort(externalSignal.reason));
  }

  const doFetch = () =>
    fetch(`${API_BASE}${path}`, {
      method,
      headers: finalHeaders,
      body: finalBody,
      credentials: 'include', // สำคัญ: ให้คุกกี้ติดไป-กลับ
      signal: ctrl.signal,
      ...rest,
    });

  try {
    let res = await doFetch();
    if (res.status === 401 && retryOn401) {
      // เรียก refresh แค่ครั้งเดียวทั่วแอป
      if (!refreshPromise) {
        refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        })
          .then(r => {
            refreshPromise = null;
            if (!r.ok) throw new Error('Refresh failed');
            return r.json().catch(() => ({}));
          })
          .catch((e) => {
            refreshPromise = null;
            throw e;
          });
      }
      await refreshPromise;         // รอให้รีเฟรชเสร็จ
      res = await doFetch();        // retry คำขอเดิม
    }

    clearTimeout(id);

    if (!res.ok) {
      const data = await jsonOrNull(res);
      console.log('[API Error] Status:', res.status, 'Data:', data);
      const err = new Error(data?.message || data?.error || `HTTP ${res.status}`);
      err.status = res.status;
      err.data = data;
      err.url = `${API_BASE}${path}`;
      throw err;
    }

    return await jsonOrNull(res);
  } catch (e) {
    clearTimeout(id);
    // แปลง Abort ให้ข้อความชัดเจน
    if (e.name === 'AbortError') {
      const err = new Error('Network aborted/timeout');
      err.cause = e;
      err.status = 0;
      throw err;
    }
    throw e;
  }
}

// Export convenience methods
export const apiClient = {
  get: (path, options) => api(path, { method: 'GET', ...options }),
  post: (path, body, options) => api(path, { method: 'POST', body, ...options }),
  put: (path, body, options) => api(path, { method: 'PUT', body, ...options }),
  patch: (path, body, options) => api(path, { method: 'PATCH', body, ...options }),
  delete: (path, options) => api(path, { method: 'DELETE', ...options }),
}

// Export as default for backward compatibility
export default apiClient
