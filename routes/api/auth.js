const express = require("express");
const app = express();
const router = express.Router();
const jwt = require("jsonwebtoken");
const jwtMiddleWare = require("../../middleware/auth");
const modelUser = require("../../models/User");

const { check, validationResult } = require("express-validator");
const UserModel = require("../../models/User");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwtSecret = require("../../config/default.json");

router.get("/", jwtMiddleWare, async (req, res, next) => {
  try {
    const user = await modelUser.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.log(error.message);
    res.status(401).send("Sever Error");
  }
});

// Post Request to api/auth and Authenticate Users and get Token
router.post(
  "/",
  [
    check("email", "Enter valid email address").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).exists(),
  ],
  async (req, res, next) => {
    console.log(req.body);
    const errorResult = validationResult(req);
    if (!errorResult.isEmpty()) {
      return res.status(400).json({ error: errorResult.array() });
    }
    const { email, password } = req.body;

    try {
      //res.send("User route");
      let user = await UserModel.findOne({ email: email });
      if (!user) {
        return res.status(400).json([{ msg: "Invalid Credentials" }]);
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json([{ msg: "Invalid Credentials" }]);
      }

      const payload = {
        user: {
          id: user.id,
        },
      };
      jwt.sign(
        payload,
        jwtSecret.jwtsecret,
        { expiresIn: 360000 },
        (err, token) => {
          if (err) {
            throw err;
          } else {
            res.json({ token: token });
          }
        }
      );
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
