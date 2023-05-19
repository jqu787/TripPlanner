import { useState } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { theme, drawerWidth, headerHeight, margin } from '../constants'
import { useNavigate } from "react-router-dom";
import tempAvatar from '../resources/1.jpg'

function Header(props) {

  const navigate = useNavigate(); 

  const navLogout = () => {
    navigate('/logout');
  };

  const renderAppBar = () => {
    switch (props.type) {
      case 'create':
        return (
          <AppBar
            position='fixed'
            sx={{ 
              height: `${headerHeight}px`,
              bgcolor: theme.palette.secondary.main,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Toolbar 
              sx={{
                mt: '50px', 
                width: '100%',
                maxWidth: '900px',
                height: '64px',
              }}>
                <Typography variant='h5'>
                  {props.text}
                </Typography>
            </Toolbar>
          </AppBar>
        );
      default:
        return (
          <AppBar
            position='fixed'
            sx={{ 
              width: `calc(100% - ${drawerWidth}px)`, 
              ml: `${drawerWidth}px`,
              height: `${headerHeight}px`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Toolbar 
              disableGutters
              sx={{
                px: `${margin}px`,
                height: '64px',
                width: '100%',
                maxWidth: '1200px',
                mt: '50px',
                display: 'flex',
                justifyContent: 'space-between',
              }}>
              <Typography variant='h5'>
                {props.text}
              </Typography>
              <IconButton onClick={handleClick}>
                <Avatar src={tempAvatar} />
              </IconButton>
            </Toolbar>
          </AppBar>
        );
    }
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <ThemeProvider theme={theme}>
      {renderAppBar()}
      <Menu
        anchorEl={anchorEl}
        id='account-menu'
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleClose}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main }} /> Profile
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main }} /> My account
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleClose}>
          <ListItemIcon sx={{ color: theme.palette.primary.main }}>
            <PersonAdd fontSize="small" />
          </ListItemIcon>
          Add another account
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon sx={{ color: theme.palette.primary.main }}>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={navLogout}>
          <ListItemIcon sx={{ color: theme.palette.primary.main }}>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </ThemeProvider>
  );
}

export default Header;