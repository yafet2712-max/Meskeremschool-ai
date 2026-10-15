import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Printer, 
  Copy, 
  Check, 
  Bookmark, 
  Loader2, 
  Volume2, 
  School, 
  Eye, 
  FileSpreadsheet, 
  RefreshCw,
  Layers,
  Calendar,
  Lightbulb,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { playAmharicAudio } from '../utils/audio';
import { DailyLessonPlanData, SavedMaterial, SchoolProfile, WeeklyUnitPlanData } from '../types';
import { ETHIOPIAN_PRIMARY_SUBJECTS, PRIMARY_GRADES, QUICK_SAMPLE_TOPICS_BY_SUBJECT, WEEKLY_UNIT_PRESETS } from '../data/subjects';
import { DailyLessonPlanView } from './DailyLessonPlanView';
import { WeeklyLessonPlanView } from './WeeklyLessonPlanView';
import { getEthiopianCurriculumLanguage } from '../utils/curriculumLanguage';

export const EMPTY_LESSON_PLAN: DailyLessonPlanData = {
  schoolName: '',
  teacherName: '',
  subject: '',
  unitAndTopic: '',
  gradeAndSection: '',
  lessonTopic: '',
  date: '',
  rationale: '',
  prerequisiteKnowledge: '',
  competencies: '',
  stages: [
    {
      stage: 'Starter (ማነሳሳትና መከለስ)',
      timeAllotment: '',
      learningContents: '',
      page: '',
      teacherActivities: '',
      studentActivities: '',
      assessmentTechniques: '',
      teachingAids: '',
      remarks: '',
    },
    {
      stage: 'Main Activities (ዋና ተግባራት)',
      timeAllotment: '',
      learningContents: '',
      page: '',
      teacherActivities: '',
      studentActivities: '',
      assessmentTechniques: '',
      teachingAids: '',
      remarks: '',
    },
    {
      stage: 'Concluding Activities (ማጠቃለያ ተግባራት)',
      timeAllotment: '',
      learningContents: '',
      page: '',
      teacherActivities: '',
      studentActivities: '',
      assessmentTechniques: '',
      teachingAids: '',
      remarks: '',
    },
  ],
  specialNeedsSupport: {
    slowLearners: '',
    mediumLearners: '',
    fastLearners: '',
  },
  deptHeadName: '',
  vicePrincipalName: '',
  postLessonAssessment: '',
};

export const SAMPLE_IMAGE_PLAN: DailyLessonPlanData = {
  schoolName: '',
  teacherName: '',
  subject: 'English',
  unitAndTopic: 'Unit One - My Family',
  gradeAndSection: 'Grade 1',
  lessonTopic: 'Vocabulary Practice: Class room Objects',
  date: 'Meskerem 06, 2017 E.C (Wednesday)',
  rationale: 'The lesson helps learners talk about classroom objects and their family.',
  prerequisiteKnowledge: 'Learners have learned family and basic greetings.',
  competencies: 'At the end of the lesson, the students will be able to identify and name classroom objects in English.',
  stages: [
    {
      stage: 'Starter (Motivation & Introduction)',
      timeAllotment: '5 min',
      learningContents: 'Warm-up related to Classroom Objects',
      page: '1-5',
      teacherActivities: 'Greets students, reviews previous lesson, and introduces today\'s topic: Classroom Objects.',
      studentActivities: 'Greet the teacher, answer warm-up questions, and listen to the introduction.',
      assessmentTechniques: 'Oral question',
      teachingAids: '-',
      remarks: '-',
    },
    {
      stage: 'Main Activities',
      timeAllotment: '25 min',
      learningContents: 'Practice and drill \'Classroom Objects\'',
      page: '1-5',
      teacherActivities: 'Explanation: guides students through \'Classroom Objects\' using Textbook, Pictures, Posters, and Flashcards.',
      studentActivities: 'Participate in vocabulary practice activities, practice naming objects, and respond to the teacher.',
      assessmentTechniques: 'Class work, oral questions',
      teachingAids: 'Textbook, Pictures, Posters, Flashcards',
      remarks: '-',
    },
    {
      stage: 'Concluding Activities',
      timeAllotment: '5 min',
      learningContents: 'Summary and homework',
      page: '-',
      teacherActivities: 'Summarizes the lesson, asks review questions, and assigns follow-up work.',
      studentActivities: 'Answer review questions and note down the homework/assignment.',
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

export const SAMPLE_AMHARIC_PLAN: DailyLessonPlanData = {
  schoolName: '',
  teacherName: '',
  subject: 'አጠቃላይ ሳይንስ (General Science)',
  unitAndTopic: 'ምዕራፍ ፫ - የእጽዋት ክፍሎችና ተግባራቸው',
  gradeAndSection: '፭ኛ ክፍል (Grade 5)',
  lessonTopic: 'የቅጠል ተግባር እና የብርሃን አስተፃምሮ (Photosynthesis)',
  date: 'መስከረም 06 ቀን 2017 ዓ.ም',
  rationale: 'ይህ ትምህርት ተማሪዎች እጽዋት በቅጠላቸው አማካኝነት እንዴት ምግብ እንደሚያዘጋጁና ለሰው ልጅ ያላቸውን ጥቅም እንዲገነዘቡ ያግዛል።',
  prerequisiteKnowledge: 'ተማሪዎች በ4ኛ ክፍል ስለ እጽዋት ዋና ዋና ክፍሎች (ስር፣ ግንድ፣ ቅጠል) ተምረዋል።',
  competencies: 'ይህ ትምህርት ሲጠናቀቅ ተማሪዎች፡ 1. የቅጠልን ዋና ዋና ክፍሎች ይለያሉ፤ 2. የብርሃን አስተፃምሮ (Photosynthesis) ሂደትን ያብራራሉ፤ 3. እጽዋትን የመንከባከብ አስፈላጊነትን ይገልጻሉ።',
  stages: [
    {
      stage: 'Starter (ማነሳሳትና መከለስ)',
      timeAllotment: '5 ደቂቃ',
      learningContents: 'የቀደመ እውቀት መከለስና የቅጠሎችን ቅርጽ መመልከት',
      page: '34-36',
      teacherActivities: 'መምህሩ ሰላምታ ይሰጣል፣ አረንጓዴ ቅጠል ለክፍሉ በማሳየት "እጽዋት ምግባቸውን የሚያዘጋጁት የት ይመስላችኋል?" በማለት ይጠይቃል፣ የዛሬውን ርዕስ ያስተዋውቃል።',
      studentActivities: 'ተማሪዎች ሰላምታ ይመልሳሉ፣ የማነሳሻ ጥያቄዎችን ይመልሳሉ፣ የመማሪያ መጽሐፋቸውን ገጽ 34 ይከፍታሉ።',
      assessmentTechniques: 'የቃል ጥያቄ (Oral Questions)',
      teachingAids: 'የተፈጥሮ እጽዋት ቅጠል ናሙና፣ ፍላሽ ካርድ',
      remarks: '-',
    },
    {
      stage: 'Main Activities (ዋና ተግባራት)',
      timeAllotment: '25 ደቂቃ',
      learningContents: 'የቅጠል አወቃቀርና የብርሃን አስተፃምሮ ሂደት',
      page: '35-37',
      teacherActivities: 'መምህሩ የብርሃን አስተፃምሮ ንጥረ ነገሮችን (የፀሐይ ብርሃን፣ ውሃ፣ ካርቦን ዳይኦክሳይድ፣ ክሎሮፊል) በሰሌዳ ላይ በስዕላዊ መግለጫ ያስረዳል፤ ተማሪዎችን በ4 ቡድን በመክፈል በገጽ 36 ላይ ያለውን ጥያቄ እንዲወያዩ ያደርጋል።',
      studentActivities: 'ማብራሪያውን በትኩረት ያዳምጣሉ፣ በቡድን ሆነው የቅጠልን ተግባር ይወያያሉ፣ የክፍል ስራውን በደብተራቸው ይመዘግባሉ።',
      assessmentTechniques: 'የክፍል ስራ ምልከታ፣ የቡድን ውይይት ተሳትፎ',
      teachingAids: 'የተማሪው መማሪያ መጽሐፍ፣ የብርሃን አስተፃምሮ ቻርት/ፖስተር፣ ሰሌዳ',
      remarks: '-',
    },
    {
      stage: 'Concluding Activities (ማጠቃለያ ተግባራት)',
      timeAllotment: '5 ደቂቃ',
      learningContents: 'የትምህርቱ ማጠቃለያ እና የቤት ስራ',
      page: '38',
      teacherActivities: 'ዋና ዋና ነጥቦችን ያጠቃልላል፣ 3 የማጠቃለያ ጥያቄዎችን ይጠይቃል፣ በገጽ 38 ላይ ያሉትን ጥያቄዎች በቤት ስራ መልክ ይሰጣል።',
      studentActivities: 'የማጠቃለያ ጥያቄዎችን ይመልሳሉ፣ የቤት ስራውን በደብተራቸው ይጽፋሉ።',
      assessmentTechniques: 'የቃል ጥያቄ',
      teachingAids: 'የተማሪው መጽሐፍ',
      remarks: '-',
    },
  ],
  specialNeedsSupport: {
    slowLearners: 'ተጨማሪ ምስሎችንና ፍላሽ ካርዶችን በመጠቀም በአቻ ተማሪ እንዲታገዙ ማድረግ።',
    mediumLearners: 'በመደበኛው የማስተማሪያ እቅድና ፍጥነት መሰረት ማስተማር።',
    fastLearners: 'እጽዋት ባይኖሩ በከባቢ አየር ላይ ምን ሊፈጠር እንደሚችል አጭር ድርሰት እንዲጽፉ ተጨማሪ ተግባር መስጠት።',
  },
  deptHeadName: '',
  vicePrincipalName: '',
  postLessonAssessment: '',
};

interface LessonPlannerProps {
  schoolProfile: SchoolProfile;
  onSaveToLibrary: (item: Omit<SavedMaterial, 'id' | 'createdAt'>) => void;
  onOpenKeyboard: () => void;
  onOpenSchoolSettings: () => void;
}

export const LessonPlanner: React.FC<LessonPlannerProps> = ({
  schoolProfile,
  onSaveToLibrary,
  onOpenKeyboard,
  onOpenSchoolSettings,
}) => {
  // Planner Mode: 'weekly-5day' (default requested) or 'single'
  const [plannerMode, setPlannerMode] = useState<'weekly-5day' | 'single'>('weekly-5day');

  // Shared Form State
  const [subject, setSubject] = useState('general_science');
  const [gradeLevel, setGradeLevel] = useState('Grade 5');
  const [duration, setDuration] = useState('35 min (5 min Starter, 25 min Main, 5 min Concluding)');
  const [languageMode, setLanguageMode] = useState<string>('Amharic');
  const [customNotes, setCustomNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuggestingSubtopics, setIsSuggestingSubtopics] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Single Day State
  const [singleTopic, setSingleTopic] = useState('ምዕራፍ ፫ - የእጽዋት ክፍሎችና ተግባራቸው');
  const [singleLessonTopic, setSingleLessonTopic] = useState('የቅጠል ተግባር እና የብርሃን አስተፃምሮ');
  const [singleDate, setSingleDate] = useState('መስከረም 06 ቀን 2017 ዓ.ም');
  const [structuredPlan, setStructuredPlan] = useState<DailyLessonPlanData>(SAMPLE_AMHARIC_PLAN);
  const [singleSaved, setSingleSaved] = useState(false);

  // 5-Day Weekly Unit State
  const [unitTopic, setUnitTopic] = useState('ምዕራፍ ፫ - የእጽዋት ክፍሎችና ተግባራቸው (Plant Parts and Functions)');
  const [weekLabel, setWeekLabel] = useState('ሳምንት ፩ (Week 1)');
  const [daysConfig, setDaysConfig] = useState<Array<{ dayNumber: number; dayName: string; lessonTopic: string; date: string }>>([
    { dayNumber: 1, dayName: 'Day 1 (ሰኞ / Monday)', lessonTopic: 'የእጽዋት ክፍሎች መግቢያና የስር ዋና ተግባር (Root Function)', date: 'መስከረም 06 ቀን 2017 ዓ.ም' },
    { dayNumber: 2, dayName: 'Day 2 (ማክሰኞ / Tuesday)', lessonTopic: 'የግንድ ዓይነቶችና ንጥረ-ነገር የማዘዋወር ሚና (Stems & Transportation)', date: 'መስከረም 07 ቀን 2017 ዓ.ም' },
    { dayNumber: 3, dayName: 'Day 3 (ረቡዕ / Wednesday)', lessonTopic: 'የቅጠል አወቃቀርና የብርሃን አስተፃምሮ ሂደት (Photosynthesis)', date: 'መስከረም 08 ቀን 2017 ዓ.ም' },
    { dayNumber: 4, dayName: 'Day 4 (ሐሙስ / Thursday)', lessonTopic: 'የአበባ፣ ፍሬና ዘር ተግባር በመራባት ሂደት ውስጥ (Flowers, Fruits & Seeds)', date: 'መስከረም 09 ቀን 2017 ዓ.ም' },
    { dayNumber: 5, dayName: 'Day 5 (አርብ / Friday)', lessonTopic: 'ሳምንታዊ ክለሳ፣ የቡድን ተግባር እና ሳምንታዊ ምዘና (Weekly Review & Assessment)', date: 'መስከረም 10 ቀን 2017 ዓ.ም' },
  ]);

  const [weeklyUnitPlan, setWeeklyUnitPlan] = useState<WeeklyUnitPlanData | null>(null);
  const [weeklySaved, setWeeklySaved] = useState(false);

  const currentSubjectObj = ETHIOPIAN_PRIMARY_SUBJECTS.find((s) => s.id === subject);
  const curriculumRule = getEthiopianCurriculumLanguage(subject, gradeLevel);

  // Auto-sync curriculum language medium
  useEffect(() => {
    setLanguageMode(curriculumRule.language);
  }, [subject, gradeLevel]);

  // Handle single plan generation
  const handleGenerateSingle = async () => {
    setLoading(true);
    setErrorMessage(null);
    setSingleSaved(false);

    try {
      const res = await fetch('/api/generate-lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: singleTopic,
          subject: currentSubjectObj?.nameEn || subject,
          gradeLevel,
          duration,
          languageMode,
          specificFocus: singleLessonTopic,
          customNotes,
          schoolProfile,
          customDate: singleDate,
        }),
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      if (data.plan) {
        setStructuredPlan(data.plan);
      } else {
        throw new Error('No plan returned from AI');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to generate single lesson plan.');
    } finally {
      setLoading(false);
    }
  };

  // Handle 5-Day Weekly Unit Plan generation
  const handleGenerateWeeklyUnit = async () => {
    setLoading(true);
    setErrorMessage(null);
    setWeeklySaved(false);

    try {
      const res = await fetch('/api/generate-weekly-unit-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitTopic,
          subject: currentSubjectObj?.nameEn || subject,
          gradeLevel,
          duration,
          languageMode,
          daysConfig,
          schoolProfile,
          customNotes,
          weekLabel,
        }),
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      if (data.weeklyPlan) {
        setWeeklyUnitPlan(data.weeklyPlan);
      } else {
        throw new Error('No weekly unit plan returned from AI');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to generate weekly unit plan.');
    } finally {
      setLoading(false);
    }
  };

  // AI-powered suggestion of 5 progressive subtopics for a single unit
  const handleSuggestSubtopics = async () => {
    if (!unitTopic.trim()) return;
    setIsSuggestingSubtopics(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/suggest-weekly-subtopics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitTopic,
          subject: currentSubjectObj?.nameEn || subject,
          gradeLevel,
          languageMode,
        }),
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setDaysConfig((prev) =>
          prev.map((d, idx) => ({
            ...d,
            lessonTopic: data.suggestions[idx]?.lessonTopic || d.lessonTopic,
          }))
        );
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Could not auto-suggest subtopics. You can type them manually.');
    } finally {
      setIsSuggestingSubtopics(false);
    }
  };

  const handleUpdateDayConfig = (idx: number, field: 'lessonTopic' | 'date', val: string) => {
    setDaysConfig((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  const handleLoadWeeklyPreset = (presetId: string) => {
    const preset = WEEKLY_UNIT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSubject(preset.subject);
    setGradeLevel(preset.grade);
    setUnitTopic(preset.unitTopic);
    setLanguageMode(preset.language);
    setDaysConfig(
      preset.days.map((d, idx) => ({
        dayNumber: d.dayNumber,
        dayName: d.dayName,
        lessonTopic: d.lessonTopic,
        date: preset.language === 'Amharic' 
          ? `መስከረም 0${6 + idx} ቀን 2017 ዓ.ም` 
          : `Day ${idx + 1} (${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][idx]})`,
      }))
    );
  };

  const handleSaveSinglePlan = () => {
    if (!structuredPlan) return;
    onSaveToLibrary({
      type: 'lesson-plan',
      title: `${structuredPlan.subject || 'Lesson Plan'}: ${structuredPlan.lessonTopic || structuredPlan.unitAndTopic || 'Untitled'}`,
      preview: `Teacher: ${structuredPlan.teacherName || 'Not specified'} • School: ${structuredPlan.schoolName || 'Not specified'} • ${structuredPlan.competencies.slice(0, 80)}...`,
      content: JSON.stringify(structuredPlan, null, 2),
      structuredPlan,
      gradeLevel: structuredPlan.gradeAndSection,
      subject: structuredPlan.subject,
      schoolName: structuredPlan.schoolName,
      tags: ['Daily Lesson Plan', structuredPlan.subject, structuredPlan.gradeAndSection],
    });
    setSingleSaved(true);
    setTimeout(() => setSingleSaved(false), 2500);
  };

  const handleSaveWeeklyPlan = () => {
    if (!weeklyUnitPlan) return;
    onSaveToLibrary({
      type: 'weekly-plan',
      title: `[5-Day Weekly Unit]: ${weeklyUnitPlan.unitTopic}`,
      preview: `5 Lessons: ${weeklyUnitPlan.days.map((d) => d.lessonTopic).join(' • ')}`,
      content: JSON.stringify(weeklyUnitPlan, null, 2),
      weeklyPlan: weeklyUnitPlan,
      gradeLevel: weeklyUnitPlan.gradeLevel,
      subject: weeklyUnitPlan.subject,
      schoolName: weeklyUnitPlan.schoolName,
      tags: ['Weekly Unit Plan', '5 Days', weeklyUnitPlan.subject, weeklyUnitPlan.gradeLevel],
    });
    setWeeklySaved(true);
    setTimeout(() => setWeeklySaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-900 text-white p-5 rounded-3xl shadow-lg no-print flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-2xl shrink-0 border border-white/20">
            {plannerMode === 'weekly-5day' ? '🌟' : '📋'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                Official Ethiopian MoE Standard
              </span>
              <span className="bg-amber-400 text-amber-950 text-[10px] px-2.5 py-0.5 rounded-full font-black shadow-xs">
                {plannerMode === 'weekly-5day' ? '5-Day Weekly Unit Active' : 'Single Day Active'}
              </span>
            </div>
            <h2 className="text-lg font-black mt-0.5">
              {plannerMode === 'weekly-5day'
                ? 'የ5 ቀናት የሳምንት እቅድ (5 Lesson Plans • Same Unit Topic)'
                : 'ዕለታዊ የትምህርት እቅድ (Single Daily Lesson Plan)'}
            </h2>
            <p className="text-xs text-emerald-100 max-w-xl">
              {plannerMode === 'weekly-5day'
                ? 'Prepare 5 sequential, progressive daily lesson plans under the same unit topic for Monday to Friday, with 9-column MoE tables and 1-click Word (.docx) export.'
                : 'Generate a single day official 9-column lesson plan with starter, main, and concluding activities.'}
            </p>
          </div>
        </div>

        {/* Mode Selector Pill Buttons */}
        <div className="bg-black/25 p-1 rounded-2xl flex items-center gap-1 border border-white/20 shrink-0">
          <button
            onClick={() => setPlannerMode('weekly-5day')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
              plannerMode === 'weekly-5day'
                ? 'bg-amber-400 text-stone-950 shadow-md font-black'
                : 'text-emerald-100 hover:text-white hover:bg-white/10'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-950" />
            <span>የ5 ቀናት እቅድ (5-Day Weekly Unit)</span>
          </button>

          <button
            onClick={() => setPlannerMode('single')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              plannerMode === 'single'
                ? 'bg-white text-emerald-950 shadow-md font-black'
                : 'text-emerald-100 hover:text-white hover:bg-white/10'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span>ነጠላ እቅድ (Single Day)</span>
          </button>
        </div>
      </div>

      {/* Main Generator Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-5 no-print">
        {/* Curriculum Rule Strip */}
        <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
          curriculumRule.language === 'Amharic'
            ? 'bg-amber-50/90 border-amber-300 text-amber-950'
            : 'bg-blue-50/90 border-blue-300 text-blue-950'
        }`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">{curriculumRule.language === 'Amharic' ? '🇪🇹' : '🇬🇧'}</span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider">
                  የሥርዓተ-ትምህርት ቋንቋ ደንብ (Curriculum Rule)
                </span>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border shadow-xs ${
                  curriculumRule.language === 'Amharic'
                    ? 'bg-amber-200 border-amber-400 text-amber-900'
                    : 'bg-blue-200 border-blue-400 text-blue-900'
                }`}>
                  {curriculumRule.badgeText}
                </span>
              </div>
              <p className="text-xs font-medium mt-1 leading-relaxed">
                {curriculumRule.ruleDescriptionAm}
              </p>
              <p className="text-[11px] opacity-75 mt-0.5 italic">
                {curriculumRule.ruleDescriptionEn}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0 bg-white/80 px-3 py-1.5 rounded-xl border border-stone-200 shadow-xs">
            <span className="text-xs font-semibold text-stone-700">የትምህርት ቋንቋ፦</span>
            <select
              value={languageMode}
              onChange={(e) => setLanguageMode(e.target.value)}
              className="px-2 py-1 text-xs font-bold bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Amharic">አማርኛ (Amharic)</option>
              <option value="English">English</option>
            </select>
          </div>
        </div>

        {/* Subject Picker */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            የትምህርቱ አይነት ምረጡ (Subject):
          </label>
          <div className="flex flex-wrap gap-1.5">
            {ETHIOPIAN_PRIMARY_SUBJECTS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSubject(s.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  subject === s.id
                    ? 'bg-emerald-700 text-white shadow-sm font-semibold'
                    : 'bg-stone-50 hover:bg-emerald-50 text-stone-700 border border-stone-200'
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.nameEn}</span>
                <span className="font-amharic text-[11px] opacity-80">({s.nameAm})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Presets Bar for 5-Day Weekly Unit */}
        {plannerMode === 'weekly-5day' && (
          <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>ፈጣን የ5 ቀናት ናሙናዎች (Load 5-Day Unit Presets):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {WEEKLY_UNIT_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleLoadWeeklyPreset(p.id)}
                  className="px-2.5 py-1 text-xs bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-900 rounded-lg border border-stone-200 hover:border-amber-300 transition font-medium"
                >
                  {p.id === 'science-plants' && '🌱 እጽዋት (Science)'}
                  {p.id === 'english-family-community' && '🇬🇧 Community (English)'}
                  {p.id === 'math-fractions' && '📐 ክፍልፋዮች (Math)'}
                  {p.id === 'env-science-water' && '💧 ውሃና ንጽህና (Env)'}
                  {p.id === 'amharic-grammar' && '🇪🇹 ስሞችና ቅጽሎች (Amharic)'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- 5-DAY WEEKLY FORM FIELDS ---------------- */}
        {plannerMode === 'weekly-5day' && (
          <div className="space-y-4 pt-1">
            {/* Unit Topic & Week Label */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Unit and Topic (የምዕራፉ ዋና ርዕስ - ለሁሉም 5 ቀናት ተመሳሳይ) *
                  </label>
                  <button
                    onClick={handleSuggestSubtopics}
                    disabled={isSuggestingSubtopics || !unitTopic.trim()}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 disabled:opacity-50"
                    title="Ask AI to suggest 5 progressive lesson topics under this unit"
                  >
                    {isSuggestingSubtopics ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Lightbulb className="w-3 h-3 text-amber-600" />
                    )}
                    <span>💡 5ቱን ንዑሳን ርዕሶች በራስ-ሰር አውጣ (Suggest 5 Topics)</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={unitTopic}
                  onChange={(e) => setUnitTopic(e.target.value)}
                  placeholder="e.g. ምዕራፍ ፫ - የእጽዋት ክፍሎችና ተግባራቸው"
                  className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Week Label (ሳምንት)
                </label>
                <input
                  type="text"
                  value={weekLabel}
                  onChange={(e) => setWeekLabel(e.target.value)}
                  placeholder="e.g. ሳምንት ፩ (Week 1)"
                  className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>

            {/* 5 Daily Lesson Topics Rows */}
            <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50/60">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                    የ5ቱ ቀናት የተያያዙ ንዑሳን ርዕሶች (5 Progressive Daily Lesson Topics):
                  </span>
                </div>
                <span className="text-[11px] text-stone-500">
                  ተማሪዎች ደረጃ በደረጃ የሚማሩባቸው 5 ርዕሶች
                </span>
              </div>

              <div className="space-y-2.5">
                {daysConfig.map((day, idx) => (
                  <div
                    key={day.dayNumber}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white p-2.5 rounded-xl border border-stone-200 shadow-xs"
                  >
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-lg shrink-0 sm:w-36 text-center">
                      {day.dayName}
                    </span>

                    <input
                      type="text"
                      value={day.lessonTopic}
                      onChange={(e) => handleUpdateDayConfig(idx, 'lessonTopic', e.target.value)}
                      placeholder={`Day ${idx + 1} Lesson Topic`}
                      className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-stone-900"
                    />

                    <input
                      type="text"
                      value={day.date}
                      onChange={(e) => handleUpdateDayConfig(idx, 'date', e.target.value)}
                      placeholder="Date (ቀን)"
                      className="sm:w-44 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-stone-600 font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Grade & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Grade and Section (ክፍልና ሴክሽን)
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  {PRIMARY_GRADES.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nameEn} ({g.nameAm})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Daily Period Time Allotment (ክፍለ-ጊዜ)
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="35 min (5 min Starter, 25 min Main, 5 min Concluding)">35 min (5m Starter, 25m Main, 5m Concluding)</option>
                  <option value="40 min (5 min Starter, 30 min Main, 5 min Concluding)">40 min (5m Starter, 30m Main, 5m Concluding)</option>
                  <option value="45 min (10 min Starter, 25 min Main, 10 min Concluding)">45 min (Standard 45-min Period)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- SINGLE DAY FORM FIELDS ---------------- */}
        {plannerMode === 'single' && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Unit and topic (ምዕራፍ እና ዋና ርዕስ) *
                </label>
                <input
                  type="text"
                  value={singleTopic}
                  onChange={(e) => setSingleTopic(e.target.value)}
                  placeholder="e.g. Unit One - My Family"
                  className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Lesson topic (የክፍለ-ጊዜው ንዑስ ርዕስ) *
                </label>
                <input
                  type="text"
                  value={singleLessonTopic}
                  onChange={(e) => setSingleLessonTopic(e.target.value)}
                  placeholder="e.g. Vocabulary Practice: Classroom Objects"
                  className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Grade and Section (ክፍልና ሴክሽን)
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {PRIMARY_GRADES.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nameEn} ({g.nameAm})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Date (ቀን)
                </label>
                <input
                  type="text"
                  value={singleDate}
                  onChange={(e) => setSingleDate(e.target.value)}
                  placeholder="e.g. መስከረም 06 ቀን 2017 ዓ.ም"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Time Allotment (ክፍለ-ጊዜ)
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="35 min (5 min Starter, 25 min Main, 5 min Concluding)">35 min</option>
                  <option value="40 min (5 min Starter, 30 min Main, 5 min Concluding)">40 min</option>
                  <option value="45 min (10 min Starter, 25 min Main, 10 min Concluding)">45 min</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
            {errorMessage}
          </div>
        )}

        {/* Submit Actions */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-stone-100">
          <div className="text-xs text-stone-500">
            Workplace: <strong>{schoolProfile.schoolName}</strong> • Teacher: <strong>{schoolProfile.teacherName}</strong>
          </div>

          {plannerMode === 'weekly-5day' ? (
            <button
              onClick={handleGenerateWeeklyUnit}
              disabled={loading || !unitTopic.trim()}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl transition shadow-lg shadow-amber-600/25 disabled:opacity-50 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>5ቱን የትምህርት እቅዶች እያዘጋጀ ነው (Generating 5 Lesson Plans)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>የሳምንቱን 5 የትምህርት እቅዶች አዘጋጅ (Generate 5-Day Weekly Unit Plan)</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleGenerateSingle}
              disabled={loading || !singleTopic.trim()}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl transition shadow-lg shadow-emerald-700/25 disabled:opacity-50 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>የትምህርት እቅድ በሰንጠረዥ እየተዘጋጀ ነው (Generating MoE Table)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>በሰንጠረዡ መሰረት አዘጋጅ (Generate Daily Lesson Plan)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Render 5-Day Weekly Plan View if active and available */}
      {plannerMode === 'weekly-5day' && weeklyUnitPlan && (
        <WeeklyLessonPlanView
          weeklyPlan={weeklyUnitPlan}
          onUpdateWeeklyPlan={(updated) => setWeeklyUnitPlan(updated)}
          onSave={handleSaveWeeklyPlan}
          isSaved={weeklySaved}
        />
      )}

      {/* Render Single Plan View if active */}
      {plannerMode === 'single' && structuredPlan && (
        <DailyLessonPlanView
          plan={structuredPlan}
          onUpdatePlan={(updated) => setStructuredPlan(updated)}
          onSave={handleSaveSinglePlan}
          isSaved={singleSaved}
        />
      )}
    </div>
  );
};
