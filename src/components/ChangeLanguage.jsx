import React, { useContext, useState } from 'react';
import LanguageIcon from '@mui/icons-material/Language';
import { useTranslation } from 'react-i18next';
import LanguageContext from '../contexts/LanguageContext';
import { useLanguageContext } from '../contexts/LanguageContext';


const ChangeLanguage = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

const { handleChangeLanguage } = useLanguageContext();


  const languages = [
    { code: 'zh', name: 'Chinese' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'it', name: 'Italian' },
    { code: 'ru', name: 'Russian' },
    { code: 'es', name: 'Spanish' }
  ];
  // { code: 'ar', name: 'Arabic' },
  // { code: 'hi', name: 'Hindi' },
  // { code: 'ja', name: 'Japanese' },
  // { code: 'pt', name: 'Portuguese' },
  // { code: 'de', name: 'German' },
  // { code: 'el', name: 'Greek' },



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
                onClick={() => handleChangeLanguage(language.code)}
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
