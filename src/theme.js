import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#5c85c6',
    },
    secondary: {
      main: '#dc004e',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
    success: {
      main: '#4caf50',
    },
    background: {
      default: '#fafafa',
      paper: '#fff',
    },
    text: {
      primary: '#333',
      secondary: '#666',
      disabled: '#999',
    },
    bar: {
      main: '#D9D9D9',
    },
    search: {
      main: '#5c85c6',
    },
  },
  components: {
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          backgroundColor: '#fafafa',
          borderRadius: '10px',
        },
      },
    },
    MuiDatePicker: {
      styleOverrides: {
        root: {
        },
      },
    },
    MuiButton: {
        styleOverrides: {
            root: {
                borderRadius: '10px',
            },
        },
    },
    MuiTextField: {
      styleOverrides: {
          root: {
              borderRadius: '10px',
              backgroundColor: '#fafafa',

          },
      },
  },
    // Add more styles for other input components here
  },
});

export default theme;
