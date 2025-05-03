import React, { createContext, useContext, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import useThemeStorage from '../hooks/useThemeStorage';
import { theme as baseTheme } from './theme';

const ThemeContext = createContext();

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
};

const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useThemeStorage('light');

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        ...baseTheme,
        palette: {
          mode,
          ...baseTheme.palette,
          background: {
            default: mode === 'light' ? '#f5f5f5' : '#121212',
            paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
          },
          admin: baseTheme.palette.admin,
          text: {
            primary: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : '#ffffff',
            secondary: mode === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)',
            disabled: mode === 'light' ? 'rgba(0, 0, 0, 0.38)' : 'rgba(255, 255, 255, 0.5)',
          },
          action: {
            active: mode === 'light' ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.7)',
            hover: mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
            selected: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.16)',
          },
        },
        components: {
          ...baseTheme.components,
          MuiPaper: {
            ...baseTheme.components.MuiPaper,
            styleOverrides: {
              ...baseTheme.components.MuiPaper.styleOverrides,
              root: {
                ...baseTheme.components.MuiPaper.styleOverrides.root,
                backgroundImage: 'none',
                backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
              },
            },
          },
          MuiTableHead: {
            styleOverrides: {
              root: {
                '& .MuiTableCell-head': {
                  fontWeight: 600,
                  backgroundColor: baseTheme.palette.admin.main,
                  color: baseTheme.palette.admin.contrastText,
                },
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;