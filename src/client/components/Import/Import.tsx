import React from 'react';
import { Button } from 'antd';
import './Import.less';

interface ImportProps {
  import: () => any;
}

export const Import = (props: ImportProps) => {
  return (
    <Button className='export-btn' type='primary' icon='upload' onClick={props.import}>Import</Button>
  );
};
