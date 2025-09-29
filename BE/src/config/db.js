const mongoose = require("mongoose");
const seedDatabase = require("../seeder/seed.js");
require("dotenv").config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/tms";
    console.log("MONGODB_URI:", uri);

    mongoose.set("bufferCommands", false);

    await mongoose.connect(uri, {
      // serverSelectionTimeoutMS: 10000, // Timeout if MongoDB isn't available
    });

    console.log("MongoDB connected successfully");

    // Load all models to register them
    require("../models");

    // Run the seeder to populate initial data
    await seedDatabase();

    console.log("Database setup and seeding completed");
  } catch (error) {
    console.error("Error setting up the database:", error);
    process.exit(1); // Exit with failure
  }
};

module.exports = connectDB;
