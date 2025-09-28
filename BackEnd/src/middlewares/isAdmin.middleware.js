// middlewares/isAdmin.middleware.js

const isAdmin = (req, res, next) => {
  try {
    // Assuming you have set req.user from authentication middleware
    if (req.user && req.user.role === "admin") {
      next(); // user is admin, allow access
    } else {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error in admin check" });
  }
};

export { isAdmin } 