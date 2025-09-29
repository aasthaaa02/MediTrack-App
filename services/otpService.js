// mock OTP service for prototype. Replace with real SMS provider (Twilio/MSG91) later.
const otpStore = {}; // { phone: { otp, expiresAt } }
const EXP_MIN = parseInt(process.env.OTP_EXPIRY_MIN || '5', 10);

function generateOTP(){
  return Math.floor(100000 + Math.random()*900000).toString(); // 6-digit string
}

function sendOtp(phone){
  const otp = generateOTP();
  const expiresAt = Date.now() + EXP_MIN*60*1000;
  otpStore[phone] = { otp, expiresAt };
  console.log(`[OTP SERVICE] OTP for ${phone}: ${otp} (valid ${EXP_MIN} min)`);
  return true;
}

function verifyOtp(phone, otp){
  const rec = otpStore[phone];
  if(!rec) return false;
  if(rec.expiresAt < Date.now()) { delete otpStore[phone]; return false; }
  if(rec.otp !== otp) return false;
  delete otpStore[phone];
  return true;
}

module.exports = { sendOtp, verifyOtp };
