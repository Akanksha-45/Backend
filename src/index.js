//require ('dotenv').config({path : './env'}


import express from "express";


import connectDB from "./db/index.js";
import userRouter from "./routes/user.routes.js";




const app = express();

app.use("/api/v1/users", userRouter);

connectDB()

.then (() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`App is listening on port ${process.env.PORT || 8000}`);
    })
})
.catch((err) => {
    console.log("MONGO DB CONNECTION ERROR ", err);
})









// import express from "express"

// (async()=< {

//     try {
//        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//        app.on("error" ,(error) ( =>{
//         console.log("ERROR:" ,error);
//         throw error
//        }))

//        app.listen(process.env.PORT,()=>{
//         console.log(`App is listening on port ${procces.env.PORT}`);
//         throw error
//        })



//     } catch (error ){
//         console.error("ERROR: ",error)
//         throw err

//     }
// })() 