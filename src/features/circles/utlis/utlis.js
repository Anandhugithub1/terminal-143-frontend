/* -------------------- Enhanced Mock Data -------------------- */
export const SAMPLE_CIRCLES = [
  { 
    circleId: "c-1", 
    name: "Hiking Enthusiasts", 
    description: "Weekend trails, meetup & gear tips", 
    visibility: "public", 
    tags: ["hiking", "outdoors", "adventure"],
    memberCount: 243,
    onlineCount: 12
  },
  { 
    circleId: "c-2", 
    name: "Coffee Lovers", 
    description: "Brew methods, cafe recommendations & bean reviews", 
    visibility: "public", 
    tags: ["coffee", "beans", "brew"],
    memberCount: 156,
    onlineCount: 8
  },
  { 
    circleId: "c-3", 
    name: "Film Buffs Club", 
    description: "Film discussions, screenings & reviews", 
    visibility: "invite", 
    tags: ["movies", "reviews", "cinema"],
    memberCount: 89,
    onlineCount: 3
  }
];

export const SAMPLE_POSTS = {
  "c-1": [
    {
      postId: "p1",
      author: { id: "u1", name: "Asha Patel", avatar: "", role: "Organizer" },
      body: "Sunrise ridge hike this Sunday — moderate difficulty with stunning views. Meet 6:30am at parking lot A. Don't forget water and snacks! 🥾",
      likeCount: 24,
      commentCount: 8,
      isLiked: false,
      createdAt: Date.now() - 1000 * 60 * 60 * 8,
      previews: [
        { commentId: "cm1", authorName: "Ravi Kumar", body: "I'll join! Bringing my friend along too.", isLiked: true },
        { commentId: "cm2", authorName: "Maya Chen", body: "Count me in. The sunrise should be spectacular!" }
      ],
      attachments: 2
    },
    {
      postId: "p2",
      author: { id: "u2", name: "Sam Wilson", avatar: "", role: "Regular" },
      body: "Trail update: Heavy rain last night made some sections slippery. Wear proper hiking shoes with good traction!",
      likeCount: 6,
      commentCount: 3,
      isLiked: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 26,
      previews: [],
      attachments: 0
    }
  ],
  "c-2": [],
  "c-3": []
};