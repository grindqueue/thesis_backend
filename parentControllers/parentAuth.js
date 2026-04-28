const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Parent = require("../models/parentModel");
const { generateOTP, sendEmail } = require("../utils/email"); // your file
require("dotenv").config();

const parentSignup = async (req, res) => {
    let session;

    try {
        session = await mongoose.startSession();
        session.startTransaction();

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "All fields are required" });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,50}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: "Password must include uppercase, lowercase, number, and special character"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const existingParent = await Parent.findOne({ email });
        if (existingParent) {
            await session.abortTransaction();
            session.endSession();
            return res.status(409).json({ message: "Parent already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const otp = generateOTP();
        const otpExpires = Date.now() + 10 * 60 * 1000;

        const newParent = new Parent({
            name,
            email,
            password: hashedPassword,
            otp,
            otpExpiration: otpExpires
        });

        await newParent.save({ session });

        await session.commitTransaction();
        session.endSession();

        await sendEmail(
            email,
            "Verify your account",
            `Your OTP is ${otp}`,
            `<h3>Your OTP is: ${otp}</h3>`
        );
        const token = jwt.sign(
            { parentId: newParent._id, email: newParent.email },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(201).json({
            message: "Parent created. Check email for OTP",
            parentId: newParent._id,
            email: newParent.email,
            token, // optional
            isVerified: newParent.isVerified
        });

    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }

        console.error("Signup error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const parentSignIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password required"
            });
        }

        const parent = await Parent.findOne({ email });

        if (!parent) {
            return res.status(404).json({
                message: "Parent not found"
            });
        }

        // ❗ IMPORTANT: ensure account is verified
        if (!parent.isVerified) {
            return res.status(403).json({
                message: "Please verify your account first"
            });
        }

        const isMatch = await bcrypt.compare(password, parent.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        // ✅ Generate OTP for login
        const otp = generateOTP();
        const otpExpires = Date.now() + 10 * 60 * 1000;

        parent.otp = otp;
        parent.otpExpiration = otpExpires;

        await parent.save();

        // ✅ Send OTP
        await sendEmail(
            email,
            "Login OTP",
            `Your OTP is ${otp}`,
            `<h3>Your login OTP is: ${otp}</h3>`
        );

        return res.status(200).json({
            message: "OTP sent to your email"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


module.exports = {
    parentSignup,
    parentSignIn
};