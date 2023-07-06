import React, { useContext, useState } from 'react';
import LanguageIcon from '@mui/icons-material/Language';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../contexts/LanguageContext';

const ChangeLanguage = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { setSelectedLanguage, setDateFormat } = useContext(LanguageContext);
  // const [runMapaMultimarker, setRunMapaMultimarker] = useState(false);

  const handleSelectLanguage = (language) => {
    console.log('language', language)
    i18n.changeLanguage(language);
    setSelectedLanguage(language);
    setDateFormat(language === 'en' ? 'MM/DD/YYYY' : 'DD/MM/YYYY');
    setIsOpen(false);
    // runMapaMultimarker(false)
  };



  const languages = [
    { code: 'zh', name: '中國人' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'it', name: 'Italiana' },
    { code: 'ru', name: 'Русский' },
    { code: 'es', name: 'Español' }
  ];

  return (
    <div style={{ position: 'relative', display: 'inline-block', alignItems: 'center', display: 'flex' }}>
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
