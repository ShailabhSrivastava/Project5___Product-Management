const cartModel = require("../models/cartModel");
const productModel = require("../controllers/productController");
const { isValidObjectId } = require("../validators/validation");

const createCart = async function (req, res) {
  try {
    let userId = req.params.userId;
    let data = req.body;
    let { quantity, productId } = data;
    let cartId = req.body.cartId;

    if (!isValidObjectId(userId))
      return res
        .status(400)
        .send({ status: false, message: "Not a valid userId" });

    let cartAvaiable = await findOne({ userId: userId });

    if (!cartAvaiable) {
      let cart = [{ productId: productId, quantity: 1 }];
    }

    let product = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });

    if (!product)
      return res
        .status(404)
        .send({ status: false, message: "Product not found" });

    let pPrice = product.price;

    let finalCart = {
      userId: userId,
      items: cart,
      totalPrice: pPrice * quantity,
      totalItems: items.length,
    };

    let createCart = await cartModel.create(finalCart);
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

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
