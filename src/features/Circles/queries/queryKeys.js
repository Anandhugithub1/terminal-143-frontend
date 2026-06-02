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

  post:
    (
      circleId,
      postId
    ) => [
      'post',
      circleId,
      postId
    ],

  comments:
    postId => [
      'comments',
      postId
    ],

  feed: [
    'feed'
  ]
};