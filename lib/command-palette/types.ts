import React from "react"
/**
 * Command Palette Type Definitions
 * Built from scratch - no external component libraries
 */

export type CommandId = string;

export interface CommandParameter {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  required: boolean;
  defaultValue?: string | number | boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  validate?: (value: unknown) => boolean | string;
}

export interface Command {
  id: CommandId;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  keywords?: string[];
  category?: string;
  shortcut?: string[];
  parameters?: CommandParameter[];
  disabled?: boolean;
  hidden?: boolean;
  action: (params?: Record<string, unknown>) => void | Promise<void>;
}

export interface CommandGroup {
  id: string;
  title: string;
  commands: Command[];
  priority?: number;
}

export interface CommandPlugin {
  id: string;
  name: string;
  description?: string;
  commands: Command[];
  onRegister?: () => void;
  onUnregister?: () => void;
}

export interface FuzzyMatch {
  command: Command;
  score: number;
  matches: {
    indices: [number, number][];
    value: string;
    key: 'title' | 'description' | 'keywords';
  }[];
}

export interface CommandPaletteState {
  isOpen: boolean;
  query: string;
  selectedIndex: number;
  parameterMode: boolean;
  currentCommand: Command | null;
  parameterValues: Record<string, unknown>;
  currentParameterIndex: number;
}

export interface PerformanceMetrics {
  searchLatency: number;
  renderLatency: number;
  totalLatency: number;
  resultCount: number;
  timestamp: number;
}
