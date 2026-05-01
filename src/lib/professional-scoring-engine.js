/**
 * Professional Scoring Engine
 * Layer 1 - Layer 5 Implementation
 */

// Layer 1 - Response Processing
export const tokenizeWords = (text) => {
  if (!text) return [];
  return text.toLowerCase().replace(/[.,?!]/g, '').split(/\s+/).filter(w => w.length > 0);
};

export const detectVerbs = (words) => {
  const commonVerbs = new Set(['is', 'are', 'was', 'were', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'go', 'goes', 'went', 'come', 'comes', 'came']);
  return words.some(w => commonVerbs.has(w));
};

export const normalizeTranscript = (transcript) => {
  if (!transcript) return { words: [], verbsPresent: false, sentenceCount: 0 };
  const cleaned = transcript.toLowerCase().replace(/\b(uh|um|eh|hmm|like)\b/g, ' ').replace(/\s+/g, ' ').trim();
  const words = tokenizeWords(cleaned);
  const sentenceCount = (transcript.match(/[.!?]+/g) || []).length || 1;
  return {
    normalized: cleaned,
    words,
    verbsPresent: detectVerbs(words),
    sentenceCount
  };
};

// Layer 2 - Skill Analysis
export const pronunciationScore = (transcript, expectedText) => {
  const t = normalizeTranscript(transcript);
  const e = normalizeTranscript(expectedText);
  if (t.words.length === 0 || e.words.length === 0) return 0;
  
  const matches = t.words.filter(w => e.words.includes(w)).length;
  const ratio = matches / Math.max(e.words.length, 1);
  let score = ratio * 100;
  if (ratio < 0.5) score -= 10; // Penalty for skipped content
  return Math.max(0, Math.min(100, score));
};

export const fluencyScore = (transcript, expectedText, duration) => {
  const t = normalizeTranscript(transcript);
  if (t.words.length === 0) return 0;
  
  const durSecs = duration > 0 ? duration : Math.max(1, t.words.length * 0.5);
  const wps = t.words.length / (durSecs / 60); // words per minute actually
  const expectedWpm = 150;
  
  let score = (wps / expectedWpm) * 100;
  if (t.words.length < 3) score -= 20; // Penalty for very short
  return Math.max(0, Math.min(100, score));
};

export const grammarScore = (transcript, expectedText) => {
  const t = normalizeTranscript(transcript);
  const e = normalizeTranscript(expectedText);
  if (t.words.length === 0) return 0;
  
  let score = 50; // Base score
  if (t.verbsPresent) score += 25;
  if (t.words.length > 2) score += 25; // Subject proxy
  
  // Tense mismatch / missing aux proxy
  const tWords = new Set(t.words);
  const aux = ['should', 'could', 'would', 'have', 'had'];
  const expectedAux = e.words.filter(w => aux.includes(w));
  const missingAux = expectedAux.filter(w => !tWords.has(w));
  score -= (missingAux.length * 10);
  
  return Math.max(0, Math.min(100, score));
};

export const vocabularyScore = (transcript, expectedText) => {
  const t = normalizeTranscript(transcript);
  if (t.words.length === 0) return 0;
  
  const uniqueWords = new Set(t.words);
  let diversity = uniqueWords.size / t.words.length;
  let score = diversity * 100;
  
  // Repetition penalty
  const counts = {};
  t.words.forEach(w => counts[w] = (counts[w] || 0) + 1);
  Object.values(counts).forEach(c => {
    if (c > 3) score -= 5;
  });
  
  if (t.words.length > 10) score += 10; // CEFR frequency proxy
  return Math.max(0, Math.min(100, score));
};

export const listeningScore = (transcript, expectedText) => {
  const t = normalizeTranscript(transcript);
  const e = normalizeTranscript(expectedText);
  if (t.words.length === 0 || e.words.length === 0) return 0;
  
  const matches = t.words.filter(w => e.words.includes(w)).length;
  let score = (matches / e.words.length) * 100;
  
  const functionWords = new Set(['the', 'a', 'is', 'are', 'in', 'on', 'at']);
  const tFunc = t.words.filter(w => functionWords.has(w)).length;
  const eFunc = e.words.filter(w => functionWords.has(w)).length;
  
  if (eFunc > 0 && tFunc === eFunc) score += 10;
  return Math.max(0, Math.min(100, score));
};

// Layer 3 - Weighted Model
export const computeWeightedScore = (subscores) => {
  return (
    (subscores.listening * 0.30) +
    (subscores.grammar * 0.25) +
    (subscores.fluency * 0.20) +
    (subscores.pronunciation * 0.15) +
    (subscores.vocabulary * 0.10)
  );
};

// Layer 4 - Scale Conversion
export const scaleScore = (rawScore) => {
  return Math.round(20 + (rawScore * 0.6));
};

export const mapToCEFR = (scaledScore) => {
  if (scaledScore >= 76) return 'C2';
  if (scaledScore >= 70) return 'C1';
  if (scaledScore >= 60) return 'B2';
  if (scaledScore >= 50) return 'B1+';
  if (scaledScore >= 40) return 'B1-';
  if (scaledScore >= 30) return 'A2';
  return 'A1';
};

// Layer 5 - Output Format
export const generateDiagnosticFeedback = (subscores, transcript, expectedText) => {
  const feedback = [];
  if (subscores.grammar < 50) feedback.push("Grammar: Focus on sentence structure and verb tenses.");
  if (subscores.vocabulary < 50) feedback.push("Vocabulary: Try to use a wider variety of words.");
  if (subscores.listening < 50) feedback.push("Listening: Practice catching key details and function words.");
  if (subscores.fluency < 50) feedback.push("Fluency: Work on speaking at a steady, natural pace.");
  if (subscores.pronunciation < 50) feedback.push("Pronunciation: Focus on clear articulation of words.");
  if (feedback.length === 0) feedback.push("Great job! All skills are developing well.");
  return feedback;
};

export const computeProfessionalScore = (transcript, expectedText, duration = 0) => {
  const t = transcript || '';
  const e = expectedText || '';
  
  const subscores = {
    pronunciation: pronunciationScore(t, e),
    fluency: fluencyScore(t, e, duration),
    grammar: grammarScore(t, e),
    vocabulary: vocabularyScore(t, e),
    listening: listeningScore(t, e)
  };
  
  const rawScore = computeWeightedScore(subscores);
  const scaledScore = scaleScore(rawScore);
  const cefr = mapToCEFR(scaledScore);
  const diagnosticFeedback = generateDiagnosticFeedback(subscores, t, e);
  
  return {
    scaledScore,
    cefr,
    subscores,
    diagnosticFeedback,
    rawScore
  };
};