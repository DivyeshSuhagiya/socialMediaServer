const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController")
const upload = require('../middleware/upload')

router.get('/get' , (req,res) => userController.user.get(req,res));

router.post('/register' ,upload, (req,res) => userController.user.register(req,res));
router.post('/update' ,upload, (req,res) => userController.user.update(req,res));
router.post('/login', (req,res) => userController.user.login(req,res));
router.post('/followRequest', (req,res) => userController.user.followRequest(req,res));
router.post('/followAccept', (req,res) => userController.user.followAccept(req,res));
router.post('/followDelete', (req,res) => userController.user.followDelete(req,res));
router.post('/unfollow', (req,res) => userController.user.unFollow(req,res));

module.exports = router