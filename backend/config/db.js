import mongoose from 'mongoose';
import dns from 'dns';

const connectDB = async () => {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
