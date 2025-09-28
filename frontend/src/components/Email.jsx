import React from 'react'
import { MdCropSquare, MdOutlineStarBorder } from 'react-icons/md'
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSelectedEmail } from '../redux/gmailSlice';

const Email = ({ email }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const openMail = () => {
        dispatch(setSelectedEmail(email));
        navigate(`/mail/${email._id}`);
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();

        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHours = Math.floor(diffMin / 60);
        const diffDays = Math.floor(diffHours / 24);

        // Just now
        if (diffSec < 60) {
            return "Just now";
        }

        // Minutes ago
        if (diffMin < 60) {
            return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
        }

        // Today → show time
        const isToday =
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();

        if (isToday) {
            return date.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            });
        }

        // Yesterday
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        if (
            date.getDate() === yesterday.getDate() &&
            date.getMonth() === yesterday.getMonth() &&
            date.getFullYear() === yesterday.getFullYear()
        ) {
            return "Yesterday";
        }

        // Same year → Month Day (e.g. Sep 28)
        if (date.getFullYear() === now.getFullYear()) {
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
        }

        // Older → MM/DD/YY
        return date.toLocaleDateString("en-US", {
            year: "2-digit",
            month: "2-digit",
            day: "2-digit",
        });
    };


    return (
        <div onClick={openMail} className="flex items-center justify-between px-4 py-3 text-sm hover:cursor-pointer hover:shadow-md hover:z-10 hover:bg-white">
            <div className='flex items-center gap-3'>
                <div className='text-gray-400'>
                    <MdCropSquare size={20} />
                </div>
                <div className='text-gray-400'>
                    <MdOutlineStarBorder size={20} />
                </div>
                <div>
                    <h1 className='font-bold'>{email?.subject}</h1>
                </div>
            </div>
            <div className='flex-1 ml-4'>
                <p>{email?.message}</p>
            </div>
            <div className='flex-none text-gray-600 text-sm'>
                <p>{formatDate(email?.createdAt)}</p>
            </div>
        </div>
    )
}

export default Email