import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import { router } from './routes';
import '@/styles/globals.css';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="kvc-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;