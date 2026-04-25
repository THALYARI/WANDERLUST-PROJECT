const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose").default;
const userSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true
    }
});
userSchema.plugin(passportLocalMongoose); // this will add username and salt and hash by its own in schema

const User = mongoose.model("User",userSchema);

module.exports = User;