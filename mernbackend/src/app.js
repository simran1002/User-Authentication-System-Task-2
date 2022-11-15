require('dotenv').config();
const express=require("express");
const cookieParser = require('cookie-parser');
const path=require("path");
const hbs=require("hbs");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const nodemailer=require("nodemailer");
const app=express();
require("./db/connection");
const Register=require("./models/register");
const auth=require("./middleware/auth");
const transpoter=require("./middleware/email");

const static_path=path.join(__dirname,"../public");
const views_path=path.join(__dirname,"../views");


app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static(static_path));
app.use(cookieParser());

app.set("view engine","hbs");
app.set("views",views_path);

app.get("/",(req,res)=>{
    res.render("homepage");
});
app.get("/signinsignup",(req,res)=>{
    res.render("index");
});
app.get("/findnickname",auth,async(req,res)=>{
    try {
        res.render("nicknameee");
    } catch (e) {
        
    }
});
app.get("/password/reset",(req,res)=>{
    res.render("emailsend");
});


app.get("/password/reset/:id/:token",(req,res)=>{
  data={
    fetch_id:req.params.id,
    fetch_token:req.params.token
  }
    res.render("password",data);
});

app.get("/update",auth,(req,res)=>{
    res.render("update");
})


app.post("/register",async(req,res)=>{
    try {
        const password=req.body.rpassword;
        const confirmpassword=req.body.rcpassword;

        if(password===confirmpassword){
            const registerUser=new Register({
                nickname:req.body.rnickname,
                email:req.body.remail,
                password:req.body.rpassword,
                confirmpassword:req.body.rcpassword
            })
            // console.log("the success part"+registerUser);

            //------------------------------- middelware------------
            const token=await registerUser.generateAuthToken();
            // console.log(`the token is`+token);
            //------------------------------- middelware------------

            // the res.cookie() function is used to set the cookie name with a value 
            // the value parameter may be a string or object converted in json 

            // syntax:
            // res.cookie(name,value,[options]);

            res.cookie("autherizationcookie",token,{
                expires:new Date(Date.now()+300000),
                httpOnly:true
            });


            const userdata=await registerUser.save();
            // console.log(userdata);
            res.status(201).render("index");
        }else{
            res.send("passwords are not matching");
        }
    } catch (e) {
        res.status(400).send(e);
        console.log("there is some error");
    }
});

app.post("/login",async(req,res)=>{
    try {
        const email=req.body.lemail;
        const password=req.body.lpassword;
        const userlogin=await Register.findOne({email:email});

        const match= await bcrypt.compare(password,userlogin.password);

        const token=await userlogin.generateAuthToken();
        // console.log(`the token is`+token);

        res.cookie("autherizationcookie",token,{
            expires:new Date(Date.now()+300000),
            httpOnly:true,
            // secure:true 
        });
        // console.log(`this is the cookie ${req.cookies.autherizationcookie}`)

        if(match){
            res.status(201).render("homepage");
        }else{
            res.send("something went wrong with Email or Password");
        }
        
    } catch (e) {
        res.status(400).send("invalid Login Details")
        
    }
});

app.post("/password/reset",async(req,res)=>{
    try {
        const useremail=req.body.uemail;
        if(useremail){
            const finduser=await Register.findOne({email:useremail});

            if(finduser){
                const resettoken=await finduser.generateresetToken();
                const link=`http://localhost:3000/password/reset/${finduser._id}/${resettoken}`;
                console.log(link);

                let info=await transpoter.sendMail({
                    from:process.env.EMAIL_FROM,
                    to:finduser.email,
                    subject:"password reset link",
                    html:`<a href=${link}>click here </a>`,

                })
                res.send("email has been sent");


            }else{
                res.send("Email Doest Not Exist");
            }
        }else{
            res.status(400).send("Invalid Email");
        }
        
    } catch (e) {
        res.status(400).send(e);
        
    }
});

app.post("/password/reset/:id/:token",async(req,res)=>{
    const userId=data.fetch_id;
    console.log(userId);
    const usertoken=data.fetch_token;
    console.log(usertoken);
    const password=req.body.rpassword;
    const confirmpassword=req.body.rcpassword;

    if(password!==confirmpassword){
        return res.status(400).json({ message : "passwords are not matching" });
    }

    try {
        const payload=jwt.verify(usertoken,process.env.SECRET_KEY);
        console.log(payload);
        
        if(!payload){
            return res.status(400).json({ message : "token is not valid" });
        }

        const user=await Register.findOne({_id:payload._id });
        user.password=password;
        await user.save();
        res.status(200).json({ message : "password has been changed" });

    } catch (e) {
        res.status(400).json({ message : "something went wrong" });
    }
});

app.post("/displaynickname",async(req,res)=>{
    const bandaemail=req.body.uemail;
    const displaynickmane=await Register.findOne({email:bandaemail});
    const username=displaynickmane.nickname;
     res.render("nickname",{
        nicknameofperson:username
     });
});

app.post("/update",auth,async(req,res)=>{
    const newnickname=req.body.new;
    const emailaddress=req.body.email_address;
    const update=await Register.findOneAndUpdate({email:emailaddress},{nickname:newnickname});
    res.render("homepage");
});


app.listen(process.env.PORT||3000,()=>{
    console.log("connected");
});