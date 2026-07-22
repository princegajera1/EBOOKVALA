import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import './index.css'

// Handle Vite deployment / chunk load errors automatically by refreshing the client
window.addEventListener('vite:preloadError', () => {
  console.warn('New deployment detected (preload error). Reloading page to fetch latest code...');
  window.location.reload();
});

window.addEventListener('error', (e) => {
  if (e.message && (
    e.message.includes('Failed to fetch dynamically imported module') || 
    e.message.includes('error loading dynamically imported module')
  )) {
    console.warn('Dynamic chunk load failed. Reloading page...');
    window.location.reload();
  }
}, true);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
