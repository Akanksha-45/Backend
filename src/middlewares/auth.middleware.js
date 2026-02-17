import { asyncHandler } from "../utils/asyncHandler.js";

import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";




export const verifyJWT = asyncHandler(async (req, res, next) => {
 try {
  const token =  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

if(!token){
    throw new ApiError("Unauthorized, token is missing",401)
}

const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) 

const user = await User.findById(decodedToken._id).select("-password -refreshToken")

    if(!user){
        //todo discuss about frontend 




        throw new ApiError("Unauthorized, user not found",401)
    }
    req.user = user;
    next() }
    catch (error) {

        throw new ApiError("Unauthorized, invalid token",401)
    }




})