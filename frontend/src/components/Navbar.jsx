import React, { useEffect, useState, useRef } from 'react'
import { RxHamburgerMenu } from "react-icons/rx";
import { IoIosSearch } from "react-icons/io";
import { CiCircleQuestion } from "react-icons/ci";
import { IoIosSettings } from "react-icons/io";
import { SiGooglegemini } from "react-icons/si";
import { TbGridDots } from "react-icons/tb";
import { MdImage, MdClose } from "react-icons/md";
import Avatar from 'react-avatar';
import { useSelector, useDispatch } from 'react-redux';
import { setAuthUser, setSearchText, setOpen, setBackgroundImage, setShowSettingsDropdown } from '../redux/gmailSlice';
import axios from 'axios';
import toast from "react-hot-toast"
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const [text, setText] = useState("");
    const { user, open, showSettingsDropdown, backgroundImage } = useSelector(store => store.gmail);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const settingsRef = useRef(null);
    const API_URL = import.meta.env.VITE_BACKEND_URL;

    // Debug logging
    console.log('Navbar - Current user:', user);
    console.log('Navbar - Profile photo URL:', user?.profilePhoto);
    console.log('Navbar - backgroundImage:', backgroundImage);
    const logoutHandler = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/v1/user/logout`, { withCredentials: true });
            console.log(res);
            toast.success(res.data.message);
            dispatch(setAuthUser(null));
            navigate("/login");
        } catch (error) {
            console.log(error);
        }
        dispatch(setOpen(false));
    }

    const handleSettingsClick = () => {
        dispatch(setShowSettingsDropdown(!showSettingsDropdown));
    }

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error('Image size should be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                console.log('Image uploaded, setting background:', e.target.result.substring(0, 50) + '...');
                dispatch(setBackgroundImage(e.target.result));
                toast.success('Background image updated!');
                dispatch(setShowSettingsDropdown(false));
            };
            reader.readAsDataURL(file);
        }
    }

    const handleRemoveBackground = () => {
        dispatch(setBackgroundImage(null));
        toast.success('Background image removed!');
        dispatch(setShowSettingsDropdown(false));
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target)) {
                dispatch(setShowSettingsDropdown(false));
            }
        };

        if (showSettingsDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSettingsDropdown, dispatch]);

    useEffect(() => {
        dispatch(setSearchText(text));
    }, [text]);

    const NavBarIconItems = [
        {
            icon: <CiCircleQuestion size={20} />,
            text: 'Help'
        },
        {
            icon: <SiGooglegemini size={20} />,
            text: 'Compose'
        },
        {
            icon: <IoIosSettings size={20} />,
            text: 'Settings',
            onClick: handleSettingsClick
        },
        {
            icon: <TbGridDots size={20} />,
            text: 'Apps'
        },
    ]

    // Function to get avatar display
    const getAvatarDisplay = () => {
        if (!user) return null;

        if (user.profilePhoto && user.profilePhoto !== 'null' && user.profilePhoto !== 'undefined') {
            return (
                <img
                    src={user.profilePhoto}
                    alt="profile"
                    className="w-10 h-10 rounded-full object-cover mr-10"
                    referrerPolicy="no-referrer"
                />
            );
        }

        return (
            <Avatar
                name={user.fullname || user.email}
                size="40"
                round={true}
                color="#4285f4"
                className="w-10 h-10 rounded-full object-cover mr-10"
            />
        );
    };

    return (
        <div className='flex justify-between items-center mx-3 h-16 relative'>
            <div className='flex items-center gap-10'>
                <div className='flex items-center gap-2'>
                    <div className='p-3 rounded-full hover:bg-gray-200 cursor-pointer'>
                        <RxHamburgerMenu />
                    </div>
                    <img src='https://mailmeteor.com/logos/assets/PNG/Gmail_Logo_512px.png' alt='logo' className='w-10 object-cover' />
                    <h1 className='text-2xl text-gray-500 font-medium'>Gmail</h1>
                </div>
            </div>
            {
                user && (
                    <>
                        <div className='w-[50%] mr-60 ml-30'>
                            <div className='px-2 py-3 rounded-full flex items-center bg-[#eaf1fb]'>
                                <IoIosSearch size={22} className='text-gray-700' />
                                <input
                                    type="text"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder='Search Mail'
                                    className='rounded-full w-full bg-transparent outline-none px-1'
                                />
                            </div>
                        </div>
                        <div className='flex items-center gap-2 relative'>
                            {
                                NavBarIconItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className='flex items-center gap-2 p-3 rounded-full hover:bg-gray-200 cursor-pointer relative'
                                        onClick={item.onClick}
                                        ref={item.text === 'Settings' ? settingsRef : null}
                                    >
                                        {item.icon}
                                        <p>{item.text}</p>

                                        {/* Settings Dropdown */}
                                        {item.text === 'Settings' && showSettingsDropdown && (
                                            <div className='absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50'>
                                                <div className='p-4'>
                                                    <h3 className='font-semibold text-gray-800 mb-3'>Theme Settings</h3>

                                                    {/* Change Background Option */}
                                                    <div className='mb-3'>
                                                        <button
                                                            onClick={() => fileInputRef.current?.click()}
                                                            className='flex items-center gap-2 w-full p-2 text-left hover:bg-gray-50 rounded-md transition-colors'
                                                        >
                                                            <MdImage size={18} className='text-blue-600' />
                                                            <span className='text-sm text-gray-700'>Change Background</span>
                                                        </button>
                                                        <input
                                                            ref={fileInputRef}
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleImageUpload}
                                                            className='hidden'
                                                        />
                                                    </div>

                                                    {/* Remove Background Option */}
                                                    <div>
                                                        <button
                                                            onClick={handleRemoveBackground}
                                                            className='flex items-center gap-2 w-full p-2 text-left hover:bg-gray-50 rounded-md transition-colors'
                                                        >
                                                            <MdClose size={18} className='text-red-600' />
                                                            <span className='text-sm text-gray-700'>Remove Background</span>
                                                        </button>
                                                    </div>
                                                    {/* Debug info (remove in production) */}
                                                    {process.env.NODE_ENV === 'development' && (
                                                        <div className='mt-3 pt-3 border-t border-gray-200'>
                                                            <p className='text-xs text-gray-500'>
                                                                Auth: {user.authProvider || 'local'}
                                                            </p>
                                                            <p className='text-xs text-gray-500 truncate'>
                                                                Photo: {user.profilePhoto ? 'Set' : 'Not set'}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            }
                            <span onClick={logoutHandler} className='underline cursor-pointer'>Logout</span>
                            {getAvatarDisplay()}
                        </div>
                    </>
                )
            }
        </div>
    )
}

export default Navbar