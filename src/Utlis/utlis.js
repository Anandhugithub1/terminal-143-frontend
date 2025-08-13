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

// src/constants/languages.js
export const LANGUAGES = {
  ENGLISH: 'en',
  THAI: 'th',
  RUSSIAN: 'ru',
  CHINESE: 'zh',
  SPANISH: 'es',
  MEXICAN: 'mx',
  ITALIAN: 'it',
  PORTUGUESE: 'pt',
  FRENCH: 'fr',
  GERMAN: 'de',
  JAPANESE: 'ja',
  KOREAN: 'ko',
  ARABIC: 'ar',
  VIETNAMESE: 'vi',
  TURKISH: 'tr',
  TAMIL: 'ta',
  DUTCH: 'nl',
  GREEK: 'el',
  POLISH: 'pl',
  SWEDISH: 'sv',
  HEBREW: 'he',
  INDONESIAN: 'id',
  FILIPINO: 'fil',
  MALAY: 'ms',
  UKRAINIAN: 'uk',
  CZECH: 'cs',
  ROMANIAN: 'ro',
  HUNGARIAN: 'hu',
  DANISH: 'da',
  NORWEGIAN: 'no',
  FINNISH: 'fi',
};

export const languageOptions = [
  { label: 'English', value: LANGUAGES.ENGLISH, countryCode: 'GB' },
  { label: 'Spanish', value: LANGUAGES.SPANISH, countryCode: 'ES' },
  { label: 'French', value: LANGUAGES.FRENCH, countryCode: 'FR' },
  { label: 'German', value: LANGUAGES.GERMAN, countryCode: 'DE' },
  { label: 'Mandarin', value: LANGUAGES.CHINESE, countryCode: 'CN' },
  { label: 'Thai', value: LANGUAGES.THAI, countryCode: 'TH' },
  { label: 'Russian', value: LANGUAGES.RUSSIAN, countryCode: 'RU' },
  { label: 'Mexican', value: LANGUAGES.MEXICAN, countryCode: 'MX' },
  { label: 'Italian', value: LANGUAGES.ITALIAN, countryCode: 'IT' },
  { label: 'Portuguese', value: LANGUAGES.PORTUGUESE, countryCode: 'PT' },
  { label: 'Japanese', value: LANGUAGES.JAPANESE, countryCode: 'JP' },
  { label: 'Korean', value: LANGUAGES.KOREAN, countryCode: 'KR' },
  { label: 'Arabic', value: LANGUAGES.ARABIC, countryCode: 'SA' },
  { label: 'Vietnamese', value: LANGUAGES.VIETNAMESE, countryCode: 'VN' },
  { label: 'Turkish', value: LANGUAGES.TURKISH, countryCode: 'TR' },
  { label: 'Tamil', value: LANGUAGES.TAMIL, countryCode: 'IN' },
  { label: 'Dutch', value: LANGUAGES.DUTCH, countryCode: 'NL' },
  { label: 'Greek', value: LANGUAGES.GREEK, countryCode: 'GR' },
  { label: 'Polish', value: LANGUAGES.POLISH, countryCode: 'PL' },
  { label: 'Swedish', value: LANGUAGES.SWEDISH, countryCode: 'SE' },
  { label: 'Hebrew', value: LANGUAGES.HEBREW, countryCode: 'IL' },
  { label: 'Indonesian', value: LANGUAGES.INDONESIAN, countryCode: 'ID' },
  { label: 'Filipino', value: LANGUAGES.FILIPINO, countryCode: 'PH' },
  { label: 'Malay', value: LANGUAGES.MALAY, countryCode: 'MY' },
  { label: 'Ukrainian', value: LANGUAGES.UKRAINIAN, countryCode: 'UA' },
  { label: 'Czech', value: LANGUAGES.CZECH, countryCode: 'CZ' },
  { label: 'Romanian', value: LANGUAGES.ROMANIAN, countryCode: 'RO' },
  { label: 'Hungarian', value: LANGUAGES.HUNGARIAN, countryCode: 'HU' },
  { label: 'Danish', value: LANGUAGES.DANISH, countryCode: 'DK' },
  { label: 'Norwegian', value: LANGUAGES.NORWEGIAN, countryCode: 'NO' },
  { label: 'Finnish', value: LANGUAGES.FINNISH, countryCode: 'FI' },
];

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