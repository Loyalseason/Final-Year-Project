import React, { useState, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
import RoomRoundedIcon from '@mui/icons-material/RoomRounded';
import { Typography, Link, TextField } from '@mui/material';
import '../App.css';

function Map({ apiKey }) {
  const [map, setMap] = useState(null);
  const [infoWindow, setInfoWindow] = useState(null);
  const [position, setPosition] = useState(null);
  const [searchMarker, setSearchMarker] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);

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
          const response = await fetch('http://172.20.10.4:5000/geolocation', {
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
              fillColor: 'blue',
              fillOpacity: 0.7,
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
    const searchQuery = event.target.elements.search.value;

    if (searchQuery) {
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

  return (
    <div className="full-content">
      <div id="map" style={{ width: '100%', height: '550px' }}></div>

      <form onSubmit={handleSearch}>
        <div className="search-area">
          <div className="search-bar">
            <TextField id="search" label="Search" variant="outlined" size="small" className="searchInput" />
          </div>
          <button type="submit" className="search-button">
            Search
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
      </div>
    </div>
  );
}

export default Map;






















// import { useState, useEffect } from 'react';

// function Map() {
//   const [position, setPosition] = useState(null);

//   useEffect(() => {
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         setPosition(position);
//       },
//       (error) => {
//         console.error(error);
//       }
//     );
//   }, []);

//   useEffect(() => {
//     if (position) {
//       console.log(position.coords.latitude, position.coords.longitude);
//     }
//   }, [position]);

//   return (
//     <div>
//       <p>Current Latitude: {position?.coords.latitude}</p>
//       <p>Current Longitude: {position?.coords.longitude}</p>
//     </div>
//   );
// }

// export default Map;
