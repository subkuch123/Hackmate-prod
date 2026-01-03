import Hackathon from "../models/hackthon.model.js";
import PeopleJoined from "../models/peopleJoined.model.js";
import Registration from "../models/Registration.js";
import User from "../models/user.model.js";
import { uploadImage } from "../utils/uploadImage.js";

// Get all registrations with filters and pagination
export const getRegistrations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      hackathonId = "",
      status = "",
      paymentMethod = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { hackathonId: { $regex: search, $options: "i" } },
      ];
    }

    if (hackathonId && hackathonId !== "all") {
      filter.hackathonId = hackathonId;
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    if (paymentMethod && paymentMethod !== "all") {
      filter.paymentMethod = paymentMethod;
    }

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query with population
    const registrations = await Registration.find(filter)
      .populate("orderId", "orderId isActive")
      .sort(sortConfig)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count for pagination
    const total = await Registration.countDocuments(filter);

    // Get unique hackathon IDs for filter dropdown
    const uniqueHackathonIds = await Registration.distinct(
      "hackathonId",
      filter
    );

    res.json({
      registrations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      uniqueHackathonIds,
    });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update registration status or verification
export const updateRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isVerified } = req.body;

    // Build update object
    const updateFields = {};
    if (status !== undefined) updateFields.status = status;
    if (isVerified !== undefined) updateFields.isVerified = isVerified;

    const updatedRegistration = await Registration.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate("orderId", "orderId isActive");

    if (!updatedRegistration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    res.json(updatedRegistration);
  } catch (error) {
    console.error("Error updating registration:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const qrRegistrationUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    // Upload to Cloudinary
    const uploadedImage = await uploadImage(req.file.path);

    const {
      amount,
      currency = "INR",
      name,
      email,
      phone,
      hackathonId,
      utrNumber,
      whatsapp,
    } = req.body;

    // Validate required fields
    if (!amount || !name || !email || !hackathonId) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    await Registration.updateMany(
      { email, hackathonId },
      { $set: { isActive: false } }
    );

    // Create a new registration record
    const registration = await Registration.create({
      screenShot: uploadedImage.url,
      paymentId: uploadedImage.public_id,
      amount,
      currency,
      name,
      email,
      phone,
      utrNumber,
      status: "pending", // match frontend status
      paymentMethod: "qrcode",
      hackathonId,
      whatsapp,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "QR payment uploaded successfully. Awaiting verification.",
      orderId: registration._id, // frontend expects orderId
      data: registration,
    });
  } catch (error) {
    console.error("QR upload error:", error);

    // Handle duplicate registration (unique hackathonId + email)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          "You have already registered for this hackathon with this email.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to upload QR code. Please try again.",
    });
  }
};

function generate15DigitUniqueId(keyword, email) {
  const now = new Date().toISOString(); // date + time
  const rawString = `${keyword}|${email}|${now}`;

  // Simple hash using Web Crypto API
  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  const hashValue = hashString(rawString);

  // Ensure 15 digits
  const uniqueId = (Date.now().toString() + hashValue.toString())
    .replace(/\D/g, '')
    .slice(0, 15);

  return uniqueId;
}

export const freeRegistration = async (req, res) => {
  try {
    

    const {
      amount,
      currency = "INR",
      name,
      email,
      collegeName,
      phone,
      hackathonId,
      whatsapp,
    } = req.body;
    console.log("Free registration data:", req.body);
    // Validate required fields
    if (!amount || !name || !email || !collegeName || !phone || !hackathonId) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    await Registration.updateMany(
      { email, hackathonId },
      { $set: { isActive: false } }
    );

    // Create a new registration record
    const registration = await Registration.create({
      paymentId: generate15DigitUniqueId(`CODEYUDH`, email),
      amount,
      currency,
      name,
      email,
      collegeName,
      phone,
      status: "pending", // match frontend status
      paymentMethod: "free",
      hackathonId,
      whatsapp,
      isActive: true,
    });

    if(collegeName){
      await User.updateOne(
        { email },
        { $set: { collegeName } }
      );
    }

    res.status(201).json({
      success: true,
      message: "Registration successfully. Awaiting verification.",
      orderId: registration._id, // frontend expects orderId
      data: registration,
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle duplicate registration (unique hackathonId + email)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          "You have already registered for this hackathon with this email.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to upload QR code. Please try again.",
    });
  }
};
// controllers/hackathonController.js
export const joinUserIntoHackathon = async (req, res) => {
  try {
    const { registrationId } = req.params;

    // 1️⃣ Fetch registration record
    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res
        .status(404)
        .json({ status: false, message: "Registration not found" });
    }
    // console.log("Registration found:", registration);
    // 2️⃣ Fetch user
    const user = await User.findOne({ email: registration.email });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // 3️⃣ Fetch hackathon by hackathonId (not _id)
    const hackathon = await Hackathon.findOne({
      hackathonId: registration.hackathonId,
    });
    if (!hackathon) {
      return res
        .status(404)
        .json({ status: false, message: "Hackathon not found" });
    }

    // 4️⃣ Check registration eligibility
    if (!registration.isActive) {
      return res
        .status(400)
        .json({ status: false, message: "Registration is not active" });
    }

    if (!registration.isVerified) {
      return res
        .status(400)
        .json({ status: false, message: "Registration not verified yet" });
    }

    if (registration.status !== "registered") {
      return res
        .status(400)
        .json({ status: false, message: "Registration is not completed" });
    }

    if (registration.isJoined) {
      return res
        .status(400)
        .json({ status: false, message: "User already joined" });
    }

    // 5️⃣ Check hackathon capacity
    if (
      hackathon.maxRegistrations &&
      hackathon.totalMembersJoined >= hackathon.maxRegistrations
    ) {
      return res.status(400).json({
        status: false,
        message: "Hackathon has reached maximum registrations",
      });
    }

    // 6️⃣ Prevent duplicate join entries
    const existingJoin = await PeopleJoined.findOne({
      userId: user._id,
      hackathonId: hackathon._id,
      status: "joined",
    });
    if (existingJoin) {
      return res.status(400).json({
        status: false,
        message: "User already joined this hackathon",
      });
    }

    // 7️⃣ Add user to PeopleJoined
    const joinedRecord = await PeopleJoined.create({
      userId: user._id,
      hackathonId: hackathon._id,
      name: registration.name,
      email: registration.email,
      phone: registration.phone,
      registrationId: registration._id,
      status: "joined",
      paid: true,
    });

    // 8️⃣ Safely add user to participants
    if (!hackathon.participants.includes(user._id)) {
      hackathon.participants.push(user._id);
    }

    hackathon.totalMembersJoined = hackathon.participants.length;
    await hackathon.save();

    // 9️⃣ Update registration and user
    registration.isJoined = true;
    await registration.save();

    if (!user.currentHackathonId) {
      user.currentHackathonId = hackathon._id;
      await user.save();
    }

    // 🔟 Send response
    return res.status(201).json({
      status: true,
      message: "User successfully joined hackathon",
      data: {
        joinedRecord,
        hackathonId: hackathon.hackathonId,
        totalMembersJoined: hackathon.totalMembersJoined,
      },
    });
  } catch (error) {
    console.error("Error joining user into hackathon:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};
