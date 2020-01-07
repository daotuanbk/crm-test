import { addDeletableSchema, addAuditableSchema, NotImplementedError, execCursorPaging,
  LEAD_TASK_STATUS_UNFINISHED } from '@app/core';
import mongoose from 'mongoose';
import { LeadAppointmentRepository } from './interfaces/LeadAppointmentRepository';
import moment from 'moment';

const LeadAppointmentSchema = new mongoose.Schema(addAuditableSchema(addDeletableSchema({
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
LeadAppointmentSchema.virtual('id').get(function() {
  // @ts-ignore
  return this._id;
});

const LeadAppointmentModel = mongoose.model('LeadAppointment', LeadAppointmentSchema);

export const leadAppointmentRepository: LeadAppointmentRepository = {
  findById: async (id) => {
    return await LeadAppointmentModel.findById(id)
      .exec() as any;
  },
  findOne: async (query: {name?: string}) => {
    return await LeadAppointmentModel.findOne({name: query.name}).exec() as any;
  },
  findAll: async () => {
    return await LeadAppointmentModel.find({}).exec() as any;
  },
  findByLeadId: async (leadId: string) => {
    return await LeadAppointmentModel.find({leadId})
    .populate('assigneeId', '_id fullName')
    .exec() as any;
  },
  findOverdueRecords: async () => {
    const result = await LeadAppointmentModel.find({
      status: LEAD_TASK_STATUS_UNFINISHED,
      dueAt: {
        $lte: moment().add(1, 'days').endOf('day').valueOf(),
        $gte: moment().startOf('day').valueOf(),
      },
    }).exec() as any;
    return result;
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
        LeadAppointmentModel,
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
    const newLeadAppointment = new LeadAppointmentModel({
      ...payload,
    });
    await newLeadAppointment.save();
    return newLeadAppointment.id;
  },
  update: async (payload) => {
    await LeadAppointmentModel.findByIdAndUpdate(payload.id, { $set: payload }).exec();
  },
  del: async (id): Promise<void> => {
    await LeadAppointmentModel.findByIdAndRemove(id).exec();
  },
  delByCriteria: async (criteria: any): Promise<void> => {
    await LeadAppointmentModel.deleteMany(criteria).exec();
  },
  ensureIndexes: async () => {
    // LeadAppointmentSchema.index({ email: 'text', fullName: 'text', phoneNo: 'text' });
    await LeadAppointmentModel.createIndexes();
  },
};
