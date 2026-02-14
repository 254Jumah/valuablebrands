import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BrandReg',
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
      required: true,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EventPackage',
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    totalAmount: { type: Number, required: true },

    invoiceDate: { type: Date, required: true },
    recordedBy: { type: String, required: true },

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
  },
  { timestamps: true }
);
export default mongoose.models.Invoice ||
  mongoose.model('Invoice', InvoiceSchema);
