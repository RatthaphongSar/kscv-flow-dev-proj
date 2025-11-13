import { createBrowserRouter } from 'react-router-dom';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { ChatWindow } from '@/components/chat/ChatWindow';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ChatLayout />,
    children: [
      {
        path: 'chat/:id',
        element: <ChatWindow />,
      },
    ],
  },
]);