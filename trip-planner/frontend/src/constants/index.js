import { ThemeProvider, createTheme } from '@mui/material/styles';

export const drawerWidth = 200;
export const headerHeight = 125;
export const gridOffset = 24;
export const margin = 35;
export const theme = createTheme({
  palette: {
    primary: {
      light: '#87A1A7',
      main: '#0E424E',
    },
    secondary: {
      main: '#4AA1B5',
    },
    text: {
      primary: '#0E424E',
    },
    error: {
      main: '#DB4437',
    }
  },
  typography: {
    fontFamily: [
      'Overpass',
      'sans-serif',
    ].join(','),
    button: {
      textTransform: 'none'
    },
    h1: {
      fontWeight: 600,
      fontSize: 24,
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          // default label color
          '& label': {
            color: '#87A1A7',
          },
          // focused label color
          '& label.Mui-focused': {
            color: '#87A1A7',
          },
          // focused color for outlined variant
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#CFD9DC',
            },
          },
          // default color for standard variant
          '& .MuiInput-underline:before': {
            borderBottomColor: '#E7EDEE',
          },
          // default background color for filled variant
          '& .MuiFilledInput-root': {
            backgroundColor: '#E7EDEE',
          },
          // default color for filled variant
          '& .MuiFilledInput-underline:before': {
            borderBottomColor: '#A5B5B8',
          },
        },
      },
    },
  },
  shadows: Array(25).fill('none'),
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      // most basic recommended timing
      standard: 300,
      // this is to be used in complex animations
      complex: 375,
      // recommended when something is entering screen
      enteringScreen: 225,
      // recommended when something is leaving screen
      leavingScreen: 195,
    },
  },
});