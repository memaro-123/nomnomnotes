// server/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const admin = require("firebase-admin");

const app = express();
app.use(express.json())

dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(
    path.join(__dirname, "service-account.json")
  ),
});


const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

app.post('/login', (req, res) => { //this is from the login form submit
  const { username, password } = req.body// destructures username and passwrd into the new varibales username and pasword
  res.json("recieved")
})

app.listen(PORT, () =>
    console.log(`✅ Server running on http://localhost:${PORT}`)
  );
  