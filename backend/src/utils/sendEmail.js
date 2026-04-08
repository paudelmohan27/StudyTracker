const { Resend } = require('resend');

/**
 * Utility function to send email via Resend HTTP API.
 * Uses HTTPS (port 443) instead of SMTP, which works on all hosting providers
 * including Render's free tier which blocks outbound SMTP ports (587, 465).
 */
const sendEmail = async (options) => {
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not set in environment variables.');
    throw new Error('Email service is not configured. Please set RESEND_API_KEY.');
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const from = `${process.env.FROM_NAME || 'StudyTracker'} <${process.env.FROM_EMAIL || 'onboarding@resend.dev'}>`;

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

module.exports = sendEmail;
