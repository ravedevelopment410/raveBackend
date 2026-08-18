import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rave-database';
  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Atlas Connection Error: ${error.message}`);
    
    // Fallback attempt to local MongoDB if Atlas cluster is paused or DNS blocked
    if (mongoURI !== 'mongodb://127.0.0.1:27017/rave-database') {
      console.log('Attempting connection to local MongoDB fallback (mongodb://127.0.0.1:27017/rave-database)...');
      try {
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/rave-database');
        console.log(`Local MongoDB Connected: ${localConn.connection.host}`);
        return;
      } catch (localErr) {
        console.error(`Local MongoDB also unavailable: ${localErr.message}`);
      }
    }
    
    console.log('⚠️ Server will stay online, but database features require an active MongoDB connection.');
  }
};

export default connectDB;
