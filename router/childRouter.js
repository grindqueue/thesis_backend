const express = require("express");

const { childSignUp } = require("../controllers/ChildAuth");
const  {upload } = require('../middlewares/upload')

const childRouter = express.Router();

const upload = multer({ dest: "uploads/" });
childRouter.post(
    '/signup',
    upload.single('idDocument'),
    childSignUp
);

module.exports = childRouter;