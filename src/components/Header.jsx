import React, { useContext } from 'react';
import RuntoHealth from '../assets/images/svg/RunToHealth.svg';
import { useTranslation } from 'react-i18next';
import LanguageContext from '../contexts/LanguageContext';
import ChangeLanguage from './ChangeLanguage';

import { Link } from 'react-router-dom';
import '../App.css';

export default function Header() {
  const { t } = useTranslation();
  const { selectedLanguage, setSelectedLanguage } = useContext(LanguageContext);

  const handleChangeLanguage = (languageCode) => {
    setSelectedLanguage(languageCode);
  };

  console.log('Selected Language:', selectedLanguage);

  const handleLanguageChange = (languageCode) => {
    handleChangeLanguage(languageCode);
  };

  return (
    <header>
      <div style={{ position: 'relative', top: '20px', right: '20px', left: '0.58651026vw' }}>
        <ChangeLanguage onChange={handleLanguageChange} />
      </div>
      <div className='header'>
        <div className="RHT-wrapper" style={{
          display: 'flex',
          flexFlow: 'column wrap',
          justifyContent: 'space-between',
          marginTop: '3.698630137vh',
          gap: '2vh'
        }}>
          <div className="app-icon">
            <img src={RuntoHealth} alt="baloon" style={{
              width: '33.919413919vw',
              height: '8.937728938vw',
            }} />
          </div>
          <div className="rth-info">
            <p className="header-info header-info" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {t('header.title')}<br />
              {t('header.description')}
              <a class="button_blue" href="/RequestForm" style={{ textDecoration: 'none', color: '#000', border: 'none', boxShadow: 'none' }}>
                <button className="button_blue">
                  {t('header.search')}
                </button>
              </a>
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
