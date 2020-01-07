import feathers from '@feathersjs/feathers';
import express from '@feathersjs/express';
import { bootstrapServer } from './server/bootstrap-server';

const server = express(feathers());
bootstrapServer({ server });

export {
  server,
};
