const LoginDTO = require("../dtos/login.dto.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userServices = require("./user.service.js");
const sendEmail = require("../config/nodemailerConfig.js");

const login = async (data) => {
  const { error } = LoginDTO.validate(data);
  if (error) throw new Error(error.details[0].message);

  const user = await userServices.getUserByEmail(data.email);

  const isMatch = await bcrypt.compare(data.password, user.password);
  if (!isMatch) throw new Error("Incorrect Password");

  const expiresIn = 86400; // a day

  const token = jwt.sign(
    { userId: user._id, designation: user.designation.name },
    process.env.JWT_SECRET,
    { expiresIn: `${expiresIn}s` }
  );

  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  const { password, ...userData } = user.toObject();
  userData.expires = expiresAt;

  return { token, user: userData };
};

const register = async (userData) => {
  const user = await userServices.createUser(userData);
  sendEmail(
    userData.email,
    "Welcome To Task Management System",
    "Thanks for signing up",
    "<h1>Welcome</h1><p>Your account is successfully created. You will get an email for your account approval. Then you will be able to login to your account.</p>"
  );
  return user;
};

module.exports = {
  login,
  register,
};
