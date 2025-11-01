export const LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Mandarin', value: 'zh' },
  { label: 'Thai', value: 'th' },
  { label: 'Russian', value: 'ru' },
  { label: 'Italian', value: 'it' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Japanese', value: 'jp' },
  { label: 'Korean', value: 'kr' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Arabic', value: 'ar' },
  { label: 'Bengali', value: 'bn' },
  { label: 'Urdu', value: 'ur' },
  { label: 'Turkish', value: 'tr' },
  { label: 'Vietnamese', value: 'vi' },
  { label: 'Polish', value: 'pl' },
  { label: 'Dutch', value: 'nl' },
  { label: 'Hebrew', value: 'he' },
  { label: 'Swedish', value: 'sv' },
  { label: 'Greek', value: 'el' },
];


export const getLanguageLabel = (value) => {
  const lang = LANGUAGES.find((l) => l.value === value);
  return lang ? lang.label : value;
};