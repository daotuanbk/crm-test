import { checkComboCondition } from './checkComboCondition';
import { checkComboConditionForCourse } from './checkComboConditionForCourse';

export const calculateTuitionAD = (courses: any, combo: any) => {
  if (courses && courses.length) {
    if (combo && combo.discountType === 'FIXED' && checkComboCondition(combo, courses)) {
      const totalAdditionalDiscount = courses.reduce((sum: number, val: any, _index: number) => {
        const tuition = val.tuitionBeforeDiscount || 0;
        const discount = val.discountValue ?
          (val.discountType === 'PERCENT' ?
            (Number(tuition) * Number(val.discountValue) / 100) :
            Number(val.discountValue))
          : 0;
        return sum + discount;
      }, 0);
      return Number(combo.discountValue) - Number(totalAdditionalDiscount) > 0 ? Number(combo.discountValue) - Number(totalAdditionalDiscount) : 0;
    } else {
      const totalBD = courses.reduce((sum: number, val: any) => {
        return sum + Number(val.tuitionBeforeDiscount || 0);
      });
      const tuitionFees = courses.reduce((sum: number, val: any, index: number) => {
        const tuition = val.tuitionBeforeDiscount || 0;
        const discount = val.discountValue ?
          (val.discountType === 'PERCENT' ?
            (Number(tuition) * Number(val.discountValue) / 100) :
            Number(val.discountValue))
          : 0;
        const comboDiscount = checkComboConditionForCourse(combo, courses, index, totalBD) === 'PERCENT' ? (Number(tuition) * Number(combo ? combo.discountValue : 0) / 100) : 0;
        return sum + ((Number(tuition) - Number(discount) - Number(comboDiscount)) > 0 ? Number(tuition) - Number(discount) - Number(comboDiscount) : 0);
      }, 0);
      if (combo && combo.discountType === 'AMOUNT' && checkComboCondition(combo, courses)) {
        return (Number(tuitionFees) - Number(combo.discountValue)) > 0 ? (Number(tuitionFees) - Number(combo.discountValue)) : 0;
      } else {
        return tuitionFees;
      }
    }
  } else {
    if (combo && combo.discountType === 'FIXED' && combo.field === 'courseCount' && combo.conditionValue < 0 && combo.condition === 'gt') return combo.discountValue;
    else return 0;
  }
};
