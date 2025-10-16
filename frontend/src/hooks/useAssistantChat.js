import { useEffect, useRef, useState } from 'react';
import { AssistantAPI } from '../services/assistant';
import { useChatSocket } from '../context/ChatSocketContext';

export function useAssistantChat({ userId, roomId, roomName }) {
  const [items, setItems] = useState([]);           // {id, role, text, ts, seen}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const socket = useChatSocket();
  const inflightRef = useRef(false);

  useEffect(() => {
    if (!roomId) return;
    
    // Join room
    socket.joinRoom(roomId);

    // Listen for new messages
    const removeMessageHandler = socket.on('chat:message', (message) => {
      setItems(prev => [...prev, {
        ...message,
        id: message.id || crypto.randomUUID(),
        ts: message.ts || Date.now(),
        seen: false
      }]);
      setLoading(false);
      inflightRef.current = false;
    });

    // Listen for typing indicator
    const removeTypingHandler = socket.on('chat:typing', ({ userId: typingUserId, isTyping }) => {
      if (typingUserId !== userId) {
        // TODO: handle typing indicator if needed
      }
    });

    // Listen for seen status
    const removeSeenHandler = socket.on('chat:seen', ({ messageId }) => {
      setItems(prev => prev.map(m => 
        m.id === messageId ? { ...m, seen: true } : m
      ));
    });

    return () => {
      socket.leaveRoom(roomId);
      removeMessageHandler();
      removeTypingHandler();
      removeSeenHandler();
    };
  }, [roomId, socket, userId]);

  async function send(text) {
    if (!text?.trim()) return;
    if (inflightRef.current) return; // prevent rapid clicks
    inflightRef.current = true;
    setError('');

    // optimistic user message
    const userMsg = { id: crypto.randomUUID(), role: 'user', text, ts: Date.now() };
    setItems(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // Send via socket
      socket.emit('chat:message', {
        roomId,
        message: text,
        userId,
        messageId: userMsg.id
      });
    } catch (e) {
      setError(e.message || 'ส่งไม่สำเร็จ');
      // mark failed
      setItems(prev => prev.map(m => m.id === userMsg.id ? { ...m, failed: true } : m));
      setLoading(false);
      inflightRef.current = false;
    }
  }

  function reset() {
    setItems([]);
    setError('');
  }

  function onTyping(isTyping) {
    socket.emitTyping(roomId, isTyping);
  }

  function seenMessage(messageId) {
    socket.emitSeen(roomId, messageId);
  }

  return { items, send, loading, error, reset, onTyping, seenMessage };
}
