import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios';
import toast from 'react-hot-toast';

const Signup = () => {
    const [input, setInput] = useState({
        fullname: "",
        email: "",
        password: ""
    });

    const navigate = useNavigate();

    const changeHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value })
    }

    const API_URL = import.meta.env.VITE_BACKEND_URL;

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/api/v1/user/register`, input, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                navigate('/login');
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    }

    return (
        <div className='flex item-center justify-center w-screen pt-20'>
            <form onSubmit={submitHandler} className='flex flex-col gap-3 p-4 bg-white rounded-md shadow-md shadow-slate-600 w-[25%]'>
                <h1 className='font-bold text-2xl uppercase my-2'>Signup</h1>
                <input onChange={changeHandler} value={input.fullname} name='fullname' type='text' placeholder='Name' className='border border-gray-400 rounded-md px-2 py-1' />
                <input onChange={changeHandler} value={input.email} name='email' type='text' placeholder='Email' className='border border-gray-400 rounded-md px-2 py-1' />
                <input onChange={changeHandler} value={input.password} name='password' type='password' placeholder='Password' className='border border-gray-400 rounded-md px-2 py-1' />
                <button type='submit' className='bg-gray-800 text-white px-2 py-1 rounded-md'>Signup</button>
                <p>Already have an account? <Link to={'/login'} className='text-blue-600'>Login</Link></p>
            </form>
        </div>
    )
}

export default Signup