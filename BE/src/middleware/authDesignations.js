const authorizeDesignations = (allowedDesignations) => {
  return (req, res, next) => {
    if (!req.user || !allowedDesignations.includes(req.user.designation)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

module.exports = authorizeDesignations;
