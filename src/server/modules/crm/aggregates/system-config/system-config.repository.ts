import {
  addDeletableSchema, addAuditableSchema, NotImplementedError, execCursorPaging, LEAD_STAGE,
  LEAD_STAGE_STATUS, PROSPECTING_STAGE, PROSPECTING_STAGE_STATUS, PROSPECTING_SOURCE, PAYMENT_TRANSACTION_TYPE, CONTACT_RELATION_TYPE, CONVERSATION_CHANNEL,
  FB_CHAT_CONFIG, LEAD_CLASS_STAGE, LEAD_CLASS_STAGE_STATUS, FB_CAMPAIGN,
} from '@app/core';
import mongoose from 'mongoose';
import { STAGES } from '@common/stages';
import { SystemConfigRepository } from './interfaces/SystemConfigRepository';

const SystemConfigSchema = new mongoose.Schema(addAuditableSchema(addDeletableSchema({
  option: {
    type: String,
  },
  value: {},
})), {
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
});

SystemConfigSchema.index({ 'value.name': 'text' }, { name: 'coreIndex' });
SystemConfigSchema.virtual('id').get(function() {
  // @ts-ignore
  return this._id;
});

const SystemConfigModel = mongoose.model('SystemConfig', SystemConfigSchema);
SystemConfigModel.createIndexes();

export const systemConfigRepository: SystemConfigRepository = {
  findById: async (id) => {
    return await SystemConfigModel.findById(id)
      .exec() as any;
  },
  findFbAccessToken: async () => {
    return await SystemConfigModel.findOne({option: FB_CHAT_CONFIG})
    .exec() as any;
  },
  findOneByQuery: async (query: any) => {
    return await SystemConfigModel.findOne(query)
    .exec() as any;
  },
  findFbCampaignAccessToken: async () => {
    return await SystemConfigModel.findOne({option: FB_CAMPAIGN})
    .exec() as any;
  },
  findOne: async (query: {name?: string}) => {
    return await SystemConfigModel.findOne({name: query.name}).exec() as any;
  },
  findLeadStageStatusByStageId: async (stageId: string) => {
    return await SystemConfigModel.find({option: LEAD_STAGE_STATUS, 'value.stageId': stageId}).sort({'value.order': 1}).exec() as any;
  },
  findLeadStages: async () => {
    return await SystemConfigModel.find({option: LEAD_STAGE}).sort({'value.order': 1}).exec() as any;
  },
  findLeadStageStatus: async () => {
    return await SystemConfigModel.find({option: LEAD_STAGE_STATUS}).sort({'value.order': 1}).exec() as any;
  },
  findLeadClassStages: async () => {
    return await SystemConfigModel.find({option: LEAD_CLASS_STAGE}).sort({'value.order': 1}).exec() as any;
  },
  findLeadClassStageStatus: async () => {
    return await SystemConfigModel.find({option: LEAD_CLASS_STAGE_STATUS}).sort({'value.order': 1}).exec() as any;
  },
  findLeadContactStages: async () => {
    return await SystemConfigModel.find({option: PROSPECTING_STAGE}).sort({'value.order': 1}).exec() as any;
  },
  findLeadContactStatuses: async () => {
    return await SystemConfigModel.find({option: PROSPECTING_STAGE_STATUS}).sort({'value.order': 1}).exec() as any;
  },
  findProspectingSources: async () => {
    return await SystemConfigModel.find({option: PROSPECTING_SOURCE}) as any;
  },
  findClassStageByName: async (name) => {
    return await SystemConfigModel.findOne({option: LEAD_CLASS_STAGE, 'value.name': name}).exec() as any;
  },
  findLeadStageByName: async (name) => {
    return await SystemConfigModel.findOne({option: LEAD_STAGE, 'value.name': name}).exec() as any;
  },
  findContactStageByName: async (name) => {
    return await SystemConfigModel.findOne({option: PROSPECTING_STAGE, 'value.name': name}).exec() as any;
  },
  findClassStatusByName: async (name) => {
    return await SystemConfigModel.findOne({option: LEAD_CLASS_STAGE_STATUS, 'value.name': name}).exec() as any;
  },
  findLeadStatusByName: async (name) => {
    return await SystemConfigModel.findOne({option: LEAD_STAGE_STATUS, 'value.name': name}).exec() as any;
  },
  findContactStatusByName: async (name) => {
    return await SystemConfigModel.findOne({option: PROSPECTING_STAGE_STATUS, 'value.name': name}).exec() as any;
  },
  find: async (query) => {
    const filters: any[] = [];
    if (query.search) {
      filters.push({ $text: { $search: query.search }});
    }
    if (query.filter && query.filter.length > 0) {
      query.filter.forEach((val: any) => {
        if (val.split('|').length > 1) {
          filters.push({ [val.split('|')[0]]: val.split('|')[1] === 'null' ? null : val.split('|')[1] });
        } else if (val.split('%').length > 1) {
          filters.push({ [val.split('%')[0]]: val.split('%')[1] === 'null' ? null : JSON.parse(val.split('%')[1]) });
        }
      });
    }

    return await execCursorPaging(
        SystemConfigModel,
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
    const newCentre = new SystemConfigModel({
      ...payload,
    });
    await newCentre.save();
    return newCentre._id;
  },
  update: async (payload) => {
    await SystemConfigModel.findByIdAndUpdate(payload.id, { $set: payload }).exec();
  },
  del: async (_id): Promise<void> => {
    throw new NotImplementedError();
  },
  ensureIndexes: async () => {
    // SystemConfigSchema.index({ option: 'text', value: 'text', phoneNo: 'text' });
    await SystemConfigModel.createIndexes();
  },
  initFbAccessToken: async (access_token: string, page_id: string) => {
    await SystemConfigModel.remove({option: FB_CHAT_CONFIG});
    const systemConfig = new SystemConfigModel({
      option: FB_CHAT_CONFIG,
      value: {
        access_token,
        page_id,
      },
    });
    await systemConfig.save();
  },
  initFbCampaignAccessToken: async (access_token: string) => {
    await SystemConfigModel.remove({option: FB_CAMPAIGN});
    const systemConfig = new SystemConfigModel({
      option: FB_CAMPAIGN,
      value: {
        access_token,
      },
    });
    await systemConfig.save();
  },
  init: async () => {
    await SystemConfigModel.remove({});
    const arrStage = STAGES;
    // for create plStage;
    const plStage = [
      {
        stage: {option: PROSPECTING_STAGE, value: {name: 'L1', shortName: 'L1', description: 'Contact lạnh', order: 1}},
        statuses: [],
      },
      {
        stage: {option: PROSPECTING_STAGE, value: {name: 'L2', description: '"Contact liên lạc được', shortName: 'L2',  order: 2}},
        statuses: [
          {option: PROSPECTING_STAGE_STATUS, value: {stageId: '', name: 'L2A - Đúng đối tượng - cần chăm sóc lại ', shortName: 'L2A',  order: 1}},
          {option: PROSPECTING_STAGE_STATUS, value: {stageId: '', name: 'L2B - Không nghe máy ', shortName: 'L2B',  order: 2}},
          {option: PROSPECTING_STAGE_STATUS, value: {stageId: '', name: 'L2C - Sai đối tượng', shortName: 'L2C',  order: 3}},
        ],
      },
      // {
      //   stage: {option: PROSPECTING_STAGE, value: {name: 'L3', description: 'Contact có nhu cầu, quan tâm (có ít nhất sđt)', shortName: 'L3',  order: 3}},
      //   statuses: [
      //     {option: PROSPECTING_STAGE_STATUS, value: {stageId: '', name: 'L3A - Có nhu cầu, đã trao đổi', shortName: 'L3A',  order: 1}},
      //     {option: PROSPECTING_STAGE_STATUS, value: {stageId: '', name: 'L3B - Cần chăm sóc lại', shortName: 'L3B',  order: 2}},
      //     {option: PROSPECTING_STAGE_STATUS, value: {stageId: '', name: 'L3C - Sai đối tượng', shortName: 'L3C',  order: 3}},
      //   ],
      // },
    ];

    const classStage = [
      {
        stage: {option: LEAD_CLASS_STAGE, value: {name: 'New', shortName: 'New', order: 1}},
        statuses: [],
      },
      {
        stage: {option: LEAD_CLASS_STAGE, value: {name: 'Arranged', shortName: 'Arranged',  order: 2}},
        statuses: [
          {option: LEAD_CLASS_STAGE_STATUS, value: {stageId: '', name: 'Unsuccessful', shortName: 'Unsuccessful',  order: 1}},
          {option: LEAD_CLASS_STAGE_STATUS, value: {stageId: '', name: 'Demo confirmed', shortName: 'Demo confirmed',  order: 2}},
          {option: LEAD_CLASS_STAGE_STATUS, value: {stageId: '', name: 'Demo unconfirmed', shortName: 'Demo unconfirmed',  order: 3}},
          {option: LEAD_CLASS_STAGE_STATUS, value: {stageId: '', name: 'Demo re-arranged', shortName: 'Demo re-arranged',  order: 4}},
          {option: LEAD_CLASS_STAGE_STATUS, value: {stageId: '', name: 'Successful', shortName: 'Successful',  order: 5}},
        ],
      },
      {
        stage: {option: LEAD_CLASS_STAGE, value: {name: 'Tested', shortName: 'Tested',  order: 3}},
        statuses: [
          {option: LEAD_CLASS_STAGE_STATUS, value: {stageId: '', name: 'Not yet', shortName: 'Not yet',  order: 1}},
          {option: LEAD_CLASS_STAGE_STATUS, value: {stageId: '', name: 'Pass', shortName: 'Pass',  order: 2}},
          {option: LEAD_CLASS_STAGE_STATUS, value: {stageId: '', name: 'Fail', shortName: 'Fail',  order: 3}},
          {option: LEAD_CLASS_STAGE_STATUS, value: {stageId: '', name: 'Skip', shortName: 'Skip',  order: 4}},
        ],
      },
      {
        stage: {option: LEAD_CLASS_STAGE, value: {name: 'Closed', shortName: 'Closed',  order: 4}},
        statuses: [
          {option: LEAD_CLASS_STAGE_STATUS, value: {stageId: '', name: 'Registered', shortName: 'Registered',  order: 1}},
          {option: LEAD_CLASS_STAGE_STATUS, value: {stageId: '', name: 'Cancelled', shortName: 'Cancelled',  order: 2}},
          {option: LEAD_CLASS_STAGE_STATUS, value: {stageId: '', name: 'To next course / class', shortName: 'To next course / class',  order: 3}},
        ],
      },
    ];
    for (const i in arrStage) {
      const stateObject = new SystemConfigModel(arrStage[i]);
      const state = await stateObject.save();
      for (const j in arrStage[i].statuses) {
        const obj = arrStage[i].statuses[j];
        obj.stageId = '' + state._id;
        const statusObject = new SystemConfigModel(obj);
        await statusObject.save();
      }
    }

    for (const i in classStage) {
      const stateObject = new SystemConfigModel(classStage[i].stage);
      const state = await stateObject.save();
      for (const j in classStage[i].statuses) {
        const obj = classStage[i].statuses[j];
        obj.value.stageId = '' + state._id;
        const statusObject = new SystemConfigModel(obj);
        await statusObject.save();
      }
    }

    for (const i in plStage) {
      const stateObject = new SystemConfigModel(plStage[i].stage);
      const state = await stateObject.save();
      for (const j in plStage[i].statuses) {
        const obj = plStage[i].statuses[j];
        obj.value.stageId = '' + state._id;
        const statusObject = new SystemConfigModel(obj);
        await statusObject.save();
      }
    }

    const array = [
      {option: CONVERSATION_CHANNEL, value: {name: 'FB'}},
      {option: PAYMENT_TRANSACTION_TYPE, value: {name: 'Deposit', operator: 'add', order: ''}},
      {option: PAYMENT_TRANSACTION_TYPE, value: {name: 'Withdraw', operator: 'remove', order: ''}},
      {option: PAYMENT_TRANSACTION_TYPE, value: {name: 'Adding', operator: 'add',  order: ''}},
      {option: CONTACT_RELATION_TYPE, value: {name: 'Deposit', operator: 'add',  order: ''}},
      {option: PROSPECTING_SOURCE, value: {name: 'FB',  order: ''}},
      {option: PROSPECTING_SOURCE, value: {name: 'Email',  order: ''}},
      {option: PROSPECTING_SOURCE, value: {name: 'Website',  order: ''}},
    ];
    const promises = array.map((item: any) => {
      const systemConfig = new SystemConfigModel(item);
      return systemConfig.save();
    });
    await Promise.all(promises);
  },
};
