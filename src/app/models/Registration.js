import mongoose from 'mongoose';
const { Schema } = mongoose;

const registrationSchema = new Schema(
  {
    brandId: {
      type: Schema.Types.ObjectId,
      ref: 'BrandReg',
      required: true,
    },

    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },

    notes: {
      type: String,
      default: null,
    },

    packageTier: {
      type: String,
      required: true,
    },
    pax: {
      type: Number,
      required: true,
    },
    registrationStatus: {
      type: String,
      required: true,
    },
    recordedBy: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Registration ||
  mongoose.model('Registration', registrationSchema);
