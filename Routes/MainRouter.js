const express = require('express')
const router = express.Router()
const Maincontroller = require("../controllers/MainController")
const Postcontroller = require("../controllers/PostController")
var multer = require("multer")
const PostController = require('../controllers/PostController')
var storage = multer.diskStorage({});   
var upload = multer({storage:storage});


router.route("/signup").post(Maincontroller.signup)
router.route("/login").post(Maincontroller.login)
router.route("/send-OTP").post(Maincontroller.sendOTP)
router.route("/change-password").post(Maincontroller.changePassword)
router.route("/authenticate").get(Maincontroller.authentication)
router.route("/googleLogin").post(Maincontroller.googleLogin)
router.route("/facebooklogin").post(Maincontroller.facebooklogin)
router.route("/new-post").post(upload.single("image"), Postcontroller.newPost)
router.route("/user-posts").get(Postcontroller.userPosts)
router.route("/userData").get(Maincontroller.userData)
router.route("/edit-profile").post(upload.single("image"),Maincontroller.editprofile)
router.route("/all-users").get(Postcontroller.allUsers)
router.route("/follow").post(Postcontroller.follow)
router.route("/unfollow").post(Postcontroller.unfollow)
router.route("/like").post(Postcontroller.like)
router.route("/unlike").post(Postcontroller.unlike)
router.route("/comment").post(Postcontroller.addcomment)
router.route("/delete-comment").post(Postcontroller.deleteComment)
module.exports = router;