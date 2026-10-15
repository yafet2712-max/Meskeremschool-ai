import React, { useState } from 'react';
import { BookOpenText, Sparkles, Printer, Copy, Check, Bookmark, Loader2, Volume2, Play, Square, Download } from 'lucide-react';
import { playAmharicAudio } from '../utils/audio';
import { SavedMaterial } from '../types';
import { exportTextOrQuizToDocx } from '../utils/docxExport';

interface StoryGeneratorProps {
  onSaveToLibrary: (item: Omit<SavedMaterial, 'id' | 'createdAt'>) => void;
  onOpenKeyboard: () => void;
}

const STORY_PRESETS = [
  {
    theme: 'የብልህ ጥንቸል እና የጅብ ተረት (The Clever Rabbit and the Hyena)',
    moral: 'ብልጠት ከጉልበት ይበልጣል (Wisdom triumphs over brute force)',
    level: 'Beginner / Children',
  },
  {
    theme: 'የኢትዮጵያ የቡና ማፍላት ሥርዓት (The Traditional Ethiopian Coffee Ceremony)',
    moral: 'የቤተሰብ ፍቅር፣ መስተንግዶ እና አብሮነት (Hospitality, family love and unity)',
    level: 'Intermediate / Diaspora Learners',
  },
  {
    theme: 'የላልይበላ ድንቅ ውቅር አብያተ ክርስቲያናት (The Wonders of Lalibela)',
    moral: 'የሀገር ፍቅር፣ የጥንት ጥበብ እና ታሪክን ማክበር (Pride in cultural heritage and history)',
    level: 'Grade 6-8',
  },
  {
    theme: 'የአንበሳ እና የመዳፊት ጓደኝነት (The Lion and the Mouse in the Ethiopian Highlands)',
    moral: 'ትንሹም ሰው ቢሆን ትልቅ ውለታ ሊውል ይችላል (Kindness is never wasted)',
    level: 'Primary Grade 2-4',
  },
];

export const StoryGenerator: React.FC<StoryGeneratorProps> = ({ onSaveToLibrary, onOpenKeyboard }) => {
  const [storyTheme, setStoryTheme] = useState('የብልህ ጥንቸል እና የጅብ ተረት (The Clever Rabbit and the Hyena)');
  const [targetAudience, setTargetAudience] = useState('Primary School (Grade 3-5)');
  const [moralLesson, setMoralLesson] = useState('ብልጠት እና እውነት ሁልጊዜ ያሸንፋሉ (Wisdom and truth always win)');
  const [difficulty, setDifficulty] = useState('Intermediate (መካከለኛ)');

  const [loading, setLoading] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = async (presetTheme?: string, presetMoral?: string) => {
    const activeTheme = presetTheme || storyTheme;
    const activeMoral = presetMoral || moralLesson;

    setLoading(true);
    setErrorMessage(null);
    setSaved(false);

    try {
      const res = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyTheme: activeTheme,
          targetAudience,
          moralLesson: activeMoral,
          difficulty,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.content) {
        setGeneratedStory(data.content);
      } else {
        throw new Error('No story content returned');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to generate story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedStory) return;
    navigator.clipboard.writeText(generatedStory);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!generatedStory) return;
    onSaveToLibrary({
      type: 'story',
      title: `ተረት/ምንባብ: ${storyTheme.slice(0, 40)}`,
      preview: generatedStory.slice(0, 140) + '...',
      content: generatedStory,
      tags: ['Story', difficulty, targetAudience],
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReadAloud = () => {
    if (!generatedStory) return;
    // Extract first 2-3 paragraphs for speech
    const paragraphs = generatedStory.split('\n\n').filter(p => p.trim() && !p.startsWith('#') && !p.includes('Vocabulary') && !p.includes('ጥያቄዎች'));
    const readingSnippet = paragraphs.slice(0, 2).join(' ').slice(0, 350) || generatedStory.slice(0, 300);
    playAmharicAudio(readingSnippet, setIsPlayingAudio);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                <BookOpenText className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-stone-900">የንባብ ምንባብ እና ተረቶች (Amharic Stories & Folktales)</h2>
            </div>
            <p className="text-sm text-stone-500 mt-1">
              Create captivating Ethiopian fables, cultural stories, reading comprehension questions, and vocabulary glossaries with audio narration.
            </p>
          </div>

          <button
            onClick={onOpenKeyboard}
            className="self-start md:self-auto px-3.5 py-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition border border-stone-300"
          >
            ⌨️ የአማርኛ ኪቦርድ (Fidel Pad)
          </button>
        </div>

        {/* Story Presets */}
        <div className="mt-4 pt-4 border-t border-stone-100">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">
            ተወዳጅ ተረቶች እና ጭብጦች (Popular Fables & Themes):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {STORY_PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setStoryTheme(p.theme);
                  setMoralLesson(p.moral);
                  handleGenerate(p.theme, p.moral);
                }}
                className="p-3 text-left rounded-xl bg-stone-50 hover:bg-amber-50 hover:border-amber-300 border border-stone-200 transition group"
              >
                <div className="font-amharic font-bold text-xs text-stone-800 group-hover:text-amber-900">
                  {p.theme}
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">ምክር: {p.moral}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form Controls */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-4 no-print">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              የተረቱ / ምንባቡ ጭብጥ (Story Theme / Topic)
            </label>
            <input
              type="text"
              value={storyTheme}
              onChange={(e) => setStoryTheme(e.target.value)}
              className="w-full px-4 py-2.5 text-sm font-amharic bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              የተረቱ ቁምነገር (Moral of the Story)
            </label>
            <input
              type="text"
              value={moralLesson}
              onChange={(e) => setMoralLesson(e.target.value)}
              placeholder="e.g. ታማኝነት፣ ታታሪነት፣ የአገር ፍቅር..."
              className="w-full px-4 py-2.5 text-sm font-amharic bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              የአንባቢው ደረጃ (Target Audience)
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            >
              <option value="Early Childhood / Pre-K (ህፃናት)">Early Childhood / Pre-K (ህፃናት)</option>
              <option value="Primary School (Grade 1-3 - መጀመሪያ ደረጃ)">Primary School (Grade 1-3 - መጀመሪያ ደረጃ)</option>
              <option value="Primary School (Grade 4-6)">Primary School (Grade 4-6)</option>
              <option value="Middle School (Grade 7-8)">Middle School (Grade 7-8)</option>
              <option value="High School & Adults (፱ኛ-፲፪ኛ ክፍል)">High School & Adults (፱ኛ-፲፪ኛ ክፍል)</option>
              <option value="Diaspora Learners (የዲያስፖራ ተማሪዎች)">Diaspora Learners (የዲያስፖራ ተማሪዎች)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              የቋንቋ ከበድነት (Difficulty Level)
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            >
              <option value="Beginner (ቀላል አጫጭር ዓረፍተ ነገሮች)">Beginner (ቀላል አጫጭር ዓረፍተ ነገሮች)</option>
              <option value="Intermediate (መካከለኛ - መደበኛ ቃላት)">Intermediate (መካከለኛ - መደበኛ ቃላት)</option>
              <option value="Advanced (ከፍተኛ - ጥልቅ ዘይቤያዊ ቋንቋ)">Advanced (ከፍተኛ - ጥልቅ ዘይቤያዊ ቋንቋ)</option>
            </select>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
            {errorMessage}
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => handleGenerate()}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition shadow-md shadow-amber-600/20 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>ተረቱ እየተጻፈ ነው (Writing Story)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>ተረት እና ምንባብ ጻፍ (Generate Story)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Story Output Area */}
      {generatedStory && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden printable-area">
          <div className="bg-stone-50 border-b border-stone-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="font-bold text-stone-800 text-sm">የንባብ ምንባብ ተዘጋጅቷል (Story Passage Ready)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReadAloud}
                disabled={isPlayingAudio}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg transition"
              >
                <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce text-amber-600' : ''}`} />
                <span>{isPlayingAudio ? 'Playing...' : 'Read Aloud (አድምጥ)'}</span>
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-lg transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg transition"
              >
                {saved ? <Check className="w-4 h-4 text-emerald-600" /> : <Bookmark className="w-4 h-4 text-amber-700" />}
                <span>{saved ? 'Saved!' : 'Save'}</span>
              </button>

              <button
                onClick={() => exportTextOrQuizToDocx(storyTheme, generatedStory)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-md shadow-blue-600/20"
                title="Download as Microsoft Word document (.docx)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .Docx (ዎርድ)</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white rounded-lg transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Story</span>
              </button>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div className="border-b border-stone-200 pb-4 text-center">
              <h2 className="text-2xl font-black font-amharic text-amber-950">
                {storyTheme}
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                ደረጃ: {targetAudience} • ከበድነት: {difficulty}
              </p>
            </div>

            <div className="prose prose-stone max-w-none font-amharic leading-relaxed text-stone-800 whitespace-pre-wrap text-sm md:text-base">
              {generatedStory}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
