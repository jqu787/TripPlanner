import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import { useNavigate } from 'react-router-dom';
import { 
  Container,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  InputLabel,
  MenuItem,
  FormControl,
} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from "../../sharedComponents/Navbar";
import { ThemeProvider } from '@mui/material/styles';
import { theme, headerHeight, gridOffset, margin } from '../../constants';
import Header from '../../sharedComponents/Header';
import Loading from '../../sharedComponents/Loading';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

function EventsPage(props) {
    const drawerWidth = 200;
    const { tripId } = useParams();
    const [eventIDs, setEventIDs] = useState([]);
    const [events, setEvents] = useState([]);
    const [name, setName] = useState("");
    const [locked, setLocked] = useState(false);
    const [travelers, setTravelers] = useState([]);

    const [currEventId, setCurrEventId] = useState("");
    const [currWhoPaid, setCurrWhoPaid] = useState("");

    const [open, setOpen] = useState(false);
    const handleClickOpen = (eventId, whoPaid) => {
      setCurrEventId(eventId);
      setCurrWhoPaid(whoPaid);
      setOpen(true);
    };
    const handleClose = () => {
      setOpen(false);
    };
    const handleClickConfirm = () => {
      addWhoPaid();
      setOpen(false);
      window.location.reload(false);
    }

    const navigate = useNavigate();

    const navFinances = () => {
      navigate(`/finances`);
    }

    useEffect(() => {
      getTripDetails();
      setTimeout(() => {
        setLoaded(true);
      }, 1000);
    }, []);

    useEffect(() => {
      getEventIDs();
    }, [name]);

    useEffect(() => {
      getEvents();
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
        setName(resObj.data.name);
        if (resObj.data.locked === "true") {
          setLocked(true)
        }
      }
  }

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
        setTravelers(resObj.data.travelers.L)
        setEventIDs(resObj.data.events.L);
        getEvents();
      }
    }

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
          console.log(resObj.data)
          eventsCopy[i] = {"name": resObj.data.name.S, 
                           "cost": resObj.data.cost.S,
                           "eventCity": resObj.data.eventCity.S,
                           "eventState": resObj.data.eventState.S,
                           "startDate": resObj.data.startDate.S,
                           "startTime": resObj.data.startTime.S,
                           "endDate": resObj.data.endDate.S,
                           "endTime": resObj.data.endTime.S,
                           "eventId": eventIDs[i].S,
                           "whoPaid": resObj.data.whoPaid.S,
                           "locked": resObj.data.locked.S, 
                           "whoPaidSelected": "",
                           "buttonClicked": "false"}
          setEvents(eventsCopy)
        }
      }
    }

    function openExpenseForm(eventId) {
      var eventsCopy = [...events];
      for (var i = 0; i < eventsCopy.length; i++) {
        if (eventsCopy[i].eventId === eventId) {
          eventsCopy[i].buttonClicked = "true"
        }
      }
      setEvents(eventsCopy)
    }

    function setWhoPaidSelected(e) {
      var eventsCopy = [...events];
      for (var i = 0; i < eventsCopy.length; i++) {
        if (eventsCopy[i].eventId === currEventId) {
          eventsCopy[i].whoPaidSelected = e.target.value
        }
      }
      setEvents(eventsCopy);
      setCurrWhoPaid(e.target.value);
    }

    async function lockExpenses(tripId) {
      if (!locked) {
        setLocked(true);
        computeTravelerExpenses();
      }
      var eventsCopy = [...events];
      for (var i = 0; i < eventsCopy.length; i++) {
        applyLock(eventsCopy[i].eventId)
      }
      const res = await fetch("http://localhost:5000/api/trips/lockExpense", {
        method: 'POST',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Credentials': true
        },
        redirect: 'follow',
        body: JSON.stringify({'tripId': tripId}) 
      });
      const resObj = await res.json();
    }

    async function unlockExpenses(tripId) {
      if (locked) {
        setLocked(false);
      }
      var eventsCopy = [...events];
      for (var i = 0; i < eventsCopy.length; i++) {
        applyUnlock(eventsCopy[i].eventId)
      }
      const res = await fetch("http://localhost:5000/api/trips/unlockExpense", {
        method: 'POST',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Credentials': true
        },
        redirect: 'follow',
        body: JSON.stringify({'tripId': tripId}) 
      });
      const resObj = await res.json();
    }

    async function computeTravelerExpenses() {
      const res = await fetch('http://localhost:5000/api/trips/computeExpenses/' + tripId, {
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
        var travelerList = resObj.data
        for (var i = 0; i < events.length; i++) {
          var cost = parseFloat(events[i].cost)
          var whoPaid = events[i].whoPaid
          for (var j = 0; j < travelerList.length; j++) {
            if (whoPaid === travelerList[j].S) {
                travelerList[j].cost += cost
                break;
            }
          }
        }
        for (var j = 0; j < travelerList.length; j++) {
          if (travelerList[j].S === "N/A") {
              travelerList[j].S = "Amount Already Split"
          }
          if (travelerList[j].S === "") {
            travelerList[j].S = "Amount Unassigned"
        }
        }
        computeExpenseSplitting(travelerList)
      }
    }

    async function computeExpenseSplitting(travelerList) {
      var splittings = {}
      var totalTravelers = 0
      for (var i = 0; i < travelerList.length; i++) {
        if (travelerList[i].S === "Amount Already Split" || travelerList[i].S === "Amount Unassigned") {
          continue;
        } else {
          var traveler = travelerList[i].S 
          totalTravelers += 1
          splittings[traveler] = {}
        }
      }
      for (const [key, value] of Object.entries(splittings)) {
        for (var i = 0; i < travelerList.length; i++) {
          if (travelerList[i].S === "Amount Already Split" || travelerList[i].S === "Amount Unassigned") {
            continue;
          } else if (travelerList[i].S === key) {
            splittings[key][travelerList[i].S] = 0
          } else {
            splittings[key][travelerList[i].S] = travelerList[i].cost / totalTravelers
          }
        }
      }
      const res = await fetch("http://localhost:5000/api/trips/updateExpenseMatrix", {
        method: 'POST',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Credentials': true
        },
        redirect: 'follow',
        body: JSON.stringify({'expenseMatrix': splittings, 'tripId': tripId}) 
      });
      const resObj = await res.json();
    }

    const applyLock = async (eventId) => {
      const res = await fetch("http://localhost:5000/api/events/lockExpense", {
        method: 'POST',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Credentials': true
        },
        redirect: 'follow',
        body: JSON.stringify({'eventId': eventId}) 
      });
      const resObj = await res.json();
    }

    const applyUnlock = async (eventId) => {
      const res = await fetch("http://localhost:5000/api/events/unlockExpense", {
        method: 'POST',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Credentials': true
        },
        redirect: 'follow',
        body: JSON.stringify({'eventId': eventId}) 
      });
      const resObj = await res.json();
    }

    const addWhoPaid = async () => {
      var eventsCopy = [...events];
      var whoPaidSelected = "";
      for (var i = 0; i < eventsCopy.length; i++) {
        if (eventsCopy[i].eventId === currEventId) {
          whoPaidSelected = eventsCopy[i].whoPaidSelected
        }
      }
      const res = await fetch("http://localhost:5000/api/events/addWhoPaid", {
        method: 'POST',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Credentials': true
        },
        redirect: 'follow',
        body: JSON.stringify({'eventId': currEventId, 'whoPaid': whoPaidSelected}) 
      });
      const resObj = await res.json();
    }

    const deleteEvent = async (eventId) => {
      const res = await fetch("http://localhost:5000/api/events/removeEvent", {
        method: 'POST',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Credentials': true
        },
        redirect: 'follow',
        body: JSON.stringify({'eventId': eventId, 'tripId': tripId}) 
      });
      const resObj = await res.json();
    }

    const [loaded, setLoaded] = useState(false);

    if (!loaded) {
      return (<Loading type='expenses'/>);
    }

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Navbar />
        <Header text={'Review Expenses'} type='reviewExpenses' />
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
          <Container
            disableGutters
            maxWidth={false}
            sx={{ 
              maxWidth: '1200px',
              position: 'relative',
              height: `calc(100vh - ${headerHeight + margin}px)`,
            }}
          >
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', px: '35px', mb: '35px' }}>
              <IconButton onClick={navFinances} color="primary"><ArrowBackOutlinedIcon/></IconButton>
              {(!locked) ? 
                <Button color="primary" variant="contained" onClick={() => lockExpenses(tripId)} sx={{ py: '10px', px: '18px' }}>
                  <LockOutlinedIcon sx={{ fontSize: 'medium', mb: '2px', mr: '7px' }}/>
                  <Typography sx={{ mt: '1px' }}>Lock Expenses</Typography>
                </Button>
                :
                <Button color="primary" variant="contained" onClick={() => unlockExpenses(tripId)} sx={{ py: '10px', px: '18px' }}>
                  <LockOpenOutlinedIcon sx={{ fontSize: 'medium', mb: '2px', mr: '7px' }}/>
                  <Typography sx={{ mt: '1px' }}>Unlock Expenses</Typography>
                </Button>
              }
            </Box>
            <TableContainer component={Paper} sx={{ px: '35px' }}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Event Name</TableCell>
                    <TableCell align="right">Location</TableCell>
                    <TableCell align="right">Start Date</TableCell>
                    <TableCell align="right">End Date</TableCell>
                    <TableCell align="right">Cost</TableCell>
                    <TableCell align="right">Who Paid</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events.map((value) => (
                    <TableRow
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {value.name}
                      </TableCell>
                      <TableCell align="right">{value.eventCity}</TableCell>
                      <TableCell align="right">{value.startDate}</TableCell>
                      <TableCell align="right">{value.endDate}</TableCell>
                      <TableCell align="right">${value.cost}</TableCell>
                      <TableCell align="right" sx={{ display: 'flex' }}>
                        {(locked) ? <></> : <IconButton onClick={() => handleClickOpen(value.eventId, value.whoPaid)} sx={{ mt: '-3px', ml: '3px' }}><EditOutlinedIcon sx={{ fontSize: 'large', color: '#0E424E' }}/></IconButton>}
                        <Box sx={{ mt: '4px' }}>
                          {(value.whoPaid === "") ? <Typography>N/A</Typography> : <Typography>{value.whoPaid}</Typography>}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Who paid?</DialogTitle>
                    <DialogContent>
                      <FormControl fullWidth sx={{ width: '350px', mt: '10px' }}>
                        <InputLabel id="demo-simple-select-label">Select option</InputLabel>
                        <Select
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          value={(currWhoPaid === "") ? "N/A" : currWhoPaid}
                          label="Select option"
                          onChange={setWhoPaidSelected}
                        >
                          <MenuItem value='N/A'>N/A</MenuItem>
                          {travelers.map((traveler) => (<MenuItem value={traveler.S} key={traveler.S}>{traveler.S}</MenuItem>))}
                        </Select>
                      </FormControl>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={handleClose}>CANCEL</Button>
                      <Button onClick={handleClickConfirm} sx={{ fontWeight: 700 }}>CONFIRM</Button>
                    </DialogActions>
                  </Dialog>
                </TableBody>
              </Table>
            </TableContainer>
          </Container>
        </Container>


        {/* <Box sx={{ display: 'flex', ml: '300px', mt: '300px' }} >
          <CssBaseline />
          <Box
            component="main"
            sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
          >
            <Toolbar />
            <Typography paragraph>
              Your Events for this Trip: 
            </Typography>
            <table>
              <tr>
                <th></th>
                <th>Name</th>
                <th>City</th>
                <th>State</th>
                <th>Start Time</th>
                <th>Start Date</th>
                <th>End Time</th>
                <th>End Date</th>
                <th>Cost</th>
                <th>Who paid?</th>
              </tr>
              {events.map((value) => (
                <tr>
                  <td><a href={`/events/${tripId}`} onClick={() => deleteEvent(value.eventId)} ><button style={{color: 'red'}} >Delete Event</button></a></td>
                  <td>{value.name}</td>
                  <td>{value.eventCity}</td>
                  <td>{value.eventState}</td>
                  <td>{value.startTime}</td>
                  <td>{value.startDate}</td>
                  <td>{value.endTime}</td>
                  <td>{value.endDate}</td>
                  <td>{value.cost}</td>
                  <td>
                    {(value.whoPaid === "") ? <p>None</p> : <p>{value.whoPaid}</p>}
                    {(locked) ? <></> : ((value.buttonClicked === "false") ? <button onClick={() => openExpenseForm(value.eventId)}>change</button> : 
                      <div>
                        <select onChange={e => setWhoPaidSelected(value.eventId, e.target.value)}>
                          <option value="">Select</option>
                          <option value="N/A">Already Split</option>
                          <option value="N/A">No Split Necessary</option>
                          {travelers.map((traveler) => (<option value={traveler.S} key={traveler.S}>{traveler.S}</option>))}
                        </select>
                        <a href={`/events/${tripId}`}><button onClick={() => addWhoPaid(value.eventId)}>submit</button></a>
                      </div>)}
                  </td>
                </tr>
              ))}
            </table>
            <br />
            {(!locked) ? <div>
              <p>
                Finished assigning trip expenses? Lock them in! 
              </p>
              <button style={{color: 'red'}} onClick={() => lockExpenses(tripId)}>Lock Expenses</button></div>
              : <div><p style={{color: 'green'}} >Expenses are locked in!</p>
              <button style={{color: 'red'}} onClick={() => unlockExpenses(tripId)}>Unlock Expenses</button></div>}
            <p>
              An expense report will be generated on your Finances Dashboard.
            </p>
            <p></p>
            <br />
            {(locked) ? <></> : <a href={`/addEvent/${tripId}`}><button style={{color: 'green'}} >Add Event</button></a>}
            <a href={'/trips'}><button >Back to Dashboard</button></a>
            <p></p>
            <br />
            <Typography paragraph>
              <i>Components not rendering properly? Try refreshing the page!</i>
            </Typography>
            </Box>
        </Box> */}
      </ThemeProvider>
    )
}

export default EventsPage;