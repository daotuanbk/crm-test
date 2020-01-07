import { addDeletableSchema, addAuditableSchema, NotImplementedError, execCursorPaging } from '@app/core';
import mongoose from 'mongoose';
import { CentreRepository } from './interfaces/CentreRepository';

const CentreSchema = new mongoose.Schema(addAuditableSchema(addDeletableSchema({
  name: {
    type: String,
    required: true,
  },
  shortName: {
    type: String,
  },
  order: {
    type: Number,
    required: true,
  },
  address: {
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

CentreSchema.virtual('id').get(function() {
  // @ts-ignore
  return this._id;
});

CentreSchema.index({ name: 'text' });
const CentreModel = mongoose.model('Centre', CentreSchema);
CentreModel.createIndexes();

export const centreRepository: CentreRepository = {
  findById: async (id) => {
    return await CentreModel.findById(id)
      .lean();
  },
  findOne: async (query) => {
    return await CentreModel.findOne(query).lean();
  },
  findAll: async() => {
    return await CentreModel.find({}).lean();
  },
  find: async (query, filter?: any) => {
    const advancedFilters: any[] = [];
    if (query.search) {
      advancedFilters.push({ $text: { $search: `"${query.search}"`} });
    }
    if (query.filter && query.filter.length > 0) {
      query.filter.forEach((val: any) => {
        advancedFilters.push(val);
      });
    }

    return await execCursorPaging(
      CentreModel,
      [...advancedFilters, filter || {}],
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
    const newCentre = new CentreModel({
      ...payload,
    });
    await newCentre.save();
    return newCentre._id;
  },
  update: async (payload) => {
    await CentreModel.findByIdAndUpdate(payload.id, { $set: payload }).lean();
  },
  del: async (_id): Promise<void> => {
    throw new NotImplementedError();
  },
  ensureIndexes: async () => {
    CentreSchema.index({ name: 'text' });
    await CentreModel.createIndexes();
  },
  synchronize: async (data: any) => {
    await CentreModel.deleteMany({});
    const promises = data.map((val: any) => {
      const newCentre = new CentreModel({
        _id: val._id,
        name: val.title || 'N/A',
        shortName: val.title,
        order: 1,
        address: val.description || 'N/A',
      });
      return newCentre.save();
    });
    await Promise.all(promises);
  },
};
