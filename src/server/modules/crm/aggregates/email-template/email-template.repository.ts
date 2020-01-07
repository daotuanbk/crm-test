import { addDeletableSchema, addAuditableSchema, NotImplementedError, execCursorPaging } from '@app/core';
import mongoose from 'mongoose';
import { EmailTemplateRepository } from './interfaces/EmailTemplateRepository';

const EmailTemplateSchema = new mongoose.Schema(addAuditableSchema(addDeletableSchema({
  name: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
})), {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  });

EmailTemplateSchema.virtual('id').get(function () {
  // @ts-ignore
  return this._id;
});

const EmailTemplateModel = mongoose.model('EmailTemplate', EmailTemplateSchema);

export const emailTemplateRepository: EmailTemplateRepository = {
  findById: async (id) => {
    return await EmailTemplateModel.findById(id)
      .exec() as any;
  },
  findOne: async (query: { name?: string }) => {
    return await EmailTemplateModel.findOne({ name: query.name }).exec() as any;
  },
  findAll: async () => {
    return await EmailTemplateModel.find({}).exec() as any;
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
      EmailTemplateModel,
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
    const newEmailTemplate = new EmailTemplateModel({
      ...payload,
    });
    await newEmailTemplate.save();
    return newEmailTemplate._id;
  },
  update: async (payload) => {
    await EmailTemplateModel.findByIdAndUpdate(payload.id, { $set: payload }).exec();
  },
  del: async (_id): Promise<void> => {
    await EmailTemplateModel.findByIdAndRemove(_id).exec();
  },
  ensureIndexes: async () => {
    // EmailTemplateSchema.index({ email: 'text', fullName: 'text', phoneNo: 'text' });
    await EmailTemplateModel.createIndexes();
  },
  findByName: async (name: string) => {
    return await EmailTemplateModel.findOne({ name }).exec() as any;
  },
};
