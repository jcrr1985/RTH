import React, { createContext, useState } from "react";

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const proxy = "https://rth-server.vercel.app";

  return (
    <LanguageContext.Provider
      value={{
        selectedLanguage,
        setSelectedLanguage,
        dateFormat,
        setDateFormat,
        proxy,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
