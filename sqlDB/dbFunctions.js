const sqlite3 = require("sqlite3");
const { paramExec, fetchAll } = require("./helperFunctions.js");
const intializeUser = async ({ myID, username = "defaultUsername" }) => {
  console.log("this shits going don")
  const db = new sqlite3.Database("my.db");
  try {
    await paramExec(
      db,
      "INSERT OR IGNORE INTO friends (user_id, sent_requests, received_requests, friends, username) VALUES (?, ?, ?, ?, ?)",
      [myID, JSON.stringify([]), JSON.stringify([]), JSON.stringify([]), username]
    );
    console.log("we just added that shit on everything")
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    db.close();
  }
};

const insertSentCode = async ({ myID, sentID }) => {
  const db = new sqlite3.Database("my.db");
  try {
    const row = await getFirstRow(
      db,
      "SELECT sent_requests FROM friends WHERE user_id = ?",
      [myID]
    );
    let sentRequests = row?.sent_requests ? JSON.parse(row.sent_requests) : [];
    if (!sentRequests.includes(sentID)) {
      sentRequests.push(sentID);
    }
    await paramExec(
      db,
      "UPDATE friends SET sent_requests = ? WHERE user_id = ?",
      [JSON.stringify(sentRequests), myID]
    );
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    db.close();
  }
}
const autoAcc = async ({ myID, friendID }) => {
  const db = new sqlite3.Database("my.db");
  try{
  
  const row = await getFirstRow(
    db,
    "SELECT received_requests FROM friends WHERE user_id = ?",
    [myID]
  )
  const receivedRequests = row?.received_requests
    ? JSON.parse(row.received_requests)
    : []

  if (receivedRequests.includes(friendID)) {
    await insertNewFriend({ myID, friendID })
    return true
  }
  else {
    return false
  }
  } catch (err) {
    console.error("Error in auto accepting:", err);
    throw err
  } finally{
    db.close()
  }
}
const alreadySentOrFriended = async ({ myID, friendID }) => {
  const db = new sqlite3.Database("my.db");
  try{
  const row = await getFirstRow(
    db,
    "SELECT friends, sent_requests FROM friends WHERE user_id = ?",
    [myID]
  )
  const friendsRow =row?.friends? JSON.parse(row.friends): []
  const sentRow =row?.sent_requests? JSON.parse(row.sent_requests): []

  if (friendsRow.includes(friendID)) {
    return true
  }
  if (sentRow.includes(friendID)) {
    return true
  }
  
    return false
  
  } catch (err) {
    console.error("Error in checking alreadySentOrFriended typeshit:", err);
    throw err
  } finally{
    db.close()
  }
}
const insertRecievedCode = async ({ myID, recievedID }) => {
  const db = new sqlite3.Database("my.db");
  try {
    const row = await getFirstRow(
      db,
      "SELECT received_requests FROM friends WHERE user_id = ?",
      [myID]
    );
    let recievedReqs = row?.received_requests
      ? JSON.parse(row.received_requests)
      : [];
    if (!recievedReqs.includes(recievedID)) {
      recievedReqs.push(recievedID);
    }
    await paramExec(
      db,
      "UPDATE friends SET received_requests = ? WHERE user_id = ?",
      [JSON.stringify(recievedReqs), myID]
    );
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    db.close();
  }
};
const insertNewFriend = async ({ myID, friendID }) => {
  //this function operates under the assumption that this is an accepted request from a stranger
  const db = new sqlite3.Database("my.db");
  try {
    const myRow = await getFirstRow(
      db,
      "SELECT friends FROM friends WHERE user_id = ?",
      [myID]
    );
    let myFriends = myRow?.friends ? JSON.parse(myRow.friends) : [];
    let myRecievedReqs = myRow?.received_requests
      ? JSON.parse(myRow.received_requests)
      : [];
    if (myRecievedReqs.includes(friendID)) {
      myRecievedReqs = myRecievedReqs.filter((id) => id !== friendID);
    }

    if (!myFriends.includes(friendID)) {
      myFriends.push(friendID);
    }

    await paramExec(
      db,
      "UPDATE friends SET friends = ?, received_requests = ? WHERE user_id = ?",
      [JSON.stringify(myFriends), JSON.stringify(myRecievedReqs), myID]
    );

    const friendsRow = await getFirstRow(
      db,
      "SELECT friends, sent_requests FROM friends WHERE user_id = ?",
      [friendID]
    );
    let theirFriends = friendsRow?.friends
      ? JSON.parse(friendsRow.friends)
      : [];
    if (!theirFriends.includes(myID)) {
      theirFriends.push(myID);
    }
    let theirSentReqs = friendsRow?.sent_requests
      ? JSON.parse(friendsRow.sent_requests)
      : [];
    if (theirSentReqs.includes(myID)) {
      theirSentReqs = theirSentReqs.filter((id) => id !== myID);
    }
    await paramExec(
      db,
      "UPDATE friends SET friends = ? , sent_requests = ? WHERE user_id = ?",
      [JSON.stringify(theirFriends), JSON.stringify(theirSentReqs), friendID]
    );
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    db.close();
  }
};
const userExists = async ({ id }) => {
  const db = new sqlite3.Database("my.db");
  try {
    const row = await getFirstRow(
      db,
      "SELECT user_id FROM friends WHERE user_id = ?",
      [id]
    );
    if (!row) {
      return false;
    } else {
      return true;
    }
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    db.close();
  }
};
const insertEntry = async (entryData) => {

  console.log('received data', entryData)
  const {
    user_id,
    title,
    selectedCuisines,
    location,
    selectedPrices,
    selectedLabels,
    images,
    notes,
    taste,
    service,
    value
  } = entryData;

  const getPSTDateString = () => {
    const now = new Date();
    const pstDate = new Date(now.toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
    const month = String(pstDate.getMonth() + 1).padStart(2, '0');
    const day = String(pstDate.getDate()).padStart(2, '0');
    const year = pstDate.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const date = getPSTDateString();

  const db = new sqlite3.Database("my.db");
  const sql = `INSERT INTO diary_entries(
  user_id,
  title,
  selected_cuisines,
  location,
  selected_prices,
  selected_labels,
  images,
  notes,
  taste,
  service,
  value,
  date
 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  try {
    await paramExec(db, sql, [
      user_id,
      title,
      selectedCuisines,
      location,
      selectedPrices,
      selectedLabels,
      images,
      notes,
      taste,
      service,
      value,
      date
    ]);
  } catch (err) {
    console.log(err);
  } finally {
    db.close();
  }
};
const editEntry = async (entryData) => {
  console.log('recieved edit entry data',entryData)

  const {
    user_id,
    id,
    title,
    selectedCuisines,
    location,
    selectedPrices,
    selectedLabels,
    images,
    notes,
    taste,
    service,
    value
  } = entryData;

  const db = new sqlite3.Database("my.db")
  // const validateArray = (arr) => {
  //   if(!Array.isArray(arr)) throw new Error("Invalid array");
  //   return arr.filter(item => typeof item === 'string' && item.length < 100);
  // }; this is getting rid of images just cuz the length of the string is over 100 ... which is not good

  const imagesStr = JSON.stringify(images)
  console.log('imagesStr in edit entry:', imagesStr)

  const sql = `UPDATE diary_entries SET 
  title = ?, 
  selected_cuisines = ?,
  location = ?,
  selected_prices = ?, 
  selected_labels = ?, 
  images = ?, 
  notes = ?, 
  taste = ?, 
  service = ?, 
  value = ?
  WHERE id = ?`;
  try {
    await paramExec(db, sql,[
      title,
      selectedCuisines,
      location,
      selectedPrices,
      selectedLabels,
      imagesStr,
      notes,
      taste,
      service,
      value,
      id
    ]);
  } catch (err) {
    console.log(err);
  } finally {
    db.close();
  }
};

const getEntry = async (entryID) => {
  const db = new sqlite3.Database("my.db");
  const sql = `SELECT * FROM diary_entries WHERE id = ?`;
  try {
    const row = await getFirstRow(db, sql, [entryID]);
    if (row) {
      row.selectedCuisines = JSON.parse(row.selected_cuisines);
      row.selectedLabels = JSON.parse(row.selected_labels);
      row.images = JSON.parse(row.images);
      row.location = JSON.parse(row.location);
    }
    return row;
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    db.close();
  }
};

const getAllEntries = async (userId) => {
  const db = new sqlite3.Database("my.db");
  const sql = `SELECT * FROM diary_entries WHERE user_id = ?`;

  try {
    const rows = await fetchAll(db, sql, [userId]);
    const parsedRows = rows.map((row) => {
      return {
        id: row.id,
        user_id: row.user_id,
        title: row.title,
        selectedCuisines: JSON.parse(row.selected_cuisines || "[]"),
        selectedLabels: JSON.parse(row.selected_labels || "[]"),
        selectedPrices: row.selected_prices,
        location: JSON.parse(row.location),
        images: JSON.parse(row.images),
        notes: row.notes,
        taste: row.taste,
        service: row.service,
        value: row.value,
        date: row.date,
      }
    });

    return parsedRows;
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    db.close();
  }
};
const deleteEntry = async (id, userId) => {
  const db = new sqlite3.Database("my.db");
  const sql = `DELETE FROM diary_entries WHERE id = ? AND user_id = ?`;
  try {
    await paramExec(db, sql, [id, userId]);
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    db.close();
  }
}
const getUserByUID = async (uid) => {
  const db = new sqlite3.Database("my.db");
  const sql = `SELECT username, permissions FROM users WHERE uid = ?`;
  try {
    const row = await getFirstRow(db, sql, [uid]);
    return row;
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    db.close();
  }
}
function execute(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}
const getFriends = async (myID) => {
  const db = new sqlite3.Database("my.db");
  try{
    const row = await getFirstRow(
      db,
      "SELECT friends FROM friends WHERE user_id = ?",
      [myID]
    );
    const friendIds = row?.friends ? JSON.parse(row.friends) : [];
    if (friendIds.length === 0) {
      return [];
    }
    return friendIds;
  
  }catch(err){
    console.error(err);
    throw err;
  }finally{
    db.close();
  }
}
const getRecieved = async (myID) => {
  const db = new sqlite3.Database("my.db");
  try{
    const row = await getFirstRow(
      db,
      "SELECT received_requests FROM friends WHERE user_id = ?",
      [myID]
    );
    const recievedReqs = row?.received_requests ? JSON.parse(row.received_requests) : [];
    if (recievedReqs.length === 0) {
      return [];
    }
    return recievedReqs;
  
  }catch(err){
    console.error(err);
    throw err;
  }finally{
    db.close();
  }
}

const getFirstRow = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};
const updateUsername = async ({ myID, newName }) => {
  const db = new sqlite3.Database("my.db");
  try {
    await paramExec(
      db,
      "UPDATE friends SET username = ? WHERE user_id = ?",
      [newName, myID]
    );
    console.log(`Username updated to "${newName}" for user ID ${myID}`);
  } catch (err) {
    console.error("Error updating username:", err);
    throw err;
  } finally {
    db.close();
  }
};
const getUsername = async (id ) => {
  const db = new sqlite3.Database("my.db");
  try {
    const row = await getFirstRow(db, "SELECT username FROM friends WHERE user_id = ?", [id]);
    return row?.username || null;
  } catch (err) {
    console.error("Error getting username:", err);
    throw err;
  } finally {
    db.close();
  }
};
const usernameExists = async (username) => {
  const db = new sqlite3.Database("my.db");
  try {
    const row = await getFirstRow(
      db,
      "SELECT user_id FROM friends WHERE username = ?",
      [username]
    );
    return !!row; 
  } catch (err) {
    console.error("error checking username exists:", err);
    throw err;
  } finally {
    db.close();
  }
};


module.exports = {
  insertEntry,
  editEntry,
  getEntry,
  usernameExists,
  getUsername,
  getAllEntries,
  updateUsername,
  deleteEntry,
  execute,
  insertSentCode,
  insertNewFriend,
  insertRecievedCode,
  userExists,
  intializeUser,
  autoAcc,
  alreadySentOrFriended,
  getUserByUID,
  getFirstRow,
  getFriends,
  getRecieved,
  fetchAll,
};
