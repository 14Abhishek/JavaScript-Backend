import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";  // server can access and use cookies from user browser 

const app = express();


// read&learn bout cors plz
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials: true
}))



//Middlewares
app.use(express.json({limit: "16kb"})) // the json data we will recieve should have limit
app.use(express.urlencoded({extended:true,limit: "16kb"})) // to make server understand encoded url 
app.use(express.static("public")) // we wanna store some file on server so we make public folder (public assets)
app.use(cookieParser()) // CRUD on cookies from user browser



// routes
import userRouter from './routes/user.routes.js'


// routes decleration
app.use("/api/v1/users", userRouter)
// any requests to paths starting with /api/v1/users should be handled using the userRouter middleware


export { app }



/*  Middlewares 
>user requests some url route eg. /instagram
>server is programmmed to handle it eg. res.json, res.send
>"user-san are capable to take that response (res.json)?"
>"are you logged in user-san?"
>this type of cheking in middle is middleware 

rememebr the (req,res)... when we were creating routes(get,post)
thres more to it ...the full version is 
(err, req, res, next)
here  'next' is about middleware....its a FLAG
when one middleware is done with its  work, it passes a 'next' flag
and we move onto next middleware, which again uses 'next'...then at 
last we just send the 'res'

*/