/**
 * Command Registry - Plugin System
 * Manages command registration, plugins, and lifecycle
 */

import type { Command, CommandPlugin, CommandGroup } from './types';

type CommandChangeListener = (commands: Command[]) => void;

class CommandRegistry {
  private commands: Map<string, Command> = new Map();
  private plugins: Map<string, CommandPlugin> = new Map();
  private groups: Map<string, CommandGroup> = new Map();
  private listeners: Set<CommandChangeListener> = new Set();
  private cachedCommands: Command[] = [];
  private cacheValid: boolean = false;

  /**
   * Register a single command
   */
  registerCommand(command: Command): () => void {
    if (this.commands.has(command.id)) {
      console.warn(`Command with id "${command.id}" already exists. Overwriting.`);
    }
    
    this.commands.set(command.id, command);
    this.notifyListeners();

    // Return unregister function
    return () => this.unregisterCommand(command.id);
  }

  /**
   * Register multiple commands
   */
  registerCommands(commands: Command[]): () => void {
    for (const command of commands) {
      if (this.commands.has(command.id)) {
        console.warn(`Command with id "${command.id}" already exists. Overwriting.`);
      }
      this.commands.set(command.id, command);
    }
    this.notifyListeners();

    // Return unregister function
    return () => {
      for (const command of commands) {
        this.unregisterCommand(command.id);
      }
    };
  }

  /**
   * Unregister a command by id
   */
  unregisterCommand(id: string): boolean {
    const deleted = this.commands.delete(id);
    if (deleted) {
      this.notifyListeners();
    }
    return deleted;
  }

  /**
   * Register a plugin with its commands
   */
  registerPlugin(plugin: CommandPlugin): () => void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin with id "${plugin.id}" already exists. Unregistering first.`);
      this.unregisterPlugin(plugin.id);
    }

    this.plugins.set(plugin.id, plugin);
    
    // Register all plugin commands with prefixed ids
    for (const command of plugin.commands) {
      const prefixedId = `${plugin.id}:${command.id}`;
      this.commands.set(prefixedId, { ...command, id: prefixedId });
    }

    // Call plugin lifecycle hook
    plugin.onRegister?.();
    this.notifyListeners();

    // Return unregister function
    return () => this.unregisterPlugin(plugin.id);
  }

  /**
   * Unregister a plugin and all its commands
   */
  unregisterPlugin(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return false;
    }

    // Remove all plugin commands
    for (const command of plugin.commands) {
      this.commands.delete(`${pluginId}:${command.id}`);
    }

    // Call plugin lifecycle hook
    plugin.onUnregister?.();
    
    this.plugins.delete(pluginId);
    this.notifyListeners();
    return true;
  }

  /**
   * Register a command group
   */
  registerGroup(group: CommandGroup): () => void {
    this.groups.set(group.id, group);
    
    for (const command of group.commands) {
      const groupedId = `${group.id}:${command.id}`;
      this.commands.set(groupedId, { 
        ...command, 
        id: groupedId,
        category: group.title 
      });
    }
    this.notifyListeners();

    return () => this.unregisterGroup(group.id);
  }

  /**
   * Unregister a group and its commands
   */
  unregisterGroup(groupId: string): boolean {
    const group = this.groups.get(groupId);
    if (!group) {
      return false;
    }

    for (const command of group.commands) {
      this.commands.delete(`${groupId}:${command.id}`);
    }

    this.groups.delete(groupId);
    this.notifyListeners();
    return true;
  }

  /**
   * Get a command by id
   */
  getCommand(id: string): Command | undefined {
    return this.commands.get(id);
  }

  /**
   * Get all registered commands (cached for useSyncExternalStore)
   */
  getAllCommands(): Command[] {
    if (!this.cacheValid) {
      this.cachedCommands = Array.from(this.commands.values());
      this.cacheValid = true;
    }
    return this.cachedCommands;
  }

  /**
   * Get commands grouped by category
   */
  getGroupedCommands(): Map<string, Command[]> {
    const grouped = new Map<string, Command[]>();
    
    for (const command of this.commands.values()) {
      const category = command.category ?? 'General';
      const existing = grouped.get(category) ?? [];
      existing.push(command);
      grouped.set(category, existing);
    }

    return grouped;
  }

  /**
   * Subscribe to command changes
   */
  subscribe(listener: CommandChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of command changes
   */
  private notifyListeners(): void {
    this.cacheValid = false;
    const commands = this.getAllCommands();
    for (const listener of this.listeners) {
      listener(commands);
    }
  }

  /**
   * Clear all commands and plugins
   */
  clear(): void {
    // Call unregister hooks for all plugins
    for (const plugin of this.plugins.values()) {
      plugin.onUnregister?.();
    }

    this.commands.clear();
    this.plugins.clear();
    this.groups.clear();
    this.cacheValid = false;
    this.notifyListeners();
  }
}

// Singleton instance
export const commandRegistry = new CommandRegistry();

// Export class for testing
export { CommandRegistry };
