// Smart matching engine for AeroBot
// Uses weighted keyword scoring + Levenshtein-based fuzzy fallback

import { KNOWLEDGE, type KnowledgeEntry } from "./chatbotKnowledge";

// Stopwords to ignore
const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "i", "me", "my", "you", "your", "it", "its", "we", "they", "he", "she",
  "to", "of", "in", "on", "at", "for", "with", "by", "from", "about",
  "and", "or", "but", "if", "then", "so", "do", "does", "did", "can", "could",
  "what", "when", "where", "who", "how", "why", "which", "that", "this",
  "me", "tell", "show", "give", "please", "?", "!", ",", ".",
]);

function tokenize(s: string): string[] {
  return s.toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w));
}

// Levenshtein distance for fuzzy matching
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp: number[] = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = i - 1;
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1]
        ? prev
        : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[n];
}

function fuzzyMatch(query: string, keyword: string): number {
  const q = query.toLowerCase();
  const k = keyword.toLowerCase();
  // Exact contains match (best)
  if (q.includes(k)) return 1.0;
  if (k.includes(q)) return 0.9;
  // Fuzzy match with Levenshtein
  const dist = levenshtein(q, k);
  const maxLen = Math.max(q.length, k.length);
  const sim = 1 - dist / maxLen;
  return sim >= 0.75 ? sim * 0.7 : 0;
}

export interface Match {
  entry: KnowledgeEntry;
  score: number;
  matchedKeywords: string[];
}

export function findBestMatch(query: string, topK = 3): Match[] {
  const qLower = query.toLowerCase();
  const tokens = tokenize(query);
  const scores: Match[] = [];

  for (const entry of KNOWLEDGE) {
    let score = 0;
    const matchedKeywords: string[] = [];
    for (const kw of entry.keywords) {
      // Direct substring match on the full query (strongest signal)
      if (qLower.includes(kw.toLowerCase())) {
        // Longer keywords score higher (more specific)
        score += 2 + kw.length / 20;
        matchedKeywords.push(kw);
        continue;
      }
      // Token-level fuzzy matching
      let bestTokenScore = 0;
      for (const tok of tokens) {
        const sim = fuzzyMatch(tok, kw);
        if (sim > bestTokenScore) bestTokenScore = sim;
      }
      // Multi-word keywords get extra weight
      if (kw.includes(" ")) {
        const kwTokens = tokenize(kw);
        let hits = 0;
        for (const kt of kwTokens) {
          if (tokens.some((t) => fuzzyMatch(t, kt) > 0.85)) hits++;
        }
        if (hits === kwTokens.length) {
          score += 1.5;
          matchedKeywords.push(kw);
          continue;
        }
      }
      if (bestTokenScore > 0) {
        score += bestTokenScore;
        matchedKeywords.push(kw);
      }
    }
    if (score > 0) {
      scores.push({ entry, score, matchedKeywords });
    }
  }

  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, topK);
}

// Main answer function
export function answerQuestion(query: string): { answer: string; topic: string; followUps?: string[]; confidence: number; } {
  if (!query.trim()) {
    return {
      answer: "Ask me anything about AeroSense — noise levels, predictions, aircraft, health, carbon, or features!",
      topic: "Introduction",
      confidence: 1,
    };
  }

  const matches = findBestMatch(query);

  if (matches.length === 0) {
    return {
      answer: fallbackAnswer(query),
      topic: "General",
      followUps: ["What is AeroSense?", "Show me the heatmap", "What is safe noise?"],
      confidence: 0,
    };
  }

  const best = matches[0];
  // Normalize confidence to 0-1 range
  const confidence = Math.min(1, best.score / 3);

  return {
    answer: best.entry.answer,
    topic: best.entry.topic,
    followUps: best.entry.followUps,
    confidence,
  };
}

function fallbackAnswer(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("?")) {
    return "I don't have a specific answer for that yet. Try asking about: noise levels, AI predictions, aircraft, health guidance, carbon footprint, complaints, or how to navigate AeroSense.";
  }
  return "Hmm, I'm not sure I understood that. Try rephrasing or pick a topic below 👇";
}

// Quick starter suggestions, rotated based on context
export function suggestedStarters(): string[] {
  return [
    "What is AeroSense?",
    "Which airports do you monitor?",
    "Why is noise high today?",
    "Explain the AI prediction",
    "What is safe noise?",
    "How does the 3D twin work?",
  ];
}
