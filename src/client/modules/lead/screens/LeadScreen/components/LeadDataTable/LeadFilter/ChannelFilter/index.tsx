import React from 'react';
import { utm } from '@common/utm';
import { MultiSelect } from '@client/components';
import _ from 'lodash';

const utmValues = _.flatMap(utm, 'value').map((utmItem: any) => ({
  display:  utmItem,
  value: utmItem,
}));

interface Props {
  style: any;
}

export const ChannelFilter = (props: Props) => {
  const { style, ...restProps } = props;
  return (
    <MultiSelect
      {...restProps}
      label='Channel'
      placeholder='FbChat, Website'
      options={utmValues}
      dropdownMatchSelectWidth={false}
      style={style}
    />
  );
};
