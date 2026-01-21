import { createBrowserRouter } from 'react-router-dom';
import ChatPage from '@/pages/Chat';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ChatPage />,
  },
]);
