import React, { useEffect, useState } from 'react'
import { MdCropSquare, MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md'
import { FaCaretDown } from 'react-icons/fa'
import { IoMdMore, IoMdRefresh } from 'react-icons/io'
import { TbSend2 } from 'react-icons/tb'
import Emails from './Emails'
import { useSelector } from 'react-redux';

const Sent = () => {
    const [page, setPage] = useState(0);
    const pageSize = 50;
    const [sentEmails, setSentEmails] = useState([]);

    const { emails, user } = useSelector(store => store.gmail);

    // useEffect(() => {
    //     // Filter emails sent by current user
    //     if (emails && user) {
    //         const sent = emails.filter(email =>
    //             email.userId?._id === user._id || email.userId === user._id
    //         );
    //         setSentEmails(sent);
    //     }
    // }, [emails, user]);
    useEffect(() => {
        if (emails && user) {
            const sent = emails.filter(email =>
                email.userId === user._id && email.to !== user.email
            );
            setSentEmails(sent);
        }
    }, [emails, user]);


    const totalEmails = sentEmails?.length || 0;
    const start = page * pageSize + 1;
    const end = Math.min((page + 1) * pageSize, totalEmails);

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
                        {totalEmails > 0 ? `${start} – ${end} of ${totalEmails}` : 'No sent emails'}
                    </span>
                    <MdKeyboardArrowLeft
                        size={20}
                        className={page === 0 ? "text-gray-400 cursor-not-allowed" : "cursor-pointer"}
                        onClick={() => page > 0 && setPage(page - 1)}
                    />
                    <MdKeyboardArrowRight
                        size={20}
                        className={end === totalEmails ? "text-gray-400 cursor-not-allowed" : "cursor-pointer"}
                        onClick={() => end < totalEmails && setPage(page + 1)}
                    />
                </div>
            </div>

            {/* Header */}
            <div className="h-90vh overflow-y-auto">
                <div className="flex items-center gap-1 border-b">
                    <div className="flex items-center gap-5 p-4 text-blue-600 border-b-4 border-b-blue-600">
                        <TbSend2 size={20} />
                        <span>Sent</span>
                    </div>
                </div>

                {/* Emails List */}
                {totalEmails > 0 ? (
                    <Emails emails={sentEmails.slice(page * pageSize, (page + 1) * pageSize)} />
                ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                        <p>No sent emails</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Sent