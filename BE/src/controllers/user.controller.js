const userService = require("../services/user.service");
const {
  deleteImageByName,
  deleteImageByPath,
} = require("../config/multerConfig");

const getUsersWithPagination = async (req, res) => {
  try {
    const pageOptions = {
      page: parseInt(req.query.page, 10) || 1,
      take: parseInt(req.query.take, 10) || 10,
      order: parseInt(req.query.order?.toUpperCase() === "ASC" ? 1 : -1),
      search: req.query.search?.trim() || "",
      searchBy: req.query.searchBy || "userName",
      designation: req.query.designation || "",
      department: req.query.department || "",
      status:
        req.query.status === "true"
          ? true
          : req.query.status === "false"
          ? false
          : null,
    };

    const paginatedData = await userService.getAllUsersWithPageData(
      pageOptions
    );

    res.status(200).json(paginatedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDesignatedUsers = async (req, res) => {
  try {
    const users = await userService.getDesignatedUsers(req.params.designation);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getUserSummary = async (req, res) => {
  try {
    const users = await userService.getUserSummary();
    res.status(200).json(users);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getUsersOverTime = async (req, res) => {
  try {
    const users = await userService.getUsersOverTime();
    res.status(200).json(users);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    await userService.createUser(req.body);
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  let oldUser;

  if (req.file) {
    oldUser = await userService.getUserById(req.params.id);
    req.body.image = req.file.filename;
  }

  try {
    const updatedUser = await userService.updateUser(req.params.id, req.body);

    if (req.file) {
      deleteImageByName(oldUser.image, "Failed to delete old image file");
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    if (req.file && req.file.path) {
      deleteImageByPath(req.file.path, "Failed to delete orphan image file");
    }
    res.status(400).json({ message: error.message });
  }
};

const approveUser = async (req, res) => {
  try {
    await userService.approveUser(req.params.id, req.body);
    res.status(200).json({ message: "User status updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    await userService.changePassword(req.params.id, req.body);
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  getUsersWithPagination,
  getAllUsers,
  getDesignatedUsers,
  getUserById,
  getUserSummary,
  getUsersOverTime,
  createUser,
  updateUser,
  approveUser,
  deleteUser,
  changePassword,
};
