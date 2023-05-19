import Header from '../../sharedComponents/Header';
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
} from '@mui/material';
import { Scrollbars } from 'react-custom-scrollbars-2';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ThemeProvider, styled } from '@mui/material/styles';
import { theme, headerHeight, gridOffset, margin } from '../../constants';
import React, { Link, useState, useEffect } from 'react';
import UnlockedFinanceCard from '../../sharedComponents/UnlockedFinanceCard';
import LockedFinanceCard from '../../sharedComponents/LockedFinanceCard';
import Loading from '../../sharedComponents/Loading';

import Navbar from "../../sharedComponents/Navbar";

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

function FinancesPage(props) {
    const drawerWidth = 200;
    const [tripIDs, setTripIDs] = useState([]);
    const [friends, setFriends] = useState([]);
    // const [addFriend, setAddFriend] = useState("");
    // const [removeTraveler, setRemoveTraveler] = useState("");
    const [lockedTrips, setLockedTrips] = useState([]);
    const [unlockedTrips, setUnlockedTrips] = useState([]);
    const [travelers, setTravelers] = useState([]);

    useEffect(() => {
      getTrips();
    }, []);

    useEffect(() => {
      getTripDetails();
      getTravelers();
    }, [tripIDs]);

    useEffect(() => {
      getFriends();
      setTimeout(() => {
        setLoaded(true);
      }, 1000);
    }, [lockedTrips, unlockedTrips]);

    async function getTrips() {
      const res = await fetch('http://localhost:5000/api/users/getTrips/' + props.user.username, {
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
        setTripIDs(resObj.data.trips.L);
        getTripDetails();
      }
    }

    async function getTripDetails() {
      var tripCopy = [...tripIDs];
      var locked = []
      var unlocked = []
      for (var i = 0; i < tripIDs.length; i++) {
        const res = await fetch('http://localhost:5000/api/trips/getDetails/' + tripIDs[i].S, {
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
          if (resObj.data.locked === "true") {
            locked.push({"name": resObj.data.name, "startDate": resObj.data.startDate, "endDate": resObj.data.endDate, "destinationCity": resObj.data.destinationCity, "tripId": tripIDs[i].S})
          } else {
            unlocked.push({"name": resObj.data.name, "startDate": resObj.data.startDate, "endDate": resObj.data.endDate, "destinationCity": resObj.data.destinationCity, "tripId": tripIDs[i].S})
          }
          setLockedTrips(locked)
          setUnlockedTrips(unlocked)
        }
      }
    }

    async function getTravelers() {
      var tripCopy = [...tripIDs];
      for (var i = 0; i < tripIDs.length; i++) {
        const res = await fetch('http://localhost:5000/api/trips/getEvents/' + tripIDs[i].S, {
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
          tripCopy[i] = {"travelers": resObj.data.travelers.L, "tripId": tripIDs[i].S}
          setTravelers(tripCopy)
        }
      }
    }

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

    const deleteTrip = async (tripId) => {
      const res = await fetch("http://localhost:5000/api/trips/deleteTrip", {
        method: 'POST',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Credentials': true
        },
        redirect: 'follow',
        body: JSON.stringify({'tripId': tripId, 'username': props.user.username}) 
      });
      const resObj = await res.json();
    }

    const sortTrips = (ascending, trips) => {
      const sortedTrips = JSON.parse(JSON.stringify(trips));
      for (const trip of sortedTrips) {
        const sortIndex1 = new Date(Date.parse(trip.startDate)).getTime();
        const sortIndex2 = new Date(Date.parse(trip.endDate)).getTime();
        trip.sortIndex1 = sortIndex1;
        trip.sortIndex2 = sortIndex2;
      }
      if (ascending) {
        sortedTrips.sort((a, b) => a.sortIndex1 - b.sortIndex1);
      } else {
        sortedTrips.sort((a, b) => b.sortIndex2 - a.sortIndex2);
      }
      return sortedTrips;
    };

    const [ongoingExpanded, setOngoingExpanded] = useState(true);
    const [completedExpanded, setCompletedExpanded] = useState(true);

    const handleOngoingExpandClick = () => {
      setOngoingExpanded(!ongoingExpanded);
    };
    const handleCompletedExpandClick = () => {
      setCompletedExpanded(!completedExpanded);
    };

    const [loaded, setLoaded] = useState(false);

    if (!loaded) {
      return (<Loading type='finances'/>);
    }

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Navbar />
        <Header text={'Trips'} type='trips' />
        <Container
          disableGutters
          maxWidth={false}
          sx={{ 
            mt: `${headerHeight}px`,
            ml: `${drawerWidth}px`,
            pt: `${margin}px`,
            width: `calc(100% - ${drawerWidth}px)`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Grid 
            container
            direction='row'
            columnSpacing={3}
            sx={{ 
              ml: 0,
              pl: `calc(${margin}px - ${gridOffset}px)`,
              pr: `${margin}px`,
              maxWidth: '1200px',
              position: 'relative',
              height: `calc(100vh - ${headerHeight + margin}px)`,
            }}
          >
            <Grid item container direction='column' xs={6} rowSpacing={1}>
              <Grid item>
                <Box sx={{
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'left',
                  pb: 1,
                  }}
                >
                  <ExpandMore
                    expand={ongoingExpanded}
                    onClick={handleOngoingExpandClick}
                    sx={{
                      color: 'primary.light', 
                      minHeight: 0, 
                      minWidth: 0, 
                      padding: '4px'
                    }}
                  >
                    <ExpandMoreIcon />
                  </ExpandMore>
                  <Typography 
                    color='primary.light' 
                    fontWeight={600} 
                    pt='2px'
                  >
                    IN REVIEW
                  </Typography>
                </Box>
              </Grid>
              <Collapse in={ongoingExpanded} timeout='auto' unmountOnExit>
                <Scrollbars 
                  style={{ 
                    width: 'inherit',
                    height: `calc(100vh - ${headerHeight + 48 + 35 + 35 + 56 + 10}px)`,
                  }}
                >
                  <Grid container direction='column' rowSpacing={2} pr={'0.5px'} sx={{ mt: '5px' }}>
                    {sortTrips(true, unlockedTrips).map((value, i) => (
                      <Box sx={{ mb: '10px' }}>
                        <UnlockedFinanceCard 
                          key={i}
                          id={value.id}
                          tripId={value.tripId}
                          name={value.name} 
                          startDate={value.startDate}
                          endDate={value.endDate}
                          location={value.destinationCity}
                        />
                      </Box>
                    ))}
                    {!unlockedTrips.length === 0
                      ? 
                        <Typography
                          color='primary.light'
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            mt: 4
                          }}
                        >
                          No ongoing trips
                        </Typography>
                      : null
                    }
                  </Grid>
                </Scrollbars>
              </Collapse>
            </Grid>
            
            <Grid item container direction='column' xs={6} rowSpacing={1}>
              <Grid item>
                <Box sx={{
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'left',
                  pb: 1,
                  }}
                >
                  <ExpandMore
                    expand={completedExpanded}
                    onClick={handleCompletedExpandClick}
                    sx={{
                      color: 'primary.light', 
                      minHeight: 0, 
                      minWidth: 0, 
                      padding: '4px'
                    }}
                  >
                    <ExpandMoreIcon />
                  </ExpandMore>
                  <Typography 
                    color='primary.light' 
                    fontWeight={600} 
                    pt='2px'
                  >
                    EXPENSES COMPLETED
                  </Typography>
                </Box>
              </Grid>
              <Collapse in={completedExpanded} timeout='auto' unmountOnExit>
                <Scrollbars 
                  style={{ 
                    width: 'inherit', 
                    height: `calc(100vh - ${headerHeight + 48 + 35 + 35 + 56 + 10}px)`,
                  }}
                >
                  <Grid container direction='column' rowSpacing={2} pr={'0.5px'} sx={{ mt: '5px' }}>
                    {sortTrips(false, lockedTrips).map((value, i) => (
                      <Box sx={{ mb: '10px' }}>
                        <LockedFinanceCard 
                          key={i}
                          id={value.id}
                          tripId={value.tripId}
                          name={value.name} 
                          startDate={value.startDate}
                          endDate={value.endDate}
                          location={value.destinationCity}
                        />
                      </Box>
                    ))}
                    {!lockedTrips.length === 0 
                      ? 
                        <Typography
                          color='primary.light'
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            mt: 4
                          }}
                        >
                          No completed trips
                        </Typography>
                      : null
                    }
                  </Grid>
                </Scrollbars>
              </Collapse>
            </Grid>
          </Grid>
        </Container>



        {/* <Box sx={{ display: 'flex' }} >
          <Header text={'Finances'} type='finances' />
          <Box
            sx={{ 
              mt: '125px',
              pt: '35px',
              ml: `${drawerWidth}px`,
              pl: '35px'
            }}
          >
            <Typography paragraph>
              Welcome to your Finances Dashboard! Here you can view and manage all your travel-related expenses.
            </Typography>
            <Typography paragraph>
              <u>Your Completed Trips: </u>
            </Typography>
            <Typography paragraph>
              <i>Expenses reports are ready for these trips. </i>
            </Typography>
            <table>
              {lockedTrips.map((value) => (
                <div>
                <tr>
                <td>{value.name}</td>
                {console.log(value)}
                <td><a href={`/expenses/${value.tripId}`} ><button>Expense Report</button></a></td>
                <td><a href={`/reconcile/${value.tripId}`} ><button style={{color: 'red'}}>Reconcile Expenses</button></a></td>
                </tr>
                <br />
                </div>
              ))}
            </table>
            <Typography paragraph>
              <u>Your In-Progress Trips: </u>
            </Typography>
            <Typography paragraph>
              <i>Expenses have NOT been locked in yet for these trips. </i>
            </Typography>
            <table>
              {unlockedTrips.map((value) => (
                <div>
                <tr>
                <td>{value.name}</td>
                <td><a href={`/events/${value.tripId}`} ><button>Review and Lock Expenses</button></a></td>
                </tr>
                <br />
                </div>
              ))}
            </table>
            <br />
            <Typography paragraph>
              <i>Components not rendering properly? Try refreshing the page!</i>
            </Typography>
          </Box>
        </Box> */}
      </ThemeProvider>
    )
}

export default FinancesPage;