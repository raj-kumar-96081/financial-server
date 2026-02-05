const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    googleId: { type: String, required: false },
    resetOtp: { type: String },
    resetOtpExpiry: { type: Date },
    resetPasswordLastRequestedAt: { type: Date },
    role: { type: String, required: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }
});

module.exports = mongoose.model('User', userSchema);