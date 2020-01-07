import { logger, mongoDatabase } from './server/core';
import express from '@feathersjs/express';
import feathers from '@feathersjs/feathers';
import { config } from '@app/config';
import { bootstrapServer } from './server/bootstrap-server';

(async () => {
  logger.info(`[Server] Initialize mongo ...:()`);

  // 1. connect to mongo
  await mongoDatabase.startDatabase(config.database.connectionString);

  const server = express(feathers());
  bootstrapServer({ server });

  // 4. start server
  const port = parseInt(process.env.PORT ? process.env.PORT : '', 10) || 3000;
  server.listen(port);

  logger.info(`[Server] Server listens on port ${port} ...yeah`);
  server.emit('serverStarted');
})();
