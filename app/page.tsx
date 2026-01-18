'use client';

/**
 * Command Palette Demo Page
 * Demonstrates all features of the command palette
 */

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
  gitPlugin, 
  developerGroup 
} from '@/lib/command-palette/sample-commands';

function DemoContent() {
  const { state, metrics } = useCommandPaletteContext();
  const [pluginEnabled, setPluginEnabled] = useState(false);
  const [groupEnabled, setGroupEnabled] = useState(false);

  // Register sample commands on mount
  useEffect(() => {
    const unregister = commandRegistry.registerCommands(allSampleCommands);
    return unregister;
  }, []);

  // Toggle plugin
  const togglePlugin = () => {
    if (pluginEnabled) {
      commandRegistry.unregisterPlugin('git');
    } else {
      commandRegistry.registerPlugin(gitPlugin);
    }
    setPluginEnabled(!pluginEnabled);
  };

  // Toggle group
  const toggleGroup = () => {
    if (groupEnabled) {
      commandRegistry.unregisterGroup('developer');
    } else {
      commandRegistry.registerGroup(developerGroup);
    }
    setGroupEnabled(!groupEnabled);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground">Command Palette</h1>
            
          </div>
          <CommandTrigger className="w-64" />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground">
            Global Command Execution System
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            A keyboard-first command palette with deterministic fuzzy search, 
            plugin architecture, and parameterized commands. Built from scratch 
            with full accessibility support.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <kbd className="rounded-md border border-border bg-muted px-3 py-1.5 text-sm font-medium text-foreground">
              ⌘K
            </kbd>
            <span className="text-muted-foreground">or</span>
            <kbd className="rounded-md border border-border bg-muted px-3 py-1.5 text-sm font-medium text-foreground">
              Ctrl+K
            </kbd>
            <span className="text-muted-foreground">to open</span>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="Fuzzy Search"
            description="Custom deterministic fuzzy search algorithm with character matching, consecutive bonuses, and word boundary detection."
          />
          <FeatureCard
            title="Keyboard Navigation"
            description="Full keyboard support with arrow keys, Tab, Enter, Escape, Home, and End. No dead ends."
          />
          <FeatureCard
            title="Plugin System"
            description="Extensible command registry with plugin lifecycle hooks for registering and unregistering commands."
          />
          <FeatureCard
            title="Parameterized Commands"
            description="Commands can request parameters before execution with validation support."
          />
          <FeatureCard
            title="Accessibility"
            description="ARIA roles, live regions for announcements, focus trapping, and screen reader support."
          />
          <FeatureCard
            title="Performance"
            description="Sub-50ms keystroke-to-result latency with real-time performance metrics."
          />
        </section>

        {/* Plugin Controls */}
        <section className="mb-12">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Plugin Controls</h3>
          <div className="flex flex-wrap gap-4">
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
            <button
              type="button"
              onClick={toggleGroup}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                groupEnabled
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {groupEnabled ? 'Disable' : 'Enable'} Developer Group
            </button>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Toggle plugins and command groups to see dynamic command registration
          </p>
        </section>

        {/* Performance Metrics */}
        <section className="mb-12">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Performance Metrics</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Search Latency"
              value={`${metrics.searchLatency.toFixed(2)}ms`}
              status={metrics.searchLatency <= 30 ? 'good' : metrics.searchLatency <= 50 ? 'warning' : 'bad'}
            />
            <MetricCard
              label="Render Latency"
              value={`${metrics.renderLatency.toFixed(2)}ms`}
              status={metrics.renderLatency <= 20 ? 'good' : metrics.renderLatency <= 50 ? 'warning' : 'bad'}
            />
            <MetricCard
              label="Total Latency"
              value={`${metrics.totalLatency.toFixed(2)}ms`}
              status={metrics.totalLatency <= 50 ? 'good' : metrics.totalLatency <= 100 ? 'warning' : 'bad'}
            />
            <MetricCard
              label="Results Count"
              value={metrics.resultCount.toString()}
              status="neutral"
            />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Requirement: ≤50ms total latency | Status: {' '}
            <span className={metrics.totalLatency <= 50 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {metrics.totalLatency <= 50 ? '✓ PASSING' : '✗ FAILING'}
            </span>
          </p>
        </section>

        {/* Instructions */}
        <section className="rounded-lg border border-border bg-muted/30 p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Try These Commands</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="mb-2 text-sm font-medium text-foreground">Navigation</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• "home" - Navigate to home page</li>
                <li>• "settings" - Open settings</li>
                <li>• "profile" - View profile</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-medium text-foreground">Actions</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• "new file" - Create file (with parameters)</li>
                <li>• "dark" - Toggle dark mode</li>
                <li>• "copy" - Copy current URL</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-medium text-foreground">Fuzzy Search Examples</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• "gse" matches "Go to Settings"</li>
                <li>• "crf" matches "Create New File"</li>
                <li>• "dm" matches "Toggle Dark Mode"</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-medium text-foreground">Keyboard Shortcuts</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• ↑↓ - Navigate results</li>
                <li>• Enter - Execute command</li>
                <li>• Escape - Close / Go back</li>
                <li>• Home/End - Jump to first/last</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Command Palette */}
      <CommandPalette showPerformanceMetrics />
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="mb-2 font-semibold text-card-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function MetricCard({ 
  label, 
  value, 
  status 
}: { 
  label: string; 
  value: string; 
  status: 'good' | 'warning' | 'bad' | 'neutral';
}) {
  const statusColors = {
    good: 'border-green-500/50 bg-green-500/10',
    warning: 'border-yellow-500/50 bg-yellow-500/10',
    bad: 'border-red-500/50 bg-red-500/10',
    neutral: 'border-border bg-muted/30'
  };

  return (
    <div className={`rounded-lg border p-4 ${statusColors[status]}`}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

export default function CommandPalettePage() {
  return (
    <CommandPaletteProvider>
      <DemoContent />
    </CommandPaletteProvider>
  );
}
