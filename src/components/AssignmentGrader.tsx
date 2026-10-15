import React, { useState } from 'react';
import { CheckCircle2, Sparkles, Copy, Check, Bookmark, Loader2, Award, AlertCircle, Download } from 'lucide-react';
import { SavedMaterial } from '../types';
import { exportTextOrQuizToDocx } from '../utils/docxExport';

interface AssignmentGraderProps {
  onSaveToLibrary: (item: Omit<SavedMaterial, 'id' | 'createdAt'>) => void;
  onOpenKeyboard: () => void;
}

const SAMPLE_STUDENT_SUBMISSIONS = [
  {
    label: 'ደብዳቤ ለጓደኛ (Letter with common spelling errors)',
    prompt: 'ለጓደኛህ ስለ ትምህርት ቤትህ አጭር ደብዳቤ ጻፍ',
    grade: 'Grade 4-5',
    text: 'ሰላም ዮናስ እንዴት ነህ? እኔ በጣም ደና ነኝ። ትምህርት ቤቴ አሪፍ ነው። በትምህርት ቤቴ ብዙ ጓደኛ አለኝ። መምህራችን ሀበሻ ታሪክ ያስተምረናል። በሳምንቱ መጨረሻ ወደ ቤተመጻህፍት ሄጃለው።',
  },
  {
    label: 'ስለ ቅዳሜና እሁድ (Weekend essay - diaspora beginner)',
    prompt: 'ቅዳሜና እሁድ ምን እንዳደረግክ ግለጽ',
    grade: 'Diaspora Beginner',
    text: 'በቅዳሜ እኔና እህቴ እግር ኳስ ተጫወተን። ከዛ ወደ ገበያ ሄደን ምግብ በላን። አባቴ መኪና ነዳ። እሁድ ቀን ቤተክርስትያን ሄጄ ጸሎት ጸለየሁ።',
  },
];

export const AssignmentGrader: React.FC<AssignmentGraderProps> = ({ onSaveToLibrary, onOpenKeyboard }) => {
  const [studentText, setStudentText] = useState(SAMPLE_STUDENT_SUBMISSIONS[0].text);
  const [assignmentPrompt, setAssignmentPrompt] = useState(SAMPLE_STUDENT_SUBMISSIONS[0].prompt);
  const [gradeLevel, setGradeLevel] = useState(SAMPLE_STUDENT_SUBMISSIONS[0].grade);

  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGrade = async () => {
    if (!studentText.trim()) return;

    setLoading(true);
    setErrorMessage(null);
    setSaved(false);

    try {
      const res = await fetch('/api/grade-student-work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentText,
          assignmentPrompt,
          gradeLevel,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.content) {
        setEvaluation(data.content);
      } else {
        throw new Error('No feedback returned');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to analyze text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!evaluation) return;
    navigator.clipboard.writeText(evaluation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!evaluation) return;
    onSaveToLibrary({
      type: 'feedback',
      title: `ግምገማ: ${assignmentPrompt.slice(0, 35)}`,
      preview: evaluation.slice(0, 140) + '...',
      content: evaluation,
      gradeLevel,
      tags: ['Grading', 'Feedback', gradeLevel],
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-stone-900">የተማሪ ጽሁፍ ገምጋሚ (Assignment & Essay Grader)</h2>
            </div>
            <p className="text-sm text-stone-500 mt-1">
              AI pedagogical feedback assistant for teachers and students: detects Fidel spelling mistakes, analyzes syntax, offers corrected text, and assigns rubric scores.
            </p>
          </div>

          <button
            onClick={onOpenKeyboard}
            className="self-start md:self-auto px-3.5 py-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition border border-stone-300"
          >
            ⌨️ የአማርኛ ኪቦርድ (Fidel Pad)
          </button>
        </div>

        {/* Sample Submissions */}
        <div className="mt-4 pt-4 border-t border-stone-100">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">
            የናሙና የተማሪ ጽሁፎች (Try Sample Submissions):
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_STUDENT_SUBMISSIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setStudentText(s.text);
                  setAssignmentPrompt(s.prompt);
                  setGradeLevel(s.grade);
                }}
                className="px-3 py-1.5 text-xs rounded-xl bg-stone-50 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-300 border border-stone-200 text-stone-700 transition"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-4 no-print">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              የቤት ስራው ወይም የጽሁፉ ርዕስ (Assignment Prompt / Objective)
            </label>
            <input
              type="text"
              value={assignmentPrompt}
              onChange={(e) => setAssignmentPrompt(e.target.value)}
              placeholder="e.g. ስለ ከተማህ ወይም ቤተሰብህ 5 ዓረፍተ ነገር ጻፍ..."
              className="w-full px-4 py-2.5 text-sm font-amharic bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              የተማሪው የክፍል ደረጃ (Target Grade Level)
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            >
              <option value="Primary Grade 1-2">Primary Grade 1-2 (መነሻ ፊደላት)</option>
              <option value="Grade 3-4">Grade 3-4</option>
              <option value="Grade 5-6 (Middle School)">Grade 5-6 (Middle School)</option>
              <option value="Grade 7-8">Grade 7-8</option>
              <option value="High School (Grade 9-12)">High School (Grade 9-12)</option>
              <option value="Diaspora Beginner">Diaspora Beginner (ጀማሪ)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            የተማሪው ጽሁፍ (Paste Student's Amharic Text)
          </label>
          <textarea
            rows={5}
            value={studentText}
            onChange={(e) => setStudentText(e.target.value)}
            placeholder="የተማሪውን ጽሁፍ እዚህ ይለጥፉ..."
            className="w-full px-4 py-3 text-sm font-amharic bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none leading-relaxed"
          />
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
            {errorMessage}
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleGrade}
            disabled={loading || !studentText.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>ጽሁፉ እየታረመ እና እየተገመገመ ነው (Grading & Reviewing)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>ጽሁፉን ገምግም (Grade & Give Feedback)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Evaluation Output */}
      {evaluation && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden printable-area">
          <div className="bg-stone-50 border-b border-stone-200 px-6 py-3 flex items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="font-bold text-stone-800 text-sm">የመምህሩ ግምገማ እና እርማት (Teacher's Feedback & Rubric)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-lg transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg transition"
              >
                {saved ? <Check className="w-4 h-4 text-emerald-600" /> : <Bookmark className="w-4 h-4 text-emerald-700" />}
                <span>{saved ? 'Saved!' : 'Save'}</span>
              </button>

              <button
                onClick={() => exportTextOrQuizToDocx(`Feedback - ${assignmentPrompt}`, evaluation)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-md shadow-blue-600/20"
                title="Download as Microsoft Word document (.docx)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .Docx (ዎርድ)</span>
              </button>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div className="border-b border-stone-200 pb-4">
              <h3 className="text-xl font-bold font-amharic text-stone-900">
                የተማሪው ጽሁፍ ግምገማ ሪፖርት
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                ርዕስ: {assignmentPrompt} • ደረጃ: {gradeLevel}
              </p>
            </div>

            <div className="prose prose-stone max-w-none font-amharic leading-relaxed text-stone-800 whitespace-pre-wrap text-sm md:text-base">
              {evaluation}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
