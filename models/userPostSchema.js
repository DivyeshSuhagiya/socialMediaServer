"use strict";
var mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { string } = require("joi");
const SALT_WORK_FACTOR = 10;

var userPostSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    userPostImage:{
      type:String,
      trim:true,
    },
    discription: {
      type: String,
      trim:true
    },
    like:{
      type: [{
        userId :String,
        isLike : Boolean 
      }],
      default:[]
    }
  },
  {
    timestamps: true,
  }
);
var userPost = mongoose.model("userPost", userPostSchema);
module.exports = userPost;
