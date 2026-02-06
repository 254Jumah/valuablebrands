import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BrandReg',
      required: true,
    },
    evbentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    Amount: { type: Number, required: true },
    Date: { type: Date, required: true },
    recordedBy: { type: String, required: true },
    PaymentMethod: { type: String, required: true },
    invoiceNumber: {
      type: String,
      required: true,
    },
    payments: [
      {
        amount: Number,
        date: Date,
        method: String,
        reference: String,
        recordedBy: String,
      },
    ],
    invoiceStatus: {
      type: String,

      default: 'unpaid',
    },
    packageTier: {
      type: String,
      required: true,
    },
    pax: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);
export default mongoose.models.Invoice ||
  mongoose.model('Invoice', InvoiceSchema);
