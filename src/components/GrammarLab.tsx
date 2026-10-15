import React, { useState } from 'react';
import { Compass, Sparkles, Copy, Check, Bookmark, Loader2, Volume2, HelpCircle, Download } from 'lucide-react';
import { playAmharicAudio } from '../utils/audio';
import { SavedMaterial } from '../types';
import { exportTextOrQuizToDocx } from '../utils/docxExport';

interface GrammarLabProps {
  onSaveToLibrary: (item: Omit<SavedMaterial, 'id' | 'createdAt'>) => void;
  onOpenKeyboard: () => void;
}

const COMMON_GRAMMAR_TOPICS = [
  {
    title: 'የግሥ እርባታ: መሄድ (To Go)',
    query: 'የግሥ እርባታ ለ "መሄድ" (To Go) በኃላፊ፣ አሁን፣ ትንቢት እና አሉታዊ መደቦች ከምሳሌዎች ጋር',
    category: 'የግሥ እርባታ (Verb Conjugation)'
  },
  {
    title: 'የ ሀ፣ ሐ እና ኀ ልዩነት',
    query: 'በ "ሀሌታው ሀ"፣ "ሐመሩ ሐ" እና "ኀብዙ ኀ" መካከል ያለው የድምፅ፣ የትርጉም እና የአጠቃቀም ልዩነት ከትክክለኛ ቃላት ምሳሌ ጋር',
    category: 'የፊደል ህግ (Orthography)'
  },
  {
    title: 'የ ሰ እና ሠ ልዩነት',
    query: 'በ "ንጉሡ ሰ" እና "ሠውቱ ሠ" መካከል ያለው ልዩነት (ለምሳሌ: ሰበረ vs ሠረቀ፣ ሰማይ vs ሠራዊት) እና የስህተት መከላከያ ዘዴዎች',
    category: 'የፊደል ህግ (Orthography)'
  },
  {
    title: 'የአማርኛ ስሞች ብዛት (Plurals)',
    query: 'የአማርኛ ስሞች ወደ ብዙ ቁጥር የሚቀየሩባቸው ሕጎች (-ኦች፣ -ዎች፣ -ያን፣ -ያት) ከልዩ ሁኔታዎች ጋር',
    category: 'ስሞች እና ቅጽሎች (Nouns & Plurals)'
  },
  {
    title: 'የመስተዋድድ አጠቃቀም (በ፣ ለ፣ ከ፣ ወደ)',
    query: 'የአማርኛ መስተዋድዳን (Prepositions: በ-፣ ለ-፣ ከ-፣ ወደ-፣ ስለ-፣ እንደ-) አጠቃቀም እና አያያዝ በአረፍተ ነገር ውስጥ',
    category: 'መስተዋድዳን (Prepositions)'
  },
  {
    title: 'የጨዋነት እና የአክብሮት አነጋገር',
    query: 'የአማርኛ የአክብሮት አነጋገር (Honorifics: እርስዎ፣ እርሳቸው) እና የግሦች እርባታ ከወጣቶች እና ተማሪዎች ጋር እንዴት ይተገበራል?',
    category: 'ማህበራዊ ሰዋሰው (Politeness & Respect)'
  },
];

export const GrammarLab: React.FC<GrammarLabProps> = ({ onSaveToLibrary, onOpenKeyboard }) => {
  const [query, setQuery] = useState('የግሥ እርባታ ለ "መብላት" (To Eat) በኃላፊ፣ አሁን እና ትንቢት ጊዜያት');
  const [category, setCategory] = useState('የግሥ እርባታ (Verb Conjugation)');
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExplain = async (customQuery?: string, customCategory?: string) => {
    const activeQuery = customQuery || query;
    const activeCategory = customCategory || category;

    if (!activeQuery.trim()) return;

    setLoading(true);
    setErrorMessage(null);
    setSaved(false);

    try {
      const res = await fetch('/api/explain-grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: activeQuery,
          category: activeCategory,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.content) {
        setExplanation(data.content);
      } else {
        throw new Error('No explanation returned');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to explain grammar concept. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!explanation) return;
    navigator.clipboard.writeText(explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!explanation) return;
    onSaveToLibrary({
      type: 'grammar',
      title: `ሰዋሰው: ${query.slice(0, 40)}`,
      preview: explanation.slice(0, 140) + '...',
      content: explanation,
      tags: ['Grammar', category],
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
              <span className="p-2.5 bg-purple-100 text-purple-800 rounded-xl">
                <Compass className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-stone-900">የሰዋሰው እና ፊደል ላብራቶሪ (Amharic Grammar & Verb Lab)</h2>
            </div>
            <p className="text-sm text-stone-500 mt-1">
              Deep pedagogical explanations of complex Amharic grammar rules, verb conjugation patterns, spelling nuances, and student mini-drills.
            </p>
          </div>

          <button
            onClick={onOpenKeyboard}
            className="self-start md:self-auto px-3.5 py-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition border border-stone-300"
          >
            ⌨️ የአማርኛ ኪቦርድ (Fidel Pad)
          </button>
        </div>

        {/* Common Grammar Quick Links */}
        <div className="mt-4 pt-4 border-t border-stone-100">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">
            ተደጋጋሚ የሰዋሰው ጥያቄዎች (Frequently Asked Rules):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {COMMON_GRAMMAR_TOPICS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(item.query);
                  setCategory(item.category);
                  handleExplain(item.query, item.category);
                }}
                className="p-3 text-left rounded-xl bg-stone-50 hover:bg-purple-50 hover:border-purple-300 border border-stone-200 transition group"
              >
                <div className="font-amharic font-bold text-xs text-stone-800 group-hover:text-purple-900">
                  {item.title}
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">{item.category}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Query Input */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-4 no-print">
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            የሰዋሰው ወይም የፊደል ጥያቄ (Ask Any Grammar, Verb, or Spelling Concept)
          </label>
          <textarea
            rows={3}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ለምሳሌ: የአማርኛ ግሦች እርባታ ለ'ማንበብ' ወይም በ'አ' እና 'ዐ' መካከል ያለው ልዩነት..."
            className="w-full px-4 py-3 text-sm font-amharic bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 resize-none"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-medium">ምድብ (Category):</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-700"
            >
              <option value="የግሥ እርባታ (Verb Conjugation)">የግሥ እርባታ (Verb Conjugation)</option>
              <option value="የፊደል ህግ (Orthography & Spelling)">የፊደል ህግ (Orthography & Spelling)</option>
              <option value="ስሞች እና ቅጽሎች (Nouns & Plurals)">ስሞች እና ቅጽሎች (Nouns & Plurals)</option>
              <option value="መስተዋድዳን (Prepositions)">መስተዋድዳን (Prepositions)</option>
              <option value="የአረፍተ ነገር አወቃቀር (Syntax)">የአረፍተ ነገር አወቃቀር (Syntax)</option>
            </select>
          </div>

          <button
            onClick={() => handleExplain()}
            disabled={loading || !query.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-xl transition shadow-md shadow-purple-700/20 disabled:opacity-50 text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>ማብራሪያው እየተዘጋጀ ነው (Analyzing Rule)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>ሰዋሰውን አብራራ (Explain Concept)</span>
              </>
            )}
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Explanation Output */}
      {explanation && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden printable-area">
          <div className="bg-stone-50 border-b border-stone-200 px-6 py-3 flex items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              <span className="font-bold text-stone-800 text-sm">የሰዋሰው ትንታኔ (Grammar Breakdown)</span>
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
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 rounded-lg transition"
              >
                {saved ? <Check className="w-4 h-4 text-emerald-600" /> : <Bookmark className="w-4 h-4 text-purple-700" />}
                <span>{saved ? 'Saved!' : 'Save'}</span>
              </button>

              <button
                onClick={() => exportTextOrQuizToDocx(`Grammar - ${query}`, explanation)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-md shadow-blue-600/20"
                title="Download as Microsoft Word document (.docx)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .Docx (ዎርድ)</span>
              </button>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-4">
            <div className="border-b border-stone-200 pb-3">
              <h3 className="text-lg font-bold font-amharic text-purple-950">
                ርዕሰ ጉዳይ: {query}
              </h3>
              <span className="text-xs text-stone-500 font-medium">ምድብ: {category}</span>
            </div>

            <div className="prose prose-stone max-w-none font-amharic leading-relaxed text-stone-800 whitespace-pre-wrap text-sm md:text-base">
              {explanation}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
