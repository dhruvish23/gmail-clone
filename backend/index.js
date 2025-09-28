import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/connectDB.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRoute from './routes/user.route.js';
import emailRoute from './routes/email.route.js';

dotenv.config({});
connectDB();
const PORT = process.env.PORT || 8080;

// ------------server creation------------------- 
const app = express();
// to test the server is running write this block and run localhost:8080/home
// app.get('/home', (req, res) => {
//     return res.status(200).json({ message: "Server is running", success: true })
// })

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Dynamic CORS for local + prod
const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
};
app.use(cors(corsOptions));

// routes
app.use('/api/v1/user', userRoute);
app.use('/api/v1/email', emailRoute);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
// ----------------------------------------------