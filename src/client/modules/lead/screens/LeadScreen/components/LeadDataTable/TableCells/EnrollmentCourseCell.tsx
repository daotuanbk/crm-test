import React from 'react';
import _ from 'lodash';

export const EnrollmentCourseCell = (props: any) => {
  const {
    record,
  } = props;
  const courseTitle = _.get(record, 'enrollment.course.title');
  return (
    <span>{courseTitle}</span>
  );
};
