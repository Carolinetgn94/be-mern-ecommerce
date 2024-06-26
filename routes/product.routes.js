const express = require('express');
const router = express.Router();
const productCtrl = require("../controllers/product.controllers");
const catchAsyncError = require("../middleware/catchAsyncError");
const { isSeller } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });


router.post('/create-product', upload.array("images"), catchAsyncError(productCtrl.createProduct));

router.get('/get-all-products-shop/:id', catchAsyncError(productCtrl.getAllShopProducts));

router.delete('/delete-shop-product/:id', isSeller, catchAsyncError(productCtrl.deleteShopProduct));

router.get('/get-all-products', catchAsyncError(productCtrl.getAllProducts));

router.get('/get-product-details/:id', catchAsyncError(productCtrl.getProductDetails));

router.put('/edit-product/:id', upload.array("images"), catchAsyncError(productCtrl.editProduct));

router.get('/get-all-products-by-category/:category', catchAsyncError(productCtrl.getAllProductsByCategory));

module.exports = router;