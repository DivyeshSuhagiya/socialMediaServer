const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController")
const upload = require('../middleware/upload')

router.get('/get' , (req,res) => userController.user.get(req,res));

router.post('/register' ,upload, (req,res) => userController.user.register(req,res));
router.post('/update' ,upload, (req,res) => userController.user.update(req,res));
router.post('/login', (req,res) => userController.user.login(req,res));

module.exports = router