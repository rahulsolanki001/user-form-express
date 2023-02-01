import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import nodemailer from "nodemailer";

//port for server
const port=process.env.PORT || 5000;



//MongoDB connection
mongoose.connect("mongodb+srv://rahul:rahul123@wordrace.ecpmqut.mongodb.net/?retryWrites=true&w=majority",{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    dbName:"Users"
});

//defining UserSchema
const userSchema=new mongoose.Schema({
    fname:{type:String},
    lname:{type:String},
    dob:{type:Date},
    email:{type:String},
    num:{type:Number}
});

const User=mongoose.model("User",userSchema);



const app=express();
app.use(cors());  //cors
app.use(express.json());  // to read body of req from frontned


//Nodemailer to send email on form submission
const transporter=nodemailer.createTransport({
    port:465,
    host:"smptp.gmail.com",
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS,
    },
    secure:true,
})


//REST Api

//Read
app.get("/",async(req,res)=>{
    const data=await User.find({});
    res.send(data);
})


//Create
app.post("/",async(req,res)=>{
    try{
        console.log(req.body)
        const fname=req.body.fname;
        const lname=req.body.lname;
        const dob=req.body.dob;
        const email=req.body.email;
        const num=req.body.num;

        const emailExists=await User.findOne({email:email});
        if(emailExists){
            res.status(409).json({
                message:"Data with this email already exists"
            })
        }else{
            const user= new User({
                fname,
                lname,
                dob,
                email,
                num
            })
            await user.save()
            res.status(200).json({
                message:"Data saved successfully!!..",
                id:user.id
            });
            
            //sending mail of confirmation to the user
            const mailData={
                from:process.env.EMAIL_USER,
                to:email,
                subject:"Confirmation",
                text:"You have submitted your form sucessfully. Regards"
            };
            transporter.sendMail(mailData,(err,info)=>{
                if(err)console.log(err)
                else console.log(info);
            })
        }

    }catch(err){
        console.log("An error occured!!..");
        console.log(err);
        res.status(500).json({
            message:"An error occured in post"+err
        })
    }

})



//
app.listen(port,()=>{
    console.log("live on port "+port);
})
