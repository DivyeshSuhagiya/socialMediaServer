const express = require("express");
const router = express.Router();

const userRoutes = require('./user');
router.use('/user' , userRoutes);
const userPostRoutes = require('./userPost');
router.use('/userPost' , userPostRoutes);

module.exports = router;