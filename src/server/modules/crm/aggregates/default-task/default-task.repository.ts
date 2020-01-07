import { addDeletableSchema, addAuditableSchema, NotImplementedError, execCursorPaging } from '@app/core';
import mongoose from 'mongoose';
import { DefaultTaskRepository } from './interfaces/DefaultTaskRepository';

const DefaultTaskSchema = new mongoose.Schema(addAuditableSchema(addDeletableSchema({
  name: {
    type: String,
    required: true,
  },
  schedule: {
    type: String,
    required: true,
  },
})), {
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
});

DefaultTaskSchema.virtual('id').get(function() {
  // @ts-ignore
  return this._id;
});

const DefaultTaskModel = mongoose.model('DefaultTask', DefaultTaskSchema);

export const defaultTaskRepository: DefaultTaskRepository = {
  findById: async (id) => {
    return await DefaultTaskModel.findById(id)
      .exec() as any;
  },
  findOne: async (query: {name?: string}) => {
    return await DefaultTaskModel.findOne({name: query.name}).exec() as any;
  },
  findAll: async () => {
    return await DefaultTaskModel.find({}).exec() as any;
  },
  find: async (query) => {
    const filters: any[] = [];
    if (query.search) {
      filters.push({ $text: { $search: `"${query.search}"`} });
    }
    if (query.filter && query.filter.length > 0) {
      query.filter.forEach((val: any) => {
        filters.push(val);
      });
    }

    return await execCursorPaging(
      DefaultTaskModel,
      filters,
      query.sortBy,
      Number(query.first),
      [],
      query.before,
      query.after,
    );
  },
  count: async (_query) => {
    throw new NotImplementedError();
  },
  create: async (payload) => {
    const newDefaultTask = new DefaultTaskModel({
      ...payload,
    });
    await newDefaultTask.save();
    return newDefaultTask._id;
  },
  update: async (payload) => {
    await DefaultTaskModel.findByIdAndUpdate(payload.id, { $set: payload }).exec();
  },
  del: async (_id): Promise<void> => {
    throw new NotImplementedError();
  },
  ensureIndexes: async () => {
    // DefaultTaskSchema.index({ email: 'text', fullName: 'text', phoneNo: 'text' });
    await DefaultTaskModel.createIndexes();
  },
};
