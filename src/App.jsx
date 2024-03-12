import "normalize.css";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ErrorPage from "./components/ErrorPage";
import Test from "./components/Test";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import store from "./redux/store";

function App() {
  const { t } = useTranslation();
  const [countryInAmworld, setCountryInAmworld] = useState("");

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Router>
          <Routes>
            <Route path="/" element={<Test />}></Route>
            <Route path="/Test" element={<Test />}></Route>
            <Route path="*" element={<ErrorPage />}></Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
