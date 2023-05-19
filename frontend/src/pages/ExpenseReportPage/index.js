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
import { ThemeProvider } from '@mui/material/styles';
import { theme, headerHeight, gridOffset, margin } from '../../constants';
import Header from '../../sharedComponents/Header';
import Loading from '../../sharedComponents/Loading';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
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

import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from "../../sharedComponents/Navbar";
import { useNavigate } from 'react-router-dom';

function ExpenseReportPage(props) {
    const drawerWidth = 200;
    const { tripId } = useParams();
    const [eventIDs, setEventIDs] = useState([]);
    const [events, setEvents] = useState([]);
    const [travelers, setTravelers] = useState([]);
    const [name, setName] = useState("");
    const [locked, setLocked] = useState(true);

    const navigate = useNavigate();

    const navFinances = () => {
      navigate(`/finances`);
    }

    const navSplitExpenses = () => {
      navigate(`/reconcile/${tripId}`);
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

    useEffect(() => {
      computeTravelerExpenses();
    }, [events]);

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
        } else {
          setLocked(false)
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
                           "buttonClicked": "false"};
          setEvents(eventsCopy)
        }
      }
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
              travelerList[j].S = "Pre-Split & No-Split Amounts"
          }
          if (travelerList[j].S === "") {
            travelerList[j].S = "Unassigned Amounts"
        }
        }
        setTravelers(travelerList);
      }
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
        <Header text={'Expense Report'} type='expenseReport' />
        <Container
          disableGutters
          maxWidth={false}
          sx={{ 
            mt: `${headerHeight}px`,
            ml: `${drawerWidth}px`,
            mb: '60px',
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
              {(locked) ? 
                <a href={`/events/${tripId}`}><Button color="primary" variant="contained" onClick={() => unlockExpenses(tripId)} sx={{ py: '10px', px: '18px' }}>
                  <LockOpenOutlinedIcon sx={{ fontSize: 'medium', mb: '2px', mr: '7px' }}/>
                  <Typography sx={{ mt: '1px' }}>Unlock Expenses</Typography>
                </Button></a>
                :
                <></>
              }
            </Box>
            <Typography variant="h1" sx={{ pl: '35px' }}>Event Costs</Typography>
            <TableContainer component={Paper} sx={{ px: '35px', mt: '25px' }}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
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
                      <TableCell align="right">{value.cost}</TableCell>
                      <TableCell align="right">{value.whoPaid}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Button color="primary" variant="contained" sx={{ py: '9px', px: '16px', ml: '35px', mt: '15px' }} onClick={navSplitExpenses}>Split Expenses</Button>

            <Typography variant="h1" sx={{ pl: '35px', mt: '60px' }}>Cost per Traveler</Typography>
            <TableContainer component={Paper} sx={{ px: '35px', mt: '25px' }}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Traveler</TableCell>
                    <TableCell align="right">Cost Covered</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {travelers.map((value) => (
                    <TableRow
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {value.S}
                      </TableCell>
                      <TableCell align="right">{value.cost}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Container>
        </Container>


        {/* <Box sx={{ display: 'flex' }} >
          <Navbar />
          <CssBaseline />
          <Navbar />
          <Box
            component="main"
            sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
          >
            <Toolbar />
            <Typography paragraph>
              <u>Expenses by Trip Event </u>
            </Typography>
            <table>
              <tr>
                <th>Name</th>
                <th>Cost</th>
                <th>Who paid?</th>
              </tr>
              {events.map((value) => (
                <tr>
                  <td>{value.name}</td>
                  <td>{value.cost}</td>
                  <td>
                    {(value.whoPaid === "") ? <p>None</p> : <p>{value.whoPaid}</p>}
                  </td>
                </tr>
              ))}
            </table>
            <br />
            <Typography paragraph>
              <u>Total Expenses by Traveler </u>
            </Typography>
            <table>
              <tr>
                <th>Traveler</th>
                <th>Cost Covered</th>
              </tr>
              {travelers.map((value) => (
                <tr>
                  <td>{value.S}</td>
                  <td>{value.cost}</td>
                </tr>
              ))}
            </table>
            <p></p>
            <br />
            <a href={'/finances'}><button >Back to Dashboard</button></a>
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

export default ExpenseReportPage;