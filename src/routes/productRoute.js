const express = require("express");
const productController = require("../controllers/productController");
const { auth, checkUser } = require("../middlewares/authMiddleware");

const productRouter = express.Router();

const { createProduct, updateProduct, getProduct, getProductListing, deleteProduct } =
  productController;

productRouter
  .route("/product")
  .post(auth, checkUser("gulp"), createProduct)
  .get(auth, getProductListing)
  .delete(auth, checkUser("gulp"), deleteProduct);

productRouter.put("/product/:id", auth, checkUser("gulp"), updateProduct);
productRouter.get("/product/:id", auth, getProduct);

module.exports = productRouter;
