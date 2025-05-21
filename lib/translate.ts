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
 * Translates a letter from Korean to the specified language
 * @param text The Korean text to translate
 * @param targetLang The target language code
 * @returns The translated text
 */
export async function translateLetter(text: string, targetLang: string = 'en'): Promise<string> {
  try {
    // In a real implementation, this would use an API like Google Translate
    // For now, we'll use Gemini to perform the translation
    
    // Check if the target language is supported
    if (!Object.keys(languageNames).includes(targetLang)) {
      console.warn(`Language '${targetLang}' not directly supported, falling back to English.`)
      targetLang = 'en'
    }
    
    const prompt = `
      You are a professional translator specializing in translating messages from Korean students.
      
      Please translate the following Korean text to ${targetLang === 'en' ? 'English' : languageNames[targetLang as SupportedLanguage]}. 
      
      Maintain the tone, emotion, and meaning of the original text while making it natural in the target language.
      Preserve paragraph breaks and formatting.
      
      Korean text to translate:
      "${text}"
      
      Translation:
    `
    
    const translation = await translateText(prompt)
    return translation
  } catch (error) {
    console.error('Translation error:', error)
    throw new Error('Translation failed. Please try again later.')
  }
}

/**
 * Gets a sample translation for development/testing purposes
 * @param targetLang The target language code
 * @returns A sample translated text
 */
export function getSampleTranslation(targetLang: string): string {
  // This is just for development/demo purposes
  const sampleTranslations: Record<string, string> = {
    en: `Dear friends,

I am a student from South Korea, and I would like to share my thoughts on the topic we discussed in class today.

I found the discussion very interesting and learned a lot from hearing different perspectives.

I hope we can continue these kinds of discussions in the future as they help us develop critical thinking skills.

Thank you for reading my message.`,
    
    fr: `Chers amis,

Je suis un étudiant de la Corée du Sud, et je voudrais partager mes réflexions sur le sujet que nous avons discuté en classe aujourd'hui.

J'ai trouvé la discussion très intéressante et j'ai beaucoup appris en entendant différentes perspectives.

J'espère que nous pourrons continuer ce genre de discussions à l'avenir car elles nous aident à développer des compétences de pensée critique.

Merci d'avoir lu mon message.`,
    
    tr: `Değerli arkadaşlar,

Ben Güney Kore'den bir öğrenciyim ve bugün sınıfta tartıştığımız konu hakkındaki düşüncelerimi paylaşmak istiyorum.

Tartışmayı çok ilginç buldum ve farklı bakış açılarını duyarak çok şey öğrendim.

Eleştirel düşünme becerilerimizi geliştirmemize yardımcı oldukları için gelecekte bu tür tartışmalara devam edebileceğimizi umuyorum.

Mesajımı okuduğunuz için teşekkür ederim.`
  }
  
  return sampleTranslations[targetLang] || sampleTranslations['en']
}