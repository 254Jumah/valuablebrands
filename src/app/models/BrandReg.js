import mongoose from 'mongoose';

const BrandregSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true },
    category: { type: String, required: true },
    website: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    status: { type: String, required: true },
    tags: [String],
    notes: String,

    primaryContactName: { type: String, required: true },
    primaryContactTitle: String,
    primaryContactEmail: { type: String, required: true },
    primaryContactPhone: { type: String, required: true },

    secondaryContactEnabled: { type: Boolean, default: false },
    secondaryContactName: String,
    secondaryContactEmail: String,
    secondaryContactPhone: String,
    secondaryContactTitle: String,

    recordedBy: { type: String, required: true },
  },
  { timestamps: true }
);
export default mongoose.models.BrandReg ||
  mongoose.model('BrandReg', BrandregSchema);
