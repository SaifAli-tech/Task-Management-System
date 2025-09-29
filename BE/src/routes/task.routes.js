const express = require("express");
const router = express.Router();
const TaskController = require("../controllers/task.controller");
const authorizeDesignation = require("../middleware/authDesignations");

router.get(
  "/pagedata",
  authorizeDesignation(["Manager"]),
  TaskController.getTasksWithPagination
);
router.get(
  "/report",
  authorizeDesignation(["Manager"]),
  TaskController.getReport
);
router.get(
  "/export",
  authorizeDesignation(["Manager"]),
  TaskController.exportReportCSV
);
router.get(
  "/assignedTasks",
  authorizeDesignation(["Member"]),
  TaskController.getAssignedTasksWithPagination
);
router.get("/", authorizeDesignation(["Manager"]), TaskController.getAllTasks);
router.get(
  "/allOverdueTasks/:id",
  authorizeDesignation(["Manager"]),
  TaskController.getAllOverdueTasks
);
router.get(
  "/allTaskSummary/:id",
  authorizeDesignation(["Manager"]),
  TaskController.getAllTaskSummary
);
router.get(
  "/overdueTasks/:id",
  authorizeDesignation(["Member"]),
  TaskController.getOverdueTasks
);
router.get(
  "/taskSummary/:id",
  authorizeDesignation(["Member"]),
  TaskController.getTaskSummary
);
router.get(
  "/:id",
  authorizeDesignation(["Manager"]),
  TaskController.getTaskById
);
router.post("/", authorizeDesignation(["Manager"]), TaskController.createTask);
router.put(
  "/:id",
  authorizeDesignation(["Manager"]),
  TaskController.updateTask
);
router.put(
  "/updateStatus/:id",
  authorizeDesignation(["Member"]),
  TaskController.updateTaskStatus
);
router.delete(
  "/:id",
  authorizeDesignation(["Manager"]),
  TaskController.deleteTask
);
router.get(
  "/allTaskProgress/:id",
  authorizeDesignation(["Manager"]),
  TaskController.getAllTaskProgress
);

router.get(
  "/taskProgress/:id",
  authorizeDesignation(["Member"]),
  TaskController.getTaskProgress
);

module.exports = router;
