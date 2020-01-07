import React from 'react';
import { Icon } from 'antd';
import './EditCell.less';

interface State {}

interface Props {
  openLeadDetailDrawer: () => void;
}

export class EditCell extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div className='edit-cell' style={{ width: '100%', textAlign: 'center' }}>
        <a onClick={this.props.openLeadDetailDrawer}>
          <Icon type='edit' theme='filled' />
        </a>
      </div>
    );
  }
}
