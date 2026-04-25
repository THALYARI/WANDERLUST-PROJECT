module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){// THIS will check if the user is logged in or not return bool value
        if (req.method === "GET") { // because if delete request 
            req.session.redirectUrl = req.originalUrl;
        } // we stored the orginal url where we would have gone if we were logged in so that we can redirect to that webpage after getting logged in 
        req.flash("error","Login in required");
        return res.redirect("/login"); // return is important
    } 
    next();
}

module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}
// **  WHY WE USE RES.LOCALS INDIRECTLY ->> 

// we didn't use res.locals directly to store url because res.locals works only in same request
// Login flow involves multiple requests like redirect to /login and because of this locals will be gone
// So value will be lost

// Session survives across redirects
//So it can carry data from:
// ❌ Unauthorized request
// → redirect to login
// → login success
// → redirect back

// we didn't use req.session directly because in /login when passport.authenticate will run it will reset to session to undefined




const Listing = require("./models/listing")
module.exports.isOwner = async(req,res,next)=>{ 
    let {id} = req.params;
     // authorization steps to check the user is same as the one who has created it
    // this is generally for hopscotch request if any placed by someone ... normally we don't need because we have added if condition in show.ejs
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){ // not owner._id because its not populated and owner stored id itself
        req.flash("error","No Permission");
        return res.redirect(`/listings/${id}`);
    }
    next();
}



const {listingSchema} = require("./schema.js");
const ExpressError = require("./utils/ExpressError");
module.exports.validateListing = (req,res,next) =>{
    console.log(req.body);
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    } else {
        next();
    }
}

const {reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");
module.exports.validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    } else {
        next();
    }
}


// to only delete that review whose author match the user login

module.exports.isReviewAuthor = async(req,res,next)=>{
    let {id,reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}