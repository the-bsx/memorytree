import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT || 587,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const verificationUrl = `${process.env.CLIENT_URL}/api/v1/auth/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: `"MemoryTree" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Verify Your Email Addresss",
      html: `
             <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea, #764ba2);
              padding: 40px 20px;
              text-align: center;
              color: white;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 40px 30px;
              color: #333;
            }
            .content p {
              line-height: 1.6;
              margin-bottom: 20px;
            }
            .button {
              display: inline-block;
              padding: 14px 32px;
              background: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
            }
            .footer {
              background: #f8f9fa;
              padding: 20px;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
            .link-box {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 6px;
              word-break: break-all;
              margin: 20px 0;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 Verify Your Email</h1>
            </div>
            <div class="content">
              <p>Hello!</p>
              <p>Thank you for registering with Auth Demo. Please verify your email address by clicking the button below:</p>
              
              <center>
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </center>
              
              <p>Or copy and paste this link into your browser:</p>
              <div class="link-box">${verificationUrl}</div>
              
              <p><strong>This link will expire in 24 hours.</strong></p>
              
              <p>If you didn't create an account, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2026 MemoryTree. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
            `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Verification email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Email send error:", error);
    throw new Error("Failed to send verification email");
  }
};

const sendWelcomeEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: `"MemoryTree" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Welcome to MemoryTree! 🎉",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea, #764ba2);
              padding: 40px 20px;
              text-align: center;
              color: white;
            }
            .content {
              padding: 40px 30px;
              color: #333;
            }
            .footer {
              background: #f8f9fa;
              padding: 20px;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome, ${name}!</h1>
            </div>
            <div class="content">
              <p>Your email has been successfully verified!</p>
              <p>You can now access all features of your account.</p>
              <p>Thank you for joining us!</p>
            </div>
            <div class="footer">
              <p>© 2026 MemoryTree. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log("✅ Welcome email sent");
  } catch (error) {
    console.error("❌ Welcome email error:", error);
  }
};

export { sendVerificationEmail, sendWelcomeEmail };
