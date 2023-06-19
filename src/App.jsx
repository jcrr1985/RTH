import 'normalize.css'
import './App.css'
import { Onboarding } from './components/Onboarding'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ErrorPage from './components/ErrorPage'
import LoginForm from './components/LoginForm'
import Test from './components/Test'
import AboutUs from './components/AboutUs'
import FilterFinding from './components/FilterFinding'
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { useTranslation } from 'react-i18next';

import LanguageContext from './contexts/LanguageContext';
import { useState } from 'react';

function App() {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleChangeLanguage = (languageCode) => {
    console.log('languageCode desde App.jsx', languageCode)
    setSelectedLanguage(languageCode);
  };

  return (
    <ThemeProvider theme={theme}>
      <LanguageContext.Provider value={{ selectedLanguage, handleChangeLanguage }}>

        <Router>
          <Routes>
            <Route path='/' element={<Onboarding />}></Route>
            <Route path='/RequestForm' element={<Test />}></Route>
            <Route path='/FilterFinding' element={<FilterFinding />}></Route>
            <Route path='/LoginForm' element={<LoginForm />}></Route>
            <Route path='/Test' element={<Test />}></Route>
            <Route path='/AboutUs' element={<AboutUs />}></Route>
            <Route path='*' element={<ErrorPage />}></Route>
          </Routes>
        </Router>
      </LanguageContext.Provider>
    </ThemeProvider>
  );
}

export default App