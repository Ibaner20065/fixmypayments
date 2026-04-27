import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@fixmypayments.com';

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.warn('SMTP not fully configured. Email sending will be disabled.');
}

export async function sendEmail(to: string, subject: string, html: string, text?: string) {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('Skipping sendEmail because SMTP is not configured.');
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: FROM_EMAIL,
    to,
    subject,
    text: text || undefined,
    html,
  });

  return info;
}
