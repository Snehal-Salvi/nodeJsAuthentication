import "./env.js"
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import ejsLayouts  from 'express-ejs-layouts';
import session from 'express-session';
import { connectToDb } from "./config/mongoose.js";
import userRouter from "./src/routes/user.routes.js";

const server = express();

server.use(express.json());
server.use(bodyParser.urlencoded({ extended: true }));


server.use(session({
    secret:'SnehalSecretKey',
    resave:false,
    saveUninitialized:true,
    cookie: { maxAge: 60 * 60 * 1000 }
}))

//setup view engine settings
server.set("view engine", "ejs");
server.set("views", path.join(path.resolve(),"src",'views'));
server.use(ejsLayouts);
server.use(express.static('public'));

server.use("/", userRouter);

server.listen(3005, ()=>{
    console.log('Server is listening on port 3005');
    connectToDb();
});
