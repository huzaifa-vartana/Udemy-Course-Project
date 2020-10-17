const express = require("express");
const app = express();
const router = express.Router();
const { check, validationResult } = require("express-validator");
const UserModel = require("../../models/User");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtSecret = require("../../config/default.json");
router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Enter valid email address").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res, next) => {
    console.log(req.body);
    const errorResult = validationResult(req);
    if (!errorResult.isEmpty()) {
      return res.status(400).json({ error: errorResult.array() });
    }
    const { name, email, password } = req.body;

    try {
      //res.send("User route");
      let user = await UserModel.findOne({ email: email });
      if (user) {
        return res.status(400).json([{ msg: "User already exists" }]);
      }
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });
      user = new UserModel({
        name,
        email,
        password,
        avatar,
      });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
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
