const express = require("express");

const { childSignUp } = require("../controllers/ChildAuth");
const  {upload, verifyParentToken } = require('../middlewares/verifyOTP');

const childRouter = express.Router();

const upload = multer({ dest: "uploads/" });
childRouter.post(
    '/signup', 
    verifyParentToken,
    upload.single('idDocument'),
    childSignUp
);

module.exports = childRouter;