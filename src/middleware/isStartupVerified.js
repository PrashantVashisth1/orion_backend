/**
 * Express middleware to check if a user (startup) is verified.
 * This should be used *after* the authenticateToken middleware.
 */
export const isStartupVerified = (req, res, next) => {
  // Check if req.user exists and if is_startup_verified is true
  console.log("Startup verified status:", req.user.is_startup_verified);
  if (!req.user || !req.user.is_startup_verified) {
    return res.status(403).json({
      success: false,
      error: {
        code: "ACCOUNT_NOT_VERIFIED",
        message:
          "Your account has not been verified yet. Access is restricted.",
      },
    });
  }

  // If verified, proceed to the next middleware or route handler
  next();
};