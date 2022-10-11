// const jwt = require("jsonwebtoken");
// const mongoose = require('mongoose')

// const authentication = async function (req, res, next) {
//     try {
//         let token = req.authorization
//         if (!token) return res.status(401).send({status: false , msg: "token must be present"})
//         let decodeToken = jwt.verify(token, "GroupNumber39")
//         if (!decodeToken) return res.status(500).send({ msg: "token is inValid", status: false })
//         req.decodeToken=decodeToken
//         next()
//     } catch (err) {
//         res.status(500).send({ msg: "ERROR", error: err.message })
//     }
// }

// module.exports = { authentication }