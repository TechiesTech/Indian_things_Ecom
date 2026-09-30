const { sendOtpEmail } = require('../config/NodeMailer');
const createRepository = require('../repositories/genericRepository');

/**
 * Common: Forgot Password Service
 * Sends OTP if user exists and passes the 'canReset' check.
 */
const commonForgotPasswordService = async (Model, email, canResetCheck) => {
  const repo = createRepository(Model);
  const user = await repo.findByEmail(email);

  if (!user) {
    throw { status: 404, message: 'Account not found with this email.' };
  }

  if (canResetCheck && !canResetCheck(user)) {
    throw { status: 403, message: 'Account is not eligible for password reset at this time.' };
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

  await repo.updateByEmail(email, { otp, otpExpires });

  await sendOtpEmail(email, otp);
  return { message: 'Password reset OTP sent to your email. Valid for 5 minutes.' };
};

/**
 * Common: Verify OTP Service
 */
const commonVerifyOtpService = async (Model, email, otp) => {
  const repo = createRepository(Model);
  const user = await repo.findByEmail(email);

  if (!user) throw { status: 404, message: 'User not found.' };
  if (!user.otp || user.otp !== otp || user.otpExpires < Date.now()) {
    throw { status: 400, message: 'Invalid or expired OTP.' };
  }

  await repo.clearOtpByEmail(email);

  return { message: 'OTP verified successfully. You can now reset your password.' };
};

/**
 * Common: Reset Password Service
 */
const commonResetPasswordService = async (Model, email, password) => {
  const repo = createRepository(Model);
  const user = await repo.findByEmail(email);

  if (!user) throw { status: 404, message: 'User not found.' };

  // .save() (not findOneAndUpdate) so the model's password-hashing
  // pre('save') hook actually runs.
  user.password = password;
  await repo.save(user);

  return { message: 'Password reset successfully. You can now login.' };
};

module.exports = {
  commonForgotPasswordService,
  commonVerifyOtpService,
  commonResetPasswordService,
};