/**
 * Ethiopian Ministry of Education (MoE) Primary School Medium of Instruction Policy:
 * 
 * 1. Grades 1–6 (Lower & Middle Primary):
 *    - Amharic (አማርኛ), General Science (አጠቃላይ ሳይንስ), Environmental Science (አካባቢ ሳይንስ),
 *      Citizenship Education (የስነ-ዜጋና ስነ-ምግባር / የዜግነት ትምህርት), Health & Physical Education - HPE (የጤናና ሰውነት ማጎልመሻ),
 *      Visual & Performing Arts - PVA (የስነ-ጥበብ ትምህርት), and Mathematics (ሒሳብ) are taught in AMHARIC.
 *    - English Language (እንግሊዝኛ) is taught in ENGLISH.
 * 
 * 2. Grades 7 & 8 (Upper Primary):
 *    - Amharic Language (አማርኛ ቋንቋ) is taught in AMHARIC.
 *    - ALL other subjects (General Science, Mathematics, Citizenship, Social Studies, HPE, Visual Arts, IT)
 *      are taught in ENGLISH.
 */

export interface CurriculumLanguageRule {
  language: 'Amharic' | 'English';
  ruleDescriptionAm: string;
  ruleDescriptionEn: string;
  badgeText: string;
  isGrade1to6AmharicSubject: boolean;
  isGrade7or8EnglishSubject: boolean;
}

export function parseGradeNumber(gradeLevel: string): number {
  if (!gradeLevel) return 1;
  const match = gradeLevel.match(/\d+/);
  return match ? parseInt(match[0], 10) : 1;
}

export function getEthiopianCurriculumLanguage(
  subjectIdOrName: string,
  gradeLevel: string
): CurriculumLanguageRule {
  const gradeNum = parseGradeNumber(gradeLevel);
  const s = (subjectIdOrName || '').toLowerCase().trim();

  const isAmharic =
    s.includes('amharic') ||
    s.includes('አማርኛ') ||
    s === 'am';

  const isEnglish =
    s.includes('english') ||
    s.includes('እንግሊዝኛ') ||
    s === 'en';

  // 1. Amharic Subject is always Amharic across all primary grades (1–8)
  if (isAmharic) {
    return {
      language: 'Amharic',
      badgeText: 'አማርኛ (Amharic)',
      ruleDescriptionAm: 'የአማርኛ ቋንቋ ትምህርት በሁሉም ክፍሎች (1-8) በአማርኛ ይዘጋጃል።',
      ruleDescriptionEn: 'Amharic language is instructed in Amharic across all grades (1–8).',
      isGrade1to6AmharicSubject: gradeNum <= 6,
      isGrade7or8EnglishSubject: false,
    };
  }

  // 2. English Subject is always English across all grades (1–8)
  if (isEnglish) {
    return {
      language: 'English',
      badgeText: 'እንግሊዝኛ (English)',
      ruleDescriptionAm: 'የእንግሊዝኛ ቋንቋ ትምህርት በሁሉም ክፍሎች (1-8) በእንግሊዝኛ ይዘጋጃል።',
      ruleDescriptionEn: 'English language subject is instructed in English across all grades (1–8).',
      isGrade1to6AmharicSubject: false,
      isGrade7or8EnglishSubject: false,
    };
  }

  // 3. For all other subjects:
  // Grades 1–6 (Mathematics, General Science, Environmental Science, Citizenship, HPE, Visual Arts, Social Studies):
  // Medium of instruction is AMHARIC.
  if (gradeNum <= 6) {
    return {
      language: 'Amharic',
      badgeText: 'አማርኛ (Amharic Medium: 1-6)',
      ruleDescriptionAm: `ከ1ኛ–6ኛ ክፍል (ክፍል ${gradeNum})፦ ሒሳብ፣ አጠቃላይ ሳይንስ፣ የዜግነት ትምህርት፣ ጤናና ሰውነት (HPE) እና ስነ-ጥበብ በስርአተ-ትምህርቱ መሰረት በአማርኛ ይዘጋጃሉ።`,
      ruleDescriptionEn: `Grades 1–6 (Grade ${gradeNum}): Math, Science, Citizenship, HPE, and Arts are officially instructed in Amharic.`,
      isGrade1to6AmharicSubject: true,
      isGrade7or8EnglishSubject: false,
    };
  }

  // 4. Grades 7 & 8 (above Grade 6):
  // Medium of instruction shifts to ENGLISH for all subjects except Amharic.
  return {
    language: 'English',
    badgeText: 'እንግሊዝኛ (English Medium: 7-8)',
    ruleDescriptionAm: `ከ6ኛ ክፍል በላይ (7ኛ እና 8ኛ ክፍል)፦ ከአማርኛ በስተቀር ሁሉም የትምህርት አይነቶች (ሒሳብ፣ ሳይንስ፣ ዜግነት፣ HPE፣ ስነ-ጥበብ) በእንግሊዝኛ ይዘጋጃሉ።`,
    ruleDescriptionEn: `Grades 7 & 8 (above Grade 6): All subjects without Amharic are instructed in English.`,
    isGrade1to6AmharicSubject: false,
    isGrade7or8EnglishSubject: true,
  };
}
