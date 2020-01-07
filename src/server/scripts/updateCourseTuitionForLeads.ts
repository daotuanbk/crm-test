import mongoose from 'mongoose';
import { config } from '@app/config';
import {
  leadRepository, leadProductOrderRepository, productCourseRepository,
  calculateTuitionAD, productComboRepository, leadPaymentTransactionRepository,
} from '@app/crm';
import _ from 'lodash';
import { updatePaymentForCourses } from './updatePaymentForCourses';
import { logger } from '@app/core';

// update created leads from 1/6 -> now (25/6)
const updateCourseTuitionForLeads = async () => {
  const productCourses = await productCourseRepository.findAll();
  const leads = await leadRepository.findByCriteria({createdAt: {$gt: new Date(2019, 5, 1).getTime()}});
  const leadProductOrderPromises = [];
  const leadPromises = [];
  for (const i in leads) {
    const lead = leads[i];
    const {productOrder} = lead;
    if (!productOrder) continue;
    const {courses} = productOrder;
    if (!courses || !courses.length) continue;
    courses.forEach((course: any) => {
      const courseItem = productCourses.find((item: any) => `${item._id}` === `${course._id}`);
      if (!courseItem) return;
      course.tuitionBeforeDiscount = courseItem.tuitionBeforeDiscount || course.tuitionBeforeDiscount;
    });
    leadProductOrderPromises.push(leadProductOrderRepository.updateCourses(`${productOrder._id}`, courses.map((course: any) => {
      return {
        index: course.index,
        tuitionBeforeDiscount: course.tuitionBeforeDiscount,
      };
    })));
    const combo = productOrder.comboId ? await productComboRepository.findById(productOrder.comboId) : null;
    const leadPayments = await leadPaymentTransactionRepository.find({leadId: `${lead._id}`} as any);
    const payments = leadPayments.reduce((sum: number, val: any) => {
      return sum + (Number(val.amount) || 0);
    }, 0);
    const tuitionAD = calculateTuitionAD(combo, courses);
    const tuition = {
      totalAfterDiscount: tuitionAD,
      remaining: tuitionAD - payments,
    };
    leadPromises.push(leadRepository.updateByCriteria({_id: lead._id}, {'tuition': tuition}));
  }
  await Promise.all(leadProductOrderPromises);
  await Promise.all(leadPromises);
  await updatePaymentForCourses();
};

const processing = async () => {
  try {
    await mongoose.connect(config.database.connectionString, { useNewUrlParser: true });
    await updateCourseTuitionForLeads();
  } catch (error) {
    logger.error('Update course tuition for leads: ', error);
  }

  process.exit();

};

processing();
