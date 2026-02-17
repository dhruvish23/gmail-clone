import express from 'express';
import { register, login, logout, googleLogin, forgotPassword, resetPassword } from '../controllers/user.controller.js';

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/google-login').post(googleLogin);
router.route('/logout').get(logout);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);

export default router;