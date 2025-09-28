import React, { useEffect } from 'react'
import Sidebar from './Sidebar'
import { Outlet, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux';
import Navbar from './Navbar';

const Body = () => {
    const { user, backgroundImage } = useSelector(store => store.gmail);
    const navigate = useNavigate();

    // Debug logging
    console.log('Body - backgroundImage:', backgroundImage);

    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [])

    return (
        <div
            className="min-h-screen"
            style={{
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Overlay for better readability */}
            {backgroundImage && (
                <div className="absolute inset-0 bg-white bg-opacity-30 pointer-events-none z-0"></div>
            )}

            <div className="relative z-10">
                <Navbar />
                <div className='flex'>
                    <Sidebar />
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Body