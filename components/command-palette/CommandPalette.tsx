'use client';

import React from "react"

/**
 * Command Palette Component
 * Built from scratch - no external component libraries
 */

import { 
  useRef, 
  useEffect, 
  useCallback,
  type KeyboardEvent as ReactKeyboardEvent 
} from 'react';
import { cn } from '@/lib/utils';
import { useCommandPaletteContext } from '@/lib/command-palette/context';
import { useFocusTrap, useKeyboardNavigation } from '@/lib/command-palette/hooks';
import { highlightMatches } from '@/lib/command-palette/fuzzy-search';
import type { Command, FuzzyMatch } from '@/lib/command-palette/types';

interface CommandPaletteProps {
  className?: string;
  placeholder?: string;
  emptyMessage?: string;
  showPerformanceMetrics?: boolean;
}

export function CommandPalette({
  className,
  placeholder = 'Type a command or search...',
  emptyMessage = 'No commands found.',
  showPerformanceMetrics = false
}: CommandPaletteProps) {
  const {
    state,
    results,
    metrics,
    announcement,
    close,
    setQuery,
    setSelectedIndex,
    enterParameterMode,
    exitParameterMode,
    previousParameter,
    executeCommand,
    announce
  } = useCommandPaletteContext();

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Focus trap
  useFocusTrap(containerRef, state.isOpen, inputRef);

  // Keyboard navigation
  const handleConfirm = useCallback(() => {
    if (state.parameterMode && state.currentCommand) {
      const params = state.currentCommand.parameters;
      if (params && state.currentParameterIndex < params.length - 1) {
        // Move to next parameter
        const currentParam = params[state.currentParameterIndex];
        if (currentParam) {
          // Set current input as parameter value
          announce(`Parameter ${currentParam.label} set`);
        }
      } else {
        // Execute with all parameters
        executeCommand(state.currentCommand, state.parameterValues);
        announce(`Executing ${state.currentCommand.title}`);
      }
    } else if (results[state.selectedIndex]) {
      const match = results[state.selectedIndex];
      if (match) {
        handleCommandSelect(match.command);
      }
    }
  }, [state, results, executeCommand, announce]);

  const handleBack = useCallback(() => {
    if (state.parameterMode) {
      if (state.currentParameterIndex > 0) {
        previousParameter();
      } else {
        exitParameterMode();
        announce('Exited parameter mode');
      }
    } else {
      close();
    }
  }, [state.parameterMode, state.currentParameterIndex, previousParameter, exitParameterMode, close, announce]);

  useKeyboardNavigation(
    state.isOpen,
    results.length,
    state.selectedIndex,
    setSelectedIndex,
    handleConfirm,
    close,
    state.query === '' ? handleBack : undefined
  );

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selectedItem = listRef.current.querySelector('[data-selected="true"]');
    selectedItem?.scrollIntoView({ block: 'nearest' });
  }, [state.selectedIndex]);

  // Announce results to screen readers
  useEffect(() => {
    if (state.isOpen && !state.parameterMode) {
      const count = results.length;
      announce(
        count === 0 
          ? 'No results found' 
          : `${count} result${count === 1 ? '' : 's'} available`
      );
    }
  }, [results.length, state.isOpen, state.parameterMode, announce]);

  const handleCommandSelect = useCallback((command: Command) => {
    if (command.parameters?.length) {
      const entered = enterParameterMode(command);
      if (entered) {
        announce(`Enter parameters for ${command.title}`);
        return;
      }
    }
    executeCommand(command);
    announce(`Executing ${command.title}`);
  }, [enterParameterMode, executeCommand, announce]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, [setQuery]);

  const handleInputKeyDown = useCallback((e: ReactKeyboardEvent<HTMLInputElement>) => {
    // Handle Home/End for list navigation
    if (e.key === 'Home') {
      e.preventDefault();
      setSelectedIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSelectedIndex(Math.max(0, results.length - 1));
    }
  }, [setSelectedIndex, results.length]);

  if (!state.isOpen) return null;

  const currentParameter = state.parameterMode && state.currentCommand?.parameters
    ? state.currentCommand.parameters[state.currentParameterIndex] ?? null
    : null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      {/* Command Palette Dialog */}
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2',
          'rounded-lg border border-border bg-popover shadow-lg',
          'flex flex-col overflow-hidden',
          className
        )}
      >
        {/* Search Input */}
        <div className="flex items-center border-b border-border px-3">
          <SearchIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-list"
            aria-activedescendant={
              results[state.selectedIndex] 
                ? `command-${results[state.selectedIndex]?.command.id}` 
                : undefined
            }
            aria-autocomplete="list"
            aria-label={
              state.parameterMode && currentParameter
                ? `Enter ${currentParameter.label}`
                : 'Search commands'
            }
            placeholder={
              state.parameterMode && currentParameter
                ? currentParameter.placeholder ?? `Enter ${currentParameter.label}...`
                : placeholder
            }
            value={state.query}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            className={cn(
              'flex h-12 w-full bg-transparent py-3 text-sm outline-none',
              'placeholder:text-muted-foreground',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {state.parameterMode && (
            <button
              type="button"
              onClick={handleBack}
              className="ml-2 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Go back"
            >
              Back
            </button>
          )}
          <kbd className="ml-2 hidden rounded bg-muted px-2 py-1 text-xs text-muted-foreground sm:inline-block">
            Esc
          </kbd>
        </div>

        {/* Parameter Mode Header */}
        {state.parameterMode && state.currentCommand && (
          <div className="border-b border-border bg-muted/50 px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{state.currentCommand.title}</span>
              <span className="text-xs text-muted-foreground">
                Parameter {state.currentParameterIndex + 1} of {state.currentCommand.parameters?.length}
              </span>
            </div>
            {currentParameter && (
              <p className="mt-1 text-xs text-muted-foreground">
                {currentParameter.label}
                {currentParameter.required && <span className="text-destructive"> *</span>}
              </p>
            )}
          </div>
        )}

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto overscroll-contain">
          {!state.parameterMode && results.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : !state.parameterMode ? (
            <ul
              ref={listRef}
              id="command-list"
              role="listbox"
              aria-label="Commands"
              className="p-2"
            >
              {results.map((match, index) => (
                <CommandItem
                  key={match.command.id}
                  match={match}
                  isSelected={index === state.selectedIndex}
                  onSelect={() => handleCommandSelect(match.command)}
                  onMouseEnter={() => setSelectedIndex(index)}
                />
              ))}
            </ul>
          ) : currentParameter?.type === 'select' && currentParameter.options ? (
            <ul
              ref={listRef}
              id="command-list"
              role="listbox"
              aria-label={`Select ${currentParameter.label}`}
              className="p-2"
            >
              {currentParameter.options.map((option, index) => (
                <li
                  key={option.value}
                  id={`option-${option.value}`}
                  role="option"
                  aria-selected={index === state.selectedIndex}
                  data-selected={index === state.selectedIndex}
                  onClick={() => {
                    // Set value and move to next
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    'relative flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm',
                    'outline-none transition-colors',
                    index === state.selectedIndex
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50'
                  )}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-4 text-sm text-muted-foreground">
              Press Enter to confirm, Escape to go back
            </div>
          )}
        </div>

        {/* Performance Metrics (for debugging) */}
        {showPerformanceMetrics && (
          <div className="border-t border-border bg-muted/30 px-4 py-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Search: {metrics.searchLatency.toFixed(2)}ms</span>
              <span>Render: {metrics.renderLatency.toFixed(2)}ms</span>
              <span>Total: {metrics.totalLatency.toFixed(2)}ms</span>
              <span>Results: {metrics.resultCount}</span>
              <span className={cn(
                metrics.totalLatency > 50 ? 'text-destructive' : 'text-green-600'
              )}>
                {metrics.totalLatency <= 50 ? '✓ <50ms' : '✗ >50ms'}
              </span>
            </div>
          </div>
        )}

        {/* Screen Reader Announcements */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {announcement}
        </div>
      </div>
    </>
  );
}

/**
 * Individual command item with match highlighting
 */
interface CommandItemProps {
  match: FuzzyMatch;
  isSelected: boolean;
  onSelect: () => void;
  onMouseEnter: () => void;
}

function CommandItem({ match, isSelected, onSelect, onMouseEnter }: CommandItemProps) {
  const { command } = match;
  
  // Find title match for highlighting
  const titleMatch = match.matches.find(m => m.key === 'title');
  const titleSegments = titleMatch 
    ? highlightMatches(command.title, titleMatch.indices)
    : [{ text: command.title, highlight: false }];

  return (
    <li
      id={`command-${command.id}`}
      role="option"
      aria-selected={isSelected}
      aria-disabled={command.disabled}
      data-selected={isSelected}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-md px-3 py-2',
        'outline-none transition-colors',
        isSelected
          ? 'bg-accent text-accent-foreground'
          : 'hover:bg-accent/50',
        command.disabled && 'pointer-events-none opacity-50'
      )}
    >
      {/* Icon */}
      {command.icon && (
        <span className="mr-3 flex h-5 w-5 items-center justify-center text-muted-foreground">
          {command.icon}
        </span>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col">
        <span className="text-sm">
          {titleSegments.map((segment, i) => (
            <span
              key={i}
              className={segment.highlight ? 'font-semibold text-primary' : undefined}
            >
              {segment.text}
            </span>
          ))}
        </span>
        {command.description && (
          <span className="text-xs text-muted-foreground line-clamp-1">
            {command.description}
          </span>
        )}
      </div>

      {/* Category Badge */}
      {command.category && (
        <span className="ml-2 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {command.category}
        </span>
      )}

      {/* Shortcut */}
      {command.shortcut && (
        <div className="ml-2 flex items-center gap-1">
          {command.shortcut.map((key, i) => (
            <kbd
              key={i}
              className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground"
            >
              {key}
            </kbd>
          ))}
        </div>
      )}
    </li>
  );
}

/**
 * Search icon component (built from scratch, no icon library)
 */
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
