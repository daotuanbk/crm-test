import { addDeletableSchema, NotImplementedError, execCursorPaging } from '@app/core';
import mongoose from 'mongoose';
import { ProductComboRepository } from './interfaces/ProductComboRepository';

const ProductComboSchema = new mongoose.Schema(addDeletableSchema({
  name: String,
  field: String,
  condition: String,
  conditionValue: Number,
  discountType: String,
  discountValue: String,
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

ProductComboSchema.virtual('id').get(function() {
  // @ts-ignore
  return this._id;
});
ProductComboSchema.index({ name: 'text' });
const ProductComboModel = mongoose.model('ProductCombo', ProductComboSchema);
ProductComboModel.createIndexes();

export const productComboRepository: ProductComboRepository = {
  findById: async (id) => {
    return await ProductComboModel.findById(id)
      .exec() as any;
  },
  findOne: async (query: {name?: string}) => {
    return await ProductComboModel.findOne({name: query.name}).exec() as any;
  },
  find: async (query) => {
    const filters: any[] = [];
    if (query.search) {
      filters.push({ $text: { $search: `"${query.search}"`} });
    }
    if (query.filter && query.filter.length > 0) {
      query.filter.forEach((val: any) => {
        if (val.split('|').length > 1) {
          filters.push({[val.split('|')[0]]: val.split('|')[1] === 'null' ? null : val.split('|')[1]});
        } else if (val.split('%').length > 1) {
          filters.push({[val.split('%')[0]]: val.split('%')[1] === 'null' ? null : JSON.parse(val.split('%')[1])});
        }
      });
    }

    return await execCursorPaging(
      ProductComboModel,
      [...filters, {isDeleted: false}],
      query.sortBy,
      Number(query.first),
      [],
      query.before,
      query.after,
    );
  },
  findAll: async () => {
    return await ProductComboModel.find({isDeleted: false}).exec() as any;
  },
  count: async (_query) => {
    throw new NotImplementedError();
  },
  create: async (payload) => {
    const newProductCombo = new ProductComboModel({
      ...payload,
    });
    await newProductCombo.save();
    return newProductCombo._id;
  },
  update: async (payload) => {
    const record = await ProductComboModel.findOne({_id: payload.id}).exec();
    const newProductCombo = new ProductComboModel({
      ...record,
      ...payload,
      _id: undefined,
    });
    await ProductComboModel.findOneAndUpdate({_id: payload.id}, { $set: {isDeleted: true} }, {new: true}).exec();
    return newProductCombo.save() as any;
  },
  del: async (_id): Promise<void> => {
    await ProductComboModel.findOneAndUpdate({_id}, {isDeleted: true}).exec();
  },
  ensureIndexes: async () => {
    ProductComboSchema.index({ name: 'text' });
    await ProductComboModel.createIndexes();
    // await ProductComboModel.ensureIndexes({name : 'text'});
  },
  init: async () => {
    const initialCombos = [{
      _id: '5c99eb9c2bb848b06e3a467b',
      fee: {
        original: 13100000,
        discount: 9500000,
      },
      name: 'Lộ trình fresher web(3 khoá)',
      isPopular: true,
      searchString: 'lo trinh fresher web(3 khoa)',
    },
    {
      _id: '5c99ebb72bb848b06e3a46f1',
      fee: {
        original: 13100000,
        discount: 9500000,
      },
      name: 'Lộ trình mobile app developer(3 khoá)',
    },
    {
      _id: '5c99ec1e2bb848b06e3a4872',
      fee: {
        original: 8700000,
        discount: 7500000,
      },
      name: 'Lộ trình fresher web(2 khoá)',
      isPopular: true,
    },
    {
      _id: '5c99ec372bb848b06e3a48cc',
      fee: {
        original: 8700000,
        discount: 7500000,
      },
      name: 'Lộ trình mobile app developer(2 khoá)',
    },
    {
      _id: '5c9ca18894a505da02c8f940',
      name: 'Lộ trình 6 tháng(2 khóa)',
      fee: {
        original: 10400000,
        discount: 8800000,
      },
      description: 'Thời gian: 12 tháng.\nKết quả đầu ra: Học viên có khả năng làm việc như một nhân viên Partime, Fresher, Junior trong các công ty công nghệ.',
      __v: 0,
      isPopular: true,
    },
    {
      _id: '5c9cbe2194a505da02c8f958',
      name: 'Lộ trình 12 tháng(4 khóa)',
      fee: {
        original: 21600000,
        discount: 15000000,
      },
      description: 'Combo 4 khóa(Beginner + Advanced + Intensive và Advance 18 +)',
    },
    {
      _id: '5c9da186db73aab778b0efb2',
      fee: {
        original: 9600000,
        discount: 7800000,
      },
      name: 'Combo 2 khóa bất kì',
      isPopular: true,
      __v: 0,
      description: 'Học viên lựa chọn 2 học phần bất kỳ trong các học phần của chương trình Code for Kids',
    },
    {
      _id: '5c9da1c7db73aab778b0efb3',
      name: 'Combo 3 khóa bất kì',
      fee: {
        original: 14400000,
        discount: 11000000,
      },
      __v: 0,
      isPopular: true,
    },
    {
      _id: '5c9da1dfdb73aab778b0efb4',
      name: 'Combo 4 khóa bất kì',
      fee: {
        original: 19200000,
        discount: 14000000,
      },
      isPopular: true,
    },
    {
      _id: '5c9da1f4db73aab778b0efb5',
      name: 'Combo 6 khóa C4K',
      fee: {
        original: 28800000,
        discount: 19500000,
      },
    },
    {
      _id: '5c9da207db73aab778b0efb6',
      name: 'Combo 8 khóa C4K',
      fee: {
        original: 42200000,
        discount: 29000000,
      },
    },
    {
      _id: '5c9dfb5947f2e1d8ea7ae8c9',
      name: 'Combo 2 khóa Code For Teen',
      fee: {
        original: 10400000,
        discount: 8800000,
      },
      description: 'Combo 2 khóa học Beginner và Advance',
    },
    {
      _id: '5c9dfcba47f2e1d8ea7ae8ca',
      name: 'Combo 4 khóa',
      fee: {
        original: 19100000,
        discount: 14000000,
      },
      description: 'Combo 4 khóa học C4T Beginner, C4T Advance, Code Intensive và Advance18+',
    }];
    const promises = initialCombos.map((val: any) => {
      const newCombo = new ProductComboModel({
        isDeleted: false,
        _id: val._id,
        name: val.name,
        discountType: 'FIXED',
        discountValue: val.fee ? val.fee.discount : 0,
        field: 'tuitionBD',
        condition: 'gte',
        conditionValue: val.fee ? val.fee.original : 0,
      });
      return newCombo.save();
    });
    await Promise.all(promises);
  },
};
