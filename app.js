const express = require('express')
const app = express()
const mainRoutes = require("./Routes/MainRouter")
require('dotenv').config()
const port = process.env.PORT || 5050
app.use(express.json());
app.use("/api", mainRoutes)
app.listen(port, () => console.log(`App is running on  ${port}!`))
// require("./controllers/passport-setup")
const cloudinary = require('cloudinary')

const mongoose = require('mongoose');
var connectionString = 'mongodb+srv://nikita:nikigungun@cluster0.hqkhb.mongodb.net/Instagramm?retryWrites=true&w=majority'
mongoose.connect(connectionString,
  { useUnifiedTopology: true, useNewUrlParser: true ,useCreateIndex: true}, (err, client) => {
    if (err) return console.error(err)
    console.log('Connected to Database')
  })
  cloudinary.config({
    cloud_name: "nikita4206",
    api_key: 818828728795436,
    api_secret: "Yselfwkj5B4SZ1Kcw77_2PDEpPE",
    });