import React from 'react';
import _ from 'lodash';

export const SingleCandidateCell = (props: any) => {
  const {
    record,
  } = props;
  const productName = _.get(record, 'productItem.candidate.fullName');
  return (
    <span>{productName}</span>
  );
};
