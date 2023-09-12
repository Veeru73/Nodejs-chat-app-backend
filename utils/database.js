const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      socketTimeoutMS: 300000,
    });
    console.log(`Mongodb connected: ${connect.connection.host}`);
  } catch (error) {
    console.log(`ERROR::Database connection failed :${error}`);
  }
};
module.exports = connectDB;
