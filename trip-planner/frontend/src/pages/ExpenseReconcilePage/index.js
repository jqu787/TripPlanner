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

function ExpenseReconcilePage(props) {
    const drawerWidth = 200;
    const { tripId } = useParams();
    const [eventIDs, setEventIDs] = useState([]);
    const [events, setEvents] = useState([]);
    const [amountIOwe, setAmountIOwe] = useState([]);
    const [amountOwedToMe, setAmountOwedToMe] = useState([]);
    const [name, setName] = useState("");
    const [expenseMatrix, setExpenseMatrix] = useState({});

    const navigate = useNavigate();

    const navBack = () => {
      navigate(`/expenses/${tripId}`);
    }

    useEffect(() => {
      getTripDetails();
      
    }, []);

    useEffect(() => {
      getEventIDs();
    }, [name]);

    useEffect(() => {
      getEvents();
    }, [eventIDs]);

    useEffect(() => {
      getPeerExpenses();
    }, [events]);

    useEffect(() => {
      updateOwed();
      updateIOwe();
    }, [expenseMatrix]);

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

    async function getPeerExpenses() {
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
        setExpenseMatrix(resObj.data.expenseMatrix.M)
      }
    }

    function updateIOwe() {
      var myList = []
      var myMap = {}
      for (const [outerKey, outerValue] of Object.entries(expenseMatrix)) {
        if (outerKey === props.user.username) {
          myMap = outerValue.M
        }
      }
      for (const [key, value] of Object.entries(myMap)) {
        if (key === props.user.username) {
          myList.push({"person": key, "amount": "N/A", "paid": true})
          continue
        }
        myList.push({"person": key, "amount": value.M.amount.S, "paid": value.M.paid.BOOL})
      }
      setAmountIOwe(myList)
    }

    function updateOwed() {
      console.log(expenseMatrix)
      var myList = []
      for (const [outerKey, outerValue] of Object.entries(expenseMatrix)) {
        var theirMap = {}
        if (outerKey === props.user.username) {
          myList.push({"person": outerKey, "amount": "N/A", "paid": true})
          continue
        }
        theirMap = outerValue.M
        myList.push({"person": outerKey, "amount": theirMap[props.user.username].M.amount.S, "paid": theirMap[props.user.username].M.paid.BOOL})
      }
      setAmountOwedToMe(myList)
    }

    const sentPayment = async (recipient) => {
      var myMatrix = {...expenseMatrix}
      const res = await fetch("http://localhost:5000/api/trips/togglePayment", {
        method: 'POST',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Credentials': true
        },
        redirect: 'follow',
        body: JSON.stringify({'expenseMatrix': myMatrix, 'sender': props.user.username, 'recipient': recipient, 'tripId': tripId}) 
      }).then(() => window.location.reload());
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

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Navbar />
        <Header text={'Split Expenses'} type='splitExpenses' />
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
              <IconButton onClick={navBack} color="primary"><ArrowBackOutlinedIcon/></IconButton>
            </Box>
            <Typography variant="h1" sx={{ pl: '35px' }}>Expenses I Owe</Typography>
            <TableContainer component={Paper} sx={{ px: '35px', mt: '25px' }}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>To Whom</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Already Paid?</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {amountIOwe.map((value) => (
                    <TableRow
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {value.person}
                      </TableCell>
                      <TableCell align="right">{value.amount}</TableCell>
                      <TableCell align="right">
                        {(value.person === props.user.username) ?
                          <Typography sx={{ color: 'gray' }} >N/A</Typography>
                          : ((!value.paid) ? <a href={`/reconcile/${tripId}`}><Button variant="outlined" sx={{color: 'red', height: "27px"}} onClick={() => sentPayment(value.person)} >Pay</Button></a>
                          : <Typography sx={{ color: '#1DB11D' }}>Paid</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="h1" sx={{ pl: '35px', mt: '50px' }}>Expenses Owed to Me</Typography>
            <TableContainer component={Paper} sx={{ px: '35px', mt: '25px' }}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>From Whom</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Already Paid?</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {amountOwedToMe.map((value) => (
                    <TableRow
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {value.person}
                      </TableCell>
                      <TableCell align="right">{value.amount}</TableCell>
                      <TableCell align="right">
                        {(value.person === props.user.username) ?
                          <Typography sx={{ color: 'gray' }} >N/A</Typography>
                          : ((!value.paid) ? <Typography sx={{ color: '#E2A939' }} >Pending</Typography>
                          : <Typography sx={{color: '#1DB11D'}} >Paid</Typography>
                        )}
                      </TableCell>
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
              <u>Expenses I Owe </u>
            </Typography>
            <table>
              <tr>
                <th>To Whom</th>
                <th>How Much</th>
                <th>Already Paid?</th>
              </tr>
              {amountIOwe.map((value) => (
                <tr>
                  <td>{value.person}</td>
                  <td>{value.amount}</td>
                  <td>
                    {(value.person === props.user.username) ? <p style={{color: 'gray'}} >N/A</p> : ((!value.paid) ? <a href={`/reconcile/${tripId}`}><button style={{color: 'red'}} onClick={() => sentPayment(value.person)} >Pay</button></a> : <p style={{color: 'green'}}>Paid</p>)}
                  </td>
                </tr>
              ))}
            </table>
            <br />
            <Typography paragraph>
              <u>Expenses Owed to Me: </u>
            </Typography>
            <table>
              <tr>
                <th>From Whom?</th>
                <th>How Much?</th>
                <th>Already Paid?</th>
              </tr>
              {amountOwedToMe.map((value) => (
                <tr>
                  <td>{value.person}</td>
                  <td>{value.amount}</td>
                  <td>
                  {(value.person === props.user.username) ? <p style={{color: 'gray'}} >N/A</p> : ((!value.paid) ? <p style={{color: 'yellow'}} >Pending...</p> : <p style={{color: 'green'}} >Paid</p>)}
                  </td>
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

export default ExpenseReconcilePage;
