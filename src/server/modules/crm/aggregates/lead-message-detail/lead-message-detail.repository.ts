import { addDeletableSchema, addAuditableSchema, NotImplementedError, execCursorPaging, LEAD_STAGE,
  LEAD_STAGE_STATUS, PROSPECTING_SOURCE } from '@app/core';
import mongoose from 'mongoose';
import { LeadMessageDetailRepository } from './interfaces/LeadMessageDetailRepository';

const LeadMessageDetailSchema = new mongoose.Schema(addAuditableSchema(addDeletableSchema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeadConservation',
    required: true,
  },
  direction: {
    type: Number,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  html: {
    type: String,
  },
  messageId: {
    type: String,
  },
  channel: {
    type: Number,
    required: true,
  },
  emailMessageId: {
    type: String,
  },
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeadAttachment',
  }],
})), {
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
});

LeadMessageDetailSchema.virtual('id').get(function() {
  // @ts-ignore
  return this._id;
});

const LeadMessageDetailModel = mongoose.model('LeadMessageDetail', LeadMessageDetailSchema);

export const leadMessageDetailRepository: LeadMessageDetailRepository = {
  findById: async (id) => {
    return await LeadMessageDetailModel.findById(id)
      .exec() as any;
  },
  findOne: async (query: {name?: string}) => {
    return await LeadMessageDetailModel.findOne({name: query.name}).exec() as any;
  },
  findLeadStageStatusByStageId: async (stageId: string) => {
    return await LeadMessageDetailModel.find({option: LEAD_STAGE_STATUS, 'value.stageId': stageId}) as any;
  },
  findLeadStages: async () => {
    return await LeadMessageDetailModel.find({option: LEAD_STAGE}) as any;
  },
  findLeadStageStatus: async () => {
    return await LeadMessageDetailModel.find({option: LEAD_STAGE_STATUS}) as any;
  },
  findByQuery: async (query: any) => {
    return await LeadMessageDetailModel.findOne(query) as any;
  },
  findProspectingSources: async () => {
    return await LeadMessageDetailModel.find({option: PROSPECTING_SOURCE}) as any;
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
        LeadMessageDetailModel,
      filters,
      query.sortBy,
      Number(query.first),
      ['attachments'],
      query.before,
      query.after,
    );
  },
  count: async (_query) => {
    throw new NotImplementedError();
  },
  create: async (payload) => {
    const newItem = new LeadMessageDetailModel({
      ...payload,
    });
    await newItem.save();
    return newItem._id;
  },
  update: async (payload) => {
    await LeadMessageDetailModel.findByIdAndUpdate(payload.id, { $set: payload }).exec();
  },
  del: async (_id): Promise<void> => {
    throw new NotImplementedError();
  },
  delByCriteria: async (criteria: any): Promise<void> => {
    await LeadMessageDetailModel.deleteMany(criteria).exec();
  },
  ensureIndexes: async () => {
    // LeadMessageDetailSchema.index({ option: 'text', value: 'text', phoneNo: 'text' });
    await LeadMessageDetailModel.createIndexes();
  },
  getByFbConversationId: async (fbConversationId: string) => {
    const leadMessageDetail = await LeadMessageDetailModel.findOne({fbConversationId}).exec() as any;
    return leadMessageDetail;
  },
};
