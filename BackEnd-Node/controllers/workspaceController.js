import Workspace from "../models/Workspace.js";
import Budget from "../models/Budget.js";
import sanitizeInput from "../utils/sanitizeInput.js";
import mongoose from "mongoose";
import { validationResult } from "express-validator";

const createWorkspace = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const data = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const ws = await Workspace.create(
      [
        {
          name: sanitizeInput(data.name),
          ownerId: req.userId,
        },
      ],
      { session }
    );

    // Every workspace needs a budget to function
    await Budget.create(
      [
        {
          workspaceId: ws._id,
          monthlyCap: 1000, // Default cap
          alertThreshold: 80,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return res.json({
      status: 201,
      message: "Workspace created successfully",
      workspace: ws,
    });
  } catch (e) {
    await session.abortTransaction();
    console.error("Error creating workspace:", e);
    return res.status(500).json({ message: "Failed to create workspace" });
  } finally {
    session.endSession();
  }
};

const getMyWorkspaces = async (req, res) => {
  const userId = req.userId;

  const workspaces = await Workspace.find({ ownerId: userId }).sort({
    createdAt: -1,
  });

  return res.json(workspaces);
};

const getWorkspace = async (req, res) => {
  const id = req.params.id;

  const ws = await Workspace.findById(id);
  if (!ws) return res.status(404).json({ message: "Workspace not found" });

  const isOwner = ws.ownerId.toString() === req.userId;
  return res.json({ workspace: ws, isOwner });
};

const updateWorkspace = async (req, res) => {
  const id = req.params.id;
  const data = req.body;

  try {
    const ws = await Workspace.findOneAndUpdate(
      { _id: id, ownerId: req.userId },
      { name: sanitizeInput(data.name) },
      { new: true }
    );

    if (!ws)
      return res.status(403).json({ message: "Not allowed or not found" });

    return res.json({
      status: 200,
      message: "Workspace updated successfully",
      workspace: ws,
    });
  } catch (e) {
    console.error("Error updating workspace:", e);
    return res.status(500).json({ message: "Failed to update workspace" });
  }
};

const deleteWorkspace = async (req, res) => {
  const id = req.params.id;

  try {
    const ws = await Workspace.findOneAndDelete({
      _id: id,
      ownerId: req.userId,
    });

    if (!ws)
      return res.status(403).json({ message: "Not allowed or not found" });

    return res.json({
      status: 200,
      message: "Workspace deleted successfully",
    });
  } catch (e) {
    console.error("Error deleting workspace:", e);
    return res.status(500).json({ message: "Failed to delete workspace" });
  }
};

export default {
  createWorkspace,
  getMyWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
};
