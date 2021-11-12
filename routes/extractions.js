const express = require("express");
const router = express.Router();

const {
  postExtraction,
} = require("../controllers/extractionController");

//rutas con controlador:
router.post("/", postExtraction);

module.exports = router;