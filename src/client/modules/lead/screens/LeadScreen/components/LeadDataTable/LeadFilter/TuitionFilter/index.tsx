import React from 'react';
import { SingleSelect } from '@client/components';

export const allTuitions = [
  {
    display: '0%',
    value: '0',
  },
  {
    display: '0-100%',
    value: '0:100',
  },
  {
    display: '100%',
    value: '100',
  },
];

interface Props {
  style: any;
}

export const TuitionFilter = (props: Props) => {
  const { style, ...restProps } = props;
  return (
    <SingleSelect
      {...restProps}
      label='Tuition'
      placeholder='0 - 100%'
      options={allTuitions}
      style={style}
    />
  );
};
