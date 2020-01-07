import {
  addDeletableSchema,
  addAuditableSchema,
  NotImplementedError,
  execPaging,
  getCurrentTimestampInMilliseconds,
  LEAD_APPOINTMENT_WAITING_STATUS,
  toDBQuery,
  toDBSort,
  RELATION_DAUGHTER,
  RELATION_SON,
  RELATION_GRAND_DAUGHTER,
  RELATION_GRAND_SON,
  RELATION_NEPHEW,
  RELATION_OTHER,
} from '@app/core';
import mongoose from 'mongoose';
import { LeadsRepository } from './interfaces/LeadsRepository';
import _ from 'lodash';
import mongoosePaginate from 'mongoose-paginate';
import { DB_QUERY_SETTER_DICT, SORT_FIELD_DICT } from './helpers/utils';
import { ProductSchema, Lead, ClassEnrollmentStatuses, OrderProductItem } from '@app/crm';

// Refund and payment items look the same now
// But this is separeted bussiness and can be diverged in the furture

const paymentItemSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    default: 0,
  },
  payday: {
    type: Date,
    required: true,
  },
  note: {
    type: String,
    required: false,
  },
});

const refundItemSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    default: 0,
  },
  payday: {
    type: Date,
    required: true,
  },
  note: {
    type: String,
    required: false,
  },
});

const tuitionSchema = new mongoose.Schema({
  totalAfterDiscount: {
    type: Number,
    required: true,
    default: 0,
  },
  remaining: {
    type: Number,
    required: true,
    default: 0,
  },
  completePercent: {
    type: Number,
    required: true,
    default: 0,
  },
  totalPayment: {
    type: Number,
    required: true,
    default: 0,
  },
  totalRefund: {
    type: Number,
    required: true,
    default: 0,
  },
});

const LeadOrderSchema = new mongoose.Schema({
  code: Number,
  productItems: [{
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'V2Contact',
    },
    product: ProductSchema,
    promotion: {
      promotionType: String,
      discountType: String,
      percent: Number,
      value: Number,
    },
    enrollments: [{
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LmsCourse',
      },
      class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LmsClass',
      },
      status: {
        type: String,
        default: ClassEnrollmentStatuses.NotEnrolled,
      },
      cancelled: {
        type: Boolean,
        default: false,
      },
      lmsOperationExecutive: mongoose.Schema.Types.Mixed,
    }],
  }],
  isCancelled: {
    type: Boolean,
    default: false,
  },
});

const LeadsSchema = new mongoose.Schema(addAuditableSchema(addDeletableSchema({
  centre: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Centre',
    },
    name: String,
    shortName: String,
  },
  sourceId: {
    type: Number,
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
  },
  owner: {
    id: {
      type: String,
      ref: 'User',
    },
    fullName: String,
    avatar: String,
  },
  contact: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact',
    },
    firstName: String,
    lastName: String,
    fullName: String,
    phone: String,
    email: String,
    fb: String,
    address: String,
    avatar: String,
  },
  customer: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'V2Contact',
    },
    fullName: String,
    phoneNumber: String,
    email: String,
    family: [{
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'V2Contact',
      },
      fullName: String,
      phoneNumber: String,
      email: String,
      relation: {
        type: String,
        enum: [
          RELATION_DAUGHTER,
          RELATION_SON,
          RELATION_GRAND_DAUGHTER,
          RELATION_GRAND_SON,
          RELATION_NEPHEW,
          RELATION_OTHER,
        ],
      },
    }],
  },
  contactRelations: [{
    index: String,
    userType: String,
    relation: String,
    description: String,
    fullName: String,
    email: String,
    phone: String,
    dob: Date,
    job: String,
    social: String,
  }],
  reminders: [{
    title: String,
    status: String,
    dueAt: Date,
    finishedAt: Date,
  }],
  hasReminders: Boolean, // Data redundancy for better sorting
  productOrder: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductOrder',
    },
    courseCount: Number,
    comboId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductCombo',
    },
    comboName: String,
    courses: [{
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductCourse',
      },
      name: String,
      shortName: String,
      description: String,
      tuitionBeforeDiscount: Number,
      discountType: String,
      discountValue: Number,
      stage: String,
      status: String,
      class: String,
      classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
      },
      index: String,
      comment: String,
      arrangedAt: Number,
      startTime: Number,
      tuitionPercent: {
        type: Number,
        default: 0,
      },
      tuition: {
        type: Number,
        default: 0,
      },
      tuitionAfterDiscount: Number,
      inCombo: Boolean,
    }],
  },
  tuition: {
    type: tuitionSchema,
    required: false,
  },
  hasTuition: Boolean, // Data redundancy for better sorting
  lastContactedAt: Date,
  currentStage: {
    type: String,
    default: 'New',
  },
  currentStatus: String,
  v2Status: String,
  lastUpdatedStageAt: Date,
  lastUpdatedStatusAt: Date,
  overdueStatusAt: Number,
  paymentDueAt: Date,
  keepBadDepts: {
    type: Boolean,
    default: false,
  },
  recentTaskDueAt: Date,
  recentAppointmentDueAt: Date,
  lmsStudentId: String,
  new: {
    type: Boolean,
  },
  messages: [{
    messageType: String,
    success: Boolean,
    errorMessage: String,
    emailInfo: {
      attachments: [String],
      subject: String,
      html: String,
      receivers: String,
      bcc: String,
    },
    smsInfo: {},
    facebookMessageInfo: {},
  }],
  notes: [addAuditableSchema({
    content: String,
  })],
  appointments: [addAuditableSchema({
    title: String,
    time: Date,
    centreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Centre',
    },
    currentStatus: {
      type: String,
      default: LEAD_APPOINTMENT_WAITING_STATUS,
    },
  })],
  hasAppointments: Boolean, // Data redundancy for better sorting
  products: [addAuditableSchema({
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'V2Contact',
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
  })],
  order: LeadOrderSchema,
  payments: [{ type: paymentItemSchema }],
  refunds: [{ type: refundItemSchema }],
  channel: String,
  source: String,
  campaign: String,
  medium: String,
  content: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
  },
})));
LeadsSchema.index({
  'customer.fullName': 'text',
  'customer.phoneNumber': 'text',
  'customer.email': 'text',
  'customer.family.fullName': 'text',
  'customer.family.phoneNumber': 'text',
  'customer.family.email': 'text',
  'order.code': 'text', // For accounttant to search
}, { name: 'searchLeadIndex' });
LeadsSchema.virtual('id').get(function () {
  // @ts-ignore
  return this._id;
});
LeadsSchema.post(/find/ as any, (result: any) => {
  if (!result) {
    return;
  }
  if (Array.isArray(result)) {
    result.forEach((lead: any) => {
      if (!lead.v2Contact && lead.contact) {
        lead.v2Contact = lead.contact._id;
      }
    });
  } else {
    if (!result.v2Contact && result.contact) {
      result.v2Contact = result.contact._id;
    }
  }
});

LeadsSchema.plugin(mongoosePaginate);
const LeadsModel = mongoose.model('Lead', LeadsSchema);

const leadCommonPopulate = [
  'order.productItems.enrollments.class',
  'order.productItems.enrollments.course',
  'order.productItems.candidate',
  'content',
  'customer._id',
  'customer.family._id',
  'productOrder.comboId',
  'notes.createdBy',
  'appointments.createdBy',
  'products.candidate',
  'products.product',
  'order.productItems.product.combo.selectableCourses',
  'order.productItems.product.special.selectableCourses',
];

export const leadRepository: LeadsRepository = {
  findByCriteria: async (query, populate = []) => {
    return await LeadsModel.find(query).populate(populate).lean();
  },
  findById: async (id) => {
    const v2ContactPopulate = {
      path: 'v2Contact',
      model: 'Contact',
      populate: {
        path: 'family._id',
        model: 'Contact',
      },
    };

    const contactPopulate = {
      path: 'contact._id',
      model: 'Contact',
      populate: {
        path: 'prospectingListId',
        model: 'ProspectingList',
      },
    };

    const productsPopulate = ['products.candidate', 'products.product'];

    const customerPopulate = ['customer._id', 'customer.family._id'];

    const result = await LeadsModel.findById(id)
      .populate(customerPopulate)
      .populate(contactPopulate)
      .populate('owner.id')
      .populate(v2ContactPopulate)
      .populate(productsPopulate)
      .populate('content')
      .populate('order.productItems.candidate')
      .populate('order.productItems.enrollments.course')
      .populate('order.productItems.enrollments.class')
      .populate('order.productItems.product.combo.selectableCourses')
      .populate('order.productItems.product.special.selectableCourses')
      .lean();

    if (_.get(result, 'owner.id._id')) {
      result.owner = {
        id: result.owner.id._id,
        fullName: result.owner.fullName,
        email: result.owner.id.email,
      };
    }
    return result;
  },
  findOne: async (query, populate = []) => {
    return await LeadsModel.findOne(query).populate(populate).lean();
  },
  find: async (query) => {
    const simpleFilters = toDBQuery(query, DB_QUERY_SETTER_DICT);
    const dbSort = toDBSort(query.sortBy, SORT_FIELD_DICT);

    const v2ContactPopulate = {
      path: 'v2Contact',
      model: 'Contact',
      select: 'contactBasicInfo schoolInfo contactRelations',
      populate: {
        path: 'contactRelations.v2Contact',
        model: 'Contact',
      },
    };

    const productsPopulate = ['products.candidate', 'products.product'];

    const customerPopulate = [ 'customer._id', 'customer.family._id'];

    const result = await execPaging(
      LeadsModel,
      {...simpleFilters, isDeleted: { '$ne': true  } },
      dbSort,
      query.page,
      query.limit,
      [
        'order.productItems.enrollments.class',
        'order.productItems.enrollments.course',
        'order.productItems.candidate',
        'content',
        ...customerPopulate,
        'contact._id',
        'productOrder.comboId',
        'notes.createdBy',
        v2ContactPopulate,
        'appointments.createdBy',
        productsPopulate,
        'order.productItems.product.combo.selectableCourses',
        'order.productItems.product.special.selectableCourses',
      ],
    );
    return result;
  },
  findAll: async () => {
    return await LeadsModel.find({}).sort('-createdAt').lean();
  },
  count: async (_query) => {
    throw new NotImplementedError();
  },
  create: async (payload) => {
    const newLead = await LeadsModel.create(payload);
    return await leadRepository.findById(newLead._id) as any;
  },
  update: async (payload) => {
    const idToUse = payload.id || payload._id;

    return await LeadsModel.findByIdAndUpdate(idToUse, { $set: payload }, { new: true })
      .populate([
        'order.productItems.enrollments.class',
        'order.productItems.enrollments.course',
        'order.productItems.candidate',
        'content',
        'customer._id',
        'customer.family._id',
        'productOrder.comboId',
        'notes.createdBy',
        'appointments.createdBy',
        'products.candidate',
        'products.product',
        'order.productItems.product.combo.selectableCourses',
        'order.productItems.product.special.selectableCourses',
      ])
      .lean();
  },
  del: async (id) => {
    await LeadsModel.findByIdAndUpdate(id, { $set: { isDeleted: true } }).lean();
  },
  delByCriteria: async (criteria: any): Promise<void> => {
    await LeadsModel.deleteMany(criteria).lean();
  },
  ensureIndexes: async () => {
    await LeadsModel.collection.dropIndex('coreIndex');
    await LeadsModel.createIndexes();
  },
  updateByCriteria: async (criteria, payload) => {
    if (!payload.lastModifiedAt) {
      payload.lastModifiedAt = getCurrentTimestampInMilliseconds();
    }
    return await LeadsModel.findOneAndUpdate(criteria, { $set: payload }, { new: true }).populate([
      'order.productItems.enrollments.class',
      'order.productItems.enrollments.course',
      'order.productItems.candidate',
      'content',
      'customer._id',
      'customer.family._id',
      'productOrder.comboId',
      'notes.createdBy',
      'appointments.createdBy',
      'products.candidate',
      'products.product',
      'order.productItems.product.combo.selectableCourses',
      'order.productItems.product.special.selectableCourses',
    ])
    .lean();
  },
  updateOrder: async (_id, order) => {
    const filter = { _id };
    const update = {
      $set: {
        order,
      },
    };
    const options = { new: true };
    const result = await LeadsModel.findOneAndUpdate(filter, update, options).populate([
      'order.productItems.enrollments.class',
      'order.productItems.enrollments.course',
      'order.productItems.candidate',
      'content',
      'customer._id',
      'customer.family._id',
      'productOrder.comboId',
      'notes.createdBy',
      'appointments.createdBy',
      'products.candidate',
      'products.product',
      'order.productItems.product.combo.selectableCourses',
      'order.productItems.product.special.selectableCourses',
    ])
    .lean();
    return (result as unknown) as Lead;
  },
  pushPayment: async (_id, newPayment) => {
    const filter = { _id };
    const update = {
      $push: {
        payments: newPayment,
      },
    };
    const options = { new: true };
    const result = await LeadsModel.findOneAndUpdate(filter, update, options)
      .populate(leadCommonPopulate)
      .lean();
    return (result as unknown) as Lead;
  },
  pushRefund: async (_id, newRefund) => {
    const filter = { _id };
    const update = {
      $push: {
        refunds: newRefund,
      },
    };
    const options = { new: true };
    const leadWithUpdate = await LeadsModel.findOneAndUpdate(filter, update, options)
      .populate(leadCommonPopulate)
      .lean();
    return (leadWithUpdate as unknown) as Lead;
  },
  updateTuition: async (_id, tuition) => {
    const filter = { _id };
    const update = {
      $set: {
        tuition,
      },
    };
    const options = { new: true };
    const leadWithUpdate = await LeadsModel.findOneAndUpdate(filter, update, options)
      .populate(leadCommonPopulate)
      .lean();
    return (leadWithUpdate as unknown) as Lead;
  },
  updateOneOwner: async (_id: string, owner: any) => {
    const update = { $set: { owner } };
    const options = { new: true };
    const doc = await LeadsModel.findByIdAndUpdate(_id, update, options)
      .populate(leadCommonPopulate)
      .lean();
    return (doc as unknown) as Lead;
  },
  pushOrderProductItem: async (_id: string, orderProductItem: OrderProductItem) => {
    const filter = { _id };
    const update = {
      $push: {
        'order.productItems': orderProductItem,
      },
    };
    const options = { new: true };
    const doc = await LeadsModel.findOneAndUpdate(filter, update, options)
      .populate(leadCommonPopulate)
      .lean();
    return (doc as unknown) as Lead;
  },
  pullOrderProductItem: async (_id: string, orderProductItemId: string) => {
    const filter = { _id };
    const update = {
      $pull: {
        'order.productItems': {
          _id: orderProductItemId,
        },
      },
    };
    const options = { new: true };
    const doc = await LeadsModel.findOneAndUpdate(filter, update, options)
      .populate(leadCommonPopulate)
      .lean();
    return (doc as unknown) as Lead;
  },
  setOrderProductItem: async (_id: string, orderProductItem: OrderProductItem) => {
    const filter = {
      _id,
      'order.productItems._id': orderProductItem._id,
    };
    const update = {
      $set: {
        'order.productItems.$': orderProductItem,
      },
    };
    const options = { new: true };
    const doc = await LeadsModel.findOneAndUpdate(filter, update, options)
    .populate(leadCommonPopulate)
    .lean();
    return (doc as unknown) as Lead;
  },
};
