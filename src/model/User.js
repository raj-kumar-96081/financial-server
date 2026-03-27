const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    subscriptionId: { type: String },
    planId: { type: String },
    status: { type: String },
    start: { type: Date },
    end: { type: Date },
    lastBillDate: { type: Date },
    nextBillDate: { type: Date },
    paymentsMode: { type: Number },
    paymentRemaining: { type: Number } //Number of payment remaining in the subscription

})

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: function() {
        return !this.googleId;
    }},
    googleId: { type: String, required: false },
    resetOtp: { type: String },
    resetOtpExpiry: { type: Date },
    resetPasswordLastRequestedAt: { type: Date },
    role: { type: String, required: true, default: 'admin' },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    // Default to 1 to give free trail of creating 1 group
    credits: { type: Number, default: 1 },
    subscription: { type: subscriptionSchema, required: false }
});

module.exports = mongoose.model('User', userSchema);