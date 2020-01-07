import { Application } from '@feathersjs/express';
import { logger, rootLocation } from '@app/core';
import { config } from '@app/config';
import fs from 'fs';
import _ from 'lodash';
import { imageRouter, attachmentRouter } from '@app/website';

const bootstrapService = (server: Application<any>, baseUrl: string, aggregateName: string) => {
  const serviceUrl = `${baseUrl}/${aggregateName}/${aggregateName}.service`;
  const service: any = require(serviceUrl).default;
  if (service) {
    logger.info(`[Server] [${baseUrl}][${aggregateName}] Registering service api...`);
    if (service.setup) {
      service.setup(server, `/api/${aggregateName}`);
    }
    if (!_.isEmpty(service)) {
      server.use(`/api/${aggregateName}`, service);
    } else {
      logger.info(`[Server] [${baseUrl}][${aggregateName}] Service is empty`);
    }

    try {
      logger.info(`[Server] [${baseUrl}][${aggregateName}] Adding hook...`);
      const hook = require(`${baseUrl}/${aggregateName}/${aggregateName}.hook`).default;
      if (hook) {
        server.service(`${config.web.api.prefix}/${aggregateName}`).hooks(hook);
      }
    } catch (error) {
      // ignore hook not found
      logger.error(error);
    }
  }
};

const bootstrapQueue = (baseUrl: string, aggregateName: string) => {
  const queueUrl = `${baseUrl}/${aggregateName}/${aggregateName}.queue`;
  try {
    const queue: any = require(queueUrl).default;
    if (queue) {
      logger.info(`[Server][${baseUrl}][${aggregateName}] Setting queue`);
      queue.createConsumer();
    }
  } catch (err) {
    logger.info(`[Server][${baseUrl}][${aggregateName}] No queue present, ignore`);
    logger.info(err);
  }
};

export const bootstrapModules = ({ server }: { server: Application<any> }) => {
  logger.info('[Server] Loading modules...');
  const rootDir = `${rootLocation}/server/modules`;
  const moduleNames = fs.readdirSync(rootDir);
  const excludedModules: string[] = ['.DS_Store'];
  const excludedAggregates: string[] = ['helpers', '.DS_Store'];
  for (const moduleName of moduleNames) {
    if (excludedModules.indexOf(moduleName) !== -1) {
      continue;
    }
    const moduleDir = `${rootDir}/${moduleName}`;
    logger.info(`[Server] Loading module '${moduleName}'...`);

    // add aggregates graphql
    logger.info(`[Server] [${moduleName}] Setup aggregates...`);
    const aggregateNames = fs.readdirSync(`${moduleDir}/aggregates`);

    for (const aggregateName of aggregateNames) {
      if (excludedAggregates.indexOf(aggregateName) !== -1 || aggregateName.indexOf('index') === 0) {
        continue;
      }
      logger.info(`[Server] [${moduleName}] Setup aggregate '${aggregateName}'...`);
      const aggregatesUrl = `./modules/${moduleName}/aggregates`;
      bootstrapService(server, aggregatesUrl, aggregateName);

      if (process.env.NO_QUEUE !== 'true') {
        bootstrapQueue(aggregatesUrl, aggregateName);
      }
    }
  }

  // Upload images
  server.use('/api/upload-image', imageRouter);
  server.use('/api/upload-attachment', attachmentRouter);

  logger.info('[Server] Done loading modules...');
};
