"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { api } from "@/store/api";
import { onNewNotification, onNotificationCount, connectSocket } from "@/lib/socket";

export function NotificationListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = connectSocket();

    const cleanup1 = onNewNotification((data) => {
      dispatch(api.util.invalidateTags(["Notifications"]));
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
