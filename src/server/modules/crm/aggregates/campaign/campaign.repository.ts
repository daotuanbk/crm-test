import { addDeletableSchema, addAuditableSchema, NotImplementedError, execCursorPaging } from '@app/core';
import mongoose from 'mongoose';
import { CampaignRepository } from './interfaces/CampaignRepository';

const CampaignSchema = new mongoose.Schema(addAuditableSchema(addDeletableSchema({
  sourceId: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
  adId: {
    type: String,
  },
})));
CampaignSchema.index({
  name: 'text',
});
const CampaignModel = mongoose.model('Campaign', CampaignSchema);
CampaignModel.ensureIndexes();

export const campaignRepository: CampaignRepository = {
  findById: async (id) => {
    return await CampaignModel.findById(id)
      .exec() as any;
  },
  findOne: async (query: {name?: string}) => {
    return await CampaignModel.findOne({name: query.name}).exec() as any;
  },
  findAll: async () => {
    return await CampaignModel.find({}) as any;
  },
  findByQuery: async (query: any) => {
    return await CampaignModel.findOne(query).exec() as any;
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
        CampaignModel,
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
    const newCampaign = new CampaignModel({
      ...payload,
    });
    await newCampaign.save();
    return newCampaign._id;
  },
  update: async (payload) => {
    await CampaignModel.findByIdAndUpdate(payload.id, { $set: payload }).exec();
  },
  del: async (id): Promise<void> => {
    await CampaignModel.findByIdAndRemove(id).exec();
  },
  ensureIndexes: async () => {
    CampaignSchema.index({ email: 'text', fullName: 'text', phoneNo: 'text' });
    CampaignModel.createIndexes();
  },
};
