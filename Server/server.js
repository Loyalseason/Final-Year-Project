const express = require('express');
const port = 5000;
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.static('public'));

const apiKey = 'AIzaSyAN7P8ZpjtpK2ZxDjgWbGwTgc5Mz-aRIe4';

// Store user data in an array
const users = [
  { email: 'user1@example.com', password: 'password1' },
  { email: 'user2@example.com', password: 'password2' },
];

// Store user connections in an array
const userConnections = [];

// API endpoint to get the API key
app.get('/apiKey', (req, res) => {
  res.send(apiKey);
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

// Socket.IO configuration
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});

const io = require('socket.io')(server);

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Store the socket connection in userConnections array
  userConnections.push(socket);

  // Handle user-specific events
  socket.on('userEvent', (data) => {
    // Handle user-specific event here
    console.log('User event:', data);

    // Emit the event to other clients
    socket.broadcast.emit('userEvent', data);
  });

  // Handle disconnect event
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);

    // Remove the socket connection from userConnections array
    const index = userConnections.indexOf(socket);
    if (index !== -1) {
      userConnections.splice(index, 1);
    }
  });
});
