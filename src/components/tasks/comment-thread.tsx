"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  useGetTaskCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  type Comment,
} from "@/store/taskApi";
import { Button } from "@/components/ui/button";

interface CommentThreadProps {
  taskKey: string;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function CommentThread({ taskKey }: CommentThreadProps) {
  const { data: comments, isLoading } = useGetTaskCommentsQuery(taskKey);
  const [createComment] = useCreateCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      await createComment({ taskKey, content: newComment.trim() }).unwrap();
      setNewComment("");
    } catch {
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(commentId: string) {
    if (!editContent.trim() || submitting) return;
    setSubmitting(true);
    try {
      await updateComment({ taskKey, commentId, content: editContent.trim() }).unwrap();
      setEditingId(null);
      setEditContent("");
    } catch {
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId: string) {
    if (!confirm("Delete this comment?")) return;
    try {
      await deleteComment({ taskKey, commentId }).unwrap();
    } catch {}
  }

  function startEdit(comment: Comment) {
    setEditingId(comment._id);
    setEditContent(comment.content);
  }

  if (isLoading) {
    return (
      <div className="py-4 text-center text-sm text-[#737686]">Loading comments...</div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-[#121C28]">
        Comments ({comments?.length ?? 0})
      </h3>

      <div className="flex gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-xs font-semibold text-white">
          {currentUser?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={2}
            className="w-full resize-none rounded-lg border border-[#C3C6D7]/40 bg-white px-3 py-2 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleSubmit();
              }
            }}
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!newComment.trim() || submitting}
              isLoading={submitting}
            >
              Comment
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#E5E7EF] text-xs font-semibold text-[#434655]">
                {comment.authorId?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#121C28]">
                    {comment.authorId}
                  </span>
                  <span className="text-[11px] text-[#C3C6D7]">
                    {timeAgo(comment.createdAt)}
                  </span>
                  {comment.editedAt && (
                    <span className="text-[11px] text-[#C3C6D7]">(edited)</span>
                  )}
                </div>

                {editingId === comment._id ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={2}
                      className="w-full resize-none rounded-lg border border-[#C3C6D7]/40 bg-white px-3 py-2 text-sm text-[#121C28] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                          handleEdit(comment._id);
                        }
                        if (e.key === "Escape") {
                          setEditingId(null);
                        }
                      }}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleEdit(comment._id)} isLoading={submitting}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[#434655] whitespace-pre-wrap">
                    {comment.content}
                  </p>
                )}

                {comment.authorId === currentUser?.id && editingId !== comment._id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(comment)}
                      className="text-[11px] font-medium text-[#737686] hover:text-[#2563EB] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="text-[11px] font-medium text-[#737686] hover:text-red-500 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-sm text-[#C3C6D7] py-4">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
}
