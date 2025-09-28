import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try {
        const { fullname, email, password } = req.body;
        if (!fullname || !email || !password) return res.status(400).json({ message: "All fields are required", success: false });

        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists", success: false });

        const hashedPassword = await bcrypt.hash(password, 10);
        const profilePhoto = `https://avatar.iran.liara.run/public`
        await User.create({
            fullname,
            email,
            password: hashedPassword,
            profilePhoto,
            authProvider: 'local'
        });

        return res.status(201).json({ message: "User created successfully", success: true });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "All fields are required", success: false });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found", success: false });

        // Check if user registered with Google
        if (user.authProvider === 'google' && !user.password) {
            return res.status(401).json({
                message: "Please sign in with Google.",
                success: false
            })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Incorrect email or password.",
                success: false
            })
        }

        const tokenData = { userId: user._id };
        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: "1d" });

        return res.status(200).cookie("token", token, { maxAge: 12 * 60 * 60 * 1000, httpOnly: true, secure: true, sameSite: "none" }).json({
            message: `${user.fullname} logged in successfully.`,
            user,
            success: true
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

        console.log('Received Google login request:', { email, fullname, profilePhoto: profilePhoto?.substring(0, 50) + '...', googleId });

        if (!email || !fullname || !googleId) {
            return res.status(400).json({
                message: "Missing required Google user information.",
                success: false
            });
        }

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
            console.log('Existing user found:', user);

            // User exists - check if it's the same auth provider
            if (user.authProvider === 'local') {
                // User previously registered with email/password
                // Update the account to support both methods
                user.googleId = googleId;
                // Update profile photo if Google provides a better one
                if (profilePhoto && profilePhoto !== 'null' && profilePhoto !== 'undefined') {
                    user.profilePhoto = profilePhoto;
                }
                await user.save();
                console.log('Updated existing local user with Google info');
            } else if (user.googleId !== googleId) {
                return res.status(401).json({
                    message: "Email already associated with different account.",
                    success: false
                });
            } else {
                // Same Google user logging in again - update profile photo if changed
                if (profilePhoto && profilePhoto !== user.profilePhoto) {
                    user.profilePhoto = profilePhoto;
                    await user.save();
                    console.log('Updated profile photo for existing Google user');
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
                authProvider: 'google'
            });
            console.log('Created new Google user:', user);
        }

        // Generate JWT token
        const tokenData = { userId: user._id };
        const token = jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        // Prepare user object to send back (ensure all fields are included)
        const userResponse = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            profilePhoto: user.profilePhoto,
            authProvider: user.authProvider,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        console.log('Sending user response:', userResponse);

        return res.status(200).cookie("token", token, {
            maxAge: 1 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        }).json({
            message: `Welcome ${user.fullname}`,
            user: userResponse,
            success: true
        });

    } catch (error) {
        console.error('Google login error:', error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

export const logout = async (req, res) => {
    try {
        // res.clearCookie("token");
        return res.status(200).cookie("token", "", {
            maxAge: 0,
            httpOnly: true,
            secure: true,
            sameSite: "none"
        }).json({
            message: "User logged out successfully.", success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
};