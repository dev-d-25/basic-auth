import express from "express";
import db from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
dotenv.config()

import 'dotenv/config'
const app = express();
const port = process.env.PORT || 4000;
app.use(express.json()); // to send json messages in the response 
app.use(express.urlencoded({ extended: true }));  // to get the data from the url (params)
app.use(cookieParser());  // to setup and manage cookies 

// app.post("/", (req, res) => {
//   res.send("Hello World??");
// });

db()

app.use("/api/v1/users",userRoute)
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
