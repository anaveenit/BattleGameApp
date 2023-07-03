import React, { useState } from "react";
import axios from "axios";

function App() {
  const [name, setName] = useState("");
  const [gold, setGold] = useState("");
  const [attack, setAttack] = useState("");
  const [hitPoints, setHitPoints] = useState("");
  const [luck, setLuck] = useState("");
  const [token, setToken] = useState("");

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
    // Replace attackerId and defenderId with the selected player IDs
    const attackerId = 1;
    const defenderId = 2;

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
    const credentials = { username: "admin", password: "password" }; // Replace with actual login credentials
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
    <div>
      <input
        type="text"
        placeholder="Token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />
      <button onClick={login}>Login</button>

      <h2>Create Player</h2>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="number"
        placeholder="Gold"
        value={gold}
        onChange={(e) => setGold(e.target.value)}
      />
      <input
        type="number"
        placeholder="Attack"
        value={attack}
        onChange={(e) => setAttack(e.target.value)}
      />
      <input
        type="number"
        placeholder="Hit Points"
        value={hitPoints}
        onChange={(e) => setHitPoints(e.target.value)}
      />
      <input
        type="number"
        placeholder="Luck"
        value={luck}
        onChange={(e) => setLuck(e.target.value)}
      />
      <button onClick={createPlayer}>Create Player</button>

      <h2>Submit Battle</h2>
      <button onClick={submitBattle}>Submit Battle</button>

      <h2>Leaderboard</h2>
      <button onClick={retrieveLeaderboard}>Retrieve Leaderboard</button>
    </div>
  );
}

export default App;
