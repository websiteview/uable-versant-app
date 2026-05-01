import jsPDF from 'jspdf';
import 'jspdf-autotable';

// --- Configuration & Helpers ---
const COLORS = {
  primary: [79, 70, 229],   // Indigo-600 (Purple-ish #4F46E5)
  secondary: [147, 51, 234], // Purple-600
  accent: [99, 102, 241],    // Indigo-500
  success: [22, 163, 74],    // Green-600
  warning: [234, 88, 12],    // Orange-600
  danger: [220, 38, 38],     // Red-600
  textDark: [17, 24, 39],    // Gray-900
  textLight: [107, 114, 128],// Gray-500
  bgLight: [249, 250, 251],  // Gray-50
  white: [255, 255, 255]
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const getProficiencyColor = (level) => {
  // Returns RGB array
  switch (level) {
    case 'A1': return COLORS.danger;
    case 'A2': return COLORS.warning;
    case 'B1': return [234, 179, 8]; // Yellow-500
    case 'B2': return [59, 130, 246]; // Blue-500
    case 'C1': return COLORS.primary;
    case 'C2': return COLORS.secondary;
    default: return COLORS.textLight;
  }
};

// --- Detailed Student Report Generator ---
export const exportStudentDetailPdf = (student) => {
  const doc = new jsPDF();
  const width = doc.internal.pageSize.width;
  const height = doc.internal.pageSize.height;
  const margin = 15;
  
  let yPos = 0;

  // 1. Header Section with UAble Branding
  // --------------------------------
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, width, 40, 'F');
  
  // Branding Text: UAble (Replacing CheckMate)
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(26);
  doc.setFont(undefined, 'bold');
  doc.text("UAble", margin, 25);
  
  // Subtitle
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text("English Proficiency Assessment", margin, 32);

  // Report Title (Right Aligned)
  doc.setFontSize(14);
  doc.text("OFFICIAL STUDENT REPORT", width - margin, 25, { align: 'right' });
  
  // Generation Timestamp
  doc.setFontSize(8);
  doc.setTextColor(224, 231, 255); // Light Indigo
  doc.text(`Generated: ${formatDate(new Date().toISOString())}`, width - margin, 32, { align: 'right' });

  yPos = 55;

  // 2. Student Information & Test Meta
  // ----------------------------------
  doc.setDrawColor(229, 231, 235); // Gray-200
  doc.setFillColor(...COLORS.bgLight);
  doc.roundedRect(margin, yPos, width - (margin * 2), 32, 2, 2, 'FD');
  
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textLight);
  
  const infoCols = [
    { label: "Student Name", value: student.fullName, x: margin + 5, y: yPos + 8 },
    { label: "Test Version", value: `Ver. ${student.version}`, x: margin + 5, y: yPos + 20 },
    { label: "Test Enabled", value: formatDate(student.startedAt), x: width / 2 - 20, y: yPos + 8 },
    { label: "Test Completed", value: formatDate(student.submittedAt), x: width / 2 - 20, y: yPos + 20 },
    { label: "Result ID", value: student.id.substring(0, 12) + '...', x: width - margin - 50, y: yPos + 8 },
  ];

  infoCols.forEach(item => {
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...COLORS.textLight);
    doc.text(item.label, item.x, item.y);
    
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...COLORS.textDark);
    doc.text(item.value, item.x, item.y + 5);
  });

  yPos += 45;

  // 3. Proficiency Score & Level (Prominent)
  // ----------------------------------------
  // Left: Score Badge
  const circleX = margin + 25;
  const circleY = yPos + 15;
  
  doc.setDrawColor(...getProficiencyColor(student.score.cefrLevel));
  doc.setLineWidth(2);
  doc.circle(circleX, circleY, 18, 'S');
  
  doc.setFontSize(18);
  doc.setTextColor(...getProficiencyColor(student.score.cefrLevel));
  doc.text(`${student.score.proficiencyPercentage}%`, circleX, circleY + 2, { align: 'center' });

  // Center: Text Summary
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.textLight);
  doc.text("Overall Proficiency", margin + 55, yPos + 8);
  
  doc.setFontSize(28);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...COLORS.textDark);
  doc.text(`${student.score.cefrLevel}`, margin + 55, yPos + 20);

  // Right: CEFR Description (Short)
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...COLORS.textLight);
  const desc = `This score reflects a ${student.score.cefrLevel} level on the CEFR scale, indicating the student's ability to communicate effectively in English environments.`;
  doc.text(doc.splitTextToSize(desc, 80), width - margin - 80, yPos + 5);

  yPos += 40;

  // 4. Subscore Grid (Visual Bars)
  // ------------------------------
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text("SKILL BREAKDOWN", margin, yPos);
  
  // Divider Line
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos + 2, width - margin, yPos + 2);

  yPos += 10;

  const skills = [
    { name: "Pronunciation", score: student.score.subScores?.pronunciation || 0 },
    { name: "Fluency", score: student.score.subScores?.fluency || 0 },
    { name: "Intonation", score: student.score.subScores?.intonation || 0 },
    { name: "Vocabulary", score: student.score.subScores?.vocabulary || 0 },
    { name: "Grammar", score: student.score.subScores?.grammar || 0 },
    { name: "Comprehension", score: student.score.subScores?.comprehension || 0 },
  ];

  let colX = margin;
  let rowY = yPos;
  
  skills.forEach((skill, i) => {
    // Grid Logic: 2 columns
    if (i > 0 && i % 2 === 0) {
      rowY += 18;
      colX = margin;
    } else if (i % 2 !== 0) {
      colX = width / 2 + 5;
    }

    // Label
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.textDark);
    doc.text(skill.name, colX, rowY);
    
    // Score Value
    doc.text(`${skill.score}/100`, colX + 70, rowY, { align: 'right' });

    // Bar Background
    doc.setFillColor(229, 231, 235);
    doc.roundedRect(colX, rowY + 2, 70, 3, 1, 1, 'F');

    // Bar Fill
    let barColor = COLORS.success;
    if (skill.score < 50) barColor = COLORS.danger;
    else if (skill.score < 75) barColor = COLORS.warning;

    doc.setFillColor(...barColor);
    doc.roundedRect(colX, rowY + 2, (skill.score / 100) * 70, 3, 1, 1, 'F');
  });

  yPos = rowY + 25;

  // 5. Performance Analysis Table
  // -----------------------------
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text("PERFORMANCE ANALYSIS", margin, yPos);
  doc.line(margin, yPos + 2, width - margin, yPos + 2);

  if (student.score.breakdown) {
    const tableData = Object.entries(student.score.breakdown).map(([section, stats]) => [
      section,
      stats.correct,
      stats.incorrect,
      stats.unanswered,
      `${Math.round((stats.correct / stats.total) * 100)}%`
    ]);

    doc.autoTable({
      startY: yPos + 8,
      head: [["TEST PART", "CORRECT", "INCORRECT", "SKIPPED", "ACCURACY"]],
      body: tableData,
      theme: 'plain',
      styles: { 
        fontSize: 9, 
        cellPadding: 4, 
        textColor: COLORS.textDark,
        lineColor: [229, 231, 235],
        lineWidth: 0.1
      },
      headStyles: { 
        fillColor: COLORS.bgLight, 
        textColor: COLORS.textLight, 
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold' },
        1: { halign: 'center', textColor: COLORS.success },
        2: { halign: 'center', textColor: COLORS.danger },
        3: { halign: 'center', textColor: COLORS.warning },
        4: { halign: 'center', fontStyle: 'bold' }
      },
      margin: { left: margin, right: margin }
    });
  }

  // 6. Footer
  // ---------
  const pageCount = doc.internal.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer Line
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, height - 15, width - margin, height - 15);
    
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textLight);
    
    doc.text(`UAble Assessment Platform`, margin, height - 8);
    doc.text(`Page ${i} of ${pageCount}`, width - margin, height - 8, { align: 'right' });
  }

  const safeName = (student.fullName || 'Student').replace(/[^a-z0-9]/gi, '_');
  doc.save(`UAble_Report_${safeName}.pdf`);
};

// --- Class Summary PDF (UAble Branded) ---
export const exportToPdf = (students, teacherName) => {
  const doc = new jsPDF();
  const width = doc.internal.pageSize.width;
  const margin = 15;

  // Header with UAble Branding
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, width, 30, 'F');
  
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text("UAble Class Proficiency Summary", margin, 12);
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Instructor: ${teacherName}  |  Generated: ${formatDate(new Date().toISOString())}`, margin, 22);

  const columns = ["Student", "Level", "Score (%)", "Pron.", "Vocab.", "Gram.", "Comp.", "Date"];
  const rows = students.map(s => [
    s.fullName,
    s.score.cefrLevel,
    `${s.score.proficiencyPercentage}%`,
    s.score.subScores?.pronunciation || '-',
    s.score.subScores?.vocabulary || '-',
    s.score.subScores?.grammar || '-',
    s.score.subScores?.comprehension || '-',
    formatDate(s.submittedAt)
  ]);

  doc.autoTable({
    startY: 35,
    head: [columns],
    body: rows,
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white },
    margin: { left: margin, right: margin }
  });

  doc.save(`UAble_${teacherName}_Class_Summary.pdf`);
};