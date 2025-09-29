const jwt = require("jsonwebtoken");

const publicRoutes = [
  { method: "GET", path: "/departments" },
  { method: "GET", path: "/designations" },
];

const authMiddleware = (req, res, next) => {
  const isPublic = publicRoutes.some(
    (route) => route.method === req.method && route.path === req.path
  );

  if (isPublic) {
    return next();
  }

  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res
      .status(403)
      .json({ message: "Access denied, no token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(403).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
