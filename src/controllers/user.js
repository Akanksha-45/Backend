import {asyncHandler} from '../utils/asyncHandler.js';
import ApiError from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import uploadOnCloudinary, { uploadToCloudinary } from '../utils/cloudinary.js';

import { ApiResponse} from './../utils/ApiResponse';


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
console.log("email",email);
console.log("password",password);

if(
    [fullName,email,username,password].some((feild) => 
        feild?.trim() === "")
){
    throw new ApiError("All feilds are required",400)}

   const existedUser = User.findOne({
        $or:[
            {email},
            {username}
        ]



    })

    if(existedUser){
        throw new ApiError("User already exists with given email or username",400)
    }

   const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverimage[0]?.path;


if(!avatarLocalPath){
    throw new ApiError("Avatar is required",400)}

   
    const avatar = await uploadToCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary (coverImageLocalPath) 

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

export {
    registerUser,
}