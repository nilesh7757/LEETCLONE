type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
  private formatMessage(level: LogLevel, message: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.length > 0 ? JSON.stringify(args) : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${formattedArgs}`;
  }

  info(message: string, ...args: any[]) {
    console.log(this.formatMessage("info", message, ...args));
  }

  warn(message: string, ...args: any[]) {
    console.warn(this.formatMessage("warn", message, ...args));
  }

  error(message: string, ...args: any[]) {
    console.error(this.formatMessage("error", message, ...args));
  }

  debug(message: string, ...args: any[]) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(this.formatMessage("debug", message, ...args));
    }
  }
}

export const logger = new Logger();
