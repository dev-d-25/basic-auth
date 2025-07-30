  // show user profile data if he is logged in 
  // first get the jwt token from the coookies
  // decode it using the keys 
  // check and continue
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.model.js";
 export const isLoggedIn = async (req,res,next) => {
    try {
        console.log(req.cookies);
        const token = req.cookies.token
        if(!token){
            console.log("invalid request");
            return res.status(400).json({
                "message":"Token not found"
            })
        }
        var decoded = await jwt.verify(token, process.env.JWT_SECERT_KEY);
        console.log(decoded.id)
        req.user = decoded
          next()
    } catch (error) {
        res.status(400).json({
            message : "cant verify user using token",
            "error" : error.message
        })
    }
  }
