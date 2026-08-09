//For connecting to the database

import mongoose from "mongoose";

export const connectDB = () => {
    mongoose.connect(process.env.MONGO_URI, {
        dbName: "LIBRARY_MANAGEMENT_SYSTEM",
    }).then(()=>{
        console.log(`Database connected successflly`);
    }).catch(err=> {
        console.log('error connecting to database', err)
    })
};