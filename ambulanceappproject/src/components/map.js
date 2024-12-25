import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
import RoomRoundedIcon from '@mui/icons-material/RoomRounded';
import LogoutIcon from '@mui/icons-material/Logout';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Loader } from '@googlemaps/js-api-loader';
import '../App.css';

function Map({ apiKey }) {
  const [map, setMap] = useState(null);
  const [infoWindow, setInfoWindow] = useState(null);
  const [position, setPosition] = useState(null);
  const [searchMarker, setSearchMarker] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const location = useLocation();
  const { loggedInUserName } = location.state || {};
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fetchedData, setFetchedData] = useState('');
  const [isLoaded, setIsLoaded] = useState(false); // Loading state
  const navigate = useNavigate();
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [searchInputValue, setSearchInputValue] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);


  useEffect(() => {
    const loader = new Loader({
      apiKey: apiKey,
      version: 'weekly',
    });

    loader.load().then(() => {
      const google = window.google;
      const map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 5.6500, lng: -0.1000 },
        zoom: 13,
      });
      setMap(map);
      setInfoWindow(new google.maps.InfoWindow());
      setDirectionsRenderer(new google.maps.DirectionsRenderer());
  
 // Get user's location and set it as the center of the map
 const geolocate = async () => {
        
  try {
    const response = await fetch('http://localhost:5000/geolocation', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    const { lat, lng } = data;
    const userLocation = new google.maps.LatLng(lat, lng);
    map.setCenter(userLocation);
    const userMarker = new google.maps.Marker({
      position: userLocation,
      map: map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: 'rgb(0, 126, 236) ',
        fillOpacity: 0.98,
        strokeColor: 'white',
        strokeWeight: 1,
        scale: 10,
      },
    });
    // Recenter the map to the user's location on button click
    const locationBtn = document.querySelector('.location-btn');
    locationBtn.addEventListener('click', () => {
      map.setCenter(userLocation);
    });

    setPosition({ coords: { latitude: lat, longitude: lng } });
  } catch (error) {
    console.error(error);
  }
};

geolocate();
});
}, [apiKey]);
  

const handleSearch = async (event) => {
  event.preventDefault();
  const searchQuery = searchInputValue;

  if (searchQuery) {
    const latLngPattern = /^([-+]?\d+(\.\d+)?),\s*([-+]?\d+(\.\d+)?)$/; // Regular expression for latitude and longitude

    if (latLngPattern.test(searchQuery)) {
      // If the input matches latitude and longitude format
      const [lat, lng] = searchQuery.split(',').map((str) => parseFloat(str.trim()));

      if (!isNaN(lat) && !isNaN(lng)) {
        const google = window.google;
        const searchedLocation = new google.maps.LatLng(lat, lng);
        map.setCenter(searchedLocation);

        // Remove previous search marker if it exists
        if (searchMarker) {
          searchMarker.setMap(null);
        }

        const marker = new google.maps.Marker({
          position: searchedLocation,
          map: map,
          icon: {
            url: RoomRoundedIcon,
            anchor: new google.maps.Point(15, 30),
            scaledSize: new google.maps.Size(30, 30),
          },
        });

        setSearchMarker(marker);
      } else {
        // Handle invalid latitude and longitude format
        console.error('Invalid latitude and longitude format:', searchQuery);
      }
    } else {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            searchQuery
          )}&key=${apiKey}`
        );
        const data = await response.json();

        if (data.results.length > 0) {
          const google = window.google;
          const location = data.results[0].geometry.location;
          const searchedLocation = new google.maps.LatLng(location.lat, location.lng);
          map.setCenter(searchedLocation);

          // Remove previous search marker if it exists
          if (searchMarker) {
            searchMarker.setMap(null);
          }

          const marker = new google.maps.Marker({
            position: searchedLocation,
            map: map,
            icon: {
              url: RoomRoundedIcon,
              anchor: new google.maps.Point(15, 30),
              scaledSize: new google.maps.Size(30, 30),
            },
          });

          setSearchMarker(marker);
        } else {
          // Handle case when no results are found for the search query
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
};


  const handleDrive = () => {
    if (position && searchMarker) {
      const google = window.google;
      const currentPosition = new google.maps.LatLng(
        position.coords.latitude,
        position.coords.longitude
      );
      const destination = searchMarker.getPosition();

      const directionsService = new google.maps.DirectionsService();

      const request = {
        origin: currentPosition,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
        avoidTolls: true,
        avoidHighways: true,
      };

      directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          directionsRenderer.setMap(map);
          directionsRenderer.setDirections(result);
        } else {
          console.error('Error calculating directions:', status);
        }
      });
    }
  };


  async function esp32Data() {
    try {
      let response = await fetch('http://localhost:5000/getBoardData');
      let data = await response.text();
      console.log('Received data:', data); // Add this line
      setFetchedData(data);
      setDialogOpen(true);
      setIsLoaded(true); // Set isLoaded to true when data is fetched
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }


    // Function to send a request to the first available user
    const sendRequestToAvailableUser = (requestData) => {
      if (availableUsers.length > 0) {
        const nextUser = availableUsers[0]; // Get the first available user
        // You can implement the logic to send the request to nextUser on the backend
        // Update the user's availability status when the request is sent
        // Handle user acceptance or rejection of the request
        console.log(`Sending request to ${nextUser}`);
      } else {
        // Handle the case when no available users are found
        console.log('No available users to send requests to.');
      }
    };
  
    // Function to add a user to the list of available users
    const addUserToAvailableList = (username) => {
      setAvailableUsers([...availableUsers, username]);
    };
  
    // Function to remove a user from the list of available users
    const removeUserFromAvailableList = (username) => {
      const updatedUsers = availableUsers.filter((user) => user !== username);
      setAvailableUsers(updatedUsers);
    };


const handleAccept = () => {
  // Perform actions when user accepts the data
  setDialogOpen(false);
  removeUserFromAvailableList(loggedInUserName); // Remove the user from the available list

  // Define your request data here
  const requestData = {
    // Define the properties of your request data
    // For example:
    requestType: 'SomeType',
    message: 'This is a request message',
    // ... other properties
  };

  sendRequestToAvailableUser(requestData); // Send the request to the next available user
};



const handleDecline = () => {
  // Perform actions when user declines the data
  setDialogOpen(false);
};



// Refresh

useEffect(() => {

  esp32Data();

  // Set up an interval to refresh the data every 30 seconds
  const refreshInterval = setInterval(() => {
    esp32Data();
  }, 10 * 1000);

  // Clean up the interval when the component unmounts or when the useEffect dependencies change
  return () => {
    clearInterval(refreshInterval);
  };
}, [refreshCounter]);



//log-out
const handleLogout = () => {
  // Perform any logout logic you need here
   
  // Navigate the user to the sign-in page using the navigate function
  navigate('/'); // Change '/signin' to the actual route of your sign-in page
};

const clearDirectionsAndSearch = () => {
  if (directionsRenderer) {
    directionsRenderer.setMap(null); // Clear directions from the map
  }
  if (searchMarker) {
    searchMarker.setMap(null); // Clear the search marker from the map
  }
  setSearchInputValue(''); // Clear the search input value
}


  return (
    <div className="full-content">
      <div id="map" style={{ width: '100%', height: '550px' }}></div>

      <h2 className="usersName">Welcome, <span>{loggedInUserName}</span></h2>

      <form onSubmit={handleSearch}>
        <div className="search-area">
          <div className="search-bar">
            <TextField id="search" label="Search" variant="outlined" size="small" className="searchInput"   value={searchInputValue}
  onChange={(event) => setSearchInputValue(event.target.value)} />
          </div>
          <button type="submit" className="search-button">
            Search
          </button>
          <button onClick={clearDirectionsAndSearch} className="search-button">
            Clear
          </button>
        </div>
      </form>

      <div className="full-BtnContent">
        <div className="driveBtnContent">
          <button className="btnDrive location-btn">
            <MyLocationRoundedIcon />
          </button>
          <h3>Location</h3>
        </div>

        <div className="driveBtnContent">
          <button className="btnDrive" onClick={handleDrive}>
            <DirectionsCarFilledRoundedIcon />
          </button>
          <h3>Drive</h3>
        </div>

        <div className="driveBtnContent">
          <button className="btnDrive" onClick={handleLogout}>
            <LogoutIcon />
          </button>
          <h3>Log Out</h3>
        </div>

      </div>
      {isLoaded && (
  <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
    <DialogContent>
      <h2>EMERGENCY</h2>
      <div>
        {Object.entries(JSON.parse(fetchedData)).map(([key, value], index) => (
          <div key={index}>
            <strong>{key}:</strong> {value}
          </div>
        ))}
      </div>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleAccept} color="primary">
        Accept
      </Button>
      <Button onClick={handleDecline} color="secondary">
        Decline
      </Button>
    </DialogActions>
  </Dialog>
)}






    </div>
  );


}

export default Map