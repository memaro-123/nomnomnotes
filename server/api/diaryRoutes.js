const {
  insertEntry,
  editEntry,
  getEntry,
  getAllEntries,
  deleteEntry,
  execute,
  insertSentCode,
  insertNewFriend,
  insertRecievedCode,
  userExists,
  intializeUser,
  autoAcc,
  alreadySentOrFriended
} = require("../../sqlDB/dbFunctions.js");
const express = require("express");
const { db, admin } = require("../firebase.js");
const { verifyUser } = require("./middleware/verifyUser.js");
const uploadBuffer = require('./middleware/uploadBuffer.js');
const uploadToS3 = require('./utils/uploadToS3.js')
const router = express.Router();

router.get( "/", verifyUser, async (req, res) => {
  try{
    const uid = req.user.uid
    const entries = await getAllEntries(uid) 

    res.json({ success: true, diaryData: entries })
  }
  catch(err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch diary" });
  }
} )

router.post( "/create", verifyUser, uploadBuffer.array('images', 10), async (req, res)=> {
  const uid = req.user.uid
  console.log('touched create api')

  try{
    //upload imgs to s3
    console.log('uploading imgs to s3')
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToS3(file, uid);
        imageUrls.push(url);
      }
    }

    console.log('upload to s3 success')
    const entryData = { 
      ...req.body, 
      user_id: uid,
      images: imageUrls,
    }
     
    console.log('uploading to db')
    await insertEntry(entryData)
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to write diary" });
  }
})

router.patch("/edit", verifyUser, async (req, res) => {
  const uid = req.user.uid
  const { entryId, title, selectedCuisines, location, 
    selectedPrices, selectedLabels, images, notes, taste, 
    service, value } = req.body;
  if (!entryId) {
  return res.status(400).json({ error: "Missing entryId" });
}
  try {
    await editEntry({
      id: entryId,
      user_id: uid,
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
    });
    console.log("editentry jsut ran type shit");

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update diary entry" });
  }
});

router.delete("/delete/:entryId", verifyUser, async (req, res) => {
  const uid = req.user.uid;
  const { entryId } = req.params;
  if (!entryId) {
    return res.status(400).json({ error: "Missing entryId" });
  }
  try {
    await deleteEntry(entryId, uid);
    res.json({ success: true, message: "deleted correctly" });
  } catch (err) {
    console.error("Error deleting diary entry:", err);
    res.status(500).json({ error: "Failed to delete diary entry" });
  }
});

router.patch("/sendreq", verifyUser, async (req, res) => {
  
  const { myID, friendID } = req.body;
  if (await alreadySentOrFriended({myID, friendID})){
    return res.json({ success: true, message: "alr sent/friends" });
  }
  if (!myID || !friendID) {
    return res.status(400).json({ error: "Missing id" });
  }

  if (!(await userExists({ id: friendID }))) {
    return res.status(400).json({ error: "friend doesn't exist" });
  }
  const result = await autoAcc({ myID, friendID });
  if (result) {
    return res.json({ success: true, message: "friend auto acc" });
}


  try {
    await insertSentCode({ myID: myID, sentID: friendID });
    console.log("insertSentCode jsut ran type shit");
    await insertRecievedCode({ myID: friendID, recievedID: myID });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update friendstuff" });
  }
});

router.post("/initfriend", verifyUser, async (req, res) => {
  console.log("this initfriend starting now")
  const { myID } = req.body;
  if (!myID) {
    return res.status(400).json({ error: "Missing id" });
  }

  try {
    await intializeUser({ myID });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to init user" });
  }
});

module.exports = router;
