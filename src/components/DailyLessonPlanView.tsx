import React, { useState } from 'react';
import { DailyLessonPlanData } from '../types';
import { Printer, Copy, Check, Bookmark, Edit3, Eye, RotateCcw, Download } from 'lucide-react';
import { exportLessonPlanToDocx } from '../utils/docxExport';

interface DailyLessonPlanViewProps {
  plan: DailyLessonPlanData;
  onUpdatePlan?: (updated: DailyLessonPlanData) => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export const DailyLessonPlanView: React.FC<DailyLessonPlanViewProps> = ({
  plan: initialPlan,
  onUpdatePlan,
  onSave,
  isSaved,
}) => {
  const [plan, setPlan] = useState<DailyLessonPlanData>(initialPlan);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync if prop changes
  React.useEffect(() => {
    setPlan(initialPlan);
  }, [initialPlan]);

  const handleChange = (field: keyof DailyLessonPlanData, value: any) => {
    const updated = { ...plan, [field]: value };
    setPlan(updated);
    if (onUpdatePlan) onUpdatePlan(updated);
  };

  const handleStageChange = (idx: number, field: string, value: string) => {
    const updatedStages = [...plan.stages];
    updatedStages[idx] = { ...updatedStages[idx], [field]: value };
    const updated = { ...plan, stages: updatedStages };
    setPlan(updated);
    if (onUpdatePlan) onUpdatePlan(updated);
  };

  const handleSpecialNeedsChange = (key: 'slowLearners' | 'mediumLearners' | 'fastLearners', value: string) => {
    const updated = {
      ...plan,
      specialNeedsSupport: {
        ...plan.specialNeedsSupport,
        [key]: value,
      },
    };
    setPlan(updated);
    if (onUpdatePlan) onUpdatePlan(updated);
  };

  const handleCopyText = () => {
    const textRepresentation = `Daily Lesson Plan

Name of teacher:- ${plan.teacherName}    Name of School:- ${plan.schoolName}
Subject:- ${plan.subject}    Unit and topic:- ${plan.unitAndTopic}
Grade and Section:- ${plan.gradeAndSection}    Lesson topic:- ${plan.lessonTopic}
Date:- ${plan.date}

Rationale of the topic:- ${plan.rationale}
Pre-requisite knowledge:- ${plan.prerequisiteKnowledge}
Competencies (Learning objectives):- ${plan.competencies}

Stages | Time | Contents | Page | Teacher's activities | Student's activities | Assessment | Aids | Remarks
${plan.stages
  .map(
    (s) =>
      `${s.stage} | ${s.timeAllotment} | ${s.learningContents} | ${s.page} | ${s.teacherActivities} | ${s.studentActivities} | ${s.assessmentTechniques} | ${s.teachingAids} | ${s.remarks}`
  )
  .join('\n')}

Support for learners of special needs:-
- Slow learners: ${plan.specialNeedsSupport.slowLearners}
- Medium learners: ${plan.specialNeedsSupport.mediumLearners}
- Fast learners: ${plan.specialNeedsSupport.fastLearners}

Teacher's Name:- ${plan.teacherName}    Signature:-
Dept. Head's Name:- ${plan.deptHeadName || ''}    Signature:-
Name of the Vice - principal:- ${plan.vicePrincipalName || ''}    Signature:-
Post lesson teacher's self-assessment:- ${plan.postLessonAssessment || ''}
`;

    navigator.clipboard.writeText(textRepresentation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden printable-area">
      {/* Actions Bar (hidden in print) */}
      <div className="bg-stone-100/90 border-b border-stone-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="font-bold text-stone-800 text-sm">ዕለታዊ የትምህርት እቅድ (Daily Lesson Plan Format)</span>
          <span className="text-xs text-stone-500 hidden sm:inline">• Official MoE Primary Table</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
              isEditing
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-300'
            }`}
          >
            {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            <span>{isEditing ? 'View Mode (አሳይ)' : 'Edit Cells (አስተካክል)'}</span>
          </button>

          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 rounded-xl transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {onSave && (
            <button
              onClick={onSave}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-sm"
            >
              {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'Saved!' : 'Save Plan'}</span>
            </button>
          )}

          <button
            onClick={() => exportLessonPlanToDocx(plan)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shadow-md shadow-blue-600/20"
            title="Download formatted Microsoft Word .docx file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .Docx (ዎርድ ፋይል)</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white rounded-xl transition shadow"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official Plan</span>
          </button>
        </div>
      </div>

      {/* Official Paper Canvas */}
      <div className="p-6 md:p-12 text-stone-900 font-sans text-xs sm:text-sm leading-relaxed max-w-5xl mx-auto">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold italic tracking-wide text-stone-900">
            Daily Lesson Plan
          </h1>
          {plan.subject?.toLowerCase().includes('amharic') && (
            <div className="text-sm font-amharic font-semibold text-stone-600">
              ዕለታዊ የትምህርት እቅድ
            </div>
          )}
        </div>

        {/* Top Two-Column Information Fields */}
        <div className="space-y-2 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
            <div>
              <span className="italic font-medium">Name of teacher:- </span>
              {isEditing ? (
                <input
                  type="text"
                  value={plan.teacherName}
                  onChange={(e) => handleChange('teacherName', e.target.value)}
                  className="border-b border-amber-500 font-semibold px-1 py-0.5 w-60 focus:outline-none"
                />
              ) : (
                <span className="font-semibold">{plan.teacherName || '________________________'}</span>
              )}
            </div>

            <div>
              <span className="italic font-medium">Name of School:- </span>
              {isEditing ? (
                <input
                  type="text"
                  value={plan.schoolName}
                  onChange={(e) => handleChange('schoolName', e.target.value)}
                  className="border-b border-amber-500 font-semibold px-1 py-0.5 w-60 focus:outline-none"
                />
              ) : (
                <span className="font-semibold uppercase">{plan.schoolName || '________________________________'}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
            <div>
              <span className="italic font-medium">Subject:- </span>
              {isEditing ? (
                <input
                  type="text"
                  value={plan.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  className="border-b border-amber-500 px-1 py-0.5 w-48 focus:outline-none"
                />
              ) : (
                <span>{plan.subject || '____________________'}</span>
              )}
            </div>

            <div>
              <span className="italic font-medium">Unit and topic:- </span>
              {isEditing ? (
                <input
                  type="text"
                  value={plan.unitAndTopic}
                  onChange={(e) => handleChange('unitAndTopic', e.target.value)}
                  className="border-b border-amber-500 px-1 py-0.5 w-60 focus:outline-none"
                />
              ) : (
                <span>{plan.unitAndTopic || '________________________'}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
            <div>
              <span className="italic font-medium">Grade and Section:- </span>
              {isEditing ? (
                <input
                  type="text"
                  value={plan.gradeAndSection}
                  onChange={(e) => handleChange('gradeAndSection', e.target.value)}
                  className="border-b border-amber-500 px-1 py-0.5 w-40 focus:outline-none"
                />
              ) : (
                <span>{plan.gradeAndSection || '____________'}</span>
              )}
            </div>

            <div>
              <span className="italic font-medium">Lesson topic:- </span>
              {isEditing ? (
                <input
                  type="text"
                  value={plan.lessonTopic}
                  onChange={(e) => handleChange('lessonTopic', e.target.value)}
                  className="border-b border-amber-500 px-1 py-0.5 w-60 focus:outline-none"
                />
              ) : (
                <span>{plan.lessonTopic || '________________________'}</span>
              )}
            </div>
          </div>

          <div>
            <span className="italic font-medium">Date:- </span>
            {isEditing ? (
              <input
                type="text"
                value={plan.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="border-b border-amber-500 px-1 py-0.5 w-64 focus:outline-none"
              />
            ) : (
              <span>{plan.date || '____________________'}</span>
            )}
          </div>

          <div className="pt-2 space-y-1">
            <p>
              <span className="italic font-medium">Rationale of the topic:- </span>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={plan.rationale}
                  onChange={(e) => handleChange('rationale', e.target.value)}
                  className="w-full border border-amber-400 p-1 rounded focus:outline-none"
                />
              ) : (
                <span>{plan.rationale || '________________________________________________________________'}</span>
              )}
            </p>

            <p>
              <span className="italic font-medium">Pre-requisite knowledge:- </span>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={plan.prerequisiteKnowledge}
                  onChange={(e) => handleChange('prerequisiteKnowledge', e.target.value)}
                  className="w-full border border-amber-400 p-1 rounded focus:outline-none"
                />
              ) : (
                <span>{plan.prerequisiteKnowledge || '________________________________________________________________'}</span>
              )}
            </p>

            <p>
              <span className="italic font-medium">Competencies (Learning objectives):- </span>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={plan.competencies}
                  onChange={(e) => handleChange('competencies', e.target.value)}
                  className="w-full border border-amber-400 p-1 rounded focus:outline-none"
                />
              ) : (
                <span>{plan.competencies || '________________________________________________________________'}</span>
              )}
            </p>
          </div>
        </div>

        {/* 9-Column Daily Lesson Plan Table */}
        <div className="overflow-x-auto my-6 border border-stone-800">
          <table className="w-full border-collapse text-[11px] sm:text-xs">
            <thead>
              <tr className="bg-stone-200/90 border-b border-stone-800 text-stone-900 font-bold italic text-center text-[10px] sm:text-xs">
                <th className="border-r border-stone-800 p-2 min-w-[90px]">
                  <div>Stages</div>
                  <div className="text-[9px] font-normal not-italic font-amharic text-stone-600">(ደረጃዎች)</div>
                </th>
                <th className="border-r border-stone-800 p-2 min-w-[55px]">
                  <div>Time</div>
                  <div className="text-[9px] font-normal not-italic font-amharic text-stone-600">(ጊዜ)</div>
                </th>
                <th className="border-r border-stone-800 p-2 min-w-[95px]">
                  <div>Learning Contents</div>
                  <div className="text-[9px] font-normal not-italic font-amharic text-stone-600">(የትምህርት ይዘት)</div>
                </th>
                <th className="border-r border-stone-800 p-2 min-w-[40px]">
                  <div>Page</div>
                  <div className="text-[9px] font-normal not-italic font-amharic text-stone-600">(ገጽ)</div>
                </th>
                <th className="border-r border-stone-800 p-2 min-w-[150px]">
                  <div>Teacher's activities</div>
                  <div className="text-[9px] font-normal not-italic font-amharic text-stone-600">(የመምህሩ ተግባራት)</div>
                </th>
                <th className="border-r border-stone-800 p-2 min-w-[140px]">
                  <div>Student's activities</div>
                  <div className="text-[9px] font-normal not-italic font-amharic text-stone-600">(የተማሪው ተግባራት)</div>
                </th>
                <th className="border-r border-stone-800 p-2 min-w-[90px]">
                  <div>Assessment</div>
                  <div className="text-[9px] font-normal not-italic font-amharic text-stone-600">(የምዘና ዘዴዎች)</div>
                </th>
                <th className="border-r border-stone-800 p-2 min-w-[85px]">
                  <div>Teaching Aids</div>
                  <div className="text-[9px] font-normal not-italic font-amharic text-stone-600">(ማስተማሪያ መርጃ)</div>
                </th>
                <th className="p-2 min-w-[55px]">
                  <div>Remarks</div>
                  <div className="text-[9px] font-normal not-italic font-amharic text-stone-600">(አስተያየት)</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800 align-top">
              {plan.stages.map((row, idx) => (
                <tr key={idx} className="divide-x divide-stone-800">
                  <td className="p-2 font-medium">
                    {isEditing ? (
                      <input
                        type="text"
                        value={row.stage}
                        onChange={(e) => handleStageChange(idx, 'stage', e.target.value)}
                        className="w-full border border-amber-300 p-1 rounded"
                      />
                    ) : (
                      <span>{row.stage}</span>
                    )}
                  </td>

                  <td className="p-2 text-center">
                    {isEditing ? (
                      <input
                        type="text"
                        value={row.timeAllotment}
                        onChange={(e) => handleStageChange(idx, 'timeAllotment', e.target.value)}
                        className="w-full border border-amber-300 p-1 rounded text-center"
                      />
                    ) : (
                      <span>{row.timeAllotment}</span>
                    )}
                  </td>

                  <td className="p-2">
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={row.learningContents}
                        onChange={(e) => handleStageChange(idx, 'learningContents', e.target.value)}
                        className="w-full border border-amber-300 p-1 rounded"
                      />
                    ) : (
                      <span>{row.learningContents}</span>
                    )}
                  </td>

                  <td className="p-2 text-center">
                    {isEditing ? (
                      <input
                        type="text"
                        value={row.page}
                        onChange={(e) => handleStageChange(idx, 'page', e.target.value)}
                        className="w-full border border-amber-300 p-1 rounded text-center"
                      />
                    ) : (
                      <span>{row.page}</span>
                    )}
                  </td>

                  <td className="p-2">
                    {isEditing ? (
                      <textarea
                        rows={4}
                        value={row.teacherActivities}
                        onChange={(e) => handleStageChange(idx, 'teacherActivities', e.target.value)}
                        className="w-full border border-amber-300 p-1 rounded"
                      />
                    ) : (
                      <span>{row.teacherActivities}</span>
                    )}
                  </td>

                  <td className="p-2">
                    {isEditing ? (
                      <textarea
                        rows={4}
                        value={row.studentActivities}
                        onChange={(e) => handleStageChange(idx, 'studentActivities', e.target.value)}
                        className="w-full border border-amber-300 p-1 rounded"
                      />
                    ) : (
                      <span>{row.studentActivities}</span>
                    )}
                  </td>

                  <td className="p-2">
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={row.assessmentTechniques}
                        onChange={(e) => handleStageChange(idx, 'assessmentTechniques', e.target.value)}
                        className="w-full border border-amber-300 p-1 rounded"
                      />
                    ) : (
                      <span>{row.assessmentTechniques}</span>
                    )}
                  </td>

                  <td className="p-2">
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={row.teachingAids}
                        onChange={(e) => handleStageChange(idx, 'teachingAids', e.target.value)}
                        className="w-full border border-amber-300 p-1 rounded"
                      />
                    ) : (
                      <span>{row.teachingAids}</span>
                    )}
                  </td>

                  <td className="p-2 text-center">
                    {isEditing ? (
                      <input
                        type="text"
                        value={row.remarks}
                        onChange={(e) => handleStageChange(idx, 'remarks', e.target.value)}
                        className="w-full border border-amber-300 p-1 rounded text-center"
                      />
                    ) : (
                      <span>{row.remarks}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Support for learners of special needs */}
        <div className="my-6 space-y-1.5">
          <h4 className="italic font-bold">Support for learners of special needs:-</h4>
          <p className="pl-4">
            <span className="font-medium">- Slow learners: </span>
            {isEditing ? (
              <input
                type="text"
                value={plan.specialNeedsSupport.slowLearners}
                onChange={(e) => handleSpecialNeedsChange('slowLearners', e.target.value)}
                className="border-b border-amber-500 w-full px-1 py-0.5 focus:outline-none"
              />
            ) : (
              <span>{plan.specialNeedsSupport.slowLearners}</span>
            )}
          </p>

          <p className="pl-4">
            <span className="font-medium">- Medium learners: </span>
            {isEditing ? (
              <input
                type="text"
                value={plan.specialNeedsSupport.mediumLearners}
                onChange={(e) => handleSpecialNeedsChange('mediumLearners', e.target.value)}
                className="border-b border-amber-500 w-full px-1 py-0.5 focus:outline-none"
              />
            ) : (
              <span>{plan.specialNeedsSupport.mediumLearners}</span>
            )}
          </p>

          <p className="pl-4">
            <span className="font-medium">- Fast learners: </span>
            {isEditing ? (
              <input
                type="text"
                value={plan.specialNeedsSupport.fastLearners}
                onChange={(e) => handleSpecialNeedsChange('fastLearners', e.target.value)}
                className="border-b border-amber-500 w-full px-1 py-0.5 focus:outline-none"
              />
            ) : (
              <span>{plan.specialNeedsSupport.fastLearners}</span>
            )}
          </p>
        </div>

        {/* Bottom Signatures Table */}
        <div className="my-6 border border-stone-800">
          <table className="w-full border-collapse text-xs">
            <tbody className="divide-y divide-stone-800">
              <tr className="divide-x divide-stone-800">
                <td className="p-2 w-1/2">
                  <span className="font-medium">Teacher's Name:- </span>
                  <span className="font-bold">{plan.teacherName || '________________________'}</span>
                </td>
                <td className="p-2 w-1/2">
                  <span className="font-medium">Signature:- ________________________</span>
                </td>
              </tr>

              <tr className="divide-x divide-stone-800">
                <td className="p-2 w-1/2">
                  <span className="font-medium">Dept. Head's Name:- </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={plan.deptHeadName || ''}
                      onChange={(e) => handleChange('deptHeadName', e.target.value)}
                      placeholder="Name..."
                      className="border-b border-amber-500 px-1 w-48 focus:outline-none"
                    />
                  ) : (
                    <span>{plan.deptHeadName || '________________________'}</span>
                  )}
                </td>
                <td className="p-2 w-1/2">
                  <span className="font-medium">Signature:- ________________________</span>
                </td>
              </tr>

              <tr className="divide-x divide-stone-800">
                <td className="p-2 w-1/2">
                  <span className="font-medium">Name of the Vice - principal:- </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={plan.vicePrincipalName || ''}
                      onChange={(e) => handleChange('vicePrincipalName', e.target.value)}
                      placeholder="Name..."
                      className="border-b border-amber-500 px-1 w-48 focus:outline-none"
                    />
                  ) : (
                    <span>{plan.vicePrincipalName || '________________________'}</span>
                  )}
                </td>
                <td className="p-2 w-1/2">
                  <span className="font-medium">Signature:- ________________________</span>
                </td>
              </tr>

              <tr className="divide-x divide-stone-800">
                <td className="p-2 w-1/2">
                  <span className="font-medium">Post lesson teacher's self-assessment:- </span>
                </td>
                <td className="p-2 w-1/2 min-h-[40px]">
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={plan.postLessonAssessment || ''}
                      onChange={(e) => handleChange('postLessonAssessment', e.target.value)}
                      placeholder="Teacher's reflection..."
                      className="w-full border border-amber-300 p-1 rounded"
                    />
                  ) : (
                    <span>{plan.postLessonAssessment || ''}</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
