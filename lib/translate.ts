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
      You are a professional translator specializing in translating educational content from Korean students.
      
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
    en: `Question: Why do you think debate is important in a democratic society?

I think debate is important in a democratic society because it allows for different perspectives to be heard and considered. When people engage in thoughtful debate, they are exposed to ideas and viewpoints they might not have considered before.

Debate also helps us refine our thinking and identify flaws in our reasoning. By having our ideas challenged, we can develop stronger arguments and better solutions to complex problems.

Finally, debate teaches important skills like critical thinking, active listening, and respectful disagreement - all necessary for citizens in a healthy democracy.`,
    
    fr: `Question: Pourquoi pensez-vous que le débat est important dans une société démocratique?

Je pense que le débat est important dans une société démocratique car il permet d'entendre et de prendre en compte différentes perspectives. Lorsque les gens participent à un débat réfléchi, ils sont exposés à des idées et des points de vue qu'ils n'auraient peut-être pas envisagés auparavant.

Le débat nous aide également à affiner notre réflexion et à identifier les failles dans notre raisonnement. En ayant nos idées remises en question, nous pouvons développer des arguments plus solides et de meilleures solutions aux problèmes complexes.

Enfin, le débat enseigne des compétences importantes comme la pensée critique, l'écoute active et le désaccord respectueux - toutes nécessaires aux citoyens dans une démocratie saine.`,
    
    tr: `Soru: Demokratik bir toplumda tartışmanın neden önemli olduğunu düşünüyorsunuz?

Demokratik bir toplumda tartışmanın önemli olduğunu düşünüyorum çünkü farklı bakış açılarının duyulmasına ve dikkate alınmasına olanak tanıyor. İnsanlar düşünceli bir tartışmaya girdiklerinde, daha önce düşünmemiş olabilecekleri fikir ve bakış açılarına maruz kalırlar.

Tartışma aynı zamanda düşüncemizi geliştirmemize ve mantığımızdaki kusurları belirlememize yardımcı olur. Fikirlerimiz sorgulandığında, karmaşık sorunlara daha güçlü argümanlar ve daha iyi çözümler geliştirebiliriz.

Son olarak, tartışma, eleştirel düşünme, aktif dinleme ve saygılı anlaşmazlık gibi sağlıklı bir demokraside vatandaşlar için gerekli olan önemli becerileri öğretir.`
  }
  
  return sampleTranslations[targetLang] || sampleTranslations['en']
}