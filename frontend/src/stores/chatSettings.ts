import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Theme {
  mode: 'light' | 'dark' | 'system';
  color: 'blue' | 'purple' | 'green' | 'red';
  fontSize: 'small' | 'medium' | 'large';
}

interface Privacy {
  showLastSeen: boolean;
  showProfilePhoto: 'everyone' | 'contacts' | 'none';
  showStatus: boolean;
}

interface Notifications {
  mode: 'all' | 'mentions' | 'none';
  sounds: boolean;
  desktop: boolean;
  email: boolean;
  showPreview: boolean;
  mutedUsers: string[];
  mutedGroups: string[];
}

interface ChatSettings {
  theme: Theme;
  privacy: Privacy;
  notifications: Notifications;
  language: string;
  showEmojis: boolean;
  showStickers: boolean;
  enableSpellCheck: boolean;
  enterToSend: boolean;
  messageHistory: number; // Days to keep message history
  autoDownload: {
    images: boolean;
    videos: boolean;
    documents: boolean;
    audio: boolean;
  };
}

interface ChatSettingsState extends ChatSettings {
  updateSettings: (settings: Partial<ChatSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: ChatSettings = {
  theme: {
    mode: 'system',
    color: 'blue',
    fontSize: 'medium',
  },
  privacy: {
    showLastSeen: true,
    showProfilePhoto: 'everyone',
    showStatus: true,
  },
  notifications: {
    mode: 'all',
    sounds: true,
    desktop: true,
    email: false,
    showPreview: true,
    mutedUsers: [],
    mutedGroups: [],
  },
  language: 'th',
  showEmojis: true,
  showStickers: true,
  enableSpellCheck: true,
  enterToSend: true,
  messageHistory: 30,
  autoDownload: {
    images: true,
    videos: false,
    documents: false,
    audio: false,
  },
};

export const useChatSettings = create<ChatSettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      updateSettings: (newSettings) =>
        set((state) => ({
          ...state,
          ...newSettings,
        })),

      resetSettings: () =>
        set(() => ({
          ...defaultSettings,
        })),
    }),
    {
      name: 'chat-settings',
    }
  )
);