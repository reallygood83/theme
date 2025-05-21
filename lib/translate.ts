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
      You are a professional translator specializing in translating heartfelt letters from Korean students to the veterans and citizens of countries that participated in the Korean War.
      
      Please translate the following Korean letter to ${targetLang === 'en' ? 'English' : languageNames[targetLang as SupportedLanguage]}. 
      
      Maintain the tone, emotion, and meaning of the original text while making it natural in the target language.
      Preserve paragraph breaks and formatting.
      
      Korean letter to translate:
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
    en: `Dear veterans and citizens of the United States,

I am a student from South Korea, and I would like to express my deepest gratitude for the courage and sacrifice your country showed for Korea during the Korean War from 1950 to 1953.

The 1,789,000 soldiers sent from your country fought for freedom and peace.

Without your sacrifice and help, today's South Korea would not exist. We will never forget this debt of gratitude, and hope that the friendship between our two countries will continue to deepen in the future.

Thank you from the bottom of my heart.`,
    
    fr: `Chers vétérans et citoyens de la France,

Je suis un étudiant de la Corée du Sud, et je voudrais exprimer ma plus profonde gratitude pour le courage et le sacrifice dont votre pays a fait preuve pour la Corée pendant la guerre de Corée de 1950 à 1953.

Les soldats envoyés par votre pays ont combattu pour la liberté et la paix.

Sans votre sacrifice et votre aide, la Corée du Sud d'aujourd'hui n'existerait pas. Nous n'oublierons jamais cette dette de gratitude, et espérons que l'amitié entre nos deux pays continuera à s'approfondir à l'avenir.

Je vous remercie du fond du cœur.`,
    
    tr: `Türkiye'nin değerli gazileri ve vatandaşları,

Ben Güney Kore'den bir öğrenciyim ve 1950'den 1953'e kadar süren Kore Savaşı sırasında ülkenizin Kore için gösterdiği cesaret ve fedakarlık için en derin minnettarlığımı ifade etmek istiyorum.

Ülkenizden gönderilen 21.212 asker özgürlük ve barış için savaştı.

Sizin fedakarlığınız ve yardımınız olmasaydı, bugünkü Güney Kore var olmazdı. Bu minnettarlık borcunu asla unutmayacağız ve iki ülkemiz arasındaki dostluğun gelecekte daha da derinleşmesini umuyoruz.

Kalbimin derinliklerinden teşekkür ederim.`
  }
  
  return sampleTranslations[targetLang] || sampleTranslations['en']
}