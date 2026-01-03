// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from "../../service/authService";
import { showWarning } from '@/components/ui/ToasterMsg';
import { setIds } from './idSlice';

export interface User {
  _id : string;
  email: string;
  name: string;
  location: string;
  phone: string;
  bio: string;
  collegeName: string;
  experience: string;
  age: number;
  skills: string[];
  linkedin: string;
  github: string;
  profilePicture : string;
  isEmailVerified:boolean;
  isActive:boolean;
  currentHackathonId : string;
  role:string;  
  profileCompletion:number;
  lastLogin:Date
}

export interface ErrorValidate {
  field?: string;
  message: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: ErrorValidate[] | null;
  message: string | null;
  isAuthenticated: boolean;
  success : number;
  connect:boolean,
  isTokenVerified: boolean; // Add this flag to track token verification status
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,
  success:-1,
  connect:false,
  message: null,
  isAuthenticated: false,
  isTokenVerified: false, // Initialize as false
};

interface GoogleAuthPayload {
  email: string;
  displayName: string;
  photoURL: string;
  email_verified: boolean;
}

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'Login failed');
    }
  }
); 
export const googleAuth = createAsyncThunk(
  'auth/google',
  async (
    {
      email,
      displayName,
      photoURL,
      email_verified,
    }: GoogleAuthPayload,
    { rejectWithValue }
  ) => {
    try {
      const response = await authService.googleLogin({ email, displayName, photoURL, email_verified });
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'Login failed');
    }
  }
); 

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error: any) {
      console.log("Registration error:", error);
      // Return structured error information
      return rejectWithValue({
        message: error.message || 'Registration failed',
        errors: error.errors || null,
        errorCode: error.errorCode
      });
    }
  }
);
export const googleLogin = createAsyncThunk(
  'auth/register',
  async (userData: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.googleLogin(userData);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error: any) {
      console.log("Registration error:", error);
      // Return structured error information
      return rejectWithValue({
        message: error.message || 'Registration failed',
        errors: error.errors || null,
        errorCode: error.errorCode
      });
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      localStorage.removeItem('token');
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

// src/store/slices/authSlice.ts
export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { rejectWithValue, dispatch }) => { // Add dispatch parameter
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error('No token found');
      } 
      const response = await authService.verifyToken(token);
      console.log("Token verification response:", response);
      // Dispatch setIds with the IDs from response
      if (response.data) {
        dispatch(setIds({
          userId: response.data.userId,
          hackathonId: response.data.hackathonId,
          teamId: response.data.teamId,
          teamMemberId: response.data.teamMemberId,
          registrationId: response.data.registrationId
        }));
      }
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Token verification failed');
    }
  }
);
  const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.message = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    // Add a reducer to mark token as verified
    setTokenVerified: (state) => {
      state.isTokenVerified = true;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        // state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isTokenVerified = true; // Mark as verified
        state.error = null;
        state.message = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.message = action.payload?.message || action.payload || null;
        state.error = action.payload?.errors || [
          { message: action.payload?.message || 'Registration failed' }
        ];
        state.isAuthenticated = false;
        state.isTokenVerified = true;
        state.success = 0;
      });
    builder
      .addCase(googleAuth.pending, (state) => {
        // state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(googleAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isTokenVerified = true; // Mark as verified
        state.error = null;
        state.message = null;
      })
      .addCase(googleAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.message = action.payload?.message || action.payload || null;
        state.error = action.payload?.errors || [
          { message: action.payload?.message || 'Registration failed' }
        ];
        state.isAuthenticated = false;
        state.isTokenVerified = true;
        state.success = 0;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        // state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isTokenVerified = true; // Mark as verified
        state.error = null;
        state.message = null;
        // state.success = action.payload.success || -1;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.message = action.payload?.message || null;
        state.error = action.payload?.errors || [
          { message: action.payload?.message || 'Registration failed' }
        ];
        state.isAuthenticated = false;
        state.isTokenVerified = true;
        state.success = 0;
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isTokenVerified = true; // Mark as verified
        state.error = null;
        state.message = null;
      });

    // Token verification
    builder
      .addCase(verifyToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data.user || null; // Only set user data here
        state.isAuthenticated = true;
        state.isTokenVerified = true;
        state.error = null;
        state.message = action.payload.message || "";
        state.success = action.payload?.success ? 1 : -1;
        // IDs are now handled by idSlice via the setIds dispatch
      })
      .addCase(verifyToken.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isTokenVerified = true; // Mark as verified
        state.error = null;
        state.success =  -1;
        state.message = null;
      });
  },
});

export const { clearError, updateUser, setTokenVerified } = authSlice.actions;
export default authSlice.reducer;