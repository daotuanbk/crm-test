import { NotImplementedError, execCursorPaging } from '@app/core';
import mongoose from 'mongoose';
import { LeadHistoryRepository } from './interfaces/LeadHistoryRepository';

const LeadHistorySchema = new mongoose.Schema({
  actionType: String,
  actionCreatedBy: {
    _id: {
      type: String,
      ref: 'User',
    },
    name: String,
  },
  actionCreatedWhen: Date,
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
  },
  name: String,
  currentCentre: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Centre',
    },
    name: String,
  },
  currentStage: String,
  currentStatus: String,
  currentOwner: {
    _id: {
      type: String,
      ref: 'User',
    },
    name: String,
  },
  fromStage: String,
  fromStatus: String,
  fromCentre: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Centre',
    },
    name: String,
  },
  fromClass: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
    },
    name: String,
  },
  fromOwner: {
    _id: {
      type: String,
      ref: 'User',
    },
    name: String,
  },
  toStage: String,
  toStatus: String,
  toCentre: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Centre',
    },
    name: String,
  },
  toClass: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
    },
    name: String,
  },
  toOwner: {
    _id: {
      type: String,
      ref: 'User',
    },
    name: String,
  },
  conversation: {
    conversationType: String,
    content: String,
    starter: String,
    html: String,
  },
  transaction: {
    paymentType: String,
    amount: Number,
    note: String,
    payDay: Date,
  },
}, {
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
});

LeadHistorySchema.virtual('id').get(function() {
  // @ts-ignore
  return this._id;
});

const LeadHistoryModel = mongoose.model('LeadHistory', LeadHistorySchema);

export const leadHistoryRepository: LeadHistoryRepository = {
  findById: async (id) => {
    return await LeadHistoryModel.findById(id)
      .exec() as any;
  },
  findOne: async (query: {name?: string}) => {
    return await LeadHistoryModel.findOne({name: query.name}).exec() as any;
  },
  findAll: async () => {
    return await LeadHistoryModel.find({}).exec() as any;
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
        LeadHistoryModel,
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
    const newLeadHistory = new LeadHistoryModel({
      ...payload,
    });
    await newLeadHistory.save();
    return newLeadHistory._id;
  },
  update: async (payload) => {
    await LeadHistoryModel.findByIdAndUpdate(payload.id, { $set: payload }).exec();
  },
  del: async (_id): Promise<void> => {
    await LeadHistoryModel.findByIdAndRemove(_id).exec();
  },
  delByCriteria: async (criteria: any): Promise<void> => {
    await LeadHistoryModel.deleteMany(criteria).exec();
  },
  ensureIndexes: async () => {
    // LeadHistorySchema.index({ email: 'text', fullName: 'text', phoneNo: 'text' });
    await LeadHistoryModel.createIndexes();
  },
};
