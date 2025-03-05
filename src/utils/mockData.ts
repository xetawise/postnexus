
// Mock users data
export const users = [
  {
    id: "1",
    email: "john@example.com",
    username: "johndoe",
    fullName: "John Doe",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&auto=format&fit=crop&q=80",
    bio: "Software developer passionate about UX/UI design",
    isPrivate: false,
    createdAt: "2023-01-15T00:00:00Z",
    followers: 1243,
    following: 542,
    posts: 86,
  },
  {
    id: "2",
    email: "jane@example.com",
    username: "janesmith",
    fullName: "Jane Smith",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&auto=format&fit=crop&q=80",
    bio: "Digital artist and photographer",
    isPrivate: true,
    createdAt: "2023-02-20T00:00:00Z",
    followers: 8765,
    following: 382,
    posts: 215,
  },
  {
    id: "3",
    email: "mike@example.com",
    username: "mikebrown",
    fullName: "Mike Brown",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&auto=format&fit=crop&q=80",
    bio: "Travel enthusiast | Food lover",
    isPrivate: false,
    createdAt: "2023-03-10T00:00:00Z",
    followers: 532,
    following: 235,
    posts: 43,
  },
  {
    id: "4",
    email: "sara@example.com",
    username: "saralee",
    fullName: "Sara Lee",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&auto=format&fit=crop&q=80",
    bio: "Fashion designer | Minimalist",
    isPrivate: false,
    createdAt: "2023-04-05T00:00:00Z",
    followers: 3421,
    following: 129,
    posts: 157,
  },
  {
    id: "5",
    email: "alex@example.com",
    username: "alexchen",
    fullName: "Alex Chen",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&auto=format&fit=crop&q=80",
    bio: "Musician and entrepreneur",
    isPrivate: false,
    createdAt: "2023-05-12T00:00:00Z",
    followers: 982,
    following: 311,
    posts: 72,
  },
];

// Mock posts data
export const posts = [
  {
    id: "post1",
    userId: "2",
    text: "Just finished my latest artwork! What do you think?",
    images: [
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&auto=format&fit=crop&q=60"
    ],
    video: null,
    createdAt: "2023-11-05T14:32:00Z",
    isPrivate: false,
    likes: 326,
    comments: 42,
    shares: 18,
  },
  {
    id: "post2",
    userId: "3",
    text: "Exploring the beautiful mountains this weekend. The view is breathtaking!",
    images: [
      "https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1443632864897-14973fa006cf?w=800&auto=format&fit=crop&q=60"
    ],
    video: null,
    createdAt: "2023-11-04T09:15:00Z",
    isPrivate: false,
    likes: 541,
    comments: 63,
    shares: 32,
  },
  {
    id: "post3",
    userId: "4",
    text: "My latest fashion creation. Minimalist design with a touch of elegance.",
    images: [
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=60"
    ],
    video: null,
    createdAt: "2023-11-03T16:48:00Z",
    isPrivate: false,
    likes: 892,
    comments: 107,
    shares: 45,
  },
  {
    id: "post4",
    userId: "5",
    text: "Dropped my new song today! Link in bio.",
    images: [],
    video: "https://example.com/video1.mp4",
    createdAt: "2023-11-02T20:23:00Z",
    isPrivate: false,
    likes: 1243,
    comments: 285,
    shares: 176,
  },
  {
    id: "post5",
    userId: "1",
    text: "Just launched my new portfolio website! Check it out and let me know what you think.",
    images: [
      "https://images.unsplash.com/photo-1555421689-d68471e189f2?w=800&auto=format&fit=crop&q=60"
    ],
    video: null,
    createdAt: "2023-11-01T13:10:00Z",
    isPrivate: false,
    likes: 427,
    comments: 53,
    shares: 21,
  },
  {
    id: "post6",
    userId: "2",
    text: "Working on a new art project. Here's a sneak peek!",
    images: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=60"
    ],
    video: null,
    createdAt: "2023-10-31T11:42:00Z",
    isPrivate: true,
    likes: 218,
    comments: 32,
    shares: 9,
  },
  {
    id: "post7",
    userId: "3",
    text: "Found this amazing cafe today. The coffee is absolutely divine!",
    images: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=60"
    ],
    video: null,
    createdAt: "2023-10-30T15:30:00Z",
    isPrivate: false,
    likes: 356,
    comments: 48,
    shares: 15,
  },
  {
    id: "post8",
    userId: "4",
    text: "New collection inspired by urban architecture. Launching next month!",
    images: [
      "https://images.unsplash.com/photo-1664575599736-c5197c684128?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e0174?w=800&auto=format&fit=crop&q=60"
    ],
    video: null,
    createdAt: "2023-10-29T18:05:00Z",
    isPrivate: false,
    likes: 724,
    comments: 89,
    shares: 37,
  },
  {
    id: "post9",
    userId: "5",
    text: "In the studio working on my next album. Can't wait to share it with you all!",
    images: [
      "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&auto=format&fit=crop&q=60"
    ],
    video: null,
    createdAt: "2023-10-28T21:15:00Z",
    isPrivate: false,
    likes: 932,
    comments: 203,
    shares: 88,
  },
  {
    id: "post10",
    userId: "1",
    text: "Exploring new coding techniques. Always learning!",
    images: [
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=60"
    ],
    video: null,
    createdAt: "2023-10-27T14:40:00Z",
    isPrivate: false,
    likes: 315,
    comments: 42,
    shares: 17,
  },
];

// Mock comments data
export const comments = [
  {
    id: "comment1",
    postId: "post1",
    userId: "1",
    text: "This looks amazing! Love the colors.",
    createdAt: "2023-11-05T15:10:00Z",
    likes: 24,
  },
  {
    id: "comment2",
    postId: "post1",
    userId: "3",
    text: "Incredible talent! Would love to see your process.",
    createdAt: "2023-11-05T16:22:00Z",
    likes: 13,
  },
  {
    id: "comment3",
    postId: "post2",
    userId: "4",
    text: "Beautiful views! Where is this?",
    createdAt: "2023-11-04T10:05:00Z",
    likes: 8,
  },
  {
    id: "comment4",
    postId: "post3",
    userId: "5",
    text: "I'd definitely wear this! Is it available for purchase?",
    createdAt: "2023-11-03T17:30:00Z",
    likes: 19,
  },
  {
    id: "comment5",
    postId: "post4",
    userId: "2",
    text: "Just listened to it! Absolutely fantastic work!",
    createdAt: "2023-11-02T21:15:00Z",
    likes: 32,
  },
];

// Mock notifications data
export const notifications = [
  {
    id: "notification1",
    userId: "1",
    type: "like",
    initiatorId: "2",
    contentId: "post5",
    isRead: false,
    createdAt: "2023-11-05T16:45:00Z",
  },
  {
    id: "notification2",
    userId: "1",
    type: "comment",
    initiatorId: "3",
    contentId: "post5",
    isRead: true,
    createdAt: "2023-11-05T14:20:00Z",
  },
  {
    id: "notification3",
    userId: "1",
    type: "follow",
    initiatorId: "4",
    contentId: null,
    isRead: false,
    createdAt: "2023-11-04T19:30:00Z",
  },
  {
    id: "notification4",
    userId: "1",
    type: "mention",
    initiatorId: "5",
    contentId: "post4",
    isRead: true,
    createdAt: "2023-11-03T12:10:00Z",
  },
  {
    id: "notification5",
    userId: "1",
    type: "share",
    initiatorId: "2",
    contentId: "post10",
    isRead: false,
    createdAt: "2023-11-02T09:45:00Z",
  },
];

// Mock user relationships (following/followers)
export const userRelationships = [
  { followerId: "1", followingId: "2" },
  { followerId: "1", followingId: "3" },
  { followerId: "1", followingId: "5" },
  { followerId: "2", followingId: "1" },
  { followerId: "2", followingId: "4" },
  { followerId: "3", followingId: "1" },
  { followerId: "3", followingId: "2" },
  { followerId: "3", followingId: "4" },
  { followerId: "3", followingId: "5" },
  { followerId: "4", followingId: "2" },
  { followerId: "4", followingId: "5" },
  { followerId: "5", followingId: "1" },
  { followerId: "5", followingId: "2" },
  { followerId: "5", followingId: "3" },
];

// Helper functions to get data
export const getUserById = (id: string) => {
  return users.find(user => user.id === id);
};

export const getPostById = (id: string) => {
  return posts.find(post => post.id === id);
};

export const getPostsByUserId = (userId: string) => {
  return posts.filter(post => post.userId === userId);
};

export const getCommentsByPostId = (postId: string) => {
  return comments.filter(comment => comment.postId === postId);
};

export const getNotificationsByUserId = (userId: string) => {
  return notifications.filter(notification => notification.userId === userId);
};

export const getUserFollowers = (userId: string) => {
  return userRelationships.filter(rel => rel.followingId === userId).map(rel => rel.followerId);
};

export const getUserFollowing = (userId: string) => {
  return userRelationships.filter(rel => rel.followerId === userId).map(rel => rel.followingId);
};

export const isUserFollowing = (followerId: string, followingId: string) => {
  return userRelationships.some(rel => rel.followerId === followerId && rel.followingId === followingId);
};

// Recommended users (not following yet)
export const getRecommendedUsers = (userId: string, limit = 5) => {
  const following = getUserFollowing(userId);
  return users
    .filter(user => user.id !== userId && !following.includes(user.id))
    .slice(0, limit);
};
