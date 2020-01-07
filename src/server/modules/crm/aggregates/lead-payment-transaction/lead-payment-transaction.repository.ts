import { addDeletableSchema, addAuditableSchema, NotImplementedError } from '@app/core';
import mongoose from 'mongoose';
import { LeadPaymentTransactionRepository } from './interfaces/LeadPaymentTransactionRepository';

const LeadPaymentTransactionSchema = new mongoose.Schema(addAuditableSchema(addDeletableSchema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
  },
  paymentType: String,
  amount: Number,
  note: String,
  payDay: Date,
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCourse',
  },
  tuition: {
    totalAfterDiscount: Number,
    remaining: Number,
  },
  type: String,
})));
LeadPaymentTransactionSchema.virtual('id').get(function() {
  // @ts-ignore
  return this._id;
});
const LeadPaymentTransactionModel = mongoose.model('LeadPaymentTransaction', LeadPaymentTransactionSchema);

export const leadPaymentTransactionRepository: LeadPaymentTransactionRepository = {
  findById: async (id) => {
    return await LeadPaymentTransactionModel.findById(id)
      .populate('leadId')
      .exec() as any;
  },
  findOne: async (query: {name?: string}) => {
    return await LeadPaymentTransactionModel.findOne({name: query.name}).exec() as any;
  },
  find: async (query) => {
    return await LeadPaymentTransactionModel.find({leadId: query.leadId}).exec() as any;
  },
  count: async (_query) => {
    throw new NotImplementedError();
  },
  create: async (payload) => {
    const newLeadPaymentTransaction = new LeadPaymentTransactionModel({
      ...payload,
      payDay: payload.payDay ? payload.payDay : new Date(),
    });
    await newLeadPaymentTransaction.save();
    return newLeadPaymentTransaction._id;
  },
  update: async (payload) => {
    return await LeadPaymentTransactionModel.findByIdAndUpdate(payload.id, { $set: payload }, {new: true}).exec() as any;
  },
  del: async (_id): Promise<void> => {
    return await LeadPaymentTransactionModel.remove({_id}).exec();
  },
  delByCriteria: async (criteria: any): Promise<void> => {
    await LeadPaymentTransactionModel.deleteMany(criteria).exec();
  },
  ensureIndexes: async () => {
    // LeadPaymentTransactionsSchema.index({ email: 'text', fullName: 'text', phoneNo: 'text' });
    await LeadPaymentTransactionModel.createIndexes();
  },
  syncPayDay: async () => {
    const allTransactions = await LeadPaymentTransactionModel.find({}).exec();
    const deepClones = JSON.parse(JSON.stringify(allTransactions));
    const promises = deepClones.filter((v: any) => !v.payDay).map((v: any) => {
      return LeadPaymentTransactionModel.updateOne({_id: v._id}, {$set: {payDay: new Date(v.createdAt)}}).exec();
    });
    return await Promise.all(promises);
  },
};
