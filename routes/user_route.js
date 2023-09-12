const router = require("express").Router();
const userController = require("../controllers/user_controller");
const upload = require("../middlewares/upload_middleware");
const authJsonWebToken = require("../middlewares/auth_middleware");

router.post("/signUp", upload.single("profileImage"), userController.signUp);
router.post("/login", userController.logIn);
router.get("/getUsers", authJsonWebToken, userController.getUsers);
module.exports = router;
