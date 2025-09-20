import * as userActivityModel from "../models/userActivityModel.js";

export const getUserActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const activities = await userActivityModel.getUserActivities(userId);
    res.json({
      success: true,
      data: { activities },
      message: "User activities fetched successfully",
    });
    console.log("abc")
  } catch (error) {
    console.error("Error fetching user activities:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to retrieve user activities",
      },
    });
  }
};