import { api } from '../utils/api';

export const AssistantAPI = {
  status() {
    return api('/assistant/status');
  },
  chat({ message, userId, roomId, roomName, signal }) {
    return api('/assistant/chat', {
      method: 'POST',
      body: { message, userId, roomId, roomName },
      signal
    });
  },
  getHistory({ roomId, before }) {
    return api(`/assistant/history?roomId=${roomId}${before ? `&before=${before}` : ''}`);
  },
  deleteMessage({ messageId }) {
    return api(`/assistant/message/${messageId}`, {
      method: 'DELETE'
    });
  }
};
