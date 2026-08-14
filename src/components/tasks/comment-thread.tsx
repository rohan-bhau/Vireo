"use client";

import { useState, useRef, useEffect } from "react";
import { DropdownPanel } from "@/components/ui/dropdown";
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
import { AICommentSuggestion } from "@/components/ai/ai-comment-suggestion";
import { joinWorkspaceRoom, onCommentChanged } from "@/lib/socket";

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

function renderCommentContent(content: string): React.ReactNode {
  const parts = content.split(/(@[\w\s]+?)(?=\s|$|[.,!?;:])/g);
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
  const { data: comments, isLoading, refetch } = useGetTaskCommentsQuery(taskKey);
  const { data: members } = useGetMembersQuery(workspaceId || "", { skip: !workspaceId });

  useEffect(() => {
    if (!workspaceId) return;
    joinWorkspaceRoom(workspaceId);
    const off = onCommentChanged((data) => {
      if (data.taskKey === taskKey) refetch();
    });
    return () => { off(); };
  }, [workspaceId, taskKey, refetch]);
  const [createComment] = useCreateCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  function getUserName(userId: string): string {
    const member = members?.find((m) => m.userId === userId);
    return member?.user?.name || userId;
  }

  function getUserAvatar(userId: string): string | null {
    const member = members?.find((m) => m.userId === userId);
    return member?.user?.avatar || null;
  }

  function Avatar({ userId, size = 8 }: { userId: string; size?: number }) {
    const avatar = getUserAvatar(userId);
    const initial = getUserName(userId).charAt(0)?.toUpperCase() || "?";
    const cls = `h-${size} w-${size}`;
    if (avatar) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt={getUserName(userId)} className={`${cls} flex-shrink-0 rounded-full object-cover`} />
      );
    }
    return (
      <div className={`${cls} flex flex-shrink-0 items-center justify-center rounded-full bg-bg-light text-xs font-semibold text-text-secondary`}>
        {initial}
      </div>
    );
  }

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mentionAnchorRef = useRef<HTMLDivElement>(null);

  const filteredUsers = (members || [])
    .map((m) => m.user?.name)
    .filter((name): name is string => !!name)
    .filter((n) => n.toLowerCase().includes(mentionSearch.toLowerCase()));

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
        {currentUser?.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentUser.avatar} alt={currentUser.name || "You"} className="h-8 w-8 flex-shrink-0 rounded-full object-cover" />
        ) : (
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
            {currentUser?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
        )}
        <div className="flex flex-1 flex-col gap-2 relative">
          <div ref={mentionAnchorRef}>
            <textarea
              ref={inputRef}
              data-shortcut="comment-input"
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
            {mentionOpen && filteredUsers.length > 0 && (
              <DropdownPanel open={mentionOpen} triggerRef={mentionAnchorRef} onClose={() => setMentionOpen(false)} maxHeight={128} width={300}>
                {filteredUsers.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); insertMention(u); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-bg-light"
                  >
                    {(() => {
                      const member = members?.find((m) => m.user?.name === u);
                      return member?.user?.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={member.user.avatar} alt={u} className="h-5 w-5 flex-shrink-0 rounded-full object-cover" />
                      ) : (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] text-white">
                          {u.charAt(0)}
                        </span>
                      );
                    })()}
                    {u}
                  </button>
                ))}
              </DropdownPanel>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 mt-2">
            <AICommentSuggestion
              taskKey={taskKey}
              commentText={newComment}
              threadContext={(comments || [])
                .slice(-5)
                .map((c) => `${getUserName(c.authorId)}: ${c.content}`)
                .join("\n")}
              onApply={(suggestion) => {
                setNewComment(suggestion);
              }}
            />
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
              <Avatar userId={comment.authorId} />
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