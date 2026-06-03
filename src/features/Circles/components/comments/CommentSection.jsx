// components/circles/CommentSection.jsx
import { useState } from "react";
import { Heart, MoreVertical, Send } from "lucide-react";

// Demo comments data
const demoComments = [
  {
    id: 1,
    user: {
      name: "Mike Johnson",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    text: "I'd love to join! What's the pace like?",
    time: "1h ago",
    likes: 12,
    replies: [
      {
        id: 2,
        user: {
          name: "Alex",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
        },
        text: "Easy pace, around 6:00/km. Perfect for beginners!",
        time: "45m ago",
        likes: 5,
      }
    ]
  },
  {
    id: 3,
    user: {
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
    text: "Count me in! Benjakitti is beautiful in the morning 🏃‍♀️",
    time: "30m ago",
    likes: 8,
    replies: []
  }
];

export default function CommentSection({ isOpen, onClose, post }) {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(demoComments);

  if (!isOpen) return null;

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      user: {
        name: "You",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
      },
      text: newComment,
      time: "Just now",
      likes: 0,
      replies: []
    };

    setComments([comment, ...comments]);
    setNewComment("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Comment Sheet */}
      <div className="relative bg-white w-full max-w-lg h-[80vh] sm:h-[70vh] sm:rounded-2xl shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Comments</h3>
            {post && (
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
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-3">
              {/* Main Comment */}
              <div className="flex gap-3">
                <img
                  src={comment.user.avatar}
                  alt={comment.user.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-50 rounded-2xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-800 text-sm">
                        {comment.user.name}
                      </h4>
                      <button className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    <p className="text-gray-600 text-sm">{comment.text}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 px-2">
                    <span className="text-xs text-gray-400">{comment.time}</span>
                    <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                      <Heart className="w-3.5 h-3.5" />
                      {comment.likes}
                    </button>
                    <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors font-semibold">
                      Reply
                    </button>
                  </div>

                  {/* Replies */}
                  {comment.replies?.map((reply) => (
                    <div key={reply.id} className="ml-4 mt-2 flex gap-3">
                      <img
                        src={reply.user.avatar}
                        alt={reply.user.name}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="bg-gray-50 rounded-2xl p-3">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-800 text-sm">
                              {reply.user.name}
                            </h4>
                            <button className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                              <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
                            </button>
                          </div>
                          <p className="text-gray-600 text-sm">{reply.text}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-1.5 px-2">
                          <span className="text-xs text-gray-400">{reply.time}</span>
                          <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                            <Heart className="w-3.5 h-3.5" />
                            {reply.likes}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comment Input */}
        <div className="flex-shrink-0 p-4 border-t border-gray-100">
          <form onSubmit={handleSubmitComment} className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
              alt="Your avatar"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 relative">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full pl-4 pr-12 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}