// Demo comments for CommentSection.
// TODO: replace with data from useComments(postId) once wired up.
export const demoComments = [
  {
    id: 1,
    user: {
      name: "Mike Johnson",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    text: "I'd love to join! What's the pace like?",
    time: "1h ago",
    likes: 12,
    replies: [
      {
        id: 2,
        user: {
          name: "Alex",
          avatar:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
        },
        text: "Easy pace, around 6:00/km. Perfect for beginners!",
        time: "45m ago",
        likes: 5,
      },
    ],
  },
  {
    id: 3,
    user: {
      name: "Sarah Chen",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
    text: "Count me in! Benjakitti is beautiful in the morning 🏃‍♀️",
    time: "30m ago",
    likes: 8,
    replies: [],
  },
];
