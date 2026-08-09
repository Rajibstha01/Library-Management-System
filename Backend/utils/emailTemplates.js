export function generateVerificationOtpEmailTemplate(otpCode) {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="text-align: center; color: #4a90e2;">Library Management System</h2>
      <p style="font-size: 16px; color: #333;">Dear User,</p>
      <p style="font-size: 16px; color: #333;">
        Use the following One-Time Password (OTP) to verify your email address. This code is valid for <strong>5 minutes</strong>.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4a90e2;">${otpCode}</span>
      </div>
      <p style="font-size: 14px; color: #777;">
        If you did not request this code, please ignore this email.
      </p>
      <p style="font-size: 14px; color: #777;">Thank you,<br/>Library Management Team</p>
    </div>
  `;
}

export function generateForgotPasswordEmailTemplate(resetPasswordUrl) {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="text-align: center; color: #4a90e2;">Library Management System</h2>
      <p style="font-size: 16px; color: #333;">Dear User,</p>
      <p style="font-size: 16px; color: #333;">
        You recently requested to reset your password. Click the button below to proceed. This link is valid for <strong>15 minutes</strong>.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetPasswordUrl}" style="background-color: #4a90e2; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px;">Reset Password</a>
      </div>
      <p style="font-size: 14px; color: #777;">
        If you did not request this, please ignore this email.
      </p>
      <p style="font-size: 14px; color: #777;">Thank you,<br/>Library Management Team</p>
    </div>
  `;
}

export function generateDueDateReminderTemplate(bookTitle, dueDate) {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="text-align: center; color: #4a90e2;">Library Management System</h2>
      <p style="font-size: 16px; color: #333;">Dear User,</p>
      <p style="font-size: 16px; color: #333;">
        This is a reminder that your borrowed book "<strong>${bookTitle}</strong>" is due on <strong>${new Date(dueDate).toDateString()}</strong>.
      </p>
      <p style="font-size: 16px; color: #333;">
        Please return it on time to avoid late fines.
      </p>
      <p style="font-size: 14px; color: #777;">Thank you,<br/>Library Management Team</p>
    </div>
  `;
}