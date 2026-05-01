const express = require('express');
const parentRouter = express.Router();

const {parentSignIn, parentSignup} = require('../controllers/parentAuth');
const {verifyOTP, verifyParentToken} = require("../middlewares/verifyOTP");

parentRouter.post('/parent/signup', parentSignup);
parentRouter.post('/parent/signin', parentSignIn);
parentRouter.post('/parent/verify-otp', verifyOTP);
parentRouter.get('/parent/verify-token', verifyParentToken);

module.exports = parentRouter;