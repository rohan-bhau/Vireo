"use client";

import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  useGetTaskCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  type Comment,
} from "@/store/taskApi";
import { useGetMembersQuery } from "@/store/workspaceApi";
import { Button } from "@/components/ui/button";

interface CommentThreadProps {
  taskKey: string;
  workspaceId?: string;
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

const MOCK_USERS = ["Alice", "Bob", "Charlie", "Diana", "Eve"];

function renderCommentContent(content: string): React.ReactNode {
  const parts = content.split(/(@\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("@")) {
      return (
        <span key={i} className="font-medium text-primary">
          {part}
        </span>
      );
    }
    return part;
  });
}

export function CommentThread({ taskKey, workspaceId }: CommentThreadProps) {
  const { data: comments, isLoading } = useGetTaskCommentsQuery(taskKey);
  const { data: members } = useGetMembersQuery(workspaceId || "", { skip: !workspaceId });
  const [createComment] = useCreateCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  function getUserName(userId: string): string {
    const member = members?.find((m) => m.userId === userId);
    return member?.user?.name || userId;
  }

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const filteredUsers = MOCK_USERS.filter((u) =>
    u.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  function handleInputChange(value: string) {
    setNewComment(value);
    const lastAt = value.lastIndexOf("@");
    if (lastAt !== -1) {
      const after = value.slice(lastAt + 1);
      if (!after.includes(" ") && after.length > 0) {
        setMentionSearch(after);
        setMentionOpen(true);
        return;
      }
    }
    setMentionOpen(false);
  }

  function insertMention(user: string) {
    const lastAt = newComment.lastIndexOf("@");
    if (lastAt !== -1) {
      const before = newComment.slice(0, lastAt);
      const after = newComment.slice(lastAt + mentionSearch.length + 1);
      setNewComment(`${before}@${user} ${after}`);
    }
    setMentionOpen(false);
    inputRef.current?.focus();
  }

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
      <div className="py-4 text-center text-sm text-text-placeholder">Loading comments...</div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-text">
        Comments ({comments?.length ?? 0})
      </h3>

      <div className="flex gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
          {currentUser?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div className="flex flex-1 flex-col gap-2 relative">
          <div>
            <textarea
              ref={inputRef}
              value={newComment}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Write a comment... Use @ to mention someone"
              rows={2}
              className="w-full resize-none rounded-[3px] border border-border-input bg-surface px-3 py-2 text-sm text-text placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            {mentionOpen && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-[3px] border border-border-light bg-surface shadow-modal max-h-32 overflow-y-auto">
                {filteredUsers.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); insertMention(u); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-bg-light"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] text-white">
                      {u.charAt(0)}
                    </span>
                    {u}
                  </button>
                ))}
              </div>
            )}
          </div>
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
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-bg-light text-xs font-semibold text-text-secondary">
                {getUserName(comment.authorId).charAt(0).toUpperCase() || "?"}
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-text">
                    {getUserName(comment.authorId)}
                  </span>
                  <span className="text-[11px] text-text-placeholder">
                    {timeAgo(comment.createdAt)}
                  </span>
                  {comment.editedAt && (
                    <span className="text-[11px] text-text-placeholder">(edited)</span>
                  )}
                </div>

                {editingId === comment._id ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={2}
                      className="w-full resize-none rounded-[3px] border border-border-input bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault();
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
                  <p className="text-sm text-text-secondary whitespace-pre-wrap">
                    {renderCommentContent(comment.content)}
                  </p>
                )}

                {comment.authorId === currentUser?.id && editingId !== comment._id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(comment)}
                      className="text-[11px] font-medium text-text-placeholder hover:text-primary transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="text-[11px] font-medium text-text-placeholder hover:text-danger transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-sm text-text-placeholder py-4">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
}