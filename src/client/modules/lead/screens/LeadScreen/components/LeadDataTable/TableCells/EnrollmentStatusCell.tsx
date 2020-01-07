import React from 'react';
import _ from 'lodash';

export const EnrollmentStatusCell = (props: any) => {
  const {
    record,
  } = props;
  const enrolmentStatus = _.get(record, 'enrollment.status') || 'Not Enrolled';
  return (
    <span>{enrolmentStatus}</span>
  );
};
