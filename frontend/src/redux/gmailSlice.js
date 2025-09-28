import { createSlice } from "@reduxjs/toolkit";

export const gmailSlice = createSlice({
    name: "gmail",
    initialState: {
        open: false,
        user: null,
        emails: [],
        selectedEmail: null,
        searchText: '',
        backgroundImage: null, // New state for background image
        showSettingsDropdown: false, // New state for settings dropdown
        currentPage: 0, // Add pagination state
        pageSize: 50,
        currentEmailIndex: -1, // Track the index of current email in the list
        // Add compose mode for reply/forward
        composeMode: 'new', // 'new', 'reply', 'forward'
        replyToEmail: null,
    },
    reducers: {
        setOpen: (state, action) => {
            state.open = action.payload;
            // Reset compose mode when closing
            if (!action.payload) {
                state.composeMode = 'new';
                state.replyToEmail = null;
            }
        },
        setAuthUser: (state, action) => {
            state.user = action.payload;
        },
        setEmails: (state, action) => {
            state.emails = action.payload;
        },
        setSelectedEmail: (state, action) => {
            state.selectedEmail = action.payload;
            // Find and set the index of the selected email
            const index = state.emails.findIndex(email => email._id === action.payload._id);
            state.currentEmailIndex = index;
        },
        // Add compose mode setters
        setComposeMode: (state, action) => {
            state.composeMode = action.payload.mode;
            state.replyToEmail = action.payload.email || null;
        },
        setSearchText: (state, action) => {
            state.searchText = action.payload;
        },
        setBackgroundImage: (state, action) => {
            console.log('Redux: Setting background image:', action.payload ? 'Image set' : 'Image cleared');
            state.backgroundImage = action.payload;
        },
        setShowSettingsDropdown: (state, action) => {
            state.showSettingsDropdown = action.payload;
        },
        // Add pagination actions
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },
        setPageSize: (state, action) => {
            state.pageSize = action.payload;
        },
        navigateToNextEmail: (state) => {
            if (state.currentEmailIndex < state.emails.length - 1) {
                state.currentEmailIndex++;
                state.selectedEmail = state.emails[state.currentEmailIndex];
                // Update page if necessary
                const newPage = Math.floor(state.currentEmailIndex / state.pageSize);
                if (newPage !== state.currentPage) {
                    state.currentPage = newPage;
                }
            }
        },
        navigateToPreviousEmail: (state) => {
            if (state.currentEmailIndex > 0) {
                state.currentEmailIndex--;
                state.selectedEmail = state.emails[state.currentEmailIndex];
                // Update page if necessary
                const newPage = Math.floor(state.currentEmailIndex / state.pageSize);
                if (newPage !== state.currentPage) {
                    state.currentPage = newPage;
                }
            }
        },
    },
});

export const {
    setOpen,
    setAuthUser,
    setEmails,
    setSelectedEmail,
    setSearchText,
    setBackgroundImage,
    setShowSettingsDropdown,
    setCurrentPage,
    setPageSize,
    navigateToNextEmail,
    navigateToPreviousEmail,
    setComposeMode,
} = gmailSlice.actions;

export default gmailSlice.reducer;
// That means only the reducer is exported as default, not as { gmailSlice }.
// So, the correct import is import gmailSlice from './gmailSlice', without curly braces {gmailSlice}.
