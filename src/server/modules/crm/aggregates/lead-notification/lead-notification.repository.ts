import {
  addDeletableSchema,
  addAuditableSchema,
  NotImplementedError,
  execCursorPaging,
} from '@app/core';
import mongoose from 'mongoose';
import { LeadNotificationRepository } from './interfaces/LeadNotificationRepository';

const LeadNotificationSchema = new mongoose.Schema(addAuditableSchema(addDeletableSchema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
  },
  isSeen: {
    type: Boolean,
    required: true,
    default: false,
  },
  isChecked: {
    type: Boolean,
    required: true,
    default: false,
  },
  content: {
    type: String,
  },
  type: {
    type: Number,
    required: true,
  },
  objectId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'objectType',
  },
  objectType: {
    type: String,
    enum: ['LeadMessageDetail', 'LeadAppointment', 'LeadTask'],
  },
  ownerId: {
    type: String,
    ref: 'User',
  },
})), {
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
});

LeadNotificationSchema.virtual('id').get(function() {
  // @ts-ignore
  return this._id;
});

const LeadNotificationModel = mongoose.model('LeadNotification', LeadNotificationSchema);

export const leadNotificationRepository: LeadNotificationRepository = {
  findById: async (id) => {
    return await LeadNotificationModel.findById(id)
      .exec() as any;
  },
  findOne: async (query: {name?: string}) => {
    return await LeadNotificationModel.findOne({name: query.name}).exec() as any;
  },
  findAll: async () => {
    return await LeadNotificationModel.find({}).exec() as any;
  },
  findByObjectIds: async (objectIds: string[]) => {
    return await LeadNotificationModel.find({
      objectId: {
        $in: objectIds,
      },
    }) as any;
  },
  countUnseen: async (query) => {
    const filters: any[] = [];
    if (query.filter && query.filter.length > 0) {
      JSON.parse(query.filter).forEach((val: any) => {
        filters.push(val);
      });
    }
    filters.push({isSeen: false});
    return await LeadNotificationModel.find({
      $and: filters,
    }).count();
  },
  seen: async (criteria: any) => {
    await LeadNotificationModel.updateMany(criteria, {
      $set: {
        isSeen: true,
      },
    });
    return true;
  },
  check: async (id: string) => {
    await LeadNotificationModel.findByIdAndUpdate(id, { $set: {isChecked: true} }).exec();
    return true;
  },
  find: async (query) => {
    const filters: any[] = [];
    if (query.search) {
      filters.push({ $text: { $search: `"${query.search}"`} });
    }
    if (query.filter && query.filter.length > 0) {
      JSON.parse(query.filter).forEach((val: any) => {
        filters.push(val);
      });
    }

    return await execCursorPaging(
      LeadNotificationModel,
      filters,
      query.sortBy,
      Number(query.first),
      ['objectId', 'leadId', {path: 'contactId', select: 'contactBasicInfo'}],
      query.before,
      query.after,
    );
  },
  count: async (_query) => {
    throw new NotImplementedError();
  },
  create: async (payload) => {
    const newLeadNotification = new LeadNotificationModel({
      ...payload,
    });
    await newLeadNotification.save();
    return newLeadNotification._id;
  },
  update: async (payload) => {
    await LeadNotificationModel.findByIdAndUpdate(payload.id, { $set: payload }).exec();
  },
  del: async (_id): Promise<void> => {
    throw new NotImplementedError();
  },
  delByCriteria: async (criteria: any): Promise<void> => {
    await LeadNotificationModel.deleteMany(criteria).exec();
  },
  ensureIndexes: async () => {
    // LeadNotificationSchema.index({ email: 'text', fullName: 'text', phoneNo: 'text' });
    await LeadNotificationModel.createIndexes();
  },
};
