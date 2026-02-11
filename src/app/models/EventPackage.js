import mongoose from 'mongoose';

const PackageSchema = new mongoose.Schema(
  {
    benefits: {
      type: [String],
      required: true, // optional
    },

    name: { type: String, required: true },
    price: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    includedPax: { type: Number, required: true },
  },
  { timestamps: true }
);
export default mongoose.models.EventPackage ||
  mongoose.model('EventPackage', PackageSchema);
