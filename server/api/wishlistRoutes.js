const express = require("express");
const router = express.Router();
const { verifyUser } = require("./middleware/verifyUser");
const dbFunctions = require("../../sqlDB/dbFunctions");

router.post("/add", verifyUser, async (req, res) => {
  const uid = req.user.uid;
  console.log('in api req body', req.body)
  const { place_id, name, rating, price_level, types, photo_reference } = req.body;
  if (!place_id) return res.status(400).json({ error: "Missing place_id" });
  console.log('calling dbfunction')
  try {
    await dbFunctions.insertWishlist({
      user_id: uid,
      place_id,
      name,
      rating,
      price_level,
      types,
      photo_reference
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add to wishlist" });
  }
});


router.get("/", verifyUser, async (req, res) => {
  console.log('in fetching wishlist')
  const uid = req.user.uid;
  try {
    const wishlist = await dbFunctions.getWishlistByUser(uid);
    res.json({ success: true, wishlist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed fetching wishlist" });
  }
});

router.delete("/:id", verifyUser, async (req, res) => {
  const uid = req.user.uid;
  const id = req.params.id;
  try {
    await dbFunctions.deleteWishlistEntry(id, uid);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed deleting wishlist item" });
  }
});

router.get("/visited-places", verifyUser, async (req, res) => {
  const uid = req.user.uid;
  try {
    const wishlist = await dbFunctions.getWishlistByUser(uid);
    const visitedPlaceIds = wishlist.map(item => item.place_id);

    res.json({
      success: true,
      visitedPlaceIds
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed fetching visited place IDs" });
  }
});

module.exports = router;
