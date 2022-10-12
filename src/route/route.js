const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authentication, isUserAuthorised } = require("../middleware/auth");

router.post("/register", userController.createUser);
router.post("/login", userController.userLogin);
router.get("/user/:userId/profile", authentication,userController.getProfile);
router.put("/user/:userId/profile", authentication,isUserAuthorised, userController.updateUser);

module.exports = router;
