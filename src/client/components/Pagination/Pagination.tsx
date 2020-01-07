import React from 'react';
import { Button, Icon } from 'antd';
import './Pagination.less';

interface PaginationProps {
  loadPreviousPage: () => any;
  loadNextPage: () => any;
  before: any;
  after: any;
  showTotal?: boolean;
  total?: number;
}

export const Pagination = (props: PaginationProps) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
      {props.showTotal && (<div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: '18px', fontWeight: 500 }}>Total: <span style={{ color: 'red' }}>{props.total || 0}</span></span>
      </div>)}
      <div className='pagination' style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {props.before && (
          <Button className={props.after ? 'button-prev' : ''} onClick={props.loadPreviousPage}><Icon type='left' /> Prev</Button>
        )}
        {props.after && (
          <Button onClick={props.loadNextPage}>Next <Icon type='right' /></Button>
        )}
      </div>
    </div>
  );
};
