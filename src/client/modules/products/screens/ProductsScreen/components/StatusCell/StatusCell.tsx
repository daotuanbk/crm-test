import React from 'react';
import { Product } from '@client/services/service-proxies';
import { Tag } from 'antd';

interface Props {
  record: Product;
}

export const StatusCell = (props: Props) => {
  const { record } = props;

  return (
    <span>
      {record.isActive ? (
        <Tag color='green'>Active</Tag>
      ) : (
        <Tag color='red'>Deactive</Tag>
      )}
    </span>
  );
};
