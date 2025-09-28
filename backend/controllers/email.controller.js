import { Email } from "../models/email.model.js";
import { User } from "../models/user.model.js";

export const createEmail = async (req, res) => {
    try {
        const userId = req.id;
        const { to, subject, message } = req.body;
        if (!to || !subject || !message) return res.status(400).json({ message: "All fields are required", success: false });

        const email = await Email.create({
            to,
            subject,
            message,
            userId
        });

        return res.status(201).json({
            email
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const deleteEmail = async (req, res) => {
    try {
        const emailId = req.params.id;

        if (!emailId) return res.status(400).json({ message: "Email id is required" });

        const email = await Email.findByIdAndDelete(emailId);

        if (!email) return res.status(404).json({ message: "Email is not found" });

        return res.status(200).json({ message: "Email Deleted successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

// Get all emails (both sent and received)
export const getAllEmailById = async (req, res) => {
    try {
        const userId = req.id;

        // Get the current user's email
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        // Find emails where user is either sender OR recipient
        const emails = await Email.find({
            $or: [
                { userId: userId }, // Sent emails
                { to: currentUser.email } // Received emails
            ]
        })
            .populate('userId', 'fullname email') // Populate sender details
            .sort({ createdAt: -1 });

        // Add a field to distinguish sent vs received emails
        const emailsWithType = emails.map(email => ({
            ...email.toObject(),
            emailType: email.userId._id.toString() === userId ? 'sent' : 'received'
        }));

        return res.status(200).json({ emails: emailsWithType });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

// Get only sent emails
export const getSentEmails = async (req, res) => {
    try {
        const userId = req.id;

        const emails = await Email.find({ userId })
            .populate('userId', 'fullname email')
            .sort({ createdAt: -1 });

        return res.status(200).json({ emails });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

// Get only received emails
export const getReceivedEmails = async (req, res) => {
    try {
        const userId = req.id;

        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        const emails = await Email.find({ to: currentUser.email })
            .populate('userId', 'fullname email')
            .sort({ createdAt: -1 });

        return res.status(200).json({ emails });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}