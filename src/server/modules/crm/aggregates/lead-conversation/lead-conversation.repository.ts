import { addDeletableSchema, addAuditableSchema, NotImplementedError, execCursorPaging, LEAD_STAGE,
  LEAD_STAGE_STATUS, PROSPECTING_SOURCE } from '@app/core';
import mongoose from 'mongoose';
import { LeadConversationRepository } from './interfaces/LeadConversationRepository';

const LeadConversationSchema = new mongoose.Schema(addAuditableSchema(addDeletableSchema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
  },
  messageCount: {
    type: Number,
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
  },
  ownerId: {
    type: String,
    ref: 'User',
  },
  channel: {
    type: Number,
  },
  snippet: {
    type: String,
  },
  fbConversationId: {
    type: String,
  },
  fbPageId: {
    type: String,
  },
  email: {
    type: String,
  },
})), {
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
});

LeadConversationSchema.virtual('id').get(function() {
  // @ts-ignore
  return this._id;
});

const LeadConversationModel = mongoose.model('LeadConversation', LeadConversationSchema);

export const leadConversationRepository: LeadConversationRepository = {
  findById: async (id) => {
    return await LeadConversationModel.findById(id)
      .exec() as any;
  },
  findOne: async (query: {name?: string}) => {
    return await LeadConversationModel.findOne({name: query.name}).exec() as any;
  },
  findOneByQuery: async (query: any) => {
    return await LeadConversationModel.findOne(query).exec() as any;
  },
  findLeadStageStatusByStageId: async (stageId: string) => {
    return await LeadConversationModel.find({option: LEAD_STAGE_STATUS, 'value.stageId': stageId}) as any;
  },
  findLeadStages: async () => {
    return await LeadConversationModel.find({option: LEAD_STAGE}) as any;
  },
  findLeadStageStatus: async () => {
    return await LeadConversationModel.find({option: LEAD_STAGE_STATUS}) as any;
  },
  findProspectingSources: async () => {
    return await LeadConversationModel.find({option: PROSPECTING_SOURCE}) as any;
  },
  findByQuery: async (query: any) => {
    return await LeadConversationModel.find(query) as any;
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
        LeadConversationModel,
      filters,
      query.sortBy,
      Number(query.first),
      [],
      query.before,
      query.after,
    );
  },
  updateLeadId: async (contactId: string, leadId: string) => {
    await LeadConversationModel.update({contactId}, {leadId});
  },
  count: async (_query) => {
    throw new NotImplementedError();
  },
  create: async (payload) => {
    const newCentre = new LeadConversationModel({
      ...payload,
    });
    await newCentre.save();
    return newCentre._id;
  },
  update: async (payload) => {
    await LeadConversationModel.findByIdAndUpdate(payload.id, { $set: payload }).exec();
  },
  del: async (_id): Promise<void> => {
    throw new NotImplementedError();
  },
  delByCriteria: async (criteria: any): Promise<void> => {
    await LeadConversationModel.deleteMany(criteria).exec();
  },
  ensureIndexes: async () => {
    // LeadConversationSchema.index({ option: 'text', value: 'text', phoneNo: 'text' });
    await LeadConversationModel.createIndexes();
  },
  getByFbConversationId: async (fbConversationId: string) => {
    const leadConversation = await LeadConversationModel.findOne({fbConversationId}).exec() as any;
    return leadConversation;
  },
  getByContactId: async (contactId: string) => {
    const leadConversation = await LeadConversationModel.findOne({contactId}).exec() as any;
    return leadConversation;
  },
  getByLeadId: async (leadId: string) => {
    const leadConversation = await LeadConversationModel.find({leadId}).exec() as any;
    return leadConversation;
  },
};
