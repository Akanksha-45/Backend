import {asyncHandler} from '../utils/asyncHandler.js';
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.models.js";


import uploadOnCloudinary from '../utils/cloudinary.js';

import ApiResponse from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken';


const generateAccessToken = async(userId)=>{
    try {
        const user = await User.findById(userId)

       const accessToken = user.generateAccessToken()
       const refreshToken = user.generateRefreshJwtToken()
         user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}


        if (!user){
            throw new ApiError("User not found while generating access token",404)
        }


    } catch (error) {
        throw new ApiError("Error in generating access token   while generating access token",500)
      
    }
}

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  //validation - not empty, valid email, password strength etc
  //check if user already exists
  //check for images , check for avatar 
  //upload image to cloudinary and get url
  //creat user object with details and avatar url - db
//remove pass and refresh token feild from response
  // check fot user creation
  //return response with user details and token

  const {fullName,email,username,password}= req.body
console.log("fullName:",fullName);
console.log("email:",email);
console.log("username:",username);
console.log("password:",password);


console.log("FILES RECEIVED:", req.files);

if(
    [fullName,email,username,password].some((feild) => 
        feild?.trim() === "")
){
    throw new ApiError("All feilds are required",400)}

   const existedUser = await User.findOne({
        $or:[
            {email},
            {username}
        ]
    })

    if(existedUser){
        throw new ApiError("User already exists with given email or username",400)
    }

 const avatarLocalPath = req.files?.avatar?.[0]?.path;
const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

if (!avatarLocalPath) {
    throw new ApiError("Avatar is required", 400);
}


   
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath) 

    if (!avatar){
        throw new ApiError("Error in uploading avatar image, please try again",500)
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
      email,
       username : username.toLowerCase(),
       password

    })

   const createuser = await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if (!createuser){
    throw new ApiError("Error in creating user, please try again",500)
   }

   return res.status(201).json(
    new ApiResponse(201, createuser,"User created successfully", 
        { user: createuser})
   )




})

const loginUser = asyncHandler(async (req, res) => {
    //req boday - dta
    //username or email
    //find the user 
    //pass check //acces and refresh token
    //send cookies and response succesfully

const {email,username,password} = req.body

if(!username || !email){
    throw new ApiError("Username or password is required",400) 
}

const user = await User.findOne({
    $or:[
        {email},
        {username}
    ]
})

if (!user){
    throw new ApiError("Invalid credentials",400)
}
const isPasswordCorrect = await user.isPasswordCorrect(password)




if (!isPasswordCorrect){
    throw new ApiError("Invalid credentials",400)
}

const {accessToken, refreshToken} = await generateAccessToken(user._id)

const options ={
    httpOnly : true,
    secure: true
}

 return res.status(200).cookie("accessToken", accessToken, options).
 cookie("refreshToken", refreshToken, options).json(
    new ApiResponse(200, 
        {user: user, accessToken},
        "User logged in successfully"
    )
 )
    



})

const logoutUser = asyncHandler(async (req, res) => {
await User.findByIdAndUpdate(req.user._id, {
    $set :{
        refreshToken: undefined
    }
}, {new:true})


const options ={
    httpOnly : true,
    secure: true
}
return res.status(200)
.cookie("refreshToken", options)
.clearCookie("accessToken", options)
.json(
    new ApiResponse(200, null, "User logged out successfully")
)
   


    
})


const refreshAccessToken = asyncHandler( async(req,res) => {
  const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken
if (!incomingRefreshToken){
    throw new ApiError("unauthorized request ",400)
}
  try{
const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
   
const user = await User.findById(decoded._id)
if (!user || user.refreshToken !== incomingRefreshToken){
    throw new ApiError("Unauthorized request",401)  
}

const {accessToken, newrefreshToken} = await generateAccessToken(user._id)

const options ={
    httpOnly : true,
    secure: true
}

return res.status(200)
.cookie("accessToken", accessToken, options)
.cookie("refreshToken", newrefreshToken, options)
.json(
    new ApiResponse(200, {accessToken, refreshToken: newrefreshToken}, "Access token refreshed successfully")

)
  }catch(error){
    throw new ApiError("Invalid refresh token",401) 

  }

})


const changeCurrentPassword = asyncHandler(async(req,res) => {
const {oldPassword, newPassword} = req.body

const user = await User.findById(req.user._id)
user.isPasswordCorrect(oldPassword)
 if(!isPasswordCorrect){
    throw new ApiError("Old password is incorrect",400)
 }

 user.password = newPassword
 await user.save({validateBeforeSave: false})

    return res.status(200).json(    
        new ApiResponse(200, null, "Password changed successfully")
    )


})

const getCurrentUser = asyncHandler(async(req,res) => {
    return res
    .status(200)
    .json(200, req.user, "Current user fetched successfully")
    
})


const updateAccountDetails = asyncHandler(async(req,res) => {
const {fullName, username, email} = req.body
if(!fullName ||  !email){
    throw new ApiError("All feilds are required",400)  
} 

const user = User.findByIdAndUpdate(req.user._id,
     {
$set :{
    fullName,
    email: email


}

     }, {new:true}
    ) .select("-password -refreshToken")

    return res.status(200).json(
        new ApiResponse(200, user, "Account details updated successfully")
    )




})


const updateUserAvatar = asyncHandler(async(req,res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError("Avatar image is missing", 400)
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url){
        throw new ApiError("Error in uploading avatar image, please try again",500)
    }


   const user = await User.findByIdAndUpdate(req.user._id, {
        $set :{
            avatar: avatar.url
        }
    }, {new:true}).select("-password -refreshToken")

    return res.status(200)
    .json(
        new ApiResponse(200, user, "avatar image updated successfully")
    )



})



const updateUserCoverImage = asyncHandler(async(req,res) => {
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError("Image image is missing", 400)
    }

    const cover = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url){
        throw new ApiError("Error in uploading cover image, please try again",500)
    }


   const user = await User.findByIdAndUpdate(req.user._id, {
        $set :{
            coverImage: coverImage.url
        }
    }, {new:true}).select("-password")

    return res.status(200)
    .json(
        new ApiResponse(200, user, "Cover image updated successfully")
    )



})


const getUserChannelPrfile = asyncHandler(async(req,res) => {
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError("Username is missing",400)}

       const channel =  await User.aggregate([
        {
            $match :{
                username: username.toLowerCase()
            }
        },
        {
            $lookup:{
                from: "subcriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup:{
                from: "subcriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount: {$size: "$subscribers"},
                subscribedToCount: {$size: "$subscribedTo"},
                isSubscribed:{
                    $cond: {
                        if: {
                            $in: [req.user._id, "$subscribers.subscriber"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project:{
                fullName:1,
                username:1,
                avatar:1,
                subscribersCount:1,
                subscribedToCount:1, 
                isSubscribed:1,
                email:1,
                coverImage:1
            }
        }
    ])

   if(!channel?.length) {
    throw new ApiError("Channel not found with given username",404)
   }


    return res.status(200).json(
        new ApiResponse(200, channel[0], "Channel profile fetched successfully")
    )





})



const getWatchHistory = asyncHandler(async(req,res) => {
    //get watch history of user
    //populate video details in history
    //return response with history
   const user = await User.aggregate([
    {
        $match:{
            _id : new mongoose.Types.ObjectId(req.user._id) 

        }
    },
    {
        $lookup:{
            from: "videos",
            localField: "watchHistory",
            foreignField: "_id",
            as: "watchHistory",
            pipeline:[
                {
                    $lookup:{
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        as: "owner",
                        pipeline:[
                            {
                                $project:{
                                    fullName:1,
                                    username:1,
                                    avatar:1
                                }
                            }
                        ]
                    }
                },
                {
                    $addFields:{
                        owner:{
                            $first:"$owner"
                        }
                    }
                }
            ]
        }
    }
   ])

   return res.status(200).json(
       new ApiResponse(200, user[0].watchHistory, "Watch history fetched successfully")
   )

})
   











export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelPrfile,
    getWatchHistory
}