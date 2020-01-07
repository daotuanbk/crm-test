import { addDeletableSchema, addAuditableSchema, NotImplementedError, execCursorPaging } from '@app/core';
import mongoose from 'mongoose';
import { MappingContactInfoRepository } from './interfaces/MappingContactInfoRepository';
import { leadRepository, contactRepository, rootContactRepository } from '@app/crm';

const MappingContactInfoSchema = new mongoose.Schema(addAuditableSchema(addDeletableSchema({
  key: String,
  refId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RootContact',
  },
})));
MappingContactInfoSchema.virtual('id').get(function() {
  // @ts-ignore
  return this._id;
});
const MappingContactInfoModel = mongoose.model('MappingContactInfo', MappingContactInfoSchema);

export const mappingContactInfoRepository: MappingContactInfoRepository = {
  findById: async (id) => {
    return await MappingContactInfoModel.findById(id)
      .exec() as any;
  },
  findOne: async (query: any) => {
    return await MappingContactInfoModel.findOne({key: query.key}).exec() as any;
  },
  findAll: async () => {
    return await MappingContactInfoModel.find({});
  },
  deleteAll: async () => {
    await MappingContactInfoModel.deleteMany({}).exec();
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
      MappingContactInfoModel,
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
    const newMappingContactInfo = new MappingContactInfoModel({
      ...payload,
    });
    await newMappingContactInfo.save();
    return newMappingContactInfo._id;
  },
  update: async (payload) => {
    await MappingContactInfoModel.findByIdAndUpdate(payload.id, { $set: payload }).exec();
  },
  del: async (_id): Promise<void> => {
    throw new NotImplementedError();
  },
  ensureIndexes: async () => {
    // MappingContactInfoSchema.index({ email: 'text', fullName: 'text', phoneNo: 'text' });
    await MappingContactInfoModel.createIndexes();
  },
  findAndCreate: async (payload) => {
    return await MappingContactInfoModel.findOneAndUpdate({key: payload.key}, {$set: payload}, {new: true, upsert: true}).exec();
  },
  deleteByRootId: async (rootId) => {
    return await MappingContactInfoModel.deleteMany({refId: rootId}).exec();
  },
  findAllByKey: async (email, phone, nameObj) => {
    const array = [];
    if (email) {
      array.push({key: email});
      if (nameObj && nameObj.fullName) {
        array.push({key: `${email}-${nameObj.fullName}`});
      }
      if (nameObj && nameObj.reverseFullName) {
        array.push({key: `${email}-${nameObj.reverseFullName}`});
      }
    }
    if (phone) {
      array.push({key: phone});
      if (nameObj && nameObj.fullName) {
        array.push({key: `${phone}-${nameObj.fullName}`});
      }
      if (nameObj && nameObj.reverseFullName) {
        array.push({key: `${phone}-${nameObj.reverseFullName}`});
      }
    }

    if (array.length) {
      return await MappingContactInfoModel.find({$or: array}).exec();
    } else {
      return [];
    }
  },
  updateRefId: async (oldId, newId) => {
    return await MappingContactInfoModel.updateMany({refId: oldId}, {$set: {refId: newId}}).exec();
  },
  findTuitions: async (query) => {
    let rootContactIds = await rootContactRepository.findByStudentId(query._id);
    if (rootContactIds && rootContactIds.length) {
      rootContactIds = JSON.parse(JSON.stringify(rootContactIds)).map((val: any) => val._id);
    } else {
      if (query.email || query.phone) {
        const mapping = await mappingContactInfoRepository.findAllByKey(query.email, query.phone);
        const deepCloneMapping = JSON.parse(JSON.stringify(mapping));
        rootContactIds = deepCloneMapping.map((val: any) => val.refId);
      } else {
        return {
          totalAfterDiscount: 0,
          remaining: 0,
        };
      }
    }
    const contacts = await contactRepository.findInArrayId(rootContactIds);
    const deepCloneContacts = JSON.parse(JSON.stringify(contacts));
    const contactIds = deepCloneContacts.map((val: any) => val._id);
    const leads = await leadRepository.findByCriteria({'contact._id': {$in: contactIds}});
    const deepCloneLeads = JSON.parse(JSON.stringify(leads));
    return deepCloneLeads.reduce((sum: any, val: any) => {
      if (val && val.tuition) {
        sum.totalAfterDiscount += (val.tuition.totalAfterDiscount || 0);
        sum.remaining += (val.tuition.remaining || 0);
      }
      return sum;
    }, {
      totalAfterDiscount: 0,
      remaining: 0,
    });
  },
};
