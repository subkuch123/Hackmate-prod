// src/store/index.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer, { verifyToken } from './slices/authSlice';
import userReducer from './slices/userSlice';
import webSocketReducer from './slices/websocketSlice';
import hackathonReducer from './slices/hackathonSlice';
import userHackathonReducer from './slices/userCurrrentHacthon';
import idReducer from './slices/idSlice';
import teamReducer from './slices/teamSlice';
import { initWebSocketService } from '../service/websocketService';

// 1️⃣ Combine all reducers
const appReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  websocket: webSocketReducer,
  hackathons: hackathonReducer,
  userHack: userHackathonReducer,
  team: teamReducer,
  id: idReducer,
});

// 2️⃣ Root reducer (state reset on logout)
const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: any
) => {
  if (action.type === 'auth/logout/fulfilled' || action.type === 'auth/logout/rejected') {
     const showTermsFlag = localStorage.getItem('showTerms');
    localStorage.clear();
     if (showTermsFlag) {
      localStorage.setItem('showTerms', showTermsFlag);
    }
    // Close WebSocket connection
    
    // webSocketService.close();
    state = undefined; // reset all slices
  }

  return appReducer(state, action);
};

// 3️⃣ Custom middleware — for logging & token verification
const loggerMiddleware =
  (store: any) => (next: any) => (action: any) => {
    console.log('Action:', action.type);

    const result = next(action);

    // 🔐 On login success, verify token
    if (action.type === 'auth/login/fulfilled' || action.type === 'auth/google/fulfilled') {
      console.log('INSIDE New state:', store.getState());
      store.dispatch(verifyToken());
    }

    console.log('New state:', store.getState());
    return result;
  };

// 4️⃣ Configure store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'websocket/presenceUpdate',
          'websocket/typingIndicator',
        ],
        ignoredPaths: ['websocket.onlineUsers', 'websocket.typingIndicators'],
      },
    }).concat(loggerMiddleware),
});

export const webSocketService = initWebSocketService(store);

// 5️⃣ Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
