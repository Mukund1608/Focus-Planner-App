import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import SuperTokens from "supertokens-auth-react";
import { SuperTokensConfig } from "./config";
import "./App.css";
import App from "./App.tsx";

// Initialize SuperTokens
SuperTokens.init(SuperTokensConfig);

// Register service worker for background notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration);
        
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission();
        }
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
