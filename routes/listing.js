const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const multer = require("multer") // this is for the form which is sending file so to decode it we use multer as its not url encoded
const {storage} = require("../cloudConfig.js");
const upload = multer({storage}) //  folder {storage} will store the received files from the form 
// user uploads image -> multer handles file -> cloudinary uploads it -> cloudinary returns url + filename -> req.file gets path and filename as url and id respectively

const Listing = require("../models/listing");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listings.js");

router.get("/search", async (req, res) => {
    let { q } = req.query;

    if (!q) {
        return res.redirect("/listings");
    }

    // matched listings
    const matched = await Listing.find({ // mongo db operators  $regex → search inside text
        title: { $regex: q, $options: "i" } // regex for pattern matching like (villa , Villa , beach villa etc) 
    }); // option i => i is case - insensitive

    // remaining listings
    const others = await Listing.find({
        title: { $not: { $regex: q, $options: "i" } } // $not = opposite
    });

    // combine → matched first
    const allListings = [...matched, ...others];

    res.render("listings/index", {allListings});
});




// Edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditFrom),
);

router.get("/new", isLoggedIn, listingController.renderNewForm);


router.route("/") // router.route is used to make things compact and easy to understand
//index Route
.get(wrapAsync(listingController.index))
// Create Route
.post(
  isLoggedIn,
  upload.single('image'), // with this the file coming from the name = image will be stored in uploads folder
  validateListing,
  wrapAsync(listingController.createListing),
);


router.route("/:id")
// show route
.get(wrapAsync(listingController.showListing))
// update route
.put(
  isLoggedIn,
  isOwner,
  upload.single("image"),
  validateListing,
  wrapAsync(listingController.updateListing),
)
.delete(
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.deleteListing),
);

// app.get("/testListing",async(req,res)=>{
//     let sampleListing = new Listing({
//         title : "Unexplored Place",
//         description : "By the river",
//         price : 1200,
//         location : "Pasha, H.P",
//         country : "India"
//     })
//     await sampleListing.save();
//     console.log("sample Was saved");
//     res.send("successful testing");
// })

module.exports = router;
