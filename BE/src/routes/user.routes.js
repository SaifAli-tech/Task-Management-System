const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user.controller");
const authorizeDesignation = require("../middleware/authDesignations");
const { image } = require("../config/multerConfig");

router.get(
  "/pagedata",
  authorizeDesignation(["Admin"]),
  UserController.getUsersWithPagination
);
router.get(
  "/userSummary",
  authorizeDesignation(["Admin"]),
  UserController.getUserSummary
);
router.get(
  "/usersOverTime",
  authorizeDesignation(["Admin"]),
  UserController.getUsersOverTime
);
router.get(
  "/designation/:designation",
  authorizeDesignation(["Manager", "Member"]),
  UserController.getDesignatedUsers
);
router.get("/", authorizeDesignation(["Admin"]), UserController.getAllUsers);
router.get(
  "/:id",
  authorizeDesignation(["Admin", "Manager", "Member"]),
  UserController.getUserById
);
router.post("/", authorizeDesignation(["Admin"]), UserController.createUser);
router.put(
  "/approve/:id",
  authorizeDesignation(["Admin"]),
  UserController.approveUser
);
router.put(
  "/:id",
  image.single("image"),
  authorizeDesignation(["Admin", "Manager", "Member"]),
  UserController.updateUser
);
router.put(
  "/changePassword/:id",
  authorizeDesignation(["Admin", "Manager", "Member"]),
  UserController.changePassword
);
router.delete(
  "/:id",
  authorizeDesignation(["Admin"]),
  UserController.deleteUser
);

module.exports = router;
