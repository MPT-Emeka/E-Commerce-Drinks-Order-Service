const Product = require("../models/productModel");
const User = require('../models/userModel')
const productErrorHandler = require("../helpers/productErrorHandler");



exports.createProduct = async (request, response) => {  
  try {
    const user = await User.findById(request.body.gulp);
    const productCt = await Product.findOne({ productName: request.body.productName }); 
    if (user && productCt) {  
      productCt.productCounter += 1;
      await productCt.save();
      return response.status(201).send({
        status: true, // check
        message: "product count has been increased successfully",
        productCtToReturn: productCt 
      })
    } else if (user && !productCt) {
        const product = new Product(request.body)
        await product.save();
        return response.status(201).send({
                status: true, // check
                message: "product has been uploaded successfully",
                productToReturn: product,
        })
    }
  } catch (error) {
    const err = productErrorHandler(error);
    return response.status(404).json({ err });
  }
};

exports.updateProduct = async (request, response) => {
  try {
    const findProduct = await Product.findById(request.params.id);
    console.log(findProduct)
    if (findProduct) {
      findProduct.price = request.body.price;
      findProduct.description = request.body.description;
      await findProduct.save();
      return response.status(200).send({
        status: true,
        message: "Product has been updated successfully",
        updatedProduct: findProduct,
      });
    } else {
      return response.status(404).send({
        status: false,
        message: "Product not found",
      });
    }
  } catch (error) {
    const err = productErrorHandler(error);
    return response.status(400).json({ err });
  }
};

exports.getProduct = async (request, response) => {
    try {
      const id = request.params.id;
      const findOneProduct = await Product.findById(id);
      if (!findOneProduct) {
        return response.status(404).send({
          status: false,
          message: "Product not found",
        });
      } else {
        return response.status(200).send({
          status: true,
          message: "Product found",
          productToReturn: findOneProduct,
        });
      }
    } catch (err) {
        return response.status(401).send({
          status: false,
          message: "Invalid input",
        });
    }
  } 
  

exports.getProductListing = async (request, response) => {
    try {
    //   const productCt = await Product.find({
    //     productName: request.body.productName,
    //   });

    //   if(productCt) {
    //    productCt.productCounter += 1;
    //   }


      const findAllProduct = await Product.find();
      return response.status(200).send({
        status: true,
        message: "Product Listing",
        productListing: findAllProduct,
        counts: findAllProduct.length,
        productCounter: findAllProduct.productCounter // check 
      });
    } catch (error) {
      const err = productErrorHandler(error);
      return response.status(400).json({ err });
    }
  }


exports.deleteProduct = async (request, response) => {
  try {
    const { id } = request.query;
    const findProduct = await Product.findById(id)
    if (findProduct.productCounter > 1) {
      findProduct.productCounter -= 1;
      await findProduct.save();
      return response.status(200).send({
        status: true,
        message: `Single Product ${findProduct.productName} deleted successfully`,
        deletedProduct: findProduct,
      });
    }else if (findProduct.productCounter === 1){
      findProduct.deleteOne();
      return response.status(200).send({
        status: true,
        message: "Product deleted successfully",
        deletedProduct: findProduct,
      })
    } else if (!findProduct) {
      return response.status(404).send({
        status: false,
        message: "Product not found",
      });
    }
  } catch (error) {
    const err = productErrorHandler(error);
    return response.status(400).json({ err });
  }
};
