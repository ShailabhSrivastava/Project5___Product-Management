const cartModel = require("../models/cartModel")
const {isValidObjectId} = require("../validators/validation")

const createCart = async function(req,res){
    try{
        let userId = req.params.userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Not a valid userId" })
        let productId = req.body.productId
        let cartId = req.body.cartId
        const cartAvailable = await cartModel.find({_id: cartId})
        if(cartAvailable){

        }
        let data = req.body
        let CART = await cartModel.create(data)
        return res.status(201).send({status: true, message: "Success", data: CART})
    } catch (err){
        return res.status(500).send({ status: false, message: err.message })
    }
}


const getCart = async function(req,res){
    try{
        let userId = req.params.userId
        // if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Not a valid userId" })
        const checkData = await cartModel.findOne({userId})
        if (!checkData) return res.status(400).send({status: false, message: "Cart not found of this USER"})
        if (checkData.items.length == 0) return res.status(404).send({ status: false, message: 'Cart empty', data: checkData })
        return res.status(200).send({status: true, message: "Success", data: checkData})
    } catch (err){
        return res.status(500).send({ status: false, message: err.message })
    }
}

const deleteCart = async function(req,res){
    try{
        let userId = req.params.userId
        const checkData = await cartModel.findOne({userId})
        if (!checkData) return res.status(400).send({status: false, message: "Cart not found of this USER"})
        if (checkData.items.length == 0) return res.status(404).send({ status: false, message: "Item already Deleted"})
        const deleteCart = await cartModel.findOneAndUpdate(
            {_id: checkData._id},
            {items: [], totalPrice: 0, totalItems: 0},
            {new: true}
        )
        return res.status(204).send({ status: true, message: 'successfully deleted', data: deleteCart })
    } catch (err){
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = {createCart,getCart,deleteCart}