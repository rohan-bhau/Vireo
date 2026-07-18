import { api } from "./api";

export interface Conversation {
  _id: string;
  workspaceId: string;
  participants: string[];
  type: "group" | "dm";
  name?: string;
  lastMessage?: {
    content: string;
    senderId: string;
    senderName: string;
    createdAt: string;
  };
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  content: string;
  type: "text" | "voice" | "file";
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  readBy: string[];
  editedAt?: string;
  createdAt: string;
}

interface ConversationsResponse {
  status: string;
  data: { conversations: Conversation[] };
}

interface MessagesResponse {
  status: string;
  data: { messages: Message[]; hasMore: boolean };
}

interface SingleConversationResponse {
  status: string;
  data: { conversation: Conversation };
}

interface SingleMessageResponse {
  status: string;
  data: { message: Message };
}

export const chatApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getConversation: builder.query<Conversation, string>({
      query: (conversationId) => `/conversations/${conversationId}`,
      transformResponse: (response: SingleConversationResponse) => response.data.conversation,
      providesTags: (_result, _error, id) => [{ type: "Conversations", id }],
    }),
    getConversations: builder.query<Conversation[], string>({
      query: (workspaceId) => `/conversations/workspace/${workspaceId}`,
      transformResponse: (response: ConversationsResponse) => response.data.conversations,
      providesTags: ["Conversations"],
    }),
    getMessages: builder.query<{ messages: Message[]; hasMore: boolean }, { conversationId: string; page?: number }>({
      query: ({ conversationId, page = 1 }) =>
        `/conversations/${conversationId}/messages?page=${page}&limit=50`,
      transformResponse: (response: MessagesResponse) => response.data,
      providesTags: (_result, _error, { conversationId }) => [
        { type: "Messages", id: conversationId },
      ],
    }),
    createConversation: builder.mutation<
      Conversation,
      { workspaceId: string; participantIds: string[]; name?: string }
    >({
      query: (body) => ({
        url: "/conversations",
        method: "POST",
        body,
      }),
      transformResponse: (response: SingleConversationResponse) => response.data.conversation,
      invalidatesTags: ["Conversations"],
    }),
    getOrCreateDM: builder.mutation<Conversation, { workspaceId: string; userId: string }>({
      query: (body) => ({
        url: "/conversations/dm",
        method: "POST",
        body,
      }),
      transformResponse: (response: SingleConversationResponse) => response.data.conversation,
      invalidatesTags: ["Conversations"],
    }),
    sendMessage: builder.mutation<
      Message,
      {
        conversationId: string;
        content: string;
        type?: "text" | "voice" | "file";
        fileUrl?: string;
        fileName?: string;
        fileSize?: number;
      }
    >({
      query: ({ conversationId, ...body }) => ({
        url: `/conversations/${conversationId}/messages`,
        method: "POST",
        body,
      }),
      transformResponse: (response: SingleMessageResponse) => response.data.message,
      invalidatesTags: (_result, _error, { conversationId }) => [
        "Conversations",
        { type: "Messages", id: conversationId },
      ],
    }),
    markConversationRead: builder.mutation<void, string>({
      query: (conversationId) => ({
        url: `/conversations/${conversationId}/read`,
        method: "PUT",
      }),
      invalidatesTags: ["Conversations"],
    }),
    addConversationMember: builder.mutation<
      Conversation,
      { conversationId: string; userId: string }
    >({
      query: ({ conversationId, ...body }) => ({
        url: `/conversations/${conversationId}/members`,
        method: "POST",
        body,
      }),
      transformResponse: (response: SingleConversationResponse) => response.data.conversation,
      invalidatesTags: ["Conversations"],
    }),
    removeConversationMember: builder.mutation<
      Conversation,
      { conversationId: string; userId: string }
    >({
      query: ({ conversationId, userId }) => ({
        url: `/conversations/${conversationId}/members/${userId}`,
        method: "DELETE",
      }),
      transformResponse: (response: SingleConversationResponse) => response.data.conversation,
      invalidatesTags: ["Conversations"],
    }),
  }),
});

export const {
  useGetConversationQuery,
  useGetConversationsQuery,
  useGetMessagesQuery,
  useCreateConversationMutation,
  useGetOrCreateDMMutation,
  useSendMessageMutation,
  useMarkConversationReadMutation,
  useAddConversationMemberMutation,
  useRemoveConversationMemberMutation,
} = chatApi;
