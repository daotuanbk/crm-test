import { addDeletableSchema, addAuditableSchema, NotImplementedError, execCursorPaging } from '@app/core';
import mongoose from 'mongoose';
import { LeadAttachmentRepository } from './interfaces/LeadAttachmentRepository';
import { leadRepository } from '@app/crm';

const LeadAttachmentSchema = new mongoose.Schema(addAuditableSchema(addDeletableSchema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
  },
  type: {
    type: Number,
  },
  title: {
    type: String,
  },
  documentId: {
    type: String,
  },
  url: {
    type: String,
  },
  otherUrl: {
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

LeadAttachmentSchema.virtual('id').get(function() {
  // @ts-ignore
  return this._id;
});

const LeadAttachmentModel = mongoose.model('LeadAttachment', LeadAttachmentSchema);

export const leadAttachmentRepository: LeadAttachmentRepository = {
  findById: async (id) => {
    return await LeadAttachmentModel.findById(id)
    .populate('createdBy', 'id fullName')
    .exec() as any;
  },
  findOne: async (query: {name?: string}) => {
    return await LeadAttachmentModel.findOne({name: query.name}).exec() as any;
  },
  findByLeadOrContactId: async (leadId?: string, contactId?: string) => {
    const leads = await leadRepository.findByCriteria({
      $or: [
        {_id: leadId},
        {'contact._id': contactId},
      ],
    });
    let newContactId = contactId;
    let newLeadId = leadId;
    if (leads && leads[0] && leads[0].contact && leads[0].contact._id) {
      newLeadId = `${leads[0]._id}`;
      newContactId = `${leads[0].contact._id}`;
    }
    return await LeadAttachmentModel.find({
      $or: [
        {leadId: newLeadId},
        {contactId: newContactId},
      ],
    })
    .populate('createdBy', 'id fullName')
    .exec() as any;
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
        LeadAttachmentModel,
      filters,
      query.sortBy,
      Number(query.first),
      [{path: 'createdBy', select: 'id fullName'}],
      query.before,
      query.after,
    );
  },
  count: async (_query) => {
    throw new NotImplementedError();
  },
  updateLeadId: async (contactId: string, leadId: string) => {
    await LeadAttachmentModel.update({contactId}, {leadId});
  },
  create: async (payload) => {
    const newItem = new LeadAttachmentModel({
      ...payload,
    });
    await newItem.save();
    return newItem._id;
  },
  update: async (payload) => {
    await LeadAttachmentModel.findByIdAndUpdate(payload.id, { $set: payload }).exec();
  },
  del: async (_id): Promise<void> => {
    throw new NotImplementedError();
  },
  delByCriteria: async (criteria: any): Promise<void> => {
    await LeadAttachmentModel.deleteMany(criteria).exec();
  },
  ensureIndexes: async () => {
    // LeadAttachmentSchema.index({ option: 'text', value: 'text', phoneNo: 'text' });
    await LeadAttachmentModel.createIndexes();
  },
  getByFbConversationId: async (fbConversationId: string) => {
    const leadAttachment = await LeadAttachmentModel.findOne({fbConversationId}).exec() as any;
    return leadAttachment;
  },
};
