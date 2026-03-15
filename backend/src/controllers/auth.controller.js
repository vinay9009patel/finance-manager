import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import generateToken from "../utils/generate.token.js";
import { createNotification } from "../services/notification.service.js";
import { loginValidator, registerValidator } from "../utils/validator.js";

const normalizeRole = (role) => {
  if (role === "admin" || role === "parent" || role === "adult") return "adult";
  if (role === "user" || role === "student" || role === "child") return "student";
  if (role === "adult") return "adult";
  return "adult";
};

const normalizeIsParent = (role, isParent) =>
  Boolean(isParent) || role === "parent" || role === "admin";

const isParentAccount = (user) =>
  user?.role === "parent" || (normalizeRole(user?.role) === "adult" && user?.isParent === true);

const isStudentAccount = (user) =>
  (user?.role === "child" || normalizeRole(user?.role) === "student") && user?.isParent !== true;

const generateParentCode = () =>
  `FM-${Math.random().toString(36).slice(2, 6).toUpperCase()}${Date.now().toString().slice(-4)}`;

const generateStudentCode = () =>
  `STU-${Math.random().toString(36).slice(2, 6).toUpperCase()}${Date.now().toString().slice(-4)}`;

const ensureParentCode = async (user) => {
  if (!user || !isParentAccount(user)) return user;
  if (user.parentCode) return user;

  let parentCode = generateParentCode();
  while (await User.findOne({ parentCode })) {
    parentCode = generateParentCode();
  }

  user.parentCode = parentCode;
  await user.save();
  return user;
};

const ensureStudentCode = async (user) => {
  if (!user || !isStudentAccount(user)) return user;
  if (user.studentCode) return user;

  let studentCode = generateStudentCode();
  while (await User.findOne({ studentCode })) {
    studentCode = generateStudentCode();
  }

  user.studentCode = studentCode;
  await user.save();
  return user;
};

const formatUserResponse = async (user) => {
  const baseUser = user.toObject ? user.toObject() : user;
  let linkedParent = baseUser.linkedParent;

  if (linkedParent && typeof linkedParent === "object" && linkedParent.name) {
    return {
      ...baseUser,
      password: undefined,
      linkedParent: {
        _id: linkedParent._id,
        name: linkedParent.name,
        email: linkedParent.email,
        parentCode: linkedParent.parentCode
      }
    };
  }

  if (linkedParent) {
    const parent = await User.findById(linkedParent).select("name email parentCode");
    linkedParent = parent ? {
      _id: parent._id,
      name: parent.name,
      email: parent.email,
      parentCode: parent.parentCode
    } : null;
  }

  return {
    ...baseUser,
    password: undefined,
    role: normalizeRole(baseUser.role),
    roleLabel: normalizeRole(baseUser.role),
    isParent: isParentAccount(baseUser),
    studentCode: baseUser.studentCode || null,
    linkedParent: linkedParent || null
  };
};

export const registerUser = async (req, res) => {
  try {
    const { error } = registerValidator.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message
      });
    }

    const { name, email, password, role, isParent, gender, profileImage } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    // check existing user
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create user
    let user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizeRole(role),
      isParent: normalizeIsParent(role, isParent),
      gender: gender || "other",
      profileImage: profileImage || ""
    });

    user = await ensureParentCode(user);
    user = await ensureStudentCode(user);

    res.status(201).json({
      message: "User registered successfully",
      user: await formatUserResponse(user)
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }
};

export const loginUser = async (req, res) => {
  try {

    if (!req.body) {
      return res.status(400).json({
        message: "Request body missing"
      });
    }

    const { error } = loginValidator.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    if (!user.password) {
      return res.status(500).json({
        message: "User password not set"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    await ensureParentCode(user);
    await ensureStudentCode(user);

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      user: await formatUserResponse(user)
    });

  } catch (error) {

    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });

  }
};

export const linkParentByCode = async (req, res) => {
  try {
    const { parentCode } = req.body;

    if (!parentCode) {
      return res.status(400).json({
        message: "Parent code is required"
      });
    }

    if (!isStudentAccount(req.user)) {
      return res.status(403).json({
        message: "Only student accounts can link to a parent"
      });
    }

    const parent = await User.findOne({
      parentCode: parentCode.trim().toUpperCase(),
      isParent: true
    }).select("-password");

    if (!parent) {
      return res.status(404).json({
        message: "Invalid parent code"
      });
    }

    const child = await User.findById(req.user._id);

    if (child.linkedParent && child.linkedParent.toString() !== parent._id.toString()) {
      return res.status(403).json({
        message: "This student is already linked to another parent"
      });
    }

    child.linkedParent = parent._id;
    await child.save();

    await Promise.all([
      createNotification(child._id, "info", `Parent linked: ${parent.name}`),
      createNotification(parent._id, "info", `${child.name} connected as your student`)
    ]);

    res.json({
      message: "Parent linked successfully",
      user: await formatUserResponse({
        ...child.toObject(),
        linkedParent: {
          _id: parent._id,
          name: parent.name,
          email: parent.email,
          parentCode: parent.parentCode
        }
      })
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error"
    });
  }
};

export const linkStudentToParent = async (req, res) => {
  try {
    const { childEmail, childId, childCode } = req.body;

    if (!isParentAccount(req.user)) {
      return res.status(403).json({
        message: "Only parent accounts can connect to student accounts"
      });
    }

    if (!childEmail && !childId && !childCode) {
      return res.status(400).json({
        message: "Student email or secure student ID is required"
      });
    }

    const query = {
      role: { $in: ["student", "child"] }
    };

    if (childEmail) {
      query.email = childEmail.trim().toLowerCase();
    } else if (childCode) {
      query.studentCode = childCode.trim().toUpperCase();
    } else {
      query._id = childId.trim();
    }

    const child = await User.findOne(query);

    if (!child) {
      return res.status(404).json({
        message: "Student account not found"
      });
    }

    if (child.isParent || normalizeRole(child.role) !== "student") {
      return res.status(403).json({
        message: "Only student accounts can be linked"
      });
    }

    if (child.linkedParent && child.linkedParent.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "This student is already linked to another parent"
      });
    }

    child.linkedParent = req.user._id;
    await child.save();

    await Promise.all([
      createNotification(req.user._id, "info", `${child.name} connected to your parent dashboard`),
      createNotification(child._id, "info", `You are now linked to parent ${req.user.name}`)
    ]);

    res.json({
      message: "Student connected successfully",
      child: {
        _id: child._id,
        name: child.name,
        email: child.email,
        studentCode: child.studentCode
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error"
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    user.name = req.body.name ?? user.name;
    user.gender = req.body.gender ?? user.gender;
    user.profileImage = req.body.profileImage ?? user.profileImage;

    if (req.body.role) {
      user.role = normalizeRole(req.body.role);
    }

    if (user.role === "adult") {
      user.isParent = Boolean(req.body.isParent ?? user.isParent);
    } else {
      user.isParent = false;
    }

    await ensureParentCode(user);
    await ensureStudentCode(user);
    if (!user.isParent) {
      user.parentCode = undefined;
    }

    await user.save();

    res.json({
      message: "Profile updated",
      user: await formatUserResponse(user)
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error"
    });
  }
};
