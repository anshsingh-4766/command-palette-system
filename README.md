# Command Palette System

A high-performance, accessible command palette component built with React, TypeScript, and Next.js. Designed for rapid command discovery and execution with keyboard-first navigation and WCAG 2.1 AA compliance.

## Features

### ⚡ Performance
- **≤50ms keystroke-to-result latency** - Meets strict performance requirements
- **Custom fuzzy search algorithm** - Deterministic O(n) scoring without regex overhead
- **Memoized results** - Efficient rendering with stable component state
- **Async metrics** - Non-blocking performance monitoring

### ♿ Accessibility
- **WCAG 2.1 AA compliant** - Full accessibility support
- **ARIA patterns** - Dialog, combobox, and listbox patterns
- **Keyboard navigation** - Complete keyboard support (Cmd/Ctrl+K, arrows, Tab, etc.)
- **Focus management** - Proper focus trapping and restoration
- **Live regions** - Screen reader announcements

### 🎯 Command System
- **Flexible command definitions** - Support for parameters, icons, shortcuts, categories
- **Command parameters** - Text, number, select, and boolean parameter types
- **Plugin architecture** - Register and unregister commands dynamically
- **Command grouping** - Organize commands by category
- **Validation** - Custom parameter validation

### 🎨 UI Components
- **Shadcn/ui integration** - Complete set of accessible UI components
- **Dark mode support** - Theme provider with light/dark modes
- **Responsive design** - Mobile-friendly with drawer pattern
- **Storybook stories** - Visual documentation and testing

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) with TypeScript
- **Testing**: [Vitest](https://vitest.dev/) with React Testing Library
- **UI Components**: [Radix UI](https://www.radix-ui.com/), [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/)
- **Component Documentation**: [Storybook](https://storybook.js.org/)

## Installation

### Prerequisites
- Node.js 18+ 
- pnpm (or npm/yarn)

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build

# Start production server
pnpm start
```

## Usage

### Basic Setup

```tsx
import { CommandPalette } from '@/components/command-palette';
import { CommandPaletteProvider } from '@/lib/command-palette';
import { sampleCommands } from '@/lib/command-palette/sample-commands';

export default function App() {
  return (
    <CommandPaletteProvider initialCommands={sampleCommands}>
      <div>
        <CommandPalette 
          placeholder="Type a command or search..."
          showPerformanceMetrics={true}
        />
      </div>
    </CommandPaletteProvider>
  );
}
```

### Defining Commands

```tsx
import type { Command } from '@/lib/command-palette/types';

const myCommand: Command = {
  id: 'my-command',
  title: 'My Command',
  description: 'Does something useful',
  category: 'General',
  keywords: ['useful', 'action'],
  icon: <MyIcon />,
  shortcut: ['Cmd', 'K'],
  parameters: [
    {
      name: 'name',
      label: 'Your Name',
      type: 'text',
      required: true,
      placeholder: 'Enter your name',
      validate: (value) => {
        if (typeof value !== 'string' || value.length === 0) {
          return 'Name is required';
        }
        return true;
      }
    }
  ],
  action: async (params) => {
    console.log('Command executed with params:', params);
    // Your action logic here
  }
};
```

### Command Parameter Types

The system supports four parameter types:

- **text** - Single-line text input
- **number** - Numeric input
- **select** - Dropdown selection from predefined options
- **boolean** - Toggle/checkbox input

### Using the Command Trigger

```tsx
import { CommandTrigger } from '@/components/command-palette';

export function Header() {
  return (
    <header>
      <h1>My App</h1>
      <CommandTrigger />
    </header>
  );
}
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+K` or `Ctrl+K` | Open/close command palette |
| `↓` / `↑` | Navigate results |
| `Tab` / `Shift+Tab` | Navigate results (alternative) |
| `Home` / `End` | Jump to first/last result |
| `Enter` | Execute command or confirm parameter |
| `Escape` | Close palette or exit parameter mode |
| `Backspace` (empty query) | Exit parameter mode |

## Project Structure

```
components/
├── command-palette/
│   ├── CommandPalette.tsx      # Main palette component
│   ├── CommandTrigger.tsx      # Trigger button
│   └── index.ts                # Exports
└── ui/                         # Shadcn/ui components

lib/
├── command-palette/
│   ├── command-registry.ts     # Command storage and management
│   ├── context.tsx             # React context for state
│   ├── fuzzy-search.ts         # Fuzzy search algorithm
│   ├── hooks.ts                # Custom hooks
│   ├── types.ts                # TypeScript definitions
│   └── sample-commands.tsx     # Example commands
└── utils.ts                    # Utility functions

__tests__/
├── command-palette.test.tsx    # Component tests

docs/
├── ACCESSIBILITY_REPORT.md     # A11y documentation
└── PERFORMANCE_REPORT.md       # Performance benchmarks

stories/
├── CommandPalette.stories.tsx  # Storybook stories
└── ...
```

## Performance Benchmarks

The fuzzy search algorithm delivers consistent sub-50ms performance:

| Commands | Query Length | Search Time | Status |
|----------|--------------|-------------|--------|
| 50 | 3 chars | <5ms | ✓ |
| 100 | 5 chars | <8ms | ✓ |
| 250 | 5 chars | <15ms | ✓ |
| 500 | 10 chars | <25ms | ✓ |
| 1000 | 10 chars | <45ms | ✓ |

Enable the performance monitor in development:

```tsx
<CommandPalette showPerformanceMetrics={true} />
```

## Accessibility

The command palette is fully accessible and WCAG 2.1 AA compliant:

- ✓ Dialog pattern with focus trapping
- ✓ Combobox pattern for search input
- ✓ Listbox pattern for results
- ✓ Live region announcements
- ✓ Complete keyboard navigation
- ✓ Proper color contrast
- ✓ Screen reader support

See [docs/ACCESSIBILITY_REPORT.md](docs/ACCESSIBILITY_REPORT.md) for detailed accessibility documentation.

## Development

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test -- --watch

# Run specific test file
pnpm test command-palette
```

### Viewing Storybook

```bash
# Start Storybook
pnpm storybook

# Builds static version
pnpm build-storybook
```

### Linting

```bash
# Run ESLint
pnpm lint
```

## API Reference

### CommandPaletteProvider

The context provider that manages command palette state.

```tsx
<CommandPaletteProvider 
  initialCommands={commands}
  maxResults={50}
>
  {/* Your app */}
</CommandPaletteProvider>
```

### useCommandPaletteContext

Access command palette state and methods:

```tsx
const {
  state,           // CommandPaletteState
  results,         // FuzzyMatch[]
  metrics,         // PerformanceMetrics
  announcement,    // string
  close,           // () => void
  setQuery,        // (query: string) => void
  setSelectedIndex, // (index: number) => void
  executeCommand,  // (command: Command, params?: {}) => void
  announce         // (message: string) => void
} = useCommandPaletteContext();
```

### Command Interface

```tsx
interface Command {
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
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes with clear messages
4. Push to the branch
5. Open a Pull Request

## License

MIT License - feel free to use this project in your own applications.

## Support

For issues, questions, or suggestions, please open an issue on the repository.

---

Built with ❤️ for keyboard power users and accessibility advocates.
