import mongoose from "mongoose";

let isConnected = false; // global connection flag

const connect = async () => {
  if (isConnected) {
    console.log("✅ MongoDB already connected.");
    return;
  }

  if (mongoose.connection.readyState >= 1) {
    isConnected = true;
    console.log("✅ MongoDB connection already established.");
    return;
  }

  try {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGODB_URL;

    if (!mongoURI) {
      throw new Error(
        "❌ MongoDB URI is not defined. Please add MONGODB_URI to your .env.local file"
      );
    }

    console.log(
      "🔗 Attempting MongoDB connection with URI:",
      mongoURI.substring(0, 20) + "..."
    );

    await mongoose.connect(mongoURI);
    isConnected = true;
    console.log("✅ MongoDB connection established successfully.");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    throw new Error("Error connecting to Mongoose");
  }
};

export default connect;
