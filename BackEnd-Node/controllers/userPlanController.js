import UserPlan from "../models/UserPlan.js";
import User from "../models/User.js";
import Plan from "../models/Plan.js";
import sanitizeInput from "../utils/sanitizeInput.js";

const assignPlanToUser = async (req, res) => {
  const data = req.body;

  try {
    const user = await User.findById(data.userId);
    const plan = await Plan.findById(data.planId);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    // If user already has an entry (even canceled), we update instead of creating a duplicate
    let userPlan = await UserPlan.findOne({ userId: data.userId });

    if (userPlan) {
      userPlan.planId = data.planId;
      userPlan.stripeCustomerId = sanitizeInput(data.stripeCustomerId);
      userPlan.stripeSubId = sanitizeInput(data.stripeSubId);
      userPlan.status = sanitizeInput(data.status || "active");
      await userPlan.save();
    } else {
      userPlan = await UserPlan.create({
        userId: data.userId,
        planId: data.planId,
        stripeCustomerId: sanitizeInput(data.stripeCustomerId),
        stripeSubId: sanitizeInput(data.stripeSubId),
        status: sanitizeInput(data.status || "active"),
      });
    }

    return res.json({
      status: 201,
      message: "User plan assigned successfully",
      userPlan,
    });
  } catch (e) {
    console.error("Error assigning plan:", e);
    return res.status(500).json({ message: "Failed to assign plan" });
  }
};

const getUserPlan = async (req, res) => {
  const userId = req.params.userId;

  try {
    const userPlan = await UserPlan.findOne({ userId }).populate(
      "planId",
      "name price featuresJSON"
    );

    if (!userPlan) {
      return res.status(404).json({ message: "User plan not found" });
    }

    return res.json(userPlan);
  } catch (e) {
    console.error("Error retrieving user plan:", e);
    return res.status(500).json({ message: "Failed to fetch user plan" });
  }
};

const updateUserPlan = async (req, res) => {
  const id = req.params.id;
  const data = req.body;

  try {
    const userPlan = await UserPlan.findById(id);
    if (!userPlan)
      return res.status(404).json({ message: "UserPlan entry not found" });

    const updated = await UserPlan.findByIdAndUpdate(
      id,
      {
        planId: data.planId || userPlan.planId,
        stripeCustomerId:
          sanitizeInput(data.stripeCustomerId) || userPlan.stripeCustomerId,
        stripeSubId: sanitizeInput(data.stripeSubId) || userPlan.stripeSubId,
        status: sanitizeInput(data.status) || userPlan.status,
      },
      { new: true }
    );

    return res.json({
      status: 200,
      message: "User plan updated successfully",
      userPlan: updated,
    });
  } catch (e) {
    console.error("Error updating user plan:", e);
    return res.status(500).json({ message: "Failed to update user plan" });
  }
};

const cancelUserPlan = async (req, res) => {
  const id = req.params.id;

  try {
    const userPlan = await UserPlan.findById(id);
    if (!userPlan)
      return res.status(404).json({ message: "UserPlan entry not found" });

    userPlan.status = "canceled";
    await userPlan.save();

    return res.json({
      status: 200,
      message: "User subscription canceled",
      userPlan,
    });
  } catch (e) {
    console.error("Error canceling user plan:", e);
    return res.status(500).json({ message: "Failed to cancel user plan" });
  }
};

const deleteUserPlan = async (req, res) => {
  const id = req.params.id;

  try {
    const userPlan = await UserPlan.findById(id);
    if (!userPlan)
      return res.status(404).json({ message: "UserPlan entry not found" });

    await UserPlan.findByIdAndDelete(id);

    return res.json({
      status: 200,
      message: "User plan deleted successfully",
    });
  } catch (e) {
    console.error("Error deleting user plan:", e);
    return res.status(500).json({ message: "Failed to delete user plan" });
  }
};

export default {
  assignPlanToUser,
  getUserPlan,
  updateUserPlan,
  cancelUserPlan,
  deleteUserPlan,
};
