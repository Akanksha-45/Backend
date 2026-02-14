import mongoose, {Schema} from "mongoose";





const videoSchema = new Schema({
    videoFile:{
        type:String, //cloudinary url
        required:true,
        
    },  thumnail :{
        type:String, //cloudinary url
        required:true,
    },
    title:{
        type:String,
        required:true,  
    },
    description:{
        type:String,
        required:true,
    },
    duration:{  
        type:Number, //in seconds cloudnary
        required:true,
    },

    views:{
        type:Number,
        default:0
    },
    isPublised:{
        type:Boolean,
        default:false
    },

    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },




},{timestamps:true});

videoSchema.plugin





export const Video = mongoose.model("Video", videoSchema)