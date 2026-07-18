import {
  Palette,
  Briefcase,
  Leaf,
  Music2,
  Gamepad2,
  HeartPulse,
  Sparkles,
  Globe2,
  Megaphone,
  Music,
  PawPrint,
  Church,
  GraduationCap,
  Users,
  Dumbbell,
  LifeBuoy,
  Mountain,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import onboardingCirclesData from "./onboarding-circles.json";

// Activity-based communities shown during circle onboarding, sourced from
// onboarding-circles.json – great for social / dating contexts.
const categoryMeta = {
  art_culture: { label: "Art & Culture", icon: Palette, bgColor: "bg-rose-50", iconBg: "bg-rose-100", iconColor: "text-rose-600" },
  career_business: { label: "Career & Business", icon: Briefcase, bgColor: "bg-slate-50", iconBg: "bg-slate-100", iconColor: "text-slate-600" },
  environment: { label: "Environment", icon: Leaf, bgColor: "bg-green-50", iconBg: "bg-green-100", iconColor: "text-green-600" },
  dancing: { label: "Dancing", icon: Music2, bgColor: "bg-fuchsia-50", iconBg: "bg-fuchsia-100", iconColor: "text-fuchsia-600" },
  games: { label: "Games", icon: Gamepad2, bgColor: "bg-violet-50", iconBg: "bg-violet-100", iconColor: "text-violet-600" },
  health_wellbeing: { label: "Health & Wellbeing", icon: HeartPulse, bgColor: "bg-emerald-50", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
  hobbies_passions: { label: "Hobbies & Passions", icon: Sparkles, bgColor: "bg-amber-50", iconBg: "bg-amber-100", iconColor: "text-amber-600" },
  identity_language: { label: "Identity & Language", icon: Globe2, bgColor: "bg-blue-50", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  movements_politics: { label: "Movements & Politics", icon: Megaphone, bgColor: "bg-red-50", iconBg: "bg-red-100", iconColor: "text-red-600" },
  music: { label: "Music", icon: Music, bgColor: "bg-indigo-50", iconBg: "bg-indigo-100", iconColor: "text-indigo-600" },
  pets_animals: { label: "Pets & Animals", icon: PawPrint, bgColor: "bg-orange-50", iconBg: "bg-orange-100", iconColor: "text-orange-600" },
  religion_spirituality: { label: "Religion & Spirituality", icon: Church, bgColor: "bg-purple-50", iconBg: "bg-purple-100", iconColor: "text-purple-600" },
  science_education: { label: "Science & Education", icon: GraduationCap, bgColor: "bg-cyan-50", iconBg: "bg-cyan-100", iconColor: "text-cyan-600" },
  social_activities: { label: "Social Activities", icon: Users, bgColor: "bg-pink-50", iconBg: "bg-pink-100", iconColor: "text-pink-600" },
  sports_fitness: { label: "Sports & Fitness", icon: Dumbbell, bgColor: "bg-teal-50", iconBg: "bg-teal-100", iconColor: "text-teal-600" },
  support_health: { label: "Support & Health", icon: LifeBuoy, bgColor: "bg-sky-50", iconBg: "bg-sky-100", iconColor: "text-sky-600" },
  travel_outdoor: { label: "Travel & Outdoor", icon: Mountain, bgColor: "bg-lime-50", iconBg: "bg-lime-100", iconColor: "text-lime-600" },
};

// English fallback list — use useOnboardingCircles() in components so
// name/description come through i18next instead.
export const availableCircles = onboardingCirclesData.circles
  .filter((circle) => circle.visibility === "public")
  .map((circle, index) => {
    const meta = categoryMeta[circle.category] ?? categoryMeta.hobbies_passions;
    return {
      id: index + 1,
      circleId: circle.circleId,
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

// Same list as availableCircles, but name/description are translated via the
// onboardingCircles namespace (public/locales/{lng}/onboardingCircles.json,
// keyed by circleId), falling back to the English seed data in
// onboarding-circles.json for any circle a locale file hasn't caught up on yet.
export function useOnboardingCircles() {
  const { t } = useTranslation("onboardingCircles");

  return availableCircles.map((circle) => ({
    ...circle,
    name: t(`${circle.circleId}.name`, circle.name),
    description: t(`${circle.circleId}.description`, circle.description),
  }));
}
