'use client';

/**
 * Sample Commands for Demo and Storybook
 */

import type { Command, CommandPlugin, CommandGroup } from './types';

// Icons (built from scratch)
function HomeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function FileIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
      <polyline points="13,2 13,9 20,9"/>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <polyline points="23,4 23,10 17,10"/>
      <polyline points="1,20 1,14 7,14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16,17 21,12 16,7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

/**
 * Basic navigation commands
 */
export const navigationCommands: Command[] = [
  {
    id: 'go-home',
    title: 'Go to Home',
    description: 'Navigate to the home page',
    icon: <HomeIcon />,
    keywords: ['home', 'dashboard', 'main'],
    category: 'Navigation',
    shortcut: ['⌘', 'H'],
    action: () => {
      console.log('Navigating to home');
      window.location.hash = '#home';
    }
  },
  {
    id: 'go-settings',
    title: 'Go to Settings',
    description: 'Open application settings',
    icon: <SettingsIcon />,
    keywords: ['settings', 'preferences', 'config', 'options'],
    category: 'Navigation',
    shortcut: ['⌘', ','],
    action: () => {
      console.log('Navigating to settings');
      window.location.hash = '#settings';
    }
  },
  {
    id: 'go-profile',
    title: 'Go to Profile',
    description: 'View your user profile',
    icon: <UserIcon />,
    keywords: ['profile', 'account', 'user', 'me'],
    category: 'Navigation',
    action: () => {
      console.log('Navigating to profile');
      window.location.hash = '#profile';
    }
  }
];

/**
 * Action commands
 */
export const actionCommands: Command[] = [
  {
    id: 'create-file',
    title: 'Create New File',
    description: 'Create a new file in the project',
    icon: <FileIcon />,
    keywords: ['new', 'create', 'file', 'document'],
    category: 'Actions',
    shortcut: ['⌘', 'N'],
    parameters: [
      {
        name: 'filename',
        label: 'File Name',
        type: 'text',
        required: true,
        placeholder: 'Enter file name...'
      },
      {
        name: 'type',
        label: 'File Type',
        type: 'select',
        required: true,
        options: [
          { label: 'TypeScript', value: 'ts' },
          { label: 'JavaScript', value: 'js' },
          { label: 'React Component', value: 'tsx' },
          { label: 'CSS', value: 'css' }
        ]
      }
    ],
    action: (params) => {
      console.log('Creating file:', params);
      alert(`Created file: ${params?.filename}.${params?.type}`);
    }
  },
  {
    id: 'search-files',
    title: 'Search Files',
    description: 'Search for files in the project',
    icon: <SearchIcon />,
    keywords: ['search', 'find', 'files', 'locate'],
    category: 'Actions',
    shortcut: ['⌘', 'P'],
    parameters: [
      {
        name: 'query',
        label: 'Search Query',
        type: 'text',
        required: true,
        placeholder: 'Enter search term...'
      }
    ],
    action: (params) => {
      console.log('Searching for:', params?.query);
      alert(`Searching for: ${params?.query}`);
    }
  },
  {
    id: 'toggle-dark-mode',
    title: 'Toggle Dark Mode',
    description: 'Switch between light and dark theme',
    icon: <MoonIcon />,
    keywords: ['dark', 'light', 'theme', 'mode', 'toggle'],
    category: 'Actions',
    shortcut: ['⌘', 'D'],
    action: () => {
      document.documentElement.classList.toggle('dark');
      console.log('Dark mode toggled');
    }
  },
  {
    id: 'copy-url',
    title: 'Copy Current URL',
    description: 'Copy the current page URL to clipboard',
    icon: <CopyIcon />,
    keywords: ['copy', 'url', 'link', 'clipboard'],
    category: 'Actions',
    action: async () => {
      await navigator.clipboard.writeText(window.location.href);
      console.log('URL copied to clipboard');
      alert('URL copied to clipboard!');
    }
  },
  {
    id: 'refresh-page',
    title: 'Refresh Page',
    description: 'Reload the current page',
    icon: <RefreshIcon />,
    keywords: ['refresh', 'reload', 'update'],
    category: 'Actions',
    shortcut: ['⌘', 'R'],
    action: () => {
      window.location.reload();
    }
  }
];

/**
 * User account commands
 */
export const userCommands: Command[] = [
  {
    id: 'sign-out',
    title: 'Sign Out',
    description: 'Sign out of your account',
    icon: <LogOutIcon />,
    keywords: ['logout', 'sign out', 'exit', 'leave'],
    category: 'Account',
    action: () => {
      console.log('Signing out...');
      alert('Signed out successfully!');
    }
  },
  {
    id: 'send-feedback',
    title: 'Send Feedback',
    description: 'Send feedback about the application',
    icon: <MailIcon />,
    keywords: ['feedback', 'report', 'bug', 'suggestion'],
    category: 'Account',
    parameters: [
      {
        name: 'message',
        label: 'Your Feedback',
        type: 'text',
        required: true,
        placeholder: 'Enter your feedback...'
      }
    ],
    action: (params) => {
      console.log('Feedback:', params?.message);
      alert(`Thank you for your feedback: "${params?.message}"`);
    }
  }
];

/**
 * Calendar commands with async action
 */
export const calendarCommands: Command[] = [
  {
    id: 'schedule-meeting',
    title: 'Schedule Meeting',
    description: 'Schedule a new meeting',
    icon: <CalendarIcon />,
    keywords: ['meeting', 'calendar', 'schedule', 'event'],
    category: 'Calendar',
    parameters: [
      {
        name: 'title',
        label: 'Meeting Title',
        type: 'text',
        required: true,
        placeholder: 'Enter meeting title...'
      },
      {
        name: 'duration',
        label: 'Duration',
        type: 'select',
        required: true,
        options: [
          { label: '15 minutes', value: '15' },
          { label: '30 minutes', value: '30' },
          { label: '1 hour', value: '60' },
          { label: '2 hours', value: '120' }
        ]
      }
    ],
    action: async (params) => {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Meeting scheduled:', params);
      alert(`Meeting "${params?.title}" scheduled for ${params?.duration} minutes`);
    }
  }
];

/**
 * Help commands
 */
export const helpCommands: Command[] = [
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'View all keyboard shortcuts',
    icon: <HelpIcon />,
    keywords: ['keyboard', 'shortcuts', 'keys', 'hotkeys', 'help'],
    category: 'Help',
    shortcut: ['⌘', '/'],
    action: () => {
      alert('Keyboard shortcuts:\n\n⌘K - Open command palette\n⌘H - Go home\n⌘N - New file\n⌘P - Search files\n⌘D - Toggle dark mode\nEsc - Close');
    }
  },
  {
    id: 'documentation',
    title: 'View Documentation',
    description: 'Open the documentation',
    icon: <FileIcon />,
    keywords: ['docs', 'documentation', 'help', 'guide'],
    category: 'Help',
    action: () => {
      console.log('Opening documentation');
      alert('Documentation would open here');
    }
  }
];

/**
 * All sample commands combined
 */
export const allSampleCommands: Command[] = [
  ...navigationCommands,
  ...actionCommands,
  ...userCommands,
  ...calendarCommands,
  ...helpCommands
];

/**
 * Sample plugin for demo
 */
export const gitPlugin: CommandPlugin = {
  id: 'git',
  name: 'Git Commands',
  description: 'Git version control commands',
  commands: [
    {
      id: 'commit',
      title: 'Git Commit',
      description: 'Commit staged changes',
      keywords: ['git', 'commit', 'save', 'version'],
      category: 'Git',
      parameters: [
        {
          name: 'message',
          label: 'Commit Message',
          type: 'text',
          required: true,
          placeholder: 'Enter commit message...'
        }
      ],
      action: (params) => {
        console.log('Git commit:', params?.message);
        alert(`Committed with message: "${params?.message}"`);
      }
    },
    {
      id: 'push',
      title: 'Git Push',
      description: 'Push commits to remote',
      keywords: ['git', 'push', 'upload', 'remote'],
      category: 'Git',
      action: () => {
        console.log('Git push');
        alert('Pushed to remote!');
      }
    },
    {
      id: 'pull',
      title: 'Git Pull',
      description: 'Pull changes from remote',
      keywords: ['git', 'pull', 'download', 'fetch'],
      category: 'Git',
      action: () => {
        console.log('Git pull');
        alert('Pulled from remote!');
      }
    }
  ],
  onRegister: () => {
    console.log('Git plugin registered');
  },
  onUnregister: () => {
    console.log('Git plugin unregistered');
  }
};

/**
 * Sample command group
 */
export const developerGroup: CommandGroup = {
  id: 'developer',
  title: 'Developer',
  priority: 1,
  commands: [
    {
      id: 'open-devtools',
      title: 'Open DevTools',
      description: 'Open browser developer tools',
      keywords: ['devtools', 'inspect', 'debug', 'console'],
      shortcut: ['F12'],
      action: () => {
        alert('Press F12 to open DevTools');
      }
    },
    {
      id: 'clear-cache',
      title: 'Clear Cache',
      description: 'Clear browser cache and reload',
      keywords: ['cache', 'clear', 'reset'],
      action: () => {
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
          });
        }
        alert('Cache cleared!');
      }
    }
  ]
};
