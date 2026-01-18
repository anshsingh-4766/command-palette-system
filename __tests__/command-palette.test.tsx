import React from "react"
/**
 * Command Palette Tests
 * Testing keyboard interactions, accessibility, and failure behavior
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { 
  CommandPalette, 
  CommandPaletteProvider, 
  commandRegistry 
} from '@/components/command-palette';
import { fuzzySearchCommands, highlightMatches } from '@/lib/command-palette/fuzzy-search';
import { CommandRegistry } from '@/lib/command-palette/command-registry';
import type { Command } from '@/lib/command-palette/types';

// Helper to render with provider
function renderWithProvider(ui: React.ReactNode) {
  return render(
    <CommandPaletteProvider>
      {ui}
    </CommandPaletteProvider>
  );
}

// Sample commands for testing
const testCommands: Command[] = [
  {
    id: 'test-1',
    title: 'Go to Home',
    description: 'Navigate to the home page',
    keywords: ['home', 'dashboard'],
    category: 'Navigation',
    action: vi.fn()
  },
  {
    id: 'test-2',
    title: 'Go to Settings',
    description: 'Open application settings',
    keywords: ['settings', 'preferences'],
    category: 'Navigation',
    action: vi.fn()
  },
  {
    id: 'test-3',
    title: 'Create New File',
    description: 'Create a new file',
    keywords: ['new', 'file', 'create'],
    category: 'Actions',
    parameters: [
      {
        name: 'filename',
        label: 'File Name',
        type: 'text',
        required: true
      }
    ],
    action: vi.fn()
  },
  {
    id: 'test-disabled',
    title: 'Disabled Command',
    description: 'This command is disabled',
    disabled: true,
    action: vi.fn()
  }
];

describe('CommandRegistry', () => {
  let registry: CommandRegistry;

  beforeEach(() => {
    registry = new CommandRegistry();
  });

  it('should register a command', () => {
    const command = testCommands[0]!;
    registry.registerCommand(command);
    expect(registry.getCommand(command.id)).toEqual(command);
  });

  it('should unregister a command', () => {
    const command = testCommands[0]!;
    registry.registerCommand(command);
    registry.unregisterCommand(command.id);
    expect(registry.getCommand(command.id)).toBeUndefined();
  });

  it('should register multiple commands', () => {
    registry.registerCommands(testCommands);
    expect(registry.getAllCommands()).toHaveLength(testCommands.length);
  });

  it('should return unregister function', () => {
    const command = testCommands[0]!;
    const unregister = registry.registerCommand(command);
    expect(registry.getCommand(command.id)).toBeDefined();
    unregister();
    expect(registry.getCommand(command.id)).toBeUndefined();
  });

  it('should notify listeners on changes', () => {
    const listener = vi.fn();
    registry.subscribe(listener);
    
    const command = testCommands[0]!;
    registry.registerCommand(command);
    
    expect(listener).toHaveBeenCalledWith([command]);
  });

  it('should unsubscribe listeners', () => {
    const listener = vi.fn();
    const unsubscribe = registry.subscribe(listener);
    unsubscribe();
    
    registry.registerCommand(testCommands[0]!);
    expect(listener).not.toHaveBeenCalled();
  });

  it('should register a plugin', () => {
    const plugin = {
      id: 'test-plugin',
      name: 'Test Plugin',
      commands: [testCommands[0]!],
      onRegister: vi.fn(),
      onUnregister: vi.fn()
    };

    registry.registerPlugin(plugin);
    
    expect(plugin.onRegister).toHaveBeenCalled();
    expect(registry.getCommand(`test-plugin:${testCommands[0]!.id}`)).toBeDefined();
  });

  it('should unregister a plugin', () => {
    const plugin = {
      id: 'test-plugin',
      name: 'Test Plugin',
      commands: [testCommands[0]!],
      onRegister: vi.fn(),
      onUnregister: vi.fn()
    };

    registry.registerPlugin(plugin);
    registry.unregisterPlugin('test-plugin');
    
    expect(plugin.onUnregister).toHaveBeenCalled();
    expect(registry.getCommand(`test-plugin:${testCommands[0]!.id}`)).toBeUndefined();
  });

  it('should group commands by category', () => {
    registry.registerCommands(testCommands);
    const grouped = registry.getGroupedCommands();
    
    expect(grouped.get('Navigation')).toHaveLength(2);
    expect(grouped.get('Actions')).toHaveLength(1);
  });

  it('should clear all commands', () => {
    registry.registerCommands(testCommands);
    registry.clear();
    expect(registry.getAllCommands()).toHaveLength(0);
  });
});

describe('Fuzzy Search', () => {
  beforeEach(() => {
    commandRegistry.clear();
    commandRegistry.registerCommands(testCommands);
  });

  afterEach(() => {
    commandRegistry.clear();
  });

  it('should return all commands when query is empty', () => {
    const results = fuzzySearchCommands(testCommands, '');
    // Should exclude disabled and hidden commands
    expect(results.length).toBeGreaterThanOrEqual(3);
  });

  it('should match exact title', () => {
    const results = fuzzySearchCommands(testCommands, 'Go to Home');
    expect(results[0]?.command.id).toBe('test-1');
  });

  it('should match partial title', () => {
    const results = fuzzySearchCommands(testCommands, 'Home');
    expect(results[0]?.command.title).toContain('Home');
  });

  it('should match keywords', () => {
    const results = fuzzySearchCommands(testCommands, 'dashboard');
    expect(results[0]?.command.id).toBe('test-1');
  });

  it('should match fuzzy patterns', () => {
    const results = fuzzySearchCommands(testCommands, 'gth'); // Go to Home
    expect(results.length).toBeGreaterThan(0);
  });

  it('should rank exact matches higher', () => {
    const commands: Command[] = [
      { id: '1', title: 'Settings', action: () => {} },
      { id: '2', title: 'Go to Settings', action: () => {} }
    ];
    const results = fuzzySearchCommands(commands, 'Settings');
    expect(results[0]?.command.id).toBe('1');
  });

  it('should exclude disabled commands', () => {
    const results = fuzzySearchCommands(testCommands, 'disabled');
    expect(results).toHaveLength(0);
  });

  it('should limit results', () => {
    const manyCommands = Array.from({ length: 100 }, (_, i) => ({
      id: `cmd-${i}`,
      title: `Command ${i}`,
      action: () => {}
    }));
    const results = fuzzySearchCommands(manyCommands, 'Command', 10);
    expect(results).toHaveLength(10);
  });

  it('should have sub-50ms performance for typical searches', () => {
    const manyCommands = Array.from({ length: 500 }, (_, i) => ({
      id: `cmd-${i}`,
      title: `Command ${i} with some description text`,
      description: `This is a longer description for command ${i}`,
      keywords: [`keyword${i}`, `tag${i}`],
      action: () => {}
    }));

    const start = performance.now();
    fuzzySearchCommands(manyCommands, 'comm');
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(50);
  });
});

describe('Highlight Matches', () => {
  it('should return full text when no matches', () => {
    const result = highlightMatches('Hello World', []);
    expect(result).toEqual([{ text: 'Hello World', highlight: false }]);
  });

  it('should highlight single match', () => {
    const result = highlightMatches('Hello World', [[0, 4]]);
    expect(result).toEqual([
      { text: 'Hello', highlight: true },
      { text: ' World', highlight: false }
    ]);
  });

  it('should highlight multiple matches', () => {
    const result = highlightMatches('Hello World', [[0, 0], [6, 6]]);
    expect(result).toEqual([
      { text: 'H', highlight: true },
      { text: 'ello ', highlight: false },
      { text: 'W', highlight: true },
      { text: 'orld', highlight: false }
    ]);
  });

  it('should handle consecutive matches', () => {
    const result = highlightMatches('Hello', [[0, 2]]);
    expect(result).toEqual([
      { text: 'Hel', highlight: true },
      { text: 'lo', highlight: false }
    ]);
  });
});

describe('CommandPalette Component', () => {
  beforeEach(() => {
    commandRegistry.clear();
    commandRegistry.registerCommands(testCommands);
  });

  afterEach(() => {
    commandRegistry.clear();
  });

  it('should open with keyboard shortcut Cmd+K', async () => {
    renderWithProvider(<CommandPalette />);
    
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('should open with keyboard shortcut Ctrl+K', async () => {
    renderWithProvider(<CommandPalette />);
    
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('should close with Escape key', async () => {
    renderWithProvider(<CommandPalette />);
    
    // Open
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Close
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should display search input', async () => {
    renderWithProvider(<CommandPalette />);
    
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  it('should display command list', async () => {
    renderWithProvider(<CommandPalette />);
    
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  it('should filter commands on search', async () => {
    const user = userEvent.setup();
    renderWithProvider(<CommandPalette />);
    
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    const input = screen.getByRole('combobox');
    await user.type(input, 'Settings');

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options.some(opt => opt.textContent?.includes('Settings'))).toBe(true);
    });
  });

  it('should navigate with arrow keys', async () => {
    renderWithProvider(<CommandPalette />);
    
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    // First item should be selected
    const firstOption = screen.getAllByRole('option')[0];
    expect(firstOption).toHaveAttribute('aria-selected', 'true');

    // Press down arrow
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    
    await waitFor(() => {
      const secondOption = screen.getAllByRole('option')[1];
      expect(secondOption).toHaveAttribute('aria-selected', 'true');
    });
  });

  it('should wrap navigation at boundaries', async () => {
    renderWithProvider(<CommandPalette />);
    
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    // Press up arrow from first item should go to last
    fireEvent.keyDown(document, { key: 'ArrowUp' });
    
    await waitFor(() => {
      const options = screen.getAllByRole('option');
      const lastOption = options[options.length - 1];
      expect(lastOption).toHaveAttribute('aria-selected', 'true');
    });
  });

  it('should execute command on Enter', async () => {
    const action = vi.fn();
    commandRegistry.clear();
    commandRegistry.registerCommand({
      id: 'test-action',
      title: 'Test Action',
      action
    });

    renderWithProvider(<CommandPalette />);
    
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: 'Enter' });

    await waitFor(() => {
      expect(action).toHaveBeenCalled();
    });
  });

  it('should show empty state when no results', async () => {
    const user = userEvent.setup();
    renderWithProvider(<CommandPalette emptyMessage="No results found" />);
    
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    const input = screen.getByRole('combobox');
    await user.type(input, 'xyznonexistent');

    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });
  });

  it('should have proper ARIA attributes', async () => {
    renderWithProvider(<CommandPalette />);
    
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    
    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-label', 'Command palette');

      const combobox = screen.getByRole('combobox');
      expect(combobox).toHaveAttribute('aria-expanded', 'true');
      expect(combobox).toHaveAttribute('aria-autocomplete', 'list');
      expect(combobox).toHaveAttribute('aria-controls', 'command-list');
    });
  });

  it('should have live region for announcements', async () => {
    renderWithProvider(<CommandPalette />);
    
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    
    await waitFor(() => {
      const liveRegion = document.querySelector('[role="status"][aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
    });
  });

  it('should show performance metrics when enabled', async () => {
    renderWithProvider(<CommandPalette showPerformanceMetrics />);
    
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    
    await waitFor(() => {
      expect(screen.getByText(/Search:/)).toBeInTheDocument();
      expect(screen.getByText(/Render:/)).toBeInTheDocument();
      expect(screen.getByText(/Total:/)).toBeInTheDocument();
    });
  });
});

describe('Keyboard-Only Usage', () => {
  beforeEach(() => {
    commandRegistry.clear();
    commandRegistry.registerCommands(testCommands);
  });

  afterEach(() => {
    commandRegistry.clear();
  });

  it('should support Tab navigation', async () => {
    renderWithProvider(<CommandPalette />);
    
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    const firstOption = screen.getAllByRole('option')[0];
    expect(firstOption).toHaveAttribute('aria-selected', 'true');

    // Tab should move to next
    fireEvent.keyDown(document, { key: 'Tab' });
    
    await waitFor(() => {
      const secondOption = screen.getAllByRole('option')[1];
      expect(secondOption).toHaveAttribute('aria-selected', 'true');
    });
  });

  it('should support Shift+Tab navigation', async () => {
    renderWithProvider(<CommandPalette />);
    
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    // Move to second item first
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    
    // Shift+Tab should move back
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    
    await waitFor(() => {
      const firstOption = screen.getAllByRole('option')[0];
      expect(firstOption).toHaveAttribute('aria-selected', 'true');
    });
  });

  it('should support Home key', async () => {
    renderWithProvider(<CommandPalette />);
    
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    // Move down
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    fireEvent.keyDown(document, { key: 'ArrowDown' });

    // Home should go to first
    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'Home' });
    
    await waitFor(() => {
      const firstOption = screen.getAllByRole('option')[0];
      expect(firstOption).toHaveAttribute('aria-selected', 'true');
    });
  });

  it('should support End key', async () => {
    renderWithProvider(<CommandPalette />);
    
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    // End should go to last
    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'End' });
    
    await waitFor(() => {
      const options = screen.getAllByRole('option');
      const lastOption = options[options.length - 1];
      expect(lastOption).toHaveAttribute('aria-selected', 'true');
    });
  });

  it('should have no keyboard dead ends', async () => {
    renderWithProvider(<CommandPalette />);
    
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Navigate down multiple times
    for (let i = 0; i < 10; i++) {
      fireEvent.keyDown(document, { key: 'ArrowDown' });
    }

    // Should still be able to close
    fireEvent.keyDown(document, { key: 'Escape' });
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Should be able to reopen
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});

describe('Error Handling', () => {
  beforeEach(() => {
    commandRegistry.clear();
  });

  afterEach(() => {
    commandRegistry.clear();
  });

  it('should catch and log command execution errors', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    commandRegistry.registerCommand({
      id: 'error-command',
      title: 'Error Command',
      action: async () => {
        throw new Error('Test error');
      }
    });

    renderWithProvider(<CommandPalette />);
    
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: 'Enter' });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error executing command'),
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  it('should handle async command errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    commandRegistry.registerCommand({
      id: 'async-error',
      title: 'Async Error',
      action: async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        throw new Error('Async error');
      }
    });

    renderWithProvider(<CommandPalette />);
    
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: 'Enter' });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    }, { timeout: 1000 });

    consoleSpy.mockRestore();
  });
});
