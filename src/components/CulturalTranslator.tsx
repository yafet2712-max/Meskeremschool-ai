import React, { useState } from 'react';
import { Languages, Sparkles, Copy, Check, Bookmark, Loader2, Volume2, ArrowRightLeft } from 'lucide-react';
import { playAmharicAudio } from '../utils/audio';
import { SavedMaterial } from '../types';
import { COMMON_PROVERBS } from '../data/fidelData';

interface CulturalTranslatorProps {
  onSaveToLibrary: (item: Omit<SavedMaterial, 'id' | 'createdAt'>) => void;
  onOpenKeyboard: () => void;
}

const COMMON_CULTURAL_PHRASES = [
  { text: 'እንኳን ደህና መጣችሁ፣ ቤታችን ክፍት ነው!', label: 'Hospitality / የእንግዳ አቀባበል' },
  { text: 'ጤና ይስጥልኝ እንደምን አደሩ? አባቴ ደህና ናቸው?', label: 'Respectful Elder Greeting / የአክብሮት ሰላምታ' },
  { text: 'ድር ቢያብር አንበሳ ያስር።', label: 'Ethiopian Proverb on Unity' },
  { text: 'ትምህርት የብርሃን ቁልፍ ነው።', label: 'Education is the key to light' },
];

export const CulturalTranslator: React.FC<CulturalTranslatorProps> = ({ onSaveToLibrary, onOpenKeyboard }) => {
  const [text, setText] = useState('እንኳን ደህና መጣችሁ፣ ቡናችንን አብረን እንጠጣ!');
  const [direction, setDirection] = useState<'Amharic to English' | 'English to Amharic'>('Amharic to English');
  const [includeProverbs, setIncludeProverbs] = useState(true);

  const [loading, setLoading] = useState(false);
  const [translationResult, setTranslationResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTranslate = async (overrideText?: string) => {
    const activeText = overrideText || text;
    if (!activeText.trim()) return;

    setLoading(true);
    setErrorMessage(null);
    setSaved(false);

    try {
      const res = await fetch('/api/translate-cultural', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: activeText,
          direction,
          includeProverbs,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.content) {
        setTranslationResult(data.content);
      } else {
        throw new Error('No translation returned');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to translate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwapDirection = () => {
    setDirection((prev) =>
      prev === 'Amharic to English' ? 'English to Amharic' : 'Amharic to English'
    );
  };

  const handleCopy = () => {
    if (!translationResult) return;
    navigator.clipboard.writeText(translationResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!translationResult) return;
    onSaveToLibrary({
      type: 'translation',
      title: `ትርጉም: ${text.slice(0, 35)}`,
      preview: translationResult.slice(0, 140) + '...',
      content: translationResult,
      tags: ['Translation', direction],
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePronounce = () => {
    if (!text.trim()) return;
    playAmharicAudio(text, setIsPlayingAudio);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2.5 bg-teal-100 text-teal-800 rounded-xl">
                <Languages className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-stone-900">ባህል እና ተርጓሚ (Cultural Nuance & Proverb Bridge)</h2>
            </div>
            <p className="text-sm text-stone-500 mt-1">
              Go beyond literal translation: explore Ethiopian cultural context, honorific registers, equivalent proverbs, and phonetic pronunciation.
            </p>
          </div>

          <button
            onClick={onOpenKeyboard}
            className="self-start md:self-auto px-3.5 py-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition border border-stone-300"
          >
            ⌨️ የአማርኛ ኪቦርድ (Fidel Pad)
          </button>
        </div>

        {/* Phrases Quick Links */}
        <div className="mt-4 pt-4 border-t border-stone-100">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">
            ተወዳጅ አገላለጾች (Sample Cultural Phrases):
          </span>
          <div className="flex flex-wrap gap-2">
            {COMMON_CULTURAL_PHRASES.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setText(item.text);
                  handleTranslate(item.text);
                }}
                className="px-3 py-1.5 text-xs rounded-xl bg-stone-50 hover:bg-teal-50 hover:border-teal-300 border border-stone-200 text-stone-700 transition font-amharic"
              >
                {item.text} <span className="text-[10px] text-stone-400">({item.label})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Translation Input Area */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-4 no-print">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              አቅጣጫ (Direction):
            </span>
            <span className="px-3 py-1 bg-teal-50 text-teal-900 font-semibold text-xs rounded-lg border border-teal-200">
              {direction}
            </span>
          </div>

          <button
            onClick={handleSwapDirection}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>ቀይር (Swap)</span>
          </button>
        </div>

        <div className="relative">
          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              direction === 'Amharic to English'
                ? 'የሚተረጎመውን የአማርኛ ጽሁፍ እዚህ ይጻፉ ወይም ይለጥፉ...'
                : 'Enter English text to translate with cultural and grammatical context...'
            }
            className="w-full px-4 py-3 text-sm font-amharic bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 resize-none leading-relaxed"
          />

          <button
            onClick={handlePronounce}
            disabled={isPlayingAudio || !text.trim()}
            className="absolute bottom-3 right-3 p-2 bg-white hover:bg-teal-50 text-stone-600 hover:text-teal-700 rounded-lg border border-stone-200 shadow-sm transition"
            title="Pronounce Amharic text"
          >
            <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce text-teal-600' : ''}`} />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              checked={includeProverbs}
              onChange={(e) => setIncludeProverbs(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
            />
            <span>ተዛማጅ ምሳሌያዊ አነጋገሮችን አያይዝ (Include matching Ethiopian proverbs)</span>
          </label>

          <button
            onClick={() => handleTranslate()}
            disabled={loading || !text.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-xl transition shadow-md shadow-teal-700/20 disabled:opacity-50 text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>እየተተረጎመ ነው (Translating with Culture)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>ተርጉም እና አብራራ (Translate & Explain)</span>
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

      {/* Result Display */}
      {translationResult && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden printable-area">
          <div className="bg-stone-50 border-b border-stone-200 px-6 py-3 flex items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
              <span className="font-bold text-stone-800 text-sm">የትርጉም እና የባህል ማብራሪያ (Translation Result)</span>
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
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 rounded-lg transition"
              >
                {saved ? <Check className="w-4 h-4 text-emerald-600" /> : <Bookmark className="w-4 h-4 text-teal-700" />}
                <span>{saved ? 'Saved!' : 'Save'}</span>
              </button>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-4">
            <div className="prose prose-stone max-w-none font-amharic leading-relaxed text-stone-800 whitespace-pre-wrap text-sm md:text-base">
              {translationResult}
            </div>
          </div>
        </div>
      )}

      {/* Proverb Spotlight */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 p-5 rounded-2xl no-print">
        <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">
          የዛሬው ምሳሌያዊ አነጋገር (Proverb Spotlight):
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {COMMON_PROVERBS.slice(0, 4).map((p, idx) => (
            <div key={idx} className="bg-white/90 p-3 rounded-xl border border-amber-200/50">
              <div className="font-amharic font-bold text-stone-900 text-sm mb-0.5">{p.amharic}</div>
              <div className="text-stone-500 italic mb-1">{p.phonetic}</div>
              <div className="text-stone-700 font-medium">{p.english}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
