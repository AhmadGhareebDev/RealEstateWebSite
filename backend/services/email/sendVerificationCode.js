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
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .tagline {
            color: #6b7280;
            margin-bottom: 30px;
            font-size: 14px;
          }
          .welcome-title {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #1f2937;
          }
          .verification-code {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 8px;
            padding: 20px 40px;
            border-radius: 8px;
            margin: 30px auto;
            display: inline-block;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            text-decoration: none;
          }
          .message {
            color: #6b7280;
            margin: 20px 0;
            font-size: 16px;
            line-height: 1.5;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #9ca3af;
          }
          .security-note {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
            color: #92400e;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">REA</div>
          <div class="tagline">Real Estate Platform</div>
          
          <h1 class="welcome-title">Welcome to REA!</h1>
          
          <p class="message">
            Hi ${username || 'there'},<br><br>
            Thank you for joining our real estate platform. To complete your registration and secure your account, please use the verification code below:
          </p>
          
          <div class="verification-code">${code}</div>
          
          <p class="message">
            This code will expire in <strong>15 minutes</strong> for your security.
          </p>
          
          <div class="security-note">
            <strong>🔒 Security Notice:</strong> Never share this code with anyone. Our team will never ask for your verification code via email or phone.
          </div>
          
          <p class="message">
            If you didn't create an account with REA, you can safely ignore this email.
          </p>
          
          <div class="footer">
            <p>This is an automated message from REA Real Estate Platform.</p>
            <p> 2024 REA. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

module.exports = {
  sendVerificationCode
}