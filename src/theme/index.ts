import { createTheme, Theme } from '@mui/material/styles';

export const getTheme = (mode: 'light' | 'dark'): Theme =>
  createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            background: {
              default: '#f5f5f5',
              paper: '#ffffff',
            },
            primary: {
              main: '#1976d2',
            },
            secondary: {
              main: '#9c27b0',
            },
          }
        : {
            // Dark mode palette
            background: {
              default: '#121212',
              paper: '#1e1e1e',
            },
            primary: {
              main: '#90caf9',
            },
            secondary: {
              main: '#ce93d8',
            },
          }),
    },
    typography: {
      fontFamily: 'Roboto, sans-serif',
    },
  });
