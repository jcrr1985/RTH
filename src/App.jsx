import 'normalize.css';
import './App.css';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import {
  AppBar, Box, Button, Container, Divider, Stack, Toolbar, Typography,
  useMediaQuery,
} from '@mui/material';

import theme from './theme';
import ErrorPage from './components/ErrorPage';
import FeedbackDialog from './components/FeedbackDialog';
import LanguageSelector from './components/LanguageSelector';
import ClinicSearch from './features/search/ClinicSearch';
import RightsWizard from './features/rights/RightsWizard';
import ValeCirurgiaChooser from './features/vale-cirurgia/ValeCirurgiaChooser';
import { LanguageProvider, useT } from './lib/i18n';

function Nav() {
  const t = useT();
  const isNarrow = useMediaQuery('(max-width:600px)');

  const items = [
    { to: '/', label: t.nav.search },
    { to: '/direitos', label: t.nav.rights },
    { to: '/vale-cirurgia', label: t.nav.vale },
  ];

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ flexWrap: 'wrap', gap: 1, rowGap: 0.5, py: 1 }}>
        <Typography
          variant="h6"
          component="span"
          sx={{ fontWeight: 700, mr: 'auto' }}
        >
          {t.appName}
        </Typography>

        {/* O seletor de idioma vem primeiro na ordem de leitura e de tabulação:
            quem precisa dele não consegue ler o resto da barra. */}
        <LanguageSelector compact={isNarrow} />
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1 }} />

        <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
          {items.map(({ to, label }) => (
            <Button
              key={to}
              component={NavLink}
              to={to}
              end={to === '/'}
              size="small"
              sx={{ '&.active': { fontWeight: 700, textDecoration: 'underline' } }}
            >
              {label}
            </Button>
          ))}
          <FeedbackDialog />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

function Footer() {
  const t = useT();
  return (
    <Box component="footer" sx={{ py: 3, px: 2, mt: 6, bgcolor: 'action.hover' }}>
      <Container maxWidth="lg">
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          {t.footer.disclaimer} {t.footer.emergency}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          {t.footer.attribution.replace('© OpenStreetMap contributors', '')}
          <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>
        </Typography>
      </Container>
    </Box>
  );
}

function Shell() {
  return (
    <BrowserRouter>
      <Nav />
      <Box component="main" sx={{ minHeight: '70vh' }}>
        <Routes>
          <Route path="/" element={<ClinicSearch />} />
          <Route path="/direitos" element={<RightsWizard />} />
          <Route path="/vale-cirurgia" element={<ValeCirurgiaChooser />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Box>
      <Footer />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider theme={theme}>
        <Shell />
      </ThemeProvider>
    </LanguageProvider>
  );
}
