import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Connect using MONGO_URI and specify dbName option
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME, // specify DB here
    });

    console.log(
      `✅ MongoDB connected to database: ${conn.connection.db.databaseName} at ${conn.connection.host}`
    );
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

export default connectDB;
