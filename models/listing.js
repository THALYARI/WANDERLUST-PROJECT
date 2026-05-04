const mongoose = require("mongoose");
const Review = require("./review");
const { string } = require("joi");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title : {
        type : String,
        required : true
    },
    description : String,
    image :{
        url : String,
        filename : String
    },
    price : Number,
    location : String,
    country : String,
    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref : "Review"
        }
    ],
    owner : {
        type : Schema.Types.ObjectId,
        ref : "User"
    }
})
// post means -> run this AFTER the main operation finishes
listingSchema.post("findOneAndDelete",async(listing)=>{ // After a listing is deleted, also delete all its reviews.”   async(listing) =>The document that was just deleted it gettes automatically passed to the middleware
    if(listing){  // findOneAndDelete is findbyIdAndDelete 
        await Review.deleteMany({_id : {$in: listing.reviews}});//take all review IDs inside listing delete them from Review collection
    }
})

const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing;