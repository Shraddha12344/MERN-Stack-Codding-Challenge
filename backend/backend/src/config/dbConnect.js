import mongoose from "mongoose";
import { config } from "./config";

const dbConnect = async () => {
  const connection = await mongoose.connect(config.mongoUri);
  if (connection) {
    console.log("connected to db");
  } else {
    console.log("not connected to db");
  }
};

export default dbConnect;
