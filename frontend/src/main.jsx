// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ChatSocketProvider } from './context/ChatSocketContext'
import "./styles/index.css";

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