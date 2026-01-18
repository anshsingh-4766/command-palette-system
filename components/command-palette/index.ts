/**
 * Command Palette - Public API
 * Export all public components and utilities
 */

// Components
export { CommandPalette } from './CommandPalette';
export { CommandTrigger } from './CommandTrigger';

// Context & Provider
export { 
  CommandPaletteProvider, 
  useCommandPaletteContext 
} from '@/lib/command-palette/context';

// Registry
export { commandRegistry, CommandRegistry } from '@/lib/command-palette/command-registry';

// Types
export type {
  Command,
  CommandId,
  CommandParameter,
  CommandGroup,
  CommandPlugin,
  FuzzyMatch,
  CommandPaletteState,
  PerformanceMetrics
} from '@/lib/command-palette/types';

// Hooks
export {
  useCommands,
  useGlobalKeyboard,
  useKeyboardNavigation,
  useFocusTrap,
  useCommandSearch,
  useCommandPalette,
  useAnnouncements
} from '@/lib/command-palette/hooks';

// Search utilities
export {
  fuzzySearchCommands,
  highlightMatches,
  measureSearchPerformance
} from '@/lib/command-palette/fuzzy-search';
