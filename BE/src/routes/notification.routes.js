const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/notification.controller");
const authorizeDesignation = require("../middleware/authDesignations");

router.get(
  "/pagedata",
  authorizeDesignation(["Member"]),
  NotificationController.getNotificationsWithPagination
);

router.get(
  "/unread-count",
  authorizeDesignation(["Member"]),
  NotificationController.getUnreadCount
);

router.put(
  "/read/:id",
  authorizeDesignation(["Member"]),
  NotificationController.updateNotification
);

module.exports = router;
