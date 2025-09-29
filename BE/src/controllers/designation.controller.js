const designationService = require("../services/designation.service");

const getDesignationsWithPagination = async (req, res) => {
  try {
    const pageOptions = {
      page: parseInt(req.query.page, 10) || 1,
      take: parseInt(req.query.take, 10) || 10,
      order: parseInt(req.query.order?.toUpperCase() === "ASC" ? 1 : -1),
      search: req.query.search?.trim() || "",
    };

    const paginatedData =
      await designationService.getAllDesignationsWithPageData(pageOptions);

    res.status(200).json(paginatedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllDesignations = async (req, res) => {
  try {
    const designations = await designationService.getAllDesignations();
    res.status(200).json(designations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDesignationById = async (req, res) => {
  try {
    const designation = await designationService.getDesignationById(
      req.params.id
    );
    res.status(200).json(designation);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const createDesignation = async (req, res) => {
  try {
    await designationService.createDesignation(req.body);
    res.status(201).json({ message: "Designation created successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateDesignation = async (req, res) => {
  try {
    const updatedDesignation = await designationService.updateDesignation(
      req.params.id,
      req.body
    );
    res.status(200).json(updatedDesignation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteDesignation = async (req, res) => {
  try {
    await designationService.deleteDesignation(req.params.id);
    res.status(200).json({ message: "Designation deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  getDesignationsWithPagination,
  getAllDesignations,
  getDesignationById,
  createDesignation,
  updateDesignation,
  deleteDesignation,
};
