const Task = require("../models/task.model");
const TaskDTO = require("../dtos/task.dto.js");
const userServices = require("./user.service.js");
const notificationServices = require("./notification.service.js");
const { getIo } = require("../config/socket.js");
const sendEmail = require("../config/nodemailerConfig.js");
const { format, eachDayOfInterval } = require("date-fns");
const { Parser } = require("json2csv");

const checkDuplicate = async (taskId, field, value) => {
  const query = taskId
    ? { [field]: value, _id: { $ne: taskId } }
    : { [field]: value };
  if (await Task.findOne(query))
    throw new Error(`Task with this ${field} already exists`);
};

const getAllTasksWithPageData = async (pageOptions, managerId) => {
  const query = {};

  query.createdBy = managerId;

  if (pageOptions.search)
    query[pageOptions.searchBy] = { $regex: pageOptions.search, $options: "i" };

  if (pageOptions.page !== 1)
    pageOptions.skip = (pageOptions.page - 1) * pageOptions.take;

  if (pageOptions.status) query.status = pageOptions.status;

  if (pageOptions.priority) query.priority = pageOptions.priority;

  if (pageOptions.assignedTo) query.assignedTo = pageOptions.assignedTo;

  if (pageOptions.deadline) query.deadline = pageOptions.deadline;

  const tasks = await Task.find(query)
    .select("-__v")
    .skip(pageOptions.skip)
    .limit(pageOptions.take)
    .sort({ createdAt: -1 })
    .populate("createdBy", "-_id userName")
    .populate("assignedTo", "-_id userName image");

  const itemCount = await Task.countDocuments(query);

  const pageCount = Math.ceil(itemCount / pageOptions.take);
  const pageMetaDto = {
    page: pageOptions.page,
    take: pageOptions.take,
    itemCount,
    pageCount,
    hasPreviousPage: pageOptions.page > 1,
    hasNextPage: pageOptions.page < pageCount,
  };

  return { tasks, meta: pageMetaDto };
};

const getAssignedTasksWithPageData = async (pageOptions, memberId) => {
  const query = {};

  query.assignedTo = memberId;

  if (pageOptions.search)
    query[pageOptions.searchBy] = { $regex: pageOptions.search, $options: "i" };

  if (pageOptions.page !== 1)
    pageOptions.skip = (pageOptions.page - 1) * pageOptions.take;

  if (pageOptions.status) query.status = pageOptions.status;

  if (pageOptions.priority) query.priority = pageOptions.priority;

  if (pageOptions.createdBy) query.createdBy = pageOptions.createdBy;

  if (pageOptions.deadline) query.deadline = pageOptions.deadline;

  const tasks = await Task.find(query)
    .select("-__v")
    .skip(pageOptions.skip)
    .limit(pageOptions.take)
    .sort({ createdAt: -1 })
    .populate("createdBy", "-_id userName image")
    .populate("assignedTo", "-_id userName");

  const itemCount = await Task.countDocuments(query);

  const pageCount = Math.ceil(itemCount / pageOptions.take);
  const pageMetaDto = {
    page: pageOptions.page,
    take: pageOptions.take,
    itemCount,
    pageCount,
    hasPreviousPage: pageOptions.page > 1,
    hasNextPage: pageOptions.page < pageCount,
  };

  return { tasks, meta: pageMetaDto };
};

const getAllTasks = async () => {
  return await Task.find().select("-__v");
};

const getAllOverdueTasks = async (managerId) => {
  return await Task.find({
    createdBy: managerId,
    status: { $ne: "Completed" },
    completedAt: null,
    deadline: { $lt: new Date(new Date().setHours(0, 0, 0, 0)) },
  })
    .select("-__v")
    .populate("assignedTo", "-_id userName image");
};

const getAllTaskSummary = async (managerId) => {
  const pendingCount = await Task.countDocuments({
    createdBy: managerId,
    status: "Pending",
    deadline: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
  });
  const inProgressCount = await Task.countDocuments({
    createdBy: managerId,
    status: "In Progress",
    deadline: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
  });
  const completedCount = await Task.countDocuments({
    createdBy: managerId,
    status: "Completed",
  });
  const overdueCount = await Task.countDocuments({
    createdBy: managerId,
    status: { $ne: "Completed" },
    completedAt: null,
    deadline: { $lt: new Date(new Date().setHours(0, 0, 0, 0)) },
  });

  return {
    pending: pendingCount,
    inProgress: inProgressCount,
    completed: completedCount,
    overdue: overdueCount,
    total: pendingCount + inProgressCount + completedCount + overdueCount,
  };
};

const getOverdueTasks = async (memberId) => {
  return await Task.find({
    assignedTo: memberId,
    status: { $ne: "Completed" },
    completedAt: null,
    deadline: { $lt: new Date(new Date().setHours(0, 0, 0, 0)) },
  })
    .select("-__v")
    .populate("createdBy", "-_id userName image");
};

const getTaskSummary = async (memberId) => {
  const pendingCount = await Task.countDocuments({
    assignedTo: memberId,
    status: "Pending",
    deadline: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
  });
  const inProgressCount = await Task.countDocuments({
    assignedTo: memberId,
    status: "In Progress",
    deadline: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
  });
  const completedCount = await Task.countDocuments({
    assignedTo: memberId,
    status: "Completed",
  });
  const overdueCount = await Task.countDocuments({
    assignedTo: memberId,
    status: { $ne: "Completed" },
    completedAt: null,
    deadline: { $lt: new Date(new Date().setHours(0, 0, 0, 0)) },
  });

  return {
    pending: pendingCount,
    inProgress: inProgressCount,
    completed: completedCount,
    overdue: overdueCount,
    total: pendingCount + inProgressCount + completedCount + overdueCount,
  };
};

const getTaskById = async (taskId) => {
  const task = await Task.findById(taskId).select(
    "-_id -__v -createdAt -updatedAt -completedAt"
  );

  if (!task) throw new Error("Task not found");

  return task;
};

const getTaskByUser = async (userId) => {
  const task = await Task.findOne({
    $or: [{ createdBy: userId }, { assignedTo: userId }],
  });

  return task;
};

const createTask = async (taskData) => {
  const { error } = TaskDTO.validate(taskData);
  if (error) throw new Error(error.details[0].message);

  await Promise.all([checkDuplicate(null, "title", taskData.title)]);

  const task = new Task(taskData);

  await task.save();

  const member = await userServices.getUserById(task.assignedTo);
  const manager = await userServices.getUserById(task.createdBy);

  const title = "New Task";
  const text = `Hi ${member.userName}, A new task "${
    task.title
  }" has been assigned to you by ${manager.userName} with deadline "${format(
    task.deadline,
    "dd-MMMM-yyyy"
  )}".`;

  sendEmail(
    member.email,
    title,
    text,
    `<h1>Hi ${member.userName}</h1><p>A new task "${
      task.title
    }" has been assigned to you by ${manager.userName} with deadline "${format(
      task.deadline,
      "dd-MMMM-yyyy"
    )}".</p>`
  );

  await notificationServices.createNotification({
    title,
    text,
    for: taskData.assignedTo,
  });

  const io = getIo();
  io.emit("notification", task.assignedTo);

  return task.assignedTo;
};

const updateTask = async (taskId, taskData) => {
  const { error } = TaskDTO.validate(taskData);
  if (error) throw new Error(error.details[0].message);

  await Promise.all([checkDuplicate(taskId, "title", taskData.title)]);

  const updatedTask = await Task.findByIdAndUpdate(taskId, taskData, {
    new: true,
  })
    .select("-__v")
    .populate("assignedTo", "_id userName")
    .populate("createdBy", "_id userName");

  if (!updatedTask) throw new Error("Task not found");

  const title = "Task Updated";
  const text = `Hi ${updatedTask.assignedTo.userName}, A task "${updatedTask.title}" has been updated by ${updatedTask.createdBy.userName}. Please visit the "Assigned Tasks" list in the "Task Management System" app to see the details.`;

  sendEmail(
    updatedTask.assignedTo.email,
    title,
    text,
    `<h1>Hi ${updatedTask.assignedTo.userName}</h1><p>A task "${updatedTask.title}" has been updated by ${updatedTask.createdBy.userName}. Please visit the "Assigned Tasks" list in the "Task Management System" app to see the details.</p>`
  );

  await notificationServices.createNotification({
    title,
    text,
    for: taskData.assignedTo,
  });

  const io = getIo();
  io.emit("notification", taskData.assignedTo);

  return updatedTask;
};

const updateTaskStatus = async (taskId, taskData) => {
  const updatedTask = await Task.findByIdAndUpdate(taskId, taskData, {
    new: true,
  }).select("-__v");

  if (!updatedTask) throw new Error("Task not found");

  return updatedTask;
};

const deleteTask = async (taskId) => {
  const deletedTask = await Task.findByIdAndDelete(taskId);

  if (!deletedTask) throw new Error("Task not found");

  return deletedTask;
};

const getAllTaskProgress = async (managerId) => {
  const tasks = await Task.find({
    createdBy: managerId,
  }).select("createdAt completedAt");

  if (!tasks.length) return [];

  const createdGrouped = {};
  const completedGrouped = {};

  tasks.forEach((t) => {
    const createdDate = format(new Date(t.createdAt), "dd-MM-yyyy");
    if (!createdGrouped[createdDate]) createdGrouped[createdDate] = 0;
    createdGrouped[createdDate]++;

    if (t.completedAt) {
      const completedDate = format(new Date(t.completedAt), "dd-MM-yyyy");
      if (!completedGrouped[completedDate]) completedGrouped[completedDate] = 0;
      completedGrouped[completedDate]++;
    }
  });

  const firstDate = new Date(
    Math.min(...tasks.map((t) => new Date(t.createdAt)))
  );
  const lastDate = new Date(
    Math.max(
      ...tasks.map((t) =>
        t.completedAt ? new Date(t.completedAt) : new Date(t.createdAt)
      )
    )
  );

  const allDates = eachDayOfInterval({ start: firstDate, end: lastDate });

  return allDates.map((d) => {
    const date = format(d, "dd-MM-yyyy");
    return {
      date,
      created: createdGrouped[date] || 0,
      completed: completedGrouped[date] || 0,
    };
  });
};

const getTaskProgress = async (memberId) => {
  const tasks = await Task.find({
    assignedTo: memberId,
  }).select("createdAt completedAt");

  if (!tasks.length) return [];

  const createdGrouped = {};
  const completedGrouped = {};

  tasks.forEach((t) => {
    const createdDate = format(new Date(t.createdAt), "dd-MM-yyyy");
    if (!createdGrouped[createdDate]) createdGrouped[createdDate] = 0;
    createdGrouped[createdDate]++;

    if (t.completedAt) {
      const completedDate = format(new Date(t.completedAt), "dd-MM-yyyy");
      if (!completedGrouped[completedDate]) completedGrouped[completedDate] = 0;
      completedGrouped[completedDate]++;
    }
  });

  const firstDate = new Date(
    Math.min(...tasks.map((t) => new Date(t.createdAt)))
  );
  const lastDate = new Date(
    Math.max(
      ...tasks.map((t) =>
        t.completedAt ? new Date(t.completedAt) : new Date(t.createdAt)
      )
    )
  );

  const allDates = eachDayOfInterval({ start: firstDate, end: lastDate });

  return allDates.map((d) => {
    const date = format(d, "dd-MM-yyyy");
    return {
      date,
      created: createdGrouped[date] || 0,
      completed: completedGrouped[date] || 0,
    };
  });
};

const getReport = async (filters, managerId) => {
  const query = {};

  query.createdBy = managerId;

  if (filters.status) query.status = filters.status;

  if (filters.assignedTo) query.assignedTo = filters.assignedTo;

  if (filters.firstDate || filters.lastDate) {
    query.createdAt = {};
    if (filters.firstDate) query.createdAt.$gte = new Date(filters.firstDate);
    if (filters.lastDate) {
      const lastDate = new Date(filters.lastDate).setHours(23, 59, 59, 999);
      query.createdAt.$lte = lastDate;
    }
  }

  const tasks = await Task.find(query)
    .select("-__v")
    .sort({ createdAt: -1 })
    .populate("createdBy", "-_id userName")
    .populate("assignedTo", "-_id userName image");

  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

  const completed = tasks.filter((t) => t.status === "Completed").length;

  const pending = tasks.filter((t) => {
    const deadline = new Date(t.deadline);
    return t.status === "Pending" && deadline && deadline >= todayStart;
  }).length;

  const inProgress = tasks.filter((t) => {
    const deadline = new Date(t.deadline);
    return t.status === "In Progress" && deadline && deadline >= todayStart;
  }).length;

  const overdue = tasks.filter((t) => {
    const deadline = new Date(t.deadline);
    return (
      t.status !== "Completed" &&
      !t.completedAt &&
      deadline &&
      deadline < todayStart
    );
  }).length;

  const report = {
    total: tasks.length,
    completed,
    pending,
    inProgress,
    overdue,
  };

  return { tasks, report };
};

const exportReportCSV = async (filters, managerId) => {
  const query = {};

  query.createdBy = managerId;

  if (filters.status) query.status = filters.status;

  if (filters.assignedTo) query.assignedTo = filters.assignedTo;

  if (filters.firstDate || filters.lastDate) {
    query.createdAt = {};
    if (filters.firstDate) query.createdAt.$gte = new Date(filters.firstDate);
    if (filters.lastDate) {
      const lastDate = new Date(filters.lastDate).setHours(23, 59, 59, 999);
      query.createdAt.$lte = lastDate;
    }
  }

  const tasks = await Task.find(query)
    .select("-__v")
    .sort({ createdAt: -1 })
    .populate("createdBy", "-_id userName")
    .populate("assignedTo", "-_id userName")
    .lean();

  tasks.forEach((t) => {
    t.deadline = format(new Date(t.deadline), "dd-MMMM-yyyy");
    t.createdAt = format(new Date(t.createdAt), "dd-MMMM-yyyy");
    if (t.completedAt)
      t.completedAt = format(new Date(t.completedAt), "dd-MMMM-yyyy");
  });

  const fields = [
    { label: "Title", value: "title" },
    { label: "Description", value: "description" },
    { label: "Status", value: "status" },
    { label: "Priority", value: "priority" },
    { label: "Created At", value: "createdAt" },
    { label: "Deadline", value: "deadline" },
    { label: "Completed At", value: "completedAt" },
    { label: "Assigned To", value: "assignedTo.userName" },
    { label: "Created By", value: "createdBy.userName" },
  ];

  const parser = new Parser({ fields });
  const csv = parser.parse(tasks);

  return csv;
};

module.exports = {
  getAllTasksWithPageData,
  getAssignedTasksWithPageData,
  getAllTasks,
  getAllOverdueTasks,
  getAllTaskSummary,
  getOverdueTasks,
  getTaskSummary,
  getTaskById,
  getTaskByUser,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getAllTaskProgress,
  getTaskProgress,
  getReport,
  exportReportCSV,
};
