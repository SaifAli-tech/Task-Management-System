const express = require("express");
const router = express.Router();
const DesignationController = require("../controllers/designation.controller");
const authorizeDesignation = require("../middleware/authDesignations");

router.get(
  "/pagedata",
  authorizeDesignation(["Admin"]),
  DesignationController.getDesignationsWithPagination
);
router.get("/", DesignationController.getAllDesignations);
router.get(
  "/:id",
  authorizeDesignation(["Admin"]),
  DesignationController.getDesignationById
);
router.post(
  "/",
  authorizeDesignation(["Admin"]),
  DesignationController.createDesignation
);
router.put(
  "/:id",
  authorizeDesignation(["Admin"]),
  DesignationController.updateDesignation
);
router.delete(
  "/:id",
  authorizeDesignation(["Admin"]),
  DesignationController.deleteDesignation
);

module.exports = router;
