const UserModel = require("../models/user_model");
const Validator = require("node-input-validator");
const jsonwebtoken = require("jsonwebtoken");
const bcrypt = require("bcrypt");
// ===========================================================================================================
// -----------------------------signUp---------------------------------------------------------------------
exports.signUp = async (req, res, next) => {
  const validator = new Validator.Validator(req.body, {
    email: "required|email",
    password: "required",
    name: "required",
  });

  const matched = await validator.check();

  if (!matched) {
    const error = Object.values(validator.errors)[0].message;
    return res.status(200).json({ success: false, message: error });
  }

  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  let profileImage = undefined;
  if (req.file) {
    profileImage = req.file.filename;
  }
  try {
    const userExist = await UserModel.findOne({ email });

    if (userExist) {
      const error = new Error("User already exist");
      error.statusCode = 200;
      throw error;
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const data = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      profileImage,
    });
    return res
      .status(201)
      .json({ success: true, message: "Sign up successfully", data });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------logIn------------------------------------------------------
exports.logIn = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const validator = new Validator.Validator(req.body, {
    email: "required|email",
    password: "required|string",
  });

  const matched = await validator.check();
  if (!matched) {
    const error = Object.values(validator.errors)[0].message;
    return res.status(200).json({ success: false, message: error });
  }
  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      const error = new Error("Invalid password");
      error.statusCode = 200;
      throw error;
    }

    delete user._doc.password;

    const token = jsonwebtoken.sign({ id: user._id }, process.env.SECRET, {
      expiresIn: "10d",
    });

    return res.status(200).json({
      success: true,
      message: "Log in successfully",
      data: { ...user._doc, token },
    });
  } catch (error) {
    next(error);
  }
};
// ------------------------------------------getUsers-------------------------------------------------
exports.getUsers = async (req, res, next) => {
  const _id = req.query.id;
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { name: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  try {
    const data = await UserModel.find(keyword).find({
      _id: { $ne: _id },
    });
    return res.status(200).json({ success: true, message: "", data });
  } catch (error) {
    next(error);
  }
};
