// server/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const admin = require("firebase-admin");

// TODO: Replace the following with your app's Firebase configuration




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
  const { email, password } = req.body// destructures email and passwrd into the new varibales email and pasword
  res.json("recieved")
})
app.post('/register', (req, res) => { //need to do server bullshit
  const { email, password } = req.body// 
  res.json("registered")
})

app.listen(PORT, () =>
    console.log(`✅ Server running on http://localhost:${PORT}`)
  );
  