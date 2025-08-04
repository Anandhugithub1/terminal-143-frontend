export   const validateLink = (value) => {
    const urlPattern = /^https:\/\/[^\s/$.?#].[^\s]*$/i;
    if (value.startsWith('http://')) return false;
    if (value.startsWith('https://')) return urlPattern.test(value);
    return true; // Allow usernames
  };

export const SOCIAL_PLATFORMS = ['IG', 'FB', 'Telegram', 'Line', 'Wechat', 'Other'];


export const PREFERENCES = {
    MALE: 'M',
    FEMALE: 'F',
    TO_FEMALE: 'tF',  // Ladyboy, Shemale, Trans Women
    TO_MALE: 'tM',    // Trans Man, Tomboy
    OTHERS: 'Ot',
  };    
  

  
// Helper to calculate age from date string (YYYY-MM-DD)
export const calculateAge = (dob) => {
    if (!dob) return 0;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  export const statusOptions = [
    { label: 'Positive', value: 'p' },
    { label: 'Negative', value: 'n' },
    { label: 'Prefer not to say', value: 'pns' },
  ];
  
  export const LANGUAGES = [
    { label: 'English',   value: 'en' },
    { label: 'Spanish',   value: 'es' },
    { label: 'French',    value: 'fr' },
    { label: 'German',    value: 'de' },
    { label: 'Mandarin',  value: 'zh' },
    { label: 'Thai',      value: 'th' },
    { label: 'Russian',   value: 'ru' },
    { label: 'Italian',   value: 'it' },
    { label: 'Portuguese',value: 'pt' },
    { label: 'Japanese',  value: 'jp' },
    { label: 'Korean',    value: 'kr' },
    { label: 'Hindi',     value: 'hi' },
    { label: 'Arabic',    value: 'ar' },
    { label: 'Bengali',   value: 'bn' },
    { label: 'Urdu',      value: 'ur' },
    { label: 'Turkish',   value: 'tr' },
    { label: 'Vietnamese',value: 'vi' },
    { label: 'Polish',    value: 'pl' },
    { label: 'Dutch',     value: 'nl' },
    { label: 'Hebrew',    value: 'he' },
    { label: 'Swedish',   value: 'sv' },
    { label: 'Greek',     value: 'el' },
  ];

  export const  categories = {
    '🎮 Entertainment': ['Travel', 'Movies', 'Gaming', 'Sports', 'Art', 'Reading'],
    '🎵 Music Genres': ['Pop', 'Rock', 'Jazz', 'Hip Hop', 'EDM', 'Classical'],
    '🍔 Food & Drink': ['Coffee', 'Cocktails', 'BBQ', 'Sushi', 'Wine', 'Dessert'],
  };
  