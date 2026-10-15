import React, { useState } from 'react';
import { Zap, Sparkles, Printer, Copy, Check, Bookmark, Loader2, Eye, EyeOff, BookOpen, School, Download } from 'lucide-react';
import { SchoolProfile, SavedMaterial } from '../types';
import { ETHIOPIAN_PRIMARY_SUBJECTS, PRIMARY_GRADES, QUICK_SAMPLE_TOPICS_BY_SUBJECT } from '../data/subjects';
import { exportTextOrQuizToDocx } from '../utils/docxExport';
import { getEthiopianCurriculumLanguage } from '../utils/curriculumLanguage';

interface QuickQuizGeneratorProps {
  schoolProfile: SchoolProfile;
  onSaveToLibrary: (item: Omit<SavedMaterial, 'id' | 'createdAt'>) => void;
  onOpenKeyboard: () => void;
  onOpenSchoolSettings: () => void;
}

export const QuickQuizGenerator: React.FC<QuickQuizGeneratorProps> = ({
  schoolProfile,
  onSaveToLibrary,
  onOpenKeyboard,
  onOpenSchoolSettings,
}) => {
  const [wordOrTopic, setWordOrTopic] = useState('Photosynthesis');
  const [subject, setSubject] = useState('general_science');
  const [gradeLevel, setGradeLevel] = useState('Grade 6');

  // Ethiopian Curriculum Language Rule based on selected subject & grade
  const curriculumRule = getEthiopianCurriculumLanguage(subject, gradeLevel);
  const [language, setLanguage] = useState<'English' | 'Amharic' | 'Bilingual'>(curriculumRule.language);
  const [numQuestions, setNumQuestions] = useState(10);

  // Auto-synchronize language when subject or grade changes according to MoE policy
  React.useEffect(() => {
    setLanguage(curriculumRule.language);
  }, [subject, gradeLevel]);

  const [loading, setLoading] = useState(false);
  const [quizContent, setQuizContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAnswerKey, setShowAnswerKey] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentSubjectObj = ETHIOPIAN_PRIMARY_SUBJECTS.find((s) => s.id === subject);
  const quickIdeas = QUICK_SAMPLE_TOPICS_BY_SUBJECT[subject] || [];

  const handleGenerate = async (customTopic?: string, customGrade?: string) => {
    const activeWord = (customTopic || wordOrTopic).trim();
    if (!activeWord) {
      setErrorMessage('Please enter a word or lesson topic (እባክዎ ቃል ወይም ርዕስ ያስገቡ).');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSaved(false);

    try {
      const res = await fetch('/api/quick-quiz-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordOrTopic: activeWord,
          subject: currentSubjectObj?.nameEn || subject,
          gradeLevel: customGrade || gradeLevel,
          language,
          numQuestions,
          schoolProfile,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.content) {
        setQuizContent(data.content);
      } else {
        throw new Error('No quiz generated');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to generate quiz. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!quizContent) return;
    navigator.clipboard.writeText(quizContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!quizContent) return;
    onSaveToLibrary({
      type: 'quick-quiz',
      title: `${currentSubjectObj?.nameEn || subject} Quiz: ${wordOrTopic}`,
      preview: quizContent.slice(0, 140) + '...',
      content: quizContent,
      gradeLevel,
      subject: currentSubjectObj?.nameEn,
      schoolName: schoolProfile.schoolName,
      tags: ['Quick Quiz', subject, gradeLevel, `${numQuestions} Qs`],
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Student vs Teacher display
  let displayContent = quizContent || '';
  if (quizContent && !showAnswerKey) {
    const keyIndex = quizContent.search(/\[ANSWER KEY|የመልስ ቁልፍ|## ANSWER KEY|## የመልስ/i);
    if (keyIndex !== -1) {
      displayContent = quizContent.slice(0, keyIndex).trim();
    }
  }

  return (
    <div className="space-y-6">
      {/* School Banner Header */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-md font-bold text-xl">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Instant Quiz Maker (በአንድ ቃል ፈተና አዘጋጅ)
              </span>
              <span className="text-stone-300">•</span>
              <span className="text-xs font-semibold text-stone-600 font-amharic">
                {schoolProfile.schoolName}
              </span>
            </div>
            <h2 className="text-xl font-black text-stone-900 mt-0.5">
              1-Word or Topic Assessment Generator
            </h2>
            <p className="text-xs text-stone-500">
              Type any word, concept, or lesson title to create an official classroom exam with multiple choice, matching, and answer key in seconds.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSchoolSettings}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl transition"
            title="Edit School / Workplace branding"
          >
            <School className="w-3.5 h-3.5" />
            <span>የትምህርት ቤት ስም ቀይር (Edit School)</span>
          </button>

          <button
            onClick={onOpenKeyboard}
            className="px-3.5 py-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition border border-stone-300"
          >
            ⌨️ Fidel Pad
          </button>
        </div>
      </div>

      {/* Main Generator Form */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-5 no-print">
        {/* Step 1: Word or Topic Input */}
        <div>
          <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
            1. ቃሉን ወይም የትምህርቱን ርዕስ ያስገቡ (Type a Word or Lesson Topic) *
          </label>
          <div className="relative">
            <input
              type="text"
              value={wordOrTopic}
              onChange={(e) => setWordOrTopic(e.target.value)}
              placeholder="e.g. Photosynthesis, Fractions, Simple Present Tense, ውሃ ዑደት, ቅጽሎች..."
              className="w-full px-4 py-3.5 text-base font-semibold bg-amber-50/40 border-2 border-amber-400/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-600 transition"
            />
          </div>
        </div>

        {/* Quick topic buttons based on selected subject */}
        {quickIdeas.length > 0 && (
          <div>
            <span className="text-[11px] font-semibold text-stone-500 block mb-1.5">
              ተወዳጅ የትምህርት ርዕሶች ለ {currentSubjectObj?.nameAm} (Quick Ideas):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickIdeas.map((idea, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setWordOrTopic(idea.topic);
                    setGradeLevel(idea.grade);
                  }}
                  className="px-3 py-1 bg-stone-50 hover:bg-amber-50 hover:border-amber-300 border border-stone-200 text-stone-700 rounded-xl text-xs transition font-medium"
                >
                  {idea.topic} <span className="text-[10px] text-stone-400">({idea.grade})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ethiopian Curriculum Language Policy Indicator */}
        <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          curriculumRule.language === 'Amharic'
            ? 'bg-amber-50/90 border-amber-300 text-amber-950'
            : 'bg-blue-50/90 border-blue-300 text-blue-950'
        }`}>
          <div className="flex items-start gap-2.5">
            <span className="text-xl mt-0.5">{curriculumRule.language === 'Amharic' ? '🇪🇹' : '🇬🇧'}</span>
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
              <p className="text-xs font-medium mt-0.5 leading-relaxed">
                {curriculumRule.ruleDescriptionAm}
              </p>
            </div>
          </div>
        </div>

        {/* Step 2: Subject, Grade, Language, & Count */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-stone-100">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              የትምህርቱ አይነት (Subject)
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {ETHIOPIAN_PRIMARY_SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.nameEn} ({s.nameAm})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              የክፍል ደረጃ (Grade Level)
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {PRIMARY_GRADES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nameEn} ({g.nameAm})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              የፈተናው ቋንቋ (Quiz Language)
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            >
              <option value="Amharic">
                አማርኛ (Amharic) {curriculumRule.language === 'Amharic' ? '★ MoE Rule' : ''}
              </option>
              <option value="English">
                English (እንግሊዝኛ) {curriculumRule.language === 'English' ? '★ MoE Rule' : ''}
              </option>
              <option value="Bilingual">Bilingual (አማርኛ + English)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              የጥያቄዎች ብዛት (Question Count)
            </label>
            <select
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value={5}>5 Questions (ፈጣን ምልከታ)</option>
              <option value={10}>10 Questions (መደበኛ ፈተና)</option>
              <option value={15}>15 Questions (የምዕራፍ ፈተና)</option>
            </select>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
            {errorMessage}
          </div>
        )}

        <div className="pt-2 flex items-center justify-between">
          <div className="text-xs text-stone-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Branded for: <strong>{schoolProfile.schoolName}</strong></span>
          </div>

          <button
            onClick={() => handleGenerate()}
            disabled={loading || !wordOrTopic.trim()}
            className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-2xl transition shadow-lg shadow-amber-600/25 disabled:opacity-50 text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>ፈተናው እየተዘጋጀ ነው (Generating Quiz)...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>ፈተናውን አዘጋጅ (Generate Quiz Now)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Quiz Output Area */}
      {quizContent && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden printable-area">
          {/* Top Actions Bar (Hidden when printing) */}
          <div className="bg-stone-50 border-b border-stone-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="font-bold text-stone-800 text-sm">ፈተናው ዝግጁ ነው (Assessment Ready)</span>
              <span className="text-xs text-stone-500">
                ({currentSubjectObj?.nameEn} • {gradeLevel} • {numQuestions} Questions)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAnswerKey(!showAnswerKey)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl transition"
              >
                {showAnswerKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showAnswerKey ? 'Hide Answer Key (የተማሪ ኮፒ)' : 'Show Answer Key (የመምህር ኮፒ)'}</span>
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-xl transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition shadow-sm"
              >
                {saved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                <span>{saved ? 'Saved!' : 'Save Quiz'}</span>
              </button>

              <button
                onClick={() =>
                  exportTextOrQuizToDocx(
                    `${currentSubjectObj?.nameEn || subject} - ${wordOrTopic} Quiz`,
                    displayContent,
                    schoolProfile.schoolName
                  )
                }
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shadow-md shadow-blue-600/20"
                title="Download as Microsoft Word (.docx)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .Docx (ዎርድ)</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white rounded-xl transition shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Print Exam Paper</span>
              </button>
            </div>
          </div>

          {/* Authentic Ethiopian Primary Exam Paper */}
          <div className="p-6 md:p-10 space-y-6">
            <div className="border-b-2 border-stone-900 pb-5 text-center">
              <h2 className="text-xl md:text-2xl font-black font-amharic text-stone-900 tracking-wide">
                {schoolProfile.schoolName}
              </h2>
              {schoolProfile.amharicSchoolName && (
                <h3 className="text-base font-bold font-amharic text-stone-700 mt-0.5">
                  {schoolProfile.amharicSchoolName}
                </h3>
              )}
              {schoolProfile.woredaSubcity && (
                <p className="text-xs text-stone-500 mt-0.5">
                  {schoolProfile.woredaSubcity} {schoolProfile.cityRegion ? `• ${schoolProfile.cityRegion}` : ''}
                </p>
              )}

              <div className="mt-2 text-sm font-bold text-stone-800 uppercase tracking-wide">
                {currentSubjectObj?.nameEn} Assessment / Quiz on "{wordOrTopic}"
              </div>
              <div className="text-xs text-stone-500 font-medium">
                Grade: {gradeLevel} • Teacher: {schoolProfile.teacherName || 'Subject Teacher'}
              </div>

              {/* Student Header and Score Box */}
              <div className="mt-5 pt-3 border-t border-dashed border-stone-400 flex flex-wrap items-center justify-between text-xs text-stone-800 gap-3">
                <div className="text-left space-y-1.5 flex-1 min-w-[260px]">
                  <p>Student Name (የተማሪው ስም): ________________________________________</p>
                  <p>Grade / Section (ክፍል/ሴክሽን): ____________  Date (ቀን): __________________</p>
                </div>
                <div className="border-2 border-stone-900 px-5 py-2.5 text-center rounded-xl bg-stone-50">
                  <span className="block text-[10px] text-stone-500 uppercase font-sans font-bold">Total Score</span>
                  <span className="text-xl font-black font-sans">___ / 100</span>
                </div>
              </div>
            </div>

            {/* Questions Body */}
            <div className="prose prose-stone max-w-none leading-relaxed text-stone-900 whitespace-pre-wrap text-sm md:text-base font-sans">
              {displayContent}
            </div>

            {/* School Motto footer */}
            {schoolProfile.motto && (
              <div className="pt-6 border-t border-stone-200 text-xs text-center text-stone-500 italic">
                "{schoolProfile.motto}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
