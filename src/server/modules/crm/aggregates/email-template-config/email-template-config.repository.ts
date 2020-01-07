import { addDeletableSchema, addAuditableSchema, NotImplementedError, execCursorPaging } from '@app/core';
import mongoose from 'mongoose';
import { EmailTemplateConfigRepository } from './interfaces/EmailTemplateConfigRepository';
import * as uuid from 'uuid';

const EmailTemplateConfigSchema = new mongoose.Schema(addAuditableSchema(addDeletableSchema({
  eventName: {
    type: String,
    required: true,
  },
  data: [{
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmailTemplate',
    },
    recipient: String,
    subject: String,
    index: String,
  }],
  isEditable: {
    type: Boolean,
    default: true,
  },
})), {
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
});

EmailTemplateConfigSchema.virtual('id').get(function() {
  // @ts-ignore
  return this._id;
});

EmailTemplateConfigSchema.index({ eventName: 'text' });
const EmailTemplateConfigModel = mongoose.model('EmailTemplateConfig', EmailTemplateConfigSchema);
EmailTemplateConfigModel.createIndexes();

export const emailTemplateConfigRepository: EmailTemplateConfigRepository = {
  findById: async (id) => {
    return await EmailTemplateConfigModel.findById(id)
      .populate('data.template')
      .exec() as any;
  },
  findOne: async (query: {name?: string}) => {
    return await EmailTemplateConfigModel.findOne({eventName: query.name}).populate('data.template').exec() as any;
  },
  findAll: async () => {
    return await EmailTemplateConfigModel.find({}).populate('data.template').exec() as any;
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
      EmailTemplateConfigModel,
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
    const newEmailTemplateConfig = new EmailTemplateConfigModel({
      ...payload,
    });
    await newEmailTemplateConfig.save();
    return newEmailTemplateConfig._id;
  },
  update: async (payload) => {
    await EmailTemplateConfigModel.findByIdAndUpdate(payload.id, { $set: payload }).exec();
  },
  del: async (_id): Promise<void> => {
    throw new NotImplementedError();
  },
  ensureIndexes: async () => {
    // EmailTemplateConfigSchema.index({ email: 'text', fullName: 'text', phoneNo: 'text' });
    await EmailTemplateConfigModel.createIndexes();
  },
  findByName: async (name: string) => {
    return await EmailTemplateConfigModel.findOne({eventName: name}).populate('data.template').exec() as any;
  },
  findByIds: async (ids) => {
    return await EmailTemplateConfigModel.find({_id: {$in: ids}}).populate('data.template').exec() as any;
  },
  convert: async () => {
    const allConfigs = await EmailTemplateConfigModel.find({data: null});
    const deepClones = JSON.parse(JSON.stringify(allConfigs));
    const promises = deepClones.map((val: any) => {
      const deepClone = JSON.parse(JSON.stringify(val));
      const template = deepClone.template[0];
      const data = [{
        template,
        recipient: 'student',
        subject: deepClone.subject,
        index: uuid.v4(),
      }];
      deepClone.data = data;
      return EmailTemplateConfigModel.findOneAndUpdate({_id: deepClone._id}, {$set: deepClone});
    });
    await Promise.all(promises);

    // // add index
    // const configs = await EmailTemplateConfigModel.find({data: {$ne: null}});
    // const clones = JSON.parse(JSON.stringify(configs));
    // const subPromises = clones.map((val: any) => {
    //   val.data = val.data.map((v: any) => {
    //     return {
    //       ...v,
    //       index: uuid.v4(),
    //     };
    //   });
    //   return EmailTemplateConfigModel.findOneAndUpdate({_id: val._id}, {$set: val});
    // });
    // await Promise.all(subPromises);
  },
};
