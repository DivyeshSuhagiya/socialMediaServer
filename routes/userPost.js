const express = require("express");
const router = express.Router();

const userPostController = require("../controllers/userPostController")
const uploadPost = require('../middleware/uploadPost')

router.get('/get' , (req,res) => userPostController.userPost.get(req,res));

router.post('/post' ,uploadPost, (req,res) => userPostController.userPost.post(req,res));

module.exports = router