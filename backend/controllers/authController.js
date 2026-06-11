const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const JWT_SECRET = process.env.JWT_SECRET || 'kishan_sathi_secret_2025_change_in_prod';
const JWT_EXPIRES = '30d';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const signToken = (user) =>
  jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

const register = async (req, res) => {
  const { name, email, password, phone, district } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ success: false, error: 'Name, email and password are required.' });
  if (password.length < 6)
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });

  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(409).json({ success: false, error: 'Email already registered. Please login.' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email,
      password: hashed,
      phone: phone || null,
      district: district || null,
    });

    const token = signToken(user);
    const payload = { id: user._id, name: user.name, email: user.email, phone: user.phone, district: user.district, role: user.role };

    return res.status(201).json({ success: true, token, user: payload });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ success: false, error: 'Email and password are required.' });

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(401).json({ success: false, error: 'No account found with this email.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ success: false, error: 'Incorrect password.' });

    const token = signToken(user);
    const payload = { id: user._id, name: user.name, email: user.email, phone: user.phone, district: user.district, role: user.role };

    return res.json({ success: true, token, user: payload });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email)
    return res.status(400).json({ success: false, error: 'Please provide your email address.' });

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user)
      return res.status(404).json({ success: false, error: 'No account found with this email address.' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetURL = `${CLIENT_URL}/reset-password.html?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family:'Segoe UI',Arial,sans-serif;background:#f3f4f6;margin:0;padding:0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
                <tr>
                  <td style="background:linear-gradient(135deg,#0a3d1f,#1a6b3a);padding:36px 40px;text-align:center;">
                    <div style="font-size:3rem;margin-bottom:8px;">🚜</div>
                    <h1 style="color:#fff;margin:0;font-size:1.6rem;font-weight:700;">Kishan Sathi</h1>
                    <p style="color:#a7f3d0;margin:6px 0 0;font-size:.95rem;">किसान साथी — Smart Farming Companion</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px;">
                    <h2 style="color:#1a6b3a;margin:0 0 12px;font-size:1.3rem;">Password Reset Request</h2>
                    <p style="color:#374151;line-height:1.7;margin:0 0 16px;">
                      Hello <strong>${user.name}</strong>,<br><br>
                      We received a request to reset your Kishan Sathi account password. Click the button below to set a new password.
                    </p>
                    <div style="text-align:center;margin:28px 0;">
                      <a href="${resetURL}" style="background:linear-gradient(135deg,#1a6b3a,#2d9d5c);color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-weight:700;font-size:1rem;display:inline-block;">
                        🔑 Reset My Password
                      </a>
                    </div>
                    <p style="color:#6b7280;font-size:.85rem;line-height:1.6;margin:0 0 8px;">
                      ⏰ This link expires in <strong>15 minutes</strong>.<br>
                      If you did not request this, please ignore this email — your account remains secure.
                    </p>
                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
                    <p style="color:#9ca3af;font-size:.78rem;margin:0;">
                      Or copy this link into your browser:<br>
                      <span style="color:#1a6b3a;word-break:break-all;">${resetURL}</span>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f9fafb;padding:20px 40px;text-align:center;">
                    <p style="color:#9ca3af;font-size:.78rem;margin:0;">
                      © 2025 Kishan Sathi · Empowering Indian Farmers<br>
                      Kisan Call Centre: 1800-180-1551 (Free, 24×7)
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: '🔑 Reset Your Kishan Sathi Password',
      html,
    });

    return res.json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (err) {
    console.error('Email send error:', err.message, err.code);
    const user = await User.findOne({ email: email?.toLowerCase() }).catch(() => null);
    if (user) {
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save().catch(() => {});
    }
    return res.status(500).json({ success: false, error: 'Failed to send reset email. Please try again. Error: ' + err.message });
  }
};

const resetPassword = async (req, res) => {
  const { token, email, password } = req.body;

  if (!token || !email || !password)
    return res.status(400).json({ success: false, error: 'Token, email and new password are required.' });
  if (password.length < 6)
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ success: false, error: 'Reset link is invalid or has expired. Please request a new one.' });

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({ success: true, message: 'Password reset successfully. You can now login.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { register, login, forgotPassword, resetPassword };
