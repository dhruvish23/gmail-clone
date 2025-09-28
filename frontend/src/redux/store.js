import { configureStore } from '@reduxjs/toolkit'
import gmailSlice from './gmailSlice';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

/* In gmailSlice.js I wrote: export default gmailSlice.reducer;
That means only the reducer is exported as default, not as { gmailSlice }.
So, the correct import is import gmailSlice from './gmailSlice', without curly braces {gmailSlice}.*/

const persistConfig = {
    key: 'root',
    version: 1,
    storage,
}


const persistedReducer = persistReducer(persistConfig, gmailSlice);
export const store = configureStore({
    reducer: {
        gmail: persistedReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
})

export default store;