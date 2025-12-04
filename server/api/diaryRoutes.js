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
      images: JSON.stringify(imageUrls),
    }
     
    console.log('sending data to add:', entryData)
    await insertEntry(entryData)
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to write diary" });
  }
})

router.patch("/edit", verifyUser, uploadBuffer.array('images', 10), async (req, res) => {
  console.log('passed middleware, in edit api')
  const uid = req.user.uid;
  const entryId = req.body.entryId;
  const {
    title,
    selectedCuisines,
    location,
    place_id,
    lat,
    lng,
    selectedPrices,
    selectedLabels,
    notes,
    taste,
    service,
    value,
  } = req.body;

  if (!entryId) {
  return res.status(400).json({ error: "Missing entryId" });
}
  try {
    const existingImages = JSON.parse(req.body.existingImages || []);
    console.log('Existing images parsed:', existingImages.length);

    console.log('uploading imgs to s3')
    const newImageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToS3(file, uid);
        newImageUrls.push(url);
      }
    }
    console.log('done uploading to s3')

    const allImages = [...existingImages, ...newImageUrls];

    const entryData = {
      id: entryId,
      user_id: uid,
      title: title,
      selectedCuisines: selectedCuisines,
      location: location,
      place_id: place_id,
      lat: lat,
      lng: lng,
      selectedPrices: selectedPrices,
      selectedLabels: selectedLabels,
      images: allImages,
      notes: notes,
      taste: taste,
      service: service,
      value: value,
    }

    console.log('sending entry data:',entryData)

    await editEntry(entryData);
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
  try {
    const result = await dbFunctions.sendFriendRequest({ myID, friendID });
    res.json({
      success: true,
      autoAccepted: result.autoAccepted,
      message: result.autoAccepted
        ? "Friend request auto accepted"
        : "Friend request sent success",
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({
      error: error.message || "Failed to send friend request"
    });
  }
});

router.post("/initfriend", verifyUser, async (req, res) => {
  console.log("this initfriend starting now")
  const { myID } = req.body;
  if (!myID) {
    return res.status(400).json({ error: "Missing id" });
  }

  try {
    const userAlreadyExists = await userExists(myID);

    if (userAlreadyExists) {
      console.log("User already exists, skipping initialization:", myID);
      return res.json({ success: true, message: "User already exists" });
    }

    console.log("Initializing new user:", myID);
    await intializeUser({ myID });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to init user" });
  }
});

module.exports = router;
