const authService = require("../services/auth.service");
const { deleteImageByPath } = require("../config/multerConfig");

const login = async (req, res) => {
  try {
    const { token, user } = await authService.login(req.body);
    res.json({ token, user });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const register = async (req, res) => {
  req.body.image = req.file.filename;
  try {
    const newUser = await authService.register(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    if (req.file && req.file.path) {
      deleteImageByPath(req.file.path, "Failed to delete orphan image file");
    }
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  login,
  register,
};
