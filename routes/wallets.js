const express = require("express");
const router = express.Router();

const {
  getOneWallet,
  postWallet,
  deleteWallet,
  addCard,
  updateWallet,
  postExtraction,
  approveRequest,
  sendMoney,
  payToken
} = require("../controllers/walletsController");

//rutas con controlador:
router.get("/", getOneWallet);
router.post("/", postWallet);
router.delete("/", deleteWallet);
router.patch("/", updateWallet);
router.post("/postExtraction", postExtraction);
router.patch("/addCard", addCard);
router.patch("/approveRequest", approveRequest);
router.patch("/sendMoney", sendMoney);
router.post("/payToken", payToken);

module.exports = router;