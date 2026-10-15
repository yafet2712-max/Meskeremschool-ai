import { SubjectOption } from '../types';

export const ETHIOPIAN_PRIMARY_SUBJECTS: SubjectOption[] = [
  { id: 'amharic', nameEn: 'Amharic Language', nameAm: 'አማርኛ ቋንቋ', icon: '🇪🇹', grades: 'Grade 1–8' },
  { id: 'english', nameEn: 'English Language', nameAm: 'እንግሊዝኛ ቋንቋ', icon: '🇬🇧', grades: 'Grade 1–8' },
  { id: 'mathematics', nameEn: 'Mathematics', nameAm: 'ሒሳብ', icon: '📐', grades: 'Grade 1–8' },
  { id: 'environmental_science', nameEn: 'Environmental Science', nameAm: 'አካባቢ ሳይንስ', icon: '🌿', grades: 'Grade 1–4' },
  { id: 'general_science', nameEn: 'General Science', nameAm: 'አጠቃላይ ሳይንስ', icon: '🔬', grades: 'Grade 5–8' },
  { id: 'social_studies', nameEn: 'Social Studies', nameAm: 'ህብረተሰብ ሳይንስ', icon: '🌍', grades: 'Grade 5–8' },
  { id: 'citizenship', nameEn: 'Citizenship Education', nameAm: 'የስነ-ዜጋና ስነ-ምግባር ትምህርት', icon: '⚖️', grades: 'Grade 1–8' },
  { id: 'pva', nameEn: 'Performing & Visual Arts (PVA)', nameAm: 'የስነ-ጥበብ ትምህርት', icon: '🎨', grades: 'Grade 1–8' },
  { id: 'it', nameEn: 'Information Technology (IT)', nameAm: 'መረጃ እና ተግባቦት ቴክኖሎጂ', icon: '💻', grades: 'Grade 5–8' },
  { id: 'pe', nameEn: 'Physical Education (HPE)', nameAm: 'የአካል ማጎልመሻ ትምህርት', icon: '🏃', grades: 'Grade 1–8' },
];

export const PRIMARY_GRADES = [
  { id: 'Grade 1', nameEn: 'Grade 1 (Lower Primary)', nameAm: '፩ኛ ክፍል' },
  { id: 'Grade 2', nameEn: 'Grade 2 (Lower Primary)', nameAm: '፪ኛ ክፍል' },
  { id: 'Grade 3', nameEn: 'Grade 3 (Lower Primary)', nameAm: '፫ኛ ክፍል' },
  { id: 'Grade 4', nameEn: 'Grade 4 (Lower Primary)', nameAm: '፬ኛ ክፍል' },
  { id: 'Grade 5', nameEn: 'Grade 5 (Middle Primary)', nameAm: '፭ኛ ክፍል' },
  { id: 'Grade 6', nameEn: 'Grade 6 (Middle Primary)', nameAm: '፮ኛ ክፍል' },
  { id: 'Grade 7', nameEn: 'Grade 7 (Upper Primary)', nameAm: '፯ኛ ክፍል' },
  { id: 'Grade 8', nameEn: 'Grade 8 (Upper Primary)', nameAm: '፰ኛ ክፍል' },
];

export const QUICK_SAMPLE_TOPICS_BY_SUBJECT: Record<string, { topic: string; subject: string; grade: string }[]> = {
  amharic: [
    { topic: 'የአማርኛ ስሞች እና ቅጽሎች (Nouns & Adjectives)', subject: 'amharic', grade: 'Grade 3' },
    { topic: 'የግሥ እርባታ - ኃላፊ እና አሁን ጊዜ (Past & Present Tense)', subject: 'amharic', grade: 'Grade 5' },
    { topic: 'የፊደላት ድምፅ እና የሆሄያት ቅርጽ (Fidel Shapes & Sounds)', subject: 'amharic', grade: 'Grade 1' },
    { topic: 'ምሳሌያዊ አነጋገሮች እና ፍቻቸው (Ethiopian Proverbs)', subject: 'amharic', grade: 'Grade 6' },
  ],
  english: [
    { topic: 'Simple Present Tense & Daily Routines', subject: 'english', grade: 'Grade 4' },
    { topic: 'Regular and Irregular Past Tense Verbs', subject: 'english', grade: 'Grade 5' },
    { topic: 'Phonics: Short and Long Vowels (a, e, i, o, u)', subject: 'english', grade: 'Grade 2' },
    { topic: 'Prepositions of Place (in, on, under, behind, next to)', subject: 'english', grade: 'Grade 3' },
    { topic: 'Describing People and Feelings (Adjectives)', subject: 'english', grade: 'Grade 6' },
  ],
  mathematics: [
    { topic: 'Addition and Subtraction with Regrouping (መደመርና መቀነስ)', subject: 'mathematics', grade: 'Grade 2' },
    { topic: 'Multiplication Tables and Division (ማባዛትና ማካፈል)', subject: 'mathematics', grade: 'Grade 4' },
    { topic: 'Fractions: Equivalent Fractions and Addition (ክፍልፋዮች)', subject: 'mathematics', grade: 'Grade 5' },
    { topic: 'Perimeter and Area of Rectangles and Squares (ስፋትና ዙሪያ)', subject: 'mathematics', grade: 'Grade 6' },
    { topic: 'Decimals and Percentages (አስርዮሾች እና መቶኛ)', subject: 'mathematics', grade: 'Grade 7' },
  ],
  environmental_science: [
    { topic: 'Parts of Plants and Their Functions (የእጽዋት ክፍሎችና ጥቅማቸው)', subject: 'environmental_science', grade: 'Grade 2' },
    { topic: 'Sources and Uses of Clean Water (የውሃ ምንጮች እና አጠቃቀም)', subject: 'environmental_science', grade: 'Grade 3' },
    { topic: 'Personal Hygiene and Healthy Food (የግል ንጽህና እና የተመጣጠነ ምግብ)', subject: 'environmental_science', grade: 'Grade 1' },
    { topic: 'Living and Non-Living Things in Our Kebele (ህይወት ያላቸው እና የሌላቸው ነገሮች)', subject: 'environmental_science', grade: 'Grade 4' },
  ],
  general_science: [
    { topic: 'Photosynthesis and Plant Nutrition (ብርሃን አስተፃምሮ)', subject: 'general_science', grade: 'Grade 6' },
    { topic: 'States of Matter: Solids, Liquids, and Gases (የቁስ አካል ሁኔታዎች)', subject: 'general_science', grade: 'Grade 5' },
    { topic: 'Human Digestive System (የሰው ልጅ የምግብ መፈጨት ሥርዓት)', subject: 'general_science', grade: 'Grade 7' },
    { topic: 'Energy: Renewable and Non-renewable Sources (የኃይል ምንጮች)', subject: 'general_science', grade: 'Grade 8' },
  ],
  social_studies: [
    { topic: 'Major Rivers and Lakes of Ethiopia (የኢትዮጵያ ወንዞችና ሐይቆች)', subject: 'social_studies', grade: 'Grade 5' },
    { topic: 'Historical Heritage Sites of Ethiopia (የኢትዮጵያ ታሪካዊ ቅርሶች)', subject: 'social_studies', grade: 'Grade 6' },
    { topic: 'Reading Maps: Compass Directions and Legend (የካርታ ንባብ)', subject: 'social_studies', grade: 'Grade 7' },
    { topic: 'Traditional Governance Systems in Ethiopia (የባህላዊ አስተዳደር ሥርዓቶች)', subject: 'social_studies', grade: 'Grade 8' },
  ],
  citizenship: [
    { topic: 'የህፃናት መብቶችና ግዴታዎች (Rights and Responsibilities of Children)', subject: 'citizenship', grade: 'Grade 4' },
    { topic: 'እውነተኝነት እና ታማኝነት (Truthfulness and Honesty)', subject: 'citizenship', grade: 'Grade 3' },
    { topic: 'ዲሞክራሲያዊ ውሳኔ አሰጣጥ በትምህርት ቤት (Democratic Decision-Making)', subject: 'citizenship', grade: 'Grade 6' },
    { topic: 'Constitutional Rights and Rule of Law in Ethiopia', subject: 'citizenship', grade: 'Grade 7' },
    { topic: 'National Unity, Patriotism and Civic Participation', subject: 'citizenship', grade: 'Grade 8' },
  ],
  pe: [
    { topic: 'መሰረታዊ የሰውነት እንቅስቃሴዎች እና ቅንጅት (Basic Motor Skills)', subject: 'pe', grade: 'Grade 2' },
    { topic: 'የግል ንጽህና እና ጤናማ የአካል ብቃት ልምምድ (Physical Fitness)', subject: 'pe', grade: 'Grade 4' },
    { topic: 'የእግር ኳስ መሰረታዊ ህጎች እና ኳስ ማቀበል (Football Passing Drills)', subject: 'pe', grade: 'Grade 6' },
    { topic: 'Track and Field: Sprint Mechanics and Relay Exchanges', subject: 'pe', grade: 'Grade 7' },
    { topic: 'First Aid in Sports, Nutrition and Cardiovascular Health', subject: 'pe', grade: 'Grade 8' },
  ],
  pva: [
    { topic: 'የቀለማት ቅልቅል እና የመስመሮች አጠቃቀም (Colors & Lines)', subject: 'pva', grade: 'Grade 2' },
    { topic: 'የባህላዊ የሙዚቃ መሳሪያዎች እና ጭፈራዎች (Traditional Ethiopian Music)', subject: 'pva', grade: 'Grade 4' },
    { topic: 'የሸክላ ስራ እና ቅርጻ ቅርጽ (Pottery & Sculpture)', subject: 'pva', grade: 'Grade 6' },
    { topic: 'Principles of Design: Balance, Contrast and Perspective', subject: 'pva', grade: 'Grade 7' },
    { topic: 'Ethiopian Traditional and Modern Theatre Arts', subject: 'pva', grade: 'Grade 8' },
  ],
};

export const WEEKLY_UNIT_PRESETS = [
  {
    id: 'science-plants',
    subject: 'general_science',
    grade: 'Grade 5',
    unitTopic: 'ምዕራፍ ፫ - የእጽዋት ክፍሎችና ተግባራቸው (Plant Parts and Functions)',
    language: 'Amharic',
    days: [
      { dayNumber: 1, dayName: 'Day 1 (ሰኞ / Monday)', lessonTopic: 'የእጽዋት ክፍሎች መግቢያና የስር ዋና ተግባር (Introduction & Root Function)' },
      { dayNumber: 2, dayName: 'Day 2 (ማክሰኞ / Tuesday)', lessonTopic: 'የግንድ ዓይነቶችና ውሃ እና ንጥረ-ነገር የማዘዋወር ሚና (Stems & Transportation)' },
      { dayNumber: 3, dayName: 'Day 3 (ረቡዕ / Wednesday)', lessonTopic: 'የቅጠል አወቃቀርና የብርሃን አስተፃምሮ ሂደት (Photosynthesis Process)' },
      { dayNumber: 4, dayName: 'Day 4 (ሐሙስ / Thursday)', lessonTopic: 'የአበባ፣ ፍሬና ዘር ተግባር በመራባት ሂደት ውስጥ (Flowers, Fruits & Seeds)' },
      { dayNumber: 5, dayName: 'Day 5 (አርብ / Friday)', lessonTopic: 'ሳምንታዊ ክለሳ፣ የቡድን ተግባር እና ሳምንታዊ ምዘና (Weekly Review & Assessment)' },
    ],
  },
  {
    id: 'english-family-community',
    subject: 'english',
    grade: 'Grade 3',
    unitTopic: 'Unit 2 - Our Community and Helping Hands',
    language: 'English',
    days: [
      { dayNumber: 1, dayName: 'Day 1 (Monday)', lessonTopic: 'Vocabulary: Community Helpers & Workplaces (Doctor, Farmer, Teacher)' },
      { dayNumber: 2, dayName: 'Day 2 (Tuesday)', lessonTopic: 'Grammar: Present Simple with "He/She works at..." sentence patterns' },
      { dayNumber: 3, dayName: 'Day 3 (Wednesday)', lessonTopic: 'Reading & Phonics: Short Story "A Day with Firefighter Aster"' },
      { dayNumber: 4, dayName: 'Day 4 (Thursday)', lessonTopic: 'Speaking & Role Play: Interviewing a Community Worker in Pairs' },
      { dayNumber: 5, dayName: 'Day 5 (Friday)', lessonTopic: 'Consolidation, Sentence Writing & Weekly Check-up Quiz' },
    ],
  },
  {
    id: 'math-fractions',
    subject: 'mathematics',
    grade: 'Grade 4',
    unitTopic: 'ምዕራፍ ፬ - ክፍልፋዮችና አሰራራቸው (Fractions and Operations)',
    language: 'Amharic',
    days: [
      { dayNumber: 1, dayName: 'Day 1 (ሰኞ / Monday)', lessonTopic: 'ክፍልፋይ ምን ማለት ነው? ተካፋይ (Numerator) እና አካፋይ (Denominator) መለየት' },
      { dayNumber: 2, dayName: 'Day 2 (ማክሰኞ / Tuesday)', lessonTopic: 'እኩል ክፍልፋዮች (Equivalent Fractions) በምስልና ቁጥር ማሳየት' },
      { dayNumber: 3, dayName: 'Day 3 (ረቡዕ / Wednesday)', lessonTopic: 'ተመሳሳይ አካፋይ ያላቸውን ክፍልፋዮች መደመር (Adding Like Fractions)' },
      { dayNumber: 4, dayName: 'Day 4 (ሐሙስ / Thursday)', lessonTopic: 'ተመሳሳይ አካፋይ ያላቸውን ክፍልፋዮች መቀነስና የቃላት ሒሳብ ፕሮብሌሞች' },
      { dayNumber: 5, dayName: 'Day 5 (አርብ / Friday)', lessonTopic: 'የሳምንቱ ማጠቃለያ፣ የተግባር ልምምድ እና ሳምንታዊ የሒሳብ ምዘና' },
    ],
  },
  {
    id: 'env-science-water',
    subject: 'environmental_science',
    grade: 'Grade 2',
    unitTopic: 'ምዕራፍ ፪ - ውሃና የንጽህና አጠባበቅ (Water and Sanitation)',
    language: 'Amharic',
    days: [
      { dayNumber: 1, dayName: 'Day 1 (ሰኞ / Monday)', lessonTopic: 'የንጹህ ውሃ ምንጮች በአካባቢያችን (ጉድጓድ፣ ምንጭ፣ ቧንቧ)' },
      { dayNumber: 2, dayName: 'Day 2 (ማክሰኞ / Tuesday)', lessonTopic: 'ውሃ ለሰው፣ ለእንስሳትና ለእጽዋት ያለው የዕለት ተዕለት ጥቅም' },
      { dayNumber: 3, dayName: 'Day 3 (ረቡዕ / Wednesday)', lessonTopic: 'የውሃ ብክለት ምክንያቶች እና ውሃን የማፍላትና የማጣራት ዘዴ' },
      { dayNumber: 4, dayName: 'Day 4 (ሐሙስ / Thursday)', lessonTopic: 'እጅን በውሃና በሳሙና የመታጠብ አስፈላጊነትና ትክክለኛ ደረጃዎች' },
      { dayNumber: 5, dayName: 'Day 5 (አርብ / Friday)', lessonTopic: 'የሳምንቱ ትምህርት ክለሳ፣ የተግባር ምስል መለየትና ሳምንታዊ ምዘና' },
    ],
  },
  {
    id: 'amharic-grammar',
    subject: 'amharic',
    grade: 'Grade 3',
    unitTopic: 'ምዕራፍ ፩ - የአማርኛ ስሞችና ቅጽሎች (Nouns and Adjectives)',
    language: 'Amharic',
    days: [
      { dayNumber: 1, dayName: 'Day 1 (ሰኞ / Monday)', lessonTopic: 'ስም ምን ማለት ነው? የሰው፣ የእንስሳትና የነገሮች ስሞችን መለየት' },
      { dayNumber: 2, dayName: 'Day 2 (ማክሰኞ / Tuesday)', lessonTopic: 'ነጠላ እና ብዙ ቁጥር ስሞች (ለምሳሌ፡ ተማሪ - ተማሪዎች)' },
      { dayNumber: 3, dayName: 'Day 3 (ረቡዕ / Wednesday)', lessonTopic: 'ቅጽል ምን ማለት ነው? ስምን የሚገልጹ ቃላትን መለየት (ትልቅ፣ ቆንጆ፣ ፈጣን)' },
      { dayNumber: 4, dayName: 'Day 4 (ሐሙስ / Thursday)', lessonTopic: 'ስምና ቅጽልን በማጣመር ቀላል ዓረፍተ-ነገሮችን መመስረት' },
      { dayNumber: 5, dayName: 'Day 5 (አርብ / Friday)', lessonTopic: 'የሳምንቱ ማጠቃለያ፣ የአረፍተ-ነገር ግንባታ ውድድር እና ሳምንታዊ የጽሑፍ ፈተና' },
    ],
  },
];

