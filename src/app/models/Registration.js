import mongoose from 'mongoose';
const { Schema } = mongoose;

const registrationSchema = new Schema(
  {
    amountPaid: {
      type: Number,
      required: true,
    },

    amountTotal: {
      type: Number,
      required: true,
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: 'BrandReg',
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },

    invoiceNumber: {
      type: String,
      required: true,
    },
    invoiceStatus: {
      type: String,

      default: 'unpaid',
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
      default: 'system',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Registration ||
  mongoose.model('Registration', registrationSchema);
