'use client';

import React from "react"

import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';
import { 
  CommandPalette, 
  CommandTrigger, 
  CommandPaletteProvider,
  commandRegistry,
  useCommandPaletteContext
} from '@/components/command-palette';
import { 
  allSampleCommands, 
  navigationCommands,
  actionCommands,
  gitPlugin 
} from '@/lib/command-palette/sample-commands';
import type { Command } from '@/lib/command-palette/types';

/**
 * Command Palette Stories
 * 
 * A global command execution system with:
 * - Deterministic fuzzy search with ranking
 * - Plugin architecture for extensibility
 * - Parameterized commands
 * - Keyboard-first UX
 * - Full accessibility support
 * - Sub-50ms performance target
 */
const meta: Meta<typeof CommandPalette> = {
  title: 'Components/CommandPalette',
  component: CommandPalette,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
A keyboard-first command palette built from scratch with:
- Custom fuzzy search algorithm
- Plugin system for extensibility
- Parameterized command support
- ARIA-compliant accessibility
- Performance monitoring
        `
      }
    }
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background p-8">
        <Story />
      </div>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof CommandPalette>;

// Helper component to setup commands
function StoryWrapper({ 
  children, 
  commands = allSampleCommands,
  showPerformanceMetrics = false 
}: { 
  children?: React.ReactNode;
  commands?: Command[];
  showPerformanceMetrics?: boolean;
}) {
  useEffect(() => {
    const unregister = commandRegistry.registerCommands(commands);
    return () => {
      unregister();
      commandRegistry.clear();
    };
  }, [commands]);

  return (
    <CommandPaletteProvider>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <CommandTrigger />
          <span className="text-sm text-muted-foreground">
            Press ⌘K or Ctrl+K to open
          </span>
        </div>
        {children}
        <CommandPalette showPerformanceMetrics={showPerformanceMetrics} />
      </div>
    </CommandPaletteProvider>
  );
}

/**
 * Default command palette with all sample commands
 */
export const Default: Story = {
  render: () => <StoryWrapper />
};

/**
 * Command palette with performance metrics visible
 */
export const WithPerformanceMetrics: Story = {
  render: () => <StoryWrapper showPerformanceMetrics />
};

/**
 * Minimal command set for focused testing
 */
export const MinimalCommands: Story = {
  render: () => <StoryWrapper commands={navigationCommands} />
};

/**
 * Commands with parameters for testing parameter mode
 */
export const ParameterizedCommands: Story = {
  render: () => (
    <StoryWrapper commands={actionCommands}>
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          Try "Create New File" or "Search Files" to test parameterized commands
        </p>
      </div>
    </StoryWrapper>
  )
};

/**
 * Empty state when no commands match
 */
export const EmptyState: Story = {
  render: () => (
    <StoryWrapper commands={[]}>
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          Open the palette and type anything to see the empty state
        </p>
      </div>
    </StoryWrapper>
  )
};

/**
 * Plugin system demonstration
 */
function PluginDemo() {
  const [pluginEnabled, setPluginEnabled] = useState(false);

  useEffect(() => {
    const unregister = commandRegistry.registerCommands(navigationCommands);
    return unregister;
  }, []);

  const togglePlugin = () => {
    if (pluginEnabled) {
      commandRegistry.unregisterPlugin('git');
    } else {
      commandRegistry.registerPlugin(gitPlugin);
    }
    setPluginEnabled(!pluginEnabled);
  };

  return (
    <CommandPaletteProvider>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <CommandTrigger />
          <button
            type="button"
            onClick={togglePlugin}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              pluginEnabled
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {pluginEnabled ? 'Disable' : 'Enable'} Git Plugin
          </button>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            {pluginEnabled 
              ? 'Git commands (commit, push, pull) are now available'
              : 'Enable the Git plugin to add git commands'
            }
          </p>
        </div>
        <CommandPalette showPerformanceMetrics />
      </div>
    </CommandPaletteProvider>
  );
}

export const PluginSystem: Story = {
  render: () => <PluginDemo />
};

/**
 * Keyboard navigation demonstration
 */
export const KeyboardNavigation: Story = {
  render: () => (
    <StoryWrapper showPerformanceMetrics>
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h3 className="mb-2 font-medium text-foreground">Keyboard Controls</h3>
        <ul className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
          <li>↑↓ - Navigate results</li>
          <li>Enter - Execute command</li>
          <li>Escape - Close / Go back</li>
          <li>Tab - Next item</li>
          <li>Shift+Tab - Previous item</li>
          <li>Home - First item</li>
          <li>End - Last item</li>
          <li>Backspace (empty) - Go back</li>
        </ul>
      </div>
    </StoryWrapper>
  )
};

/**
 * Fuzzy search demonstration
 */
export const FuzzySearch: Story = {
  render: () => (
    <StoryWrapper showPerformanceMetrics>
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h3 className="mb-2 font-medium text-foreground">Fuzzy Search Examples</h3>
        <ul className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
          <li>"gse" → Go to Settings</li>
          <li>"gh" → Go to Home</li>
          <li>"cnf" → Create New File</li>
          <li>"tdm" → Toggle Dark Mode</li>
          <li>"sf" → Search Files</li>
          <li>"ks" → Keyboard Shortcuts</li>
        </ul>
      </div>
    </StoryWrapper>
  )
};

/**
 * High contrast mode for accessibility testing
 */
export const HighContrastMode: Story = {
  render: () => (
    <div className="dark">
      <StoryWrapper showPerformanceMetrics>
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            Dark mode enabled for high contrast testing
          </p>
        </div>
      </StoryWrapper>
    </div>
  )
};

/**
 * Loading state simulation (async commands)
 */
export const AsyncCommands: Story = {
  render: () => {
    const asyncCommands: Command[] = [
      {
        id: 'slow-command',
        title: 'Slow Command',
        description: 'This command takes 2 seconds to execute',
        keywords: ['slow', 'async', 'wait'],
        category: 'Test',
        action: async () => {
          await new Promise(resolve => setTimeout(resolve, 2000));
          alert('Slow command completed!');
        }
      },
      {
        id: 'fast-command',
        title: 'Fast Command',
        description: 'This command executes immediately',
        keywords: ['fast', 'sync', 'quick'],
        category: 'Test',
        action: () => {
          alert('Fast command completed!');
        }
      }
    ];

    return (
      <StoryWrapper commands={asyncCommands}>
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            Try the "Slow Command" to test async execution
          </p>
        </div>
      </StoryWrapper>
    );
  }
};

/**
 * Disabled commands
 */
export const DisabledCommands: Story = {
  render: () => {
    const mixedCommands: Command[] = [
      {
        id: 'enabled-1',
        title: 'Enabled Command',
        description: 'This command can be executed',
        category: 'Test',
        action: () => alert('Command executed!')
      },
      {
        id: 'disabled-1',
        title: 'Disabled Command',
        description: 'This command is disabled',
        category: 'Test',
        disabled: true,
        action: () => {}
      },
      {
        id: 'enabled-2',
        title: 'Another Enabled Command',
        description: 'This one works too',
        category: 'Test',
        action: () => alert('Another command executed!')
      }
    ];

    return (
      <StoryWrapper commands={mixedCommands}>
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            Notice that disabled commands appear but cannot be selected
          </p>
        </div>
      </StoryWrapper>
    );
  }
};

/**
 * Large command set for performance testing
 */
export const LargeCommandSet: Story = {
  render: () => {
    const largeCommandSet: Command[] = Array.from({ length: 500 }, (_, i) => ({
      id: `command-${i}`,
      title: `Command ${i + 1}`,
      description: `This is command number ${i + 1} in a large set`,
      keywords: [`cmd${i}`, `number${i}`],
      category: `Category ${Math.floor(i / 50) + 1}`,
      action: () => console.log(`Executed command ${i + 1}`)
    }));

    return (
      <StoryWrapper commands={largeCommandSet} showPerformanceMetrics>
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            500 commands loaded. Search performance should remain under 50ms.
          </p>
        </div>
      </StoryWrapper>
    );
  }
};

/**
 * Custom trigger button styles
 */
export const CustomTrigger: Story = {
  render: () => (
    <StoryWrapper>
      <div className="flex flex-wrap gap-4">
        <CommandTriggerCustom variant="default">
          Default Trigger
        </CommandTriggerCustom>
        <CommandTriggerCustom variant="primary">
          Primary Trigger
        </CommandTriggerCustom>
        <CommandTriggerCustom variant="ghost">
          Ghost Trigger
        </CommandTriggerCustom>
      </div>
    </StoryWrapper>
  )
};

function CommandTriggerCustom({ 
  children, 
  variant 
}: { 
  children: React.ReactNode; 
  variant: 'default' | 'primary' | 'ghost';
}) {
  const { open } = useCommandPaletteContext();
  
  const variants = {
    default: 'border border-input bg-background hover:bg-accent',
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground'
  };

  return (
    <button
      type="button"
      onClick={open}
      className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

/**
 * Failure state - command execution error
 */
export const ErrorHandling: Story = {
  render: () => {
    const errorCommands: Command[] = [
      {
        id: 'error-command',
        title: 'Command That Fails',
        description: 'This command will throw an error',
        keywords: ['error', 'fail', 'crash'],
        category: 'Test',
        action: async () => {
          throw new Error('Intentional error for testing');
        }
      },
      {
        id: 'success-command',
        title: 'Command That Succeeds',
        description: 'This command works correctly',
        keywords: ['success', 'work'],
        category: 'Test',
        action: () => {
          alert('Success!');
        }
      }
    ];

    return (
      <StoryWrapper commands={errorCommands}>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Try "Command That Fails" - errors are caught and logged to console
          </p>
        </div>
      </StoryWrapper>
    );
  }
};

/**
 * Accessibility testing story
 */
export const AccessibilityTest: Story = {
  render: () => (
    <StoryWrapper showPerformanceMetrics>
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <h3 className="mb-2 font-medium text-foreground">Accessibility Features</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>✓ role="dialog" with aria-modal="true"</li>
            <li>✓ role="combobox" for search input</li>
            <li>✓ role="listbox" and role="option" for results</li>
            <li>✓ aria-activedescendant for focus tracking</li>
            <li>✓ aria-live region for announcements</li>
            <li>✓ Focus trapping within dialog</li>
            <li>✓ Escape key to close</li>
            <li>✓ Focus restoration on close</li>
          </ul>
        </div>
        <p className="text-sm text-muted-foreground">
          Use a screen reader to verify announcements and navigation
        </p>
      </div>
    </StoryWrapper>
  )
};
