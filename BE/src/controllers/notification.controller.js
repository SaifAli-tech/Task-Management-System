const notificationService = require("../services/notification.service");
const { getIo } = require("../config/socket.js");

const getNotificationsWithPagination = async (req, res) => {
  try {
    const pageOptions = {
      page: parseInt(req.query.page, 10) || 1,
      take: parseInt(req.query.take, 10) || 10,
      search: req.query.search?.trim() || "",
      searchBy: req.query.searchBy || "",
    };

    const paginatedData =
      await notificationService.getAllNotificationsWithPageData(
        pageOptions,
        req.user.userId
      );

    res.status(200).json(paginatedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createNotification = async (req, res) => {
  try {
    const newNotification = await notificationService.createNotification(
      req.body
    );
    res.status(201).json(newNotification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateNotification = async (req, res) => {
  try {
    const updatedNotification = await notificationService.updateNotification(
      req.params.id,
      req.body
    );
    const io = getIo();
    io.emit("newNotification", req.user.userId);
    res.status(200).json(updatedNotification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.userId);
    res.status(200).json(count);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getNotificationsWithPagination,
  createNotification,
  updateNotification,
  getUnreadCount,
};
