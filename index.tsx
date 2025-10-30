import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MonsterProvider } from './components/MonsterProvider';
import { MagicItemProvider } from './components/MagicItemProvider';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <MonsterProvider>
      <MagicItemProvider>
        <App />
      </MagicItemProvider>
    </MonsterProvider>
  </React.StrictMode>
);