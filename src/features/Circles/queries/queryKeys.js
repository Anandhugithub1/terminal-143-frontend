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
  ]
};