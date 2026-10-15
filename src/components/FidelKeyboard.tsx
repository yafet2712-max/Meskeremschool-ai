import React, { useState } from 'react';
import { FIDEL_DATA } from '../data/fidelData';
import { Volume2, Copy, Check, X, ArrowLeft } from 'lucide-react';
import { playAmharicAudio } from '../utils/audio';

interface FidelKeyboardProps {
  onInsertText: (char: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const GEEZ_NUMBERS = [
  { geez: '፩', num: 1 }, { geez: '፪', num: 2 }, { geez: '፫', num: 3 },
  { geez: '፬', num: 4 }, { geez: '፭', num: 5 }, { geez: '፮', num: 6 },
  { geez: '፯', num: 7 }, { geez: '፰', num: 8 }, { geez: '፱', num: 9 },
  { geez: '፲', num: 10 }, { geez: '፳', num: 20 }, { geez: '፴', num: 30 },
  { geez: '፵', num: 40 }, { geez: '፶', num: 50 }, { geez: '፷', num: 60 },
  { geez: '፸', num: 70 }, { geez: '፹', num: 80 }, { geez: '፺', num: 90 },
  { geez: '፻', num: 100 }
];

const GEEZ_PUNCTUATION = [
  { mark: '።', name: 'አራት ነጥብ (Period / Full Stop)' },
  { mark: '፣', name: 'ነጠላ ሰረዝ (Comma)' },
  { mark: '፤', name: 'ድርብ ሰረዝ (Semicolon)' },
  { mark: '፥', name: 'ሰረዝ (Colon)' },
  { mark: '፦', name: 'አንቀጽ / መቅደመ ቃል (Preface mark)' },
  { mark: '፧', name: 'ጥያቄ ምልክት (Question)' },
];

export const FidelKeyboard: React.FC<FidelKeyboardProps> = ({ onInsertText, isOpen, onClose }) => {
  const [selectedBase, setSelectedBase] = useState<string | null>(null);
  const [activeAudioChar, setActiveAudioChar] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [typedBuffer, setTypedBuffer] = useState('');

  if (!isOpen) return null;

  const currentFamily = selectedBase
    ? FIDEL_DATA.find((r) => r.order1 === selectedBase)
    : null;

  const handleSelectChar = (c: string) => {
    onInsertText(c);
    setTypedBuffer((prev) => prev + c);
    setSelectedBase(null);
  };

  const handleCopyBuffer = () => {
    if (!typedBuffer) return;
    navigator.clipboard.writeText(typedBuffer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSound = async (char: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveAudioChar(char);
    await playAmharicAudio(char, (playing) => {
      if (!playing) setActiveAudioChar(null);
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-stone-900/95 backdrop-blur-md border-t border-amber-600/40 text-stone-100 shadow-2xl transition-all duration-200">
      <div className="max-w-6xl mx-auto px-4 py-3">
        {/* Top Header / Buffer Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-800 gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-sm text-amber-300">የአማርኛ ፊደል መጻፊያ (Amharic Fidel Pad)</span>
            <span className="text-xs text-stone-400 hidden sm:inline">| ጠቅ አድርገው ይምረጡ (Click consonant then vowel order)</span>
          </div>

          <div className="flex items-center gap-2">
            {typedBuffer && (
              <div className="flex items-center gap-1.5 bg-stone-800 border border-stone-700 px-3 py-1 rounded-lg">
                <span className="text-lg font-amharic text-amber-200">{typedBuffer}</span>
                <button
                  onClick={handleCopyBuffer}
                  className="p-1 hover:text-amber-400 transition"
                  title="Copy typed text"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-stone-300" />}
                </button>
                <button
                  onClick={() => setTypedBuffer('')}
                  className="text-xs text-stone-400 hover:text-rose-400 px-1"
                >
                  አጥፋ
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition"
              title="Close keyboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Family Order Selector (When a base character is clicked) */}
        {currentFamily ? (
          <div className="py-3 bg-stone-800/80 rounded-xl my-2 px-4 border border-amber-500/30 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setSelectedBase(null)}
                className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> ወደ ሁሉም ፊደላት ተመለስ (Back)
              </button>
              <span className="text-xs text-stone-300">
                ቤተሰብ: <strong className="text-amber-300 font-amharic text-base">{currentFamily.name}</strong> ({currentFamily.transliteration})
              </span>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {[
                { order: 'ግዕዝ (ä)', char: currentFamily.order1 },
                { order: 'ካዕብ (u)', char: currentFamily.order2 },
                { order: 'ሳልስ (i)', char: currentFamily.order3 },
                { order: 'ራብዕ (a)', char: currentFamily.order4 },
                { order: 'ኃምስ (e)', char: currentFamily.order5 },
                { order: 'ሳድስ (ə)', char: currentFamily.order6 },
                { order: 'ሳብዕ (o)', char: currentFamily.order7 },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-[10px] text-stone-400 mb-1">{item.order}</span>
                  <div className="flex items-center w-full">
                    <button
                      onClick={() => handleSelectChar(item.char)}
                      className="flex-1 py-2 text-xl font-bold font-amharic bg-stone-700 hover:bg-amber-600 text-white rounded-lg transition active:scale-95 shadow-md flex items-center justify-center border border-stone-600"
                    >
                      {item.char}
                    </button>
                    <button
                      onClick={(e) => handleSound(item.char, e)}
                      className="ml-1 p-1 text-stone-400 hover:text-amber-300 transition"
                      title="Pronounce"
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${activeAudioChar === item.char ? 'text-amber-400 animate-bounce' : ''}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Base Consonants Grid */
          <div className="py-2">
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
              {FIDEL_DATA.map((row) => (
                <button
                  key={row.order1}
                  onClick={() => setSelectedBase(row.order1)}
                  className="px-2.5 py-1.5 min-w-[38px] text-lg font-amharic font-semibold bg-stone-800 hover:bg-amber-600 hover:text-white text-stone-200 rounded-md border border-stone-700/80 transition active:scale-90 flex items-center justify-center group relative shadow-sm"
                  title={`${row.name} (${row.transliteration})`}
                >
                  {row.order1}
                  <span className="absolute -bottom-1 right-0.5 text-[8px] text-stone-500 group-hover:text-amber-200">
                    {row.transliteration}
                  </span>
                </button>
              ))}
            </div>

            {/* Ge'ez Numerals & Punctuation row */}
            <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-stone-800 text-xs">
              <span className="text-stone-400">ቁጥሮች (Ge'ez):</span>
              <div className="flex flex-wrap gap-1">
                {GEEZ_NUMBERS.slice(0, 10).map((n) => (
                  <button
                    key={n.geez}
                    onClick={() => handleSelectChar(n.geez)}
                    className="px-1.5 py-0.5 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded font-amharic font-bold"
                    title={`Number ${n.num}`}
                  >
                    {n.geez}
                  </button>
                ))}
              </div>

              <span className="text-stone-400 ml-2">ሥርዓተ-ነጥብ (Punctuation):</span>
              <div className="flex flex-wrap gap-1">
                {GEEZ_PUNCTUATION.map((p) => (
                  <button
                    key={p.mark}
                    onClick={() => handleSelectChar(p.mark)}
                    className="px-2 py-0.5 bg-stone-800 hover:bg-stone-700 text-emerald-400 rounded font-amharic font-bold text-sm"
                    title={p.name}
                  >
                    {p.mark}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
