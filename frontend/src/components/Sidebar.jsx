import React from 'react'
import { IoMdStar } from 'react-icons/io';
import { LuPencil } from "react-icons/lu";
import { MdInbox, MdMore, MdOutlineDrafts, MdOutlineKeyboardArrowDown, MdOutlineWatchLater } from "react-icons/md";
import { TbSend2 } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { setOpen, setComposeMode } from '../redux/gmailSlice';
import { useNavigate, useLocation } from 'react-router-dom';

const sideBarItems = [
    {
        icon: <MdInbox size={20} />,
        text: 'Inbox',
        path: '/'
    },
    {
        icon: <IoMdStar size={20} />,
        text: 'Starred',
        path: '#'
    },
    {
        icon: <MdOutlineWatchLater size={20} />,
        text: 'Snoozed',
        path: '#'
    },
    {
        icon: <TbSend2 size={20} />,
        text: 'Sent',
        path: '/sent'
    },
    {
        icon: <MdOutlineDrafts size={20} />,
        text: 'Drafts',
        path: '#'
    },
    {
        icon: <MdOutlineKeyboardArrowDown size={20} />,
        text: 'More',
        path: '#'
    }
]

const Sidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const handleCompose = () => {
        dispatch(setComposeMode({ mode: 'new', email: null }));
        dispatch(setOpen(true));
    };

    const handleNavigation = (path) => {
        if (path !== '#') {
            navigate(path);
        }
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <div className='w-[15%]'>
            <div className='p-3'>
                <button
                    onClick={handleCompose}
                    className='rounded-2xl flex items-center gap-2 bg-[#C2E7FF] p-4 hover:shadow-md'
                >
                    <LuPencil size={22} />
                    Compose
                </button>
            </div>
            <div className='text-gray-700'>
                {sideBarItems.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => handleNavigation(item.path)}
                        className={`flex items-center gap-4 pl-6 py-1 my-2 rounded-r-full cursor-pointer
                            ${isActive(item.path)
                                ? 'bg-[#D3E3FD] text-[#001D35] font-bold'
                                : 'hover:bg-gray-200'
                            }`}
                    >
                        {item.icon}
                        <p>{item.text}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Sidebar