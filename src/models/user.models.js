import mongoose ,{ Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    fullName:{
        type:String,
        required:true,
        trim:true
    },

    username:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        index:true
    },

    email:{
        type:String,
        required:true,
        unique:true,    
        trim:true,
        lowercase:true,
    },

    avatar:{
        type:String,
        required:true
    },

    coverImage:{
        type:String
    },

    password:{
        type:String,
        required:[true,"Password is required"],
        trim:true,
    },

    refreshToken:{
        type:String,
    }

} , {timestamps:true});


userSchema.pre("save", async function() {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});


userSchema.methods.isPasswordCorrect = async function (password) {
   return await bcrypt.compare(password, this.password)

}

userSchema.methods.generateAccessJToken = function() {
    return jwt.sign({
        _id:this._id,
        username:this.username,
        fullName:this.fullName,
        email:this.email,
        avatar:this.avatar
    },
  process.env.REFRESH_TOKEN_SECRET
,{
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    })
    }


userSchema.methods.generateRefreshJwtToken = function(){
      return jwt.sign({
        _id:this._id
       
    },
    process.env.ACCESS_TOKEN_SECRET,{
        
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    })
}



export const  User = mongoose.model("User", userSchema)