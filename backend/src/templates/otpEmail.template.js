/**
 * OTP Email Template
 * Returns the HTML body for the OTP verification email.
 * Kept separate from NodeMailer.js so new templates (welcome,
 * password-reset-confirmation, etc.) can be added the same way
 * without the mailer config file growing indefinitely.
 */
const otpEmailTemplate = (otp) => `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:#f4f5f7;font-family:'Segoe UI',Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:40px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
            <tr>
              <td style="background-color:#14213D;padding:32px 40px;text-align:center;">
                <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">
                  Indian <span style="color:#f65c49;">Things</span>
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 40px 24px 40px;text-align:center;">
                <h1 style="margin:0 0 12px 0;font-size:20px;color:#14213D;">Verify your identity</h1>
                <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
                  Use the code below to continue. This code is valid for the next 5 minutes.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 32px 40px;text-align:center;">
                <div style="display:inline-block;background-color:#f4f5f7;border-radius:12px;padding:18px 32px;">
                  <span style="font-size:32px;font-weight:700;letter-spacing:10px;color:#f65c49;">${otp}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 40px 40px;text-align:center;">
                <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
                  Didn't request this code? You can safely ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color:#f4f5f7;padding:20px 40px;text-align:center;">
                <p style="margin:0;font-size:11px;color:#9ca3af;">© ${new Date().getFullYear()} Indian Things. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

module.exports = otpEmailTemplate;