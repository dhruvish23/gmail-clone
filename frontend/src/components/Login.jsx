import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setAuthUser } from "../redux/gmailSlice";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
	apiKey: "AIzaSyA7TGlQR-_vZpAK0hlSyp_pViTh2X6SVkI",
	authDomain: "clone-f682b.firebaseapp.com",
	projectId: "clone-f682b",
	storageBucket: "clone-f682b.firebasestorage.app",
	messagingSenderId: "305371823565",
	appId: "1:305371823565:web:d050c3ebd6ed9d8fc29884",
	measurementId: "G-YZMLJMNZD6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const Login = () => {
	const [input, setInput] = useState({
		email: "",
		password: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const changeHandler = (e) => {
		setInput({ ...input, [e.target.name]: e.target.value });
	};
	const API_URL = import.meta.env.VITE_BACKEND_URL;

	const submitHandler = async (e) => {
		e.preventDefault();
		console.log(input);
		try {
			const res = await axios.post(
				`${API_URL}/api/v1/user/login`,
				input,
				{
					headers: {
						"Content-Type": "application/json",
					},
					withCredentials: true,
				},
			);

			if (res.data.success) {
				console.log(
					"Local login successful, user data:",
					res.data.user,
				);
				dispatch(setAuthUser(res.data.user));
				navigate("/");
				toast.success(res.data.message);
			}
		} catch (error) {
			console.log(error);
			toast.error(error.response.data.message);
		}
	};

	const handleGoogleSignIn = async () => {
		setIsLoading(true);
		try {
			// Sign in with Google popup
			const result = await signInWithPopup(auth, googleProvider);
			const user = result.user;

			console.log("Google user from Firebase:", user);

			// Send Google user data to your backend
			const googleUserData = {
				email: user.email,
				fullname: user.displayName,
				profilePhoto: user.photoURL,
				googleId: user.uid,
				provider: "google",
			};

			console.log("Sending to backend:", googleUserData);

			// Call your backend API to handle Google login
			const res = await axios.post(
				`${API_URL}/api/v1/user/google-login`,
				googleUserData,
				{
					headers: {
						"Content-Type": "application/json",
					},
					withCredentials: true,
				},
			);

			if (res.data.success) {
				console.log(
					"Google login successful, user data from backend:",
					res.data.user,
				);

				// Ensure the user object has all required fields
				const userData = {
					_id: res.data.user._id,
					fullname: res.data.user.fullname,
					email: res.data.user.email,
					profilePhoto: res.data.user.profilePhoto,
					authProvider: res.data.user.authProvider,
				};
				console.log("Setting auth user in Redux:", userData);
				dispatch(setAuthUser(userData));
				navigate("/");
				toast.success("Successfully logged in with Google!");
			}
		} catch (error) {
			console.error("Google Sign-In Error:", error);
			toast.error("Failed to sign in with Google");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex item-center justify-center w-screen pt-20">
			<form
				onSubmit={submitHandler}
				className="flex flex-col gap-3 p-4 bg-white rounded-md shadow-md shadow-slate-600 w-[25%]"
			>
				<h1 className="font-bold text-2xl uppercase my-2">Login</h1>
				<input
					onChange={changeHandler}
					value={input.email}
					name="email"
					type="text"
					placeholder="Email"
					className="border border-gray-400 rounded-md px-2 py-1"
				/>
				<input
					onChange={changeHandler}
					value={input.password}
					name="password"
					type="password"
					placeholder="Password"
					className="border border-gray-400 rounded-md px-2 py-1"
				/>
				<button
					type="submit"
					disabled={isLoading}
					className="bg-gray-800 text-white px-2 py-1 rounded-md"
				>
					Login
				</button>
				<p className="text-sm text-blue-600 text-center">
					<Link to="/forgot-password">Forgot Password?</Link>
				</p>
				<div className="flex items-center gap-2 my-2">
					<div className="flex-1 h-[1px] bg-gray-300"></div>
					<span className="text-gray-500 text-sm">OR</span>
					<div className="flex-1 h-[1px] bg-gray-300"></div>
				</div>

				<button
					type="button"
					onClick={handleGoogleSignIn}
					disabled={isLoading}
					className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-800 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isLoading ? (
						<span>Signing in...</span>
					) : (
						<>
							<svg className="w-5 h-5" viewBox="0 0 24 24">
								<path
									fill="#4285F4"
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								/>
								<path
									fill="#34A853"
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								/>
								<path
									fill="#FBBC05"
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								/>
								<path
									fill="#EA4335"
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								/>
							</svg>
							Sign in with Google
						</>
					)}
				</button>

				<p>
					Don't have an account?{" "}
					<Link to={"/signup"} className="text-blue-600">
						Signup
					</Link>
				</p>
			</form>
		</div>
	);
};

export default Login;
