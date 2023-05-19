import { 
    CssBaseline,
    Container,
    Typography,
  } from '@mui/material';
import { Puff } from 'react-loading-icons';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import { theme, drawerWidth, headerHeight, gridOffset, margin } from '../constants';
import Header from '../sharedComponents/Header';
import Navbar from '../sharedComponents/Navbar';

  function Loading(props) {
    function capitalize(str) {
      if (str === 'trip details') {
        return 'Trip Details';
      }
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Navbar />
        <Header text={capitalize(props.type)} type={props.type} />
        <Container
          disableGutters
          maxWidth={false}
          sx={{ 
            mt: `${headerHeight}px`,
            ml: `${drawerWidth}px`,
            pt: '200px',
            width: `calc(100% - ${drawerWidth}px)`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Puff 
            stroke={theme.palette.primary.main} 
            strokeOpacity={.125} 
            speed={.75} 
            height='70px'
            width='70px'
          />
          <Typography variant='h5' mt='25px'>{`Loading ${props.type}...`}</Typography>
        </Container>
      </ThemeProvider>
    );
  }

  export default Loading;