import { Application } from '@feathersjs/express';
import next from 'next';
import routes from './routes';
import { setCookie, clearCookie } from './core';
import { logger } from '@app/core';
import nextI18NextMiddleware from 'next-i18next/middleware';
import { i18n } from './i18n';
import { bootstrapModules } from './bootstrap-modules';

export const bootstrapClient = async ({ server }: { server: Application<any> }) => {
  logger.info(`[Client] Bootstrapping...`);
  bootstrapModules({ routes });

  const dev = process.env.NODE_ENV !== 'production';
  const nextApp = next({ dev, dir: dev ? './src/client' : './dist/client' });
  const handler = routes.getRequestHandler(nextApp);
  await (nextApp as any).prepare();

  server.get('/_next/*', (req, res) => {
    return handler(req, res);
  });
  server.get('/static/*', (req, res) => {
    return handler(req, res);
  });
  server.post('/auth/login', setCookie);
  server.get('/auth/logout', clearCookie);
  server.use(handler);
  server.use(nextI18NextMiddleware(i18n));
};
