type LogFn = (message?: unknown, ...optionalParams: unknown[]) => void;

interface Logger {
    log: LogFn;
    warn: LogFn;
    error: LogFn;
    debug: LogFn;
}

const NO_OP: LogFn = () => {};

const LOG_LEVEL: string = process.env.ENV_LOG_LEVEL ?? 'log';

class ConsoleLogger implements Logger {
    readonly log: LogFn;
    readonly warn: LogFn;
    readonly error: LogFn;
    readonly debug: LogFn;

    constructor(options?: { level?: string }) {
        const effectiveLevel = options?.level ?? LOG_LEVEL;

        switch (effectiveLevel) {
            case 'error':
                this.error = console.error.bind(console);
                this.warn = NO_OP;
                this.log = NO_OP;
                this.debug = NO_OP;
                break;
            case 'warn':
                this.error = console.error.bind(console);
                this.warn = console.warn.bind(console);
                this.log = NO_OP;
                this.debug = NO_OP;
                break;
            case 'debug':
                this.error = console.error.bind(console);
                this.warn = console.warn.bind(console);
                this.log = console.log.bind(console);
                this.debug = console.debug.bind(console);
                break;
            default:
                this.error = console.error.bind(console);
                this.warn = console.warn.bind(console);
                this.log = console.log.bind(console);
                this.debug = NO_OP;
                break;
        }
    }
}

const logger = new ConsoleLogger({ level: LOG_LEVEL });

export { logger };
