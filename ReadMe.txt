# Battle Game App

This is a Battle Game App developed using Node.js, React.js, and MySQL.

## Prerequisites

- Node.js
- React.js
- MySQL

## Installation

1. Install MySQL on your computer and create a new database called "battle".

   ```sql
   CREATE DATABASE battle;


2.Update the following MySQL connection details in the server/db.js file:

const connection = mysql.createConnection({
  host: "localhost", //same as localhost or your IP address
  port: 3306, // port number of your MySQL 
  user: "root", // username of MySQL db
  password: "navsat3426", // password of MySQL db
  database: "battle", , // you would have created this already. refer step 1
});

Install the server dependencies:

cd server/src
npm install
npm start

Install the client dependencies:

cd client
npm install
npm start


launch localhost:3000 in your browser to run


Testing :

To run the server tests, open a terminal and navigate to server/src, then run:

npx mocha battle.test.js



Usage:

1.  Create a new player:

Method: POST
Endpoint: /players
Request body:
{
  "name": "John Doe",
  "gold": 100,
  "attack": 50,
  "hitPoints": 100,
  "luck": 10
}

2.  Queue a battle:

Method: POST
Endpoint: /battles
Request body:
{
  "attackerId": "player1Id",
  "defenderId": "player2Id"
}

3.  Retrieve the leaderboard:

Method: GET
Endpoint: /leaderboard




Authentication:
The application uses JSON Web Tokens (JWT) for authentication. To obtain a token, send a POST request to the /auth endpoint with the following credentials:

Username: admin
Password: password
The token will be returned in the response, which can then be used to authorize subsequent requests by including it in the Authorization header as follows:

Authorization:  <token>












