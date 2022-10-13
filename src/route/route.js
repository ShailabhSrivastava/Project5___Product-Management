const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const productController = require("../controllers/productController");
const { authentication, isUserAuthorised } = require("../middleware/auth");


//==============================================USER APIS=================================================
router.post("/register", userController.createUser);
router.post("/login", userController.userLogin);
router.get("/user/:userId/profile", authentication,userController.getProfile);
router.put("/user/:userId/profile", authentication,isUserAuthorised, userController.updateUser);

//=============================================PRODUCT APIS================================================
router.post("/products",productController. createProducts )
router.get("/products",productController.getProducts)
router.get("/products/:productId", productController.getByID)
router.put("/products/:productId",productController.updateProducts);
router.delete("/products/:productId",productController.deleteProductById)


//===============================================



module.exports = router;
