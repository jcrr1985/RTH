import React, { useContext, useEffect, useRef, useState } from "react";
import LanguageIcon from "@mui/icons-material/Language";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "../contexts/LanguageContext";

const ChangeLanguage = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { setSelectedLanguage } = useContext(LanguageContext);

  const handleSelectLanguage = (language) => {
    i18n.changeLanguage(language);
    setSelectedLanguage(language);
    setIsOpen(false);
  };

  const languages = [
    { code: "zh", name: "中國人" },
    { code: "en", name: "English" },
    { code: "fr", name: "Français" },
    { code: "it", name: "Italiana" },
    { code: "ru", name: "Русский" },
    { code: "es", name: "Español" },
  ];

  const toggleModal = (event) => {
    event.stopPropagation();
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  const modalRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div className="change-language-container">
      <LanguageIcon fontSize="large" onClick={toggleModal} />

      {isOpen && (
        <div
          ref={modalRef}
          style={{
            position: "absolute",
            top: "3rem",
            right: "0",
            backgroundColor: "white",
            padding: "1rem",
            borderRadius: "4px",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
            zIndex: 9,
          }}
        >
          <ul
            style={{
              textAlign: "center",
              padding: "4px",
              margin: "4px",
              fontSize: "initial",
            }}
          >
            {languages.map((language) => (
              <div
                key={language.code}
                className="languages-container"
                onClick={() => handleSelectLanguage(language.code)}
              >
                <li className="languages">{language.name}</li>
              </div>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ChangeLanguage;
