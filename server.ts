import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// Shared Gemini Client instance
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_PROMPT_EDUCATOR = `You are the master AI pedagogical assistant for Ethiopian primary school teachers, educators, and students ("የኢትዮጵያ የመጀመሪያ ደረጃ መምህራን ረዳት").
You have native-level pedagogical expertise in the Ethiopian Ministry of Education (MoE) primary curriculum (Grades 1–8) across all subjects:
- Amharic Language (አማርኛ ቋንቋ) & Ge'ez Fidel script
- English Language (listening, speaking, reading, writing, phonics, and grammar)
- Mathematics (ሒሳብ - arithmetic, fractions, geometry, measurement, algebra)
- Environmental Science (አካባቢ ሳይንስ - Grades 1-4)
- General Science (አጠቃላይ ሳይንስ - Grades 5-8: biology, chemistry, physics fundamentals)
- Social Studies (ህብረተሰብ ሳይንስ - Ethiopian history, geography, rivers, culture, heritage)
- Citizenship Education (የስነ-ዜጋና ስነ-ምግባር ትምህርት - ethics, human rights, democracy, community)
- Performing & Visual Arts (PVA - የስነ-ጥበብ ትምህርት)
- Information Technology (IT - መረጃና ተግባቦት ቴክኖሎጂ)
- Physical & Health Education (HPE - የአካል ማጎልመሻ ትምህርት)

You always structure lesson plans and assessments according to the official Ethiopian Ministry of Education primary guidelines:
- Clear Behavioral Objectives ("ተማሪዎች ይህንን ትምህርት ካጠናቀቁ በኋላ..." / "By the end of this lesson, students will be able to...")
- 5 Standard Teaching Phases: Introduction, Presentation, Learning Activities, Stabilization/Summary, Assessment/Homework.
- Authentic school and workplace headers with teacher name, grade, period, and date.
- Clear, age-appropriate, encouraging language with answer keys for teachers.`;

// Resilient content generator with model fallback and retry
async function generateGeminiContent(options: {
  contents: any;
  temperature?: number;
  systemInstruction?: string;
}): Promise<string> {
  const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of candidateModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: options.contents,
          config: {
            systemInstruction: options.systemInstruction || SYSTEM_PROMPT_EDUCATOR,
            temperature: options.temperature ?? 0.7,
          },
        });
        if (response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} attempt ${attempt} failed:`, err?.message || err);
        await new Promise((r) => setTimeout(r, 400));
      }
    }
  }

  throw lastError || new Error('Failed to generate content with available models');
}

// Helper function to resolve curriculum language according to Ethiopian Ministry of Education policy:
// - Grades 1–6: Amharic, General Science, Environmental Science, Citizenship, HPE, Visual Arts, and Mathematics are in Amharic. (English subject in English)
// - Grades 7 & 8 (above Grade 6): All subjects without Amharic are in English.
function resolveCurriculumLanguage(subject?: string, gradeLevel?: string, requestedLanguage?: string): 'Amharic' | 'English' {
  const req = (requestedLanguage || '').toLowerCase().trim();
  if (req === 'amharic' || req === 'አማርኛ') return 'Amharic';
  if (req === 'english' || req === 'እንግሊዝኛ') return 'English';

  const s = (subject || '').toLowerCase().trim();
  const gradeMatch = (gradeLevel || '').match(/\d+/);
  const gradeNum = gradeMatch ? parseInt(gradeMatch[0], 10) : 1;

  const isAmharic = s.includes('amharic') || s.includes('አማርኛ');
  const isEnglish = s.includes('english') || s.includes('እንግሊዝኛ');

  if (isAmharic) return 'Amharic';
  if (isEnglish) return 'English';

  // Grades 1–6: Amharic medium for Math, Science, Citizenship, HPE, Visual Arts
  if (gradeNum <= 6) {
    return 'Amharic';
  }
  // Grades 7 & 8: English medium for all subjects except Amharic
  return 'English';
}

// 1. Comprehensive Lesson Plan Generator (Following the Official Ethiopian Primary Daily Lesson Plan Format)
app.post('/api/generate-lesson-plan', async (req: Request, res: Response) => {
  try {
    const {
      topic,
      subject,
      gradeLevel,
      duration,
      languageMode,
      specificFocus,
      customNotes,
      schoolProfile,
      customDate,
    } = req.body;

    const schoolName = schoolProfile?.schoolName || schoolProfile?.amharicSchoolName || '';
    const teacherName = schoolProfile?.teacherName || '';

    const effectiveLanguage = resolveCurriculumLanguage(subject, gradeLevel, languageMode);
    const isAmharic = effectiveLanguage === 'Amharic';

    const prompt = `You must generate a Daily Lesson Plan for an Ethiopian Primary School teacher following the EXACT official 9-column format from the Ethiopian Ministry of Education.

CRITICAL ETHIOPIAN CURRICULUM LANGUAGE POLICY:
Subject: "${subject || 'General'}"
Grade Level: "${gradeLevel || 'Grade 1'}"
Determined Medium of Instruction: "${effectiveLanguage.toUpperCase()}"
${isAmharic
  ? `[AMHARIC MEDIUM INSTRUCTION - GRADES 1-6 (Or Amharic Subject)]:
All pedagogical content MUST BE GENERATED IN NATURAL, FLUENT AMHARIC SCRIPT (በግዕዝ ፊደላትና በአማርኛ ቋንቋ).
This includes:
- unitAndTopic: in Amharic (e.g., "ምዕራፍ ፩ - ...")
- lessonTopic: in Amharic (e.g., "የትምህርቱ ርዕስ")
- rationale: in Amharic (e.g., "ትምህርቱ ተማሪዎች ... እንዲገነዘቡና እንዲተገብሩ ይረዳል...")
- prerequisiteKnowledge: in Amharic (e.g., "ተማሪዎች ቀደም ሲል ስለ ... ተምረዋል...")
- competencies: in Amharic (e.g., "ተማሪዎች ይህንን ትምህርት ካጠናቀቁ በኋላ: 1. ... 2. ... ይችላሉ።")
- stages (Starter, Main Activities, Concluding Activities):
  * learningContents: in Amharic
  * teacherActivities: in Amharic (e.g., "መምህሩ ሰላምታ ይሰጣል፣ የቀደመውን ትምህርት ይከልሳል...")
  * studentActivities: in Amharic (e.g., "ተማሪዎች ሰላምታ ይመልሳሉ፣ የመግቢያ ጥያቄዎችን ይመልሳሉ...")
  * assessmentTechniques: in Amharic (e.g., "የቃል ጥያቄ፣ የክፍል ስራ፣ ምልከታ")
  * teachingAids: in Amharic (e.g., "የተማሪው መማሪያ መጽሐፍ፣ ፍላሽ ካርዶች፣ ስዕሎች")
- specialNeedsSupport (slowLearners, mediumLearners, fastLearners): in Amharic.`
  : `[ENGLISH MEDIUM INSTRUCTION - GRADES 7 & 8 (Or English Subject)]:
All pedagogical content MUST BE GENERATED IN CLEAR, PROFESSIONAL PEDAGOGICAL ENGLISH.
All stages, teacher activities, student activities, rationale, prerequisite knowledge, and competencies must be in English.`
}

Details:
- Name of School: "${schoolName}"
- Name of teacher: "${teacherName}"
- Subject: "${subject || (isAmharic ? 'አማርኛ / ሒሳብ / ሳይንስ' : 'English / Science')}"
- Unit and topic: "${topic || 'Unit One'}"
- Lesson topic: "${specificFocus || topic || 'Key concept and practice'}"
- Grade and Section: "${gradeLevel || 'Grade 1'}"
- Date: "${customDate || (isAmharic ? 'መስከረም 06 ቀን 2017 ዓ.ም' : 'Meskerem 06, 2017 E.C (Wednesday)')}"
- Duration: "${duration || '35-40 min'}"
- Language Mode: "${effectiveLanguage}"
- Additional Notes: "${customNotes || ''}"

Return a valid JSON object strictly matching this schema (do NOT include backticks or markdown if possible, just the raw JSON object):
${isAmharic ? `{
  "schoolName": "${schoolName}",
  "teacherName": "${teacherName}",
  "subject": "${subject || 'ሒሳብ / ሳይንስ'}",
  "unitAndTopic": "ምዕራፍ ... - ...",
  "gradeAndSection": "${gradeLevel || '1ኛ ክፍል'}",
  "lessonTopic": "${topic || 'የትምህርቱ ርዕስ'}",
  "date": "${customDate || 'መስከረም 06 ቀን 2017 ዓ.ም'}",
  "rationale": "ትምህርቱ ተማሪዎች ... እንዲረዱ ያግዛል።",
  "prerequisiteKnowledge": "ተማሪዎች ቀደም ሲል ... ተምረዋል።",
  "competencies": "ተማሪዎች ይህንን ትምህርት ካጠናቀቁ በኋላ: 1. ... 2. ... ይችላሉ።",
  "stages": [
    {
      "stage": "Starter (ማነሳሳትና መከለስ)",
      "timeAllotment": "5 ደቂቃ",
      "learningContents": "...",
      "page": "1-5",
      "teacherActivities": "መምህሩ ሰላምታ ይሰጣል፣ የቀደመውን ትምህርት ይከልሳል፣ የዛሬውን ርዕስ ያስተዋውቃል...",
      "studentActivities": "ሰላምታ ይመልሳሉ፣ የማነሳሻ ጥያቄዎችን ይመልሳሉ...",
      "assessmentTechniques": "የቃል ጥያቄ",
      "teachingAids": "የተማሪው መጽሐፍ፣ ፍላሽ ካርድ",
      "remarks": "-"
    },
    {
      "stage": "Main Activities (ዋና ተግባራት)",
      "timeAllotment": "25 ደቂቃ",
      "learningContents": "...",
      "page": "1-5",
      "teacherActivities": "ጽንሰ-ሀሳቡን ያብራራል፣ ምሳሌዎችን ይሰራል፣ የተማሪዎችን የክፍል ስራ ይከታተላል...",
      "studentActivities": "ማብራሪያውን ያዳምጣሉ፣ በደብተራቸው ይጽፋሉ፣ የክፍል ስራ ይሰራሉ...",
      "assessmentTechniques": "የክፍል ስራ፣ ምልከታ፣ የቃል ጥያቄ",
      "teachingAids": "የተማሪው መጽሐፍ፣ ስዕሎች፣ ሰሌዳ",
      "remarks": "-"
    },
    {
      "stage": "Concluding Activities (ማጠቃለያ ተግባራት)",
      "timeAllotment": "5 ደቂቃ",
      "learningContents": "ማጠቃለያ እና የቤት ስራ",
      "page": "-",
      "teacherActivities": "ዋና ዋና ነጥቦችን ያጠቃልላል፣ የማጠቃለያ ጥያቄዎችን ይጠይቃል እና የቤት ስራ ይሰጣል...",
      "studentActivities": "የማጠቃለያ ጥያቄዎችን ይመልሳሉ፣ የቤት ስራ በደብተራቸው ይመዘግባሉ...",
      "assessmentTechniques": "የቃል ጥያቄ",
      "teachingAids": "-",
      "remarks": "-"
    }
  ],
  "specialNeedsSupport": {
    "slowLearners": "ተጨማሪ ማብራሪያ፣ ቀላል ምሳሌዎችና የአቻ ለአቻ ድጋፍ መስጠት።",
    "mediumLearners": "በመደበኛው የማስተማሪያ እቅድና ፍጥነት ማስተማር።",
    "fastLearners": "ተጨማሪ ፈታኝ ጥያቄዎችን እና የማስፋፊያ ተግባራትን መስጠት።"
  },
  "deptHeadName": "",
  "vicePrincipalName": "",
  "postLessonAssessment": ""
}` : `{
  "schoolName": "${schoolName}",
  "teacherName": "${teacherName}",
  "subject": "${subject || 'English'}",
  "unitAndTopic": "Unit ... - ...",
  "gradeAndSection": "${gradeLevel || 'Grade 7'}",
  "lessonTopic": "${topic || 'Specific topic'}",
  "date": "${customDate || 'Meskerem 06, 2017 E.C (Wednesday)'}",
  "rationale": "The lesson helps learners understand...",
  "prerequisiteKnowledge": "Students have previously learned...",
  "competencies": "At the end of the lesson, the students will be able to: 1. ... 2. ...",
  "stages": [
    {
      "stage": "Starter (Motivation & Introduction)",
      "timeAllotment": "5 min",
      "learningContents": "Warm-up related to...",
      "page": "1-5",
      "teacherActivities": "Greets students, reviews previous lesson, and introduces today's topic...",
      "studentActivities": "Greet the teacher, answer warm-up questions, and listen to the introduction.",
      "assessmentTechniques": "Oral question",
      "teachingAids": "Flashcards, Textbook",
      "remarks": "-"
    },
    {
      "stage": "Main Activities",
      "timeAllotment": "25 min",
      "learningContents": "Practice and drill...",
      "page": "1-5",
      "teacherActivities": "Guides students through concept presentation, exercises, and interactive group work.",
      "studentActivities": "Participate actively, take notes, solve exercises in exercise books.",
      "assessmentTechniques": "Class work, oral questions",
      "teachingAids": "Textbook, Blackboard, Pictures",
      "remarks": "-"
    },
    {
      "stage": "Concluding Activities",
      "timeAllotment": "5 min",
      "learningContents": "Summary and homework",
      "page": "-",
      "teacherActivities": "Summarizes key points, asks review questions, and assigns follow-up homework.",
      "studentActivities": "Answer review questions and record homework assignment.",
      "assessmentTechniques": "Oral question",
      "teachingAids": "-",
      "remarks": "-"
    }
  ],
  "specialNeedsSupport": {
    "slowLearners": "Provide extra practice, repetition, simplified tasks, and peer tutoring.",
    "mediumLearners": "Standard pace activities as planned above.",
    "fastLearners": "Provide extension tasks, enrichment problems, and leadership roles."
  },
  "deptHeadName": "",
  "vicePrincipalName": "",
  "postLessonAssessment": ""
}`}`;

    const rawResponse = await generateGeminiContent({
      contents: prompt,
      temperature: 0.4,
    });

    let planData: any = null;
    try {
      const cleanJson = rawResponse
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      planData = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.warn('Failed to parse JSON directly from Gemini, using structured fallback regex');
      // Create fallback structure populated according to language
      if (isAmharic) {
        planData = {
          schoolName,
          teacherName,
          subject: subject || 'ሒሳብ / ሳይንስ',
          unitAndTopic: topic || 'ምዕራፍ አንድ',
          gradeAndSection: gradeLevel || 'ክፍል 1',
          lessonTopic: topic || 'የትምህርቱ ዋና ርዕስ',
          date: customDate || 'መስከረም 06 ቀን 2017 ዓ.ም',
          rationale: `ትምህርቱ ተማሪዎች ስለ ${topic} በቂ ግንዛቤ እንዲያገኙ ይረዳል።`,
          prerequisiteKnowledge: 'ተማሪዎች ቀደም ሲል የተማሩትን መሰረታዊ ጽንሰ-ሀሳብ ያውቃሉ።',
          competencies: `ተማሪዎች ይህንን ትምህርት ካጠናቀቁ በኋላ ስለ ${topic} በግልጽ ማስረዳትና መተግበር ይችላሉ።`,
          stages: [
            {
              stage: 'Starter (ማነሳሳትና መከለስ)',
              timeAllotment: '5 ደቂቃ',
              learningContents: `ከ${topic} ጋር የተያያዘ የማነሳሻ ጥያቄ`,
              page: '1-5',
              teacherActivities: 'ሰላምታ ይሰጣል፣ ያለፈውን ትምህርት ይከልሳል፣ የዛሬውን ርዕስ ያስተዋውቃል።',
              studentActivities: 'ሰላምታ ይመልሳሉ፣ የመግቢያ ጥያቄዎችን ይመልሳሉ።',
              assessmentTechniques: 'የቃል ጥያቄ',
              teachingAids: 'የተማሪው መጽሐፍ፣ ፍላሽ ካርድ',
              remarks: '-',
            },
            {
              stage: 'Main Activities (ዋና ተግባራት)',
              timeAllotment: '25 ደቂቃ',
              learningContents: `ስለ '${topic}' ዝርዝር ማብራሪያና ልምምድ`,
              page: '1-5',
              teacherActivities: `ስለ '${topic}' በመማሪያ መጽሐፍና በምሳሌዎች በመታገዝ ያስረዳል፣ የክፍል ስራ ይሰጣል።`,
              studentActivities: 'ያዳምጣሉ፣ በደብተራቸው ይጽፋሉ፣ የክፍል ስራ ይሰራሉ።',
              assessmentTechniques: 'የክፍል ስራ፣ የቃል ጥያቄዎች',
              teachingAids: 'የመማሪያ መጽሐፍ፣ ስዕሎች፣ ሰሌዳ',
              remarks: '-',
            },
            {
              stage: 'Concluding Activities (ማጠቃለያ ተግባራት)',
              timeAllotment: '5 ደቂቃ',
              learningContents: 'ማጠቃለያ እና የቤት ስራ',
              page: '-',
              teacherActivities: 'ዋና ዋና ነጥቦችን ያጠቃልላል፣ የቤት ስራ ይሰጣል።',
              studentActivities: 'የማጠቃለያ ጥያቄዎችን ይመልሳሉ፣ የቤት ስራ ይመዘግባሉ።',
              assessmentTechniques: 'የቃል ጥያቄ',
              teachingAids: '-',
              remarks: '-',
            },
          ],
          specialNeedsSupport: {
            slowLearners: 'ተጨማሪ ጊዜና የአቻ ለአቻ ድጋፍ መስጠት።',
            mediumLearners: 'በመደበኛው እቅድ መሰረት ማስተማር።',
            fastLearners: 'ተጨማሪ ፈታኝ መልመጃዎችን መስጠት።',
          },
          deptHeadName: '',
          vicePrincipalName: '',
          postLessonAssessment: '',
        };
      } else {
        planData = {
          schoolName,
          teacherName,
          subject: subject || 'English',
          unitAndTopic: topic || 'Unit One',
          gradeAndSection: gradeLevel || 'Grade 7',
          lessonTopic: topic || 'Core Lesson Topic',
          date: customDate || 'Meskerem 06, 2017 E.C (Wednesday)',
          rationale: `The lesson helps learners understand ${topic}.`,
          prerequisiteKnowledge: 'Previous grade foundational concepts.',
          competencies: `At the end of the lesson, the students will be able to apply and master ${topic}.`,
          stages: [
            {
              stage: 'Starter (Motivation & Introduction)',
              timeAllotment: '5 min',
              learningContents: `Warm-up related to ${topic}`,
              page: '1-5',
              teacherActivities: 'Greets students, reviews previous lesson, and introduces today\'s topic.',
              studentActivities: 'Greet the teacher, answer warm-up questions, and listen to the introduction.',
              assessmentTechniques: 'Oral question',
              teachingAids: 'Flashcards',
              remarks: '-',
            },
            {
              stage: 'Main Activities',
              timeAllotment: '25 min',
              learningContents: `Practice and drill '${topic}'`,
              page: '1-5',
              teacherActivities: `Guides students through '${topic}' using textbook, illustrations, and realia.`,
              studentActivities: 'Participate in learning activities, class work exercises, and teacher drills.',
              assessmentTechniques: 'Class work, oral questions',
              teachingAids: 'Text book, Pictures, Posters',
              remarks: '-',
            },
            {
              stage: 'Concluding Activities',
              timeAllotment: '5 min',
              learningContents: 'Summary and homework',
              page: '-',
              teacherActivities: 'Summarizes key points, asks review questions, and assigns homework.',
              studentActivities: 'Answer review questions and copy homework in their exercise books.',
              assessmentTechniques: 'Oral question',
              teachingAids: '-',
              remarks: '-',
            },
          ],
          specialNeedsSupport: {
            slowLearners: 'Provide extra practice, repetition, and simplified tasks with peer support.',
            mediumLearners: 'Standard pace activities as planned above.',
            fastLearners: 'Provide enrichment tasks such as extra vocabulary or short extension exercises.',
          },
          deptHeadName: '',
          vicePrincipalName: '',
          postLessonAssessment: '',
        };
      }
    }

    res.json({
      plan: planData,
      content: rawResponse,
    });
  } catch (error: any) {
    console.error('Error in /api/generate-lesson-plan:', error);
    res.status(500).json({ error: error.message || 'Failed to generate lesson plan' });
  }
});

// 1B. Suggest 5 Progressive Lesson Topics for a Single Unit
app.post('/api/suggest-weekly-subtopics', async (req: Request, res: Response) => {
  try {
    const { unitTopic, subject, gradeLevel, languageMode } = req.body;
    const effectiveLanguage = resolveCurriculumLanguage(subject, gradeLevel, languageMode);
    const isAmharic = effectiveLanguage === 'Amharic';

    const prompt = `You are an expert Ethiopian Primary School curriculum planner.
Given the following Unit Topic, break it down into exactly 5 logical, sequential, progressive daily lesson topics for Monday through Friday:
- Unit Topic: "${unitTopic || 'General Unit'}"
- Subject: "${subject || 'General'}"
- Grade Level: "${gradeLevel || 'Grade 1'}"
- Language Medium: "${effectiveLanguage}"

Rules:
${isAmharic 
  ? '- All 5 lesson topics MUST be written in natural, clear AMHARIC (በአማርኛ ቋንቋ).' 
  : '- All 5 lesson topics MUST be written in clear ENGLISH.'}
- Day 1: Introduction, basic concepts & motivation
- Day 2: Core characteristics, rules or key procedures
- Day 3: Practical applications, deep-dive or examples
- Day 4: Group investigation, experiments or guided problem-solving
- Day 5: Review, unit synthesis, and weekly assessment/quiz

Return ONLY a raw JSON array of 5 objects strictly matching this format (no markdown code fences):
[
  { "dayNumber": 1, "dayName": "${isAmharic ? 'Day 1 (ሰኞ / Monday)' : 'Day 1 (Monday)'}", "lessonTopic": "..." },
  { "dayNumber": 2, "dayName": "${isAmharic ? 'Day 2 (ማክሰኞ / Tuesday)' : 'Day 2 (Tuesday)'}", "lessonTopic": "..." },
  { "dayNumber": 3, "dayName": "${isAmharic ? 'Day 3 (ረቡዕ / Wednesday)' : 'Day 3 (Wednesday)'}", "lessonTopic": "..." },
  { "dayNumber": 4, "dayName": "${isAmharic ? 'Day 4 (ሐሙስ / Thursday)' : 'Day 4 (Thursday)'}", "lessonTopic": "..." },
  { "dayNumber": 5, "dayName": "${isAmharic ? 'Day 5 (አርብ / Friday)' : 'Day 5 (Friday)'}", "lessonTopic": "..." }
]`;

    const raw = await generateGeminiContent({ contents: prompt, temperature: 0.3 });
    const cleanJson = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    let suggestions = [];
    try {
      suggestions = JSON.parse(cleanJson);
    } catch {
      // Fallback
      suggestions = [
        { dayNumber: 1, dayName: isAmharic ? 'Day 1 (ሰኞ / Monday)' : 'Day 1 (Monday)', lessonTopic: isAmharic ? `${unitTopic} - መግቢያና መሰረታዊ ፅንሰ-ሀሳብ` : `${unitTopic} - Introduction & Concepts` },
        { dayNumber: 2, dayName: isAmharic ? 'Day 2 (ማክሰኞ / Tuesday)' : 'Day 2 (Tuesday)', lessonTopic: isAmharic ? `${unitTopic} - ዋና ዋና ክፍሎችና ባህሪያት` : `${unitTopic} - Core Features & Principles` },
        { dayNumber: 3, dayName: isAmharic ? 'Day 3 (ረቡዕ / Wednesday)' : 'Day 3 (Wednesday)', lessonTopic: isAmharic ? `${unitTopic} - ተግባራዊ ምሳሌዎችና ማብራሪያ` : `${unitTopic} - Practical Applications` },
        { dayNumber: 4, dayName: isAmharic ? 'Day 4 (ሐሙስ / Thursday)' : 'Day 4 (Thursday)', lessonTopic: isAmharic ? `${unitTopic} - የተግባር ጥናትና የቡድን ውይይት` : `${unitTopic} - Guided Practice & Group Task` },
        { dayNumber: 5, dayName: isAmharic ? 'Day 5 (አርብ / Friday)' : 'Day 5 (Friday)', lessonTopic: isAmharic ? `${unitTopic} - ሳምንታዊ ክለሳና ምዘና` : `${unitTopic} - Review, Synthesis & Assessment` },
      ];
    }

    res.json({ suggestions });
  } catch (err: any) {
    console.error('Error in /api/suggest-weekly-subtopics:', err);
    res.status(500).json({ error: err.message || 'Failed to suggest subtopics' });
  }
});

// 1C. Generate 5 Complete Lesson Plans for a Weekly Unit
app.post('/api/generate-weekly-unit-plan', async (req: Request, res: Response) => {
  try {
    const {
      unitTopic,
      subject,
      gradeLevel,
      duration,
      languageMode,
      daysConfig,
      schoolProfile,
      customNotes,
      weekLabel,
    } = req.body;

    const schoolName = schoolProfile?.schoolName || schoolProfile?.amharicSchoolName || 'Primary School';
    const teacherName = schoolProfile?.teacherName || '';
    const effectiveLanguage = resolveCurriculumLanguage(subject, gradeLevel, languageMode);
    const isAmharic = effectiveLanguage === 'Amharic';

    const daysInput = Array.isArray(daysConfig) && daysConfig.length === 5 ? daysConfig : [
      { dayNumber: 1, dayName: isAmharic ? 'Day 1 (ሰኞ / Monday)' : 'Day 1 (Monday)', lessonTopic: `${unitTopic} - Introduction`, date: '' },
      { dayNumber: 2, dayName: isAmharic ? 'Day 2 (ማክሰኞ / Tuesday)' : 'Day 2 (Tuesday)', lessonTopic: `${unitTopic} - Part 2`, date: '' },
      { dayNumber: 3, dayName: isAmharic ? 'Day 3 (ረቡዕ / Wednesday)' : 'Day 3 (Wednesday)', lessonTopic: `${unitTopic} - Practice`, date: '' },
      { dayNumber: 4, dayName: isAmharic ? 'Day 4 (ሐሙስ / Thursday)' : 'Day 4 (Thursday)', lessonTopic: `${unitTopic} - Application`, date: '' },
      { dayNumber: 5, dayName: isAmharic ? 'Day 5 (አርብ / Friday)' : 'Day 5 (Friday)', lessonTopic: `${unitTopic} - Review & Quiz`, date: '' },
    ];

    const prompt = `You are the master Ethiopian Ministry of Education pedagogical assistant.
You must generate a COMPLETE 5-DAY WEEKLY UNIT PLAN consisting of EXACTLY 5 DAILY LESSON PLANS for an Ethiopian Primary School teacher.

CRITICAL REQUIREMENTS:
1. ALL 5 PLANS share the EXACT SAME Unit Topic: "${unitTopic}".
2. Each plan corresponds to ONE SCHOOL DAY (Day 1 to Day 5) with a distinct, progressive lesson topic:
${daysInput.map((d: any, idx: number) => `   - Day ${idx + 1} (${d.dayName}): "${d.lessonTopic || 'Topic for Day ' + (idx + 1)}" | Date: "${d.date || 'Standard'}"`).join('\n')}

3. CURRICULUM POLICY & LANGUAGE:
Subject: "${subject}"
Grade: "${gradeLevel}"
Instruction Medium: "${effectiveLanguage.toUpperCase()}"
${isAmharic 
  ? '- All pedagogical content MUST be in high quality natural AMHARIC SCRIPT (በግዕዝ ፊደላትና በአማርኛ ቋንቋ) including rationale, prerequisiteKnowledge, competencies, stages (Starter, Main Activities, Concluding Activities), and specialNeedsSupport.'
  : '- All pedagogical content MUST be in clear, professional ENGLISH.'}

4. OFFICIAL ETHIOPIAN 9-COLUMN STRUCTURE FOR EVERY DAY:
Each daily plan in the array must contain:
- schoolName: "${schoolName}"
- teacherName: "${teacherName}"
- subject: "${subject}"
- unitAndTopic: "${unitTopic}"
- gradeAndSection: "${gradeLevel}"
- lessonTopic: Specific lesson topic for that day
- date: Date string for that day
- rationale: Clear explanation of why this specific daily step is important
- prerequisiteKnowledge: Builds on previous days (e.g., Day 2 builds on Day 1)
- competencies: Measurable behavioral objectives ("By the end of the lesson, learners will...")
- stages: Array of 3 stages:
  1. Starter (5 min) with learningContents, page, teacherActivities, studentActivities, assessmentTechniques, teachingAids, remarks
  2. Main Activities (25 min) with detailed teacher explanation, student tasks, teaching aids
  3. Concluding Activities (5 min) with summary, check questions, homework
- specialNeedsSupport: { slowLearners, mediumLearners, fastLearners }
- deptHeadName: ""
- vicePrincipalName: ""
- postLessonAssessment: ""

Return ONLY a raw JSON array containing exactly 5 plan objects [ planDay1, planDay2, planDay3, planDay4, planDay5 ].
No backticks, no markdown fence, only valid JSON.`;

    const rawResponse = await generateGeminiContent({
      contents: prompt,
      temperature: 0.4,
    });

    let parsedPlans: any[] = [];
    try {
      const cleanJson = rawResponse
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      parsedPlans = JSON.parse(cleanJson);
      if (!Array.isArray(parsedPlans) && typeof parsedPlans === 'object' && (parsedPlans as any).days) {
        parsedPlans = (parsedPlans as any).days;
      }
    } catch (parseError) {
      console.warn('Failed to parse 5 plans JSON array from Gemini, constructing resilient fallback', parseError);
    }

    // Ensure we have 5 valid plans
    const finalDays = daysInput.map((dayCfg: any, idx: number) => {
      const dayPlan = (parsedPlans && parsedPlans[idx]) ? parsedPlans[idx] : null;
      const dayTopic = dayCfg.lessonTopic || `${unitTopic} - Part ${idx + 1}`;
      const dayDate = dayCfg.date || (isAmharic ? `ቀን ${idx + 1}` : `Day ${idx + 1}`);

      if (dayPlan && dayPlan.stages && Array.isArray(dayPlan.stages)) {
        return {
          dayNumber: idx + 1,
          dayName: dayCfg.dayName || `Day ${idx + 1}`,
          lessonTopic: dayTopic,
          date: dayDate,
          plan: {
            ...dayPlan,
            schoolName: dayPlan.schoolName || schoolName,
            teacherName: dayPlan.teacherName || teacherName,
            subject: dayPlan.subject || subject,
            unitAndTopic: unitTopic,
            lessonTopic: dayPlan.lessonTopic || dayTopic,
            gradeAndSection: dayPlan.gradeAndSection || gradeLevel,
            date: dayPlan.date || dayDate,
          },
        };
      }

      // High-quality fallback day plan
      return {
        dayNumber: idx + 1,
        dayName: dayCfg.dayName || `Day ${idx + 1}`,
        lessonTopic: dayTopic,
        date: dayDate,
        plan: {
          schoolName,
          teacherName,
          subject,
          unitAndTopic: unitTopic,
          gradeAndSection: gradeLevel,
          lessonTopic: dayTopic,
          date: dayDate,
          rationale: isAmharic
            ? `ይህ ትምህርት ተማሪዎች ስለ ${dayTopic} በቂ ግንዛቤ እንዲኖራቸውና በምዕራፉ ውስጥ የተካተቱትን ዋና ዋና ነጥቦች እንዲረዱ ያግዛል።`
            : `This lesson enables students to understand and master ${dayTopic} as part of ${unitTopic}.`,
          prerequisiteKnowledge: isAmharic
            ? (idx === 0 ? 'ተማሪዎች በቀደመው ክፍል የተማሩትን መሰረታዊ እውቀት' : `ተማሪዎች በ${daysInput[idx - 1]?.dayName || 'ቀዳሚው ቀን'} የተማሩት ትምህርት`)
            : (idx === 0 ? 'Foundational prior knowledge from earlier grade levels.' : `Concepts covered in previous day (${daysInput[idx - 1]?.lessonTopic || 'earlier lesson'}).`),
          competencies: isAmharic
            ? `ይህ ትምህርት ሲጠናቀቅ ተማሪዎች: 1. ${dayTopic}ን ይለያሉ፤ 2. በምሳሌ ያስረዳሉ፤ 3. የክፍል ስራዎችን በትክክል ይሰራሉ።`
            : `By the end of this lesson, students will be able to: 1. Identify and describe ${dayTopic}; 2. Apply concepts through exercises; 3. Collaborate in class tasks.`,
          stages: [
            {
              stage: isAmharic ? 'Starter (ማነሳሳትና መከለስ)' : 'Starter (Motivation & Introduction)',
              timeAllotment: isAmharic ? '5 ደቂቃ' : '5 min',
              learningContents: isAmharic ? `የ${dayTopic} መግቢያና ማነሳሻ ጥያቄዎች` : `Warm-up and orientation on ${dayTopic}`,
              page: `${idx * 4 + 1}-${idx * 4 + 3}`,
              teacherActivities: isAmharic
                ? 'መምህሩ ሰላምታ ይሰጣል፣ የቀደመውን ትምህርት ይከልሳል፣ የዛሬውን ርዕስ በሰሌዳ ላይ በመጻፍ ያስተዋውቃል።'
                : 'Greets students, reviews previous concepts, introduces today\'s lesson topic.',
              studentActivities: isAmharic
                ? 'ሰላምታ ይመልሳሉ፣ የማነሳሻ ጥያቄዎችን ይመልሳሉ፣ የመማሪያ መጽሐፋቸውን ይከፍታሉ።'
                : 'Greet teacher, respond to warm-up questions, open textbooks.',
              assessmentTechniques: isAmharic ? 'የቃል ጥያቄ (Oral Questions)' : 'Oral questions',
              teachingAids: isAmharic ? 'የተማሪው መጽሐፍ፣ ፍላሽ ካርድ' : 'Textbook, Flashcards',
              remarks: '-',
            },
            {
              stage: isAmharic ? 'Main Activities (ዋና ተግባራት)' : 'Main Activities',
              timeAllotment: isAmharic ? '25 ደቂቃ' : '25 min',
              learningContents: isAmharic ? `${dayTopic}ን በዝርዝር ማብራራትና ማለማመድ` : `Interactive instruction, worked examples and student exercises on ${dayTopic}`,
              page: `${idx * 4 + 2}-${idx * 4 + 4}`,
              teacherActivities: isAmharic
                ? `መምህሩ ስለ ${dayTopic} ገላጭ ማብራሪያ ይሰጣል፤ ምሳሌዎችን በሰሌዳ ላይ ይሰራል፤ ተማሪዎችን በቡድን ከፍሎ የክፍል ስራ ይሰጣል፤ ክፍሉን እየተዘዋወረ ድጋፍ ያደርጋል።`
                : `Explains key concepts of ${dayTopic}, models examples on the blackboard, assigns group tasks, and provides active guidance.`,
              studentActivities: isAmharic
                ? 'ማብራሪያውን በትኩረት ያዳምጣሉ፣ ማስታወሻ ይይዛሉ፣ በቡድን በመሆን የክፍል ስራ ይሰራሉ።'
                : 'Listen attentively, take notes, work in small groups on class exercises.',
              assessmentTechniques: isAmharic ? 'የክፍል ስራ ምልከታ፣ የቡድን ተሳትፎ' : 'Classwork evaluation, observation',
              teachingAids: isAmharic ? 'የተማሪው መጽሐፍ፣ ሰሌዳ፣ ስዕላዊ መግለጫ' : 'Textbook, Blackboard, Charts',
              remarks: '-',
            },
            {
              stage: isAmharic ? 'Concluding Activities (ማጠቃለያ ተግባራት)' : 'Concluding Activities',
              timeAllotment: isAmharic ? '5 ደቂቃ' : '5 min',
              learningContents: isAmharic ? 'የትምህርቱ ማጠቃለያ፣ ጥያቄና መልስ እና የቤት ስራ' : 'Summary, reflection, and homework assignment',
              page: `${idx * 4 + 4}`,
              teacherActivities: isAmharic
                ? 'የዛሬውን ዋና ዋና ነጥቦች ያጠቃልላል፣ 2 የማጠቃለያ ጥያቄዎችን ይጠይቃል፣ የቤት ስራ ይሰጣል።'
                : 'Summarizes key points, asks 2 checking questions, assigns follow-up homework.',
              studentActivities: isAmharic
                ? 'የማጠቃለያ ጥያቄዎችን ይመልሳሉ፣ የቤት ስራ በደብተራቸው ይጽፋሉ።'
                : 'Answer wrap-up questions, record homework in their notebooks.',
              assessmentTechniques: isAmharic ? 'የቃል ጥያቄ' : 'Oral question',
              teachingAids: '-',
              remarks: '-',
            },
          ],
          specialNeedsSupport: {
            slowLearners: isAmharic
              ? 'ተጨማሪ ቀላል ምሳሌዎችንና የአቻ ለአቻ ድጋፍ መስጠት፣ ተደጋጋሚ ልምምድ ማድረግ።'
              : 'Provide simplified tasks, extra visual aids, and peer tutoring assistance.',
            mediumLearners: isAmharic
              ? 'በመደበኛው የማስተማሪያ እቅድና ፍጥነት መሰረት ማስተማር።'
              : 'Standard pace instruction and regular classroom activities.',
            fastLearners: isAmharic
              ? 'ተጨማሪ ፈታኝ የቃላት ወይም የተግባር ጥያቄዎችንና የማስፋፊያ ስራዎችን መስጠት።'
              : 'Provide extension exercises, enrichment questions, and group leadership roles.',
          },
          deptHeadName: '',
          vicePrincipalName: '',
          postLessonAssessment: '',
        },
      };
    });

    const weeklyUnitPlan = {
      unitTopic,
      subject,
      gradeLevel,
      schoolName,
      teacherName,
      weekLabel: weekLabel || (isAmharic ? 'ሳምንት ፩ (Week 1)' : 'Week 1'),
      days: finalDays,
    };

    res.json({
      weeklyPlan: weeklyUnitPlan,
      content: rawResponse,
    });
  } catch (error: any) {
    console.error('Error in /api/generate-weekly-unit-plan:', error);
    res.status(500).json({ error: error.message || 'Failed to generate weekly unit plan' });
  }
});

// 2. Rapid "1 Word or Topic" Quiz & Worksheet Generator
app.post('/api/quick-quiz-generator', async (req: Request, res: Response) => {
  try {
    const {
      wordOrTopic,
      subject,
      gradeLevel,
      language,
      numQuestions,
      schoolProfile,
    } = req.body;

    const schoolName = schoolProfile?.schoolName || schoolProfile?.amharicSchoolName || 'Primary School / የመጀመሪያ ደረጃ ትምህርት ቤት';
    const teacherName = schoolProfile?.teacherName || 'Subject Teacher';
    const totalQ = numQuestions || 10;

    const effectiveLang = resolveCurriculumLanguage(subject, gradeLevel, language);
    const isAmharic = effectiveLang === 'Amharic';

    const prompt = `You are generating an instant classroom assessment based on a single word or topic for an Ethiopian primary school teacher.

ETHIOPIAN CURRICULUM MEDIUM OF INSTRUCTION:
- Subject: "${subject || 'General'}"
- Grade Level: "${gradeLevel || 'Grade 4'}"
- Required Language: "${effectiveLang.toUpperCase()}"
${isAmharic ? `[AMHARIC MEDIUM - GRADES 1-6 (Or Amharic Subject)]:
The ENTIRE quiz paper MUST be written in natural AMHARIC SCRIPT (በአማርኛ ቋንቋና በግዕዝ ፊደላት).
- Header in Amharic: "${schoolName}"
- Title: የ${subject} ምዘና ፈተና በርዕስ "${wordOrTopic}"
- Student Info: የተማሪው ስም፡ ______________ ክፍል፡ ${gradeLevel}  ክፍል ቁጥር፡ ___ ቀን፡ _________ [ ውጤት፡ _____ / 100 ]
- Clear Amharic instructions (መመሪያዎች)
- Part I: ባለብዙ ምርጫ (Multiple choice with choices ሀ, ለ, ሐ, መ)
- Part II: ክፍት ቦታ ሙላ (Fill in blanks)
- Part III: እውነት ወይም ሐሰት (True or False)
- Part IV: አዛምድ ወይም አጭር መልስ (Matching or Short answer)
- Complete Answer Key & Teacher Notes in Amharic under [የመልስ ቁልፍ (ANSWER KEY)] with explanations.` : `[ENGLISH MEDIUM - GRADES 7 & 8 (Or English Subject)]:
The ENTIRE quiz paper MUST be written in English.
- Header: "${schoolName}"
- Title: ${subject} Assessment / Quiz on "${wordOrTopic}"
- Student Info: Name: __________________________ Grade: ${gradeLevel} Section: ____ Date: _________ [ Score: _____ / 100 ]
- Clear English directions
- Part I: Multiple Choice Questions (choices A, B, C, D)
- Part II: Fill in the Blank / Short Answer
- Part III: True or False
- Part IV: Matching or Application Question
- Complete Answer Key & Teacher Notes under [ANSWER KEY] with clear explanations.`}

Word / Lesson Topic: "${wordOrTopic}"
Total Questions: ${totalQ}
Teacher: "${teacherName}"

Create a clean, ready-to-print assessment paper matching the language above.`;

    const text = await generateGeminiContent({
      contents: prompt,
      temperature: 0.5,
    });

    res.json({ content: text, language: effectiveLang });
  } catch (error: any) {
    console.error('Error in /api/quick-quiz-generator:', error);
    res.status(500).json({ error: error.message || 'Failed to generate quick quiz' });
  }
});

// 3. Full Worksheet Generator with School Branding
app.post('/api/generate-worksheet', async (req: Request, res: Response) => {
  try {
    const {
      title,
      subject,
      gradeLevel,
      questionTypes,
      numQuestions,
      topic,
      includeAnswerKey,
      includePhonetics,
      schoolProfile,
      language,
    } = req.body;

    const schoolName = schoolProfile?.schoolName || schoolProfile?.amharicSchoolName || 'Primary School';
    const teacherName = schoolProfile?.teacherName || '';

    const effectiveLang = resolveCurriculumLanguage(subject, gradeLevel, language);
    const isAmharic = effectiveLang === 'Amharic';

    const prompt = `Generate a classroom-ready student worksheet & exam paper for an Ethiopian primary school.

ETHIOPIAN CURRICULUM MEDIUM OF INSTRUCTION:
- Subject: ${subject || 'General Subject'}
- Grade Level: ${gradeLevel || 'Grade 5'}
- Language: ${effectiveLang.toUpperCase()}
${isAmharic ? `[AMHARIC MEDIUM - GRADES 1-6 (Or Amharic Subject)]:
The ENTIRE worksheet MUST be written in AMHARIC (በአማርኛ ቋንቋና በግዕዝ ፊደላት).
- Header: "${schoolName} - ${subject}"
- Student Info: "የተማሪው ስም፡ ______________ ክፍል፡ ${gradeLevel}  ቀን፡ ________ ውጤት፡ ___/100"
- Group by clean numbered Amharic sections:
  ክፍል ፩: ባለብዙ ምርጫ (ምርጫዎች ሀ፣ ለ፣ ሐ፣ መ)
  ክፍል ፪: ክፍት ቦታ ሙላ (Fill in blanks)
  ክፍል ፫: አዛምድ (Matching Columns)
  ክፍል ፬: እውነት ወይም ሐሰት (True/False)
  ክፍል ፭: አጭር መልስ (Short Answer)
- Answer Key at the end in Amharic under [የመልስ ቁልፍ (ANSWER KEY)].` : `[ENGLISH MEDIUM - GRADES 7 & 8 (Or English Subject)]:
The ENTIRE worksheet MUST be written in ENGLISH.
- Header: "${schoolName} - ${subject}"
- Student Info: "Student Name: ______________ Grade: ${gradeLevel}  Date: ________ Score: ___/100"
- Clean numbered sections (Part I: Multiple Choice, Part II: Fill in the blank, Part III: Matching, Part IV: True/False, Part V: Short Answer)
- Answer Key at the end under [ANSWER KEY].`}

School: ${schoolName} ${teacherName ? `(Teacher: ${teacherName})` : ''}
Assessment Title: ${title || 'Classroom Assessment'}
Topic: ${topic || 'Core Subject Material'}
Total Questions: ${numQuestions || 8}
Question Types requested: ${Array.isArray(questionTypes) ? questionTypes.join(', ') : 'Multiple choice, Fill in blanks, Matching'}
Include Latin Transliteration/Phonetics: ${includePhonetics ? 'Yes' : 'No'}
Include Answer Key: ${includeAnswerKey ? 'Yes' : 'No'}

Ensure all questions strictly match Ethiopian curriculum benchmarks.`;

    const text = await generateGeminiContent({
      contents: prompt,
      temperature: 0.6,
    });

    res.json({ content: text, language: effectiveLang });
  } catch (error: any) {
    console.error('Error in /api/generate-worksheet:', error);
    res.status(500).json({ error: error.message || 'Failed to generate worksheet' });
  }
});

// 3. Fidel & Grammar Explainer
app.post('/api/explain-grammar', async (req: Request, res: Response) => {
  try {
    const { query, category } = req.body;

    const prompt = `Explain the following Amharic grammar concept or Fidel script question for an educator and students:
Concept/Question: "${query}"
Category: ${category || 'General Grammar & Fidel'}

Provide:
1. ጽንሰ-ሀሳብ (Concept Overview in simple, clear terms)
2. ሕግጋት (The Golden Rules of this grammatical rule or spelling rule)
3. ምሳሌዎች (Rich authentic examples with English translations and grammatical breakdowns)
4. የተለመዱ ስህተቶች (Common pitfalls students make - e.g. confusing ሀ/ሐ/ኀ, ሠ/ሰ, አ/ዐ, ጸ/ፀ or irregular plural forms like ውሾች vs አህዮች)
5. የልምምድ ጥያቄዎች (3 quick mini-drills for the teacher to test the class immediately)`;

    const text = await generateGeminiContent({
      contents: prompt,
      temperature: 0.5,
    });

    res.json({ content: text });
  } catch (error: any) {
    console.error('Error in /api/explain-grammar:', error);
    res.status(500).json({ error: error.message || 'Failed to explain grammar' });
  }
});

// 4. Story & Reading Comprehension Creator
app.post('/api/generate-story', async (req: Request, res: Response) => {
  try {
    const { storyTheme, targetAudience, moralLesson, difficulty } = req.body;

    const prompt = `Write an engaging, authentic Ethiopian Amharic story for reading comprehension.
Parameters:
- Theme: ${storyTheme || 'የጥንቸልና የአንበሳ ተረት (Fable of Rabbit and Lion) or Modern Ethiopian school day'}
- Target Level: ${targetAudience || 'Children / Beginner-to-Intermediate Readers'}
- Moral Lesson / Message: ${moralLesson || 'Wisdom beats brute strength (ብልጠት ከጉልበት ይበልጣል)'}
- Difficulty: ${difficulty || 'Intermediate'}

Include:
1. ርዕስ (Catchy Title in Amharic & English)
2. ታሪኩ / ምንባቡ (The full story in captivating Amharic with paragraphs)
3. አዳዲስ ቃላት እና ፍቺ (Vocabulary Glossary with phonetic pronunciation and English definitions)
4. የይዘት መረዳት ጥያቄዎች (5 Reading Comprehension Questions testing recall, inference, and moral)
5. የውይይት መነሻ ነጥቦች (Discussion prompts for classroom debate)`;

    const text = await generateGeminiContent({
      contents: prompt,
      temperature: 0.8,
    });

    res.json({ content: text });
  } catch (error: any) {
    console.error('Error in /api/generate-story:', error);
    res.status(500).json({ error: error.message || 'Failed to generate story' });
  }
});

// 5. Student Assignment Grading & Feedback Assistant
app.post('/api/grade-student-work', async (req: Request, res: Response) => {
  try {
    const { studentText, assignmentPrompt, gradeLevel } = req.body;

    const prompt = `Review and grade the following student's Amharic submission.
Assignment Prompt / Context: "${assignmentPrompt || 'General writing assignment'}"
Target Grade Level: "${gradeLevel || 'Primary / Intermediate'}"

Student's Written Text:
"""
${studentText}
"""

Please provide a pedagogical teacher evaluation:
1. አጠቃላይ ግምገማ (Overall Impression & Encouraging Note)
2. የፊደል እና የሆሄያት እርማት (Spelling & Fidel Orthography corrections - highlight exact mistakes and the corrected forms)
3. የሰዋሰው እና የአረፍተ ነገር አወቃቀር (Grammar, Tense & Syntax feedback)
4. የታረመው ትክክለኛ ጽሁፍ (The polished, exemplary version of the student's text)
5. የሚሰጥ ነጥብ / ደረጃ (Estimated score out of 100 with rubric breakdown)
6. ለተማሪው የሚሰጥ ቀጣይ የልምምድ ምክር (Actionable next practice step)`;

    const text = await generateGeminiContent({
      contents: prompt,
      temperature: 0.4,
    });

    res.json({ content: text });
  } catch (error: any) {
    console.error('Error in /api/grade-student-work:', error);
    res.status(500).json({ error: error.message || 'Failed to grade work' });
  }
});

// 6. Bilingual Translator & Cultural Nuance Bridge
app.post('/api/translate-cultural', async (req: Request, res: Response) => {
  try {
    const { text, direction, includeProverbs } = req.body;

    const prompt = `Provide an educational translation and cultural breakdown:
Text to translate: "${text}"
Direction: ${direction || 'Amharic to English'}
Include related proverbs/idioms: ${includeProverbs ? 'Yes' : 'No'}

Please output:
1. ቀጥተኛ ትርጉም (Direct accurate translation)
2. የባህል አገባብ እና ማብራሪያ (Cultural context, respectful registers - e.g. እርሶ/አንተ/አንቺ, nuances)
3. የቃላት አፈታት (Key vocabulary breakdown with pronunciation)
4. ተዛማጅ ምሳሌያዊ አነጋገር (Equivalent Ethiopian proverb or English idiom if applicable)`;

    const result = await generateGeminiContent({
      contents: prompt,
      temperature: 0.4,
    });

    res.json({ content: result });
  } catch (error: any) {
    console.error('Error in /api/translate-cultural:', error);
    res.status(500).json({ error: error.message || 'Failed to translate' });
  }
});

// 7. Text-to-Speech (Audio Pronunciation for Fidel and Amharic text)
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, voiceName = 'Kore' } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required for TTS' });
      return;
    }

    // Clean text up to 300 characters for high speed audio playback
    const cleanText = text.trim().slice(0, 400);

    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: 'Clear, gentle, and articulated pronunciation for an Amharic language learner and teacher',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
          },
        },
      },
    });

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      res.status(500).json({ error: 'No audio returned from speech model' });
      return;
    }

    res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('Error in /api/tts:', error);
    res.status(500).json({ error: error.message || 'TTS generation failed' });
  }
});

// 8. General AI Educator Chat / Consultation
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    // Format for generateContent
    const formattedHistory = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content || '' }],
    }));

    const text = await generateGeminiContent({
      contents: formattedHistory,
      systemInstruction: SYSTEM_PROMPT_EDUCATOR + '\nBe an attentive, friendly, and deeply encouraging pedagogical advisor for teachers and students.',
      temperature: 0.7,
    });

    res.json({ text });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: error.message || 'Chat failed' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Amharic Teacher Helper AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
