import { createTheme } from '@mui/material/styles';

// Common colors
const colors = {
  green: {
    main: '#2E7D32',
    light: '#81C784',
    dark: '#1B5E20',
    contrastText: '#FFFFFF',
  },
  beige: {
    main: '#F5F5DC',
    light: '#FFFFFF',
    dark: '#E6E6CE',
    contrastText: '#263238',
  },
  yellow: {
    main: '#FBC02D',
    light: '#FDD835',
    dark: '#F9A825',
    contrastText: '#263238',
  },
  brown: {
    main: '#6D4C41',
    light: '#8D6E63',
    dark: '#5D4037',
    contrastText: '#FFFFFF',
  },
  blue: {
    main: '#4FC3F7',
    light: '#81D4FA',
    dark: '#29B6F6',
    contrastText: '#263238',
  },
  leaf: {
    main: '#81C784',
    light: '#A5D6A7',
    dark: '#66BB6A',
    contrastText: '#263238',
  },
  text: {
    primary: '#263238',
    secondary: '#757575',
  },
  admin: {
    main: '#2E7D32',
    light: '#81C784',
    dark: '#1B5E20',
    contrastText: '#FFFFFF',
  }
};

export const theme = createTheme({
  palette: {
    primary: colors.green,
    secondary: colors.yellow,
    admin: colors.admin,
    background: {
      default: colors.beige.main,
      paper: colors.beige.light,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', sans-serif",
    h1: {
      fontWeight: 600,
      fontSize: '2.5rem',
      color: colors.text.primary,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      color: colors.text.primary,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      color: colors.text.primary,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: colors.text.primary,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: colors.text.primary,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      color: colors.text.primary,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    body1: {
      color: colors.text.secondary,
    },
    body2: {
      color: colors.text.secondary,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 24px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease',
          background: colors.beige.light,
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, ${colors.green.main}, ${colors.green.dark})`,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 600,
            backgroundColor: colors.green.main,
            color: colors.green.contrastText,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '12px 16px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'transform 0.2s ease',
          '&:hover': {
            transform: 'scale(1.1)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          padding: 8,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.25rem',
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          '&.MuiChip-colorPrimary': {
            backgroundColor: colors.leaf.main,
            color: colors.leaf.contrastText,
          },
          '&.MuiChip-colorSecondary': {
            backgroundColor: colors.yellow.main,
            color: colors.yellow.contrastText,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            },
            '&.Mui-focused': {
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
        elevation2: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
});