import React from 'react';
import { SingleSelect } from '@client/components';
import { LmsEnrollmentStatus } from '@client/services/service-proxies';
import _ from 'lodash';

interface Props {
  style: any;
  onChange: (value: any) => any;
}

const options = [
  {
    display: 'Not enrolled',
    value: LmsEnrollmentStatus.Not_Enrolled,
  },
  {
    display: 'Waiting',
    value: LmsEnrollmentStatus.Waiting,
  },
  {
    display: 'Approved',
    value: LmsEnrollmentStatus.Approved,
  },
  {
    display: 'Rejected',
    value: LmsEnrollmentStatus.Rejected,
  },
];

export function EnrollmentStatusFilter({ style, ...restProps }: Props) {
  return (
    <SingleSelect
      {...restProps}
      label='Enrollment status'
      placeholder='Waiting'
      options={options}
      style={style}
    />
  );
}
