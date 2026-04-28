const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
    age: {
        type: Number,
        required: true,
    },
    allowedApps: [{
        type: String,
        required: true,
    }],
    screenTimeLimit: {
        type: Number,
        required: true,
        default: 0,
    },
    childId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Child",
        required: true,
    },
    blockedDomains: [{
        type: String,
    }],
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parent",
        required: true,
    }
}, {
    timestamps: true,
});
module.exports = mongoose.model("Policy", policySchema);