import React, { useState } from 'react';
import LanguageIcon from '@mui/icons-material/Language';
import { useTranslation } from 'react-i18next';

const ChangeLanguage = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectLanguage = (language) => {
    i18n.changeLanguage(language);
    setIsOpen(false);
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Russian' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' }
  ];

  return (
    <div style={{ position: 'relative', display: 'inline-block', alignItems: 'center' }}>
      <LanguageIcon fontSize="large" onClick={() => setIsOpen(!isOpen)} />

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: 0,
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '4px',
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
            zIndex: 9
          }}
        >
          <ul style={{ textAlign: 'center', padding: '4px', margin: '4px', fontSize: 'initial' }}>
            {languages.map((language) => (
              <li
                key={language.code}
                onClick={() => handleSelectLanguage(language.code)}
                style={{
                  cursor: 'pointer',
                  fontWeight: i18n.language === language.code ? 'bold' : 'normal'
                }}
              >
                {language.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ChangeLanguage;
