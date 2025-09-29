const mongoose = require("mongoose");
const User = require("../models/user.model.js");
const Designation = require("../models/designation.model.js");
const Department = require("../models/department.model.js");
const bcrypt = require("bcryptjs");

const collectionExists = async (collectionName) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    return collections.some((col) => col.name === collectionName);
  } catch (error) {
    console.warn(`Warning: Failed to check collection ${collectionName}.`);
    return false;
  }
};

const seedDatabase = async () => {
  try {
    const userCount = (await collectionExists("users"))
      ? await User.countDocuments()
      : 0;
    const designationCount = (await collectionExists("designations"))
      ? await Designation.countDocuments()
      : 0;
    const departmentCount = (await collectionExists("departments"))
      ? await Designation.countDocuments()
      : 0;

    if (userCount > 0 || designationCount > 0 || departmentCount > 0) {
      console.log("Database already seeded. Skipping seeding process.");
      return;
    }

    console.log("Seeding database with initial data...");

    const designations = [
      { name: "Admin" },
      { name: "Manager" },
      { name: "Member" },
    ];
    await Designation.insertMany(designations);

    const adminRole = await Designation.findOne({ name: "Admin" });
    const managerRole = await Designation.findOne({ name: "Manager" });
    const memberRole = await Designation.findOne({ name: "Member" });

    const departments = [
      { name: "Administration" },
      { name: "Human Resources" },
      { name: "Operations" },
      { name: "Development" },
      { name: "Sales & Marketing" },
      { name: "Finance" },
      { name: "Customer Support" },
    ];

    await Department.insertMany(departments);

    const adminDep = await Department.findOne({ name: "Administration" });
    const operDep = await Department.findOne({ name: "Operations" });
    const finDep = await Department.findOne({ name: "Finance" });
    const devDep = await Department.findOne({ name: "Development" });
    const hrDep = await Department.findOne({ name: "Human Resources" });

    const users = [
      {
        firstName: "Mohsin",
        lastName: "Ali",
        userName: "mohsin852",
        email: "mohsin@gmail.com",
        employeeNumber: "EMP-0001",
        password: await bcrypt.hash("abc@123", 10),
        designation: adminRole._id,
        department: adminDep._id,
        image: "profile1.png",
        approved: true,
      },
      {
        firstName: "Raza",
        lastName: "Hussain",
        userName: "raza741",
        email: "raza@gmail.com",
        employeeNumber: "EMP-0002",
        password: await bcrypt.hash("abc@456", 10),
        designation: managerRole._id,
        department: devDep._id,
        image: "profile2.jpg",
        approved: true,
      },
      {
        firstName: "Awais",
        lastName: "Tauqir",
        userName: "awais963",
        email: "awais@gmail.com",
        employeeNumber: "EMP-0003",
        password: await bcrypt.hash("abc@789", 10),
        designation: memberRole._id,
        department: finDep._id,
        image: "profile3.jpg",
        approved: true,
      },
      {
        firstName: "Zain",
        lastName: "Abideen",
        userName: "zain258",
        email: "zain@gmail.com",
        employeeNumber: "EMP-0004",
        password: await bcrypt.hash("lmn@123", 10),
        designation: memberRole._id,
        department: hrDep._id,
        image: "profile4.jpg",
        approved: true,
      },
      {
        firstName: "Saqib",
        lastName: "Razzaq",
        userName: "saqib147",
        email: "saqib@gmail.com",
        employeeNumber: "EMP-0005",
        password: await bcrypt.hash("lmn@456", 10),
        designation: memberRole._id,
        department: operDep._id,
        image: "profile5.jpg",
        approved: true,
      },
    ];
    await User.insertMany(users);

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding the database:", error);
  }
};

module.exports = seedDatabase;
