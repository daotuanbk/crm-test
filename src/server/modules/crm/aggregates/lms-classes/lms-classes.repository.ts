import mongoose from 'mongoose';
import { toDBQuery, execPaging, NotImplementedError } from '@app/core';
import { LmsClassRepository, LmsClass } from '@app/crm';
import mongoosePaginate from 'mongoose-paginate';
import { DB_QUERY_SETTER_DICT } from './helpers/utils';
import _ from 'lodash';

const LmsClassSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  lmsCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LmsCourse',
  },
  createdAt: {
    type: Date,
    required: false,
  },
  updatedAt: {
    type: Date,
    required: false,
  },
  isDeleted: {
    type: Boolean,
    required: false,
    default: false,
  },
});
LmsClassSchema.index({ title: 'text', description: 'text'}, { name: 'searchLmsClassIndex' });
LmsClassSchema.plugin(mongoosePaginate);
const LmsClassModel = mongoose.model('LmsClass', LmsClassSchema);

export const lmsClassRepository: LmsClassRepository = {
  findById: async (id: string) => {
    return await LmsClassModel.findById(id).lean();
  },
  find: async (query: any) => {
    const simpleFilters = toDBQuery(query, DB_QUERY_SETTER_DICT);
    const defaultSort = { 'title': -1 };

    return await execPaging(
      LmsClassModel,
      { ...simpleFilters, isDeleted: { $ne: true } },
      defaultSort,
      Number(query.page),
      Number(query.limit),
      [],
    );
  },
  upsert: async (record) => {
    const _id = _.get(record, '_id');
    const filter = { _id };
    const update = { $set: record };
    const options = { upsert: true, new: true };
    const doc = await LmsClassModel.findByIdAndUpdate(filter, update, options).lean();
    return (doc as unknown) as LmsClass;
  },
  ensureIndexes: async () => {
    await LmsClassModel.createIndexes();
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
    const filter = { _id };
    const update = {
      $set: {
        isDeleted: true,
      },
    };
    await LmsClassModel.findOneAndUpdate(filter, update);
  },
  delByCriteria: async (query: any) => {
    const update = {
      $set: {
        isDeleted: true,
      },
    };
    await LmsClassModel.findOneAndUpdate(query, update);
  },
  updateCourse: async (_id: string, lmsCourse: string) => {
    const filter = { _id };
    const update = { $set: { lmsCourse } };
    const options = { upsert: true };
    const doc = await LmsClassModel.findByIdAndUpdate(filter, update, options).lean();
    return (doc as unknown) as LmsClass;
  },
};
