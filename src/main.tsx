import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/manrope';
import '@fontsource-variable/fraunces/opsz.css';
import '@fontsource-variable/fraunces/opsz-italic.css';
import './index.css';
import App from './App';
import { reloadOnce } from './lib/recover';

// A tab opened before a new version was published cannot load that old version's code chunks any more.
// Vite reports the failed import here: reload once to pick up the new version.
window.addEventListener('vite:preloadError', (event) => {
  if (reloadOnce()) event.preventDefault();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
