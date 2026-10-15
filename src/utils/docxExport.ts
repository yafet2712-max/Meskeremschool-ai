import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  PageBreak,
} from 'docx';
import { DailyLessonPlanData, WeeklyUnitPlanData } from '../types';

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const tableBorder = {
  style: BorderStyle.SINGLE,
  size: 6,
  color: '444444',
};

const cellBorders = {
  top: tableBorder,
  bottom: tableBorder,
  left: tableBorder,
  right: tableBorder,
};

export async function exportLessonPlanToDocx(plan: DailyLessonPlanData): Promise<void> {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 0.5 inch
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: [
          // Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: 'Daily Lesson Plan',
                bold: true,
                italics: true,
                size: 32, // 16pt
                font: 'Arial',
              }),
            ],
          }),

          // Metadata Grid (Two columns simulated with text runs)
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: 'Name of teacher:- ', italics: true }),
              new TextRun({ text: `${plan.teacherName || '________________________'}       `, bold: true }),
              new TextRun({ text: 'Name of School:- ', italics: true }),
              new TextRun({ text: `${plan.schoolName || '________________________________'}`, bold: true }),
            ],
          }),

          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: 'Subject:- ', italics: true }),
              new TextRun({ text: `${plan.subject || '____________________'}       ` }),
              new TextRun({ text: 'Unit and topic:- ', italics: true }),
              new TextRun({ text: `${plan.unitAndTopic || '________________________'}` }),
            ],
          }),

          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: 'Grade and Section:- ', italics: true }),
              new TextRun({ text: `${plan.gradeAndSection || '____________'}       ` }),
              new TextRun({ text: 'Lesson topic:- ', italics: true }),
              new TextRun({ text: `${plan.lessonTopic || '________________________'}` }),
            ],
          }),

          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({ text: 'Date:- ', italics: true }),
              new TextRun({ text: `${plan.date || '____________________'}` }),
            ],
          }),

          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: 'Rationale of the topic:- ', italics: true }),
              new TextRun({ text: `${plan.rationale || ''}` }),
            ],
          }),

          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: 'Pre-requisite knowledge:- ', italics: true }),
              new TextRun({ text: `${plan.prerequisiteKnowledge || ''}` }),
            ],
          }),

          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({ text: 'Competencies (Learning objectives):- ', italics: true }),
              new TextRun({ text: `${plan.competencies || ''}` }),
            ],
          }),

          // Main 9-column Stages Table
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              // Header Row
              new TableRow({
                tableHeader: true,
                children: [
                  createHeaderCell('Stages\n(ደረጃዎች)', 14),
                  createHeaderCell('Time\n(ጊዜ)', 8),
                  createHeaderCell('Learning Contents\n(የትምህርት ይዘት)', 14),
                  createHeaderCell('Page\n(ገጽ)', 6),
                  createHeaderCell("Teacher's activities\n(የመምህሩ ተግባራት)", 20),
                  createHeaderCell("Student's activities\n(የተማሪው ተግባራት)", 18),
                  createHeaderCell('Assessment\n(የምዘና ዘዴዎች)', 10),
                  createHeaderCell('Teaching Aids\n(መርጃዎች)', 10),
                  createHeaderCell('Remarks\n(አስተያየት)', 5),
                ],
              }),

              // Dynamic Stages Rows
              ...plan.stages.map(
                (stage) =>
                  new TableRow({
                    children: [
                      createBodyCell(stage.stage, 14, true),
                      createBodyCell(stage.timeAllotment, 8, false, AlignmentType.CENTER),
                      createBodyCell(stage.learningContents, 14),
                      createBodyCell(stage.page, 6, false, AlignmentType.CENTER),
                      createBodyCell(stage.teacherActivities, 20),
                      createBodyCell(stage.studentActivities, 18),
                      createBodyCell(stage.assessmentTechniques, 10),
                      createBodyCell(stage.teachingAids, 10),
                      createBodyCell(stage.remarks, 5, false, AlignmentType.CENTER),
                    ],
                  })
              ),
            ],
          }),

          // Support for Learners of Special Needs
          new Paragraph({
            spacing: { before: 240, after: 80 },
            children: [
              new TextRun({
                text: 'Support for learners of special needs (ለልዩ ፍላጎት ተማሪዎች የሚደረግ ድጋፍ):-',
                italics: true,
                bold: true,
              }),
            ],
          }),

          new Paragraph({
            spacing: { after: 60 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: '- Slow learners: ', bold: true }),
              new TextRun({ text: plan.specialNeedsSupport?.slowLearners || 'Provide extra practice, repetition, and simplified tasks with peer support.' }),
            ],
          }),

          new Paragraph({
            spacing: { after: 60 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: '- Medium learners: ', bold: true }),
              new TextRun({ text: plan.specialNeedsSupport?.mediumLearners || 'Standard pace activities as planned above.' }),
            ],
          }),

          new Paragraph({
            spacing: { after: 240 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: '- Fast learners: ', bold: true }),
              new TextRun({ text: plan.specialNeedsSupport?.fastLearners || 'Provide enrichment tasks such as extra vocabulary or short extension exercises.' }),
            ],
          }),

          // Bottom Signatures Table
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              new TableRow({
                children: [
                  createSignatureCell(`Teacher's Name:- ${plan.teacherName || '________________________'}`),
                  createSignatureCell('Signature:- ________________________'),
                ],
              }),
              new TableRow({
                children: [
                  createSignatureCell(`Dept. Head's Name:- ${plan.deptHeadName || '________________________'}`),
                  createSignatureCell('Signature:- ________________________'),
                ],
              }),
              new TableRow({
                children: [
                  createSignatureCell(`Name of the Vice - principal:- ${plan.vicePrincipalName || '________________________'}`),
                  createSignatureCell('Signature:- ________________________'),
                ],
              }),
              new TableRow({
                children: [
                  createSignatureCell('Post lesson teacher\'s self-assessment:-'),
                  createSignatureCell(plan.postLessonAssessment || ''),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const sanitizedTitle = (plan.lessonTopic || plan.unitAndTopic || 'Lesson_Plan')
    .replace(/[^a-zA-Z0-9_\u1200-\u137F]/g, '_')
    .slice(0, 30);
  saveBlob(blob, `Daily_Lesson_Plan_${sanitizedTitle}.docx`);
}

export async function exportTextOrQuizToDocx(
  title: string,
  content: string,
  schoolName?: string
): Promise<void> {
  const paragraphs = content.split('\n').map((line) => {
    const isHeading1 = line.startsWith('# ');
    const isHeading2 = line.startsWith('## ');
    const isHeading3 = line.startsWith('### ');

    const cleanText = line.replace(/^#+\s*/, '');
    const isBold = line.startsWith('**') || isHeading1 || isHeading2;

    return new Paragraph({
      heading: isHeading1
        ? HeadingLevel.HEADING_1
        : isHeading2
        ? HeadingLevel.HEADING_2
        : isHeading3
        ? HeadingLevel.HEADING_3
        : undefined,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: cleanText,
          bold: isBold,
          size: isHeading1 ? 28 : isHeading2 ? 24 : 22,
          font: 'Arial',
        }),
      ],
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: schoolName || 'Primary School Assessment',
                bold: true,
                size: 28,
                font: 'Arial',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: title,
                bold: true,
                italics: true,
                size: 24,
                font: 'Arial',
              }),
            ],
          }),
          ...paragraphs,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const sanitizedTitle = title.replace(/[^a-zA-Z0-9_\u1200-\u137F]/g, '_').slice(0, 35);
  saveBlob(blob, `${sanitizedTitle}.docx`);
}

function createHeaderCell(text: string, widthPercent: number): TableCell {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    borders: cellBorders,
    shading: { fill: 'E5E7EB' },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 60 },
        children: [
          new TextRun({
            text,
            bold: true,
            italics: true,
            size: 18, // 9pt
            font: 'Arial',
          }),
        ],
      }),
    ],
  });
}

function createBodyCell(
  text: string,
  widthPercent: number,
  bold = false,
  alignment: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT
): TableCell {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    borders: cellBorders,
    children: [
      new Paragraph({
        alignment,
        spacing: { before: 60, after: 60 },
        children: [
          new TextRun({
            text: text || '-',
            bold,
            size: 18, // 9pt
            font: 'Arial',
          }),
        ],
      }),
    ],
  });
}

function createSignatureCell(text: string): TableCell {
  return new TableCell({
    width: { size: 50, type: WidthType.PERCENTAGE },
    borders: cellBorders,
    children: [
      new Paragraph({
        spacing: { before: 80, after: 80 },
        children: [
          new TextRun({
            text,
            size: 20, // 10pt
            font: 'Arial',
          }),
        ],
      }),
    ],
  });
}

function buildPlanDocumentChildren(plan: DailyLessonPlanData, dayLabel?: string): (Paragraph | Table)[] {
  return [
    // Day Title Banner
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 140 },
      children: [
        new TextRun({
          text: dayLabel ? `${dayLabel}: Daily Lesson Plan` : 'Daily Lesson Plan',
          bold: true,
          italics: true,
          size: 28, // 14pt
          font: 'Arial',
        }),
      ],
    }),

    // Metadata Grid
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: 'Name of teacher:- ', italics: true }),
        new TextRun({ text: `${plan.teacherName || '________________________'}       `, bold: true }),
        new TextRun({ text: 'Name of School:- ', italics: true }),
        new TextRun({ text: `${plan.schoolName || '________________________________'}`, bold: true }),
      ],
    }),

    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: 'Subject:- ', italics: true }),
        new TextRun({ text: `${plan.subject || '____________________'}       ` }),
        new TextRun({ text: 'Unit and topic:- ', italics: true }),
        new TextRun({ text: `${plan.unitAndTopic || '________________________'}`, bold: true }),
      ],
    }),

    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: 'Grade and Section:- ', italics: true }),
        new TextRun({ text: `${plan.gradeAndSection || '____________'}       ` }),
        new TextRun({ text: 'Lesson topic:- ', italics: true }),
        new TextRun({ text: `${plan.lessonTopic || '________________________'}`, bold: true }),
      ],
    }),

    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({ text: 'Date:- ', italics: true }),
        new TextRun({ text: `${plan.date || '____________________'}` }),
      ],
    }),

    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: 'Rationale of the topic:- ', italics: true }),
        new TextRun({ text: `${plan.rationale || ''}` }),
      ],
    }),

    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: 'Pre-requisite knowledge:- ', italics: true }),
        new TextRun({ text: `${plan.prerequisiteKnowledge || ''}` }),
      ],
    }),

    new Paragraph({
      spacing: { after: 180 },
      children: [
        new TextRun({ text: 'Competencies (Learning objectives):- ', italics: true }),
        new TextRun({ text: `${plan.competencies || ''}` }),
      ],
    }),

    // Main 9-column Stages Table
    new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      rows: [
        // Header Row
        new TableRow({
          tableHeader: true,
          children: [
            createHeaderCell('Stages\n(ደረጃዎች)', 14),
            createHeaderCell('Time\n(ጊዜ)', 8),
            createHeaderCell('Learning Contents\n(የትምህርት ይዘት)', 14),
            createHeaderCell('Page\n(ገጽ)', 6),
            createHeaderCell("Teacher's activities\n(የመምህሩ ተግባራት)", 20),
            createHeaderCell("Student's activities\n(የተማሪው ተግባራት)", 18),
            createHeaderCell('Assessment\n(የምዘና ዘዴዎች)', 10),
            createHeaderCell('Teaching Aids\n(መርጃዎች)', 10),
            createHeaderCell('Remarks\n(አስተያየት)', 5),
          ],
        }),

        // Dynamic Stages Rows
        ...(plan.stages || []).map(
          (stage) =>
            new TableRow({
              children: [
                createBodyCell(stage.stage, 14, true),
                createBodyCell(stage.timeAllotment, 8, false, AlignmentType.CENTER),
                createBodyCell(stage.learningContents, 14),
                createBodyCell(stage.page, 6, false, AlignmentType.CENTER),
                createBodyCell(stage.teacherActivities, 20),
                createBodyCell(stage.studentActivities, 18),
                createBodyCell(stage.assessmentTechniques, 10),
                createBodyCell(stage.teachingAids, 10),
                createBodyCell(stage.remarks, 5, false, AlignmentType.CENTER),
              ],
            })
        ),
      ],
    }),

    // Support for Learners of Special Needs
    new Paragraph({
      spacing: { before: 200, after: 60 },
      children: [
        new TextRun({
          text: 'Support for learners of special needs (ለልዩ ፍላጎት ተማሪዎች የሚደረግ ድጋፍ):-',
          italics: true,
          bold: true,
        }),
      ],
    }),

    new Paragraph({
      spacing: { after: 50 },
      indent: { left: 360 },
      children: [
        new TextRun({ text: '- Slow learners: ', bold: true }),
        new TextRun({ text: plan.specialNeedsSupport?.slowLearners || 'Provide extra practice, repetition, and simplified tasks with peer support.' }),
      ],
    }),

    new Paragraph({
      spacing: { after: 50 },
      indent: { left: 360 },
      children: [
        new TextRun({ text: '- Medium learners: ', bold: true }),
        new TextRun({ text: plan.specialNeedsSupport?.mediumLearners || 'Standard pace activities as planned above.' }),
      ],
    }),

    new Paragraph({
      spacing: { after: 200 },
      indent: { left: 360 },
      children: [
        new TextRun({ text: '- Fast learners: ', bold: true }),
        new TextRun({ text: plan.specialNeedsSupport?.fastLearners || 'Provide enrichment tasks such as extra vocabulary or short extension exercises.' }),
      ],
    }),

    // Bottom Signatures Table
    new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      rows: [
        new TableRow({
          children: [
            createSignatureCell(`Teacher's Name:- ${plan.teacherName || '________________________'}`),
            createSignatureCell('Signature:- ________________________'),
          ],
        }),
        new TableRow({
          children: [
            createSignatureCell(`Dept. Head's Name:- ${plan.deptHeadName || '________________________'}`),
            createSignatureCell('Signature:- ________________________'),
          ],
        }),
        new TableRow({
          children: [
            createSignatureCell(`Name of the Vice - principal:- ${plan.vicePrincipalName || '________________________'}`),
            createSignatureCell('Signature:- ________________________'),
          ],
        }),
        new TableRow({
          children: [
            createSignatureCell('Post lesson teacher\'s self-assessment:-'),
            createSignatureCell(plan.postLessonAssessment || ''),
          ],
        }),
      ],
    }),
  ];
}

export async function exportWeeklyUnitPlanToDocx(weeklyPlan: WeeklyUnitPlanData): Promise<void> {
  const allChildren: (Paragraph | Table)[] = [];

  // 1. Weekly Unit Overview / Cover Section
  allChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 140 },
      children: [
        new TextRun({
          text: weeklyPlan.schoolName || 'Primary School / የመጀመሪያ ደረጃ ትምህርት ቤት',
          bold: true,
          size: 32, // 16pt
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: `Weekly Unit Lesson Plan (የሳምንታዊ ምዕራፍ የትምህርት እቅዶች - 5 Days)`,
          bold: true,
          italics: true,
          size: 26, // 13pt
          color: '0D5C3A',
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({ text: 'Unit & Topic (የምዕራፉ ርዕስ):- ', bold: true, italics: true }),
        new TextRun({ text: `${weeklyPlan.unitTopic}   `, bold: true }),
        new TextRun({ text: 'Subject (የትምህርት ዓይነት):- ', italics: true }),
        new TextRun({ text: `${weeklyPlan.subject}   ` }),
        new TextRun({ text: 'Grade (ክፍል):- ', italics: true }),
        new TextRun({ text: `${weeklyPlan.gradeLevel}` }),
      ],
    }),
    new Paragraph({
      spacing: { after: 160 },
      children: [
        new TextRun({ text: 'Teacher (መምህር):- ', italics: true }),
        new TextRun({ text: `${weeklyPlan.teacherName || '________________________'}   ` }),
        new TextRun({ text: 'Week (ሳምንት):- ', italics: true }),
        new TextRun({ text: `${weeklyPlan.weekLabel || 'Week 1'}` }),
      ],
    }),

    // 5-Day Weekly Unit Schedule Table
    new Paragraph({
      spacing: { before: 100, after: 100 },
      children: [
        new TextRun({
          text: 'Weekly Schedule Breakdown (የ5ቱ ቀናት የተያያዙ ንዑሳን ርዕሶች):-',
          bold: true,
          italics: true,
          size: 22,
        }),
      ],
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            createHeaderCell('Day (ቀን)', 18),
            createHeaderCell('Date (ቀን)', 16),
            createHeaderCell('Lesson Topic (የትምህርቱ ንዑስ ርዕስ)', 36),
            createHeaderCell('Target Competencies (ዋና ዓላማ)', 30),
          ],
        }),
        ...weeklyPlan.days.map(
          (d) =>
            new TableRow({
              children: [
                createBodyCell(d.dayName || `Day ${d.dayNumber}`, 18, true, AlignmentType.CENTER),
                createBodyCell(d.date || d.plan?.date || '-', 16, false, AlignmentType.CENTER),
                createBodyCell(d.lessonTopic || d.plan?.lessonTopic || '-', 36, true),
                createBodyCell((d.plan?.competencies || '').slice(0, 100) + '...', 30),
              ],
            })
        ),
      ],
    }),
    new Paragraph({
      spacing: { before: 200, after: 200 },
      children: [new PageBreak()],
    })
  );

  // 2. Add each of the 5 Daily Lesson Plans
  weeklyPlan.days.forEach((day, index) => {
    const dayPlanChildren = buildPlanDocumentChildren(day.plan, day.dayName || `Day ${day.dayNumber}`);
    allChildren.push(...dayPlanChildren);

    // Add page break after each day except the last one
    if (index < weeklyPlan.days.length - 1) {
      allChildren.push(
        new Paragraph({
          spacing: { before: 200, after: 200 },
          children: [new PageBreak()],
        })
      );
    }
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: allChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const sanitizedUnit = (weeklyPlan.unitTopic || 'Weekly_Unit_Plan')
    .replace(/[^a-zA-Z0-9_\u1200-\u137F]/g, '_')
    .slice(0, 30);
  saveBlob(blob, `Weekly_5Day_Unit_Plan_${sanitizedUnit}.docx`);
}
