import mongoose from 'mongoose';
import { addAuditableSchema, toDBQuery, toDBSort, execPaging, NotImplementedError } from '@app/core';
import { ProductsRepository } from '@app/crm';
import mongoosePaginate from 'mongoose-paginate';
import { DB_QUERY_SETTER_DICT, SORT_FIELD_DICT } from './helpers/utils';

export const ProductSchema = new mongoose.Schema(addAuditableSchema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: String,
  productLine: String,
  type: String,
  single: {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LmsCourse',
    },
  },
  combo: {
    maxCourses: Number,
    selectableCourses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LmsCourse',
    }],
  },
  hasCombo: Boolean, // Data redundancy for sort
  special: {
    maxDuration: Number, // Month duration
    selectableCourses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LmsCourse',
    }],
  },
  hasSpecial: Boolean, // Data redundancy for sort
  isActive: {
    type: Boolean,
    default: true,
  },
}));
ProductSchema.index({ name: 'text', code: 'text' }, { name: 'searchProductIndex' });
ProductSchema.plugin(mongoosePaginate);
ProductSchema.virtual('id').get(function() {
  // @ts-ignore
  return this._id;
});
const ProductsModel = mongoose.model('Product', ProductSchema);

export const productsRepository: ProductsRepository = {
  findOne: async (query) => {
    return await ProductsModel.findOne(query)
      .populate(['single.course', 'combo.selectableCourses', 'special.selectableCourses'])
      .lean();
  },
  findById: async (id) => {
    return await ProductsModel.findById(id)
      .populate(['single.course', 'combo.selectableCourses', 'special.selectableCourses'])
      .lean();
  },
  find: async (query) => {
    const simpleFilters = toDBQuery(query, DB_QUERY_SETTER_DICT);
    const dbSort = toDBSort(query.sortBy, SORT_FIELD_DICT);

    return await execPaging(
      ProductsModel,
      simpleFilters,
      dbSort,
      Number(query.page),
      Number(query.limit),
      ['single.course', 'combo.selectableCourses', 'special.selectableCourses'],
    );
  },
  count: async (_query) => {
    throw new NotImplementedError();
  },
  create: async (payload) => {
    const newProduct = await ProductsModel.create(payload);
    return await productsRepository.findById(newProduct._id) as any;
  },
  update: async (payload) => {
    return await ProductsModel.findByIdAndUpdate(payload.id, { $set: payload }, { new: true })
      .populate(['single.course', 'combo.selectableCourses', 'special.selectableCourses'])
      .lean();
  },
  del: async (_id) => {
    throw new NotImplementedError();
  },
  ensureIndexes: async () => {
    await ProductsModel.createIndexes();
  },
};
