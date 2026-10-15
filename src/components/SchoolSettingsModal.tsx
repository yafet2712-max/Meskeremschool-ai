import React, { useState } from 'react';
import { SchoolProfile } from '../types';
import { Building2, Check, X, Sparkles, MapPin, User, Award, School } from 'lucide-react';

interface SchoolSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: SchoolProfile;
  onSaveProfile: (profile: SchoolProfile) => void;
}

const SAMPLE_ETHIOPIAN_SCHOOLS: Partial<SchoolProfile>[] = [
  {
    schoolName: 'Dil-Betigl Primary School',
    amharicSchoolName: 'ድል-በትግል የመጀመሪያ ደረጃ ትምህርት ቤት',
    woredaSubcity: 'Yeka Sub-City, Woreda 08',
    cityRegion: 'Addis Ababa',
    motto: 'Striving for Quality Education / ለላቀ የትምህርት ጥራት እንተጋለን',
  },
  {
    schoolName: 'Ethio-Parents Primary School',
    amharicSchoolName: 'ኢትዮ-ፓረንትስ የመጀመሪያ ደረጃ ትምህርት ቤት',
    woredaSubcity: 'Bole Sub-City, Woreda 03',
    cityRegion: 'Addis Ababa',
    motto: 'Nurturing Future Leaders with Integrity',
  },
  {
    schoolName: 'Menelik II Primary School',
    amharicSchoolName: 'ዳግማዊ ምኒልክ የመጀመሪያ ደረጃ ትምህርት ቤት',
    woredaSubcity: 'Arada Sub-City, Woreda 01',
    cityRegion: 'Addis Ababa',
    motto: 'Knowledge is Light / እውቀት ብርሃን ነው',
  },
  {
    schoolName: 'Hawassa Tabor Primary School',
    amharicSchoolName: 'ሀዋሳ ታቦር የመጀመሪያ ደረጃ ትምህርት ቤት',
    woredaSubcity: 'Tabor Sub-City',
    cityRegion: 'Hawassa, Sidama',
    motto: 'Excellence in Learning and Character',
  },
];

export const SchoolSettingsModal: React.FC<SchoolSettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<SchoolProfile>(profile);
  const [savedNotification, setSavedNotification] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSavedNotification(true);
    setTimeout(() => {
      setSavedNotification(false);
      onClose();
    }, 1200);
  };

  const handleApplyPreset = (preset: Partial<SchoolProfile>) => {
    setFormData((prev) => ({
      ...prev,
      ...preset,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-amber-200 animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <School className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-amharic">የስራ ቦታዎ / የትምህርት ቤትዎ ስም ማስተካከያ</h3>
              <p className="text-xs text-amber-200 mt-0.5">
                Set Your Workplace & Primary School Branding
              </p>
            </div>
          </div>
          <p className="text-xs text-amber-100/90 mt-3 leading-relaxed">
            All generated lesson plans, worksheets, and quizzes will be proudly branded with your school's official name, teacher title, and location.
          </p>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quick Presets */}
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
              ፈጣን ናሙና ትምህርት ቤቶች (Quick Ethiopian Presets):
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_ETHIOPIAN_SCHOOLS.map((s, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleApplyPreset(s)}
                  className="p-2 text-left bg-stone-50 hover:bg-amber-50 hover:border-amber-300 border border-stone-200 rounded-xl transition text-xs group"
                >
                  <div className="font-semibold text-stone-800 group-hover:text-amber-900 truncate">
                    {s.schoolName}
                  </div>
                  <div className="text-[10px] text-stone-400 font-amharic truncate">
                    {s.amharicSchoolName}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                የትምህርት ቤቱ ስም (English School Name) *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  placeholder="e.g. Dil-Betigl Primary School"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                የትምህርት ቤቱ ስም በአማርኛ (Amharic Name)
              </label>
              <input
                type="text"
                value={formData.amharicSchoolName}
                onChange={(e) => setFormData({ ...formData, amharicSchoolName: e.target.value })}
                placeholder="ለምሳሌ: ድል-በትግል የመጀመሪያ ደረጃ ት/ቤት"
                className="w-full px-3 py-2 text-sm font-amharic bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                የመምህሩ ስም (Teacher / Educator Name)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.teacherName}
                  onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                  placeholder="e.g. Teacher Yafet / መምህር ያፌት"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                ክፍለ ከተማ / ወረዳ (Sub-City / Woreda)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.woredaSubcity}
                  onChange={(e) => setFormData({ ...formData, woredaSubcity: e.target.value })}
                  placeholder="e.g. Yeka Sub-City, Woreda 08"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                ከተማ / ክልል (City / Region)
              </label>
              <input
                type="text"
                value={formData.cityRegion}
                onChange={(e) => setFormData({ ...formData, cityRegion: e.target.value })}
                placeholder="e.g. Addis Ababa / አዲስ አበባ"
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                የትምህርት ቤቱ መፈክር (School Motto)
              </label>
              <div className="relative">
                <Award className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.motto}
                  onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                  placeholder="e.g. Striving for Quality Education"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {savedNotification && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>የትምህርት ቤቱ መረጃ በተሳካ ሁኔታ ተቀምጧል! (Workplace profile saved!)</span>
            </div>
          )}

          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition"
            >
              ይቅር (Cancel)
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-amber-600/20"
            >
              <Check className="w-4 h-4" />
              <span>መረጃውን አጽድቅ (Save Workplace Profile)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
