import mongoose from 'mongoose';

let cached = null;

const connectDB = async () => {
  // Reuse existing connection (important for Lambda warm starts)
  if (cached && mongoose.connection.readyState === 1) {
    return cached;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    cached = conn;
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // In Lambda, don't exit the process — let the invocation fail gracefully
    if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
      throw error;
    }
    process.exit(1);
  }
};

export default connectDB;
