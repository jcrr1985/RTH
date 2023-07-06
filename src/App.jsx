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
import { useTranslation } from 'react-i18next'
import CountryContext from './contexts/CountryContext';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import store from './redux/store';

function App() {
  const { t } = useTranslation();
  const [countryInAmworld, setCountryInAmworld] = useState('');



  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Router>
          <Routes>
            <Route path='/' element={<Onboarding setCountryInAmworld={setCountryInAmworld} countryInAmworld={countryInAmworld} />}></Route>
            <Route path='/FilterFinding' element={<FilterFinding />}></Route>
            <Route path='/LoginForm' element={<LoginForm />}></Route>
            <Route path='/Test' element={<Test />}></Route>
            <Route path='/AboutUs' element={<AboutUs />}></Route>
            <Route path='*' element={<ErrorPage />}></Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App