import mongoose from "mongoose";
const { Schema } = mongoose;

const peopleJoinedSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hackathonId: {
      type: Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: String,
    registrationId: {
      type: Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["joined", "left", "removed"],
      default: "joined",
    },
    paid: {
        type: Boolean,
        default: false,
    },
    
  },
  {
    timestamps: true,
  }
);

const PeopleJoined = mongoose.model("PeopleJoined", peopleJoinedSchema);

export default PeopleJoined;
