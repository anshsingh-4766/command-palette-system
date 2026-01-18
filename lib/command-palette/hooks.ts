'use client';

import React from "react"

/**
 * Command Palette Hooks
 * Custom hooks for keyboard navigation, focus management, and state
 */

import { 
  useState, 
  useEffect, 
  useCallback, 
  useRef, 
  useMemo,
  useSyncExternalStore
} from 'react';
import type { 
  Command, 
  CommandPaletteState, 
  FuzzyMatch,
  PerformanceMetrics 
} from './types';
import { commandRegistry } from './command-registry';
import { fuzzySearchCommands, measureSearchPerformance } from './fuzzy-search';

/**
 * Hook to subscribe to command registry changes
 */
export function useCommands(): Command[] {
  return useSyncExternalStore(
    (callback) => commandRegistry.subscribe(callback),
    () => commandRegistry.getAllCommands(),
    () => commandRegistry.getAllCommands()
  );
}

/**
 * Hook for global keyboard shortcut to open command palette
 */
export function useGlobalKeyboard(
  shortcut: { key: string; metaKey?: boolean; ctrlKey?: boolean },
  onTrigger: () => void
): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const matchesMeta = shortcut.metaKey ? event.metaKey : true;
      const matchesCtrl = shortcut.ctrlKey ? event.ctrlKey : true;
      const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase();

      if (matchesKey && matchesMeta && matchesCtrl) {
        event.preventDefault();
        onTrigger();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcut, onTrigger]);
}

/**
 * Hook for keyboard navigation within command palette
 */
export function useKeyboardNavigation(
  isOpen: boolean,
  itemCount: number,
  selectedIndex: number,
  onSelect: (index: number) => void,
  onConfirm: () => void,
  onClose: () => void,
  onBack?: () => void
): void {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          onSelect(selectedIndex < itemCount - 1 ? selectedIndex + 1 : 0);
          break;
        case 'ArrowUp':
          event.preventDefault();
          onSelect(selectedIndex > 0 ? selectedIndex - 1 : itemCount - 1);
          break;
        case 'Enter':
          event.preventDefault();
          onConfirm();
          break;
        case 'Escape':
          event.preventDefault();
          if (onBack) {
            onBack();
          } else {
            onClose();
          }
          break;
        case 'Tab':
          event.preventDefault();
          if (event.shiftKey) {
            onSelect(selectedIndex > 0 ? selectedIndex - 1 : itemCount - 1);
          } else {
            onSelect(selectedIndex < itemCount - 1 ? selectedIndex + 1 : 0);
          }
          break;
        case 'Backspace':
          if (onBack && (event.target as HTMLInputElement).value === '') {
            event.preventDefault();
            onBack();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, itemCount, selectedIndex, onSelect, onConfirm, onClose, onBack]);
}

/**
 * Hook for focus trapping within command palette
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  isActive: boolean,
  initialFocusRef?: React.RefObject<HTMLElement | null>
): void {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus initial element or first focusable
    const focusInitial = () => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else {
        const focusable = getFocusableElements(containerRef.current);
        focusable[0]?.focus();
      }
    };

    // Small delay to ensure DOM is ready
    requestAnimationFrame(focusInitial);

    return () => {
      // Restore focus on cleanup
      previousActiveElement.current?.focus();
    };
  }, [isActive, containerRef, initialFocusRef]);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusable = getFocusableElements(containerRef.current);
      if (focusable.length === 0) return;

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey) {
        if (activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, containerRef]);
}

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  
  const selector = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  return Array.from(container.querySelectorAll<HTMLElement>(selector));
}

/**
 * Hook for command search with performance tracking
 */
export function useCommandSearch(
  commands: Command[],
  query: string,
  maxResults: number = 50
): { results: FuzzyMatch[]; metrics: PerformanceMetrics } {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    searchLatency: 0,
    renderLatency: 0,
    totalLatency: 0,
    resultCount: 0,
    timestamp: Date.now()
  });

  const latencyRef = useRef(0);

  const results = useMemo(() => {
    const { result, latency } = measureSearchPerformance(
      () => fuzzySearchCommands(commands, query, maxResults)
    );
    latencyRef.current = latency;
    return result;
  }, [commands, query, maxResults]);

  // Update metrics after search completes
  useEffect(() => {
    const renderStart = performance.now();
    const frame = requestAnimationFrame(() => {
      const renderLatency = performance.now() - renderStart;
      setMetrics({
        searchLatency: latencyRef.current,
        renderLatency,
        totalLatency: latencyRef.current + renderLatency,
        resultCount: results.length,
        timestamp: Date.now()
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [results]);

  return { results, metrics };
}

/**
 * Main hook for command palette state management
 */
export function useCommandPalette() {
  const [state, setState] = useState<CommandPaletteState>({
    isOpen: false,
    query: '',
    selectedIndex: 0,
    parameterMode: false,
    currentCommand: null,
    parameterValues: {},
    currentParameterIndex: 0
  });

  const open = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: true, query: '', selectedIndex: 0 }));
  }, []);

  const close = useCallback(() => {
    setState({
      isOpen: false,
      query: '',
      selectedIndex: 0,
      parameterMode: false,
      currentCommand: null,
      parameterValues: {},
      currentParameterIndex: 0
    });
  }, []);

  const toggle = useCallback(() => {
    setState(prev => prev.isOpen ? {
      isOpen: false,
      query: '',
      selectedIndex: 0,
      parameterMode: false,
      currentCommand: null,
      parameterValues: {},
      currentParameterIndex: 0
    } : { ...prev, isOpen: true, query: '', selectedIndex: 0 });
  }, []);

  const setQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, query, selectedIndex: 0 }));
  }, []);

  const setSelectedIndex = useCallback((index: number) => {
    setState(prev => ({ ...prev, selectedIndex: index }));
  }, []);

  const enterParameterMode = useCallback((command: Command) => {
    if (!command.parameters?.length) {
      // No parameters, execute directly
      return false;
    }
    setState(prev => ({
      ...prev,
      parameterMode: true,
      currentCommand: command,
      parameterValues: {},
      currentParameterIndex: 0,
      query: ''
    }));
    return true;
  }, []);

  const exitParameterMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      parameterMode: false,
      currentCommand: null,
      parameterValues: {},
      currentParameterIndex: 0,
      query: ''
    }));
  }, []);

  const setParameterValue = useCallback((name: string, value: unknown) => {
    setState(prev => ({
      ...prev,
      parameterValues: { ...prev.parameterValues, [name]: value }
    }));
  }, []);

  const nextParameter = useCallback(() => {
    setState(prev => {
      if (!prev.currentCommand?.parameters) return prev;
      const nextIndex = prev.currentParameterIndex + 1;
      if (nextIndex >= prev.currentCommand.parameters.length) {
        return prev;
      }
      return { ...prev, currentParameterIndex: nextIndex, query: '' };
    });
  }, []);

  const previousParameter = useCallback(() => {
    setState(prev => {
      if (prev.currentParameterIndex <= 0) {
        return {
          ...prev,
          parameterMode: false,
          currentCommand: null,
          parameterValues: {},
          currentParameterIndex: 0
        };
      }
      return { ...prev, currentParameterIndex: prev.currentParameterIndex - 1, query: '' };
    });
  }, []);

  const executeCommand = useCallback(async (command: Command, params?: Record<string, unknown>) => {
    try {
      await command.action(params);
      close();
    } catch (error) {
      console.error(`Error executing command "${command.id}":`, error);
    }
  }, [close]);

  // Global keyboard shortcut (Cmd+K / Ctrl+K)
  useGlobalKeyboard(
    { key: 'k', metaKey: true },
    toggle
  );

  useGlobalKeyboard(
    { key: 'k', ctrlKey: true },
    toggle
  );

  return {
    state,
    open,
    close,
    toggle,
    setQuery,
    setSelectedIndex,
    enterParameterMode,
    exitParameterMode,
    setParameterValue,
    nextParameter,
    previousParameter,
    executeCommand
  };
}

/**
 * Hook for accessible announcements
 */
export function useAnnouncements() {
  const [announcement, setAnnouncement] = useState('');
  
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Clear first to ensure re-announcement of same message
    setAnnouncement('');
    requestAnimationFrame(() => {
      setAnnouncement(message);
    });
  }, []);

  const clear = useCallback(() => {
    setAnnouncement('');
  }, []);

  return { announcement, announce, clear };
}
