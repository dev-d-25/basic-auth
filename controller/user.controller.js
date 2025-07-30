import User from "../models/User.model.js";
import crypto from "crypto";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

dotenv.config();

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  // console.log(res.body.email);
  // first of all check if the user is summbited all the data
  // then check the user already exists or not in the db
  // if exist then nothing
  // else add to the db
  // create a token
  // send token to the user on the email
  // send succes status to the user
  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All field are required",
    });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User Already Exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
    });
    console.log(user);
    if (!user) {
      return res.status(400).json({
        message: "User not registered",
      });
    }
    const token = crypto.randomBytes(16).toString("hex");
    console.log(token);
    user.verificationToken = token;

    await user.save();

    // send mail to user
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });
    const verificationLink = `${process.env.BASE_URL}/verify/${token}`;
    // Wrap in an async IIFE so we can use await.

    const mailOption = {
      from: process.env.MAILTRAP_SENDEREMAIL,
      to: user.email,
      subject: "Verify your email", // Subject line
      text: verificationLink, // plain‑text body
      html: `
        <p>Hello,</p>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationLink}">Verify Email</a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOption);

    // console.log("Message sent:", info.messageId);
    return res.status(200).json({
      message: "User Registered",
      // error: error.message,
      success: "true",
    });
  } catch (error) {
    return res.status(400).json({
      message: "User not Registered",
      error: error.message,
      success: "false",
    });
  }
};

const verifyUser = async (req, res) => {
  // get the token value from the url(params)
  // check if the user is exists using token
  // if not then error
  // if yes the verifyuser is true
  // and remove the token
  // save
  // success
  try {
    const { token } = req.params;
    console.log(token);

    const user = await User.findOne({ verificationToken: token });
    console.log(user);

    user.isVerified = true;
    user.verificationToken = undefined;

    await user.save();
    return res.status(200).json({
      // error: error.message,
      message: "$Verified Succesfully",
      success: true,
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message,
      message: "Invalid Token",
      success: false,
    });
  }
};

const login = async (req, res) => {
  // get the email and pass from the body
  // find user based on the email
  // check the password is correct or not
  // then send jwt token in the cookies

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: error.message,
      message: "All Fields are required",
      success: false,
    });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        // error: error.message,
        message: "Email is not regisered",
        success: false,
      });
    } else {
      // await bcrypt.compare("user enterd pass", db stored pass); // true
      console.log(user.email, user.password);
      console.log(password);
      const isMatch = await bcrypt.compare(password, user.password); // true
      console.log(isMatch);

      if (!isMatch) {
        return res.status(400).json({
          // error: error.message,
          message: "Password is Incorrect",
          success: false,
        });
      }
      const token = await jwt.sign(
        { id: user._id },
        process.env.JWT_SECERT_KEY,
        {
          expiresIn: "24h",
        }
      );
      console.log(token);

      let cookieOptions = {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true, // The cookie only accessible by the web server
        secure: true,
      };

      // Set cookie
      res.cookie("token", token, cookieOptions);
      return res.status(200).json({
        // error: error.message,
        message: "Login Succesfull",
        success: "true",
        token,
        userinfo: {
          id: user._id,
          email: user.email,
        },
      });
    }
  } catch (error) {
    return res.status(400).json({
      error: error.message,
      message: "Login Unscessfull",
      success: false,
    });
  }
};

const getMe = async (req, res) => {
  const userInfo = await User.findById(req.user.id).select("-password");
  console.log(userInfo);
  if (!userInfo) {
    return res.status(400).json({
      success: false,
      message: "User not found",
    });
  }
  try {
    res.status(200).json({
      success: true,
      user: userInfo,
    });
  } catch (error) {
    console.log("Error in get me", error);
  }
};
export { registerUser, verifyUser, login, getMe };
