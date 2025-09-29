const taskService = require("../services/task.service");

const getTasksWithPagination = async (req, res) => {
  try {
    const pageOptions = {
      page: parseInt(req.query.page, 10) || 1,
      take: parseInt(req.query.take, 10) || 10,
      search: req.query.search?.trim() || "",
      searchBy: req.query.searchBy || "title",
      status: req.query.status || "",
      priority: req.query.priority || "",
      assignedTo: req.query.assignedTo || "",
      deadline: req.query.deadline || "",
    };

    const paginatedData = await taskService.getAllTasksWithPageData(
      pageOptions,
      req.user.userId
    );

    res.status(200).json(paginatedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAssignedTasksWithPagination = async (req, res) => {
  try {
    const pageOptions = {
      page: parseInt(req.query.page, 10) || 1,
      take: parseInt(req.query.take, 10) || 10,
      search: req.query.search?.trim() || "",
      searchBy: req.query.searchBy || "title",
      status: req.query.status || "",
      priority: req.query.priority || "",
      createdBy: req.query.createdBy || "",
      deadline: req.query.deadline || "",
    };

    const paginatedData = await taskService.getAssignedTasksWithPageData(
      pageOptions,
      req.user.userId
    );

    res.status(200).json(paginatedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReport = async (req, res) => {
  try {
    const filters = {
      status: req.query.status || "",
      assignedTo: req.query.assignedTo || "",
      firstDate: req.query.firstDate || "",
      lastDate: req.query.lastDate || "",
    };

    const data = await taskService.getReport(filters, req.user.userId);

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const exportReportCSV = async (req, res) => {
  try {
    const filters = {
      status: req.query.status || "",
      assignedTo: req.query.assignedTo || "",
      firstDate: req.query.firstDate || "",
      lastDate: req.query.lastDate || "",
    };

    const data = await taskService.exportReportCSV(filters, req.user.userId);
    res.header("Content-Type", "text/csv");
    res.attachment("task-report.csv");
    res.send(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllTasks = async (req, res) => {
  try {
    const tasks = await taskService.getAllTasks();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllOverdueTasks = async (req, res) => {
  try {
    const tasks = await taskService.getAllOverdueTasks(req.params.id);
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllTaskSummary = async (req, res) => {
  try {
    const summary = await taskService.getAllTaskSummary(req.params.id);
    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOverdueTasks = async (req, res) => {
  try {
    const tasks = await taskService.getOverdueTasks(req.params.id);
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTaskSummary = async (req, res) => {
  try {
    const summary = await taskService.getTaskSummary(req.params.id);
    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    res.status(200).json(task);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const memberId = await taskService.createTask(req.body);
    req.io.emit("taskUpdates", memberId);
    res.status(201).json({ message: "Task created successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const updatedTask = await taskService.updateTask(req.params.id, req.body);
    req.io.emit("taskUpdates", updatedTask.assignedTo._id);
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const updatedTask = await taskService.updateTaskStatus(
      req.params.id,
      req.body
    );
    req.io.emit("statusUpdate", updatedTask.createdBy);
    res.status(200).json({ message: "Task status updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const deletedTask = await taskService.deleteTask(req.params.id);
    req.io.emit("taskUpdates", deletedTask.assignedTo);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getAllTaskProgress = async (req, res) => {
  try {
    const progress = await taskService.getAllTaskProgress(req.params.id);
    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTaskProgress = async (req, res) => {
  try {
    const progress = await taskService.getTaskProgress(req.params.id);
    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTasksWithPagination,
  getAssignedTasksWithPagination,
  getAllTasks,
  getAllOverdueTasks,
  getAllTaskSummary,
  getOverdueTasks,
  getTaskSummary,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getAllTaskProgress,
  getTaskProgress,
  getReport,
  exportReportCSV,
};
