export const exportToExcel = (students, teacherName) => {
  const headers = [
    'Student Name', 
    'Email', 
    'Completed Date', 
    'Test Version',
    'Overall Score', 
    'CEFR Level', 
    'Proficiency %', 
    'Pronunciation', 
    'Grammar', 
    'Vocabulary', 
    'Comprehension'
  ];
  
  let csvContent = headers.join(',') + '\n';
  
  students.forEach(student => {
    const row = [
      `"${student.fullName}"`,
      student.email,
      new Date(student.submittedAt).toLocaleDateString(),
      student.version || 'N/A',
      student.score.overallScore,
      student.score.cefrLevel,
      student.score.proficiencyPercentage,
      student.score.subScores.pronunciation,
      student.score.subScores.grammar,
      student.score.subScores.vocabulary,
      student.score.subScores.comprehension
    ];
    csvContent += row.join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${teacherName}_student_results_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};