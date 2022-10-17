const cartModel = require("../models/cartModel")

const createCart = async function(req,res){
    try{
        const userId = req.params.userId
        // if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Not a valid userId" })
        let data = req.body
        let CART = await cartModel.create(data)
        return res.status(201).send({status: true, message: "Success", data: CART})
    } catch (err){
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = {createCart}