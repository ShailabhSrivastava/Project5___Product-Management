const cartModel = require("../models/cartModel");
const productModel = require("../controllers/productController");
const {
  isValidObjectId,
  isValidRequestBody,
} = require("../validators/validation");

//============================CREATE CART===================================

const createCart = async function (req, res) {
  try {
    let userId = req.params.userId;
    let data = req.body;
    let { quantity, productId } = data;
    let cartId = req.body.cartId;

    if (!isValidRequestBody(data))
      return res
        .status(400)
        .send({ status: false, message: "Please provide data" });

    if (!isValidObjectId)
      return res
        .status(400)
        .send({ status: false, message: "Not a valid productId" });

    console.log(productId);
    console.log(userId);

    let product = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });

    if (!product)
      return res
        .status(404)
        .send({ status: false, message: "Product not found" });

    let cartAvaiable = await cartModel.findOne({ userId: userId });
    if (cartAvaiable) {
      if (!quantity) data["quantity"] = 1;
      let items = cartAvaiable.items;

      for (let i = 0; i < items.length; i++) {
        if (productId == items[i].productId) {
          items[i].quantity += quantity;
          break;
        }
      }
      let cart = { productId: productId, quantity: quantity };
      items.push(cart);

      let updateData = {
        userId: userId,
        items: items,
        totalPrice: (cartAvaiable.totalPrice += product.price * quantity),
        totalItems: items.length,
      };

      return res
        .status(200)
        .send({ status: false, message: "Created", data: updateData });
    }

    if (!cartAvaiable) {
      let pPrice = product.price;
      if(!quantity) data['quantity'] = 1

      let cart = { productId: productId, quantity: quantity };
      var finalCart = {
        userId: userId,
        items: cart,
        totalPrice: pPrice * quantity,
        totalItems: items.length,
      };
    }
    let createCart = await cartModel.create(finalCart);
    return res.status(201).send({
      status: false,
      message: "cart successfully created",
      data: createCart,
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//============================GET CART==============================================

const getCart = async function (req, res) {
  try {
    let userId = req.params.userId;
    const checkData = await cartModel.findOne({ userId });
    if (!checkData)
      return res
        .status(400)
        .send({ status: false, message: "Cart not found of this USER" });
    if (checkData.items.length == 0)
      return res
        .status(404)
        .send({ status: false, message: "Cart empty", data: checkData });
    return res
      .status(200)
      .send({ status: true, message: "Success", data: checkData });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const deleteCart = async function (req, res) {
  try {
    let userId = req.params.userId;
    const checkData = await cartModel.findOne({ userId });
    if (!checkData)
      return res
        .status(400)
        .send({ status: false, message: "Cart not found of this USER" });
    if (checkData.items.length == 0)
      return res
        .status(404)
        .send({ status: false, message: "Item already Deleted" });
    const deleteCart = await cartModel.findOneAndUpdate(
      { _id: checkData._id },
      { items: [], totalPrice: 0, totalItems: 0 },
      { new: true }
    );
    return res.status(204).send({
      status: true,
      message: "successfully deleted",
      data: deleteCart,
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { createCart, getCart, deleteCart };
