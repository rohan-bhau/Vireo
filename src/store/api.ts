import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    credentials: "include",
  }),
  tagTypes: [
    "Workspaces",
    "Projects",
    "Issues",
    "Comments",
    "Sprints",
    "Epics",
    "Board",
    "Notifications",
    "Users",
    "Messages",
    "Conversations",
  ],
  endpoints: () => ({}),
});
