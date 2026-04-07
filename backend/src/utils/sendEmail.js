const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Try to create a transporter using regular SMTP credentials
  let transporter;
  
  if (process.env.SMTP_HOST && process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
    const isGmail = process.env.SMTP_HOST.includes('gmail');
    
    transporter = nodemailer.createTransport(
      isGmail 
      ? {
          service: 'gmail',
          auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
          },
        }
      : {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: parseInt(process.env.SMTP_PORT) === 465,
          auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
          },
        }
    );
  } else {
    // Development fallback using Ethereal Email if no SMTP set
    console.log('⚠️ No SMTP config found in .env, falling back to ethereal email (test account)');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  const message = {
    from: `${process.env.FROM_NAME || 'StudyTracker'} <${process.env.FROM_EMAIL || 'noreply@studytracker.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.htmlMessage || options.message.replace(/\n/g, '<br>'),
  };

  const info = await transporter.sendMail(message);

  if (!process.env.SMTP_HOST || !process.env.SMTP_EMAIL) {
    console.log(`📩 Message sent to Ethereal. Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  } else {
    console.log('📩 Email sent successfully');
  }
};

module.exports = sendEmail;
