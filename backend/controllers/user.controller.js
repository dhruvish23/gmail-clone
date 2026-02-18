import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Resend } from "resend";

export const register = async (req, res) => {
	try {
		const { fullname, email, password } = req.body;
		if (!fullname || !email || !password)
			return res
				.status(400)
				.json({ message: "All fields are required", success: false });

		const user = await User.findOne({ email });
		if (user)
			return res
				.status(400)
				.json({ message: "User already exists", success: false });

		const hashedPassword = await bcrypt.hash(password, 10);
		const profilePhoto = `https://avatar.iran.liara.run/public`;
		await User.create({
			fullname,
			email,
			password: hashedPassword,
			profilePhoto,
			authProvider: "local",
		});

		return res
			.status(201)
			.json({ message: "User created successfully", success: true });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password)
			return res
				.status(400)
				.json({ message: "All fields are required", success: false });

		const user = await User.findOne({ email });
		if (!user)
			return res
				.status(400)
				.json({ message: "User not found", success: false });

		// Check if user registered with Google
		if (user.authProvider === "google" && !user.password) {
			return res.status(401).json({
				message: "Please sign in with Google.",
				success: false,
			});
		}

		const isPasswordCorrect = await bcrypt.compare(password, user.password);
		if (!isPasswordCorrect) {
			return res.status(401).json({
				message: "Incorrect email or password.",
				success: false,
			});
		}

		const tokenData = { userId: user._id };
		const token = await jwt.sign(tokenData, process.env.SECRET_KEY, {
			expiresIn: "1d",
		});
		const isProduction = process.env.NODE_ENV === "production";

		return res
			.status(200)
			.cookie("token", token, {
				maxAge: 12 * 60 * 60 * 1000,
				httpOnly: true,
				secure: isProduction,
				sameSite: isProduction ? "none" : "lax",
			})
			.json({
				message: `${user.fullname} logged in successfully.`,
				user,
				success: true,
			});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: error.message });
	}
};

// New Google login function
export const googleLogin = async (req, res) => {
	try {
		const { email, fullname, profilePhoto, googleId, provider } = req.body;

		console.log("Received Google login request:", {
			email,
			fullname,
			profilePhoto: profilePhoto?.substring(0, 50) + "...",
			googleId,
		});

		if (!email || !fullname || !googleId) {
			return res.status(400).json({
				message: "Missing required Google user information.",
				success: false,
			});
		}

		// Check if user already exists
		let user = await User.findOne({ email });

		if (user) {
			console.log("Existing user found:", user);

			// User exists - check if it's the same auth provider
			if (user.authProvider === "local") {
				// User previously registered with email/password
				// Update the account to support both methods
				user.googleId = googleId;
				// Update profile photo if Google provides a better one
				if (
					profilePhoto &&
					profilePhoto !== "null" &&
					profilePhoto !== "undefined"
				) {
					user.profilePhoto = profilePhoto;
				}
				await user.save();
				console.log("Updated existing local user with Google info");
			} else if (user.googleId !== googleId) {
				return res.status(401).json({
					message: "Email already associated with different account.",
					success: false,
				});
			} else {
				// Same Google user logging in again - update profile photo if changed
				if (profilePhoto && profilePhoto !== user.profilePhoto) {
					user.profilePhoto = profilePhoto;
					await user.save();
					console.log(
						"Updated profile photo for existing Google user",
					);
				}
			}
		} else {
			// Create new user with Google auth
			const defaultAvatar = `https://avatar.iran.liara.run/public/boy`;
			user = await User.create({
				fullname,
				email,
				profilePhoto: profilePhoto || defaultAvatar,
				googleId,
				authProvider: "google",
			});
			console.log("Created new Google user:", user);
		}

		// Generate JWT token
		const tokenData = { userId: user._id };
		const token = jwt.sign(tokenData, process.env.SECRET_KEY, {
			expiresIn: "1d",
		});

		// Prepare user object to send back (ensure all fields are included)
		const userResponse = {
			_id: user._id,
			fullname: user.fullname,
			email: user.email,
			profilePhoto: user.profilePhoto,
			authProvider: user.authProvider,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};

		console.log("Sending user response:", userResponse);
		const isProduction = process.env.NODE_ENV === "production";

		return res
			.status(200)
			.cookie("token", token, {
				maxAge: 1 * 24 * 60 * 60 * 1000,
				httpOnly: true,
				secure: isProduction,
				sameSite: isProduction ? "none" : "lax",
			})
			.json({
				message: `Welcome ${user.fullname}`,
				user: userResponse,
				success: true,
			});
	} catch (error) {
		console.error("Google login error:", error);
		return res.status(500).json({
			message: "Internal server error",
			success: false,
		});
	}
};

export const forgotPassword = async (req, res) => {
	try {
		const resend = new Resend(process.env.RESEND_API_KEY);
		if (!process.env.RESEND_API_KEY) {
			throw new Error("RESEND_API_KEY is missing");
		}
		console.log("Forgot password route hit");

		const { email } = req.body;

		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(32).toString("hex");

		// Hash token before saving (security best practice)
		const hashedToken = crypto
			.createHash("sha256")
			.update(resetToken)
			.digest("hex");

		user.resetPasswordToken = hashedToken;
		user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

		await user.save();

		// Create reset URL
		const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

		// Send email via Resend
		await resend.emails.send({
			from: "Gmail Clone <onboarding@resend.dev>", // default allowed sender
			to: user.email,
			subject: "Password Reset Request",
			html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" target="_blank">Reset Password</a>
        <p>This link expires in 15 minutes.</p>
      `,
		});

		console.log("Email sent successfully via Resend");

		res.status(200).json({
			message: "Password reset email sent successfully",
		});
	} catch (error) {
		console.error("Forgot password error:", error);
		res.status(500).json({
			message: "Something went wrong",
		});
	}
};

export const resetPassword = async (req, res) => {
	try {
		const { token } = req.params;
		const { password } = req.body;

		const hashedToken = crypto
			.createHash("sha256")
			.update(token)
			.digest("hex");

		const user = await User.findOne({
			resetPasswordToken: hashedToken,
			resetPasswordExpire: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({
				message: "Invalid or expired token",
				success: false,
			});
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		user.password = hashedPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;

		await user.save();

		return res.status(200).json({
			message: "Password reset successful",
			success: true,
		});
	} catch (error) {
		return res.status(500).json({
			message: error.message,
			success: false,
		});
	}
};

export const logout = async (req, res) => {
	try {
		// res.clearCookie("token");
		return res
			.status(200)
			.cookie("token", "", {
				maxAge: 0,
				httpOnly: true,
				secure: true,
				sameSite: "none",
			})
			.json({
				message: "User logged out successfully.",
				success: true,
			});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: "Internal server error",
			success: false,
		});
	}
};
