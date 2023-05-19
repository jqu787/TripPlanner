import { 
  Grid,
  Container,
  TextField,
  Button,
  IconButton,
  Stack,
  Link,
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import _ from 'lodash';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { useState, useEffect } from 'react';
import { Form, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { theme, drawerWidth, headerHeight } from '../../constants';
import Header from '../../sharedComponents/Header';
import EventForm from '../../sharedComponents/EventForm';

function Trips(props) {
  const navigate = useNavigate();

  const navTrips = () => {
    navigate('/trips');
  };

  const [errorMessage, setErrorMessage] = useState('');
  const [formErrorMessage, setFormErrorMessage] = useState('');
  
  const [tripCategory, setTripCategory] = useState('temp');
  const [tripName, setTripName] = useState(window.sessionStorage.getItem('tripName') ? window.sessionStorage.getItem('tripName') : '');
  const [originCity, setOriginCity] = useState('temp');
  const [originState, setOriginState] = useState('temp');
  const [destinationCity, setDestinationCity] = useState(window.sessionStorage.getItem('destinationCity') ? window.sessionStorage.getItem('destinationCity') : '');
  const [destinationState, setDestinationState] = useState('temp');
  const [startDate, setStartDate] = useState(window.sessionStorage.getItem('startDate') ? window.sessionStorage.getItem('startDate') : '');
  const [startTime, setStartTime] = useState('temp');
  const [endDate, setEndDate] = useState(window.sessionStorage.getItem('endDate') ? window.sessionStorage.getItem('endDate') : '');
  const [endTime, setEndTime] = useState('temp');
  const [totalBudget, setTotalBudget] = useState('temp');
  const [numTravelers, setNumTravelers] = useState('temp');
  
  const handleTripNameChange = (event) => {
    window.sessionStorage.setItem('tripName', event.target.value);
    setTripName(event.target.value);
  };
  const handleDestinationCityChange = (event) => {
    window.sessionStorage.setItem('destinationCity', event.target.value);
    setDestinationCity(event.target.value);
  };
  const handleStartDateChange = (event) => {
    window.sessionStorage.setItem('startDate', event.target.value);
    setStartDate(event.target.value);
  };
  const handleEndDateChange = (event) => {
    window.sessionStorage.setItem('endDate', event.target.value);
    setEndDate(event.target.value);
  };

  const [events, setEvents] = useState(
    window.sessionStorage.getItem('events') 
      ? JSON.parse(window.sessionStorage.getItem('events')) 
      : [{
          name: '', 
          eventCity: '', 
          eventState: 'temp',
          startDate: '',
          startTime: '',
          endDate: '',
          endTime: '',
          cost: '',
          description: '',
        },
      ]
  );

  const handleAddEvent = (e) => {
    setEvents((events) => [
      ...events,
      {
        name: '', 
        eventCity: '', 
        eventState: 'temp',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        cost: '',
        description: '',
      },
    ]);
  };

  const handleDeleteEvent = (e, index) => {
    let temp = [...events];
    temp.splice(index, 1);
    setEvents(temp);
    window.sessionStorage.setItem('events', JSON.stringify(temp));
  };

  const handleEventChange = (e, index, field) => {
    let temp = [...events];
    temp[index][field] = e.target.value;
    setEvents(temp);
    window.sessionStorage.setItem('events', JSON.stringify(temp));
  };

  const submitForm = (e) => {
    e.preventDefault();
    const formValues = {};
    var travelers = [{"S": props.user.username}];
    travelers.push()

    formValues['category'] = tripCategory;
    formValues['name'] = tripName;
    formValues['originCity'] = originCity;
    formValues['originState'] = originState;
    formValues['destinationCity'] = destinationCity;
    formValues['destinationState'] = destinationState;
    formValues['startDate'] = startDate;
    formValues['startTime'] = startTime;
    formValues['endDate'] = endDate;
    formValues['endTime'] = endTime;
    formValues['totalBudget'] = totalBudget;
    formValues['numTravelers'] = numTravelers;
    formValues['travelers'] = travelers;

    for (const key in formValues) {
      if (formValues[key] === '') {
        return setFormErrorMessage('Missing required field.');
      }
    }

    createTripEvent(formValues);

    const timeout = 2000 + 250 * (events.length);
    const keys = ['tripName', 'destinationCity', 'startDate', 'endDate', 'events'];
    for (const key of keys) {
      window.sessionStorage.removeItem(key);
    }

    navigate('/confirm', {state: {error: errorMessage, timeout: timeout}});
  };

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const createTripEvent = async (formValues) => {
    const tripId = await createTrip(formValues);

    const emptyEvent = {
      name: '', 
      eventCity: '', 
      eventState: 'temp',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      cost: '',
      description: '',
    };
    for (let i = 0; i < events.length; i++) {
      if (!_.isEqual(events[i], emptyEvent)) {
        await sleep(250 * (i+1));
        events[i].tripId = tripId;
        const eventId = await createEvent(events[i]);
      }
    }
  }

  const createTrip = async (formValues) => {
    formValues.events = [];
    formValues.totalCost = '0';
    formValues.username = props.user.username;
    
    const res = await fetch("http://localhost:5000/api/trips/createTrip", {
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
    if (resObj.tripId) {
      return resObj.tripId;
    }
  };
  
  const createEvent = async (formValues) => {    
    const res = await fetch("http://localhost:5000/api/events/addEvent", {
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
    if (resObj.eventId) {
      return resObj.eventId;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header text={'Create Trip'} type='create' />
      <Container
        maxWidth='md'
        sx={{ 
          mt: `${headerHeight}px`,
          pt: '35px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Container
          disableGutters
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            py: 0,
          }}
        >
          <IconButton color='secondary' onClick={navTrips}>
            <CloseIcon />
          </IconButton>
          <Button 
            variant='contained' 
            color='secondary'
            disableElevation 
            type='submit'
            onAnimationEnd={submitForm}
            sx={{
              width: '70px',
              height: '30px',
            }}
          >
            <Typography 
              variant='body2' 
              sx={{
                mt: '3px',
                color: 'white',
              }}
            >
              Save
            </Typography>
          </Button>
        </Container>
        <Grid container spacing={2} columns={24} alignItems='center' pt={1}>
          <Grid item xs={24}>
            <Typography color='error'>
              {formErrorMessage}
            </Typography>
            <TextField
              fullWidth
              name='name'
              label='Trip Title'
              variant='standard'
              autoFocus
              value={tripName}
              onChange={handleTripNameChange}
              sx={{
                '.MuiInputBase-input': { fontSize: '24px' },
                '.MuiInputLabel-root': { fontSize: '24px' },
              }}
            />
          </Grid>
          <Grid item xs={24} sm={4.67}>
            <TextField
              fullWidth
              name='startDate'
              label='Start Date'
              variant='filled'
              size='small'
              value={startDate}
              onChange={handleStartDateChange}
            />
          </Grid>
          <Grid item xs={24} sm={1} textAlign='center'>
            <Typography>to</Typography>
          </Grid>
          <Grid item xs={24} sm={4.67}>
            <TextField
              fullWidth
              name='endDate'
              label='End Date'
              variant='filled'
              size='small'
              value={endDate}
              onChange={handleEndDateChange}
            />
          </Grid>
          <Grid item xs={24}>
            <TextField
              fullWidth
              name='destinationCity'
              label='Location'
              variant='filled'
              size='small'
              value={destinationCity}
              onChange={handleDestinationCityChange}
            />
          </Grid>
        </Grid>    
        <Stack spacing={4} mt={4} width='100%'> 
          <Scrollbars 
            style={{ 
              width: 'inherit', 
              height: '406.6px',
            }}
          >
            <Stack spacing={4}>
              {events.map((event, i) => (
                <EventForm 
                  key={i} 
                  index={i}
                  events={events}
                  handleEventChange={handleEventChange}
                  handleDeleteEvent={handleDeleteEvent}
                />
              ))}
            </Stack>
          </Scrollbars>
          <Link variant='body2' component='button' onClick={handleAddEvent}>
            + Add activity
          </Link>
        </Stack>  
      </Container>
    </ThemeProvider>
  )
}

export default Trips;