import { useState } from "react";
import { Navigate } from "react-router-dom";
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import FlightIcon from '@mui/icons-material/Flight';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { theme, drawerWidth } from '../../constants';
import { Card, CardContent } from "@mui/material";

const LoginRegisterPage = (props) => {

  const isRegisterForm = props.register;

  const [errorMessage, setErrorMessage] = useState("");

  const submitForm = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const formValues = {};
    for (const key of data.keys()) {
      formValues[key] = data.get(key);
    }

    if (isRegisterForm)
      register(formValues);
    else
      login(formValues);
    
  }

  const register = async (formValues) => {
    formValues.fullName = formValues.firstName +" "+formValues.lastName;
    formValues.fullName = formValues.fullName.toLowerCase();
    formValues.trips = [];
    formValues.friendRequests = [];
    formValues.friends = [];

    if (formValues.confirmPassword !== formValues.password)
      return setErrorMessage("Passwords do not match.")
    delete formValues.confirmPassword;

    const res = await fetch("http://localhost:5000/api/users/register", {
      method: 'POST',
      credentials: 'include', 
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Credentials': true
      },
      redirect: 'follow',
      body: JSON.stringify(formValues) 
    });
    const resObj = await res.json();
    if (resObj.err)
      setErrorMessage(resObj.msg);
    else {
      window.sessionStorage.setItem('user', JSON.stringify(resObj.user));
      props.setUser(resObj.user);
    }
  }

  const login = async (formValues) => {
    const res = await fetch("http://localhost:5000/api/users/login", {
      method: 'POST',
      credentials: 'include', 
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Credentials': true
      },
      redirect: 'follow',
      body: JSON.stringify(formValues) 
    });
    const resObj = await res.json();
    if (resObj.err)
      setErrorMessage(resObj.msg);
    else {
      window.sessionStorage.setItem('user', JSON.stringify(resObj.user));
      props.setUser(resObj.user);
    }
  }


  if (props.user) {
    return <Navigate to="/" />
  }

  const renderLoginRegister = () => {
    if (!isRegisterForm) {
      return (
        <Box
          sx={{
            marginTop: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <FlightIcon sx={{ color: '#4AA1B5', fontSize: 72 }}/>
          <Box component="form" onSubmit={submitForm} noValidate sx={{ mt: 4 }}>
            <Typography color='error'>
              {errorMessage}
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              endIcon={<FlightTakeoffIcon />}
              sx={{ mt: 3, mb: 2 }}
            >
              <Typography 
                variant='body2' 
                sx={{
                  mt: '3px',
                  color: 'white',
                }}
              >
                Sign In
              </Typography>
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="/login" variant="body2" underline='hover'>
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="/register" variant="body2" underline='hover'>
                  {"Create account"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      );
    } else {
      return (
        <Box
          sx={{
            marginTop: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <FlightIcon sx={{ color: '#4AA1B5', fontSize: 72 }}/>
          <Box component="form" onSubmit={submitForm} noValidate sx={{ mt: 4 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography color='#DB4437'>
                  {errorMessage}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              <Typography 
                variant='body2' 
                sx={{
                  mt: '3px',
                  color: 'white',
                }}
              >
                Create Account
              </Typography>
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/login" variant="body2" underline="hover">
                  Sign in instead
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth='xs'>
        {renderLoginRegister()}
      </Container>
    </ThemeProvider>
  )
}

export default LoginRegisterPage;