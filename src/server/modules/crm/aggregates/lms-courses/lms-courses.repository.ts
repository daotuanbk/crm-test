import mongoose from 'mongoose';
import { toDBQuery, execPaging, NotImplementedError } from '@app/core';
import { LmsCourseRepository, LmsCourse } from '@app/crm';
import mongoosePaginate from 'mongoose-paginate';
import { DB_QUERY_SETTER_DICT } from './helpers/utils';
import _ from 'lodash';

const LmsCourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  categories: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LmsCategory' }],
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
  isDeleted: {
    type: Boolean,
    required: false,
    default: false,
  },
});
LmsCourseSchema.index({ title: 'text', description: 'text' }, { name: 'searchLmsCourseIndex' });
LmsCourseSchema.plugin(mongoosePaginate);
const LmsCourseModel = mongoose.model('LmsCourse', LmsCourseSchema);

export const lmsCourseRepository: LmsCourseRepository = {
  findById: async (id: string) => {
    return await LmsCourseModel.findById(id).lean();
  },
  find: async (query: any) => {
    const simpleFilters = toDBQuery(query, DB_QUERY_SETTER_DICT);
    const defaultSort = { 'title': -1 };

    return await execPaging(
      LmsCourseModel,
      { ...simpleFilters, isDeleted: { $ne: true } },
      defaultSort,
      Number(query.page),
      Number(query.limit),
      ['categories'],
    );
  },
  upsert: async (record) => {
    const _id = _.get(record, '_id');
    const filter = { _id };
    const update = { $set: record };
    const options = { upsert: true, new: true };
    const doc = await LmsCourseModel.findByIdAndUpdate(filter, update, options);
    return (doc as unknown) as LmsCourse;
  },
  ensureIndexes: async () => {
    await LmsCourseModel.createIndexes();
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
    await LmsCourseModel.findOneAndUpdate(filter, update);
  },
  delByCriteria: async (query: any) => {
    const update = {
      $set: {
        isDeleted: true,
      },
    };
    await LmsCourseModel.findOneAndUpdate(query, update);
  },
  pushCategoryIfNeeded: async (includeIds: [string], categoryId: string) => {
    const filter = {
      _id: {
        $in: includeIds,
      },
      categories: {
        '$ne': categoryId,
      },
    };
    const update = {
      $push: { categories: categoryId },
    };
    const options = {
      multi: true,
    };
    await LmsCourseModel.update(filter, update, options);
  },
  popCategoryIfNeeded: async (exludeIds: [string], categoryId: string) => {
    const filter = {
      _id: {
        $nin: exludeIds,
      },
      categories: categoryId,
    };
    const update = {
      $pull: {
        categories: categoryId,
      },
    };
    const options = {
      multi: true,
    };
    await LmsCourseModel.update(filter, update, options);
  },
};
