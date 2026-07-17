import { api } from "./api";

export interface TicketDraftResult {
  description: string;
  acceptanceCriteria: string[];
  suggestedLabels: string[];
}

export interface SummarizeResult {
  summary: string;
  keyPoints: string[];
  suggestedAction: string;
}

export interface TriageResult {
  suggestedAssignee: string | null;
  suggestedPriority: string;
  suggestedLabels: string[];
  suggestedType: string;
  reasoning: string;
}

export interface SprintPlanResult {
  suggestedTasks: { taskKey: string; reason: string }[];
  goal: string;
  estimatedPoints: number;
}

export interface ChatResult {
  reply: string;
}

export interface AIHistoryItem {
  _id: string;
  feature: string;
  prompt: string;
  response: string;
  model: string;
  tokensUsed: number;
  duration: number;
  createdAt: string;
}

interface AIHistoryResponse {
  status: string;
  data: {
    history: {
      _id: string;
      feature: string;
      prompt: string;
      response: string;
      model: string;
      tokensUsed: number;
      duration: number;
      createdAt: string;
    }[];
  };
}

export const aiApi = api.injectEndpoints({
  endpoints: (builder) => ({
    generateTicketDraft: builder.mutation<
      { description: string; acceptanceCriteria: string[]; suggestedLabels: string[] },
      { title: string; type: string; projectId: string }
    >({
      query: (body) => ({
        url: "/ai/ticket-draft",
        method: "POST",
        body,
      }),
      transformResponse: (response: { status: string; data: { description: string; acceptanceCriteria: string[]; suggestedLabels: string[] } }) => response.data,
    }),
    summarizeThread: builder.mutation<
      { summary: string; keyPoints: string[]; suggestedAction: string },
      string
    >({
      query: (taskKey) => ({
        url: `/ai/summarize/${taskKey}`,
        method: "POST",
      }),
      transformResponse: (response: { status: string; data: { summary: string; keyPoints: string[]; suggestedAction: string } }) => response.data,
    }),
    smartTriage: builder.mutation<
      { suggestedAssignee: string | null; suggestedPriority: string; suggestedLabels: string[]; suggestedType: string; reasoning: string },
      { taskTitle: string; taskDescription: string; workspaceId: string }
    >({
      query: (body) => ({
        url: "/ai/triage",
        method: "POST",
        body,
      }),
      transformResponse: (response: { status: string; data: { suggestedAssignee: string | null; suggestedPriority: string; suggestedLabels: string[]; suggestedType: string; reasoning: string } }) => response.data,
    }),
    suggestSprintPlan: builder.mutation<
      { suggestedTasks: { taskKey: string; reason: string }[]; goal: string; estimatedPoints: number },
      { projectId: string; sprintName: string; sprintCapacity: number }
    >({
      query: (body) => ({
        url: "/ai/sprint-plan",
        method: "POST",
        body,
      }),
      transformResponse: (response: { status: string; data: { suggestedTasks: { taskKey: string; reason: string }[]; goal: string; estimatedPoints: number } }) => response.data,
    }),
    chatWithAI: builder.mutation<
      { reply: string },
      { message: string; context?: { taskKey?: string; workspaceId?: string; projectId?: string } }
    >({
      query: (body) => ({
        url: "/ai/chat",
        method: "POST",
        body,
      }),
      transformResponse: (response: { status: string; data: { reply: string } }) => response.data,
    }),
    getAIHistory: builder.query<
      { _id: string; feature: string; prompt: string; response: string; model: string; tokensUsed: number; duration: number; createdAt: string }[],
      { feature?: string; limit?: number } | void
    >({
      query: (params) => ({
        url: "/ai/history",
        params: params || {},
      }),
      transformResponse: (response: AIHistoryResponse) => response.data.history,
    }),
  }),
});

export const {
  useGenerateTicketDraftMutation,
  useSummarizeThreadMutation,
  useSmartTriageMutation,
  useSuggestSprintPlanMutation,
  useChatWithAIMutation,
  useGetAIHistoryQuery,
} = aiApi;