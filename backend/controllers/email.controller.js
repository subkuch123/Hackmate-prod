// controllers/emailController.js
import sendMail from "../utils/sendMail.js";
import { sendTeamNotification } from "../services/sendTeamEmail.service.js";
import EmailTemplate from "../models/email.model.js";
import User from "../models/user.model.js";

class EmailController {
  // Team Assignment Controllers
  async assignTeamAndNotify(req, res) {
    try {
      const {
        email,
        name,
        hackathonTitle,
        teammates,
        problemStatement,
        teamName,
      } = req.body;

      // Validate required fields
      if (
        !email ||
        !name ||
        !hackathonTitle ||
        !teammates ||
        !problemStatement ||
        !teamName
      ) {
        return res.status(400).json({
          success: false,
          message:
            "All fields are required: email, name, hackathonTitle, teammates, problemStatement, teamName",
        });
      }

      // Validate teammates array
      if (!Array.isArray(teammates) || teammates.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Teammates must be a non-empty array",
        });
      }

      // Send team assignment notification
      await sendTeamNotification({
        email,
        name,
        hackathonTitle,
        teammates,
        problemStatement,
        teamName,
      });

      res.status(200).json({
        success: true,
        message: `Team assignment notification sent successfully to ${email}`,
      });
    } catch (error) {
      console.error("Error in assignTeamAndNotify:", error);
      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Internal server error while sending team notification",
      });
    }
  }

  async assignMultipleTeamMembers(req, res) {
    try {
      const { teamAssignments } = req.body;

      if (!Array.isArray(teamAssignments) || teamAssignments.length === 0) {
        return res.status(400).json({
          success: false,
          message: "teamAssignments must be a non-empty array",
        });
      }

      const results = [];
      const errors = [];

      // Send notifications to all team members
      for (const assignment of teamAssignments) {
        try {
          await sendTeamNotification(assignment);
          results.push({
            email: assignment.email,
            status: "success",
            message: "Notification sent successfully",
          });
        } catch (error) {
          errors.push({
            email: assignment.email,
            status: "failed",
            message: error.message,
          });
        }
      }

      res.status(200).json({
        success: true,
        message: `Processed ${results.length} notifications successfully, ${errors.length} failed`,
        results,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error) {
      console.error("Error in assignMultipleTeamMembers:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error while processing team assignments",
      });
    }
  }

  async getTeamAssignmentStatus(req, res) {
    try {
      res.status(200).json({
        success: true,
        message: "Team assignment service is operational",
        service: "email-notification",
        status: "active",
      });
    } catch (error) {
      console.error("Error in getTeamAssignmentStatus:", error);
      res.status(500).json({
        success: false,
        message: "Error checking team assignment status",
      });
    }
  }

  // Bulk Email Controllers
  async sendBulkEmails(req, res) {
    try {
      const { templateId, recipientIds, dynamicData = {} } = req.body;

      if (!templateId || !recipientIds) {
        return res.status(400).json({
          success: false,
          message: "templateId and recipientIds are required",
        });
      }

      // Get template
      const template = await EmailTemplate.findById(templateId);
      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Template not found",
        });
      }

      // Get recipients
      const recipients = await User.find({ _id: { $in: recipientIds } });

      if (recipients.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No recipients found",
        });
      }

      const results = [];

      // Send emails to each recipient
      for (const recipient of recipients) {
        try {
          // Replace dynamic placeholders in template
          let emailContent = template.content;
          let emailSubject = template.subject;

          // Replace common placeholders
          emailContent = emailContent.replace(
            /{{name}}/g,
            recipient.name || recipient.email
          );
          emailContent = emailContent.replace(/{{email}}/g, recipient.email);
          emailSubject = emailSubject.replace(
            /{{name}}/g,
            recipient.name || recipient.email
          );

          // Replace custom dynamic data
          Object.keys(dynamicData).forEach((key) => {
            const placeholder = `{{${key}}}`;
            const regex = new RegExp(placeholder, "g");
            emailContent = emailContent.replace(regex, dynamicData[key]);
            emailSubject = emailSubject.replace(regex, dynamicData[key]);
          });

          // Send email using our sendMail utility
          await sendMail({
            email: recipient.email,
            subject: emailSubject,
            template: "customTemplate.ejs", // You might want to create this
            data: {
              content: emailContent,
              name: recipient.name,
              ...dynamicData,
            },
          });

          results.push({
            recipient: recipient.email,
            status: "success",
            message: "Email sent successfully",
          });
        } catch (error) {
          results.push({
            recipient: recipient.email,
            status: "error",
            message: error.message,
          });
        }
      }

      res.json({
        success: true,
        message: "Email sending process completed",
        results,
      });
    } catch (error) {
      console.error("Error sending bulk emails:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error while sending bulk emails",
      });
    }
  }

  // Get all email templates
  async getTemplates(req, res) {
    try {
      const templates = await EmailTemplate.find().sort({ createdAt: -1 });
      res.json({
        success: true,
        data: templates,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch templates",
      });
    }
  }

  // Create new template
  async createTemplate(req, res) {
    try {
      const { name, subject, content } = req.body;

      if (!name || !subject || !content) {
        return res.status(400).json({
          success: false,
          message: "Name, subject, and content are required",
        });
      }

      const template = new EmailTemplate({ name, subject, content });
      await template.save();

      res.status(201).json({
        success: true,
        data: template,
        message: "Template created successfully",
      });
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create template",
      });
    }
  }
}

export default new EmailController();
