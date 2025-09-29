import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import mongoose from "mongoose";
import Task from "../models/Task.js";

const router = express.Router();

// ======================
// Create Task
// ======================
router.post("/", async (req, res) => {
  try {
    const { title} = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title are required",
      });
    }

    const newTask = new Task({
      title
    });

    await newTask.save();
    res
      .status(201)
      .json({ success: true, message: "Task created", data: newTask });
  } catch (err) {
    console.error("POST /task ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

// ======================
// Get All Task
// ======================
router.get("/", async (req, res) => {
  try {
    const task = await Task.find().sort({ createdAt: -1 });
    res.json({ success: true, data: task });
  } catch (err) {
    console.error("GET /task ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

// ======================
// Get Single Task
// ======================
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid task ID" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    res.json({ success: true, data: task });
  } catch (err) {
    console.error("GET /task/:id ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

// ======================
// Update Task
// ======================
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid task ID" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    const { title } = req.body;
    task.title = title || task.title;
    await task.save();
    res.json({ success: true, message: "task updated", data: task });
  } catch (err) {
    console.error("PUT /task/:id ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

// ======================
// Delete task
// ======================
// ======================
// Delete task
// ======================
router.delete("/:id", async (req, res) => {
  try {
    console.log("Delete request for:", req.params.id);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid task ID" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    console.log("Found task:", task);

    

    await Task.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Task deleted" });
  } catch (err) {
    console.error("DELETE /task/:id ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});


router.put("/move/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { sourceProjectId, destinationProjectId, position } = req.body;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID"
      });
    }

    // Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Update task with new project ID and position
    task.projectId = destinationProjectId;
    task.position = position || 0;
    task.sortOrder = position || 0;
    await task.save();

    // Update source project (remove task)
    if (sourceProjectId && sourceProjectId !== destinationProjectId) {
      await Project.findByIdAndUpdate(sourceProjectId, {
        $pull: { tasks: { id: taskId } }
      });
    }

    // Update destination project (add/update task)
    const destinationProject = await Project.findById(destinationProjectId);
    if (destinationProject) {
      // Remove task if it already exists
      destinationProject.tasks = destinationProject.tasks.filter(t => t.id !== taskId);
      
      // Add task at correct position
      const taskForProject = {
        id: task.id,
        projectId: destinationProjectId,
        title: task.title,
        description: task.description || '',
        tags: task.tags || [],
        date: task.date || new Date().toLocaleDateString(),
        position: position || 0,
        sortOrder: position || 0
      };

      if (position !== undefined && position < destinationProject.tasks.length) {
        destinationProject.tasks.splice(position, 0, taskForProject);
      } else {
        destinationProject.tasks.push(taskForProject);
      }

      // Update positions for all tasks
      destinationProject.tasks.forEach((t, index) => {
        t.position = index;
        t.sortOrder = index;
      });

      await destinationProject.save();
    }

    res.json({
      success: true,
      message: "Task moved successfully",
      data: {
        task,
        sourceProjectId,
        destinationProjectId,
        position
      }
    });

  } catch (err) {
    console.error("PUT /task/move/:taskId ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

router.put("/:id/project", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID"
      });
    }

    const { projectId, position } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Update task with new project
    task.projectId = projectId;
    task.position = position || 0;
    task.sortOrder = position || 0;
    await task.save();

    res.json({
      success: true,
      message: "Task project updated",
      data: task
    });

  } catch (err) {
    console.error("PUT /task/:id/project ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});


export default router;
