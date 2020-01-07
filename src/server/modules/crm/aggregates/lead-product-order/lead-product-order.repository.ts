import { addDeletableSchema, NotImplementedError, execCursorPaging } from '@app/core';
import mongoose from 'mongoose';
import { LeadProductOrderRepository } from './interfaces/LeadProductOrderRepository';
import { leadRepository, productComboRepository, calculateTuitionAD, checkComboCondition } from '@app/crm';
import * as uuid from 'uuid';
import { deleteLeadCombo } from './helpers/deleteLeadCombo';
import { updateLeadCombo } from './helpers/updateLeadCombo';

const LeadProductOrderSchema = new mongoose.Schema(addDeletableSchema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
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
    index: String,
    stage: String,
    status: String,
    class: String,
    arrangedAt: Number,
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
    },
    comment: String,
    createdAt: Date,
    createdBy: {
      type: String,
      ref: 'User',
    },
    updatedAt: Date,
    lastModifiedAt: Date,
    lastModifiedBy: {
      type: String,
      ref: 'User',
    },
    startTime: Number,
    tuitionPercent: Number,
    tuition: Number,
    tuitionAfterDiscount: Number,
    inCombo: Boolean,
  }],
}));
LeadProductOrderSchema.virtual('id').get(function () {
  // @ts-ignore
  return this._id;
});
const LeadProductOrderModel = mongoose.model('LeadProductOrder', LeadProductOrderSchema);

export const leadProductOrderRepository: LeadProductOrderRepository = {
  findById: async (id) => {
    return await LeadProductOrderModel.findById(id)
    .exec() as any;
  },
  findByIdPopulateLead: async (id) => {
    return await LeadProductOrderModel.findById(id)
    .populate({
      path: 'leadId',
      model: 'Lead',
      populate: [{
        path: 'owner.id',
        model: 'User',
      }],
    })
    .exec() as any;
  },
  findOne: async (query: { name?: string }) => {
    return await LeadProductOrderModel.findOne({ name: query.name }).exec() as any;
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
        LeadProductOrderModel,
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
    const newLeadProductOrder = new LeadProductOrderModel({
      ...payload,
    });
    await newLeadProductOrder.save();
    return newLeadProductOrder._id;
  },
  update: async (payload) => {
    await LeadProductOrderModel.findByIdAndUpdate(payload.id, { $set: payload }).exec();
  },
  del: async (_id): Promise<void> => {
    await LeadProductOrderModel.findByIdAndRemove(_id).exec();
  },
  delByCriteria: async (criteria: any): Promise<void> => {
    await LeadProductOrderModel.deleteMany(criteria).exec();
  },
  ensureIndexes: async () => {
    // LeadProductOrderSchema.index({ email: 'text', fullName: 'text', phoneNo: 'text' });
    await LeadProductOrderModel.createIndexes();
  },
  updateField: async (criteria, payload) => {
    await LeadProductOrderModel.findOneAndUpdate(criteria, { $set: payload }).exec();
  },
  updateCourses: async (_id, payload, noCallback) => {
    const productOrder = await LeadProductOrderModel.findOne({ _id }).exec() as any;
    let lead;
    if (productOrder) {
      const deepClonePO = JSON.parse(JSON.stringify(productOrder));
      let courses;
      const deepClonePayload = JSON.parse(JSON.stringify(payload));
      if (deepClonePayload.constructor === Array) {
        courses = deepClonePO.courses.map((val: any) => {
          if (val.index) {
            const courseItem = deepClonePayload.find((item: any) => item.index === val.index || item.courseId === `${val._id}`);
            if (courseItem) {
              const deepCloneVal = JSON.parse(JSON.stringify(val));
              return {
                ...deepCloneVal,
                ...courseItem,
              };
            } else {
              return val;
            }
          } else {
            const deepCloneVal = JSON.parse(JSON.stringify(val));
            return {
              ...deepCloneVal,
              index: uuid.v4(),
            };
          }
        });
      }
      else {
        courses = deepClonePO.courses.map((val: any) => {
          if (val.index) {
            if (payload.courseId) {
              if (String(val._id) === String(payload.courseId)) {
                const deepCloneVal = JSON.parse(JSON.stringify(val));
                return {
                  ...deepCloneVal,
                  ...payload,
                };
              } else return val;
            } else if (payload.index) {
              if (payload.index === val.index) {
                const deepCloneVal = JSON.parse(JSON.stringify(val));
                return {
                  ...deepCloneVal,
                  ...payload,
                };
              } else return val;
            } else {
              return val;
            }
          } else {
            const deepCloneVal = JSON.parse(JSON.stringify(val));
            return {
              ...deepCloneVal,
              index: uuid.v4(),
            };
          }
        });
      }
      await LeadProductOrderModel.findOneAndUpdate({ _id: deepClonePO._id }, { $set: { courses } }, { new: true }).exec();
      lead = await leadRepository.updateByCriteria({ 'productOrder._id': deepClonePO._id }, { 'productOrder.courses': courses });
    }

    if (!noCallback && lead) {
      await calculateCourseTuitionPercent(lead, true);
    }
  },
  deleteCourse: async (_id, payload) => {
    const productOrder = await LeadProductOrderModel.findOne({ _id }).populate('comboId').exec() as any;
    let lead;
    if (productOrder) {
      const deepClonePO = JSON.parse(JSON.stringify(productOrder));
      const courses = deepClonePO.courses.filter((val: any) => {
        if (val.index) {
          if (payload.index) {
            return val.index !== payload.index;
          } else {
            return val;
          }
        } else {
          const deepCloneVal = JSON.parse(JSON.stringify(val));
          return {
            ...deepCloneVal,
            index: uuid.v4(),
          };
        }
      });
      if (checkComboCondition(productOrder.comboId, courses)) {
        await LeadProductOrderModel.findOneAndUpdate({ _id: deepClonePO._id }, { $set: { courses } }, { new: true }).exec();
        lead = await leadRepository.updateByCriteria({ 'productOrder._id': deepClonePO._id }, { 'productOrder.courses': courses });
      } else {
        await LeadProductOrderModel.findOneAndUpdate({ _id: deepClonePO._id }, { $set: { courses, comboName: undefined, comboId: undefined } }, { new: true }).exec();
        lead = await leadRepository.updateByCriteria(
          { 'productOrder._id': deepClonePO._id },
          { 'productOrder.courses': courses, 'productOrder.comboName': undefined, 'productOrder.comboId': undefined },
        );
      }
    }
    if (lead) await calculateCourseTuitionPercent(lead);
  },
  addCourse: async (_id, payload) => {
    const productOrder = await LeadProductOrderModel.findOneAndUpdate({ _id }, { $push: { courses: payload } }, { new: true }).exec() as any;
    const lead = await leadRepository.updateByCriteria({ 'productOrder._id': productOrder._id }, { 'productOrder.courses': productOrder.courses });
    await calculateCourseTuitionPercent(lead);
  },
  updateCombo: async (payload) => {
    const productOrder = await LeadProductOrderModel.find({ comboId: payload._id }).exec() as any;
    if (productOrder) {
      const leadsPromises = productOrder.map((val: any) => {
        return leadRepository.findById(val.leadId);
      });
      const leads = await Promise.all(leadsPromises);
      const promises = productOrder.map((val: any) => {
        return LeadProductOrderModel.findOneAndUpdate({ _id: val._id }, { $set: { comboName: payload.name } }).exec();
      });
      const updateLeadComboPromises = leads.map((val: any) => {
        return updateLeadCombo(val._id, payload);
      });
      await Promise.all(promises);
      await Promise.all(updateLeadComboPromises);
    }
  },
  deleteCombo: async (_id) => {
    const productOrder = await LeadProductOrderModel.find({ comboId: _id }).exec() as any;
    if (productOrder) {
      const leadsPromises = productOrder.map((val: any) => {
        return leadRepository.findById(val.leadId);
      });
      const leads = await Promise.all(leadsPromises);
      const deleteLeadComboPromises = leads.map((val: any) => {
        return deleteLeadCombo(val._id);
      });
      const updatePOPromises = productOrder.map((val: any) => {
        return LeadProductOrderModel.findOneAndUpdate({ _id: val._id }, { $set: { comboName: undefined, comboId: undefined } }, { new: true }).exec();
      });
      await Promise.all(deleteLeadComboPromises);
      await Promise.all(updatePOPromises);
    }
  },
  addCombo: async (_id, payload) => {
    const productOrder = await LeadProductOrderModel.findOne({ _id }).populate('comboId').exec() as any;
    if (productOrder) {
      await LeadProductOrderModel.findOneAndUpdate({ _id }, { $set: { comboId: payload.comboId, comboName: payload.comboName } }, { new: true }).exec();
      const lead = await leadRepository.updateByCriteria({ 'productOrder._id': _id }, { 'productOrder.comboId': payload.comboId, 'productOrder.comboName': payload.comboName });
      await removeCombo(lead);
      await calculateCourseTuitionPercent(lead);
    }
  },
  removeCombo: async (_id) => {
    const productOrder = await LeadProductOrderModel.findOne({ _id }).populate('comboId').exec() as any;
    if (productOrder) {
      await LeadProductOrderModel.findOneAndUpdate({ _id }, { $set: { comboId: undefined, comboName: '' } }, { new: true }).exec();
      const leadBefore = await leadRepository.findByCriteria({'productOrder._id': _id});
      const leadAfter = await leadRepository.updateByCriteria({ 'productOrder._id': _id }, { 'productOrder.comboId': undefined, 'productOrder.comboName': '' });
      await removeCombo(leadBefore[0]);
      await calculateCourseTuitionPercent(leadAfter);
    }
  },
};

const removeCombo = async (lead: any) => {
  if (lead && lead.productOrder && lead.productOrder.comboId) {
    const combo = await productComboRepository.findById(lead.productOrder.comboId);
    if (combo) {
      let courseCount = lead.productOrder.courses ? lead.productOrder.courses.length : 0;
      if (combo.field === 'courseCount' && combo.condition === 'eq') {
        courseCount = combo.conditionValue;
      }
      else if (combo.field !== 'courseCount' || (combo.field === 'courseCount' && combo.condition !== 'eq')) {
        courseCount = lead.productOrder.courses.length;
      }

      const payment = lead.productOrder.courses[0] && lead.productOrder.courses[0].tuition || 0;
      await leadProductOrderRepository.updateCourses(lead.productOrder._id, lead.productOrder.courses.slice(0, courseCount).map((course: any) => {
        const discountCourse = course.discountValue ?
            (course.discountType === 'PERCENT' ?
                (Number(course.tuitionBeforeDiscount || 0) * Number(course.discountValue) / 100) :
                Number(course.discountValue))
            : 0;
        const tuitionAfterDiscountCourse = Number(course.tuitionBeforeDiscount || 0) - discountCourse;
        return {
          index: course.index,
          tuition: Math.floor(payment / courseCount),
          tuitionPercent: Math.floor((payment * 100 / courseCount) / tuitionAfterDiscountCourse),
          tuitionAfterDiscount: tuitionAfterDiscountCourse,
          inCombo: false,
        };
      }));
    }
  }
};

export const calculateCourseTuitionPercent = async (lead: any, _noCallback?: boolean) => {
  const { productOrder, tuition } = lead;
  if (!productOrder || !tuition) return;
  const { courses } = productOrder;
  if (!courses || !courses.length) return;
  const { totalAfterDiscount, remaining } = tuition;

  if (productOrder.comboId) {
    const combo = await productComboRepository.findById(`${productOrder.comboId}`);
    let courseCount = courses.length;
    if (combo.field === 'courseCount' && combo.condition === 'eq') {
      courseCount = combo.conditionValue;
    }
    if (combo.field !== 'courseCount' || (combo.field === 'courseCount' && combo.condition !== 'eq')) {
      const payment = totalAfterDiscount - remaining;
      const tuitionAD = calculateTuitionAD(combo, courses);
      courses.forEach((course: any) => {
        course.tuition = payment;
        course.inCombo = true;
        course.tuitionAfterDiscount = tuitionAD;
        course.tuitionPercent = tuitionAD ? Math.floor(payment * 100 / tuitionAD) : 0;
      });
    } else {
      courseCount = Number(courseCount);
      const payment = courses.slice(0, courseCount).reduce((sum: number, val: any) => {
        return sum + Number(val.tuition || 0);
      }, 0);
      const tuitionAD = calculateTuitionAD(combo, courses.slice(0, courseCount));
      // Check payment of all courses not in combo
      courses.slice(0, courseCount).forEach((course: any) => {
        course.tuition = payment;
        course.inCombo = true;
        course.tuitionAfterDiscount = tuitionAD;
        course.tuitionPercent = tuitionAD ? Math.floor(payment * 100 / tuitionAD) : 0;
      });

      courses.slice(courseCount, courses.length).forEach((course: any) => {
        course.inCombo = false;
      });
    }

    await leadProductOrderRepository.updateCourses(`${productOrder._id}`, courses.map((course: any) => {
      return {
        index: course.index,
        tuitionPercent: course.tuitionPercent,
        tuition: course.tuition,
        inCombo: course.inCombo,
        tuitionAfterDiscount: course.tuitionAfterDiscount,
      };
    }), true);
  } else {
    await leadProductOrderRepository.updateCourses(`${productOrder._id}`, courses.map((course: any) => {
      const discountCourse = course.discountValue ?
          (course.discountType === 'PERCENT' ?
              (Number(course.tuitionBeforeDiscount || 0) * Number(course.discountValue) / 100) :
              Number(course.discountValue))
          : 0;
      const tuitionAfterDiscountCourse = Number(course.tuitionBeforeDiscount || 0) - discountCourse;
      return {
        index: course.index,
        tuition: course.tuition,
        tuitionPercent: Math.floor((course.tuition * 100) / tuitionAfterDiscountCourse),
        tuitionAfterDiscount: tuitionAfterDiscountCourse,
        inCombo: false,
      };
    }), true);
  }
};
