import { translateText } from './gemini'

// Languages supported by the translation service
type SupportedLanguage = 
  | 'en'  // English
  | 'fr'  // French
  | 'tr'  // Turkish
  | 'sv'  // Swedish
  | 'de'  // German
  | 'es'  // Spanish
  | 'it'  // Italian
  | 'nl'  // Dutch
  | 'pt'  // Portuguese
  | 'ru'  // Russian
  | 'ar'  // Arabic
  | 'th'  // Thai
  | 'el'  // Greek
  | 'et'  // Estonian
  | 'be'  // Belarusian
  | 'no'  // Norwegian
  | 'da'  // Danish

// Language names for display purposes
export const languageNames: Record<SupportedLanguage, string> = {
  en: '영어 (English)',
  fr: '프랑스어 (Français)',
  tr: '터키어 (Türkçe)',
  sv: '스웨덴어 (Svenska)',
  de: '독일어 (Deutsch)',
  es: '스페인어 (Español)',
  it: '이탈리아어 (Italiano)',
  nl: '네덜란드어 (Nederlands)',
  pt: '포르투갈어 (Português)',
  ru: '러시아어 (Русский)',
  ar: '아랍어 (العربية)',
  th: '태국어 (ไทย)',
  el: '그리스어 (Ελληνικά)',
  et: '에스토니아어 (Eesti)',
  be: '벨라루스어 (Беларуская)',
  no: '노르웨이어 (Norsk)',
  da: '덴마크어 (Dansk)'
}

/**
 * This function is disabled in the current version of the application.
 * It was used for the Korean War Veterans letter translation feature.
 */
export async function translateLetter(text: string, targetLang: string = 'en'): Promise<string> {
  return "Translation functionality is disabled.";
}

/**
 * This function is disabled in the current version of the application.
 * It was used for sample translations in the Korean War Veterans feature.
 */
export function getSampleTranslation(targetLang: string): string {
  return "Sample translation functionality is disabled.";
}