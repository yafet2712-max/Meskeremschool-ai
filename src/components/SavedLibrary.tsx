import React, { useState } from 'react';
import { Bookmark, Search, Trash2, Printer, Copy, Check, FileText, BookOpen, BookOpenText, Compass, CheckCircle2, Languages, Eye, X, Download, Layers } from 'lucide-react';
import { SavedMaterial } from '../types';
import { DailyLessonPlanView } from './DailyLessonPlanView';
import { WeeklyLessonPlanView } from './WeeklyLessonPlanView';
import { exportLessonPlanToDocx, exportTextOrQuizToDocx, exportWeeklyUnitPlanToDocx } from '../utils/docxExport';

interface SavedLibraryProps {
  items: SavedMaterial[];
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export const SavedLibrary: React.FC<SavedLibraryProps> = ({ items, onDeleteItem, onClearAll }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [activeItem, setActiveItem] = useState<SavedMaterial | null>(null);
  const [copied, setCopied] = useState(false);

  const filteredItems = items.filter((item) => {
    const matchesFilter = selectedFilter === 'all' || item.type === selectedFilter;
    const matchesSearch =
      !searchTerm ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getIcon = (type: SavedMaterial['type']) => {
    switch (type) {
      case 'weekly-plan':
        return <Layers className="w-4 h-4 text-amber-600" />;
      case 'lesson-plan':
        return <BookOpen className="w-4 h-4 text-emerald-600" />;
      case 'worksheet':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'story':
        return <BookOpenText className="w-4 h-4 text-amber-600" />;
      case 'grammar':
        return <Compass className="w-4 h-4 text-purple-600" />;
      case 'feedback':
        return <CheckCircle2 className="w-4 h-4 text-teal-600" />;
      case 'translation':
        return <Languages className="w-4 h-4 text-indigo-600" />;
      default:
        return <Bookmark className="w-4 h-4 text-stone-600" />;
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                <Bookmark className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-stone-900">የተቀመጡ ትምህርቶች ቤተ-መጻሕፍት (Saved Materials Library)</h2>
            </div>
            <p className="text-sm text-stone-500 mt-1">
              Access and manage your generated lesson plans, worksheets, fables, and feedback records across sessions.
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 transition self-start md:self-auto"
            >
              ሁሉንም አጽዳ (Clear All)
            </button>
          )}
        </div>

        {/* Filters & Search */}
        <div className="mt-4 pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {[
              { id: 'all', label: 'ሁሉም (All)' },
              { id: 'weekly-plan', label: '🌟 የ5 ቀናት እቅድ (5-Day Units)' },
              { id: 'lesson-plan', label: 'ዕለታዊ እቅድ (Daily Plan)' },
              { id: 'worksheet', label: 'ፈተናዎች' },
              { id: 'story', label: 'ተረቶች' },
              { id: 'grammar', label: 'ሰዋሰው' },
              { id: 'feedback', label: 'ግምገማ' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-3 py-1.5 text-xs rounded-xl font-medium transition ${
                  selectedFilter === f.id
                    ? 'bg-amber-600 text-white shadow-sm font-bold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search library / ፈልግ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
        </div>
      </div>

      {/* Grid of Saved Materials */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center">
          <Bookmark className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-700 font-amharic">
            እስካሁን የተቀመጠ ትምህርት የለም
          </h3>
          <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
            You haven't saved any materials yet. Generate a 5-day weekly unit plan, daily lesson plan, or worksheet and save it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-stone-100 rounded-lg">
                    {getIcon(item.type)}
                    <span className="capitalize text-stone-700">{item.type.replace('-', ' ')}</span>
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="font-bold text-stone-900 text-sm font-amharic line-clamp-1 mb-1">
                  {item.title}
                </h4>

                <p className="text-xs text-stone-500 font-amharic line-clamp-3 leading-relaxed mb-3">
                  {item.preview}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => setActiveItem(item)}
                  className="flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>ክፈት (View & Edit)</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      if (item.weeklyPlan) {
                        exportWeeklyUnitPlanToDocx(item.weeklyPlan);
                      } else if (item.structuredPlan) {
                        exportLessonPlanToDocx(item.structuredPlan);
                      } else {
                        exportTextOrQuizToDocx(item.title, item.content, item.schoolName);
                      }
                    }}
                    className="p-1.5 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50 transition"
                    title="Download as .Docx (ዎርድ ፋይል)"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCopy(item.content)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition"
                    title="Copy content"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Item Modal Viewer */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn printable-area">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 no-print">
              <div className="flex items-center gap-2">
                {getIcon(activeItem.type)}
                <h3 className="font-bold text-stone-900 text-sm font-amharic truncate max-w-md">
                  {activeItem.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(activeItem.content)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-lg transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => {
                    if (activeItem.weeklyPlan) {
                      exportWeeklyUnitPlanToDocx(activeItem.weeklyPlan);
                    } else if (activeItem.structuredPlan) {
                      exportLessonPlanToDocx(activeItem.structuredPlan);
                    } else {
                      exportTextOrQuizToDocx(activeItem.title, activeItem.content);
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm"
                  title="Download as Microsoft Word document (.docx)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .Docx</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white rounded-lg transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>

                <button
                  onClick={() => setActiveItem(null)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              {activeItem.weeklyPlan ? (
                <WeeklyLessonPlanView weeklyPlan={activeItem.weeklyPlan} />
              ) : activeItem.structuredPlan ? (
                <DailyLessonPlanView plan={activeItem.structuredPlan} />
              ) : (
                <div className="prose prose-stone max-w-none font-amharic leading-relaxed text-stone-800 whitespace-pre-wrap text-sm md:text-base">
                  {activeItem.content}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
