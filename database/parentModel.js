const mongoose = require("mongoose");

const parentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },  
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },

    otp: {
        type: String,
    },
    otpExpiration: {
        type: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    childIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Child",
    }],
}, {
    timestamps: true,
});

module.exports = mongoose.model("Parent", parentSchema);