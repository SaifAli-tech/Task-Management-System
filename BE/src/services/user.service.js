const User = require("../models/user.model");
const UserDTO = require("../dtos/user.dto.js");
const UserUpdateDTO = require("../dtos/userUpdate.dto.js");
const ChangePasswordDTO = require("../dtos/changePassword.dto.js");
const bcrypt = require("bcryptjs");
const { deleteImageByName } = require("../config/multerConfig.js");
const sendEmail = require("../config/nodemailerConfig.js");
const DesignationServices = require("./designation.service.js");
const { format, eachDayOfInterval } = require("date-fns");

const checkDuplicate = async (userId, field, value) => {
  const query = userId
    ? { [field]: value, _id: { $ne: userId } }
    : { [field]: value };
  if (await User.findOne(query))
    throw new Error(`User with this ${field} already exists`);
};

const getAllUsersWithPageData = async (pageOptions) => {
  const query = {};

  if (pageOptions.search)
    query[pageOptions.searchBy] = { $regex: pageOptions.search, $options: "i" };

  if (pageOptions.status != null) query.approved = pageOptions.status;

  if (pageOptions.designation) query.designation = pageOptions.designation;

  if (pageOptions.department) query.department = pageOptions.department;

  if (pageOptions.page !== 1) {
    pageOptions.skip = (pageOptions.page - 1) * pageOptions.take;
  }

  const users = await User.find(query)
    .select(
      "_id firstName lastName userName email employeeNumber image approved createdAt updatedAt"
    )
    .skip(pageOptions.skip)
    .limit(pageOptions.take)
    .sort({
      userName: pageOptions.order,
    })
    .populate("designation", "name -_id")
    .populate("department", "name -_id");

  const itemCount = await User.countDocuments(query);

  const pageCount = Math.ceil(itemCount / pageOptions.take);
  const pageMetaDto = {
    page: pageOptions.page,
    take: pageOptions.take,
    itemCount,
    pageCount,
    hasPreviousPage: pageOptions.page > 1,
    hasNextPage: pageOptions.page < pageCount,
  };

  return { users, meta: pageMetaDto };
};

const getAllUsers = async () => {
  return await User.find().select(
    "_id firstName lastName userName email employeeNumber image approved"
  );
};

const getDesignatedUsers = async (designation) => {
  const id = await DesignationServices.getDesignationByName(designation);
  return await User.find({ designation: id }).select("_id userName image");
};

const getUserById = async (userId) => {
  const user = await User.findById(userId).select(
    "-_id -__v -password -createdAt -updatedAt -approved"
  );

  if (!user) throw new Error("User not found");

  return user;
};

const getUserByEmail = async (email) => {
  const user = await User.findOne({ email })
    .select(
      "_id firstName lastName userName email employeeNumber password image approved"
    )
    .populate("designation", "name -_id")
    .populate("department", "name -_id");

  if (!user) throw new Error("No user with this email found");
  if (!user.approved) throw new Error("Your account is not approved");

  return user;
};

const getUserByDesignation = async (designation) => {
  const user = await User.findOne({ designation }).select(
    "_id firstName lastName userName email employeeNumber image approved"
  );

  return user;
};

const getUserByDepartment = async (department) => {
  const user = await User.findOne({ department }).select(
    "_id firstName lastName userName email employeeNumber image approved"
  );

  return user;
};

const getUserSummary = async () => {
  const approvedUsersCount = await User.countDocuments({ approved: true });
  const notApprovedUsersCount = await User.countDocuments({ approved: false });

  const users = await User.find()
    .populate("designation", "name")
    .populate("department", "name");

  const designationSummary = {};
  const departmentSummary = {};

  users.forEach((user) => {
    const desig = user.designation.name;
    designationSummary[desig] = (designationSummary[desig] || 0) + 1;

    const dept = user.department.name;
    departmentSummary[dept] = (departmentSummary[dept] || 0) + 1;
  });

  const totalDesignationCount = Object.keys(designationSummary).length;
  const totalDepartmentCount = Object.keys(departmentSummary).length;

  return {
    totalUsersCount: approvedUsersCount + notApprovedUsersCount,
    approvedUsersCount,
    notApprovedUsersCount,
    designationSummary,
    departmentSummary,
    totalDesignationCount,
    totalDepartmentCount,
  };
};

const getUsersOverTime = async () => {
  const users = await User.find().select("createdAt");
  const minDate = await User.findOne()
    .sort({ createdAt: 1 })
    .select("createdAt");

  const firstDate = new Date(minDate.createdAt);
  const lastDate = new Date();

  const allDates = eachDayOfInterval({ start: firstDate, end: lastDate });

  const createdGrouped = {};

  users.forEach((user) => {
    const createdDate = format(new Date(user.createdAt), "dd-MM-yyyy");
    if (!createdGrouped[createdDate]) createdGrouped[createdDate] = 0;
    createdGrouped[createdDate]++;
  });

  return allDates.map((d) => {
    const date = format(d, "dd-MM-yyyy");
    return {
      date,
      created: createdGrouped[date] || 0,
    };
  });
};

const createUser = async (userData) => {
  const { error } = UserDTO.validate(userData);
  if (error) throw new Error(error.details[0].message);

  await Promise.all([
    checkDuplicate(null, "email", userData.email),
    checkDuplicate(null, "userName", userData.userName),
    checkDuplicate(null, "employeeNumber", userData.employeeNumber),
  ]);

  userData.password = await bcrypt.hash(userData.password, 10);

  const user = new User(userData);

  return await user.save();
};

const updateUser = async (userId, userData) => {
  const { error } = UserUpdateDTO.validate(userData);
  if (error) throw new Error(error.details[0].message);

  await Promise.all([
    checkDuplicate(userId, "email", userData.email),
    checkDuplicate(userId, "userName", userData.userName),
    checkDuplicate(userId, "employeeNumber", userData.employeeNumber),
  ]);

  const updatedUser = await User.findByIdAndUpdate(userId, userData, {
    new: true,
  })
    .select(
      "_id firstName lastName userName email employeeNumber image approved"
    )
    .populate("designation", "name -_id")
    .populate("department", "name -_id");

  if (!updatedUser) throw new Error("User not found");

  return updatedUser;
};

const approveUser = async (userId, userData) => {
  const user = await User.findByIdAndUpdate(userId, userData, {
    new: true,
  });
  if (!user) throw new Error("User not found");

  const subject = user.approved
    ? "Account Approved"
    : "Account Approval Rejected";

  const text = user.approved
    ? "Your account has been successfully approved. You can now log in to your account."
    : "Your account has been rejected. Please contact support for more details.";

  const html = user.approved
    ? "<h1>Account Approved</h1><p>Your account has been successfully approved. You can now log in to your account.</p>"
    : "<h1>Approval Rejected</h1><p>Your account has been rejected. Please contact support for more details.</p>";

  sendEmail(user.email, subject, text, html);

  return user;
};

const deleteUser = async (userId) => {
  const taskServices = require("./task.service.js");

  const task = await taskServices.getTaskByUser(userId);

  if (task)
    throw new Error(
      "Cannot delete user: User has created tasks or is assigned to tasks"
    );

  const deletedUser = await User.findByIdAndDelete(userId);

  deleteImageByName(deletedUser.image, "Failed to delete user image file");

  if (!deletedUser) throw new Error("User not found");

  return deletedUser;
};

const changePassword = async (userId, data) => {
  const { error } = ChangePasswordDTO.validate(data);
  if (error) throw new Error(error.details[0].message);

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { password: hashedPassword },
    {
      new: true,
    }
  );

  return updatedUser;
};

module.exports = {
  getAllUsersWithPageData,
  getAllUsers,
  getDesignatedUsers,
  getUserById,
  getUserByEmail,
  getUserByDesignation,
  getUserByDepartment,
  getUserSummary,
  getUsersOverTime,
  createUser,
  updateUser,
  approveUser,
  deleteUser,
  changePassword,
};
