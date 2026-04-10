import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface User {
  _id: string;
  phone: string;
  email: string;
  firstName: string;
  role: string;
}

interface UserAuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Get user and token from localStorage
const getInitialState = () => {
  try {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    return {
      user: userData ? JSON.parse(userData) : null,
      token: token || null,
      loading: false,
      error: null,
    };
  } catch (error) {
    console.error("Error parsing from localStorage:", error);
    return {
      user: null,
      token: null,
      loading: false,
      error: null,
    };
  }
};

const initialState: UserAuthState = getInitialState();

const userAuthSlice = createSlice({
  name: "userAuth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setUser, logout, setLoading, setError, clearError } =
  userAuthSlice.actions;
export default userAuthSlice.reducer;