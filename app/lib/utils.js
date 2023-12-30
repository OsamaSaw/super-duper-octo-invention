import mongoose from "mongoose";
import {ErrorLog, Log, Product} from "@/app/lib/models";
import { auth } from "@/app/auth";

const connection = {};

export const connectToDB = async () => {
  try {
    if (connection.isConnected) return;
    const db = await mongoose.connect(process.env.MONGO);
    connection.isConnected = db.connections[0].readyState;
  } catch (error) {
    console.log(error)
    throw new Error(error);
  }
};

export const logChange = async (action, document) =>{
  const { user } = await auth();
  const changeDetails = {
    // Customize this based on what you want to log
    before: document._original, // Only available for updates
    after: document.toObject()
  };

  const logEntry = new Log({
    user: user.username, // Replace with actual user ID
    action,
    documentId: document._id,
    modelName: document.constructor.modelName,
    changes: changeDetails
  });

  logEntry.save().catch(err => console.error('Error saving log:', err));
}

export const logError = async (error) => {
  // Log to console for development
  console.error(error);

  const errorLog = new ErrorLog({
    timestamp: new Date(),
    message: error.message,
    stack: error.stack
    // Add any other relevant info
  });

  await errorLog.save().catch(err => console.error('Error saving log to DB:', err));
};

