import ReviewsSection from "./others/Review";
const demoReviews = [
  {
    reviewId: "1",
    displayName: "Aanya R.",
    rating: 5,
    text: "Met someone amazing here. Didn’t expect it to actually work 💕",
    city: "Bangalore",
    country: "India",
    timeAgo: "2 days ago",
    profilePhoto: "https://i.pravatar.cc/100?img=1"
  },
  {
    reviewId: "2",
    displayName: "Rohan M.",
    rating: 4,
    text: "Good experience so far. UI is smooth and matches feel real.",
    city: "Mumbai",
    country: "India",
    timeAgo: "1 week ago",
    profilePhoto: "https://i.pravatar.cc/100?img=3"
  },
  {
    reviewId: "3",
    displayName: "Neha T.",
    rating: 3,
    text: "Decent app. Got some matches but nothing serious yet.",
    city: "Delhi",
    country: "India",
    timeAgo: "2 weeks ago",
    profilePhoto: "https://i.pravatar.cc/100?img=5"
  }
];

export default function ReviewPage() {
  return (
    <ReviewsSection
      reviews={demoReviews}
      onMoreClick={() => console.log("Go to reviews page")}
    />
  );
}