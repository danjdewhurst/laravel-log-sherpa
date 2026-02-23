import type { LaravelErrorLog, LogPlugin } from "../types/error";

export class PluginManager {
  private plugins: LogPlugin[] = [];

  register(plugin: LogPlugin): void {
    this.plugins.push(plugin);
  }

  runTransform(logs: LaravelErrorLog[]): LaravelErrorLog[] {
    return this.plugins.reduce((acc, plugin) => {
      if (!plugin.transform) return acc;
      return plugin.transform(acc);
    }, logs);
  }
}
