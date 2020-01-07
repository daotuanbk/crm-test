import React from 'react';
import { Avatar } from 'antd';
import './DefaultAvatar.less';

interface Props {
  name?: string;
  src?: string;
}

export const DefaultAvatar = (_props: Props) => {
  return (
    <Avatar shape='circle' src={_props.src ? _props.src : undefined}>
      {_props.name ? _props.name : ''}
    </Avatar>
  );
};
