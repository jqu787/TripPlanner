import { Box, CssBaseline, Container, Typography } from '@mui/material';
import Navbar from '../../sharedComponents/Navbar';
import Header from '../../sharedComponents/Header';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { theme, drawerWidth, headerHeight } from '../../constants'

function HomePage(props) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Navbar />
        <Header text={`Welcome, ${props.user.firstName}`} type='home' />
        <Container
          maxWidth={false}
          sx={{ 
            mt: `${headerHeight}px`,
            ml: `${drawerWidth}px`,
            width: `calc(100% - ${drawerWidth}px)`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{ 
              pt: '35px',
              pl: '35px'
            }}
          >
            <Typography variant='body1' color='primary'>
              This is your homepage! Empty for now, but check back later!
            </Typography>

            <Typography variant='body1' color='primary'>
              TODO: Add quicklinks here? eg. to trip dashboard, review finances, upload photos, etc.
            </Typography>
          </Box>
        </Container>
      </ThemeProvider>
    )
}

export default HomePage;