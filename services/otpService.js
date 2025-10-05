// OTP service for phone (mock) + email
const nodemailer = require('nodemailer');

const otpStore = {}; // { identifier: { otp, expiresAt } }
const EXP_MIN = parseInt(process.env.OTP_EXPIRY_MIN || '5', 10);

// nodemailer transporter (email)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or any other provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP to phone (mock)
function sendOtp(phone) {
  const otp = generateOTP();
  const expiresAt = Date.now() + EXP_MIN * 60 * 1000;
  otpStore[phone] = { otp, expiresAt };
  console.log(`[OTP SERVICE] OTP for ${phone}: ${otp} (valid ${EXP_MIN} min)`);
  return true;
}

// Send OTP to email
async function sendOtpEmail(email) {
  const otp = generateOTP();
  const expiresAt = Date.now() + EXP_MIN * 60 * 1000;
  otpStore[email] = { otp, expiresAt };

  await transporter.sendMail({
    from: `"MediTrack" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your MediTrack OTP",
    text: `Your OTP is ${otp}. It is valid for ${EXP_MIN} minutes.`
  });

  console.log(`[OTP SERVICE] OTP sent to email: ${email}`);
  return true;
}

// Verify OTP (works for phone or email)
function verifyOtp(identifier, otp) {
  const rec = otpStore[identifier];
  if (!rec) return false;
  if (rec.expiresAt < Date.now()) {
    delete otpStore[identifier];
    return false;
  }
  if (rec.otp !== otp) return false;
  delete otpStore[identifier];
  return true;
}

module.exports = { sendOtp, sendOtpEmail, verifyOtp };

