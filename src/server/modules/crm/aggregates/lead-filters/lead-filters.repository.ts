import mongoose from 'mongoose';
import { addAuditableSchema, addDeletableSchema, execCursorPaging, NotImplementedError } from '@app/core';
import { LeadFiltersRepository } from './interfaces/LeadFilterRepository';

const LeadFilterSchema = new mongoose.Schema(addAuditableSchema(addDeletableSchema({
  name: String,
  owner: {
    type: String,
    ref: 'User',
  },
  search: String,
  filters: [{
    _id: false,
    fieldName: String,
    operator: String,
    value: String,
  }],
})));
const LeadFiltersModel = mongoose.model('LeadFilter', LeadFilterSchema);

export const leadFiltersRepository: LeadFiltersRepository = {
  findById: async (id) => {
    return await LeadFiltersModel.findById(id).exec() as any;
  },
  findOne: async (query: {name: string}) => {
    return await LeadFiltersModel.findOne({name: query.name}).exec() as any;
  },
  findAll: async (owner: string) => {
    return await LeadFiltersModel.find({owner}).exec() as any;
  },
  find: async (query) => {
    const filters: any[] = [];
    if (query.owner) {
      filters.push({owner: query.owner});
    }

    return await execCursorPaging(
      LeadFiltersModel,
      filters,
      query.sortBy,
      Number(query.first),
      [],
      query.before,
      query.after,
    );
  },
  create: async (payload) => {
    const newLeadFilter = new LeadFiltersModel({
      ...payload,
    });
    await newLeadFilter.save();
    return newLeadFilter._id;
  },
  count: async (_query) => {
    throw new NotImplementedError();
  },
  update: async (_payload) => {
    throw new NotImplementedError();
  },
  del: async (id): Promise<void> => {
    await LeadFiltersModel.findByIdAndDelete(id).exec();
  },
  ensureIndexes: async () => {
    throw new NotImplementedError();
  },
};
