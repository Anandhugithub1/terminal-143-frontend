import {
  ChevronRight,
  User,
  ChevronLeft,
  MapPin,
  Globe2,
  Film,
  PartyPopper,
  Compass,
  Umbrella,
  Edit2,
  Calendar,
} from 'lucide-react';


export function computeAge(dob) {
  if (!dob) return '';
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return '';
  const diffMs = Date.now() - birth.getTime();
  const msPerYear = 1000 * 60 * 60 * 24 * 365.2425;
  return Math.floor(diffMs / msPerYear).toString();
}

export function getProfileFields(profile) {
  if (!profile) return []; // Prevent crash when profile is null

  return [
    {
      key: 'gender',
      label: 'Gender',
      value: profile.gender === 'M' ? 'Male' : 'Female',
      icon: User,
    },
 {
  key: "age",
  label: "Age",
  value: computeAge(profile.dob), // display computed age
  rawValue: profile.dob || "", // store actual DOB for editing
  icon: Calendar,
},
    {
      key: 'location',
      label: 'Location',
      value: profile.location || 'Not set',
      icon: MapPin,
    },
    {
      key: 'languages',
      label: 'Languages',
      value: (profile.languagesKnown || []).join(', ') || 'Not set',
      icon: Globe2,
    },
  ];
}