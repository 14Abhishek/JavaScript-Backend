class ApiError extends Error{
    constructor(
        statusCode,
        message = "Something Went Wrong",
        errors= [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors
        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}


/*
this code defines structure to how errors are sent/handled
helps in standardizing how errors are sent
explore-> google = nodejs api error
in nodejs we have an Error class.. which has many methods..
and we override those methods to better control how errors are sent
*/