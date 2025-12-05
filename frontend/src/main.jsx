// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ChatSocketProvider } from './context/ChatSocketContext'
import "./styles/index.css";

// Development mode: Auto-login with test teacher credentials
if (!localStorage.getItem('access_token') && import.meta.env.MODE === 'development') {
  // This will trigger auto-login in AuthContext during mount
  localStorage.setItem('_DEV_AUTOLOAD_TEACHER', 'true');
  console.log('✓ Development mode: Will attempt auto-login with teacher credentials');
}

// เพิ่ม future flags สำหรับ React Router v7
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter {...router}>
      <AuthProvider>
        <ChatSocketProvider>
          <App />
        </ChatSocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)