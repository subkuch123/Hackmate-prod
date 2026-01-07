import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config({ path: "../config/config.env" });
import { OAuth2Client } from "google-auth-library";
import sendMail from "../utils/sendMail.js";
import { sendResponse, ErrorCodes } from "../utils/responseHandler.js";
import Otp from "../models/otp.model.js";
import {
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  AppError,
} from "../utils/appError.js";
import Hackathon from "../models/hackthon.model.js";
import bcryptjs from "bcryptjs";
import Task from "../models/TeamtaskBoard.model.js";
import Team from "../models/team.model.js";
import TeamMember from "../models/teamMember.model.js";
import Registration from "../models/Registration.js";

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = user.generateToken();

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    isEmailVerified: user.isEmailVerified,
    profilePicture: user.profilePicture,
    skills: user.skills,
    experience: user.experience,
    github: user.github,
    age: user.age,
    github: user.github,
    linkedin: user.linkedin,
    phone: user.phone,
    currentHackathonId: user.currentHackathonId,
    userType: user.userType,
    createdAt: user.createdAt,
    profileCompletion: user.profileCompletion,
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      data: { user: userData, token },
      message,
      errorCode: ErrorCodes.SUCCESS,
    });
};

// Helper function to send verification email
const sendVerificationEmail = async (user) => {
  try {
    const verificationToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const verificationURL = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    const message = `
      <h2>Email Verification</h2>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationURL}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>If you didn't create this account, please ignore this email.</p>
    `;

    // await sendMail({
    //   from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    //   to: user.email,
    //   subject: "Verify Your Email Address",
    //   html: message,
    // });
  } catch (error) {
    console.error("Email verification send error:", error);
    throw new AppError(
      "Failed to send verification email",
      500,
      ErrorCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const userData = req.body;
    const { email } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError(
        "User already exists with this email",
        400,
        ErrorCodes.DUPLICATE_ENTRY
      );
    }

    // Create new user first
    const user = await User.create({ ...userData });

    // Send welcome email
    const data = {
      user: { name: userData.name, email: userData.email },
      websiteLink: process.env.HOST_CLIENT_URL,
    };
    try {
      const mailRes = await sendMail({
        from: '"HackMate" <no-reply@hackmate.com>',
        email: userData.email,
        subject: "Mail from HackMate",
        data,
        template: "welcome_mail.ejs",
      });
      // If mail is not accepted, treat as failure
      // if (!mailRes || !mailRes.accepted || mailRes.accepted.length === 0) {
      //   // Delete the user if email sending fails
      //   await User.findByIdAndDelete(user._id);
      //   const messages =
      //     "Email sending failed. Please provide valid Email Id or Try again later.";
      //   const message2 = Object.values(error.errors).map((err) => err.message);
      //   const resultMessage = messages + "," + message2;
      //   return next(next(new ValidationError(resultMessage)));
      // }
      // Success: send token response
      sendTokenResponse(user, 201, res, "User registered successfully");
    } catch (error) {
      // Delete the user if email sending fails
      // await User.findByIdAndDelete(user._id);
      console.error("Email sending failed:", error);
      const messages =
        "Email sending failed. Please provide valid Email Id or Try again later.";
      const message2 = Object.values(error.errors).map((err) => err.message);
      const resultMessage = messages + "," + message2;
      return next(next(new ValidationError(resultMessage)));
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      next(new ValidationError(messages.join(", ")));
    } else {
      next(error);
    }
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new ValidationError("Please provide email and password");
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Check if account is active
    if (!user.isActive) {
      throw new UnauthorizedError("Account has been deactivated");
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid Password");
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // if (user.currentHackathonId) {
    //   const hackathon = await Hackathon.findById(user.currentHackathonId);
    //   if (!hackathon) {
    //     user.currentHackathonId = null;
    //     await user.save({ validateBeforeSave: false });
    //   }
    // }

    // if (user.currentHackathonId) {
    //   const hackathon = await Hackathon.findById(user.currentHackathonId);
    //   if (!hackathon) {
    //     user.currentHackathonId = null;
    //     await user.save({ validateBeforeSave: false });
    //   } else {
    //     const now = new Date();
    //     // If hackathon is not active, completed, cancelled, or past end date, clear currentHackathonId
    //     if (
    //       !hackathon.isActive ||
    //       ["completed", "cancelled"].includes(hackathon.status) ||
    //       now > hackathon.endDate
    //     ) {
    //       user.currentHackathonId = null;
    //     } else if (
    //       hackathon.isActive &&
    //       hackathon.status === "registration_open" &&
    //       now >= hackathon.registrationDeadline &&
    //       now <= hackathon.endDate
    //     ) {
    //       user.currentHackathonId = hackathon._id;
    //     }
    //     await user.save({ validateBeforeSave: false });
    //   }
    // }

    sendTokenResponse(user, 200, res, "Login successful");
  } catch (error) {
    next(error);
  }
};

// @desc    Google OAuth login
// @route   POST /api/auth/google
// @access  Public
const generateValidPassword = () => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*()_+-=";

  // Ensure at least one character from each category
  let password = [
    uppercase[Math.floor(Math.random() * uppercase.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    special[Math.floor(Math.random() * special.length)],
  ].join("");

  // Fill the rest with random characters
  const allChars = uppercase + lowercase + numbers + special;
  for (let i = password.length; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};
export const googleAuth = async (req, res, next) => {
  try {
    const { email, displayName, photoURL, email_verified } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      // Update last login + verify email if needed
      user.lastLogin = new Date();
      if (!user.isEmailVerified && email_verified) {
        user.isEmailVerified = true;
      }
      if (
        photoURL &&
        (!user.profilePicture || user.profilePicture.includes("default-avatar"))
      ) {
        user.profilePicture = photoURL;
      }
      await user.save({ validateBeforeSave: false });
    } else {
      // Create new user (password will be auto-hashed in pre-save)
      const randomPassword =
        displayName.split(" ")[0].charAt(0).toUpperCase() +
        displayName.split(" ")[0].slice(1) +
        "@123";
      // const randomPassword = generateValidPassword();
      user = await User.create({
        name: displayName,
        email,
        password: randomPassword,
        isEmailVerified: email_verified,
        profilePicture:
          photoURL ||
          "https://static.vecteezy.com/system/resources/previews/054/078/735/non_2x/gamer-avatar-with-headphones-and-controller-vector.jpg",
        lastLogin: new Date(),
      });
    }

    sendTokenResponse(user, 200, res, "Google authentication successful");
  } catch (error) {
    console.error(error);
    next(error);
  }
};
// export const googleAuth = async (req, res, next) => {
//   try {
//     const { credential } = req.body;

//     if (!credential) {
//       throw new ValidationError("Google credential is required");
//     }

//     // Verify Google token
//     const ticket = await googleClient.verifyIdToken({
//       idToken: credential,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();
//     const { email, name, picture, email_verified } = payload;

//     // Check if user exists
//     let user = await User.findOne({ email });

//     if (user) {
//       // Update last login
//       user.lastLogin = new Date();
//       if (!user.isEmailVerified && email_verified) {
//         user.isEmailVerified = true;
//       }
//       if (
//         picture &&
//         (!user.profilePicture || user.profilePicture === "default-avatar.png")
//       ) {
//         user.profilePicture = picture;
//       }
//       await user.save({ validateBeforeSave: false });
//     } else {
//       // Create new user
//       user = await User.create({
//         name,
//         email,
//         password: crypto.randomBytes(32).toString("hex"), // Random password for Google users
//         isEmailVerified: email_verified,
//         profilePicture: picture || "default-avatar.png",
//         lastLogin: new Date(),
//       });
//     }
//     sendTokenResponse(user, 200, res, "Google authentication successful");
//   } catch (error) {
//     next(error);
//   }
// };

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Include profile completion percentage from virtual field
    const userWithCompletion = user.toJSON();
    userWithCompletion.profileCompletion = user.profileCompletion;

    sendResponse(
      res,
      200,
      { user: userWithCompletion },
      "User retrieved successfully",
      ErrorCodes.SUCCESS
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      "name",
      "username",
      "age",
      "skills",
      "experience",
      "github",
      "linkedin",
      "twitter",
      "phone",
      "collegeName",
      "website",
      "profilePicture",
      "bio",
      "location",
    ];

    const updates = {};

    // Filter allowed fields and handle empty values properly
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        // Handle empty strings for optional fields
        if (req.body[key] === "" || req.body[key] === null) {
          updates[key] = undefined;
        } else {
          updates[key] = req.body[key];
        }
      }
    });

    // Validate skills array length
    if (updates.skills && updates.skills.length > 20) {
      throw new ValidationError("Cannot have more than 20 skills");
    }

    // Validate bio length
    if (updates.bio && updates.bio.length > 500) {
      throw new ValidationError("Bio cannot exceed 500 characters");
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    // Include profile completion percentage in response
    const updatedUser = user.toJSON();
    updatedUser.profileCompletion = user.profileCompletion;

    sendResponse(
      res,
      200,
      { user: updatedUser },
      "Profile updated successfully",
      ErrorCodes.SUCCESS
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      next(new ValidationError(messages.join(", ")));
    } else if (error.code === 11000) {
      // Handle duplicate key errors (e.g., duplicate email or username)
      const field = Object.keys(error.keyValue)[0];
      next(new ValidationError(`${field} already exists`));
    } else {
      next(error);
    }
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new ValidationError(
        "Please provide current password, new password, and confirmation"
      );
    }

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      throw new ValidationError("New passwords do not match");
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    // Check if new password is same as current password
    const isSameAsCurrent = await user.comparePassword(newPassword);
    if (isSameAsCurrent) {
      throw new ValidationError(
        "New password cannot be the same as current password"
      );
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Log the user out from all devices by generating a new token?
    // This would require additional implementation if needed

    sendResponse(
      res,
      200,
      null,
      "Password changed successfully",
      ErrorCodes.SUCCESS
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      next(new ValidationError(messages.join(", ")));
    } else {
      next(error);
    }
  }
};

// @desc    Upload profile picture
// @route   POST /api/auth/upload-avatar
// @access  Private
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ValidationError("Please upload an image file");
    }

    // Validate file type
    if (!req.file.mimetype.startsWith("image/")) {
      throw new ValidationError("Please upload an image file");
    }

    // Validate file size (5MB limit)
    if (req.file.size > 5 * 1024 * 1024) {
      throw new ValidationError("Image size must be less than 5MB");
    }

    // In a real implementation, you would upload to cloud storage (AWS S3, Cloudinary, etc.)
    // and get the URL. For simulation, we'll use the file path or a mock URL
    let avatarUrl;

    if (process.env.NODE_ENV === "production") {
      // Production: Upload to cloud storage and get URL
      // avatarUrl = await uploadToCloudStorage(req.file);
      avatarUrl = `https://your-cloud-storage.com/avatars/${
        req.user.id
      }/${Date.now()}-${req.file.originalname}`;
    } else {
      // Development: Use local path or mock URL
      avatarUrl = `/uploads/avatars/${req.user.id}/${req.file.filename}`;
    }

    // Update user's profile picture
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: avatarUrl },
      { new: true, runValidators: true }
    );

    const updatedUser = user.toJSON();
    updatedUser.profileCompletion = user.profileCompletion;

    sendResponse(
      res,
      200,
      {
        user: updatedUser,
        avatarUrl,
      },
      "Profile picture uploaded successfully",
      ErrorCodes.SUCCESS
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      next(new ValidationError(messages.join(", ")));
    } else {
      next(error);
    }
  }
};

// @desc    Remove profile picture
// @route   DELETE /api/auth/remove-avatar
// @access  Private
export const removeAvatar = async (req, res, next) => {
  try {
    const defaultAvatar =
      "https://static.vecteezy.com/system/resources/previews/054/078/735/non_2x/gamer-avatar-with-headphones-and-controller-vector.jpg";

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: defaultAvatar },
      { new: true, runValidators: true }
    );

    const updatedUser = user.toJSON();
    updatedUser.profileCompletion = user.profileCompletion;

    sendResponse(
      res,
      200,
      { user: updatedUser },
      "Profile picture removed successfully",
      ErrorCodes.SUCCESS
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Update privacy settings
// @route   PUT /api/auth/privacy-settings
// @access  Private
export const updatePrivacySettings = async (req, res, next) => {
  try {
    const allowedFields = ["showEmail", "showPhone"];

    const updates = {};

    // Filter allowed fields
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // In a real implementation, you might want to store privacy settings
    // in a separate collection or as a subdocument
    // For now, we'll assume these are stored in the user model

    // This would require adding these fields to your User schema:
    // privacy: {
    //   showEmail: { type: Boolean, default: true },
    //   showPhone: { type: Boolean, default: true }
    // }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { privacy: updates } },
      { new: true, runValidators: true }
    );

    sendResponse(
      res,
      200,
      { privacySettings: user.privacy },
      "Privacy settings updated successfully",
      ErrorCodes.SUCCESS
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      next(new ValidationError(messages.join(", ")));
    } else {
      next(error);
    }
  }
};

// @desc    Update social links
// @route   PUT /api/auth/social-links
// @access  Private
export const updateSocialLinks = async (req, res, next) => {
  try {
    const { github, linkedin, twitter } = req.body;
    const updates = {};

    // Helper: Normalize URL or username to full valid URL
    const normalizeLink = (input, baseUrl, prefix = "") => {
      if (!input) return null;
      const trimmed = input.trim();

      // If it's already a valid URL, return as-is
      if (/^https?:\/\//i.test(trimmed)) return trimmed;

      // If it starts with '@', remove it
      const username = trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;

      // Construct full URL
      return `${baseUrl}${prefix}${username}`;
    };

    // Normalize each field
    if (github) updates.github = normalizeLink(github, "https://github.com/");
    if (linkedin)
      updates.linkedin = normalizeLink(linkedin, "https://linkedin.com/in/");
    if (twitter)
      updates.twitter = normalizeLink(twitter, "https://twitter.com/");

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    const updatedUser = user.toJSON();
    updatedUser.profileCompletion = user.profileCompletion;

    sendResponse(
      res,
      200,
      { user: updatedUser },
      "Social links updated successfully",
      ErrorCodes.SUCCESS
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      next(new ValidationError(messages.join(", ")));
    } else {
      next(error);
    }
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
// BODy - {email}

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit
};
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ValidationError("Please provide email address");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new NotFoundError("User not found with this email");
    }

    // Generate reset token
    // const resetToken =
    // await user.save({ validateBeforeSave: false });

    // Send reset email
    // const resetURL = `${req.protocol}://${req.get(
    //   "host"
    // )}/api/auth/reset-password/${resetToken}`;

    // const message = `
    //   <h2>Password Reset Request</h2>
    //   <p>You requested a password reset. Click the link below to reset your password:</p>
    //   <a href="${resetURL}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
    //   <p>This link will expire in 10 minutes.</p>
    //   <p>If you didn't request this, please ignore this email.</p>
    // `;

    const otpCode = generateOTP();
    const expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes

    const data = {
      otp: otpCode,
      user: { name: user.name, email: user.email },
    };

    try {
      await sendMail({
        from: '"HackMate" <no-reply@hackmate.com>',
        email: user.email,
        subject: "Mail from HackMate",
        data,
        template: "forgot_mail.ejs",
      });
    } catch (error) {
      console.error("Email sending failed:", error);
      return next(
        new AppError(
          "Please provide a valid email address.",
          400,
          ErrorCodes.VALIDATION_ERROR
        )
      );
    }

    // save otp
    await Otp.create({
      user: user._id,
      email,
      otp: otpCode,
      otpExpire: expiryTime,
    });

    // TODO: send OTP via mail/SMS
    res.json({
      success: true,
      message: `Otp send Successfully to your ${email} mail id.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify  otp
// @route   POST /api/auth/verify-otp
// @access  Public
// BODy - {email, otp}
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      throw new ValidationError("Please provide email and OTP");
    }
    const otpRecord = await Otp.findOne({ email, otp }).sort({ createdAt: -1 }); // Get the latest OTP record
    if (!otpRecord) {
      throw new ValidationError("Invalid OTP");
    }
    const otpExpire = otpRecord.otpExpire;
    if (otpExpire < Date.now()) {
      throw new ValidationError("OTP has expired");
    }
    otpRecord.isVerified = true;
    await otpRecord.save();
    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      errorCode: ErrorCodes.SUCCESS,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public

// @desc    Reset password
// @route   PUT /api/auth/reset-password/
// @access  Public
// BODy - {email, otp, newPassword}

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      throw new ValidationError("Please provide email, OTP and new password");
    }
    // Prevent NoSQL injection by verifying email is a string
    if (typeof email !== "string") {
      throw new ValidationError("Email must be a string");
    }
    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord) {
      throw new ValidationError("Invalid OTP");
    }
    if (!otpRecord.isVerified) {
      throw new ValidationError("OTP not verified");
    }
    const otpExpire = otpRecord.otpExpire;
    if (otpExpire < Date.now()) {
      throw new ValidationError("OTP has expired");
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new ValidationError("User not found");
    }
    await Otp.deleteMany({ email });
    user.isEmailVerified = true;
    user.password = newPassword;
    user.lastLogin = new Date();

    // if (user.currentHackathonId) {
    //   const hackathon = await Hackathon.findById(user.currentHackathonId);
    //   if (!hackathon) {
    //     user.currentHackathonId = null;
    //     await user.save({ validateBeforeSave: false });
    //   } else {
    //     const now = new Date();
    //     // If hackathon is not active, completed, cancelled, or past end date, clear currentHackathonId
    //     if (
    //       !hackathon.isActive ||
    //       ["completed", "cancelled"].includes(hackathon.status) ||
    //       now > hackathon.endDate
    //     ) {
    //       user.currentHackathonId = null;
    //     } else if (
    //       hackathon.isActive &&
    //       hackathon.status === "registration_open" &&
    //       now >= hackathon.registrationDeadline &&
    //       now <= hackathon.endDate
    //     ) {
    //       user.currentHackathonId = hackathon._id;
    //     }
    //     await user.save({ validateBeforeSave: false });
    //   }
    // }
    await user.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
      message: "Reset Password successfully",
      errorCode: ErrorCodes.SUCCESS,
    });
    // sendTokenResponse(user, 200, res, "Successfully reset password");
  } catch (error) {
    next(error);
  }
};

// export const resetPassword = async (req, res, next) => {
//   try {
//     const { token } = req.params;
//     const { password } = req.body;

//     if (!password) {
//       throw new ValidationError("Please provide new password");
//     }

//     // Hash the token to compare with stored hash
//     const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

//     const user = await User.findOne({
//       resetPasswordToken: hashedToken,
//       resetPasswordExpires: { $gt: Date.now() },
//     });

//     if (!user) {
//       throw new UnauthorizedError("Invalid or expired reset token");
//     }

//     // Set new password
//     user.password = password;
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;
//     await user.save();

//     sendTokenResponse(user, 200, res, "Password reset successful");
//   } catch (error) {
//     if (error.name === "ValidationError") {
//       const messages = Object.values(error.errors).map((err) => err.message);
//       next(new ValidationError(messages.join(", ")));
//     } else {
//       next(error);
//     }
//   }
// };

// @desc    Send email verification
// @route   POST /api/auth/send-verification
// @access  Private
export const sendEmailVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.isEmailVerified) {
      throw new ValidationError("Email is already verified");
    }

    await sendVerificationEmail(user);

    sendResponse(res, 200, null, "Verification email sent", ErrorCodes.SUCCESS);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    // In a real app, you'd want to use a proper email verification token
    // For simplicity, using JWT here
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new UnauthorizedError("Invalid verification token");
    }
    console.log("user", user);

    user.isEmailVerified = true;

    // Check and update currentHackathonId status
    // if (user.currentHackathonId) {
    //   const hackathon = await Hackathon.findById(user.currentHackathonId);
    //   if (!hackathon) {
    //     user.currentHackathonId = null;
    //   } else {
    //     const now = new Date();
    //     if (
    //       !hackathon.isActive ||
    //       ["completed", "cancelled"].includes(hackathon.status) ||
    //       now > hackathon.endDate
    //     ) {
    //       user.currentHackathonId = null;
    //     } else if (
    //       hackathon.isActive &&
    //       hackathon.status === "registration_open" &&
    //       now >= hackathon.registrationDeadline &&
    //       now <= hackathon.endDate
    //     ) {
    //       user.currentHackathonId = hackathon._id;
    //     }
    //   }
    // }

    await user.save({ validateBeforeSave: false });

    sendResponse(
      res,
      200,
      null,
      "Email verified successfully",
      ErrorCodes.SUCCESS
    );
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new UnauthorizedError("Verification token has expired");
    } else if (error.name === "JsonWebTokenError") {
      throw new UnauthorizedError("Invalid verification token");
    }
    next(error);
  }
};

// @desc    Verify profile
// @route   GET /api/auth/verify
// @access  Private
export const verifyingProfile = async (req, res, next) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: user not found in request" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let hackathon = null;
    let team = null;
    let teamMember = null;
    let registration = null;

    // -------------------------
    // If user has active hackathon
    // -------------------------
    if (user.currentHackathonId) {
      hackathon = await Hackathon.findById(user.currentHackathonId);

      // ❌ Hackathon does not exist → cleanup
      if (!hackathon) {
        team = await Team.findOne({
          hackathonId: user.currentHackathonId,
          teamMember: { $in: [userId] },
        });

        if (team) {
          teamMember = await TeamMember.findOne({
            userId,
            teamId: team._id,
          });

          if (teamMember) await TeamMember.deleteOne({ _id: teamMember._id });
          await Team.deleteOne({ _id: team._id });
        }

        user.currentHackathonId = null;
        await user.save({ validateBeforeSave: false });

        sendResponse(
          res,
          200,
          {
            user,
            userId: user._id,
            hackathonId: null,
            teamId: null,
            teamMemberId: null,
            registrationId: null,
          },
          "Token verification successful",
          ErrorCodes.SUCCESS
        );
        // return res.status(404).json({
        //   message: "Hackathon not found. User and team cleaned up.",
        // });
      }

      // -------------------------
      // Find team
      // -------------------------
      team = await Team.findOne({
        hackathonId: hackathon._id,
        teamMember: { $in: [userId] },
      });

      // -------------------------
      // Find team member
      // -------------------------
      if (team) {
        teamMember = await TeamMember.findOne({
          userId,
          teamId: team._id,
        });
      }

      // -------------------------
      // Find registration
      // -------------------------
      registration = await Registration.findOne({
        email: user.email,
        hackathonId: hackathon._id,
      });

      await user.save({ validateBeforeSave: false });
    }

    // -------------------------
    // Final response
    // -------------------------
    sendResponse(
      res,
      200,
      {
        user,
        userId: user._id,
        hackathonId: hackathon?._id || null,
        teamId: team?._id || null,
        teamMemberId: teamMember?._id || null,
        registrationId: registration?._id || null,
      },
      "Token verification successful",
      ErrorCodes.SUCCESS
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    res.cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    sendResponse(res, 200, null, "Logged out successfully", ErrorCodes.SUCCESS);
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate account
// @route   PUT /api/auth/deactivate
// @access  Private
export const deactivateAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    user.isActive = false;
    await user.save({ validateBeforeSave: false });

    res.cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    sendResponse(
      res,
      200,
      null,
      "Account deactivated successfully",
      ErrorCodes.SUCCESS
    );
  } catch (error) {
    next(error);
  }
};
