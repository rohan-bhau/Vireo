import { api } from "./api";

export type TaskType = "task" | "bug" | "epic" | "story" | "subtask";
export type TaskStatus = "todo" | "in_progress" | "in_review" | "done";
export type TaskPriority = "lowest" | "low" | "medium" | "high" | "highest";

export interface Attachment {
  url: string;
  filename: string;
  publicId: string;
}

export interface LinkedTask {
  taskId: string;
  type: "blocks" | "blocked_by" | "relates_to";
}

export interface Task {
  _id: string;
  taskKey: string;
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string | null;
  reporter: string;
  projectId: string;
  boardId: string | null;
  columnId: string | null;
  position: number;
  labels: string[];
  dueDate: string | null;
  storyPoints: number | null;
  parentTask: string | null;
  linkedTasks: LinkedTask[];
  attachments: Attachment[];
  workspaceId: string;
  sprintId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityItem {
  _id: string;
  taskId: string;
  actorId: string;
  action: "created" | "updated" | "status_changed" | "assigned" | "commented" | "attachment_added" | "attachment_removed";
  field?: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}

export interface Comment {
  _id: string;
  taskId: string;
  authorId: string;
  content: string;
  editedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TaskResponse {
  status: string;
  data: { task: Task };
}

interface TasksResponse {
  status: string;
  data: { tasks: Task[] };
}

interface ActivityResponse {
  status: string;
  data: { activity: ActivityItem[] };
}

interface CommentsResponse {
  status: string;
  data: { comments: Comment[] };
}

interface CommentResponse {
  status: string;
  data: { comment: Comment };
}

interface CreateTaskInput {
  title: string;
  description?: string;
  type?: TaskType;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  projectId?: string;
  boardId?: string;
  columnId?: string;
  labels?: string[];
  dueDate?: string;
  storyPoints?: number;
  parentTask?: string;
  workspaceId: string;
}

interface UpdateTaskInput {
  title?: string;
  description?: string;
  type?: TaskType;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string | null;
  labels?: string[];
  dueDate?: string | null;
  storyPoints?: number | null;
  parentTask?: string | null;
  columnId?: string | null;
  position?: number;
}

export const taskApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTaskByKey: builder.query<Task, string>({
      query: (taskKey) => `/tasks/${taskKey}`,
      transformResponse: (response: TaskResponse) => response.data.task,
      providesTags: (_result, _error, taskKey) => [{ type: "Task", id: taskKey }],
    }),
    getWorkspaceTasks: builder.query<Task[], string>({
      query: (workspaceId) => `/tasks/workspace/${workspaceId}`,
      transformResponse: (response: TasksResponse) => response.data.tasks,
      providesTags: (_result, _error, workspaceId) => [{ type: "Task", id: `workspace-${workspaceId}` }],
    }),
    getProjectTasks: builder.query<Task[], string>({
      query: (projectId) => `/tasks/project/${projectId}`,
      transformResponse: (response: TasksResponse) => response.data.tasks,
      providesTags: (_result, _error, projectId) => [{ type: "Task", id: `project-${projectId}` }],
    }),
    getBoardTasks: builder.query<Task[], string>({
      query: (boardId) => `/tasks/board/${boardId}`,
      transformResponse: (response: TasksResponse) => response.data.tasks,
      providesTags: (_result, _error, boardId) => [{ type: "Task", id: `board-${boardId}` }],
    }),
    getColumnTasks: builder.query<Task[], string>({
      query: (columnId) => `/tasks/column/${columnId}`,
      transformResponse: (response: TasksResponse) => response.data.tasks,
    }),
    createTask: builder.mutation<Task, CreateTaskInput>({
      query: (body) => ({
        url: "/tasks",
        method: "POST",
        body,
      }),
      transformResponse: (response: TaskResponse) => response.data.task,
      invalidatesTags: (_result, _error, { workspaceId, projectId }) => [
        { type: "Task", id: `workspace-${workspaceId}` },
        ...(projectId ? [{ type: "Task" as const, id: `project-${projectId}` }] : []),
      ],
    }),
    updateTask: builder.mutation<Task, { taskKey: string; data: UpdateTaskInput }>({
      query: ({ taskKey, data }) => ({
        url: `/tasks/${taskKey}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: TaskResponse) => response.data.task,
      invalidatesTags: (_result, _error, { taskKey }) => [
        { type: "Task", id: taskKey },
      ],
    }),
    deleteTask: builder.mutation<void, string>({
      query: (taskKey) => ({
        url: `/tasks/${taskKey}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Task"],
    }),
    moveTask: builder.mutation<Task, { taskKey: string; columnId: string; position: number }>({
      query: ({ taskKey, ...body }) => ({
        url: `/tasks/${taskKey}/move`,
        method: "POST",
        body,
      }),
      transformResponse: (response: TaskResponse) => response.data.task,
      invalidatesTags: ["Task"],
    }),
    addAttachment: builder.mutation<Task, { taskKey: string; url: string; filename: string; publicId: string }>({
      query: ({ taskKey, ...body }) => ({
        url: `/tasks/${taskKey}/attachments`,
        method: "POST",
        body,
      }),
      transformResponse: (response: TaskResponse) => response.data.task,
      invalidatesTags: (_result, _error, { taskKey }) => [
        { type: "Task", id: taskKey },
      ],
    }),
    removeAttachment: builder.mutation<void, { taskKey: string; publicId: string }>({
      query: ({ taskKey, publicId }) => ({
        url: `/tasks/${taskKey}/attachments/${publicId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { taskKey }) => [
        { type: "Task", id: taskKey },
      ],
    }),
    getTaskActivity: builder.query<ActivityItem[], string>({
      query: (taskKey) => `/tasks/${taskKey}/activity`,
      transformResponse: (response: ActivityResponse) => response.data.activity,
    }),
    getTaskComments: builder.query<Comment[], string>({
      query: (taskKey) => `/tasks/${taskKey}/comments`,
      transformResponse: (response: CommentsResponse) => response.data.comments,
      providesTags: (_result, _error, taskKey) => [{ type: "Comments", id: taskKey }],
    }),
    createComment: builder.mutation<Comment, { taskKey: string; content: string }>({
      query: ({ taskKey, ...body }) => ({
        url: `/tasks/${taskKey}/comments`,
        method: "POST",
        body,
      }),
      transformResponse: (response: CommentResponse) => response.data.comment,
      invalidatesTags: (_result, _error, { taskKey }) => [
        { type: "Comments", id: taskKey },
      ],
    }),
    updateComment: builder.mutation<Comment, { taskKey: string; commentId: string; content: string }>({
      query: ({ taskKey, commentId, ...body }) => ({
        url: `/tasks/${taskKey}/comments/${commentId}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: CommentResponse) => response.data.comment,
      invalidatesTags: (_result, _error, { taskKey }) => [
        { type: "Comments", id: taskKey },
      ],
    }),
    deleteComment: builder.mutation<void, { taskKey: string; commentId: string }>({
      query: ({ taskKey, commentId }) => ({
        url: `/tasks/${taskKey}/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { taskKey }) => [
        { type: "Comments", id: taskKey },
      ],
    }),
    linkTasks: builder.mutation<Task, { taskKey: string; linkedTaskKey: string; linkType: "blocks" | "blocked_by" | "relates_to" }>({
      query: ({ taskKey, ...body }) => ({
        url: `/tasks/${taskKey}/link`,
        method: "POST",
        body,
      }),
      transformResponse: (response: TaskResponse) => response.data.task,
      invalidatesTags: (_result, _error, { taskKey, linkedTaskKey }) => [
        { type: "Task", id: taskKey },
      ],
    }),
    unlinkTasks: builder.mutation<void, { taskKey: string; linkedTaskKey: string }>({
      query: ({ taskKey, linkedTaskKey }) => ({
        url: `/tasks/${taskKey}/link/${linkedTaskKey}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { taskKey }) => [
        { type: "Task", id: taskKey },
      ],
    }),
    reorderTasks: builder.mutation<Task[], { columnId: string; taskIds: string[] }>({
      query: (body) => ({
        url: `/tasks/reorder`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: TasksResponse) => response.data.tasks,
    }),
  }),
});

export const {
  useGetTaskByKeyQuery,
  useGetWorkspaceTasksQuery,
  useGetProjectTasksQuery,
  useGetBoardTasksQuery,
  useGetColumnTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useMoveTaskMutation,
  useAddAttachmentMutation,
  useRemoveAttachmentMutation,
  useGetTaskActivityQuery,
  useGetTaskCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useLinkTasksMutation,
  useUnlinkTasksMutation,
  useReorderTasksMutation,
} = taskApi;
