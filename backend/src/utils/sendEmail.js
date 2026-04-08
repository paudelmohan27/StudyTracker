const { Resend } = require('resend');

// ─── NOTE ON EMAIL PROVIDERS ───────────────────────────────────────────────
// Render's free tier blocks outbound SMTP ports (587 & 465), so we use the
// Resend HTTP API (port 443) instead. The original Nodemailer/SMTP code is
// preserved below in comments — to switch back, uncomment the SMTP block and
// comment out / remove the Resend block.
// ───────────────────────────────────────────────────────────────────────────

// ── [OPTION A - ACTIVE] Resend HTTP API ────────────────────────────────────
// Works on Render free tier. Sign up at https://resend.com (100 emails/day free)
// Required env vars: RESEND_API_KEY, FROM_NAME, FROM_EMAIL
const sendEmail = async (options) => {
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not set in environment variables.');
    throw new Error('Email service is not configured. Please set RESEND_API_KEY.');
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // ✅ FIXED: Default sender now uses your verified domain
  const from = `${process.env.FROM_NAME || 'StudyTracker'} <${process.env.FROM_EMAIL || 'noreply@tracker.paudelmohan.com.np'}>`;

  console.log(`📧 Sending email to: ${options.email} via Resend API`);

  const { data, error } = await resend.emails.send({
    from,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.htmlMessage || options.message.replace(/\n/g, '<br>'),
  });

  if (error) {
    console.error('❌ Resend API error:', error);
    throw new Error(error.message || 'Failed to send email via Resend');
  }

  console.log('📩 Email sent successfully via Resend. ID:', data?.id);
  return data;
};
// ── End of Resend block ─────────────────────────────────────────────────────


// ── [OPTION B - SMTP via Nodemailer] ───────────────────────────────────────
// Use this if your host supports outbound SMTP (ports 587/465).
// Required env vars: SMTP_HOST, SMTP_PORT, SMTP_EMAIL, SMTP_PASSWORD,
//                    FROM_NAME, FROM_EMAIL
//
// const nodemailer = require('nodemailer');
//
// const sendEmail = async (options) => {
//   let transporter;
//
//   const hasSMTPConfig = process.env.SMTP_HOST && process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD;
//
//   if (hasSMTPConfig) {
//     const isGmail = process.env.SMTP_HOST.includes('gmail.com');
//     const port = parseInt(process.env.SMTP_PORT) || 587;
//     const isSecure = port === 465;
//
//     console.log(`🔌 Initializing SMTP transporter with host: ${process.env.SMTP_HOST}, port: ${port}`);
//
//     if (isGmail) {
//       transporter = nodemailer.createTransport({
//         host: 'smtp.gmail.com',
//         port: port,
//         secure: isSecure,
//         auth: {
//           user: process.env.SMTP_EMAIL,
//           pass: process.env.SMTP_PASSWORD,
//         },
//         tls: { rejectUnauthorized: false },
//         family: 4, // Force IPv4
//       });
//     } else {
//       transporter = nodemailer.createTransport({
//         host: process.env.SMTP_HOST,
//         port: port,
//         secure: isSecure,
//         auth: {
//           user: process.env.SMTP_EMAIL,
//           pass: process.env.SMTP_PASSWORD,
//         },
//         family: 4, // Force IPv4
//       });
//     }
//   } else {
//     // Development fallback using Ethereal Email
//     console.log('⚠️ No SMTP config found, falling back to Ethereal (test account)');
//     const testAccount = await nodemailer.createTestAccount();
//     transporter = nodemailer.createTransport({
//       host: 'smtp.ethereal.email',
//       port: 587,
//       secure: false,
//       auth: { user: testAccount.user, pass: testAccount.pass },
//     });
//   }
//
//   const message = {
//     from: `${process.env.FROM_NAME || 'StudyTracker'} <${process.env.FROM_EMAIL || 'noreply@studytracker.com'}>`,
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     html: options.htmlMessage || options.message.replace(/\n/g, '<br>'),
//   };
//
//   try {
//     const info = await transporter.sendMail(message);
//     if (!hasSMTPConfig) {
//       console.log(`📩 Ethereal preview: ${nodemailer.getTestMessageUrl(info)}`);
//     } else {
//       console.log('📩 Email sent successfully via SMTP');
//     }
//     return info;
//   } catch (error) {
//     console.error('❌ SMTP sendEmail error:', error);
//     throw error;
//   }
// };
// ── End of SMTP block ───────────────────────────────────────────────────────


module.exports = sendEmail;
