import { generateVersion } from './versant-versions';
import { 
  getCEFRLevel,
  ensureNumber,
  buildResultObject
} from './scoring-helpers';

export const getTestQuestions = (version = 1) => {
  return generateVersion(version);
};

export const getProficiencyLevel = (score) => {
  return getCEFRLevel(score);
};

export const calculateScore = (answers, questions) => {
  const breakdown = {};
  const parts = [...new Set(questions.map(q => q.section))];
  
  parts.forEach(part => {
    breakdown[part] = {
      total: 0, answered: 0, unanswered: 0, correct: 0, incorrect: 0, pointsEarned: 0, pointsPossible: 0
    };
  });

  questions.forEach(question => {
    const sectionStats = breakdown[question.section];
    sectionStats.total++;
    const answer = answers[question.id];

    if (answer && ((answer.text && answer.text.trim().length > 0) || (answer.recorded && ensureNumber(answer.duration) > 0))) {
      sectionStats.answered++;
      sectionStats.correct++; 
    } else {
      sectionStats.unanswered++;
      sectionStats.incorrect++;
    }
  });

  const resultObj = buildResultObject(answers, questions);

  return {
    overallScore: resultObj.overall, // This is now the scaled score (20-80)
    cefrLevel: resultObj.cefr,
    proficiencyPercentage: resultObj.overall, 
    subScores: {
      pronunciation: resultObj.pronunciation,
      fluency: resultObj.fluency,
      intonation: resultObj.pronunciation, 
      vocabulary: resultObj.vocabulary,
      grammar: resultObj.grammar,
      comprehension: resultObj.listening 
    },
    diagnosticFeedback: resultObj.diagnosticFeedback,
    breakdown 
  };
};