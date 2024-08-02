import express from "express";
import { model } from "mongoose";
import { Router } from "express";
import utils from "../utils/index.js"; // Import the utilities object
import { check, validationResult } from "express-validator";
const { auth, upload } = utils; // Destructure the auth utility
import normalize from "normalize-url";
import Profile from "../models/Profile.js";
import User from "../models/User.js";
import Post from "../models/Post.js";

const router = Router();

/*
1. POST /profiles
2. GET /profiles/me
3. GET /profiles
4. GET /profiles/user/:user_id
5. DELETE /profiles
6. POST /profiles/upload
7. PUT /profiles/experience
8. DELETE /profiles/experience/:exp_id
9. PUT /profiles/education
10. DELETE /profiles/education/:edu_id
*/

router.post(
  "/",
  auth,
  check("status", "status is required").notEmpty(),
  check("skills", "skills is required").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // validations
    const {
      website,
      skills,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
      github,
      ...rest
    } = req.body;

    const profile = {
      user: req.user.id,
      website:
        website && website !== ""
          ? normalize(website, { forceHttps: true })
          : "",
      skills: Array.isArray(skills)
        ? skills
        : skills.split(",").map((skill) => skill.trim()),
      ...rest,
    };
    const socialFields = {
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
      github,
    };
    for (let key in socialFields) {
      const value = socialFields[key];
      if (value && value != "") {
        socialFields[key] = normalize(value, { forceHttps: true });
      }
    }
    profile.social = socialFields;
    try {
      let profileObject = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profile },
        { new: true, upsert: true }
      );
      return res.json(profileObject);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send(err.message);
    }
  }
);

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name"]);
    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send(err.message);
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name"]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send(err.message);
  }
});

router.get("/user/:user_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name"]);
    if (!profile) {
      return res
        .status(400)
        .json({ msg: "There is no profile for the given user" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send(err.message);
  }
});

router.delete("/", auth, async (req, res) => {
  try {
    await Promise.all([
      Post.deleteMany({ user: req.user.id }),
      Profile.findOneAndDelete({ user: req.user.id }),
      User.findOneAndDelete({ _id: req.user.id }),
    ]);

    res.json({ msg: "user information is deleted successfully" });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send(err.message);
  }
});

router.post("/upload", auth, (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        res.status(500).send(`Server Error: ${err}`);
      } else {
        res.status(200).send(req.user.id);
      }
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send(err.message);
  }
});

router.put(
  "/experience",
  auth,
  check("title", "Title is required").notEmpty(),
  check("company", "Company is required").notEmpty(),
  check("from", "From Date is required and needs to be from the past")
    .notEmpty()
    .custom((value, { req }) => {
      return req.body.to ? value < req.body.to : true;
    }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(req.body);
      await profile.save();
      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send(err.message);
    }
  }
);

router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // Filter out the experience that matches the exp_id
    profile.experience = profile.experience.filter(exp => exp._id.toString() !== req.params.exp_id);

    // Save the updated profile
    await profile.save();

    return res.json(profile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send(err.message);
  }
});


router.put(
  "/education",
  auth,
  check("school", "school is required").notEmpty(),
  check("degree", "degree is required").notEmpty(),
  check("fieldofstudy", "fieldofstudy is required").notEmpty(),
    check("from", "From Date is required and needs to be from the past")
    .notEmpty()
    .custom((value, { req }) => {
      return req.body.to ? value < req.body.to : true;
    }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(req.body);
      await profile.save();
      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send(err.message);
    }
  }
);

router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // Filter out the education that matches the edu_id
    profile.education = profile.education.filter(edu => edu._id.toString() !== req.params.edu_id);

    // Save the updated profile
    await profile.save();

    return res.json(profile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send(err.message);
  }
});


export default router;
