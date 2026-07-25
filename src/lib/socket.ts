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

export function onTaskMoved(callback: (data: any) => void): () => void {
  const s = connectSocket();
  s.on("task-moved", callback);
  return () => { s.off("task-moved", callback); };
}

export function onTaskCreated(callback: (data: any) => void): () => void {
  const s = connectSocket();
  s.on("task-created", callback);
  return () => { s.off("task-created", callback); };
}

export function onTaskUpdated(callback: (data: any) => void): () => void {
  const s = connectSocket();
  s.on("task-updated", callback);
  return () => { s.off("task-updated", callback); };
}
