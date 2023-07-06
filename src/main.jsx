import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { LanguageProvider } from './contexts/LanguageContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

ReactDOM.render(
  <React.StrictMode>
    <LanguageProvider>
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </LanguageProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
