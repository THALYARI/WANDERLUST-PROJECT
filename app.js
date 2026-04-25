if(process.env.NODE_ENV != "production"){ // .NODE_ENV tell is that in which mode our app is running {common values are development and production}
require('dotenv').config(); // dotenv is a tool used to load environment variables from a file into your program.
// it creates our credentials so we dont share it with others therefore only used in development phase of program 
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser"); // cookie is a text file which is stored by a web browser when you visit a website so that the next time it recognise you eg login details
const session = require("express-session"); // sessions are stored in memory(ram) by default so when we restart the server we get logged out again and again so connect-mongo eleminates this by storing session data in mongoDB 
const MongoStore = require('connect-mongo');// session is now stored in mongoDB
const flash = require("connect-flash");
const passport = require("passport");

const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js"); // for creating router of listings as they were a lot
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const ExpressError = require("./utils/ExpressError");
const path = require("path");
const methodOverride = require("method-override"); // for delete and put request
const ejsMate = require("ejs-mate"); // for boilerplate


const dbUrl = process.env.ATLASDB_URL; //Your password is hidden because of env variables
const localdb = "mongodb://127.0.0.1:27017/wanderlust";
main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => console.log(err));


async function main() {
  await mongoose.connect(localdb);
}



app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); //
app.use(express.urlencoded({ extended: true })); // to read params
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public"))); // to access css and js form public which is common
app.use(cookieParser("secretcode"));


const store = MongoStore.create({ // creats a session store that saves session data in mongodb atlas cloud 
    mongoUrl: dbUrl,
    crypto : {
        secret: process.env.SECRET // Encrypts session data before saving
    },
    touchAfter : 24*3600, // 24hours   -> Only update session in DB if it changes after 24 hrs
    // See below for details
})

store.on("error",(err)=>{
    console.log("ERROR IN MONGO SESSION STORE",err);
})

const sessionOptions = {
  store,  
  secret: process.env.SECRET, //like a stamp on session id(idcard) no other idcard is accepted only one with stamp(secret) is accepted // ensures that the session data is secure and not tampered with like(password used internally by the server)
  resave: false, // dont save the session again
  saveUninitialized: true, //save a new session even if it has no data yet
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // this cookie will expire after 1 week 7 days 60 min 60 sec 1000 milli sec
    maxAge: 7 * 24 * 60 * 60 * 1000, // duration
    httpOnly: true, // true -> cookie can't be accessed by js in browser
  },
};



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize()); // passport is a middleware for authentication
app.use(passport.session()); // used to maintain the user logged in (when in same session) logged in on requests( without this user logs in on page then when he moves to other page he gets logged out)
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser()); // to store user related information in a session
passport.deserializeUser(User.deserializeUser()); // remove info

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next(); //Data in res.locals is available in EJS templates
});

// app.get("/demouser",async(req,res)=>{
//     let fakeUser = new User({
//         email : "student@gmail.com",
//         username : "Solo"
//         // can't make password : "helloworld"
//         // because passport local mongoose dont take password as a field it takes hash and salt lol
//     })
//     let registeredUser = await User.register(fakeUser,"helloworld"); // register provided by passport-local-mongoose
//     res.send(registeredUser);
// }) // register will take helloworld as password convert into hash(encrypted) store save
//  // register automatically check that username is unique or not

app.use("/listings", listingRouter); // to create seperate listing router as a folder
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


app.use((req, res, next) => {
  // * means apply to all .. if any route is not send
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went Wrong" } = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("includes/error.ejs", { message });
});

app.listen(8080, () => {
  console.log("listening");
});
