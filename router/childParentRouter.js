const express = require('express');
const childParentRouter = express.Router();
const {getChildren, getChild} = require('../controllers/childAuth');
const {verifyParentToken} = require("../middlewares/verifyOTP");

childParentRouter.get('/children/:parentId', verifyParentToken, getChildren);
childParentRouter.get('/child/:childId', verifyParentToken, getChild);

module.exports = {
    childParentRouter
};