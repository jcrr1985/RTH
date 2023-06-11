import 'normalize.css'
import './App.css'
import { Onboarding } from './components/Onboarding'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ErrorPage from './components/ErrorPage'
import LoginForm from './components/LoginForm'
import Test from './components/Test'
import AboutUs from './components/AboutUs'
import BookingTime from './components/BookingTime'
import FilterFinding from './components/FilterFinding'
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

function App() {

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path='/' element={<Onboarding />}></Route>
          <Route path='/RequestForm' element={<Test />}></Route>
          <Route path='/FilterFinding' element={<FilterFinding />}></Route>
          <Route path='/LoginForm' element={<LoginForm />}></Route>
          <Route path='/Test' element={<Test />}></Route>
          <Route path='/AboutUs' element={<AboutUs />}></Route>
          <Route path='/BookingTime' element={<BookingTime />}></Route>
          <Route path='*' element={<ErrorPage />}></Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App