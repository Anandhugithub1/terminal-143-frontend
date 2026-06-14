import { Heart, Plane, Utensils, Dumbbell, BookOpen, Film } from "lucide-react";
import onboardingCirclesData from "./onboarding-circles.json";

// Activity-based communities shown during circle onboarding, sourced from
// onboarding-circles.json – great for social / dating contexts.
const categoryMeta = {
  dating: { label: "Dating", icon: Heart, bgColor: "bg-pink-50", iconBg: "bg-pink-100", iconColor: "text-pink-600" },
  travel: { label: "Travel", icon: Plane, bgColor: "bg-blue-50", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  food: { label: "Food", icon: Utensils, bgColor: "bg-orange-50", iconBg: "bg-orange-100", iconColor: "text-orange-600" },
  fitness: { label: "Fitness", icon: Dumbbell, bgColor: "bg-emerald-50", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
  books: { label: "Books", icon: BookOpen, bgColor: "bg-purple-50", iconBg: "bg-purple-100", iconColor: "text-purple-600" },
  movies: { label: "Movies", icon: Film, bgColor: "bg-amber-50", iconBg: "bg-amber-100", iconColor: "text-amber-600" },
};

export const availableCircles = onboardingCirclesData.circles
  .filter((circle) => circle.visibility === "public")
  .map((circle, index) => {
    const meta = categoryMeta[circle.category] ?? categoryMeta.fitness;
    return {
      id: index + 1,
      name: circle.name,
      description: circle.description,
      image: circle.coverPhoto,
      tags: circle.tags,
      category: meta.label,
      icon: meta.icon,
      bgColor: meta.bgColor,
      iconBg: meta.iconBg,
      iconColor: meta.iconColor,
    };
  });

export const onboardingCategories = [
  "All",
  ...new Set(availableCircles.map((circle) => circle.category)),
];
