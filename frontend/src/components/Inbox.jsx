import React, { useState, useEffect } from 'react'
import { MdCropSquare, MdInbox, MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md'
import { FaCaretDown, FaUserFriends } from 'react-icons/fa'
import { IoMdMore, IoMdRefresh } from 'react-icons/io'
import { GoTag } from "react-icons/go";
import Emails from './Emails'
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentPage } from '../redux/gmailSlice';

const mailType = [
    { icon: <MdInbox size={20} />, text: 'Primary' },
    { icon: <GoTag size={20} />, text: 'Promotions' },
    { icon: <FaUserFriends size={20} />, text: 'Social' },
]

const Inbox = () => {
    const [selected, setSelected] = useState(0);
    const dispatch = useDispatch();

    const { emails, currentPage, pageSize } = useSelector(store => store.gmail);
    const totalEmails = emails?.length || 0;

    const start = currentPage * pageSize + 1;
    const end = Math.min((currentPage + 1) * pageSize, totalEmails);

    const handlePageChange = (newPage) => {
        dispatch(setCurrentPage(newPage));
    };

    return (
        <div className="flex-1 bg-white rounded-xl mx-5">
            {/* Toolbar */}
            <div className="flex item-center justify-between px-4 my-2">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <MdCropSquare size={20} />
                        <FaCaretDown size={12} />
                    </div>
                    <div className="p-2 rounded-full hover:bg-gray-200">
                        <IoMdRefresh size={20} />
                    </div>
                    <div className="p-2 rounded-full hover:bg-gray-200">
                        <IoMdMore size={20} />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span>
                        {totalEmails > 0 ? `${start} – ${end} of ${totalEmails}` : '0 emails'}
                    </span>
                    <MdKeyboardArrowLeft
                        size={20}
                        className={currentPage === 0 ? "text-gray-400 cursor-not-allowed" : "cursor-pointer"}
                        onClick={() => currentPage > 0 && handlePageChange(currentPage - 1)}
                    />
                    <MdKeyboardArrowRight
                        size={20}
                        className={end === totalEmails ? "text-gray-400 cursor-not-allowed" : "cursor-pointer"}
                        onClick={() => end < totalEmails && handlePageChange(currentPage + 1)}
                    />
                </div>
            </div>

            {/* Tabs + Emails */}
            <div className="h-90vh overflow-y-auto">
                <div className="flex items-center gap-1">
                    {mailType.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => setSelected(index)}
                            className={`${selected === index
                                ? "border-b-4 border-b-blue-600 text-blue-600"
                                : "border-b-4 border-b-transparent"
                                } flex items-center gap-5 p-4 w-52 hover:bg-gray-100`}
                        >
                            {item.icon}
                            <span>{item.text}</span>
                        </button>
                    ))}
                </div>

                <Emails emails={emails.slice(currentPage * pageSize, (currentPage + 1) * pageSize)} />
            </div>
        </div>
    )
}

export default Inbox
