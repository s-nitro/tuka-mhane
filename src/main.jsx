import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { initRouting } from './lib/router.js';
import './styles.css';

initRouting();

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Makes the app installable and usable offline (production build only).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .catch((err) => console.error('Service worker failed:', err));
  });
}
