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
