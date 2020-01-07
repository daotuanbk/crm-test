import mongoose from 'mongoose';
import { config } from '@app/config';
import {
  leadRepository, calculateTuitionAD,
  productComboRepository, classRepository, leadProductOrderRepository,
} from '@app/crm';

export const updatePaymentForCourses = async () => {
  const leads = await leadRepository.findAll();
  const promises = [] as any;
  for (const i in leads) {
    const lead = leads[i];
    const {productOrder, tuition} = lead;
    if (!productOrder || !tuition) continue;
    let {courses} = productOrder;
    if (!courses || !courses.length) continue;
    courses = await addStartTimeToCourses(courses) as any;
    const {totalAfterDiscount, remaining} = tuition;
    let courseCount: any = courses.length;
    const payment = totalAfterDiscount - remaining;
    if (productOrder.comboId) {
      const combo = await productComboRepository.findById(`${productOrder.comboId}`);
      if (combo) {
        if (combo.field !== 'courseCount' || (combo.field === 'courseCount' && combo.condition !== 'eq')) {
          const tuitionAD = calculateTuitionAD(combo, courses);
          courses.forEach((course: any) => {
            course.tuition = Math.min(payment, tuitionAD);
            course.tuitionAfterDiscount = tuitionAD;
            course.inCombo = true;

            course.tuitionPercent = tuitionAD ? Math.floor(payment * 100 / tuitionAD) : 0;
          });
        } else {
          courseCount = Number(combo.conditionValue);
          const tuitionAD = calculateTuitionAD(combo, courses.slice(0, courseCount));
          courses.slice(0, courseCount).forEach((course: any) => {
            course.tuition = Math.min(payment, tuitionAD);
            course.inCombo = true;
            course.tuitionAfterDiscount = tuitionAD;
            course.tuitionPercent = tuitionAD ? Math.floor(payment * 100 / tuitionAD) : 0;
          });
          if (courses.slice(courseCount, courses.length).length) {
            let remainingPayment = payment - tuitionAD;
            courses.slice(courseCount, courses.length).forEach((course: any) => {
              const discountCourse = course.discountValue ?
                  (course.discountType === 'PERCENT' ?
                      (Number(course.tuitionBeforeDiscount || 0) * Number(course.discountValue) / 100) :
                      Number(course.discountValue))
                  : 0;
              const tuitionAfterDiscountCourse = Number(course.tuitionBeforeDiscount || 0) - discountCourse;
              if (remainingPayment < 0) {
                course.tuition = 0;
                course.tuitionPercent = 0;
              }
              else if (remainingPayment <= tuitionAfterDiscountCourse) {
                course.tuition = remainingPayment;
                course.tuitionPercent = tuitionAfterDiscountCourse ? Math.floor((remainingPayment * 100) / tuitionAfterDiscountCourse) : 0;
              }
              else {
                course.tuition = tuitionAfterDiscountCourse;
                course.tuitionPercent = 100;
              }
              course.tuitionAfterDiscount = tuitionAfterDiscountCourse;
              course.inCombo = false;
              remainingPayment -= tuitionAfterDiscountCourse;
            });
          }
        }
      }
    } else {
      let remainingPayment = payment;
      courses.forEach((course: any) => {
        const discountCourse = course.discountValue ?
            (course.discountType === 'PERCENT' ?
                (Number(course.tuitionBeforeDiscount || 0) * Number(course.discountValue) / 100) :
                Number(course.discountValue))
            : 0;
        const tuitionAfterDiscountCourse = Number(course.tuitionBeforeDiscount || 0) - discountCourse;
        if (remainingPayment < 0) {
          course.tuition = 0;
          course.tuitionPercent = 0;
        }
        else if (remainingPayment <= tuitionAfterDiscountCourse) {
          course.tuition = remainingPayment;
          course.tuitionPercent = tuitionAfterDiscountCourse ? Math.floor((remainingPayment * 100) / tuitionAfterDiscountCourse) : 0;
        }
        else {
          course.tuition = tuitionAfterDiscountCourse;
          course.tuitionPercent = 100;
        }
        course.tuitionAfterDiscount = tuitionAfterDiscountCourse;
        course.inCombo = false;
        remainingPayment -= tuitionAfterDiscountCourse;
      });
    }
    promises.push(leadProductOrderRepository.updateCourses(`${productOrder._id}`, courses.map((course: any) => {
      return {
        index: course.index,
        tuitionPercent: course.tuitionPercent,
        inCombo: course.inCombo,
        tuitionAfterDiscount: course.tuitionAfterDiscount,
        tuition: course.tuition,
        startTime: course.startTime || undefined,
      };
    })));
  }
  await Promise.all(promises);
};

const addStartTimeToCourses = async (courses: any[]) => {
  const result = [];
  for (const course of courses) {
    if (course.classId) {
      const classData = await classRepository.findById(`${course.classId}`);
      if (classData && classData.startTime) {
        course.startTime = classData.startTime;
      }
    }
    result.push(course);
  }
  return result;
};

const processing = async () => {
  try {
    await mongoose.connect(config.database.connectionString, { useNewUrlParser: true });
    await updatePaymentForCourses();
    process.exit();
  } catch (error) {
    // tslint:disable-next-line:no-console
    console.log(error);
    process.exit();
  }
};

processing();
