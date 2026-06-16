import { useState } from "react";
import { Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useComments, useCreateComment, useReplyToComment } from "../../hooks/useComments";
import { useMyProfile } from "../../../UserProfile/Hooks/useMyProfile";
import CommentCard from "./CommentCard";
import BottomSheetModal from "../common/BottomSheetModal";
import { DEFAULT_AVATAR, formatPostTime as formatCommentTime } from "../../utils/postDisplay";
import { CommentSkeleton } from "../common/Skeletons";

const COMMENT_MAX_LENGTH = 500;

export default function CommentSection({ isOpen, onClose, post }) {
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  const postId = post?.postId;
  const { data: commentsData, isLoading } = useComments(postId);
  const createCommentMutation = useCreateComment(postId);
  const replyCommentMutation = useReplyToComment(postId);

  const { data: myProfile } = useMyProfile();

  const comments = commentsData?.items || commentsData?.comments || [];

  // Strip "USER#" prefix from PK to compare against bare authorId from post
  const myId = myProfile?.username?.replace(/^USER#/, "") ?? "";
  const isPostAuthor = !!myId && myId === post?.authorId;

  if (!isOpen) return null;

  const handleSubmitComment = (e) => {
    e.preventDefault();
    const content = newComment.trim();
    if (!content || content.length > COMMENT_MAX_LENGTH || !postId || createCommentMutation.isPending) return;

    createCommentMutation.mutate(
      {
        content,
        circleId: post.circleId,
        createdAtEpoch: String(post.createdAtEpoch),
        authorImage: myProfile?.profilePhoto || "",
      },
      {
        onSuccess: () => setNewComment(""),
      }
    );
  };

  const handleSubmitReply = (e, comment) => {
    e.preventDefault();
    const content = replyText.trim();
    if (!content || content.length > COMMENT_MAX_LENGTH || !postId || replyCommentMutation.isPending) return;

    replyCommentMutation.mutate(
      {
        content,
        circleId: post.circleId,
        createdAtEpoch: String(post.createdAtEpoch),
        parentCommentId: comment.commentId || comment.id,
        authorImage: myProfile?.profilePhoto || "",
      },
      {
        onSuccess: () => {
          setReplyText("");
          setReplyingTo(null);
        },
      }
    );
  };

  return (
    <BottomSheetModal
      isOpen={isOpen}
      onClose={onClose}
      panelClassName="max-w-lg h-[80vh] sm:h-[70vh] sm:rounded-2xl flex flex-col"
    >
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Comments</h3>
            {post?.title && (
              <p className="text-xs text-gray-500 mt-0.5">{post.title}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading && (
            <>
              <CommentSkeleton />
              <CommentSkeleton />
              <CommentSkeleton />
            </>
          )}

          {!isLoading && comments.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No comments yet. Be the first to comment!</p>
          )}

          {comments.map((comment) => {
            const commentAuthor = comment.authorName || comment.author?.name || comment.userName || comment.name;
            const commentKey = comment.commentId || comment.id;
            const isReplying = replyingTo === commentKey;

            return (
              <CommentCard
                key={commentKey}
                avatar={comment.authorImage || comment.author?.avatar || comment.avatar || DEFAULT_AVATAR}
                name={commentAuthor || "Anonymous"}
                text={comment.content || comment.text || comment.body}
                time={formatCommentTime(comment.createdAtEpoch)}
                likes={comment.likes ?? 0}
                onAuthorClick={
                  comment.authorId
                    ? () => navigate(`/profile/${comment.authorId}`)
                    : undefined
                }
                onReply={isPostAuthor ? () => setReplyingTo(isReplying ? null : commentKey) : undefined}
                replies={(comment.replies || []).map((reply) => ({
                  commentId: reply.commentId || reply.id,
                  avatar: reply.authorImage || reply.author?.avatar || reply.avatar || DEFAULT_AVATAR,
                  name: reply.authorName || reply.author?.name || reply.userName || reply.name || "Anonymous",
                  text: reply.content || reply.text || reply.body,
                  time: formatCommentTime(reply.createdAtEpoch),
                  likes: reply.likes ?? 0,
                  onAuthorClick: reply.authorId
                    ? () => navigate(`/profile/${reply.authorId}`)
                    : undefined,
                }))}
                replySlot={
                  isReplying && (
                    <form
                      onSubmit={(e) => handleSubmitReply(e, comment)}
                      className="mt-2 flex items-center gap-2 pl-1"
                    >
                      <img
                        src={myProfile?.profilePhoto || DEFAULT_AVATAR}
                        alt="You"
                        className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                      />
                      <input
                        type="text"
                        autoFocus
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value.slice(0, COMMENT_MAX_LENGTH))}
                        placeholder="Write a reply..."
                        maxLength={COMMENT_MAX_LENGTH}
                        className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <button
                        type="submit"
                        disabled={!replyText.trim() || replyCommentMutation.isPending}
                        className="p-1.5 bg-primary text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  )
                }
              />
            );
          })}
        </div>

        {/* Comment Input */}
        <div className="flex-shrink-0 p-4 border-t border-gray-100">
          <form onSubmit={handleSubmitComment} className="flex items-center gap-3">
            <img
              src={myProfile?.profilePhoto || DEFAULT_AVATAR}
              alt="Your avatar"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 relative">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value.slice(0, COMMENT_MAX_LENGTH))}
                placeholder="Write a comment..."
                maxLength={COMMENT_MAX_LENGTH}
                className="w-full pl-4 pr-12 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || createCommentMutation.isPending}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
          {newComment.length > COMMENT_MAX_LENGTH * 0.9 && (
            <p className="text-xs text-gray-400 text-right mt-1">
              {newComment.length}/{COMMENT_MAX_LENGTH}
            </p>
          )}
        </div>
    </BottomSheetModal>
  );
}
