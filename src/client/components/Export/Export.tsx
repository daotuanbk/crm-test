import React from 'react';
import { Button } from 'antd';
import './Export.less';

interface ExportProps {
  disabled?: boolean;
  export: () => any;
}

export const Export = (props: ExportProps) => {
  return (
    <Button {...props} className='export-btn' type='primary' icon='download' onClick={props.export}>Export</Button>
  );
};
