import React, { useEffect, useState } from 'react'
import Email from './Email'
import useGetAllEmails from '../hooks/useGetAllEmails'
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { setOpen } from '../redux/gmailSlice';

const Emails = () => {
    useGetAllEmails();
    const { emails, searchText } = useSelector(store => store.gmail);
    const [filterEmail, setFilterEmail] = useState([]);
    const location = useLocation();
    const dispatch = useDispatch();
    // Close compose dialog when navigating to email list
    useEffect(() => {
        if (location.pathname === '/') {
            dispatch(setOpen(false));
        }
    }, [location.pathname, dispatch]);
    useEffect(() => {
        // Ensure emails is an array before filtering
        if (Array.isArray(emails)) {
            const filteredEmail = emails.filter((email) => {
                return email.subject.toLowerCase().includes(searchText.toLowerCase()) ||
                    email.to.toLowerCase().includes(searchText.toLowerCase()) ||
                    email.message.toLowerCase().includes(searchText.toLowerCase())
            });
            setFilterEmail(filteredEmail);
        } else {
            // If emails is not an array, set filterEmail to empty array
            setFilterEmail([]);
        }
    }, [searchText, emails])

    return (
        <div className="divide-y divide-gray-200 pb-4">
            {filterEmail && filterEmail.length > 0 ? (
                filterEmail.map((email) => <Email key={email._id} email={email} />)
            ) : (
                <div className="text-center">No emails found</div>
            )}
        </div>
    );

}

export default Emails