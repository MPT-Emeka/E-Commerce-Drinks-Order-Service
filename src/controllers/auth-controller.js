const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const Token = require("../models/token-model");
const { createToken } = require("../middlewares/authMiddleware");
const handleError = require("../helpers/errors");
const crypto = require("crypto");
const cookie = require("cookie-parser");
// add mongoose*

//cookie-parser expiry date
const maxAge = 3 * 24 * 60 * 60;

//Creat account for user
exports.signUp = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phoneNumber, role } = req.body;
    if (password !== confirmPassword) {
      res.status(400).json({ message: "Passwords do not match" });
    }
    const salt = await bcrypt.genSalt(10);

    if (password === confirmPassword && password.length > 5) {
      const hash = await bcrypt.hash(password, salt);
      const user = await User.create({
        name,
        email,
        password: hash,
        confirmPassword: hash,
        phoneNumber,
        role,
      });

      const token = createToken(user._id);
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
      await new Token({
        userId: user._id,
        token: token,
        createdAt: Date.now(),
      }).save();
      return res.status(201).json({
        status: "success",
        token,
        data: {
          user,
        },
      });
    }
    return res
      .status(400)
      .json({ message: "Password is less than 6 characters" });
  } catch (error) {
    const errors = handleError(error);
    res.status(404).json({ errors });
  }
};

//Log user in
exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(401).json({
        status: "fail",
        message: "Invalid email or password",
      });
    }

    if (user) {
      const auth = await bcrypt.compare(password, user.password);
      if (auth) {
        const token = await createToken(user._id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({
          status: "success",
          token,
          data: {
            user,
          },
        });
      } else {
        res.status(401).json({
          status: "fail",
          message: "Invalid email or password",
        });
      }
    }
  } catch (err) {
    const errors = handleError(err);
    res.status(400).json({
      status: "fail",
      message: errors,
    });
  }
};

//Logout
exports.logout = async (req, res) => {
  try {
    const token = "";
    res.cookie("jwt", token, { httpOnly: true}); // decrease max age
    res.status(200).json({ message: "You've successfully logged out" }) //.redirect("/"); //add homepage url. 
  } catch (error) {
    res.status(404).json({ message: "Account not logged out" });
  }
};

const requestPasswordReset = async (email) => {
  try {
    const user = await User.findOne({ email });

    if (!user) return { message: "User does not exist" };
    let token = await Token.findOne({ userId: user._id });
    if (token) await token.deleteOne();
    let resetToken = crypto.randomBytes(32).toString("hex");

    const tokenReset = await new Token({
      userId: user._id,
      token: resetToken,
      createdAt: Date.now(),
    }).save();

    return tokenReset;
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

const resetPassword = async (userId, token, password) => {
  try {
    const passwordResetToken = await Token.findOne({ userId });
    console.log(passwordResetToken)
    if (!passwordResetToken) {
      return res
        .status(400)
        .json({ message: "Invalid token" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    console.log(hash)
    await User.updateOne(
      { _id: userId },
      { $set: { password: hash } },
      { new: true }
    );
    return res
      .status(200)
      .send({ message: "You have successfully updated your Password." });
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

exports.resetPasswordRequestController = async (req, res, next) => {
  try {
    const requestPasswordResetService = await requestPasswordReset(
      req.body.email
    );
    return res.status(200).json(requestPasswordResetService);
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

exports.resetPasswordController = async (req, res, next) => {
  try {
    const resetPasswordService = await resetPassword(
      req.body.userId,
      req.body.token,
      req.body.password
    );
    return res.status(200).json(resetPasswordService);
  } catch (error) {
    res.status(400).json({ message: error });
  }
};
exports.deleteUser = async(req, res)=>{
  try{
    const deletedUser =  await User.findOneAndDelete({_id: req.user.id }); // check during postman test
    if(!deletedUser){
      await Token.findOneAndDelete({ userId : req.user.id});
      return res.status(400).json({message: "unable to delete account"})
    }
    return res.status(200).json({
      success: true,
      message:"account deleted"
    })
  }
  catch(error) {
    res.status(500).json({ message: error });
  }
}