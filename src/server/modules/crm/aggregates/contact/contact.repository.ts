import mongoose from 'mongoose';
import {
  addAuditableSchema,
  addDeletableSchema,
  NotImplementedError,
  GENDER_FEMALE,
  GENDER_MALE,
  GENDER_OTHER,
  RELATION_DAUGHTER,
  RELATION_GRAND_DAUGHTER,
  RELATION_SON,
  RELATION_NEPHEW,
  RELATION_OTHER,
  RELATION_GRAND_SON,
  execPaging,
  toDBQuery,
  toDBSort,
} from '@app/core';
import { ContactRepository } from '@app/crm';
import mongoosePaginate from 'mongoose-paginate';
import { DB_QUERY_SETTER_DICT, SORT_FIELD_DICT } from './helpers/utils';

const ContactSchema = new mongoose.Schema(addAuditableSchema(addDeletableSchema({
  fullName: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  gender: {
    type: String,
    enum: [GENDER_FEMALE, GENDER_MALE, GENDER_OTHER],
  },
  email: {
    type: String,
  },
  address: {
    type: String,
  },
  dob: {
    type: Date,
  },
  facebook: {
    type: String,
  },
  zalo: {
    type: String,
  },
  school: {
    type: String,
  },
  family: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'V2Contact',
    },
    fullName: String,
    phoneNumber: String,
    email: String,
    relation: {
      type: String,
      enum: [
        RELATION_DAUGHTER,
        RELATION_SON,
        RELATION_GRAND_DAUGHTER,
        RELATION_GRAND_SON,
        RELATION_NEPHEW,
        RELATION_OTHER,
      ],
    },
  }],
})));
ContactSchema.index({
  'fullName': 'text',
  'phoneNumber': 'text',
  'email': 'text',
  'family.fullName': 'text',
  'family.phoneNumber': 'text',
  'family.email': 'text',
});
ContactSchema.virtual('id').get(function () {
  // @ts-ignore
  return this._id;
});
ContactSchema.plugin(mongoosePaginate);

const ContactModel = mongoose.model('V2Contact', ContactSchema);

export const contactRepository: ContactRepository = {
  findById: async (id) => {
    return await ContactModel.findById(id).lean();
  },
  findOne: async (query) => {
    return await ContactModel.findOne(query)
      .populate('family._id')
      .lean();
  },
  findInArrayId: async (payload: any) => {
    return await ContactModel.find({ rootContactId: { $in: payload } }).lean();
  },
  findByCriteria: async (payload: any) => {
    return await ContactModel.find(payload).lean();
  },
  find: async (query) => {
    const simpleFilters = toDBQuery(query, DB_QUERY_SETTER_DICT);
    const dbSort = toDBSort(query.sortBy, SORT_FIELD_DICT);

    return await execPaging(
      ContactModel,
      {...simpleFilters},
      dbSort,
      query.page,
      query.limit,
      [],
    );
  },
  count: async (_query) => {
    throw new NotImplementedError();
  },
  create: async (payload) => {
    const newContact = await ContactModel.create(payload);
    return newContact as any;
  },
  update: async (payload) => {
    const idToUse = payload.id || payload._id;
    return await ContactModel.findByIdAndUpdate(idToUse, {$set: payload}, {new: true}).lean();
  },
  del: async (_id): Promise<void> => {
    throw new NotImplementedError();
  },
  delByCriteria: async (criteria: any): Promise<void> => {
    await ContactModel.deleteMany(criteria).lean();
  },
  ensureIndexes: async () => {
    await ContactModel.createIndexes();
  },
  summary: async (listId: string) => {
    const total = await ContactModel.count({ prospectingListId: listId }).lean();
    const active = await ContactModel.count({ prospectingListId: listId, leadId: { $ne: null } }).lean();
    const toQualify = await ContactModel.count({ prospectingListId: listId, isQualified: false, leadId: null }).lean();
    return {
      total,
      active,
      toQualify,
    };
  },
  findAll: async () => {
    return await ContactModel.find().lean();
  },
};
