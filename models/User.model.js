import mongoose from "mongoose"
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    isVerified:{
    type: Boolean , 
    default: false
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordTokenExpires: String,
},
{
    timestamps:true,
}
)

userSchema.pre("save",async function (next) {
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
    }
    next()
}
)



const User = mongoose.model("User", userSchema);
export default User;