const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

// CREATE AN ORDER
const createOrder =  async (req, res) => {
  try {
         const userId = req.params.userId;
         const user = await User.findById(userId); 
         if(user)
         {
            const orderCart = await Cart.findOne({
                _id: req.body.cartId
            });
            if (!orderCart) {
                return res.status(404).send({
                    status: false,
                    message: "order not found"
                })
            };

            const updateStock = async (products) => {
               // let quantity = 1;
                let productExist2;
                for (let index = 0; index < products.length; index++) { // or add index <= length
                const product = products[index];
              // quantity += product.quantity;
                productExist2 = await Product.findById(product.productID) 
                console.log(productExist2)
                    if(productExist2.amountInStock < product.quantity) {
                        return res.status(401).send({
                            status: false,
                            message: `This ${productExist2.productName} is temporarily out of stock`
                        })
                    } else {
                        productExist2.amountInStock -= product.quantity || 1; // pEs = pEs - 1
                await productExist2.save();
                }
                //return productExist2;
            }
            return productExist2;
            };
            updateStock(orderCart.products);
            console.log(orderCart.products)

           

            // Order is saved to the DB below
            const newOrder = new Order({
                userId: userId , 
                cart: [orderCart],
                address: req.body.address
            });
            const reqBody = req.body.cartId
            const deletedCart = await Cart.findOneAndDelete(reqBody);
            if(!deletedCart)
            {
                return res.status(400).json({
                message: "Cart cannot be deleted!"
                })
            }
            const savedOrder = await newOrder.save();
            if (orderCart.itemCount >= 10){
                return res.status(200).json({
                    message: "Order created Successfully!",
                    complimentary: "Disposable Cups Included",
                    return : savedOrder});
            } else {
                return res.status(200).json({
                    message: "Order created Successfully!",
                    return : savedOrder});
            }
         } else {
            return res.status(404).json({
            message: "Invalid User!",
         })
       }
    }
     catch (err) {
     console.log(err) 
     return res.status(500).json(err);
    }                                                                                                       
};


 //UPDATE ORDER
 const updateOrder = async (req, res) => {
  try {
    const id = req.params.userId;
    const order = await Order.findOne({id});
    console.log(order)
    if(order)
         {
          order.address = req.body.address;
          const orderRet = await order.save();
          return res.status(200).send({
               status: true,
               message: "Order has been updated successfully",
               updatedOrder: orderRet,
             })
            }else
          {
           return res.status(404).json({
             message: "Order Not Found! "
          })
             }
        }catch (err) {
          console.log(err)
          return res.status(500).json(err);
      }}
    
       

 //DELETE AN ORDER
 const deleteOrder = async (req, res) => {
    try {
        //const order = await Order.findOne({id});
     // const { userId} = req.params;
      const userId = req.params.userId;
      const orderId = req.body.orderId;
      const user = await User.findById(userId);
      if(!user)
        {
          return res.status(400).json({
            message: "Invalid User ID! "
          })
        }
      const order = await Order.findById(orderId) // Order.findOne({ userId: orderId }); 
        if (!order) {
         // console.log(order)
            return res.status(400).json({
                status: 'fail',
                message: `Order with Id: ${orderId} does not exist!`
            })
        }else {
         // console.log(order);

        //    updateStock(cartArray.products);
        //     console.log(cartArray.products)
        //    for (let i = 0; i < order.cart.length; i++) {
        //     for (let j = 0; j < arr[i].length; j++) {



        //       product *= arr[i][j];
        //     }
        //   }
          // Only change code above this line
        //   return product;
        // }





     //  await Order.findOneAndDelete({userId: orderId})

      await Order.findByIdAndDelete(orderId)
       return  res.status(200).json({
            message: 'Order deleted successfully'
        })};
    } catch (err) {
       return res.status(400).json({
            status: 'fail',
            message: err
        })
    }
}  


// GET ONE USER ORDER
const getUserOrder = async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if(!user)
        {
          return res.status(400).json({
            message: "Invalid User! "
          })
        }
        const order = await Order.findOne({ userId })
        return res.status(200).json({
            data: order
        })
    } catch (err) {
        return res.status(400).json({
            status: 'fail',
            message: err
        })
    }
}

 //GET ALL ORDERS
const getAllOrders = async (req, res) => {
    try {
        const order = await Order.find({});
        res.status(200).json({
            message: "All Orders have been retrieved!",
            data: [order],
            results: order.length
          });
      } catch (err) {
        res.status(404).json({
            message: " Error!",
            data: err});
      }
    };

 module.exports = {createOrder , getAllOrders, getUserOrder, updateOrder, deleteOrder}