import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config()

const db = () => mongoose.connect(process.env.MONGO_URL)
.then(() => {
  console.log("DB Connection Succesful");
})
.catch((error) => {
  console.log("Not Connected");
  console.log(error);
}
)
export default db