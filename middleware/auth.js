const jwt = require("jsonwebtoken");
const jwt1 = require("../config/default.json");
const secret = jwt1.jwtsecret;

jwtFunction = (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) {
    res.status(401).json({ msg: "No token, authorization denied" });
  }
  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ msg: "Token not valid" });
  }
};

module.exports = jwtFunction;
