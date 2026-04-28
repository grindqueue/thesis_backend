const mongoose = require("mongoose");

const childSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parent",
        required: true,
    },
    deviceId: {
        type: String,
        required: true,
    },
    nationality : {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
});
module.exports = mongoose.model("Child", childSchema);