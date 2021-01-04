const mongoose = require("mongoose");
const user = require("./User")
const PostSchema = new mongoose.Schema({
    image :{
        type: String,
    },
    caption:{
        type: String,
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    by:{type: mongoose.Schema.ObjectId, ref: 'user'},
    likes:[{ type: mongoose.Schema.ObjectId, ref: 'user' }],
    comments:[{
        by:Object,
        text:String
    }]
})
const posts = mongoose.model("post",PostSchema);
module.exports = posts;
