import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors'
import nodemailer from 'nodemailer'
import {auth} from './auth.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

//variables
var app = express()  
app.use(express.json());
app.use(cors())

var mongoUrl = process.env.mongoUrl
async function createConnection(){
    var client = new MongoClient(mongoUrl);
    await client.connect()
    console.log("connection is ready ")
 return client
}
export var client = await createConnection()

async function passwordMatch(pass){
    var salt = await bcrypt.genSalt(4);
    var hash = await bcrypt.hash(pass,salt);
    return hash;
}

app.post("/sign",async function(req,res){
    let {name,email,password} = req.body
    let result1 =await client.db("product").collection("users")
    .findOne({email});
    if(result1){
        res.send({msg:"Email is already exist"})
    }else{
    let hash = await passwordMatch(password)
    let result = await client.db("product").collection("users").insertOne({name,email,"password":hash})
    res.send({msg:"success"})
    }
})
let UserEmail ;
  app.post("/login",async function(req,res){
    let {email,password}=req.body;
    UserEmail= email;
    let result =await client.db("product").collection("users")
    .findOne({email});
    if(!result){
        res.status(401).send({msg:"Email is not Exist"})
    }else{
        var storedPassword = result.password
        var compare = await bcrypt.compare(password,storedPassword)
        if(!compare){
            res.status(401).send({msg:"invalid"})
        }else{

            const token = await jwt.sign({id:result._id},"santhosh");
                res.send({msg:"login sucessfully",token:token})
        }
    }
  })

app.post("/forgotpassword",async function(req,res){
    let {email}=req.body;
    let result =await client.db("product").collection("users")
    .findOne({email});
    if(!result){
        res.status(401).send({msg:"invalid"})
    }else{
        var randomNumber = Math. floor(100000 + Math. random() * 900000)
        async function nodemail(){
            var transfer = nodemailer.createTransport({
                service:"hotmail",
                auth:{
                   user:process.env.email,
                   pass:process.env.pass
                }
             
             })
               const options={
                from:process.env.email,
                to:email,
                subject:"your login",
                text:`OTP- ${randomNumber} `
               }
             
               transfer.sendMail(options,(err)=>{
                if(err){
                   console.log(err)
                }else{
                   console.log({msg:"mail send"})
                }
               })
               transfer.verify()
            }
            nodemail()
            res.send({msg:"autheticating",OTP:randomNumber})
    }
})
app.get("/mailsend",auth,(req,res)=>{
    async function nodemail(){
        var transfer = nodemailer.createTransport({
            service:"hotmail",
            auth:{
               user:process.env.email,
               pass:process.env.pass
            }
         })
           const options={
            from:process.env.email,
            to:UserEmail,
            subject:"Receiver of the mail",
            text:`Your the receiver of the Email `
           }
         
           transfer.sendMail(options,(err)=>{
            if(err){
               console.log(err)
            }else{
               console.log({msg:"mail send"})
            }
           })
           transfer.verify()
        }
        nodemail()
    res.send({msg:"success"})
})
app.listen(process.env.PORT,()=>{
    console.log("get it")
})