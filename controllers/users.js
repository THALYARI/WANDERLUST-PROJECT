const User = require("../models/user.js");

module.exports.login = async(req,res)=>{
 // passport has its middleware named authenticate which check username and password automatically yee
 // in this 1-> insert the statergy (ie local)
 // on fail automatic redirect to current /login
 // flash ==> automatic flash message by failure flash
    req.flash("success",`Welcome ${req.body.username}`);
    if(!res.locals.redirectUrl) return res.redirect("/listings"); // if user directly poens login page not redirected from any other page
    res.redirect(res.locals.redirectUrl);// req.session.redirectUrl => in general case this works but with passport this will give undefined because .authenticate will reset the session therefore we save url in locals
}
module.exports.renderLoginForm = (req,res)=>{
    res.render("users/login.ejs")
}
module.exports.signup = async(req,res)=>{
    try{
        let {username ,email,password}= req.body;
        const newUser = new User({email,username});
        const registeredUser = await User.register(newUser,password);
        console.log(registeredUser);
        // this(req.login) is specifically made to automatically login user after signup
        req.login(registeredUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success","Welcome to WanderLust");
            res.redirect("/listings");
        })
        
        
    } catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
}


module.exports.renderSignupForm = (req,res)=>{
    res.render("users/signup.ejs");
}

module.exports.logout = (req,res)=>{
    req.logout((err)=>{ // when logout will happen then what things to do write in callback
        if(err){
            return next(err);
        }
        req.flash("success","logged out");
        res.redirect("/listings");
    }) 
}