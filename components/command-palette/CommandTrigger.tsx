'use client';

/**
 * Command Palette Trigger Button
 * A button to open the command palette
 */

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { useCommandPaletteContext } from '@/lib/command-palette/context';

interface CommandTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  showShortcut?: boolean;
}

export const CommandTrigger = forwardRef<HTMLButtonElement, CommandTriggerProps>(
  function CommandTrigger({ className, showShortcut = true, children, ...props }, ref) {
    const { open } = useCommandPaletteContext();

    return (
      <button
        ref={ref}
        type="button"
        onClick={open}
        className={cn(
          'inline-flex items-center justify-between gap-2 rounded-md border border-input',
          'bg-background px-3 py-2 text-sm text-muted-foreground',
          'ring-offset-background transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        aria-label="Open command palette"
        {...props}
      >
        <span className="flex items-center gap-2">
          <SearchIcon className="h-4 w-4" />
          {children ?? <span>Search commands...</span>}
        </span>
        {showShortcut && (
          <kbd className="pointer-events-none hidden select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        )}
      </button>
    );
  }
);

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
