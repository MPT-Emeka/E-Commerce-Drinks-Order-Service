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
            cartId: req.body.cartId
          });
          const updateStock = async (products) => {
            let quantity = 0;
            let productExist2;
            for (let index = 0; index < products.length; index++) { // or add index <= length
              const product = products[index];
              quantity += product.quantity;
            productExist2 = await Product.findById(product.productID) 
             console.log(productExist2)
                if(productExist2.amountInStock < quantity) {
                    return res.status(401).send({
                        status: false,
                        message: `This ${productExist2.productName} is temporarily out of stock`
                    })
                } else {
                     productExist2.amountInStock -= quantity; // pEs = pEs - quantity
             await productExist2.save();
            }
            return productExist2;
         }
        };
           updateStock(orderCart.products);
          const newOrder = new Order({
            userId: userId , 
            cart:  [orderCart],
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
             return res.status(200).json({
                message: "Order created Successfully!",
                return : savedOrder});
         } else{
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
          await order.save();
          return res.status(200).send({
               status: true,
               message: "Order has been updated successfully",
               updatedOrder: updateOrder,
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
          console.log(order)
            return res.status(400).json({
                status: 'fail',
                message: `Order with Id: ${orderId} does not exist!`
            })
        }else {
          console.log(order);

        //   const stockUpdate = order.cart

        //   let y = stockUpdate.id; 

          const updateStock = async (products) => {
            let quantity = 0;
            let productExist2;
            for (let index = 0; index < products.length; index++) { // or add index <= length
              const product = products[index];
              quantity += product.quantity;
            productExist2 = await Product.findById(product.productID) 
             console.log(productExist2)
            productExist2.amountInStock += quantity; // pEs = pEs + quantity
             await productExist2.save();
             console.log(productExist2)
            }
            return productExist2;
            };
           updateStock(order.cart);

           console.log(order.cart)
        //    for (let i = 0; i < order.cart.length; i++) {
        //     for (let j = 0; j < arr[i].length; j++) {



        //       product *= arr[i][j];
        //     }
        //   }
          // Only change code above this line
        //   return product;
        // }





       await Order.findOneAndDelete({userId: orderId})
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
        const order = await Order.findOne({userId})
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