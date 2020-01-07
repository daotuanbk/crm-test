export const checkComboCondition = (combo: any, courses: any) => {
  const tuitionBD = courses.reduce((sum: number, val: any) => {
    return sum + Number(val.tuitionBeforeDiscount);
  }, 0);
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
      if (tuitionBD >= combo.conditionValue) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
};
