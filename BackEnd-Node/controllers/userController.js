import User from "../models/User.js";
import regEmailTest from "../utils/regEmailTest.js";
import isAlphabetOnly from "../utils/isAlphabetOnly.js";
import charLength from "../utils/charLength.js";
import sanitizeInput from "../utils/sanitizeInput.js";

import { validationResult } from "express-validator";

const getMe = async (req, res) => {
  const u = await User.findById(req.userId).select("-passwordHash");
  res.json(u);
};

const getUserByUsername = async (req, res) => {
  const u = await User.findOne({ username: req.params.username }).select(
    "-passwordHash"
  );
  if (!u) return res.status(404).json({ message: "Not found" });
  const isMe = u._id.toString() === req.userId;
  u._doc.isMe = isMe;
  res.json({
    user: u,
  });
};

const updateUser = async (req, res) => {
  const resData = {};
  const data = { ...req.body };

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    resData.message = "Validation failed";
    resData.errors = errors.array();
    return res.json(resData);
  }

  try {
    if (data.email) {
      let email_get = sanitizeInput(data.email);
      if (regEmailTest(email_get) === 0) {
        resData.message = "Email is not valid";
        return res.json(resData);
      }
    }

    if (data.name) {
      let name_get = sanitizeInput(data.name);
      if (isAlphabetOnly(name_get) === 0) {
        resData.message = "Name invalid: Only characters are allowed";
        return res.json(resData);
      } else if (charLength(name_get, 6, 35) === 0) {
        resData.message =
          "Name invalid: Number of characters should be from 6 to 35";
        return res.json(resData);
      }
    }

    if (data.username) {
      let username_get = sanitizeInput(data.username);
      if (charLength(username_get, 6, 35) === 0) {
        resData.message =
          "Username invalid: Number of characters should be from 6 to 35";
        return res.json(resData);
      }

      const usernameCheck = await User.findOne({ username: username_get });
      if (usernameCheck) {
        resData.message = "Username already exists";
        return res.json(resData);
      }

      if(req.userId !== usernameCheck?._id.toString()) {
        resData.message = "You can not change to this username";
        return res.json(resData);
      }
    }

    const u = await User.findByIdAndUpdate(req.userId, data, {
      new: true,
    }).select("-passwordHash");

    if (u) {
      resData.status = 201;
      resData.message = "User Updated Successfully";
    } else {
      resData.status = 400;
      resData.message = "Error for Updating Data";
    }
    return res.json(resData);
  } catch (e) {
    console.error("Error updating user:", e);
  }
};

const searchUsers = async (req, res) => {
  const q = req.query.q.trim();
  let users = await User.find({ $text: { $search: req.query.q } })
    .limit(20)
    .select("username name");

  if (users.length === 0) {
    const regex = new RegExp(q.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "i");
    users = await User.find({ content: regex })
      .limit(20)
      .select("username name email companyName");
  }

  res.json(users);
};

export default {
  getMe,
  getUserByUsername,
  updateUser,
  searchUsers,
};
