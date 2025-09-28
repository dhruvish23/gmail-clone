import axios from "axios"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux";
import { setEmails } from "../redux/gmailSlice";

const useGetAllEmails = () => {
    const dispatch = useDispatch();
    const { emails } = useSelector(store => store.gmail);
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    useEffect(() => {
        const fetchEmails = async () => {
            try {

                const res = await axios.get(`${API_URL}/api/v1/email/getallemails`, {
                    withCredentials: true
                });
                dispatch(setEmails(res.data.emails));

            } catch (error) {
                console.log(error);
            }
        }
        fetchEmails();
    }, [])
};
export default useGetAllEmails;