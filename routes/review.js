const express = require("express");
const router = express.Router({ mergeParams: true }); // merge params so that it can read listing id from the parent app :id (if not done error)
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");

const {
  validateReview,
  isLoggedIn,
  isOwner,
  isReviewAuthor,
} = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");

// Delete review
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.deleteReview),
);

//Reviews // Post Route
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview),
);

module.exports = router;
