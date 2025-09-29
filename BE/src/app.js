const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { init, getIo } = require("./config/socket.js");
const userRoutes = require("./routes/user.routes.js");
const designationRoutes = require("./routes/designation.routes.js");
const departmentRoutes = require("./routes/department.routes.js");
const taskRoutes = require("./routes/task.routes.js");
const notificationRoutes = require("./routes/notification.routes.js");
const authRoutes = require("./routes/auth.routes.js");
const authMiddleware = require("./middleware/authMiddleware.js");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

init(server);

const io = getIo();

const startServer = async () => {
  try {
    await connectDB();
    console.log("Database connected successfully");

    app.use(express.json());
    app.use(
      cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
      })
    );

    app.get("/", (req, res) => {
      res.send("Hello! Welcome to Task Management System.");
    });
    app.use("/auth", authRoutes);
    app.use(
      "/images",
      express.static(path.join(process.cwd(), `${process.env.IMG_PATH}`))
    );

    app.use(authMiddleware);

    app.use("/users", userRoutes);
    app.use("/designations", designationRoutes);
    app.use("/departments", departmentRoutes);
    app.use(
      "/tasks",
      (req, res, next) => {
        req.io = io;
        next();
      },
      taskRoutes
    );
    app.use("/notifications", notificationRoutes);

    const port = process.env.PORT;
    console.log("Port: ", port);

    server.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
    process.exit(1);
  }
};

startServer();
