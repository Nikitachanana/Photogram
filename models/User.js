const mongoose = require("mongoose");
const post = require("./posts")
const UserSchema = new mongoose.Schema({
    name :{
        type: String,
    },
    email:{
        type: String,
    },
    username :{
        type: String,
    },
    bio :{
        type: String,
    },
    phone :{
        type: String,
    },
    password :{
        type: String,
    },
    followers:[{ type: mongoose.Schema.ObjectId, ref: 'user' }],
    following:[{ type: mongoose.Schema.ObjectId, ref: 'user' }],
    img:{
        type:String,
        default:'https://res.cloudinary.com/nikita4206/image/upload/v1609180120/Profile-ICon_tmy5nb.png'
    },
    posts:[{ type: mongoose.Schema.ObjectId, ref: 'post' }],
    
    

})
const users = mongoose.model("user",UserSchema);
module.exports = users;
