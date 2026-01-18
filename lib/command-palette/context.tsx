'use client';

/**
 * Command Palette Context
 * Provides command palette state and actions to the component tree
 */

import { createContext, useContext, type ReactNode } from 'react';
import { 
  useCommandPalette, 
  useCommands, 
  useCommandSearch, 
  useAnnouncements 
} from './hooks';
import type { 
  Command, 
  CommandPaletteState, 
  FuzzyMatch, 
  PerformanceMetrics 
} from './types';

interface CommandPaletteContextValue {
  // State
  state: CommandPaletteState;
  commands: Command[];
  results: FuzzyMatch[];
  metrics: PerformanceMetrics;
  announcement: string;

  // Actions
  open: () => void;
  close: () => void;
  toggle: () => void;
  setQuery: (query: string) => void;
  setSelectedIndex: (index: number) => void;
  enterParameterMode: (command: Command) => boolean;
  exitParameterMode: () => void;
  setParameterValue: (name: string, value: unknown) => void;
  nextParameter: () => void;
  previousParameter: () => void;
  executeCommand: (command: Command, params?: Record<string, unknown>) => Promise<void>;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const palette = useCommandPalette();
  const commands = useCommands();
  const { results, metrics } = useCommandSearch(commands, palette.state.query);
  const { announcement, announce } = useAnnouncements();

  const value: CommandPaletteContextValue = {
    state: palette.state,
    commands,
    results,
    metrics,
    announcement,
    open: palette.open,
    close: palette.close,
    toggle: palette.toggle,
    setQuery: palette.setQuery,
    setSelectedIndex: palette.setSelectedIndex,
    enterParameterMode: palette.enterParameterMode,
    exitParameterMode: palette.exitParameterMode,
    setParameterValue: palette.setParameterValue,
    nextParameter: palette.nextParameter,
    previousParameter: palette.previousParameter,
    executeCommand: palette.executeCommand,
    announce
  };

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPaletteContext(): CommandPaletteContextValue {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error(
      'useCommandPaletteContext must be used within a CommandPaletteProvider'
    );
  }
  return context;
}
