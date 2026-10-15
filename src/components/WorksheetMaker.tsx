import React, { useState } from 'react';
import { FileText, Sparkles, Printer, Copy, Check, Bookmark, Loader2, Eye, EyeOff, School, Download } from 'lucide-react';
import { SavedMaterial, SchoolProfile } from '../types';
import { ETHIOPIAN_PRIMARY_SUBJECTS, PRIMARY_GRADES, QUICK_SAMPLE_TOPICS_BY_SUBJECT } from '../data/subjects';
import { exportTextOrQuizToDocx } from '../utils/docxExport';
import { getEthiopianCurriculumLanguage } from '../utils/curriculumLanguage';

interface WorksheetMakerProps {
  schoolProfile: SchoolProfile;
  onSaveToLibrary: (item: Omit<SavedMaterial, 'id' | 'createdAt'>) => void;
  onOpenKeyboard: () => void;
  onOpenSchoolSettings: () => void;
}

const QUESTION_TYPES = [
  { id: 'multiple_choice', label: 'ባለብዙ ምርጫ (Multiple Choice - A, B, C, D / ሀ፣ ለ፣ ሐ፣ መ)' },
  { id: 'fill_blanks', label: 'ክፍት ቦታ ሙላ (Fill in the blanks)' },
  { id: 'matching', label: 'አዛምድ (Matching Columns)' },
  { id: 'true_false', label: 'እውነት ወይም ሐሰት (True or False)' },
  { id: 'short_answer', label: 'አጭር መልስ (Short Answer Questions)' },
];

export const WorksheetMaker: React.FC<WorksheetMakerProps> = ({
  schoolProfile,
  onSaveToLibrary,
  onOpenKeyboard,
  onOpenSchoolSettings,
}) => {
  const [subject, setSubject] = useState('english');
  const [title, setTitle] = useState('English Mid-Term Assessment / የፈተና ወረቀት');
  const [gradeLevel, setGradeLevel] = useState('Grade 4');
  const [topic, setTopic] = useState('Simple Present Tense & Daily Routines');
  const [numQuestions, setNumQuestions] = useState(10);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    'multiple_choice',
    'fill_blanks',
    'true_false',
  ]);
  const [includePhonetics, setIncludePhonetics] = useState(false);
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);

  // Curriculum language policy based on selected subject and grade
  const curriculumRule = getEthiopianCurriculumLanguage(subject, gradeLevel);
  const [languageMode, setLanguageMode] = useState<string>(curriculumRule.language);

  React.useEffect(() => {
    setLanguageMode(curriculumRule.language);
  }, [subject, gradeLevel]);

  const [loading, setLoading] = useState(false);
  const [generatedWorksheet, setGeneratedWorksheet] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAnswerKey, setShowAnswerKey] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentSubjectObj = ETHIOPIAN_PRIMARY_SUBJECTS.find((s) => s.id === subject);

  const toggleType = (id: string) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (selectedTypes.length === 0) {
      setErrorMessage('Please select at least one question type (ቢያንስ አንድ የጥያቄ ዓይነት ይምረጡ).');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSaved(false);

    try {
      const res = await fetch('/api/generate-worksheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subject: currentSubjectObj?.nameEn || subject,
          gradeLevel,
          topic,
          numQuestions,
          questionTypes: selectedTypes.map((id) => QUESTION_TYPES.find((q) => q.id === id)?.label || id),
          includePhonetics,
          includeAnswerKey: true,
          schoolProfile,
          language: languageMode,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.content) {
        setGeneratedWorksheet(data.content);
      } else {
        throw new Error('No content returned from AI');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to generate worksheet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedWorksheet) return;
    navigator.clipboard.writeText(generatedWorksheet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!generatedWorksheet) return;
    onSaveToLibrary({
      type: 'worksheet',
      title: `${currentSubjectObj?.nameEn || subject}: ${title.slice(0, 35)}`,
      preview: generatedWorksheet.slice(0, 140) + '...',
      content: generatedWorksheet,
      gradeLevel,
      subject: currentSubjectObj?.nameEn,
      schoolName: schoolProfile.schoolName,
      tags: ['Worksheet', subject, gradeLevel, `${numQuestions} Questions`],
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  let displayContent = generatedWorksheet || '';
  if (generatedWorksheet && !showAnswerKey) {
    const keyIndex = generatedWorksheet.search(/\[ANSWER KEY|የመልስ ቁልፍ|## ANSWER KEY|## የመልስ/i);
    if (keyIndex !== -1) {
      displayContent = generatedWorksheet.slice(0, keyIndex).trim();
    }
  }

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xl shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Classroom Exam & Worksheet Maker
                </span>
                <span className="text-stone-300">•</span>
                <span className="text-xs font-semibold text-stone-600 font-amharic">
                  {schoolProfile.schoolName}
                </span>
              </div>
              <h2 className="text-xl font-black text-stone-900 mt-0.5">
                የፈተና እና መልመጃ አዘጋጅ (Worksheet & Exam Maker)
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Build detailed student assessment papers for any Ethiopian primary subject with customizable sections and student headers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={onOpenSchoolSettings}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl transition"
              title="Change workplace / school branding"
            >
              <School className="w-3.5 h-3.5" />
              <span>የትምህርት ቤት ስም (School Settings)</span>
            </button>
            <button
              onClick={onOpenKeyboard}
              className="px-3.5 py-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition border border-stone-300"
            >
              ⌨️ Fidel Pad
            </button>
          </div>
        </div>

        {/* Subject Picker */}
        <div className="mt-5 pt-4 border-t border-stone-100">
          <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
            የትምህርቱ አይነት ምረጡ (Subject):
          </label>
          <div className="flex flex-wrap gap-1.5">
            {ETHIOPIAN_PRIMARY_SUBJECTS.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSubject(s.id);
                  const presets = QUICK_SAMPLE_TOPICS_BY_SUBJECT[s.id];
                  if (presets && presets[0]) {
                    setTopic(presets[0].topic);
                    setGradeLevel(presets[0].grade);
                    setTitle(`${s.nameEn} Classroom Assessment`);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  subject === s.id
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'bg-stone-50 hover:bg-blue-50 text-stone-700 border border-stone-200'
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.nameEn}</span>
                <span className="font-amharic text-[11px] opacity-80">({s.nameAm})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form Controls */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-sm space-y-4 no-print">
        {/* Ethiopian Curriculum Language Policy Indicator */}
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
            <span className="text-xs font-semibold text-stone-700">የፈተናው ቋንቋ፦</span>
            <select
              value={languageMode}
              onChange={(e) => setLanguageMode(e.target.value)}
              className="px-2 py-1 text-xs font-bold bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Amharic">አማርኛ (Amharic)</option>
              <option value="English">English</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              የፈተናው / መልመጃው ርዕስ (Assessment Title) *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              የትምህርቱ ይዘት (Topic / Unit) *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              የክፍል ደረጃ (Grade Level)
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              የጥያቄዎች ብዛት (Number of Questions)
            </label>
            <select
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 Questions (Short Quiz)</option>
              <option value={8}>8 Questions (Regular Test)</option>
              <option value={10}>10 Questions (Standard Exam)</option>
              <option value={15}>15 Questions (Mid-Term Exam)</option>
              <option value={20}>20 Questions (Final Exam)</option>
            </select>
          </div>
        </div>

        {/* Question Types Checkboxes */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            የጥያቄ ዓይነቶች ምረጥ (Select Question Formats):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {QUESTION_TYPES.map((t) => {
              const checked = selectedTypes.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleType(t.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs text-left transition ${
                    checked
                      ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                      checked ? 'bg-blue-600 border-blue-600 text-white' : 'border-stone-400 bg-white'
                    }`}
                  >
                    {checked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="font-amharic">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              checked={includeAnswerKey}
              onChange={(e) => setIncludeAnswerKey(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span>Include Answer Key for teachers (የመምህር የመልስ ቁልፍ)</span>
          </label>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
            {errorMessage}
          </div>
        )}

        <div className="pt-2 flex items-center justify-between">
          <div className="text-xs text-stone-500">
            School: <strong>{schoolProfile.schoolName}</strong>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition shadow-lg shadow-blue-600/25 disabled:opacity-50 text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>ፈተናው እየተዘጋጀ ነው (Generating Assessment)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>ፈተና አዘጋጅ (Generate Assessment)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Worksheet Output Area */}
      {generatedWorksheet && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden printable-area">
          <div className="bg-stone-50 border-b border-stone-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="font-bold text-stone-800 text-sm">የፈተና ወረቀት ተዘጋጅቷል (Worksheet Ready)</span>
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
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shadow-sm"
              >
                {saved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                <span>{saved ? 'Saved!' : 'Save'}</span>
              </button>

              <button
                onClick={() =>
                  exportTextOrQuizToDocx(
                    `${currentSubjectObj?.nameEn || subject} - ${title}`,
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

          {/* Authentic Classroom Exam Paper Header */}
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

              <h1 className="text-xl font-bold font-amharic text-stone-900 mt-2">
                {title}
              </h1>
              <p className="text-xs text-stone-600 font-medium">
                Subject: {currentSubjectObj?.nameEn} ({currentSubjectObj?.nameAm}) • Grade: {gradeLevel} • Topic: {topic}
              </p>

              {/* Student Info & Score Mark Box */}
              <div className="mt-5 pt-3 border-t border-dashed border-stone-400 flex flex-wrap items-center justify-between text-xs text-stone-800 gap-3">
                <div className="text-left space-y-1.5 flex-1 min-w-[260px]">
                  <p>የተማሪው ስም (Student Name): ________________________________________</p>
                  <p>ክፍል / ሴክሽን (Section): ____________  ቀን (Date): ____________________</p>
                </div>
                <div className="border-2 border-stone-900 px-5 py-2.5 text-center rounded-xl bg-stone-50">
                  <span className="block text-[10px] text-stone-500 uppercase font-sans font-bold">ውጤት / Score</span>
                  <span className="text-xl font-black font-sans">___ / 100</span>
                </div>
              </div>
            </div>

            {/* Questions Body */}
            <div className="prose prose-stone max-w-none leading-relaxed text-stone-900 whitespace-pre-wrap text-sm md:text-base font-sans">
              {displayContent}
            </div>

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
