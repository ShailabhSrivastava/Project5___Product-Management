const orderModel = require("../models/orderModel");
const cartModel = require("../models/cartModel");
const {
  isValidRequestBody,
  isValidObjectId,
} = require("../validators/validation");

const createOrder = async function (req, res) {
  try {
    let userId = req.params.userId;
    if (!isValidRequestBody(userId))
      return res
        .status(400)
        .send({ status: false, message: "User ID is missing" });

    let data = req.body;
    if (!isValidRequestBody(data))
      return res
        .status(400)
        .send({ status: false, message: "Data is missing" });

    let { cartId, status, cancellable } = data;

    if (!cartId)
      return res
        .status(400)
        .send({ status: false, message: "Cart ID is required" });
    if (!isValidObjectId(cartId))
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid cart Id" });

    let findCart = await cartModel.findOne({ _id: cartId });
    if (!findCart)
      return res
        .status(404)
        .send({ status: false, message: "No cart exist for this user" });
    if (findCart.items.length === 0)
      return res
        .status(400)
        .send({ status: false, message: "No Item in Cart" });
    
    if (userId != findCart.userId.toString())
      return res.status(400).send({
        status: false,
        message: "cartId is not correct for the given user",
      });

    if (status || typeof status == "string") {
      if (
        status != "pending" &&
        status != "completed" &&
        status != "canceled"
      ) {
        return res.status(400).send({
          status: false,
          message: "status can contain only pending, completed or canceled",
        });
      }
    }

    if (cancellable || typeof cancellable == "string") {
      cancellable = cancellable.toLowerCase().trim();
    }

    let totalQuantity = 0;
    for (let i = 0; i < findCart.items.length; i++) {
      totalQuantity += findCart.items[i].quantity;
    }

    data.userId = userId;
    data.items = findCart.items;
    data.totalPrice = findCart.totalPrice;
    data.totalItems = findCart.totalItems;
    data.totalQuantity = totalQuantity;

    let order = await orderModel.create(data);

    const deleteCart = await cartModel.findOneAndUpdate({ _id: cartId },
      { items: [], totalPrice: 0, totalItems: 0 }
    )

    return res
      .status(201)
      .send({ status: true, message: "Success", data: order });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { createOrder };
