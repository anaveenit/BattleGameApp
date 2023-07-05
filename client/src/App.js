import React, { useState } from "react";
import axios from "axios";

import {
  TextField,
  Button,
  Grid,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
} from "@material-ui/core";

function App() {
  const [name, setName] = useState("");
  const [gold, setGold] = useState("");
  const [attack, setAttack] = useState("");
  const [hitPoints, setHitPoints] = useState("");
  const [luck, setLuck] = useState("");
  const [token, setToken] = useState("");
  const [attackerId, setAttacker] = useState(1);
  const [defenderId, setDefender] = useState(2);

  const createPlayer = () => {
    axios
      .post(
        "/players",
        { name, gold, attack, hitPoints, luck },
        { headers: { Authorization: token } }
      )
      .then((response) => {
        console.log(response.data);
        // Handle success
      })
      .catch((error) => {
        console.error(error.response.data);
        // Handle error
      });
  };

  const submitBattle = () => {
    axios
      .post(
        "/battles",
        { attackerId, defenderId },
        { headers: { Authorization: token } }
      )
      .then((response) => {
        console.log(response.data);
        // Handle success
      })
      .catch((error) => {
        console.error(error.response.data);
        // Handle error
      });
  };

  const login = () => {
    const credentials = {
      username: "admin",
      password: "password",
    }; // Replace with actual login credentials
    axios
      .post("/auth", credentials)
      .then((response) => {
        console.log(response.data);
        const token = response.data.token;
        setToken(token);
        // Handle success
      })
      .catch((error) => {
        console.error(error.response.data);
        // Handle error
      });
  };

  const retrieveLeaderboard = () => {
    axios
      .get("/leaderboard", { headers: { Authorization: token } })
      .then((response) => {
        console.log(response.data);
        // Handle success
      })
      .catch((error) => {
        console.error(error.response.data);
        // Handle error
      });
  };

  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          ></IconButton>

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My Battle App
          </Typography>
        </Toolbar>
      </AppBar>
      <br></br>
      <br></br>
      <br></br>
      <Grid container spacing={2} justify="center">
        <Grid item xs={12}>
          <TextField
            label="Token"
            variant="outlined"
            size="small"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          &nbsp; &nbsp; &nbsp; &nbsp;
          <Button variant="contained" color="primary" onClick={login}>
            Login
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">Create Player</Typography>
          <TextField
            label="Name"
            variant="outlined"
            size="small"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Gold"
            variant="outlined"
            size="small"
            type="number"
            value={gold}
            onChange={(e) => setGold(e.target.value)}
          />
          <TextField
            label="Attack"
            variant="outlined"
            size="small"
            type="number"
            value={attack}
            onChange={(e) => setAttack(e.target.value)}
          />
          <TextField
            label="Hit Points"
            variant="outlined"
            size="small"
            type="number"
            value={hitPoints}
            onChange={(e) => setHitPoints(e.target.value)}
          />
          <TextField
            label="Luck"
            variant="outlined"
            size="small"
            type="number"
            value={luck}
            onChange={(e) => setLuck(e.target.value)}
          />
          &nbsp; &nbsp; &nbsp; &nbsp;
          <Button variant="contained" color="primary" onClick={createPlayer}>
            Create Player
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">Submit Battle</Typography>
          <TextField
            label="AttackerID"
            variant="outlined"
            size="small"
            type="number"
            value={attackerId}
            onChange={(e) => setAttacker(parseInt(e.target.value))}
          />
          <TextField
            label="DefenderID"
            variant="outlined"
            size="small"
            type="number"
            value={defenderId}
            onChange={(e) => setDefender(parseInt(e.target.value))}
          />
          &nbsp; &nbsp; &nbsp; &nbsp;
          <Button variant="contained" color="primary" onClick={submitBattle}>
            Submit Battle
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">Leaderboard</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={retrieveLeaderboard}
          >
            Retrieve Leaderboard
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
