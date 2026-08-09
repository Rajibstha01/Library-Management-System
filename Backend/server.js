import { app } from "./app.js";
import { v2 as cloudinary } from "cloudinary";
import { notifyUsers } from "./services/notifyUsers.js";
import { removeUnverifiedAccounts } from "./services/removeUnverifiedAccounts.js";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
    api_key: process.env.CLOUDINARY_CLIENT_API,
    api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

notifyUsers();
removeUnverifiedAccounts(); 
app.listen(process.env.PORT, () => {
    console.log(`Server is running at port ${process.env.PORT}`);
});