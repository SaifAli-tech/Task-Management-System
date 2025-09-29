const Department = require("../models/department.model");
const DepartmentDTO = require("../dtos/department.dto.js");

const getAllDepartmentsWithPageData = async (pageOptions) => {
  const query = {};

  if (pageOptions.search)
    query.name = { $regex: pageOptions.search, $options: "i" };

  if (pageOptions.page !== 1) {
    pageOptions.skip = (pageOptions.page - 1) * pageOptions.take;
  }

  const departments = await Department.find(query)
    .select("-__v")
    .skip(pageOptions.skip)
    .limit(pageOptions.take)
    .sort({ name: pageOptions.order });

  const itemCount = await Department.countDocuments(query);

  const pageCount = Math.ceil(itemCount / pageOptions.take);
  const pageMetaDto = {
    page: pageOptions.page,
    take: pageOptions.take,
    itemCount,
    pageCount,
    hasPreviousPage: pageOptions.page > 1,
    hasNextPage: pageOptions.page < pageCount,
  };

  return { departments, meta: pageMetaDto };
};

const getAllDepartments = async () => {
  return await Department.find().select("-__v -createdAt -updatedAt");
};

const getDepartmentById = async (departmentId) => {
  const department = await Department.findById(departmentId).select(
    "-_id -__v -createdAt -updatedAt"
  );

  if (!department) throw new Error("Department not found");

  return department;
};

const getDepartmentByName = async (departmentName) => {
  const department = await Department.findOne({
    name: { $regex: `^${departmentName.trim()}$`, $options: "i" },
  });
  return department._id;
};

const createDepartment = async (departmentData) => {
  const { error } = DepartmentDTO.validate(departmentData);
  if (error) throw new Error(error.details[0].message);

  const existingDepartment = await Department.findOne({
    name: { $regex: `^${departmentData.name.trim()}$`, $options: "i" },
  });

  if (existingDepartment)
    throw new Error("Department with this name already exists");

  const department = new Department(departmentData);
  return await department.save();
};

const updateDepartment = async (departmentId, departmentData) => {
  const { error } = DepartmentDTO.validate(departmentData);
  if (error) throw new Error(error.details[0].message);

  const existingDepartment = await Department.findOne({
    name: { $regex: `^${departmentData.name.trim()}$`, $options: "i" },
    _id: { $ne: departmentId },
  });

  if (existingDepartment)
    throw new Error("Department with this name already exists");

  const updatedDepartment = await Department.findByIdAndUpdate(
    departmentId,
    departmentData,
    {
      new: true,
    }
  ).select("-__v");

  if (!updatedDepartment) throw new Error("Department not found");

  return updatedDepartment;
};

const deleteDepartment = async (departmentId) => {
  const UserServices = require("./user.service.js");

  const user = await UserServices.getUserByDepartment(departmentId);

  if (user) throw new Error("This department is in use so it can't be deleted");

  const deletedDepartment = await Department.findByIdAndDelete(departmentId);

  if (!deletedDepartment) throw new Error("Department not found");

  return deletedDepartment;
};

module.exports = {
  getAllDepartmentsWithPageData,
  getAllDepartments,
  getDepartmentById,
  getDepartmentByName,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
