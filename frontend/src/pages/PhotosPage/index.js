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
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import { theme, drawerWidth, headerHeight, gridOffset } from '../../constants';
import Header from '../../sharedComponents/Header';
import Navbar from "../../sharedComponents/Navbar";
import PhotoCard from '../../sharedComponents/PhotoCard';

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
    }

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
          console.log(resObj.data)
          tripCopy[i] = {
            'name': resObj.data.name,
            'startDate': resObj.data.startDate, 
            'endDate': resObj.data.endDate, 
            'destinationCity': resObj.data.destinationCity, 
            'id': tripIDs[i].S
          }
          setTrips(tripCopy)
        }
      }
    }
    
    const getTripStatus = (start, end) => {
      const startDate = new Date(Date.parse(start));
      const endDate = new Date(Date.parse(end));
      endDate.setDate(endDate.getDate() + 1);
      const currDate = new Date();

      if (currDate.getTime() >= startDate.getTime() && currDate.getTime() <= endDate.getTime()) {
        return 'ongoing';
      } else if (currDate.getTime() < startDate.getTime()) {
        return 'upcoming';
      } else if (currDate.getTime() > endDate.getTime()) {
        return 'completed';
      }
    }

    const renderTrip = (status, trip, i) => {
      if (getTripStatus(trip.startDate, trip.endDate) === status) {
        return (
          <Grid key={i} item >
            <PhotoCard 
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
    }

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
      return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Navbar />
          <Header text={'Photos'} type='photos' />
          <Container
            maxWidth={false}
            sx={{ 
              mt: `${headerHeight}px`,
              pt: '200px',
              ml: `${drawerWidth}px`,
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
            <Typography variant='h5' mt='25px'>Loading trips... </Typography>
          </Container>
        </ThemeProvider>
      );
    }

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Navbar />
        <Header text={'Photos'} type='photos' />
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
          <Grid 
            container
            direction='row'
            columnSpacing={3}
            sx={{ 
              pt: '35px',
              px: `calc(35px - ${gridOffset}px)`,
              maxWidth: '1200px',
              position: 'relative',
              height: `calc(100vh - ${headerHeight}px)`,
            }}
          >
            <Grid item container direction='column' xs={4} rowSpacing={1}>
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
                <Grid container direction='column' rowSpacing={2}>
                  {trips.map((value, i) => (
                    renderTrip('ongoing', value, i)
                  ))}
                </Grid>
              </Collapse>
            </Grid>
            <Grid item container direction='column' xs={4} rowSpacing={1}>
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
                <Grid container direction='column' rowSpacing={2}>
                  {trips.map((value, i) => (
                    renderTrip('upcoming', value, i)
                  ))}
                </Grid>
              </Collapse>
            </Grid>
            <Grid item container direction='column' xs={4} rowSpacing={1}>
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
                <Grid container direction='column' rowSpacing={2}>
                  {trips.map((value, i) => (
                    renderTrip('completed', value, i)
                  ))}
                </Grid>
              </Collapse>
            </Grid>
          </Grid>
        </Container>
      </ThemeProvider>


      // <Box sx={{ display: 'flex' }} >
      //   <CssBaseline />
      //   <Navbar />
      //   <Header text={'Trips'} type='trips' />
      //   <Box
      //     sx={{ 
      //       mt: '125px',
      //       pt: '35px',
      //       ml: `${drawerWidth}px`,
      //       pl: '35px'
      //     }}
      //   >
      //     <Typography paragraph>
      //       Welcome to your Trip Dashboard! Here you can view and manage all your different travels.
      //     </Typography>
      //     <Typography paragraph>
      //       <u>Your Trips: </u>
      //     </Typography>
      //     <table>
      //       {trips.map((value) => (
      //         <div>
      //         <tr>
      //         <td>{console.log(value)}{value.name}</td>
      //         <td><a href={`/trips/${value.id}`} ><button>Trip Details</button></a></td>
      //         <td><a href={`/events/${value.id}`} ><button>See Itinerary</button></a></td>
      //         <td><a href={'/trips'} onClick={() => deleteTrip(value.id)} ><button style={{color: 'red'}} >Delete Trip</button></a></td>
      //         </tr>
      //         {(value.locked === "true") ? <><br /></> : <div><tr>
      //           <td></td>
      //           <td>
      //             <select onChange={e => setRemoveTraveler(value.id, e.target.value)}>
      //             <option value="">Select Traveler</option>
      //             {travelers.filter((tval) => (tval.id === value.id) ? true : false).map((tval2) => (
      //               tval2.travelers?.map((traveler) => (
      //                 <option value={traveler.S} key={traveler.S}> {traveler.S} </option>
      //               ))
      //             ))}
      //             </select>
      //           </td>
      //           <td><a href={`/trips`} ><button style={{color:"red"}} onClick={() => removeFromTrip(value.id)}>Remove from Trip</button></a></td>
      //         </tr> 
      //         <tr>
      //           <td></td>
      //           <td>
      //           <select onChange={e => setAddFriend(value.id, e.target.value)}>
      //             <option value="">Select Friend</option>
      //             {friends.map((friend) => (
      //               <option value={friend.S} key={friend.S}>
      //                 {friend.S}
      //               </option>
      //             ))}
      //           </select>
      //           </td>
      //           <td><a href={`/trips`} ><button style={{color:"green"}} onClick={() => addToTrip(value.id)}>Add to Trip</button></a></td>
      //         </tr></div>}
      //         <br />
      //         </div>
      //       ))}
      //     </table>
      //     <br />
      //     <Typography paragraph>
      //       <i>Components not rendering properly? Try refreshing the page!</i>
      //     </Typography>
      //   </Box>
      // </Box>
    )
}

export default TripsPage;