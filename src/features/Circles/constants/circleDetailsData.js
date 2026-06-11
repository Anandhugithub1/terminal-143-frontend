// Demo data for CircleDetailsPage, used as a fallback when no circle data
// is passed via route state.
// TODO: replace with data from useCircles/usePosts once wired up.
export const circleData = {
  id: 1,
  name: "Running Club Bangkok",
  description:
    "A community of running enthusiasts in Bangkok. From beginners to marathon runners, everyone is welcome! 🏃‍♂️🏃‍♀️",
  members: 124,
  onlineMembers: 23,
  location: "Bangkok, Thailand",
  image:
    "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=300&fit=crop",
  coverImage:
    "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=400&fit=crop",
  bgColor: "bg-rose-50",
  category: "Sports & Fitness",
  createdDate: "January 2024",
  tags: ["Running", "Fitness", "Marathon", "Outdoor", "Health"],
  rules: [
    "Be respectful to all members",
    "No spam or self-promotion",
    "Share your running achievements",
    "Keep conversations on topic",
  ],
};

export const members = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Admin",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    isOnline: true,
  },
  {
    id: 2,
    name: "Mike Johnson",
    role: "Moderator",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    isOnline: true,
  },
  {
    id: 3,
    name: "Emma Wilson",
    role: "Member",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    isOnline: false,
  },
  {
    id: 4,
    name: "James Brown",
    role: "Member",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    isOnline: true,
  },
];

export const events = [
  {
    id: 1,
    title: "Sunday Morning Run",
    date: "Sunday, Jan 15",
    time: "7:00 AM",
    location: "Benjakitti Park",
    attendees: 23,
    image:
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=200&fit=crop",
  },
  {
    id: 2,
    title: "Marathon Training Session",
    date: "Wednesday, Jan 18",
    time: "6:00 PM",
    location: "Lumpini Park",
    attendees: 15,
    image:
      "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=200&fit=crop",
  },
];

export const initialPosts = [
  {
    id: 1,
    author: {
      name: "Mike Johnson",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    content:
      "Great morning run today! Completed 10KM in 55 minutes. The weather was perfect! 🏃‍♂️",
    image:
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=400&fit=crop",
    time: "2 hours ago",
    likes: 45,
    comments: 12,
    isLiked: false,
    tags: ["Morning Run", "Achievement"],
  },
  {
    id: 2,
    author: {
      name: "Sarah Chen",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    content:
      "Who's joining the Sunday run? We're planning a new route through the park. Drop a comment if you're coming! 🏃‍♀️",
    image: null,
    time: "5 hours ago",
    likes: 32,
    comments: 18,
    isLiked: true,
    tags: ["Event", "Sunday Run"],
  },
];
