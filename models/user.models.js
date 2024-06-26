const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name!"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email!"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [4, "Password should be 4 characters or more"],
    select: false,
  },
  phoneNumber: {
    type: Number,
  },
  addresses: [
    {
        country: {
            type: String,
        },
        city: {
            type: String,
        },
        address1: {
            type: String,
        },
        address2: {
            type: String,
        },
        postalCode: {
            type: Number,
        },
        addressType:{
          type: String,
        },
    }
  ],
  role: {
    type: String,
    default: "user",
  },
  avatar:{
    public_id: {
      type: String
    },
    url: {
      type: String
    },
 },
  createdAt: {
    type: Date,
    default: Date.now(),
  }
});

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.getJwtToken = function () {
    return jwt.sign({id: this._id}, process.env.JWT_SECRET_KEY,{
        expiresIn: process.env.JWT_EXPIRES,
    });
};

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
