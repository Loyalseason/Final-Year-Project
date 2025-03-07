import React, {useState} from 'react';
import '../App.css'; 
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';



function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}


export default function Login() {
 
 
  const navigate = useNavigate();
  const theme = createTheme();
  const [loggedInUserName, setLoggedInUserName] = useState(null); // State to store the logged-in user's name

  const handleSubmit = (event) => {
    event.preventDefault();
    const userData = new FormData(event.currentTarget);
    fetch('http://localhost:5000/api')
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        if (Array.isArray(data)) {
          let found = false;
          for (let i = 0; i < data.length; i++) {
            if (
              data[i].email === userData.get('email') &&
              data[i].password === userData.get('password')
            ) {
              found = true;
              const loggedInUserFirstName = data[i].firstName;
              setLoggedInUserName(loggedInUserFirstName);
              navigate('/map', { state: { loggedInUserName: loggedInUserFirstName } });
              break;
            }
          }
          if (!found) {
            alert('Invalid Input');
          }
        } else {
          console.log('Invalid response format:', data);
          alert('Invalid response format');
        }
      })
      .catch((error) => {
        console.log('Error:', error);
        alert('An error occurred while fetching the data');
      });
  };
  
  

   return (
    <ThemeProvider theme={theme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: 'url(first-aid-kit-white-background.jpg)',
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div className= 'ambulanceHeader'>
                <h1>Ambulance App</h1>
            </div>
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                className='email'
                id="email" 
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                className='password'
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
              />
              <FormControlLabel 
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              />
              <Button
                type="submit"
                className='submit'
                id='login'
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                // onClick={loginBtn}
              >
                Sign In
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                <Link onClick={() => navigate('/signup')}  className="link" variant="body2">
                {"Don't have an account? Sign Up"} 
                </Link>

                </Grid>
              </Grid>
              <Copyright sx={{ mt: 5 }} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

