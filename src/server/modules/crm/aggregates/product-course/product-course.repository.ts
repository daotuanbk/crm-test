import { addDeletableSchema, NotImplementedError, execCursorPaging } from '@app/core';
import mongoose from 'mongoose';
import { ProductCourseRepository } from './interfaces/ProductCourseRepository';

const ProductCourseSchema = new mongoose.Schema(addDeletableSchema({
  name: String,
  description: String,
  shortName: String,
  order: Number,
  tuitionBeforeDiscount: Number,
  isAvailableInCombo: Boolean,
  createdAt: Date,
  createdBy: {
    type: String,
    ref: 'User',
  },
  updatedAt: Date,
  lastModifiedAt: Date,
  lastModifiedBy: {
    type: String,
    ref: 'User',
  },
}));
ProductCourseSchema.index({ 'name': 'text', 'shortName': 'text' }, { name: 'coreIndex' });
ProductCourseSchema.virtual('id').get(function() {
  // @ts-ignore
  return this._id;
});
const ProductCourseModel = mongoose.model('ProductCourse', ProductCourseSchema);
ProductCourseModel.createIndexes();

export const productCourseRepository: ProductCourseRepository = {
  findById: async (id) => {
    return await ProductCourseModel.findById(id)
      .exec() as any;
  },
  findOne: async (query: {name?: string}) => {
    return await ProductCourseModel.findOne({name: query.name}).exec() as any;
  },
  find: async (query) => {
    const filters: any[] = [];
    if (query.search) {
      filters.push({name: { $regex: `^${query.search}`, $options: 'i' }});
    }
    if (query.filter && query.filter.length > 0) {
      query.filter.forEach((val: any) => {
        filters.push(val);
      });
    }

    return await execCursorPaging(
      ProductCourseModel,
      filters,
      query.sortBy,
      Number(query.first),
      [],
      query.before,
      query.after,
    );
  },
  findAll: async() => {
    return await ProductCourseModel.find({}).exec() as any;
  },
  count: async (_query) => {
    throw new NotImplementedError();
  },
  create: async (payload) => {
    const newProductCourse = new ProductCourseModel({
      ...payload,
    });
    await newProductCourse.save();
    return newProductCourse._id;
  },
  update: async (payload) => {
    await ProductCourseModel.findByIdAndUpdate(payload.id, { $set: payload }).exec();
  },
  del: async (_id): Promise<void> => {
    throw new NotImplementedError();
  },
  ensureIndexes: async () => {
    // ProductCourseSchema.index({ email: 'text', fullName: 'text', phoneNo: 'text' });
    await ProductCourseModel.createIndexes();
  },
  init: async () => {
    await ProductCourseModel.remove({});
    const array = [{
      name: 'Code For Everyone',
      shortName: 'C4E',
      order: 1,
      tuitionBeforeDiscount: 5000000,
      isAvailableInCombo: true,
    }, {
      name: 'Code For Kids',
      shortName: 'C4K',
      order: 1,
      tuitionBeforeDiscount: 5000000,
      isAvailableInCombo: true,
    }, {
      name: 'Full Stack Web Developer',
      shortName: 'WEB',
      order: 1,
      tuitionBeforeDiscount: 5000000,
      isAvailableInCombo: true,
    }, {
      name: 'React Native',
      shortName: 'APP',
      order: 1,
      tuitionBeforeDiscount: 5000000,
      isAvailableInCombo: true,
    }, {
      name: 'Unknown Course',
      shortName: 'UNK',
      order: 1,
      tuitionBeforeDiscount: 0,
      isAvailableInCombo: true,
    }];
    const promises = array.map((val: any) => {
      const newCourse = new ProductCourseModel(val);
      return newCourse.save();
    });
    await Promise.all(promises);
  },
  synchronize: async (data: any) => {
    await ProductCourseModel.deleteMany({});
    const promises = [...data, {
      name: 'Unknown Course',
      description: 'Placeholder for unselected course',
      shortName: 'UNK',
      order: 1,
      tuitionBeforeDiscount: 0,
      isAvailableInCombo: true,
    }].map((val: any) => {
      const newCourse = new ProductCourseModel(val);
      return newCourse.save();
    });
    await Promise.all(promises);
  },
};
