import { mongoDatabase, logger } from './server/core';
import express from '@feathersjs/express';
import { bootstrapClient } from './client/bootstrap-client';
import { config } from '@app/config';
import { server } from './server';

(async () => {
  logger.info(`[Server] Initialize mongo ...`);

  // 1. connect to mongo
  await mongoDatabase.startDatabase(config.database.connectionString);

  if (process.env.NO_CLIENT !== 'true') {
    // 2. bootstrap client (nextjs);
    await bootstrapClient({ server });

    // 3. setup error handler
    server.use(express.notFound()).use(express.errorHandler({ logger }));
  }

  // 4. start server
  const port = parseInt(process.env.PORT ? process.env.PORT : '', 10) || 3000;
  server.listen(port);

  logger.info(`[Server] Server listens on port ${port} ...`);
  server.emit('serverStarted');
})();
