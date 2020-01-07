import { addDeletableSchema, addAuditableSchema, NotImplementedError, execCursorPaging } from '@app/core';
import mongoose from 'mongoose';
import { ListsRepository } from './interfaces/ListsRepository';

const ListsSchema = new mongoose.Schema(addAuditableSchema(addDeletableSchema({
  //
})));
ListsSchema.virtual('id').get(function() {
  // @ts-ignore
  return this._id;
});
const ListsModel = mongoose.model('List', ListsSchema);

export const listRepository: ListsRepository = {
  findById: async (id) => {
    return await ListsModel.findById(id)
      .exec() as any;
  },
  findOne: async (query: {name?: string}) => {
    return await ListsModel.findOne({name: query.name}).exec() as any;
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
      ListsModel,
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
    const newList = new ListsModel({
      ...payload,
    });
    await newList.save();
    return newList._id;
  },
  update: async (payload) => {
    await ListsModel.findByIdAndUpdate(payload.id, { $set: payload }).exec();
  },
  del: async (_id): Promise<void> => {
    throw new NotImplementedError();
  },
  ensureIndexes: async () => {
    // ListsSchema.index({ email: 'text', fullName: 'text', phoneNo: 'text' });
    await ListsModel.createIndexes();
  },
};
