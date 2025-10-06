import { api } from '../utils/api';

export const AssistantAPI = {
  status() {
    return api('/assistant/status');
  },
  chat({ message, userId, roomId, roomName }) {
    return api('/assistant/chat', {
      method: 'POST',
      body: { message, userId, roomId, roomName }
    });
  }
};
