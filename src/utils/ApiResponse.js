class ApiResponse {
    constructor(statusCode, data, message = "Success"){
        this.data = data;
        this.success = statusCode < 400;
        this.message = message
        this.statusCode = statusCode
    }
}



export {ApiResponse}



/*
this code defines structure to how responses are sent/handled
helps in standardizing
*/