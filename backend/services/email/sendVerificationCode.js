const nodemailer = require('nodemailer');
const isProd = process.env.NODE_ENV === 'production';



const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: isProd,
  auth:{
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }

})



const sendVerificationCode = async (email , username , code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to : email,
    subject : 'Verify Your Email - REA',
    html: `
        <h2>Welcome to REA!</h2>
        <p>Hi ${username || 'there'},</p>
        <p>Thank you for registering.
        <p>Here is your Code: ${code}</p>
        <p>This link will expire in 15 mins.</p>
        <p>If you didn't create an account, please ignore this email.</p>
        `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true
  } catch (error) {
    return false
  }
}



module.exports = {
  sendVerificationCode
}