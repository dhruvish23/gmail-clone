import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: function() {
            return !this.googleId; // Password required only if not Google auth
        }
    },
    profilePhoto: { 
        type: String, 
        required: true 
    },
    googleId: { 
        type: String, 
        sparse: true // Allows null values while maintaining uniqueness
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);