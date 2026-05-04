//wrapAsync is a utility function used to catch errors in async route handlers 
//and pass them to Express error-handling middleware. as await error are not caught by the express error handler
//Express catches synchronous errors automatically,
//but asynchronous errors must be passed using next(err).

module.exports = (fn) => {
    return (req,res,next)=>{
        fn(req,res,next).catch(next);
    }
}