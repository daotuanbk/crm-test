import mongoose from 'mongoose';
import {
  NotImplementedError,
  execPaging,
} from '@app/core';
import { LmsCategoryRepository, LmsCategory } from '@app/crm';
import mongoosePaginate from 'mongoose-paginate';
import _ from 'lodash';

const LmsCategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false,
  },
  courses: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LmsCourse' }],
    required: true,
    default: [],
  },
  createdAt: {
    type: Date,
    required: false,
  },
  updatedAt: {
    type: Date,
    required: false,
  },
});

LmsCategorySchema.index({ title: 'text', description: 'text' }, { name: 'searchLmsCategoryIndex' });
LmsCategorySchema.plugin(mongoosePaginate);
const LmsCategoryModel = mongoose.model('LmsCategory', LmsCategorySchema);

export const lmsCategoryRepository: LmsCategoryRepository = {
  findById: async (id: string) => {
    return await LmsCategoryModel.findById(id).lean();
  },
  find: async (_query: any) => {
    return await execPaging(
      LmsCategoryModel,
      {},
      { createdAt: -1 },
      1,
      50,
    );
  },
  findAll: async (query: any) => {
    return (await LmsCategoryModel.find(query).lean() as unknown) as [LmsCategory];
  },
  upsert: async (lmsCategory: LmsCategory) => {
    const _id = _.get(lmsCategory, '_id');
    const filter = { _id };
    const update = {
      $set: lmsCategory,
    };
    const options = {
      upsert: true,
      new: true,
    };
    const doc = await LmsCategoryModel.findOneAndUpdate(filter, update, options);
    return (doc as unknown) as LmsCategory;
  },
  ensureIndexes: async () => {
    await LmsCategoryModel.createIndexes();
  },
  findOne: () => {
    throw new NotImplementedError();
  },
  count: () => {
    throw new NotImplementedError();
  },
  create: () => {
    throw new NotImplementedError();
  },
  update: () => {
    throw new NotImplementedError();
  },
  del: async (_id: string) => {
    const update = {
      $set: {
        isDeleted: true,
      },
    };
    const filter = { _id };
    await LmsCategoryModel.findOneAndUpdate(filter, update);
  },
  delByCriteria: async (query: any) => {
    const update = {
      $set: {
        isDeleted: true,
      },
    };
    await LmsCategoryModel.findOneAndUpdate(query, update);
  },
};
