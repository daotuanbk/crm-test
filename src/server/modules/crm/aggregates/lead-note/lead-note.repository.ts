import { addDeletableSchema, addAuditableSchema, NotImplementedError } from '@app/core';
import mongoose from 'mongoose';
import { LeadNoteRepository } from './interfaces/LeadNoteRepository';
import { leadRepository } from '@app/crm';

const LeadNoteSchema = new mongoose.Schema(addAuditableSchema(addDeletableSchema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
  },
  content: String,
})));
LeadNoteSchema.virtual('id').get(function() {
  // @ts-ignore
  return this._id;
});
const LeadNoteModel = mongoose.model('LeadNote', LeadNoteSchema);

export const leadNoteRepository: LeadNoteRepository = {
  findById: async (id) => {
    return await LeadNoteModel.findById(id)
      .exec() as any;
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

    return await LeadNoteModel.find({
      $or: [
        {leadId: newLeadId},
        {contactId: newContactId},
      ],
    })
        .populate('createdBy', 'id fullName')
        .exec() as any;
  },
  findOne: async (query: {name?: string}) => {
    return await LeadNoteModel.findOne({name: query.name}).exec() as any;
  },
  find: async (query) => {
    return await LeadNoteModel.find({leadId: query.leadId}).exec() as any;
  },
  count: async (_query) => {
    throw new NotImplementedError();
  },
  create: async (payload) => {
    const newLeadNote = new LeadNoteModel({
      ...payload,
    });
    await newLeadNote.save();
    return newLeadNote._id;
  },
  update: async (payload) => {
    await LeadNoteModel.findByIdAndUpdate(payload.id, { $set: payload }).exec();
  },
  del: async (_id): Promise<void> => {
    throw new NotImplementedError();
  },
  delByCriteria: async (criteria: any): Promise<void> => {
    await LeadNoteModel.deleteMany(criteria).exec();
  },
  ensureIndexes: async () => {
    // LeadNotesSchema.index({ email: 'text', fullName: 'text', phoneNo: 'text' });
    await LeadNoteModel.createIndexes();
  },
};
