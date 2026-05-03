const PREFIX = '[Stratifyr]';

const isDev = import.meta.env.DEV;

export const logger = {
  info: (...args: unknown[]) => {
    if (isDev) console.info(PREFIX, ...args);
  },
  warn: (...args: unknown[]) => {
    console.warn(PREFIX, ...args);
  },
  error: (...args: unknown[]) => {
    console.error(PREFIX, ...args);
  },
  debug: (...args: unknown[]) => {
    if (isDev) console.debug(PREFIX, ...args);
  },
  group: (label: string) => {
    if (isDev) console.group(`${PREFIX} ${label}`);
  },
  groupEnd: () => {
    if (isDev) console.groupEnd();
  },
};
