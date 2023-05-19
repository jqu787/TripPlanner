import { CssBaseline, Container, Typography, Link } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { theme, drawerWidth, headerHeight } from '../../constants';
import Header from '../../sharedComponents/Header';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import socket from '../../sharedComponents/Socket';
import { Puff } from 'react-loading-icons';

function TripConfirm(props) {
    const location = useLocation();
    const navigate = useNavigate()
    // TODO: Use sockets to deliver status asynchronously

    useEffect(() => {
      setTimeout(() => {
        navigate('/trips')
      }, location.state.timeout)
    }, [])

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Header text={'Create Trip'} type='create' />
        <Container
          maxWidth='md'
          sx={{ 
            mt: `${headerHeight}px`,
            pt: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Puff 
            stroke={(location.state.error === null || location.state.error === '') ? theme.palette.secondary.main : theme.palette.error.main} 
            strokeOpacity={.125} 
            speed={.75} 
            height='70px'
            width='70px'
          />
          {(location.state.error === null || location.state.error === '')
            ? <Typography variant='h5' mt='25px'>Creating trip... </Typography>
            : <Typography variant='h5' mt='25px' color='error'>Unable to create trip, redirecting... </Typography>
          }
          <Typography variant='body2' mt='25px'>
            If you are not redirected automatically, please click&nbsp; 
            <Link href='/trips'>here</Link>. 
          </Typography>
        </Container>
      </ThemeProvider>
    )
}

export default TripConfirm;