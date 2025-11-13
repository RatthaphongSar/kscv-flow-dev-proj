export interface ChatFile {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  roomId: string;
  timestamp: number;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  file?: ChatFile;
}

export interface ChatEventMap {
  'message:send': Message;
  'message:received': Message;
  'message:status': { messageId: string; status: Message['status'] };
  'typing:start': { roomId: string; userId: string };
  'typing:stop': { roomId: string; userId: string };
}

export type ChatEvent = keyof ChatEventMap;