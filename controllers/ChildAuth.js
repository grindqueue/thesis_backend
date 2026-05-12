const fs = require('fs').promises;
const axios = require('axios');
const mongoose = require('mongoose');
const Child = require('../database/childModel');
const Parent = require('../database/parentModel');

const childSignUp = async (req, res) => {
    let filePath = null;

    try {
        const { name, age, parentId, deviceId } = req.body;

        // =========================
        // Validate required fields
        // =========================
        if (!name || !age || !parentId || !deviceId) {
            return res.status(400).json({
                success: false,
                message: 'Name, age, parentId and deviceId are required'
            });
        }

        // =========================
        // Validate parent ID format
        // =========================
        if (!mongoose.Types.ObjectId.isValid(parentId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid parentId format'
            });
        }

        // =========================
        // Verify parent exists
        // =========================
        const parentExists = await Parent.findById(parentId);

        if (!parentExists) {
            return res.status(404).json({
                success: false,
                message: 'Parent account not found'
            });
        }

        // =========================
        // Validate uploaded file
        // =========================
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'ID document is required'
            });
        }

        filePath = req.file.path;

        // =========================
        // Prevent duplicate devices
        // =========================
        const existingChild = await Child.findOne({ deviceId });

        if (existingChild) {
            return res.status(409).json({
                success: false,
                message: 'A child account already exists for this device'
            });
        }

        // =========================
        // Read file safely
        // =========================
        const fileData = await fs.readFile(filePath, {
            encoding: 'base64'
        });

        // =========================
        // Send document to ID Analyzer
        // =========================
        const response = await axios.post(
            'https://api.idanalyzer.com/scan',
            {
                api_key: process.env.ID_ANALYSER_KEY,
                file_base64: fileData,
                return_confidence: true
            },
            {
                timeout: 30000
            }
        );

        // =========================
        // Cleanup uploaded file
        // =========================
        await fs.unlink(filePath);
        filePath = null;

        const data = response.data;

        // =========================
        // Validate ID verification response
        // =========================
        if (!data || data.document_validity !== true) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID document'
            });
        }

        // Optional confidence check
        if (data.confidence && data.confidence < 0.7) {
            return res.status(400).json({
                success: false,
                message: 'Low confidence document scan'
            });
        }

        // =========================
        // Create child account
        // =========================
        const newChild = new Child({
            name,
            age,
            parentId,
            deviceId,
            verified: true,
            nationality: data.country || 'Unknown'
        });

        await newChild.save();

        return res.status(201).json({
            success: true,
            message: 'Child account created successfully',
            child: newChild
        });

    } catch (err) {
        console.error('Child signup error:', err.response?.data || err.message);

        // Cleanup file if an error occurs
        try {
            if (filePath) {
                await fs.unlink(filePath);
            }
        } catch (cleanupError) {
            console.error('File cleanup error:', cleanupError.message);
        }

        return res.status(500).json({
            success: false,
            message: 'Error creating child account',
            error:
                process.env.NODE_ENV === 'development'
                    ? err.message
                    : undefined
        });
    }
};
const getChildren = async(req, res) => {
    try{
        const { parentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(parentId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid parentId format'
            });
        }
        const parent = await Parent.findById(parentId);

        if (!parent) {
            return res.status(404).json({
                success: false,
                message: 'Parent account not found'
            });
        }
        const children = await Child.find({ parentId });

        return res.status(200).json({
            success: true,
            children
        });
    } catch (error) {
        console.error('Get children error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Error retrieving children'
        });
    }
}
const getChild = async (req, res) => {
    try{
        const { childId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(childId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid childId format'
            });
        }
        const child = await Child.findById(childId);

        if (!child) {
            return res.status(404).json({
                success: false,
                message: 'Child account not found'
            });
        }
        return res.status(200).json({ success: true, childDetails: child });
    }catch{
        return res.status(500).json({
            success: false,
            message: 'Error retrieving child details'
        });
    }
}
module.exports = {
    childSignUp,
    getChildren,
    getChild
};
