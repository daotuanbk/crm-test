import React from 'react';
import { SOURCES } from '@common/sources';
import { MultiSelect } from '@client/components';

interface Props {
  style: any;
}

export const SourceFilter = (props: Props) => {
  const { style, ...restProps } = props;
  return (
    <MultiSelect
      {...restProps}
      label='Source'
      displayField='label'
      placeholder='FbChat, Web'
      options={SOURCES}
      dropdownMatchSelectWidth={false}
      style={style}
    />
  );
};
