type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
  private formatMessage(level: LogLevel, message: string, ...args: unknown[]) {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.length > 0 ? JSON.stringify(args) : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${formattedArgs}`;
  }

  info(message: string, ...args: unknown[]) {
    if (process.env.NODE_ENV === "test") return;
    console.log(this.formatMessage("info", message, ...args));
  }

  warn(message: string, ...args: unknown[]) {
    if (process.env.NODE_ENV === "test") return;
    console.warn(this.formatMessage("warn", message, ...args));
  }

  error(message: string, ...args: unknown[]) {
    console.error(this.formatMessage("error", message, ...args));
  }

  debug(message: string, ...args: unknown[]) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(this.formatMessage("debug", message, ...args));
    }
  }
}

export const logger = new Logger();
