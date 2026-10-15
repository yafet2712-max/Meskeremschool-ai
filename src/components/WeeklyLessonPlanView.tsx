import React, { useState } from 'react';
import { WeeklyUnitPlanData, DailyLessonPlanData } from '../types';
import { 
  Printer, 
  Copy, 
  Check, 
  Bookmark, 
  Edit3, 
  Eye, 
  Download, 
  Calendar, 
  BookOpen, 
  Layers, 
  ChevronRight,
  School,
  FileSpreadsheet
} from 'lucide-react';
import { exportLessonPlanToDocx, exportWeeklyUnitPlanToDocx } from '../utils/docxExport';

interface WeeklyLessonPlanViewProps {
  weeklyPlan: WeeklyUnitPlanData;
  onUpdateWeeklyPlan?: (updated: WeeklyUnitPlanData) => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export const WeeklyLessonPlanView: React.FC<WeeklyLessonPlanViewProps> = ({
  weeklyPlan: initialWeeklyPlan,
  onUpdateWeeklyPlan,
  onSave,
  isSaved,
}) => {
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyUnitPlanData>(initialWeeklyPlan);
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0); // 0 to 4, or -1 for "All 5 Days"
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    setWeeklyPlan(initialWeeklyPlan);
  }, [initialWeeklyPlan]);

  const currentDay = activeDayIndex >= 0 && activeDayIndex < weeklyPlan.days.length 
    ? weeklyPlan.days[activeDayIndex] 
    : weeklyPlan.days[0];

  const handleDayPlanChange = (dayIdx: number, field: keyof DailyLessonPlanData, value: any) => {
    const updatedDays = [...weeklyPlan.days];
    const targetDay = updatedDays[dayIdx];
    if (!targetDay) return;

    updatedDays[dayIdx] = {
      ...targetDay,
      lessonTopic: field === 'lessonTopic' ? value : targetDay.lessonTopic,
      date: field === 'date' ? value : targetDay.date,
      plan: {
        ...targetDay.plan,
        [field]: value,
      },
    };

    const updatedWeekly = { ...weeklyPlan, days: updatedDays };
    setWeeklyPlan(updatedWeekly);
    if (onUpdateWeeklyPlan) onUpdateWeeklyPlan(updatedWeekly);
  };

  const handleDayStageChange = (dayIdx: number, stageIdx: number, field: string, value: string) => {
    const updatedDays = [...weeklyPlan.days];
    const targetDay = updatedDays[dayIdx];
    if (!targetDay) return;

    const updatedStages = [...targetDay.plan.stages];
    updatedStages[stageIdx] = { ...updatedStages[stageIdx], [field]: value };

    updatedDays[dayIdx] = {
      ...targetDay,
      plan: {
        ...targetDay.plan,
        stages: updatedStages,
      },
    };

    const updatedWeekly = { ...weeklyPlan, days: updatedDays };
    setWeeklyPlan(updatedWeekly);
    if (onUpdateWeeklyPlan) onUpdateWeeklyPlan(updatedWeekly);
  };

  const handleDaySpecialNeedsChange = (
    dayIdx: number,
    key: 'slowLearners' | 'mediumLearners' | 'fastLearners',
    value: string
  ) => {
    const updatedDays = [...weeklyPlan.days];
    const targetDay = updatedDays[dayIdx];
    if (!targetDay) return;

    updatedDays[dayIdx] = {
      ...targetDay,
      plan: {
        ...targetDay.plan,
        specialNeedsSupport: {
          ...targetDay.plan.specialNeedsSupport,
          [key]: value,
        },
      },
    };

    const updatedWeekly = { ...weeklyPlan, days: updatedDays };
    setWeeklyPlan(updatedWeekly);
    if (onUpdateWeeklyPlan) onUpdateWeeklyPlan(updatedWeekly);
  };

  const handleCopyText = () => {
    let fullText = `WEEKLY UNIT LESSON PLAN (የሳምንታዊ ምዕራፍ የትምህርት እቅዶች)
Unit & Topic: ${weeklyPlan.unitTopic}
Subject: ${weeklyPlan.subject} | Grade: ${weeklyPlan.gradeLevel}
Teacher: ${weeklyPlan.teacherName} | School: ${weeklyPlan.schoolName}
Week: ${weeklyPlan.weekLabel || 'Week 1'}

==============================
5-DAY SCHEDULE OVERVIEW:
${weeklyPlan.days.map((d, i) => `${d.dayName || `Day ${i + 1}`}: ${d.lessonTopic} (Date: ${d.date || d.plan.date})`).join('\n')}
==============================\n\n`;

    weeklyPlan.days.forEach((d, idx) => {
      const p = d.plan;
      fullText += `--- [${d.dayName || `Day ${idx + 1}`}: ${p.lessonTopic}] ---
Teacher: ${p.teacherName} | School: ${p.schoolName} | Date: ${p.date}
Rationale: ${p.rationale}
Pre-requisite: ${p.prerequisiteKnowledge}
Competencies: ${p.competencies}

Stages:
${p.stages.map((s) => `${s.stage} | ${s.timeAllotment} | ${s.learningContents} | ${s.teacherActivities} | ${s.studentActivities} | ${s.assessmentTechniques}`).join('\n')}

Special Needs:
- Slow learners: ${p.specialNeedsSupport.slowLearners}
- Medium learners: ${p.specialNeedsSupport.mediumLearners}
- Fast learners: ${p.specialNeedsSupport.fastLearners}

Signatures: Teacher: ${p.teacherName} | Dept Head: ${p.deptHeadName || '-'} | Vice Principal: ${p.vicePrincipalName || '-'}\n\n`;
    });

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderSingleDayPlan = (day: WeeklyUnitPlanData['days'][0], dayIdx: number) => {
    const plan = day.plan;

    return (
      <div key={day.dayNumber || dayIdx} className="bg-white p-6 md:p-10 border-b last:border-b-0 border-stone-200">
        {/* Day Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-stone-300 gap-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-amber-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              {dayIdx + 1}
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
                <span>{day.dayName || `Day ${dayIdx + 1}`}</span>
                <span className="text-xs text-stone-400 font-normal">•</span>
                <span className="text-amber-700 font-semibold">{plan.lessonTopic}</span>
              </h2>
              <p className="text-xs text-stone-500 font-mono">
                {plan.date || `Day ${dayIdx + 1} Date`} • {weeklyPlan.unitTopic}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 no-print">
            <button
              onClick={() => exportLessonPlanToDocx(plan)}
              className="px-2.5 py-1 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition flex items-center gap-1 border border-stone-300"
              title={`Download Day ${dayIdx + 1} as separate Word document`}
            >
              <Download className="w-3 h-3 text-stone-600" />
              <span>Day {dayIdx + 1} .Docx</span>
            </button>
          </div>
        </div>

        {/* Official Title */}
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold italic tracking-wide text-stone-900">
            Daily Lesson Plan (ዕለታዊ የትምህርት እቅድ)
          </h1>
          <p className="text-xs text-stone-500 font-medium">
            Ethiopian Ministry of Education Standard Primary Format
          </p>
        </div>

        {/* Top 2-Column Info Grid */}
        <div className="border border-stone-300 bg-stone-50/50 rounded-lg p-4 mb-6 text-xs sm:text-sm font-sans grid grid-cols-1 md:grid-cols-2 gap-y-2.5 gap-x-6">
          <div className="flex items-baseline">
            <span className="italic text-stone-600 w-36 shrink-0">Name of teacher:-</span>
            {isEditing ? (
              <input
                type="text"
                value={plan.teacherName}
                onChange={(e) => handleDayPlanChange(dayIdx, 'teacherName', e.target.value)}
                className="flex-1 bg-white border border-amber-300 rounded px-2 py-0.5 text-xs font-medium focus:ring-1 focus:ring-amber-500 outline-none"
              />
            ) : (
              <span className="font-semibold text-stone-900">{plan.teacherName || '—'}</span>
            )}
          </div>

          <div className="flex items-baseline">
            <span className="italic text-stone-600 w-36 shrink-0">Name of School:-</span>
            {isEditing ? (
              <input
                type="text"
                value={plan.schoolName}
                onChange={(e) => handleDayPlanChange(dayIdx, 'schoolName', e.target.value)}
                className="flex-1 bg-white border border-amber-300 rounded px-2 py-0.5 text-xs font-medium focus:ring-1 focus:ring-amber-500 outline-none"
              />
            ) : (
              <span className="font-semibold text-stone-900">{plan.schoolName || '—'}</span>
            )}
          </div>

          <div className="flex items-baseline">
            <span className="italic text-stone-600 w-36 shrink-0">Subject:-</span>
            {isEditing ? (
              <input
                type="text"
                value={plan.subject}
                onChange={(e) => handleDayPlanChange(dayIdx, 'subject', e.target.value)}
                className="flex-1 bg-white border border-amber-300 rounded px-2 py-0.5 text-xs font-medium focus:ring-1 focus:ring-amber-500 outline-none"
              />
            ) : (
              <span className="font-medium text-stone-900">{plan.subject || '—'}</span>
            )}
          </div>

          <div className="flex items-baseline">
            <span className="italic text-stone-600 w-36 shrink-0 font-semibold text-amber-900">Unit and topic:-</span>
            {isEditing ? (
              <input
                type="text"
                value={plan.unitAndTopic}
                onChange={(e) => handleDayPlanChange(dayIdx, 'unitAndTopic', e.target.value)}
                className="flex-1 bg-white border border-amber-300 rounded px-2 py-0.5 text-xs font-medium focus:ring-1 focus:ring-amber-500 outline-none"
              />
            ) : (
              <span className="font-bold text-amber-800">{plan.unitAndTopic || weeklyPlan.unitTopic || '—'}</span>
            )}
          </div>

          <div className="flex items-baseline">
            <span className="italic text-stone-600 w-36 shrink-0">Grade and Section:-</span>
            {isEditing ? (
              <input
                type="text"
                value={plan.gradeAndSection}
                onChange={(e) => handleDayPlanChange(dayIdx, 'gradeAndSection', e.target.value)}
                className="flex-1 bg-white border border-amber-300 rounded px-2 py-0.5 text-xs font-medium focus:ring-1 focus:ring-amber-500 outline-none"
              />
            ) : (
              <span className="font-medium text-stone-900">{plan.gradeAndSection || '—'}</span>
            )}
          </div>

          <div className="flex items-baseline">
            <span className="italic text-stone-600 w-36 shrink-0 font-semibold text-amber-900">Daily Lesson topic:-</span>
            {isEditing ? (
              <input
                type="text"
                value={plan.lessonTopic}
                onChange={(e) => handleDayPlanChange(dayIdx, 'lessonTopic', e.target.value)}
                className="flex-1 bg-white border border-amber-300 rounded px-2 py-0.5 text-xs font-medium focus:ring-1 focus:ring-amber-500 outline-none"
              />
            ) : (
              <span className="font-bold text-stone-900 underline decoration-amber-400 decoration-2">{plan.lessonTopic || '—'}</span>
            )}
          </div>

          <div className="flex items-baseline md:col-span-2">
            <span className="italic text-stone-600 w-36 shrink-0">Date:-</span>
            {isEditing ? (
              <input
                type="text"
                value={plan.date}
                onChange={(e) => handleDayPlanChange(dayIdx, 'date', e.target.value)}
                className="flex-1 bg-white border border-amber-300 rounded px-2 py-0.5 text-xs font-medium focus:ring-1 focus:ring-amber-500 outline-none"
              />
            ) : (
              <span className="font-medium text-stone-800">{plan.date || '—'}</span>
            )}
          </div>
        </div>

        {/* Narrative Fields */}
        <div className="space-y-3 mb-6 text-xs sm:text-sm">
          <div>
            <div className="italic font-medium text-stone-800 mb-1">Rationale of the topic:-</div>
            {isEditing ? (
              <textarea
                value={plan.rationale}
                onChange={(e) => handleDayPlanChange(dayIdx, 'rationale', e.target.value)}
                rows={2}
                className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
              />
            ) : (
              <p className="text-stone-700 bg-stone-50/50 p-2.5 rounded-lg border border-stone-200/60 leading-relaxed">
                {plan.rationale || '—'}
              </p>
            )}
          </div>

          <div>
            <div className="italic font-medium text-stone-800 mb-1">Pre-requisite knowledge:-</div>
            {isEditing ? (
              <textarea
                value={plan.prerequisiteKnowledge}
                onChange={(e) => handleDayPlanChange(dayIdx, 'prerequisiteKnowledge', e.target.value)}
                rows={2}
                className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
              />
            ) : (
              <p className="text-stone-700 bg-stone-50/50 p-2.5 rounded-lg border border-stone-200/60 leading-relaxed">
                {plan.prerequisiteKnowledge || '—'}
              </p>
            )}
          </div>

          <div>
            <div className="italic font-medium text-stone-800 mb-1">Competencies (Learning objectives):-</div>
            {isEditing ? (
              <textarea
                value={plan.competencies}
                onChange={(e) => handleDayPlanChange(dayIdx, 'competencies', e.target.value)}
                rows={2}
                className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
              />
            ) : (
              <p className="text-stone-700 bg-amber-50/40 p-2.5 rounded-lg border border-amber-200/60 leading-relaxed font-medium">
                {plan.competencies || '—'}
              </p>
            )}
          </div>
        </div>

        {/* Official 9-Column Table */}
        <div className="overflow-x-auto border border-stone-400 rounded-lg shadow-sm mb-6">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-200/90 text-stone-900 border-b border-stone-400">
                <th className="p-2.5 border-r border-stone-400 font-bold italic w-[13%]">Stages<br/><span className="text-[10px] font-normal not-italic">(ደረጃዎች)</span></th>
                <th className="p-2 border-r border-stone-400 font-bold italic w-[7%] text-center">Time<br/><span className="text-[10px] font-normal not-italic">(ጊዜ)</span></th>
                <th className="p-2.5 border-r border-stone-400 font-bold italic w-[15%]">Learning Contents<br/><span className="text-[10px] font-normal not-italic">(የትምህርት ይዘት)</span></th>
                <th className="p-2 border-r border-stone-400 font-bold italic w-[6%] text-center">Page<br/><span className="text-[10px] font-normal not-italic">(ገጽ)</span></th>
                <th className="p-2.5 border-r border-stone-400 font-bold italic w-[20%]">Teacher's activities<br/><span className="text-[10px] font-normal not-italic">(የመምህሩ ተግባራት)</span></th>
                <th className="p-2.5 border-r border-stone-400 font-bold italic w-[18%]">Student's activities<br/><span className="text-[10px] font-normal not-italic">(የተማሪው ተግባራት)</span></th>
                <th className="p-2 border-r border-stone-400 font-bold italic w-[10%]">Assessment<br/><span className="text-[10px] font-normal not-italic">(የምዘና ዘዴዎች)</span></th>
                <th className="p-2 border-r border-stone-400 font-bold italic w-[8%]">Teaching Aids<br/><span className="text-[10px] font-normal not-italic">(መርጃዎች)</span></th>
                <th className="p-2 font-bold italic w-[5%] text-center">Remarks<br/><span className="text-[10px] font-normal not-italic">(አስተያየት)</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-300">
              {plan.stages.map((stage, stageIdx) => (
                <tr key={stageIdx} className="hover:bg-amber-50/20 transition-colors">
                  <td className="p-2.5 border-r border-stone-300 font-semibold align-top text-stone-900 bg-stone-50/30">
                    {stage.stage}
                  </td>
                  <td className="p-2 border-r border-stone-300 align-top text-center text-stone-700 font-mono">
                    {isEditing ? (
                      <input
                        type="text"
                        value={stage.timeAllotment}
                        onChange={(e) => handleDayStageChange(dayIdx, stageIdx, 'timeAllotment', e.target.value)}
                        className="w-full text-center border border-amber-300 rounded px-1 py-0.5 text-xs outline-none"
                      />
                    ) : (
                      stage.timeAllotment || '-'
                    )}
                  </td>
                  <td className="p-2.5 border-r border-stone-300 align-top text-stone-800 leading-snug">
                    {isEditing ? (
                      <textarea
                        value={stage.learningContents}
                        onChange={(e) => handleDayStageChange(dayIdx, stageIdx, 'learningContents', e.target.value)}
                        rows={3}
                        className="w-full border border-amber-300 rounded p-1 text-xs outline-none"
                      />
                    ) : (
                      stage.learningContents || '-'
                    )}
                  </td>
                  <td className="p-2 border-r border-stone-300 align-top text-center text-stone-700 font-mono">
                    {isEditing ? (
                      <input
                        type="text"
                        value={stage.page}
                        onChange={(e) => handleDayStageChange(dayIdx, stageIdx, 'page', e.target.value)}
                        className="w-full text-center border border-amber-300 rounded px-1 py-0.5 text-xs outline-none"
                      />
                    ) : (
                      stage.page || '-'
                    )}
                  </td>
                  <td className="p-2.5 border-r border-stone-300 align-top text-stone-800 leading-snug">
                    {isEditing ? (
                      <textarea
                        value={stage.teacherActivities}
                        onChange={(e) => handleDayStageChange(dayIdx, stageIdx, 'teacherActivities', e.target.value)}
                        rows={4}
                        className="w-full border border-amber-300 rounded p-1 text-xs outline-none"
                      />
                    ) : (
                      stage.teacherActivities || '-'
                    )}
                  </td>
                  <td className="p-2.5 border-r border-stone-300 align-top text-stone-800 leading-snug">
                    {isEditing ? (
                      <textarea
                        value={stage.studentActivities}
                        onChange={(e) => handleDayStageChange(dayIdx, stageIdx, 'studentActivities', e.target.value)}
                        rows={4}
                        className="w-full border border-amber-300 rounded p-1 text-xs outline-none"
                      />
                    ) : (
                      stage.studentActivities || '-'
                    )}
                  </td>
                  <td className="p-2 border-r border-stone-300 align-top text-stone-800 leading-snug">
                    {isEditing ? (
                      <textarea
                        value={stage.assessmentTechniques}
                        onChange={(e) => handleDayStageChange(dayIdx, stageIdx, 'assessmentTechniques', e.target.value)}
                        rows={2}
                        className="w-full border border-amber-300 rounded p-1 text-xs outline-none"
                      />
                    ) : (
                      stage.assessmentTechniques || '-'
                    )}
                  </td>
                  <td className="p-2 border-r border-stone-300 align-top text-stone-800 leading-snug">
                    {isEditing ? (
                      <textarea
                        value={stage.teachingAids}
                        onChange={(e) => handleDayStageChange(dayIdx, stageIdx, 'teachingAids', e.target.value)}
                        rows={2}
                        className="w-full border border-amber-300 rounded p-1 text-xs outline-none"
                      />
                    ) : (
                      stage.teachingAids || '-'
                    )}
                  </td>
                  <td className="p-2 align-top text-center text-stone-700">
                    {isEditing ? (
                      <input
                        type="text"
                        value={stage.remarks}
                        onChange={(e) => handleDayStageChange(dayIdx, stageIdx, 'remarks', e.target.value)}
                        className="w-full text-center border border-amber-300 rounded px-1 py-0.5 text-xs outline-none"
                      />
                    ) : (
                      stage.remarks || '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Special Needs Support */}
        <div className="mb-6 bg-stone-50/70 border border-stone-300 rounded-lg p-4 text-xs sm:text-sm">
          <div className="italic font-bold text-stone-900 mb-2.5">
            Support for learners of special needs (ለልዩ ፍላጎት ተማሪዎች የሚደረግ ድጋፍ):-
          </div>
          <div className="space-y-2 text-stone-800 pl-2">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
              <span className="font-semibold text-stone-900 w-36 shrink-0">- Slow learners:</span>
              {isEditing ? (
                <input
                  type="text"
                  value={plan.specialNeedsSupport.slowLearners}
                  onChange={(e) => handleDaySpecialNeedsChange(dayIdx, 'slowLearners', e.target.value)}
                  className="flex-1 bg-white border border-amber-300 rounded px-2 py-1 text-xs outline-none"
                />
              ) : (
                <span className="text-stone-700">{plan.specialNeedsSupport.slowLearners || '—'}</span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
              <span className="font-semibold text-stone-900 w-36 shrink-0">- Medium learners:</span>
              {isEditing ? (
                <input
                  type="text"
                  value={plan.specialNeedsSupport.mediumLearners}
                  onChange={(e) => handleDaySpecialNeedsChange(dayIdx, 'mediumLearners', e.target.value)}
                  className="flex-1 bg-white border border-amber-300 rounded px-2 py-1 text-xs outline-none"
                />
              ) : (
                <span className="text-stone-700">{plan.specialNeedsSupport.mediumLearners || '—'}</span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
              <span className="font-semibold text-stone-900 w-36 shrink-0">- Fast learners:</span>
              {isEditing ? (
                <input
                  type="text"
                  value={plan.specialNeedsSupport.fastLearners}
                  onChange={(e) => handleDaySpecialNeedsChange(dayIdx, 'fastLearners', e.target.value)}
                  className="flex-1 bg-white border border-amber-300 rounded px-2 py-1 text-xs outline-none"
                />
              ) : (
                <span className="text-stone-700">{plan.specialNeedsSupport.fastLearners || '—'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Official Signatures Grid */}
        <div className="border border-stone-300 rounded-lg overflow-hidden text-xs text-stone-800">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-300">
            <div className="p-3 bg-stone-50/40">
              <span className="italic">Teacher's Name:-</span>{' '}
              <strong className="text-stone-900">{plan.teacherName || '____________________'}</strong>
            </div>
            <div className="p-3 bg-stone-50/40">
              <span className="italic">Signature:-</span> ____________________
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-300 border-t border-stone-300">
            <div className="p-3">
              <span className="italic">Dept. Head's Name:-</span>{' '}
              {isEditing ? (
                <input
                  type="text"
                  value={plan.deptHeadName || ''}
                  onChange={(e) => handleDayPlanChange(dayIdx, 'deptHeadName', e.target.value)}
                  placeholder="Department Head"
                  className="border border-amber-300 rounded px-2 py-0.5 text-xs outline-none ml-1"
                />
              ) : (
                <span className="text-stone-700">{plan.deptHeadName || '____________________'}</span>
              )}
            </div>
            <div className="p-3">
              <span className="italic">Signature:-</span> ____________________
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-300 border-t border-stone-300">
            <div className="p-3 bg-stone-50/40">
              <span className="italic">Name of the Vice - principal:-</span>{' '}
              {isEditing ? (
                <input
                  type="text"
                  value={plan.vicePrincipalName || ''}
                  onChange={(e) => handleDayPlanChange(dayIdx, 'vicePrincipalName', e.target.value)}
                  placeholder="Vice Principal"
                  className="border border-amber-300 rounded px-2 py-0.5 text-xs outline-none ml-1"
                />
              ) : (
                <span className="text-stone-700">{plan.vicePrincipalName || '____________________'}</span>
              )}
            </div>
            <div className="p-3 bg-stone-50/40">
              <span className="italic">Signature:-</span> ____________________
            </div>
          </div>
          <div className="p-3 border-t border-stone-300">
            <span className="italic">Post lesson teacher's self-assessment:-</span>
            {isEditing ? (
              <textarea
                value={plan.postLessonAssessment || ''}
                onChange={(e) => handleDayPlanChange(dayIdx, 'postLessonAssessment', e.target.value)}
                rows={2}
                placeholder="Teacher's reflection after teaching the lesson..."
                className="w-full mt-1 border border-amber-300 rounded p-1.5 text-xs outline-none"
              />
            ) : (
              <div className="text-stone-600 mt-1 italic min-h-[1.5rem]">
                {plan.postLessonAssessment || '(To be completed by teacher after delivering the lesson)'}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden printable-area">
      {/* Top Controls Ribbon (No-print) */}
      <div className="bg-stone-900 text-white px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-amber-500 rounded-lg text-stone-950 font-black text-xs">
            5-DAY
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight flex items-center gap-2 text-white">
              <span>የሳምንታዊ ምዕራፍ 5 የትምህርት እቅዶች</span>
              <span className="text-xs text-amber-300 font-normal hidden md:inline">
                (Weekly Unit Plan: 5 Progressive Lessons in 1 Unit)
              </span>
            </h3>
            <p className="text-[11px] text-stone-400 truncate max-w-sm sm:max-w-md">
              {weeklyPlan.unitTopic} • {weeklyPlan.subject} ({weeklyPlan.gradeLevel})
            </p>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
              isEditing
                ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
            }`}
          >
            {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            <span>{isEditing ? 'View Mode' : 'Edit Cells'}</span>
          </button>

          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl transition"
            title="Copy entire 5-day unit plan as text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {onSave && (
            <button
              onClick={onSave}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition shadow-sm"
              title="Save complete 5-day unit plan to library"
            >
              {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'Saved to Library' : 'Save 5-Day Plan'}</span>
            </button>
          )}

          {/* Master Docx Button */}
          <button
            onClick={() => exportWeeklyUnitPlanToDocx(weeklyPlan)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition shadow-md shadow-blue-500/20"
            title="Download all 5 lesson plans in a single formatted Microsoft Word .docx booklet"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download All 5 Days (.Docx)</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-stone-100 hover:bg-white text-stone-900 rounded-xl transition"
            title="Print official plan"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* 5-Day Interactive Tab Selector Bar (No-print) */}
      <div className="bg-amber-50/70 border-b border-amber-200/80 p-3 no-print">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Day tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {weeklyPlan.days.map((day, idx) => {
              const isSelected = activeDayIndex === idx;
              return (
                <button
                  key={day.dayNumber || idx}
                  onClick={() => setActiveDayIndex(idx)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition border ${
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="text-left">
                    <div className="leading-none">{day.dayName || `Day ${idx + 1}`}</div>
                    <div className={`text-[10px] truncate max-w-[120px] font-normal mt-0.5 ${
                      isSelected ? 'text-amber-100' : 'text-stone-500'
                    }`}>
                      {day.lessonTopic}
                    </div>
                  </div>
                </button>
              );
            })}

            {/* View All Days Button */}
            <button
              onClick={() => setActiveDayIndex(-1)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition border ${
                activeDayIndex === -1
                  ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                  : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>📑 ሙሉ ሳምንቱን በአንድ ገጽ አሳይ (All 5 Days)</span>
            </button>
          </div>

          <div className="text-xs text-stone-600 font-medium hidden lg:flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Unit: <strong>{weeklyPlan.unitTopic}</strong></span>
          </div>
        </div>
      </div>

      {/* 5-Day Progression Strip Preview */}
      <div className="bg-stone-50 px-6 py-3 border-b border-stone-200 no-print">
        <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
          <span className="text-stone-500 font-bold">የሳምንቱ ቅደም ተከተል (Weekly Sequence):</span>
          <span className="text-[11px] text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
            5 Different Lessons • Same Unit Topic
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mt-2">
          {weeklyPlan.days.map((d, i) => (
            <div
              key={i}
              onClick={() => setActiveDayIndex(i)}
              className={`p-2 rounded-xl border text-left cursor-pointer transition ${
                activeDayIndex === i
                  ? 'bg-amber-100/80 border-amber-400 shadow-xs'
                  : 'bg-white hover:bg-stone-100/70 border-stone-200'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono mb-1">
                <span className="font-bold text-amber-900">Day {i + 1}</span>
                <span>{d.date || `Day ${i + 1}`}</span>
              </div>
              <p className="text-xs font-semibold text-stone-900 line-clamp-2 leading-tight">
                {d.lessonTopic}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Plans Render Body */}
      <div>
        {activeDayIndex === -1 ? (
          // Render All 5 Days Sequentially
          <div className="divide-y-8 divide-stone-100">
            {weeklyPlan.days.map((day, idx) => renderSingleDayPlan(day, idx))}
          </div>
        ) : (
          // Render Single Selected Day
          renderSingleDayPlan(currentDay, activeDayIndex)
        )}
      </div>
    </div>
  );
};
