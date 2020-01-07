import { logger } from './server/core';
import express from '@feathersjs/express';
import feathers from '@feathersjs/feathers';
import { bootstrapClient } from './client/bootstrap-client';

(async () => {
  const server = express(feathers());

  // 2. bootstrap client (nextjs);
  await bootstrapClient({ server });

  // 3. setup error handler
  server.use(express.notFound()).use(express.errorHandler({ logger }));

  // 4. start server
  const port = parseInt(process.env.PORT ? process.env.PORT : '', 10) || 3001;
  server.listen(port);

  logger.info(`[Client] Client listens on port ${port} ...`);
})();
