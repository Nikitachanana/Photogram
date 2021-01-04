// const db = require('../config/database')
const user = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer")
const fetch = require('node-fetch');
const { OAuth2Client } = require("google-auth-library")
const cloudinary = require('cloudinary')
const client = new OAuth2Client("501516992284-p5ndrh0l2dfr2umcs904uk92vg488vb3.apps.googleusercontent.com")

// EMAIL CONFIGURATIONS
var mail = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nikitachananaitl@gmail.com',
        pass: 'ITL2020@#'
    }
});
// SIGN UP API
const signup = async (req, res) => {
    console.log(req.body)
    const isEmail = await user.findOne( {email:req.body.email} )
    const isUsername = await user.findOne( { username: req.body.username } )
    console.log(isEmail);
    // IF EMAIL EXISTS
    if (isEmail) {                                  
        res.json({
            error: "User with this email exist"
        })
    }
    else if(isUsername){
        res.json({
            error: "Username taken"
        })
    }
    else {
        // HASHING THE PASSWORD
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        console.log(hashedPassword);
        // DATA SAVED TO DB
        var newUser = new user({
            name: req.body.name,
            email: req.body.email,
            username: req.body.username,
            password: hashedPassword,
        })
        newUser.save().then(result => {
            console.log(result)
            res.status(200).json({
                success: "Successfully registered! you can login now",
                data: result.data
            })
        }).catch(err => {
            console.log(err);
        })

    }
}

// LOGIN API
const login = async (req, res) => {
    console.log(req.body);
    user.findOne( { email: req.body.email } ).then(async data => {
        if (data) {
            const user = { id: data._id }
            bcrypt.compare(req.body.password, data.password, (err, result) => {
                if (result) {
                    console.log(user)
                    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
                    console.log(data);
                    res.status(200).json({
                        user: data,
                        token: token,
                        success: "successful Login"
                    })
                }
                else {
                    res.json({
                        error: "password did not match"
                    })
                }
            })
        }
        else {
            res.json({
                error: "No user Found"
            })
        }
    })

}
// FUNCTION TO CREATE RANDOM OTP
var generateOTP = () => {
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 4; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;

}
// TO GET THE EXPIRY TIME
var d1 = new Date(),
    d2 = new Date(d1);
d2.setMinutes(d1.getMinutes() + 2);
console.log(d1.getTime());
console.log(d2.getTime());
// SEND OTP
const sendOTP = async (req, res) => {
    console.log(req.body)
    const email = await user.findOne({ email: req.body.email } )
    // IF EMAIL EXISTS, OTP SENT THROUGH EMAIL
    if (email) {
        console.log("email", email)
        const OTP = generateOTP()
        console.log(OTP)
        var mailoptions = {
            from: 'nikitachananaitl@gmail.com',
            to: req.body.email,
            subject: `OTP for Application`,
            text: `Your OTP for Application is ${OTP}`
        }
        mail.sendMail(mailoptions, ((err, result) => {
            if (err) {
                console.log(err)
            }
            else {
                console.log(result)
                res.status(200).json({
                    email: req.body.email,
                    otp: OTP,
                    success: "OTP is sent successfully, OTP will expire in 10 minutes",
                    expiration: d2.getTime()
                })
            }
        }))

    } 
    // EMAIL DOESN'T EXISTS
    else {
        res.json({
            error: "No user found"
        })
    }

}

// CHECKING THE AUTHENTICATION AT THE DASHBOARD FOR AUTHENTICATED USER
const authentication = (req, res) => {
    // console.log(req.headers.token);
    jwt.verify(req.headers.token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            res.json({ error: "Did not match" })
        }
        else {
            res.json({
                success: "verified",
                data: req.user
            })
        }
    })

}
// LOGIN VIA GOOGLE
const googleLogin =async  (req, res) => {
    const { tokenId } = req.body
    console.log(tokenId);
    // VERIFYING THE TOKEN RECEIVED BY GOOGLE 
    client.verifyIdToken({ idToken: tokenId, audience: "501516992284-p5ndrh0l2dfr2umcs904uk92vg488vb3.apps.googleusercontent.com" }).then(async response => {
        const { email_verified, name, email } = response.payload
        console.log(email);
        // console.log(response.payload);
        // IF VERIFIED
        if (email_verified) {
            // CHECK IF ALREADY EXISTS
            const userData = await user.findOne({email: email } )
                console.log(userData);
                // IF EXISTS, TOKEN IS ALOTTED
                if (userData) {
                        const token = jwt.sign({ id: userData._id }, process.env.ACCESS_TOKEN_SECRET)
                        res.status(200).json({
                            user: userData,
                            token: token,
                            success: "successful Login"
                        })
                    }
                    // IF NOT IN DB, USER IS CREATED WITH DUMMY PASSWORD AND TOKEN IS ALLOTED
                    // OTHER DETAILS CAN BE EDITED AND ADDED IN PROFILE MANAGEMENT
                    else {
                        var newUser = new user({
                            name:name,
                            email: email,
                            username: email.split('@')[0],
                            password: email + process.env.ACCESS_TOKEN_SECRET
                        })
                        newUser.save().then((err, data) => {
                            if (err) {
                                res.status(400).json({
                                    error: "Something went wrong"
                                })
                            } else {
                                const token = jwt.sign({ id: data._id }, process.env.ACCESS_TOKEN_SECRET)
                                res.status(200).json({
                                    user: data,
                                    token: token,
                                    success: "successful Login"
                                })

                            }
                        })
                    } 
        }
    })
}


const facebooklogin=(req,res)=>{
    console.log(req.body);
    const {userID, accessToken}=req.body
    let urlGraphfacebook= `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`
    fetch(urlGraphfacebook,{
        method:'GET',

    }).then(res=>res.json())
    .then(async response=>{
        const {email,name}= response
        console.log(name,email);
        const userData = await user.findOne({ email: email })
                console.log(userData);
                // IF EXISTS, TOKEN IS ALOTTED
                if (userData) {
                        const token = jwt.sign({ id: userData._id }, process.env.ACCESS_TOKEN_SECRET)
                        res.status(200).json({
                            user: userData,
                            token: token,
                            success: "successful Login"
                        })
                    }
                    // IF NOT IN DB, USER IS CREATED WITH DUMMY PASSWORD AND TOKEN IS ALLOTED
                    // OTHER DETAILS CAN BE EDITED AND ADDED IN PROFILE MANAGEMENT
                    else {
                        var newUser = new user({
                            name:name,
                            email: email,
                            password: email + process.env.ACCESS_TOKEN_SECRET
                        })
                        newUser.save().then((err, data) => { 
                            if (err) {
                                res.status(400).json({
                                    error: "Something went wrong"
                                })
                            } else {
                                const token = jwt.sign({ id: data._id }, process.env.ACCESS_TOKEN_SECRET)
                                res.status(200).json({
                                    user: data,
                                    token: token,
                                    success: "successful Login"
                                })

                            }
                        })
                    } 
    })
}

const userData =async (req,res)=>{
    console.log(req.query)
    const posts= await user.findOne({_id:req.query.id}).populate("posts").exec()
    // console.log(posts)
    user.findOne({_id:req.query.id}).then(data=>{
        // console.log(data)
        res.json({
            userdata:data,
            posts:posts.posts
        })
    })
}


const editprofile=async (req,res)=>{
    // console.log(req.body)
    // console.log(req.file)
    var data = req.body
    if(data.name==='undefined'){
        delete data["name"]
    }
    if(data.email==='undefined'){
        delete data["email"]
    }
    if(data.username==='undefined'){
        delete data["username"]
    }
    if(data.phone==='undefined'){
        delete data["phone"]
    }
    if(data.gender==='undefined'){
        delete data["gender"]
    }
    if(data.bio==='undefined'){
        delete data["bio"]
    }
    if(data.image==='null'){
        delete data["image"]
    }
    if(req.file){
        const file = req.file.path;
        const result = await cloudinary.uploader.upload(file)
        // console.log(result)
        data["img"] = result.url
    }
    console.log(data)
    await user.update({_id:req.query.id},data).then(response=>{
        console.log(response)
        res.json({
            success:"Editted Successfully!"
        })
    })

}

const changePassword =async (req,res)=>{
    console.log(req.body)
    const userData = await user.findOne({_id:req.query.id})
    const match = await bcrypt.compare(req.body.old,userData.password)
    const hashedPassword = await bcrypt.hash(req.body.new,10)
    if(match){

        console.log("match")
        user.update({_id:req.query.id},{password:hashedPassword}).then(response=>{
            res.json({
                success:"Password changed successfully!"
            })
        })
    }
    else{
        console.log("no match")
        res.json({
            error:"Old password is incorrect!"
        })
    }
}
module.exports = {
    signup: signup,
    login: login,
    sendOTP: sendOTP,
    changePassword: changePassword,
    googleLogin: googleLogin,
    facebooklogin:facebooklogin,
    authentication:authentication,
    userData:userData,
    editprofile:editprofile

}




