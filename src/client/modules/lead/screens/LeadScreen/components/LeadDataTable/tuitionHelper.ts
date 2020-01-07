export const checkComboConditionForCourse = (courseIndex: number, combo: any, courses: any) => {
  if (!combo) {
    return 'NONE';
  } else {
    if (combo.field === 'courseCount') {
      if (combo.condition === 'gte') {
        if (courses.length >= combo.conditionValue) {
          if (combo.discountType === 'PERCENT') {
            return 'PERCENT';
          } else if (combo.discountType === 'AMOUNT') {
            return 'AMOUNT';
          } else if (combo.discountType === 'FIXED') {
            return 'FIXED';
          } else {
            return 'NONE';
          }
        } else {
          return 'NONE';
        }
      } else if (combo.condition === 'gt') {
        if (courses.length > combo.conditionValue) {
          if (combo.discountType === 'PERCENT') {
            return 'PERCENT';
          } else if (combo.discountType === 'AMOUNT') {
            return 'AMOUNT';
          } else if (combo.discountType === 'FIXED') {
            return 'FIXED';
          } else {
            return 'NONE';
          }
        } else {
          return 'NONE';
        }
      } else if (combo.condition === 'eq') {
        if (courses.length >= combo.conditionValue) {
          if (courseIndex < combo.conditionValue) {
            if (combo.discountType === 'PERCENT') {
              return 'PERCENT';
            } else if (combo.discountType === 'AMOUNT') {
              return 'AMOUNT';
            } else if (combo.discountType === 'FIXED') {
              return 'FIXED';
            } else {
              return 'NONE';
            }
          } else {
            return 'NONE';
          }
        } else {
          return 'NONE';
        }
      } else {
        return 'NONE';
      }
    } else if (combo.field === 'tuitionBD') {
      if (calculateTuitionBD(courses) >= combo.conditionValue) {
        if (combo.discountType === 'PERCENT') {
          return 'PERCENT';
        } else if (combo.discountType === 'AMOUNT') {
          return 'AMOUNT';
        } else if (combo.discountType === 'FIXED') {
          return 'FIXED';
        } else {
          return 'NONE';
        }
      } else {
        return 'NONE';
      }
    } else {
      // If there's any other type of combo, handle it here
      return 'NONE';
    }
  }
};

export const calculateTuitionBD = (courses: any) => {
  return courses.reduce((sum: number, val: any) => {
    return sum + Number(val.tuitionBeforeDiscount);
  }, 0);
};

export const checkComboCondition = (combo: any, courses: any) => {
  if (!combo) {
    return false;
  } else {
    const realCourse = courses.filter((val: any) => val.shortName !== 'UNK');
    if (combo.field === 'courseCount') {
      if (combo.condition !== 'gt') {
        if (courses.length >= combo.conditionValue && realCourse.length) {
          return true;
        } else {
          return false;
        }
      } else {
        if (courses.length > combo.conditionValue && realCourse.length) {
          return true;
        } else {
          return false;
        }
      }
    } else if (combo.field === 'tuitionBD') {
      if (calculateTuitionBD(courses) >= combo.conditionValue) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
};

export const calculateTuitionAD = (combo: any, courses: any) => {
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
      const tuitionFees = courses.reduce((sum: number, val: any, _index: number) => {
        const tuition = val.tuitionBeforeDiscount || 0;
        const discount = val.discountValue ?
          (val.discountType === 'PERCENT' ?
            (Number(tuition) * Number(val.discountValue) / 100) :
            Number(val.discountValue))
          : 0;
        const comboDiscount = checkComboConditionForCourse(_index, combo, courses) === 'PERCENT' ? (Number(tuition) * Number(combo ? combo.discountValue : 0) / 100) : 0;
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
