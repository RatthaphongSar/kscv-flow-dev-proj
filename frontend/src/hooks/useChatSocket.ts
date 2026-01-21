import { useEffect } from 'react';
import { useChatStore } from '../stores/chat';
import { chatService } from '../services/chat';
import { useChatSettings } from '../stores/chatSettings';

export function useChatSocket() {
  const {
    currentRoomId,
    sendMessage,
    updateMessageStatus,
    setTyping,
    markAsRead,
  } = useChatStore();

  const { notifications } = useChatSettings();

  useEffect(() => {
    // Handle incoming messages
    const unsubscribeMessage = chatService.onMessageReceived((message) => {
      if (!currentRoomId) return;
      if (message.roomId && message.roomId !== currentRoomId) return;
      markAsRead(currentRoomId);
      chatService.updateMessageStatus(message.id, 'read');

      // Play sound if enabled
      if (
        notifications.sounds &&
        (notifications.mode === 'all' ||
          (notifications.mode === 'mentions' && message.text.includes('@me')))
      ) {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {});
      }

      // Show browser notification if enabled
      if (
        notifications.desktop &&
        (notifications.mode === 'all' ||
          (notifications.mode === 'mentions' && message.text.includes('@me')))
      ) {
        if (Notification.permission === 'granted') {
          new Notification('New Message', {
            body: message.text,
            icon: '/chat-icon.png',
          });
        }
      }
    });

    // Handle typing indicators
    const unsubscribeTypingStart = chatService.onTypingStart((roomId, userId) => {
      if (roomId === currentRoomId) {
        setTyping(roomId, true);
      }
    });

    const unsubscribeTypingStop = chatService.onTypingStop((roomId, userId) => {
      if (roomId === currentRoomId) {
        setTyping(roomId, false);
      }
    });

    // Handle message status updates
    const unsubscribeStatus = chatService.onMessageStatusUpdate((messageId, status) => {
      updateMessageStatus(messageId, status);
    });

    return () => {
      unsubscribeMessage();
      unsubscribeTypingStart();
      unsubscribeTypingStop();
      unsubscribeStatus();
    };
  }, [currentRoomId, notifications, markAsRead, setTyping]);

  // Handle file uploads
  const handleFileUpload = async (file: File) => {
    if (!currentRoomId) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', currentRoomId);

    try {
      const response = await fetch('/api/chat/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { url } = await response.json();

      sendMessage({
        id: Math.random().toString(36).substr(2, 9),
        roomId: currentRoomId,
        text: '',
        senderId: 'me',
        timestamp: Date.now(),
        status: 'sending',
        file: {
          name: file.name,
          url,
          type: file.type,
          size: file.size,
        },
      });
    } catch (error) {
      console.error('File upload failed:', error);
    }
  };

  return {
    handleFileUpload,
  };
}
