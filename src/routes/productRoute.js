const express = require("express");
const productController = require("../controllers/productController");
const { auth, checkUser } = require("../middlewares/authMiddleware");

const productRouter = express.Router();

const { createProduct, updateProduct, getProduct, getProductListing, deleteProduct } =
  productController;

productRouter
  .route("/product")
  .post(auth, createProduct)
  .get(auth, getProductListing)
  .delete(auth, deleteProduct);

productRouter.put("/product/:id", auth, updateProduct);
productRouter.get("/product/:id", auth, getProduct);

module.exports = productRouter;
