const bcrypt = require("bcrypt")
const userModel = require("../models/userModel")
const { uploadFile } = require("../aws/aws")
const { isValidEmail, isValidPassword, isValidName, isValidPhone, isValidPincode, isValidstreet } = require("../validators/validation")

const createUser = async function (req, res) {
    try {
        let data = req.body
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "please give some data" })

        const { fname, lname, email, profileImage, phone, password, address } = data //Destructuring

        if (!fname) return res.status(400).send({ status: false, message: "fname is mandatory" });
        if (!isValidName(fname)) return res.status(400).send({ status: false, message: "fname is invalid" })

        if (!lname) return res.status(400).send({ status: false, message: "lname is mandatory" });
        if (!isValidName(lname)) return res.status(400).send({ status: false, message: "lname is invalid" })

        if (!email) return res.status(400).send({ status: false, message: "email is mandatory" });
        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "email is invalid" })
        let emailExist = await userModel.findOne({email})
        if (emailExist) return res.status(400).send({ status: false, message: "user with this email already exists" })

        //if (!profileImage) return res.status(400).send({ status: false, message: "profileImage is mandatory" });

        if (!phone) return res.status(400).send({ status: false, message: "phone is mandatory" });
        if (!isValidPhone(phone)) return res.status(400).send({ status: false, message: "phone is invalid" })
        let phoneExist = await userModel.findOne({phone})
        if (phoneExist) return res.status(400).send({ status: false, message: "user with this phone number already exists" })

        if (!password) return res.status(400).send({ status: false, message: "password is mandatory" });
        if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "password is invalid" })

        if(address){
        if (!address.shipping.street) return res.status(400).send({ status: false, message: "In shipping, street is mandatory" });
        if (!isValidstreet(address.shipping.street)) return res.status(400).send({ status: false, message: "In shipping, street is invalid" });

        if (!address.shipping.city) return res.status(400).send({ status: false, message: "In shipping, city is mandatory" });
        if (!isValidstreet(address.shipping.city)) return res.status(400).send({ status: false, message: "In shipping, city is invalid" });

        if (!address.shipping.pincode) return res.status(400).send({ status: false, message: "In shipping, pincode is mandatory" });
        if (!isValidPincode(address.shipping.pincode)) return res.status(400).send({ status: false, message: "In shipping, pincode is invalid" })

        if (!address.billing.street) return res.status(400).send({ status: false, message: "In billing, street is mandatory" });
        if (!isValidstreet(address.billing.street)) return res.status(400).send({ status: false, message: "In billing, street is invalid" });

        if (!address.billing.city) return res.status(400).send({ status: false, message: "In billing, city is mandatory" });
        if (!isValidstreet(address.billing.city)) return res.status(400).send({ status: false, message: "In billing, city is invalid" });

        if (!address.billing.pincode) return res.status(400).send({ status: false, message: "In billing, pincode is mandatory" });
        if (!isValidPincode(address.billing.pincode)) return res.status(400).send({ status: false, message: "In billing, pincode is invalid" })}

        //Uploading image to S3 bucket
        let file = req.files
        if (file && file.length > 0) {
            let uploadImage = await uploadFile(file[0]);
            data.profileImage = uploadImage
        }
        else {
            res.status(400).send({ msg: "No file found" });
        }

        //Saving password in encrypted format
        let salt = await bcrypt.genSalt(10)
        data.password = await bcrypt.hash(data.password, salt);
        const user = await userModel.create(data)
        return res.status(201).send({ status: true, message: "user is successfully created", data: user })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createUser }