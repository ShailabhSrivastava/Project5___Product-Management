const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const productController = require("../controllers/productController");
const cartController = require("../controllers/cartController")
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

//==================================

router.post("/users/:userId/cart",authentication,isUserAuthorised,cartController.createCart)
router.get("/users/:userId/cart", authentication,isUserAuthorised, cartController.getCart)
router.put("/users/:userId/cart", authentication,isUserAuthorised,cartController.updateCart)
router.delete("/users/:userId/cart",authentication,isUserAuthorised, cartController.deleteCart)

//===============================================



module.exports = router;
