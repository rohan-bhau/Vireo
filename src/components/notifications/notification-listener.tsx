"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { api } from "@/store/api";
import { onNewNotification, onNotificationCount, connectSocket } from "@/lib/socket";
import { toastInfo } from "@/lib/toast";

interface IncomingNotification {
  type?: string;
  message?: string;
  actorName?: string;
  taskId?: string;
  taskTitle?: string;
  workspaceId?: string;
}

export function NotificationListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    connectSocket();

    const cleanup1 = onNewNotification((data: IncomingNotification) => {
      dispatch(api.util.invalidateTags(["Notifications"]));
      if (!data || !data.message) return;

      const prefix = data.actorName ? `${data.actorName.trim()} ` : "";
      const href = data.taskId
        ? `/search?q=${encodeURIComponent(`key = "${data.taskId}"`)}`
        : data.workspaceId
          ? `/w/${data.workspaceId}`
          : undefined;

      toastInfo(`${prefix}${data.message}`, { href });
    });

    const cleanup2 = onNotificationCount((data) => {
      dispatch(api.util.invalidateTags(["Notifications"]));
    });

    return () => {
      cleanup1();
      cleanup2();
    };
  }, [dispatch]);

  return null;
}