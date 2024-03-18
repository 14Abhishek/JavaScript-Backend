const asyncHandler = (requestHandler) =>{
    return (req,res,next) =>{
        Promise
        .resolve(requestHandler(req,res,next))  //execute funciton
        .catch(err=>next(err))  // handle error
    }
}

/**
 here we have higher order function that takes a requestHandler function
 withing which arrow function is defined in which we have Promise.resolve() 
 that is used to ensure that requestHandler is always executed as a Promise
 */






export {asyncHandler}


/*
when connecting to database we usually make it an async task
and we always wrap it in trycatch block
we will be connecting and communicating with databse again and again 
eg. usercontroller, videoscontroller
so writing something like -> asycn and trycatch...again and again for them
is wrong ... So we make a utility file whcih makes a generalized function that 
will wrap our code 
*/