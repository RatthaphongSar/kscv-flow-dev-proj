export interface User {
  id: string;
  name: string;
  role?: string;
  avatar?: string | null;
  status?: 'online' | 'offline' | 'away';
}

export interface Attachment {
  id: string;
  filename: string;
  size: string;
  type: string;
}

export interface Note {
  id: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  text: string;
  done: boolean;
}

export type MessageType = 'text' | 'file';

export interface Mention {
  id: string;
  index: number; // position in text
  length: number;
  userId: string;
  name: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text?: string;
  createdAt: string;
  type?: MessageType;
  attachment?: Attachment | null;
  mentions?: Mention[]; // array of @mentions in this message
}

export interface Conversation {
  id: string;
  participants: string[]; // user ids
  title: string;
  lastMessage?: string;
  lastAt?: string;
  unread?: number;
}

// Mock users
export const users: User[] = [
  { id: 'u1', name: 'Mohammad Ali', role: 'Student', avatar: null, status: 'online' },
  { id: 'u2', name: 'Suda Chan', role: 'Teacher', avatar: null, status: 'online' },
  { id: 'u3', name: 'Nicha Phon', role: 'Student', avatar: null, status: 'offline' },
  { id: 'me', name: 'You', role: 'Student', avatar: null, status: 'online' },
];

export const conversations: Conversation[] = [
  { id: 'c1', participants: ['me', 'u1'], title: 'Mohammad Ali', lastMessage: 'See you tomorrow', lastAt: '09:12 AM', unread: 2 },
  { id: 'c2', participants: ['me', 'u2'], title: 'Suda Chan', lastMessage: 'Assignment updated', lastAt: 'Yesterday', unread: 0 },
  { id: 'c3', participants: ['me', 'u3'], title: 'Nicha Phon', lastMessage: 'Where are you?', lastAt: '2 days ago', unread: 1 },
];

export const attachments: Attachment[] = [
  { id: 'a1', filename: 'lecture-notes.pdf', size: '1.2MB', type: 'pdf' },
  { id: 'a2', filename: 'homework.docx', size: '56KB', type: 'doc' },
];

export const notes: Note[] = [
  { id: 'n1', text: 'Student prefers afternoon meetings.', createdAt: new Date().toISOString() },
];

export const tasks: Task[] = [
  { id: 't1', text: 'Prepare materials for next class', done: false },
];

export const messages: Message[] = [
  { id: 'm1', conversationId: 'c1', senderId: 'u1', text: 'Hi — are you joining the study group tonight?', createdAt: new Date(Date.now()-1000*60*60*5).toISOString(), type: 'text' },
  { id: 'm2', conversationId: 'c1', senderId: 'me', text: 'Yes, I will be there at 7pm.', createdAt: new Date(Date.now()-1000*60*60*4).toISOString(), type: 'text' },
  { id: 'm3', conversationId: 'c1', senderId: 'u1', text: 'Great — see you!', createdAt: new Date(Date.now()-1000*60*60*3).toISOString(), type: 'text' },
  { id: 'm4', conversationId: 'c2', senderId: 'u2', text: 'Assignment 3 has been posted.', createdAt: new Date(Date.now()-1000*60*60*24).toISOString(), type: 'text' },
  { id: 'm5', conversationId: 'c3', senderId: 'u3', text: 'Can you help me with question 5?', createdAt: new Date(Date.now()-1000*60*60*48).toISOString(), type: 'text' },
];
