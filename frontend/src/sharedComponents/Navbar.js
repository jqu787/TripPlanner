import { 
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
 } from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CardTravelIcon from '@mui/icons-material/CardTravel';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import HomeIcon from '@mui/icons-material/Home';
import { ReactComponent as AppIcon } from '../resources/home.svg';
import { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { theme, drawerWidth } from '../constants'
import { useNavigate } from "react-router-dom";

function Navbar(props) {
  const navigate = useNavigate(); 

  const navHome = () =>{ 
    navigate('/');
    window.sessionStorage.setItem('selected', 'Home');
    setSelected('Home')
  }

  const navTrips = () =>{ 
    navigate('/trips');
    window.sessionStorage.setItem('selected', 'Trips');
    setSelected('Trips')
  }

  const navFinances = () =>{
    navigate('/finances');
    window.sessionStorage.setItem('selected', 'Finances');
    setSelected('Finances')
  }

  const navFriends = () => {
    navigate('/friends');
    window.sessionStorage.setItem('selected', 'Friends');
    setSelected('Friends')
  }

  const navPhotos = () => {
    navigate('/photos');
    window.sessionStorage.setItem('selected', 'Photos');
    setSelected('Photos')
  }

  const buttons = ['Trips', 'Finances', 'Photos', 'Friends'];
  const icons = [<CardTravelIcon />, <CreditCardIcon />, <PhotoLibraryIcon />, <PeopleAltIcon />];
  const actions = [navTrips, navFinances, navPhotos, navFriends];

  const [selected, setSelected] = useState(window.sessionStorage.getItem('selected') ? window.sessionStorage.getItem('selected') : 'Trips');

  return (
    <ThemeProvider theme={theme}>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant='permanent'
        anchor='left'
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%'
          }}
        >
          <List>
            <ListItem onClick={() => navHome()} >
              <ListItemButton 
                disableRipple 
                disableGutters
                sx={{
                  ml: 1,
                  mb: 2,
                  '&.MuiButtonBase-root:hover': {
                    bgcolor: 'transparent'
                  }
                }}
              >
                <AppIcon />
              </ListItemButton>
            </ListItem>
            {buttons.map((text, index) => (
              <ListItem 
                disablePadding 
                onAnimationEnd={() => actions[index]()}
                key={index}
              >
                <ListItemButton>
                  <ListItemIcon
                    sx={{
                      ml: 1,
                      minWidth: '40px',
                      color: selected == text ? theme.palette.primary.main : theme.palette.primary.light
                    }}
                  >
                    {icons[index]}
                  </ListItemIcon>
                  <ListItemText
                    primary={text} 
                    primaryTypographyProps={{
                      fontWeight: selected == text ? 600 : 500,
                      color: selected == text ? theme.palette.primary.main : theme.palette.primary.light
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </ThemeProvider>
  )
};

export default Navbar;