const nodemailer = require('nodemailer');

/**
 * Utility function to send email via SMTP (Nodemailer)
 * Designed for production and development (Ethereal test accounts)
 */
const sendEmail = async (options) => {
  let transporter;

  // Check if configuration exists in env
  const hasSMTPConfig = process.env.SMTP_HOST && process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD;

  if (hasSMTPConfig) {
    const isGmail = process.env.SMTP_HOST.includes('gmail.com');
    const port = parseInt(process.env.SMTP_PORT) || 587;
    const isSecure = port === 465;

    console.log(`🔌 Initializing SMTP transporter with host: ${process.env.SMTP_HOST}, port: ${port}`);

    // If using Gmail, specialized configuration is often needed for cloud providers
    if (isGmail) {
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: port,
        secure: isSecure, // true for 465, false for 587 (STARTTLS)
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        },
        tls: {
          // Necessary for connections from some hosting providers (like Render)
          rejectUnauthorized: false
        }
      });
    } else {
      // Standard SMTP transporter
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: port,
        secure: isSecure,
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    }
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

  try {
    const info = await transporter.sendMail(message);

    if (!hasSMTPConfig) {
      console.log(`📩 Message sent to Ethereal. Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    } else {
      console.log('📩 Email sent successfully');
    }
    return info;
  } catch (error) {
    console.error('❌ Error in sendEmail utility:');
    console.error(error);
    throw error; // Propagate the error so controllers can handle it correctly
  }
};

module.exports = sendEmail;

