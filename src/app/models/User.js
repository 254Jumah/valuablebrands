import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
    },
    idNumber: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"],
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    county: {
      type: String,
      required: true,
    },
    graduationYear: {
      type: Number,
      required: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    currentEmployer: {
      type: String,
      required: true,
    },
    occupation: {
      type: String,
      required: true,
    },
    membershipCategory: {
      type: String,
      required: true,
      enum: ["associate", "full", "student", "honorary"],
    },
    passportPhoto: {
      type: String,
      required: true,
    },
    registeredByAdmin: {
      type: Boolean,
      default: false,
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    membershipNumber: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      default: "Active",
    },
    role: {
      type: String,
      default: "member",
    },
    contributions: {
      type: Map,
      of: [
        {
          amount: Number,
          date: Date,
          description: String,
          recordedBy: String,
          modeOfPayment: String,
          paymentReference: String,
        },
      ],
      default: {},
    },

   loans: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Loan",
  },
],

  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
