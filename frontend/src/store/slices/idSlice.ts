// src/store/slices/idSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IdState {
  userId: string | null;
  hackathonId: string | null;
  teamId: string | null;
  teamMemberId: string | null;
  registrationId: string | null;
  token: string | null;
}

// Define the payload type for setIds
interface SetIdsPayload {
  userId?: string | null;
  hackathonId?: string | null;
  teamId?: string | null;
  teamMemberId?: string | null;
  registrationId?: string | null;
}

const initialState: IdState = {
  userId: localStorage.getItem("userId"),
  hackathonId: localStorage.getItem("hackathonId"),
  teamId: localStorage.getItem("teamId"),
  teamMemberId: localStorage.getItem("teamMemberId"),
  registrationId: localStorage.getItem("registrationId"),
  token: localStorage.getItem("token"),
};

const idSlice = createSlice({
  name: "id",
  initialState,
  reducers: {
    setIds: (state, action: PayloadAction<SetIdsPayload>) => {
      console.log("Setting IDs:", action.payload);
      
      const { userId, hackathonId, teamId, teamMemberId, registrationId } = action.payload;
      
      // Update state and localStorage only for provided values
      if (userId !== undefined) {
        state.userId = userId;
        if (userId) localStorage.setItem("userId", userId);
        else localStorage.removeItem("userId");
      }
      
      if (hackathonId !== undefined) {
        state.hackathonId = hackathonId;
        if (hackathonId) localStorage.setItem("hackathonId", hackathonId);
        else localStorage.removeItem("hackathonId");
      }
      
      if (teamId !== undefined) {
        state.teamId = teamId;
        if (teamId) localStorage.setItem("teamId", teamId);
        else localStorage.removeItem("teamId");
      }
      
      if (teamMemberId !== undefined) {
        state.teamMemberId = teamMemberId;
        if (teamMemberId) localStorage.setItem("teamMemberId", teamMemberId);
        else localStorage.removeItem("teamMemberId");
      }
      
      if (registrationId !== undefined) {
        state.registrationId = registrationId;
        if (registrationId) localStorage.setItem("registrationId", registrationId);
        else localStorage.removeItem("registrationId");
      }
    },

    clearIds: (state) => {
      state.userId = null;
      state.hackathonId = null;
      state.teamId = null;
      state.teamMemberId = null;
      state.registrationId = null;
      state.token = null;
      
      // Clear localStorage
      localStorage.removeItem("userId");
      localStorage.removeItem("hackathonId");
      localStorage.removeItem("teamId");
      localStorage.removeItem("teamMemberId");
      localStorage.removeItem("registrationId");
      localStorage.removeItem("token");
    },

    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      if (action.payload) localStorage.setItem("token", action.payload);
      else localStorage.removeItem("token");
    },
  },
});

export const { setIds, clearIds, setToken } = idSlice.actions;
export default idSlice.reducer;