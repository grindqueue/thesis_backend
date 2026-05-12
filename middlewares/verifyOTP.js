const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require('multer');
const path = require('path');
const Parent = require("../database/parentModel");
require("dotenv").config();

const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP required"
            });
        }

        const parent = await Parent.findOne({ email });

        if (!parent) {
            return res.status(404).json({
                message: "Parent not found"
            });
        }

        // check OTP
        if (parent.otp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        // check expiry
        if (!parent.otpExpiration || parent.otpExpiration < Date.now()) {
            return res.status(400).json({
                message: "OTP expired"
            });
        }

        // mark verified (optional but useful for signup tracking)
        if (parent.isVerified === false) {
            parent.isVerified = true;
            await parent.save();
        }

        // clear OTP after use
        parent.otp = undefined;
        parent.otpExpiration = undefined;

        await parent.save();

        // 🔐 ISSUE TOKEN (LOGIN SUCCESS)
        const token = jwt.sign(
            {
                parentId: parent._id,
                email: parent.email
            },
            process.env.JWT_SECRET,
            { expiresIn: "10m" }
        );

        return res.status(200).json({
            message: "Success",
            token,
            parent: {
                id: parent._id,
                email: parent.email,
                isVerified: parent.isVerified
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};
const verifyParentToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.parent = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },

    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'application/pdf'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error('Only JPG, PNG and PDF files are allowed'),
            false
        );
    }
};
const upload = multer({
    storage,
    fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024
    }
});
module.exports = {
    verifyOTP,
    verifyParentToken, 
    upload
};