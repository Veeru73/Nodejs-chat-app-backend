const router = require("express").Router();
const authJsonWebToken = require("../middlewares/auth_middleware");
const chatController = require("../controllers/chat_controller");

router.post("/accessChat", authJsonWebToken, chatController.accessChat);

router.get("/fetchChats", authJsonWebToken, chatController.fetchChats);

router.post(
  "/createGroupChat",
  authJsonWebToken,
  chatController.createGroupChat
);

router.put("/renameGroup", authJsonWebToken, chatController.renameGroup);

router.put("/addToGroup", authJsonWebToken, chatController.addToGroup);

router.put(
  "/removeFromGroup",
  authJsonWebToken,
  chatController.removeFromGroup
);

module.exports = router;
