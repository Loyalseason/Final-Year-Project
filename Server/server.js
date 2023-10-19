const fs = require('fs');
const express = require('express');
const http = require('http'); // Import the http module
const socketIO = require('socket.io'); // Import the socket.io library
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const apiKey = 'AIzaSyBvVTA0zQ8dk8R95SaZkxvKOffz4zCYvrI';
const usersFile = 'C:/Users/Loyal_Season/Documents/Documents/Study/Ghana Telecom BIT Course/BIT level 400 SEM 1/Project Work/Project Work Build/Final-Year-Project/Server/users.json';

let users = [];
let esp32Data = null;
let tempBoardData = null;

// Load users from the JSON file
fs.readFile(usersFile, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading users file:', err);
  } else {
    try {
      const parsedData = JSON.parse(data);
      if (Array.isArray(parsedData.users)) {
        users = parsedData.users;
      } else {
        throw new Error('Invalid users data');
      }
    } catch (error) {
      console.error('Error parsing users file:', error);
    }
  }
});


// API endpoint to get the API key
app.get('/apiKey', (req, res) => {
  res.send(apiKey);
});


const delay = async (ms) =>
  new Promise(resolve => setTimeout(resolve, ms))

async function sendData(res)
{
  while (1){
    if (tempBoardData === null)
    {
      res.send("");
      await delay(1000);
      await sendData(res)
    }
    else
    {  
      res.send(tempBoardData);
      tempBoardData = null;
      break;
    }
  }
}

// Sent board data
app.get('/getBoardData', async (req, res) => {
  console.log("inside get Board Data");
  
  while (tempBoardData === null) {
    res.write("");
    await delay(1000);
  }

  res.end(JSON.stringify(tempBoardData));
  tempBoardData = null;
});


// API endpoint to get user data
app.get('/api', (req, res) => {
  res.json(users);
});

// API endpoint to fetch geolocation data
app.get('/geolocation', async (req, res) => {
  try {
    // Fetch geolocation data from external API using apiKey
    const response = await fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    res.json(data.location);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch geolocation data' });
  }
});

app.post('/signUp', (req, res) => {
  try {
    const {firstName, lastName, email, password } = req.body;

    // Create a new user object
    const newUser = { firstName, lastName, email, password };

    // Add the new user to the array
    users.push(newUser);

    // Write the updated users array back to the JSON file
    fs.writeFile(usersFile, JSON.stringify({ users }), 'utf8', (err) => {
      if (err) {
        console.error('Error writing to users file:', err);
        return res.status(500).json({ error: 'Failed to sign up' });
      }

      console.log('User added successfully');

      // Send a success response
      return res.status(200).json({ message: 'User signed up successfully' });
    });
  } catch (error) {
    console.error('Error signing up:', error);
    return res.status(500).json({ error: 'Failed to sign up' });
  }
});


// POST endpoint handling
app.post('/api/messages', (req, res) => { // Modify the route path to '/' or any other desired path
  tempBoardData = esp32Data = req.body;
  console.log('Received POST request with payload:', req.body);
  // Process the payload as needed

  // Send a response
  res.json({ message: 'POST request received successfully.' });
});

// Create an HTTP server
const server = http.createServer(app);

// Attach Socket.IO to the HTTP server
const io = socketIO(server);

// Socket.IO configuration
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle user-specific events
  socket.on('userEvent', (data) => {
    console.log('User event:', data);
    socket.broadcast.emit('userEvent', data);
  });

  // Handle disconnect event
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start the HTTP server
const port = 5000;
server.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});