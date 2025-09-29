const departmentService = require("../services/department.service");

const getDepartmentsWithPagination = async (req, res) => {
  try {
    const pageOptions = {
      page: parseInt(req.query.page, 10) || 1,
      take: parseInt(req.query.take, 10) || 10,
      order: parseInt(req.query.order?.toUpperCase() === "ASC" ? 1 : -1),
      search: req.query.search?.trim() || "",
    };

    const paginatedData = await departmentService.getAllDepartmentsWithPageData(
      pageOptions
    );

    res.status(200).json(paginatedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllDepartments = async (req, res) => {
  try {
    const departments = await departmentService.getAllDepartments();
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDepartmentById = async (req, res) => {
  try {
    const department = await departmentService.getDepartmentById(req.params.id);
    res.status(200).json(department);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const createDepartment = async (req, res) => {
  try {
    await departmentService.createDepartment(req.body);
    res.status(201).json({ message: "Department created successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const updatedDepartment = await departmentService.updateDepartment(
      req.params.id,
      req.body
    );
    res.status(200).json(updatedDepartment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    await departmentService.deleteDepartment(req.params.id);
    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  getDepartmentsWithPagination,
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
