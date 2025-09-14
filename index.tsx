import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './contexts/AppContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);

// Register the service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // In certain sandboxed environments, relative paths like '/sw.js' can be resolved
    // against an incorrect origin (e.g., 'https://ai.studio'). To prevent this
    // cross-origin error, we construct an absolute URL for the service worker script
    // using `window.location.origin`, ensuring it's always loaded from the correct domain.
    const swUrl = `${window.location.origin}/sw.js`;
    
    navigator.serviceWorker.register(swUrl)
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}
