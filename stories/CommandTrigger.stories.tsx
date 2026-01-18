'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import { 
  CommandTrigger, 
  CommandPalette,
  CommandPaletteProvider,
  commandRegistry
} from '@/components/command-palette';
import { allSampleCommands } from '@/lib/command-palette/sample-commands';

/**
 * Command Trigger Stories
 * 
 * A button component to open the command palette.
 * Can be customized with different styles and content.
 */
const meta: Meta<typeof CommandTrigger> = {
  title: 'Components/CommandTrigger',
  component: CommandTrigger,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A trigger button to open the command palette. Includes keyboard shortcut display.'
      }
    }
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      useEffect(() => {
        const unregister = commandRegistry.registerCommands(allSampleCommands);
        return () => {
          unregister();
          commandRegistry.clear();
        };
      }, []);

      return (
        <CommandPaletteProvider>
          <div className="min-h-[200px] flex items-center justify-center">
            <Story />
          </div>
          <CommandPalette />
        </CommandPaletteProvider>
      );
    }
  ]
};

export default meta;
type Story = StoryObj<typeof CommandTrigger>;

/**
 * Default trigger with shortcut displayed
 */
export const Default: Story = {};

/**
 * Trigger without shortcut hint
 */
export const WithoutShortcut: Story = {
  args: {
    showShortcut: false
  }
};

/**
 * Custom placeholder text
 */
export const CustomText: Story = {
  args: {
    children: 'Search for anything...'
  }
};

/**
 * Full width trigger
 */
export const FullWidth: Story = {
  args: {
    className: 'w-96'
  }
};

/**
 * Compact trigger
 */
export const Compact: Story = {
  args: {
    className: 'w-48',
    children: 'Search...'
  }
};

/**
 * Styled trigger with custom classes
 */
export const CustomStyled: Story = {
  args: {
    className: 'bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/30 w-72'
  }
};
