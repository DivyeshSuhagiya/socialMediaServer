const { func } = require('joi')
const mongoose = require('mongoose')
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
exports.user = {
  get: async (req, res) => {
    try {
      const users = await USER.find({})
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
  login: async (req, res) => {
    try {
        let userInfo = await USER.findOne({
            email: req.body.email,
        });
        if (!userInfo) {
            return notFoundResponse(res, {
                message: "Email not found!",
            });
        }
        if (!bcrypt.compareSync(req.body.password, userInfo.password)) {
            return badRequestResponse(res, {
                message: "Authentication failed. Wrong password.",
            });
        }
        if (!userInfo.isActive) {
            return badRequestResponse(res, {
                message:
                    "Your account is deactivated, please activate your account from here",
                accountDeactive: true,
            });
        }
        var token = jwt.sign(userInfo.toJSON(), process.env.secret, {
            expiresIn: "24h", // expires in 24 hours
        });
        return successResponse(res, {
            message: "You are logged in successfully!",
            token,
            userInfo,
        });
    } catch (error) {
        return errorResponse(error, req, res);
    }
},
  register: async function (req, res) {
    try {
      const userInfo = await USER.findOne({
        email: req.body.email,
      });
      if (userInfo) {
        return badRequestResponse(res, {
          message: "Email already exist!",
        });
      }
      if (req.body.password !== req.body.confirmPassword) {
        return badRequestResponse(res, {
          message: "Password and Confirm Password must be same",
        });
      }
      
      const user = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        mobile: req.body.mobile,
        password: req.body.password,
        birthDate:req.body.birthDate,
        isActive: false
      };
      const otpCode = this.getOtpCode();
      if(req.file)
      {
        user.profileImage = req.file.path;
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.gmailUserName,
          pass: process.env.gmailPassword,
        },
      });

      const emailSended = await transporter.sendMail({
        from: "Practice Math",
        to: req.body.email,
        subject: "Your OTP",
        text: "Please activate your account in order to use the SDC Media APP - SDC Media APP",
        html: `<h2>Thank you signup with SDC Media APP - SDC Media APP. <br />Your account activation code is: ${otpCode}.</h2>`,
      });

      if (emailSended.accepted) {
        user.accountActivationCode = otpCode;
        var isCreated = await USER.create(user);
        if (isCreated) {
          let time = await USER.findOne({
            email: req.body.email,
          })
          let dt = new Date(time.createdAt)
          let a = dt.getMinutes() + 2;

          console.log(dt.getMinutes())
          if (a == 60) {
            a = 0;
          }
          else if (a == 61) {
            a = 1;
          }
          console.log(a)

          cron.schedule(`${a} * * * *`, async () => {

            if (time.isActive !== false) {
              console.log(time.isActive)
              await USER.findOneAndRemove({
                email: req.body.email,
              })
            }
            else {
              console.log(time.isActive)
            }
          })
          return successResponse(res, {
            message: "User created!",
          });

        }
        else {
          return badRequestResponse(res, {
            message: "Failed to create user",
          });
        }
      } else {
        return badRequestResponse(res, {
          message: "Failed to send account activation code",
        });
      }

    } catch (error) {
      return errorResponse(error, req, res);
    }
  },
  activateAccount: async function (req, res) {
    try {
      let userInfo = await USER.findOne({
        email: req.body.email,
      });
      if (!userInfo) {
        return badRequestResponse(res, {
          message: "User not found!",
        });
      }
      if (userInfo.accountActivationCode == req.body.accountActivationCode) {
        const isUpdated = await USER.findOneAndUpdate(
          { _id: userInfo._id },
          {
            $set: {
              isActive: true,
            },
          }
        );
        if (isUpdated) {
          return successResponse(res, {
            message: "Account activated successfully",
          });
        } else {
          return badRequestResponse(res, {
            message: "Failed to activate account",
          });
        }
      } else {
        return badRequestResponse(res, {
          message: "Please enter correct activation code",
        });
      }
    } catch (error) {
      return errorResponse(error, req, res);
    }
  },
  forgetPassword: async function (req, res) {
    try {
      const userInfo = await USER.findOne({
        email: req.body.email,
      });
      if (!userInfo) {
        return badRequestResponse(res, {
          message: "User not found!",
        });
      }
      const otpCode = this.getOtpCode();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.gmailUserName,
          pass: process.env.gmailPassword,
        },
      });

      const emailSended = await transporter.sendMail({
        from: "Welders Math",
        to: req.body.email,
        subject: "Forget password",
        text: "We have received your forget password request",
        html: `Code: ${otpCode} <br />Otp code will be expired in 10 minutes`,
      });
      if (emailSended.accepted) {
        await USER.findOneAndUpdate(
          { _id: userInfo._id },
          {
            $set: {
              forgetPasswordOtp: otpCode,
              forgetPasswordOtpExpireTime: this.getOtpExpireTime(),
            },
          }
        );
        return successResponse(res, {
          message:
            "Forget password otp code send, please check your email account.",
        });
      } else {
        return badRequestResponse(res, {
          message: "Failed to send otp code",
        });
      }
    } catch (error) {
      return errorResponse(error, req, res);
    }
  },
  verifyOtpCode: async function (req, res) {
    try {
      const userInfo = await USER.findOne({
        email: req.body.email,
      });
      if (!userInfo) {
        return badRequestResponse(res, {
          message: "User not found",
        });
      }
      if (!userInfo.forgetPasswordOtp) {
        return badRequestResponse(res, {
          message: "Please send the request for forget password first",
        });
      }
      if (new Date(userInfo.forgetPasswordOtpExpireTime) < new Date()) {
        return badRequestResponse(res, {
          message: "Otp code is expired, please send the code again",
        });
      }
      if (userInfo.forgetPasswordOtp != req.body.otpCode) {
        return badRequestResponse(res, {
          message: "Otp code is invalid",
        });
      }
      if (req.body.newPassword !== req.body.confirmPassword) {
        return badRequestResponse(res, {
          message: "Password and Confirm Password must be same",
        });
      }
      userInfo.password = req.body.newPassword;
      await USER.findOneAndUpdate(
        { _id: userInfo._id },
        {
          $set: {
            password: userInfo.password,
            forgetPasswordOtp: null,
            forgetPasswordOtpExpireTime: null,
          },
        }
      );
      return successResponse(res, {
        message: "Password reset successfully",
      });
    } catch (error) {
      return errorResponse(error, req, res);
    }
  },
  changePassword: async function (req, res) {
    try {
      const userInfo = await USER.findOne({
        email: req.body.email,
      });
      if (!userInfo) {
        return badRequestResponse(res, {
          message: "User not found",
        });
      }
      if (!bcrypt.compareSync(req.body.oldPassword, userInfo.password)) {
        return badRequestResponse(res, {
          message: "Old password should be same as new password",
        });
      }
      if (req.body.newPassword !== req.body.confirmPassword) {
        return badRequestResponse(res, {
          message: "Password and Confirm Password must be same",
        });
      }
      userInfo.password = req.body.newPassword;
      var isUpdated = await USER.findOneAndUpdate(
        { _id: userInfo._id },
        {
          $set: {
            password: userInfo.password,
          },
        }
      );
      if (isUpdated) {
        return successResponse(res, {
          message: "Password changed successfully",
        });
      } else {
        return badRequestResponse(res, {
          message: "Failed to update password",
        });
      }
    } catch (error) {
      return errorResponse(error, req, res);
    }
  },
  getOtpCode: function () {
    return parseFloat(
      `${Math.ceil(Math.random() * 5 * 100000)}`.padEnd(6, "0")
    );
  },
  getOtpExpireTime: function () {
    return new Date(new Date().getTime() + 10 * 60000);
  },
}