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
  HeartPulse,
} from 'lucide-react';


export const interestMap = {
  Travel: { label: 'Travel', icon: Globe2 },
  Movies: { label: 'Movies', icon: Film },
  Parties: { label: 'Parties', icon: PartyPopper },
  Adventures: { label: 'Adventures', icon: Compass },
  Beach: { label: 'Beach', icon: Umbrella },
};



   export function calculateAge(dob) {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}


export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export function computeAge(dob) {
  if (!dob) return '';
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return '';
  const diffMs = Date.now() - birth.getTime();
  const msPerYear = 1000 * 60 * 60 * 24 * 365.2425;
  return Math.floor(diffMs / msPerYear).toString();
}

const STD_STATUS_LABELS = {
  p: 'Positive',
  n: 'Negative',
  pns: 'Prefer not to say',
};

export function getProfileFields(profile) {
  if (!profile) return []; // Prevent crash when profile is null

  return [
    {
      key: 'gender',
      label: 'Gender',
      value: profile.gender === 'M' ? 'Male' : 'Female',
      icon: User,
    },
    

    {key:"name",
label:"Name",
value:profile.name || "",
icon:User,


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
    {
      key: 'healthStatus',
      label: 'Health Status',
      value: profile.healthStatus?.stdStatus
        ? STD_STATUS_LABELS[profile.healthStatus.stdStatus] || 'Not set'
        : 'Not set',
      rawValue: profile.healthStatus || {},
      icon: HeartPulse,
    },
  ];
}



export  const LANGUAGE_LABELS = {
  en: 'English',
  fr: 'French',
  de: 'German',
  zh: 'Chinese',
  ja: 'Japanese',
  ar: 'Arabic',
};


export const baseurl ="https://authapi.terminal143.com"