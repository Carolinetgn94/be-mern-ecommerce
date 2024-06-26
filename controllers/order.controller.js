const Order = require("../models/order.models");
const Product = require("../models/product.models");
const mongoose = require("mongoose");

async function createOrder(req, res) {
  try {
    const { shippingAddress, totalPrice, cart, paymentMethod } = req.body;

    const validProductIds = cart.every((item) =>
      mongoose.Types.ObjectId.isValid(item._id)
    );
    if (!validProductIds) {
      return res.status(400).json({
        success: false,
        message: "Invalid product IDs provided in the order",
      });
    }

    const productsDetails = await Product.find({
      _id: { $in: cart.map((item) => item._id) },
    });

    if (productsDetails.length !== cart.length) {
      return res.status(400).json({
        success: false,
        message: "One or more products not found",
      });
    }

    const products = cart.map((item) => {
      const productDetail = productsDetails.find(
        (p) => p._id.toString() === item._id
      );
      return {
        product: item._id,
        shop: productDetail.shopId,
        name: productDetail.name,
        image: productDetail.images[0],
        quantity: item.qty,
        price: item.price,
      };
    });

    const order = await Order.create({
      user: req.user._id,
      shippingAddress,
      totalPrice,
      paymentMethod,
      products,
    });

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function getUserOrders(req, res) {
  try {
    const orders = await Order.find({ user: req.user._id }).populate(
      "products.product"
    );

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function getShopOrders(req, res) {
    try {
        const shopId = req.seller._id;
    
        const orders = await Order.aggregate([
          {
            $lookup: {
              from: "products",
              localField: "products.product",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          {
            $match: {
              $expr: {
                $in: [shopId, "$productDetails.shopId"],
              },
            },
          },
          {
            $project: {
              user: 1,
              shippingAddress: 1,
              totalPrice: 1,
              paymentMethod: 1,
              products: {
                $map: {
                  input: "$products",
                  as: "product",
                  in: {
                    $mergeObjects: [
                      "$$product",
                      {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$productDetails",
                              cond: {
                                $eq: ["$$this._id", "$$product.product"],
                              },
                            },
                          },
                          0,
                        ],
                      },
                    ],
                  },
                },
              },
              createdAt: 1,
              isPaid: 1,
              paidAt: 1,
              isDelivered: 1,
              deliveredAt: 1,
            },
          },
        ]);
    
        res.status(200).json({
          success: true,
          orders,
        });
      } catch (error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      }
}

module.exports = {
  createOrder,
  getUserOrders,
  getShopOrders,
};
