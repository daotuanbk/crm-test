import React from 'react';
import _ from 'lodash';

export const ProductCell = (props: any) => {
  const { record } = props;
  const courses = _.get(record, 'productOrder.courses', []);
  return (
    courses.map((course: any) => (
      <div>{_.get(course, 'name', '')}</div>
    ))
  );
};
