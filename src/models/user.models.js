import mongoose ,{ Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowecase:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,    
        trim:true,
        lowercase:true,
       
    },
    password:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String, //cloudianry url
        required:true,
        trim:true
    },

    coverImage:{
        type:String //cloudianry url
        
    },

    watchHistory :[
        {
            type :Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true,"Password is required"],
        trim:true,
    },

    refreshToken:{
        type:String,
        trim:true
    }





} , {timestamps:true});


userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        return next();
    }   
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (Password) {
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
    process.env.ACCESS_TOKEN_SECRET,{
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