import React from 'react';
import { Icon } from 'antd';
import './EditProductCell.less';

interface State {}

interface Props {
  openProductDetailDrawer: () => void;
}

export class EditProductCell extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div className='edit-cell' style={{ width: '100%', textAlign: 'center' }}>
        <a onClick={this.props.openProductDetailDrawer}>
          <Icon type='edit' theme='filled' />
        </a>
      </div>
    );
  }
}
