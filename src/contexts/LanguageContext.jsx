import React, { createContext, useState } from "react";

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");

  return (
    <LanguageContext.Provider
      value={{
        selectedLanguage,
        setSelectedLanguage,
        dateFormat,
        setDateFormat,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
