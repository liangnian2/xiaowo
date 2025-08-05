import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from 'sonner';
import App from "./App.tsx";
  import "./index.css";

  // 注册Service Worker以支持离线功能
  if ('serviceWorker' in navigator) {
    // 等待页面加载完成后再注册Service Worker
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registered successfully:', registration.scope);
        })
        .catch(err => {
          console.error('ServiceWorker registration failed:', err);
        });
    });
  }

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster />
    </BrowserRouter>
  </StrictMode>
);
