import express from "express";
import {
    createEmail,
    deleteEmail,
    getAllEmailById,
    getSentEmails,
    getReceivedEmails
} from "../controllers/email.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

router.route("/create").post(isAuthenticated, createEmail);
router.route("/:id").delete(isAuthenticated, deleteEmail);
router.route("/getallemails").get(isAuthenticated, getAllEmailById); // All emails (sent + received)
router.route("/sent").get(isAuthenticated, getSentEmails); // Only sent emails
router.route("/received").get(isAuthenticated, getReceivedEmails); // Only received emails

export default router;