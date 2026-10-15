import React, { useState } from 'react';
import { AppTab, SchoolProfile } from '../types';
import { 
  BookOpen, 
  FileText, 
  Grid, 
  Compass, 
  BookOpenText, 
  CheckCircle2, 
  Languages, 
  MessageSquare, 
  Bookmark, 
  Keyboard, 
  Sparkles, 
  Printer, 
  School, 
  Zap,
  Share2,
  Check,
  X,
  ExternalLink,
  Copy
} from 'lucide-react';

interface HeaderProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  savedCount: number;
  onToggleKeyboard: () => void;
  isKeyboardOpen: boolean;
  schoolProfile: SchoolProfile;
  onOpenSchoolSettings: () => void;
  publishedUrl: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  savedCount,
  onToggleKeyboard,
  isKeyboardOpen,
  schoolProfile,
  onOpenSchoolSettings,
  publishedUrl,
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const tabs = [
    { id: 'lesson-planner' as AppTab, amharic: 'የትምህርት እቅድ', english: 'Lesson Plans', icon: BookOpen },
    { id: 'quick-quiz' as AppTab, amharic: '⚡ 1-ቃል ፈተና', english: 'Quick 1-Word Quiz', icon: Zap, highlight: true },
    { id: 'worksheet-maker' as AppTab, amharic: 'ፈተና እና መልመጃ', english: 'Worksheets', icon: FileText },
    { id: 'fidel-chart' as AppTab, amharic: 'ፊደል ገበታ', english: 'Fidel Chart', icon: Grid },
    { id: 'grammar-lab' as AppTab, amharic: 'ሰዋሰው ላብ', english: 'Grammar Lab', icon: Compass },
    { id: 'stories' as AppTab, amharic: 'ተረቶች እና ምንባብ', english: 'Stories & Fables', icon: BookOpenText },
    { id: 'assignment-grader' as AppTab, amharic: 'ጽሁፍ ገምጋሚ', english: 'Work Grader', icon: CheckCircle2 },
    { id: 'translator' as AppTab, amharic: 'ባህል እና ትርጉም', english: 'Translator', icon: Languages },
    { id: 'chat' as AppTab, amharic: 'መምህር አማካሪ', english: 'AI Mentor', icon: MessageSquare },
    { id: 'library' as AppTab, amharic: 'ቤተ-መጻሕፍት', english: 'Saved Library', icon: Bookmark, badge: savedCount },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publishedUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <header className="bg-white border-b border-stone-200/90 sticky top-0 z-40 backdrop-blur-md bg-white/95 no-print">
      {/* Top Brand Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & School Workplace Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20 font-amharic font-black text-xl shrink-0">
              ሀ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black font-amharic tracking-tight text-stone-900">
                  {schoolProfile.schoolName || 'የአማርኛ እና የመጀመሪያ ደረጃ መምህር ረዳት'}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <Sparkles className="w-3 h-3 text-emerald-600" /> Free & Unlimited
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium truncate max-w-sm sm:max-w-md">
                {schoolProfile.amharicSchoolName ? `${schoolProfile.amharicSchoolName} • ` : ''}
                {schoolProfile.woredaSubcity ? `${schoolProfile.woredaSubcity} • ` : ''}
                Ethiopian Primary Education AI Assistant
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            {/* Share / Published Link Button */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition"
              title="View & copy published web link"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">የተጋራ ሊንክ (Published Link)</span>
            </button>

            {/* Workplace / School Profile Button */}
            <button
              onClick={onOpenSchoolSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 transition"
              title="Change workplace / primary school name"
            >
              <School className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden md:inline">የስራ ቦታ ስም (Edit School)</span>
              <span className="md:hidden">School</span>
            </button>

            {/* Virtual Fidel Pad Toggle */}
            <button
              onClick={onToggleKeyboard}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                isKeyboardOpen
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
              }`}
              title="Toggle Amharic On-Screen Fidel Keyboard"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">ፊደል መጻፊያ</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
              title="Print current document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex space-x-1 overflow-x-auto py-2 no-scrollbar border-t border-stone-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all select-none ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-sm font-semibold'
                    : tab.highlight
                    ? 'bg-amber-50 text-amber-900 border border-amber-300/70 hover:bg-amber-100 font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.highlight ? 'text-amber-600' : 'text-stone-400'}`} />
                <span className="font-amharic">{tab.amharic}</span>
                <span className="text-[10px] opacity-75 hidden xl:inline">({tab.english})</span>

                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-amber-700' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Published Link Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-emerald-200 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">
                    የተጋራ የድረ-ገጽ ሊንክ (Live Published Link)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Share with teachers, school principals & students
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Your app is published and live! Anyone with this link can use the <strong>Daily Lesson Plan Generator</strong>, <strong>Quick 1-Word Quiz Maker</strong>, and download documents as <strong>.Docx</strong> without limitations.
            </p>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3 flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-stone-800 break-all select-all">
                {publishedUrl}
              </span>
              <button
                onClick={handleCopyLink}
                className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs">
              <a
                href={publishedUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-800"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in New Tab (በአዲስ መስኮት ክፈት)</span>
              </a>

              <button
                onClick={() => setIsShareModalOpen(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium"
              >
                ዝጋ (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
