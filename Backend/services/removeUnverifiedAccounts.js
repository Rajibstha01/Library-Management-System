import cron from "node-cron";
import { User } from "../models/userModel.js";

export const removeUnverifiedAccounts = () => {
    cron.schedule("*/30 * * * *", async () => { // runs every 30 minutes
        try {
            const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

            await User.deleteMany({
                accountVerified: false, // never completed the OTP step
                createdAt: { $lt: thirtyMinutesAgo }, // gives real users a 30-min window to still verify
            });
        } catch (error) {
            console.error("Error in removeUnverifiedAccounts cron job:", error);
        }
    });
};