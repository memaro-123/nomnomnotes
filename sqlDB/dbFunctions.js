const sqlite3 = require("sqlite3");
const { paramExec, fetchAll, fetchFirst } = require("./helperFunctions.js");

const insertEntry = async ({
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
}) => {
  const cuisinesStr = JSON.stringify(selectedCuisines)
  const labelsStr = JSON.stringify(selectedLabels)
  const imagesStr = JSON.stringify(images)
  const locationStr = JSON.stringify(location)

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
  value
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  try {
    await paramExec(db, sql, [
      user_id,
      title,
      cuisinesStr,
      locationStr,
      selectedPrices,
      labelsStr,
      imagesStr,
      notes,
      taste,
      service,
      value
    ])
  } catch (err) {
    console.log(err);
  } finally {
    db.close();
  }
}

const editEntry = async ({
  id,
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
}) => {
  const db = new sqlite3.Database("my.db")
  const cuisinesStr = JSON.stringify(selectedCuisines)
  const labelsStr = JSON.stringify(selectedLabels)
  const imagesStr = JSON.stringify(images)
  const locationStr = JSON.stringify(location)
  console.log('db', locationStr)

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
      cuisinesStr,
      locationStr,
      selectedPrices,
      labelsStr,
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
}
const getEntry = async(entryID) => {
  const db = new sqlite3.Database("my.db");
  const sql = `SELECT * FROM diary_entries WHERE id = ?`
    try {
    const row = await fetchFirst(db, sql, [entryID])
    if (row) {
      row.selectedCuisines = JSON.parse(row.selected_cuisines);
      row.selectedLabels = JSON.parse(row.selected_labels);
      row.images = JSON.parse(row.images);
      row.location = JSON.parse(row.location);
    }
      return row
    }
    catch (err) {
    console.error(err);
    throw err;
  } finally {
    db.close();
  }

}
const getAllEntries = async(userId) => {
  const db = new sqlite3.Database("my.db");
  const sql = `SELECT * FROM diary_entries WHERE user_id = ?`
    try {
    const rows = await fetchAll(db, sql, [userId]);
    const parsedRows = rows.map(row => {
      if (row.selected_cuisines) {
        row.selectedCuisines = JSON.parse(row.selected_cuisines);
      }
      if (row.selected_labels) {
        row.selectedLabels = JSON.parse(row.selected_labels);
      }
      if (row.images) {
        row.images = JSON.parse(row.images);
      }
      if(row.location) {
        row.location = JSON.parse(row.location);
      }
      return row;
    })
    return parsedRows

    }
    catch (err) {
    console.error(err);
    throw err;
  } finally {
    db.close();
  }

}
const deleteEntry = async (id,userId) => {
  const db = new sqlite3.Database("my.db")
  const sql = `DELETE FROM diary_entries WHERE id = ? AND user_id = ?`
  try {
    await paramExec(db, sql, [id,userId])  
  } catch (err) {
    console.log(err)
    throw err
  } finally {
    db.close()
  }
}
const getUserByUID = async (uid) => {
  const db = new sqlite3.Database("my.db");
  const sql = `SELECT username, permissions FROM users WHERE uid = ?`;
  try {
    const row = await fetchFirst(db, sql, [uid]);
    return row;
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    db.close();
  }
};


module.exports = { insertEntry, editEntry, getEntry, getAllEntries, deleteEntry, getUserByUID}