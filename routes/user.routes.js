const express = require('express');
const router = express.Router();
const userCtrl = require("../controllers/user.controllers");
const upload = require("../multer")
const catchAsyncError = require("../middleware/catchAsyncError");
const {isAuthenticated} = require("../middleware/auth");

router.post('/create-user', upload.single("file"), userCtrl.createUser);

router.post('/login-user', catchAsyncError(userCtrl.loginUser));

router.get('/getuser', isAuthenticated, catchAsyncError(userCtrl.getUser));

router.get('/logout', catchAsyncError(userCtrl.logoutUser))

router.put('/update-user-info', isAuthenticated, catchAsyncError(userCtrl.updateUserInfo));

router.put('/update-avatar', isAuthenticated, upload.single("image"), catchAsyncError(userCtrl.updateUserAvatar));


module.exports = router;