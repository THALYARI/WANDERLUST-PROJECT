const Listing = require("../models/listing")


module.exports.index = async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings})
}

module.exports.renderNewForm = (req,res)=>{
    //console.log(req.user); // user is object ->the currently logged in one username will appear
    
    res.render("listings/new.ejs");
}


module.exports.showListing = async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({ // this is done to populate the author which is in reviews
        path :"reviews",
        populate : {
            path :"author",
        },
    })
    .populate("owner");

    if(!listing){
        req.flash("error","Listing Does Not Exists");
        return res.redirect("/listings");
    }
    res.render("listings/show",{listing});
}


module.exports.createListing = async(req,res,next)=>{
    let url = req.file.path; // we will have req.file now because of multer 
    let filename = req.file.filename
    const newListing = new Listing(req.body.listing);
    newListing.image = {url,filename} // both url and filename will be saved in listing.image
    newListing.owner = req.user._id; // passport helps here in getting _id from user
    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
}


module.exports.renderEditFrom = async(req,res)=>{
    const {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing Does Not Exists");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url; 
    originalImageUrl = originalImageUrl.replace("/upload","/upload/h_300,w_300"); // we have changed the height and width of the image before showing it in edit page because if the size of image is more--> it will take extra memory and slower the page
    res.render("listings/edit.ejs",{listing,originalImageUrl})
}

module.exports.updateListing = async(req,res)=>{
    let {id} = req.params;
    let updatedListing = await Listing.findByIdAndUpdate(id,req.body.listing);
    
    if(req.file){ // as file is not in required field ..means user may or maynot upload a file so if req.file is there then do this--->
        let filename = req.file.filename;    
        let url = req.file.path;
        updatedListing.image = {url,filename};
        await updatedListing.save();
    }

    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
}



module.exports.deleteListing = async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted");
    res.redirect("/listings");
}