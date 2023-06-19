  import React, { createContext, useState } from 'react';

  const LanguageContext = createContext();

  export const LanguageProvider = ({ children }) => {
    const [selectedLanguage, setSelectedLanguage] = useState('en');

    const handleChangeLanguage = (languageCode) => {
      setSelectedLanguage(languageCode);
      console.log(languageCode);
    };

    return (
      <LanguageContext.Provider value={{ selectedLanguage, handleChangeLanguage }}>
        {children}
      </LanguageContext.Provider>
    );
  };

  export const useLanguageContext = () => React.useContext(LanguageContext);


  export default LanguageContext;
