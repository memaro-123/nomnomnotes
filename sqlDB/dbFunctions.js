const sqlite3 = require("sqlite3");
const { paramExec, fetchAll } = require("./helperFunctions.js");

const intializeUser = async ({ myID, username = "defaultUsername" }) => {
  console.log("Initializing user");
  const db = new sqlite3.Database("my.db");
  try {
    await paramExec(
      db,
      "INSERT OR IGNORE INTO friends (user_id, sent_requests, received_requests, friends, username) VALUES (?, ?, ?, ?, ?)",
      [myID, JSON.stringify([]), JSON.stringify([]), JSON.stringify([]), username]
    );
    console.log("User initialized successfully");
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
};

const autoAcc = async ({ myID, friendID }) => {
  const db = new sqlite3.Database("my.db");
  try {
    const row = await getFirstRow(
      db,
      "SELECT received_requests FROM friends WHERE user_id = ?",
      [myID]
    );
    
    if (!row) {
      console.log(`User with ID ${myID} not found in friends table.`);
      return false;
    }

    const receivedRequests = row.received_requests
      ? JSON.parse(row.received_requests)
      : [];

    if (receivedRequests.includes(friendID)) {
      const myFriendsRow = await getFirstRow(
        db,
        "SELECT friends FROM friends WHERE user_id = ?",
        [myID]
      );

      const myFriends = myFriendsRow?.friends ? JSON.parse(myFriendsRow.friends) : [];
      if (myFriends.includes(friendID)) {
        console.log(`Users ${myID} and ${friendID} are already friends. Removing from received requests.`);
        await removeFromReceivedRequests({ db, userId: myID, friendId: friendID });
        return false;
      }
      await insertNewFriend({ myID, friendID });
      return true;
    }
    return false;
  } catch (err) {
    console.error("Error in auto accepting:", err);
    throw err;
  } finally {
    db.close();
  }
};

const removeFromReceivedRequests = async ({ db, userId, friendId }) => {
  const row = await getFirstRow(
    db,
    "SELECT received_requests FROM friends WHERE user_id = ?",
    [userId]
  );
  
  if (!row || !row.received_requests) return;
  
  let receivedRequests = JSON.parse(row.received_requests);
  receivedRequests = receivedRequests.filter(id => id !== friendId);
  
  await paramExec(
    db,
    "UPDATE friends SET received_requests = ? WHERE user_id = ?",
    [JSON.stringify(receivedRequests), userId]
  );
};

const alreadySentOrFriended = async ({ myID, friendID }) => {
  const db = new sqlite3.Database("my.db");
  try {
    // Use transaction for consistency
    await paramExec(db, "BEGIN TRANSACTION");
    
    const row = await getFirstRow(
      db,
      "SELECT friends, sent_requests FROM friends WHERE user_id = ?",
      [myID]
    );
    
    if (!row) {
      await paramExec(db, "ROLLBACK");
      return false;
    }
    
    const friendsRow = row.friends ? JSON.parse(row.friends) : [];
    const sentRow = row.sent_requests ? JSON.parse(row.sent_requests) : [];

    await paramExec(db, "COMMIT");
    return friendsRow.includes(friendID) || sentRow.includes(friendID);
    
  } catch (err) {
    await paramExec(db, "ROLLBACK");
    console.error("Error checking already sent or friended:", err);
    throw err;
  } finally {
    db.close();
  }
};

const insertRecievedCode = async ({ myID, recievedID }) => {
  const db = new sqlite3.Database("my.db");
  try {
    const row = await getFirstRow(
      db,
      "SELECT received_requests FROM friends WHERE user_id = ?",
      [myID]
    );
    let receivedReqs = row?.received_requests
      ? JSON.parse(row.received_requests)
      : [];
    if (!receivedReqs.includes(recievedID)) {
      receivedReqs.push(recievedID);
    }
    await paramExec(
      db,
      "UPDATE friends SET received_requests = ? WHERE user_id = ?",
      [JSON.stringify(receivedReqs), myID]
    );
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    db.close();
  }
};

const insertNewFriend = async ({ myID, friendID }) => {
  const db = new sqlite3.Database("my.db");
  try {
    await paramExec(db, "BEGIN TRANSACTION");
    
    // Get current state for both users
    const [myRow, friendRow] = await Promise.all([
      getFirstRow(db, "SELECT friends, received_requests FROM friends WHERE user_id = ?", [myID]),
      getFirstRow(db, "SELECT friends, sent_requests FROM friends WHERE user_id = ?", [friendID])
    ]);
    
    if (!myRow || !friendRow) {
      await paramExec(db, "ROLLBACK");
      throw new Error("One or both users not found");
    }
    
    // Process my user
    let myFriends = myRow.friends ? JSON.parse(myRow.friends) : [];
    let myReceivedRequests = myRow.received_requests ? JSON.parse(myRow.received_requests) : [];
    
    // Remove from received requests if present
    myReceivedRequests = myReceivedRequests.filter(id => id !== friendID);
    
    // Add to friends if not already
    if (!myFriends.includes(friendID)) {
      myFriends.push(friendID);
    }
    
    // Process friend user
    let theirFriends = friendRow.friends ? JSON.parse(friendRow.friends) : [];
    let theirSentRequests = friendRow.sent_requests ? JSON.parse(friendRow.sent_requests) : [];
    
    // Remove from sent requests if present
    theirSentRequests = theirSentRequests.filter(id => id !== myID);
    
    // Add to friends if not already
    if (!theirFriends.includes(myID)) {
      theirFriends.push(myID);
    }
    
    // Update both users atomically
    await Promise.all([
      paramExec(db, 
        "UPDATE friends SET friends = ?, received_requests = ? WHERE user_id = ?",
        [JSON.stringify(myFriends), JSON.stringify(myReceivedRequests), myID]
      ),
      paramExec(db,
        "UPDATE friends SET friends = ?, sent_requests = ? WHERE user_id = ?",
        [JSON.stringify(theirFriends), JSON.stringify(theirSentRequests), friendID]
      )
    ]);
    
    await paramExec(db, "COMMIT");
    console.log(`Successfully added friendship between ${myID} and ${friendID}`);
    
  } catch (err) {
    // Rollback on error
    await paramExec(db, "ROLLBACK").catch(rollbackErr => {
      console.error("Failed to rollback transaction:", rollbackErr);
    });
    
    console.error("Error in insertNewFriend:", err);
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
    return !!row;
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    db.close();
  }
};

const sendFriendRequest = async ({ myID, friendID }) => {
  const db = new sqlite3.Database("my.db");
  
  try {
    // Validate users exist
    const [userExists1, userExists2] = await Promise.all([
      userExists({ id: myID }),
      userExists({ id: friendID })
    ]);
    
    if (!userExists1 || !userExists2) {
      throw new Error("One or both users do not exist");
    }
    
    // Check if already friends or request sent
    const alreadyConnected = await alreadySentOrFriended({ myID, friendID });
    if (alreadyConnected) {
      throw new Error("Already connected or request pending");
    }
    
    // Check for auto-accept
    const shouldAutoAccept = await autoAcc({ myID, friendID });
    if (shouldAutoAccept) {
      return { success: true, autoAccepted: true };
    }
    
    // Send request
    await insertSentCode({ myID, sentID: friendID });
    await insertRecievedCode({ myID: friendID, recievedID: myID });
    
    return { success: true, autoAccepted: false };
    
  } catch (err) {
    console.error("Error sending friend request:", err);
    throw err;
  } finally {
    db.close();
  }
}

const insertEntry = async (entryData) => {

  console.log('received data', entryData)
  const {
    user_id,
    title,
    selectedCuisines,
    location,
    place_id,
    lat,
    lng,
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
    const year = pstDate.getFullYear();
    const month = String(pstDate.getMonth() + 1).padStart(2, '0');
    const day = String(pstDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // YYYY-MM-DD format
  };

  const date = getPSTDateString();

  const db = new sqlite3.Database("my.db");
  const sql = `INSERT INTO diary_entries(
  user_id,
  title,
  selected_cuisines,
  location,
  place_id,
  lat,
  lng,
  selected_prices,
  selected_labels,
  images,
  notes,
  taste,
  service,
  value,
  date
 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  try {
    await paramExec(db, sql, [
      user_id,
      title,
      selectedCuisines,
      location,
      place_id,
      lat,
      lng,
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
    place_id,
    lat,
    lng,
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
  place_id = ?,
  lat = ?,
  lng = ?,
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
      place_id,
      lat,
      lng,
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
        place_id: row.place_id,
        lat: row.lat,
        lng: row.lng,
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

const insertWishlist = async (wishlistData) => {
  const {
    user_id,
    name,
    location,
    vicinity,
    distance,
    cuisine,
    price_level,
    labels,
    notes,
    taste,
    service,
    value,
    images
  } = wishlistData;

  const getPSTDateString = () => {
    const now = new Date();
    const pstDate = new Date(
      now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    );
    const month = String(pstDate.getMonth() + 1).padStart(2, '0');
    const day = String(pstDate.getDate()).padStart(2, '0');
    const year = pstDate.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const date = getPSTDateString();

  const db = new sqlite3.Database("my.db");
  const sql = `
    INSERT INTO wishlist (
      user_id,
      name,
      location,
      vicinity,
      distance,
      cuisine,
      price_level,
      labels,
      notes,
      taste,
      service,
      value,
      images,
      date
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    await paramExec(db, sql, [
      user_id,
      name,
      location,
      vicinity,
      distance,
      cuisine,
      price_level,
      labels,
      notes,
      taste,
      service,
      value,
      images,
      date
    ]);
  } catch (err) {
    console.log(err);
  } finally {
    db.close();
  }
};

const getWishlistByUser = async (userId) => {
  const db = new sqlite3.Database("my.db");
  const sql = `
    SELECT *
    FROM wishlist
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  try {
    const rows = await fetchAll(db, sql, [userId]);
    return rows.map(r => {
      if (r.types) r.types = JSON.parse(r.types);
      return r;
    });
  } catch (err) {
    console.log("getWishlistByUser error:", err);
    throw err;
  } finally {
    db.close();
  }
};


const deleteWishlistEntry = async (id, userId) => {
  const db = new sqlite3.Database("my.db");
  const sql = `DELETE FROM wishlist WHERE id = ? AND user_id = ?`;

  try {
    await paramExec(db, sql, [id, userId]);
  } catch (err) {
    console.log("deleteWishlistEntry error:", err);
    throw err;
  } finally {
    db.close();
  }
};

const getVisitedPlaceIds = async (userId) => {
  const db = new sqlite3.Database("my.db");
  const sql = `SELECT place_id FROM diary_entries WHERE user_id = ?`;

  try {
    const rows = await fetchAll(db, sql, [userId]);
    return rows.map(r => r.place_id);
  } catch (err) {
    console.log("getVisitedPlaceIds error:", err);
    return [];
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
  insertWishlist,
  getWishlistByUser,
  deleteWishlistEntry,
  getVisitedPlaceIds, 
  sendFriendRequest,
  removeFromReceivedRequests
};
