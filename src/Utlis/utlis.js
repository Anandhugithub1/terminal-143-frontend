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
export  const LANGUAGE_LABELS = {
  en: 'English',
  fr: 'French',
  de: 'German',
  zh: 'Chinese',
  ja: 'Japanese',
  ar: 'Arabic',
};



export const interestMap = {
  Travel: { label: 'Travel', icon: Globe2 },
  Movies: { label: 'Movies', icon: Film },
  Parties: { label: 'Parties', icon: PartyPopper },
  Adventures: { label: 'Adventures', icon: Compass },
  Beach: { label: 'Beach', icon: Umbrella },
};


export function computeAge(dob) {
  if (!dob) return '';
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return '';
  const diffMs = Date.now() - birth.getTime();
  const msPerYear = 1000 * 60 * 60 * 24 * 365.2425;
  return Math.floor(diffMs / msPerYear).toString();
}

export function getProfileFields(profile) {
  return [
    {
      key: 'gender',
      label: 'Gender',
      value: profile.gender === 'M' ? 'Male' : 'Female',
      icon: User,
    },
    {
      key: 'age',
      label: 'Age',
      value: computeAge(profile.dob),
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





export const baseurl ="https://authapi.terminal143.com"