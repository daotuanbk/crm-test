export const checkComboConditionForCourse = (combo: any, courses: any, courseIndex: number, tuitionBD: number) => {
  if (combo) {
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
      if (tuitionBD >= combo.conditionValue) {
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
  } else {
    return 'NONE';
  }
};
