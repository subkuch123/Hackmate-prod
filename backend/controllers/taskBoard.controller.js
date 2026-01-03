// controllers/taskMemberController.js
import Task from "../models/TeamtaskBoard.model.js";
import Team from "../models/team.model.js";
import User from "../models/user.model.js";
import Hackathon from "../models/hackathon.model.js";

// 🎯 Create a new task
export const createTask = async (req, res) => {
  try {
    const {
      hackathonId,
      teamId,
      title,
      description,
      assignedTo,
      priority = "Medium",
    } = req.body;

    const createdBy = req.user._id; // Assuming user ID comes from auth middleware

    // Validate required fields
    if (!hackathonId || !teamId || !title || !assignedTo) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: hackathonId, teamId, title, assignedTo",
      });
    }

    // Check if hackathon exists
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    // Check if team exists and belongs to the hackathon
    const team = await Team.findOne({
      _id: teamId,
      hackathonId: hackathonId,
    }).populate("members");

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found or team does not belong to this hackathon",
      });
    }

    // Check if assigned user is a member of the team
    const isMember = team.members.some(
      (member) => member._id.toString() === assignedTo.toString()
    );

    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: "Assigned user is not a member of this team",
      });
    }

    // Check if creator is a member of the team
    const isCreatorMember = team.members.some(
      (member) => member._id.toString() === createdBy.toString()
    );

    if (!isCreatorMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this team",
      });
    }

    // Create new task
    const task = new Task({
      hackathonId,
      teamId,
      title,
      description,
      assignedTo,
      createdBy,
      priority,
    });

    await task.save();

    // Populate the task with user details
    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: populatedTask,
    });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// 📋 Get all tasks for a team
export const getTeamTasks = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user._id;

    // Check if team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Check if user is a member of the team
    const isMember = team.members.some(
      (member) => member.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not a member of this team",
      });
    }

    // Get tasks with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tasks = await Task.find({ teamId })
      .populate("assignedTo", "name email avatar")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalTasks = await Task.countDocuments({ teamId });

    res.status(200).json({
      success: true,
      message: "Tasks retrieved successfully",
      data: {
        tasks,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalTasks / limit),
          totalTasks,
          hasNext: page < Math.ceil(totalTasks / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get team tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// 👤 Get tasks assigned to current user in a team
export const getMyTasks = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user._id;

    // Check if team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Check if user is a member of the team
    const isMember = team.members.some(
      (member) => member.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not a member of this team",
      });
    }

    const tasks = await Task.find({
      teamId,
      assignedTo: userId,
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Your tasks retrieved successfully",
      data: tasks,
    });
  } catch (error) {
    console.error("Get my tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// 🔄 Update task status
export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    // Validate status
    const validStatuses = ["Pending", "In Progress", "Completed", "Blocked"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Must be one of: Pending, In Progress, Completed, Blocked",
      });
    }

    const task = await Task.findById(taskId).populate("teamId");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user is assigned to the task or is a team member
    const isAssigned = task.assignedTo.toString() === userId.toString();
    const isTeamMember = task.teamId.members.some(
      (member) => member.toString() === userId.toString()
    );

    if (!isAssigned && !isTeamMember) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You are not assigned to this task or not a team member",
      });
    }

    task.status = status;
    await task.save();

    const updatedTask = await Task.findById(taskId)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    console.error("Update task status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ✏️ Update task details
export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, assignedTo, priority } = req.body;
    const userId = req.user._id;

    const task = await Task.findById(taskId).populate("teamId");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user is the creator or a team admin (you can add role-based checks)
    const isCreator = task.createdBy.toString() === userId.toString();
    if (!isCreator) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only task creator can update task details",
      });
    }

    // If reassigning, check if new assignee is a team member
    if (assignedTo) {
      const isNewAssigneeMember = task.teamId.members.some(
        (member) => member.toString() === assignedTo.toString()
      );

      if (!isNewAssigneeMember) {
        return res.status(400).json({
          success: false,
          message: "New assigned user is not a member of this team",
        });
      }
    }

    // Update task fields
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo) task.assignedTo = assignedTo;
    if (priority) task.priority = priority;

    await task.save();

    const updatedTask = await Task.findById(taskId)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// 🗑️ Delete task
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user is the creator
    const isCreator = task.createdBy.toString() === userId.toString();
    if (!isCreator) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only task creator can delete the task",
      });
    }

    await Task.findByIdAndDelete(taskId);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// 📊 Get task statistics for a team
export const getTaskStatistics = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user._id;

    // Check if team exists and user is member
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    const isMember = team.members.some(
      (member) => member.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not a member of this team",
      });
    }

    const stats = await Task.aggregate([
      { $match: { teamId: team._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalTasks = await Task.countDocuments({ teamId });
    const completedTasks =
      stats.find((stat) => stat._id === "Completed")?.count || 0;
    const completionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    res.status(200).json({
      success: true,
      message: "Task statistics retrieved successfully",
      data: {
        stats,
        totalTasks,
        completedTasks,
        completionRate: Math.round(completionRate),
      },
    });
  } catch (error) {
    console.error("Get task statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
