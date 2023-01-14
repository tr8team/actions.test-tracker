interface ILogger {
  debug(message: string): void;

  notice(message: string): void;

  info(message: string): void;

  warning(message: string): void;

  error(message: string): void;
}

export { ILogger };
