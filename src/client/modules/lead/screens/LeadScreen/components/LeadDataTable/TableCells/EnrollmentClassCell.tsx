import React from 'react';
import _ from 'lodash';

export const EnrollmentClassCell = (props: any) => {
  const {
    record,
  } = props;
  const classTitle = _.get(record, 'enrollment.class.title');
  return (
    <span>{classTitle}</span>
  );
};
