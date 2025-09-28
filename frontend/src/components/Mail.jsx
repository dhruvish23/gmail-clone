import React from 'react'
import { IoMdArrowBack, IoMdMore } from 'react-icons/io'
import { useNavigate, useParams } from 'react-router-dom'
import { BiArchiveIn } from 'react-icons/bi'
import { MdDeleteOutline, MdKeyboardArrowLeft, MdKeyboardArrowRight, MdOutlineAddTask, MdOutlineDriveFileMove, MdOutlineMarkEmailUnread, MdOutlineReport, MdOutlineWatchLater } from 'react-icons/md'
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { setOpen, navigateToNextEmail, navigateToPreviousEmail, setComposeMode } from '../redux/gmailSlice';

const Mail = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { selectedEmail, user, emails, currentEmailIndex } = useSelector(store => store.gmail);
    const params = useParams();

    const totalEmails = emails?.length || 0;
    const currentPosition = currentEmailIndex + 1;
    const hasNext = currentEmailIndex < totalEmails - 1;
    const hasPrevious = currentEmailIndex > 0;

    const deleteHandler = async () => {
        try {
            const res = await axios.delete(`http://localhost:8080/api/v1/email/${params.id}`, { withCredentials: true });
            toast.success(res.data.message);
            navigate("/");
        } catch (error) {
            console.log(error);
            toast.error("Failed to delete email");
        }
        dispatch(setOpen(false));
    }

    const handleReply = () => {
        dispatch(setComposeMode({ mode: 'reply', email: selectedEmail }));
        dispatch(setOpen(true));
    };

    const handleForward = () => {
        dispatch(setComposeMode({ mode: 'forward', email: selectedEmail }));
        dispatch(setOpen(true));
    };

    const handleNavigateNext = () => {
        if (hasNext) {
            dispatch(navigateToNextEmail());
            const nextEmail = emails[currentEmailIndex + 1];
            navigate(`/mail/${nextEmail._id}`);
        }
    };

    const handleNavigatePrevious = () => {
        if (hasPrevious) {
            dispatch(navigateToPreviousEmail());
            const prevEmail = emails[currentEmailIndex - 1];
            navigate(`/mail/${prevEmail._id}`);
        }
    };

    // Format date to show relative time or actual date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return "1 day ago";
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    };

    // Determine if current user is sender or recipient
    const isCurrentUserSender = selectedEmail?.userId?._id === user?._id || selectedEmail?.userId === user?._id;

    // Get sender info
    const getSenderInfo = () => {
        if (isCurrentUserSender) {
            return {
                name: user?.fullname || 'You',
                email: user?.email || selectedEmail?.userId?.email || 'Unknown',
                profilePhoto: user?.profilePhoto
            };
        } else {
            return {
                name: selectedEmail?.userId?.fullname || 'Unknown Sender',
                email: selectedEmail?.userId?.email || 'Unknown',
                profilePhoto: selectedEmail?.userId?.profilePhoto
            };
        }
    };

    const senderInfo = getSenderInfo();

    if (!selectedEmail) {
        return (
            <div className='flex-1 bg-white rounded-xl mx-5 flex items-center justify-center'>
                <p className='text-gray-500'>Select an email to view</p>
            </div>
        );
    }

    return (
        <div className='flex-1 bg-white rounded-xl mx-5'>
            {/* Toolbar */}
            <div className='flex items-center justify-between px-4 py-2 border-b border-gray-200'>
                <div className='flex items-center py-2 text-gray-700 gap-1'>
                    <div onClick={() => navigate('/')} className='p-2 rounded-full hover:bg-gray-100 cursor-pointer transition-colors'>
                        <IoMdArrowBack size={20} />
                    </div>
                    <div className='p-2 rounded-full hover:bg-gray-100 cursor-pointer transition-colors'>
                        <BiArchiveIn size={20} />
                    </div>
                    <div className='p-2 rounded-full hover:bg-gray-100 cursor-pointer transition-colors'>
                        <MdOutlineReport size={20} />
                    </div>
                    <div onClick={deleteHandler} className='p-2 rounded-full hover:bg-gray-100 cursor-pointer transition-colors'>
                        <MdDeleteOutline size={20} />
                    </div>
                    <div className='p-2 rounded-full hover:bg-gray-100 cursor-pointer transition-colors'>
                        <MdOutlineMarkEmailUnread size={20} />
                    </div>
                    <div className='p-2 rounded-full hover:bg-gray-100 cursor-pointer transition-colors'>
                        <MdOutlineWatchLater size={20} />
                    </div>
                    <div className='p-2 rounded-full hover:bg-gray-100 cursor-pointer transition-colors'>
                        <MdOutlineAddTask size={20} />
                    </div>
                    <div className='p-2 rounded-full hover:bg-gray-100 cursor-pointer transition-colors'>
                        <MdOutlineDriveFileMove size={20} />
                    </div>
                    <div className='p-2 rounded-full hover:bg-gray-100 cursor-pointer transition-colors'>
                        <IoMdMore size={20} />
                    </div>
                </div>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <span>{currentPosition} of {totalEmails}</span>
                    <div
                        className={`p-1 rounded hover:bg-gray-100 ${hasPrevious ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                        onClick={handleNavigatePrevious}
                    >
                        <MdKeyboardArrowLeft size={20} />
                    </div>
                    <div
                        className={`p-1 rounded hover:bg-gray-100 ${hasNext ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                        onClick={handleNavigateNext}
                    >
                        <MdKeyboardArrowRight size={20} />
                    </div>
                </div>
            </div>

            {/* Email Content - Rest of the component remains the same */}
            <div className='h-[calc(100vh-120px)] overflow-y-auto'>
                {/* Email Header */}
                <div className='p-6 border-b border-gray-100'>
                    <div className='flex justify-between items-start gap-4'>
                        <div className='flex items-center gap-3'>
                            <h1 className='text-2xl font-normal text-gray-900'>
                                {selectedEmail?.subject || 'No Subject'}
                            </h1>
                            <span className='text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md'>
                                Inbox
                            </span>
                        </div>
                        <div className='text-sm text-gray-500 flex-shrink-0'>
                            <p>{formatDate(selectedEmail?.createdAt)}</p>
                        </div>
                    </div>
                </div>

                {/* Sender/Recipient Info */}
                <div className='px-6 py-4 border-b border-gray-100'>
                    <div className='flex items-center gap-3'>
                        {/* Avatar / Profile Photo */}
                        {senderInfo.profilePhoto ? (
                            <img
                                src={senderInfo.profilePhoto}
                                alt={senderInfo.name}
                                className='w-10 h-10 rounded-full object-cover'
                            />
                        ) : (
                            <div className='w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium'>
                                {senderInfo.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        {/* Sender Info */}
                        <div className='flex-1'>
                            <div className='flex items-center gap-2'>
                                <span className='font-medium text-gray-900'>
                                    {senderInfo.name}
                                </span>
                                <span className='text-gray-500 text-sm'>
                                    &lt;{senderInfo.email}&gt;
                                </span>
                            </div>
                            <div className='text-sm text-gray-500 mt-1'>
                                to {isCurrentUserSender ? selectedEmail?.to : 'me'}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className='flex items-center gap-1'>
                            <div className='p-1 rounded hover:bg-gray-100 cursor-pointer'>
                                <MdOutlineMarkEmailUnread size={16} />
                            </div>
                            <div className='p-1 rounded hover:bg-gray-100 cursor-pointer'>
                                <IoMdMore size={16} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Email Body */}
                <div className='px-6 py-6'>
                    <div className='prose max-w-none'>
                        <div className='whitespace-pre-wrap text-gray-800 leading-relaxed'>
                            {selectedEmail?.message || 'No message content'}
                        </div>
                    </div>
                </div>

                {/* Reply/Forward Section */}
                <div className='px-6 pb-6'>
                    <div className='flex gap-2'>
                        <button
                            onClick={handleReply}
                            className='px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors'
                        >
                            Reply
                        </button>
                        <button
                            onClick={handleForward}
                            className='px-4 py-2 text-sm bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 transition-colors'
                        >
                            Forward
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Mail