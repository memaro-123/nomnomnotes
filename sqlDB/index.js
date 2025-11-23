const sqlite3 = require("sqlite3");
//import './dbSetup.js' if datbase is lost for whatever reason
const db = new sqlite3.Database("../server/my.db", sqlite3.OPEN_READWRITE)