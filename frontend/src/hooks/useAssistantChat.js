import { useRef, useState } from 'react';
import { AssistantAPI } from '../services/assistant';

export function useAssistantChat({ userId, roomId, roomName }) {
  const [items, setItems] = useState([]);           // {id, role, text, ts}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef(null);
  const inflightRef = useRef(false);

  async function send(text) {
    if (!text?.trim()) return;
    if (inflightRef.current) return; // กันกดรัว
    inflightRef.current = true;
    setError('');

    // optimistic user message
    const userMsg = { id: crypto.randomUUID(), role: 'user', text, ts: Date.now() };
    setItems(prev => [...prev, userMsg]);
    setLoading(true);

    abortRef.current?.abort?.();
    const ctl = new AbortController();
    abortRef.current = ctl;

    try {
      const res = await AssistantAPI.chat({ message: text, userId, roomId, roomName, signal: ctl.signal });
      const botMsg = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: res?.reply || '…',
        ts: Date.now(),
      };
      setItems(prev => [...prev, botMsg]);
    } catch (e) {
      setError(e.message || 'ส่งไม่สำเร็จ');
      // mark failed
      setItems(prev => prev.map(m => m.id === userMsg.id ? { ...m, failed: true } : m));
    } finally {
      setLoading(false);
      inflightRef.current = false;
    }
  }

  function reset() { setItems([]); setError(''); }

  return { items, send, loading, error, reset };
}
