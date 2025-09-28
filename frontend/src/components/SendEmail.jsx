import React, { useEffect, useState } from 'react'
import { RxCross1 } from 'react-icons/rx'
import { useDispatch, useSelector } from 'react-redux'
import { setOpen, setEmails } from '../redux/gmailSlice';
import axios from 'axios';
import toast from 'react-hot-toast';

const SendEmail = () => {
    const [formData, setFormData] = useState({
        to: '',
        subject: '',
        message: ''
    });
    const { open, emails, composeMode, replyToEmail, user } = useSelector(store => store.gmail);
    const dispatch = useDispatch();

    const changeHandler = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    // Handle different compose modes
    useEffect(() => {
        if (open) {
            if (composeMode === 'reply' && replyToEmail) {
                // For reply, set the 'to' as the sender's email
                const senderEmail = replyToEmail.userId?.email || replyToEmail.from || '';
                setFormData({
                    to: senderEmail,
                    subject: `Re: ${replyToEmail.subject || ''}`,
                    message: `\n\n\n---------- Original Message ----------\nFrom: ${senderEmail}\nDate: ${new Date(replyToEmail.createdAt).toLocaleString()}\nSubject: ${replyToEmail.subject}\n\n${replyToEmail.message}`
                });
            } else if (composeMode === 'forward' && replyToEmail) {
                // For forward, keep 'to' empty but include original message
                setFormData({
                    to: '',
                    subject: `Fwd: ${replyToEmail.subject || ''}`,
                    message: `\n\n\n---------- Forwarded Message ----------\nFrom: ${replyToEmail.userId?.email || replyToEmail.from || ''}\nDate: ${new Date(replyToEmail.createdAt).toLocaleString()}\nSubject: ${replyToEmail.subject}\nTo: ${replyToEmail.to}\n\n${replyToEmail.message}`
                });
            } else {
                // New email
                setFormData({
                    to: '',
                    subject: '',
                    message: ''
                });
            }
        }
    }, [open, composeMode, replyToEmail]);

    const API_URL = import.meta.env.VITE_BACKEND_URL;

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/api/v1/email/create`, formData, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            //Properly spread the emails array and add new email
            const updatedEmails = Array.isArray(emails) ? [...emails, res.data.email] : [res.data.email];
            dispatch(setEmails(updatedEmails));

            toast.success('Email sent successfully!');

            // Close the compose dialog
            dispatch(setOpen(false));
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
        dispatch(setOpen(false));
    }

    const getTitle = () => {
        if (composeMode === 'reply') return 'Reply';
        if (composeMode === 'forward') return 'Forward';
        return 'New Message';
    }

    return (
        <div className={`${open ? 'block' : 'hidden'} bg-white max-w-6xl shadow-xl shadow-slate-600 rounded-t-md`}>
            <div className='flex items-center justify-between px-4 py-2 bg-[#F2F6FC]'>
                <h1>{getTitle()}</h1>
                <div onClick={() => dispatch(setOpen(false))} className='p-2 rounded-full hover:bg-gray-200 cursor-pointer'>
                    <RxCross1 size={20} />
                </div>
            </div>
            <form onSubmit={submitHandler} className='flex flex-col gap-2 p-4'>
                <input value={formData.to} onChange={changeHandler} name='to' type='text' placeholder='To' className='outline-none border-b border-gray-300 py-1' />
                <input value={formData.subject} onChange={changeHandler} name='subject' type='text' placeholder='Subject' className='outline-none border-b border-gray-300 py-1' />
                <textarea value={formData.message} onChange={changeHandler} name='message' placeholder='Message' rows={'12'} cols={'30'} className='outline-none border-b border-gray-300 py-1'></textarea>
                <button type='submit' className='bg-blue-700 text-white py-1 px-5 rounded-full w-fit'>Send</button>
            </form>
        </div>
    )
}

export default SendEmail