import { 
  CssBaseline,
  Container, 
  IconButton,
  Button,
  Typography,
  Box,
  Stack,
  Grid,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import { theme, drawerWidth, headerHeight, gridOffset, margin } from '../../constants';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../sharedComponents/Navbar';
import Header from '../../sharedComponents/Header';
import TripCard from '../../sharedComponents/TripCard';
import Loading from '../../sharedComponents/Loading';

function TripPage(props) {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const navTrips = () => {
      navigate('/trips');
    }

    const [trip, setTrip] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [eventIDs, setEventIDs] = useState([]);
    const [events, setEvents] = useState([]);
    const [friends, setFriends] = useState([]);
    const [travelers, setTravelers] = useState([]);
    
    useEffect(() => {
      getTripDetails();
      getFriends();
      getTravelers();
    }, []);

    useEffect(() => {
      getEventIDs();
    }, [trip]);

    useEffect(() => {
      getEvents();
      setTimeout(() => {
        setLoaded(true);
      }, 1000);
    }, [eventIDs]);

    async function getTripDetails() {
      const res = await fetch('http://localhost:5000/api/trips/getDetails/' + tripId, {
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
        const tripCopy = {
          'name': resObj.data.name,
          'startDate': resObj.data.startDate, 
          'endDate': resObj.data.endDate, 
          'destinationCity': resObj.data.destinationCity, 
        };
        setTrip(tripCopy);
      }
    };
  
    async function getEventIDs() {
      const res = await fetch('http://localhost:5000/api/trips/getEvents/' + tripId, {
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
        setEventIDs(resObj.data.events.L);
        getEvents();
      }
    };

    async function getEvents() {
      var eventsCopy = [...eventIDs];
      for (var i = 0; i < eventIDs.length; i++) {
        const res = await fetch('http://localhost:5000/api/events/getDetails/' + eventIDs[i].S, {
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
          eventsCopy[i] = 
            {
              name: resObj.data.name.S, 
              eventCity: resObj.data.eventCity.S, 
              startDate: resObj.data.startDate.S,
              startTime: resObj.data.startTime.S,
              endDate: resObj.data.endDate.S,
              endTime: resObj.data.endTime.S,
              eventId: eventIDs[i].S,
              description: resObj.data.description ? resObj.data.description.S : '',
            }
          setEvents(eventsCopy);
        }
      }
    };

    const sortEvents = () => {
      const sortedEvents = JSON.parse(JSON.stringify(events));
      for (const event of sortedEvents) {
        const sortIndex1 = new Date(Date.parse(event.startDate + ', ' + event.startTime)).getTime();
        const sortIndex2 = new Date(Date.parse(event.endDate + ', ' + event.endTime)).getTime();
        event.sortIndex1 = sortIndex1;
        event.sortIndex2 = sortIndex2;
      }
      sortedEvents.sort((a, b) => a.sortIndex1 - b.sortIndex1);
      return sortedEvents;
    };
  
    const [deleteOpen, setDeleteOpen] = useState(false);
  
    const handleDeleteClose = () => {
      setDeleteOpen(false);
    };

    const handleDeleteOpen = () => {
      setDeleteOpen(true);
    };

    const handleClickDelete = () => {
      deleteTrip();
      setDeleteOpen(false);
      navigate('/trips');
    };
    
    const deleteTrip = async () => {
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
    };

    const [shareOpen, setShareOpen] = useState(false);
    const [friendToAdd, setFriendToAdd] = useState('');
  
    const handleShareClose = () => {
      setShareOpen(false);
    };

    const handleShareOpen = () => {
      setShareOpen(true);
    };

    const handleClickShare = () => {
      addToTrip();
      setShareOpen(false);
      window.location.reload(false);
    };

    const handleFriendToAddSelect = (e) => {
      setFriendToAdd(e.target.value);
    };
  
    async function getTravelers() {
      const res = await fetch('http://localhost:5000/api/trips/getEvents/' + tripId, {
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
        setTravelers(resObj.data.travelers.L);
      }
    };

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
        console.log(resObj.data);
        setFriends(resObj.data.friends.L);
      }
    };
  
    async function addToTrip() {
      const res = await fetch("http://localhost:5000/api/trips/addToTrip", {
        method: 'POST',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Credentials': true
        },
        redirect: 'follow',
        body: JSON.stringify({'tripId': tripId, 'friend': friendToAdd}) 
      });
    };

    const [unshareOpen, setUnshareOpen] = useState(false);
    const [travelerToRemove, setTravelerToRemove] = useState('');

    const handleUnshareClose = () => {
      setUnshareOpen(false);
    };

    const handleUnshareOpen = () => {
      setUnshareOpen(true);
    };

    const handleClickUnshare = () => {
      removeFromTrip();
      setUnshareOpen(false);
      window.location.reload(false);
    };

    const handleTravelerToRemoveSelect = (e) => {
      setTravelerToRemove(e.target.value);
    };
    
    async function removeFromTrip() {
      const res = await fetch("http://localhost:5000/api/trips/removeFromTrip", {
        method: 'POST',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Credentials': true
        },
        redirect: 'follow',
        body: JSON.stringify({'tripId': tripId, 'traveler': travelerToRemove}) 
      });
    };

    if (!loaded) {
      return (<Loading type='trip details'/>);
    }

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Navbar />
        <Header text={'Trip Details'} type='trip' />
        <Dialog open={shareOpen} onClose={handleShareClose}>
          <DialogTitle>Share trip</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ width: '350px', mt: '10px' }}>
              <InputLabel>Select friend</InputLabel>
              <Select
                value={friendToAdd}
                label="Select friend"
                onChange={handleFriendToAddSelect}
              >
                {friends.map((friend) => (<MenuItem value={friend.S} key={friend.S}>{friend.S}</MenuItem>))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleShareClose}>CANCEL</Button>
            <Button onClick={handleClickShare} sx={{ fontWeight: 700 }}>SHARE</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={unshareOpen} onClose={handleUnshareClose}>
          <DialogTitle>Remove from trip</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ width: '350px', mt: '10px' }}>
              <InputLabel>Select traveler</InputLabel>
              <Select
                value={travelerToRemove}
                label="Select traveler"
                onChange={handleTravelerToRemoveSelect}
              >
                {travelers.map((traveler) => (<MenuItem value={traveler.S} key={traveler.S}>{traveler.S}</MenuItem>))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleUnshareClose}>CANCEL</Button>
            <Button onClick={handleClickUnshare} sx={{ fontWeight: 700, color: '#DB4437' }}>REMOVE</Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={deleteOpen}
          onClose={handleDeleteClose}
        >
          <Box
            sx={{
              p: '15px',
            }}
          >
            <DialogTitle>
              {"Are you sure you want to delete this trip?"}
            </DialogTitle>
            <DialogActions>
              <Button onClick={handleDeleteClose}>CANCEL</Button>
              <Button onClick={handleClickDelete} autoFocus sx={{ fontWeight: 700, color: '#DB4437' }}>
                DELETE TRIP
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
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
              px: `${margin}px`,
              display: 'flex',
              flexDirection: 'column',
              maxWidth: '900px',
            }}
          >
            <Container
              disableGutters
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <IconButton color='primary' onClick={navTrips}>
                <ArrowBackIcon />
              </IconButton>
              <Stack direction='row'>
                <IconButton color='primary' onClick={handleShareOpen}>
                  <ShareIcon />
                </IconButton>
                <IconButton color='primary' onClick={handleUnshareOpen}>
                  <PersonRemoveIcon />
                </IconButton>
                <IconButton color='primary' onClick={handleDeleteOpen}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </Container>
            <Stack spacing={1} mt='30px'>
              <Typography variant='h5' fontWeight={500}>{trip.name}</Typography>
              <Typography>{`${trip.startDate} - ${trip.endDate}`}</Typography>
              <Typography>{trip.destinationCity}</Typography>
            </Stack>
          </Container>
          <Container
            disableGutters 
            maxWidth={false}
            sx={{
              pt: '20px',
              pr: `${margin}px`,
              maxWidth: '900px',
            }}>
            <Scrollbars 
              style={{ 
                width: 'inherit', 
                height: `calc(100vh - ${headerHeight + margin + 186.01}px)`,
              }}
            >
              {events.length === 0 && <Typography color='primary.light' mt={3} pl={`${margin}px`} textAlign='center'>No events for this trip</Typography>}
              <Grid 
                container
                spacing={3}
                sx={{ 
                  ml: 0,
                  pl: `calc(${margin}px - ${gridOffset}px)`,
                  width: 'inherit',
                }}
              >
                {sortEvents().map((value, i) => (
                  <Grid key={i} item xs={12} md={6} pr='0.5px'>
                    <TripCard 
                      key={i}
                      name={value.name} 
                      startDate={value.startDate}
                      startTime={value.startTime}
                      endDate={value.endDate}
                      endTime={value.endTime}
                      location={value.eventCity}
                      description={value.description}
                      type='event' />
                  </Grid>   
                ))}
              </Grid>
            </Scrollbars>
          </Container>
        </Container>
      </ThemeProvider>
    )
}

export default TripPage;