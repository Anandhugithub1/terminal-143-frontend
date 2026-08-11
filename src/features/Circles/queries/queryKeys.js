export const queryKeys =
{
  circles: [
    'circles'
  ],

  circle:
    circleId => [
      'circle',
      circleId
    ],

  posts:
    circleId => [
      'posts',
      circleId
    ],

  myPosts: [
    'myPosts'
  ],

  userPosts:
    authorId => [
      'userPosts',
      authorId
    ],

  post:
    (
      circleId,
      postId,
      createdAtEpoch
    ) => [
      'post',
      circleId,
      postId,
      createdAtEpoch
    ],

  comments:
    postId => [
      'comments',
      postId
    ],

  feed: [
    'feed'
  ],

  circleSearch:
    query => [
      'circleSearch',
      query
    ],

  circleTagSearch:
    tag => [
      'circleTagSearch',
      tag
    ],

  postTagSearch:
    tag => [
      'postTagSearch',
      tag
    ],

  circleChatHistory:
    circleId => [
      'circleChatHistory',
      circleId
    ],

  circleChatUnread: [
    'circleChatUnread'
  ],

  circleMembers:
    circleId => [
      'circleMembers',
      circleId
    ],

  circleRequests:
    circleId => [
      'circleRequests',
      circleId
    ],

  circleStats:
    circleId => [
      'circleStats',
      circleId
    ]
};