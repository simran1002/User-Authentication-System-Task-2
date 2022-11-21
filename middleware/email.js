require('dotenv').config();
const nodemailer=require("nodemailer");

let transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOS || "smtp.office365.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || "support@tecrun.tech",
    pass: process.env.EMAIL_PASS || "nova@0144",
  },
});
module.exports=transporter;