const mongoose = require("mongoose");
const InitData = require("./data");
const listing = require("../models/listing.js")

main()
.then(()=>{
    console.log("connected to db");
})
.catch(err => console.log(err));

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
}

const initDB = async() => {
    await listing.deleteMany({});
    InitData.data = InitData.data.map((obj)=> ({...obj, owner:"69e0d1f58845d02fe747e585"})); // map creates a new array with owner as Mayank key value pair in it
    await listing.insertMany(InitData.data);// above ({ }) because js gets confused if we only use {} it thinks of it as a function  (obj)=>{} like this but we are making a new object its not for function
}                                          //Parentheses are used to tell JavaScript that the arrow function is returning an object, not a function block.
initDB();