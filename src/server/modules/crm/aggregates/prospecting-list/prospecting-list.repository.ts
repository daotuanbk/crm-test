import {
  addDeletableSchema,
  addAuditableSchema,
  NotImplementedError,
  execCursorPaging,
  PROSPECTING_LIST_SOURCE_EMAIL,
  PROSPECTING_LIST_SOURCE_FBCHAT,
  PROSPECTING_LIST_SOURCE_WEB,
  PROSPECTING_LIST_SOURCE_SELF_CREATED,
  PROSPECTING_LIST_SOURCE_OLD_CUSTOMER, PROSPECTING_LIST_SOURCE_OLD_CRM,
} from '@app/core';
import mongoose from 'mongoose';
import { ProspectingListRepository } from './interfaces/ProspectingListRepository';
import moment from 'moment';

const ProspectingListSchema = new mongoose.Schema(addAuditableSchema(addDeletableSchema({
  name: {
    type: String,
    required: true,
  },
  source: {
    type: Number,
    required: true,
  },
  pageId: {
    // for facebook fanpage
    type: String,
  },
  entries: {
    all: {
      type: Number,
      required: true,
      default: 0,
    },
    active: {
      type: Number,
      required: true,
      default: 0,
    },
    toQualify: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  sourceName: {
    type: String,
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
  },
  assigneeId: {
    type: String,
    ref: 'User',
  },
  subAssignees: [{
    type: String,
    ref: 'User',
  }],
  centreId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Centre',
  },
  autoAddProductOrder: {
    type: Boolean,
    default: false,
  },
  comboId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCombo',
  },
  comboName: String,
  courses: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductCourse',
    },
    name: String,
    shortName: String,
    tuitionBeforeDiscount: Number,
  }],
  isPriority: {
    type: Boolean,
    default: false,
  },
})), {
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
});

ProspectingListSchema.virtual('id').get(function() {
  // @ts-ignore
  return this._id;
});

const ProspectingListModel = mongoose.model('ProspectingList', ProspectingListSchema);

export const prospectingListRepository: ProspectingListRepository = {
  findById: async (id) => {
    return await ProspectingListModel.findById(id)
    .populate({path: 'centreId', select: 'id name'})
    .populate({path: 'assigneeId', select: 'id fullName'})
    .populate({path: 'courses._id', select: 'id name shortName'})
    .exec() as any;
  },
  findOne: async (query: {name?: string}) => {
    return await ProspectingListModel.findOne({name: query.name}).exec() as any;
  },
  findBySource: async (source: number) => {
    return await ProspectingListModel.findOne({source}).exec() as any;
  },
  findByQuery: async (query: any) => {
    return await ProspectingListModel.findOne(query).exec() as any;
  },
  findAll: async () => {
    return await ProspectingListModel.find({}).exec() as any;
  },
  find: async (query, isPriority?: boolean) => {
    const filters: any[] = [];
    if (query.search) {
      filters.push({ $text: { $search: `"${query.search}"`} });
    }
    if (query.filter && query.filter.length > 0) {
      JSON.parse(query.filter).forEach((val: any) => {
        filters.push(val);
      });
    }
    let priorityItems = [];
    if (isPriority) {
      priorityItems = await ProspectingListModel
      .find({
        isPriority: true,
        ...(filters.length > 0 ? {$and: filters} : {}),
      })
      .populate({path: 'assigneeId', select: 'id fullName'})
      .populate({path: 'courses._id', select: 'id name shortName'}) as any;
    }

    filters.push({isDeleted: false});
    if (!query.authUser) {
      filters.push({isPriority: {$ne: true}});
    }

    if (query.authUser) {
      filters.push({$or: [{assigneeId: query.authUser._id}, {subAssignees: query.authUser.id}, {createdBy: query.authUser.id}]});
    }

    const results = await execCursorPaging(
      ProspectingListModel,
      filters,
      query.sortBy,
      Number(query.first),
      [
        {path: 'assigneeId', select: 'id fullName'},
        {path: 'courses._id', select: 'id name shortName'},
      ],
      query.before,
      query.after,
    );
    return {
      data: [].concat(priorityItems, results.data),
      before: results.before,
      after: results.after,
    };
  },
  count: async (_query) => {
    throw new NotImplementedError();
  },
  create: async (payload) => {
    const newProspectingList = new ProspectingListModel({
      ...payload,
    });
    await newProspectingList.save();
    return newProspectingList._id;
  },
  update: async (payload) => {
    await ProspectingListModel.findByIdAndUpdate(payload.id, { $set: payload }).exec();
  },
  increaseEntries: async (criteria, payload) => {
    await ProspectingListModel.findOneAndUpdate(criteria, payload, {new: true}).exec();
  },
  del: async (_id): Promise<void> => {
    await ProspectingListModel.findByIdAndUpdate(_id, { $set: { isDeleted: true } }).exec();
    // await LeadsModel.findByIdAndUpdate(_id, { $set: { isDeleted: true } }).exec();
  },
  ensureIndexes: async () => {
    ProspectingListSchema.index({ name: 'text', sourceName: 'text' });
    await ProspectingListModel.createIndexes();
  },
  init: async () => {
    const promises = [
        findOrCreateProspectingList(PROSPECTING_LIST_SOURCE_EMAIL, 'email'),
        findOrCreateProspectingList(PROSPECTING_LIST_SOURCE_FBCHAT, 'fbchat', true),
        findOrCreateProspectingList(PROSPECTING_LIST_SOURCE_WEB, 'web'),
        findOrCreateProspectingList(PROSPECTING_LIST_SOURCE_SELF_CREATED, 'self-created'),
        findOrCreateProspectingList(PROSPECTING_LIST_SOURCE_OLD_CUSTOMER, 'old-customer'),
        findOrCreateProspectingList(PROSPECTING_LIST_SOURCE_OLD_CRM, 'old-crm'),
    ];
    await Promise.all(promises);
  },
  addToSubAssignees: async (id: string, assignee: string) => {
    return await ProspectingListModel.update({_id: id}, {$addToSet: {subAssignees: assignee}}).exec();
  },
};

const findOrCreateProspectingList = async (source: number, name: string, isPriority?: boolean) => {
  const existed = await ProspectingListModel.find({source});
  if (existed && existed.length) {
    return;
  }
  const newProspectingList = new ProspectingListModel({
    source,
    name,
    isPriority,
    createdAt: moment().valueOf(),
  });
  await newProspectingList.save();
};
