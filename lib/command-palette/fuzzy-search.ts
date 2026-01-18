/**
 * Custom Fuzzy Search Implementation
 * Deterministic scoring algorithm built from scratch
 */

import type { Command, FuzzyMatch } from './types';

interface MatchResult {
  score: number;
  indices: [number, number][];
}

/**
 * Calculate fuzzy match score between query and target string
 * Uses a deterministic algorithm with the following factors:
 * - Character position matching
 * - Consecutive character bonus
 * - Word boundary bonus
 * - Case sensitivity bonus
 */
function calculateMatchScore(query: string, target: string): MatchResult | null {
  const queryLower = query.toLowerCase();
  const targetLower = target.toLowerCase();
  
  if (queryLower.length === 0) {
    return { score: 0, indices: [] };
  }
  
  if (queryLower.length > targetLower.length) {
    return null;
  }

  const indices: [number, number][] = [];
  let score = 0;
  let queryIndex = 0;
  let lastMatchIndex = -1;
  let consecutiveBonus = 0;

  for (let i = 0; i < targetLower.length && queryIndex < queryLower.length; i++) {
    if (targetLower[i] === queryLower[queryIndex]) {
      // Base score for match
      let matchScore = 1;

      // Consecutive character bonus (exponential)
      if (lastMatchIndex === i - 1) {
        consecutiveBonus += 1;
        matchScore += consecutiveBonus * 2;
      } else {
        consecutiveBonus = 0;
      }

      // Word boundary bonus (start of word)
      if (i === 0 || /[\s\-_./]/.test(target[i - 1] ?? '')) {
        matchScore += 10;
      }

      // Case match bonus
      if (query[queryIndex] === target[i]) {
        matchScore += 1;
      }

      // Position bonus (earlier matches score higher)
      matchScore += Math.max(0, (targetLower.length - i) / targetLower.length * 5);

      // Track match indices for highlighting
      if (indices.length > 0) {
        const lastRange = indices[indices.length - 1];
        if (lastRange && lastRange[1] === i - 1) {
          lastRange[1] = i;
        } else {
          indices.push([i, i]);
        }
      } else {
        indices.push([i, i]);
      }

      score += matchScore;
      lastMatchIndex = i;
      queryIndex++;
    }
  }

  // All query characters must match
  if (queryIndex < queryLower.length) {
    return null;
  }

  // Normalize score by query length and target length
  const normalizedScore = score * (queryLower.length / targetLower.length);

  // Exact match bonus
  if (queryLower === targetLower) {
    return { score: normalizedScore + 100, indices };
  }

  // Prefix match bonus
  if (targetLower.startsWith(queryLower)) {
    return { score: normalizedScore + 50, indices };
  }

  return { score: normalizedScore, indices };
}

/**
 * Search commands using fuzzy matching
 * Returns sorted results by score (descending)
 */
export function fuzzySearchCommands(
  commands: Command[],
  query: string,
  maxResults: number = 50
): FuzzyMatch[] {
  if (!query.trim()) {
    // Return all non-hidden commands with default score
    return commands
      .filter(cmd => !cmd.hidden)
      .slice(0, maxResults)
      .map(command => ({
        command,
        score: 0,
        matches: []
      }));
  }

  const results: FuzzyMatch[] = [];

  for (const command of commands) {
    if (command.hidden || command.disabled) {
      continue;
    }

    const matches: FuzzyMatch['matches'] = [];
    let totalScore = 0;

    // Match against title (highest weight)
    const titleMatch = calculateMatchScore(query, command.title);
    if (titleMatch) {
      totalScore += titleMatch.score * 3;
      matches.push({
        indices: titleMatch.indices,
        value: command.title,
        key: 'title'
      });
    }

    // Match against description (medium weight)
    if (command.description) {
      const descMatch = calculateMatchScore(query, command.description);
      if (descMatch) {
        totalScore += descMatch.score * 1.5;
        matches.push({
          indices: descMatch.indices,
          value: command.description,
          key: 'description'
        });
      }
    }

    // Match against keywords (high weight for exact matches)
    if (command.keywords) {
      for (const keyword of command.keywords) {
        const keywordMatch = calculateMatchScore(query, keyword);
        if (keywordMatch) {
          totalScore += keywordMatch.score * 2;
          matches.push({
            indices: keywordMatch.indices,
            value: keyword,
            key: 'keywords'
          });
        }
      }
    }

    if (matches.length > 0) {
      results.push({
        command,
        score: totalScore,
        matches
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, maxResults);
}

/**
 * Highlight matched characters in text
 * Returns array of segments with match flag
 */
export function highlightMatches(
  text: string,
  indices: [number, number][]
): { text: string; highlight: boolean }[] {
  if (indices.length === 0) {
    return [{ text, highlight: false }];
  }

  const segments: { text: string; highlight: boolean }[] = [];
  let lastIndex = 0;

  for (const [start, end] of indices) {
    // Add non-matched segment before this match
    if (start > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, start),
        highlight: false
      });
    }

    // Add matched segment
    segments.push({
      text: text.slice(start, end + 1),
      highlight: true
    });

    lastIndex = end + 1;
  }

  // Add remaining non-matched text
  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      highlight: false
    });
  }

  return segments;
}

/**
 * Measure search performance
 */
export function measureSearchPerformance<T>(
  fn: () => T
): { result: T; latency: number } {
  const start = performance.now();
  const result = fn();
  const latency = performance.now() - start;
  return { result, latency };
}
