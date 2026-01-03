// teamSlice.js
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { teamService, Team, Message as APIMessage } from '../../service/teamService';
import { webSocketService } from "../index";

// Interfaces
interface TeamMember {
  _id: string;
  name: string;
  role: string;
  status: 'active' | 'away' | 'offline';
  avatar: string;
  email?: string;
  skills?: string[];
  experience?: string;
  teamLoading?: boolean;
  lastLogin?: string;
  showProfileDetail?: boolean;
  profileCompletion?: number;
  phone?: string;
}

interface Message {
  id: string;
  teamId: string;
  senderId: string;
  text: string;
  messageType?: string;
  time: string;
  status: 'sent' | 'delivered' | 'seen';
  createdAt?: string;
  isOptimistic?: boolean;
  messageLoading?: boolean;
}

interface TeamState {
  team: Team | null;
  teamName: string;
  disqualified: boolean;
  isEligibleForPrize: boolean;
  submissionStatus: string;
  technologies: string[];
  members: TeamMember[];
  createdAt?: string;
  messages: Message[];
  currentUser: string;
  isLoading: boolean;
  error: string | null;
  teamLoading: boolean;
  messageLoading: boolean;
  typingIndicators: Record<string, string>; // Fixed: changed from string[] to Record
  onlineUsers: Record<string, string>; // Fixed: changed from string[] to Record
  lastActivity: string | null;
  
  pagination: {
    currentPage: number;
    totalPages: number;
    totalMessages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const initialState: TeamState = {
  team: null,
  teamName: '',
  members: [],
  messages: [],
  currentUser: '',
  isLoading: false,
  error: null,
  teamLoading: false,
  messageLoading: false,
  typingIndicators: {},
  onlineUsers: {},
  lastActivity: null,
  disqualified: false,
  createdAt: undefined,
  isEligibleForPrize: false,
  submissionStatus: 'not_submitted',
  technologies: [],
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalMessages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

// Async thunks
export const fetchUserTeam = createAsyncThunk(
  'team/fetchUserTeam',
  async ({ userId, hackathonId }: { userId: string; hackathonId: string }, { rejectWithValue }) => {
    try {
      const response = await teamService.getUserTeamByHackathon(userId, hackathonId);
      return { ...response.data, userId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch team');
    }
  }
);

export const fetchTeamMessages = createAsyncThunk(
  'team/fetchTeamMessages',
  async ({ teamId, page = 1 }: { teamId: string; page?: number }, { rejectWithValue }) => {
    try {
      const response = await teamService.getTeamMessages(teamId, page);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'team/sendMessage',
  async (messageData: { teamId: string; text: string; messageType?: string }, { getState, rejectWithValue, dispatch }) => {
    try {
      const state = getState() as { team: TeamState };
      const senderId = state.team.currentUser;
      
      // Add optimistic message first
      const tempMessageId = `temp-${Date.now()}`;
      dispatch(addOptimisticMessage({
        id: tempMessageId,
        teamId: messageData.teamId,
        senderId,
        text: messageData.text,
        messageType: messageData.messageType,
        time: new Date().toISOString(),
        status: 'sent',
        isOptimistic: true,
      }));

      if (webSocketService.isConnected) {
        webSocketService.sendTeamMessage(messageData.teamId, messageData.text, messageData.messageType);
        
        // Return the optimistic message data for immediate update
        return {
          _id: tempMessageId,
          teamId: messageData.teamId,
          senderId,
          text: messageData.text,
          messageType: messageData.messageType,
          createdAt: new Date().toISOString(),
          isOptimistic: true,
        };
      } else {
        // Fallback to REST API
        const response = await teamService.sendMessage({
          ...messageData,
          senderId,
        });
        return response.data;
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    setMembers: (state, action: PayloadAction<TeamMember[]>) => {
      state.members = action.payload;
    },
    addMember: (state, action: PayloadAction<TeamMember>) => {
      state.members.push(action.payload);
    },
    addOptimisticMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    updateMessageStatus: (state, action: PayloadAction<{ id: string; status: 'sent' | 'delivered' | 'seen' }>) => {
      const { id, status } = action.payload;
      const message = state.messages.find(m => m.id === id);
      if (message) {
        message.status = status;
      }
    },
    setCurrentUser: (state, action: PayloadAction<string>) => {
      state.currentUser = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    updateMemberStatus: (state, action: PayloadAction<{ id: string; status: 'active' | 'away' | 'offline' }>) => {
      const { id, status } = action.payload;
      const member = state.members.find(m => m._id === id);
      if (member) {
        member.status = status;
      }
    },
    
    webSocketTeamMessageReceived: (state, action: PayloadAction<any>) => {
      const { teamId, message } = action.payload;
     
      if (state.team && state.team._id === teamId) {
        const newMessage: Message = {
          id: message._id || message.id,
          teamId: teamId,
          senderId: message?.sender?._id || message.senderId || '',
          text: message.text,
          messageType: message.messageType || "text",
          time: new Date(message.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'delivered',
          createdAt: message.createdAt,
        };

        // Replace optimistic message or add new one
        const optimisticIndex = state.messages.findIndex(m => m.isOptimistic && m.text === message.text);
        if (optimisticIndex !== -1) {
          state.messages[optimisticIndex] = newMessage;
        } else {
          state.messages.push(newMessage);
        }
      }
      state.lastActivity = new Date().toISOString();
    },
    webSocketTypingIndicatorReceived: (state, action: PayloadAction<any>) => {
      const { teamId, userId, isTyping, timestamp } = action.payload;
      
      if (state.team && state.team._id === teamId) {
        if (isTyping) {
          state.typingIndicators[userId] = timestamp;
        } else {
          delete state.typingIndicators[userId];
        }
      }
      state.lastActivity = new Date().toISOString();
    },
webSocketPresenceUpdateReceived: (
  state,
  action: PayloadAction<{
    userId: string;
    lastSeen: string;
    teamId: string;
    disconnected?: boolean;
  }>
) => {
  const { userId, lastSeen, teamId, disconnected } = action.payload;
  console.log("Presence update received:", action.payload);

  // Only update if it's the same team
  if (state.team && state.team._id === teamId) {
    // Update or add user last seen timestamp
    state.onlineUsers[userId] = lastSeen;

    // Find the member
    const member = state.members.find((m) => m._id === userId);
    if (member) {
      const lastSeenTime = new Date(lastSeen).getTime();
      const tenSecondsAgo = Date.now() - 10000; // 10 seconds ago

      // If the user was seen recently, mark active; otherwise, away
      if (lastSeenTime > tenSecondsAgo) {
        member.status = "active";
      } else {
        member.status = "away";
      }

      // If the socket explicitly disconnected, mark offline
      if (disconnected) {
        member.status = "offline";
        delete state.onlineUsers[userId]; // ✅ Correct way to remove a key from an object
      }
    }
  }

  // Track the last activity update
  state.lastActivity = new Date().toISOString();
},

    webSocketTeamUpdated: (state, action: PayloadAction<any>) => {
      // Handle team updates from WebSocket
      if (state.team && state.team._id === action.payload.teamId) {
        state.team = { ...state.team, ...action.payload.teamData };
        state.teamName = action.payload.teamData.name || state.teamName;
      }
      state.lastActivity = new Date().toISOString();
    },
    sendTypingIndicator: (state, action: PayloadAction<{ teamId: string; isTyping: boolean }>) => {
      if (webSocketService.isConnected) {
        webSocketService.sendTypingIndicator(action.payload.teamId, action.payload.isTyping);
      }
    },
setUserTeam: (state, action) => {
  const payload = action.payload;

  state.isLoading = false;
  state.error = null;

  // Core team info
  state.team = payload;
  state.teamName = payload.name || "";
  state.currentUser = payload.userId || "";
  state.disqualified = payload.disqualified ?? false;
  state.isEligibleForPrize = payload.isEligibleForPrize ?? false;
  state.submissionStatus = payload.submissionStatus || "not_submitted";
  state.technologies = payload.technologies || [];
  state.lastActivity = payload.lastActivity || new Date().toISOString();

  state.createdAt = payload.createdAt;

  // Initialize onlineUsers for members
  state.onlineUsers = {};

  // Map team members safely
  state.members = (payload.teamMember || []).map((member: any) => {
    const currentTime = new Date().toISOString();
    const memberId = member._id || member.id;
    const isCurrentUser = memberId === state.currentUser;

    // Track online users
    if (isCurrentUser) {
      state.onlineUsers[memberId] = currentTime;
    }

    return {
      _id: memberId,
      name: member.name || "Unnamed Member",
      role: member.role || "Member",
      status: isCurrentUser ? "active" : "away",
      avatar: member.avatar || member.name?.charAt(0) || "U",
      email: member.email || "",
      skills: member.skills || [],
      experience: member.experience || "",
      lastLogin: member.lastLogin || "",
      showProfileDetail: member.showProfileDetail ?? false,
      profileCompletion: member.profileCompletion || 0,
      phone: member.phone || "",
    };
  });
},

    setUserMessages: (state, action) => {
      state.messageLoading = false; // Fixed: was state.isLoading = false;
      const { messages, pagination } = action.payload;
      console.log(action.payload)
      // Map API messages to local format
      state.messages = messages.map((msg: APIMessage) => ({
        id: msg._id,
        teamId: msg.teamId,
        senderId: msg.senderId?._id || msg.senderId || '',
        text: msg.text,
        messageType: msg.messageType || "text",
        time: new Date(msg.createdAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'delivered',
        createdAt: msg.createdAt,
      }));
      
      state.pagination = {
        currentPage: pagination.currentPage || pagination.page || 1,
        totalPages: pagination.totalPages,
        totalMessages: pagination.totalMessages,
        hasNextPage: pagination.hasNextPage || false,
        hasPrevPage: pagination.hasPrevPage || false,
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch user team
      .addCase(fetchUserTeam.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserTeam.fulfilled, (state, action) => {
        state.isLoading = false;
        state.team = action.payload;
        state.teamName = action.payload.name;
        state.currentUser = action.payload.userId;
        // Map team members from API response
        state.members = action.payload.teamMember.map((member: any) => {
          const currentTime = new Date().toISOString();
          const isCurrentUser = member._id === state.currentUser;
          
          // Update online status for current user
          if (isCurrentUser) {
            state.onlineUsers[member._id] = currentTime;
          }
          
          return {
            _id: member._id || member.id,
            name: member.name,
            role: member.role || '',
            status: isCurrentUser ? 'active' : 'away',
            avatar: member.avatar || member.name.charAt(0),
            email: member.email,
            skills: member.skills,
            experience: member.experience
          };
        });
      })
      .addCase(fetchUserTeam.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch team messages
      .addCase(fetchTeamMessages.pending, (state) => {
        state.messageLoading = true; // Fixed: was state.team. = true;
        state.error = null;
      })
      .addCase(fetchTeamMessages.fulfilled, (state, action) => {
        state.messageLoading = false; // Fixed: was state.isLoading = false;
        const { messages, pagination } = action.payload;
        console.log(action.payload)
        // Map API messages to local format
        state.messages = messages.map((msg: APIMessage) => ({
          id: msg._id,
          teamId: msg.teamId,
          senderId: msg.senderId?._id || msg.senderId || '',
          text: msg.text,
          messageType: msg.messageType || "text",
          time: new Date(msg.createdAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'delivered',
          createdAt: msg.createdAt,
        }));
        
        state.pagination = {
          currentPage: pagination.currentPage || pagination.page || 1,
          totalPages: pagination.totalPages,
          totalMessages: pagination.totalMessages,
          hasNextPage: pagination.hasNextPage || false,
          hasPrevPage: pagination.hasPrevPage || false,
        };
      })
      .addCase(fetchTeamMessages.rejected, (state, action) => {
        state.messageLoading = false; // Fixed: was state.isLoading = false;
        state.error = action.payload as string;
      })
      // Send message
      .addCase(sendMessage.fulfilled, (state, action) => {
        // If message was sent via REST API (not WebSocket), update it
        if (!action.payload.isOptimistic) {
          const newMessage = action.payload;
          const index = state.messages.findIndex(m => m.id.startsWith('temp-'));
          
          if (index !== -1) {
            state.messages[index] = {
              id: newMessage._id,
              teamId: newMessage.teamId,
              senderId: newMessage.senderId,
              text: newMessage.text,
              messageType: newMessage.messageType,
              time: new Date(newMessage.createdAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'delivered',
              createdAt: newMessage.createdAt,
            };
          }
        }
        // If message was sent via WebSocket, it will be handled by webSocketTeamMessageReceived
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload as string;
        // Mark optimistic message as failed
        const failedMessage = state.messages.find(m => m.isOptimistic);
        if (failedMessage) {
          failedMessage.status = 'sent'; // Or create a 'failed' status
        }
      });
  },
});

export const {
  setUserTeam,
  setMembers,
  addMember,
  addOptimisticMessage,
  updateMessageStatus,
  setCurrentUser,
  clearMessages,
  updateMemberStatus,
  webSocketTeamMessageReceived,
  webSocketTypingIndicatorReceived,
  webSocketPresenceUpdateReceived,
  webSocketTeamUpdated,
  sendTypingIndicator,
  setUserMessages,
} = teamSlice.actions;

export default teamSlice.reducer;