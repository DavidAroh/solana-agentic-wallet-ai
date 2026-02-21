import * as fs from 'fs';
import * as path from 'path';
import { LogEntry } from '../types';
import { LOGGING_CONFIG } from '../config';

export class Logger {
  private logDir: string;
  private enableFileLogging: boolean;
  private enableConsoleLogging: boolean;
  private logs: LogEntry[] = [];

  constructor() {
    this.logDir = LOGGING_CONFIG.logDir;
    this.enableFileLogging = LOGGING_CONFIG.enableFileLogging;
    this.enableConsoleLogging = LOGGING_CONFIG.enableConsoleLogging;
    this.ensureLogDir();
  }

  private ensureLogDir(): void {
    if (this.enableFileLogging && !fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = entry.level.toUpperCase().padEnd(7);
    const agentId = entry.agentId ? `[${entry.agentId}]` : '';
    return `${timestamp} ${level} ${agentId} ${entry.message}`;
  }

  private writeToFile(entry: LogEntry): void {
    if (!this.enableFileLogging) return;

    const logFile = path.join(this.logDir, `agent-${new Date().toISOString().split('T')[0]}.log`);
    const message = this.formatMessage(entry) + '\n';

    fs.appendFileSync(logFile, message, 'utf-8');
  }

  private writeToConsole(entry: LogEntry): void {
    if (!this.enableConsoleLogging) return;

    const message = this.formatMessage(entry);

    switch (entry.level) {
      case 'error':
        console.error(message);
        break;
      case 'warn':
        console.warn(message);
        break;
      case 'success':
        console.log(`\x1b[32m${message}\x1b[0m`);
        break;
      default:
        console.log(message);
    }
  }

  log(level: LogEntry['level'], message: string, agentId?: string, data?: unknown): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      agentId,
      message,
      data,
    };

    this.logs.push(entry);
    this.writeToFile(entry);
    this.writeToConsole(entry);
  }

  info(message: string, agentId?: string, data?: unknown): void {
    this.log('info', message, agentId, data);
  }

  warn(message: string, agentId?: string, data?: unknown): void {
    this.log('warn', message, agentId, data);
  }

  error(message: string, agentId?: string, data?: unknown): void {
    this.log('error', message, agentId, data);
  }

  success(message: string, agentId?: string, data?: unknown): void {
    this.log('success', message, agentId, data);
  }

  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  getAgentLogs(agentId: string, count: number = 20): LogEntry[] {
    return this.logs.filter((log) => log.agentId === agentId).slice(-count);
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = new Logger();
