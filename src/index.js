//require ('dotenv').config({path : './env'}





import connectDB from "./db/index.js";





connectDB()





/*
import express from "express"

(async()=< {

    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("error" ,(error) ( =>{
        console.log("ERROR:" ,error);
        throw error
       }))

       app.listen(process.env.PORT,()=>{
        console.log(`App is listening on port ${procces.env.PORT}`);
        throw error
       })



    } catch (error ){
        console.error("ERROR: ",error)
        throw err

    }
})()*/