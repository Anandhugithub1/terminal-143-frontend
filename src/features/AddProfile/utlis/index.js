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
    TO_FEMALE: 'TF',  // Ladyboy, Shemale, Trans Women
    TO_MALE: 'TM',    // Trans Man, Tomboy
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
  


  export const  categories = {
    '🎮 Entertainment': ['Travel', 'Movies', 'Gaming', 'Sports', 'Art', 'Reading'],
    '🎵 Music Genres': ['Pop', 'Rock', 'Jazz', 'Hip Hop', 'EDM', 'Classical'],
    '🍔 Food & Drink': ['Coffee', 'Cocktails', 'BBQ', 'Sushi', 'Wine', 'Dessert'],
  };
  