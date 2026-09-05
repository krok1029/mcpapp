import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App.tsx';
import './styles.css';

const root = document.querySelector('#root');

if (!(root instanceof HTMLElement)) {
  throw new Error('McpApp UI root element is unavailable.');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
