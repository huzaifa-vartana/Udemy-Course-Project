const express = require("express");
const app = express();
const router = express.Router();
const auth = require("../../middleware/auth");
const userModel = require("../../models/User");
const profileModel = require("../../models/Profile");
const { check, validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");

//@route GET api/profile/me
//desc Get Current User
// @access Private

router.get("/me", auth, async (req, res, next) => {
  try {
    const profile = await profileModel
      .findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(401).json({ msg: "No profile for this user" });
    }
    res.json(profile);
  } catch (error) {
    console.log();
    res.status(401).json({ message: "Server Error" });
  }
});

//@route POST api/profile
//desc create a new profile
// @access Public
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills are required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) {
      profileFields.company = company;
    }
    if (website) {
      profileFields.website = website;
    }
    if (location) {
      profileFields.location = location;
    }
    if (bio) {
      profileFields.bio = bio;
    }
    if (status) {
      profileFields.status = status;
    }
    if (githubusername) {
      profileFields.githubusername = githubusername;
    }
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    // Build Social object
    profileFields.social = {};
    if (youtube) {
      profileFields.social.youtube = youtube;
    }
    if (twitter) {
      profileFields.social.twitter = twitter;
    }
    if (facebook) {
      profileFields.social.facebook = facebook;
    }
    if (linkedin) {
      profileFields.social.linkedin = linkedin;
    }
    if (instagram) {
      profileFields.social.instagram = instagram;
    }
    try {
      let profile = await profileModel.findOne({ user: req.user.id });
      if (profile) {
        profile = await profileModel.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }
      // Create a new profile
      profile = new profileModel(profileFields);
      await profile.save();
      res.json(profile);
    } catch (error) {
      return res.status(401).json({ message: "Server Error" });
    }
  }
  // Build Profile Object
);
//@route get api/profile/
//desc get all the profiles
// @access Public
router.get("/", async (req, res, next) => {
  try {
    const profiles = await profileModel
      .find()
      .populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

//@route get api/profile/:uid
//desc get specific user profile
// @access private
router.get("/user/:uid", async (req, res, next) => {
  try {
    const profile = await profileModel
      .findOne({ user: req.params.uid })
      .populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(400).json({ message: "Profile not found" });
    }
    res.json(profile);
  } catch (error) {
    console.log(error.message);
    if (error.kind == "ObjectId") {
      return res.status(400).json({ message: "Profile not found" });
    }
    res.status(500).json({ msg: "Server Error" });
  }
});
//@route delete api/profile
//desc delete specific user, profile,post
// @access private
router.delete("/", auth, async (req, res, next) => {
  try {
    // Remove profile and user
    await profileModel.findOneAndRemove({ user: req.user.id });
    await userModel.findOneAndRemove({ _id: req.user.id });
    res.json({ message: "Removed" });
  } catch (error) {
    console.log(error.message);
    if (error.kind == "ObjectId") {
      return res.status(400).json({ message: "Profile not found" });
    }
    res.status(500).json({ msg: "Server Error" });
  }
});

//@route put  api/profile/experience
//desc add profile experience
// @access private
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array);
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;
    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };
    try {
      const getProfile = await profileModel.findOne({ user: req.user.id });
      getProfile.experience.unshift(newExp);
      console.log(newExp);
      await getProfile.save();
      res.json(getProfile);
      console.log(getProfile);
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ message: "Server Error" });
    }
  }
);
//@route delete  api/profile/experience/:eid
//desc delete experience
// @access private
router.delete("/experience/:eid", auth, async (req, res, next) => {
  try {
    const getProfile = await profileModel.findOne({ user: req.user.id });
    const removeIndex = getProfile.experience
      .map((item) => item.id)
      .indexOf(req.params.eid);
    getProfile.experience.splice(removeIndex, 1);
    await getProfile.save();
    res.json(getProfile);
  } catch (error) {
    return res.status(400).json({ message: "Server Error" });
    console.log(error.message());
  }
});
//@route put  api/profile/education
//desc add profile education
// @access private
router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required").not().isEmpty(),
      check("degree", "Degree is required").not().isEmpty(),
      check("fieldofstudy", "Field of study is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array);
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;
    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };
    try {
      const getProfile = await profileModel.findOne({ user: req.user.id });
      getProfile.education.unshift(newEdu);
      console.log(newEdu);
      await getProfile.save();
      res.json(getProfile);
      console.log(getProfile);
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ message: "Server Error" });
    }
  }
);
//@route delete  api/profile/education/:eid
//desc delete education
// @access private
router.delete("/education/:eid", auth, async (req, res, next) => {
  try {
    const getProfile = await profileModel.findOne({ user: req.user.id });
    const removeIndex = getProfile.experience
      .map((item) => item.id)
      .indexOf(req.params.eid);
    getProfile.education.splice(removeIndex, 1);
    await getProfile.save();
    res.json(getProfile);
  } catch (error) {
    return res.status(400).json({ message: "Server Error" });
    console.log(error.message());
  }
});

module.exports = router;
