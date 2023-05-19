import { 
  Box,
  Card,
  Grid,
  Container,
  Collapse,
  Fab,
  Skeleton,
  Stack,
  CardActions,
  TextField,
  Button,
  IconButton,
  Select,
  MenuItem,
  CssBaseline, 
  FormControl, 
  Typography, 
  InputLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  FormData,
  CardActionArea,
  CardContent,
  Icon,
  Divider,
  Toolbar,
} from '@mui/material';
import Scrollbars from 'react-custom-scrollbars-2';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Header from '../../sharedComponents/Header';
import React, { Link, useState, useEffect } from 'react';
import { theme, gridOffset, headerHeight, margin } from '../../constants'
import FriendCard from '../../sharedComponents/FriendCard';
import Navbar from '../../sharedComponents/Navbar';
import Loading from '../../sharedComponents/Loading';

function FriendsPage(props) {
    const drawerWidth = 200;
    const [errorMessage, setErrorMessage] = useState("");
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
      getFriends();
      getFriendRequests();
      setTimeout(() => {
        setLoaded(true);
      }, 1000);
    }, []);

    async function getFriends() {
      const res = await fetch('http://localhost:5000/api/users/getFriends/' + props.user.username, {
        method: 'GET',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Credentials': true
        },
        redirect: 'follow',
      });
      const resObj = await res.json();
      if (resObj.err) {
        console.log(resObj.msg);
      } else {
        setFriends(resObj.data.friends.L);
      }
    }

    async function getFriendRequests() {
      const res = await fetch('http://localhost:5000/api/users/getFriendRequests/' + props.user.username, {
        method: 'GET',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Credentials': true
        },
        redirect: 'follow',
      });
      const resObj = await res.json();
      if (resObj.err) {
        console.log(resObj.msg);
      } else {
        setFriendRequests(resObj.data.friendRequests.L);
      }
    }

    const submitForm = (e) => {
      e.preventDefault();
      const formValues = {};
      for (var element of e.target.elements) {
        if (element.name) {
          formValues[element.name] = element.value;
        }
      }
      formValues["user"] = props.user.username;
      sendFriendRequest(formValues);
    }
    
    const sendFriendRequest = async (formValues) => {
      const res = await fetch("http://localhost:5000/api/users/friendRequest", {
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
      else
        setErrorMessage("Request sent!");
    }

    if (!loaded) {
      return (<Loading type='friends'/>);
    }

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Navbar />
        <Header text={`Friends`} type='friends' />
        <Container
          disableGutters
          maxWidth={false}
          sx={{ 
            mt: `${headerHeight}px`,
            ml: `${drawerWidth}px`,
            pt: `${margin}px`,
            width: `calc(100% - ${drawerWidth}px)`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Container
            disableGutters
            maxWidth={false}
            sx={{ 
              maxWidth: '1200px',
              position: 'relative',
              height: `calc(100vh - ${headerHeight + margin}px)`,
            }}
          >
            <Container disableGutters sx={{px: `${margin}px`}}>
              <Typography variant="h1">Add Friend</Typography>
              <form style={{ display: 'flex', flexDirection: 'column', paddingTop:'20px' }} onSubmit={submitForm}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                  }}
                >
                  <TextField style={{ width: '100%', paddingRight: '20px' }} name="requestedUser" label="Username" />
                  <Button style={{ width: '140px' }} type="submit" color="primary" variant="contained">
                    Send Request
                  </Button>
                </Box>
                <label style={{ paddingTop: '10px', color: errorMessage == 'Request sent!' ? '#0E424E' : '#DB4437' }}>{errorMessage}</label>
              </form>
              {friendRequests.length > 0 && 
                <div>
                  <Typography sx={{ mt: '20px' }} variant="h1">Friend Requests</Typography>
                  <Scrollbars 
                    style={{ 
                      width: 'inherit', 
                      height: '80px',
                      marginTop: '20px',
                    }}
                  >
                    <Grid container spacing={2} pr='0.5px'>
                    {friendRequests.map((value, i) => (
                      <Grid key={i} item xs={12} md={4}>
                        <FriendCard
                          key={i}
                          user={props.user}
                          friends={friends}
                          setFriends={setFriends}
                          friendRequests={friendRequests}
                          setFriendRequests={setFriendRequests}
                          S={value.S}
                          type='request'
                        />
                      </Grid>
                    ))}
                    </Grid>
                  </Scrollbars>
                </div>
              }
              <Divider sx={{ py: '10px' }} />
              <Typography sx={{ mt: '30px' }} variant="h1">Your Friends</Typography>
            </Container>
            <Container
              disableGutters
              sx={{
                mt: '20px',
                pl: `calc(${margin}px - 16px)`,
                pr: `${margin}px`,
              }}
            >
              <Scrollbars 
                style={{ 
                  width: 'inherit', 
                  height: friendRequests.length > 0
                    ? `calc(100vh - ${headerHeight + 2*margin + 192.5 + 20 + 148}px)`
                    : `calc(100vh - ${headerHeight + 2*margin + 192.5 + 20}px)`,
                }}
              >
                <Grid
                  container 
                  direction='row'
                  spacing={2}
                  sx={{ 
                    ml: 0,
                    pr: '0.5px',
                    width: 'inherit',
                  }}
                >
                  {friends.map((value, i) => (
                    <Grid key={i} item xs={12} md={4}>
                      <FriendCard 
                        key={i}
                        user={props.user}
                        friends={friends}
                        setFriends={setFriends}
                        S={value.S}
                        type='friend'
                      />
                    </Grid>
                  ))}
                </Grid>
              </Scrollbars>
            </Container>
          </Container>
        </Container>
    </ThemeProvider>
    )
}

export default FriendsPage;