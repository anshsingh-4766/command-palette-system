'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { useState, useMemo } from 'react';
import { 
  fuzzySearchCommands, 
  highlightMatches,
  measureSearchPerformance 
} from '@/lib/command-palette/fuzzy-search';
import type { Command, FuzzyMatch } from '@/lib/command-palette/types';

/**
 * Fuzzy Search Algorithm Stories
 * 
 * Demonstrates the custom fuzzy search implementation with:
 * - Character matching
 * - Score calculation
 * - Match highlighting
 * - Performance measurement
 */

// Test commands for demonstration
const testCommands: Command[] = [
  { id: '1', title: 'Go to Home', description: 'Navigate to home page', keywords: ['home', 'dashboard'], action: () => {} },
  { id: '2', title: 'Go to Settings', description: 'Open settings', keywords: ['settings', 'config'], action: () => {} },
  { id: '3', title: 'Create New File', description: 'Create a new file', keywords: ['new', 'file', 'create'], action: () => {} },
  { id: '4', title: 'Search Files', description: 'Search for files', keywords: ['search', 'find'], action: () => {} },
  { id: '5', title: 'Toggle Dark Mode', description: 'Switch theme', keywords: ['dark', 'light', 'theme'], action: () => {} },
  { id: '6', title: 'Copy Current URL', description: 'Copy URL to clipboard', keywords: ['copy', 'url'], action: () => {} },
  { id: '7', title: 'Refresh Page', description: 'Reload the page', keywords: ['refresh', 'reload'], action: () => {} },
  { id: '8', title: 'Sign Out', description: 'Log out of account', keywords: ['logout', 'signout'], action: () => {} },
  { id: '9', title: 'Keyboard Shortcuts', description: 'View shortcuts', keywords: ['keyboard', 'shortcuts'], action: () => {} },
  { id: '10', title: 'View Documentation', description: 'Open docs', keywords: ['docs', 'help'], action: () => {} },
];

// Demo component
function FuzzySearchDemo() {
  const [query, setQuery] = useState('');
  const [commandCount, setCommandCount] = useState(10);

  // Generate commands for performance testing
  const commands = useMemo(() => {
    if (commandCount <= testCommands.length) {
      return testCommands.slice(0, commandCount);
    }
    return [
      ...testCommands,
      ...Array.from({ length: commandCount - testCommands.length }, (_, i) => ({
        id: `gen-${i}`,
        title: `Generated Command ${i + 1}`,
        description: `Auto-generated command for testing`,
        keywords: [`gen${i}`, `test${i}`],
        action: () => {}
      }))
    ];
  }, [commandCount]);

  // Run search with performance measurement
  const { result: results, latency } = useMemo(() => {
    return measureSearchPerformance(() => fuzzySearchCommands(commands, query, 20));
  }, [commands, query]);

  return (
    <div className="w-full max-w-3xl mx-auto p-6 space-y-6">
      {/* Controls */}
      <div className="space-y-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-foreground mb-1">
            Search Query
          </label>
          <input
            id="search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search..."
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
          />
        </div>
        <div>
          <label htmlFor="count" className="block text-sm font-medium text-foreground mb-1">
            Command Count: {commandCount}
          </label>
          <input
            id="count"
            type="range"
            min="10"
            max="1000"
            value={commandCount}
            onChange={(e) => setCommandCount(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h3 className="font-medium text-foreground mb-2">Performance</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Search Time:</span>{' '}
            <span className={`font-mono ${latency <= 50 ? 'text-green-600' : 'text-red-600'}`}>
              {latency.toFixed(2)}ms
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Commands:</span>{' '}
            <span className="font-mono">{commandCount}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Results:</span>{' '}
            <span className="font-mono">{results.length}</span>
          </div>
        </div>
        <div className="mt-2 text-sm">
          Status:{' '}
          <span className={latency <= 50 ? 'text-green-600' : 'text-red-600'}>
            {latency <= 50 ? '✓ Within 50ms target' : '✗ Exceeds 50ms target'}
          </span>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-2">
        <h3 className="font-medium text-foreground">Results ({results.length})</h3>
        {results.length === 0 ? (
          <p className="text-sm text-muted-foreground">No results found</p>
        ) : (
          <ul className="space-y-2">
            {results.map((match) => (
              <FuzzyMatchItem key={match.command.id} match={match} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function FuzzyMatchItem({ match }: { match: FuzzyMatch }) {
  const titleMatch = match.matches.find(m => m.key === 'title');
  const titleSegments = titleMatch 
    ? highlightMatches(match.command.title, titleMatch.indices)
    : [{ text: match.command.title, highlight: false }];

  return (
    <li className="rounded-md border border-border bg-card p-3">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium text-card-foreground">
            {titleSegments.map((segment, i) => (
              <span key={i} className={segment.highlight ? 'bg-primary/20 text-primary' : ''}>
                {segment.text}
              </span>
            ))}
          </div>
          {match.command.description && (
            <p className="text-sm text-muted-foreground">{match.command.description}</p>
          )}
        </div>
        <div className="text-right">
          <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
            Score: {match.score.toFixed(2)}
          </span>
        </div>
      </div>
      {match.matches.length > 0 && (
        <div className="mt-2 text-xs text-muted-foreground">
          Matched: {match.matches.map(m => m.key).join(', ')}
        </div>
      )}
    </li>
  );
}

const meta: Meta = {
  title: 'Utilities/FuzzySearch',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Custom fuzzy search implementation with:
- Deterministic scoring algorithm
- Character position matching
- Consecutive character bonus
- Word boundary detection
- Match highlighting
        `
      }
    }
  },
  tags: ['autodocs'],
};

export default meta;

/**
 * Interactive fuzzy search demo
 */
export const Interactive: StoryObj = {
  render: () => <FuzzySearchDemo />
};

/**
 * Highlight matches demonstration
 */
export const HighlightDemo: StoryObj = {
  render: () => {
    const examples = [
      { text: 'Go to Home', indices: [[0, 0], [6, 6]] as [number, number][] },
      { text: 'Create New File', indices: [[0, 2], [7, 9]] as [number, number][] },
      { text: 'Toggle Dark Mode', indices: [[0, 0], [7, 10]] as [number, number][] },
    ];

    return (
      <div className="p-6 max-w-lg mx-auto space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Match Highlighting</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Shows how matched characters are highlighted in search results
        </p>
        {examples.map(({ text, indices }, i) => {
          const segments = highlightMatches(text, indices);
          return (
            <div key={i} className="rounded-md border border-border bg-card p-3">
              <div className="text-lg">
                {segments.map((segment, j) => (
                  <span key={j} className={segment.highlight ? 'bg-primary/20 text-primary font-semibold' : ''}>
                    {segment.text}
                  </span>
                ))}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Indices: {JSON.stringify(indices)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
};

/**
 * Performance stress test
 */
export const PerformanceTest: StoryObj = {
  render: () => {
    const [results, setResults] = useState<{ count: number; query: string; time: number }[]>([]);
    
    const runTest = () => {
      const queries = ['go', 'settings', 'create', 'gth', 'cnf'];
      const counts = [100, 250, 500, 750, 1000];
      const newResults: typeof results = [];

      for (const count of counts) {
        const commands = Array.from({ length: count }, (_, i) => ({
          id: `cmd-${i}`,
          title: `Command ${i} with title`,
          description: `Description for command ${i}`,
          keywords: [`kw${i}`],
          action: () => {}
        }));

        for (const query of queries) {
          const { latency } = measureSearchPerformance(() => 
            fuzzySearchCommands(commands, query, 50)
          );
          newResults.push({ count, query, time: latency });
        }
      }

      setResults(newResults);
    };

    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Performance Stress Test</h2>
          <p className="text-sm text-muted-foreground">
            Tests search performance with varying command counts
          </p>
        </div>

        <button
          type="button"
          onClick={runTest}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Run Performance Test
        </button>

        {results.length > 0 && (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left">Commands</th>
                  <th className="px-4 py-2 text-left">Query</th>
                  <th className="px-4 py-2 text-left">Time</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-4 py-2">{r.count}</td>
                    <td className="px-4 py-2 font-mono">{r.query}</td>
                    <td className="px-4 py-2 font-mono">{r.time.toFixed(2)}ms</td>
                    <td className="px-4 py-2">
                      <span className={r.time <= 50 ? 'text-green-600' : 'text-red-600'}>
                        {r.time <= 50 ? '✓' : '✗'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }
};
