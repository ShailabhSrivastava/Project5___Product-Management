const productModel = require("../models/productModel"); //requiring model
//requiring packages
const { uploadFile } = require("../aws/aws");
const aws1 = require("../aws/aws");
//improting validation file and destrucing all the validation as per the project requirement
const {
  isValidRequestBody,
  isValid,
  isValidObjectId,
  isValidImg,
  isValidName,
} = require("../validators/validation");

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
      let url = await aws1.uploadFile(file[0]);
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

//=====================================UPDATE PRODUCT========================================

const updateProducts = async (req, res) => {
  try {
    let data = req.body;
    let productId = req.params.productId;
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

    // if (currencyId) {
    //   if (currencyId != "INR")
    //     return res
    //       .status(400)
    //       .send({ status: false, message: "CurrencyId should be in INR" });
    // updateProduct['currencyId'] = currencyId
    // }

    // if (currencyFormat != "₹") {
    //   return res.status(400).send({
    //     status: false,
    //     message: "Currency Symbol should be only in '₹'s",
    //   });
    // }

    //isFreeShipping validation
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
      data["isFreeShipping"] = isFreeShipping.toLowerCase();
    }

    if (file > 0) {
      if (!isValidImg(file[0].mimetype)) {
        return res.status(400).send({
          status: false,
          message: "Image Should be of JPEG/ JPG/ PNG",
        });
      }
      let url = await aws1.uploadFile(file[0]);
      data["productImage"] = url;
    }
    // if (availableSizes) {
    //   return res
    //     .status(400)
    //     .send({ status: false, message: "Please Enter Size of Product" });
    // }

    // let uniqueSize = availableSizes.replace(/\s+/g, "").split(",").map(String);
    // let arr = ["S", "XS", "M", "X", "L", "XXL", "XL"];
    // let flag;
    // for (let i = 0; i < uniqueSize.length; i++) {
    //   flag = arr.includes(uniqueSize[i]);
    // }
    // if (flag == false) {
    //   return res.status(400).send({
    //     status: false,
    //     data: "Enter a Valid Size, Like 'XS or S or M or X or L or XL or XXL'",
    //   });
    //   updateProduct["availableSizes"] = uniqueSize;
    // }

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
      updateProduct["installments"] = installments;
    }

    //style validation
    if (style != null) {
      if (!isValid(style)) {
        return res
          .status(400)
          .send({ status: false, message: "Provide the style " });
      }
      updateProduct["style"] = style;
    }

    //after checking all the validation, than creating the product data
    const createdProduct = await productModel.findOneAndUpdate(
      { _id: productId },
      updateProduct,
      {
        new: true,
      }
    );
    return res.status(201).send({
      status: true,
      message: "Product is Created Successfully",
      data: createdProduct,
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { createProducts, updateProducts };
