const { request } = require("http");
const { deleteProduct } = require("../controllers/productController");
const {
  productName,
  category,
  price,
  description,
  images,
  timestamps,
} = require("../models/productModel");

const productErrorHandler = (err) => {
  console.log(err.message);
  let error = {
    productName: "",
    category: "",
    uniqueProductId: "",
    price: "",
    description: "",
    images: "",
    timestamps: "",
  };

  if (err.message.includes("product validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      error[properties.path] = properties.message;
    });
  }
  return error;
};

module.exports = productErrorHandler;
