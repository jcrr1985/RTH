import React from 'react';
// React 18: createRoot. A v1 usava ReactDOM.render, API do React 17 que está
// descontinuada e emite aviso em consola desde o React 18.
import { createRoot } from 'react-dom/client';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
