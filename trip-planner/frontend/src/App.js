import React, { useState, useEffect } from "react";
import socketClient from "./sharedComponents/Socket"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useParams,
  useNavigate
} from "react-router-dom";
import { Container } from "@mui/material";
import TripsPage from './pages/TripsPage';
import TripPage from './pages/TripPage';
import CreateTripPage from './pages/CreateTripPage';
import HomePage from './pages/HomePage';
import FinancesPage from './pages/FinancesPage';
import ExpenseReportPage from './pages/ExpenseReportPage';
import ExpenseReconcilePage from './pages/ExpenseReconcilePage';
import LoginRegisterPage from './pages/LoginRegisterPage';
import TripConfirmPage from './pages/TripConfirmPage';
import AddEventPage from './pages/AddEventPage';
import MapPage from './pages/MapPage';
import FriendsPage from './pages/FriendsPage';
import PhotosPage from './pages/PhotosPage';
import TripPhotosPage from './pages/TripPhotosPage';
import EventsPage from './pages/EventsPage';
import { styled } from '@mui/system';

function App() {
  const [user, setUser] = useState(window.sessionStorage.getItem('user') ? JSON.parse(window.sessionStorage.getItem('user')) : null);

  return (
    <Router>
      <Routes>
        <Route path="/" element ={user ? <TripsPage user={user} /> : <Navigate to="/login" />} />
        <Route path="/login" element={<LoginRegisterPage user={user} setUser={setUser} />} />
        <Route path="/logout" element={<Logout user={user} setUser={setUser} />} />
        <Route path="/register" element={<LoginRegisterPage user={user} setUser={setUser} register />} />
        <Route path='/trips' element={<TripsPage user={user} />} />
        <Route path='/trips/:tripId' element={<TripPage user={user} />} />
        <Route path='/events/:tripId' element={<EventsPage user={user} />} />
        <Route path='/create' element={<CreateTripPage user={user} />} />
        <Route path='/confirm' element={<TripConfirmPage user={user} />} />
        <Route path='/map' element={<MapPage user={user} />} />
        <Route path='/finances' element={<FinancesPage user={user}/>} />
        <Route path='/expenses/:tripId' element={<ExpenseReportPage user={user} />} />
        <Route path='/reconcile/:tripId' element={<ExpenseReconcilePage user={user} />} />
        <Route path='/friends' element={<FriendsPage user={user} />} />
        <Route path='/photos' element={<PhotosPage user={user} />} />
        <Route path='/photos/:tripId' element={<TripPhotosPage user={user} />} />
        <Route path='/addEvent/:tripId' element={<AddEventPage user={user} />} />
      </Routes>
    </Router>
  );
}

// Logout component here just redirects back to login after you log out
const Logout = (props) => {
  const logout = async () => {
    await fetch(`http://localhost:5000/api/users/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Credentials': true
      },
    });
    props.setUser(null);
    window.sessionStorage.clear()
  }
  logout();
  if (!props.user)
    return <Navigate to="/" />
  return null;
}

export default App;
