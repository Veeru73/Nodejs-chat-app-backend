const router = require("express").Router();
const messageController = require("../controllers/message_controller");
const authJsonWebToken = require("../middlewares/auth_middleware");

router.post("/sendMessage", authJsonWebToken, messageController.sendMessage);
router.get("/getAllMessage", authJsonWebToken, messageController.getAllMessage);

module.exports = router;
