import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      light: '#3B82F6', // Blue 500
      main: '#2563EB',  // Blue 600
      dark: '#1D4ED8',  // Blue 700
      contrastText: '#FFFFFF',
    },
    secondary: {
      light: '#94A3B8', // Slate 400
      main: '#64748B',  // Slate 500
      dark: '#475569',  // Slate 600
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#10B981', // Emerald 500
      light: '#D1FAE5',
      dark: '#047857',
    },
    warning: {
      main: '#F59E0B', // Amber 500
      light: '#FEF3C7',
      dark: '#B45309',
    },
    error: {
      main: '#EF4444', // Red 500
      light: '#FEE2E2',
      dark: '#B91C1C',
    },
    info: {
      main: '#3B82F6', // Blue 500
      light: '#DBEAFE',
    },
    background: {
      default: '#F8FAFC', // Slate 50
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A', // Slate 900 (Deep Blue/Slate)
      secondary: '#475569', // Slate 600
    },
    divider: '#E2E8F0', // Slate 200
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    h1: { fontSize: '40px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' },
    h2: { fontSize: '32px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' },
    h3: { fontSize: '24px', fontWeight: 700, color: '#0F172A' },
    h4: { fontSize: '20px', fontWeight: 600, color: '#0F172A' },
    h5: { fontSize: '18px', fontWeight: 600, color: '#0F172A' },
    h6: { fontSize: '16px', fontWeight: 600, color: '#0F172A' },
    body1: { fontSize: '16px', color: '#1E293B', lineHeight: 1.5 },
    body2: { fontSize: '14px', color: '#475569', lineHeight: 1.5 },
    subtitle1: { fontSize: '14px', fontWeight: 500 },
    subtitle2: { fontSize: '13px', fontWeight: 500 },
    caption: { fontSize: '12px', color: '#64748B' },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '14px',
      letterSpacing: '0.02em'
    },
  },
  shape: {
    borderRadius: 12, // 12px Rounded Corners for modern look
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '10px 24px', // Large click area
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', // Soft shadow on hover
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(37 99 235 / 0.2), 0 2px 4px -2px rgb(37 99 235 / 0.2)', // Colored shadow
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          }
        }
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)', // Soft shadow
          border: '1px solid #E2E8F0', // Clean borders
          padding: '8px', // Outer padding padding
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px', // Large padding
          '&:last-child': {
            paddingBottom: '24px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
          border: '1px solid #E2E8F0',
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: '1px solid #E2E8F0',
          borderRadius: 12,
          backgroundColor: '#FFFFFF',
          '& .MuiDataGrid-cell': {
            borderColor: '#F1F5F9', // Very subtle inner borders
            padding: '12px 16px',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            color: '#475569',
            fontWeight: 600,
            textTransform: 'uppercase',
            fontSize: '12px',
            letterSpacing: '0.05em'
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
          },
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            borderColor: '#F1F5F9',
            padding: '16px',
          },
          '& .MuiTableCell-head': {
            fontWeight: 600,
            color: '#475569',
            backgroundColor: '#F8FAFC',
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 6,
        },
      },
    },
  },
});

export default theme;
