const mongoose = require("mongoose");

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const connectDb = async () => {
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is not configured");
  }

  let retryDelay = 2000;
  while (true) {
    try {
      await mongoose.connect(process.env.MONGO_URL, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log("MongoDb Connected");
      return;
    } catch (err) {
      console.error(
        `MongoDB connection failed; retrying in ${retryDelay / 1000}s:`,
        err.message,
      );
      await wait(retryDelay);
      retryDelay = Math.min(retryDelay * 2, 30000);
    }
  }
};
module.exports = connectDb;