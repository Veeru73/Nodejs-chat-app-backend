//Verify Token
const jsonWebToken = require("jsonwebtoken");
require("dotenv").config("./.env");

let authJsonWebToken = (req, res, next) => {
  try {
    let token = req.headers.authorization;
    //when token not exist
    if (!token) {
      return res
        .status(300)
        .json({ success: false, message: "send token for user verification" });
    }
    //get token from array
    token = token.split(" ")[1];

    jsonWebToken.verify(token, process.env.SECRET, function (err, decoded) {
      if (err) {
        throw new Error("Invalid Token");
      }
      if (req.method == "GET") {
        req.query.id = decoded.id;
      } else {
        req.body.id = decoded.id;
      }
    });

    next();
  } catch (err) {
    res
      .status(401)
      .json({ success: false, data: `ERROR::auth:${err.message}` });
  }
};

module.exports = authJsonWebToken;
