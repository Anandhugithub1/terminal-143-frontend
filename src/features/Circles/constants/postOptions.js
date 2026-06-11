import { Globe, Users, Lock } from "lucide-react";

// Suggested tags shown when creating a post.
export const suggestedTags = [
  "Morning Run",
  "Marathon",
  "Tips",
  "Question",
  "Achievement",
  "Event",
  "Motivation",
  "Gear",
];

// Visibility options for a post.
export const visibilityOptions = [
  { value: "all", label: "Everyone", icon: Globe, description: "Visible to everyone" },
  { value: "members", label: "Members Only", icon: Users, description: "Only circle members" },
  { value: "admins", label: "Admins Only", icon: Lock, description: "Only circle admins" },
];

// Activity types a post can be tagged with.
export const activityTypes = [
  "Running",
  "Walking",
  "Cycling",
  "Hiking",
  "Gym Workout",
  "Yoga",
  "Swimming",
  "Other",
];
