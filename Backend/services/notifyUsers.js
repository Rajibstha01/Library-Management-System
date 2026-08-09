import cron from "node-cron";
import { Borrow } from "../models/borrowModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateDueDateReminderTemplate } from "../utils/emailTemplates.js";

export const notifyUsers = () => {
    cron.schedule("0 0 * * *", async () => { // "0 0 * * *" = once a day at midnight (min hour day month weekday)
        try {
            const oneDayFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);

            const borrows = await Borrow.find({
                returnDate: null, // book is still checked out
                dueDate: { $lte: oneDayFromNow }, // due within 24h from now, or already overdue
                notified: false, // this is what stops the same user getting spammed every day
            });

            for (const borrow of borrows) {
                try {
                    const message = generateDueDateReminderTemplate(
                        borrow.bookTitle,
                        borrow.dueDate
                    );

                    await sendEmail({
                        email: borrow.user.email,
                        subject: "Book Due Date Reminder",
                        message,
                    });

                    borrow.notified = true; // flip this only after the email actually sends
                    await borrow.save();
                } catch (error) {
                    console.error(`Failed to notify ${borrow.user.email}:`, error);
                }
            }
        } catch (error) {
            console.error("Error in notifyUsers cron job:", error);
        }
    });
};