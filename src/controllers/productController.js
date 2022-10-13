const productModel = require("../models/productModel"); //requiring model
//requiring packages
const { uploadFile } = require("../aws/aws");
//improting validation file and destrucing all the validation as per the project requirement
const {
  isValidRequestBody,
  isValid,
  isValidObjectId,
  isValidImg,
  isValidName,
} = require("../validators/validation");
const mongoose = require("mongoose")

const createProducts = async (req, res) => {
  try {
    let data = req.body;
    let file = req.files;

    let {
      title,
      description,
      price,
      currencyId,
      currencyFormat,
      isFreeShipping,
      availableSizes,
      style,
      installments,
    } = data;

    //body empty or not
    if (!isValidRequestBody(data)) {
      return res.status(400).send({
        status: false,
        message: "Provide the Product's Data",
      });
    }

    //title validation
    if (!isValid(title)) {
      return res
        .status(400)
        .send({ status: false, message: "Provide the Title Name " });
    }

    let checkTitle = await productModel.findOne({ title: title });
    if (checkTitle) {
      return res.status(400).send({
        status: false,
        message: `Product with this ${title} is Already Present`,
      });
    }

    //description validation
    if (!isValid(description)) {
      return res.status(400).send({
        status: false,
        message: "Please Write Description About Product ",
      });
    }

    //price validation
    if (!isValid(price)) {
      return res
        .status(400)
        .send({ status: false, message: "Price is Required" });
    }
    if (price <= 0) {
      return res.status(400).send({
        status: false,
        message: "Price can't be Zero or less than Zero ",
      });
    }
    if (!/^[0-9]*$/.test(price)) {
      return res
        .status(400)
        .send({ status: false, message: "Price should be in Number" });
    }

    //currencyId validation
    // if (!isValid(currencyId)) {
    //   return res
    //     .status(400)
    //     .send({ status: false, message: "Provide the CurrencyId " });
    // }
    // if (currencyId != "INR") {
    //   return res
    //     .status(400)
    //     .send({ status: false, message: "CurrencyId should be in INR" });
    // }

    //currencyFormat validation
    // if (!currencyFormat) {
    //   return res
    //     .status(400)
    //     .send({ status: false, message: "Please Enter Currency Symbol" });
    // }
    // if (currencyFormat != "₹") {
    //   return res.status(400).send({
    //     status: false,
    //     message: "Currency Symbol should be only in '₹'",
    //   });
    // }

    //isFreeShipping validation
    if (isFreeShipping != null) {
      if (
        !(
          isFreeShipping.toLowerCase() === "true" ||
          isFreeShipping.toLowerCase() === "false"
        )
      ) {
        return res.status(400).send({
          status: false,
          message: "Please Provide only Boolean Value",
        });
      }
      data["isFreeShipping"] = isFreeShipping.toLowerCase();
    }

    //profile image validation
    if (file && file.length > 0) {
      if (!isValidImg(file[0].mimetype)) {
        return res.status(400).send({
          status: false,
          message: "Image Should be of JPEG/ JPG/ PNG",
        });
      }

      //store the profile image in aws and creating profile image url via "aws package"
      let url = await uploadFile(file[0]);
      data["productImage"] = url;
    } else {
      return res
        .status(400)
        .send({ status: false, message: "Please Provide ProductImage" });
    }

    //Size validation
    if (!availableSizes) {
      return res
        .status(400)
        .send({ status: false, message: "Please Enter Size of Product" });
    }

    // let uniqueSize = availableSizes.replace(/\s+/g, "").split(",").map(String);

    //unique uniqueSize - do this change
    let sizeArr = availableSizes.replace(/\s+/g, "").split(",").map(String);

    var uniqueSize = sizeArr.filter(function (item, i, ar) {
      return ar.indexOf(item) === i;
    });

    let arr = ["S", "XS", "M", "X", "L", "XXL", "XL"];

    for (let i = 0; i < uniqueSize.length; i++) {
      if (!arr.includes(uniqueSize[i]))
        return res.status(400).send({
          status: false,
          data: "Enter a Valid Size, Like 'XS or S or M or X or L or XL or XXL'",
        });
    }
    data["availableSizes"] = uniqueSize;

    //installments validation
    if (installments) {
      if (!/^[0-9]*$/.test(installments)) {
        return res.status(400).send({
          status: false,
          message: "Installments value Should be only number",
        });
      }
      if (installments < 0) {
        return res.status(400).send({
          status: false,
          message: "installments Shoud be In Valid  Number only",
        });
      }
    }

    //style validation
    if (style != null) {
      if (!isValid(style)) {
        return res
          .status(400)
          .send({ status: false, message: "Provide the style " });
      }
    }

    //after checking all the validation, than creating the product data
    const createdProduct = await productModel.create(data);
    return res.status(201).send({
      status: true,
      message: "Product is Created Successfully",
      data: createdProduct,
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
//====================================get product============================================
const getProducts = async function (req, res) {
  try {
    let data = req.query
    let { size, name, priceLessThan } = data//Destructuring

    // if (!data) return res.status(400).send({ status: false, message: "please give some data to get products list" })

    let ndata = {}

    if (size) {

     let sizeArr = size.replace(/\s+/g, "").split(",").map(String);

    var uniqueSize = sizeArr.filter(function (item, i, ar) {
      return ar.indexOf(item) === i;
    });

    let arr = ["S", "XS", "M", "X", "L", "XXL", "XL"];

    for (let i = 0; i < uniqueSize.length; i++) {
      if (!arr.includes(uniqueSize[i]))
        return res.status(400).send({
          status: false,
          data: "Enter a Valid Size, Like 'XS or S or M or X or L or XL or XXL'",
        });
    }
      ndata.availableSizes = size
    }
    if (name) {
      ndata.title = { $regex: name, $options: 'i' }
    }

    if (priceLessThan) {
      ndata.price = { $lt: Number(priceLessThan) }
    }

    let productDetail = await productModel.find({ isDeleted: false, ...ndata }).sort({ price: 1 })
    if (productDetail.length == 0) return res.status(404).send({ status: false, message: "No product found" })

    return res.status(200).send({ status: true, data: productDetail })

  } catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }
}

//=====================================GET PRODUCT========================================

const getByID = async function(req,res){
  try{
    const productID = req.params.productId
    if (!mongoose.isValidObjectId(productID)) return res.status(400).send({status:false, message: "Please enter valid PRODUCT Id in params"})
    const checkData = await productModel.findOne({_id: productID, isDeleted: false})
    if (!checkData) return res.status(400).send({status:false, message: "Product not found"})
    return res.status(200).send({status:true, message:"success",data: checkData})
  } catch (err){
    return res.status(500).send({ status: false, message: err.message })
  }
}

//=====================================UPDATE PRODUCT========================================

const updateProducts = async (req, res) => {
  try {
    let productId = req.params.productId;
    let data = req.body;
    let file = req.files;

    let {
      title,
      description,
      currencyId,
      currencyFormat,
      availableSizes,
      price,
      isFreeShipping,
      style,
      installments,
    } = data;

    let findProduct = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });

    if (!findProduct)
      return res.status(400).send({
        status: false,
        message: "Product not found",
      });

    if (!isValidRequestBody(data)) {
      return res.status(400).send({
        status: false,
        message: "Provide the Product's Data",
      });
    }

    let updateProduct = {};

    if (title) {
      if (!isValidName(title))
        return res
          .status(400)
          .send({ status: false, message: "Title is invalid" });

      let checkTitle = await productModel.findOne({ title: title });
      if (checkTitle)
        return res.status(400).send({
          status: false,
          message: `Product with title '${title}' is Already Present`,
        });
      updateProduct["title"] = title;
    }

    if (description) {
      if (!isValid(description))
        return res.status(400).send({
          status: false,
          message: "Please Write Description About Product ",
        });
      updateProduct["description"] = description;
    }

    if (price) {
      if (!/^[0-9]*$/.test(price))
        return res
          .status(400)
          .send({ status: false, message: "Price should be in Number" });
      updateProduct["price"] = price;
    }

    if (currencyId) {
      return res.status(400).send({
        status: false,
        message: "You cannot change currencyId, By default it is set to INR",
      });
    }

    if (currencyFormat) {
      return res.status(400).send({
        status: false,
        message:
          "You cannot change currencyFormat, By default it is set to INR",
      });
    }

    if (isFreeShipping) {
      if (
        !(
          isFreeShipping.toLowerCase() === "true" ||
          isFreeShipping.toLowerCase() === "false"
        )
      ) {
        return res.status(400).send({
          status: false,
          message: "Please Provide only Boolean Value",
        });
      }
      updateProduct["isFreeShipping"] = isFreeShipping.toLowerCase();
    }

    if (file && file.length > 0) {
      if (!isValidImg(file[0].mimetype)) {
        return res.status(400).send({
          status: false,
          message: "Image Should be of JPEG/ JPG/ PNG",
        });
      }
      let url = await uploadFile(file[0]);
      updateProduct["productImage"] = url;
    }

    if (availableSizes) {
      let oldSizes = findProduct.availableSizes;
      let sizeArr = availableSizes.replace(/\s+/g, "").split(",").map(String);
      sizeArr = sizeArr.concat(oldSizes);

      let uniqueSize = sizeArr.filter(function (item, i, ar) {
        return ar.indexOf(item) === i;
      });

      let arr = ["S", "XS", "M", "X", "L", "XXL", "XL"];

      for (let i = 0; i < uniqueSize.length; i++) {
        if (!arr.includes(uniqueSize[i]))
          return res.status(400).send({
            status: false,
            data: "Enter a Valid Size, Like 'XS or S or M or X or L or XL or XXL'",
          });
      }
      console.log(oldSizes);
      updateProduct["availableSizes"] = uniqueSize
    }

    if (installments) {
      if (!/^[0-9]*$/.test(installments)) {
        return res.status(400).send({
          status: false,
          message: "Installments value Should be only number",
        });
      }
      if (installments <= 0) {
        return res.status(400).send({
          status: false,
          message: "installments Shoud be In Valid  Number only",
        });
      }
      updateProduct["installments"] = installments;
    }

    //style validation
    // if (style) {
    //   if (!isValid(style)) {
    //     return res
    //       .status(400)
    //       .send({ status: false, message: "Invalid Style" });
    //   }
    //   updateProduct["style"] = style;
    // }

    //after checking all the validation, than creating the product data
    const updatedProduct = await productModel.findOneAndUpdate(
      { _id: productId },
      updateProduct,
      {
        new: true,
      }
    );
    return res.status(201).send({
      status: true,
      message: "Product is updated Successfully",
      data: updatedProduct,
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { createProducts, getProducts, updateProducts, getByID};
