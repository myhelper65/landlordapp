import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      light: '#FDE68A', // amber-200
      main: '#D97706',  // amber-600
      dark: '#B45309',  // amber-700
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#1C1917',  // stone-900 (deep charcoal)
      light: '#44403C', // stone-700
      dark: '#0C0A09',  // stone-950
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FAFAF9', // stone-50 (warm off-white)
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1C1917', // stone-900
      secondary: '#57534E', // stone-600
    },
    success: {
      main: '#15803D',
      light: '#F0FDF4',
    },
    warning: {
      main: '#D97706',
      light: '#FFFBEB',
    },
    error: {
      main: '#B91C1C',
      light: '#FEF2F2',
    },
    info: {
      main: '#0369A1',
      light: '#F0F9FF',
    },
    divider: '#E7E5E4', // stone-200
  },
    typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, color: '#1C1917' },
    h2: { fontWeight: 700, color: '#1C1917' },
    h3: { fontWeight: 700, color: '#1C1917' },
    h4: { fontWeight: 600, color: '#1C1917' },
    h5: { fontWeight: 600, color: '#1C1917' },
    h6: { fontWeight: 600, color: '#1C1917' },
    body1: { color: '#1C1917' },
    body2: { color: '#57534E' },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          backgroundColor: '#D97706', // amber-600
          '&:hover': {
            backgroundColor: '#B45309', // amber-700
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Remove elevation background overlay
        },
        elevation1: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: '1px solid #E7E5E4',
          borderRadius: 8,
          backgroundColor: '#FFFFFF',
          '& .MuiDataGrid-cell': {
            borderColor: '#E7E5E4',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#FAFAF9',
            borderBottom: '1px solid #E7E5E4',
            color: '#57534E',
            fontWeight: 600,
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '1px solid #E7E5E4',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;
