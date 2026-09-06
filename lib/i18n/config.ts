export interface Language {
  code: string;
  script: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', script: 'Latn', name: 'English', nativeName: 'English' },
  { code: 'hi', script: 'Deva', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'mr', script: 'Deva', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gom', script: 'Deva', name: 'Konkani', nativeName: 'कोंकणी' },
  { code: 'gu', script: 'Gujr', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'ta', script: 'Taml', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', script: 'Telu', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', script: 'Knda', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', script: 'Mlym', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'bn', script: 'Beng', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'pa', script: 'Guru', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'or', script: 'Orya', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'as', script: 'Beng', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'sa', script: 'Deva', name: 'Sanskrit', nativeName: 'संस्कृतम्' },
  { code: 'ur', script: 'Arab', name: 'Urdu', nativeName: 'اردو' }
];

export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES[0];
