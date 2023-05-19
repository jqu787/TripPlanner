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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CircleIcon from '@mui/icons-material/Circle';
import AddIcon from '@mui/icons-material/Add';
import { Puff } from 'react-loading-icons';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { sortBy } from 'lodash';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import { theme, drawerWidth, headerHeight, gridOffset, margin } from '../../constants';
import Header from '../../sharedComponents/Header';
import Navbar from '../../sharedComponents/Navbar';
import TripCard from '../../sharedComponents/TripCard';
import Loading from '../../sharedComponents/Loading';

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

function TripsPage(props) {
    const navigate = useNavigate();
    const navCreate = () => { 
      navigate('/create');
    };

    const [trips, setTrips] = useState([]);
    const [tripIDs, setTripIDs] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [ongoing, setOngoing] = useState(false);
    const [upcoming, setUpcoming] = useState(false);
    const [completed, setCompleted] = useState(false);
  
    useEffect(() => {
      getTripIDs();
    }, []);

    useEffect(() => {
      getTripDetails();
      setTimeout(() => {
        setLoaded(true);
      }, 1000);
    }, [tripIDs]);

    async function getTripIDs() {
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
        console.log(resObj.data);
        setTripIDs(resObj.data.trips.L);
      }
    };

    async function getTripDetails() {
      var tripCopy = [...tripIDs];
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
          console.log(resObj.data);
          tripCopy[i] = {
            'name': resObj.data.name,
            'startDate': resObj.data.startDate, 
            'endDate': resObj.data.endDate, 
            'destinationCity': resObj.data.destinationCity, 
            'id': tripIDs[i].S
          };
          setTrips(tripCopy);
        }
      }
    };

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
      var tripCopy = [...trips];
      var newTrips = [];
      for (var i = 0; i < tripCopy.length; i++) {
        if (tripCopy[i].id === tripId) {
          continue
        }
        newTrips.push(tripCopy[i])
      }
      setTrips(newTrips);
    };

    const sortTrips = (ascending) => {
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
    
    const getTripStatus = (start, end) => {
      const startDate = new Date(Date.parse(start));
      const endDate = new Date(Date.parse(end));
      endDate.setDate(endDate.getDate() + 1);
      const currDate = new Date();

      if (currDate.getTime() >= startDate.getTime() && currDate.getTime() <= endDate.getTime()) {
        if (!ongoing) {
          setOngoing(true);
        }
        return 'ongoing';
      } else if (currDate.getTime() < startDate.getTime()) {
        if (!upcoming) {
          setUpcoming(true);
        }
        return 'upcoming';
      } else if (currDate.getTime() > endDate.getTime()) {
        if (!completed) {
          setCompleted(true);
        }
        return 'completed';
      }
    };

    const renderTrip = (status, trip, i) => {
      if (getTripStatus(trip.startDate, trip.endDate) === status) {
        return (
          <Grid key={i} item >
            <TripCard 
              key={i}
              id={trip.id}
              name={trip.name} 
              startDate={trip.startDate}
              endDate={trip.endDate}
              location={trip.destinationCity}
              type={status}
            />
          </Grid>
        );
      }
    };

    const [ongoingExpanded, setOngoingExpanded] = useState(true);
    const [upcomingExpanded, setUpcomingExpanded] = useState(true);
    const [completedExpanded, setCompletedExpanded] = useState(true);

    const handleOngoingExpandClick = () => {
      setOngoingExpanded(!ongoingExpanded);
    };
    const handleUpcomingExpandClick = () => {
      setUpcomingExpanded(!upcomingExpanded);
    };
    const handleCompletedExpandClick = () => {
      setCompletedExpanded(!completedExpanded);
    };

    if (!loaded) {
      return (<Loading type='trips'/>);
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
            <Fab
              color='primary'
              onAnimationEnd={navCreate}
              sx={{
                position: 'absolute',
                bottom: `${margin}px`,
                right: `${margin}px`,
                borderRadius: '15px',
              }}
            >
              <AddIcon />
            </Fab>
            <Grid item container direction='column' xs={12} md={4} rowSpacing={1}>
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
                    ONGOING
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
                  <Grid container direction='column' rowSpacing={2} pr={'0.5px'}>
                    {sortTrips(true).map((value, i) => (
                      renderTrip('ongoing', value, i)
                    ))}
                    {!ongoing 
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
            <Grid item container direction='column' xs={12} md={4} rowSpacing={1}>
              <Grid item>
                <Box sx={{
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'left',
                  pb: 1,
                  }}
                >
                  <ExpandMore
                    expand={upcomingExpanded}
                    onClick={handleUpcomingExpandClick}
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
                    UPCOMING
                  </Typography>
                </Box>
              </Grid>
              <Collapse in={upcomingExpanded} timeout='auto' unmountOnExit>
                <Scrollbars 
                  style={{ 
                    width: 'inherit', 
                    height: `calc(100vh - ${headerHeight + 48 + 35 + 35 + 56 + 10}px)`,
                  }}
                >
                  <Grid container direction='column' rowSpacing={2} pr={'0.5px'}>
                    {sortTrips(true).map((value, i) => (
                      renderTrip('upcoming', value, i)
                    ))}
                    {!upcoming 
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
                          No upcoming trips
                        </Typography>
                      : null
                    }
                  </Grid>
                </Scrollbars>
              </Collapse>
            </Grid>
            <Grid item container direction='column' xs={12} md={4} rowSpacing={1}>
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
                    COMPLETED
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
                  <Grid container direction='column' rowSpacing={2} pr={'0.5px'}>
                    {sortTrips(false).map((value, i) => (
                      renderTrip('completed', value, i)
                    ))}
                    {!completed 
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
      </ThemeProvider>
    )
}

export default TripsPage;