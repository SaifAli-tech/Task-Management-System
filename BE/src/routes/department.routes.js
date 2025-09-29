const express = require("express");
const router = express.Router();
const DepartmentController = require("../controllers/department.controller");
const authorizeDesignation = require("../middleware/authDesignations");

router.get(
  "/pagedata",
  authorizeDesignation(["Admin"]),
  DepartmentController.getDepartmentsWithPagination
);
router.get("/", DepartmentController.getAllDepartments);
router.get(
  "/:id",
  authorizeDesignation(["Admin"]),
  DepartmentController.getDepartmentById
);
router.post(
  "/",
  authorizeDesignation(["Admin"]),
  DepartmentController.createDepartment
);
router.put(
  "/:id",
  authorizeDesignation(["Admin"]),
  DepartmentController.updateDepartment
);
router.delete(
  "/:id",
  authorizeDesignation(["Admin"]),
  DepartmentController.deleteDepartment
);

module.exports = router;
