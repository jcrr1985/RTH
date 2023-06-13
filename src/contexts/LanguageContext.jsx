import React, { createContext, useState } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleChangeLanguage = (languageCode) => {
    setSelectedLanguage(languageCode);
  };

  return (
    <LanguageContext.Provider value={{ selectedLanguage, handleChangeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
