import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    featured: { type: Boolean, default: false },
    category: { type: String, required: true },
    time: { type: String, required: true },
    recordedBy: { type: String, required: true },
    status: { type: String, required: true },
    image: { type: String, required: false },
    capacity: { type: Number, required: true },
  },
  { timestamps: true }
);
export default mongoose.models.Event || mongoose.model('Event', EventSchema);
