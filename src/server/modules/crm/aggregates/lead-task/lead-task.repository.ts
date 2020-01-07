import {
  addDeletableSchema, addAuditableSchema, NotImplementedError, execCursorPaging,
  LEAD_TASK_STATUS_UNFINISHED,
} from '@app/core';
import mongoose from 'mongoose';
import { LeadTaskRepository } from './interfaces/LeadTaskRepository';
import moment from 'moment';

const LeadTaskSchema = new mongoose.Schema(addAuditableSchema(addDeletableSchema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true,
  },
  assigneeId: {
    type: String,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
  },
  dueAt: {
    type: Number,
    required: true,
  },
  status: {
    type: Number,
    required: true,
    default: LEAD_TASK_STATUS_UNFINISHED,
  },
  finishedAt: {
    type: Number,
  },
})), {
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
});

LeadTaskSchema.virtual('id').get(function () {
  // @ts-ignore
  return this._id;
});

const LeadTaskModel = mongoose.model('LeadTask', LeadTaskSchema);

export const leadTaskRepository: LeadTaskRepository = {
  findById: async (id) => {
    return await LeadTaskModel.findById(id)
      .exec() as any;
  },
  findOne: async (query: { name?: string }) => {
    return await LeadTaskModel.findOne({ name: query.name }).exec() as any;
  },
  findAll: async () => {
    return await LeadTaskModel.find({}).exec() as any;
  },
  findByLeadId: async (leadId) => {
    return await LeadTaskModel.find({ leadId })
      .populate('assigneeId', '_id fullName')
      .exec() as any;
  },
  findOverdueRecords: async () => {
    const result = await LeadTaskModel.find({
      status: LEAD_TASK_STATUS_UNFINISHED,
      dueAt: {
        $lte: moment().endOf('day').valueOf(),
        $gte: moment().startOf('day').valueOf(),
      },
    }).exec() as any;
    return result;
  },
  find: async (query) => {
    const filters: any[] = [];
    if (query.search) {
      filters.push({ $text: { $search: `"${query.search}"` } });
    }
    if (query.filter && query.filter.length > 0) {
      query.filter.forEach((val: any) => {
        filters.push(val);
      });
    }

    return await execCursorPaging(
      LeadTaskModel,
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
    const newLeadTask = new LeadTaskModel({
      ...payload,
    });
    await newLeadTask.save();
    return newLeadTask._id;
  },
  update: async (payload) => {
    await LeadTaskModel.findByIdAndUpdate(payload.id, { $set: payload }).exec();
  },
  del: async (_id): Promise<void> => {
    await LeadTaskModel.findByIdAndRemove(_id).exec();
  },
  delByCriteria: async (criteria: any): Promise<void> => {
    await LeadTaskModel.deleteMany(criteria).exec();
  },
  ensureIndexes: async () => {
    // LeadTaskSchema.index({ email: 'text', fullName: 'text', phoneNo: 'text' });
    await LeadTaskModel.createIndexes();
  },
};
