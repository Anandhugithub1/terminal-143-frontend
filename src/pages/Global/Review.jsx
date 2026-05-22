import React from "react";
import ReviewsSection from "./components/Review";
export const demoReviews = [
  {
    reviewId: "1",
    displayName: "KanyaS",
    rating: 5,
    text: "My first attempt at finding a genuine Asian partner on an app, and PassorMatch feels just right. Profiles are well verified, and the overall experience has been smooth and enjoyable. I haven’t come across fake profiles since I mostly interact with verified users, and I’ve already met some really nice people.",
    city: "Phuket",
    country: "Thailand",
    timeAgo: "3 days ago",
    profilePhoto: "https://d36zx1g74mcorc.cloudfront.net/websitephotos/reviews/KanyaS.png"
  },
  {
    reviewId: "2",
    displayName: "Philip S.",
    rating: 5,
    text: "So far, PassorMatch has been a really interesting experience. At one point I got locked out of my account, but the support team helped me recover it quickly. Thanks to them, I’m back on the app and hopeful about finding the right person.",
    city: "Manchester",
    country: "United Kingdom",
    timeAgo: "1 week ago",
    profilePhoto: "https://d36zx1g74mcorc.cloudfront.net/websitephotos/reviews/philip-s.png"
  },
  {
    reviewId: "3",
    displayName: "John Miller",
    rating: 4,
    text: "This is honestly one of the better apps out there. No annoying constant upgrade reminders, which is refreshing. The community feels more respectful overall, and the app itself is easy to use and very stable.",
    city: "Toronto",
    country: "Canada",
    timeAgo: "5 days ago",
    profilePhoto: "https://d36zx1g74mcorc.cloudfront.net/websitephotos/reviews/johns.png"
  },
  {
    reviewId: "4",
    displayName: "Tom David",
    rating: 5,
    text: "In just one day, I met several people I genuinely liked. Everyone was kind, respectful, and interesting, which made the experience feel very genuine. No one asked for money, which is a huge plus. Overall, a very positive experience.",
    city: "Sydney",
    country: "Australia",
    timeAgo: "2 days ago",
    profilePhoto: "https://d36zx1g74mcorc.cloudfront.net/websitephotos/reviews/tom_david.jpeg"
  },
  {
    reviewId: "5",
    displayName: "Rachel Adams",
    rating: 5,
    text: "If you’re looking to meet friendly and genuine people, PassorMatch is a great platform. The experience has been smooth, and it really encourages honest connections. Just be yourself, stay safe, and enjoy the process.",
    city: "NewYork",
    country: "USA",
    timeAgo: "6 days ago",
    profilePhoto: "https://d36zx1g74mcorc.cloudfront.net/websitephotos/reviews/Rachel%20Adams.png"
  },

  {
    reviewId: "6",
    displayName: "Nattaya K.",
    rating: 5,
    text: "Very clean and well-designed dating app. Everything from settings to match discovery feels thoughtfully built. Fake profiles and scammers seem minimal thanks to good security measures. PassorMatch is easily a 5-star app for anyone serious about finding a meaningful connection.",
    city: "Bangkok",
    country: "Thailand",
    timeAgo: "4 days ago",
    profilePhoto: "https://d36zx1g74mcorc.cloudfront.net/websitephotos/reviews/Nattaya.png"
  },
  {
    reviewId: "7",
    displayName: "Daniel Chen",
    rating: 5,
    text: "Really enjoying my time on PassorMatch so far. The experience has been smooth and easy to use. What matters most is having the opportunity to connect with genuine people and explore real relationships. Overall, it has been a very positive experience.",
    city: "Singapore",
    country: "Singapore",
    timeAgo: "1 week ago",
    profilePhoto: "https://d36zx1g74mcorc.cloudfront.net/websitephotos/reviews/Daniel%20Chen.png"
  }
]

export default function ReviewPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ReviewsSection
        reviews={demoReviews}
        onMoreClick={null} // no button on full page
      />
    </div>
  );
}