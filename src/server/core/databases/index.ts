import { stopDatabase, addIsAuditableSchema, addIsDeletableSchema, ObjectId, Schema, model, getPaginationResult, startDatabase } from './mongo.database';

export const mongoDatabase = {
  stopDatabase,
  addIsAuditableSchema,
  addIsDeletableSchema,
  ObjectId,
  Schema,
  model,
  getPaginationResult,
  startDatabase,
};
