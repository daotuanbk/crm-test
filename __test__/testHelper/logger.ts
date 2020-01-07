import bunyan from 'bunyan';

export const logger: bunyan = bunyan.createLogger({
  name: 'CRM-Test',
  streams: [
    {
        level: 'info',
        stream: process.stdout,
    },
  ],
});
