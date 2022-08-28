const { func } = require('joi')
const mongoose = require('mongoose')
const USERPOST = mongoose.model('userPost')
const USER = mongoose.model('users')
const multer = require('multer')
const path = require('path')
const cloudinary = require('cloudinary').v2;
var nodemailer = require('nodemailer');
var cron = require('node-cron');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


// cloudinary.config({
//   cloud_name: 'dhhptbxer',
//   api_key: '162163173464867',
//   api_secret: 'AkpAvOHhM1x6VAHTa7ZHEJuEjTo',
//   secure: true
// });

const {
  badRequestResponse,
  successResponse,
  notFoundResponse,
  errorResponse
} = require('../middleware/response')
exports.userPost = {
  get: async (req, res) => {
    try {
      const users = await USERPOST.find({})
      res.json({
        isSuccess: true,
        data: users
      })
    } catch (error) {
      res.json({
        isSuccess: false,
        data: error
      })
    }
  },
  post: async function (req, res) {
    try {
      const userInfo = await USER.findOne({
        _id: req.body.userId,
      });
      if (!userInfo) {
        return badRequestResponse(res, {
          message: "This user is not registered!",
        });
      }
      const userPost = {
        userId: req.body.userId,
        location: req.body.location,
        discription: req.body.discription,
      };
      if (req.file) {
        userPost.userPostImage = req.file.path;
      }
      const isCreated = await USERPOST.create(userPost)
      if (isCreated) {
        return successResponse(res, {
          message: 'Post Add successfully',
        })
      } else {
        return badRequestResponse(res, {
          message: 'Failed to add post',
        })
      }
    } catch (error) {
      return errorResponse(error, req, res);
    }
  }
}