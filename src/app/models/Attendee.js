import mongoose from 'mongoose';

const { Schema } = mongoose;
const AttendeeSchema = new Schema(
  {
    registrationId: {
      type: Schema.Types.ObjectId,
      ref: 'Registration',
      required: true,
    }, // Links to the brand's registration
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: 'BrandReg',
      required: true,
    },

    // Individual attendee details
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    jobTitle: { type: String },

    // Check-in tracking
    status: {
      type: String,
      enum: ['Registered', 'Checked-In', 'No-Show', 'Walk-In'],
      default: 'Registered',
    },
    checkedInAt: { type: Date },
    checkedInBy: { type: String },

    // Table assignment
    tableNumber: { type: String },

    // Walk-in specific
    isWalkIn: { type: Boolean, default: false },
    walkInFee: { type: Number },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Attendee ||
  mongoose.model('Attendee', AttendeeSchema);
