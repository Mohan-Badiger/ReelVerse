import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    adminToken: localStorage.getItem('adminToken') ? JSON.parse(localStorage.getItem('adminToken')) : null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAdminCredentials: (state, action) => {
            state.adminToken = action.payload;
            localStorage.setItem('adminToken', JSON.stringify(action.payload));
        },
        adminLogout: (state) => {
            state.adminToken = null;
            localStorage.removeItem('adminToken');
        },
    },
});

export const { setAdminCredentials, adminLogout } = authSlice.actions;

export default authSlice.reducer;
