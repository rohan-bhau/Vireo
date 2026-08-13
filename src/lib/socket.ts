"use client";

import { io, Socket } from "socket.io-client";
import { getAccessToken } from "./auth";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(): Socket {
  if (socket?.connected) return socket;

  const token = getAccessToken();
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

  socket = io(socketUrl, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
    console.log("[Socket] Connected");
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket] Disconnected:", reason);
    if (reason === "io server disconnect") {
      socket = null;
    }
  });

  socket.on("connect_error", (err) => {
    console.error("[Socket] Connection error:", err.message);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function reconnectSocket() {
  disconnectSocket();
  return connectSocket();
}

export function joinBoardRoom(boardId: string) {
  const s = connectSocket();
  s.emit("join-board", boardId);
}

export function leaveBoardRoom(boardId: string) {
  const s = getSocket();
  if (s) s.emit("leave-board", boardId);
}

export function onBoardUpdated(callback: () => void): () => void {
  const s = connectSocket();
  s.on("board-updated", callback);
  return () => { s.off("board-updated", callback); };
}

export function joinWorkspaceRoom(workspaceId: string) {
  const s = connectSocket();
  s.emit("join-workspace", workspaceId);
}

export function leaveWorkspaceRoom(workspaceId: string) {
  const s = getSocket();
  if (s) s.emit("leave-workspace", workspaceId);
}

export function onBoardColumnsReordered(callback: (data: { boardId: string; columns: { id: string; name: string; position: number }[] }) => void): () => void {
  const s = connectSocket();
  s.on("board-columns-reordered", callback);
  return () => { s.off("board-columns-reordered", callback); };
}

export interface TaskSocketData {
  task?: import("@/store/taskApi").Task;
  taskKey?: string;
  columnId?: string;
  actorId?: string;
  tasks?: import("@/store/taskApi").Task[];
}

export function onTaskMoved(callback: (data: TaskSocketData) => void): () => void {
  const s = connectSocket();
  s.on("task-moved", callback);
  return () => { s.off("task-moved", callback); };
}

export function onTaskCreated(callback: (data: TaskSocketData) => void): () => void {
  const s = connectSocket();
  s.on("task-created", callback);
  return () => { s.off("task-created", callback); };
}

export function onTaskUpdated(callback: (data: TaskSocketData) => void): () => void {
  const s = connectSocket();
  s.on("task-updated", callback);
  return () => { s.off("task-updated", callback); };
}

export function onTaskDeleted(callback: (data: TaskSocketData) => void): () => void {
  const s = connectSocket();
  s.on("task-deleted", callback);
  return () => { s.off("task-deleted", callback); };
}

export function onTaskReordered(callback: (data: TaskSocketData) => void): () => void {
  const s = connectSocket();
  s.on("task-reordered", callback);
  return () => { s.off("task-reordered", callback); };
}

export interface NotificationSocketData {
  _id?: string;
  userId?: string;
  type?: string;
  taskId?: string;
  taskTitle?: string;
  actorId?: string;
  actorName?: string;
  message?: string;
  read?: boolean;
  projectId?: string;
  workspaceId?: string;
  createdAt?: string;
}

export function onNewNotification(callback: (data: NotificationSocketData) => void): () => void {
  const s = connectSocket();
  s.on("new-notification", callback);
  return () => { s.off("new-notification", callback); };
}

export function onNotificationCount(callback: (data: { count: number }) => void): () => void {
  const s = connectSocket();
  s.on("notification-count", callback);
  return () => { s.off("notification-count", callback); };
}

export function onWorkspaceRemoved(callback: (data: { workspaceId: string }) => void): () => void {
  const s = connectSocket();
  s.on("workspace-removed", callback);
  return () => { s.off("workspace-removed", callback); };
}

export function onWorkspaceMemberRoleChanged(callback: (data: { workspaceId: string; userId: string; role: import("@/store/workspaceApi").Role }) => void): () => void {
  const s = connectSocket();
  s.on("workspace-member-role-changed", callback);
  return () => { s.off("workspace-member-role-changed", callback); };
}

export function onWorkspaceMemberAdded(callback: (data: { workspaceId: string; memberId: string; inviterId: string }) => void): () => void {
  const s = connectSocket();
  s.on("member-added", callback);
  return () => { s.off("member-added", callback); };
}
