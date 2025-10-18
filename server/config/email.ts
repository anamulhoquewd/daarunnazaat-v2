import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// Create Email Transporter config
export const transporter = nodemailer.createTransport({
  service: "gmail", // or your email provider
  auth: {
    user: EMAIL_USER, // Your email address
    pass: EMAIL_PASS, // Your email password key
  },
});
