import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import SignUp from './components/signUp';
import Map from './components/map';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [loggedInUserName, setLoggedInUserName] = useState(null);
  async function fetchData() {
    try {
      const response = await fetch('http://172.20.10.6:5000/apiKey');
      const data = await response.text();
      setApiKey(data); // Assign the fetched data to the apiKey state
    } catch (error) {
      console.log('Error:', error);
    }
  }
  
  useEffect(() => {
     fetchData(); // Call the fetchData function when the component mounts
  }, []);

  return (
    <React.StrictMode>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/map" element={apiKey ? <Map apiKey={apiKey} loggedInUserName={loggedInUserName} /> : null} />
        </Routes>
      </Router>
    </React.StrictMode>
  );
}

export default App;
