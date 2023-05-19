import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import { useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, CardContent, TextField, Typography } from "@mui/material";

import Navbar from "../../sharedComponents/Navbar";

function AddEvent(props) {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const drawerWidth = 200;
  const [errorMessage, setErrorMessage] = useState("");
  const [eventState, setEventState] = useState("Select State");
  const states = ["AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DE", "FL", "GA",
                  "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD",
                  "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH",
                  "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "RI", "SC",
                  "SD", "TN", "TX", "UT", "VA", "VT", "WA", "WI", "WV", "WY"];

  const submitForm = (e) => {
    e.preventDefault();
    const formValues = {};
    for (var element of e.target.elements) {
      if (element.name) {
        formValues[element.name] = element.value;
      }
    }
    if (eventState === "Select State") {
      setErrorMessage("Please select a state!");
    } else {
      formValues['eventState'] = eventState;
      createEvent(formValues);
      navigate('/confirm', {state: {error: errorMessage, referrer: "event", tripId: tripId}});
    }
  }

  const createEvent = async (formValues) => {
    formValues.tripId = tripId;
    
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
    if (resObj.err)
      setErrorMessage(resObj.msg);
    else
      props.setUser(resObj.user)
      setErrorMessage("success");
  }

  return (
    <Box sx={{ display: 'flex' }} >
      <Navbar />
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
      >
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Add an Event
        </Typography>
      </Toolbar>
      </AppBar>
      <Navbar />
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
      >
      <Toolbar />
      <form style={styles.form} onSubmit={submitForm}>
        <TextField sx={styles.field} name="name" label="Event Name" />
        <TextField sx={styles.field} name="eventCity" label="City" />
        <select value={eventState} onChange={e => setEventState(e.target.value)}>
          <option value="">Select State</option>
          {states.map((value) => (
            <option value={value} key={value}>
              {value}
            </option>
          ))}
        </select>
        <TextField sx={styles.field} name="startDate" label="Start Date (MM/DD/YYYY)" />
        <TextField sx={styles.field} name="startTime" label="Start Time (eg. 23:59)" />
        <TextField sx={styles.field} name="endDate" label="End Date (MM/DD/YYYY)" />
        <TextField sx={styles.field} name="endTime" label="End Time (eg. 23:59)" />
        <TextField sx={styles.field} name="cost" label="Cost ($)" />
        <Button type="submit" color="primary" variant="contained">
          Create Event!
        </Button>
      </form>
      <label style={{color: 'red'}}>{errorMessage}</label>
      </Box>
    </Box>
  )
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '50%',
    padding: 10,
    margin: 'auto',
  },
  field: {
    margin: 1
  },
}

export default AddEvent;