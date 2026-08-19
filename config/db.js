import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rave-database';
  const connectionOptions = {
    serverSelectionTimeoutMS: 2500, // Timeout after 2.5s instead of hanging 30s
    connectTimeoutMS: 3000
  };

  try {
    const conn = await mongoose.connect(mongoURI, connectionOptions);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Atlas Connection Error: ${error.message}`);
    
    // Fallback attempt to local MongoDB if Atlas cluster is paused or DNS blocked
    if (!mongoURI.includes('127.0.0.1') && !mongoURI.includes('localhost')) {
      console.log('Attempting connection to local MongoDB fallback (mongodb://127.0.0.1:27017/rave-database)...');
      try {
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/rave-database', connectionOptions);
        console.log(`Local MongoDB Connected: ${localConn.connection.host}`);
        return;
      } catch (localErr) {
        console.error(`Local MongoDB also unavailable: ${localErr.message}`);
      }
    }
    
    // Disable query buffering when DB is offline so Mongoose queries fail-fast (0ms) instead of hanging 10 seconds
    mongoose.set('bufferCommands', false);
    console.log('⚠️ Server online in Fallback Mode (Query buffering disabled for instant response).');
  }
};

export default connectDB;
