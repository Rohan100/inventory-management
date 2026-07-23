// In-memory OTP storage with expiration
// Key: reorderId -> { code: '123456', expiresAt: timestamp }
const otpStore = new Map();

/**
 * Generate a 6-digit numeric OTP for a reorder approval
 */
function generateOTP(reorderId) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // Expires in 5 minutes

  otpStore.set(String(reorderId), {
    code,
    expiresAt
  });

  console.log(`🔐 Generated OTP [${code}] for Reorder #${reorderId} (Expires in 5m)`);

  return {
    code,
    expiresAt: new Date(expiresAt).toISOString()
  };
}

/**
 * Verify OTP for a given reorder ID
 */
function verifyOTP(reorderId, inputCode) {
  const record = otpStore.get(String(reorderId));

  if (!record) {
    return { valid: false, reason: 'No active OTP found for this reorder request. Please request a new OTP.' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(String(reorderId));
    return { valid: false, reason: 'OTP code has expired. Please request a new OTP.' };
  }

  if (record.code !== String(inputCode).trim()) {
    return { valid: false, reason: 'Invalid OTP code. Please check and try again.' };
  }

  // OTP verified successfully, invalidate code
  otpStore.delete(String(reorderId));
  return { valid: true };
}

module.exports = {
  generateOTP,
  verifyOTP
};
