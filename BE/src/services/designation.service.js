const Designation = require("../models/designation.model");
const DesignationDTO = require("../dtos/designation.dto.js");

const getAllDesignationsWithPageData = async (pageOptions) => {
  const query = {};

  if (pageOptions.search)
    query.name = { $regex: pageOptions.search, $options: "i" };

  if (pageOptions.page !== 1) {
    pageOptions.skip = (pageOptions.page - 1) * pageOptions.take;
  }

  const designations = await Designation.find(query)
    .select("-__v")
    .skip(pageOptions.skip)
    .limit(pageOptions.take)
    .sort({ name: pageOptions.order });

  const itemCount = await Designation.countDocuments(query);

  const pageCount = Math.ceil(itemCount / pageOptions.take);
  const pageMetaDto = {
    page: pageOptions.page,
    take: pageOptions.take,
    itemCount,
    pageCount,
    hasPreviousPage: pageOptions.page > 1,
    hasNextPage: pageOptions.page < pageCount,
  };

  return { designations, meta: pageMetaDto };
};

const getAllDesignations = async () => {
  return await Designation.find().select("-__v -createdAt -updatedAt");
};

const getDesignationById = async (designationId) => {
  const designation = await Designation.findById(designationId).select(
    "-_id -__v -createdAt -updatedAt"
  );

  if (!designation) throw new Error("Designation not found");

  return designation;
};

const getDesignationByName = async (designationName) => {
  const designation = await Designation.findOne({
    name: { $regex: `^${designationName.trim()}$`, $options: "i" },
  });
  return designation._id;
};

const createDesignation = async (designationData) => {
  const { error } = DesignationDTO.validate(designationData);
  if (error) throw new Error(error.details[0].message);

  const existingDesignation = await Designation.findOne({
    name: { $regex: `^${designationData.name.trim()}$`, $options: "i" },
  });

  if (existingDesignation)
    throw new Error("Designation with this name already exists");

  const designation = new Designation(designationData);
  return await designation.save();
};

const updateDesignation = async (designationId, designationData) => {
  const { error } = DesignationDTO.validate(designationData);
  if (error) throw new Error(error.details[0].message);

  const existingDesignation = await Designation.findOne({
    name: { $regex: `^${designationData.name.trim()}$`, $options: "i" },
    _id: { $ne: designationId },
  });

  if (existingDesignation)
    throw new Error("Designation with this name already exists");

  const updatedDesignation = await Designation.findByIdAndUpdate(
    designationId,
    designationData,
    {
      new: true,
    }
  ).select("-__v");

  if (!updatedDesignation) throw new Error("Designation not found");

  return updatedDesignation;
};

const deleteDesignation = async (designationId) => {
  const UserServices = require("./user.service.js");

  const user = await UserServices.getUserByDesignation(designationId);

  if (user)
    throw new Error("This designation is in use so it can't be deleted");

  const deletedDesignation = await Designation.findByIdAndDelete(designationId);

  if (!deletedDesignation) throw new Error("Designation not found");

  return deletedDesignation;
};

module.exports = {
  getAllDesignationsWithPageData,
  getAllDesignations,
  getDesignationById,
  getDesignationByName,
  createDesignation,
  updateDesignation,
  deleteDesignation,
};
