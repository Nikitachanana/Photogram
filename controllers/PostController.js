const user = require("../models/User")
const post =require("../models/posts")
const cloudinary = require('cloudinary')

const newPost =async (req,res)=>{
    console.log(req.body)
    console.log(req.query)
    var filename;
    const file = req.file.path;
    cloudinary.uploader.upload(file).then(result=>{
        filename = result.url
        var newpost = new post({
            caption:req.body.caption,
            image: filename,
            by: req.query.id
        })
        newpost.save().then(async response=>{
            console.log("Addeddd")
            await user.update({_id:req.query.id},{$push:{posts:response._id}})
            res.status(200).json({
                success: "Post added"
            })
        })
    })
}

const follow = async (req,res)=>{
    await user.update({_id:req.body.id},{$push:{following:req.body.userId}})
    await user.update({_id:req.body.userId},{$push:{followers:req.body.id}})
    res.json({
        success:"done"
    })
 
}
const unfollow = async (req,res)=>{
    await user.update({_id:req.body.id},{$pull:{following:req.body.userId}})
    await user.update({_id:req.body.userId},{$pull:{followers:req.body.id}})
    res.json({
        success:"done"
    })
   
}

const allUsers =async (req,res)=>{
    const Allusers = await user.find({_id:{$ne:req.query.id}})
    const userdata = await user.findOne({_id:req.query.id})
    const following = userdata.following
    // console.log(following)
    var data = {}
    var result = []
    for(i of Allusers){
        // console.log(following.indexOf(i._id))
        if(following.indexOf(i._id)>-1){
            data = {
                _id:i._id,
                username:i.username,
                name:i.name,
                img:i.img,
                follow:true
            }
        }else{
            data = {
                _id:i._id,
                username:i.username,
                name:i.name,
                follow:false,
                img:i.img,
            }
        }
        result.push(data)
    }
    const allposts= await post.find({})
    var postData = []
    var final = []
    var newpost
    var singlepost
    for(i of allposts){
        // console.log(i)
        if(following.indexOf(i.by)>-1){
            singlepost = await post.findOne({_id:i._id}).populate("by").exec()
            // console.log(singlepost)
            
        }
        if(singlepost && !postData.includes(singlepost)){
            postData.push(singlepost)
        }      
    }
    for(i of userdata.posts){
        const ownpost = await post.findOne({_id:i._id}).populate("by").exec()
        postData.push(ownpost)
    }
for(j of postData){
    if(j.likes.indexOf(req.query.id)>-1){
        newpost ={
            createdAt:j.createdAt,
            likes:j.likes,
            _id:j._id,
            caption:j.caption,
            image:j.image,
            by:j.by,
            comment:j.comments,
            liked:true
        }
    }
    else{
        newpost ={
            createdAt:j.createdAt,
            likes:j.likes,
            _id:j._id,
            caption:j.caption,
            image:j.image,
            by:j.by,
            comment:j.comments,
            liked:false
        }
    }
    final.push(newpost)
}
// console.log(final)
res.json({
    data:result,
    posts:final
})   
}

const userPosts =(req,res)=>{
console.log(req.query)
    user.findOne({_id:req.query.id}).populate("posts").exec((err, posts)=>{
        res.json({
            data:posts.posts
        })
    })
}


const like =async (req,res)=>{
    console.log(req.body)
    post.update({_id:req.body.postId},{$push:{likes:req.body.id}}).then(response=>{
        res.json({
            success:"liked"
        })
    }).catch(err=>{
        console.log(err)
        res.json({
            error:"Something went wrong!"
        })
    })

}
const unlike =async (req,res)=>{
    console.log(req.body)
    post.update({_id:req.body.postId},{$pull:{likes:req.body.id}}).then(response=>{
        res.json({
            success:"liked"
        })
    }).catch(err=>{
        console.log(err)
        res.json({
            error:"Something went wrong!"
        })
    })

}

const addcomment =async (req,res)=>{
    console.log(req.body)
    var data={
        by:req.body.by,
        text:req.body.text
    }
    post.updateOne({_id:req.body.postId},{$push:{comments:data}}).then(response=>{
        console.log(response)
        res.json({
            success:"Addded!"
        })
    })
}

const deleteComment =async (req,res)=>{
    console.log(req.body)
    post.update({_id:req.body.postId},{$pull:{comments:{_id:req.body.commentId}}}).then(response=>{
        console.log(response)
        res.json({
            success:"deleted!"
        }).catch(err=>{
            console.log(err)
            res.json({
                error:"Something went wrong!"
            })
        })
    })
}
module.exports={
    newPost:newPost,
    userPosts:userPosts,
    allUsers:allUsers,
    follow:follow,
    unfollow:unfollow,
    like:like,
    unlike:unlike,
    addcomment:addcomment,
    deleteComment:deleteComment

}