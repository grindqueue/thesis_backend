const mongoose = require('mongoose');
require('dotenv').config();
const connectToDatabase = async () => {
    try {
        mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log("MongoDB connected"))
        .catch((err) => console.log("DB Error:", err));
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};
module.exports = connectToDatabase;