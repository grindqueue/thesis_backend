const express = require("express");
const multer = require("multer");
const { childSignUp } = require("../controllers/childController");

const childRouter = express.Router();

const upload = multer({ dest: "uploads/" });

childRouter.post("/child/signup", upload.single("id_image"), childSignUp);

module.exports = childRouter;