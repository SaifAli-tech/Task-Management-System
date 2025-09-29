const Notification = require("../models/notification.model");
const NotificationDTO = require("../dtos/notification.dto");
const { getIo } = require("../config/socket.js");

const getAllNotificationsWithPageData = async (pageOptions, memberId) => {
  const query = {};

  query.for = memberId;

  if (pageOptions.search)
    query[pageOptions.searchBy] = { $regex: pageOptions.search, $options: "i" };

  if (pageOptions.page !== 1)
    pageOptions.skip = (pageOptions.page - 1) * pageOptions.take;

  const notifications = await Notification.find(query)
    .skip(pageOptions.skip)
    .limit(pageOptions.take)
    .sort({ createdAt: -1 });

  const itemCount = await Notification.countDocuments(query);

  const pageCount = Math.ceil(itemCount / pageOptions.take);
  const pageMetaDto = {
    page: pageOptions.page,
    take: pageOptions.take,
    itemCount,
    pageCount,
    hasPreviousPage: pageOptions.page > 1,
    hasNextPage: pageOptions.page < pageCount,
  };

  return { notifications, meta: pageMetaDto };
};

const createNotification = async (notificationData) => {
  const { error } = NotificationDTO.validate(notificationData);
  if (error) throw new Error(error.details[0].message);

  const notification = new Notification(notificationData);

  const io = getIo();
  io.emit("newNotification", notificationData.for);

  return await notification.save();
};

const updateNotification = async (id, data) => {
  const updatedNotification = await Notification.findByIdAndUpdate(id, data, {
    new: true,
  }).select("-__v");

  if (!updatedNotification) throw new Error("Notification not found");

  return updatedNotification;
};

const getUnreadCount = async (memberId) => {
  const query = {};

  query.for = memberId;
  query.read = false;

  const count = await Notification.countDocuments(query);

  return { count };
};

module.exports = {
  getAllNotificationsWithPageData,
  createNotification,
  updateNotification,
  getUnreadCount,
};
