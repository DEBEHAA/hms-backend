import mongoose from "mongoose";
import config from "../config/index.js";

const connectToDB = async () => {
  try {
    await mongoose.connect(config.DATABASE_URL);
    console.log("Connected to Database");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
  }
};

export default connectToDB;

