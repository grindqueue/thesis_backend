const child = require('./database/childModel');
const fs = require('fs');
const axios = require("axios");
require('dotenv').config();

const childSignUp = async (req, res) => {
    try {
        const { name, age, parentId, deviceId } = req.body;
        if (!name || !age || !parentId || !deviceId) {
            return res.status(400).json({
                message: "Name, age, parentId and deviceId are required"
            });
        }
        if (parentId)

        if (!req.file) {
            return res.status(400).json({
                message: "ID document is required"
            });
        }

        const filePath = req.file.path;

        const fileData = fs.readFileSync(filePath, { encoding: 'base64' });

        const response = await axios.post(
            "https://api.idanalyzer.com/scan",
            {
                api_key: process.env.ID_ANALYSER_KEY,
                file_base64: fileData,
                return_confidence: true
            }
        );

        fs.unlinkSync(filePath);

        const data = response.data;

        if (!data || data.document_validity !== true) {
            return res.status(400).json({
                message: "Invalid ID document"
            });
        }
        const newChild = new child({
            name,
            age,
            parentId,
            deviceId,
            verified: true,
            nationality: data.country
        });

        await newChild.save();

        res.status(201).json({
            message: "Child account created successfully",
            child: newChild
        });

    } catch (err) {
        console.error(err.response?.data || err.message);

        // delete file if error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            message: "Error creating child account",
            error: err.message
        });
    }
};

module.exports = {
    childSignUp
};