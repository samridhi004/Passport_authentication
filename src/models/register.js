const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    minlength: [2, "minimum 2 letters"],
    maxlength: 50,
  },
  lastname: {
    type: String,
    required: true,
    minlength: [2, "minimum 2 letters"],
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("invalid email");
      }
    },
  },
  password: {
    type: String,
    required: true,
  },
  cpassword: {
    type: String,
    required: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});
//generating token
userSchema.methods.generateAuthToken = async function () {
  try {
    const token = await jwt.sign(
      { _id: this._id.toString() },process.env.SECRET_KEY);
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (error) {
    //res.send(error)
    console.log("error part" + error);
  }
};

//CONVERTING PASSWORD TO HASH
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    console.log(`password is ${this.password}`);
    this.password = await bcrypt.hash(this.password, 10);
    console.log(`password is ${this.password}`);
    this.cpassword = await bcrypt.hash(this.password, 10);
  }
  next();
});
const User = new mongoose.model("User", userSchema);
module.exports = User;
