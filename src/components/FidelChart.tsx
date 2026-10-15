import React, { useState } from 'react';
import { FIDEL_DATA, FIDEL_ORDERS } from '../data/fidelData';
import { Volume2, Search, Printer, Sparkles, HelpCircle, Check, Copy } from 'lucide-react';
import { playAmharicAudio } from '../utils/audio';

export const FidelChart: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [playingChar, setPlayingChar] = useState<string | null>(null);
  const [selectedCharDetail, setSelectedCharDetail] = useState<{
    char: string;
    family: string;
    orderName: string;
    orderNum: number;
    translit: string;
  } | null>(null);
  const [copiedChar, setCopiedChar] = useState<string | null>(null);

  const filteredData = FIDEL_DATA.filter((row) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      row.name.toLowerCase().includes(s) ||
      row.transliteration.toLowerCase().includes(s) ||
      row.order1.includes(s) ||
      row.order2.includes(s) ||
      row.order3.includes(s) ||
      row.order4.includes(s) ||
      row.order5.includes(s) ||
      row.order6.includes(s) ||
      row.order7.includes(s)
    );
  });

  const handlePronounce = async (char: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPlayingChar(char);
    await playAmharicAudio(char, (playing) => {
      if (!playing) setPlayingChar(null);
    });
  };

  const handleCopy = (char: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(char);
    setCopiedChar(char);
    setTimeout(() => setCopiedChar(null), 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-100 text-amber-800 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-stone-900">የአማርኛ ፊደል ገበታ (Interactive Fidel Chart)</h2>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            Explore all 33 base consonants and 7 vowel orders with audio pronunciations, transliterations, and classroom printouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search / ፈልግ (e.g. sh, m, ለ)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition"
            title="Print Fidel chart for classroom poster"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden md:inline">Print Poster</span>
          </button>
        </div>
      </div>

      {/* Orders Explainer Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-500/10 border border-amber-200/60 p-4 rounded-2xl no-print">
        <div className="flex items-center gap-2 mb-2 text-amber-900 font-semibold text-sm">
          <HelpCircle className="w-4 h-4" />
          <span>ሰባቱ የድምፅ ዓይነቶች (The 7 Vowel Orders):</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-xs">
          {FIDEL_ORDERS.map((o) => (
            <div key={o.order} className="bg-white/80 backdrop-blur-sm p-2 rounded-xl border border-amber-200/40">
              <span className="font-bold text-amber-800">{o.order}. {o.name}</span>
              <p className="text-stone-500 mt-0.5">Vowel: <strong className="text-stone-700">{o.vowel}</strong> ({o.sound})</p>
              <div className="mt-1 font-amharic font-bold text-amber-900">{o.sample}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Char Detail Popover if active */}
      {selectedCharDetail && (
        <div className="bg-stone-900 text-stone-100 p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4 animate-fadeIn no-print border border-amber-500/40">
          <div className="flex items-center gap-4">
            <div className="text-4xl font-amharic font-black text-amber-400 bg-stone-800 w-16 h-16 rounded-xl flex items-center justify-center border border-stone-700">
              {selectedCharDetail.char}
            </div>
            <div>
              <div className="text-xs text-amber-300 font-medium">
                {selectedCharDetail.family} • {selectedCharDetail.orderName} (Order {selectedCharDetail.orderNum})
              </div>
              <div className="text-sm font-semibold text-stone-200 mt-0.5">
                Phonetic sound: <code className="bg-stone-800 px-1.5 py-0.5 rounded text-amber-200">/{selectedCharDetail.translit}/</code>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePronounce(selectedCharDetail.char)}
              disabled={playingChar === selectedCharDetail.char}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium transition shadow"
            >
              <Volume2 className={`w-4 h-4 ${playingChar === selectedCharDetail.char ? 'animate-bounce' : ''}`} />
              <span>{playingChar === selectedCharDetail.char ? 'Playing...' : 'Pronounce (አድምጥ)'}</span>
            </button>
            <button
              onClick={(e) => handleCopy(selectedCharDetail.char, e)}
              className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs transition"
              title="Copy"
            >
              {copiedChar === selectedCharDetail.char ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setSelectedCharDetail(null)}
              className="text-stone-400 hover:text-stone-100 text-xs px-2 py-1"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main Fidel Grid */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden printable-area">
        {/* Printable classroom header */}
        <div className="hidden print:block text-center pb-4 border-b border-stone-300 mb-4">
          <h1 className="text-2xl font-black text-stone-900 font-amharic">የአማርኛ ፊደል ገበታ (Amharic Syllabary Chart)</h1>
          <p className="text-sm text-stone-600">Ethiopian Ge'ez Script • 33 Base Consonants & 7 Orders</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-stone-100/80 border-b border-stone-200 text-xs font-semibold text-stone-700">
                <th className="py-3 px-3 text-left w-36">መነሻ ፊደል (Base)</th>
                {FIDEL_ORDERS.map((o) => (
                  <th key={o.order} className="py-3 px-2 min-w-[70px]">
                    <div className="font-amharic text-sm font-bold text-amber-900">{o.name.split(' ')[0]}</div>
                    <div className="text-[10px] text-stone-500 font-normal">
                      Order {o.order} ({o.vowel})
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredData.map((row) => (
                <tr key={row.name} className="hover:bg-amber-50/40 transition-colors group">
                  {/* Row descriptor */}
                  <td className="py-2.5 px-3 text-left bg-stone-50/60 font-medium text-stone-700 border-r border-stone-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-amharic text-base font-bold text-stone-900">{row.name}</div>
                        <div className="text-[11px] text-stone-500">[{row.transliteration}]</div>
                      </div>
                      <button
                        onClick={(e) => handlePronounce(row.order1, e)}
                        className="p-1 text-stone-400 hover:text-amber-600 opacity-0 group-hover:opacity-100 transition no-print"
                        title="Listen to row sound"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* 7 Orders */}
                  {[
                    { char: row.order1, orderNum: 1, orderName: 'ግዕዝ' },
                    { char: row.order2, orderNum: 2, orderName: 'ካዕብ' },
                    { char: row.order3, orderNum: 3, orderName: 'ሳልስ' },
                    { char: row.order4, orderNum: 4, orderName: 'ራብዕ' },
                    { char: row.order5, orderNum: 5, orderName: 'ኃምስ' },
                    { char: row.order6, orderNum: 6, orderName: 'ሳድስ' },
                    { char: row.order7, orderNum: 7, orderName: 'ሳብዕ' },
                  ].map((cell) => {
                    const isSelected = selectedCharDetail?.char === cell.char;
                    const isPlaying = playingChar === cell.char;
                    return (
                      <td
                        key={cell.char}
                        onClick={() =>
                          setSelectedCharDetail({
                            char: cell.char,
                            family: row.name,
                            orderName: cell.orderName,
                            orderNum: cell.orderNum,
                            translit: row.transliteration + FIDEL_ORDERS[cell.orderNum - 1].vowel,
                          })
                        }
                        className={`py-2 px-1 text-2xl font-amharic font-bold cursor-pointer transition relative select-none ${
                          isSelected
                            ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-500 z-10'
                            : 'hover:bg-amber-100/60 text-stone-800'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center">
                          <span>{cell.char}</span>
                          {isPlaying && (
                            <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-ping absolute top-1 right-1" />
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
