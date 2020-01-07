import express, { Application } from '@feathersjs/express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import favicon from 'serve-favicon';
import compress from 'compression';
import helmet from 'helmet';
import { logger, rootLocation } from './core';
import { bootstrapModules } from './bootstrap-modules';
import admin from 'firebase-admin';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import applicationHook from './application.hooks';
import { config } from '@app/config';
import fs from 'fs';
import { merge } from 'lodash';
import i18next from 'i18next';
import i18nextExpress from 'i18next-express-middleware';
import i18nextBackend from 'i18next-node-fs-backend';
import socketio from '@feathersjs/socketio';
import cronjobs from './cronjobs';
// import { bootstrapMessageQueue } from '@app/core';
import { logRequest } from './logging/logRequest';
import { logResponse } from './logging/logResponse';
export const bootstrapServer = ({ server }: { server: Application<any> }) => {
  logger.info(`[Server] Bootstrapping...`);
  i18next.use(i18nextExpress.LanguageDetector).use(i18nextBackend).init({
    ns: ['translation'],
    fallbackNS: 'translation',
    fallbackLng: 'en',
    preload: ['en', 'vn'],
    backend: {
      loadPath: 'dist/server/locales/{{lng}}/{{ns}}.json',
    },
  });

  server
    .configure(express.rest())
    .use(helmet())
    .use(compress())
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .use(favicon(path.join(process.cwd(), `${rootLocation}/client/static/favicon.ico`)))
    .use(cookieParser())
    .use(cors({
      origin(origin, callback) {
        if (config.web.cors.whitelistUrls.indexOf(origin) !== -1 || !origin) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
    }))
    .use('/upload', express.static(path.join(__dirname, '../../upload')))
    .use('/temp/attachment', express.static(path.join(__dirname, '../../temp/attachment')))
    .use(i18nextExpress.handle(i18next))
    .configure(socketio((io) => {
      io.on('connection', (socket) => {
        socket.join('fbchat');
        socket.join('mail');
      });
    }));

  // global hooks
  server.hooks(applicationHook);
  if (process.env.NO_CRON_JOB !== 'true') {
    cronjobs.startAll(() => {
      if ((server as any).io) {
        (server as any).io.to('email').emit('messages', { text: 'New message!' });
      }
    });
  }
  // add authorization to feathers
  server.use(async (req: any, res, next) => {
      res.on('finish', () => {
        logRequest(req);
        logResponse(req, res);
      });
      req.feathers.authorization = req.headers.authorization;
      req.feathers.translate = req.t;
      req.feathers.io = (server as any).io;
      next();

  });

  const mergeYAML = (yamlPath: string, prevDocument?: any) => {
    if (!fs.existsSync(yamlPath)) return prevDocument;
    try {
      const document = YAML.load(yamlPath);
      return prevDocument ? merge(prevDocument, document) : document;
    } catch (err) {
      return prevDocument;
    }
  };

  const mergeWithFolder = (folder: string, prevDocument?: any): any => {
    try {
      const subFolders = fs.readdirSync(folder);
      return subFolders.reduce((subPrevDocument: any, subFolder: string) => {
        const subFolderYAMLPath = `${folder}/${subFolder}/${subFolder}.swagger.yaml`;
        return mergeYAML(subFolderYAMLPath, subPrevDocument);
      }, prevDocument);
    } catch (err) {
      return prevDocument;
    }
  };

  // add swagger documents
  let swaggerDocument = YAML.load(`${rootLocation}/server/swagger.yaml`);
  swaggerDocument = mergeWithFolder(`${rootLocation}/server/modules`, swaggerDocument);
  swaggerDocument = mergeWithFolder(`${rootLocation}/server/modules/crm/aggregates`, swaggerDocument);
  swaggerDocument = mergeWithFolder(`${rootLocation}/server/modules/auth/aggregates`, swaggerDocument);
  server.use(config.web.api.docsJson, async (_req, res) => {
    res.status(200).json(swaggerDocument);
  });
  server.use(config.web.api.docsUrl, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  if (process.env.NO_QUEUE !== 'true') {
    logger.info('[Server] Initilizing Kafka');
    // This need to happen before bootstaping module as a pre-condition to initialize the consumer of aggeragate, if any
    // bootstrapMessageQueue(config.kafka.kafkaHost);
  }

  logger.info('[Server] Bootstraping modules');
  bootstrapModules({ server });

  logger.info(`[Server] Initializing firebase.....`);
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.firebase.serviceAccount['project_id'],
      clientEmail: config.firebase.serviceAccount['client_email'],
      privateKey: config.firebase.serviceAccount['private_key'],
    }),
    databaseURL: config.firebase.databaseURL,
  });

  // add json error return to feathers
  server.use((error: any, req: any, res: any, _next: any) => {
    res.status(error.code || 500).json({message: error.message || req.t('internalServerError')});
  });
};
