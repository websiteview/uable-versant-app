import { computeProfessionalScore } from './professional-scoring-engine';

export const ensureNumber = (value) => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

export const preventNaN = (value, fallback = 0) => {
  return isNaN(value) ? fallback : value;
};

export const clampScore = (score) => {
  const num = ensureNumber(score);
  return Math.max(0, Math.min(1, num));
};

// Updated proxy functions to use professional engine
export const speakingScore = (transcript, expectedText, duration = 0) => {
  return computeProfessionalScore(transcript, expectedText, duration).subscores.pronunciation / 100;
};

export const dictationScore = (userAnswer, expectedText) => {
  return computeProfessionalScore(userAnswer, expectedText).subscores.listening / 100;
};

export const conversationScore = (userAnswer, expectedKeywords) => {
  const keywords = Array.isArray(expectedKeywords) ? expectedKeywords.join(' ') : expectedKeywords;
  return computeProfessionalScore(userAnswer, keywords).rawScore / 100;
};

export const sentenceCompletionScore = (userAnswer, correctAnswers) => {
  const accepted = Array.isArray(correctAnswers) ? correctAnswers[0] : correctAnswers;
  return computeProfessionalScore(userAnswer, accepted).subscores.grammar / 100;
};

export const passageReconstructionScore = (userAnswer, keyPoints) => {
  const expected = Array.isArray(keyPoints) ? keyPoints.join(' ') : keyPoints;
  return computeProfessionalScore(userAnswer, expected).rawScore / 100;
};

export const pronunciationScore = (transcript, expectedText) => {
  return computeProfessionalScore(transcript, expectedText).subscores.pronunciation / 100;
};

export const fluencyScore = (transcript, expectedText, duration = 0) => {
  return computeProfessionalScore(transcript, expectedText, duration).subscores.fluency / 100;
};

export const grammarScore = (userAnswer, expectedText) => {
  return computeProfessionalScore(userAnswer, expectedText).subscores.grammar / 100;
};

export const listeningScore = (userAnswer, expectedText) => {
  return computeProfessionalScore(userAnswer, expectedText).subscores.listening / 100;
};

export const vocabularyScore = (userAnswer, expectedText) => {
  return computeProfessionalScore(userAnswer, expectedText).subscores.vocabulary / 100;
};

export const mapQuestionTypeToSkills = (questionType) => {
  switch (questionType) {
    case "repeat-sentence": return { pronunciation: 0.4, grammar: 0.3, fluency: 0.3 };
    case "dictation": return { listening: 0.5, grammar: 0.3, vocabulary: 0.2 };
    case "read-aloud": return { pronunciation: 0.6, fluency: 0.4 };
    case "conversation": return { grammar: 0.4, vocabulary: 0.3, fluency: 0.3 };
    case "listening-comprehension": return { listening: 1.0 };
    case "reading-comprehension": return { vocabulary: 0.6, grammar: 0.4 };
    case "sentence-completion": return { grammar: 0.7, vocabulary: 0.3 };
    case "passage-reconstruction": return { grammar: 0.5, vocabulary: 0.3, fluency: 0.2 };
    case "short-answer": return { vocabulary: 0.6, grammar: 0.4 };
    case "sentence-build": return { grammar: 0.6, vocabulary: 0.4 };
    default: return { listening: 0.2, grammar: 0.2, vocabulary: 0.2, fluency: 0.2, pronunciation: 0.2 };
  }
};

export const computeSkillSubscores = (answers, questions) => {
  const totals = { pronunciation: 0, fluency: 0, grammar: 0, listening: 0, vocabulary: 0 };
  let count = 0;
  
  questions.forEach(question => {
    const answer = answers[question.id];
    const userText = answer ? (answer.text || answer.transcript || '') : '';
    const expectedText = question.sentence || question.correctAnswer || (question.keyPoints ? question.keyPoints.join(' ') : '') || '';
    const duration = answer ? (answer.duration || 0) : 0;
    
    // Check if the component already did the scoring
    if (answer && answer.engineResult) {
       totals.pronunciation += answer.engineResult.subscores.pronunciation;
       totals.fluency += answer.engineResult.subscores.fluency;
       totals.grammar += answer.engineResult.subscores.grammar;
       totals.listening += answer.engineResult.subscores.listening;
       totals.vocabulary += answer.engineResult.subscores.vocabulary;
    } else {
       const res = computeProfessionalScore(userText, expectedText, duration).subscores;
       totals.pronunciation += res.pronunciation;
       totals.fluency += res.fluency;
       totals.grammar += res.grammar;
       totals.listening += res.listening;
       totals.vocabulary += res.vocabulary;
    }
    count++;
  });

  if (count === 0) count = 1;
  return {
    pronunciation: Math.round(totals.pronunciation / count),
    fluency: Math.round(totals.fluency / count),
    grammar: Math.round(totals.grammar / count),
    listening: Math.round(totals.listening / count),
    vocabulary: Math.round(totals.vocabulary / count)
  };
};

export const computeOverallScore = (skillSubscores) => {
  const raw = (skillSubscores.listening * 0.30) +
              (skillSubscores.grammar * 0.25) +
              (skillSubscores.fluency * 0.20) +
              (skillSubscores.pronunciation * 0.15) +
              (skillSubscores.vocabulary * 0.10);
  return Math.round(20 + (raw * 0.6)); // scaled
};

export const getCEFRLevel = (scaledScore) => {
  if (scaledScore >= 76) return 'C2';
  if (scaledScore >= 70) return 'C1';
  if (scaledScore >= 60) return 'B2';
  if (scaledScore >= 50) return 'B1+';
  if (scaledScore >= 40) return 'B1-';
  if (scaledScore >= 30) return 'A2';
  return 'A1';
};

export const buildResultObject = (answers, questions) => {
  const subscores = computeSkillSubscores(answers, questions);
  const overall = computeOverallScore(subscores);
  const cefr = getCEFRLevel(overall);

  // Collect diagnostics
  let allDiagnostics = [];
  questions.forEach(q => {
     const ans = answers[q.id];
     if (ans && ans.engineResult && ans.engineResult.diagnosticFeedback) {
        allDiagnostics = [...allDiagnostics, ...ans.engineResult.diagnosticFeedback];
     }
  });
  
  const uniqueDiagnostics = [...new Set(allDiagnostics)];
  if (uniqueDiagnostics.length === 0) {
      if (subscores.grammar < 50) uniqueDiagnostics.push("Grammar: Focus on sentence structure and verb tenses.");
      if (subscores.vocabulary < 50) uniqueDiagnostics.push("Vocabulary: Try to use a wider variety of words.");
  }

  return {
    pronunciation: subscores.pronunciation,
    fluency: subscores.fluency,
    grammar: subscores.grammar,
    listening: subscores.listening,
    vocabulary: subscores.vocabulary,
    overall: overall,
    cefr: cefr,
    score: overall,
    diagnosticFeedback: uniqueDiagnostics
  };
};